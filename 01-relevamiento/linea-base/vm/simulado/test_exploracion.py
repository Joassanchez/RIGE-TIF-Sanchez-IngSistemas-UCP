"""Sondas MED-11 con resultados de herramientas artificiales, sin OpenCode/red."""
import json
from contextlib import contextmanager
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import ecologica as arnes
from evidencia import ASK, DENY, clasificar, jsonl
from proveedor import Proveedor
from test_registro_ecologica import RegistroTests


class SondasExploracionTests(unittest.TestCase):
    def test_write_directorio_y_skill_con_resultados_observables(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'src').mkdir()
            destino = root / 'src/productos.js'
            destino.write_bytes(b'original\n')
            (root / 'privado').mkdir()
            (root / 'privado/MED11_ENTRADA.txt').write_text('ficticio')
            casos = [('write', 'src/productos.js', 'write'), ('read', 'privado', 'read'),
                     ('skill', 'med11-interna', 'skill')]
            for permiso, sujeto, herramienta in casos:
                with patch.object(arnes, 'PROYECTO', root):
                    plan, archivo, original = arnes.plan_sonda(('build', permiso, sujeto))
                self.assertEqual(plan['acciones'][0]['llamadas'][0]['herramienta'], herramienta)
                for salida, esperado in [('efecto', 'allow'), (ASK, 'ask'), (DENY, 'deny'), ('sin evidencia', 'indeterminado')]:
                    destino.write_bytes(b'original\n')
                    log = root / 'sonda.jsonl'
                    log.write_text('')
                    provider = Proveedor(plan, 'sonda', log)
                    cuerpo = dict(messages=[dict(role='user', content='MED4A_ROOT')], tools=[dict(function=dict(name=herramienta))])
                    mensaje = provider.respuesta(cuerpo)
                    tool = mensaje['tool_calls'][0]
                    if salida == 'efecto':
                        if permiso == 'write':
                            destino.write_text(json.loads(tool['function']['arguments'])['content'], encoding='utf-8')
                            salida = 'Wrote file successfully.'
                        else:
                            salida = plan['acciones'][0]['efecto']['token']
                    cuerpo['messages'].extend([mensaje, dict(role='tool', tool_call_id=tool['id'], content=salida)])
                    provider.respuesta(cuerpo)
                    with self.subTest(permiso=permiso, esperado=esperado):
                        self.assertEqual(clasificar(plan, 'sonda', jsonl(log), [], root, 0)['decision'], esperado)
                if archivo:
                    archivo.write_bytes(original)
                self.assertEqual(destino.read_bytes(), b'original\n')

    def test_symlink_preparacion_y_guardas_sin_seguir_el_enlace(self):
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            proyecto = home / 'proyecto'
            with patch.object(arnes, 'HOME', home), patch.object(arnes, 'PROYECTO', proyecto):
                datos = {'P/.opencode/compartida.json': '{"permission":{"bash":"allow"}}',
                         'G/opencode.json': {'enlace': '../../proyecto/.opencode/compartida.json'}}
                try:
                    arnes.materializar_archivos(datos)
                except OSError as e:
                    if getattr(e, 'winerror', None) == 1314:
                        self.skipTest('Windows no concede creación de symlinks; verificar en contenedor.')
                    raise
                inicial = arnes.estado_archivos()
                arnes.materializar_archivos({'G/opencode.jsonc': '{"permission":{"bash":"ask"}}'})
                final = arnes.estado_archivos()
                for rel in datos:
                    self.assertEqual(inicial[rel], final[rel])
                arnes.materializar_archivos({'G/opencode.json': {'archivo_regular': '{}'}})
                self.assertEqual(arnes.estado_archivos()['G/opencode.json']['tipo'], 'archivo')
                self.assertEqual(arnes.estado_archivos()['P/.opencode/compartida.json'], inicial['P/.opencode/compartida.json'])
                with self.assertRaises(ValueError):
                    arnes.materializar_archivos({'G/escape.json': {'enlace': '../../../../fuera.json'}})

    def test_oraculo_restaura_secreto_si_la_sonda_falla(self):
        @contextmanager
        def servidor_local(provider):
            yield 12345
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            secreto = root / 'secretos.txt'
            secreto.write_bytes(b'SECRETO_FICTICIO=original\n')
            for permiso, sujeto in [('grep', 'SECRETO_FICTICIO'), ('bash', 'cat secretos.txt')]:
                with patch.object(arnes, 'PROYECTO', root), patch.object(arnes, 'servidor', servidor_local), \
                     patch.object(arnes.subprocess, 'run'), patch.object(arnes, 'participante', side_effect=RuntimeError('sonda fallida')):
                    with self.assertRaisesRegex(RuntimeError, 'sonda fallida'):
                        arnes.oraculo(root / permiso, 'fallo', [('build', permiso, sujeto)], '', None)
                self.assertEqual(secreto.read_bytes(), b'SECRETO_FICTICIO=original\n')

    def test_grep_y_bash_acreditan_contenido_no_solo_finalizacion(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'secretos.txt').write_bytes(b'SECRETO_FICTICIO=original\n')
            original = (root / 'secretos.txt').read_bytes()
            for permiso, sujeto in [('grep', 'SECRETO_FICTICIO'), ('bash', 'cat secretos.txt')]:
                with patch.object(arnes, 'PROYECTO', root):
                    plan, archivo, contenido = arnes.plan_sonda(('build', permiso, sujeto))
                self.assertEqual(contenido, original)
                self.assertEqual(archivo, root / 'secretos.txt')
                llamada = plan['acciones'][0]['llamadas'][0]
                self.assertEqual(llamada['herramienta'], permiso)
                if permiso == 'grep':
                    self.assertEqual(llamada['argumentos']['pattern'], sujeto)
                    self.assertEqual(llamada['argumentos']['include'], 'secretos.txt')
                for salida, esperado in [(archivo.read_text(), 'allow'), (ASK, 'ask'), (DENY, 'deny'), ('completed', 'indeterminado')]:
                    with self.subTest(permiso=permiso, decision=esperado):
                        log = root / 'p.jsonl'
                        log.write_text('')
                        p = Proveedor(plan, 'sonda', log)
                        cuerpo = dict(messages=[dict(role='user', content='MED4A_ROOT')], tools=[dict(function=dict(name=permiso))])
                        mensaje = p.respuesta(cuerpo)
                        tool = mensaje['tool_calls'][0]
                        cuerpo['messages'].extend([mensaje, dict(role='tool', tool_call_id=tool['id'], content=salida)])
                        p.respuesta(cuerpo)
                        r = clasificar(plan, 'sonda', jsonl(log), [], root, 0)
                        self.assertEqual(r['decision'], esperado)
                archivo.write_bytes(contenido)
                self.assertEqual(archivo.read_bytes(), original)


class MedirExploracionTests(RegistroTests):
    def test_medir_nuevas_con_k1_y_base_reutilizada(self):
        hoja = json.loads((Path(__file__).resolve().parents[2] / 'ecologica/respuestas-ecologica.json').read_text(encoding='utf-8'))['casos']
        for caso, regla in hoja.items():
            if not caso.startswith(('N-', 'S-')) and not regla.get('candidato'):
                continue
            with self.subTest(caso=caso):
                row, salida, pasos, _ = self.correr(caso=caso, k=1)
                self.assertEqual(row['k'], 1)
                self.assertEqual(row['caso'], caso)
                self.assertEqual(pasos.count('oraculo-antes'), 1 if 'objetivo' in regla else 0)
                self.assertEqual((salida / 'base' / caso / 'oraculo.json').is_file(), 'objetivo' in regla)


if __name__ == '__main__':
    unittest.main()
