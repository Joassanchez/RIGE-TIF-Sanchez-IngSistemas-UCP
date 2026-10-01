# Estado del informe

Estados: `borrador` → `revisada` → `aprobada` (esta última solo la asigna el autor con `/aprobar`). Cualquier cambio posterior a la aprobación devuelve la sección a `borrador`. `aprobada (migración)` indica la versión entregada o aceptada que se migró al repositorio el 24/09/2026.

| Sección | Archivo | Estado | Entrega | Fecha |
|---|---|---|---|---|
| I.1 | `informe/cap-01/I.1-origen-proyecto.md` | borrador | AE1 | 25/09/2026 |
| I.2 | `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` | borrador | AE1 | 25/09/2026 |
| I.3 | `informe/cap-01/I.3-necesidad-problema-responde-proyecto.md` | aprobada (migración) | AE1 | 24/09/2026 |
| I.4 | `informe/cap-01/I.4-objetivos-desarrollo-sostenible-asociados.md` | aprobada (migración) | AE1 | 24/09/2026 |
| I.5 | `informe/cap-01/I.5-descripcion-breve-sistema-informacion.md` | borrador | AE1 | 25/09/2026 |
| I.6 | `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` | borrador | AE1 | 25/09/2026 |
| II.1 | `informe/cap-02/II.1-fuentes-datos-utilizadas.md` | aprobada (migración) | AE1 | 24/09/2026 |
| II.2 | `informe/cap-02/II.2-instrumentos-dinamicas-aplicadas-alcance.md` | aprobada (migración) | AE1 | 24/09/2026 |
| II.3 | `informe/cap-02/II.3-presentacion-datos-recabados.md` | aprobada (migración) | AE1 | 24/09/2026 |
| II.4 | `informe/cap-02/II.4-graficos-variables-analisis.md` | aprobada (migración) | AE1 | 24/09/2026 |
| II.5 | `informe/cap-02/II.5-analisis-informacion.md` | borrador | AE1 | 25/09/2026 |
| II.6 | `informe/cap-02/II.6-conclusiones-relevamiento.md` | borrador | AE1 | 25/09/2026 |
| III.1 | `informe/cap-03/III.1-entorno-sistema-informacion.md` | revisada | AE2 | 01/10/2026 |
| III.2 | `informe/cap-03/III.2-dominio-sistema-informacion.md` | revisada | AE2 | 01/10/2026 |
| III.3 | `informe/cap-03/III.3-alcance-sistema-alcance-proyecto.md` | revisada | AE2 | 01/10/2026 |
| III.4 | `informe/cap-03/III.4-limites-sistema.md` | revisada | AE2 | 01/10/2026 |
| III.5 | `informe/cap-03/III.5-catalogo-requisitos.md` | revisada | AE2 | 01/10/2026 |
| IV.1 | `informe/cap-04/IV.1-definicion-negocios.md` | borrador | AE2 | 01/10/2026 |
| IV.2 | `informe/cap-04/IV.2-definiciones-estrategicas-vision-mision.md` | borrador | AE2 | 01/10/2026 |
| IV.3 | `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md` | borrador | AE2 | 01/10/2026 |
| IV.4 | `informe/cap-04/IV.4-mapeo-competencia.md` | borrador | AE2 | 01/10/2026 |
| V.1 | `informe/cap-05/V.1-definicion-iteraciones-sprints.md` | borrador | AE2 | 29/09/2026 |
| V.2 | `informe/cap-05/V.2-entregables-cada-etapa.md` | borrador | AE2 | 29/09/2026 |
| V.3 | `informe/cap-05/V.3-organizacion-equipo.md` | aprobada (migración) | AE2 | 24/09/2026 |
| V.4 | `informe/cap-05/V.4-cronograma.md` | borrador | AE2 | 29/09/2026 |
| V.5 | `informe/cap-05/V.5-descripcion-producto-minimo-viable.md` | borrador | AE2 | 29/09/2026 |
| X.1 | `informe/cap-10/X.1-recursos-humanos.md` | revisada | AE2 | 29/09/2026 |
| X.2 | `informe/cap-10/X.2-recursos-fisicos-materiales.md` | revisada | AE2 | 28/09/2026 |
| X.3 | `informe/cap-10/X.3-recursos-financieros.md` | revisada | AE2 | 28/09/2026 |
| X.4 | `informe/cap-10/X.4-recursos-tecnologicos.md` | revisada | AE2 | 29/09/2026 |
| X.5 | `informe/cap-10/X.5-otros-recursos.md` | revisada | AE2 | 28/09/2026 |

## Correcciones pendientes del AE1

Las secciones del AE1 afectadas por ADR-053, por los cambios aprobados sobre la entrevista (P-03 a P-10) y por los demás hallazgos del grupo C se corrigen en la Ventana. La lista de trabajo está en `00-gestion/ventana-ae1.md`. Cada sección corregida vuelve a `borrador`.

## Sesión de validación con la referente (Instrumento 31)

