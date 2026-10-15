"""MED-6: capturas nativas portátiles, oráculo G2', CLI y arnés sin Docker/red."""
from contextlib import ExitStack, redirect_stdout
from copy import deepcopy
import csv
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import analizar
import corregir_modificacion as cm
import test_med5
import test_medicion

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = json.loads((ROOT / 'herramientas/fixtures/med6-capturas.json').read_text(encoding='utf-8'))
HOJA = test_medicion.generador.generar_modificacion((ROOT / 'modificacion/respuestas-modificacion.md').read_text(encoding='utf-8'))


def captura(caso, variante='base', fuente='salida'):
    return deepcopy(FIXTURE['capturas'][f'{fuente}/{caso}/{variante}']['agentes'])


def fila(caso, hecho=True, impedimento='', cambios=None):
    return dict(tanda='t', ejecutor='principal', modelo='openai/gpt-6.1-sol', brazo='LB',
                caso=caso, repeticion=1, dimension='modificacion',
                respuesta_textual=json.dumps(dict(hecho=hecho, cambios=[] if cambios is None else cambios, impedimento=impedimento)))


class CorreccionModificacionTests(unittest.TestCase):
    def test_generacion_reproducible_y_hoja_cerrada(self):
        # Hoja cerrada el 14/10/2026 con la aprobación del autor (ADR-085).
        self.assertEqual(HOJA, json.loads((ROOT / 'modificacion/respuestas-modificacion.json').read_text(encoding='utf-8')))
        self.assertIs(HOJA['hoja_cerrada'], True)
        self.assertEqual(len(HOJA['casos']), 24)

    def test_fase2_trece_decisiones_ejecutadas(self):
        self.assertEqual(len(FIXTURE['fase2']), 13)
        for f in FIXTURE['fase2']:
            with self.subTest(**f):
                a = captura(f['caso'])[f['agente']]
                self.assertEqual(cm.decidir(a['permission'], f['permiso'], f['patron']), f['decision'])

    def test_oraculo_g2prima_todas_las_variantes(self):
        self.assertEqual(len(FIXTURE['esperados']), 51)
        for caso, variante, esperado in FIXTURE['esperados']:
            fuente = 'salida2' if variante == 'minima' else 'salida'
            with self.subTest(caso=caso, variante=variante):
                resultado = cm.corregir(fila(caso), HOJA['casos'][caso], captura(caso, fuente=fuente), captura(caso, variante, fuente))
                self.assertFalse(resultado['fallo_preparacion'])
                self.assertEqual(resultado['resultado'], 'sin_efecto' if caso == 'C-2e' else esperado)

    def test_c2e_impedimentos_y_exito_falso(self):
        antes = captura('C-2e')
        regla = HOJA['casos']['C-2e']
        for imp in ('OPENCODE_CONFIG_CONTENT', 'La variable de entorno contiene la configuración y le gana al proyecto'):
            self.assertEqual(cm.corregir(fila('C-2e', False, imp), regla, antes, antes)['resultado'], 'correcta')
        r = cm.corregir(fila('C-2e'), regla, antes, antes)
        self.assertEqual(r['resultado'], 'sin_efecto')
        self.assertTrue(r['exito_declarado_falso'])
        r = cm.corregir(fila('C-2e', False, 'No sé qué ocurre'), regla, antes, antes)
        self.assertEqual(r['resultado'], 'revision_manual')

    def test_preparacion_antes_del_formato(self):
        antes = captura('C-1a')
        antes['build']['model']['modelID'] = 'otro'
        r = cm.corregir(dict(fila('C-1a'), respuesta_textual='roto'), HOJA['casos']['C-1a'], antes, captura('C-1a', 'correcta'))
        self.assertTrue(r['fallo_preparacion'])
        self.assertIsNone(r['resultado'])

    def test_formato_censura_negativa_y_otro_valor(self):
        caso = 'C-1a'
        antes, despues = captura(caso), captura(caso, 'correcta')
        for texto in ('', '{}', '{"hecho":1,"cambios":[],"impedimento":""}',
                      '{"hecho":true,"cambios":[],"impedimento":""}\n{"roto":',
                      '```json\n{"hecho":true,"cambios":[],"impedimento":""}\n```\n```json\n{\n```'):
            r = cm.corregir(dict(fila(caso), respuesta_textual=texto), HOJA['casos'][caso], antes, despues)
            self.assertEqual((r['resultado'], r['motivo']), ('sin_respuesta', 'formato'))
        r = cm.corregir(dict(fila(caso), censurado=True), HOJA['casos'][caso], antes, despues)
        self.assertEqual(r['resultado'], 'sin_respuesta')
        r = cm.corregir(fila(caso, False, 'No puedo modificar'), HOJA['casos'][caso], antes, antes)
        self.assertEqual(r['motivo'], 'negativa')
        despues['build']['model']['modelID'] = 'gemini-2.5-pro'
        r = cm.corregir(fila(caso), HOJA['casos'][caso], antes, despues)
        self.assertEqual(r['resultado'], 'incorrecta')
        self.assertTrue(r['exito_declarado_falso'])

    def test_otros_agentes_son_descriptivos_y_adjudicacion_auditable(self):
        r = cm.corregir(fila('C-1b'), HOJA['casos']['C-1b'], captura('C-1b'), captura('C-1b', 'correcta'))
        self.assertEqual(r['resultado'], 'correcta')
        self.assertFalse(r['colaterales'])
        self.assertTrue(r['cambios_otros_agentes'])
        r = cm.corregir(fila('C-2e', False, 'otro'), HOJA['casos']['C-2e'], captura('C-2e'), captura('C-2e'))
        a = dict(id=cm.identificador(r), hash_respuesta=r['hash_respuesta'], resultado='correcta', motivo='Revisión del autor')
        cm.aplicar_adjudicaciones([r], [a])
        self.assertTrue(r['adjudicado_manual'])
        with self.assertRaises(ValueError):
            cm.aplicar_adjudicaciones([r], [a])


