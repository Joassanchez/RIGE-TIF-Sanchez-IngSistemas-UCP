#!/usr/bin/env python3
"""Genera el Libro de trabajo oficial (.xlsx) desde 03-requisitos/libro/.

Copia la plantilla de la cátedra, borra las filas de ejemplo (ocre), carga las filas
desde el Markdown solo en celdas de datos (nunca en columnas con fórmula) y guarda en
la carpeta indicada con la nomenclatura AAAAMMDD_CatalogoRequisitos_Equipo_vN.xlsx.
La hoja «Recursos» se toma del Instrumento 34 (instrumentos/), su fuente única.
La hoja «Panel» se recalcula al abrir el archivo en Excel: es el control final del autor.

Uso: python tools/exportar_libro.py --destino 03-requisitos
"""
import argparse, datetime, pathlib, re, shutil, sys, unicodedata
import openpyxl
from openpyxl.styles import PatternFill

RAIZ = pathlib.Path(__file__).resolve().parent.parent
LIBRO = RAIZ / "03-requisitos" / "libro"
RECURSOS = RAIZ / "instrumentos" / "instrumento-34-recursos.md"
PLANTILLA = RAIZ / "catedra" / "originales" / "04_Libro_de_Trabajo_AE2.xlsx"
PRIMERA = 5
OCRE = "FFFDF4E2"
BLANCO = PatternFill(fill_type=None)

