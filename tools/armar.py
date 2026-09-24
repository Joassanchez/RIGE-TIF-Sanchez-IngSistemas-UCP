#!/usr/bin/env python3
"""Arma el informe (o un capítulo/instrumento) en .docx y, opcionalmente, PDF.

Uso:
  python tools/armar.py AE2 --formato docx|pdf     → 05-entregas/ (controles previos)
  python tools/armar.py cap-04 --formato docx --prueba
  python tools/armar.py instrumento-32 --formato docx
Con --prueba no aplica los controles de estado y escribe en build/.
"""
import argparse, datetime, pathlib, re, subprocess, sys, tempfile, shutil

RAIZ = pathlib.Path(__file__).resolve().parent.parent
INF = RAIZ / "informe"
REF = RAIZ / "catedra" / "plantillas" / "reference.docx"
FILTRO = RAIZ / "tools" / "filtros" / "informe.lua"
BIB = INF / "referencias.bib"
CSL = RAIZ / "catedra" / "plantillas" / "apa.csl"
CITEPROC = BIB.exists() and "@" in BIB.read_text(encoding="utf-8")

ENTREGAS = {
    "AE1": {"caps": ["cap-01", "cap-02"], "resumen": True,
            "anexos": ["anexos/00-anexos.md", "anexos/anexo-I-ae1-*.md", "anexos/anexo-II-ae1-*.md", "@00-gestion/anexo-III.md"]},
    "AE2": {"caps": ["cap-03", "cap-04", "cap-05", "cap-10"], "resumen": False,
            "anexos": ["anexos/anexo-I-cap3-*.md", "anexos/anexo-V-cap3-*.md", "anexos/anexo-VI-cap4-*.md"]},
}
INSTRUMENTOS = {"32": "02-analisis/instrumento-32-lienzo.md", "33": "02-analisis/instrumento-33-rivalidad.md",
                "34": "03-requisitos/instrumento-34-recursos.md", "35": "src/instrumento-35-ficha-v1.md"}

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

def estados():
    est = {}
    p = RAIZ / "00-gestion" / "estado.md"
    for m in re.finditer(r"^\| *([^|]+?) *\| *`?([^|`]+?)`? *\| *([^|]+?) *\|", p.read_text(encoding="utf-8"), re.M):
        est[m.group(2).strip()] = m.group(3).strip().lower()
    return est

def archivos_cap(cap):
    d = INF / cap
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

def nombre_salida(ae, datos, fmt):
    hoy = datetime.date.today().strftime("%Y%m%d")
    base = f"{hoy}_Informe{ae}_{datos.get('equipo','Equipo')}"
    n = 1
    while list((RAIZ / "05-entregas").glob(f"*_Informe{ae}_*_v{n}.*")): n += 1
    return f"{base}_v{n}.{fmt}"

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("objetivo"); ap.add_argument("--formato", default="docx", choices=["docx", "pdf"])
    ap.add_argument("--prueba", action="store_true"); a = ap.parse_args()
    datos = yaml_simple(INF / "datos-autor.yaml")
    obj = a.objetivo; partes, errores = [], []
    tmp = pathlib.Path(tempfile.mkdtemp())
    if obj.upper() in ENTREGAS:
        ae = obj.upper(); cfg = ENTREGAS[ae]
        pp = tmp / "00-portada.md"; pp.write_text(portada(datos, ae), encoding="utf-8"); partes.append(pp)
        if cfg["resumen"]:
            r = INF / "00-resumen.md"; partes.append(r)
            palabras = len(re.findall(r"\w+", re.sub(r"^#.*$", "", r.read_text(encoding="utf-8"), flags=re.M)))
            if palabras > 600: errores.append(f"El Resumen tiene {palabras} palabras (máximo 600).")
        for c in cfg["caps"]:
            fs = archivos_cap(c)
            if not fs and not a.prueba: errores.append(f"Falta el capítulo {c} en informe/.")
            partes += fs
        if not CITEPROC: partes.append(INF / "bibliografia.md")
        for patron in cfg["anexos"]:
            if patron.startswith("@"): partes.append(RAIZ / patron[1:])
            else: partes += sorted(INF.glob(patron))
        if not a.prueba:
            est = estados()
            for f in partes:
                rel = str(f.relative_to(RAIZ)) if RAIZ in f.parents else None
                if rel and rel.startswith("informe/cap-") and not rel.endswith("00-capitulo.md") and not est.get(rel, "").startswith("aprobada"):
                    errores.append(f"Sección no aprobada: {rel} ({est.get(rel, 'sin estado')}).")
        salida_nombre = nombre_salida(ae, datos, "docx")
    elif obj.startswith("cap-"):
        partes = archivos_cap(obj); salida_nombre = f"{obj}.docx"; a.prueba = True
    elif obj.startswith("instrumento-"):
        n = obj.split("-")[1]; partes = [RAIZ / INSTRUMENTOS[n]]
        k = 1
        while list((RAIZ / "05-entregas").glob(f"*_Instrumento{n}_*_v{k}.*")): k += 1
        salida_nombre = f"{datetime.date.today():%Y%m%d}_Instrumento{n}_{datos.get('equipo','Equipo')}_v{k}.docx"
    else:
        sys.exit(f"Objetivo desconocido: {obj}")
    if errores:
        print("No se generó el documento. Controles previos no satisfechos:"); [print(" -", e) for e in errores]; sys.exit(1)
    destino = (RAIZ / "build") if a.prueba else (RAIZ / "05-entregas")
    destino.mkdir(exist_ok=True); salida = destino / salida_nombre
    if salida.exists() and not a.prueba: sys.exit(f"Ya existe {salida.name}: 05-entregas no se sobrescribe.")
    rutas = ":".join(sorted({str(p.parent) for p in partes if p.exists()}))
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
