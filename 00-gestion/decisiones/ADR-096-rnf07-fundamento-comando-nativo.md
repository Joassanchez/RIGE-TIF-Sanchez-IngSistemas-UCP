# ADR-096 — RNF-07: el umbral de 2 s se funda en el tiempo del comando nativo de OpenCode y no en límites de tolerancia humana

- Estado: aceptado (15/10/2026)
- Fecha: 15/10/2026
- Capítulos afectados: Cap. III (III.5, ficha RNF-07); Anexo I (ficha RNF-07); Anexo III (D-28); libro (RNF-07, motivo y trazabilidad); bibliografía; `01-relevamiento/fuentes.md`
- Origen: dictamen DEV-AE2 N.º 14/2026, Bloque A, pregunta 4; sesión del 15/10/2026 con el autor
- Modifica: ADR-055 (solo el fundamento del umbral, eje T). El valor, el equipo de referencia, el proyecto de referencia y el criterio de aceptación no cambian

### Contexto

1. **[D]** La AE1 (A.III.1.7) fijó 1 s para la consulta y la previsualización en una aplicación de escritorio, sobre una estructura cargada en memoria, y descartó el umbral cercano a 2 s de Shneiderman (1984) por criterio conservador.
2. **[D]** RNF-07 fija hoy menos de 2 s para la invocación completa por línea de comandos (ADR-055). ADR-055 apoyaba el valor en «los límites de respuesta de uso difundido», sin fuente registrada. El dictamen pregunta por qué 2 s y cuál es la fuente (Bloque A, pregunta 4).
3. **[D]** El verificador de fuentes (15/10/2026) confirmó que Shneiderman (1984, p. 273) presenta los 2 s como conjetura, con un estudio de ocho personas, y que mide hasta el **inicio** de la respuesta (p. 266). RNF-07 mide hasta el **fin** de la invocación y su consumidor es un agente.
4. **[D]** Desde la entrevista del 24/09/2026, el consumidor principal de la CLI es un agente. Su alternativa actual para conocer la configuración efectiva es el comando nativo `opencode debug agent build` (o leer los archivos).
5. **[D]** Medición del 15/10/2026 en el contenedor de referencia: el comando nativo tarda una mediana de 1176,5 ms y un peor caso de 1265 ms en diez corridas, sobre un escenario mínimo (`01-relevamiento/evidencia/rnf07-comando-nativo_20261015.md`).

### Alternativas evaluadas

- **A:** Mantener el fundamento en límites de tolerancia humana, citando a Shneiderman (1984) con sus salvedades.
- **B:** Fundar el umbral en el tiempo de la alternativa que hoy usa el agente: el comando nativo de OpenCode medido en el equipo de referencia, y conservar 2 s.
- **C:** Reemplazar el umbral absoluto por uno relativo («no más de k veces el comando nativo»).

### Análisis (trade-offs)

- **A:** la fuente trata la paciencia de una persona; el consumidor es un agente. Requiere tres salvedades (conjetura, inicio y no fin, personas y no agentes) y deja el valor sin un fundamento propio. Es lo que objeta el dictamen.
- **B:** el fundamento es un dato propio, medido en el mismo equipo que fija RNF-07, sobre la alternativa real del consumidor. Explica además por qué no se conserva el 1 s de la AE1: ni el nativo lo cumple. Conserva el valor validado por la referente el 26/09, sin volver a validarlo. Límite: el escenario medido es mínimo; el nativo sobre el proyecto de referencia puede acercarse a 2 s o superarlo.
- **C:** se adapta solo al tamaño del proyecto, pero cambia el criterio de aceptación validado, obliga a ejecutar OpenCode en cada acreditación y acopla el requisito al rendimiento de otra herramienta.

### Recomendación y fundamento

**B.** El umbral de 2 s exige que RIGE responda en un tiempo del mismo orden que la alternativa que hoy usa el agente: el comando nativo tarda unos 1,2 s en el equipo de referencia, y 2 s le dejan a RIGE un margen de unos 0,7 s. Shneiderman (1984) deja de citarse como fundamento y pasa a la §3 de `fuentes.md`. Se responde así la pregunta 4 del Bloque A: el cambio respecto de la AE1 obedece al objeto medido (invocación completa por un agente, no previsualización para una persona); la fuente es la medición propia; la referente solo aceptó el valor el 26/09.

**Condición que invalidaría la decisión:** que el comando nativo, medido sobre el proyecto de referencia de RNF-07 CA-1 (doble de openchamber `fc012ae`), supere los 2 s. En ese caso el umbral queda por debajo de la alternativa y se reabre el valor (alternativa C o un umbral nuevo, con validación de la referente).

### Decisión del autor

**Aceptado por el autor el 15/10/2026**, tal como está redactado.

### Consecuencias

- **Libro y Anexo I:** RNF-07 conserva enunciado y criterio; la trazabilidad suma la medición del 15/10/2026.
- **Anexo III, D-28:** suma el fundamento del valor (comando nativo) y la alternativa descartada (tolerancia humana).
- **ADR-055, eje T:** se reemplaza «límites de respuesta de uso difundido» por esta medición.
- **`fuentes.md`:** `shneiderman1984` pasa a la §3 (retiradas). La medición del 15/10 entra en la §2 (evidencia propia) cuando se cite.
- **Pendiente:** medir el comando nativo sobre el proyecto de referencia al construir el proyecto sintético de RNF-07 (PV-02), y registrar el resultado aquí.

### Evidencia

- `01-relevamiento/evidencia/rnf07-comando-nativo_20261015.md`
- Dictamen DEV-AE2 N.º 14/2026, Bloque A, pregunta 4
- ADR-055; informe de la AE1, A.III.1.7
- Shneiderman, B. (1984), ACM Computing Surveys, 16(3), pp. 266 y 273 (verificador de fuentes, 15/10/2026)
