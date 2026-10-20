"""MED-13-c3: banco cerrado y herramientas simuladas, sin modelos ni Docker."""
from copy import deepcopy
import json
from pathlib import Path
import shlex
import tempfile
import unittest
from unittest.mock import patch

import ecologica as eco
from ensayo import EnsayoModificacion

ROOT = Path(__file__).resolve().parents[2]
NUEVAS = ('C-1', 'C-2', 'C-3', 'C-4', 'C-5', 'C-6', 'N-21', 'N-23', 'N-24', 'V-9', 'V-10')


def leer(rel):
    return json.loads((ROOT / rel).read_text(encoding='utf-8'))


class PlanesCerradosTests(unittest.TestCase):
    def test_1_todas_las_tareas_ecologicas_cerradas_tienen_plan(self):
        banco = leer('ecologica/escenarios.json')['dimensiones']['ecologica']
        planes = leer('vm/simulado/ecologica.json')
        self.assertIs(planes['ensayo'], True)
        self.assertEqual(set(planes['casos']), set(banco))

    def test_1_todos_los_escenarios_deteccion_cerrados_tienen_plan(self):
        banco = leer('ecologica/escenarios.json')['dimensiones']['deteccion']
        planes = leer('vm/simulado/deteccion.json')
        self.assertIs(planes['ensayo'], True)
        self.assertEqual(set(planes['casos']), set(banco))

    def test_1_las_once_variantes_son_las_correctas_cerradas(self):
        hoja = leer('ecologica/respuestas-ecologica.json')['casos']
        planes = leer('vm/simulado/ecologica.json')['casos']
        doc = (ROOT / 'vm/simulado/planes/MED-13-c3.md').read_text(encoding='utf-8')
        for caso in NUEVAS:
            with self.subTest(caso=caso):
                self.assertEqual(planes[caso]['archivos'], hoja[caso]['variantes']['correcta'])
                self.assertIs(planes[caso]['salida']['hecho'], True)
                self.assertIn('| ' + caso + ' |', doc)

    def test_1_C_1_y_M_1_no_dependen_del_override_para_verificar_despues_de_editar(self):
        planes = leer('vm/simulado/ecologica.json')['casos']
        override = leer('vm/simulado/planes/MED-13-anidada.json')['casos']
        with tempfile.TemporaryDirectory() as tmp:
            for caso in ('C-1', 'M-1'):
                self.assertEqual(planes[caso], override[caso])
                with patch('ensayo.Path.exists', return_value=True), patch('ensayo.Path.read_text', return_value='anterior'):
                    proveedor = eco.EnsayoAnidado(planes[caso], Path(tmp) / (caso + '.jsonl'))
                self.assertEqual(proveedor.llamadas[-1], ('bash', {'command': planes[caso]['verificacion_anidada']}))
                self.assertIn('como-dev', proveedor.llamadas[-1][1]['command'])
                self.assertIn('opencode run', proveedor.llamadas[-1][1]['command'])
                self.assertTrue(any(n == 'edit' for n, _ in proveedor.llamadas[:-1]))

    def test_1_archivo_nuevo_se_crea_vacio_por_herramienta_y_luego_recibe_write(self):
        planes = leer('vm/simulado/ecologica.json')['casos']
        for caso, rel in [('N-21', 'P/opencode.json'), ('N-23', 'P/opencode.json'), ('V-9', 'P/AGENTS.md')]:
            with self.subTest(caso=caso), tempfile.TemporaryDirectory(prefix='med13 c3 ') as tmp:
                home = Path(tmp)
                proyecto = home / 'proyecto'
                proyecto.mkdir()
                archivo = proyecto / rel[2:]
                plan = planes[caso]
                antes = deepcopy(plan)
                proveedor = EnsayoModificacion(plan, 'ensayo', home / 'registro.jsonl', home)
                self.assertFalse(archivo.exists(), 'El proveedor no crea ni escribe el archivo')
                self.assertEqual(plan, antes)
                cuerpo = dict(messages=[])
                mensaje = proveedor.respuesta(cuerpo)
                tool = mensaje['tool_calls'][0]
                self.assertEqual(tool['function']['name'], 'bash')
                comando = json.loads(tool['function']['arguments'])['command']
                como = shlex.split(comando)
                self.assertEqual(como[0], 'como-dev')
                self.assertEqual(shlex.split(como[1]), ['touch', '--', str(archivo), '&&', 'chmod', 'g+rw', '--', str(archivo)])
                self.assertNotIn(plan['archivos'][rel], comando)
                # Sustituto de la herramienta bash, sin iniciar procesos/usuarios.
                archivo.touch()
                cuerpo['messages'].extend([mensaje, dict(role='tool', tool_call_id=tool['id'], content='completado')])
                mensaje = proveedor.respuesta(cuerpo)
                tool = mensaje['tool_calls'][0]
                self.assertEqual(tool['function']['name'], 'write')
                args = json.loads(tool['function']['arguments'])
                self.assertEqual(args, dict(filePath=str(archivo), content=plan['archivos'][rel]))
                self.assertEqual(archivo.read_bytes(), b'', 'La respuesta no aplica la edición')
                # Sustituto de write: el contenido solo lo escribe la herramienta.
                archivo.write_text(args['content'], encoding='utf-8')
                cuerpo['messages'].extend([mensaje, dict(role='tool', tool_call_id=tool['id'], content='File written successfully.')])
                self.assertNotIn('tool_calls', proveedor.respuesta(cuerpo))
                self.assertEqual(archivo.read_text(encoding='utf-8'), plan['archivos'][rel])
                proveedor.verificar_lecturas()

    def test_1_archivo_existente_siempre_se_lee_y_edita_sin_creacion(self):
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            (home / 'proyecto').mkdir()
            archivo = home / 'proyecto/opencode.json'
            archivo.write_text('anterior', encoding='utf-8')
            plan = leer('vm/simulado/ecologica.json')['casos']['N-21']
            proveedor = EnsayoModificacion(plan, 'ensayo', home / 'registro.jsonl', home)
            self.assertEqual([n for n, _ in proveedor.llamadas], ['read', 'edit'])
            self.assertEqual(proveedor.llamadas[1][1]['oldString'], 'anterior')
            self.assertEqual(archivo.read_text(), 'anterior')

    def test_2_falta_proyecto_comun_detiene_incluso_con_recursos_declarados(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            modulo = root / 'med12/vm/simulado/ecologica.py'
            escenario = dict(archivos={'P/src/productos.js': 'x'})
            # La copia de ejecución de la imagen no reemplaza la copia importada.
            (root / 'opt/linea-base/casos/comun/proyecto').mkdir(parents=True)
            with patch.object(eco, '__file__', str(modulo)):
                with self.assertRaisesRegex(ValueError, 'Falta el proyecto común:.*Copiar vm/casos'):
                    eco.sondas_exploracion(escenario)
                proyecto = modulo.parents[1] / 'casos/comun/proyecto'
                (proyecto / 'src').mkdir(parents=True)
                (proyecto / 'src/productos.js').write_text('x')
                self.assertIn(('write', 'src/productos.js'), eco.sondas_exploracion({}))
                self.assertNotIn(('write', 'src/productos.js'), eco.sondas_exploracion(dict(directorio='sub')))

    def test_2_LEEME_incluye_la_copia_junto_al_modulo(self):
        doc = (ROOT / 'verificacion/20261019-admision/LEEME.md').read_text(encoding='utf-8')
        self.assertIn('`vm/casos/` → `/med12/vm/casos/`', doc)


if __name__ == '__main__':
    unittest.main()
