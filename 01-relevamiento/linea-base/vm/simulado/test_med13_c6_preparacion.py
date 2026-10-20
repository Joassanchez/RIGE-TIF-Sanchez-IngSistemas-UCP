"""MED-13-c6: preparación, aislamiento y pruebas POSIX sin agentes ni git."""
from copy import deepcopy
from contextlib import contextmanager
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import ecologica as eco
from ensayo import EnsayoModificacion
import test_registro_ecologica as registro

ROOT = Path(__file__).resolve().parents[2]


class PreparacionTests(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.home = self.root / 'participante'
        self.home.mkdir()
        self.proyecto = self.home / 'proyecto'
        self.h = SimpleNamespace(BASE=ROOT / 'vm', PATRON_ENTORNO=r'# >>> entorno local >>>\n.*?# <<< entorno local <<<\n?')
        self.s = dict(archivos={'P/sub/propio.txt': 'desarrollador\n'}, env={}, directorio='sub')
        self.addCleanup(patch.stopall)
        patch.object(eco, 'HOME', self.home).start()
        patch.object(eco, 'PROYECTO', self.proyecto).start()

    def test_a_b_modo_3770_solo_en_raiz_y_cwd_ecologica_deteccion_sin_escritura(self):
        for dimension in ('ecologica', 'deteccion'):
            with self.subTest(dimension=dimension), patch.object(eco.subprocess, 'run') as run:
                eco.preparar(self.s, self.h, dimension=dimension)
            comandos = [c.args[0] for c in run.call_args_list]
            self.assertIn(['chmod', '-R', 'u+rwX,g+rX,o-rwx', str(self.proyecto), str(self.home / '.config/opencode')], comandos)
            extras = [c for c in comandos if c[:2] == ['chmod', '3770']]
            self.assertEqual(extras, [['chmod', '3770', str(p)] for p in (self.proyecto, self.proyecto / 'sub')]
                             if dimension == 'ecologica' else [])
        with patch.object(eco.subprocess, 'run') as run:
            eco.habilitar_creacion('')
        run.assert_called_once_with(['chmod', '3770', str(self.proyecto)], check=True)

    def test_a_directorios_invalidos_no_salen_del_proyecto(self):
        for directorio in ('../fuera', '/etc', 'sub/../../fuera'):
            with self.subTest(directorio=directorio), patch.object(eco.subprocess, 'run') as run:
                with self.assertRaises(ValueError):
                    eco.preparar(self.s | dict(directorio=directorio), self.h)
                run.assert_not_called()

    def test_c_creacion_y_dueno_exigen_oraculo_no_se_ignoran_y_preparar_limpia(self):
        with patch.object(eco.subprocess, 'run'):
            eco.preparar(self.s, self.h)
        antes = eco.capturar_home(self.root / 'intento', 'antes')
        copia = self.root / 'copia'
        shutil.copytree(self.proyecto, copia / 'proyecto')
        (copia / 'global').mkdir()
        (self.proyecto / 'opencode.json').write_text('{"permission":{"read":"deny"}}')
        (self.proyecto / 'AGENTS.md').write_text('Respondé siempre en español\n', encoding='utf-8')
        (self.proyecto / '.opencode').mkdir()
        (self.proyecto / '.opencode/nuevo.json').write_text('{}')
        real = eco.estado_entrada
        def creado(path):
            dato = real(path)
            if path.name in ('opencode.json', 'AGENTS.md', 'nuevo.json'):
                dato.update(uid=2002, gid=2001)  # Dueño evaluador, grupo participante.
            return dato
        with patch.object(eco, 'estado_entrada', creado):
            despues = eco.capturar_home(self.root / 'intento', 'despues')
        self.assertEqual(despues['archivos']['proyecto/AGENTS.md']['uid'], 2002)
        inicio = dict(archivos={}, errores=[])
        control = eco.control_omision('base', 'nuevo', inicio, inicio, antes, despues)
        self.assertFalse(control['inventario_home_igual'])
        with patch.object(eco, 'oraculo', return_value={'ejecutado': True}) as oracle:
            out, omitido, motivos = eco.oraculo_posterior(None, [], '', None, {}, [], 0, control)
        oracle.assert_called_once()
        self.assertIsNone(omitido)
        self.assertIn('inventario_home_igual', motivos)
        self.assertEqual(out, {'ejecutado': True})
        h = registro.compartidas()
        h.HOME_P = self.home
        cambios = eco.cambios_configuracion(h, copia, 'ecologica')
        self.assertTrue(all(c['dentro_configuracion'] for c in cambios))
        final = eco.copiar_configuracion(self.root / 'intento')
        self.assertTrue((final / 'proyecto/AGENTS.md').is_file())
        with patch.object(eco.subprocess, 'run'):
            eco.preparar(self.s, self.h)
        for rel in ('opencode.json', 'AGENTS.md', '.opencode'):
            self.assertFalse((self.proyecto / rel).exists())
        self.assertEqual((self.proyecto / 'sub/propio.txt').read_text(), 'desarrollador\n')

    def test_d_AGENTS_configuracion_solo_en_proyecto_sin_habilitar_fuentes_ni_deteccion(self):
        filas = [dict(archivo=str(p), dentro_configuracion=False) for p in (
            self.proyecto / 'AGENTS.md', self.proyecto / 'sub/AGENTS.md',
            self.proyecto / 'README.md', self.home / 'otra/AGENTS.md', self.proyecto / '../otra/AGENTS.md')]
        h = SimpleNamespace(diff_archivos=lambda _: deepcopy(filas))
        self.assertEqual([f['dentro_configuracion'] for f in eco.cambios_configuracion(h, None, 'ecologica')],
                         [True, True, False, False, False])
        self.assertEqual(eco.cambios_configuracion(h, None, 'deteccion'), filas)

    def test_d_verificar_edit_rechaza_ampliaciones_a_fuentes_y_fuera_del_proyecto(self):
        for dimension in ('ecologica', 'deteccion'):
            permisos = json.loads((ROOT / f'vm/ejecutores/principal-{dimension}/opencode.json').read_text())['permission']
            reglas = [dict(permission=k, pattern=p, action=v) for k, pats in permisos.items()
                      for p, v in (pats.items() if isinstance(pats, dict) else [('*', pats)])]
            eco.verificar_edit(dict(permission=reglas), self.root / 'edit.json', dimension, False)
            for permiso, patron in [('edit', '*'), ('edit', 'src/index.js'), ('edit', '/etc/opencode/opencode.json'),
                                    ('edit', '../otra/.opencode/a.json'), ('external_directory', '/home/participante/compartido/*')]:
                with self.subTest(dimension=dimension, permiso=permiso, patron=patron), self.assertRaises(ValueError):
                    eco.verificar_edit(dict(permission=[*reglas, dict(permission=permiso, pattern=patron, action='allow')]),
                                       self.root / 'edit.json', dimension, False)

    def test_a_plan_N_21_directo_es_el_seleccionado_y_no_pide_como_dev(self):
        plan = eco.cargar_plan_ensayo(ROOT / 'vm', 'ecologica', 'N-21')
        cerrado = json.loads((ROOT / 'ecologica/respuestas-ecologica.json').read_text(encoding='utf-8'))['casos']['N-21']
        self.assertEqual(plan['archivos'], cerrado['variantes']['correcta'])
        self.assertNotIn('crear_como_dev', plan)
        self.proyecto.mkdir()
        provider = EnsayoModificacion(plan, 'ensayo', self.root / 'p.jsonl', self.home)
        self.assertEqual(provider.llamadas, [('write', dict(filePath=str(self.proyecto / 'opencode.json'),
                                                         content=plan['archivos']['P/opencode.json']))])

    def test_a_N_21_medir_usa_variante_directa_y_registra_su_hash(self):
        original = eco.medir
        observadas = []
        fixture = registro.RegistroTests()
        self.addCleanup(fixture.doCleanups)
        @contextmanager
        def servidor(provider):
            if isinstance(provider, eco.EnsayoAnidado):
                observadas.append([nombre for nombre, _ in provider.llamadas])
            yield 12345
        def medir(compartidas, ejecutar_medida):
            path = compartidas['BASE'] / 'simulado/planes/MED-13-c6-directa.json'
            path.parent.mkdir(exist_ok=True)
            shutil.copyfile(ROOT / 'vm/simulado/planes/MED-13-c6-directa.json', path)
            with patch.object(eco, 'servidor', servidor):
                return original(compartidas, ejecutar_medida)
        with patch.object(eco, 'medir', medir):
            row, salida, _, _ = fixture.correr(caso='N-21')
        self.assertEqual(observadas, [['write']])
        self.assertFalse(row['registro_incompleto'])
        meta = json.loads((salida / 'tanda.json').read_text())
        self.assertEqual(meta['hash_plan_directo'], registro.compartidas().sha(ROOT / 'vm/simulado/planes/MED-13-c6-directa.json'))


@unittest.skipUnless(os.name == 'posix' and hasattr(os, 'geteuid') and os.geteuid() == 0,
                     'Requiere Linux/POSIX como root para probar dos UID sin crear cuentas')
class PermisosPosixTests(unittest.TestCase):
    def test_a_opencode_participante_lee_creaciones_del_evaluador_sin_inferencia(self):
        binario = os.environ.get('RIGE_MED13C6_OPENCODE')
        if not binario:
            self.skipTest('Integración nativa opt-in: RIGE_MED13C6_OPENCODE=/usr/local/bin/opencode')
        import pwd
        p, e = pwd.getpwnam('participante'), pwd.getpwnam('evaluador')
        with tempfile.TemporaryDirectory(prefix='med13-c6-opencode-') as tmp:
            root = Path(tmp)
            root.chmod(0o755)
            home = root / 'home'
            proyecto = home / 'proyecto'
            for path in (home, proyecto, root / 'config', root / 'datos', root / 'estado'):
                path.mkdir(mode=0o750)
                os.chown(path, p.pw_uid, p.pw_gid)
            def ejecutar(usuario, argv, **kwargs):
                def identidad():
                    os.setgroups([p.pw_gid, usuario.pw_gid])
                    os.setgid(usuario.pw_gid)
                    os.setuid(usuario.pw_uid)
                    os.umask(0o022)
                env = os.environ | dict(HOME=p.pw_dir, XDG_CONFIG_HOME=str(root / 'config'),
                    XDG_DATA_HOME=str(root / 'datos'), XDG_STATE_HOME=str(root / 'estado'),
                    OPENCODE_DISABLE_AUTOUPDATE='1', OPENCODE_DISABLE_MODELS_FETCH='1')
                env.pop('OPENCODE_DISABLE_PROJECT_CONFIG', None)
                env.pop('OPENCODE_CONFIG', None)
                env.pop('OPENCODE_CONFIG_CONTENT', None)
                return subprocess.run(argv, preexec_fn=identidad, cwd=proyecto, env=env, **kwargs)
            with patch.object(eco, 'PROYECTO', proyecto):
                eco.habilitar_creacion('')
            ejecutar(e, [sys.executable, '-c', '''from pathlib import Path
Path('opencode.json').write_text('{"permission":{"bash":{"ls":"deny"}}}')
Path('AGENTS.md').write_text('Respondé siempre en español\\nMED13C6_AGENTS_DIRECTO\\n')
Path('.opencode').mkdir()
Path('.opencode/opencode.json').write_text('{"permission":{"webfetch":"ask"}}')
'''], check=True)
            config = ejecutar(p, [binario, 'debug', 'config'], capture_output=True, text=True, check=True)
            permisos = json.loads(config.stdout)['permission']
            self.assertEqual(permisos['bash']['ls'], 'deny')
            self.assertEqual(permisos['webfetch'], 'ask')
            evidencia = root / 'evidencia'
            evidencia.mkdir()
            def participante(cmd, out, err):
                with Path(out).open('wb') as stdout, Path(err).open('wb') as stderr:
                    return ejecutar(p, ['/bin/bash', '-c', cmd], stdout=stdout, stderr=stderr, timeout=120).returncode
            with patch.object(eco, 'PROYECTO', proyecto), patch.object(eco, 'HOME', home), \
                    patch.object(eco, 'BINARIO', binario), patch.object(eco, 'participante', participante):
                eco.capturar_sistema(evidencia, '')
            self.assertTrue(json.loads((evidencia / 'sistema.json').read_text())['instruccion_espanol'])
            self.assertIn('MED13C6_AGENTS_DIRECTO', (evidencia / 'sistema-prompt.jsonl').read_text())

    def test_a_b_c_kernel_creacion_lectura_sticky_grupo_y_limpieza(self):
        # Sin cuentas persistentes, Docker, OpenCode, modelos ni git. Dos UID
        # efímeros comprueban la protección del kernel, no un modelo de chmod.
        participante, evaluador, grupo = 61001, 61002, 61001
        with tempfile.TemporaryDirectory(prefix='med13-c6-') as tmp:
            root = Path(tmp)
            root.chmod(0o755)
            home = root / 'home'
            home.mkdir(mode=0o750)
            os.chown(home, participante, grupo)
            proyecto = home / 'proyecto'
            for path in (proyecto, proyecto / 'sub'):
                path.mkdir(mode=0o750)
                os.chown(path, participante, grupo)
                archivo = path / 'propio.txt'
                archivo.write_text('desarrollador')
                os.chown(archivo, participante, grupo)
                archivo.chmod(0o640)
            def usuario(uid, script):
                def identidad():
                    os.setgroups([grupo])
                    os.setgid(grupo if uid == participante else evaluador)
                    os.setuid(uid)
                    os.umask(0o022)
                return subprocess.run([sys.executable, '-c', script, str(proyecto)], preexec_fn=identidad,
                                      capture_output=True, text=True, check=True)
            with patch.object(eco, 'PROYECTO', proyecto):
                eco.habilitar_creacion('sub')
            for p in (proyecto, proyecto / 'sub'):
                self.assertEqual(stat.S_IMODE(p.stat().st_mode), 0o3770)
            usuario(evaluador, '''import pathlib,sys
p=pathlib.Path(sys.argv[1])
for root in (p,p/'sub'):
 (root/'opencode.json').write_text('{}')
 (root/'AGENTS.md').write_text('instruccion')
 (root/'.opencode').mkdir()
 (root/'.opencode/opencode.json').write_text('{}')
 for operacion in (lambda:(root/'propio.txt').unlink(), lambda:(root/'propio.txt').rename(root/'renombrado.txt'),
                   lambda:(root/'opencode.json').replace(root/'propio.txt')):
  try: operacion()
  except PermissionError: pass
  else: raise AssertionError('Sticky no protege archivo del desarrollador')
''')
            for cwd in (proyecto, proyecto / 'sub'):
                for rel in ('opencode.json', 'AGENTS.md', '.opencode', '.opencode/opencode.json'):
                    p = cwd / rel
                    self.assertEqual(p.stat().st_uid, evaluador)
                    self.assertEqual(p.stat().st_gid, grupo)
            usuario(participante, '''import pathlib,sys
p=pathlib.Path(sys.argv[1])
for root in (p,p/'sub'):
 for rel in ('opencode.json','AGENTS.md','.opencode/opencode.json'):
  assert (root/rel).read_text()
 assert (root/'propio.txt').read_text()=='desarrollador'
''')
            # La preparación corre como root y debe poder eliminar también lo
            # que pertenece al evaluador, sin quitar sticky durante la tarea.
            with patch.object(eco, 'HOME', home), patch.object(eco, 'PROYECTO', proyecto), patch.object(eco.subprocess, 'run'):
                eco.preparar(dict(archivos={}, env={}, directorio=''), SimpleNamespace(BASE=ROOT / 'vm', PATRON_ENTORNO='^$'))
            self.assertFalse((proyecto / 'opencode.json').exists())
            self.assertFalse((proyecto / 'sub').exists())


if __name__ == '__main__':
    unittest.main()
