#!/usr/bin/env python3
"""Arma documentos .docx (y, opcionalmente, PDF) desde Markdown.

No decide dónde se aloja cada artefacto: el destino lo indica quien lo invoca,
según la consigna (reglas-catedra, sección 7).

Uso:
  python tools/armar.py informe AE2 --destino 05-entregas [--formato pdf]
  python tools/armar.py documento instrumentos/instrumento-32-lienzo.md --tipo Instrumento32 --destino 02-analisis
  python tools/armar.py documento informe/cap-04 --tipo cap-04 --prueba
«documento» acepta uno o más archivos .md o carpetas (se toman sus .md en orden de apartado).
Nombre de salida: AAAAMMDD_<Tipo>_<Equipo>_vN.<ext>; nunca sobrescribe un archivo existente.
Con --prueba no aplica los controles de estado y escribe en build/.
"""
import argparse, datetime, os, pathlib, re, subprocess, sys, tempfile, shutil

RAIZ = pathlib.Path(__file__).resolve().parent.parent
INF = RAIZ / "informe"
REF = RAIZ / "tools" / "reference.docx"
FILTRO = RAIZ / "tools" / "informe.lua"
BIB = INF / "referencias.bib"
CSL = RAIZ / "tools" / "apa.csl"
CITEPROC = BIB.exists() and "@" in BIB.read_text(encoding="utf-8")

# Composición del informe de cada AE (qué partes lo integran, no dónde se aloja).
ENTREGAS = {
    "AE1": {"caps": ["cap-01", "cap-02"], "resumen": True,
            "anexos": ["anexos/00-anexos.md", "anexos/anexo-I-ae1-*.md", "anexos/anexo-II-ae1-*.md", "@00-gestion/anexo-III.md"]},
    "AE2": {"caps": ["cap-03", "cap-04", "cap-05", "cap-10"], "resumen": False,
            "anexos": ["anexos/anexo-I-cap3-*.md", "anexos/anexo-V-cap3-*.md", "anexos/anexo-VI-cap4-*.md"]},
}

def yaml_simple(p):
    d, pila = {}, []
    for ln in p.read_text(encoding="utf-8").splitlines():
        if not ln.strip() or ln.lstrip().startswith("#"): continue
        ind = len(ln) - len(ln.lstrip()); k, _, v = ln.strip().partition(":")
        v = v.split("  #")[0].strip().strip('"')
        while pila and pila[-1][0] >= ind: pila.pop()
        destino = pila[-1][1] if pila else d
        if v == "": destino[k] = {}; pila.append((ind, destino[k]))
        else: destino[k] = v
    return d

MARCADOR = re.compile(r"\[(?:DATO|DECISIÓN) PENDIENTE[^\]]*\]"   # [DATO PENDIENTE: …] / [DECISIÓN PENDIENTE: …]
                      r"|\\\[[^\]\n]{1,60}?\\\]")                 # huecos escapados: \[fecha\], \[IB-1 total\]

def marcadores(texto):
    """Marcadores residuales (observación del AE1). Los comentarios HTML no cuentan: pandoc no los lleva al .docx."""
    return MARCADOR.findall(re.sub(r"<!--.*?-->", "", texto, flags=re.S))

def estados():
    est = {}
    p = RAIZ / "00-gestion" / "estado.md"
    for m in re.finditer(r"^\| *([^|]+?) *\| *`?([^|`]+?)`? *\| *([^|]+?) *\|", p.read_text(encoding="utf-8"), re.M):
        est[m.group(2).strip()] = m.group(3).strip().lower()
    return est

def archivos_carpeta(d):
    if not d.exists(): return []
    fs = sorted(d.glob("*.md"), key=lambda f: (f.name != "00-capitulo.md",
               [int(x) if x.isdigit() else x for x in re.split(r"[.\-]", f.name)]))
    return fs

def portada(datos, ae):
    a = datos["autor"]
    lineas = [datos["universidad"].upper(), datos["facultad"], datos["carrera"], "",
              "PROYECTO INTEGRADOR FINAL", f"Actividad de Evaluación N.º {ae[-1]}" if ae.startswith("AE") else "", "",
              datos["titulo"].upper(), "", f"Autor: {a['apellido_nombre']} — DNI {a['dni']}",
              f"Docente Titular: {datos['docente']}", datos["comision"],
              f"{datos['lugar']} — {datetime.date.today().strftime('%m/%Y')}"]
    cuerpo = "\n\n".join(f"::: {{custom-style=\"Portada\"}}\n{l}\n:::" for l in lineas if l)
    return cuerpo + "\n\n```{=openxml}\n<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>\n```\n"

