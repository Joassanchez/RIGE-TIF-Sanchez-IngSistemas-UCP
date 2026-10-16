"""ADR-094: web descriptiva solo en las dos dimensiones autorizadas."""
import json
import hashlib
from pathlib import Path
import tempfile
import unittest

import analizar
import analizar_ecologica as eco
import corregir_ecologica as corrector
import test_med9 as fixtures


class WebTests(unittest.TestCase):
    def test_hashes_historicos_de_otras_dimensiones(self):
        previos = {
            'principal/opencode.json': 'd65e379094678ed9f3af1e1a613aabed606ed1af5cce2837d8022e7838f31fe5',
            'charles/opencode.json': '8d4425657fa3b79412f0499053314285555dac7d27d02b9f8c4af4d491184773',
            'charles/agents/charles.md': '1811d7c33b300bfc0b0641d3e5c1f2b11882fbdf6e6988cd56951c92976f3db4',
            'principal-modificacion/opencode.json': '545d282fa0952a5a06c0164cd0d8cd0492b646e01b68859e1af21d96d08601be',
            'charles-modificacion/opencode.json': '3a252f1313978bb01973e305a3447bc5510263887c52669db216b551ec5bc17d',
            'charles-modificacion/agents/charles.md': '9b5296664c3e582e96173273efc9eed89baa296aafb77e183f8b20ef3d9ebfe5',
        }
        base = Path(__file__).resolve().parents[1] / 'vm/ejecutores'
        for archivo, digest in previos.items():
            self.assertEqual(hashlib.sha256((base / archivo).read_bytes()).hexdigest(), digest, archivo)

    def test_web_valida_contada_y_conservada_en_ambas_dimensiones(self):
        for dimension in ('ecologica', 'deteccion'):
            with self.subTest(dimension=dimension):
                rows = fixtures.AnalisisTests().rows(dimension)
                rows[0]['acceso_web'] = 1
                rows[1]['acceso_web'] = 1
                datos = eco.analizar_med9(rows, dimension)
                grupo = datos['grupos']['principal|openai/gpt-6.1-sol']
                self.assertTrue(grupo['valida'])
                tareas = grupo['tareas']['LB']
                self.assertEqual(tareas[rows[0]['caso']]['ejecuciones_con_acceso_web'], 2)
                self.assertTrue(all(t['ejecuciones_con_acceso_web'] == 0 for c, t in tareas.items() if c != rows[0]['caso']))
                self.assertEqual(datos['ejecuciones'][0]['acceso_web'], 1)
                self.assertEqual(datos['regla_acceso_web'], 'ADR-094')
                self.assertIn('Con acceso web', eco.markdown_med9(datos))

    def test_otras_dimensiones_siguen_invalidando_web(self):
        for dimension in ('atribucion', 'modificacion'):
            row = fixtures.fila('C-1a', dimension, resultado='correcta', acceso_web=0)
            self.assertTrue(analizar.completa(row, dimension))
            row['acceso_web'] = 1
            self.assertFalse(analizar.completa(row, dimension))

    def test_cierre_faltante_o_fallido_de_deteccion_invalida(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            rows = fixtures.AnalisisTests().rows('deteccion')
            registro = root / 'registro.jsonl'
            registro.write_text(''.join(json.dumps(r) + '\n' for r in rows), encoding='utf-8')
            for estado in (False, True):
                # True sin los archivos de control tampoco acredita el cierre.
                (root / 'tanda.json').write_text(json.dumps(dict(dimension='deteccion', regla_acceso_web='ADR-094', aislamiento_verificado=estado)))
                with self.assertRaises((ValueError, OSError)):
                    corrector.validar_tanda(root, root / 'no-se-lee.json')
                datos = eco.analizar_med9(analizar.cargar([registro]), 'deteccion')
                self.assertFalse(datos['grupos']['principal|openai/gpt-6.1-sol']['valida'])
