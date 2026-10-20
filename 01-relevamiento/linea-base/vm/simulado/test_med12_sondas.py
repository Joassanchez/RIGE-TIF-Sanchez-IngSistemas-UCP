"""Sondas MED-12 con proveedor y procesos sustituidos; sin OpenCode/Docker."""
from contextlib import contextmanager
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import ecologica as arnes
from evidencia import ASK, DENY, clasificar, jsonl
from proveedor import Proveedor


class Med12SondasTests(unittest.TestCase):
    def test_N20_inyecta_token_y_restaura_incluso_si_falla(self):
        @contextmanager
        def servidor(provider):
            yield 12345
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            secreto = root / 'secretos/x'
            secreto.parent.mkdir()
            secreto.write_bytes(b'original\n')
            for cmd in ('tail ~/secretos/x', "sed -n '1p' ~/secretos/x"):
                with patch.object(arnes, 'HOME', root):
                    plan, archivo, original = arnes.plan_sonda(('build', 'bash', cmd))
                self.assertEqual(archivo, secreto)
                token = plan['acciones'][0]['efecto']['token']
                self.assertIn(token, secreto.read_text())
                for salida, decision in [(token, 'allow'), (ASK, 'ask'), (DENY, 'deny'), ('completed', 'indeterminado')]:
                    log = root / 'proveedor.jsonl'
                    log.write_text('')
                    p = Proveedor(plan, 'sonda', log)
                    body = dict(messages=[dict(role='user', content='MED4A_ROOT')], tools=[dict(function=dict(name='bash'))])
                    r = p.respuesta(body)
                    body['messages'].extend([r, dict(role='tool', tool_call_id=r['tool_calls'][0]['id'], content=salida)])
                    p.respuesta(body)
                    self.assertEqual(clasificar(plan, 'sonda', jsonl(log), [], root, 0)['decision'], decision)
                secreto.write_bytes(original)
                with patch.object(arnes, 'HOME', root), patch.object(arnes, 'servidor', servidor), \
                     patch.object(arnes.subprocess, 'run'), patch.object(arnes, 'participante', side_effect=RuntimeError('falló')):
                    with self.assertRaises(RuntimeError):
                        arnes.oraculo(root / ('tail' if cmd.startswith('tail') else 'sed'), 'fallo', [('build', 'bash', cmd)], '', None)
                self.assertEqual(secreto.read_bytes(), b'original\n')

    def test_N22_todowrite_acredita_cadena_build_general_y_token(self):
        plan, archivo, _ = arnes.plan_sonda(('general', 'todowrite', 'lista'))
        self.assertIsNone(archivo)
        self.assertEqual(plan['agente'], 'build')
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / 'proveedor.jsonl'
            p = Proveedor(plan, 'sonda', log)
            padre = dict(messages=[dict(role='user', content='MED4A_ROOT')], tools=[dict(function=dict(name='task'))])
            task = p.respuesta(padre)
            hijo = dict(messages=[dict(role='user', content='MED4A_CHILD')], tools=[dict(function=dict(name='todowrite'))])
            todo = p.respuesta(hijo)
            token = plan['acciones'][0]['efecto']['token']
            hijo['messages'].extend([todo, dict(role='tool', tool_call_id=todo['tool_calls'][0]['id'], content=token)])
            p.respuesta(hijo)
            padre['messages'].extend([task, dict(role='tool', tool_call_id=task['tool_calls'][0]['id'], content='MED4A_FIN')])
            p.respuesta(padre)
            self.assertEqual(clasificar(plan, 'sonda', jsonl(log), [], tmp, 0)['decision'], 'allow')
            sin_padre = [r for r in jsonl(log) if r.get('etapa') != 'principal']
            self.assertEqual(clasificar(plan, 'sonda', sin_padre, [], tmp, 0)['decision'], 'indeterminado')

    def test_N10_solo_permutaciones_de_grants_disjuntos(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            permisos = [dict(permission='external_directory', pattern=str(arnes.PROYECTO) + '/.opencode/skill/' + n + '/*', action='allow') for n in ('uno', 'dos')]
            a, b = root / 'sin.json', root / 'con.json'
            arnes.guardar(a, dict(permission=permisos))
            arnes.guardar(b, dict(permission=list(reversed(permisos))))
            self.assertEqual(arnes.control_captura(a, b)['estado'], 'limpio')
            permisos[0]['action'] = 'deny'
            arnes.guardar(b, dict(permission=permisos))
            self.assertEqual(arnes.control_captura(a, b)['estado'], 'contaminado')
            for patron in ('*', '/.opencode/skill/*'):
                reglas = [dict(permission='external_directory', pattern=patron, action='deny'), permisos[1]]
                arnes.guardar(a, dict(permission=reglas))
                arnes.guardar(b, dict(permission=list(reversed(reglas))))
                self.assertEqual(arnes.control_captura(a, b)['estado'], 'contaminado')

    def test_V9_observa_solo_system_sin_modelo_real(self):
        @contextmanager
        def servidor(provider):
            provider.log('solicitud', cuerpo=dict(messages=[dict(role='system', content=system),
                dict(role='user', content='Respondé siempre en español')]))
            yield 12345
        with tempfile.TemporaryDirectory() as tmp:
            for system, esperado in [('Respondé siempre en español', True), ('Otra instrucción', False)]:
                carpeta = Path(tmp) / str(esperado)
                carpeta.mkdir()
                with patch.object(arnes, 'servidor', servidor), patch.object(arnes, 'participante', return_value=0):
                    arnes.capturar_sistema(carpeta, '')
                self.assertIs(json.loads((carpeta / 'sistema.json').read_text())['instruccion_espanol'], esperado)

    def test_P_2_preparacion_retira_hoja_y_no_copia_fuente(self):
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            hoja = root / 'tarea/hoja-referencia.md'
            hoja.parent.mkdir()
            hoja.write_text('antecedente')
            arnes.retirar_hoja(SimpleNamespace(HOME_E=root))
            self.assertFalse(hoja.exists())
            arnes.retirar_hoja(SimpleNamespace(HOME_E=root))


if __name__ == '__main__':
    unittest.main()
