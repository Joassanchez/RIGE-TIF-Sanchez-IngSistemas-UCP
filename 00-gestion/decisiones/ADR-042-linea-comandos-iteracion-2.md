# ADR-042 — La línea de comandos completa (RF-03, valores y permisos) se adelanta a la iteración 2; el v1 conserva la interfaz web mínima

- Estado: propuesto
- Fecha: 25/09/2026
- Capítulos afectados: Cap. V (V.1, Tabla 14; V.4; V.5); libro (RF-03, iteración prevista); Instrumento 35
- Origen: sesión del 25/09/2026. El autor propone priorizar la línea de comandos sobre la interfaz gráfica
- Relacionado: ADR-032 (stack e interfaz web local), ADR-040 (medición con agentes), ADR-041 (línea de comandos con permisos)

### Contexto

- En la medición final (ADR-040), el agente usa RIGE solo por la línea de comandos. La interfaz web no interviene.
- La Tabla 14 (V.1) ubica RF-03 en la iteración 3 (26/10 al 07/11), que cierra una semana antes de la congelación (14/11).
- La guía de comprobación del v1 exige que la aplicación «levanta y responde en la dirección declarada» y que el dato «se recupera y se muestra» (`catedra/AE2-guia-comprobacion-v1.md`, pasos 7 y 8).
- OE-1 y OE-2 exigen coincidencia de resultados «por ambas interfaces» (I.2.4).

### Alternativas evaluadas

- **A:** Priorizar la línea de comandos también en el v1: un v1 solo de línea de comandos, con la interfaz web después.
- **B:** El v1 conserva la interfaz web mínima de una consulta; RF-03 completo (valores y permisos, ADR-041) pasa de la iteración 3 a la 2; la interfaz web crece en la 3.
- **C:** Sin cambios en el orden (RF-03 en la iteración 3).

### Análisis (trade-offs)

- **A:** Es la opción más barata y la más alineada con la medición, pero corre el riesgo de fallar la comprobación literal del v1 (pasos 7 y 8), que supone un proceso en escucha en una dirección.
- **B:** Cumple la guía del v1, deja la línea de comandos estable con margen antes de la medición final, y no suma horas: mueve RF-03 de iteración. Como la línea de comandos es una capa fina sobre el núcleo, la carga cae sobre la iteración 2, que ya incorpora RF-02. Traslado estimado de 4 a 6 h (suposición, a confirmar contra V.4).
- **C:** Cualquier atraso de la iteración 3 deja la medición final sin la herramienta que mide.

### Recomendación y fundamento

Recomendación del ingeniero: **B.** Protege la medición final sin arriesgar la comprobación del v1.

**Condición que invalidaría la decisión:** que el docente acepte un v1 solo de línea de comandos. En ese caso, A pasa a ser preferible.

### Decisión del autor

El autor manifiesta conformidad con la propuesta (25/09/2026). Pendiente el cambio de estado por el autor.

### Consecuencias

- **V.1, Tabla 14:** RF-03 pasa a la iteración 2, y el objetivo verificable de la iteración 2 incluye la línea de comandos de valores y de permisos. La iteración 3 conserva la coincidencia entre interfaces como verificación.
- **V.4 y V.5:** horas por iteración.
- **Libro, RF-03:** iteración prevista 2.
- **Instrumento 35 y README del v1:** el caso de uso vertical se declara sobre la interfaz web.
- Las correcciones se hacen antes del 01/10, junto con las de ADR-041.

### Evidencia

`informe/cap-05/V.1-definicion-iteraciones-sprints.md` (Tabla 14); `catedra/AE2-guia-comprobacion-v1.md` (pasos 7 y 8); `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (OE-1 y OE-2); ADR-032, ADR-040 y ADR-041.
