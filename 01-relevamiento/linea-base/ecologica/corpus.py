# Corpus de ADR-092: declaraciones sin efecto (D) y controles con efecto (C), por escenario.
# Cada entrada: archivo, clave (cómo se identifica), tipo, y la comprobación con OpenCode:
#   ("perm", agente, permiso, sujeto, accion_declarada)  -> sin efecto si la decisión efectiva != accion_declarada
#   ("valor", agente, campo, valor_declarado)             -> sin efecto si el valor efectivo != declarado
#   ("env_descartada", agente, permiso, sujeto, accion)   -> idem perm, la declaración está en una variable
import json

S = "https://opencode.ai/config.json"


def j(d):
    return json.dumps({"$schema": S, **d}, indent=2) + "\n"


E = {}
E["D-A"] = dict(
    tema="permisos",
    archivos={
        "G/opencode.json": j({"permission": {"bash": {"git push": "deny", "*": "allow", "npm publish *": "deny"}}}),
        "P/opencode.json": j({"permission": {"webfetch": "deny", "read": {"*": "allow", "/home/participante/proyecto/.env": "deny", "secretos/*": "deny"}},
                              "agent": {"build": {"permission": {"edit": "ask"}}}}),
        "P/.env": "API_KEY=solo-desarrollo\n", "P/secretos/claves.txt": "x\n"},
    env={"OPENCODE_PERMISSION": '{"webfetch":"allow"}'},
    items=[
        dict(id="D1", efecto=False, tipo="regla de permiso sin efecto (desplazada por una regla posterior)", archivo="G/opencode.json", clave="permission.bash.\"git push\"",
             comprobacion=("perm", "build", "bash", "git push", "deny")),
        dict(id="D2", efecto=False, tipo="regla de permiso sin efecto (ruta absoluta)", archivo="P/opencode.json", clave="permission.read.\"/home/participante/proyecto/.env\"",
             comprobacion=("perm", "build", "read", ".env", "deny")),
        dict(id="D3", efecto=False, tipo="regla de permiso sin efecto (desplazada por OPENCODE_PERMISSION)", archivo="P/opencode.json", clave="permission.webfetch",
             comprobacion=("perm", "build", "webfetch", "https://example.com", "deny")),
        dict(id="C1", efecto=True, tipo="control", archivo="G/opencode.json", clave="permission.bash.\"npm publish *\"",
             comprobacion=("perm", "build", "bash", "npm publish --access public", "deny")),
        dict(id="C2", efecto=True, tipo="control", archivo="P/opencode.json", clave="permission.read.\"secretos/*\"",
             comprobacion=("perm", "build", "read", "secretos/claves.txt", "deny")),
        dict(id="C3", efecto=True, tipo="control", archivo="P/opencode.json", clave="agent.build.permission.edit",
             comprobacion=("perm", "build", "edit", "src/index.js", "ask")),
    ])
E["D-B"] = dict(
    tema="valores",
    archivos={
        "G/opencode.json": j({"agent": {"build": {"temperature": 0.4}}}),
        "P/opencode.json": j({"agent": {"build": {"model": "openai/gpt-5-mini"}, "plan": {"temperature": 0.2, "description": "Plan-{env:RIGE_ETIQUETA_INEXISTENTE}"}}}),
        "P/.opencode/opencode.json": j({"agent": {"build": {"model": "google/gemini-2.5-flash"}}})},
    env={},
    items=[
        dict(id="D4", efecto=False, tipo="valor desplazado por precedencia", archivo="P/opencode.json", clave="agent.build.model",
             comprobacion=("valor", "build", "model", "openai/gpt-5-mini")),
        dict(id="D5", efecto=False, tipo="sustitución sin valor", archivo="P/opencode.json", clave="agent.plan.description",
             comprobacion=("valor", "plan", "description", "Plan-{env:RIGE_ETIQUETA_INEXISTENTE}")),
        dict(id="C4", efecto=True, tipo="control", archivo="P/.opencode/opencode.json", clave="agent.build.model",
             comprobacion=("valor", "build", "model", "google/gemini-2.5-flash")),
        dict(id="C5", efecto=True, tipo="control", archivo="G/opencode.json", clave="agent.build.temperature",
             comprobacion=("valor", "build", "temperature", 0.4)),
        dict(id="C6", efecto=True, tipo="control", archivo="P/opencode.json", clave="agent.plan.temperature",
             comprobacion=("valor", "plan", "temperature", 0.2)),
    ])
