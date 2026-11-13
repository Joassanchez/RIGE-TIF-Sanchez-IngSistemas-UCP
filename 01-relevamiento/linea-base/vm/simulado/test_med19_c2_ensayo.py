"""MED-19-c2: guiones finales emitidos sin Docker ni agentes."""
import json
from pathlib import Path
import shlex
import sys
import tempfile
import unittest
from unittest.mock import patch

import ecologica as eco
from ensayo import Ensayo, EnsayoModificacion
from test_registro_ecologica import ROOT, compartidas


class EnsayoFinalTests(unittest.TestCase):
    def recorrer(self, provider):
        cuerpo, herramientas = {'messages': []}, []
        for _ in range(100):
            respuesta = provider.respuesta(cuerpo)
            if not respuesta.get('tool_calls'):
                provider.verificar_lecturas()
                self.assertTrue(respuesta['content'].startswith('ENSAYO:'))
                return herramientas
            tool = respuesta['tool_calls'][0]
            herramientas.append(dict(herramienta=tool['function']['name'],
                argumentos=json.loads(tool['function']['arguments']), estado='completed'))
            cuerpo['messages'].append(dict(role='tool', tool_call_id=tool['id'],
                content='<file>documentacion</file> {"sessionID":"ses_ensayo","type":"step_finish"}'))
        self.fail('El proveedor no terminó')

    def test_consulta_ecologica_posterior_a_ultima_edicion(self):
        sys.path.insert(0, str(ROOT / 'herramientas'))
        self.addCleanup(sys.path.pop, 0)
        from proceso import clasificar_proceso
        original = EnsayoModificacion.__init__
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'simulado').mkdir()
            (root / 'simulado/final-ecologica.json').write_bytes((ROOT / 'ecologica/final/planes-ecologica.json').read_bytes())
            casos = json.loads((root / 'simulado/final-ecologica.json').read_bytes())['casos']
            def inicializar(obj, plan, accion, registro):
                original(obj, plan, accion, registro, home=root)
            for brazo in ('indicado', 'disponible'):
                for caso in casos:
                    with self.subTest(brazo=brazo, caso=caso):
                        plan = eco.cargar_plan_ensayo(root, 'ecologica', caso, 'final', brazo)
                        # Un archivo existente fuerza edit; el proveedor también
                        # conserva write para los destinos todavía inexistentes.
                        rel = next(iter(plan['archivos']))
                        path = root / ('.config/opencode' if rel.startswith('G/') else 'proyecto') / rel[2:]
                        path.parent.mkdir(parents=True, exist_ok=True)
                        path.write_text('configuracion anterior', encoding='utf-8')
                        with patch.object(EnsayoModificacion, '__init__', inicializar):
                            provider = eco.EnsayoAnidado(plan, root / 'registro.jsonl')
                        hs = self.recorrer(provider)
                        self.assertTrue(any(h['herramienta'] in ('edit', 'write') for h in hs))
                        self.assertEqual(hs[-1]['argumentos'].get('command'), 'como-dev ' + shlex.quote(plan['consulta_rige']))
                        self.assertEqual(clasificar_proceso(dict(herramientas=hs, solicitudes=[]), {})['verificacion_final'], 'rige')

    def test_deteccion_consulta_hallazgos_antes_de_responder(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'simulado').mkdir()
            datos = (ROOT / 'ecologica/final/planes-deteccion.json').read_bytes()
            (root / 'simulado/final-deteccion.json').write_bytes(datos)
            (root / 'simulado/deteccion.json').write_bytes(datos)
            for brazo in ('LB', 'indicado', 'disponible'):
                for caso in json.loads(datos)['casos']:
                    with self.subTest(brazo=brazo, caso=caso):
                        plan = eco.cargar_plan_ensayo(root, 'deteccion', caso, 'final', brazo)
                        hs = self.recorrer(Ensayo(plan, 'ensayo', root / 'registro.jsonl'))
                        consultas = [h for h in hs if h['herramienta'] == 'bash']
                        self.assertEqual(len(consultas), 2 * int(brazo != 'LB'))
                        self.assertEqual(compartidas().observar(hs)['uso_rige'], int(brazo != 'LB'))
                        if consultas:
                            self.assertIs(hs[-1], consultas[1])
                            self.assertEqual(consultas[0]['argumentos']['command'], 'rige hallazgos --proyecto /home/participante/proyecto')
                            self.assertEqual(consultas[1]['argumentos']['command'], "como-dev 'rige hallazgos --proyecto /home/participante/proyecto'")


if __name__ == '__main__':
    unittest.main()
