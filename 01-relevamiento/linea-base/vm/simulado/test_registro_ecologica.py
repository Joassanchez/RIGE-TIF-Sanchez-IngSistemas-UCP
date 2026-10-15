"""Ventana real de medir() con procesos nativos sustituidos; sin Docker/red."""
from contextlib import ExitStack, contextmanager, redirect_stdout
import io
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
from types import ModuleType
import unittest
from unittest.mock import patch

import ecologica as eco

ROOT = Path(__file__).resolve().parents[2]


def compartidas():
    texto = (ROOT / 'vm/medir.sh').read_text(encoding='utf-8')
    bloque = texto.split("<<'PYTHON_MED4B'\n", 1)[1].rsplit('\nPYTHON_MED4B', 1)[0]
    h = ModuleType('med9_registro')
    exec(compile(bloque, 'medir.sh::python', 'exec'), h.__dict__)
    return h


class RegistroTests(unittest.TestCase):
    def correr(self, dimension='ecologica', ensayo=True, mutacion=False):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        base = Path(tmp.name) / 'base'
        base.mkdir()
        h = compartidas()
        h.BASE, h.HOME_E, h.HOME_P = base, base / 'evaluador', base / 'participante'
        (h.HOME_E / 'tarea').mkdir(parents=True)
        proyecto = h.HOME_P / 'proyecto'
        (proyecto / 'sub').mkdir(parents=True)
        (h.HOME_P / '.config/opencode').mkdir(parents=True)
        (h.HOME_P / '.bashrc').write_text('')
        config = h.HOME_E / '.config/opencode'
        origen = base / 'ejecutores' / ('principal-' + dimension)
        origen.mkdir(parents=True)
        shutil.copyfile(ROOT / 'vm/ejecutores' / ('principal-' + dimension) / 'opencode.json', origen / 'opencode.json')
        (origen / 'agents').mkdir()
        (origen / 'agents/anterior.md').write_text('agente anterior')
        (base / 'ejecutores/congeladas.json').write_text('{"archivos":{}}')
        for nombre in ('medir.sh', 'hoja-referencia.md', 'modelos.json', 'opencode'):
            (base / nombre).write_text('fixture')
        shutil.copyfile(ROOT / 'tarifas-congeladas-20261001.json', base / 'tarifas.json')
        caso = 'V-1' if dimension == 'ecologica' else 'D-A'
        escenario = dict(archivos={}, env={}, directorio='sub', tarea='Consulta local', instruccion='Consulta local')
        eco.guardar(base / 'escenarios.json', {'dimensiones': {dimension: {caso: escenario}}})
        for nombre in ('tareas.md', 'deteccion.md'):
            (base / nombre).write_text('hoja cerrada')
        (base / 'simulado').mkdir()
        (base / 'simulado/ecologica.py').write_text('extension fixture')
        eco.guardar(base / 'simulado' / (dimension + '.json'), {'casos': {caso: {'archivos': {}, 'respuesta': 'lista'}}})
        permisos = json.loads((origen / 'opencode.json').read_text())['permission']
        efectivo = {'permission': [dict(permission=k, pattern=p, action=v)
                     for k, reglas in permisos.items()
                     for p, v in (reglas.items() if isinstance(reglas, dict) else [('*', reglas)])]}
        pasos, comandos = [], []
        def ejecutar(cmd, stdout, stderr, limite=120):
            nombre = Path(stdout).name
            pasos.append(nombre)
            comandos.append((cmd, os.getcwd(), nombre))
            out = ''
            if '--help' in cmd:
                out = '--agent --model --format'
            elif '--version' in cmd:
                out = '1.18.25'
            elif 'run' in cmd:
                # Igual que OpenCode: puede actualizar dependencias legítimas.
                (config / 'node_modules/paquete').mkdir(parents=True, exist_ok=True)
                (config / 'node_modules/paquete/index.js').write_text('generado durante run')
                for generado in h.GENERADOS_OPENCODE - {'node_modules'}:
                    (config / generado).write_text('generado durante run')
                if mutacion:
                    (config / 'opencode.json').write_text('{"model":"intruso"}')
                    (config / 'agents/anterior.md').unlink()
                    (config / 'agents/nuevo.md').write_text('agente intruso')
                out = json.dumps(dict(type='step_finish', part=dict(id='paso', tokens=dict(input=10, output=2, cache=dict(read=3))))) + '\n'
            elif 'agent' in cmd:
                # Simula una inicialización dependiente del cwd que el antiguo
                # calentamiento global no cubría; NO se excluye esta ruta.
                if os.getcwd() == str(proyecto / 'sub'):
                    (config / 'agents/inicializado').mkdir(exist_ok=True)
                out = json.dumps(efectivo)
            else:
                out = '{}'
            Path(stdout).write_text(out)
            Path(stderr).write_text('')
            return 0

        def capturar(prefijo, momento, agentes, directorio):
            pasos.append('capturar-' + momento)
            carpeta = Path(str(prefijo) + '.' + momento)
            carpeta.mkdir()
            (carpeta / 'config.json').write_text('{}')
            return carpeta

        def snapshot(h, prefijo, momento):
            pasos.append('snapshot-' + momento)
            return captura_real(h, prefijo, momento)

        @contextmanager
        def servidor(provider):
            yield 12345  # Sin sockets ni proveedor externo.

        lectura_real, captura_real = Path.read_text, eco.capturar_ejecutor
        def leer(path, *args, **kwargs):
            return 'Iface\nlo\n' if path.as_posix() == '/proc/net/route' else lectura_real(path, *args, **kwargs)

        argv = ['medir', '--dimension', dimension, '--tanda', 'prueba', '--k', '1', '--casos', caso]
        for flag, nombre in [('escenarios', 'escenarios.json'), ('tareas', 'tareas.md'), ('deteccion', 'deteccion.md')]:
            argv += ['--hash-' + flag, h.sha(base / nombre)]
        argv += ['--ensayo'] if ensayo else ['--modelo', 'openai/gpt-6.1-sol', '--limite', '600',
                 '--semilla', '20261015', '--ejecutor', 'principal', '--brazo', 'LB', '--condicion', 'LB']
        cwd = os.getcwd()
        with ExitStack() as pila:
            pila.callback(os.chdir, cwd)
            pila.enter_context(patch.object(sys, 'argv', argv))
            pila.enter_context(patch.dict(os.environ, {'OPENCODE_AUTH_JSON': '' if ensayo else '{"openai":{}}'}))
            pila.enter_context(patch.object(Path, 'read_text', leer))
            pila.enter_context(patch.object(eco, 'BINARIO', str(base / 'opencode')))
            pila.enter_context(patch.object(eco, 'PROYECTO', proyecto))
            pila.enter_context(patch.object(eco, 'HOME', h.HOME_P))
            pila.enter_context(patch.object(eco.shutil, 'chown'))
            pila.enter_context(patch.object(eco.subprocess, 'run'))
            pila.enter_context(patch.object(h, 'ejecutar', ejecutar))
            pila.enter_context(patch.object(h, 'instalar_catalogo', return_value='catalogo'))
            pila.enter_context(patch.object(h, 'habilitar_configuracion'))
            pila.enter_context(patch.object(eco, 'preparar', return_value=''))
            pila.enter_context(patch.object(eco, 'participante', side_effect=lambda cmd, out, err: ejecutar([], out, err)))
            pila.enter_context(patch.object(eco, 'capturar', capturar))
            pila.enter_context(patch.object(eco, 'capturar_ejecutor', snapshot))
            pila.enter_context(patch.object(eco, 'servidor', servidor))
            pila.enter_context(redirect_stdout(io.StringIO()))
            eco.medir(h.__dict__)
        salida = base / 'resultados/prueba'
        return json.loads((salida / 'registro.jsonl').read_text()), salida, pasos, comandos

    def test_intento_sin_cambios_reales_conserva_tokens_en_ambas_dimensiones(self):
        for dimension in ('ecologica', 'deteccion'):
            for ensayo in (False, True):
                with self.subTest(dimension=dimension, ensayo=ensayo):
                    r, salida, pasos, comandos = self.correr(dimension, ensayo)
                    self.assertFalse(r['registro_incompleto'])
                    self.assertEqual(r['ejecutor_alterado'], 0)
                    self.assertEqual(r['ejecutor_cambios'], [])
                    self.assertEqual([r[k] for k in ('tokens_entrada', 'tokens_cache', 'tokens_salida')], [10, 3, 2])
                    antes, despues = pasos.index('snapshot-antes'), pasos.index('snapshot-despues')
                    self.assertEqual(len(pasos[antes + 1:despues]), 1)
                    self.assertTrue(pasos[antes + 1].endswith('.stdout.txt'))
                    warm = next((cmd, cwd) for cmd, cwd, n in comandos if n.endswith('.calentamiento.json'))
                    run = next((cmd, cwd) for cmd, cwd, n in comandos if n.endswith('.stdout.txt'))
                    # como_evaluador antepone env/PWD: comparar TODO salvo argv.
                    self.assertEqual(warm[0][:warm[0].index('debug')], run[0][:run[0].index('run')])
                    self.assertEqual(warm[1], run[1])
                    self.assertTrue(warm[1].endswith('sub'))
                    meta = json.loads((salida / 'tanda.json').read_text())
                    self.assertEqual(set(meta['exclusiones_hash']), compartidas().GENERADOS_OPENCODE)

    def test_cambios_reales_conservan_incompleto_y_diagnostico_por_ruta(self):
        for dimension in ('ecologica', 'deteccion'):
            with self.subTest(dimension=dimension):
                r, salida, _, _ = self.correr(dimension, mutacion=True)
                self.assertTrue(r['registro_incompleto'])
                self.assertEqual(r['ejecutor_alterado'], 1)
                self.assertIsNone(r['tokens_entrada'])
                cambios = r['intentos'][0]['ejecutor_cambios']
                self.assertEqual({c['ruta']: c['cambio'] for c in cambios}, {
                    'opencode.json': 'modificado', 'agents/anterior.md': 'borrado', 'agents/nuevo.md': 'creado'})
                self.assertEqual(r['ejecutor_cambios'], [dict(intento=0, **c) for c in cambios])
                prefijo = salida / r['intentos'][0]['archivo_evidencia'].removesuffix('.stdout.txt')
                antes = json.loads(Path(str(prefijo) + '.ejecutor-antes.json').read_text())
                despues = json.loads(Path(str(prefijo) + '.ejecutor-despues.json').read_text())
                self.assertEqual(eco.cambios_ejecutor(antes['archivos'], despues['archivos']), cambios)
                self.assertNotEqual(antes['hash'], despues['hash'])

    def test_inventario_opcional_no_cambia_hash_ni_excluye_configuracion(self):
        h = compartidas()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for nombre in ('opencode.json', 'agents/package.json', 'skills/x/SKILL.md', 'package.json', 'node_modules/pkg/index.js'):
                p = root / nombre
                p.parent.mkdir(parents=True, exist_ok=True)
                p.write_text(nombre)
            inventario = {}
            digest = h.hash_arbol([root], excluir=h.GENERADOS_OPENCODE, inventario=inventario)
            self.assertEqual(digest, h.hash_arbol([root], excluir=h.GENERADOS_OPENCODE))
            self.assertEqual(set(inventario[str(root)]), {'.', 'opencode.json', 'agents', 'agents/package.json', 'skills', 'skills/x', 'skills/x/SKILL.md'})


if __name__ == '__main__':
    unittest.main()
