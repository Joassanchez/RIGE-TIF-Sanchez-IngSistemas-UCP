"""MED-12-c2: cierres exclusivamente en temporales; nunca cierra el banco real."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

from corregir_ecologica import hoja_admitida
from test_med9 import ADMISION_PATH, ROOT, copiar_fuentes_abiertas, generador


class CierreTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.origen = copiar_fuentes_abiertas(self.root / 'fuentes')
        self.destino = self.root / 'generados'
        self.admision = self.root / 'admision.json'
        shutil.copy2(ADMISION_PATH, self.admision)

    def correr(self, *args):
        return subprocess.run([sys.executable, '-B', str(ROOT / 'herramientas/generar-ecologica.py'),
            '--origen', str(self.origen), '--destino', str(self.destino), *args], capture_output=True, text=True)

    def cerrar(self):
        return self.correr('--admitidas', str(self.admision), '--cerrar', '19/10/2026')

    def leer(self, nombre):
        return json.loads((self.destino / nombre).read_text(encoding='utf-8'))

    def inventario(self):
        return {p.relative_to(self.root).as_posix(): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}

    def test_admision_hecha_y_retiros_completos_sin_cerrar(self):
        r = self.correr('--admitidas', str(self.admision))
        self.assertEqual(r.returncode, 0, r.stderr)
        a = json.loads(self.admision.read_text(encoding='utf-8'))
        digest = hashlib.sha256(self.admision.read_bytes()).hexdigest()
        for nombre in ('respuestas-ecologica.json', 'respuestas-deteccion.json', 'exploracion.json'):
            datos = self.leer(nombre)
            self.assertEqual(datos['admision'], 'hecha')
            self.assertEqual(datos['hash_admision'], digest)
            self.assertEqual(datos['fecha_admision'], generador.metadatos_admision(self.admision)['fecha_admision'])
            self.assertFalse(datos['hoja_cerrada'])
        retiros = self.leer('exploracion.json')['retiradas']
        self.assertEqual(set(retiros), {'N-8', 'N-20', 'N-22', 'N-25'})
        for tid in ('N-20', 'N-22', 'N-25'):
            self.assertEqual(retiros[tid], a['tareas'][tid]['motivo'])
        for nombre in ('tareas.md', 'deteccion.md'):
            texto = (self.origen / nombre).read_text(encoding='utf-8')
            self.assertNotIn('hoja cerrada el 14/10/2026', texto)
            self.assertIn('Estado: abierta pendiente de cierre', texto)

    def test_cierre_correcto_hashes_ambas_hojas_y_corrector(self):
        r = self.cerrar()
        self.assertEqual(r.returncode, 0, r.stderr)
        digest = hashlib.sha256(self.admision.read_bytes()).hexdigest()
        for nombre in ('tareas.md', 'deteccion.md'):
            texto = (self.origen / nombre).read_text(encoding='utf-8')
            self.assertIn(f'Estado: hoja cerrada el 19/10/2026 (ADR-098; admisión {digest[:12]})', texto)
            self.assertEqual(texto.count('Estado:'), 1)
        hashes = {n: hashlib.sha256((self.origen / n).read_bytes()).hexdigest() for n in generador.FUENTES}
        for nombre in ('respuestas-ecologica.json', 'respuestas-deteccion.json', 'exploracion.json'):
            datos = self.leer(nombre)
            self.assertIs(datos['hoja_cerrada'], True)
            self.assertEqual(datos['estado'], 'cerrada')
            self.assertEqual(datos['fecha_cierre'], '19/10/2026')
            self.assertEqual(datos['hashes_fuentes'], hashes)
        self.assertTrue(hoja_admitida(self.leer('respuestas-ecologica.json')))
        activos = self.leer('exploracion.json')['tareas']
        self.assertTrue({'M-1', 'V-8', 'N-15', 'S-3'} <= set(activos))
        self.assertTrue({'N-20', 'N-22', 'N-25'}.isdisjoint(activos))

    def test_cierre_exige_admision_sin_escribir(self):
        antes = self.inventario()
        r = self.correr('--cerrar', '19/10/2026')
        self.assertNotEqual(r.returncode, 0)
        self.assertIn('--cerrar exige --admitidas', r.stderr)
        self.assertEqual(self.inventario(), antes)

    def test_cierre_rechaza_tarea_sin_admision_sin_escribir(self):
        datos = json.loads(self.admision.read_text(encoding='utf-8'))
        datos['tareas'].pop('C-1')
        self.admision.write_text(json.dumps(datos), encoding='utf-8')
        antes = self.inventario()
        r = self.cerrar()
        self.assertNotEqual(r.returncode, 0)
        self.assertIn('C-1', r.stderr)
        self.assertEqual(self.inventario(), antes)

    def test_captura_incompleta_no_se_retira_ni_permite_cierre(self):
        datos = json.loads(self.admision.read_text(encoding='utf-8'))
        datos['tareas']['N-20']['captura_completa'] = False
        self.admision.write_text(json.dumps(datos), encoding='utf-8')
        r = self.correr('--admitidas', str(self.admision))
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertNotIn('N-20', self.leer('exploracion.json')['retiradas'])
        self.assertIn('N-20', self.leer('exploracion.json')['tareas'])
        antes = self.inventario()
        r = self.cerrar()
        self.assertNotEqual(r.returncode, 0)
        self.assertIn('N-20', r.stderr)
        self.assertEqual(self.inventario(), antes)

    def test_recierre_identico_es_idempotente_y_no_reabre(self):
        self.assertEqual(self.cerrar().returncode, 0)
        antes = self.inventario()
        r = self.cerrar()
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(self.inventario(), antes)
        r = self.correr('--admitidas', str(self.admision))
        self.assertNotEqual(r.returncode, 0)
        self.assertEqual(self.inventario(), antes)

    def test_recierre_rechaza_fuentes_y_generados_alterados(self):
        self.assertEqual(self.cerrar().returncode, 0)
        for path in [self.origen / 'tareas.md', self.origen / 'deteccion.md', self.origen / 'corpus.py',
                     self.destino / 'respuestas-ecologica.json', self.destino / 'respuestas-deteccion.json']:
            with self.subTest(archivo=path.name):
                original = path.read_bytes()
                path.write_bytes(original + b'\n')
                antes = self.inventario()
                r = self.cerrar()
                self.assertNotEqual(r.returncode, 0)
                self.assertIn('hashes distintos', r.stderr)
                self.assertEqual(self.inventario(), antes)
                path.write_bytes(original)

    def test_recierre_rechaza_otra_admision_y_otra_fecha(self):
        self.assertEqual(self.cerrar().returncode, 0)
        self.admision.write_bytes(self.admision.read_bytes() + b'\n')
        antes = self.inventario()
        r = self.cerrar()
        self.assertNotEqual(r.returncode, 0)
        self.assertIn('hash de admisión distintos', r.stderr)
        self.assertEqual(self.inventario(), antes)
        r = self.correr('--admitidas', str(self.admision), '--cerrar', '20/10/2026')
        self.assertNotEqual(r.returncode, 0)
        self.assertEqual(self.inventario(), antes)

    def test_fecha_invalida_no_escribe(self):
        antes = self.inventario()
        r = self.correr('--admitidas', str(self.admision), '--cerrar', '31/02/2026')
        self.assertNotEqual(r.returncode, 0)
        self.assertEqual(self.inventario(), antes)


if __name__ == '__main__':
    unittest.main()