E["D-C"] = dict(
    tema="entradas",
    archivos={
        "P/opencode.json": j({"permission": {"bash": "ask"}, "agent": {"revisor": {"model": "openai/gpt-5", "temperature": 0.1}}}),
        "P/.opencode/agent/revisor.md": "---\ndescription: Revisor del equipo\nmode: primary\nmodel: anthropic/claude-sonnet-4-5\n---\n\nRevisá los cambios.\n"},
    env={"OPENCODE_PERMISSION": '{"bash":"deny",}'},
    items=[
        dict(id="D6", efecto=False, tipo="entrada descartada sin error visible (JSON inválido)", archivo="env:OPENCODE_PERMISSION", clave="bash",
             comprobacion=("perm", "build", "bash", "ls", "deny")),
        dict(id="D7", efecto=False, tipo="valor desplazado por el agente en markdown", archivo="P/opencode.json", clave="agent.revisor.model",
             comprobacion=("valor", "revisor", "model", "openai/gpt-5")),
        dict(id="C7", efecto=True, tipo="control", archivo="P/.opencode/agent/revisor.md", clave="model",
             comprobacion=("valor", "revisor", "model", "anthropic/claude-sonnet-4-5")),
        dict(id="C8", efecto=True, tipo="control", archivo="P/opencode.json", clave="agent.revisor.temperature",
             comprobacion=("valor", "revisor", "temperature", 0.1)),
        dict(id="C9", efecto=True, tipo="control", archivo="P/opencode.json", clave="permission.bash",
             comprobacion=("perm", "build", "bash", "ls", "ask")),
    ])

ARCHIVO = {'G/opencode.json': '(\\.config/opencode/opencode\\.json)', 'P/opencode.json': '(^|[^.\\w/])(proyecto/)?opencode\\.json$|^\\./opencode\\.json$|^/home/participante/proyecto/opencode\\.json$', 'P/.opencode/opencode.json': '\\.opencode/opencode\\.json', 'P/.opencode/agent/revisor.md': '\\.opencode/agents?/revisor\\.md', 'env:OPENCODE_PERMISSION': 'OPENCODE_PERMISSION'}
CLAVE = {'D1': 'git push(?! \\*)', 'D2': '/home/participante/proyecto/\\.env|\\.env', 'D3': 'webfetch', 'D4': 'model', 'D5': 'description', 'D6': '.*', 'D7': 'model', 'C1': 'npm publish', 'C2': 'secretos', 'C3': 'edit', 'C4': 'model', 'C5': 'temperature', 'C6': 'temperature', 'C7': 'model', 'C8': 'temperature', 'C9': 'bash'}
for _e in E.values():
    for _i in _e["items"]:
        _i["coincide"] = {"archivo": ARCHIVO[_i["archivo"]], "clave": CLAVE[_i["id"]]}

def derivar(tareas, admision=None):
    """P-9: nunca sembrar candidatos sin una lista explícita de admisión nativa.

    Cada escenario defectuoso tiene otro escenario de control independiente;
    no se fusionan variantes, porque eso cambiaría el mecanismo admitido.
    """
    from copy import deepcopy
    import re
    out = deepcopy(E)
    if admision is None:
        return out
    if not isinstance(admision.get('tareas'), dict):
        raise ValueError('La admisión requiere tareas con resultado y motivo.')
    for tid, dato in admision['tareas'].items():
        if dato.get('resultado') != 'admitida':
            continue
        if tid not in tareas:
            raise ValueError('Tarea admitida desconocida: ' + tid)
        t = tareas[tid]
        for nombre, cambios in t['variantes'].items():
            if not nombre.startswith('ingenua_'):
                continue
            objetivo = t.get('objetivo')
            evidencia = dato.get('variantes', {}).get(nombre, {})
            if objetivo and evidencia:
                objetivos = [objetivo, *t.get('objetivos_adicionales', [])]
                actual = evidencia.get('estado_despues', {}).get('objetivo')
                actual = actual if isinstance(actual, list) else [actual]
                incumplidos = [s for s, v in zip(objetivos, actual) if s[3] != v]
                if not incumplidos:
                    continue  # Colateral con objetivo logrado: no es declaración sin efecto.
                objetivo = incumplidos[0]
            for control, variante in [(False, nombre), (True, 'correcta')]:
                archivos = {**t['archivos'], **t['variantes'][variante]}
                rutas = list(cambios or t['archivos'])
                # La declaración se reconoce por archivo y clave: no se acredita
                # una etiqueta genérica como un defecto de cualquier archivo.
                rutas = [r for r in rutas if r.endswith(('.json', '.jsonc', '.md'))]
                if not rutas:
                    continue
                clave = objetivo[1] if objetivo else t['valor'][1].split('.')[0]
                rutas = [r for r in rutas if isinstance(archivos.get(r), str) and re.search(r'\b' + re.escape(clave) + r'\b', archivos[r])]
                if not rutas:
                    continue  # Sin declaración de ese eje: no inventar un defecto sembrado.
                ruta = rutas[0]
                if control:
                    ruta = next((r for r in t['variantes']['correcta'] if clave in str(archivos[r])), ruta)
                comprobacion = (('perm', *objetivo) if objetivo else ('valor', *t['valor']))
                iid = f'{tid}-{nombre}-' + ('C' if control else 'D')
                out[iid] = dict(archivos=archivos, env=t.get('env', {}), directorio=t.get('directorio', ''),
                    items=[dict(id=iid, efecto=control, tipo='control admitido' if control else 'forma ingenua admitida',
                        archivo=ruta, clave=clave, comprobacion=comprobacion,
                        coincide=dict(archivo=ARCHIVO.get(ruta, re.escape(ruta.split('/', 1)[1]) + '$'), clave=re.escape(clave)))])
    # Un defecto sin su control no integra el corpus.
    for k in list(out):
        if k not in E and k[:-1] + ('C' if k.endswith('D') else 'D') not in out:
            out.pop(k)
    return out


if __name__ == "__main__":
    import sys
    json.dump(E, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
