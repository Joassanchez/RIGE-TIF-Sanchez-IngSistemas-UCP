# ADR-046 — Cierre del presupuesto tras ADR-041 y ADR-042: la iteración 2 toma 2 h del margen de estabilización, y la cláusula de contingencia posterga la explicación en prosa y la vista web de permisos

- Estado: aceptado (28/09/2026), A1 + B1
- Fecha: 28/09/2026
- Capítulos afectados: Cap. V (V.4, Tablas 18 y 19 y párrafos de las líneas 16, 49, 67 y 69; V.1, Tabla 14; V.5); libro (`iteraciones.md`); Cap. III (III.3, «se planifican dentro de esa cifra»)
- Origen: pendiente AD-23 (`00-gestion/pendientes.md`); ADR-042, consecuencias («total ≈ 138 h a reconciliar con las 136 h»; «hay que cubrir 10 h» en la Tabla 19); pasada posterior a la validación, fase 5
- Relacionado: ADR-030 (presupuesto y contingencia; su condición de invalidación), ADR-035 (RF-10 Should), ADR-036 (`--explicar` sin horas nuevas), ADR-037 P3 y ADR-044/045 (la estabilización absorbe acreditaciones de Should), ADR-040 (medición final), ADR-041 (consulta de permisos por línea de comandos)

### Contexto

**Tabla 18 después de ADR-041 y ADR-042** (`informe/cap-05/V.4-cronograma.md`, líneas 20 a 45; ADR-042, tabla de movimientos) [R]:

| Iteración | Capacidad (V.4, línea 16) | Plan actual | Movimientos | Plan resultante |
|---|---|---|---|---|
| 1 | 34 | 34 | — | 34 |
| 2 | 51 | 51 | −4 RF-10 · −4 vista web de permiso · +6 RF-03 · +4 permisos por línea de comandos | **53** |
| 3 | 34 | 34 | +4 vista web de permiso · −6 RF-03 · +2 hallazgos por línea de comandos | 34 |
| 4 | 17 | 17 | — | 17 |
| **Total** | **136** | 136 | | **138** |

El exceso es de **2 h** y cae entero en la **iteración 2**. La iteración 3 queda justa en su capacidad.

**Tabla 19 después de ADR-042.** Salen RF-03 (6 h), porque ahora no se sacrifica, y RF-10 (4 h), porque ya no tiene horas. La cláusula debe absorber **45 h**, un tercio de 136. Ese tercio lo exige la consigna (exigencia vii; `catedra/AE2-plantilla-informe.md`, línea 269; `catedra/AE2-guia.md`, línea 665) [R].

**Lo que queda protegido** (V.4, línea 69, más ADR-041 y ADR-042): trazabilidad y ejecutabilidad de cada etiqueta; RNF-02; RNF-01, 04 y 05; CU-01 mínimo con la advertencia de versión (RF-05); CU-03 con RF-02, RF-06, RF-08 y RF-09; y ahora también RF-03 y la consulta de permisos por línea de comandos, que es la vía del agente en la medición final (ADR-041).

**Lo que se puede postergar hoy:**

| Postergación | Horas |
|---|---|
| Should sin horas | 0 |
| Regeneración automática del oráculo → manual | 2 |
| RF-04 · descubrimiento completo | 8 |
| RF-07 · hallazgos: 12 de núcleo + 2 de vista web + 2 de línea de comandos | 16 |
| Estabilización, reducida a 6 h (desde 17) | 11 |
| **Total** | **37** |

Faltan **8 h** para el tercio, así que la cláusula **no cumple la consigna**. Es la condición de invalidación de ADR-030 («una caída… que la Tabla 19 no absorbe»), activada no por una caída mayor sino porque el núcleo protegido creció.

**Carga de la estabilización.** Hoy la estabilización (17 h) absorbe, sin horas propias, la corrida manual y el oráculo reducido en Windows (ADR-037 P3), la acreditación de RNF-07 (ADR-044) y la medición por etapas en ambas plataformas (ADR-045) [R]. Por diseño, todo eso es lo primero que cae si la estabilización se reduce.

**Dos datos que habilitan una salida:**
- **La medición final no usa la explicación en prosa.** El agente responde contra una hoja de respuestas cerrada (`01-relevamiento/linea-base/DISENO-medicion-agentes.md`, líneas 195 y 255), y el indicador de OE-2 exige la decisión y la regla determinante, no la explicación (`informe/cap-01/I.2-mision-vision-objetivos-proyecto.md`, línea 22) [R].
- **RF-09 sí interviene en la medición:** el caso C-4c («un `edit: allow` global anula la protección nativa del modo plan») es uno de los doce del criterio principal (misma fuente, línea 162) [R]. No se puede postergar sin tocar el criterio de 8 de 12.

