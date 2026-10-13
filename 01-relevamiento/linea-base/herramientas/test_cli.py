"""Circuito externo completo con registros sintéticos y archivos independientes."""
import csv
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class CliTests(unittest.TestCase):
    def correr(self, script, *args):
        result = subprocess.run([sys.executable, str(ROOT / 'herramientas' / script), *map(str, args)],
                                text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        return result

    def test_ensayo_externo_completo(self):
        fixture = ROOT / 'vm/simulado/ensayo.json'
        clave = json.loads(fixture.read_text(encoding='utf-8'))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            rows = []
            for c, rule in clave['casos'].items():
                for r in range(1, 4):
                    rows.append(dict(tanda='ensayo', ensayo=True, fase='medicion', condicion='LB', brazo='LB',
                                     ejecutor='principal', modelo='openai/gpt-6.1-sol', caso=c, k=3, repeticion=r,
                                     respuesta_textual='ENSAYO\n' + json.dumps(rule['salida']), censurado=False,
                                     tokens_entrada=100, tokens_cache=20, tokens_salida=30, duracion_s=1,
                                     solicitudes=[dict(tokens_entrada=100, tokens_cache=20, tokens_salida=30)]))
            raw = root / 'registro.jsonl'
            raw.write_text(''.join(json.dumps(r) + '\n' for r in rows), encoding='utf-8')
            antes = raw.read_bytes()
            corrected = root / 'corregido.jsonl'
            self.correr('corregir.py', raw, '--respuestas', fixture, '--salida', corrected)
            self.correr('analizar.py', corrected, '--destino', root / 'analisis')
            datos = json.loads((root / 'analisis/analisis.json').read_text(encoding='utf-8'))
            self.assertEqual(datos['grupos']['principal|openai/gpt-6.1-sol']['rama'], 'E')
            self.assertTrue(datos['grupos']['principal|openai/gpt-6.1-sol']['valida'])
            self.assertIsNone(datos['cumplimiento_proyecto'])
            self.assertTrue(datos['ensayo'])
            self.assertAlmostEqual(datos['equivalente_usd_total'], 72 * .000502)
            self.assertEqual(raw.read_bytes(), antes)
            with (root / 'revision_manual.csv').open(encoding='utf-8', newline='') as f:
                self.assertEqual(list(csv.DictReader(f)), [])

    def test_adjudicacion_csv_segunda_pasada_cli(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            raw = root / 'registro.jsonl'
            raw.write_text(json.dumps(dict(tanda='t', ejecutor='principal', modelo='openai/gpt-6.1-sol', brazo='LB',
                caso='C-1a', repeticion=1, respuesta_textual='{"respuesta":"openai/gpt-5-mini","fuente":"origen a verificar"}')) + '\n')
            self.correr('corregir.py', raw, '--salida', root / 'primera.jsonl')
            with (root / 'revision_manual.csv').open(encoding='utf-8', newline='') as f:
                revisiones = list(csv.DictReader(f))
            adjudicaciones = root / 'adjudicaciones.csv'
            with adjudicaciones.open('w', encoding='utf-8', newline='') as f:
                w = csv.DictWriter(f, fieldnames=['id', 'hash_respuesta', 'resultado', 'motivo'])
                w.writeheader()
                w.writerow(dict(id=revisiones[0]['id'], hash_respuesta=revisiones[0]['hash_respuesta'], resultado='correcta', motivo='El autor verificó la fuente.'))
            self.correr('corregir.py', raw, '--salida', root / 'segunda.jsonl', '--adjudicaciones', adjudicaciones)
            row = json.loads((root / 'segunda.jsonl').read_text())
            self.assertTrue(row['adjudicado_manual'])
            self.assertEqual(row['resultado'], 'correcta')
            self.assertTrue(adjudicaciones.exists())


if __name__ == '__main__':
    unittest.main()
