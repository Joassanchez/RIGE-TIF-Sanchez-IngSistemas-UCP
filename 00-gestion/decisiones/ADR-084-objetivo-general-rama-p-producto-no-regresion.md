# ADR-084 — Objetivo general tras la línea de base en la rama P: cumplimiento por OE-1 a OE-3 y no regresión del procedimiento delegado, decidido después de conocer el resultado

- Estado: reemplazado por ADR-093 (14/10/2026)
- Fecha: 14/10/2026
- **Decidido después de conocer el resultado de la línea de base** (13 y 14/10/2026). Se declara en el informe con esa fecha y ese orden.
- Capítulos afectados: Cap. I (I.2.3, I.2.4: indicador del OE-4; I.3.4, criterio de éxito); Anexo III (D-41); Anexo VI (A.VI.7, A.VI.8)
- Origen: sesión del 14/10/2026 (discusión del resultado de la línea de base con el autor)
- Modifica: ADR-079, §3 (fila de la rama P y regla «el cumplimiento del proyecto se declara sobre el ejecutor principal y el brazo indicado»). No modifica ramas, umbrales, k, casos, adjudicaciones ni el resultado
- Relacionado: ADR-080 (conjunto de aceptación de RIGE), ADR-082, ADR-083, ADR-085 (dimensión de modificación), ADR-078 (condición 4), ADR-053 (condición 1)

### Contexto

1. **Resultado** (dato: `01-relevamiento/linea-base/verificacion/20261014-analisis-LB/`). Las dos mediciones son válidas y caen en la rama P:
   - `build` + `gpt-6.1-sol`: 1 caso con problema (C-3b); IB-1 de C-2 a C-4 = 4/54;
   - Charles + `gpt-6.1-sol`: 3 casos con problema (C-3b, C-3d, C-4e);
   - cero errores de valor: todos los errores son de fuente.
2. **ADR-079, §3, rama P:** «Sin criterio de cumplimiento. La medición final se ejecuta y se informa caso por caso, en forma descriptiva». El registro no dice cómo se declara el cumplimiento del objetivo general en esa rama, aunque prevé reenunciar I.2.3 «con las ramas».
3. **`00-gestion/reglas-catedra.md`, §2:** exige un criterio de éxito derivado de la línea de base. El dictamen DEV-AE2 N.º 14/2026 pide «restituir el criterio de éxito» (DV2-08).
4. **I.2.3 vigente** conserva el criterio de ADR-053 (8 de 12 casos), el piloto y la condición 1 de ADR-053, que ya no rigen (ADR-079 y ADR-082).
5. **Sensibilidad declarada:** con un criterio laxo en C-3b y C-3d, `build` pasaría a la rama N. Las adjudicaciones de esos casos las hizo el ingeniero por delegación del autor.

### Alternativas evaluadas

- **A · Rama P literal:** objetivo general descriptivo («desarrollar RIGE y medir su efecto»), sin criterio de cumplimiento.
- **B · Criterio sobre la procedencia:** el cumplimiento pasa a depender de los errores de fuente observados (por ejemplo, que C-3b deje de ser caso con problema).
- **C · Producto más no regresión:** el cumplimiento se declara con los indicadores de OE-1 a OE-3, fijados antes de medir (ADR-080), más una condición de no regresión del procedimiento delegado en el brazo indicado, fijada antes de la medición final.

### Análisis (trade-offs)

- **A** no ajusta nada con los datos a la vista, pero deja el objetivo general sin criterio de éxito: contradice `reglas-catedra.md` §2 y DV2-08, y no responde «¿cuándo fracasa el proyecto?».
- **B** elige el indicador donde ya se observó la falla (conocimiento general: sesgo de selección del criterio posterior al dato). En `build` descansa sobre un caso, tres ejecuciones y una adjudicación sensible al criterio. Se descarta.
- **C** cambia la meta en la dirección de **afirmar menos**: no promete reducir el error del agente, que en la línea de base es bajo. Los indicadores de OE-2 ya cubrían, antes de medir, la falla observada («si es nativa, se identifica como tal»). La condición de no regresión es más estricta que la de la rama P (ninguna), puede fallar y no apunta a los casos que fallaron. Costo: se decide después del resultado y la objeción previsible es «su criterio sobre el agente es no empeorar».

