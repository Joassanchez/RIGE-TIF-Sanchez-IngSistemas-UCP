"""M20-3 a M20-5: control anidado y consultas en ensayo (MED-20)."""
import json
from pathlib import Path
import shlex
import tempfile
from types import SimpleNamespace
import unittest

import ecologica as eco
from ensayo import Ensayo
from test_registro_ecologica import ROOT


class Med20Tests(unittest.TestCase):
    def test_M20_3_control_rige_anidado_distinto_o_fallido_lanza_valueerror(self):
        with tempfile.TemporaryDirectory() as tmp:
            carpeta = Path(tmp)
            for brazo in ('indicado', 'disponible'):
                a = SimpleNamespace(hoja='final', brazo=brazo)

                llamadas = []
                def ejecutar_ok(args, stdout, stderr):
                    llamadas.append((args, stdout, stderr))
                    Path(stdout).write_text(json.dumps({'esquema': 2, 'hallazgos': []}))
                    return 0
                h = SimpleNamespace(ejecutar=ejecutar_ok, como_evaluador=lambda args, env: args)
                eco.control_rige(h, a, carpeta, {}, '/home/participante/proyecto')
                self.assertEqual(len(llamadas), 2)
                self.assertIn('rige hallazgos --proyecto', llamadas[0][0][2])
                self.assertIn("como-dev 'rige hallazgos --proyecto /home/participante/proyecto'", llamadas[1][0][2])
                self.assertEqual(llamadas[0][1], carpeta / 'rige.json')
                self.assertEqual(llamadas[1][1], carpeta / 'rige-anidado.json')
                self.assertEqual(llamadas[1][2], carpeta / 'rige-anidado.err')
                self.assertEqual((carpeta / 'rige.json').read_bytes(), (carpeta / 'rige-anidado.json').read_bytes())

                def ejecutar_error_anidada(args, stdout, stderr):
                    if 'como-dev' in args[2]:
                        Path(stdout).write_text('error anidado')
                        return 1
                    Path(stdout).write_text(json.dumps({'esquema': 2}))
                    return 0
                h.ejecutar = ejecutar_error_anidada
                with self.assertRaises(ValueError):
                    eco.control_rige(h, a, carpeta, {}, '/home/participante/proyecto')

                def ejecutar_distinto(args, stdout, stderr):
                    if 'como-dev' in args[2]:
                        Path(stdout).write_text(json.dumps({'esquema': 2, 'otro': True}))
                    else:
                        Path(stdout).write_text(json.dumps({'esquema': 2}))
                    return 0
                h.ejecutar = ejecutar_distinto
                with self.assertRaisesRegex(ValueError, 'Control RIGE anidado difiere del directo'):
                    eco.control_rige(h, a, carpeta, {}, '/home/participante/proyecto')

    def test_M20_4_control_rige_brazos_sin_rige_ejecutan_no_command_v_rige(self):
        with tempfile.TemporaryDirectory() as tmp:
            carpeta = Path(tmp)
            for brazo in ('LB', 'sin_rige', 'probar'):
                a = SimpleNamespace(hoja='final', brazo=brazo)
                llamadas = []
                def ejecutar(args, stdout, stderr):
                    llamadas.append(args)
                    return 0
                h = SimpleNamespace(ejecutar=ejecutar, como_evaluador=lambda args, env: args)
                eco.control_rige(h, a, carpeta, {}, '/p')
                self.assertEqual(len(llamadas), 1)
                self.assertEqual(llamadas[0], ['bash', '-c', '! command -v rige'])

                h.ejecutar = lambda *args: 1
                with self.assertRaises(ValueError):
                    eco.control_rige(h, a, carpeta, {}, '/p')

    def test_M20_5_ensayo_emite_directa_y_anidada_en_orden_ecologica_y_deteccion(self):
        # 1. En ecológica
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'simulado').mkdir()
            (root / 'simulado/final-ecologica.json').write_bytes((ROOT / 'ecologica/final/planes-ecologica.json').read_bytes())
            for brazo in ('indicado', 'disponible'):
                plan = eco.cargar_plan_ensayo(root, 'ecologica', 'M-1', 'final', brazo)
                self.assertTrue(plan.get('consulta_rige'))
                provider = eco.EnsayoAnidado(plan, root / f'reg-{brazo}.jsonl')
                consultas = [a['command'] for n, a in provider.llamadas if n == 'bash' and 'rige' in a.get('command', '')]
                self.assertEqual(len(consultas), 2)
                self.assertEqual(consultas[0], plan['consulta_rige'])
                self.assertEqual(consultas[1], 'como-dev ' + shlex.quote(plan['consulta_rige']))

        # 2. En detección
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'simulado').mkdir()
            (root / 'simulado/final-deteccion.json').write_bytes((ROOT / 'ecologica/final/planes-deteccion.json').read_bytes())
            for brazo in ('indicado', 'disponible'):
                plan = eco.cargar_plan_ensayo(root, 'deteccion', 'D-A', 'final', brazo)
                self.assertTrue(plan.get('consulta_rige'))
                provider = Ensayo(plan, 'ensayo', root / f'reg-det-{brazo}.jsonl')
                cuerpo = {'messages': []}
                # Recorrer llamadas respondiendo a lecturas y consultas
                llamadas = []
                for _ in range(30):
                    r = provider.respuesta(cuerpo)
                    if not r.get('tool_calls'):
                        break
                    for t in r['tool_calls']:
                        llamadas.append((t['id'], t['function']['name'], json.loads(t['function']['arguments'])))
                        cuerpo['messages'].append(dict(role='tool', tool_call_id=t['id'], content='<file>\n<content>ok</content>\n</file>'))
                provider.verificar_lecturas()

                consultas_bash = [(tid, args['command']) for tid, name, args in llamadas if name == 'bash']
                self.assertEqual(len(consultas_bash), 2)
                self.assertEqual(consultas_bash[0], ('med19_consulta_rige', plan['consulta_rige']))
                self.assertEqual(consultas_bash[1], ('med20_consulta_rige_anidada', 'como-dev ' + shlex.quote(plan['consulta_rige'])))


if __name__ == '__main__':
    unittest.main()