def nombre_salida(destino, tipo, datos):
    hoy = datetime.date.today().strftime("%Y%m%d")
    n = 1
    while list(destino.glob(f"*_{tipo}_*_v{n}.*")): n += 1
    return f"{hoy}_{tipo}_{datos.get('equipo','Equipo')}_v{n}.docx"

def main():
    ap = argparse.ArgumentParser(description="Arma documentos .docx/PDF desde Markdown.")
    ap.add_argument("modo", choices=["informe", "documento"])
    ap.add_argument("objetivo", nargs="+", help="informe: la AE (p. ej. AE2); documento: archivos .md o carpetas")
    ap.add_argument("--tipo", help="documento: tipo documental del nombre de salida (p. ej. Instrumento32)")
    ap.add_argument("--destino", help="carpeta de salida relativa a la raíz, según la consigna")
    ap.add_argument("--formato", default="docx", choices=["docx", "pdf"])
    ap.add_argument("--prueba", action="store_true"); a = ap.parse_args()
    if not a.prueba and not a.destino: ap.error("falta --destino (o --prueba para escribir en build/)")
    datos = yaml_simple(INF / "datos-autor.yaml")
    partes, errores = [], []
    tmp = pathlib.Path(tempfile.mkdtemp())
    if a.modo == "informe":
        ae = a.objetivo[0].upper()
        if ae not in ENTREGAS: sys.exit(f"AE sin composición definida en ENTREGAS: {ae}")
        cfg = ENTREGAS[ae]; tipo = f"Informe{ae}"
        pp = tmp / "00-portada.md"; pp.write_text(portada(datos, ae), encoding="utf-8"); partes.append(pp)
        if cfg["resumen"]:
            r = INF / "00-resumen.md"; partes.append(r)
            palabras = len(re.findall(r"\w+", re.sub(r"^#.*$", "", r.read_text(encoding="utf-8"), flags=re.M)))
            if palabras > 600: errores.append(f"El Resumen tiene {palabras} palabras (máximo 600).")
        for c in cfg["caps"]:
            fs = archivos_carpeta(INF / c)
            if not fs and not a.prueba: errores.append(f"Falta el capítulo {c} en informe/.")
            partes += fs
        if not CITEPROC: partes.append(INF / "bibliografia.md")
        for patron in cfg["anexos"]:
            if patron.startswith("@"): partes.append(RAIZ / patron[1:])
            else: partes += sorted(INF.glob(patron))
        if not a.prueba:
            for f in partes:
                if not f.exists() or tmp in f.parents: continue
                marcas = marcadores(f.read_text(encoding="utf-8"))
                if marcas:
                    rel = f.relative_to(RAIZ).as_posix()
                    errores.append(f"Marcadores pendientes en {rel}: {len(marcas)} (p. ej. {marcas[0][:60]}).")
            est = estados()
            for f in partes:
                rel = f.relative_to(RAIZ).as_posix() if RAIZ in f.parents else None
                if rel and rel.startswith("informe/cap-") and not rel.endswith("00-capitulo.md") and not est.get(rel, "").startswith("aprobada"):
                    errores.append(f"Sección no aprobada: {rel} ({est.get(rel, 'sin estado')}).")
    else:
        if not a.tipo: ap.error("el modo documento requiere --tipo")
        tipo = a.tipo
        for o in a.objetivo:
            p = RAIZ / o
            if p.is_dir(): partes += archivos_carpeta(p)
            elif p.suffix == ".md" and p.exists(): partes.append(p)
            else: errores.append(f"No existe o no es Markdown: {o}")
    if errores:
        print("No se generó el documento. Controles previos no satisfechos:"); [print(" -", e) for e in errores]; sys.exit(1)
    destino = (RAIZ / "build") if a.prueba else (RAIZ / a.destino)
    destino.mkdir(parents=True, exist_ok=True); salida = destino / nombre_salida(destino, tipo, datos)
    rutas = os.pathsep.join(sorted({str(p.parent) for p in partes if p.exists()}))
    cmd = ["pandoc", *map(str, partes), "-f", "markdown", "-t", "docx", "--columns=100000",
           f"--reference-doc={REF}", f"--lua-filter={FILTRO}", f"--resource-path={rutas}", "-o", str(salida)]
    if CITEPROC:
        cmd += ["--citeproc", f"--bibliography={BIB}", f"--csl={CSL}", "-M", "lang=es-AR",
                "-M", "reference-section-title=BIBLIOGRAFÍA"]
    subprocess.run(cmd, check=True)
    print(salida)
    if a.formato == "pdf":
        subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(destino), str(salida)],
                       check=True, capture_output=True)
        print(salida.with_suffix(".pdf"))
    shutil.rmtree(tmp)

if __name__ == "__main__":
    main()
