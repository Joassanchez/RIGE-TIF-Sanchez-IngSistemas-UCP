"""ADR-098, punto 3: temporales, SQLite y exportaciones sintéticas; sin modelos ni Docker."""
from contextlib import closing
import json
import os
from pathlib import Path
import signal
import shutil
import sqlite3
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import ecologica as eco
import test_registro_ecologica as registro


def almacen(root, sid='ses_med13', aprobacion=False):
    root.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(root / 'opencode.db')) as con, con:
        con.execute('CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY)')
        con.execute('INSERT INTO session VALUES (?)', (sid,))
        con.execute('CREATE TABLE IF NOT EXISTS permission (project_id TEXT, data TEXT)')
        if aprobacion:
            con.execute('INSERT INTO permission VALUES (?, ?)', ('proyecto', '[{"action":"allow"}]'))


def exportacion(sid='ses_med13', tokens=True):
    partes = [dict(id='step_' + sid, messageID='msg_' + sid, type='step-finish',
                   tokens=dict(input=20, output=4, cache=dict(read=5, write=0)))] if tokens else []
    return dict(info=dict(id=sid), messages=[dict(info=dict(id='msg_' + sid, role='assistant',
        modelID='gpt-6.1-sol', providerID='openai'), parts=partes)])


class AnidadasTests(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.home = self.root / 'participante'
        self.home.mkdir()
        self.addCleanup(patch.stopall)
        patch.object(eco, 'HOME', self.home).start()
        patch.object(eco, 'PROYECTO', self.home / 'proyecto').start()
        patch.object(sys, 'path', [str(registro.ROOT / 'herramientas'), *sys.path]).start()
        self.h = registro.compartidas()

    def exportar(self, cmd, out, err):
        self.assertIn(eco.BINARIO + ' export ses_', cmd)
        sid = cmd.split()[-1]
        eco.guardar(out, exportacion(sid))
        Path(err).write_text('')
        return 0

    def test_A_1_credencial_catalogo_real_y_ensayo_sin_credencial(self):
        evaluador = self.root / 'evaluador'
        auth = evaluador / '.local/share/opencode/auth.json'
        auth.parent.mkdir(parents=True)
        auth.write_text('{"openai":{"key":"secreto-sintetico"}}')
        (self.root / 'modelos.json').write_text('catalogo congelado')
        h = SimpleNamespace(BASE=self.root, HOME_E=evaluador)
        with patch.object(eco.shutil, 'chown'):
            eco.instalar_desarrollador(h, True)
            self.assertFalse((self.home / '.local').exists())
            eco.instalar_desarrollador(h, False)
        copia = self.home / '.local/share/opencode/auth.json'
        self.assertEqual(copia.read_bytes(), auth.read_bytes())
        self.assertEqual((self.home / '.cache/opencode/models.json').read_bytes(), (self.root / 'modelos.json').read_bytes())
        if os.name == 'posix':
            self.assertEqual(copia.stat().st_mode & 0o777, 0o600)
        with patch.object(eco, '_medir', side_effect=ValueError('fallo sintético')):
            with self.assertRaises(ValueError):
                eco.medir(dict(HOME_E=evaluador))
        self.assertFalse(copia.exists())
        self.assertFalse(auth.exists())

    def test_A_2_limite_y_salida_normal_terminan_grupo(self):
        for timeout in (True, False):
            with self.subTest(timeout=timeout):
                proceso = Mock(pid=123)
                proceso.wait.side_effect = [subprocess.TimeoutExpired('med13', 600), -9] if timeout else [0, 0]
                with patch.object(eco.subprocess, 'Popen', return_value=proceso) as abrir, \
                     patch.object(eco.os, 'killpg', create=True) as matar, \
                     patch.object(eco.signal, 'SIGKILL', 9, create=True):
                    codigo = eco.ejecutar_grupo(['inocuo'], self.root / 'out', self.root / 'err')
                self.assertEqual(codigo, 124 if timeout else 0)
                self.assertTrue(abrir.call_args.kwargs['start_new_session'])
                proceso.wait.assert_any_call(timeout=600)
                matar.assert_called_once_with(123, 9)

    @unittest.skipUnless(shutil.which('bash'), 'Requiere Bash, sin OpenCode')
    def test_A_1_proveedor_ensayo_llega_al_login_no_interactivo(self):
        bashrc = self.home / '.bashrc'
        original = 'case $- in *i*) ;; *) return ;; esac\n'
        bashrc.write_text(original)
        config = self.root / 'proveedor.json'
        with eco.proveedor_desarrollador(config):
            p = subprocess.run([shutil.which('bash'), '-c', '. "$1"; printf "%s" "$OPENCODE_CONFIG"', 'med13', bashrc.as_posix()],
                               capture_output=True, text=True, check=True)
            self.assertEqual(p.stdout, str(config))
        self.assertEqual(bashrc.read_text(), original)

    @unittest.skipUnless(os.name == 'posix', 'Prueba nativa de grupos POSIX')
    def test_A_2_hijo_que_ignora_term_no_sobrevive(self):
        centinela = self.root / 'sobrevivio'
        hijo = 'import os,signal,time,pathlib; os.setsid(); signal.signal(signal.SIGTERM,signal.SIG_IGN); time.sleep(1); pathlib.Path(' + repr(str(centinela)) + ').touch()'
        padre = 'import subprocess,sys,time; subprocess.Popen([sys.executable,"-c",' + repr(hijo) + ']); time.sleep(20)'
        self.assertEqual(eco.ejecutar_grupo([sys.executable, '-c', padre], self.root / 'out', self.root / 'err', .2), 124)
        import time
        time.sleep(1.1)
        self.assertFalse(centinela.exists())

    def test_A_3_evidencia_limpieza_aprobacion_y_omision_sin_ocultar_config(self):
        root = self.home / '.local/share/opencode'
        root.mkdir(parents=True)
        (root / 'auth.json').write_text('secreto')
        (root / 'preparado.txt').write_text('anterior')
        prefijo = self.root / 'intento'
        with patch.object(eco, 'participante', self.exportar), patch.object(eco.subprocess, 'run'):
            with eco.estado_anidado(prefijo, self.root, self.h) as resumen:
                almacen(root, aprobacion=True)
                (root / 'preparado.txt').write_text('cambiado')
        self.assertTrue(resumen['ejecucion_alterada'])
        self.assertIn('permission', resumen['diagnostico_alteracion'][0])
        self.assertFalse((root / 'opencode.db').exists())
        self.assertEqual((root / 'preparado.txt').read_text(), 'anterior')
        evidencia = eco.ruta_anidado(prefijo)
        self.assertTrue((evidencia / 'datos/opencode.db').exists())
        self.assertFalse(list(evidencia.rglob('auth.json')))
        inicio = dict(archivos={}, errores=[])
        antes = dict(archivos={'.config/opencode/opencode.json': 'A'}, errores=[])
        despues = dict(archivos={**antes['archivos'], '.local/share/opencode/opencode.db': 'nuevo'}, errores=[])
        control = eco.control_omision('h', 'h', inicio, inicio, antes, despues, resumen)
        self.assertTrue(control['inventario_home_igual'])
        despues['archivos']['.config/opencode/opencode.json'] = 'B'
        self.assertFalse(eco.control_omision('h', 'h', inicio, inicio, antes, despues, resumen)['inventario_home_igual'])

    def test_A_4_export_tokens_sesiones_modelos_sin_ejecutar_modelo(self):
        root = self.home / '.local/share/opencode'
        almacen(root)
        almacen(root, sid='ses_hija')
        destino = self.root / 'evidencia'
        destino.mkdir()
        with patch.object(eco, 'participante', self.exportar):
            r = eco.extraer_anidados(root, destino, self.h)
        self.assertFalse(r['registro_incompleto'])
        self.assertEqual(r['sesiones_anidadas'], ['ses_hija', 'ses_med13'])
        self.assertEqual(r['modelos_anidados'], ['openai/gpt-6.1-sol'])
        self.assertEqual(sum(s['tokens_entrada'] for s in r['solicitudes_anidadas']), 40)

    def test_A_4_sesion_sin_tokens_es_incompleta(self):
        root = self.home / '.local/share/opencode'
        almacen(root)
        destino = self.root / 'evidencia'
        destino.mkdir()
        def exportar(cmd, out, err):
            eco.guardar(out, exportacion(tokens=False))
            return 0
        with patch.object(eco, 'participante', exportar):
            r = eco.extraer_anidados(root, destino, self.h)
        self.assertTrue(r['registro_incompleto'])
        self.assertEqual(r['sesiones_anidadas'], ['ses_med13'])
        self.assertIn('tokens', r['diagnostico_anidado'][0].lower())
        self.assertEqual(r['modelos_anidados'], ['openai/gpt-6.1-sol'])

    def test_A_4_solicitud_interrumpida_no_se_oculta_detras_de_un_paso_completo(self):
        root = self.home / '.local/share/opencode'
        almacen(root)
        destino = self.root / 'evidencia'
        destino.mkdir()
        def exportar(cmd, out, err):
            obj = exportacion()
            obj['messages'].append(dict(info=dict(id='msg_pendiente', role='assistant', providerID='openai', modelID='gpt-6.1-sol'), parts=[]))
            eco.guardar(out, obj)
            return 0
        with patch.object(eco, 'participante', exportar):
            r = eco.extraer_anidados(root, destino, self.h)
        self.assertTrue(r['registro_incompleto'])
        self.assertEqual(r['sesiones_anidadas'], ['ses_med13'])

    def test_A_4_sesion_reanudada_cuenta_solo_pasos_nuevos(self):
        root = self.home / '.local/share/opencode'
        almacen(root)
        despues = False
        def exportar(cmd, out, err):
            obj = exportacion()
            if despues:
                parte = dict(obj['messages'][0]['parts'][0], id='step_nuevo')
                obj['messages'][0]['parts'].append(parte)
            eco.guardar(out, obj)
            return 0
        with patch.object(eco, 'participante', exportar), patch.object(eco.subprocess, 'run'):
            with eco.estado_anidado(self.root / 'intento', self.root, self.h) as r:
                despues = True
        self.assertFalse(r['registro_incompleto'])
        self.assertEqual([s['id'] for s in r['solicitudes_anidadas']], ['step_nuevo'])
        self.assertEqual(r['sesiones_anidadas'], ['ses_med13'])

    def test_A_4_costos_conservan_modelo_y_no_inventan_tarifa(self):
        tarifas = json.loads((registro.ROOT / 'tarifas-congeladas-20261001.json').read_text(encoding='utf-8'))
        solicitud = dict(tokens_entrada=20, tokens_cache=5, tokens_salida=4)
        propia, _ = eco.costo_solicitudes([solicitud], tarifas, 'openai/gpt-6.1-sol', False)
        anidada, _ = eco.costo_solicitudes([dict(solicitud, modelo='openai/gpt-6-astra')], tarifas, 'openai/gpt-6.1-sol', False)
        total, _ = eco.costo_solicitudes([solicitud, dict(solicitud, modelo='openai/gpt-6-astra')], tarifas, 'openai/gpt-6.1-sol', False)
        self.assertAlmostEqual(total, propia + anidada)
        self.assertGreater(anidada, propia)
        costo, sin_tarifa = eco.costo_solicitudes([dict(solicitud, modelo='otro/modelo')], tarifas, 'openai/gpt-6.1-sol', False)
        self.assertIsNone(costo)
        self.assertEqual(sin_tarifa, ['otro/modelo'])

    def test_A_7_plan_edita_antes_de_verificar_C_1_y_M_1(self):
        plan = json.loads((registro.ROOT / 'vm/simulado/planes/MED-13-anidada.json').read_text(encoding='utf-8'))
        for caso in ('C-1', 'M-1'):
            p = plan['casos'][caso]
            with patch('ensayo.Path.exists', return_value=True), patch('ensayo.Path.read_text', return_value='anterior'):
                provider = eco.EnsayoAnidado(p, self.root / (caso + '.jsonl'))
            self.assertTrue(any(nombre == 'edit' for nombre, _ in provider.llamadas[:-1]))
            self.assertEqual(provider.llamadas[-1], ('bash', {'command': p['verificacion_anidada']}))
            self.assertIn('como-dev', p['verificacion_anidada'])
            mensajes = [dict(role='tool', tool_call_id=f'med9_documentacion_{i}', content='<file>Documento</file>') for i, _ in enumerate(p.get('lecturas', []))]
            mensajes += [dict(role='tool', tool_call_id=f'med6_{i}', content='completado') for i in range(len(provider.llamadas) - 1)]
            respuesta = provider.respuesta(dict(messages=mensajes))
            self.assertEqual(respuesta['tool_calls'][0]['function']['name'], 'bash')
            with self.assertRaises(ValueError):
                provider.verificar_lecturas()
            mensajes.append(dict(role='tool', tool_call_id=f'med6_{len(provider.llamadas)-1}', content='{"sessionID":"ses_med13","type":"step_finish"}'))
            provider.respuesta(dict(messages=mensajes))
            provider.verificar_lecturas()

    def test_A_7_registro_cuenta_anidada_y_oraculo_recibe_estado_limpio(self):
        for caso in ('C-1', 'M-1'):
            r, comprobaciones = self.correr_registro(caso)
            self.assertFalse(r['registro_incompleto'])
            self.assertEqual(r['tokens_entrada'], 30)
            self.assertEqual(r['tokens_propios']['tokens_entrada'], 10)
            self.assertEqual(r['tokens_anidados'], dict(tokens_entrada=20, tokens_cache=5, tokens_salida=4))
            self.assertEqual(len(r['solicitudes_anidadas']), 1)
            self.assertEqual(r['sesiones_anidadas'], ['ses_med13'])
            self.assertEqual(comprobaciones, ['despues'])

    def test_A_4_registro_incompleto_no_inventa_totales(self):
        for sin_almacen in (True, False):
            r, _ = self.correr_registro('M-1', tokens=False, sin_almacen=sin_almacen)
            self.assertTrue(r['registro_incompleto'])
            self.assertIsNone(r['tokens_entrada'])
            self.assertIsNone(r['tokens_anidados']['tokens_entrada'])
            self.assertEqual(r['tokens_propios']['tokens_entrada'], 10)

    def test_A_3_registro_con_aprobacion_es_alterado(self):
        r, comprobaciones = self.correr_registro('M-1', aprobacion=True)
        self.assertTrue(r['ejecucion_alterada'])
        self.assertTrue(r['diagnostico_alteracion'])
        self.assertIsNone(r['tokens_entrada'])
        self.assertEqual(comprobaciones, ['despues'])

    def correr_registro(self, caso, tokens=True, aprobacion=False, sin_almacen=False):
        original = eco.medir
        fixture = registro.RegistroTests()
        self.addCleanup(fixture.doCleanups)
        comprobaciones = []
        def medir(compartidas, ejecutar_medida):
            if '--preparar-base' in sys.argv:
                return original(compartidas, ejecutar_medida)
            participante_original = eco.participante
            oraculo_original = eco.oraculo
            def ejecutar(cmd, out, err, limite):
                codigo = ejecutar_medida(cmd, out, err, limite)
                if not sin_almacen:
                    almacen(eco.HOME / '.local/share/opencode', aprobacion=aprobacion)
                tool = dict(type='tool_use', part=dict(tool='bash', callID='med13', state=dict(status='completed',
                    input=dict(command="como-dev 'opencode run prueba'"), output='sintético')))
                with Path(out).open('a') as f:
                    f.write(json.dumps(tool) + '\n')
                return codigo
            def participante(cmd, out, err):
                if ' export ses_' in cmd:
                    eco.guardar(out, exportacion(tokens=tokens))
                    Path(err).write_text('')
                    return 0
                return participante_original(cmd, out, err)
            def oraculo(prefijo, momento, *args):
                if momento == 'despues':
                    self.assertFalse((eco.HOME / '.local/share/opencode/opencode.db').exists())
                    comprobaciones.append(momento)
                return oraculo_original(prefijo, momento, *args)
            with patch.object(eco, 'participante', participante), patch.object(eco, 'oraculo', oraculo):
                return original(compartidas, ejecutar)
        with patch.object(eco, 'medir', medir):
            r, salida, _, _ = fixture.correr(caso=caso, cambio_escenario=True)
        return r, comprobaciones


if __name__ == '__main__':
    unittest.main()
