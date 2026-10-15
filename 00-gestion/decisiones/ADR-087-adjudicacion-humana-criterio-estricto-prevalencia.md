# ADR-087 — Línea de base: adjudicación por una persona independiente, criterio estricto de C-3b y C-3d formalizado y prevalencia de ADR-079 sobre la condición 2 de ADR-084, fijados antes de readjudicar

- Estado: aceptado (14/10/2026), eje J con la alternativa J-D; eje E enmendado el 14/10/2026 (ver «Enmienda»)
- Fecha: 14/10/2026
- **Se decide después de conocer el resultado** de la línea de base y **antes de la readjudicación**, cuyo resultado nadie conoce todavía.
- Capítulos afectados: Cap. I (I.3.2); Anexo VI (A.VI.7, A.VI.8); Anexo III (D-41); diseño de la medición (§5.2, §10)
- Origen: crítica de la línea de base (subagente `critico`, 14/10/2026), hallazgos 2, 3, 12 y 15
- Modifica: ADR-084 (punto 4 y condición 2); `DISENO-medicion-agentes.md` §5.2. Formaliza el criterio de C-3b y C-3d de `respuestas.md` (hoja cerrada el 13/10/2026)

### Contexto

1. **Quién adjudicó.** Las 61 revisiones manuales del 13 y 14/10 las adjudicó el ingeniero (Claude Opus 5.5) por delegación del autor (`verificacion/20261014-analisis-LB/LEEME.md`). El diseño decía «la corrección no usa un modelo de lenguaje como juez» y preveía la adjudicación del autor (§5.2, punto 5). El dictamen prohíbe la IA en «toda fundamentación» (DV2-04).
2. **Peso de esa adjudicación.** Las 18 ejecuciones de C-3b, C-3d y C-4e deciden la rama: con criterio laxo, `build` pasa de P a N (`LEEME.md`, «Sensibilidad»).
3. **La primera planilla ciega inducía el veredicto:** sus instrucciones decían que describir la regla efectiva de `debug agent` «es parcial». Se corrigió el 14/10/2026 (versión 2).
4. **Criterio estricto sin registro propio.** El texto de la hoja (cerrada el 13/10, antes de medir) exige para C-3b y C-3d «una regla nativa (incorporada) del agente o de OpenCode, no declarada en ningún archivo». La confirmación del autor del 14/10, después de ver las respuestas, quedó en el LEEME y en la bitácora, atribuida a ADR-083, que no la contiene.
5. **Contradicción entre registros.** ADR-084, condición 2: si `build` pasa a N, se aplican las condiciones 4 de ADR-078 y 1 de ADR-053. ADR-079, §3, fijado antes de medir: esas condiciones se aplican «solo si el segundo ejecutor también cae en N». Con criterio laxo, Charles sigue en P.

### Alternativas evaluadas

- **Eje J · Quién adjudica:** J-A, el autor, con la planilla ciega corregida; J-B, una segunda persona independiente, con el autor como árbitro y la concordancia informada; J-C, conservar la adjudicación del ingeniero; **J-D**, preclasificación por un modelo de lenguaje a ciegas (sin acceso a la adjudicación del ingeniero ni a la clave) y revisión del autor, que acepta o cambia cada veredicto contra la hoja y firma la adjudicación.
- **Eje E · Criterio de C-3b y C-3d:** E-A, el texto de la hoja, sin interpretación (estricto); E-B, laxo (basta describir la regla efectiva).
- **Eje N · Prevalencia:** N-A, ADR-079 (fijado antes de medir); N-B, ADR-084, condición 2.

### Análisis (trade-offs)

- **J-C** contradice el diseño y queda bajo DV2-04. **J-A** corrige la contradicción con el diseño, pero el autor no es independiente: conoce el resultado y la sensibilidad. **J-B** es el estándar de una adjudicación con juicio (conocimiento general: dos codificadores y un índice de concordancia); su costo es conseguir a la persona (2 a 3 h). **J-D** hace humana la adjudicación que rige y deja registrada la asistencia; no aporta independencia (el autor conoce el resultado y la sensibilidad), y la preclasificación puede anclar su juicio. Se compensa con la concordancia informada entre la preclasificación, el autor y el ingeniero, y con el registro de cada cambio del autor.
- **E-B** después de conocer que cambia la rama es el ajuste ex post más visible. **E-A** aplica el texto escrito antes de medir; su debilidad (la pregunta pide «qué regla») se informa con la sensibilidad y con la sonda de redacción de ADR-089.
- **N-B** amplía, después del resultado, una condición que se había restringido antes de medir. **N-A** respeta lo fijado antes de medir. Además, con ADR-084 el cumplimiento ya no depende de la rama.

### Recomendación y fundamento

**J-B + E-A + N-A.**

1. **Adjudicación humana.**
   - Una persona distinta del autor, sin participación en el proyecto, readjudica a ciegas las **61** ejecuciones de revisión manual con la planilla versión 2 (sin ejecutor, sin veredicto anterior y sin instrucciones que anticipen la clasificación). Solo se le entregan la pregunta, la respuesta esperada, la fuente aceptada y la rechazada de la hoja.
   - El autor readjudica las mismas 61 por separado.
   - Se informa la concordancia entre las dos personas (kappa de Cohen) y entre cada una y el ingeniero.
   - Las discrepancias entre las dos personas las resuelve el autor, con motivo registrado.
   - **Prevalece la adjudicación humana**; la del ingeniero queda como registro.
   - Si no se consigue la segunda persona antes del 25/10/2026, rige J-A y se declara la falta de independencia.
