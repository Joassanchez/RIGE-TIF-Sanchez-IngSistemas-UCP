# ADR-083 — Corrección de la línea de base: extracción de la decisión de permiso escrita en texto libre, fijada después de detectar el defecto y aplicada por igual a las dos tandas

- Estado: aceptado (14/10/2026)
- Fecha: 14/10/2026
- Capítulos afectados: Cap. I (I.3, procedimiento de corrección); Anexo VI (A.VI.7, A.VI.8: amenazas de validez); diseño de la medición (`01-relevamiento/linea-base/DISENO-medicion-agentes.md` §5.2; `respuestas.md`, «Formato de corrección»); `herramientas/corregir.py`
- Origen: análisis de las tandas `LB-principal-sol` y `LB-charles-sol` (13/10/2026) y elección del autor (14/10/2026: «recorregir la evidencia»)
- Precisa: `respuestas.md`, «Formato de corrección», regla de comparación de `respuesta` (hoja cerrada el 13/10/2026). No modifica los valores esperados, las fuentes aceptadas o rechazadas, los umbrales, k ni las ramas de ADR-079
- Relacionado: ADR-079 (§2, validez previa), ADR-082

### Contexto

1. **Las dos tandas resultan inválidas por la validez previa:** C-1b y C-1d son «casos con problema» en los dos ejecutores (`analizar.py`, 13/10/2026).
2. **La causa está en la corrección, no en las ejecuciones:**
   - las 27 ejecuciones «incorrectas» de cada ejecutor están en los nueve casos de permiso (C-1b, C-1d, C-3b, C-3d, C-4a a C-4e);
   - en todas, el campo `respuesta` contiene la decisión dentro de una frase: «deny: npm install queda bloqueado…», «Pide aprobación (ask)…», «webfetch = allow (sin aprobación); modificar … = ask»;
   - `corregir.py` compara la cadena completa con `allow`, `ask` o `deny` y, si no coincide, la marca **incorrecta** sin evaluar la fuente. Para la fuente, en cambio, envía a revisión manual lo que no coincide.
3. **Por qué el agente responde en una frase:** las preguntas de esos casos dicen «¿qué ocurre?» y no «¿qué decisión corresponde?». La instrucción pide `"respuesta": "<valor o decisión>"`.
4. Las ejecuciones son completas: sin censura, sin alteraciones y con tokens registrados. La evidencia cruda no cambia.
5. **La regla se fija después de ver el defecto.** No se miraron las fuentes de esas 54 ejecuciones ni el resultado de la recorrección.

### Alternativas evaluadas

- **A · Literal:** mantener la comparación exacta; aplicar ADR-079, §2 (corregir el instrumento y repetir la línea de base completa con preguntas o instrucción que exijan solo `allow`, `ask` o `deny`).
- **B · Recorregir:** extraer la decisión del texto con una regla mecánica fijada antes de recorregir, aplicada a las dos tandas por igual; los casos ambiguos van a revisión manual.
- **C · Ambas:** B, y repetir si cambia la lectura.

### Análisis (trade-offs)

- **A** es la aplicación formal de ADR-079, §2, pero repite 144 ejecuciones (unas 2 h y cuota) para corregir un defecto que no está en las ejecuciones. Además, mantiene un instrumento que mide la forma de escribir y no el error de configuración, que es el constructo (ADR-079, §1: «correcta, parcial, incorrecta o sin respuesta»).
- **B** corrige el defecto en su lugar, que es la corrección. Su costo es de validez: la regla se decide después de ver que esas respuestas se marcaban mal. La salvaguarda:
  - es mecánica y simétrica (no adjudica por juicio);
  - no cambia ningún valor esperado;
  - envía a revisión manual todo lo ambiguo;
  - se aplica antes de conocer el resultado;
  - se declara.
- **C** agrega una repetición condicionada al resultado, que es justo lo que la salvaguarda de B evita.

### Recomendación y fundamento

**B**, con esta regla:

1. **Ámbito:** solo los casos cuya respuesta esperada (o cada parte, en los compuestos) es una decisión de permiso: `allow`, `ask` o `deny`. Los casos de valor no cambian.
2. **Caso simple:**
   - si la comparación exacta vigente da coincidencia, no cambia nada;
   - si no, se buscan en `respuesta` normalizada (`normalizar` de `corregir.py`) las palabras completas `allow`, `ask` y `deny` y los sinónimos de la hoja (`permitido`, `pregunta`, `denegado`);
   - si aparece **exactamente una** decisión distinta, esa es la decisión de la ejecución;
   - si no aparece ninguna o aparecen dos o más distintas, va a **revisión manual** con el motivo «decisión en texto libre sin término explícito o con términos en conflicto».
3. **Caso compuesto (C-4e):**
   - se separa `respuesta` por `;` en tantas partes como la hoja, en su orden;
   - a cada parte se le aplica el punto 2;
   - si la cantidad de partes no coincide o alguna parte no da exactamente una decisión, va a revisión manual.
4. **Decisión extraída distinta de la esperada:** incorrecta.
5. **Decisión extraída igual a la esperada:** la fuente se evalúa con los patrones vigentes, sin cambios (aceptada, rechazada o revisión manual).
6. **Registro:** cada fila conserva la `respuesta` original y agrega `decision_extraida` y `regla_extraccion` (`exacta`, `termino_unico` o `revision_manual`).
7. **Aplicación:** la regla se implementa en `corregir.py` con pruebas antes de recorregir, y se aplica a las dos tandas sin ejecutar nada nuevo.
8. **Adjudicaciones:** las 36 ya hechas siguen valiendo, porque corresponden a filas cuya respuesta es exacta o a casos de valor, y su `hash_respuesta` no cambia. Las revisiones manuales nuevas que produzca la regla se adjudican después y se registran.

**Condiciones que invalidarían la decisión:**
1. La regla deja en revisión manual más de la mitad de las 54 ejecuciones afectadas: la extracción no es mecánica y se vuelve a A.
2. Una revisión externa (docente o tribunal) objeta corregir después de ver el defecto: se ejecuta A como confirmación.

### Decisión del autor

**Aceptado por el autor el 14/10/2026.** El autor eligió la alternativa B («recorregir la evidencia») y aceptó la regla tal como está escrita, antes de conocer el resultado de la recorrección.

### Consecuencias

**Si se acepta:**
- `corregir.py`: la regla, con pruebas (ficha del escritor).
- **`respuestas.md`, «Formato de corrección»:** nota de precisión con remisión a este registro. La hoja no se reabre: los valores, las fuentes y los criterios no cambian.
- **Medición final de noviembre:** las preguntas de permiso se mantienen idénticas (comparación pareada) y rige la misma regla.
- **Informe:** A.VI.8 declara la amenaza (corrección precisada después de detectar el defecto) y su salvaguarda.

### Evidencia

- `01-relevamiento/linea-base/verificacion/20261013-LB-principal-sol/` y `20261013-LB-charles-sol/` (registros crudos)
- `herramientas/corregir.py`, funciones `valor` y `corregir`
- `respuestas.md`, «Formato de corrección»
