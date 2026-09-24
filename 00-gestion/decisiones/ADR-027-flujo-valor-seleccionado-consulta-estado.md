# ADR-027 — Flujo de valor seleccionado: consulta del estado efectivo de un agente (RF-01 y RF-02), con criterio fijado antes de medir

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. IV (IV.3, Tablas 12 y 13); Cap. V (V.1, orden de la iteración 2; V.4, núcleo no sacrificable)
- Origen: Cap. IV, IV.3 (Tabla 13)
- Revisión: 24/09/2026, contexto y análisis ampliados con los datos del IV.3; la decisión no cambia

### Contexto
La consigna exige seleccionar un flujo de valor para automatizar y cotejarlo con la línea de base (exigencia (vi)). La línea de base no concluye antes de la entrega de la AE2, de modo que la selección debe apoyarse en evidencia ya relevada: la clasificación por mecanismo de 32 incidencias del repositorio de OpenCode (`informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`, Tabla 12; detalle en el Anexo VI):

| Mecanismo | Incidencias | Proporción |
|---|---|---|
| Precedencia y fusión (C-2) | 12 | 38 % |
| Valor implícito (C-3) | 1 | 3 % |
| Decisión de permiso (C-4) | 10 | 31 % |
| Fuera del alcance | 9 | 28 % |

### Alternativas evaluadas
- **Adoptada:** Seleccionar la consulta del estado efectivo de un agente, en sus dos formas (valor con procedencia y decisión de permiso con regla determinante), y fijar antes de la medición qué resultado de la línea de base confirma, reordena o refuta la selección.
- **Descartada:** Justificar la selección después de conocer los datos de la línea de base.

### Análisis (trade-offs)
- **Justificar después** permitiría apoyarse en la medición propia, pero expone la selección a ajustarse a los datos y deja la AE2 sin flujo fundamentado.
- **Fijar antes** obliga a comprometerse con evidencia secundaria. Esa evidencia sostiene la selección en dos niveles: 22 de 32 incidencias (69 %) corresponden a precedencia y fusión o a permisos, y 23 de 32 (72 %) a mecanismos que cubren los requisitos Must. La evidencia **no** acredita un predominio de los permisos en frecuencia; lo que los distingue es la gravedad (incidencias n.º 37155 y n.º 48751, de riesgo de seguridad directo). El informe lo declara así y no lo exagera.
- **Límite declarado:** cubrir no equivale a resolver; RIGE informa el estado efectivo y no corrige defectos de OpenCode (IV.3).

### Recomendación y fundamento
Adoptar la selección con el criterio fijado de antemano (Tabla 13):

| Resultado | Condición en la línea de base | Consecuencia |
|---|---|---|
| Confirma | IB-1 de C-2 a C-4 supera al de C-1 | Se mantiene la selección y el orden del Cap. V |
| Reordena | C-3 registra el mayor IB-1 | RF-06 se adelanta; los Must y el MVP no cambian |
| Refuta | IB-1 de C-2 a C-4 no supera al de C-1 | Se revisan la selección del flujo y la meta del objetivo general |

### Decisión del autor
Seleccionar como flujo automatizable la consulta del estado efectivo de un agente y fijar antes de la medición qué resultado de la línea de base confirma, reordena o refuta la selección.

### Consecuencias
- Es el mismo caso de uso que atraviesa el prototipo v1 (CU-02 en forma mínima).
- V.1: el resultado de la línea de base fija el inicio de la iteración 2 (RF-02 si confirma; RF-06 si reordena).
- V.4: CU-01 a CU-03 integran el núcleo que la contingencia no sacrifica.
- **Condición que invalidaría la decisión:** el resultado «Refuta» de la Tabla 13, fijado de antemano; dispara un ADR de reemplazo sobre el flujo y la meta del objetivo general.
- Pendiente: incorporar los valores de la línea de base al IV.3 cuando se complete.

### Evidencia
`informe/cap-04/IV.3-analisis-rivalidad-amplificada.md` (Tablas 12 y 13); Anexo VI; `informe/cap-05/V.1-definicion-iteraciones-sprints.md`; `informe/cap-05/V.4-cronograma.md`.
