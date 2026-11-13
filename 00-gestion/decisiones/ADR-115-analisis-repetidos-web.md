# ADR-115 — La web no guarda un análisis repetido si las entradas no cambiaron

- Estado: propuesto
- Fecha: 13/11/2026
- Capítulos afectados: IX; XIII; manual §6
- Origen: crítica externa de `src/` del 12-13/11/2026, hallazgo WEB-18; ficha T6-16

### Contexto

`GET /resolver` resuelve, guarda un análisis en el almacén y redirige (ADR-062). El enlace «Analizar de nuevo» es un `<a>`, así que una precarga del navegador o una restauración de pestañas crea análisis sin intención del usuario: en la crítica, un proyecto acumuló 3 en segundos.

Eso llena el Historial, que retiene 20 análisis (RF-17 CA-3), con copias idénticas y desplaza las que sirven para comparar. La escritura no afecta la configuración analizada: RIGE sigue siendo de solo lectura sobre ella.

### Alternativas evaluadas

- **A. Pasar `/resolver` a POST** con `<form>` y `<button>`. Es la solución canónica para una acción que escribe. Contradice RNF-09 (solo GET) y ADR-062.
- **B. Deduplicar:** si el último análisis guardado del proyecto tiene el mismo `resumenEntradas`, no se guarda otro y se redirige a ese.
- **C. No cambiar nada** y documentarlo como límite.

### Análisis (trade-offs)

- **A** obliga a reabrir un requisito validado (RNF-09) y una decisión aceptada, para un efecto que no compromete la seguridad: la verificación de `Host` y de `Sec-Fetch-Site` ya frena las peticiones de otro origen.
- **B** resuelve el síntoma visible sin tocar el método ni el contrato JSON. El costo es que «Analizar de nuevo» sin cambios en el disco no crea un análisis nuevo. Eso es coherente: el resultado sería idéntico.
- **C** deja el Historial contaminado.

### Recomendación y fundamento

**B.** Mantiene RNF-09 y ADR-062, y `resumenEntradas` ya identifica el conjunto de entradas (ADR-104). La CLI no cambia: solo la web guarda análisis.

La prueba de RF-17 CA-3 pasa a cambiar un archivo en cada vuelta. Así se siguen verificando la retención de 20 y el 404 del más antiguo.

**Condición que la invalidaría:** que un análisis con las mismas entradas pueda dar un resultado distinto. Por ejemplo, si cambian el binario de OpenCode o la versión de RIGE entre dos corridas. En ese caso, la clave de deduplicación debe incluir esas versiones.

**Precisión (13/11/2026, durante la implementación).** La condición de invalidación ocurrió en las pruebas: con las mismas entradas pero sin OpenCode en el `PATH`, la segunda corrida da `version-no-determinada`. La prueba que lo detectó es `RF-05.test.ts`, T3-01 R-13. Por eso **la clave de deduplicación no es `resumenEntradas` solo, sino el documento resuelto completo, sin el instante ni el id**: se descarta el análisis nuevo únicamente si es idéntico al último guardado del proyecto.

### Decisión del autor

[Pendiente]

### Consecuencias

- `resolver-proyecto.ts` compara con el último análisis del proyecto antes de guardar.
- Cambia la prueba de RF-17 CA-3: lo que afirma se conserva.
- El manual §6 lo menciona.

### Evidencia

- Crítica de la web con Claude Fable 5.2, 12/11/2026: WEB-18, 3 análisis en segundos con capturas de Chrome sin interfaz.
- Pre-crítica de la ficha T6-16 con Gemini 4 Hydrogen, 13/11/2026: `RF-17.test.ts:134-168`.
