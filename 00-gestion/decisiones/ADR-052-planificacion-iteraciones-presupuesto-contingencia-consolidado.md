# ADR-052 — Planificación: cuatro iteraciones cerradas en los hitos, presupuesto de 190 h reales (136 técnicas), capacidad por días y cláusula de contingencia de un tercio

- Estado: aceptado (28/09/2026)
- Fecha: 28/09/2026
- Capítulos afectados: Cap. V (V.1 Tabla 14; V.2; V.4 Tablas 17 a 19; V.5; Figura 3); Cap. III (III.3, último párrafo); Cap. IV (IV.1, Tabla 10); Cap. X; libro (`iteraciones.md`); `tools/figura_cronograma.py`
- Origen: consolidación del 28/09/2026 (pendiente LI-01). No es una decisión nueva: reúne lo vigente de ADR-028, ADR-030, ADR-046 y ADR-047, todos aceptados.
- Reemplaza: ADR-028, ADR-030, ADR-046 y ADR-047. Sus archivos se eliminaron el 28/09/2026 (quedan en el historial de git).
- Relacionado: ADR-051 (qué ofrece cada interfaz), ADR-056 (14 Must de 23), ADR-053 (la línea de base se ejecuta con cargo a la reserva de la Ventana), ADR-054 y ADR-055 (acreditaciones de Should dentro de la estabilización).
- **Modificado por ADR-064** (aceptado el 29/09/2026): horas de RF-16 (+3 h), RNF-09 (+1 h) y RNF-10 (dentro de la tarea del evaluador), financiadas con la estabilización (15 h → 11 h); la fila 7 de la Tabla 19 pasa a «reducida de 11 h a 1 h». Presupuesto, capacidad por días y contingencia de un tercio sin cambios.

### Contexto

- **Período y hitos.** El período técnico va del 21/09 al 14/11/2026. La cátedra fija una cadencia que no admite desplazamiento: v1 en la semana 8, v2 en la 11, v3 en la 13 y versión congelada en la 14.
- **Autoría y consigna.** El proyecto es individual. Las horas reales del autor constan en el Instrumento 24. La consigna exige una cláusula de contingencia ante la caída de **un tercio** de la capacidad técnica (exigencia vii; `catedra/AE2-plantilla-informe.md`, línea 269; `catedra/AE2-guia.md`, línea 665).

La planificación se ajustó tres veces después de aceptada:

| Paso | ADR | Qué fijó | Por qué cambió |
|---|---|---|---|
| 1 | 028 | Cuatro iteraciones de duración variable, cerradas en los hitos | — |
| 2 | 030 | 28 h semanales reales, reducción del 15 %, 190 h efectivas (136 + 54), contingencia de un tercio | — |
| 3 | 046 | La iteración 2 toma 2 h del margen; la contingencia posterga la vista web de permisos y la explicación en prosa | ADR-051 subieron el plan a 138 h y sacaron RF-03 de la contingencia; la cláusula dejó de absorber un tercio |
| 4 | 047 | La vista web de permisos vuelve a la iteración 2; la capacidad se reparte por días | Los criterios validados de RF-02 y RF-03 exigen paridad web al 24/10; las semanas declaradas no coincidían con las fechas |

### Alternativas evaluadas

**Eje 1 · Duración de las iteraciones**
- **D-A:** Duración fija de dos semanas.
- **D-B:** Duración variable, cada iteración cerrada en un hito.

**Eje 2 · Base del presupuesto**
- **P-A:** Duración nominal del cuatrimestre.
- **P-B:** Horas semanales reales en dos líneas (técnica y reserva), con reducción del 15 %.

**Eje 3 · Reparto de la capacidad entre iteraciones**
- **R-A:** En proporción a las semanas (34/51/34/17).
- **R-B:** En proporción a los días (28/59/33/16).

