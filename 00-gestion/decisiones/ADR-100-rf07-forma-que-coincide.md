# ADR-100 — RF-07: el hallazgo de una regla sin efecto por ruta absoluta informa la forma que coincide, verificada por el evaluador

- Estado: propuesto
- Fecha: 22/10/2026
- Capítulos afectados: Cap. III (III.5, catálogo); Anexo I (RF-07); Cap. V (V.2, si cambia el alcance de la iteración); Anexo III (deliberación)
- Origen: sesión del 22/10/2026 (Claude Code), discusión sobre el umbral de tokens y el foco de RIGE después de la línea base de ADR-098

### Contexto

1. **[D]** En la línea base de ADR-098 (`01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/`), los 5 problemas con éxito declarado falso (M-1, M-2, M-10, N-23 y N-14) tienen un único mecanismo observado: la regla de permiso escrita con ruta absoluta (ADR-098, Contexto 16). Los dos ejecutores verificaron con `opencode debug agent`, que muestra la regla pero no si coincide con algún sujeto.
2. **[D]** RF-07 ya detecta este defecto y explica su causa. Su CA-1 incluye «una regla de permiso por archivo escrita con ruta absoluta dentro del árbol de trabajo, que no coincide con ninguna acción porque OpenCode 1.18.25 evalúa la ruta relativa al árbol de trabajo» (`03-requisitos/libro/catalogo/RF-07.md`). El hallazgo dice qué falla y por qué, pero no cómo se escribe la regla para que tenga efecto.
3. **[D]** En la línea base, el 64 % estimado de los tokens se va en leer la documentación local y la skill `customize-opencode`, y la verificación nativa ocupa el 2 %. Las ejecuciones correctas y las fallidas cuestan lo mismo (mediana de unos 130 mil tokens). La estimación por tamaño de los resultados es **[S]**.
4. **[S]** Para la regla con ruta absoluta dentro del árbol de trabajo, la forma que coincide se obtiene de la regla misma: se quita el prefijo del árbol de trabajo. La intención (acción, sujeto y decisión) ya está escrita; solo falla la forma del patrón.

### Alternativas evaluadas

- **A. Sin cambios.** RF-07 informa el hallazgo y la causa, y la corrección queda a cargo del usuario o del agente.
- **B. Forma que coincide en el hallazgo (recomendada).** Cuando la causa es una ruta absoluta dentro del árbol de trabajo, el hallazgo informa además la forma relativa. El evaluador de RIGE verifica que esa forma coincide con el sujeto y produce la acción declarada por la regla. Si no puede verificarlo, no propone nada.
- **C. Propuesta de declaraciones a partir de una intención.** El usuario o el agente expresa lo que quiere y RIGE propone qué escribir, en qué archivo y en qué capa.
- **D. Explicar mejor la documentación.** RIGE resume o reinterpreta la documentación oficial.

### Análisis (trade-offs)

| | A | B | C | D |
|---|---|---|---|---|
| Ataca el mecanismo observado | Solo lo diagnostica | Lo diagnostica y da la corrección verificada | Lo evitaría antes de escribir | No: la documentación no describe el mecanismo |
| Fuente de la intención | — | La regla ya escrita | El usuario o el agente | — |
| Riesgo de proponer algo incorrecto | — | Bajo: la propuesta pasa por el evaluador | Alto: hay que elegir capa, orden y conflictos, que es lo que hoy hace mal el agente | Medio |
| Alcance antes del corte del 07/11 | Nulo | Un campo más en el hallazgo y una prueba | No entra | No entra |
| Medible en noviembre | — | Sí: con RIGE indicado, ¿el agente corrige al primer intento? | — | — |
| Solapamiento | — | Ninguno: ninguna solución relevada propone la forma que coincide (IV.3) **[VERIFICAR]** | Con el propio agente | Con la documentación y la skill nativas |

### Recomendación y fundamento

**B.** Lleva a RIGE del diagnóstico a la corrección en el único mecanismo que mostró la línea base, sin interpretar intenciones: la corrección se deriva de la regla y se verifica con el mismo evaluador que RF-02 (CA-2 y CA-9). C queda como línea futura en el informe; D se descarta.

**Condición que la invalida:** que la forma relativa no produzca en OpenCode 1.18.25 la decisión declarada en algún caso del banco, por ejemplo por un comodín o un directorio. En ese caso la propuesta se limita a los casos verificados. Otra condición: que el evaluador de RIGE no reproduzca el directorio como OpenCode (ver LB-04).

**Criterio de aceptación propuesto (RF-07, CA-5):** «Cuando la causa de una regla de permiso sin efecto es una ruta absoluta dentro del árbol de trabajo, el hallazgo informa además la forma relativa al árbol de trabajo y la decisión que produciría, verificada con el evaluador de RIGE. Sobre el entorno de CA-1, para la regla `read` que declara la ruta absoluta de `src/productos.js` con acción `allow`, el hallazgo informa la forma `src/productos.js` y la decisión «permitida». Si la forma relativa no produce la acción declarada, el hallazgo no informa forma alguna.»

### Decisión del autor

El autor aceptó la alternativa B en la sesión del 22/10/2026, en el chat. **Pendiente:** cambiar el estado a `aceptado` con `/aceptar`.

### Consecuencias

- RF-07 suma CA-5 en el libro y en el Anexo I (redactor), con la trazabilidad «ADR-100; ADR-098, Contexto 16».
- Se agrega la fila R-06 al registro de cambios para la referente (`01-relevamiento/validacion/registro-cambios-referente.md`). No hace falta consulta individual.
- Tarea del escritor antes del corte del 07/11, junto con LB-04: campo `forma_que_coincide` en el hallazgo, por las dos interfaces, y la prueba de CA-5.
- La medición de noviembre agrega, para el brazo con RIGE indicado, la proporción de problemas E2 corregidos al primer intento. Es descriptiva y no modifica el criterio de ADR-093.
- El informe declara la alternativa C como línea futura (visión), sin compromiso en el período.

### Evidencia

- `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/casos-con-error.md`: las reglas con ruta absoluta que escribió el agente y la forma correcta de referencia.
- ADR-098, Contextos 16 y 17.
- `03-requisitos/libro/catalogo/RF-07.md` (CA-1).