### Alternativas evaluadas

**Eje 1 · Las 138 h frente a las 136 h**
- **A1:** la iteración 2 toma 2 h del margen de la iteración 4. La estabilización pasa de 17 a 15 h; el plan queda 34/53/34/15 = 136.
- **A2:** estimar la consulta de permisos por línea de comandos en el mínimo del rango (3 h, ADR-041) y recortar 1 h de la estabilización.
- **A3:** tomar 2 h de la reserva documental (54 h).

**Eje 2 · Las 8 h que faltan en la Tabla 19**
- **B1:** postergar, en contingencia, la **explicación en lenguaje natural** de las decisiones de permiso (5 h, «Explicación mediante plantillas deterministas», Tabla 18) y la **vista web de consulta de permiso** (4 h). La decisión, la cadena y la regla determinante siguen por línea de comandos. La estabilización se reduce hasta cubrir lo que falta.
- **B2:** postergar RF-09 (≈4 h; es una suposición: la tarea de 12 h de RF-08, RF-09 y RF-10 repartida en partes iguales).
- **B3:** declarar que la cláusula absorbe menos de un tercio.
- **B4:** que la reserva documental absorba parte de la caída (reemplazo parcial de ADR-030).

### Análisis (trade-offs)

**Eje 1.**
- **A1** usa el margen para lo que se declaró: V.4, línea 49, dice que «la cuarta iteración opera como margen para la corrección de defectos». No toca ninguna estimación ni la reserva. Costo: 2 h menos de estabilización, que ya carga las acreditaciones de Should. Por diseño (ADR-037 P3), si falta tiempo cae la acreditación de Windows o de RNF-07, no un Must. Además la capacidad de la iteración 2 (51 h) queda superada en el plan, y eso se declara: la iteración 2 toma 2 h del margen.
- **A2** ajusta una estimación para que cierre la cuenta. Es lo primero que detecta un evaluador («¿por qué 3 y no 4?»), y ADR-042 ya dijo que 4 era el punto medio [I].
- **A3** contradice ADR-030: la reserva tiene entregables con fecha fija y, además, ya financia la medición con agentes (ADR-040, 16 a 23 h en la Ventana).

**Eje 2.**
- **B1** aplica el criterio que la propia Tabla 19 declara (línea 67): «se posterga primero lo que no interviene en la medición final ni en la mitigación del riesgo principal». La explicación en prosa no interviene en ninguna de las dos (datos del contexto). La vista web de permiso tampoco, porque el agente consulta por línea de comandos (ADR-041) y la decisión sigue disponible por esa vía (ADR-042 ya la proponía como candidata).
  - **Costo principal:** en contingencia, RIGE pierde temporalmente la explicación, que IV.1 presenta como el diferencial del producto. Lo que sobrevive es la decisión con su cadena y su regla determinante, que ninguna solución relevada ofrece (HA-5). El diferencial se debilita, pero no desaparece.
  - **Otro costo:** V.4, línea 69, protege hoy «CU-03 con RF-02». Hay que precisar que se protege la decisión de RF-02 y no su explicación.
- **B2** rompe el caso C-4c del criterio principal (8 de 12) y exige reescribir I.3.4. Se descarta.
- **B3** incumple la consigna. Se descarta.
- **B4** reabre ADR-030 para usar como contingencia una reserva que ya está comprometida. Se descarta por la misma razón que A3.

**Cuenta de B1 con A1** (estabilización de 15 h):

| Orden | Qué se posterga | Horas | Acumulado |
|---|---|---|---|
| 1 | Should RF-10, RF-11, RNF-06, RNF-07 y RNF-08, que carecen de horas asignadas (incluye las acreditaciones de Windows y de RNF-07 dentro de la estabilización) | 0 | 0 |
| 2 | Regeneración automática de los resultados de referencia → manual, registrada en la bitácora | 2 | 2 |
| 3 | Vista web de consulta de permiso; la decisión sigue por línea de comandos | 4 | 6 |
| 4 | Explicación en lenguaje natural de las decisiones de permiso (plantillas de RF-02 y `--explicar`) | 5 | 11 |
| 5 | RF-04 · descubrimiento completo; se conservan las entradas de archivo del v1 | 8 | 19 |
| 6 | RF-07 · hallazgos, con su vista web y su salida por línea de comandos (CU-04) | 16 | 35 |
| 7 | Estabilización, reducida de 15 h a 5 h | 10 | 45 |

