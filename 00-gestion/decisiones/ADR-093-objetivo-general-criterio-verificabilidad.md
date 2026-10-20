# ADR-093 — Objetivo general y criterio de éxito derivado de las líneas de base de modificación y de detección; tokens como criterio secundario; rama de respaldo preregistrada

- Estado: aceptado (14/10/2026); §1 (tarea con problema en 2 de 3) y §4 (tokens comparados por resultado) modificados por ADR-098 (19/10/2026)
- Fecha: 14/10/2026
- **Se decide después de conocer los resultados de atribución y antes de medir las dimensiones de ADR-091 y ADR-092.**
- Capítulos afectados: Cap. I (I.2.3, I.2.4, OE-4, I.3.4); Anexo III (D-41)
- Reemplaza: ADR-084
- Relacionado: ADR-079 (brazos), ADR-090 a ADR-092

### Recomendación y fundamento

1. **Caso con problema (modificación, ADR-091):** tarea de permiso con éxito declarado falso en al menos 1 de 3 ejecuciones.
2. **Defecto con problema (detección, ADR-092):** defecto no detectado en al menos 2 de 3 ejecuciones.
3. **Criterio principal, medición final, `build` + `gpt-6.1-sol`, brazo indicado:**
   - al menos ⌈2/3⌉ de los casos con problema dejan de tenerlo, y ninguna tarea sin problema lo adquiere;
   - la sensibilidad de detección (ID-1) no es menor que en la línea de base y los falsos positivos (ID-2) no aumentan.
4. **Criterio secundario:** la mediana de tokens por tarea, con RIGE indicado, se reduce al menos un **50 %** respecto de la línea de base de la misma medición **(umbral provisorio, decisión del autor del 14/10/2026; se confirma antes de medir)**.
5. **Rama de respaldo preregistrada:** si en la línea de base hay menos de 3 tareas de permiso con problema **y** la sensibilidad de detección del agente es de al menos 90 % sin falsos positivos, el problema de verificación tampoco se observa para agentes capaces: el proyecto se informa como producto verificado (OE-1 a OE-3) con hallazgo negativo, sin nuevo criterio.
6. **Se informan siempre:** Charles, el brazo disponible, la atribución (descriptiva) y la sonda de contraste.

**Condición que invalidaría la decisión:** que alguna de las mediciones de ADR-091 o ADR-092 no sea válida por sus propias reglas.

### Decisión del autor

**Aceptado por el autor el 14/10/2026.** El umbral de tokens (50 %) queda provisorio y se confirma antes de medir.

### Consecuencias

I.2.3 y OE-4 se reformulan con este criterio después de medir las líneas de base.