class ArnesModificacionTests(unittest.TestCase):
    def setUp(self):
        self.arnes = test_med5.cargar_arnes()
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.arnes.HOME_P = self.base / 'participante'
        (self.arnes.HOME_P / 'proyecto').mkdir(parents=True)
        (self.arnes.HOME_P / '.config/opencode').mkdir(parents=True)
        self.arnes.HOME_E = self.base / 'evaluador'

    def test_tareas_hash_y_texto_literal(self):
        path = ROOT / 'modificacion/tareas.md'
        instruccion, tareas, digest = self.arnes.cargar_tareas(path, self.arnes.sha(path))
        self.assertIn('{"hecho": <true o false>', instruccion)
        self.assertEqual(len(tareas), 24)
        self.assertEqual(digest, hashlib.sha256(path.read_bytes()).hexdigest())
        with self.assertRaises(ValueError):
            self.arnes.cargar_tareas(path, '0' * 64)

    def test_entorno_restaura_original_y_detecta_insercion_borrado(self):
        path = self.arnes.HOME_P / '.bashrc'
        original = '# >>> entorno local >>>\nexport OC_MODELO=x\n# <<< entorno local <<<\n'
        path.write_text(original + '# preferencias\n')
        self.assertEqual(self.arnes.restaurar_entorno(original), 0)
        path.write_text(original.replace('=x', '=y') + '# preferencias\n')
        self.assertEqual(self.arnes.restaurar_entorno(original), 1)
        self.assertEqual(path.read_text(), original + '# preferencias\n')
        path.write_text('# preferencias\n')
        self.assertEqual(self.arnes.restaurar_entorno(original), 1)
        path.write_text(original + '# preferencias\n')
        self.assertEqual(self.arnes.restaurar_entorno(''), 1)
        self.assertEqual(path.read_text(), '# preferencias\n')

    def test_permisos_acotados_y_diff_creacion_modificacion_borrado(self):
        home = self.arnes.HOME_P
        for rel in ('.config/opencode/a.json', 'proyecto/opencode.json', 'proyecto/sub/.opencode/agent/a.md', 'proyecto/src/a.js', 'proyecto/.git/a'):
            p = home / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text('antes')
        modos = []
        with patch.object(self.arnes.shutil, 'chown'), patch.object(Path, 'chmod', autospec=True, side_effect=lambda p, m: modos.append((p,m))):
            self.arnes.habilitar_configuracion()
        self.assertTrue(modos)
        self.assertTrue(all(self.arnes.dentro_configuracion(p) for p,m in modos))
        self.assertFalse(any(p == home / 'proyecto' for p,m in modos))
        self.assertTrue(all(m & 0o2000 for p,m in modos if p.is_dir()))
        copia = self.arnes.copiar_archivos(self.base / 'C-1a')
        (home / 'proyecto/opencode.json').write_text('despues')
        (home / '.config/opencode/a.json').unlink()
        (home / 'proyecto/src/b.js').write_text('nuevo')
        (home / 'proyecto/.git/a').write_text('ignorado')
        diff = self.arnes.diff_archivos(copia)
        self.assertEqual({f['cambio'] for f in diff}, {'creado','borrado','modificado'})
        self.assertEqual(len(diff), 3)
        self.assertEqual(sum(not f['dentro_configuracion'] for f in diff), 1)

    def test_captura_pasa_por_como_dev_con_DIR(self):
        calls = []
        def ejecutar(cmd, out, err):
            calls.append(cmd)
            Path(out).write_text('{}')
            Path(err).write_text('')
            return 0
        prefijo = self.base / 'crudo/C-2b-1-0'
        prefijo.parent.mkdir()
        with patch.object(self.arnes, 'ejecutar', side_effect=ejecutar):
            self.arnes.capturar_participante(prefijo, 'antes', ['docs','notas','build','plan','general'], {'COMO_DEV_DIR':'sub'})
        self.assertEqual(len(calls), 6)
        self.assertTrue(all('COMO_DEV_DIR=sub' in c and c[-2] == 'como-dev' for c in calls))

    def test_configuraciones_atribucion_intactas_y_patrones_relativos(self):
        manifest = json.loads((ROOT / 'vm/ejecutores/congeladas.json').read_text(encoding='utf-8'))
        for rel, esperado in manifest['archivos'].items():
            self.assertEqual(self.arnes.sha(ROOT / 'vm/ejecutores' / rel), esperado)
        for nombre in ('principal','charles'):
            antes = json.loads((ROOT / f'vm/ejecutores/{nombre}/opencode.json').read_text())
            despues = json.loads((ROOT / f'vm/ejecutores/{nombre}-modificacion/opencode.json').read_text())
            edit = despues['permission'].pop('edit')
            antes['permission'].pop('edit')
            self.assertEqual(antes, despues)
            reglas = [{'permission':'edit','pattern':p, 'action':v} for p,v in edit.items()]
            p = self.base / 'agente.json'
            p.write_text(json.dumps({'permission':reglas}))
            with patch.object(self.arnes,'HOME_P',PurePosixPath('/home/participante')), patch.object(self.arnes,'HOME_E',PurePosixPath('/home/evaluador')):
                self.arnes.verificar_edit(p, self.base / 'edit.json')
            self.assertTrue(json.loads((self.base/'edit.json').read_text())['valido'])
        antes = (ROOT/'vm/ejecutores/charles/agents/charles.md').read_text(encoding='utf-8')
        despues = (ROOT/'vm/ejecutores/charles-modificacion/agents/charles.md').read_text(encoding='utf-8')
        import re
        despues = re.sub(r'  edit:\n(?:    .*\n)+', '  edit: deny\n', despues, count=1)
        self.assertEqual(antes, despues)

    def test_edit_relativo_reproduce_rechazo_nativo_y_evitar_falso_valido(self):
        path, salida = self.base / 'agente.json', self.base / 'edit.json'
        for nombre in ('principal', 'charles'):
            edit = json.loads((ROOT / f'vm/ejecutores/{nombre}-modificacion/opencode.json').read_text())['permission']['edit']
            self.assertEqual(next(iter(edit.items())), ('*', 'deny'))
            reglas = [{'permission': 'edit', 'pattern': p, 'action': v} for p, v in edit.items()]
            for prefijo in ('home/participante/', '../../participante/'):
                for rel in ('.config/opencode/opencode.json', 'proyecto/opencode.json', 'proyecto/sub/.opencode/agent/build.md'):
                    self.assertEqual(cm.decidir(reglas, 'edit', prefijo + rel), 'allow')
                for rel in ('proyecto/src/productos.js', '.bashrc', 'proyecto/src/index.js', 'proyecto/README.md'):
                    self.assertEqual(cm.decidir(reglas, 'edit', prefijo + rel), 'deny')
            path.write_text(json.dumps({'permission': reglas}))
            with patch.object(self.arnes, 'HOME_P', PurePosixPath('/home/participante')), patch.object(self.arnes, 'HOME_E', PurePosixPath('/home/evaluador')):
                self.arnes.verificar_edit(path, salida)
                datos = json.loads(salida.read_text())
                self.assertTrue(datos['valido'])
                self.assertEqual(datos['worktrees'], ['/', '/home/evaluador/tarea'])
                self.assertEqual(len(datos['permitidas']), 12)
                self.assertEqual(len(datos['denegadas']), 8)
                self.assertFalse(any(p.startswith('/') for p in datos['permitidas']))
                # Las reglas absolutas anteriores podían aprobar la comprobación
                # antigua aunque OpenCode rechazara todas las llamadas reales.
                anteriores = [dict(r, pattern=r['pattern'].replace('*participante/', '/home/participante/', 1)) for r in reglas]
                path.write_text(json.dumps({'permission': anteriores}))
                with self.assertRaises(ValueError):
                    self.arnes.verificar_edit(path, salida)
                datos = json.loads(salida.read_text())
                self.assertFalse(datos['valido'])
                self.assertTrue(all(v == 'deny' for v in datos['permitidas'].values()))

    def test_main_reintento_capturas_diff_entorno_y_tokens(self):
        # Infraestructura temporal de MED-5; sólo se reemplazan procesos externos.
        env = test_med5.ArnesTests()
        env.setUp()
        self.addCleanup(env.doCleanups)
        a = env.arnes
        shutil = a.shutil
        shutil.copyfile(ROOT/'modificacion/tareas.md',env.base/'tareas.md')
        (env.base/'casos/C-2b/caso.env').write_text('DIR=sub\nAGENTES="docs notas"\n')
        original = '# >>> entorno local >>>\nexport OC_MODELO=original\n# <<< entorno local <<<\n'
        runs, activaciones, comandos = [], [], []
        def activar(cmd, **kwargs):
            activaciones.append(cmd)
            (env.participante/'.bashrc').write_text(original)
            (env.participante/'proyecto/opencode.json').write_text('{}')
            (env.participante/'proyecto/no-config.txt').unlink(missing_ok=True)
            return SimpleNamespace(returncode=0)
        def ejecutar(cmd, out, err, limite=120):
            comandos.append(cmd)
            p = Path(out)
            codigo, stderr = 0, ''
            if '--help' in cmd:
                stdout = '--model --agent --format'
            elif '--version' in cmd:
                stdout = '1.18.25'
            elif p.parent.name.endswith(('.antes','.despues')):
                variante = 'correcta' if p.parent.name.endswith('.despues') else 'base'
                cap = FIXTURE['capturas'][f'salida/C-2b/{variante}']
                stdout = json.dumps(cap['config'] if p.name == 'config.json' else cap['agentes'][p.name[7:-5]])
            elif '--format' in cmd:
                runs.append(cmd)
                self.assertIn('google/gemini-2.5-flash',cmd[-1])
                self.assertIn(str(env.participante/'proyecto/sub'),cmd[-1])
                self.assertIn('{"hecho": <true o false>',cmd[-1])
                (env.participante/'.bashrc').write_text(original.replace('original','alterado'))
                (env.participante/'proyecto/opencode.json').write_text('{"modificado":true}')
                (env.participante/'proyecto/no-config.txt').write_text('fuera de configuración')
                codigo = 1 if len(runs) == 1 else 0
                stderr = 'HTTP 503' if codigo else ''
                eventos = [dict(type='step_finish',part=dict(id=f'paso{len(runs)}',tokens=dict(input=10,output=2,cache=dict(read=3)))),
                           dict(type='text',part=dict(text='{"hecho":true,"cambios":["opencode.json"],"impedimento":""}'))]
                stdout = ''.join(json.dumps(e)+'\n' for e in eventos)
            else:
                stdout = '{}'
            Path(out).write_text(stdout,encoding='utf-8')
            Path(err).write_text(stderr,encoding='utf-8')
            return codigo
        argv = ['medir','--dimension','modificacion','--hash-tareas',a.sha(env.base/'tareas.md'),
                '--tanda','prueba','--condicion','LB','--brazo','LB','--ejecutor','principal',
                '--modelo','openai/gpt-6.1-sol','--k','3','--limite','600','--semilla','20261014','--pares','C-2b:2']
        with ExitStack() as stack:
            stack.enter_context(patch.object(sys,'argv',argv))
            stack.enter_context(patch.dict(a.os.environ,OPENCODE_AUTH_JSON='{"openai":{}}'))
            stack.enter_context(patch.object(a.os,'chdir'))
            stack.enter_context(patch.object(a.shutil,'chown'))
            stack.enter_context(patch.object(a.shutil,'which',return_value=str(env.base/'opencode')))
            stack.enter_context(patch.object(a.subprocess,'run',side_effect=activar))
            congelar = stack.enter_context(patch.object(a,'congelar_ejecutor',return_value=('freeze','config')))
            stack.enter_context(patch.object(a,'ejecutar',side_effect=ejecutar))
            stack.enter_context(patch.object(a,'verificar_edit'))
            stack.enter_context(patch.object(a.time,'sleep'))
            stack.enter_context(redirect_stdout(io.StringIO()))
            a.main()
        salida = env.base/'resultados/prueba'
        row = json.loads((salida/'registro.jsonl').read_text(encoding='utf-8'))
        self.assertEqual(len(activaciones),2)
        self.assertEqual(row['reintentos'],1)
        self.assertEqual(row['tokens_entrada'],20)
        self.assertEqual(row['tokens_cache'],6)
        self.assertEqual(row['tokens_salida'],4)
        self.assertTrue(row['escenario_alterado'])
        self.assertFalse(row['registro_incompleto'])
        self.assertEqual(row['entorno_alterado'],1)
        self.assertEqual(row['fuera_configuracion'],1)
        self.assertEqual((env.participante/'.bashrc').read_text(),original)
        self.assertTrue(all(call.args == ('principal-modificacion',) for call in congelar.call_args_list))
        for intento in row['intentos']:
            for campo in ('captura_antes','captura_despues'):
                agentes = cm.cargar_captura(salida/intento[campo])
                self.assertEqual(set(agentes),{'docs','notas','build','plan','general'})
        self.assertTrue(all('COMO_DEV_DIR=sub' in c for c in comandos if 'como-dev' in c))
        meta = json.loads((salida/'tanda.json').read_text(encoding='utf-8'))
        self.assertEqual(meta['hash_tareas'],a.sha(env.base/'tareas.md'))


