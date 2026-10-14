# Fase 0, cuarta pasada (tras MED-5): practica con build y Charles, ambos gpt-6.1-sol,
# usando las funciones del medir.sh nuevo (catálogo congelado y preparación del participante).
import json, os, re, subprocess, time, importlib.util
spec = importlib.util.spec_from_file_location('med', '/tmp/med.py')
med = importlib.util.module_from_spec(spec); spec.loader.exec_module(med)
BASE, HOME_E = med.BASE, med.HOME_E
OUT = BASE / 'resultados' / 'fase0d'; OUT.mkdir(parents=True)
cred = os.environ.pop('OPENCODE_AUTH_JSON'); auth = json.loads(cred)
p = HOME_E / '.local/share/opencode/auth.json'; p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(json.dumps(auth)); p.chmod(0o600)
subprocess.run(['chown', '-R', 'evaluador:evaluador', str(HOME_E / '.local')], check=True)
del cred, auth
print('catalogo', med.instalar_catalogo(BASE / 'modelos.json')[:12])
os.chdir(HOME_E / 'tarea')
PREGUNTA = '¿Qué modelo pequeño (`small_model`) usa OpenCode en esta máquina, y qué archivo lo determina?'

for ejecutor, agente in (('principal', 'build'), ('charles', '[AUX] Charles')):
    n = f'practica-{ejecutor}-sol'
    subprocess.run([str(BASE / 'caso.sh'), 'practica'], stdout=subprocess.DEVNULL, check=True)
    med.congelar_ejecutor(ejecutor)
    ent = {'COMO_DEV_DIR': ''}
    prep = med.ejecutar(med.como_evaluador(['como-dev', 'opencode debug config'], ent), OUT / f'{n}.prep.out', OUT / f'{n}.prep.err')
    med.ejecutar(med.como_evaluador(['opencode', 'debug', 'agent', agente], ent), OUT / f'{n}.agente.json', OUT / f'{n}.agente.err')
    antes, antes_e = med.hash_escenario(), med.hash_arbol([HOME_E / '.config/opencode'])
    instr = med.INSTRUCCION.format(DIRECTORIO='/home/participante/proyecto/', PREGUNTA=PREGUNTA)
    t = time.monotonic()
    code = med.ejecutar(med.como_evaluador(['opencode', 'run', '--model', 'openai/gpt-6.1-sol', '--agent', agente, '--format', 'json', instr], ent), OUT / f'{n}.stdout.txt', OUT / f'{n}.stderr.txt', 600)
    dur = round(time.monotonic() - t, 1)
    out = (OUT / f'{n}.stdout.txt').read_text(errors='replace')
    parsed = med.extraer_eventos(out)
    cuota, trans, _ = med.clasificar_fallo(code, (OUT / f'{n}.stderr.txt').read_text(errors='replace'), parsed['eventos'])
    modelos = sorted({e['part'].get('modelID') for e in parsed['eventos'] if e.get('type') == 'step_finish' and e['part'].get('modelID')})
    sid = next((e.get('sessionID') for e in parsed['eventos'] if e.get('sessionID')), None)
    if sid:
        med.ejecutar(med.como_evaluador(['opencode', 'export', sid], ent), OUT / f'{n}.export.json', OUT / f'{n}.export.err')
        try:
            exp = json.loads((OUT / f'{n}.export.json').read_text())
            modelos = sorted({(m['info'].get('providerID'), m['info'].get('modelID'), m['info'].get('agent') or m['info'].get('mode')) for m in exp['messages'] if m['info'].get('role') == 'assistant'})
        except Exception as e:
            modelos = [f'export ilegible: {e}']
    m = [x for x in re.finditer(r'\{[^{}]*"respuesta"[^{}]*\}', parsed['respuesta_textual'])]
    print(json.dumps(dict(ejecucion=n, prep=prep, codigo=code, duracion_s=dur, modelos_agente=modelos,
        escenario_alterado=antes != med.hash_escenario(), ejecutor_alterado=antes_e != med.hash_arbol([HOME_E / '.config/opencode']),
        registro_incompleto=parsed['registro_incompleto'], cuota=cuota, transitorio=trans,
        tokens=[sum(s[k] for s in parsed['solicitudes']) for k in med.TOKEN_FIELDS], solicitudes=len(parsed['solicitudes']),
        herramientas=[(h['herramienta'], h['estado'], (h['argumentos'].get('command') or h['argumentos'].get('filePath') or '')[:90]) for h in parsed['herramientas']],
        json_final=m[-1].group(0) if m else None), ensure_ascii=False, indent=1), flush=True)
