"""MED-13-c2: selección pública de recursos; sin Docker ni modelos."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import ecologica as eco

ROOT = Path(__file__).resolve().parents[2]
ESCENARIOS = json.loads((ROOT / 'ecologica/escenarios.json').read_text(encoding='utf-8'))['dimensiones']['ecologica']


class RecursosTests(unittest.TestCase):
    def test_4_N_2_no_pide_recursos_ausentes_desde_sub(self):
        s = ESCENARIOS['N-2']
        self.assertEqual(eco.sondas_exploracion(s), [])
        sondas = eco.bateria(eco.agentes_escenario(s), s['tarea'], exploracion=True, escenario=s)
        for p, recurso in [('read', 'secretos.txt'), ('grep', 'SECRETO_FICTICIO'), ('bash', 'cat secretos.txt'), ('write', 'src/productos.js')]:
            self.assertNotIn(('build', p, recurso), sondas)
        self.assertIn(('build', 'webfetch', 'https://example.com'), sondas)

    def test_4_recursos_por_tarea_y_skills_independientes(self):
        for c, s in ESCENARIOS.items():
            if not c.startswith(('N-', 'S-')):
                continue
            extras = eco.sondas_exploracion(s)
            self.assertEqual(('bash', 'cat secretos.txt') in extras, c in ('N-6', 'N-7'))
            self.assertEqual(('read', 'privado') in extras, c == 'N-14')
            self.assertEqual(('skill', 'med11-interna') in extras, c == 'N-10')
        s = dict(archivos={'P/.opencode/skills/med11-interna/SKILL.md': 'contenido'}, directorio='sub', tarea='`med11-interna`')
        self.assertIn(('skill', 'med11-interna'), eco.sondas_exploracion(s))
        self.assertNotIn(('skill', 'med11-publica'), eco.sondas_exploracion(s))

    def test_4_recursos_presentes_y_planes_se_resuelven_desde_cwd(self):
        s = dict(archivos={'P/sub/secretos.txt': 'x', 'P/sub/src/productos.js': 'x',
                           'P/sub/privado/MED11_ENTRADA.txt': 'x'}, directorio='sub', tarea='`privado`')
        self.assertEqual(len(eco.sondas_exploracion(s)), 5)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'sub').mkdir()
            secreto = root / 'sub/secretos.txt'
            secreto.write_text('original')
            with patch.object(eco, 'PROYECTO', root):
                for permiso, sujeto in [('read', 'secretos.txt'), ('grep', 'SECRETO_FICTICIO'), ('bash', 'cat secretos.txt')]:
                    plan, archivo, original = eco.plan_sonda(('build', permiso, sujeto), 'sub')
                    self.assertEqual(archivo, secreto)
                    llamada = plan['acciones'][0]['llamadas'][0]['argumentos']
                    if permiso == 'grep':
                        self.assertEqual(llamada['path'], str(root / 'sub'))
                    if permiso == 'read':
                        self.assertEqual(llamada['filePath'], str(secreto))
                    archivo.write_bytes(original)
                    self.assertEqual(secreto.read_text(), 'original')

    def test_4_documentacion_enumera_cada_tarea_activa(self):
        texto = (ROOT / 'ecologica/sondas-exploracion.md').read_text(encoding='utf-8')
        for c in ESCENARIOS:
            self.assertIn('| ' + c + ' |', texto)


if __name__ == '__main__':
    unittest.main()
