# Línea base

La línea de base vigente es la de **ADR-098**: el banco estratificado de `ecologica/`, medido el 20 y el 21/10/2026 con `build` y Charles (`gpt-6.1-sol`, k = 3). Resultado y frase de la línea de base: `verificacion/20261021-LB-ADR098/LEEME.md`.

Las mediciones del 13 y el 14/10/2026 (atribución con 24 casos, modificación y sondas) son **antecedente**. Se conservan sus análisis porque los citan el Anexo VI y los ADR 081, 088 y 090. Sus datos crudos se archivaron fuera del repositorio con SHA-256 (`verificacion/20261020-archivo-evidencia/LEEME.md`).

## Vigente (ADR-098)

| Ruta | Qué es |
|---|---|
| `ecologica/` | Banco de problemas (`banco.md`), especificación (`espec.py`), tareas, corpus de detección, escenarios y respuestas. Guía de uso: `ecologica/LEEME.md` |
| `vm/` | Lo que entra al contenedor (imagen `rige-linea-base:1.18.25`): `Dockerfile`, `contenedor.sh`, `medir.sh`, arnés `simulado/`, proyecto base `casos/comun/` y documentación sin conexión `docs/` |
| `herramientas/` | Lo que corre en el anfitrión: generación, corrección y análisis (`generar-ecologica.py`, `corregir_ecologica.py`, `corregir_deteccion.py`, `analizar.py`, `analizar_ecologica.py`), con sus pruebas |
| `tarifas-congeladas-20261001.json` | Tarifas congeladas para valorizar el consumo (ADR-076; Anexo I, A.I.10) |
| `verificacion/20261021-LB-ADR098/` | Tanda real: informes por dimensión, `casos-con-error.md` y estado de la tanda |
| `verificacion/20261019-admision/`, `verificacion/20261015-exploracion/` | Admisión nativa del banco, sin agente |
| `verificacion/20261020-archivo-evidencia/` | Ubicación y SHA-256 de la evidencia que queda fuera del repositorio |

## Antecedente (13 y 14/10/2026)

| Ruta | Qué es | Quién lo cita |
|---|---|---|
| `DISENO-medicion-agentes.md` | Diseño de la medición de atribución, versión 2.0 (ADR-053, 076, 078 y 079) | ADR-055 |
| `respuestas.md`, `respuestas.json` | Hoja de respuestas de los 24 casos de atribución | Anexo VI, ADR-081 |
| `modificacion/` | Tareas y respuestas de la medición de modificación (ADR-085 y 086) | Anexo VI, ADR-088 |
| `sondas/` | Sondas R y E (ADR-089) | Anexo VI |
| `tarifas-congeladas-20261014-p3.json`, `catalogo-modelos-20261013.json` | Tarifas y catálogo de la tanda P3 | — |
| `verificacion/20261013-*`, `verificacion/20261014-*` | Análisis, adjudicación del autor, captura estática, permisos y tareas. De `20261013-LB-principal-sol/` queda solo `registro.jsonl` (ADR-098, Contexto 8) | Anexo VI, ADR-081, 088, 090 y 098 |

## Relevamiento de la práctica

| Ruta | Qué es |
|---|---|
| `PROTOCOLO-relevamiento-delegacion.md`, `relevamiento-delegacion.md` | Protocolo y resultado del relevamiento de la práctica de delegación (P1) y del error de los agentes (P2) |
| `borrador-encuesta-practica.md`, `encuesta-practica-form.gs` | Encuesta de práctica y pedido a la referente (ADR-040) |

El laboratorio pasó a `../opencode/` (`laboratorio-verificacion.md`).
