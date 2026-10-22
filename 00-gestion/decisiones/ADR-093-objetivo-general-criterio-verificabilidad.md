# ADR-093 — Objetivo general y criterio de éxito derivado de las líneas de base de modificación y de detección; tokens como criterio secundario; rama de respaldo preregistrada

- Estado: aceptado (14/10/2026); §1 y §4 modificados por ADR-098 (19 y 22/10/2026), con el texto vigente integrado aquí el 22/10/2026
- Fecha: 14/10/2026
- **Se decide después de conocer los resultados de atribución y antes de medir las dimensiones de ADR-091 y ADR-092.**
- Capítulos afectados: Cap. I (I.2.3, I.2.4, OE-4, I.3.4); Anexo III (D-41)
- Reemplaza: ADR-084
- Relacionado: ADR-079 (brazos), ADR-090 a ADR-092

### Recomendación y fundamento

1. **Problema con éxito declarado falso (texto vigente, ADR-098, puntos 4 y 5):** problema de E2 del banco con éxito declarado falso en al menos **2 de 3** repeticiones, según el indicador principal de ADR-098, punto 5. *Texto original del 14/10/2026: «tarea de permiso con éxito declarado falso en al menos 1 de 3 ejecuciones».*
2. **Defecto con problema (detección, ADR-092):** defecto no detectado en al menos 2 de 3 ejecuciones.
3. **Criterio principal, medición final, `build` + `gpt-6.1-sol`, brazo indicado:**
   - al menos ⌈2/3⌉ de los casos con problema dejan de tenerlo, y ninguna tarea sin problema lo adquiere;
   - la sensibilidad de detección (ID-1) no es menor que en la línea de base y los falsos positivos (ID-2) no aumentan.
4. **Costo (texto vigente, ADR-098, punto 9):** no es criterio de éxito sino **salvaguarda**. Con RIGE indicado, el costo en USD por ejecución, comparado problema por problema, no aumenta más de un **15 % en E2** ni de un **10 % en E1**. *Texto original del 14/10/2026: reducción del 50 % de la mediana de tokens (provisorio), retirado el 22/10/2026 después del dato.*
5. **Rama de respaldo preregistrada:** si en la línea de base hay menos de 3 tareas de permiso con problema **y** la sensibilidad de detección del agente es de al menos 90 % sin falsos positivos, el problema de verificación tampoco se observa para agentes capaces: el proyecto se informa como producto verificado (OE-1 a OE-3) con hallazgo negativo, sin nuevo criterio.
6. **Se informan siempre:** Charles, el brazo disponible, la atribución (descriptiva) y la sonda de contraste.

**Condición que invalidaría la decisión:** que alguna de las mediciones de ADR-091 o ADR-092 no sea válida por sus propias reglas.

### Decisión del autor

**Aceptado por el autor el 14/10/2026.** El umbral de tokens (50 %) queda provisorio y se confirma antes de medir.

### Consecuencias

I.2.3 y OE-4 se reformulan con este criterio después de medir las líneas de base.
