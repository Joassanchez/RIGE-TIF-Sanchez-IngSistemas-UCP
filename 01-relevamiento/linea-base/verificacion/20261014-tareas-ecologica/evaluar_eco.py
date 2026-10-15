# Evalúa la captura: objetivo alcanzado y guardas sin cambio, con el evaluador de última
# coincidencia validado 13/13 contra la fase 2 (verificacion/20261014-tareas-modificacion/evaluar.py).
import json, os, re, sys

D, ESPEC = sys.argv[1], sys.argv[2]
T = json.load(open(ESPEC, encoding="utf-8"))


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


def agente(d, ag):
    try:
        a = json.load(open(f"{d}/agente-{ag}.json", encoding="utf-8"))
    except Exception:
        return None
    m = a.get("model")
    a["_model"] = f'{m["providerID"]}/{m["modelID"]}' if isinstance(m, dict) else m
    return a


def sondear(d, s):
    a = agente(d, s[0])
    return None if a is None else decidir(a.get("permission", []), s[1], s[2])


filas = []
for tid, t in T.items():
    for var in ["base"] + list(t["variantes"]):
        d = f"{D}/{tid}/{var}"
        if "objetivo" in t:
            ag, perm, suj, esperado = t["objetivo"]
            v = sondear(d, (ag, perm, suj))
            g = {f"{x[0]}:{x[1]} {x[2]}": sondear(d, x) for x in t["guardas"]}
            filas.append((tid, var, f"{perm} {suj}", v, esperado, g))
        else:
            ag, campo, esperado = t["valor"]
            a = agente(d, ag)
            v = None if a is None else (a["_model"] if campo == "model" else a.get(campo))
            filas.append((tid, var, campo, v, esperado, {}))

base = {}
for tid, var, que, v, esp, g in filas:
    if var == "base":
        base[tid] = (v, g)
for tid, var, que, v, esp, g in filas:
    b = base[tid]
    if var == "base":
        estado = "objetivo YA cumplido en base (defecto)" if v == esp else "base ok (objetivo no cumplido)"
    else:
        cambio = [k for k in g if g[k] != b[1].get(k)]
        estado = ("LOGRA" if v == esp else "SIN EFECTO" if v == b[0] else "OTRO") + (f" | colateral en agente objetivo: {cambio}" if cambio else "")
    print(f"{tid:5} {var:24} {que:42} {str(v):28} esperado={esp} -> {estado}")
