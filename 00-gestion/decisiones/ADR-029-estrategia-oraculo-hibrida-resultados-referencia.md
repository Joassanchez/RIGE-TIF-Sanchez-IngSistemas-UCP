# ADR-029 — Estrategia de oráculo híbrida: resultados de referencia versionados y regeneración completa al cierre de cada iteración

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. V (V.1, definición de terminado; V.4, Tabla 19); RNF-02
- Origen: Cap. V, V.1
- Revisión: 24/09/2026, contenido ampliado a partir del informe; la decisión no cambia

### Contexto
El riesgo principal del proyecto es que RIGE informe un estado efectivo distinto del que OpenCode aplica (informe de la AE1, I.3.5). RNF-02 exige fidelidad respecto de OpenCode 1.18.25. Para verificarla, cada escenario del entorno controlado necesita un resultado esperado obtenido de la propia herramienta: el comando nativo de resolución por agente para los valores y las reglas, y el evaluador vigente para las decisiones (`informe/cap-05/V.1-definicion-iteraciones-sprints.md`, último párrafo).

### Alternativas evaluadas
- **Adoptada:** Verificar cada integración contra resultados de referencia versionados en el repositorio y regenerarlos por completo, con la herramienta instalada en su versión fijada, al cierre de cada iteración.
- **Descartada A:** Ejecutar la herramienta en cada integración.
- **Descartada B:** Conservar solo los resultados versionados, sin regeneración.

### Análisis (trade-offs)
- **A** da siempre el resultado actual, pero hace depender cada corrida del canal de integración de la disponibilidad del paquete publicado de esa versión y encarece cada ejecución.
- **B** es determinista y barata, pero un escenario modificado sin regenerar su referencia seguiría verificándose contra un valor desactualizado, y el error pasaría inadvertido.
- **La adoptada** combina ambas: la integración es determinista y no depende de un paquete externo, y la regeneración al cierre detecta referencias desactualizadas. Convierte la mitigación del riesgo principal en condición de cada incremento y no en una comprobación final (V.1).

### Recomendación y fundamento
Adoptar el oráculo híbrido: es la única opción que mantiene la integración determinista y, a la vez, impide que el oráculo envejezca.

### Decisión del autor
Verificar cada integración contra resultados de referencia versionados y regenerar el oráculo completo al cierre de cada iteración.

### Consecuencias
- La definición de terminado incluye la regresión contra los resultados de referencia, y el cierre de cada iteración exige que el trabajo de oráculo concluya sin diferencias (V.1).
- Requiere ADR-021: la explicación determinista es lo que permite versionar su resultado.
- **Punto débil declarado:** la contingencia posterga en segundo lugar la regeneración automática y la sustituye por una regeneración manual registrada en la bitácora (V.4, Tabla 19, orden 2). En ese escenario la estrategia se sostiene, pero depende de la disciplina del autor.
- **Condición que invalidaría la decisión** (observación del ingeniero): que OpenCode 1.18.25 deje de poder instalarse, lo que impediría regenerar. Mitigación sugerida: fijar la versión dentro de la imagen de contenedor prevista para la ejecución por terceros (IV.1, decisión sobre RNF-06), de modo que la regeneración no dependa del registro de paquetes.

### Evidencia
`informe/cap-05/V.1-definicion-iteraciones-sprints.md` (definición de terminado y último párrafo); `informe/cap-05/V.4-cronograma.md` (Tabla 19); `informe/cap-04/IV.1-definicion-negocios.md` (canales y RNF-06).
