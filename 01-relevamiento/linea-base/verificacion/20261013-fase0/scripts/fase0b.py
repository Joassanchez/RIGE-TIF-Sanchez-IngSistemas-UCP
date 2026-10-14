# Fase 0 (13/10/2026): sólo caso auxiliar «practica». Corre como root en el contenedor.
# Reutiliza las funciones de /opt/linea-base/medir.sh (extraídas a /tmp/med.py).
import json, os, re, shutil, subprocess, sys, time, importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('med', '/tmp/med.py')
med = importlib.util.module_from_spec(spec); spec.loader.exec_module(med)
BASE, HOME_E = med.BASE, med.HOME_E
OUT = BASE / 'resultados' / 'fase0b'
OUT.mkdir(parents=True)
PREGUNTA = '¿Qué modelo pequeño (`small_model`) usa OpenCode en esta máquina, y qué archivo lo determina?'
resumen = {}
AG = {'charles': '[AUX] Charles'}

def log(k, v):
    resumen[k] = v
    print(f'{k}: {json.dumps(v, ensure_ascii=False)}', flush=True)

# 1. Credencial: misma lógica que medir.sh; nunca se imprime.
cred = os.environ.pop('OPENCODE_AUTH_JSON', None)
auth = json.loads(cred)
assert isinstance(auth, dict) and 'openai' in auth
p = HOME_E / '.local/share/opencode/auth.json'
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(json.dumps(auth)); p.chmod(0o600); shutil.chown(p, 'evaluador', 'evaluador')
shutil.chown(p.parent, 'evaluador', 'evaluador')
del cred, auth
cache = HOME_E / '.cache/opencode'; cache.mkdir(parents=True, exist_ok=True)
shutil.copy('/tmp/models.json', cache / 'models.json')
subprocess.run(['chown', '-R', 'evaluador:evaluador', str(HOME_E / '.cache')], check=True)
os.chdir(HOME_E / 'tarea')

def ev(args, nombre, entorno=None, limite=120):
    code = med.ejecutar(med.como_evaluador(args, entorno), OUT / f'{nombre}.stdout.txt', OUT / f'{nombre}.stderr.txt', limite)
    return code, (OUT / f'{nombre}.stdout.txt').read_text(errors='replace'), (OUT / f'{nombre}.stderr.txt').read_text(errors='replace')

def activar():
    subprocess.run([str(BASE / 'caso.sh'), 'practica'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT, check=True)

def hoja():
    h = (BASE / 'hoja-referencia.md').read_text()
    h = re.sub(r'^## Cómo responder\n.*?(?=^## )', '', h, flags=re.M | re.S)
    h = re.sub(r'^## No disponible durante la sesión\n.*', '', h, flags=re.M | re.S)
    (HOME_E / 'tarea/hoja-referencia.md').write_text(h)

def corrida(nombre, agente, modelo):
    activar()
    med.congelar_ejecutor('principal' if agente == 'build' else 'charles')
    entorno = {'COMO_DEV_DIR': ''}
    ev(['opencode', 'debug', 'agent', AG.get(agente, agente)], f'{nombre}.calentamiento', entorno)
    antes, antes_e = med.hash_escenario(), med.hash_arbol([HOME_E / '.config/opencode'])
    instr = med.INSTRUCCION.format(DIRECTORIO='/home/participante/proyecto/', PREGUNTA=PREGUNTA)
    t = time.monotonic()
    code, out, err = ev(['opencode', 'run', '--model', modelo, '--agent', AG.get(agente, agente), '--format', 'json', instr], nombre, entorno, 600)
    dur = round(time.monotonic() - t, 1)
    despues, despues_e = med.hash_escenario(), med.hash_arbol([HOME_E / '.config/opencode'])
    parsed = med.extraer_eventos(out)
    sid = next((e.get('sessionID') for e in parsed['eventos'] if e.get('sessionID')), None)
    exp = None
    if sid:
        ecode, eout, _ = ev(['opencode', 'export', sid], f'{nombre}.export', entorno)
        exp = ecode
    final = med.observar(parsed['herramientas'])
    log(nombre, dict(codigo=code, duracion_s=dur, sesion=bool(sid), export_codigo=exp,
        solicitudes=parsed['solicitudes'], registro_incompleto=parsed['registro_incompleto'],
        errores_tokens=parsed['errores_tokens'], escenario_alterado=antes != despues, ejecutor_alterado=antes_e != despues_e,
        herramientas=[(h['herramienta'], h['estado'], (h['argumentos'].get('command') or h['argumentos'].get('filePath') or '')[:120]) for h in parsed['herramientas']],
        fuente_observada=final['fuente_observada'], ultimo_json=med_ultimo_json(parsed['respuesta_textual']),
        stderr_cola=err[-600:]))

def med_ultimo_json(texto):
    for m in reversed(list(re.finditer(r'\{[^{}]*"respuesta"[^{}]*\}', texto))):
        try:
            return json.loads(m.group(0))
        except ValueError:
            pass
    return None

hoja()
med.congelar_ejecutor('principal')
c, o, e = ev(['opencode', '--version'], 'version'); log('version', o.strip())
c, o, e = ev(['opencode', 'auth', 'list'], 'auth-list')
log('auth_list', [l for l in (o + e).splitlines() if re.search(r'openai|oauth|credential', l, re.I)])
c, o, e = ev(['opencode', 'models', 'openai'], 'modelos-openai')
log('modelos_gpt6', [l.strip() for l in o.splitlines() if 'gpt-6' in l]); log('n_modelos', len(o.splitlines()))

# 4. Fase 0 principal
corrida('practica-build-sol', 'build', 'openai/gpt-6.1-sol')

# 5. Disponibilidad real de los modelos secundarios (consulta mínima, sin escenario de medición)
for m in ('gpt-6-astra', 'gpt-6-luna'):
    activar(); med.congelar_ejecutor('principal')
    code, out, err = ev(['opencode', 'run', '--model', f'openai/{m}', '--agent', 'build', '--format', 'json', 'Respondé únicamente con la palabra OK, sin usar herramientas.'], f'ping-{m}', {'COMO_DEV_DIR': ''}, 300)
    parsed = med.extraer_eventos(out)
    log(f'ping_{m}', dict(codigo=code, texto=parsed['respuesta_textual'][:80], solicitudes=parsed['solicitudes'], stderr_cola=err[-800:]))

# 6. Charles: configuración efectiva y una corrida sobre practica
activar(); med.congelar_ejecutor('charles')
for args, n in [(['opencode', 'debug', 'config'], 'charles-debug-config'), (['opencode', 'debug', 'agent', '[AUX] Charles'], 'charles-debug-agent'), (['opencode', 'debug', 'skill'], 'charles-debug-skill')]:
    code, _, _ = ev(args, n, {'COMO_DEV_DIR': ''}); log(n, code)
corrida('practica-charles-luna', 'charles', 'openai/gpt-6-luna')
(OUT / 'resumen.json').write_text(json.dumps(resumen, ensure_ascii=False, indent=2))