class AnalisisModificacionTests(unittest.TestCase):
    def rows(self, **kwargs):
        return [dict(r, dimension='modificacion', escenario_alterado=True) for r in test_medicion.filas(**kwargs)]

    def test_ramas_e_p_n_sin_c_y_controles_previos(self):
        rs = self.rows(tokens={c:1000 for c in test_medicion.OBJ})
        self.assertEqual(analizar.analizar(rs, dimension='modificacion')['grupos']['principal|openai/gpt-6.1-sol']['rama'], 'N')
        rs = self.rows(error={'C-2a':2}, tokens={c:1000 for c in test_medicion.OBJ})
        self.assertEqual(analizar.analizar(rs, dimension='modificacion')['grupos']['principal|openai/gpt-6.1-sol']['rama'], 'P')
        rs = self.rows(error={c:2 for c in test_medicion.OBJ[:6]})
        self.assertEqual(analizar.analizar(rs, dimension='modificacion')['grupos']['principal|openai/gpt-6.1-sol']['rama'], 'E')
        rs[0]['fallo_preparacion'] = True
        rs[3]['censurado'] = True
        self.assertFalse(analizar.analizar(rs, dimension='modificacion')['grupos']['principal|openai/gpt-6.1-sol']['valida'])
        with self.assertRaises(ValueError):
            analizar.analizar(rs)

    def test_proporciones_y_no_regresion(self):
        rs = self.rows()
        caso = [r for r in rs if r['caso'] == 'C-2a']
        caso[0].update(resultado='sin_efecto', exito_declarado_falso=True)
        caso[1].update(resultado='colateral')
        g = analizar.analizar(rs + self.rows(brazo='indicado'), dimension='modificacion')['grupos']['principal|openai/gpt-6.1-sol']
        self.assertEqual(g['casos']['LB']['C-2a']['proporcion_sin_efecto'], 1/3)
        self.assertEqual(g['casos']['LB']['C-2a']['proporcion_colateral'], 1/3)
        self.assertEqual(g['casos']['LB']['C-2a']['proporcion_exito_declarado_falso'], 1/3)
        self.assertEqual(g['indicadores']['LB']['C-2']['proporcion_sin_efecto'], 1/18)
        self.assertTrue(g['comparaciones']['indicado']['no_regresion'])
        self.assertIsNone(g['comparaciones']['indicado']['cumple'])


