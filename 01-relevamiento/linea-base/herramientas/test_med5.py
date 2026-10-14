"""Regresiones MED-5: arnés extraído, sin procesos externos, red ni Docker."""
from contextlib import ExitStack, redirect_stderr, redirect_stdout
from copy import deepcopy
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from types import ModuleType, SimpleNamespace
import unittest
from unittest.mock import patch

from analizar import analizar
from comun import CASOS
from test_medicion import filas, generador, ROOT
from unir import CONGELADOS, IDENTIDAD, unir


def cargar_arnes():
    texto = (ROOT / 'vm/medir.sh').read_text(encoding='utf-8')
    bloque = texto.split("<<'PYTHON_MED4B'\n", 1)[1].rsplit('\nPYTHON_MED4B', 1)[0]
    modulo = ModuleType('med5_test')
    exec(compile(bloque, 'medir.sh::python', 'exec'), modulo.__dict__)
    return modulo


class ArnesTests(unittest.TestCase):
    def setUp(self):
        self.arnes = cargar_arnes()
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name) / 'base'
        self.evaluador = Path(self.tmp.name) / 'evaluador'
        self.participante = Path(self.tmp.name) / 'participante'
        self.base.mkdir()
        (self.base / 'ejecutores').mkdir()
        (self.base / 'ejecutores/congeladas.json').write_text('{"archivos":{}}')
        for nombre in ('medir.sh', 'caso.sh', 'opencode', 'indicacion.txt', 'hoja-referencia.md'):
            (self.base / nombre).write_text('fixture')
        shutil.copyfile(ROOT / 'catalogo-modelos-20261013.json', self.base / 'modelos.json')
        shutil.copyfile(ROOT / 'tarifas-congeladas-20261001.json', self.base / 'tarifas.json')
        (self.evaluador / 'tarea').mkdir(parents=True)
        (self.evaluador / '.config/opencode').mkdir(parents=True)
        (self.participante / 'proyecto/sub').mkdir(parents=True)
        (self.participante / '.config/opencode').mkdir(parents=True)
        (self.participante / '.bashrc').write_text('')
        for caso in CASOS:
            carpeta = self.base / 'casos' / caso
            carpeta.mkdir(parents=True)
            (carpeta / 'caso.env').write_text('DIR=sub\n' if caso == 'C-2b' else '')
        self.arnes.BASE = self.base
        self.arnes.HOME_E = self.evaluador
        self.arnes.HOME_P = self.participante
        self.comandos, self.pasos, self.esperas = [], [], []

    def correr(self, evidencias=('',), preparacion=0, extra=(), fallo_catalogo=False):
        cursor = iter(evidencias)
        hash_real = self.arnes.hash_escenario

        def activar(comando, **kwargs):
            self.pasos.append('caso')
            (self.participante / '.config/opencode/.gitignore').unlink(missing_ok=True)
            return SimpleNamespace(returncode=0)

        def hash_preparado():
            self.assertTrue((self.participante / '.config/opencode/.gitignore').exists())
            self.pasos.append('hash')
            return hash_real()

        def ejecutar(comando, stdout, stderr, limite=120):
            self.comandos.append(comando)
            self.assertTrue((self.evaluador / '.cache/opencode/models.json').exists())
            out, err, codigo = '', '', 0
            if '--help' in comando:
                self.pasos.append('help')
                err = '--model --agent --format'
            elif '--version' in comando:
                out = '1.18.25\n'
            elif str(stdout).endswith('.preparacion.stdout.txt'):
                self.pasos.append('preparacion')
                codigo = preparacion
                if not codigo:
                    (self.participante / '.config/opencode/.gitignore').write_text('*')
                else:
                    err = 'fallo al preparar participante'
            elif '--format' in comando:
                self.pasos.append('run')
                respuesta = next(cursor)
                err = respuesta.get('stderr', '') if isinstance(respuesta, dict) else respuesta
                codigo = 1 if err else 0
                eventos = [{'type': 'step_finish', 'part': {'id': 'paso', 'tokens': {
                    'input': 10, 'output': 2, 'cache': {'read': 3, 'write': 0}}}}]
                if isinstance(respuesta, dict):
                    codigo = respuesta.get('codigo', codigo)
                    eventos = respuesta.get('eventos', eventos)
                    if respuesta.get('generar_dependencias'):
                        for home in (self.evaluador, self.participante):
                            config = home / '.config/opencode'
                            (config / 'node_modules').mkdir(exist_ok=True)
                            (config / 'node_modules/index.js').write_text('dependencia instalada durante run')
                            (config / 'package.json').write_text('{}')
                out = ''.join(json.dumps(e) + '\n' for e in eventos)
            Path(stdout).write_text(out)
            Path(stderr).write_text(err)
            return codigo

        argv = ['medir', '--tanda', 'prueba', '--condicion', 'LB', '--brazo', 'LB',
                '--ejecutor', 'principal', '--modelo', 'openai/gpt-6.1-sol',
                '--k', '3', '--limite', '60', '--semilla', '20261013',
                '--pares', 'C-2b:2', *extra]
        if fallo_catalogo:
            (self.base / 'modelos.json').write_text('{}')
        with ExitStack() as pila:
            pila.enter_context(patch.object(sys, 'argv', argv))
            pila.enter_context(patch.dict(self.arnes.os.environ, OPENCODE_AUTH_JSON='{"openai":{}}'))
            pila.enter_context(patch.object(self.arnes.os, 'chdir'))
            pila.enter_context(patch.object(self.arnes.shutil, 'chown'))
            pila.enter_context(patch.object(self.arnes.shutil, 'which', return_value=str(self.base / 'opencode')))
            pila.enter_context(patch.object(self.arnes.subprocess, 'run', side_effect=activar))
            pila.enter_context(patch.object(self.arnes, 'congelar_ejecutor', return_value=('freeze', 'config')))
            pila.enter_context(patch.object(self.arnes, 'ejecutar', side_effect=ejecutar))
            pila.enter_context(patch.object(self.arnes, 'hash_escenario', side_effect=hash_preparado))
            pila.enter_context(patch.object(self.arnes.time, 'sleep', side_effect=self.esperas.append))
            pila.enter_context(redirect_stdout(io.StringIO()))
            pila.enter_context(redirect_stderr(io.StringIO()))
            self.arnes.main()
        return self.base / 'resultados/prueba'

    def test_catalogo_hash_dueno_modo_y_detencion_antes_de_debug(self):
        with patch.object(self.arnes.shutil, 'chown') as dueno, patch.object(Path, 'chmod') as modo:
            digest = self.arnes.instalar_catalogo(self.base / 'modelos.json')
        self.assertEqual(digest, self.arnes.HASH_CATALOGO)
        self.assertEqual((self.evaluador / '.cache/opencode/models.json').read_bytes(),
                         (self.base / 'modelos.json').read_bytes())
        modo.assert_called_once_with(0o644)
        self.assertEqual(dueno.call_count, 3)
        for llamada in dueno.call_args_list:
            self.assertEqual(llamada.kwargs, dict(user='evaluador', group='evaluador'))
        with self.assertRaises(SystemExit) as fallo:
            self.correr(fallo_catalogo=True)
        self.assertNotEqual(fallo.exception.code, 0)
        self.assertEqual(self.comandos, [])

    def test_catalogo_copiado_por_envoltorio_tambien_en_ensayo(self):
        texto = (ROOT / 'vm/contenedor.sh').read_text(encoding='utf-8')
        medir = texto.split('  medir)\n', 1)[1].split('  shell)\n', 1)[0]
        copia = 'docker cp "$(ruta_docker "$ORIGEN/../catalogo-modelos-20261013.json")" "$CONTENEDOR:/opt/linea-base/modelos.json"'
        self.assertIn(copia, medir)
        self.assertGreater(medir.index(copia), medir.index('sleep infinity >/dev/null'))
        self.assertLess(medir.index(copia), medir.index('docker exec'))

    def test_preparacion_en_DIR_antes_del_hash_sin_contaminacion(self):
        salida = self.correr()
        row = json.loads((salida / 'registro.jsonl').read_text())
        self.assertEqual(self.pasos[-5:], ['caso', 'preparacion', 'hash', 'run', 'hash'])
        comando = next(c for c in self.comandos if 'como-dev' in c)
        self.assertIn('COMO_DEV_DIR=sub', comando)
        self.assertEqual(comando[-2:], ['como-dev', 'opencode debug config'])
        self.assertIn('evaluador', comando)
        self.assertFalse(row['escenario_alterado'])
        self.assertFalse(row['registro_incompleto'])
        self.assertFalse(row['fallo_preparacion'])
        self.assertTrue((salida / 'crudo/C-2b-2-0.preparacion.stdout.txt').exists())
        self.assertTrue((salida / 'crudo/C-2b-2-0.preparacion.stderr.txt').exists())
        meta = json.loads((salida / 'tanda.json').read_text())
        self.assertEqual(meta['hash_catalogo'], self.arnes.HASH_CATALOGO)
        self.assertEqual(meta['exclusiones_hash'], sorted(self.arnes.GENERADOS_OPENCODE))

    def test_hash_config_excluye_generados_solo_en_primer_nivel(self):
        config = self.evaluador / '.config/opencode'
        (config / 'opencode.json').write_text('{}')
        hash_config = lambda: self.arnes.hash_arbol([config], excluir=self.arnes.GENERADOS_OPENCODE)
        antes = hash_config()
        sin_exclusiones = self.arnes.hash_arbol([config])
        self.assertEqual(antes, sin_exclusiones)
        self.assertEqual(self.arnes.GENERADOS_OPENCODE,
                         {'node_modules', 'package.json', 'package-lock.json', 'bun.lock', 'bun.lockb', '.gitignore'})
        for nombre in sorted(self.arnes.GENERADOS_OPENCODE):
            if nombre == 'node_modules':
                paquete = config / nombre / 'paquete'
                paquete.mkdir(parents=True)
                (paquete / 'index.js').write_text('dependencia')
            else:
                (config / nombre).write_text('generado')
            with self.subTest(nombre=nombre):
                self.assertEqual(antes, hash_config())
        (config / 'node_modules/paquete/index.js').write_text('dependencia actualizada')
        self.assertEqual(antes, hash_config())
        self.assertNotEqual(sin_exclusiones, self.arnes.hash_arbol([config]))

    def test_hash_config_detecta_config_agentes_skills_y_archivos_ajenos(self):
        config = self.evaluador / '.config/opencode'
        (config / 'opencode.json').write_text('{}')
        hash_config = lambda: self.arnes.hash_arbol([config], excluir=self.arnes.GENERADOS_OPENCODE)
        for nombre, contenido in (('opencode.json', '{"model":"otro"}'),
                                  ('agents/x.md', 'agente'), ('skills/x/SKILL.md', 'skill'),
                                  ('archivo-ajeno.txt', 'nuevo'), ('agents/package.json', 'no generado en la raíz')):
            antes = hash_config()
            path = config / nombre
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(contenido)
            with self.subTest(nombre=nombre):
                self.assertNotEqual(antes, hash_config())

    def test_congelar_conserva_dependencias_y_elimina_config_ajena(self):
        origen = self.base / 'ejecutores/principal'
        (origen / 'agents').mkdir(parents=True)
        (origen / 'opencode.json').write_text('config congelada')
        (origen / 'agents/build.md').write_text('agente congelado')
        destino = self.evaluador / '.config/opencode'
        paquete = destino / 'node_modules/paquete'
        paquete.mkdir(parents=True)
        dependencia = paquete / 'index.js'
        dependencia.write_text('dependencia instalada')
        for nombre in self.arnes.GENERADOS_OPENCODE - {'node_modules'}:
            (destino / nombre).write_text('conservar ' + nombre)
        (destino / 'opencode.json').write_text('config alterada')
        (destino / 'archivo-ajeno.txt').write_text('eliminar')
        (destino / 'agents').mkdir()
        (destino / 'agents/ajeno.md').write_text('eliminar')
        with patch.object(self.arnes.subprocess, 'run') as chown:
            hashes = self.arnes.congelar_ejecutor('principal')
        chown.assert_called_once_with(['chown', '-R', 'evaluador:evaluador', str(destino)], check=True)
        self.assertEqual(dependencia.read_text(), 'dependencia instalada')
        for nombre in self.arnes.GENERADOS_OPENCODE - {'node_modules'}:
            self.assertEqual((destino / nombre).read_text(), 'conservar ' + nombre)
        self.assertFalse((destino / 'archivo-ajeno.txt').exists())
        self.assertFalse((destino / 'agents/ajeno.md').exists())
        self.assertEqual((destino / 'opencode.json').read_bytes(), (origen / 'opencode.json').read_bytes())
        self.assertEqual((destino / 'agents/build.md').read_bytes(), (origen / 'agents/build.md').read_bytes())
        self.assertEqual(hashes, (self.arnes.hash_arbol([origen], excluir=self.arnes.GENERADOS_OPENCODE),
                                 self.arnes.hash_arbol([destino], excluir=self.arnes.GENERADOS_OPENCODE)))
        dependencia.write_text('dependencia actualizada')
        with patch.object(self.arnes.subprocess, 'run'):
            self.assertEqual(hashes, self.arnes.congelar_ejecutor('principal'))
        self.assertEqual(dependencia.read_text(), 'dependencia actualizada')

    def test_escenario_excluye_generados_de_config_pero_no_del_proyecto(self):
        antes = self.arnes.hash_escenario()
        config = self.participante / '.config/opencode'
        (config / 'node_modules').mkdir()
        (config / 'node_modules/index.js').write_text('generado')
        (config / 'package.json').write_text('{}')
        (config / '.gitignore').write_text('*')
        self.assertEqual(antes, self.arnes.hash_escenario())
        (self.participante / 'proyecto/node_modules').mkdir()
        self.assertNotEqual(antes, self.arnes.hash_escenario())

    def test_dependencias_generadas_durante_run_no_alteran_registro(self):
        salida = self.correr(({'generar_dependencias': True},))
        row = json.loads((salida / 'registro.jsonl').read_text())
        self.assertFalse(row['ejecutor_alterado'])
        self.assertFalse(row['escenario_alterado'])
        self.assertFalse(row['registro_incompleto'])
        self.assertEqual(row['intentos'][0]['hash_ejecutor_antes'], row['intentos'][0]['hash_ejecutor_despues'])
        self.assertEqual(row['tokens_entrada'], 10)

    def test_preparacion_fallida_se_registra_sin_medir(self):
        salida = self.correr(preparacion=7)
        row = json.loads((salida / 'registro.jsonl').read_text())
        self.assertTrue(row['fallo_preparacion'])
        self.assertTrue(row['intentos'][0]['fallo_preparacion'])
        self.assertTrue(row['registro_incompleto'])
        self.assertIsNone(row['tokens_entrada'])
        self.assertEqual(row['duracion_s'], 0)
        self.assertEqual(row['codigo_salida'], 7)
        self.assertNotIn('run', self.pasos)
        self.assertNotIn('hash', self.pasos)

    def test_cuota_senales_y_negativas(self):
        for evidencia in ('HTTP 429', 'status code 429', '"statusCode": 429', 'rate limit', 'rate_limit', 'usage limit',
                          'usage_limit_reached', 'Too Many Requests', 'USAGE LIMIT'):
            with self.subTest(evidencia=evidencia):
                self.assertTrue(self.arnes.limite_cuota(evidencia))
        for evidencia in ('429', '"output": 429', 'HTTP 4290', 'HTTP 500', 'HTTP 401', '14290', 'respuesta normal'):
            self.assertFalse(self.arnes.limite_cuota(evidencia))

    def test_exito_con_texto_de_herramienta_y_tokens_429_no_reintenta(self):
        eventos = [
            {'type': 'tool_use', 'part': {'tool': 'read', 'state': {
                'status': 'completed', 'input': {'filePath': 'docs/providers.html'},
                'output': 'rate limit; usage_limit_reached; status code 503'}}},
            {'type': 'text', 'part': {'text': 'HTTP 429; Too Many Requests'}},
            {'type': 'step_finish', 'part': {'id': 'paso', 'tokens': {
                'input': 10, 'output': 429, 'cache': {'read': 3, 'write': 0}}}},
        ]
        salida = self.correr(({'codigo': 0, 'eventos': eventos},))
        row = json.loads((salida / 'registro.jsonl').read_text())
        self.assertFalse(row['intentos'][0]['limite_cuota'])
        self.assertFalse(row['intentos'][0]['transitorio'])
        self.assertEqual(row['tokens_salida'], 429)
        self.assertEqual(row['reintentos'], 0)
        self.assertEqual(self.pasos.count('run'), 1)
        self.assertEqual(self.esperas, [])
        self.assertFalse((salida / 'DETENCION.txt').exists())

    def test_evento_error_usage_limit_con_codigo_1_es_cuota(self):
        error = {'type': 'error', 'error': {'message': 'usage_limit_reached'}}
        salida = self.correr(({'codigo': 1, 'eventos': [error]}, ''))
        row = json.loads((salida / 'registro.jsonl').read_text())
        self.assertTrue(row['intentos'][0]['limite_cuota'])
        self.assertTrue(row['intentos'][0]['transitorio'])
        self.assertEqual(row['reintentos'], 1)
        self.assertEqual(self.esperas, [30])

    def test_stderr_status_code_503_con_codigo_1_transitorio_sin_cuota(self):
        salida = self.correr(('status code 503', ''))
        row = json.loads((salida / 'registro.jsonl').read_text())
        self.assertFalse(row['intentos'][0]['limite_cuota'])
        self.assertTrue(row['intentos'][0]['transitorio'])
        self.assertEqual(row['reintentos'], 1)
        self.assertEqual(self.esperas, [1])

    def test_deteccion_exige_fallo_y_filtra_eventos_aun_con_codigo_1(self):
        clasificar = self.arnes.clasificar_fallo
        for codigo in (0, 124, 137):
            with self.subTest(codigo=codigo):
                cuota, transitorio, _ = clasificar(codigo, 'HTTP 429; status code 503', [])
                self.assertFalse(cuota)
                self.assertFalse(transitorio)
        eventos = [{'type': tipo, 'part': {'text': 'usage_limit_reached; status code 503'}}
                   for tipo in ('text', 'tool_use', 'step_finish')]
        cuota, transitorio, evidencia = clasificar(1, '', eventos)
        self.assertFalse(cuota)
        self.assertFalse(transitorio)
        self.assertNotIn('usage_limit_reached', evidencia)
        self.assertNotIn('503', evidencia)
        for codigo in (0, 1):
            error = {'type': 'error', 'error': {'message': 'usage_limit_reached'}}
            cuota, transitorio, evidencia = clasificar(codigo, '', [*eventos, error])
            self.assertTrue(cuota)
            self.assertTrue(transitorio)
            self.assertIn('usage_limit_reached', evidencia)
            self.assertNotIn('503', evidencia)

    def test_cuota_persistente_detiene_sin_fila_ni_pares_posteriores(self):
        with self.assertRaises(SystemExit) as fallo:
            self.correr(('usage_limit_reached',) * 3, extra=('--pares', 'C-2b:2,C-3a:1'))
        self.assertEqual(fallo.exception.code, 3)
        self.assertEqual(self.esperas, [30, 120])
        self.assertEqual(self.pasos.count('run'), 3)
        self.assertEqual(self.pasos.count('preparacion'), 3)
        salida = self.base / 'resultados/prueba'
        self.assertEqual((salida / 'registro.jsonl').read_text(), '')
        detencion = (salida / 'DETENCION.txt').read_text(encoding='utf-8')
        self.assertIn('C-2b:2', detencion)
        self.assertIn('Hora (UTC):', detencion)
        self.assertIn('usage_limit_reached', detencion)

    def test_cuota_recuperada_suma_todos_los_intentos(self):
        salida = self.correr(('HTTP 429', 'rate limit', ''))
        row = json.loads((salida / 'registro.jsonl').read_text())
        self.assertEqual(row['reintentos'], 2)
        self.assertEqual(row['tokens_entrada'], 30)
        self.assertEqual(self.esperas, [30, 120])
        self.assertFalse((salida / 'DETENCION.txt').exists())

    def test_detencion_conserva_filas_previas_y_evidencia_del_par_perdido(self):
        with self.assertRaises(SystemExit):
            self.correr(('', 'HTTP 429', 'HTTP 429', 'HTTP 429'), extra=('--pares', 'C-1a:1,C-2b:2,C-3a:1'))
        salida = self.base / 'resultados/prueba'
        rows = [json.loads(l) for l in (salida / 'registro.jsonl').read_text().splitlines()]
        self.assertEqual([(r['caso'], r['repeticion']) for r in rows], [('C-1a', 1)])
        self.assertEqual(self.pasos.count('run'), 4)
        for intento in range(3):
            self.assertIn('429', (salida / f'crudo/C-2b-2-{intento}.stderr.txt').read_text())

    def test_pares_orden_validacion_y_aleatorizacion_reproducible(self):
        seleccionar = self.arnes.seleccionar_pares
        esperado = [('C-3b', 1), ('C-1a', 2)]
        self.assertEqual(seleccionar(CASOS, 3, 7, 'C-3b:1,C-1a:2'), esperado)
        todos = seleccionar(CASOS, 3, 7)
        self.assertEqual(len(todos), 72)
        self.assertEqual(todos, seleccionar(CASOS, 3, 7))
        self.assertNotEqual(todos, seleccionar(CASOS, 3, 8))
        for pares in ('', 'C-1a:0', 'C-1a:4', 'C-5a:1', 'C-1a:1,C-1a:1', 'C-1a', 'C-1a:1,'):
            with self.subTest(pares=pares), self.assertRaises(ValueError):
                seleccionar(CASOS, 3, 7, pares)
        with self.assertRaises(ValueError):
            seleccionar(['C-1a'], 3, 7, 'C-3b:1')
        salida = self.correr(('', ''), extra=('--pares', 'C-3b:1,C-1a:2'))
        rows = [json.loads(l) for l in (salida / 'registro.jsonl').read_text().splitlines()]
        self.assertEqual([(r['caso'], r['repeticion']) for r in rows], esperado)

    def test_charles_modelo_y_nombre_efectivos(self):
        salida = self.correr(extra=('--ejecutor', 'charles'))
        row = json.loads((salida / 'registro.jsonl').read_text())
        self.assertEqual((row['ejecutor'], row['modelo'], row['agente']),
                         ('charles', 'openai/gpt-6.1-sol', '[AUX] Charles'))
        for comando in self.comandos:
            if '--agent' in comando:
                self.assertEqual(comando[comando.index('--agent') + 1], '[AUX] Charles')
            if 'agent' in comando:
                self.assertEqual(comando[-1], '[AUX] Charles')

    def test_modelos_no_admitidos_y_p3_explicita(self):
        for extra in (('--ejecutor', 'charles', '--modelo', 'openai/gpt-6-luna'),
                      ('--modelo', 'openai/gpt-6-astra'),
                      ('--modelo', 'openai/gpt-5.6-luna'),
                      ('--fase', 'p3'), ('--fase', 'piloto')):
            with self.subTest(extra=extra), self.assertRaises(SystemExit) as fallo:
                self.correr(extra=extra)
            self.assertEqual(fallo.exception.code, 2)
        self.assertEqual(self.comandos, [])
        salida = self.correr(extra=('--modelo', 'openai/gpt-5.6-luna', '--fase', 'p3'))
        row = json.loads((salida / 'registro.jsonl').read_text())
        self.assertEqual(row['fase'], 'p3')
        self.assertEqual(row['modelo'], 'openai/gpt-5.6-luna')


class UnionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.meta = dict(ejecutor='principal', modelo='openai/gpt-6.1-sol', brazo='LB',
                         condicion='LB', fase='medicion', ensayo=False, k=3, semilla=20261013,
                         hash_instruccion='plantilla', hash_ejecutor='ejecutor', hash_hoja='hoja',
                         hash_tarifas='tarifas', hash_catalogo='catalogo')

    def guardar(self, tanda, pares, cambios=None):
        carpeta = self.root / tanda
        carpeta.mkdir()
        meta = dict(self.meta, tanda=tanda, **(cambios or {}))
        (carpeta / 'tanda.json').write_text(json.dumps(meta), encoding='utf-8')
        rows = [dict(ejecutor=meta['ejecutor'], modelo=meta['modelo'], brazo=meta['brazo'],
                     condicion=meta['condicion'], fase=meta['fase'], ensayo=meta['ensayo'],
                     k=meta['k'], caso=c, repeticion=r, tanda=tanda,
                     hash_instruccion=f'pregunta-{c}', hash_ejecutor=meta['hash_ejecutor']) for c, r in pares]
        registro = carpeta / 'registro.jsonl'
        registro.write_text(''.join(json.dumps(r) + '\n' for r in rows), encoding='utf-8')
        return registro

    def test_union_preserva_filas_y_avisa_faltantes(self):
        a = self.guardar('a', [('C-1a', 1)])
        b = self.guardar('b', [('C-3b', 2)])
        originales = [a.read_bytes(), b.read_bytes()]
        rows, meta, faltantes = unir([a, b])
        self.assertEqual([r['tanda'] for r in rows], ['a', 'b'])
        self.assertEqual(meta['orden'], [('C-1a', 1), ('C-3b', 2)])
        self.assertEqual(len(faltantes), 70)
        self.assertNotIn(('C-1a', 1), faltantes)
        self.assertIn(('C-1a', 2), faltantes)
        self.assertEqual(originales, [a.read_bytes(), b.read_bytes()])
        salida = self.root / 'unida/registro.jsonl'
        cli = subprocess.run([sys.executable, '-B', str(ROOT / 'herramientas/unir.py'),
                              str(a), str(b), '--salida', str(salida)], capture_output=True, text=True)
        self.assertEqual(cli.returncode, 0, cli.stderr)
        self.assertIn('70 pares faltantes', cli.stdout)
        self.assertIn('C-1a:2', cli.stdout)
        unidos, _, faltantes2 = unir([salida])
        self.assertEqual(rows, unidos)
        self.assertEqual(faltantes, faltantes2)

    def test_negativas_por_cada_parametro_congelado_y_identidad(self):
        a = self.guardar('a', [('C-1a', 1)])
        for campo in CONGELADOS + IDENTIDAD:
            valor = self.meta[campo]
            distinto = valor + 1 if type(valor) is int else (not valor if type(valor) is bool else valor + '-otro')
            b = self.guardar(campo, [('C-1b', 1)], {campo: distinto})
            with self.subTest(campo=campo), self.assertRaisesRegex(ValueError, campo):
                unir([a, b])

    def test_negativas_por_metadata_ausente_filas_incoherentes_y_duplicados(self):
        a = self.guardar('a', [('C-1a', 1)])
        b = self.guardar('b', [('C-1a', 1)])
        with self.assertRaisesRegex(ValueError, 'Par repetido'):
            unir([a, b])
        for campo in CONGELADOS:
            meta = deepcopy(self.meta)
            del meta[campo]
            (b.parent / 'tanda.json').write_text(json.dumps(meta))
            with self.subTest(campo=campo), self.assertRaisesRegex(ValueError, campo):
                unir([a, b])
        (b.parent / 'tanda.json').write_text(json.dumps(self.meta))
        fila = json.loads(b.read_text())
        fila['modelo'] = 'otro'
        b.write_text(json.dumps(fila))
        with self.assertRaisesRegex(ValueError, 'modelo'):
            unir([a, b])

    def test_union_completa_y_registro_vacio(self):
        todos = [(c, r) for c in CASOS for r in range(1, 4)]
        a = self.guardar('a', todos[:30])
        b = self.guardar('b', todos[30:])
        vacio = self.guardar('detenida', [])
        rows, _, faltantes = unir([vacio, a, b])
        self.assertEqual(len(rows), 72)
        self.assertEqual(faltantes, [])

    def test_cli_no_sobrescribe_evidencia_ni_colisiona_con_manifiesto(self):
        a = self.guardar('a', [('C-1a', 1)])
        original = a.read_bytes()
        for salida in (a, self.root / 'nueva/tanda.json'):
            cli = subprocess.run([sys.executable, '-B', str(ROOT / 'herramientas/unir.py'),
                                  str(a), '--salida', str(salida)], capture_output=True, text=True)
            self.assertNotEqual(cli.returncode, 0, cli.stdout)
        self.assertEqual(a.read_bytes(), original)
        self.assertFalse((self.root / 'nueva').exists())


