"""Planes MED-9 por herramientas y señales del oráculo, sin sockets ni Docker."""
from copy import deepcopy
from contextlib import contextmanager
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import ecologica as arnes
from ensayo import Ensayo, EnsayoModificacion
from evidencia import ASK, DENY, clasificar, jsonl
from proveedor import Proveedor

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'herramientas'))
import corregir_ecologica as eco
import corregir_deteccion as det

spec = importlib.util.spec_from_file_location('gen_eco_simulado', ROOT / 'herramientas/generar-ecologica.py')
generador = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generador)
PUBLICO, HOJA, CORPUS = generador.generar(ROOT / 'ecologica')


def captura(tid, variante):
    if tid.startswith(('N-', 'S-')) or HOJA['casos'][tid].get('candidato'):
        from test_med11_fixtures import captura_sintetica
        return captura_sintetica(tid, variante)
    carpeta = ROOT / 'verificacion/20261014-tareas-ecologica/salida' / tid / variante
    return {p.stem[7:]: json.loads(p.read_text(encoding='utf-8')) for p in carpeta.glob('agente-*.json')}


def oracle_sintetico(regla, antes, despues):
    if 'objetivo' not in regla:
        return {}
    return {m: {eco.clave(s): {'decision': eco.decidir(a[s[0]]['permission'], eco.permiso_sonda(s), s[2])}
                for s in [*eco.objetivos(regla), *regla['guardas']]}
            for m, a in [('antes', antes), ('despues', despues)]}


