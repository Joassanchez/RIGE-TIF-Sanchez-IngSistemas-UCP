# Fase 0, tercera pasada: causa del error de astra/luna y alteración del escenario.
import json, os, re, shutil, subprocess, hashlib, importlib.util
from pathlib import Path
spec = importlib.util.spec_from_file_location('med', '/tmp/med.py')
med = importlib.util.module_from_spec(spec); spec.loader.exec_module(med)
BASE, HOME_E, HOME_P = med.BASE, med.HOME_E, med.HOME_P
OUT = BASE / 'resultados' / 'fase0c'; OUT.mkdir(parents=True)
cred = os.environ.pop('OPENCODE_AUTH_JSON'); auth = json.loads(cred)
p = HOME_E / '.local/share/opencode/auth.json'; p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(json.dumps(auth)); p.chmod(0o600)
del cred, auth
cache = HOME_E / '.cache/opencode'; cache.mkdir(parents=True, exist_ok=True)
shutil.copy('/tmp/models.json', cache / 'models.json')
subprocess.run(['chown', '-R', 'evaluador:evaluador', str(HOME_E / '.cache'), str(HOME_E / '.local')], check=True)
os.chdir(HOME_E / 'tarea')

def arbol():
    res = {}
    for root in (HOME_P / 'proyecto', HOME_P / '.config/opencode'):
        for f in sorted(root.rglob('*')) if root.exists() else []:
            if '.git' in f.parts: continue
            res[str(f)] = hashlib.sha256(f.read_bytes()).hexdigest()[:12] if f.is_file() else 'DIR'
    return res

# 1. Alteración del escenario por introspección como participante (sin modelo)
subprocess.run([str(BASE / 'caso.sh'), 'practica'], stdout=subprocess.DEVNULL, check=True)
med.congelar_ejecutor('principal')
med.ejecutar(med.como_evaluador(['opencode', 'debug', 'agent', 'build'], {'COMO_DEV_DIR': ''}), OUT / 'warm.out', OUT / 'warm.err')
a, ha = arbol(), med.hash_escenario()
for i, cmd in enumerate(["pwd; env | sort", "opencode debug config", "opencode debug config"]):
    med.ejecutar(med.como_evaluador(['como-dev', cmd], {'COMO_DEV_DIR': ''}), OUT / f'cmd{i}.out', OUT / f'cmd{i}.err')
    b, hb = arbol(), med.hash_escenario()
    cambios = {k: (a.get(k), b.get(k)) for k in sorted(set(a) | set(b)) if a.get(k) != b.get(k)}
    print(f'tras «{cmd}»: hash cambia={ha != hb}; archivos cambiados/agregados={len(cambios)}')
    for k, v in list(cambios.items())[:25]: print('   ', k, v)
    a, ha = b, hb

# 2. Causa de error de astra/luna
for m in ('gpt-6-astra', 'gpt-6-luna'):
    med.ejecutar(med.como_evaluador(['opencode', 'run', '--print-logs', '--log-level', 'DEBUG', '--model', f'openai/{m}', '--agent', 'build', '--format', 'json', 'Respondé únicamente OK.'], {'COMO_DEV_DIR': ''}), OUT / f'{m}.out', OUT / f'{m}.err', 120)
    err = (OUT / f'{m}.err').read_text(errors='replace')
    lineas = [l for l in err.splitlines() if re.search(r'error|status|model|not supported|not found|4\d\d|5\d\d', l, re.I) and not re.search(r'authoriz|account|bearer|token|refresh|access', l, re.I)]
    print(f'== {m}'); [print('   ', l[:300]) for l in lineas[-15:]]
