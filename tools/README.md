# Herramientas

| Script | Uso |
|--------|-----|
| `armar.py` | Arma el informe de una AE, un capítulo o un instrumento en `.docx`/PDF. Ver `python tools/armar.py -h`. |
| `exportar_libro.py` | Genera el Libro de trabajo oficial `.xlsx` desde `03-requisitos/libro/`. |
| `construir_reference.py` | Regenera `catedra/plantillas/reference.docx` (estilos reglamentarios). |
| `filtros/informe.lua` | Filtro de pandoc: carátulas de capítulo, saltos de página, leyendas, anchos de tabla. |
| `migrar.py` | Migración única `.docx` → Markdown por apartado (usada el 24/09/2026). |
| `migracion/` | Scripts auxiliares de la migración inicial (bibliografía, Libro de trabajo, anchos de tabla). |

Dependencias: Python 3.10+, pandoc 3.1+, LibreOffice (PDF), `openpyxl`.
