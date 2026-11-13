"""MED-19: sondas y solicitudes al proveedor simulado, sin agentes."""
import hashlib
import importlib.util
import json
from pathlib import Path
import shlex
import subprocess
import sys
import tempfile
from types import ModuleType, SimpleNamespace
import unittest
from unittest.mock import patch

import ecologica as eco
import test_registro_ecologica as registro
from ensayo import EnsayoModificacion
from test_registro_ecologica import compartidas, ROOT


def cargar(path):
    spec = importlib.util.spec_from_file_location('espec_med19', path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.T


class FinalTests(unittest.TestCase):
    def test_sondas_R_cubren_objetivos_guardas_solo_desde_archivos(self):
        tareas = cargar(ROOT / 'ecologica/final/espec_final.py')
        publico = json.loads((ROOT / 'ecologica/final/escenarios.json').read_text(encoding='utf-8'))['dimensiones']['ecologica']
        for c in ('R-1', 'R-2', 'R-3', 'R-4'):
            t, s = tareas[c], publico[c]
            sondas = eco.bateria(eco.agentes_escenario(s), s['tarea'], escenario=s)
            for o in [t['objetivo'], *t.get('objetivos_adicionales', []), *t['guardas']]:
                self.assertIn(tuple(o[:3]), sondas)
            limpio = dict(s, tarea='Pedido para `build`')
            for rel in s['archivos']:
                if rel != 'P/opencode.json':
                    for permiso in ('read', 'edit', 'write'):
                        self.assertIn(('build', permiso, rel[2:]), eco.bateria(['build'], limpio['tarea'], escenario=limpio))

    def test_baterias_historicas_identicas_y_contrafactual_R(self):
        anterior = subprocess.check_output(['git', 'show', '92a5bd6~1:01-relevamiento/linea-base/vm/simulado/ecologica.py'], cwd=ROOT)
        viejo = ModuleType('eco_anterior_med19')
        viejo.__file__ = eco.__file__
        exec(compile(anterior, eco.__file__, 'exec'), viejo.__dict__)
        tareas = cargar(ROOT / 'ecologica/espec.py')
        for c, s in tareas.items():
            kwargs = dict(exploracion=c.startswith(('N-', 'S-')), escenario=s)
            self.assertEqual(eco.bateria(eco.agentes_escenario(s), s['tarea'], **kwargs),
                             viejo.bateria(viejo.agentes_escenario(s), s['tarea'], **kwargs), c)
        s = cargar(ROOT / 'ecologica/final/espec_final.py')['R-1']
        self.assertNotIn(('build', 'read', 'docs/manual.md'), viejo.bateria(['build'], s['tarea'], escenario=s))
        self.assertIn(('build', 'read', 'docs/manual.md'), eco.bateria(['build'], s['tarea'], escenario=s))
        self.assertFalse(hasattr(viejo, 'instruccion_brazo'))

    def test_instruccion_exacta_y_posicion(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            (base / 'instrucciones-final').mkdir()
            for p in (ROOT / 'ecologica/final/instrucciones').glob('*.txt'):
                (base / 'instrucciones-final' / p.name).write_bytes(p.read_bytes())
            texto = 'Primera\nTenés la documentación oficial en docs.\n\n{pedido}\n'
            for b in ('LB', 'sin_rige'):
                self.assertEqual(eco.instruccion_brazo(texto, base, 'ecologica', b).encode(), texto.encode())
            for b in ('indicado', 'disponible', 'probar'):
                nombre = 'disponible.txt' if b == 'disponible' else b + '-ecologica.txt'
                bloque = (base / 'instrucciones-final' / nombre).read_bytes().decode()
                salida = eco.instruccion_brazo(texto, base, 'ecologica', b)
                self.assertIn('Tenés la documentación oficial en docs.\n\n' + bloque, salida)
                self.assertEqual(salida.count(bloque), 1)

    def test_revision_instruccion_igualdad_exacta_una_linea_en_blanco(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            (base / 'instrucciones-final').mkdir()
            for final_bloque in ('', '\n'):
                bloque = 'Bloque exacto\n    comando' + final_bloque
                (base / 'instrucciones-final/disponible.txt').write_bytes(bloque.encode())
                for separacion in ('\n', '\n\n', '\n\n\n'):
                    texto = 'Inicio\nTenés la documentación oficial en docs.' + separacion + 'Pedido\n'
                    esperado = 'Inicio\nTenés la documentación oficial en docs.\n\nBloque exacto\n    comando\n\nPedido\n'
                    self.assertEqual(eco.instruccion_brazo(texto, base, 'ecologica', 'disponible'), esperado)

    def test_revision_deteccion_controla_rige_al_inicio_y_final(self):
        real = eco.control_rige
        for fallo in (None, 'control-inicio', 'control-final'):
            helper = registro.RegistroTests()
            self.addCleanup(helper.doCleanups)
            momentos = []
            def seguimiento(h, a, carpeta, env, proyecto):
                self.assertEqual(a.dimension, 'deteccion')
                momentos.append(carpeta.name)
                args = SimpleNamespace(**(vars(a) | dict(hoja='final', brazo='indicado')))
                def ejecutar(cmd, stdout, stderr):
                    self.assertIn('rige hallazgos --proyecto', cmd[-1])
                    Path(stdout).write_text('{"esquema":"ensayo"}')
                    return int(carpeta.name == fallo)
                with patch.object(h, 'ejecutar', ejecutar):
                    return real(h, args, carpeta, env, proyecto)
            with patch.object(eco, 'control_rige', side_effect=seguimiento):
                if fallo:
                    with self.assertRaisesRegex(ValueError, 'Control RIGE fallido'):
                        helper.correr(dimension='deteccion')
                else:
                    helper.correr(dimension='deteccion')
            self.assertEqual(momentos, ['control-inicio'] if fallo == 'control-inicio' else ['control-inicio', 'control-final'])

    def test_comandos_efectivamente_pedidos_al_proveedor_por_brazo(self):
        original = EnsayoModificacion.__init__
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'simulado').mkdir()
            (root / 'simulado/final-ecologica.json').write_bytes((ROOT / 'ecologica/final/planes-ecologica.json').read_bytes())
            for b in ('sin_rige', 'indicado', 'disponible', 'probar'):
                for c in ('M-1', 'R-1', 'R-2', 'R-3', 'R-4'):
                    plan = eco.cargar_plan_ensayo(root, 'ecologica', c, 'final', b)
                    def inicializar(obj, plan, accion, registro):
                        original(obj, plan, accion, registro, home=root)
                    with patch.object(EnsayoModificacion, '__init__', inicializar):
                        provider = eco.EnsayoAnidado(plan, root / f'{b}-{c}.jsonl')
                    cuerpo, pedidos = {'messages': []}, []
                    for _ in range(30):
                        respuesta = provider.respuesta(cuerpo)
                        if not respuesta.get('tool_calls'):
                            break
                        tool = respuesta['tool_calls'][0]
                        args = json.loads(tool['function']['arguments'])
                        pedidos.append((tool['function']['name'], args))
                        cuerpo['messages'].append(dict(role='tool', tool_call_id=tool['id'], content='{"sessionID":"ses_ensayo","type":"step_finish"}'))
                    provider.verificar_lecturas()
                    comandos = [a['command'] for n, a in pedidos if n == 'bash']
                    self.assertTrue(any(n in ('write', 'edit') for n, _ in pedidos))
                    if b in ('indicado', 'disponible'):
                        self.assertTrue(comandos[0].startswith('rige permiso '))
                        self.assertEqual(pedidos[-1][0], 'bash')
                        self.assertEqual(pedidos[-1][1]['command'], 'como-dev ' + shlex.quote(plan['consulta_rige']))
                        self.assertIn('--herramienta', comandos[0])
                    elif b == 'probar':
                        self.assertTrue(any(cmd.startswith("como-dev 'opencode run ") for cmd in comandos))
                        self.assertFalse(any('rige' in cmd for cmd in comandos))
                    else:
                        self.assertEqual(comandos, [])
            self.assertEqual(eco.cargar_plan_ensayo(ROOT / 'vm', 'ecologica', 'M-1'),
                             eco.cargar_plan_ensayo(ROOT / 'vm', 'ecologica', 'M-1', 'cerrada', 'LB'))

    def test_costo_propia_y_anidada_exactamente_una_vez_con_escritura_cache(self):
        tarifas = json.loads((ROOT / 'tarifas-congeladas-20261001.json').read_text(encoding='utf-8'))
        propia = dict(tokens_entrada=100, tokens_cache=200, tokens_salida=50, cache_escritura=20)
        anidada = dict(tokens_entrada=30, tokens_cache=40, tokens_salida=10, cache_escritura=5, modelo='openai/gpt-6-astra', origen='anidado')
        costo, sin_tarifa = eco.costo_solicitudes([propia, anidada], tarifas, 'openai/gpt-6.1-sol', False)
        # 120*2+200*.1+50*10 + 35*10+40*1+10*50 = 1650 / 1e6
        self.assertEqual(costo, .00165)
        self.assertEqual(sin_tarifa, [])

    def test_observar_y_proceso_reconocen_rige_en_ambas_formas(self):
        sys.path.insert(0, str(ROOT / 'herramientas'))
        try:
            from proceso import clasificar_proceso
            h = compartidas()
            for cmd in ('rige permiso --proyecto /p', "como-dev 'rige permiso --proyecto /p'"):
                hs = [dict(herramienta='bash', argumentos=dict(command=cmd), estado='completed')]
                self.assertEqual(h.observar(hs)['uso_rige'], 1)
                self.assertEqual(clasificar_proceso(dict(herramientas=hs, solicitudes=[]), {})['verificacion_final'], 'rige')
        finally:
            sys.path.pop(0)

    def test_control_rige_bloquea_json_invalido_y_ausencia_incorrecta(self):
        with tempfile.TemporaryDirectory() as tmp:
            carpeta = Path(tmp)
            comandos = []
            def ejecutar(args, stdout, stderr):
                comandos.append(args)
                Path(stdout).write_text('{"esquema":"1"}')
                return 0
            h = SimpleNamespace(ejecutar=ejecutar, como_evaluador=lambda args, env: args)
            a = SimpleNamespace(hoja='final', brazo='indicado')
            eco.control_rige(h, a, carpeta, {}, '/p')
            self.assertIn("como-dev 'rige hallazgos --proyecto /p'", comandos[-1])
            a.brazo = 'probar'
            eco.control_rige(h, a, carpeta, {}, '/p')
            self.assertIn('! command -v rige', comandos[-1])
            h.ejecutar = lambda *args: 1
            with self.assertRaises(ValueError):
                eco.control_rige(h, a, carpeta, {}, Path('/p'))
            def invalido(args, stdout, stderr):
                Path(stdout).write_text('{}')
                return 0
            h.ejecutar, a.brazo = invalido, 'disponible'
            with self.assertRaises(ValueError):
                eco.control_rige(h, a, carpeta, {}, Path('/p'))

    def test_hashes_finales_rechazan_instruccion_modificada(self):
        sys.path.insert(0, str(ROOT / 'herramientas'))
        try:
            from preparar_final import preparar
            with tempfile.TemporaryDirectory() as tmp:
                destino = Path(tmp) / 'entrada'
                digest = preparar(destino, 'sin_rige')
                base = destino / 'arnes'
                sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
                hashes = eco.validar_entradas_final(base, digest, sha)
                self.assertIn('simulado/ecologica.py', hashes)
                with self.assertRaises(ValueError):
                    eco.validar_entradas_final(base, '0' * 64, sha)
                (base / 'instrucciones-final/probar-ecologica.txt').write_bytes(b'ALTERADA')
                with self.assertRaisesRegex(ValueError, 'alterada'):
                    eco.validar_entradas_final(base, digest, sha)
        finally:
            sys.path.pop(0)


if __name__ == '__main__':
    unittest.main()
