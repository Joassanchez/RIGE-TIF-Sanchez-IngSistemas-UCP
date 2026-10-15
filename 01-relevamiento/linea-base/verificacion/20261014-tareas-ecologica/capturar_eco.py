#!/usr/bin/env python3
# Corre como root en un contenedor nuevo de rige-linea-base:1.18.25 con --network none.
# Por tarea y variante (más "base"): prepara el escenario del participante y captura
# `opencode debug agent` de los agentes involucrados, como participante, desde el proyecto.
import json, os, shutil, subprocess, sys, shlex

H = "/home/participante"
T = json.load(open(sys.argv[1], encoding="utf-8"))
OUT = sys.argv[2]


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


for tid, t in T.items():
    agentes = sorted({t["objetivo"][0]} | {g[0] for g in t.get("guardas", [])}) if "objetivo" in t else [t["valor"][0]]
    for var, extra in [("base", {})] + list(t["variantes"].items()):
        preparar(t, extra)
        d = f"{OUT}/{tid}/{var}"; os.makedirs(d, exist_ok=True)
        for ag in agentes:
            r = subprocess.run(["runuser", "-l", "participante", "-c",
                                f"export OPENCODE_DISABLE_AUTOUPDATE=1 OPENCODE_DISABLE_MODELS_FETCH=1; cd ~/proyecto && opencode debug agent {ag}"],
                               capture_output=True, text=True, timeout=120)
            open(f"{d}/agente-{ag}.json", "w").write(r.stdout)
            open(f"{d}/agente-{ag}.err", "w").write(r.stderr[-3000:])
        print(tid, var, "ok", flush=True)