Estabilización mínima de 5 h, contra las 6 de la versión aprobada: alcanza para la regresión, la prueba de clonado y el archivo de lectura de la etiqueta congelada [S].

**Orden entre 3 y 4.** La vista web se posterga antes que la explicación porque la explicación es el diferencial. Con este orden, una caída de 6 h o menos no toca la explicación.

### Recomendación y fundamento

Recomendación del ingeniero: **A1 + B1.**

- **A1** cierra el presupuesto en 136 h sin retocar estimaciones ni la reserva. El exceso se toma del margen que V.4 declara como tal.
- **B1** devuelve a la cláusula su capacidad de absorber un tercio, aplicando el criterio que la tabla ya declara y sin tocar nada de lo que interviene en la medición final ni en el riesgo principal.

**Cambios de texto que implica** (se aplican en `/corregir` de V.4, V.1, V.5 y el libro, fase 5):
- **V.4, línea 16:** se conserva la capacidad por iteración (34/51/34/17) y se agrega que el plan asigna 53 h a la iteración 2 con cargo a 2 h del margen de la cuarta.
- **V.4, Tabla 18:**
  - Iteración 2: fila de RF-08, RF-09 y RF-10 → RF-08 y RF-09, 8 h; sale la vista web de permiso; entra «Salida estructurada por línea de comandos: valores y decisiones de permiso, con esquema versionado y `--explicar`» (RF-03), 10 h. Subtotal 53.
  - Iteración 3: entra «Vista web de consulta de permiso» (RF-02), 4 h; sale RF-03; la tarea de hallazgos agrega su salida por línea de comandos (+2 h). Subtotal 34.
  - Iteración 4: 15 h. Total 136.
- **V.4, línea 18:** «los requisitos Must ocupan la totalidad de las 136 h técnicas» sigue siendo cierto.
- **V.4, línea 49:** «Los cuatro requisitos Should» → «Los cinco»; la estabilización de la iteración 4 incorpora la acreditación de RNF-06 y RNF-07 y la medición por etapas, sin horas propias (ADR-037 P3, ADR-044, ADR-045).
- **V.4, Tabla 19 y línea 67:** la tabla de arriba; el párrafo se reescribe, porque su fundamento («sin RF-03, el OE-1 pierde únicamente su verificación por esa interfaz») dejó de ser cierto (ADR-042).
- **V.4, línea 69:** se agregan RF-03 y la consulta de permisos por línea de comandos a lo que no se sacrifica, y se precisa que en CU-03 se protege la decisión de RF-02, no su explicación.
- **III.3, línea 20:** «se planifican dentro de esa cifra» sigue siendo cierto con A1. Sin cambio.

**Condición que invalidaría la decisión:**
- que la medición final pase a usar la explicación, por ejemplo con casos corregidos sobre el texto de `--explicar`: entonces el punto 4 de la Tabla 19 queda protegido y vuelve a faltar ese hueco;
- que la estabilización real de las etiquetas anteriores muestre que 5 h no alcanzan para la etiqueta congelada;
- que la iteración 2 cierre con más de 2 h de desvío: entonces la estabilización ya no puede absorberlo sin tocar los Should, y hay que replanificar la iteración 3.

### Decisión del autor

**Aceptado por el autor el 28/09/2026: A1 + B1.**

### Consecuencias

Se aplican en la fase 5 de la pasada: V.4 (Tablas 18 y 19, líneas 16, 49, 67 y 69), V.1 (Tabla 14), V.2, V.5, `03-requisitos/libro/iteraciones.md`. ADR-030 no se reemplaza: su cláusula vuelve a absorber un tercio. Se registra en el Anexo III con AD-04. Cierra AD-23.

### Evidencia

`informe/cap-05/V.4-cronograma.md` (líneas 16, 18, 20 a 45, 49, 53 a 69); ADR-030, ADR-035, ADR-036, ADR-037, ADR-040, ADR-041, ADR-042, ADR-044, ADR-045; `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (líneas 145, 162, 195, 255); `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (línea 22); `informe/cap-05/V.5-descripcion-producto-minimo-viable.md` (Tabla 20, CU-03); `catedra/AE2-plantilla-informe.md` (línea 269); `catedra/AE2-guia.md` (línea 665).
