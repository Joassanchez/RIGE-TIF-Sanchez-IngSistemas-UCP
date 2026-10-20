"""MED-13-c1: planes y admisiones sintéticas en temporales, sin Docker/agentes."""
from contextlib import redirect_stdout
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from corregir_deteccion import corregir as corregir_deteccion
from test_med9 import ROOT, ESPEC, HOJA, CORPUS, captura, generador, oraculo_fixture
from verificar_base_ecologica import verificar, cargar_admisiones, raices_admision

PARTICIONES = (
    'V-1,N-1,N-5,N-11,N-15,V-8',
    'V-2,N-2,N-6,N-12,V-5,S-1',
    'V-3,N-3,N-7,N-13,V-6,S-2',
    'V-4,N-4,N-9,N-14,V-7,S-3',
)


def guardar(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


class PlanesTests(unittest.TestCase):
    def test_1_planes_derivados_deterministas_sin_cambiar_D_A_D_B(self):
        base = json.loads((ROOT / 'vm/simulado/deteccion.json').read_text(encoding='utf-8'))
        plan = generador.planes_deteccion(CORPUS, base)
        self.assertEqual(plan, generador.planes_deteccion(CORPUS, base))
        self.assertEqual(set(plan['casos']), set(CORPUS['casos']))
        for caso in ('D-A', 'D-B', 'D-C'):
            self.assertEqual(plan['casos'][caso], base['casos'][caso])
        for caso in set(CORPUS['casos']) - {'D-A', 'D-B', 'D-C'}:
            salida = plan['casos'][caso]['salida']
            r = corregir_deteccion(dict(respuesta_textual=json.dumps(salida)), CORPUS['casos'][caso]['items'])
            self.assertEqual(r['detectados'], [i['id'] for i in CORPUS['casos'][caso]['items'] if not i['efecto']])
            self.assertEqual(r['falsos_positivos'], [])
            self.assertEqual(r['otras'], [])

    def test_1_cli_solo_planes_no_regenera_hojas_cerradas(self):
        nombres = (*generador.FUENTES, *generador.GENERADOS, 'exploracion.json')
        antes = {n: (ROOT / 'ecologica' / n).read_bytes() for n in nombres}
        with tempfile.TemporaryDirectory() as tmp:
            destino = Path(tmp) / 'planes'
            cmd = [sys.executable, '-B', str(ROOT / 'herramientas/generar-ecologica.py'), '--solo-planes-deteccion', '--destino', str(destino)]
            for _ in range(2):
                r = subprocess.run(cmd, capture_output=True, text=True)
                self.assertEqual(r.returncode, 0, r.stderr)
                contenido = (destino / 'deteccion.json').read_bytes()
                if _:
                    self.assertEqual(contenido, previo)
                previo = contenido
            self.assertEqual({p.name for p in destino.iterdir()}, {'deteccion.json'})
            self.assertEqual(set(json.loads(contenido)['casos']), set(CORPUS['casos']))
        self.assertEqual(antes, {n: (ROOT / 'ecologica' / n).read_bytes() for n in nombres})


@unittest.skipUnless(shutil.which('bash'), 'Bash no disponible')
class ContenedorSinDockerTests(unittest.TestCase):
    def correr(self, dimension, raices=None):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        root = Path(tmp.name)
        evidencia = root / 'evidencia'
        evidencia.mkdir()
        def shell(path):
            return '/' + path.drive[0].lower() + path.as_posix()[2:] if os.name == 'nt' else str(path)
        stub = root / 'stub.sh'
        # Funciones del shell: nunca se busca ni se ejecuta el cliente Docker.
        stub.write_text('''docker() {
  printf '%s|' "$@" >> "$MED13_LOG"; printf '\\n' >> "$MED13_LOG"
  if [[ $* == *sha256sum* ]]; then printf '%064d  evidencia.tar\\n' 0; fi
}
python() {
  printf '%s|' "$@" >> "$MED13_PYLOG"; printf '\\n' >> "$MED13_PYLOG"
  if [[ $1 == *generar-ecologica.py ]]; then "$MED13_PYTHON" "$@"
  elif [[ $1 == *verificar_base_ecologica.py ]]; then printf '%064d\\n' 0; fi
}
''', encoding='utf-8', newline='\n')
        env = os.environ | dict(BASH_ENV=shell(stub), MED13_LOG=shell(root / 'docker.log'),
            MED13_PYLOG=shell(root / 'python.log'), OPENCODE_AUTH_JSON='',
            PYTHON='python', MED13_PYTHON=sys.executable.replace('\\', '/'))
        env.pop('RIGE_EVIDENCIA_ADMISION', None)
        if raices is not None:
            env['RIGE_EVIDENCIA_ADMISION'] = ';'.join(raices)
        r = subprocess.run([shutil.which('bash'), (ROOT / 'vm/contenedor.sh').as_posix(), 'medir',
                            '--ensayo', '--dimension', dimension, '--destino', shell(evidencia)],
                           env=env, cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        return root, evidencia

    def test_1_lanzador_compila_y_copia_solo_plan_de_ensayo(self):
        root, evidencia = self.correr('deteccion')
        plan = json.loads((evidencia / 'planes-ensayo/deteccion.json').read_text(encoding='utf-8'))
        self.assertEqual(set(plan['casos']), set(CORPUS['casos']))
        copias = [l for l in (root / 'docker.log').read_text().splitlines() if l.startswith('cp|')]
        self.assertTrue(any('/simulado/deteccion.json' in l and '/planes-ensayo/deteccion.json' in l for l in copias))
        self.assertFalse(any(s in l for s in ('respuestas-', 'espec.py', 'corpus.py') for l in copias))

    def test_2_lanzador_pasa_cada_raiz_al_verificador_solo_en_anfitrion(self):
        raices = ['C:/Users/Joa/evidencia-med12-admision-20261019/salida', 'C:/Users/Joa/otra raiz/p1'] if os.name == 'nt' else ['/evidencia/19', '/otra raiz/p1']
        root, _ = self.correr('ecologica', raices)
        linea = next(l for l in (root / 'python.log').read_text().splitlines() if 'verificar_base_ecologica.py' in l)
        args = linea.rstrip('|').split('|')
        recibidas = [args[i + 1] for i, v in enumerate(args) if v == '--evidencia-admision']
        self.assertEqual([Path(p) for p in recibidas], [Path(p) for p in raices])
        self.assertFalse(any(raiz in (root / 'docker.log').read_text() for raiz in raices))


class AdmisionesTests(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)

    def admision(self, nombre, casos):
        root = self.root / nombre
        for caso in casos:
            datos = captura(caso, 'base')
            oraculo = oraculo_fixture(ESPEC[caso], datos, datos).get('antes', {})
            guardar(root / caso / 'base/oraculo.json', oraculo)
            guardar(root / caso / 'base/archivos.json', datos.get('__archivos__', {}))
            guardar(root / caso / 'base/captura.oraculo-ejecucion/crudo.json', {'sintetico': True})
        guardar(root / 'captura.json', dict(casos=casos, hash_espec=HOJA['hashes_fuentes']['espec.py']))
        guardar(root / 'admision.json', dict(adr='ADR-098', hash_espec=HOJA['hashes_fuentes']['espec.py'],
            tareas={c: dict(resultado='admitida', captura_completa=True) for c in casos},
            filas=[dict(tarea=c, variante='correcta', resultado='correcta') for c in casos],
            hashes_evidencia={p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*.json')}))
        return root

    def tanda(self, casos, nombre='tanda'):
        root = self.root / nombre
        bases = {}
        for c in casos:
            if 'objetivo' in HOJA['casos'][c]:
                datos = captura(c, 'base')
                bases[c] = oraculo_fixture(ESPEC[c], datos, datos)['antes']
                guardar(root / 'base' / c / 'base.antes/archivos.json', datos.get('__archivos__', {}))
        guardar(root / 'base/indice.json', bases)
        guardar(root / 'tanda.json', dict(orden=[[c, 1] for c in casos]))
        return root

    def test_2_raiz_externa_completa_y_todos_los_hashes_incluso_no_seleccionados(self):
        fuente = self.admision('fuente externa', ['N-1', 'N-2'])
        tanda = self.tanda(['N-1'])
        r = verificar(tanda, ROOT / 'ecologica/respuestas-ecologica.json', admisiones=[fuente])
        self.assertTrue(r['valido'])
        self.assertEqual(r['admisiones'][0]['hashes_verificados'], 7)
        crudo = fuente / 'N-2/base/captura.oraculo-ejecucion/crudo.json'
        original = crudo.read_bytes()
        crudo.write_bytes(original + b'\n')
        with self.assertRaisesRegex(ValueError, 'alterada'):
            verificar(tanda, ROOT / 'ecologica/respuestas-ecologica.json', admisiones=[fuente])
        crudo.unlink()
        with self.assertRaises(OSError):
            verificar(tanda, ROOT / 'ecologica/respuestas-ecologica.json', admisiones=[fuente])

    def test_2_no_completa_una_raiz_incompleta_con_otra_ni_ignora_ausentes(self):
        fuente = self.admision('incompleta', ['N-1'])
        completa = self.root / 'completa'
        shutil.copytree(fuente, completa)
        (fuente / 'N-1/base/captura.oraculo-ejecucion/crudo.json').unlink()
        for fuentes in ([fuente, completa], [completa, self.root / 'ausente']):
            with self.assertRaises(OSError):
                cargar_admisiones(fuentes, HOJA)

    def test_2_cli_entorno_raices_con_espacios_y_detencion_ante_alteracion(self):
        fuentes = [self.admision('raiz uno', ['N-1']), self.admision('raiz dos', ['N-11'])]
        tanda = self.tanda(['N-1', 'N-11'])
        cmd = [sys.executable, '-B', str(ROOT / 'herramientas/verificar_base_ecologica.py'), str(tanda)]
        env = os.environ | {'RIGE_EVIDENCIA_ADMISION': ';'.join(map(str, fuentes))}
        r = subprocess.run(cmd, env=env, capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        validacion = json.loads((tanda / 'validacion-base.json').read_text(encoding='utf-8'))
        self.assertEqual(validacion['fuentes_admision']['N-11'], str(fuentes[1].resolve()))
        (fuentes[0] / 'N-1/base/captura.oraculo-ejecucion/crudo.json').write_text('alterado')
        r = subprocess.run(cmd, env=env, capture_output=True, text=True)
        self.assertNotEqual(r.returncode, 0)
        self.assertTrue((tanda / 'DETENCION.txt').exists())

    def test_2_parametros_repetibles_y_lista_sin_raices_vacias(self):
        with patch.dict(os.environ, {'RIGE_EVIDENCIA_ADMISION': 'a;b'}):
            self.assertEqual(raices_admision(None), [Path('a'), Path('b')])
            self.assertEqual(raices_admision(['c', 'd;e']), [Path('c'), Path('d'), Path('e')])
        for valor in ('', ';a', 'a;', 'a;;b'):
            with self.assertRaises(ValueError):
                raices_admision([valor])

    def test_3_particiones_mismo_hash_y_guardas_de_N_11(self):
        fuentes = [self.admision('p1', ['N-1', 'V-1']), self.admision('p2', ['N-11', 'S-1'])]
        tanda = self.tanda(['N-1', 'V-1', 'N-11', 'S-1'])
        r = verificar(tanda, ROOT / 'ecologica/respuestas-ecologica.json', admisiones=fuentes)
        self.assertEqual(len(r['admisiones']), 2)
        guardar(tanda / 'base/N-11/base.antes/archivos.json', {})
        with self.assertRaises((KeyError, ValueError)):
            verificar(tanda, ROOT / 'ecologica/respuestas-ecologica.json', admisiones=fuentes)

    def test_3_rechaza_hash_anterior_tarea_ausente_e_incompleta(self):
        fuente = self.admision('p1', ['N-1'])
        for c in ('N-11', 'V-1'):
            with self.assertRaisesRegex(ValueError, 'Tarea sin admisión ADR-098'):
                verificar(self.tanda([c], c), ROOT / 'ecologica/respuestas-ecologica.json', admisiones=[fuente])
        path = fuente / 'admision.json'
        datos = json.loads(path.read_text())
        guardar(path, dict(datos, hash_espec='especificacion-anterior'))
        with self.assertRaisesRegex(ValueError, 'otra especificación'):
            cargar_admisiones([fuente], HOJA)
        datos['tareas']['N-1']['captura_completa'] = False
        guardar(path, datos)
        with self.assertRaisesRegex(ValueError, 'Tarea sin admisión ADR-098'):
            verificar(self.tanda(['N-1']), ROOT / 'ecologica/respuestas-ecologica.json', admisiones=[fuente])

    def test_3_solapamiento_identico_admitido_contradicciones_rechazadas(self):
        fuente = self.admision('p1', ['N-1'])
        otra = self.root / 'p2'
        shutil.copytree(fuente, otra)
        indice, _ = cargar_admisiones([fuente, otra], HOJA)
        self.assertEqual(set(indice), {'N-1'})
        path = otra / 'admision.json'
        datos = json.loads(path.read_text())
        datos['tareas']['N-1']['resultado'] = 'no_admitida'
        guardar(path, datos)
        with self.assertRaisesRegex(ValueError, 'contradictorias'):
            cargar_admisiones([fuente, otra], HOJA)


class ReadmisionTests(unittest.TestCase):
    def test_3_lista_cerrada_de_24_pendientes_y_cuatro_particiones(self):
        admision = json.loads((ROOT / 'verificacion/20261019-admision/salida/admision.json').read_text(encoding='utf-8'))
        pendientes = [c for c in HOJA['casos'] if not c.startswith('M-') and c not in admision['tareas']]
        self.assertEqual(len(pendientes), 24)
        self.assertEqual(tuple(','.join(pendientes[n::4]) for n in range(4)), PARTICIONES)

    def test_3_capturar_evaluar_respetan_las_cuatro_particiones(self):
        captura_mod = generador.cargar(ROOT / 'verificacion/20261019-admision/capturar_eco.py', 'med13c1_captura')
        evaluador = generador.cargar(ROOT / 'verificacion/20261019-admision/evaluar_eco.py', 'med13c1_evaluar')
        def nativa(prefijo, momento, agentes, directorio):
            c, v = prefijo.parent.parent.name, prefijo.parent.name
            datos = captura(c, v)
            carpeta = Path(str(prefijo) + '.' + momento)
            base = captura('M-5', 'base')['build']
            for ag in agentes:
                guardar(carpeta / f'agente-{ag}.json', datos.get(ag, base))
            guardar(carpeta / 'archivos.json', datos.get('__archivos__', {}))
            guardar(carpeta / 'config.json', datos.get('__config__', {}))
            return carpeta
        def oraculo(prefijo, momento, sondas, directorio, h):
            c, v = prefijo.parent.parent.name, prefijo.parent.name
            datos = captura(c, v)
            base = captura('M-5', 'base')['build']
            from corregir_ecologica import clave, decidir, permiso_sonda
            return {clave(s): dict(decision=decidir(datos.get(s[0], base)['permission'], permiso_sonda(s), s[2])) for s in sondas}
        with tempfile.TemporaryDirectory() as tmp:
            for n, seleccion in enumerate(PARTICIONES, 1):
                root = Path(tmp) / f'p{n}'
                casos = seleccion.split(',')
                with patch.object(sys, 'argv', ['capturar', '--salida', str(root), '--casos', seleccion]), \
                     patch.object(captura_mod.os, 'chdir'), patch.dict(os.environ), \
                     patch.object(captura_mod.arnes, 'preparar'), patch.object(captura_mod.arnes, 'capturar', nativa), \
                     patch.object(captura_mod.arnes, 'oraculo', oraculo), redirect_stdout(io.StringIO()):
                    self.assertEqual(captura_mod.main(), 0)
                self.assertEqual(json.loads((root / 'captura.json').read_text())['casos'], casos)
                with patch.object(sys, 'argv', ['evaluar', str(root), '--casos', seleccion]):
                    evaluador.main()
                admision = json.loads((root / 'admision.json').read_text(encoding='utf-8'))
                self.assertEqual(set(admision['tareas']), set(casos))
                self.assertTrue(all(t['captura_completa'] for t in admision['tareas'].values()))
                self.assertTrue(admision['hashes_evidencia'])
                with self.assertRaisesRegex(ValueError, 'coincidir'):
                    evaluador.evaluar(ESPEC, root, casos[:-1])


if __name__ == '__main__':
    unittest.main()