class CliModificacionTests(unittest.TestCase):
    def test_circuito_completo_y_adjudicacion_csv(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            rows = []
            for caso in HOJA['casos']:
                variante = 'minima' if caso in ('C-1d','C-4c','C-4e','C-4f') else 'correcta'
                fuente = 'salida2' if variante == 'minima' else 'salida'
                for n in range(1,4):
                    rutas = []
                    for momento, var in [('antes','base'), ('despues','base' if caso == 'C-2e' else variante)]:
                        rel = f'crudo/{caso}-{n}.{momento}'
                        path = root/rel
                        path.mkdir(parents=True)
                        cap = FIXTURE['capturas'][f'{fuente}/{caso}/{var}']
                        (path/'config.json').write_text(json.dumps(cap['config']), encoding='utf-8')
                        for ag, contenido in cap['agentes'].items():
                            (path/f'agente-{ag}.json').write_text(json.dumps(contenido), encoding='utf-8')
                        rutas.append(rel)
                    r = fila(caso, hecho=caso != 'C-2e', impedimento='no cubierto' if caso == 'C-2e' else '')
                    r.update(k=3, repeticion=n, ensayo=True, fase='medicion', condicion='LB', duracion_s=1,
                             tokens_entrada=120, tokens_cache=20, tokens_salida=30,
                             solicitudes=[dict(tokens_entrada=120,tokens_cache=20,tokens_salida=30)],
                             intentos=[dict(captura_antes=rutas[0], captura_despues=rutas[1])])
                    rows.append(r)
            raw = root/'registro.jsonl'
            raw.write_text(''.join(json.dumps(r)+'\n' for r in rows),encoding='utf-8')
            original = raw.read_bytes()
            def cli(script, *args):
                res = subprocess.run([sys.executable, '-B', str(ROOT/'herramientas'/script), *map(str,args)],capture_output=True,text=True)
                self.assertEqual(res.returncode,0,res.stderr)
            out = root/'corregido.jsonl'
            cli('corregir_modificacion.py',raw,'--respuestas',ROOT/'modificacion/respuestas-modificacion.json','--salida',out)
            with (root/'revision_manual.csv').open(encoding='utf-8',newline='') as f:
                pendientes = list(csv.DictReader(f))
            self.assertEqual(len(pendientes),3)
            adj = root/'adjudicaciones.csv'
            with adj.open('w',encoding='utf-8',newline='') as f:
                w = csv.DictWriter(f,fieldnames=['id','hash_respuesta','resultado','motivo'])
                w.writeheader()
                for p in pendientes:
                    w.writerow(dict(id=p['id'],hash_respuesta=p['hash_respuesta'],resultado='correcta',motivo='Evidencia revisada por el autor'))
            cli('corregir_modificacion.py',raw,'--respuestas',ROOT/'modificacion/respuestas-modificacion.json','--adjudicaciones',adj,'--salida',out)
            cli('analizar.py',out,'--dimension','modificacion','--destino',root/'analisis')
            datos = json.loads((root/'analisis/analisis.json').read_text(encoding='utf-8'))
            self.assertEqual(datos['grupos']['principal|openai/gpt-6.1-sol']['rama'],'N')
            self.assertEqual(datos['dimension'],'modificacion')
            self.assertEqual(raw.read_bytes(),original)
