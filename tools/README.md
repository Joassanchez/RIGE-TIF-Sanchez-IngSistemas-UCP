# Herramientas

Los scripts no fijan destinos: la carpeta de salida se indica con `--destino`, según la tabla de ubicación de artefactos de `00-gestion/reglas-catedra.md` (sección 8).

| Archivo | Uso |
|--------|-----|
| `armar.py` | Arma el informe de una AE (`informe AE2`) o cualquier documento Markdown (`documento <archivos> --tipo …`) en `.docx`/PDF. Ver `python tools/armar.py -h`. |
| `exportar_libro.py` | Genera el Libro de trabajo oficial `.xlsx` desde `03-requisitos/libro/` y el Instrumento 34. |
| `construir_reference.py` | Regenera `reference.docx` (estilos reglamentarios). |
| `informe.lua` | Filtro de pandoc: carátulas de capítulo, saltos de página, leyendas, anchos de tabla. |
| `reference.docx` · `apa.csl` | Estilos del `.docx` y formato APA de las citas, que usa `armar.py`. |

Dependencias: Python 3.10+, pandoc 3.1+, LibreOffice (PDF), `openpyxl`.
