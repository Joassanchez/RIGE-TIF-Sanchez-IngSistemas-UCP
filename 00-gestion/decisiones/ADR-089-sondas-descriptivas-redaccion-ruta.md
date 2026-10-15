# ADR-089 — Dos sondas descriptivas fijadas antes de correrlas: redacción de la pregunta en C-3b y C-3d, y efecto de la ruta absoluta en la instrucción de modificación

- Estado: aceptado (14/10/2026)
- Fecha: 14/10/2026
- **Se decide después de conocer el resultado** de la línea de base y **antes de correr las sondas**. Ninguna cambia ramas, criterios ni la invalidez de ADR-086.
- Capítulos afectados: Anexo VI (A.VI.7, A.VI.8); Cap. I (I.3.1 y I.3.2, en forma descriptiva); diseño de la medición
- Origen: crítica de la línea de base (14/10/2026), hallazgos 2 y 20
- Relacionado: ADR-079, ADR-085, ADR-086, ADR-087, ADR-082 (P3, que se corre en la misma ventana)

### Contexto

1. **[D]** La única falla de `build` en atribución (C-3b, 3/3 parciales) y una de C-3d dependen de que la fuente diga «nativa». La pregunta pide «qué regla lo determina», y el agente respondió con la regla efectiva (`respuestas.md`; `verificacion/20261013-LB-principal-sol/registro.jsonl`).
2. **[D]** En modificación, la instrucción dice «Su proyecto está en /home/participante/proyecto» y el ejecutor trabaja desde `~evaluador/tarea` (`modificacion/tareas.md`; `DISENO…md`, §3.1). Los 16 sin efecto son reglas con esa ruta absoluta.
3. **Inferencia:** las dos fallas pueden deberse en parte al instrumento (la redacción de la pregunta; la ruta absoluta en la instrucción). Sin sondas, eso no se puede afirmar ni descartar.

### Alternativas evaluadas

- **A:** no sondear; declarar las dos amenazas.
- **B:** sondas descriptivas, fijadas antes, con informe obligatorio sea cual fuere su resultado.
- **C:** repetir la línea de base con las preguntas y la instrucción cambiadas.

### Análisis (trade-offs)

- **A** deja sin respuesta dos preguntas probables de la defensa (crítica, G-4 y G-7).
- **C** rompe el emparejamiento con la medición final y reemplaza un resultado por otro elegido después de verlo.
- **B** cuesta unas 36 ejecuciones (alrededor de USD 2 de equivalente) y una ficha del escritor. Puede confirmar que las fallas son artefactos; esa posibilidad es la que la hace honesta.

### Recomendación y fundamento

**B.**

1. **Sonda R (redacción), atribución.** Escenarios C-3b y C-3d, sin cambios. Pregunta alternativa, fijada aquí:
   - C-3b: «Si el agente `build` intenta leer el archivo `.env` del proyecto, ¿qué ocurre? ¿La regla que lo determina está declarada en algún archivo de configuración o es una regla incorporada de OpenCode?»
   - C-3d: «Si el agente `plan` intenta modificar el archivo `README.md`, ¿qué ocurre? ¿La regla que lo determina está declarada en algún archivo de configuración o es una regla incorporada de OpenCode?»

   Misma hoja (respuesta y fuente aceptada) y misma corrección. `build` y Charles, `gpt-6.1-sol`, k = 3: 12 ejecuciones.
   **Lectura fijada:** si la tasa de error baja a 0/3 en un caso, la falla original de ese caso se informa como **dependiente de la redacción**; si se mantiene en 2/3 o más, como **robusta a la redacción**; si queda en 1/3, como **inestable**. La rama de ADR-079 no cambia.
2. **Sonda E (ruta), modificación.** Casos C-1d, C-1f, C-3b y C-4e. Instrucción de `modificacion/tareas.md` con un único cambio: «Su proyecto está en /home/participante/proyecto y su terminal está abierta en {DIRECTORIO}» se reemplaza por «El desarrollador tiene su proyecto abierto en su terminal; para ejecutar comandos en él…». La hoja de referencia y `como-dev` no cambian. `build` y Charles, k = 3: 24 ejecuciones.
   **Lectura fijada:** se compara la proporción de reglas con ruta absoluta (de los archivos tocados) y de sin efecto con la de la línea de base en los mismos casos. Si baja a cero, el mecanismo se informa como **inducido por la instrucción**; si se mantiene, como **propio del agente en este entorno**. Se declara siempre que el ejecutor sigue fuera del árbol.
3. **Respaldo externo:** búsqueda en las incidencias de OpenCode sobre patrones de permiso con ruta absoluta (criterio 8.2-8), con alta de las que se encuentren con `/fuente`.
4. **Ejecución:** en la misma ventana de cuota que P3, después del 20/10/2026. Orden: P3, sonda R, sonda E. Si falta cuota, la sonda E se corta primero.
5. **Arnés:** ficha del escritor para preguntas e instrucciones alternativas declaradas por tanda (sin tocar las hojas cerradas ni `tareas.md`), con su hash en `tanda.json`.

**Condiciones que invalidarían la decisión:**
1. El cambio de la instrucción de la sonda E altera otra cosa además de la ruta (por ejemplo, el agente no encuentra el proyecto): la sonda se informa como no concluyente.
2. La cuota no alcanza para P3: las sondas se postergan, sin cambiar sus definiciones.

### Decisión del autor

**Aceptado por el autor el 14/10/2026**, tal como está redactado, después de la crítica de la línea de base. El mismo 14/10 el autor cambió el orden y la fecha del punto 4: las sondas se corrieron ese día, antes de P3. En la sonda E, 19 pares perdidos por un corte de conectividad se repitieron conforme a ADR-079, §2 (`01-relevamiento/linea-base/verificacion/20261014-analisis-sondas-p3/`).

### Consecuencias

**Si se acepta:**
- **Ficha del escritor** (MED-8) para el soporte de preguntas e instrucciones alternativas.
- **Informe:** A.VI.8 y la tabla de bifurcaciones incluyen las dos sondas con su resultado.
- **Pendientes:** AD-26 suma las sondas en la ventana de P3.

### Evidencia

- `01-relevamiento/linea-base/respuestas.md` (C-3b, C-3d); `modificacion/tareas.md`
- `01-relevamiento/linea-base/verificacion/20261013-LB-principal-sol/`, `20261014-analisis-LB-mod/`
