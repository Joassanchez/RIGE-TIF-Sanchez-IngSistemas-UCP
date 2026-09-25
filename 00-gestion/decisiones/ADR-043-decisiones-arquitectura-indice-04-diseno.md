# ADR-043 — Los ADR se mantienen en `00-gestion/decisiones/`; `04-diseno/README.md` reúne las decisiones de arquitectura, el modelo de datos y el canal de integración continua por remisión

- Estado: aceptado (25/09/2026), alternativa B
- Fecha: 25/09/2026
- Capítulos afectados: ninguno del informe. Sistema de trabajo: `04-diseno/`, `CLAUDE.md` (§5 y §6), `.claude/commands/decidir.md` y `aceptar.md`
- Origen: pendiente R-05 (`00-gestion/pendientes.md`); sesión del 25/09/2026
- Relacionado: complementa ADR-031 (fuente única por artefacto); se apoya en ADR-032 (GitHub Actions) y ADR-037 (matriz de CI)

### Contexto

La guía de la AE2 fija qué recibe cada carpeta del repositorio (`catedra/AE2-guia.md`, 10.2, línea 919):

> /04-diseno · Decisiones de arquitectura con sus alternativas, modelo de datos y configuración del canal de integración continua.

**Datos del repositorio:**
- Los ADR están en `00-gestion/decisiones/` y son 43 con este.
- `04-diseno/` solo contiene `.gitkeep`.
- El registro de ADR mezcla decisiones de arquitectura con decisiones de método de medición (ADR-003, ADR-011, ADR-040), de encuadre (ADR-007), de priorización (ADR-035) y de gestión del repositorio (ADR-031).
- ADR-031 establece una fuente única por artefacto.
- Las rutas `00-gestion/decisiones/` están fijadas en `CLAUDE.md`, en los agentes y en los comandos `/decidir` y `/aceptar`.

**Conocimiento general:** GitHub Actions ejecuta solo los flujos alojados en `.github/workflows/`. `00-gestion/reglas-catedra.md` §7 fija esa misma ruta para la CI. Por eso la configuración del canal no puede residir físicamente en `04-diseno/`.

### Alternativas evaluadas

- **A:** Mover todos los ADR a `04-diseno/`.
- **B:** Mantener los ADR en `00-gestion/decisiones/` y crear `04-diseno/README.md` con tres secciones por remisión: las decisiones de arquitectura (enlace, estado y qué fija cada una en el diseño), el modelo de datos y el canal de integración continua.
- **C:** Separar el registro: los ADR de arquitectura pasan a `04-diseno/` y el resto queda en `00-gestion/decisiones/`.

### Análisis (trade-offs)

- **A:**
  - A favor: los archivos quedan físicamente donde lo indica la guía.
  - En contra: ubica en la carpeta de diseño decisiones que no son de arquitectura, y la guía pide solo las de arquitectura.
  - En contra: rompe las rutas de `CLAUDE.md`, de los agentes, de los comandos y de todas las referencias cruzadas.
  - En contra: contradice la organización de ADR-031.
- **B:**
  - A favor: presenta en `04-diseno/` exactamente lo que la guía pide.
  - A favor: respeta la fuente única de ADR-031, porque el índice enlaza y no copia contenido.
  - A favor: aplica a las decisiones el mismo criterio de remisión que la CI exige por fuerza.
  - Costo: un índice más que hay que mantener al día.
- **C:**
  - A favor: cumplimiento físico.
  - En contra: parte un registro de numeración única.
  - En contra: obliga a clasificar y mover archivos, y deja dos carpetas de ADR con reglas distintas.

### Recomendación y fundamento

Recomendación del ingeniero: **B.** La guía pide que la carpeta dé cuenta de tres elementos, y al menos uno de ellos, la CI, solo puede estar por remisión. Tratar los tres de la misma manera es coherente y conserva la fuente única.

**Clasificación como decisiones de arquitectura:** ADR-002, 006, 008, 017, 019, 021, 022, 023, 029, 032, 036, 037, 041 y 042.
- ADR-002 se incluye porque fija la referencia contra la que se verifica la resolución, es decir, el oráculo.
- Los ADR reemplazados en forma parcial se listan con su estado, porque la parte vigente sigue fijando el diseño.

**Condición que invalidaría la decisión:** que la cátedra objete que las decisiones no estén físicamente en `/04-diseno`. En ese caso se pasa a C, con un movimiento acotado a los ADR clasificados.

### Decisión del autor

**Aceptado por el autor el 25/09/2026: alternativa B**, con la clasificación propuesta y el agregado de `04-diseno/README.md` a las carpetas en las que escribe el ingeniero (`CLAUDE.md` §5).

### Consecuencias

- **`04-diseno/README.md`** se crea con tres secciones:
  1. decisiones de arquitectura, completa;
  2. modelo de datos, con marcador `[DECISIÓN PENDIENTE]` hasta el diseño del v1;
  3. canal de integración continua, con el mismo marcador.
- **Mantenimiento:** `/decidir` y `/aceptar` actualizan la fila de `04-diseno/README.md` cuando el ADR es de arquitectura. Un ADR de arquitectura nuevo se agrega a la tabla al proponerse.
- **`CLAUDE.md`:** §5 incorpora `04-diseno/README.md` entre los destinos de escritura del ingeniero; §6 actualiza la descripción de `04-diseno/`.
- **Pendientes:** R-05 queda resuelto. Las secciones 2 y 3 del README se completan con el diseño del v1 (R-08).

### Evidencia

`catedra/AE2-guia.md` (10.2, línea 919); `00-gestion/reglas-catedra.md` (§7); `00-gestion/decisiones/INDICE.md`; ADR-031, ADR-032 y ADR-037.
