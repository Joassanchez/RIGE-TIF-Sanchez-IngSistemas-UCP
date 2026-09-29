# Herramientas del TIF

Scripts de armado y exportación de los documentos del Proyecto Integrador Final. No son necesarios para instalar ni ejecutar RIGE (ver `src/README.md`).

## Estructura del repositorio

| Carpeta | Contenido |
|---------|-----------|
| `informe/` | Informe del PIF en Markdown, un archivo por apartado |
| `00-gestion/` | Estado, pendientes, bitácora, Anexo III, decisiones (ADR), planes y diseño del sistema de trabajo |
| `01-relevamiento/` | Evidencia del relevamiento y registro de fuentes |
| `02-analisis/` | Análisis del entorno; Instrumentos 32 y 33 (generados) |
| `03-requisitos/` | Libro de trabajo (catálogo, trazabilidad, glosario…) e Instrumento 34 (generado) |
| `04-diseno/` | Artefactos de diseño |
| `05-entregas/` | Documentos generados y entregados |
| `catedra/` | Consignas, plantillas y devoluciones en Markdown; originales de la cátedra en `originales/` |
| `instrumentos/` | Fuente en Markdown de los instrumentos |
| `src/` | Código de RIGE e Instrumento 35 (generado) |
| `tools/` | Estos scripts |

## Scripts

Los scripts no fijan destinos: la carpeta de salida se indica con `--destino`, según la tabla de ubicación de artefactos de `00-gestion/reglas-catedra.md` (sección 8).

| Archivo | Uso |
|--------|-----|
| `armar.py` | Arma el informe de una AE (`informe AE2`) o cualquier documento Markdown (`documento <archivos> --tipo …`) en `.docx`/PDF. Ver `python tools/armar.py -h`. |
| `exportar_libro.py` | Genera el Libro de trabajo oficial `.xlsx` desde `03-requisitos/libro/` y el Instrumento 34. |
| `figura_cronograma.py` | Genera la Figura 3 del Cap. V (cronograma con dependencias) desde los datos de la Tabla 18, que el guion declara en su encabezado. Hay que actualizarlo cuando cambia la Tabla 18. |
| `construir_reference.py` | Regenera `reference.docx` (estilos reglamentarios). |
| `informe.lua` | Filtro de pandoc: carátulas de capítulo, saltos de página, leyendas, anchos de tabla. |
| `reference.docx` · `apa.csl` | Estilos del `.docx` y formato APA de las citas, que usa `armar.py`. |

Dependencias: Python 3.10+, pandoc 3.1+, LibreOffice (PDF), `openpyxl`, `matplotlib` (figuras). La Figura 1 del Cap. III se genera con Mermaid (`npx @mermaid-js/mermaid-cli`), desde `03-requisitos/modelo-dominio.mmd`.

## Ejemplos

```bash
python tools/armar.py informe AE2 --formato pdf --destino 05-entregas
python tools/armar.py documento informe/cap-04 --tipo cap-04 --prueba          # de prueba → build/
python tools/armar.py documento instrumentos/instrumento-32-lienzo.md --tipo Instrumento32 --destino 02-analisis
python tools/exportar_libro.py --destino 03-requisitos
python tools/construir_reference.py                                           # regenera tools/reference.docx
```

`armar.py` solo genera una entrega si todas sus secciones están aprobadas en `00-gestion/estado.md`; con `--prueba` omite ese control y escribe en `build/`.
