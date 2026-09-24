# ADR-029 — Estrategia de oráculo híbrida: resultados de referencia versionados y regeneración completa al cierre de cada iteración

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. V; RNF-02
- Origen: Cap. V, V.1

### Contexto
Decisión tomada durante la elaboración de la AE2 y reconstruida en la migración del repositorio.

### Alternativas evaluadas
- **Adoptada:** Verificar cada integración contra resultados de referencia versionados y regenerar el oráculo completo al cierre de cada iteración.
- **Descartada:** Ejecutar la herramienta en cada integración; conservar solo resultados versionados.

### Análisis (trade-offs)
Lo primero haría depender cada corrida de la disponibilidad de la versión publicada; lo segundo dejaría escenarios modificados verificándose contra valores desactualizados.

### Recomendación y fundamento
Lo primero haría depender cada corrida de la disponibilidad de la versión publicada; lo segundo dejaría escenarios modificados verificándose contra valores desactualizados.

### Decisión del autor
Verificar cada integración contra resultados de referencia versionados y regenerar el oráculo completo al cierre de cada iteración.

### Consecuencias
Se refleja en: Cap. V; RNF-02.

### Evidencia
Cap. V, V.1.
