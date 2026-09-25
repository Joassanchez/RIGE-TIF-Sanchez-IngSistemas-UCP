# RIGE — Proyecto Integrador Final

**RIGE: plataforma local para la resolución y explicación de la configuración efectiva y su procedencia en herramientas de programación basadas en agentes.**

Proyecto Integrador Final · Ingeniería en Sistemas de Información · Universidad de la Cuenca del Plata, Sede Posadas · 2026
Autor: Joaquín Sebastián Sánchez · Docente Titular: PosDr. Darío Ezequiel Díaz · Comisión A

Este repositorio reúne en un único lugar la documentación del informe, los instrumentos, el Libro de trabajo y el código del prototipo.

| Carpeta | Contenido |
|---------|-----------|
| [`informe/`](informe/) | Informe del PIF en Markdown, un archivo por apartado |
| [`00-gestion/`](00-gestion/) | Estado, pendientes, bitácora, Anexo III, decisiones (ADR) y diseño del sistema de trabajo |
| [`01-relevamiento/`](01-relevamiento/) | Evidencia del relevamiento y registro de fuentes |
| [`02-analisis/`](02-analisis/) | Análisis del entorno; Instrumentos 32 y 33 (generados) |
| [`03-requisitos/`](03-requisitos/) | Libro de trabajo (catálogo, trazabilidad, glosario…) e Instrumento 34 (generado) |
| [`04-diseno/`](04-diseno/) | Artefactos de diseño |
| [`05-entregas/`](05-entregas/) | Documentos generados y entregados |
| [`catedra/`](catedra/) | Consignas, plantillas y devoluciones en Markdown; originales de la cátedra en `originales/` |
| [`instrumentos/`](instrumentos/) | Fuente en Markdown de los instrumentos |
| [`src/`](src/) | Código de RIGE (prototipo v1 en adelante) e Instrumento 35 (generado) |
| [`tools/`](tools/) | Scripts de armado y exportación |

## Generar documentos

Requisitos: Python 3.10+, `pandoc` 3.1+, LibreOffice (para PDF) y `openpyxl` (`pip install openpyxl`).

Los scripts no fijan destinos: la carpeta de cada artefacto sale de la tabla de ubicación de `00-gestion/reglas-catedra.md` (sección 8).

```bash
python tools/armar.py informe AE2 --formato pdf --destino 05-entregas
python tools/armar.py documento informe/cap-04 --tipo cap-04 --prueba          # de prueba → build/
python tools/armar.py documento instrumentos/instrumento-32-lienzo.md --tipo Instrumento32 --destino 02-analisis
python tools/exportar_libro.py --destino 03-requisitos
python tools/construir_reference.py                                           # regenera tools/reference.docx
```

`armar.py` solo genera una entrega si todas sus secciones están aprobadas en `00-gestion/estado.md`; con `--prueba` omite ese control y escribe en `build/`.


