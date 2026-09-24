# ADR-021 — Explicación en lenguaje natural mediante plantillas deterministas, sin modelo de lenguaje, limitada a decisiones de permiso y hallazgos

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. III (III.5), RF-02, RF-07; corrige la función F2 del AE1
- Origen: Cap. III, III.5 («Dos precisiones…»); chat «Capitulo III - AE1»

### Contexto
Decisión tomada durante la elaboración de la AE2 y reconstruida en la migración del repositorio.

### Alternativas evaluadas
- **Adoptada:** Generar la explicación sobre el rastro de la resolución con plantillas deterministas, solo para decisiones de permiso (F4) y hallazgos (F5), en la interfaz de escritorio.
- **Descartada:** Generar la explicación con un modelo de lenguaje.

### Análisis (trade-offs)
Un modelo exigiría conexión saliente (contradice RNF-05), produciría salidas variables ante entradas idénticas e impediría verificar el resultado.

### Recomendación y fundamento
Un modelo exigiría conexión saliente (contradice RNF-05), produciría salidas variables ante entradas idénticas e impediría verificar el resultado.

### Decisión del autor
Generar la explicación sobre el rastro de la resolución con plantillas deterministas, solo para decisiones de permiso (F4) y hallazgos (F5), en la interfaz de escritorio.

### Consecuencias
Se refleja en: Cap. III (III.5), RF-02, RF-07; corrige la función F2 del AE1.

### Evidencia
Cap. III, III.5 («Dos precisiones…»); chat «Capitulo III - AE1».
