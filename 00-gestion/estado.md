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

El estado de cada sección no cambia hasta que se aplica `/corregir`, que la devuelve a `borrador`. El 25/09/2026 se aplicó el grupo A (`00-gestion/revisiones/20260925-correcciones-grupo-A.md`) sobre I.1, I.2, I.5, I.6 (salvo I.6.6), II.5 y II.6.1 (solo formato, M-03), y sobre los Anexos I y II y la bibliografía, que no tienen fila en la tabla de estados.

| Sección | Decisión | Cuándo |
|---|---|---|
| I.3 (I.3.1 a I.3.4) | ADR-040 (línea de base con agentes, criterio 8 de 12) | Ventana del AE1 |
| II.2, II.3, II.6.3 | ADR-040 (instrumento, encuesta, amenazas) | Ventana del AE1 |
| I.2.3 y OE-4 (Tabla 1) | ADR-040 (IB-1 e IB-2, tiempo de resolución y «protocolo con participantes»); ADR-040 no lista I.2 (grupo A, sección 6) | Ventana del AE1, con I.3 |
| I.1.2 (exclusión de la referente) e I.6.5 (razón de la medición con agentes) | ADR-040; ADR-041 (grupo A, C-7) | Ventana del AE1, con I.3 |
| Resumen, II.2.3, II.3, II.6 (Hallazgo 3, II.6.2, Tabla 19) | P-03, P-04, P-06, P-08 a P-10; AD-07 en el resumen («plataforma de escritorio») | Ventana del AE1 (grupo C) |
| III.1, III.2 (Tabla 4, Figura 1) | V-01 (estado real de la validación); V-02 (Figura 1 inexistente) | Después de la sesión de validación |
| III.4 (L-06, L-10 a L-13), III.5 (RF-03, RF-07, RF-10, RNF-06, RNF-07, RNF-08) | ADR-036, ADR-037, ADR-041, ADR-042, ADR-044; V-01 | Después de la sesión de validación |
| IV.1 | ADR-037 (plataformas, contenedor solo para el oráculo) | Después de la sesión de validación |
| V.1, V.2, V.4, V.5 | ADR-041, ADR-042 (Tablas 18 y 19), ADR-037 y ADR-044 (estabilización) | Después de la sesión de validación |

El orden acordado es: decisiones cerradas (25/09/2026) → sesión de validación con la referente → una sola pasada de `/corregir` sobre el libro y los Caps. III, IV y V → Cap. X → prototipo v1 (Guía AE2, sección 14: validar antes de redactar).

## Sesión de validación con la referente (Instrumento 31)

| Elemento | Estado |
|---|---|
| Guía y acta | `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md` (v2); antecedente v1 del 22/09 en la misma carpeta |
| Contenido | Entorno (E-01, E-02) · límites L-01 a L-13 · decisiones de ingeniería (conocimiento) · 23 requisitos · 9 entidades y 11 relaciones · 13 reglas · vocabulario · prototipo v0 · consultas |
| Faltan antes de enviarla | Herramienta y enlace de la maqueta del v0 (sección 7) |
| Sesión | No realizada; fecha, canal y duración pendientes |

## Diseño (`04-diseno/`, ADR-043)

| Sección de `04-diseno/README.md` | Estado |
|---|---|
| 1 · Decisiones de arquitectura | Completa (14 ADR) |
| 2 · Modelo de datos | Pendiente del diseño del v1 (R-08) |
| 3 · Canal de integración continua | Pendiente del diseño del v1 (R-08) |

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
