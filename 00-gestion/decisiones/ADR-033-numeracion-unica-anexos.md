# ADR-033 — Numeración única de los anexos: la de la plantilla AE2 como columna vertebral, con el material del AE1 reubicado por su naturaleza

- Estado: aceptado (25/09/2026)
- Fecha: 25/09/2026
- Capítulos afectados: todos los que remiten a anexos (I, II, III, IV y V); `informe/anexos/`; `00-gestion/anexo-III.md`
- Origen: pendiente M-02; análisis integral del 25/09/2026, hallazgo T-07 (`00-gestion/revisiones/20260925-analisis-integral.md`)

### Contexto

El informe usa dos numeraciones de anexos que colisionan (`informe/anexos/`):

| Entrega | Anexos actuales |
|---|---|
| AE1 | I · Datos relevados (A.I.1 a A.I.9) · II · Documentos del entorno o dominio (A.II.1 a A.II.4) · III · Bitácora de decisiones e historial del repositorio (`00-gestion/anexo-III.md`, A.III.1 a A.III.4) |
| AE2 | I · Catálogo de requisitos y matriz de trazabilidad (A.I.1 y A.I.2) · V · Glosario, reglas y atributos (A.V.1 a A.V.3) · VI · Clasificación de las incidencias por mecanismo |

Hay dos «Anexo I», y cada uno tiene su propio A.I.1 y A.I.2, de modo que una remisión como «Anexo I, A.I.1» es ambigua. El informe final es un solo documento.

La plantilla de la AE2 (`catedra/AE2-plantilla-informe.md`, tabla de anexos) espera esta numeración para la entrega: I catálogo y matriz · II acta de validación · III decisiones de arquitectura · IV evidencia de integración continua · V glosario y reglas. La plantilla declara reglamentaria la numeración de capítulos y apartados, pero no dice lo mismo de los anexos: su tabla se titula «contenido esperado». Que esa numeración de anexos sea vinculante es una interpretación.

### Alternativas evaluadas

- **A:** Adoptar la numeración de la plantilla AE2 y reubicar el material del AE1 por su naturaleza.
- **B:** Conservar la numeración del AE1 y agregar a continuación los anexos de la AE2 (IV catálogo, V glosario, VI incidencias, VII acta, VIII CI).
- **C:** Numerar cada entrega por separado y unificar recién en la AE4.

### Análisis (trade-offs)

- **A:**
  - A favor: la entrega que se evalúa ahora coincide con la plantilla; el Anexo III ya coincide en las dos entregas; las incidencias, hoy partidas entre A.I.6 y el Anexo VI, quedan juntas.
  - Costo: renumerar las remisiones del AE1, un cambio mecánico en los capítulos I y II, que igual se corrigen en la Ventana.
- **B:**
  - A favor: el AE1 casi no cambia.
  - En contra: el catálogo, el acta y la evidencia de CI de la AE2 quedan lejos de la numeración esperada, y hay que renumerar las remisiones de la AE2 al catálogo, que son más.
- **C:**
  - A favor: no requiere cambios ahora.
  - En contra: conserva la ambigüedad y traslada toda la unificación a noviembre.

### Recomendación y fundamento

Recomendación del ingeniero: **A.** Alinea la entrega en evaluación con la plantilla, agrupa los anexos por naturaleza y no por entrega, y concentra el costo en correcciones que el AE1 ya necesita.

**Condición que invalidaría la decisión:** que el docente aclare que cada entrega lleva su propia numeración de anexos, o que la guía de la AE4 fije otro esquema.

### Decisión del autor

Alternativa **A** (25/09/2026).

### Consecuencias

**Esquema adoptado.** La sub-numeración sigue al anexo (A.VI.3, A.VII.2…):

| Anexo | Título | Contenido |
|---|---|---|
| I | Catálogo de requisitos y matriz de trazabilidad | Sin cambios |
| II | Validaciones con el referente | A.II.1 · Guía y acta de la sesión de validación de requisitos (AE2, nuevo) · A.II.2 · Validación del prototipo v0: capturas y constancia (antes A.II.4 del AE1) |
| III | Bitácora de decisiones e historial del repositorio | Sin cambios de número. Incorpora las filas de las decisiones de la AE2 (pendiente AD-04) |
| IV | Evidencia de integración continua | Nuevo: registro de corridas del canal, con resultado y fecha |
| V | Glosario del dominio, reglas de negocio y atributos | Sin cambios |
| VI | Datos relevados | El antiguo Anexo I del AE1, con la misma sub-numeración (A.I.*n* → A.VI.*n*). La clasificación por mecanismo, antes Anexo VI, se integra en A.VI.6 |
| VII | Documentos del entorno | A.II.1 a A.II.3 del AE1 → A.VII.1 a A.VII.3 |

**Tabla de correspondencia para la renumeración:**

| Remisión actual | Remisión nueva |
|---|---|
| Anexo I, A.I.1 a A.I.9 **del AE1** (instrumento, secuencias, relevamiento técnico, estado del arte, entrevista, incidencias, hoja de respuestas, registro de la medición, gráficos) | Anexo VI, A.VI.1 a A.VI.9, con el mismo número de sección |
| Anexo I, A.I.1 y A.I.2 **de la AE2** (fichas y matriz) | Sin cambios |
| Anexo II, A.II.1 · Material de la organización consultada | Anexo VII, A.VII.1 |
| Anexo II, A.II.2 · Normativa pertinente | Anexo VII, A.VII.2 |
| Anexo II, A.II.3 · Licencia de la herramienta base | Anexo VII, A.VII.3 |
| Anexo II, A.II.4 · Capturas del prototipo v0 | Anexo II, A.II.2 |
| Anexo II (acta de validación, remisiones de III.4 y del catálogo) | Anexo II, A.II.1 |
| Anexo III, A.III.1 a A.III.4 | Sin cambios |
| Anexo V, A.V.1 a A.V.3 | Sin cambios |
| Anexo VI (clasificación de incidencias, remisiones de IV.3) | Anexo VI, A.VI.6 |

**Tareas que se derivan** (se ejecutan con `/corregir`; ninguna se hace en esta decisión):

1. Renombrar los archivos de `informe/anexos/` según el esquema, integrar la clasificación en A.VI.6 y actualizar `00-anexos.md`.
2. Renumerar las remisiones en los capítulos I y II, en la Ventana del AE1, y en III, IV y V, antes de la entrega de la AE2. La fórmula «del informe de la AE1» deja de ser necesaria para distinguir anexos.
3. En la entrega de la AE2 van los anexos I a V. El VI y el VII se remiten como material del informe de la AE1 hasta el informe integral.
4. Crear el Anexo IV cuando exista el canal de CI.
5. Verificar con `tools/armar.py` que el orden de los anexos respete la numeración. La paginación independiente con «página X de Y» sigue pendiente (M-11).

### Evidencia

`informe/anexos/` (encabezados de cada anexo); `00-gestion/anexo-III.md`; `catedra/AE2-plantilla-informe.md` (tabla de anexos); `00-gestion/pendientes.md` (M-02); `00-gestion/revisiones/20260925-analisis-integral.md` (T-07).
