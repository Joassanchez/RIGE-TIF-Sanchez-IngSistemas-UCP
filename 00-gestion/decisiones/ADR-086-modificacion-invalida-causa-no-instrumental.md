# ADR-086 — Línea de base de modificación: medición no válida por la validez previa, causa no instrumental verificada, sin repetición e informe descriptivo; corrección declarada del detector de acceso web

- Estado: aceptado (14/10/2026)
- Fecha: 14/10/2026
- **Se decide después de conocer el resultado** de la línea de base de modificación (14/10/2026) y se declara así.
- Capítulos afectados: Cap. I (I.3.1, consecuencia 2; I.3.2; OE-4); Anexo VI (A.VI.7, A.VI.8); Anexo III (D-41); diseño de la medición
- Origen: análisis de las tandas `LB-mod-principal` y `LB-mod-charles` (14/10/2026); elección del autor (14/10/2026: alternativa A)
- Aplica: ADR-085 (punto 10) y ADR-079 (§2, validez previa). No modifica umbrales, k, ramas, la hoja de tareas ni la de respuestas

### Contexto

Datos (`01-relevamiento/linea-base/verificacion/20261014-LB-mod-*-sol/` y `20261014-analisis-LB-mod/`):

1. **`build` + `gpt-6.1-sol`:** 72 de 72 ejecuciones; 64 correctas y 8 sin efecto; sin colaterales, incorrectas, censuras, ediciones fuera de la configuración ni entorno alterado. Equivalente: USD 4,55.
2. **Charles + `gpt-6.1-sol`:** 72 de 72, en dos tandas (64 pares hasta la detención por cuota de las 17:14 y los 8 restantes de 17:54 a 18:02, unidos con `unir.py`); 64 correctas y 8 sin efecto. Equivalente: USD 4,86.
3. **Los 16 sin efecto tienen la misma causa:** el agente escribe una regla de permiso por archivo con la ruta absoluta (p. ej., `read` `/home/participante/proyecto/src/productos.js` → `allow`). OpenCode 1.18.25 evalúa `read`, `edit`, `write` y `apply_patch` sobre `path.relative(worktree, archivo)` (código del binario), de modo que la regla no coincide. Casos: C-1f (3 y 3), C-3b (3 y 3), C-1d (1 y 1), C-4e (1 y 1); los dos ejecutores fallan en los mismos casos.
4. **Verificación con ejecución real** (`20261014-analisis-LB-mod/verificacion-nativa-ruta/`): con la regla del agente, OpenCode decide `deny` al leer `src/productos.js`; con la misma regla relativa, `allow`. El evaluador del arnés coincide. **El instrumento mide correctamente.**
5. **En los 16, el agente declara éxito** tras «verificar con `opencode debug agent`», que muestra la regla agregada pero no evalúa si coincide con el archivo.
6. **Las rutas sin efecto por precedencia previstas por los distractores no se observaron:** todas las tareas de C-2 se resolvieron en el lugar que manda.
7. **Validez previa:** C-1f es caso con problema en los dos ejecutores; por ADR-079, §2, las dos mediciones no son válidas, y la regla manda corregir la causa en el instrumento y repetir.
8. **Detector de acceso web:** marca `acceso_web` en Charles C-3b (repeticiones 1, 2 y 3) porque el agente escribe por `bash` un JSON con `"$schema": "https://opencode.ai/config.json"`; la expresión de `medir.sh` toma cualquier `https?://` como acceso (falso positivo). En Charles C-3f, repetición 2, hay un acceso real: `como-dev 'curl … raw.githubusercontent.com/…'` descargó código fuente de OpenCode.

### Alternativas evaluadas

- **A · No válida, sin repetición:** las mediciones no son válidas y no se leen las ramas; no se repite, **en desviación declarada de ADR-079, §2** («se corrige la causa en el instrumento y se repite»), porque la causa no está en el arnés (verificado) y corregir el control eliminaría el fenómeno; el resultado se informa en forma descriptiva.
- **B · Reinterpretar la validez:** como su función es detectar fallas del instrumento y este funciona, la medición se da por válida.
- **C · Repetir con otra instrucción** (p. ej., indicar que las rutas son relativas).

