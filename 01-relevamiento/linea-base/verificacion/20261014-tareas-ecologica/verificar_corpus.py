# Captura en el contenedor (modo "capturar") y evaluación afuera (modo "evaluar") del corpus de detección.
import json, os, re, shutil, subprocess, sys, shlex

modo, ESP, D = sys.argv[1], sys.argv[2], sys.argv[3]
E = json.load(open(ESP, encoding="utf-8"))
H = "/home/participante"

def ruta(rel):
    pre, resto = rel.split("/", 1)
    return {"G": H + "/.config/opencode/", "P": H + "/proyecto/", "H": H + "/"}[pre] + resto


def preparar(t, extra):
    for d in (H + "/proyecto", H + "/.config/opencode", H + "/.local/share/opencode", H + "/compartido"):
        shutil.rmtree(d, ignore_errors=True)
    os.makedirs(H + "/.config/opencode")
    shutil.copytree("/opt/linea-base/casos/comun/proyecto", H + "/proyecto")
    for rel, c in {**t["archivos"], **extra}.items():
        p = ruta(rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "w").write(c)
    subprocess.run(f"cd {H}/proyecto && git init -q && git add -A && git -c user.name=d -c user.email=d@e commit -qm v", shell=True, check=True)
    lineas = open(H + "/.bashrc").read().split("\n") if os.path.exists(H + "/.bashrc") else []
    if "# >>> entorno local >>>" in lineas:
        i = lineas.index("# >>> entorno local >>>"); k = lineas.index("# <<< entorno local <<<"); lineas = lineas[:i] + lineas[k + 1:]
    bloque = ["# >>> entorno local >>>"] + [f"export {k}={shlex.quote(v)}" for k, v in t.get("env", {}).items()] + ["# <<< entorno local <<<"]
    open(H + "/.bashrc", "w").write("\n".join(bloque + lineas))
    subprocess.run(["chown", "-R", "participante:participante", H], check=True)



def wc(s, p):
    opcional = p.endswith(" *")
    base = p[:-2] if opcional else p
    r = "".join(".*" if c == "*" else "." if c == "?" else re.escape(c) for c in base)
    if opcional:
        r += "( .*)?"
    return re.fullmatch(r, s, re.S) is not None


def decidir(reglas, perm, pat):
    for r in reversed(reglas):
        if wc(perm, r["permission"]) and wc(pat, r["pattern"]):
            return r["action"]
    return "ask"




if modo == "capturar":
    for eid, e in E.items():
        preparar({"archivos": e["archivos"], "env": e["env"]}, {})
        os.makedirs(f"{D}/{eid}", exist_ok=True)
        for ag in sorted({i["comprobacion"][1] for i in e["items"]}):
            r = subprocess.run(["runuser", "-l", "participante", "-c", f"export OPENCODE_DISABLE_MODELS_FETCH=1; cd ~/proyecto && opencode debug agent {ag}"], capture_output=True, text=True, timeout=120)
            open(f"{D}/{eid}/agente-{ag}.json", "w").write(r.stdout); open(f"{D}/{eid}/agente-{ag}.err", "w").write(r.stderr[-3000:])
        r = subprocess.run(["runuser", "-l", "participante", "-c", "export OPENCODE_DISABLE_MODELS_FETCH=1; cd ~/proyecto && opencode debug config --print-logs"], capture_output=True, text=True, timeout=120)
        open(f"{D}/{eid}/config.json", "w").write(r.stdout); open(f"{D}/{eid}/config.err", "w").write(r.stderr[-6000:])
        print(eid, "ok", flush=True)
    sys.exit()

ok = True
for eid, e in E.items():
    for i in e["items"]:
        c = i["comprobacion"]
        try:
            a = json.load(open(f"{D}/{eid}/agente-{c[1]}.json", encoding="utf-8"))
        except Exception as ex:
            print(eid, i["id"], "SIN CAPTURA", ex); ok = False; continue
        if c[0] in ("perm", "env_descartada"):
            ef = decidir(a.get("permission", []), c[2], c[3]); tiene = ef == c[4]
            det = f"{c[2]} {c[3]}: efectiva={ef} declarada={c[4]}"
        else:
            m = a.get("model"); val = (f'{m["providerID"]}/{m["modelID"]}' if isinstance(m, dict) else m) if c[2] == "model" else a.get(c[2])
            tiene = val == c[3]; det = f"{c[2]}: efectivo={val!r} declarado={c[3]!r}"
        bien = tiene == i["efecto"]; ok &= bien
        print(f"{eid} {i['id']:3} {'con efecto' if i['efecto'] else 'SIN efecto':10} {'OK ' if bien else 'FALLA'} {det}")
print("TODO VERIFICADO" if ok else "HAY FALLAS")