class PlanesTests(unittest.TestCase):
    def test_bateria_cubre_todas_las_comprobaciones_sin_hoja_en_imagen(self):
        for tid, regla in HOJA['casos'].items():
            if 'objetivo' not in regla:
                continue
            s = PUBLICO['dimensiones']['ecologica'][tid]
            bateria = arnes.bateria(arnes.agentes_escenario(s), s['tarea'], exploracion=tid.startswith(('N-', 'S-')))
            for sonda in [*(s[:3] for s in eco.objetivos(regla)), *regla['guardas']]:
                self.assertIn(tuple(sonda), bateria, (tid, sonda))
        source = (ROOT / 'vm/simulado/ecologica.py').read_text(encoding='utf-8')
        self.assertNotIn("import espec", source)
        self.assertNotIn("import corpus", source)

    def test_planes_piden_ediciones_y_producen_cinco_clases(self):
        planes = json.loads((ROOT / 'vm/simulado/ecologica.json').read_text(encoding='utf-8'))
        resultados = set()
        with tempfile.TemporaryDirectory() as tmp:
            for tid, plan in planes['casos'].items():
                with self.subTest(tarea=tid):
                    home = Path(tmp) / tid
                    escenario = PUBLICO['dimensiones']['ecologica'][tid]
                    shutil.copytree(ROOT / 'vm/casos/comun/proyecto', home / 'proyecto')
                    (home / '.config/opencode').mkdir(parents=True)
                    roots = {'G': home / '.config/opencode', 'P': home / 'proyecto', 'H': home}
                    for rel, texto in escenario['archivos'].items():
                        path = roots[rel[0]] / rel[2:]
                        path.parent.mkdir(parents=True, exist_ok=True)
                        if isinstance(texto, dict):
                            # Materialización artificial para probar el proveedor en Windows.
                            texto = (path.parent / texto['enlace']).read_text(encoding='utf-8')
                        path.write_text(texto, encoding='utf-8')
                    for rel in plan['archivos']:
                        # La raíz del proyecto no recibe escritura de grupo.
                        # Los planes deben editar archivos existentes o el global.
                        self.assertTrue(rel.startswith('G/') or (roots[rel[0]] / rel[2:]).exists())
                    previos = {p: p.read_bytes() for p in home.rglob('*') if p.is_file()}
                    proveedor = EnsayoModificacion(plan, 'ensayo', home / 'proveedor.jsonl', home)
                    self.assertEqual(previos, {p: p.read_bytes() for p in previos})
                    cuerpo = dict(messages=[dict(role='user', content='tarea')], tools=[])
                    for _ in range(20):
                        respuesta = proveedor.respuesta(cuerpo)
                        if 'tool_calls' not in respuesta:
                            break
                        tool = respuesta['tool_calls'][0]
                        fn = tool['function']
                        args = json.loads(fn['arguments'])
                        path = Path(args['filePath'])
                        self.assertTrue(path.is_relative_to(home) or str(path).replace('\\', '/') in plan.get('lecturas', []))
                        self.assertIn(fn['name'], ('read', 'edit'))
                        if fn['name'] == 'read':
                            contenido = '<file>Documentación sintética</file>' if str(path).replace('\\', '/') in plan.get('lecturas', []) else path.read_text(encoding='utf-8')
                        else:
                            self.assertEqual(path.read_text(encoding='utf-8') if path.exists() else '', args['oldString'])
                            path.parent.mkdir(parents=True, exist_ok=True)
                            path.write_text(args['newString'], encoding='utf-8')
                            contenido = 'Edit applied successfully.'
                        cuerpo['messages'].extend([respuesta, dict(role='tool', tool_call_id=tool['id'], content=contenido)])
                    else:
                        self.fail('Proveedor no finalizó.')
                    for rel, nuevo in plan['archivos'].items():
                        self.assertEqual((roots[rel[0]] / rel[2:]).read_text(encoding='utf-8'), nuevo)
                    antes = captura(tid, 'base')
                    despues = captura(tid, 'correcta')
                    if tid in ('M-3', 'M-5'):
                        despues = deepcopy(antes)
                    if tid in ('M-2', 'M-4'):
                        despues = deepcopy(antes)
                        permiso, accion = ('edit', 'allow') if tid == 'M-2' else ('bash', 'ask')
                        for r in despues['build']['permission']:
                            if r['permission'] == permiso:
                                r['action'] = accion
                    regla = HOJA['casos'][tid]
                    r = eco.corregir(dict(respuesta_textual=respuesta['content']), regla, antes, despues, oracle_sintetico(regla, antes, despues))
                    resultados.add(r['resultado'])
                    self.assertEqual(r['discrepancia_oraculo'], [])
        self.assertEqual(resultados, {'correcta', 'colateral', 'sin_efecto', 'incorrecta', 'sin_respuesta'})

    def test_deteccion_simulada(self):
        planes = json.loads((ROOT / 'vm/simulado/deteccion.json').read_text(encoding='utf-8'))
        out = []
        with tempfile.TemporaryDirectory() as tmp:
            for tid, plan in planes['casos'].items():
                provider = Ensayo(plan, 'ensayo', Path(tmp) / 'p.jsonl')
                cuerpo = {'messages': []}
                while True:
                    respuesta = provider.respuesta(cuerpo)
                    if 'tool_calls' not in respuesta:
                        break
                    tool = respuesta['tool_calls'][0]
                    cuerpo['messages'].extend([respuesta, dict(role='tool', tool_call_id=tool['id'], content='<file>Documentación sintética</file>')])
                provider.verificar_lecturas()
                mensaje = respuesta['content']
                out.append(det.corregir(dict(respuesta_textual=mensaje), CORPUS['casos'][tid]['items']))
        self.assertTrue(any(r['detectados'] for r in out))
        self.assertTrue(any(r['falsos_positivos'] for r in out))
        self.assertTrue(any(r['otras'] for r in out))
        self.assertTrue(any(r['resultado'] == 'sin_respuesta' for r in out))

    def test_pares_semilla_y_restricciones_relativas(self):
        casos = ['M-1', 'M-2']
        self.assertEqual(arnes.pares(casos, 3, 7, None), arnes.pares(casos, 3, 7, None))
        self.assertEqual(arnes.pares(casos, 3, 7, 'M-2:2,M-1:1'), [('M-2', 2), ('M-1', 1)])
        with self.assertRaises(ValueError):
            arnes.pares(casos, 3, 7, 'M-1:1,M-1:1')
        with tempfile.TemporaryDirectory() as tmp:
            for dim in ('ecologica', 'deteccion'):
                cfg = json.loads((ROOT / f'vm/ejecutores/principal-{dim}/opencode.json').read_text())
                reglas = []
                for perm, pats in cfg['permission'].items():
                    for pat, action in (pats.items() if isinstance(pats, dict) else [('*', pats)]):
                        reglas.append(dict(permission=perm, pattern=pat, action=action))
                arnes.verificar_edit(dict(permission=reglas), Path(tmp) / 'edit.json', dim, False)
                self.assertTrue(json.loads((Path(tmp) / 'edit.json').read_text())['valido'])

    def test_oraculo_distingue_ask_deny_y_no_acredita_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for permiso, sujeto in [('read', 'src/index.js'), ('edit', 'src/index.js'), ('bash', 'npm test'),
                                     ('external_directory', str(root / 'compartido/*')), ('webfetch', 'https://example.com')]:
                with patch.object(arnes, 'PROYECTO', root / 'proyecto'):
                    arnes.preparar_archivos_sondas([('build', permiso, sujeto)])
                    plan, archivo, original = arnes.plan_sonda(('build', permiso, sujeto))
                    for texto, esperada in [(ASK, 'ask'), (DENY, 'deny'), ('Error: transporte', 'indeterminado')]:
                        log = root / 'p.jsonl'
                        log.unlink(missing_ok=True)
                        provider = Proveedor(plan, 'sonda', log)
                        cuerpo = dict(messages=[dict(role='user', content='MED4A_ROOT')], tools=[])
                        while True:
                            mensaje = provider.respuesta(cuerpo)
                            if 'tool_calls' not in mensaje:
                                break
                            tool = mensaje['tool_calls'][0]
                            cuerpo['tools'] = [dict(function=dict(name=tool['function']['name']))]
                            cuerpo['messages'].extend([mensaje, dict(role='tool', tool_call_id=tool['id'], content=texto)])
                        # Oferta correcta de cada solicitud, incluida la primera.
                        registros = jsonl(log)
                        for r in registros:
                            if r['evento'] == 'solicitud':
                                r['toolsOffered'] = ['read', 'edit', 'bash', 'webfetch']
                        resultado = clasificar(plan, 'sonda', registros, [], root / 'proyecto', 0)
                        self.assertEqual(resultado['decision'], esperada, (permiso, texto))


