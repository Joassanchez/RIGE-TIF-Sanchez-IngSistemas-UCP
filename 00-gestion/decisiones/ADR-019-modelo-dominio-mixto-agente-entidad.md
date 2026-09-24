# ADR-019 — Modelo del dominio mixto: Agente como entidad de primera clase y Elemento genérico con subtipos

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. III (III.2)
- Origen: Cap. III, III.2.2 (tabla de entidades); chat «Capitulo III - AE1» (23/09/2026)

### Contexto
Decisión tomada durante la elaboración de la AE2 y reconstruida en la migración del repositorio.

### Alternativas evaluadas
- **Adoptada:** Modelar el dominio con una entidad genérica Elemento, cuyo tipo declara el adaptador, y con Agente como especialización de Elemento sobre la que se manifiesta el efecto de toda la configuración.
- **Descartada:** Modelo con una entidad por cada tipo de elemento del ecosistema; modelo exclusivamente genérico sin especialización de Agente.

### Análisis (trade-offs)
El agente es el eje de la representación (ADR-008) y necesita identidad propia; el resto de los tipos varía entre herramientas y debe poder declararlo el adaptador sin tocar el núcleo (RNF-03).

### Recomendación y fundamento
El agente es el eje de la representación (ADR-008) y necesita identidad propia; el resto de los tipos varía entre herramientas y debe poder declararlo el adaptador sin tocar el núcleo (RNF-03).

### Decisión del autor
Modelar el dominio con una entidad genérica Elemento, cuyo tipo declara el adaptador, y con Agente como especialización de Elemento sobre la que se manifiesta el efecto de toda la configuración.

### Consecuencias
Se refleja en: Cap. III (III.2).

### Evidencia
Cap. III, III.2.2 (tabla de entidades); chat «Capitulo III - AE1» (23/09/2026).