| Elemento | Estado |
|---|---|
| Guía y acta | `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md` (v2); antecedente v1 del 22/09 en la misma carpeta |
| Contenido | Entorno (E-01, E-02) · límites L-01 a L-13 · decisiones de ingeniería (conocimiento) · 23 requisitos · 9 entidades y 11 relaciones · 13 reglas · vocabulario · prototipo v0 · consultas |
| Sesión | Realizada el 26/09/2026, 17:00, presencial, 35 minutos. Los 82 puntos confirmados sin observaciones. Acta completada el 28/09/2026 |
| Constancia de conformidad | Pendiente de firma (U-04) |
| Correcciones posteriores a la sesión | Enunciado de RNF-07 (ADR-055), tres correcciones del modelo del dominio y la iteración de RNF-02. Se informan a la referente (PV-03) |
| Datos que quedaron abiertos | Tamaño del proyecto real (la referente no dispone del dato; resuelto por ADR-055 con un proyecto público, PV-02); enlace de la maqueta; asistentes usados en la maqueta; archivo del agente del equipo (confirmado, no recibido) |

## Diseño (`04-diseno/`, D-23 del diseño del sistema)

| Sección de `04-diseno/README.md` | Estado |
|---|---|
| 1 · Decisiones de arquitectura | 16 registros aceptados en la tabla (ADR-070, guardas de arquitectura, aceptado el 01/10/2026) (incluidos ADR-061, modelo de datos, y ADR-062, distribución, web y dependencias, aceptados el 29/09/2026; ADR-062 revisado el mismo día: TypeScript 7.0.2). ADR-063 por discutir (AR-04). Método: ADR-065, reescrito el 29/09/2026 (OpenCode con gentle-ai 3.7 en modo ODD; documento por incremento propuesto por el agente y revisado hasta la conformidad) |
| 2 · Modelo de datos | Completa por remisión a ADR-061 (29/09/2026) |
| 3 · Canal de integración continua | Completa por remisión a ADR-062; `.github/workflows/ci.yml` (matriz Ubuntu/Windows). Primera corrida verde el 30/09/2026 22:26 (corrida `36801042650`, commit `11c852e`); verde en `main` sobre `b1432eb` (01/10/2026) |
| Prototipo v1 | **Incremento 0 cerrado y unido con `main` el 01/10/2026** (`b1432eb`): instalación congelada, `bun run esquema`, `bun run servir` en `127.0.0.1:4747`, CLI con contrato de salida, RNF-03 CA-1/CA-2 y RNF-09 CA-1 a CA-3; 324 pruebas; README §1 y §3 a §8 (falta §2, caso vertical). T0-01 a T0-09 con OpenCode y gentle-ai (ADR-065); T0-10 en adelante con ADR-067 (fichas y medición en `00-gestion/fichas/inc0/`). Siguiente: incremento 1 (núcleo) |

## Medición de la línea base (ADR-053)

| Elemento | Estado |
|---|---|
| Diseño | `01-relevamiento/linea-base/DISENO-medicion-agentes.md` v1.1 |
| Casos | 16 escenarios escritos; ninguno verificado en la VM |
| Hoja de respuestas | Reconstruida; abierta hasta la fase 2 |
| Modelos | Opus 5.5 · Sonnet 5 · Haiku 4.5 (registrados) |
| Agente de la referente | Pedido enviado; archivo no recibido |
| Encuesta | Borrador; falta plataforma, comunidades y versión en inglés |
| Ejecución | Fase 0 no iniciada; ventana del 02/10 al 16/10 |

## Tablero de gestión (Guía AE2, objeto 3)

| Elemento | Estado |
|---|---|
| Enlace | `https://trello.com/b/BhNydwGK` («RIGE · TIF Sánchez»), creado el 30/09/2026; cargado en `informe/datos-autor.yaml` |
| Estructura | Kanban por estado (Backlog · Por hacer · En curso, máx. 2 · En revisión) y una columna «Hecho» por iteración de la Tabla 14 (V.1). Prefijo `ItN ·` y etiqueta de color por iteración; rojo = componente bloqueante de la entrega |
| Contenido | 47 tarjetas: 5 en Hecho · It. 1 (reconstruidas desde el historial, con comentario y commit), 2 en curso, 4 en revisión, 14 por hacer, 22 en el backlog (Tabla 18, medición, condicionados, cierre y reserva) |
| Visibilidad | Privada durante la carga; vuelve a pública por acción del autor (U-05) |
| Criterio | Sin ADR todavía (ADR-067 por proponer) |

## Instrumentos

Estados: `plantilla` → `completado` (por el autor) → `revisado` (`/revisar instrumento N`) → `aprobado` (solo el autor, `/aprobar instrumento N`). Plazos según `00-gestion/pendientes.md`, U-03.

| Instrumento | Fuente | Estado | Plazo | Fecha |
|---|---|---|---|---|
| 32 · Lienzo | `instrumentos/instrumento-32-lienzo.md` | plantilla | 24/09/2026 | 25/09/2026 |
| 33 · Rivalidad | `instrumentos/instrumento-33-rivalidad.md` | plantilla | 24/09/2026 | 25/09/2026 |
| 34 · Recursos | `instrumentos/instrumento-34-recursos.md` | plantilla | 01/10/2026 | 25/09/2026 |
| 35 · Ficha del v1 | `instrumentos/instrumento-35-ficha-v1.md` | plantilla | con la etiqueta `v1` | 25/09/2026 |