**Eje 4 · Cómo absorber un tercio (45 h) con el núcleo protegido ampliado**
- **C-A:** Postergar la vista web de permisos y la explicación en prosa (B1 de ADR-046).
- **C-B:** Postergar RF-09.
- **C-C:** Declarar que la cláusula absorbe menos de un tercio.
- **C-D:** Usar la reserva documental como contingencia.

**Eje 5 · Paridad web de RF-02 y RF-03**
- **V-A:** La vista web de permisos en la iteración 2.
- **V-B:** RF-02 y RF-03 cierran en la iteración 3.
- **V-C:** Separar la paridad web del criterio.

### Análisis (trade-offs)

- **D-A:** sus cierres no coinciden con los hitos, así que cada entrega exigiría un corte ad hoc.
- **D-B:** alinea cada cierre con un entregable evaluado. Sus costos son una capacidad desigual por iteración y una velocidad que no se transfiere de una iteración a la siguiente.
- **P-A:** no corresponde a la dedicación real, y lleva a comprometer requisitos que no se construyen.
- **P-B:** separa lo que financia requisitos de lo que tiene fecha fija. La reserva no es margen de contingencia.
- **R-A:** contradice las fechas de la Tabla 14 (11, 23, 13 y 6 días).
- **R-B:** es un cálculo sobre datos del repositorio. El reparto uniforme de la reducción del 15 % es un supuesto declarado en V.4.
- **C-A:** aplica el criterio de la propia Tabla 19. Ni la vista web de permisos ni la explicación intervienen en la medición final, porque el agente consulta por CLI y responde contra una hoja cerrada. En contingencia se debilita el diferencial del producto, pero se conserva la decisión con su regla determinante.
- **C-B:** rompe el caso C-4c del criterio principal (8 de 12).
- **C-C:** incumple la consigna.
- **C-D:** usa una reserva ya comprometida con entregables de fecha fija y con la línea de base.
- **V-A:** no toca fichas validadas. Con la capacidad por días entra con holgura.
- **V-B y V-C:** modifican lo que la referente confirmó y dejan la paridad para el final.

### Recomendación y fundamento

**D-B + P-B + R-B + C-A + V-A**, que es lo que el autor ya aceptó por partes. Este registro no cambia ninguna decisión; solo las reúne.

**Condiciones que invalidarían la decisión:**
1. **La cátedra modifica las fechas de los hitos.** Se redistribuyen los límites de las iteraciones sin cambiar el criterio.
2. **Cae más de un tercio de la capacidad técnica.** La Tabla 19 ya no alcanza y hay que modificar el MVP del V.5 con un ADR de reemplazo.
3. **La iteración 1 traslada más de 6 h a la iteración 2.** La holgura no alcanza y se aplica la Tabla 19.
4. **La reducción del 15 % se concentra en la iteración 2**, por ejemplo por la fecha de los exámenes, que no consta en el repositorio. La capacidad por días de esa iteración baja.
5. **La medición final pasa a usar la explicación en prosa.** El punto 4 de la Tabla 19 queda protegido y vuelve a faltar ese hueco.
6. **La estabilización real muestra que 5 h no alcanzan** para la etiqueta congelada.

### Decisión del autor

**Aceptado por el autor el 28/09/2026** (consolidación). Las decisiones de fondo ya están aceptadas: ADR-028 y ADR-030 (retroactivos) y ADR-046 y ADR-047 (28/09/2026). La aceptación de este registro solo autoriza la consolidación.

### Consecuencias

**Iteraciones (V.1, Tabla 14):**

| Iteración | Fechas | Hito | Días | Capacidad | Plan | Diferencia |
|---|---|---|---|---|---|---|
| 1 | 21/09 al 01/10 | v1 (S8) | 11 | 28 | 34 | +6 (declarado) |
| 2 | 02/10 al 24/10 | v2 (S11) | 23 | 59 | 57 | −2 |
| 3 | 26/10 al 07/11 | v3 (S13) | 13 | 33 | 30 | −3 |
| 4 | 09/11 al 14/11 | Congelada (S14) | 6 | 16 | 15 | −1 |
| **Total** | | | **53** | **136** | **136** | **0** |