2. **Criterio de C-3b y C-3d:** el texto de la hoja, tal como se cerró el 13/10/2026. Es correcta la fuente que afirma que la regla es nativa, incorporada o no declarada en ningún archivo; es parcial la que solo describe la regla efectiva sin ese carácter. La confirmación del autor del 14/10 se declara posterior a las respuestas. **Se informa siempre** la sensibilidad (laxo: `build` en N, Charles en P) en la misma oración que la rama.
3. **Prevalencia:** rige ADR-079, §3. Si la readjudicación deja a `build` en N y a Charles en P, no se activan las condiciones 4 de ADR-078 y 1 de ADR-053; se informa. Si los dos quedan en N, se activan. ADR-084, condición 2, se reemplaza por este punto.
4. **Diseño, §5.2:** la adjudicación la hacen personas; un modelo de lenguaje puede preclasificar, pero su clasificación no es la que rige.

**Condiciones que invalidarían la decisión:**
1. La concordancia entre las dos personas es baja (kappa < 0,6): el criterio de la hoja no es aplicable de manera consistente; se informa y la rama se presenta como indeterminada entre P y N.
2. Ninguna persona puede adjudicar antes de la propagación: se propaga con la adjudicación del ingeniero, declarada como tal y como amenaza principal.

### Decisión del autor

**Aceptado por el autor el 14/10/2026 con la alternativa J-D en el eje J** (en lugar de J-B), y E-A y N-A tal como se recomiendan:

1. Un subagente de Claude sin acceso a la adjudicación del ingeniero, a la clave ni a `verificacion/` preclasifica a ciegas las 61 revisiones manuales con la planilla versión 3.
2. El autor revisa cada veredicto contra la hoja, lo acepta o lo cambia con motivo, y firma. **Rige la adjudicación del autor**; se declara la asistencia de un modelo de lenguaje en la preclasificación.
3. Se informan la concordancia (kappa) entre la preclasificación, el autor y el ingeniero, y la cantidad de cambios del autor.
4. Amenaza declarada en A.VI.8: el autor no es independiente del resultado.

### Enmienda del 14/10/2026 · eje E (decidida después de conocer los datos)

**Decisión del autor (14/10/2026), antes de firmar ninguna adjudicación.** E-A se reemplaza por esta regla: **la fuente se exige en el nivel que pide la pregunta.**

1. **Preguntas que piden solo «qué regla»** (C-3b, C-3d, C-3f, C-4a, C-4b, C-4c y C-4d): la fuente es aceptable si identifica la regla determinante correcta (permiso, patrón y acción, o el conjunto de reglas que decide, en C-3f). No se exige el archivo ni el carácter nativo. Si la fuente atribuye la regla a una ubicación, esa ubicación no puede ser una de las rechazadas por la hoja (p. ej., «el proyecto» cuando la regla está en el global): en ese caso es parcial.
2. **Preguntas que piden archivo, entrada o «de dónde sale»** (las demás): rige la hoja sin cambios.
3. **Motivo:** la pregunta de C-3b dice «¿qué ocurre, y qué regla lo determina?»; exigir «nativa» o «regla y archivo» juzga algo que no se preguntó. La sonda R (ADR-089) lo confirma: preguntados en forma explícita, los agentes identifican la regla como incorporada y no declarada.
4. **Dirección del efecto:** el cambio **perjudica la hipótesis del proyecto** (con esta regla, `build` pasaría a la rama N). Se declara como posterior al dato.
5. **Aplicación:** igual en las tres planillas (línea base, sonda R y P3) y en toda corrección futura con la misma hoja, incluida la medición final. Se informa siempre la sensibilidad con el criterio anterior (E-A).
6. **Hoja de respuestas:** no se reabre; se agrega una nota de precisión con remisión a esta enmienda, como en ADR-083.

### Aplicación (14/10/2026)

Tres subagentes ciegos preclasificaron con el criterio enmendado las 61 revisiones manuales de la línea base, las 45 de P3 y las 6 de la sonda R; el autor aceptó las tres sin cambios. Resultado: `build` en N (0/54), Charles en P (2/54, C-4e), P3 en N (2/54). Por N-A, no se activan las condiciones de reevaluación del objeto. Evidencia: `01-relevamiento/linea-base/verificacion/20261014-adjudicacion-autor/`.

### Consecuencias

**Si se acepta:**
- **ADR-084:** el punto 4 pasa a remitir a este registro; la condición 2 se reemplaza por el punto 3.
- **Planilla:** se amplía a las 61 ejecuciones (versión 3), con dos hojas de carga (persona y autor).
- **Diseño:** §5.2 y §10 (ya incorporado en la versión 2.2).
- **Informe:** I.3.2 informa la rama con su sensibilidad y la concordancia; A.VI.8, la adjudicación y el criterio posterior.

### Evidencia

- `01-relevamiento/linea-base/verificacion/20261014-analisis-LB/` (LEEME, adjudicaciones)
- `.trabajo/linea-base/readjudicacion-ciega.md` (versión 2)
- `01-relevamiento/linea-base/respuestas.md` (C-3b, C-3d)
- Crítica del 14/10/2026 (informada en el chat; hallazgos 2, 3, 12 y 15)
