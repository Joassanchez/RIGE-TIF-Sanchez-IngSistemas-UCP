# Estado del informe

Estados: `borrador` → `revisada` → `aprobada` (esta última solo la asigna el autor con `/aprobar`). Cualquier cambio posterior a la aprobación devuelve la sección a `borrador`. `aprobada (migración)` indica la versión entregada o aceptada que se migró al repositorio el 24/09/2026.

| Sección | Archivo | Estado | Entrega | Fecha |
|---|---|---|---|---|
| I.1 | `informe/cap-01/I.1-origen-proyecto.md` | aprobada (migración) | AE1 | 24/09/2026 |
| I.2 | `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` | aprobada (migración) | AE1 | 24/09/2026 |
| I.3 | `informe/cap-01/I.3-necesidad-problema-responde-proyecto.md` | aprobada (migración) | AE1 | 24/09/2026 |
| I.4 | `informe/cap-01/I.4-objetivos-desarrollo-sostenible-asociados.md` | aprobada (migración) | AE1 | 24/09/2026 |
| I.5 | `informe/cap-01/I.5-descripcion-breve-sistema-informacion.md` | aprobada (migración) | AE1 | 24/09/2026 |
| I.6 | `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` | aprobada (migración) | AE1 | 24/09/2026 |
| II.1 | `informe/cap-02/II.1-fuentes-datos-utilizadas.md` | aprobada (migración) | AE1 | 24/09/2026 |
| II.2 | `informe/cap-02/II.2-instrumentos-dinamicas-aplicadas-alcance.md` | aprobada (migración) | AE1 | 24/09/2026 |
| II.3 | `informe/cap-02/II.3-presentacion-datos-recabados.md` | aprobada (migración) | AE1 | 24/09/2026 |
| II.4 | `informe/cap-02/II.4-graficos-variables-analisis.md` | aprobada (migración) | AE1 | 24/09/2026 |
| II.5 | `informe/cap-02/II.5-analisis-informacion.md` | aprobada (migración) | AE1 | 24/09/2026 |
| II.6 | `informe/cap-02/II.6-conclusiones-relevamiento.md` | aprobada (migración) | AE1 | 24/09/2026 |
| III.1 | `informe/cap-03/III.1-entorno-sistema-informacion.md` | aprobada (migración) | AE2 | 24/09/2026 |
| III.2 | `informe/cap-03/III.2-dominio-sistema-informacion.md` | aprobada (migración) | AE2 | 24/09/2026 |
| III.3 | `informe/cap-03/III.3-alcance-sistema-alcance-proyecto.md` | aprobada (migración) | AE2 | 24/09/2026 |
| III.4 | `informe/cap-03/III.4-limites-sistema.md` | aprobada (migración) | AE2 | 24/09/2026 |
| III.5 | `informe/cap-03/III.5-catalogo-requisitos.md` | aprobada (migración) | AE2 | 24/09/2026 |
| IV.1 | `informe/cap-04/IV.1-definicion-negocios.md` | aprobada (migración) | AE2 | 24/09/2026 |
| IV.2 | `informe/cap-04/IV.2-definiciones-estrategicas-vision-mision.md` | aprobada (migración) | AE2 | 24/09/2026 |
| IV.3 | `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md` | aprobada (migración) | AE2 | 24/09/2026 |
| IV.4 | `informe/cap-04/IV.4-mapeo-competencia.md` | aprobada (migración) | AE2 | 24/09/2026 |
| V.1 | `informe/cap-05/V.1-definicion-iteraciones-sprints.md` | aprobada (migración) | AE2 | 24/09/2026 |
| V.2 | `informe/cap-05/V.2-entregables-cada-etapa.md` | aprobada (migración) | AE2 | 24/09/2026 |
| V.3 | `informe/cap-05/V.3-organizacion-equipo.md` | aprobada (migración) | AE2 | 24/09/2026 |
| V.4 | `informe/cap-05/V.4-cronograma.md` | aprobada (migración) | AE2 | 24/09/2026 |
| V.5 | `informe/cap-05/V.5-descripcion-producto-minimo-viable.md` | aprobada (migración) | AE2 | 24/09/2026 |

## Secciones con correcciones pendientes por decisiones aceptadas (25/09/2026)

El estado de cada sección no cambia hasta que se aplica `/corregir`, que la devuelve a `borrador`.

| Sección | Decisión | Cuándo |
|---|---|---|
| I.3 (I.3.1 a I.3.4) | ADR-040 (línea de base con agentes, criterio 8 de 12) | Ventana del AE1 |
| II.2, II.3, II.6.3 | ADR-040 (instrumento, encuesta, amenazas) | Ventana del AE1 |
| III.4 (L-06), III.5 · RF-03 | ADR-041 (línea de comandos con permisos) | Antes del 01/10 |
| V.1, V.4, V.5 | ADR-041; ADR-042 si se acepta | Antes del 01/10 |

## Medición de la línea base (ADR-040)

| Elemento | Estado |
|---|---|
| Diseño | `01-relevamiento/linea-base/DISENO-medicion-agentes.md` v1.1 |
| Casos | 16 escenarios escritos; ninguno verificado en la VM |
| Hoja de respuestas | Reconstruida; abierta hasta la fase 2 |
| Modelos | Opus 5.5 · Sonnet 5 · Haiku 4.5 (registrados) |
| Agente de la referente | Pedido enviado; archivo no recibido |
| Encuesta | Borrador; falta plataforma, comunidades y versión en inglés |
| Ejecución | Fase 0 no iniciada; ventana del 02/10 al 16/10 |

## Capítulos de la AE2 sin redactar

| Capítulo | Estado |
|---|---|
| X · Recursos del proyecto | no iniciado |

## Instrumentos

Estados: `plantilla` → `completado` (por el autor) → `revisado` (`/revisar instrumento N`) → `aprobado` (solo el autor, `/aprobar instrumento N`). Plazos según `00-gestion/pendientes.md`, U-03.

| Instrumento | Fuente | Estado | Plazo | Fecha |
|---|---|---|---|---|
| 32 · Lienzo | `instrumentos/instrumento-32-lienzo.md` | plantilla | 24/09/2026 | 25/09/2026 |
| 33 · Rivalidad | `instrumentos/instrumento-33-rivalidad.md` | plantilla | 24/09/2026 | 25/09/2026 |
| 34 · Recursos | `instrumentos/instrumento-34-recursos.md` | plantilla | 01/10/2026 | 25/09/2026 |
| 35 · Ficha del v1 | `instrumentos/instrumento-35-ficha-v1.md` | plantilla | con la etiqueta `v1` | 25/09/2026 |