class RegresionOraculoTests(unittest.TestCase):
    def test_git_interno_resuelve_raiz_real_y_solo_push_se_simula(self):
        # Reproduce SystemPrompt.environment sin OpenCode/Docker: rev-parse y
        # realPath sobre el repositorio existente, sin inicializar ni modificar git.
        bash = shutil.which('bash')
        self.assertIsNotNone(bash)
        real = subprocess.run([bash, '-c', 'command -v git'], capture_output=True, text=True, check=True).stdout.strip()
        with tempfile.TemporaryDirectory(prefix='med9 git ') as tmp:
            binpath = Path(tmp) / 'bin'
            arnes.instalar_stubs(binpath, git_real=real)
            self.assertFalse((binpath / 'ls').exists())
            preambulo = '''bin=$1; repo=$2; shift 2
if command -v cygpath >/dev/null; then bin=$(cygpath -u "$bin"); repo=$(cygpath -u "$repo"); fi
'''
            def ejecutar(args, stub):
                script = preambulo + ('export PATH="$bin:$PATH"\n' if stub else '') + 'git --no-optional-locks -C "$repo" "$@"'
                return subprocess.run([bash, '-c', script, 'med9', str(binpath), str(ROOT), *args], capture_output=True, text=True, check=True).stdout
            raiz = ejecutar(['rev-parse', '--show-toplevel'], True).strip()
            self.assertNotIn('MED9_BASH', raiz)
            self.assertTrue(Path(raiz).resolve(strict=True).is_dir())
            self.assertEqual(raiz, ejecutar(['rev-parse', '--show-toplevel'], False).strip())
            args = ['status', '--porcelain=v1', '--untracked-files=no']
            self.assertEqual(ejecutar(args, True), ejecutar(args, False))
            # push es el único subcomando interceptado (va sin opciones previas).
            script = preambulo + 'export PATH="$bin:$PATH"\ngit push --sin-red origin main'
            salida = subprocess.run([bash, '-c', script, 'med9', str(binpath), str(ROOT)], capture_output=True, text=True, check=True).stdout
            self.assertEqual(salida, 'MED9_BASH\n')
            linux = Path(tmp) / 'linux'
            arnes.instalar_stubs(linux)
            self.assertIn('exec /usr/bin/git "$@"', (linux / 'git').read_text())

    def test_bash_sin_token_completado_rechazado_o_incompleto(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            plan, _, _ = arnes.plan_sonda(('build', 'bash', 'git status'))
            provider = Proveedor(plan, 'sonda', root / 'proveedor.jsonl')
            respuesta = provider.respuesta(dict(messages=[dict(role='user', content='MED4A_ROOT')], tools=[dict(function=dict(name='bash'))]))
            callid = respuesta['tool_calls'][0]['id']
            registros = jsonl(root / 'proveedor.jsonl')
            for estado, texto, decision in [('completed', 'On branch main\nnothing to commit', 'allow'),
                    ('completed', '', 'allow'), ('error', ASK, 'ask'), ('error', DENY, 'deny'),
                    ('completed', ASK, 'ask'), ('completed', DENY, 'deny'),
                    ('error', 'Error: subprocess unavailable', 'indeterminado'),
                    ('running', 'MED9_BASH', 'indeterminado')]:
                with self.subTest(estado=estado, texto=texto):
                    eventos = [dict(type='tool_use', part=dict(callID=callid, state=dict(status=estado, output=texto)))]
                    r = clasificar(plan, 'sonda', registros, eventos, root, 0)
                    self.assertEqual(r['decision'], decision)
                    for codigo in (1, 124):
                        self.assertEqual(clasificar(plan, 'sonda', registros, eventos, root, codigo)['decision'], 'indeterminado')
            completado = [dict(type='tool_use', part=dict(callID=callid, state=dict(status='completed', output='On branch main')))]
            historico = deepcopy(plan)
            historico['acciones'][0]['efecto'] = dict(tipo='salida', token='MED9_BASH')
            self.assertEqual(clasificar(historico, 'sonda', registros, completado, root, 0)['decision'], 'indeterminado')
            completado[0]['part']['callID'] = 'otra-llamada'
            self.assertEqual(clasificar(plan, 'sonda', registros, completado, root, 0)['decision'], 'indeterminado')
            # El retorno al proveedor acredita la finalización aun sin evento CLI.
            cuerpo = dict(messages=[dict(role='user', content='MED4A_ROOT'), respuesta,
                dict(role='tool', tool_call_id=callid, content='On branch main')], tools=[])
            provider.respuesta(cuerpo)
            self.assertEqual(clasificar(plan, 'sonda', jsonl(root / 'proveedor.jsonl'), [], root, 0)['decision'], 'allow')

    def test_general_bash_sin_token_requiere_retorno_de_la_cadena(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            plan, _, _ = arnes.plan_sonda(('general', 'bash', 'git status'))
            provider = Proveedor(plan, 'sonda', root / 'proveedor.jsonl')
            padre = dict(messages=[dict(role='user', content='MED4A_ROOT')], tools=[dict(function=dict(name='task'))])
            task = provider.respuesta(padre)
            hijo = dict(messages=[dict(role='user', content='MED4A_CHILD')], tools=[dict(function=dict(name='bash'))])
            bash = provider.respuesta(hijo)
            hijo['messages'].extend([bash, dict(role='tool', tool_call_id=bash['tool_calls'][0]['id'], content='On branch main')])
            provider.respuesta(hijo)
            self.assertEqual(clasificar(plan, 'sonda', jsonl(root / 'proveedor.jsonl'), [], root, 0)['decision'], 'indeterminado')
            padre['messages'].extend([task, dict(role='tool', tool_call_id=task['tool_calls'][0]['id'], content='MED4A_FIN')])
            provider.respuesta(padre)
            self.assertEqual(clasificar(plan, 'sonda', jsonl(root / 'proveedor.jsonl'), [], root, 0)['decision'], 'allow')

    def test_sujetos_estables_y_contenido_restaurado_incluso_si_falla(self):
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp) / 'participante'
            proyecto = home / 'proyecto'
            (proyecto / 'src').mkdir(parents=True)
            (proyecto / 'src/index.js').write_bytes(b'const original = 1;\n')
            sondas = [('build', 'read', 'src/index.js'), ('build', 'read', 'config/.env'),
                      ('build', 'edit', 'src/index.js'), ('build', 'external_directory', (home / 'compartido/*').as_posix())]
            prefijo = Path(tmp) / 'evidencia/crudo/M-3-1-0'
            prefijo.parent.mkdir(parents=True)
            def inventario():
                return {p.relative_to(home): p.read_bytes() if p.is_file() else None for p in home.rglob('*')}
            @contextmanager
            def servidor_local(provider):
                yield 12345  # Sin abrir sockets ni ejecutar OpenCode.
            with patch.object(arnes, 'PROYECTO', proyecto):
                arnes.preparar_archivos_sondas(sondas)
                original = inventario()
                arnes.preparar_archivos_sondas(sondas)
                self.assertEqual(inventario(), original)
                def participante_local(cmd, salida, error):
                    self.assertEqual(set(inventario()), set(original))
                    salida, error = Path(salida), Path(error)
                    error.write_text('')
                    if 'debug agent' in cmd:
                        salida.write_text(json.dumps(dict(permission=[])))
                        return 0
                    plan = json.loads((salida.parent / 'plan.json').read_text())
                    provider = Proveedor(plan, 'sonda', salida.parent / 'proveedor.jsonl')
                    cuerpo = dict(messages=[dict(role='user', content='MED4A_ROOT')],
                                  tools=[dict(function=dict(name=n)) for n in ('read', 'edit')])
                    eventos = []
                    while True:
                        mensaje = provider.respuesta(cuerpo)
                        if 'tool_calls' not in mensaje:
                            break
                        tool = mensaje['tool_calls'][0]
                        args = json.loads(tool['function']['arguments'])
                        archivo = Path(args['filePath'])
                        if tool['function']['name'] == 'read':
                            texto = archivo.read_text()
                        else:
                            archivo.write_text(args['newString'])
                            texto = 'Edit applied successfully.'
                        eventos.append(dict(type='tool_use', part=dict(callID=tool['id'], state=dict(status='completed', output=texto))))
                        cuerpo['messages'].extend([mensaje, dict(role='tool', tool_call_id=tool['id'], content=texto)])
                    salida.write_text(''.join(json.dumps(e) + '\n' for e in eventos))
                    return 0
                with patch.object(arnes, 'servidor', servidor_local), patch.object(arnes, 'participante', participante_local), patch.object(arnes.subprocess, 'run'):
                    for momento in ('antes', 'despues'):
                        resultados = arnes.oraculo(prefijo, momento, sondas, '', None)
                        self.assertTrue(all(r['decision'] == 'allow' for r in resultados.values()))
                        self.assertEqual(inventario(), original)
                    with patch.object(arnes, 'participante', side_effect=RuntimeError('Fallo de arranque')):
                        with self.assertRaisesRegex(RuntimeError, 'Fallo de arranque'):
                            arnes.oraculo(prefijo, 'fallido', sondas, '', None)
                    self.assertEqual(inventario(), original)


if __name__ == '__main__':
    unittest.main()