- Los incrementos son verticales, por capacidad y no por componente.
- El corte es por fecha: lo que no satisface la definición de terminado vuelve a pendientes y se replanifica.
- La cuarta iteración es margen de estabilización, sin funcionalidad nueva. Absorbe, sin horas propias, la acreditación de RNF-06 y RNF-07 (Should), que es lo primero que cae si se reduce.

**Presupuesto (V.4, Tabla 17):**
- 28 h × 8 semanas = 224 h: 160 técnicas y 64 de reserva.
- La reducción del 15 % resta 34 h: 24 técnicas y 10 de reserva.
- El efectivo es **190 h: 136 técnicas y 54 de reserva**.
- La reserva se reparte en 14 h para el cierre de la AE2, 20 h para la Ventana, 13 h y 7 h. La línea de base con agentes (ADR-053, 16 a 23 h) se ejecuta con cargo a la Ventana.
- La fase de cierre (48 h, semanas 15 y 16) se declara aparte, fuera de las 190 h.
- En la defensa conviene citar primero las **136 h**, que son las que determinan el alcance.

**Cláusula de contingencia (V.4, Tabla 19):**

| Orden | Qué se posterga | Horas | Acumulado |
|---|---|---|---|
| 1 | Should sin horas (RF-10, RF-11, RNF-06, RNF-07, RNF-08), incluidas las acreditaciones dentro de la estabilización | 0 | 0 |
| 2 | Regeneración automática del oráculo → manual, registrada en la bitácora | 2 | 2 |
| 3 | Vista web de consulta de permiso (queda sin cumplir la paridad web de RF-02 y RF-03) | 4 | 6 |
| 4 | Explicación en prosa de las decisiones de permiso (plantillas y `--explicar`) | 5 | 11 |
| 5 | RF-04 · descubrimiento completo (se conservan las entradas del v1) | 8 | 19 |
| 6 | RF-07 · hallazgos, con su vista web y su salida por CLI | 16 | 35 |
| 7 | Estabilización, de 15 h a 5 h | 10 | 45 |

**Qué nunca se sacrifica:**
- la trazabilidad y la ejecutabilidad de cada etiqueta;
- RNF-02, y RNF-01, 04 y 05;
- CU-01 mínimo, con la advertencia de versión;
- CU-02;
- CU-03, con la decisión de RF-02 (no su explicación), RF-06, RF-08 y RF-09;
- RF-03 (antes CU-05, retirado como caso de uso por ADR-059; el número CU-05 designa hoy «Explorar los agentes del proyecto»): valores y permisos por CLI, que es la vía del agente en la medición final.

**Anexo III:** sin cambios. Sus filas D-33, D-35, D-38, D-39 y D-40 siguen siendo la deliberación del informe.

**Al aceptarse:**
- eliminar ADR-028, 030, 046 y 047;
- en `INDICE.md`, reemplazar sus cuatro filas por esta;
- en `tools/figura_cronograma.py`, cambiar los comentarios que citan ADR-046 y ADR-047 (líneas 4, 27 y 35) por ADR-052. No cambia el cálculo.

### Evidencia

- `informe/cap-05/V.1-definicion-iteraciones-sprints.md` (Tabla 14; líneas 16 y 18)
- `informe/cap-05/V.4-cronograma.md` (líneas 3, 16, 18 y 49; Tablas 17 a 19)
- `03-requisitos/libro/iteraciones.md`
- `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (líneas 162, 195 y 255)
- `catedra/AE2-plantilla-informe.md` (línea 269)
- `catedra/AE2-guia.md` (línea 665)
- Anexo III, D-33, D-35, D-38 a D-40
- Historial de git: ADR-028, 030, 046 y 047
