# ADR-028 — Iteraciones de duración variable, cerradas en los hitos de cadencia

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. V (V.1, Tabla 14; V.4, distribución de la capacidad)
- Origen: Cap. V, V.1
- Revisión: 24/09/2026, contenido ampliado a partir del informe; la decisión no cambia

### Contexto
El período técnico va del 21/09 al 14/11/2026, ocho semanas que concluyen con la versión congelada. La cátedra fija una cadencia de artefactos que no admite desplazamiento: v1 en la semana 8, v2 en la 11, v3 en la 13 y versión congelada en la 14 (`informe/cap-05/V.1-definicion-iteraciones-sprints.md`).

### Alternativas evaluadas
- **Adoptada:** Cuatro iteraciones de duración variable, cada una cerrada en un hito: 21/09–01/10 (v1), 02/10–24/10 (v2), 26/10–07/11 (v3) y 09/11–14/11 (congelada).
- **Descartada:** Iteraciones de duración fija de dos semanas.

### Análisis (trade-offs)
- **Duración fija** da una cadencia regular y velocidades comparables entre iteraciones, pero sus cierres no coinciden con los hitos: los artefactos quedarían a mitad de iteración y cada entrega exigiría un corte ad hoc.
- **Duración variable** alinea cada cierre con un entregable evaluado. El costo es que la capacidad por iteración resulta desigual —34, 51, 34 y 17 h técnicas, en proporción a dos, tres, dos y una semanas (V.4)— y que la velocidad de una iteración no predice la de la siguiente.
- **Criterios complementarios que hacen viable la variante** (V.1): incrementos verticales por capacidad y no por componente; corte por fecha, sin extender la iteración; definición de terminado común de cuatro condiciones verificables por un tercero.

### Recomendación y fundamento
Adoptar la duración variable: el calendario de la cátedra es la restricción dura del proyecto, y alinear las iteraciones con él elimina el riesgo de entregar artefactos a mitad de construcción.

### Decisión del autor
Cuatro iteraciones de duración variable que cierran en los hitos: v1 (S8), v2 (S11), v3 (S13) y versión congelada (S14).

### Consecuencias
- La iteración 1 es la más corta en días corridos (21/09–01/10) y concentra la ruta crítica del esqueleto: repositorio y canal, adaptador, núcleo con almacén e interfaz (V.4).
- La cuarta iteración no incorpora funcionalidad; opera como margen de estabilización.
- Lo que no satisface la definición de terminado al cierre vuelve a pendientes y se replanifica por prioridad y contingencia (ADR-030).
- **Condición que invalidaría la decisión** (observación del ingeniero): que la cátedra modifique las fechas de los hitos; en ese caso se redistribuyen los límites de las iteraciones, sin cambiar el criterio.

### Evidencia
`informe/cap-05/V.1-definicion-iteraciones-sprints.md` (Tabla 14 y definición de terminado); `informe/cap-05/V.4-cronograma.md` (distribución de la capacidad técnica).
