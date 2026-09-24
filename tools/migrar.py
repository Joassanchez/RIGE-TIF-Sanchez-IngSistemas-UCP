#!/usr/bin/env python3
"""Migración única: .docx del TIF -> Markdown por apartado.

Uso: python tools/migrar.py <archivo.docx> <origen>
Convierte con pandoc, normaliza títulos (formato directo -> títulos Markdown)
y corta en un archivo por apartado dentro de informe/. No altera el contenido.
"""
import re, sys, subprocess, pathlib, unicodedata, shutil, json

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ROM = {"I":1,"II":2,"III":3,"IV":4,"V":5,"VI":6,"VII":7,"VIII":8,"IX":9,"X":10,"XI":11,"XII":12,"XIII":13}

VACIAS = {"de","del","la","el","los","las","y","o","a","al","en","por","que","su","sus","un","una"}
def slug(t, n=4):
    t = unicodedata.normalize("NFKD", t).encode("ascii","ignore").decode().lower()
    pal = [w for w in re.split(r"[^a-z0-9]+", t) if w and w not in VACIAS]
    return "-".join(pal[:n])

def convertir(docx, media_dir):
    return subprocess.run(["pandoc", str(docx), "-t", "markdown-simple_tables-multiline_tables-raw_html-bracketed_spans-native_spans-smart", "--wrap=none",
                           "--lua-filter", str(RAIZ / "tools" / "migracion" / "sin-anchos.lua"),
                           f"--extract-media={media_dir}"],
                          check=True, capture_output=True, text=True).stdout

def titulo(linea):
    m = re.match(r"^(#+\s*)?\*\*(.+?)\*\*\s*$", linea.strip())
    return m.group(2).strip() if m else None

def normalizar(md):
    """Devuelve lista de (nivel, texto) para títulos y líneas de contenido."""
    out, pend_cap = [], None
    for ln in md.split("\n"):
        t = titulo(ln)
        if t is None:
            if pend_cap and ln.strip():
                out.append(("#", f"{pend_cap}")); pend_cap = None
            out.append((None, ln)); continue
        if re.fullmatch(r"[IVX]+", t):
            pend_cap = t; continue
        if pend_cap:
            out.append(("#", f"{pend_cap} · {t}")); pend_cap = None; continue
        m = re.match(r"^([IVX]+)((?:\.\d+)+) · (.+)$", t)
        if m:
            nivel = 1 + m.group(2).count(".")
            out.append(("#"*min(nivel,4), t)); continue
        if re.match(r"^A\.[IVX]+(\.\d+)+ · ", t):
            out.append(("##", t)); continue
        if re.match(r"^ANEXO [IVX]+ — ", t) or t in ("RESUMEN",) or t.startswith("BIBLIOGRAF"):
            out.append(("#", t)); continue
        if t == "ANEXOS":
            continue
        if ln.lstrip().startswith("#"):
            out.append((ln.split()[0], t)); continue
        out.append((None, ln))
    return out

def escribir(p, texto):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(texto.strip("\n") + "\n", encoding="utf-8")

def main(docx, origen):
    docx = pathlib.Path(docx)
    tmpmedia = RAIZ / "informe" / "figuras" / origen
    md = convertir(docx, tmpmedia)
    md = md.replace(str(tmpmedia) + "/", f"../figuras/{origen}/")
    items = normalizar(md)
    bloques, actual = [], {"clave": ("preambulo",), "lineas": []}
    ctx = {"cap": None, "anexo": None}
    for nivel, txt in items:
        if nivel in ("#", "##"):
            if nivel == "#":
                m = re.match(r"^([IVX]+) · ", txt)
                if m:   ctx = {"cap": m.group(1), "anexo": None}; clave = ("cap", m.group(1), "00")
                elif txt.startswith("ANEXO"):
                    num = re.match(r"^ANEXO ([IVX]+)", txt).group(1)
                    ctx = {"cap": None, "anexo": num}; clave = ("anexo", num, txt)
                elif txt == "RESUMEN": ctx = {"cap": None, "anexo": None}; clave = ("resumen",)
                elif txt.startswith("BIBLIOGRAF"): ctx = {"cap": None, "anexo": None}; clave = ("biblio", txt)
                elif ctx["cap"]: clave = ("cap", ctx["cap"], txt)
                else: clave = ("otro", txt)
            else:
                if ctx["cap"]: clave = ("cap", ctx["cap"], txt)
                elif ctx["anexo"]:
                    actual["lineas"].append(f"## {txt}"); continue
                else: clave = ("otro", txt)
            bloques.append(actual); actual = {"clave": clave, "lineas": [f"{nivel} {txt}"]}
        elif nivel:
            actual["lineas"].append(f"{nivel} {txt}")
        else:
            actual["lineas"].append(txt)
    bloques.append(actual)
    creados = []
    for b in bloques:
        k, texto = b["clave"], "\n".join(b["lineas"])
        if not texto.strip(): continue
        if k[0] == "preambulo":
            p = RAIZ / "tools" / "migracion" / f"{origen}-portada.md"
        elif k[0] == "resumen":
            p = RAIZ / "informe" / "00-resumen.md"
        elif k[0] == "cap":
            n = ROM[k[1]]
            if k[2] == "00": p = RAIZ / "informe" / f"cap-{n:02d}" / "00-capitulo.md"
            else:
                num = k[2].split(" · ")[0]
                p = RAIZ / "informe" / f"cap-{n:02d}" / f"{num}-{slug(k[2].split(' · ',1)[-1])}.md"
        elif k[0] == "anexo":
            if origen == "ae1" and k[1] == "III":
                p = RAIZ / "00-gestion" / "anexo-III.md"
            else:
                p = RAIZ / "informe" / "anexos" / f"anexo-{k[1]}-{origen}-{slug(k[2].split(' — ',1)[-1])}.md"
        elif k[0] == "biblio":
            p = RAIZ / "tools" / "migracion" / f"{origen}-bibliografia.md"
        else:
            p = RAIZ / "tools" / "migracion" / f"{origen}-{slug(k[1])}.md"
        if p.exists(): texto = p.read_text(encoding="utf-8") + "\n\n" + texto
        escribir(p, texto); creados.append(str(p.relative_to(RAIZ)))
    print(json.dumps(sorted(set(creados)), indent=1, ensure_ascii=False))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
