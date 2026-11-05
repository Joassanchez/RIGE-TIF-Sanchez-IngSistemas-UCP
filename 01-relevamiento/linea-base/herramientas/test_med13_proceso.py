"""MED-13: verificación observada y costo anidado por estrato."""
import json
from pathlib import Path
import shlex
import unittest

from analizar_ecologica import por_estrato, tabla, markdown_med9
from corregir_ecologica import corregir
from proceso import clasificar_proceso
import test_med9c as fragmentos
from unir import unir


class ProcesoAnidadoTests(unittest.TestCase):
    def test_MED_18b_debug_agent_tool_ejecuta_y_registra_objetivos(self):
        parametros = '{"filePath":"src/productos.js"}'
        argv = ['opencode', 'debug', 'agent', 'build', '--tool', 'read', '--params', parametros]
        comandos = [shlex.join(argv), shlex.join(argv).replace('--tool read', '--tool=read'),
                    r'''como-dev 'python3 -c "import subprocess; subprocess.check_output([\"opencode\",\"debug\",\"agent\",\"build\",\"--tool\",\"read\",\"--params\",\"src/productos.js\"])"' ''',
                    shlex.join(['como-dev', shlex.join(argv)]),
                    shlex.join(['bash', '-c', shlex.join(argv) + ' | cat']),
                    shlex.join(['python3', '-c', 'import subprocess; subprocess.check_output(' + repr(argv) + ')']),
                    shlex.join(['node', '-e', 'require("child_process").execFileSync("opencode", ' + json.dumps(argv[1:]) + ')'])]
        regla = dict(objetivo=['build', 'read', 'src/productos.js', 'allow'],
                     objetivos_adicionales=[['build', 'read', 'otro.js', 'deny']])
        for cmd in comandos:
            with self.subTest(cmd=cmd):
                r = clasificar_proceso(dict(herramientas=[dict(herramienta='bash',
                    argumentos=dict(command=cmd), estado='completed')]), regla)
                self.assertEqual(r['verificacion_final'], 'comportamiento')
                self.assertEqual(len(r['acciones_probadas']), 1)
                self.assertEqual(r['acciones_probadas'][0]['objetivos_identificados'],
                                 [['build', 'read', 'src/productos.js']])

    def test_MED_18b_tool_respeta_estado_y_ultima_edicion(self):
        editar = dict(herramienta='edit', argumentos=dict(filePath='opencode.json'), estado='completed')
        verificar = dict(herramienta='bash', estado='completed', callID='debug',
                         argumentos=dict(command='opencode debug agent build --tool read > /tmp/salida'))
        r = clasificar_proceso(dict(herramientas=[editar, dict(verificar, estado='running'), verificar]), {})
        self.assertEqual(r['verificacion_final'], 'comportamiento')
        self.assertEqual(len(r['acciones_probadas']), 1)
        self.assertEqual(r['acciones_probadas'][0]['indice'], 2)
        self.assertEqual(r['acciones_probadas'][0]['objetivos_identificados'], [])
        r = clasificar_proceso(dict(herramientas=[verificar, editar]), {})
        self.assertEqual(r['verificacion_final'], 'ninguna')
        self.assertEqual(r['acciones_probadas'], [])
        r = clasificar_proceso(dict(herramientas=[dict(verificar, estado='error')]), {})
        self.assertEqual(r['acciones_probadas'], [])

    def test_MED_18b_tool_en_echo_no_es_ejecucion(self):
        for cmd, esperado in [
            ('echo "opencode debug agent build --tool read"', 'ninguna'),
            ("como-dev 'echo opencode debug agent build --tool read'", 'ninguna'),
            ('opencode debug agent build; echo --tool read', 'declarativa'),
            ('opencode debug agent build "--params=--tool read"', 'declarativa'),
            ('opencode debug config --tool read', 'declarativa'),
            ('opencode debug agent build', 'declarativa'),
        ]:
            with self.subTest(cmd=cmd):
                r = clasificar_proceso(dict(herramientas=[dict(herramienta='bash',
                    argumentos=dict(command=cmd), estado='completed')]), {})
                self.assertEqual(r['verificacion_final'], esperado)
                self.assertEqual(r['acciones_probadas'], [])

    def test_MED_18_debug_en_lista_python_es_declarativa(self):
        comandos = [shlex.join(['como-dev', shlex.join([ejecutable, '-c' if ejecutable == 'python3' else '-e', codigo])])
                    for ejecutable, codigo in (
                        ('python3', 'import subprocess; subprocess.check_output(["opencode","debug","agent","build"]); print("src/productos.js")'),
                        ('node', 'require("child_process").execFileSync("opencode", ["debug", "agent", "build"]); console.log("src/productos.js")'),
                    )]
        comandos.append(
            r'''como-dev 'python3 -c "import subprocess; subprocess.check_output([\"opencode\",\"debug\",\"agent\",\"build\"]); print(\"src/productos.js\")"' ''',
        )
        for cmd in comandos:
            with self.subTest(cmd=cmd):
                r = clasificar_proceso(dict(herramientas=[dict(herramienta='bash',
                    argumentos=dict(command=cmd), estado='completed')]),
                    dict(objetivo=['build', 'read', 'src/productos.js', 'allow']))
                self.assertEqual(r['verificacion_final'], 'declarativa')
                self.assertEqual(r['acciones_probadas'], [])

    def test_MED_18_debug_con_tuberia_es_declarativa(self):
        cmd = shlex.join(['como-dev', '"opencode" "debug" "agent" build | cat src/productos.js'])
        r = clasificar_proceso(dict(herramientas=[dict(herramienta='bash',
            argumentos=dict(command=cmd), estado='completed')]),
            dict(objetivo=['build', 'read', 'src/productos.js', 'allow']))
        self.assertEqual(r['verificacion_final'], 'declarativa')
        self.assertEqual(r['acciones_probadas'], [])

    def test_MED_18_debug_subcomandos_y_prioridad_anidada(self):
        for cmd in ("opencode debug --help", "como-dev 'opencode debug config'",
                    "opencode debug agent build | cat", "opencode debug skill",
                    "opencode debug nuevo"):
            with self.subTest(cmd=cmd):
                r = clasificar_proceso(dict(herramientas=[dict(herramienta='bash',
                    argumentos=dict(command=cmd), estado='completed')]), {})
                self.assertEqual(r['verificacion_final'], 'declarativa')
        cmd = '''como-dev 'opencode debug config && opencode run "Leé src/productos.js"' '''
        r = clasificar_proceso(dict(herramientas=[dict(herramienta='bash',
            argumentos=dict(command=cmd), estado='completed')]),
            dict(objetivo=['build', 'read', 'src/productos.js', 'allow']))
        self.assertEqual(r['verificacion_final'], 'comportamiento')
        self.assertEqual(len(r['acciones_probadas']), 1)

    def test_A_5_run_como_dev_posterior_a_ultima_edicion(self):
        editar = dict(herramienta='edit', argumentos=dict(filePath='opencode.json'), estado='completed')
        verificar = dict(herramienta='bash', argumentos=dict(command='como-dev \'opencode run "Leé src/productos.js"\''), estado='completed')
        regla = dict(objetivo=['build', 'read', 'src/productos.js', 'allow'])
        r = clasificar_proceso(dict(herramientas=[editar, verificar]), regla)
        self.assertEqual(r['verificacion_final'], 'comportamiento')
        self.assertEqual(r['acciones_probadas'][0]['objetivos_identificados'], [['build', 'read', 'src/productos.js']])
        running = dict(verificar, callID='run', estado='running')
        completed = dict(verificar, callID='run', argumentos=dict(command='como-dev \'opencode run "Probá read > resultado"\' > /tmp/salida'))
        r = clasificar_proceso(dict(herramientas=[editar, running, completed]), regla)
        self.assertEqual(r['verificacion_final'], 'comportamiento')
        self.assertEqual(len(r['acciones_probadas']), 1)
        self.assertEqual(clasificar_proceso(dict(herramientas=[verificar, editar]), regla)['verificacion_final'], 'ninguna')
        for cmd in ('echo "como-dev opencode run prueba"', 'opencode run prueba', "como-dev 'opencode debug config'"):
            r = clasificar_proceso(dict(herramientas=[editar, dict(verificar, argumentos=dict(command=cmd))]), {})
            self.assertNotEqual(r['verificacion_final'], 'comportamiento', cmd)
        r = clasificar_proceso(dict(herramientas=[editar, dict(verificar, estado='error')]), regla)
        self.assertEqual(r['verificacion_final'], 'ninguna')

    def test_A_6_proporcion_tokens_y_exito_falso_separados_por_estrato(self):
        rows = []
        for caso, tipo, falso, sesiones in [('C-1', 'comportamiento', False, ['ses_1']), ('M-1', 'declarativa', True, [])]:
            rows.append(dict(caso=caso, tokens_entrada=30, tokens_cache=5, tokens_salida=4,
                resultado='correcta' if not falso else 'sin_efecto', exito_declarado_falso=falso,
                proceso=dict(verificacion_final=tipo), sesiones_anidadas=sesiones,
                tokens_anidados=dict(tokens_entrada=20 if sesiones else 0, tokens_cache=3, tokens_salida=2),
                solicitudes_anidadas=[{}] if sesiones else [], modelos_anidados=['openai/gpt-6.1-sol'] if sesiones else []))
        estratos = por_estrato(rows, tabla(rows, 'ecologica'))
        self.assertEqual(estratos['E1']['sesiones_anidadas']['proporcion'], 1)
        self.assertEqual(estratos['E2']['sesiones_anidadas']['proporcion'], 0)
        self.assertEqual(estratos['E1']['sesiones_anidadas']['tokens']['tokens_entrada'], 20)
        self.assertEqual(estratos['E2']['verificacion_y_exito_falso']['declarativa']['exito_declarado_falso'], 0)
        informe = markdown_med9(dict(ensayo=True, nota='sintético', dimension='ecologica', grupos={'fixture': dict(
            valida=False, criterio_ADR093_valido=False, rama_respaldo=None, motivos_invalidez=[],
            tareas={'LB': tabla(rows, 'ecologica')}, estratos={'LB': estratos}, defectos={})}))
        self.assertIn('Sesiones anidadas (proporción, tokens y solicitudes)', informe)
        self.assertIn('comportamiento', informe)
        rows[0]['tokens_anidados']['tokens_entrada'] = None
        self.assertIsNone(por_estrato(rows, tabla(rows, 'ecologica'))['E1']['sesiones_anidadas']['tokens']['tokens_entrada'])

    def test_A_3_corrector_invalida_aprobacion_persistida(self):
        r = corregir(dict(ejecucion_alterada=True, diagnostico_alteracion=['permission persistida']), {}, {}, {}, {})
        self.assertTrue(r['fallo_preparacion'])
        self.assertIsNone(r['resultado'])
        self.assertIn('permission persistida', r['motivo'])

    def test_A_3_union_conserva_evidencia_y_rechaza_otro_plan(self):
        fixture = fragmentos.FragmentosTests()
        fixture.setUp()
        self.addCleanup(fixture.doCleanups)
        paths = [fixture.fragmento(c, [c], dimension='deteccion', cambio=dict(hash_plan_anidado='plan13')) for c in fragmentos.DET]
        for path in paths:
            fila = json.loads(path.read_text())
            fila['intentos'][0]['anidado'] = 'crudo/anidado/intento'
            path.write_text(json.dumps(fila) + '\n')
        rows, _, faltantes = unir(paths)
        self.assertFalse(faltantes)
        self.assertEqual(rows[0]['intentos'][0]['anidado'], str((paths[0].parent / 'crudo/anidado/intento').resolve()))
        meta_path = paths[-1].parent / 'tanda.json'
        meta = json.loads(meta_path.read_text())
        meta['hash_plan_anidado'] = 'otro'
        meta_path.write_text(json.dumps(meta))
        with self.assertRaisesRegex(ValueError, 'planes de verificación anidada'):
            unir(paths)


if __name__ == '__main__':
    unittest.main()
