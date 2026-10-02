#!/usr/bin/env python3
"""Genera tools/reference.docx: estilos del informe según la plantilla
oficial de la AE2 y los Arts. 20.º y 21.º (A4, márgenes 2,5/3 cm, Times New Roman 12,
interlineado doble, justificado, notas en 10, todo en negro). Tamaños de títulos, carátulas,
sangría y tablas (Times New Roman 10) tomados del modelo del autor en tools/modelo-autor.docx."""
import subprocess, zipfile, re, pathlib, tempfile, shutil

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DEST = RAIZ / "tools" / "reference.docx"

TNR = '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/>'
NEGRO = '<w:color w:val="000000"/>'

def estilo(sid, nombre, ppr, rpr, basado="Normal", tipo="paragraph", extra=""):
    b = f'<w:basedOn w:val="{basado}"/>' if basado else ""
    return (f'<w:style w:type="{tipo}" w:customStyle="1" w:styleId="{sid}"><w:name w:val="{nombre}"/>{b}'
            f'<w:qFormat/>{extra}<w:pPr>{ppr}</w:pPr><w:rPr>{rpr}</w:rPr></w:style>')

DOBLE_J = '<w:spacing w:before="0" w:after="0" w:line="480" w:lineRule="auto"/><w:jc w:val="both"/>'
# Párrafo de cuerpo: 10 pt antes y después, sangría de primera línea de 1,27 cm.
CUERPO = '<w:spacing w:before="200" w:after="200" w:line="480" w:lineRule="auto"/><w:ind w:firstLine="720"/><w:jc w:val="both"/>'
REEMPLAZOS = {
    "Normal": estilo("Normal", "Normal", DOBLE_J, TNR + NEGRO + '<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="es-AR"/>', basado=None),
    "BodyText": estilo("BodyText", "Body Text", CUERPO, TNR + NEGRO),
    "FirstParagraph": estilo("FirstParagraph", "First Paragraph", CUERPO, TNR + NEGRO, basado="BodyText"),
    "Compact": estilo("Compact", "Compact", '<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:ind w:firstLine="0"/><w:jc w:val="left"/>', TNR + NEGRO + '<w:sz w:val="20"/><w:szCs w:val="20"/>', basado="BodyText"),
    "FootnoteText": estilo("FootnoteText", "Footnote Text", '<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="both"/>', TNR + NEGRO + '<w:sz w:val="20"/><w:szCs w:val="20"/>'),
    "Bibliography": estilo("Bibliography", "Bibliography", DOBLE_J + '<w:ind w:left="720" w:hanging="720"/>', TNR + NEGRO),
    "Caption": estilo("Caption", "Caption", '<w:spacing w:before="120" w:after="240" w:line="240" w:lineRule="auto"/><w:jc w:val="left"/>', TNR + NEGRO + '<w:i/><w:sz w:val="20"/><w:szCs w:val="20"/>'),
    "TableCaption": estilo("TableCaption", "Table Caption", '<w:spacing w:before="120" w:after="240" w:line="240" w:lineRule="auto"/>', TNR + NEGRO + '<w:i/><w:sz w:val="20"/>', basado="Caption"),
    "ImageCaption": estilo("ImageCaption", "Image Caption", '<w:spacing w:before="120" w:after="240" w:line="240" w:lineRule="auto"/>', TNR + NEGRO + '<w:i/><w:sz w:val="20"/>', basado="Caption"),
    "Title": estilo("Title", "Title", '<w:spacing w:before="0" w:after="240" w:line="360" w:lineRule="auto"/><w:jc w:val="center"/>', TNR + NEGRO + '<w:b/><w:sz w:val="28"/>'),
    "BlockText": estilo("BlockText", "Block Text", DOBLE_J + '<w:ind w:left="720" w:right="720"/>', TNR + NEGRO),
}
# Títulos: nivel 1 en 14 (centrado, 1,5), apartado en 13 y subapartados en 12, todos en negrita.
for n, (sz, antes, despues, linea) in {1: (28, 0, 240, 360), 2: (26, 240, 200, 480), 3: (24, 240, 0, 480), 4: (24, 120, 0, 480)}.items():
    REEMPLAZOS[f"Heading{n}"] = estilo(
        f"Heading{n}", f"heading {n}",
        f'<w:keepNext/><w:spacing w:before="{antes}" w:after="{despues}" w:line="{linea}" w:lineRule="auto"/><w:ind w:firstLine="0"/><w:jc w:val="{"center" if n == 1 else "left"}"/><w:outlineLvl w:val="{n-1}"/>',
        TNR + NEGRO + f'<w:b/><w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>', extra='<w:next w:val="BodyText"/>')

NUEVOS = [
    estilo("CaratulaNumeral", "Carátula Numeral", '<w:spacing w:before="0" w:after="240" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/>', TNR + NEGRO + '<w:b/><w:sz w:val="28"/><w:szCs w:val="28"/>'),
    estilo("CaratulaTitulo", "Carátula Título", '<w:spacing w:before="0" w:after="0" w:line="360" w:lineRule="auto"/><w:jc w:val="center"/><w:outlineLvl w:val="0"/>', TNR + NEGRO + '<w:b/><w:caps/><w:sz w:val="28"/><w:szCs w:val="28"/>'),
    estilo("Portada", "Portada", '<w:spacing w:before="200" w:after="200" w:line="480" w:lineRule="auto"/><w:ind w:firstLine="0"/><w:jc w:val="center"/>', TNR + NEGRO),
]