### Recomendación y fundamento

**C.**

1. **El objetivo general se declara alcanzado** si se cumplen, en la versión congelada del 14/11/2026:
   - los indicadores de OE-1, OE-2 y OE-3 conforme a ADR-080;
   - la **no regresión** en la medición final de `build` + `gpt-6.1-sol`, brazo indicado: ningún caso sin problema en la línea de base pasa a tenerlo, y el IB-1 agregado de C-2 a C-4 no aumenta;
   - el criterio de la dimensión de modificación, solo si ADR-085 se acepta y su línea de base cae en una rama con criterio.
2. **Se informan siempre, en forma descriptiva:** el resultado caso por caso de los dos ejecutores y los dos brazos (ADR-079, §3), C-3b nombrado como el caso con problema del ejecutor principal, la lectura de los brazos y la sensibilidad al criterio de C-3b y C-3d.
3. **La línea de base numérica del informe** es la medida: IB-1 de C-2 a C-4 = 4/54 en `build` (7,4 %), 1 caso con problema, cero errores de valor; y en Charles, 3 casos.
4. **Readjudicación por el autor:** antes de propagar, el autor readjudica a ciegas las 18 ejecuciones de C-3b, C-3d y C-4e de los dos ejecutores, con el criterio estricto sin cambios (`.trabajo/linea-base/readjudicacion-ciega.md`). Las discrepancias con la adjudicación del ingeniero se informan; prevalece la del autor.
5. **ADR-078, condición 4, y ADR-053, condición 1:** no se activan (rama P; ADR-079 las limitó a la rama N el 13/10/2026, antes de medir). El informe lo dice con esa fecha.

**Condiciones que invalidarían la decisión:**
1. El docente, en LB-01, exige un criterio de mejora o el uso de los datos del AE1. Se reabre ADR-078 con la evidencia de la línea de base.
2. La readjudicación del autor deja a `build` sin casos con problema (rama N): se aplican la condición 4 de ADR-078 y la condición 1 de ADR-053, y este registro se reevalúa.

### Decisión del autor

**Aceptado por el autor el 14/10/2026** (alternativa C), después de conocer la línea de base de atribución (rama P) y la de modificación (no válida, ADR-086). Con ADR-086, la dimensión de modificación no aporta criterio al OE-4: el cumplimiento se declara con los indicadores de OE-1 a OE-3 y la no regresión en atribución de este registro. La readjudicación ciega del punto 4 sigue pendiente y es previa a la propagación al informe.

### Consecuencias

**Si se acepta:**
- **ADR-079:** §3, fila de la rama P y regla del cumplimiento, remiten a este registro.
- **Informe:** I.2.3 se reenuncia (objetivo general con OE-1 a OE-3 y no regresión; sin el criterio de ADR-053 ni el piloto); el indicador del OE-4 incorpora la no regresión; I.3.4 con la línea de base medida; A.VI.8 declara que el criterio se fijó después del resultado y su sensibilidad.
- **Anexo III:** D-41 se actualiza.
- **LB-01:** la consulta al docente lo incluye.

### Evidencia

- `01-relevamiento/linea-base/verificacion/20261014-analisis-LB/` (LEEME, `resumen-por-caso.txt`, `informe.md`, adjudicaciones)
- `00-gestion/decisiones/ADR-079-criterio-principal-casos-con-problema.md` (§3), `ADR-080-conjunto-escenarios-aceptacion-sin-retiro.md`
- `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (I.2.3, I.2.4)
- `00-gestion/reglas-catedra.md` (§2); `00-gestion/pendientes.md` (DV2-08)
