# Evalúa la captura: para cada caso y variante, ¿se alcanzó el objetivo? ¿hubo cambios colaterales?
# Evaluador de permisos: última regla coincidente (findLast), con comodines * y ? y el sufijo " *" opcional
# (lectura del código de OpenCode 1.18.25, util/wildcard.ts y permission/next.ts). Se valida contra la fase 2.
import json, os, re, sys

D = sys.argv[1]
M, T = "google/gemini-2.5-flash", 0.55
SONDEOS = [("edit", "src/productos.js"), ("edit", "README.md"), ("edit", "src/index.js"),
           ("read", ".env"), ("read", "src/productos.js"),
           ("bash", "git status"), ("bash", "git diff"), ("bash", "npm install"), ("bash", "ls"),
           ("webfetch", "https://example.com")]
OBJ = {
    "C-1a": ("build", "model", M), "C-1b": ("build", ("webfetch", "https://example.com"), "deny"),
    "C-1c": ("plan", "temperature", T), "C-1d": ("build", ("edit", "src/productos.js"), "allow"),
    "C-1e": ("build", "temperature", T), "C-1f": ("build", ("read", "src/productos.js"), "allow"),
    "C-2a": ("build", "model", M), "C-2b": ("docs", "model", M), "C-2c": ("revisor", "model", M),
    "C-2d": ("build", "model", M), "C-2e": ("build", "model", M), "C-2f": ("build", "model", M),
    "C-3a": ("plan", "model", M), "C-3b": ("build", ("read", ".env"), "allow"), "C-3c": ("build", "model", M),
    "C-3d": ("plan", ("edit", "README.md"), "allow"), "C-3e": ("plan", "description", "Revisa-plan"),
    "C-3f": ("general", ("bash", "git status"), "deny"), "C-4a": ("build", ("bash", "git status"), "ask"),
    "C-4b": ("build", ("bash", "git diff"), "allow"), "C-4c": ("plan", ("edit", "src/index.js"), "deny"),
    "C-4d": ("build", ("bash", "npm install"), "allow"), "C-4e": ("build", ("edit", "src/productos.js"), "allow"),
    "C-4f": ("build", ("edit", "src/productos.js"), "allow"),
}


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


def estado(dirv):
    est = {}
    for f in os.listdir(dirv):
        if not f.startswith("agente-"):
            continue
        ag = f[7:-5]
        try:
            a = json.load(open(os.path.join(dirv, f), encoding="utf-8"))
        except Exception:
            continue
        m = a.get("model")
        e = {"model": f'{m["providerID"]}/{m["modelID"]}' if isinstance(m, dict) else m,
             "temperature": a.get("temperature"), "description": a.get("description")}
        for p, x in SONDEOS:
            e[(p, x)] = decidir(a.get("permission", []), p, x)
        est[ag] = e
    return est


filas = []
for caso in sorted(os.listdir(D)):
    if not caso.startswith("C-"):
        continue
    base = estado(f"{D}/{caso}/base")
    ag, clave, esperado = OBJ[caso]
    for var in sorted(os.listdir(f"{D}/{caso}")):
        if var == "base":
            continue
        st = estado(f"{D}/{caso}/{var}")
        valor = st.get(ag, {}).get(clave)
        logrado = valor == esperado
        colat = []
        for a in base:
            for k, v in base[a].items():
                if (a, k) == (ag, clave):
                    continue
                if st.get(a, {}).get(k) != v:
                    colat.append(f"{a}:{k if isinstance(k, str) else k[0] + ' ' + k[1]} {v}→{st.get(a, {}).get(k)}")
        filas.append((caso, var, base.get(ag, {}).get(clave), valor, logrado, colat))

for caso, var, antes, despues, ok, colat in filas:
    print(f"{caso} | {var:17} | {antes} → {despues} | {'LOGRA' if ok else 'SIN EFECTO' if antes == despues else 'OTRO'}"
          f" | colaterales: {'; '.join(colat) if colat else 'ninguno'}")
