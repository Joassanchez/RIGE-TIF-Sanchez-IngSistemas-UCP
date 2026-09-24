# ADR-023 — Persistencia: almacén propio con caché por hash como optimización

- Estado: propuesto
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. III (III.2.4, regla RR-01); Cap. V (V.4, Tabla 18; V.5, prototipo v1)
- Origen: chat «Capitulo III - AE1» (aceptado por el autor con consulta pendiente al docente)
- Revisión: 24/09/2026, análisis ampliado y recomendación reformulada por el ingeniero; la decisión sigue pendiente del autor

### Contexto
El prototipo v1 debe acreditar un caso de uso vertical de interfaz a persistencia y retorno, con un esquema de base reproducible por guion o migración (`00-gestion/reglas-catedra.md`, sección 7). El informe aprobado ya da por supuesto un almacén propio:
- la regla RR-01 establece que RIGE escribe únicamente en su propio almacén (III.2.4, Tabla 6);
- la Tabla 18 asigna 4 h en la iteración 1 a «Almacén propio: esquema, escritura y lectura de la resolución» (V.4);
- V.5 describe que la persistencia escribe la resolución con sus valores y su procedencia y la recupera.

La consulta al docente sobre la capa de persistencia quedó registrada en el chat de origen; su contenido exacto no consta en el repositorio: `[DATO PENDIENTE: pregunta formulada al docente y respuesta, si la hubo]`.

### Alternativas evaluadas
- **A:** Recalcular siempre, sin persistencia.
- **B:** Almacén propio de la resolución, sin caché.
- **C:** Almacén propio de la resolución, con caché por hash de las entradas (formulación original).

### Análisis (trade-offs)
- **A** es la opción más simple y evita inconsistencias entre almacén y archivos, pero incumple la exigencia de la Guía de comprobación (caso vertical hasta persistencia) y contradice RR-01, V.4 y V.5, que el autor ya aprobó. Además, sin persistencia no hay «resolución fechada» (III.2.1), entidad del dominio.
- **B** satisface la guía y el informe con el menor costo; entra en las 4 h asignadas.
- **C** agrega la invalidación por hash: evita recalcular cuando las entradas no cambiaron. Es una optimización de rendimiento vinculada a RNF-07, cuyo valor todavía no está fijado (pendiente A-04). Agrega un riesgo de fidelidad (RNF-02): una caché que no detecta un cambio en una entrada no leída, como una variable de entorno sustituida, devolvería un estado desactualizado. Su costo no figura en la Tabla 18.

### Recomendación y fundamento
Recomendación del ingeniero: **adoptar B ahora y diferir la caché por hash.** El almacén propio no depende de la respuesta del docente, porque lo exige la guía y el informe aprobado ya lo compromete. La caché es la única parte en discusión y no es necesaria para el v1: se reevalúa cuando RNF-07 tenga un valor y una medición que muestre que el tiempo de resolución lo supera. Si la respuesta del docente llega y exige otra cosa, se reabre con un ADR de reemplazo.

La tecnología del almacén (motor, formato, ubicación) no forma parte de esta decisión: `[DECISIÓN PENDIENTE: tecnología del almacén, junto con la del stack del prototipo]`.

### Decisión del autor
[DECISIÓN PENDIENTE: el autor elige A, B o C; recomendación del ingeniero: B, con la caché diferida]

### Consecuencias
- Si se adopta B: el v1 implementa esquema, escritura y lectura de la resolución con su guion de creación o migración; la caché se registra como capacidad diferida en `pendientes.md`.
- Bloquea U-01 (prototipo v1) mientras permanezca propuesto.
- **Condición que invalidaría la recomendación:** que el docente exija un motor de base de datos o un tipo de persistencia que el almacén propio no satisfaga, o que la medición de RNF-07 muestre que sin caché no se cumple el tiempo máximo.

### Evidencia
`informe/cap-03/III.2-dominio-sistema-informacion.md` (III.2.1; Tabla 6, RR-01); `informe/cap-05/V.4-cronograma.md` (Tabla 18); `informe/cap-05/V.5-descripcion-producto-minimo-viable.md` (último párrafo); `00-gestion/reglas-catedra.md` (sección 7); chat «Capitulo III - AE1».
