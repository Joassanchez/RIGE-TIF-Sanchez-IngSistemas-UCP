"""MED-13-c4: hook JavaScript real con entradas sintéticas; sin OpenCode/modelos."""
import json
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import ecologica as eco
import test_registro_ecologica as registro


@unittest.skipUnless(shutil.which('node'), 'Node requerido para probar el hook sin OpenCode')
class SistemaTests(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory(prefix='med13 sistema ')
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)

    def participante(self, cmd, out, err):
        self.cmd = cmd
        crudo = shlex.split(re.search(r'RIGE_SISTEMA_CAPTURA=(.*?) && ', cmd)[1])[0]
        config = shlex.split(re.search(r'OPENCODE_CONFIG=(.*?) XDG_DATA_HOME=', cmd)[1])[0]
        self.config = json.loads(Path(config).read_text())
        script = '''
import { pathToFileURL } from 'node:url';
const [plugin, destino, modelo, sistema] = process.argv.slice(1);
process.env.RIGE_SISTEMA_CAPTURA = destino;
const { CapturaSistema } = await import(plugin);
const hook = (await CapturaSistema())['experimental.chat.system.transform'];
const system = Object.freeze([sistema]);
try {
  await hook({sessionID: 'ses_prueba', model: {providerID: modelo.split('/')[0], id: modelo.split('/')[1]}}, {system});
  throw Error('El hook no detuvo la sonda');
} catch (e) {
  if (e.message !== 'RIGE_MED13_SISTEMA_CAPTURADO') throw e;
}
if (system.length !== 1 || system[0] !== sistema) throw Error('System modificado');
'''
        modelo = shlex.split(cmd)[shlex.split(cmd).index('--model') + 1]
        r = subprocess.run([shutil.which('node'), '--input-type=module', '-e', script,
            self.config['plugin'][0], crudo, modelo, self.system], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        # La CLI puede devolver 0 aunque emita type=error por el corte esperado.
        Path(out).write_text('{"type":"error"}\n')
        Path(err).write_text('RIGE_MED13_SISTEMA_CAPTURADO')
        return 0

    def test_2_antes_y_despues_en_ensayo_y_real_sin_proveedor_simulado(self):
        for ensayo in (True, False):
            for momento, system, esperado in [('antes', 'Sin instrucción del proyecto', False),
                                             ('despues', 'Respondé siempre en español', True)]:
                with self.subTest(ensayo=ensayo, momento=momento):
                    self.system = system
                    carpeta = self.root / f'{ensayo}-{momento}'
                    carpeta.mkdir()
                    with patch.object(eco.shutil, 'chown'), patch.object(eco, 'participante', self.participante), \
                            patch.object(eco, 'servidor', side_effect=AssertionError('No depender del servidor simulado')):
                        eco.capturar_sistema(carpeta, 'sub', ensayo=ensayo, modelo='openai/modelo-real')
                    resumen = json.loads((carpeta / 'sistema.json').read_text())
                    self.assertIs(resumen['instruccion_espanol'], esperado)
                    self.assertIs(resumen['inferencia_ejecutada'], False)
                    self.assertEqual(resumen['modelo'], 'simulado/permisos' if ensayo else 'openai/modelo-real')
                    self.assertIn('cd ', self.cmd)
                    self.assertIn('sub', self.cmd)
                    self.assertIn('--title MED13-captura-sistema', self.cmd)
                    self.assertTrue((carpeta / 'sistema-prompt.jsonl').read_text())
                    if not ensayo:
                        self.assertNotIn('provider', self.config)
                        self.assertNotIn('model', self.config)
                        self.assertNotIn('simulado', self.cmd)
                    with self.assertRaisesRegex(ValueError, 'No sobrescribir'):
                        eco.capturar_sistema(carpeta, '', ensayo=ensayo, modelo='openai/modelo-real')

    def test_2_error_cli_sin_hook_es_diagnostico_no_FileNotFoundError_ni_falso_negativo(self):
        def error(cmd, out, err):
            Path(out).write_text('{"type":"error","error":{"name":"UnknownError"}}')
            Path(err).write_text('error de inicialización nativo')
            return 0
        with patch.object(eco.shutil, 'chown'), patch.object(eco, 'participante', error):
            with self.assertRaisesRegex(ValueError, 'revisar sistema.stdout.jsonl y sistema.stderr.txt'):
                eco.capturar_sistema(self.root, '')
        self.assertFalse((self.root / 'sistema.json').exists())
        self.assertTrue((self.root / 'sistema.stderr.txt').exists())

    def test_2_real_no_acepta_modelo_simulado_o_ausente(self):
        for modelo in (None, '', 'simulado/permisos'):
            with self.assertRaisesRegex(ValueError, 'modelo real'):
                eco.capturar_sistema(self.root, '', ensayo=False, modelo=modelo)

    def test_2_almacen_y_credencial_de_sonda_aislados_del_desarrollador_y_evidencia(self):
        home = self.root / 'participante'
        original = home / '.local/share/opencode'
        original.mkdir(parents=True)
        auth = original / 'auth.json'
        auth.write_text('{"openai":{"key":"credencial-no-exportar"}}')
        db = original / 'opencode.db'
        db.write_bytes(b'almacen-original')
        evidencia = self.root / 'evidencia'
        evidencia.mkdir()
        self.system = 'Respondé siempre en español'
        almacenes = []
        def sonda(cmd, out, err):
            datos = Path(shlex.split(re.search(r'XDG_DATA_HOME=(.*?) XDG_STATE_HOME=', cmd)[1])[0])
            almacenes.append(datos)
            self.assertNotEqual(datos, original.parent)
            self.assertEqual((datos / 'opencode/auth.json').read_bytes(), auth.read_bytes())
            (datos / 'opencode/opencode.db').write_bytes(b'sesion-sin-tokens-de-sonda')
            return self.participante(cmd, out, err)
        with patch.object(eco, 'HOME', home), patch.object(eco.shutil, 'chown'), patch.object(eco, 'participante', sonda):
            eco.capturar_sistema(evidencia, '', ensayo=False, modelo='openai/modelo-real')
        self.assertEqual(db.read_bytes(), b'almacen-original')
        self.assertTrue(auth.exists())
        self.assertTrue(all(not p.exists() for p in almacenes))
        self.assertFalse(any(b'credencial-no-exportar' in p.read_bytes() for p in evidencia.iterdir()))

    def test_2_hook_incluido_en_contexto_sin_cambiar_Dockerfile(self):
        root = Path(__file__).resolve().parents[2]
        self.assertIn('!simulado/captura-sistema.mjs', (root / 'vm/.dockerignore').read_text())

    def test_2_timeout_o_prueba_de_otro_modelo_no_acreditan_captura(self):
        for codigo, modelo in [(124, 'simulado/permisos'), (0, 'otro/modelo')]:
            carpeta = self.root / str(codigo)
            carpeta.mkdir()
            def incompleto(cmd, out, err):
                crudo = shlex.split(re.search(r'RIGE_SISTEMA_CAPTURA=(.*?) && ', cmd)[1])[0]
                Path(crudo).write_text(json.dumps(dict(evento='system', sessionID='ses_prueba', modelo=modelo,
                    detencion='RIGE_MED13_SISTEMA_CAPTURADO', system=['Respondé siempre en español'])) + '\n')
                return codigo
            with patch.object(eco.shutil, 'chown'), patch.object(eco, 'participante', incompleto):
                with self.assertRaises(ValueError):
                    eco.capturar_sistema(carpeta, '')
            self.assertFalse((carpeta / 'sistema.json').exists())


class SistemaRegistroTests(unittest.TestCase):
    def test_2_V_9_captura_antes_y_despues_con_modelo_de_tanda_sin_tokens_faltantes(self):
        original = eco.medir
        for ensayo in (True, False):
            llamadas = []
            fixture = registro.RegistroTests()
            self.addCleanup(fixture.doCleanups)
            def medir(compartidas, ejecutar_medida):
                h = type('H', (), compartidas)
                escenario = json.loads((registro.ROOT / 'ecologica/escenarios.json').read_text(encoding='utf-8'))['dimensiones']['ecologica']['V-9']
                eco.guardar(h.BASE / 'escenarios.json', dict(dimensiones={'ecologica': {'V-9': escenario}}))
                sys.argv[sys.argv.index('--hash-escenarios') + 1] = h.sha(h.BASE / 'escenarios.json')
                previo = eco.participante
                def participante(cmd, out, err, *args):
                    if 'RIGE_SISTEMA_CAPTURA=' not in cmd:
                        return previo(cmd, out, err, *args)
                    seleccionado = shlex.split(cmd)[shlex.split(cmd).index('--model') + 1]
                    llamadas.append((Path(out).parent.name, seleccionado))
                    crudo = Path(shlex.split(re.search(r'RIGE_SISTEMA_CAPTURA=(.*?) && ', cmd)[1])[0])
                    datos = Path(shlex.split(re.search(r'XDG_DATA_HOME=(.*?) XDG_STATE_HOME=', cmd)[1])[0])
                    (datos / 'opencode/opencode.db').write_bytes(b'sesion-de-sonda-incompleta')
                    crudo.write_text(json.dumps(dict(evento='system', sessionID='ses_sonda', modelo=seleccionado,
                        detencion='RIGE_MED13_SISTEMA_CAPTURADO', system=['System inicial'])) + '\n')
                    Path(out).write_text('{"type":"error"}\n')
                    Path(err).write_text('corte deliberado')
                    return 0
                with patch.object(eco, 'participante', participante):
                    return original(compartidas, ejecutar_medida)
            with patch.object(eco, 'medir', medir):
                fila, salida, _, _ = fixture.correr(caso='V-9', ensayo=ensayo)
            self.assertEqual(llamadas, [('V-9-1-0.antes', 'simulado/permisos' if ensayo else 'openai/gpt-6.1-sol'),
                                       ('V-9-1-0.despues', 'simulado/permisos' if ensayo else 'openai/gpt-6.1-sol')])
            self.assertFalse(fila['registro_incompleto'])
            self.assertTrue((salida / 'crudo/V-9-1-0.antes/sistema.json').exists())
            self.assertTrue((salida / 'crudo/V-9-1-0.despues/sistema.json').exists())


if __name__ == '__main__':
    unittest.main()
