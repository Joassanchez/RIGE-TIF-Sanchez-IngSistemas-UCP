# Correcciones del Cap. III (AE2)

Lista de trabajo de la discusión del Cap. III, sección por sección, sobre `00-gestion/revisiones/documento_de_correcciones.md`. Se registra cada corrección, su decisión, la fuente y lo que afecta. Las correcciones se aplican con `/corregir` (redactor) cuando el capítulo completo está discutido.

## Método acordado (01/10/2026)

- Cambio del 01/10/2026 (decisión del autor): cada sección se corrige en su propio archivo de `informe/` en cuanto se cierra su discusión, sin borradores. Por capítulo, primero el contenido (III → IV → V → X). Al final de cada capítulo, una pasada transversal: estilo natural dentro de lo impersonal, rayas reemplazadas por comas o paréntesis, redundancias entre subcapítulos y menciones a la IA como herramienta de apoyo.
- Prueba A/B a ciegas sobre III.1: el redactor actual (Opus 5.5) frente a Codex (`gpt-6.1-sol`), cada uno sobre una copia en el área temporal, con la misma misión. El autor evalúa sin saber cuál es cuál: (a) fidelidad a las correcciones, (b) sin datos inventados, (c) reglas de la cátedra y (d) calidad del español. Con el resultado se propone un ADR sobre el redactor.

## Decisiones generales

| # | Corrección | Decisión del autor | Fuente | Afecta |
|---|---|---|---|---|
| G-1 | III.5 · Unificar la validación | Redacción final (01/10/2026): «Los veintisiete requisitos constan validados con la referente en el acta de validación». Según el autor, los siete requisitos posteriores a la sesión se validaron verbalmente y se registran en una extensión del acta, que el autor fecha y hace firmar (U-04). Las 27 fichas quedan en «Validado», y la trazabilidad de los siete remite a «acta de validación, extensión» | Acta y su extensión, `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md` | III.5, Anexo I, libro |
| G-2 | III.5 · Eliminar el proyecto público de referencia | Revertida por el autor: se mantiene ADR-055 (opción B). Proyecto público: openchamber (ADR-071, propuesto). La consulta a la referente queda como complemento | ADR-055, ADR-071 | III.5 (se elimina la frase de la «excepción» de RNF-07 por ADR-045), Anexo I y libro (RNF-07, CA-1), `fuentes.md` |
| G-3 | III.2 · Eliminar o rediseñar la Figura 1 | Rediseño completo: la plantilla exige la figura del modelo del dominio | `catedra/AE2-plantilla-informe.md`, líneas 108 a 110 | III.2, Figura 1 |
| G-4 | III.1 · Retirar la Ley N.º 25.326 | Se trata en III.1 (ver abajo). Corrección del ingeniero: el 01/10/2026 informó por error que III.1 no la mencionaba; figura en el párrafo de exclusiones. Además está en II.5, el Anexo II y el Anexo I del AE1 (Ventana) | `informe/cap-03/III.1-entorno-sistema-informacion.md`, línea 21 | III.1; Caps. I y II (Ventana) |

## Por sección

### III.1 · Entorno

Discutida el 01/10/2026; todo aceptado por el autor.

| # | Corrección | Decisión |
|---|---|---|
| C-1 | Retirar la Ley N.º 25.326 del párrafo de exclusiones | Se retira. Los elementos considerados y excluidos pasan de cinco a cuatro. Se conserva la reserva del contenido de las variables por el riesgo de exposición de credenciales |
| H-1 | Cuatro filas citan el Cap. I, y la plantilla pide fuente del Cap. II o del acta | Reanclar cada fila a su fuente en el Cap. II o en el acta; si no existe, conservar el Cap. I |
| H-2 | Encabezados de la tabla distintos de la plantilla | Usar «Fuente (Cap. II / acta)» e «Implicancia de diseño declarada» |
| H-3 | «Advierte cuando una variable relevante no está definida» no tiene requisito (AR-08, V-2) | Opción (a): se quita la advertencia y queda «lo declara». La opción (b), un criterio en RF-07, se discute en el análisis de los RF |
| H-4 | La fila del editor sugiere que RIGE abre el editor | «Informa la localización en formato ruta:línea:columna, que el editor reconoce; la edición ocurre fuera del sistema» (RF-12, ADR-059) |
| H-5 | El segundo párrafo es metatexto | Pasarlo a una nota al pie |
| H-6 | El cierre remite al Cap. VI con una oración larga | Mantener la remisión, reducida a una cláusula |
| T | Pasada transversal | Estilo natural dentro de lo impersonal y redundancias. III.1 no tiene rayas |

**Texto adoptado:** la versión B de la prueba A/B (Codex), elegida por el ingeniero por delegación del autor y aplicada en `informe/cap-03/` el 01/10/2026. El redactor sigue siendo Opus 5.5, con una regla nueva: conservar las remisiones existentes. Queda pendiente reforzar el ancla del desarrollador con la entrevista (Anexo I del AE1, A.I.5) en lugar del factor social del PESTEL.

### III.2 · Dominio

Discutida el 01/10/2026; todo aceptado por el autor.