### Análisis (trade-offs)

- **A** respeta la invalidez fijada antes de medir, pero **no** su consecuencia (repetir): es una desviación de ADR-079, §2. El arnés funciona; el que falla es el control, porque C-1f, siendo un permiso por archivo, expone el mismo error de forma de la ruta que las condiciones difíciles y deja de ser un caso fácil. Se reconoce como **control defectuoso para esta dimensión** (amenaza en A.VI.8). Costo: la dimensión de modificación no aporta criterio de cumplimiento al OE-4.
- **B** cambia una regla con los datos a la vista.
- **C** elimina el error encontrado: mediría otra cosa.
- **Sensibilidad:** aun leída como válida, `build` tendría un único caso con problema en C-2 a C-4 (C-3b): **rama P**, sin criterio de cumplimiento. La elección no cambia el resultado.

### Recomendación y fundamento

**A.**

1. **Las dos mediciones de modificación no son válidas** por ADR-079, §2. No se leen las ramas ni se fija un criterio de modificación para el OE-4; rige ADR-084 (OE-1 a OE-3 y no regresión en atribución).
2. **No se repite:** la causa es un error del agente independiente de la condición, verificado con ejecución real; repetir con el mismo instrumento reproduciría el resultado y cambiar la instrucción lo eliminaría.
3. **Se informa en forma descriptiva** y caso por caso: proporción de sin efecto, éxito declarado falso, mecanismo (forma de la ruta en la regla) y la ausencia de errores por precedencia.
4. **Charles:** los 8 pares pendientes se completaron el 14/10/2026 (tanda `LB-mod-charles-b`); no muestran ninguna falla atribuible al instrumento (condición 1 no se activa).
5. **Detector de acceso web, corrección declarada:** no cuenta como acceso la aparición del identificador de esquema `https://opencode.ai/config.json` dentro de un comando; todo lo demás se mantiene. Se fija después de detectar el falso positivo, es mecánica, se aplica por igual a todas las tandas (atribución y modificación) y se declara en A.VI.8. Implementación: ficha del escritor. El acceso real de Charles C-3f:2 se mantiene marcado y excluido, como prevé el diseño, y se informa.
6. **Medición final de noviembre:** la dimensión de modificación se ejecuta igual (ADR-085), con los mismos parámetros, y se informa en forma descriptiva, sin criterio. El brazo con RIGE muestra si la decisión efectiva por archivo (RF-02) evita el éxito declarado falso.

**Condiciones que invalidarían la decisión:**
1. Los 8 pares pendientes de Charles muestran una falla atribuible al instrumento: se revisa la validez previa con esa evidencia.
2. Una revisión externa objeta no repetir: se ejecuta la repetición con el mismo instrumento como confirmación.

### Decisión del autor

**Aceptado por el autor el 14/10/2026** (alternativa A), después de conocer el resultado de la línea de base de modificación y la verificación con ejecución real de su causa.

### Consecuencias

**Si se acepta:**
- **ADR-085:** sin criterio de modificación en el OE-4 por esta línea de base; la medición final se mantiene descriptiva.
- **Informe:** I.3.1, consecuencia 2, se redacta con el mecanismo observado (regla sin efecto por la forma de la ruta, con éxito declarado falso) y sin atribuirla a la precedencia, que no se observó; A.VI.8 suma la invalidez por un control con error del agente, la corrección del detector y el acceso web real de Charles.
- **Arnés:** ficha del escritor para el detector (punto 5).

### Evidencia

- `01-relevamiento/linea-base/verificacion/20261014-LB-mod-principal-sol/` y `20261014-LB-mod-charles-sol/` (registros crudos; sin `eventos.txt`, que se regeneran del `stdout`)
- `01-relevamiento/linea-base/verificacion/20261014-analisis-LB-mod/` (LEEME, salida de `analizar.py`, verificación nativa)
- Binario de OpenCode 1.18.25: `permission:"read"` y `permission:"edit"` con `patterns:[path.relative(worktree, archivo)]`
