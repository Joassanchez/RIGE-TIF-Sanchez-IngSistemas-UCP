# ADR-008 — Adoptar el agente como eje de la representación

- Estado: aceptado (retroactivo)
- Código en el Anexo III: D-08
- Fecha: AE1 (entregada el 03/09/2026)
- Capítulos afectados: apartado I.6.1
- Origen: Anexo III del informe de la AE1, A.III.1 y A.III.2

### Contexto
Decisión adoptada durante la elaboración del apartado I.6.1 del informe de la AE1.

### Alternativas evaluadas
- **Adoptada:** Adoptar el agente como eje de la representación.
- **Descartada:** Organizar la representación por archivo.

### Análisis (trade-offs)
Se consideran tres organizaciones posibles: por archivo, que corresponde a la forma en que el desarrollador encuentra hoy la información; por tipo de elemento; y por agente. La primera se descarta porque el archivo no es la unidad sobre la que se manifiesta el efecto de la configuración y porque presupone que el desarrollador sabe qué archivos existen, supuesto que no se cumple en el segundo perfil de la muestra. La segunda se conserva como vía de acceso secundaria, dado que resulta útil para consultas sobre un tipo específico. La tercera se adopta como eje principal porque todo elemento del ecosistema produce su efecto sobre un agente, y porque las preguntas relevadas se formulan sobre agentes.

### Recomendación y fundamento
El archivo no es la unidad sobre la que se manifiesta el efecto de la configuración, y quien se incorpora a un proyecto ajeno desconoce qué archivos existen

### Decisión del autor
Adoptar el agente como eje de la representación.

### Consecuencias
Se refleja en el apartado I.6.1.

### Evidencia
Ver apartado I.6.1 y Anexo III.
