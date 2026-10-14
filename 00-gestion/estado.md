# Estado del informe

Estados: `borrador` → `revisada` → `aprobada` (esta última solo la asigna el autor con `/aprobar`). Cualquier cambio posterior a la aprobación devuelve la sección a `borrador`. `aprobada (migración)` indica la versión entregada o aceptada que se migró al repositorio el 24/09/2026.

| Sección | Archivo | Estado | Entrega | Fecha |
|---|---|---|---|---|
| I.1 | `informe/cap-01/I.1-origen-proyecto.md` | borrador | AE1 | 13/10/2026 |
| I.2 | `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` | borrador | AE1 | 13/10/2026 |
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
| III.1 | `informe/cap-03/III.1-entorno-sistema-informacion.md` | aprobada | AE2 | 02/10/2026 |
| III.2 | `informe/cap-03/III.2-dominio-sistema-informacion.md` | aprobada | AE2 | 02/10/2026 |
| III.3 | `informe/cap-03/III.3-alcance-sistema-alcance-proyecto.md` | aprobada | AE2 | 02/10/2026 |
| III.4 | `informe/cap-03/III.4-limites-sistema.md` | aprobada | AE2 | 02/10/2026 |
| III.5 | `informe/cap-03/III.5-catalogo-requisitos.md` | aprobada | AE2 | 02/10/2026 |
| IV.1 | `informe/cap-04/IV.1-definicion-negocios.md` | aprobada | AE2 | 02/10/2026 |
| IV.2 | `informe/cap-04/IV.2-definiciones-estrategicas-vision-mision.md` | aprobada | AE2 | 02/10/2026 |
| IV.3 | `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md` | aprobada | AE2 | 02/10/2026 |
| IV.4 | `informe/cap-04/IV.4-mapeo-competencia.md` | aprobada | AE2 | 02/10/2026 |
| V.1 | `informe/cap-05/V.1-definicion-iteraciones-sprints.md` | aprobada | AE2 | 02/10/2026 |
| V.2 | `informe/cap-05/V.2-entregables-cada-etapa.md` | aprobada | AE2 | 02/10/2026 |
| V.3 | `informe/cap-05/V.3-organizacion-equipo.md` | aprobada | AE2 | 02/10/2026 |
| V.4 | `informe/cap-05/V.4-cronograma.md` | aprobada | AE2 | 02/10/2026 |
| V.5 | `informe/cap-05/V.5-descripcion-producto-minimo-viable.md` | aprobada | AE2 | 02/10/2026 |
| X.1 | `informe/cap-10/X.1-recursos-humanos.md` | aprobada | AE2 | 02/10/2026 |
| X.2 | `informe/cap-10/X.2-recursos-fisicos-materiales.md` | aprobada | AE2 | 02/10/2026 |
| X.3 | `informe/cap-10/X.3-recursos-financieros.md` | aprobada | AE2 | 02/10/2026 |
| X.4 | `informe/cap-10/X.4-recursos-tecnologicos.md` | aprobada | AE2 | 02/10/2026 |
| X.5 | `informe/cap-10/X.5-otros-recursos.md` | aprobada | AE2 | 02/10/2026 |

## Correcciones pendientes del AE1

Las secciones del AE1 afectadas por ADR-053, por los cambios aprobados sobre la entrevista (P-03 a P-10) y por los demás hallazgos del grupo C se corrigen en la Ventana. La lista de trabajo está en `00-gestion/ventana-ae1.md`. Cada sección corregida vuelve a `borrador`.

## Sesión de validación con la referente (Instrumento 31)

| Elemento | Estado |
|---|---|
| Guía y acta | `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md` (v2); reemplaza a la v1 del 22/09/2026, retirada |
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
| 3 · Canal de integración continua | Completa por remisión a ADR-062; `.github/workflows/ci.yml` (matriz Ubuntu/Windows). Primera corrida verde el 30/09/2026 22:26 (corrida `36801042650`, commit `11c852e`); verde en `main` sobre `b1432eb` (01/10/2026). Matriz cambiada a `ubuntu-26.04` y `windows-latest` el 01/10/2026 (ADR-076, búsqueda de ejecutores). Trabajo `referencia-nativa` agregado el 09/10/2026 (V1-12): ejecuta OpenCode 1.18.25 real sobre los escenarios y falla si difiere de `REFERENCIA.json`. Última corrida verde sobre `main`: `c9322e7` (10/10/2026) |
| Prototipo v1 | **Recorrido vertical completo en `main`** (unido el 05/10/2026, `b6657ba`; V1-01 a V1-11 con ADR-067, 375 pruebas, mapa en `src/pruebas/README.md`). V1-12 (09/10/2026, `7233fd0`): referencia nativa verificada en el CI contra el binario real. Verificado por el ingeniero el 09/10/2026 contra el dictamen (DV2-01): comparación con el comando nativo y prueba de RNF-03 capaz de fallar. Precisiones de C8 en ADR-062 (05/10/2026, pendientes de conformidad del autor). Falta (autor): repositorio privado con la cátedra como colaboradora, prueba de clonado por otra persona (Instrumento 35, 35.2), etiqueta `v1` y `/comprobar-v1` (DV2-02) |

