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
| [`02-analisis/`](02-analisis/) | Análisis del entorno; Instrumentos 32 y 33 |
| [`03-requisitos/`](03-requisitos/) | Libro de trabajo (catálogo, trazabilidad, glosario…) e Instrumento 34 |
| [`04-diseno/`](04-diseno/) | Artefactos de diseño |
| [`catedra/`](catedra/) | Consignas, plantillas oficiales y devoluciones |
| [`05-entregas/`](05-entregas/) | Documentos generados y entregados |
| [`prototipo/`](prototipo/) | Prototipo v0 (maqueta) |
| [`src/`](src/) | Código de RIGE (prototipo v1 en adelante) |
| [`tools/`](tools/) | Scripts de armado, exportación y migración |

## Generar documentos

Requisitos: Python 3.10+, `pandoc` 3.1+, LibreOffice (para PDF) y `openpyxl` (`pip install openpyxl`).

```bash
python tools/armar.py AE2 --formato pdf            # informe de la AE2 → 05-entregas/
python tools/armar.py cap-04 --formato docx        # un capítulo, de prueba → build/
python tools/armar.py instrumento-32 --formato docx
python tools/exportar_libro.py                     # Libro de trabajo .xlsx → 03-requisitos/
python tools/construir_reference.py                # regenera el reference.docx
```

`armar.py` solo genera una entrega si todas sus secciones están aprobadas en `00-gestion/estado.md`; con `--prueba` omite ese control y escribe en `build/`.


