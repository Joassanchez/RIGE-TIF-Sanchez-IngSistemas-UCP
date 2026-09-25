# ADR-044 — Valores de RNF-07: invocación completa por línea de comandos en menos de 2 s, sobre un proyecto dimensionado con el de la referente y medida en la máquina virtual Ubuntu 26.04

- Estado: aceptado (25/09/2026), P-B + Q-A + T-A
- Fecha: 25/09/2026
- Capítulos afectados: Cap. III (III.5); Anexo I (ficha RNF-07); libro (RNF-07); Cap. X (X.2, equipo de referencia); Cap. V (V.4, estabilización)
- Origen: pendiente A-04 (`00-gestion/pendientes.md`), parte de RNF-07; sesión del 25/09/2026, preparación de la validación con la referente
- Relacionado: ADR-023 (la caché se difiere hasta que RNF-07 tenga valor y se lo supere), ADR-037 (Ubuntu 26.04 como plataforma de referencia; P3 para un Should sin horas), ADR-042 (la línea de comandos es la interfaz del agente)

### Contexto

La ficha de RNF-07 (Should, Rendimiento) tiene tres valores sin fijar (`03-requisitos/libro/catalogo/RNF-07.md`): el tamaño del proyecto de referencia, el equipo de referencia y el tiempo máximo. Su motivo es que «el uso por un agente externo, que invoca de manera repetida, vuelve relevante el tiempo de respuesta» (HA-3).

**Datos del repositorio:**
- No hay mediciones de tiempo de RIGE ni del comando nativo `opencode debug agent`. La única cifra de tiempo del relevamiento es el límite de 600 s por caso del piloto de la medición (`01-relevamiento/linea-base/DISENO-medicion-agentes.md`, línea 299), que se refiere al agente y no a RIGE.
- No hay datos sobre el tamaño del proyecto real de la referente: cantidad de agentes, entradas y elementos.
- ADR-023 condiciona la caché por hash a que RNF-07 tenga valor y a que una medición muestre que se lo supera.
- ADR-037 fija Ubuntu 26.04 en máquina virtual como plataforma de referencia de las mediciones. Sus especificaciones no están registradas: `[DATO PENDIENTE: procesador, núcleos y memoria asignados a la máquina virtual Ubuntu 26.04]`.
- Con ADR-042, el agente usa la línea de comandos, y cada consulta es un proceso completo: arranque, lectura de las entradas, resolución y salida.

### Alternativas evaluadas

**Eje 1 · Proyecto de referencia**
- **P-A:** El escenario más grande del entorno controlado.
- **P-B:** Un proyecto sintético dimensionado sobre el proyecto real de la referente, con el doble de agentes, entradas y elementos que ella informe en la sesión de validación.
- **P-C:** Sin tamaño fijo: un tiempo máximo por entrada.

**Eje 2 · Equipo de referencia**
- **Q-A:** La máquina virtual Ubuntu 26.04 de las mediciones (ADR-037).
- **Q-B:** El ejecutor `ubuntu-latest` de la CI.
- **Q-C:** El equipo Windows 11 del autor.

**Eje 3 · Qué se mide y con qué umbral**
- **T-A:** La invocación completa por línea de comandos (desde el arranque del proceso hasta la salida) de una consulta de valores de un agente, en menos de 2 s, tomando el peor de diez corridas.
- **T-B:** Un umbral relativo: no más lento que `opencode debug agent` sobre el mismo proyecto.
- **T-C:** La resolución interna, sin el arranque del proceso, en menos de 1 s.

### Análisis (trade-offs)

**Proyecto de referencia.**
- **P-A** se define dentro del proyecto, pero el entorno controlado está hecho para verificar la corrección, no para representar el volumen real. Un escenario chico acredita un tiempo que no dice nada del uso real.
- **P-B** ancla el tamaño en el único proyecto real identificado, y el factor 2 da un margen de crecimiento. Depende de que la referente informe tres cifras en la sesión.
- **P-C** se generaliza bien, pero no se corresponde con la experiencia del agente, que espera una consulta completa y no una entrada.

