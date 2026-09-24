#!/usr/bin/env python3
"""Migración única: arma 03-requisitos/libro/ a partir del Capítulo III y del Capítulo V."""
import re, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
L = R / "03-requisitos" / "libro"; (L / "catalogo").mkdir(parents=True, exist_ok=True)
ai = (R / "informe/anexos/anexo-I-cap3-catalogo-requisitos-matriz-trazabilidad.md").read_text()
av = (R / "informe/anexos/anexo-V-cap3-glosario-dominio-reglas-negocio.md").read_text()
iii2 = (R / "informe/cap-03/III.2-dominio-sistema-informacion.md").read_text()
iii5 = (R / "informe/cap-03/III.5-catalogo-requisitos.md").read_text()
v1 = (R / "informe/cap-05/V.1-definicion-iteraciones-sprints.md").read_text()
v4 = (R / "informe/cap-05/V.4-cronograma.md").read_text()

cats = {m.group(1): m.group(3).strip() for m in re.finditer(r"^\| (R(?:N)?F-\d+)\s*\| ([^|]+)\| ([^|]+)\| ([^|]+)\|", iii5, re.M)}
iters = {}
for m in re.finditer(r"^\| (\d)\s+\|[^|]+\| ([^|]+)\|", v4, re.M):
    for r in re.findall(r"R(?:N)?F-\d+", m.group(2)): iters.setdefault(r, m.group(1))

for tb in re.split(r"\n\s*\n", ai):
    if "**Identificador**" not in tb: continue
    d = {}
    for r in tb.split("\n"):
        if not r.startswith("|") or re.match(r"^\|[-:| ]+\|$", r): continue
        c = [x.strip() for x in r.strip("|").split("|")]
        d[c[0].strip("*")] = c[1].strip("*") if len(c) > 1 else ""
    rid = d["Identificador"]; pc = d.get("Prioridad y criterio", "")
    m = re.match(r"^(Must|Should|Could|Won.t)\.?\s*(.*)$", pc, re.S)
    prio, mot = (m.group(1).replace("’", "'"), m.group(2).strip()) if m else ("[DATO PENDIENTE]", pc)
    nf = rid.startswith("RNF")
    (L / "catalogo" / f"{rid}.md").write_text(f"""# {rid}

| Campo | Valor |
|---|---|
| ID | {rid} |
| Enunciado | {d.get('Enunciado','')} |
| Tipo | {'No funcional' if nf else 'Funcional'} |
| Categoría (si es no funcional) | {cats.get(rid, '') if nf else '—'} |
| Prioridad | {prio} |
| Motivo de la prioridad | {mot} |
| Criterio de aceptación | {d.get('Criterio de aceptación','')} |
| Trazabilidad | {d.get('Trazabilidad','')} |
| Estado de validación | [DATO PENDIENTE] |
| Iteración prevista | {iters.get(rid, 'Sin asignar')} |
| ¿Integra el MVP? | {'Sí' if prio == 'Must' else 'No'} |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 9; «Iteración prevista» de la Tabla 18 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
""")

def sect(txt, start, end=None):
    i = txt.index(start)
    j = txt.index(end, i) if end else txt.find("\n## ", i + 3)
    return txt[i: j if j > 0 else None]
def body(s): return "\n".join(s.split("\n")[1:]).strip() + "\n"
def hdr(t, inst, orig): return f"# {t}\n\n> Hoja del Libro de trabajo{(' · ' + inst) if inst else ''}. Migrado de {orig}. Fuente para `/exportar libro`.\n\n"
def tablas(txt): return "\n".join(l for l in txt.split("\n") if l.startswith(("|", "+", "*Tabla", "")) and not l.startswith("#")) 

(L / "glosario.md").write_text(hdr("Glosario del dominio", "Instrumento 30", "Cap. III, Anexo V, A.V.1") + body(sect(av, "## A.V.1")))
(L / "reglas.md").write_text(hdr("Registro de reglas de negocio", "Instrumento 29", "Cap. III, Anexo V, A.V.2") + body(sect(av, "## A.V.2")))
(L / "entidades.md").write_text(hdr("Lista filtrada de entidades del dominio", "Instrumento 28", "Cap. III, III.2.2 y Anexo V, A.V.3")
    + "## Entidades y candidatas descartadas (III.2.2)\n\n" + body(sect(iii2, "### III.2.2", "### III.2.3"))
    + "\n## Atributos de las entidades (A.V.3)\n\n" + body(sect(av, "## A.V.3")))
(L / "trazabilidad.md").write_text(hdr("Matriz de trazabilidad", "Instrumento 26", "Cap. III, Anexo I, A.I.2") + body(sect(ai, "## A.I.2")))
it_v1 = "\n".join(l for l in v1.split("\n") if l.startswith("|") or l.startswith("*Tabla"))
it_v4 = "\n".join(l for l in v4.split("\n") if l.startswith("|") or l.startswith("*Tabla") or not l.strip())
it_v1 = re.sub(r"\n(\*Tabla)", r"\n\n\1", it_v1)
it_v4 = re.sub(r"\n{3,}", "\n\n", it_v4).strip()
(L / "iteraciones.md").write_text(hdr("Plan de iteraciones y presupuesto de horas", "", "Cap. V, V.1 y V.4")
    + "## Iteraciones (V.1)\n\n" + it_v1 + "\n\n## Presupuesto y tareas por iteración (V.4)\n\n" + it_v4 + "\n")
if not (L / "recursos.md").exists():
    (L / "recursos.md").write_text(hdr("Dimensionamiento de recursos", "", "Cap. X (pendiente de redacción)")
        + "| Tipo de recurso | Recurso | Cantidad | Unidad | Costo unitario | Costo total | Fuente |\n|---|---|---|---|---|---|---|\n\n"
        "<!-- Tipos permitidos: Humanos · Físicos y materiales · Financieros · Tecnológicos · Otros. Se completa con el Capítulo X. -->\n")
print("ok", len(list((L / 'catalogo').glob('*.md'))))
