"""ADR-094: lecturas obligatorias y controles sin procesos nativos ni Docker."""
from copy import deepcopy
import json
from pathlib import Path
import re
import tempfile
import unittest

import ecologica as eco
from ensayo import Ensayo, EnsayoModificacion
from evidencia import ASK, DENY
import test_registro_ecologica as registro

ROOT = Path(__file__).resolve().parents[2]


def reglas_json(permisos):
    return [dict(permission=k, pattern=p, action=v) for k, pats in permisos.items()
            for p, v in (pats.items() if isinstance(pats, dict) else [('*', pats)])]


def reglas_charles(texto):
    # Solo el frontmatter permission; sin dependencia de YAML en las pruebas.
    bloque = texto.split('permission:\n', 1)[1].split('\n---', 1)[0]
    reglas, permiso = [], None
    for line in bloque.splitlines():
        campo = re.fullmatch(r'  (\w+):\s*(allow|deny|ask)?\s*', line)
        if campo:
            permiso, accion = campo.groups()
            if accion:
                reglas.append(dict(permission=permiso, pattern='*', action=accion))
        elif line.startswith('    ') and ':' in line:
            patron, accion = line.strip().rsplit(':', 1)
            reglas.append(dict(permission=permiso, pattern=patron.strip('"'), action=accion.strip()))
    return reglas


class PermisosTests(unittest.TestCase):
    def test_cuatro_variantes_y_ambos_archivos_charles(self):
        with tempfile.TemporaryDirectory() as tmp:
            for dimension in ('ecologica', 'deteccion'):
                for ejecutor in ('principal', 'charles'):
                    root = ROOT / 'vm/ejecutores' / (ejecutor + '-' + dimension)
                    permiso = json.loads((root / 'opencode.json').read_text())['permission']
                    fuentes = [reglas_json({'read': 'allow', **permiso})]
                    if ejecutor == 'charles':
                        fuentes.append(reglas_charles((root / 'agents/charles.md').read_text(encoding='utf-8')))
                    for reglas in fuentes:
                        with self.subTest(dimension=dimension, ejecutor=ejecutor, fuente=len(reglas)):
                            eco.verificar_edit(dict(permission=reglas), Path(tmp) / 'verificacion.json', dimension, False)
                            self.assertIn(dict(permission='websearch', pattern='*', action='deny'), reglas)
                            for permiso, patron, accion in [('external_directory', '/home/evaluador/tarea/docs/index.html', 'deny'),
                                                           ('edit', '/home/evaluador/tarea/hoja-referencia.md', 'allow'),
                                                           ('webfetch', '*', 'deny')]:
                                alteradas = deepcopy(reglas) + [dict(permission=permiso, pattern=patron, action=accion)]
                                with self.assertRaises(ValueError):
                                    eco.verificar_edit(dict(permission=alteradas), Path(tmp) / 'verificacion.json', dimension, False)


class AislamientoTests(unittest.TestCase):
    correr = registro.RegistroTests.correr

    def test_P_2_hoja_denegada_no_es_requisito_del_brazo_base(self):
        for dimension in ('ecologica', 'deteccion'):
            with self.subTest(dimension=dimension):
                self.correr(dimension=dimension, hoja_denegada=True)
                self.assertEqual(json.loads((self.salida / 'tanda.json').read_text())['hoja_referencia'], 'ausente')

    def test_deteccion_controla_inicio_y_final(self):
        _, salida, _, _ = self.correr(dimension='deteccion')
        meta = json.loads((salida / 'tanda.json').read_text())
        self.assertEqual(meta['regla_acceso_web'], 'ADR-094')
        self.assertTrue(meta['aislamiento_verificado'])
        for momento in ('inicio', 'final'):
            datos = json.loads((salida / f'control-{momento}/verificacion-edit.json').read_text())
            self.assertTrue(datos['valido'])
            self.assertEqual(datos['webfetch'], 'allow')
        with self.assertRaisesRegex(ValueError, 'Aislamiento final'):
            self.correr(dimension='deteccion', fallo_final=True)
        self.assertFalse(json.loads((self.salida / 'tanda.json').read_text())['aislamiento_verificado'])

    def test_ensayo_sin_respuestas_de_lectura_detiene_y_no_escribe_fila(self):
        for dimension in ('ecologica', 'deteccion'):
            with self.subTest(dimension=dimension), self.assertRaisesRegex(ValueError, 'sin todas las lecturas'):
                self.correr(dimension=dimension, lectura_faltante=True)
            self.assertEqual((self.salida / 'registro.jsonl').read_text(), '')
            self.assertTrue((self.salida / 'DETENCION.txt').is_file())

    def test_contraste_adapta_solo_copia_de_ambos_ejecutores(self):
        for ejecutor in ('principal', 'charles'):
            with self.subTest(ejecutor=ejecutor):
                _, salida, _, _ = self.correr(caso='M-1', fuera=True, ejecutor=ejecutor)
                verificacion = json.loads((salida / 'control-inicio/verificacion-edit.json').read_text())
                self.assertTrue(verificacion['valido'])
                self.assertEqual(verificacion['denegadas']['hoja-referencia.md'], 'deny')
                if ejecutor == 'charles':
                    instalado = (salida.parents[1] / 'evaluador/.config/opencode/agents/charles.md').read_text(encoding='utf-8')
                    with tempfile.TemporaryDirectory() as tmp:
                        eco.verificar_edit(dict(permission=reglas_charles(instalado)), Path(tmp) / 'edit.json', 'ecologica', True)
                    original = (ROOT / 'vm/ejecutores/charles-ecologica/agents/charles.md').read_text(encoding='utf-8')
                    self.assertEqual(instalado.split('\n---\n', 1)[1], original.split('\n---\n', 1)[1])


class LecturasTests(unittest.TestCase):
    def test_lecturas_antes_de_editar_y_rechazo_o_ausencia_falla(self):
        with tempfile.TemporaryDirectory() as tmp:
            for dimension, caso, clase in [('ecologica', 'M-1', EnsayoModificacion), ('deteccion', 'D-A', Ensayo)]:
                plan = json.loads((ROOT / 'vm/simulado' / (dimension + '.json')).read_text(encoding='utf-8'))['casos'][caso]
                def proveedor():
                    args = [plan, 'ensayo', Path(tmp) / 'proveedor.jsonl']
                    if clase is EnsayoModificacion:
                        args.append(Path(tmp))
                    return clase(*args)
                p = proveedor()
                cuerpo = dict(messages=[])
                for path in plan['lecturas']:
                    respuesta = p.respuesta(cuerpo)
                    tool = respuesta['tool_calls'][0]
                    self.assertEqual(tool['function']['name'], 'read')
                    self.assertEqual(json.loads(tool['function']['arguments'])['filePath'], path)
                    cuerpo['messages'].extend([respuesta, dict(role='tool', tool_call_id=tool['id'], content='<content>Documentación sintética</content>')])
                respuesta = p.respuesta(cuerpo)
                p.verificar_lecturas()
                if dimension == 'ecologica':
                    self.assertIn(respuesta['tool_calls'][0]['function']['name'], ('read', 'edit'))
                for fallo in (ASK, DENY, '', 'Error: File not found'):
                    for indice in range(len(plan['lecturas'])):
                        p = proveedor()
                        copia = deepcopy(cuerpo)
                        copia['messages'][2 * indice + 1]['content'] = fallo
                        with self.assertRaisesRegex(ValueError, 'Lectura de documentación'):
                            p.respuesta(copia)
                with self.assertRaisesRegex(ValueError, 'sin todas las lecturas'):
                    proveedor().verificar_lecturas()