def norm(t):
    t = unicodedata.normalize("NFKD", re.sub(r"[*¿?]", "", t or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", t).strip()

def limpiar(v):
    v = re.sub(r"\\([\\`*_{}\[\]()#+\-.!|<>~\"'])", r"\1", (v or "").strip()).strip("*").strip()
    return "" if re.fullmatch(r"\[(DATO|DECISIÓN) PENDIENTE[^\]]*\]", v) else v

def numero(v):
    """Convierte un valor puramente numérico (sin separador de miles, coma decimal) para que Excel lo sume."""
    if isinstance(v, str) and re.fullmatch(r"\d+(,\d+)?", v):
        return float(v.replace(",", ".")) if "," in v else int(v)
    return v

def tablas_md(texto):
    """Devuelve lista de tablas pipe: (encabezados, filas)."""
    res, act = [], []
    for ln in texto.split("\n") + [""]:
        if ln.startswith("|"): act.append(ln)
        elif act:
            filas = [[c.strip() for c in l.strip().strip("|").split("|")] for l in act if not re.match(r"^\|[-:| ]+\|$", l.strip())]
            if filas: res.append(([norm(h) for h in filas[0]], filas[1:]))
            act = []
    return res

def yaml_equipo():
    m = re.search(r'^equipo:\s*"?([^"#\n]+)', (RAIZ / "informe" / "datos-autor.yaml").read_text(encoding="utf-8"), re.M)
    return m.group(1).strip() if m else "Equipo"

def columnas_formula(ws):
    return {c.column for c in ws[PRIMERA] if isinstance(c.value, str) and c.value.startswith("=")} | \
           {c.column for c in ws[PRIMERA + 1] if isinstance(c.value, str) and c.value.startswith("=")}

def vaciar_ejemplos(ws, formulas):
    """Vacía las celdas de ejemplo (ocre) y la tabla de datos, que termina en la primera fila con la columna A vacía.
    Conserva las fórmulas y los bloques posteriores de la plantilla (presupuesto, totales, contingencia)."""
    fin = PRIMERA
    while ws.cell(row=fin + 1, column=1).value not in (None, ""): fin += 1
    for fila in ws.iter_rows(min_row=PRIMERA, max_row=ws.max_row):
        for c in fila:
            if c.column in formulas or type(c).__name__ == "MergedCell": continue
            if isinstance(c.value, str) and c.value.startswith("="): continue
            ocre = c.fill and c.fill.fgColor and c.fill.fgColor.rgb == OCRE
            if ocre: c.fill = BLANCO
            if ocre or c.row <= fin: c.value = None

def escribir(ws, filas):
    formulas = columnas_formula(ws); vaciar_ejemplos(ws, formulas)
    for i, fila in enumerate(filas):
        for j, v in enumerate(fila, start=1):
            if j in formulas or v in (None, "", "—"): continue  # «—» declara en el Markdown una celda sin valor
            celda = ws.cell(row=PRIMERA + i, column=j)
            if type(celda).__name__ == "MergedCell": continue
            celda.value = numero(v)
    return len(filas)

def desde_tabla(archivo, alias, filtro=None):
    """alias: lista (una por columna del xlsx) de claves normalizadas aceptadas del encabezado Markdown."""
    filas = []
    for enc, cuerpo in tablas_md((LIBRO / archivo).read_text(encoding="utf-8")):  # una ruta absoluta (RECURSOS) ignora LIBRO
        idx = []
        for claves in alias:
            k = next((enc.index(h) for h in enc if any(h.startswith(a) for a in claves)), None) if claves else None
            idx.append(k)
        if all(k is None for k in idx) or (filtro and not filtro(enc)): continue
        for f in cuerpo:
            filas.append([limpiar(f[k]) if k is not None and k < len(f) else "" for k in idx])
    return filas

def catalogo():
    filas = []
    orden = lambda p: (p.stem.startswith("RNF"), int(re.search(r"\d+", p.stem).group()))
    for p in sorted((LIBRO / "catalogo").glob("*.md"), key=orden):
        d = {norm(a): b for a, b in re.findall(r"^\| ([^|]+?) \| (.*?) \|$", p.read_text(encoding="utf-8"), re.M)}
        g = lambda k: limpiar(d.get(norm(k), ""))
        cat = g("Categoría (si es no funcional)")
        it = g("Iteración prevista")
        filas.append([g("ID"), g("Enunciado"), g("Tipo"), "" if cat == "—" else cat, g("Prioridad"), g("Motivo de la prioridad"),
                      g("Criterio de aceptación"), g("Trazabilidad"), g("Estado de validación"),
                      "" if it == "Sin asignar" else it, g("¿Integra el MVP?")])
    return filas

def horas_por_iteracion():
    """Suma las horas de la tabla de tareas (Iteración | Tarea | … | Horas), sin las filas de subtotal."""
    horas = {}
    for enc, cuerpo in tablas_md((LIBRO / "iteraciones.md").read_text(encoding="utf-8")):
        if "tarea" not in enc or not any(h.startswith("horas") for h in enc): continue
        k = next(i for i, h in enumerate(enc) if h.startswith("horas"))
        for f in cuerpo:
            it, h = limpiar(f[0]), limpiar(f[k]) if k < len(f) else ""
            if re.fullmatch(r"\d+", it) and re.fullmatch(r"\d+", h): horas[it] = horas.get(it, 0) + int(h)
    return horas

def iteraciones():
    filas, horas = [], horas_por_iteracion()
    for f in desde_tabla("iteraciones.md", [["iteracion"], ["fechas"], ["objetivo"], ["requisitos"], ["entregable"], ["horas"]],
                         filtro=lambda enc: "fechas" in enc):
        m = re.match(r"(\S+)\s+al\s+(\S+)", f[1] or "")
        filas.append([f[0], m.group(1) if m else f[1], m.group(2) if m else "", f[2], f[3], f[4], f[5] or horas.get(f[0], "")])
    return filas

def presupuesto(ws):
    """Carga el bloque de presupuesto de la hoja Iteraciones (B16 a B18 y B20) desde la tabla de iteraciones.md."""
    d = {}
    for enc, cuerpo in tablas_md((LIBRO / "iteraciones.md").read_text(encoding="utf-8")):
        if enc and enc[0].startswith("presupuesto de horas-persona"):
            d = {norm(f[0]): limpiar(f[1]) for f in cuerpo if len(f) > 1}
    primero = lambda clave, patron=r"(\d+)": next((int(m.group(1)) for k, v in d.items() if k.startswith(clave)
                                                   for m in [re.search(patron, v)] if m), None)
    integrantes, horas = primero("integrantes"), primero("horas semanales")
    total, reduccion = primero("presupuesto total"), primero("reduccion", r"(\d+)\s*h\b")
    semanas = total // (integrantes * horas) if None not in (total, integrantes, horas) and total % (integrantes * horas) == 0 else None
    valores = {16: integrantes, 17: horas, 18: semanas, 20: reduccion}
    for fila, v in valores.items():
        if v is not None: ws.cell(row=fila, column=2).value = v
    return sum(v is not None for v in valores.values())

def main():
    ap = argparse.ArgumentParser(description="Genera el Libro de trabajo .xlsx.")
    ap.add_argument("--destino", required=True, help="carpeta de salida relativa a la raíz, según la consigna")
    carpeta = RAIZ / ap.parse_args().destino; carpeta.mkdir(parents=True, exist_ok=True)
    hoy = datetime.date.today().strftime("%Y%m%d"); eq = yaml_equipo(); n = 1
    while list(carpeta.glob(f"*_CatalogoRequisitos_{eq}_v{n}.xlsx")): n += 1
    destino = carpeta / f"{hoy}_CatalogoRequisitos_{eq}_v{n}.xlsx"
    shutil.copy(PLANTILLA, destino)
    wb = openpyxl.load_workbook(destino)
    informe = {
        "Catálogo": escribir(wb["Catálogo"], catalogo()),
        "Trazabilidad": escribir(wb["Trazabilidad"], desde_tabla("trazabilidad.md",
            [["cod"], ["hallazgo"], ["fuente"], ["requisitos derivados", "requisito"], ["si no deriva"]], filtro=lambda e: any(h.startswith("hallazgo") for h in e))),
        "Entidades": escribir(wb["Entidades"],
            [f[:4] + ["Entidad"] + f[5:] for f in desde_tabla("entidades.md",
                [["entidad"], [], [], [], [], ["fuente"], ["relaciones"]], filtro=lambda e: any(h.startswith("definicion") for h in e))]
            + desde_tabla("entidades.md", [["candidata"], [], [], [], ["reclasificacion"], ["criterio"], []],
                filtro=lambda e: any(h.startswith("reclasificacion") for h in e))),
        "Reglas": escribir(wb["Reglas"], desde_tabla("reglas.md",
            [["cod"], ["tipo"], ["enunciado"], ["fuente"], ["estado"], ["requisito"]])),
        "Glosario": escribir(wb["Glosario"], desde_tabla("glosario.md",
            [["termino"], ["definicion"], ["falsos amigos", "sinonimos"], ["fuente"], ["en disputa"]])),
        "Iteraciones": escribir(wb["Iteraciones"], iteraciones()),
        "Recursos": escribir(wb["Recursos"], [f for f in desde_tabla(RECURSOS,
            [["tipo", "clase"], ["recurso", "concepto"], ["cantidad"], ["unidad"], ["costo unitario"], [], ["fuente"]]) if f[1]]),
    }
    informe["Iteraciones (presupuesto)"] = presupuesto(wb["Iteraciones"])
    wb.save(destino)
    print(destino.relative_to(RAIZ) if RAIZ in destino.parents else destino)
    for hoja, k in informe.items(): print(f"  {hoja}: {k} filas")
    print("Abrí el archivo en Excel y revisá la hoja «Panel».")

if __name__ == "__main__":
    main()