| # | Corrección | Decisión |
|---|---|---|
| F-1 | Figura 1 ilegible | Rediseño como diagrama de clases conceptual UML (Larman, 2004): cajas solo con el nombre, asociaciones con nombre y multiplicidad en cada extremo (`1`, `0..*`, `1..*`, `0..1`), sin flechas salvo la especialización Agente → Elemento. Disposición en tres franjas: arriba Proyecto → Resolución; a la izquierda Entrada → Declaración → Sustitución; a la derecha Elemento, Agente y Regla de permiso; Hallazgo entre ambas columnas, con `{xor}` sobre sus tres asociaciones. Solo las notas `{xor}` y `{ordenada}`. Se genera con `tools/figura_modelo_dominio.py` (matplotlib), y `03-requisitos/modelo-dominio.mmd` se reemplaza como fuente |
| F-2 | Tabla 4 en otra notación | Pasa a la notación UML de la figura. No cambian las cardinalidades, salvo H-1 |
| H-1 | «Un agente invoca muchos subagentes: 1 a N» | Verificar en el tag 1.18.25 si un subagente puede ser invocado por varios agentes; si se confirma, pasa a N a N (`0..*` a `0..*`) en la tabla, la figura, el libro (`entidades.md`) y el Anexo V |
| H-2 | La leyenda de la Tabla 4 dice «correcciones posteriores que se le informan» | Criterio de G-1: «validadas en la sesión del 26/09/2026», y las tres precisiones descriptas sin «se le informan». Igual en la leyenda de la Figura 1 |
| H-3 | «26/09/2026» repetido 8 veces | Una vez al abrir III.2.3 y en las leyendas |
| H-4 | Tabla 5 con cobertura parcial (PV-08) | Se acota ahora: cada fila dice solo lo que RF-01 compromete; skills, estado de carga de plugins y agrupación LSP por lenguaje van a una nota |
| H-5 | Remisión vieja a RF-14 | Ajustarla al enunciado vigente (estado resuelto completo del proyecto por línea de comandos, ADR-059) |
| H-6 | Seis rayas | Pasada transversal |
| M-15 | Asterisco escapado en III.2 | El original no tenía `*`; no aplica |
| T5 | Tabla 5: Instrucción (RF-04) y Comando (RF-01) no están cubiertos por su requisito | Opción (a): «—» y fuera del compromiso del período; se revisa en el análisis de los RF de III.5 |
| — | Aplicación | III.2 aplicada en `informe/cap-03/` y Figura 1 regenerada con `tools/figura_modelo_dominio.py` el 01/10/2026. Se eliminó `03-requisitos/modelo-dominio.mmd`. Al aplicar el resto del capítulo, propagar al libro (`entidades.md`: invocación N a N; `reglas.md`: RD-03 sin rayas) |

### III.3 · Alcance

Discutida el 01/10/2026; todo aceptado por el autor.

| # | Corrección | Decisión |
|---|---|---|
| A-1 | ¿Son correctas las funciones? ¿Conviene mejorar el AE1? | No se rehacen las seis funciones. Se corrige la F6 del AE1 en la Ventana (estado diferido, apertura en el editor, exportación a archivo) y la mención de F4 a la matriz y a la consulta inversa (`ventana-ae1.md`, §7) |
| H-1 | Tabla 7 con unidades mezcladas y desordenada | Se ordena por función (F1 a F6), con una fila por capacidad y las columnas Función · Capacidad · Requisito · Estado. La línea de comandos sale de la tabla y queda en el párrafo, porque es un canal |
| H-2 | «Exámenes y feriados» | «Reducción prevista de disponibilidad del quince por ciento», sin detalle. Las cifras se mantienen (224, 190 y 136 h) |
| H-3 | Oración de unas cien palabras en el segundo párrafo | Se parte en tres: adaptador y versión; requisitos e interfaces; mediciones y artefactos |
| H-4 | Una raya | Pasada transversal |
| P | Coherencia con V.1 sobre el cierre de la iteración 1 con `v1` (ADR-052) | Se trata en el Cap. V |

### III.4 · Límites

El autor los da por correctos (sin cambios mayores). Discutida el 01/10/2026; todo aceptado.

| # | Corrección | Decisión |
|---|---|---|
| H-1 | Remisión a la regla de apareamiento | **Revertido:** el ingeniero informó por error que la regla no existía. Figura en la plantilla, línea 139 («por cada elemento incorporado al alcance, uno excluido con su motivo»). Se restituye la remisión, con el agregado «de modo que la frontera se lea de ambos lados» |
| H-2 | L-06 «revisada en parte después de la sesión… pendiente de convalidación», y en el cierre «se informa a la referente» y «confirmadas sin observaciones» (AR-07, punto 3) | Criterio de G-1: «Validado · acta del 26/09/2026, decisión L-06, con una precisión posterior (listado de agentes, RF-16)». Se quita la salvedad del cierre |
| H-3 | La fila L-09 incluye «Exportación del estado resuelto» (anterior a ADR-059) | «Estado resuelto completo del proyecto (RF-14)» |
| H-4 | «Acta del 26/09/2026» 21 veces y «nuevo en esta entrega» 6; el segundo párrafo enumera los límites nuevos | La fecha una vez en el texto y otra en la leyenda; celdas abreviadas; se conserva la marca «nuevo» en la tabla y se acorta la enumeración |
| H-5 | Encabezado «Estado de validación» | «Estado y constancia», como en la plantilla; «Qué se incluye» se conserva como columna agregada |
| H-6 | Frase casi textual del recuadro de la plantilla | Reformular con palabras propias |
| H-7 | «Se advierte» en la fila de variables | «Se declara», como en III.1 |
| — | Alerta para III.5 | Las instrucciones están dentro de los límites del sistema, pero ningún requisito las compromete en el período (Tabla 5 de III.2) |

### III.5 · Catálogo

Pendiente de discusión: tipos de hallazgo (los seis de ADR-059) y análisis ingenieril de los RF (validez, completitud, requisitos nuevos). Hallazgos del ingeniero: «máquina virtual» pasa a «contenedor» en RNF-07 (PV-01); V-1 en RF-10 y V-2 en RF-07 (AR-08).