## Medición de la línea base (ADR-053, modificado por ADR-078, ADR-079, ADR-082 y ADR-083)

| Elemento | Estado |
|---|---|
| Decisión | ADR-078 aceptado el 09/10/2026: procedimiento delegado como objeto; datos del AE1 como prueba informal sin registros (no se usan); error como criterio principal y tokens como secundario; agente con la skill nativa `customize-opencode` disponible; costo humano relevado con la encuesta. Anexo III, D-41, actualizado. Corrección del 13/10/2026: se retiró el motivo de reclutamiento de su análisis |
| Consulta al docente | No se espera (decisión del autor, 13/10/2026; ADR-078). Envío en paralelo recomendado (LB-01) |
| Relevamiento de la práctica | Protocolo y resultados en `01-relevamiento/linea-base/` (09/10/2026; fecha de corte 09/10/2026). P1: skill nativa verificada por ejecución, `agent create`, incidencias #14216 y #22247, oferta de skills; falta la confirmación escrita de la referente. P2: estudios con error apreciable del modelo solo y mejora con validador determinista; ningún estudio sobre precedencia entre fuentes. Pendientes en LB-03 |
| Diseño | `DISENO-medicion-agentes.md` v2.0 (ADR-078, 079 y 080; 13/10/2026): regla de ramas, 24 casos, dos brazos, segundo ejecutor «Charles» |
| Casos | 24 escenarios verificados contra OpenCode 1.18.25 en el contenedor (13/10/2026); hoja de respuestas cerrada; C-3f corregido (ADR-081) |
| Hoja de respuestas | Cerrada el 13/10/2026 |
| Modelos | `gpt-6.1-sol`, el único `gpt-6` disponible con la suscripción en 1.18.25 (fase 0, 13/10/2026). `gpt-6-astra` y `gpt-6-luna` no están disponibles (ADR-082). P3 (`build` + `gpt-5.6-luna`) es opcional, con la aprobación del autor y una tarifa registrada. Catálogo de modelos congelado del 13/10/2026 |
| Agente de la referente | Recibido el 13/10/2026 («Charles», `gpt-6-luna`); segundo ejecutor (ADR-079), medido con `gpt-6.1-sol` como cambio declarado (ADR-082). Confirmación escrita de la práctica: sin respuesta (AD-17) |
| Encuesta | Lista para publicar en Google Forms (script); falta piloto, canales y publicación (AD-18) |
| Contenedor | `rige-linea-base:1.18.25` reconstruida el 13/10/2026 con la ficha MED-5 (catálogo congelado, preparación del participante, Charles como `[AUX] Charles`, detención por cuota y archivos generados excluidos del hash); ensayo y fase 0 limpios (`verificacion/20261013-fase0/`) |
| Ejecución | **Hecha el 13/10/2026**, k = 3, sin piloto (ADR-082). `build` + `gpt-6.1-sol`, de 22:07 a 22:51; Charles + `gpt-6.1-sol`, de 22:52 a 23:49. Fueron 72 + 72 ejecuciones completas. Una tanda previa (21:32 a 21:36) se descartó por una falla del instrumento |
| Corrección y adjudicación | Recorrección por ADR-083 (14/10/2026). 61 adjudicaciones manuales del ingeniero por delegación del autor; criterio estricto en C-3b y C-3d confirmado por el autor (`verificacion/20261014-analisis-LB/`) |
| Resultado | Las dos mediciones son válidas y caen en la **rama P**: `build` tiene 1 caso con problema (C-3b) y Charles, 3 (C-3b, C-3d, C-4e). IV.3 da «Reordena». Sin errores de valor: todos los errores son de fuente. Equivalente: USD 3,84 y 4,01. Sensibilidad: con un criterio laxo en C-3b y C-3d, `build` pasaría a la rama N. **Pendiente: discusión con el autor antes de propagar al informe** |

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
| 24 · Presupuesto de horas | `instrumentos/instrumento-24-presupuesto-horas.md` | por asignar (autor) · armado el 02/10/2026 desde V.3, V.4 y la hoja Iteraciones; `.docx` v1 en `00-gestion/` | sin plazo propio | 02/10/2026 |
| 27 · Delimitación | `instrumentos/instrumento-27-delimitacion.md` | por asignar (autor) · armado el 02/10/2026 desde III.1, III.2.1 y III.4, sin plantilla de la Clase 8; `.docx` v1 en `03-requisitos/` | sin plazo propio | 02/10/2026 |
| 32 · Lienzo | `instrumentos/instrumento-32-lienzo.md` | plantilla | 24/09/2026 | 25/09/2026 |
| 33 · Rivalidad | `instrumentos/instrumento-33-rivalidad.md` | plantilla | 24/09/2026 | 25/09/2026 |
| 34 · Recursos | `instrumentos/instrumento-34-recursos.md` | plantilla | 01/10/2026 | 25/09/2026 |
| 35 · Ficha del v1 | `instrumentos/instrumento-35-ficha-v1.md` | plantilla | con la etiqueta `v1` | 25/09/2026 |
