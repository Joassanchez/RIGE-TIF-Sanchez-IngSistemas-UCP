#!/usr/bin/env python3
# Corre como root en un contenedor nuevo de rige-linea-base:1.18.25 con --network none.
# Para cada caso y variante (más "base", sin edición): activa el caso con caso.sh,
# escribe los archivos de la variante como participante y captura debug config y
# debug agent de los agentes relevantes. No compara: la evaluación se hace afuera.
import json, os, subprocess, sys, shlex

BASE = "/opt/linea-base"
HOME = "/home/participante"
V = json.load(open(sys.argv[1], encoding="utf-8"))
OUT = sys.argv[2]
FIJO = "export OPENCODE_DISABLE_AUTOUPDATE=1 OPENCODE_DISABLE_MODELS_FETCH=1"


def env_caso(caso):
    d = {"DIR": "", "AGENTES": ""}
    for l in open(f"{BASE}/casos/{caso}/caso.env", encoding="utf-8"):
        l = l.strip()
        if l.startswith(("DIR=", "AGENTES=")):
            k, v = l.split("=", 1)
            d[k] = v.strip('"')
    return d


def como(cmd):
    r = subprocess.run(["runuser", "-l", "participante", "-c", f"{FIJO}; {cmd}"],
                       capture_output=True, text=True, timeout=120)
    return r.returncode, r.stdout, r.stderr


def ruta(rel):
    return (HOME + "/.config/opencode/" + rel[2:]) if rel.startswith("G/") else (HOME + "/proyecto/" + rel[2:])


managed = {}
for p in ["/etc/opencode", "/etc"]:
    rc, _, _ = como(f"test -w {p}")
    managed[p] = {"existe": os.path.exists(p), "escribible_participante": rc == 0}
json.dump(managed, open(f"{OUT}/00-directorio-administrado.json", "w"), indent=1)

for caso, variantes in V.items():
    e = env_caso(caso)
    trabajo = HOME + "/proyecto" + (("/" + e["DIR"]) if e["DIR"] else "")
    agentes = list(dict.fromkeys(e["AGENTES"].split() + ["build", "plan", "general"]))
    for var, archivos in [("base", {})] + list(variantes.items()):
        subprocess.run([f"{BASE}/caso.sh", caso], check=True, capture_output=True)
        for rel, contenido in archivos.items():
            p = ruta(rel)
            # escribir como participante (crea directorios si hace falta)
            subprocess.run(["runuser", "-u", "participante", "--", "mkdir", "-p", os.path.dirname(p)], check=True)
            subprocess.run(["runuser", "-u", "participante", "--", "tee", p], input=contenido, text=True,
                           check=True, capture_output=True)
        d = f"{OUT}/{caso}/{var}"
        os.makedirs(d, exist_ok=True)
        rc, o, er = como(f"cd {shlex.quote(trabajo)} && opencode debug config")
        open(f"{d}/config.json", "w").write(o)
        res = {"config_rc": rc, "config_err": er[-2000:], "agentes": {}}
        for ag in agentes:
            rc, o, er = como(f"cd {shlex.quote(trabajo)} && opencode debug agent {ag}")
            open(f"{d}/agente-{ag}.json", "w").write(o)
            res["agentes"][ag] = {"rc": rc, "err": er[-2000:]}
        json.dump(res, open(f"{d}/estado.json", "w"), indent=1)
        print(caso, var, "ok", flush=True)
open(f"{OUT}/terminado", "w").write("1")