# La portada (primera hoja) no lleva número; la numeración empieza en 1 en la hoja siguiente.
SECT = ('<w:sectPr><w:footerReference w:type="default" r:id="rIdPie"/><w:footerReference w:type="first" r:id="rIdPieVacio"/>'
        '<w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1417" w:right="1701" w:bottom="1417" w:left="1701" w:header="720" w:footer="720" w:gutter="0"/>'
        '<w:pgNumType w:start="0"/><w:titlePg/></w:sectPr>')
PIE = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
       '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
       '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>'
       '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>'
       '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>'
       '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>')
PIE_VACIO = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
             '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:ftr>')

def main():
    tmp = pathlib.Path(tempfile.mkdtemp())
    base = tmp / "base.docx"
    with open(base, "wb") as f:
        f.write(subprocess.run(["pandoc", "--print-default-data-file", "reference.docx"], check=True, capture_output=True).stdout)
    d = tmp / "x"; zipfile.ZipFile(base).extractall(d)
    st = (d / "word/styles.xml").read_text(encoding="utf-8")
    st = re.sub(r"<w:docDefaults>.*?</w:docDefaults>",
                '<w:docDefaults><w:rPrDefault><w:rPr>' + TNR + NEGRO + '<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="es-AR"/></w:rPr></w:rPrDefault>'
                '<w:pPrDefault><w:pPr><w:spacing w:after="0"/></w:pPr></w:pPrDefault></w:docDefaults>', st, flags=re.S)
    for sid, xml in REEMPLAZOS.items():
        patron = rf'<w:style [^>]*w:styleId="{sid}"[^>]*>.*?</w:style>'
        st, n = re.subn(patron, xml.replace('w:customStyle="1" ', ''), st, count=1, flags=re.S)
        if n == 0: st = st.replace("</w:styles>", xml + "</w:styles>")
    tabla = ('<w:style w:type="table" w:styleId="Table"><w:name w:val="Table"/><w:basedOn w:val="TableNormal"/><w:uiPriority w:val="99"/>'
             '<w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>'
             '<w:rPr>' + TNR + NEGRO + '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>'
             '<w:tblPr><w:tblBorders>' + ''.join(f'<w:{b} w:val="single" w:sz="4" w:space="0" w:color="000000"/>' for b in ("top","left","bottom","right","insideH","insideV")) +
             '</w:tblBorders><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr>'
             '<w:tblStylePr w:type="firstRow"><w:rPr><w:b/>' + NEGRO + '</w:rPr><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/></w:tcPr></w:tblStylePr></w:style>')
    st, n = re.subn(r'<w:style [^>]*w:styleId="Table"[^>]*>.*?</w:style>', tabla, st, count=1, flags=re.S)
    if n == 0: st = st.replace("</w:styles>", tabla + "</w:styles>")
    # color negro también en hipervínculos
    st = re.sub(r'(<w:style [^>]*w:styleId="Hyperlink".*?<w:color w:val=")[0-9A-Fa-f]{6}', r"\g<1>000000", st, flags=re.S)
    st = st.replace("</w:styles>", "".join(NUEVOS) + "</w:styles>")
    (d / "word/styles.xml").write_text(st, encoding="utf-8")
    doc = (d / "word/document.xml").read_text(encoding="utf-8")
    # La plantilla de pandoc 3.x trae el sectPr autocerrado (<w:sectPr />): se quitan ambas formas.
    doc = re.sub(r"<w:sectPr\s*/>|<w:sectPr\b.*?</w:sectPr>", "", doc, flags=re.S).replace("</w:body>", SECT + "</w:body>")
    (d / "word/document.xml").write_text(doc, encoding="utf-8")
    (d / "word/footer1.xml").write_text(PIE, encoding="utf-8")
    (d / "word/footer2.xml").write_text(PIE_VACIO, encoding="utf-8")
    rels = (d / "word/_rels/document.xml.rels").read_text(encoding="utf-8")
    pie = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer"
    rels = rels.replace("</Relationships>", f'<Relationship Id="rIdPie" Type="{pie}" Target="footer1.xml"/>'
                        f'<Relationship Id="rIdPieVacio" Type="{pie}" Target="footer2.xml"/></Relationships>')
    (d / "word/_rels/document.xml.rels").write_text(rels, encoding="utf-8")
    ct = (d / "[Content_Types].xml").read_text(encoding="utf-8")
    ct = ct.replace("</Types>", "".join(f'<Override PartName="/word/{f}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
                                        for f in ("footer1.xml", "footer2.xml")) + "</Types>")
    (d / "[Content_Types].xml").write_text(ct, encoding="utf-8")
    DEST.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(DEST, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(d.rglob("*")):
            if p.is_file(): z.write(p, p.relative_to(d))
    shutil.rmtree(tmp); print(DEST)

if __name__ == "__main__":
    main()