class AnalisisYCierreTests(unittest.TestCase):
    def test_charles_compara_mismo_modelo_y_rechaza_luna(self):
        d = analizar(filas() + filas(ejecutor='charles'))
        self.assertTrue(d['reevaluar_objeto'])
        self.assertFalse(d['segundo_ejecutor_pendiente'])
        with self.assertRaisesRegex(ValueError, 'Charles'):
            analizar(filas() + filas(ejecutor='charles', modelo='openai/gpt-6-luna'))
        perdidas = filas(ejecutor='charles', modelo='openai/gpt-6-luna')
        for fila in perdidas:
            fila['registro_incompleto'] = True
        with self.assertRaisesRegex(ValueError, 'Charles'):
            analizar(perdidas)

    def test_p3_no_decide_cumplimiento_y_requiere_fase(self):
        rs = filas(modelo='openai/gpt-5.6-luna')
        self.assertIsNone(analizar(rs)['cumplimiento_proyecto'])
        rs[0]['fase'] = 'medicion'
        with self.assertRaisesRegex(ValueError, 'P3'):
            analizar(rs)

    def test_hoja_cerrada_tres_estados(self):
        texto = (ROOT / 'respuestas.md').read_text(encoding='utf-8')
        self.assertTrue(generador.generar(texto)['hoja_cerrada'])
        # No tocar la hoja real: variar sólo su marcador de cierre en memoria.
        sin_cierre = texto.replace('hoja cerrada el', 'estado de la hoja el')
        self.assertIsNone(generador.generar(sin_cierre)['hoja_cerrada'])
        pendiente = sin_cierre + '\n**Cierre de la hoja:** pendiente\n'
        self.assertFalse(generador.generar(pendiente)['hoja_cerrada'])


if __name__ == '__main__':
    unittest.main()