**Equipo de referencia.**
- **Q-A** es coherente con ADR-037: las mediciones y el oráculo corren en la misma máquina. Es reproducible si sus especificaciones se declaran en X.2.
- **Q-B** es reproducible por terceros, pero los ejecutores compartidos tienen un rendimiento variable (conocimiento general). Un umbral en la CI daría fallos intermitentes que no provienen de RIGE.
- **Q-C** es el equipo de desarrollo, que no es el de referencia de ADR-037.

**Qué se mide.**
- **T-A** mide lo que efectivamente espera el agente, arranque incluido.
  - El umbral de 2 s se apoya en los límites de respuesta de uso difundido, que es conocimiento general de usabilidad: hasta 1 s no interrumpe el flujo y hasta 10 s conserva la atención. Si se cita en el informe, hay que registrar la fuente con `/fuente`.
  - Para un agente que invoca varias veces por tarea, 2 s mantiene la consulta por debajo del tiempo de una llamada al modelo. Esto es una suposición: el costo de esa llamada no está medido en el repositorio.
- **T-B** no es comparable. El comando nativo resuelve un solo agente y no evalúa permisos ni hallazgos. Además, obligaría a ejecutar OpenCode en la medición de un requisito del producto.
- **T-C** es más exigente de lo que el uso necesita y deja fuera el arranque, que es lo que paga el agente en cada invocación.

**Prioridad.** Sigue siendo Should, sin horas asignadas. La acreditación se hace una sola vez, en la iteración 4, con cargo a la estabilización, con el mismo criterio que la precisión P3 de ADR-037.

### Recomendación y fundamento

Recomendación del ingeniero: **P-B + Q-A + T-A.**

Criterio de aceptación propuesto para RNF-07:

> Sobre un proyecto sintético con el doble de agentes, entradas y elementos que el proyecto real de la referente —[N] agentes, [N] entradas y [N] elementos, informados en la sesión de validación—, en la máquina virtual Ubuntu 26.04 de referencia —[especificaciones]—, la invocación completa por línea de comandos de la consulta de valores de un agente finaliza en menos de 2 s, medido sobre diez corridas y tomando el peor caso.

- **Fundamento:** mide lo que el agente espera, sobre un volumen anclado en el único proyecto real, en la plataforma donde ya se mide todo lo demás.
- **Qué pasa si la referente no informa el tamaño:** se aplica P-A y se declara la limitación.
- **Relación con la caché:** si la acreditación de la iteración 4 supera los 2 s, se activa la condición de ADR-023 para la caché por hash.

**Consulta a la referente en la sesión:**
- las tres cifras de su proyecto;
- si 2 s por consulta resulta aceptable para el uso de su agente.

**Condición que invalidaría la decisión:** que la referente declare que su agente necesita una respuesta más rápida, en cuyo caso se ajusta el umbral, o que su proyecto no sea representativo del uso previsto, en cuyo caso se pasa a P-A con un tamaño fundado en el entorno controlado.

### Decisión del autor

**Aceptado por el autor el 25/09/2026: P-B + Q-A + T-A**, con umbral de 2 s. Las cifras del proyecto de la referente y su conformidad con el umbral se obtienen en la sesión de validación (guía v2, sección 3.2).

### Consecuencias

- **RNF-07** (ficha y Anexo I): el criterio recomendado, con las cifras de la referente después de la sesión. El enunciado cambia «resolución de un proyecto» por «consulta por línea de comandos».
- **X.2:** el equipo de referencia con sus especificaciones.
- **V.4:** la acreditación de RNF-07 entra en la estabilización de la iteración 4, junto con RNF-06 (ADR-037, P3), sin horas nuevas.
- **ADR-023:** la condición de la caché queda con un valor concreto.
- **A-04:** cerrado en su parte de RNF-07 cuando se acepte este ADR y la referente informe las cifras.

### Evidencia

`03-requisitos/libro/catalogo/RNF-07.md`; `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (línea 299); ADR-023, ADR-037 y ADR-042.
