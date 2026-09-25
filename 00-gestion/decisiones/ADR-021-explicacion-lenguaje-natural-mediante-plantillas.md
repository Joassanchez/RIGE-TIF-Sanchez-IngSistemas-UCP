# ADR-021 — Explicación en lenguaje natural mediante plantillas deterministas, sin modelo de lenguaje, limitada a decisiones de permiso y hallazgos

- Estado: aceptado (retroactivo); reemplazado parcialmente por ADR-036 (25/09/2026) en el límite de la explicación a la interfaz gráfica
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. III (III.5), RF-02, RF-07; Cap. IV (IV.1, Tabla 10); Cap. V (V.4, Tabla 18); corrige la función F2 del informe de la AE1
- Origen: Cap. III, III.5 («Dos precisiones…»); chat «Capitulo III - AE1»
- Revisión: 24/09/2026, contenido ampliado a partir del informe; la decisión no cambia

### Contexto
El diferencial de RIGE no reside en la procedencia, que el proveedor de cada herramienta puede exponer a bajo costo, sino en la explicación de la decisión de permiso, de los valores implícitos y de las declaraciones sin efecto (`informe/cap-04/IV.1-definicion-negocios.md`, IV.1, primer párrafo). La explicación es, por lo tanto, parte del núcleo de valor, y el modo de generarla condiciona la seguridad (RNF-05), la fidelidad (RNF-02) y el costo de sostenimiento (ADR-025).

### Alternativas evaluadas
- **Adoptada:** Explicación generada por plantillas deterministas sobre el rastro de la resolución, solo para decisiones de permiso (F4) y hallazgos (F5), en la interfaz de escritorio.
- **Descartada:** Explicación generada por un modelo de lenguaje.

### Análisis (trade-offs)
- **Modelo de lenguaje:** produciría explicaciones más flexibles y cubriría casos no previstos, pero (1) exige una conexión saliente, que RNF-05 prohíbe; (2) produce salidas distintas ante entradas idénticas, lo que impide versionar resultados de referencia (ADR-029) y verificar el resultado; y (3) introduce un costo variable recurrente que ninguna fuente de ingreso sostiene (IV.1, Tabla 10, «Fuentes de ingreso»).
- **Plantillas deterministas:** la explicación se deriva del mismo rastro que produce la decisión, de modo que una explicación errónea implica una resolución errónea y la detecta el mismo oráculo. El costo es la rigidez: cada tipo de decisión y de hallazgo requiere su plantilla, lo que justifica limitar el alcance a F4 y F5. La relación de autoservicio sin soporte directo exige además que la explicación sea autocontenida (IV.1, Tabla 10, «Relaciones con clientes»).
- **Límite a la interfaz de escritorio:** la salida por línea de comandos entrega datos estructurados y no explicación (ADR-022); el consumidor de esa vía es un agente, no una persona.

### Recomendación y fundamento
Adoptar las plantillas deterministas: son la única opción compatible con RNF-05 y con un oráculo determinista, y no generan costo recurrente.

### Decisión del autor
Generar la explicación sobre el rastro de la resolución con plantillas deterministas, solo para decisiones de permiso (F4) y hallazgos (F5), en la interfaz de escritorio.

### Consecuencias
- Corrige la función F2 del informe de la AE1, que no delimitaba el mecanismo de explicación.
- V.4, Tabla 18: 5 h en la iteración 2 para las plantillas de permiso; las de hallazgos se incluyen en las 12 h de RF-07 (iteración 3).
- Cada plantilla se verifica contra resultados de referencia, igual que la decisión que explica.
- **Condición que invalidaría la decisión** (observación del ingeniero): que la medición final muestre que los participantes no comprenden las explicaciones generadas, lo que exigiría rediseñar las plantillas, no reemplazarlas por un modelo, mientras RNF-05 siga vigente.

### Evidencia
`informe/cap-03/III.5-catalogo-requisitos.md` (párrafo final); `informe/cap-04/IV.1-definicion-negocios.md` (IV.1 y Tabla 10); `informe/cap-05/V.4-cronograma.md` (Tabla 18).
