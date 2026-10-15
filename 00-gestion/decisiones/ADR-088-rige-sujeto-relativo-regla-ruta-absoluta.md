# ADR-088 — RIGE evalúa las acciones sobre archivos con la ruta relativa al árbol de trabajo, como OpenCode, y detecta las reglas de permiso que no pueden coincidir por su forma de ruta

- Estado: aceptado (14/10/2026)
- Fecha: 14/10/2026
- **Origen posterior al resultado:** el mecanismo se observó en la línea de base de modificación (ADR-086). Se fija antes de construir el evaluador de RF-02 y antes del corte del 07/11/2026.
- Capítulos afectados: Cap. III (Anexo I, RF-02 y RF-07); Cap. I (I.2.4, OE-2 y OE-3); `03-requisitos/libro/catalogo/RF-02.md` y `RF-07.md`; manifiesto de aceptación (ADR-080); Cap. VI (estrategia de pruebas)
- Origen: crítica de la línea de base (14/10/2026), hallazgo 20
- Modifica: ADR-080 (contenido del manifiesto). Precisa RF-02 y RF-07

### Contexto

1. **[D]** OpenCode 1.18.25 pide permiso para `read`, `edit`, `write` y `apply_patch` sobre `path.relative(worktree, archivo)` (`verificacion/20261014-tareas-modificacion/captura-binario-20261014.txt`).
2. **[D]** En la línea de base de modificación, 16 de 144 ejecuciones escribieron reglas con ruta absoluta. OpenCode no las aplicó y los agentes declararon éxito (`verificacion/20261014-analisis-LB-mod/`, verificación nativa en `verificacion-nativa-ruta/`).
3. **[D]** RF-02 dice «dado un agente y una acción» y no define la forma de la ruta de la acción. `src/` todavía no tiene evaluador de permisos (iteración 2).
4. **Inferencia de la crítica:** si RIGE compara la ruta en forma literal, un agente que lo consulte con la ruta absoluta recibe `allow` y RIGE reproduce el éxito declarado falso. «RIGE lo detectaría» hoy no es falsable.

### Alternativas evaluadas

- **S-A:** dejar RF-02 como está y declarar la limitación.
- **S-B:** RF-02 normaliza la ruta de la acción como OpenCode (relativa al árbol de trabajo), cualquiera sea la forma en que se consulte, y RF-07 detecta las reglas de permiso por archivo cuyo patrón no puede coincidir por su forma (ruta absoluta dentro del árbol).
- **S-C:** S-B, más una advertencia explícita en la salida de RF-02 cuando la consulta llega con ruta absoluta.

### Análisis (trade-offs)

- **S-A** deja al producto expuesto exactamente al error observado, y la afirmación de ADR-086, punto 6, sin respaldo.
- **S-B** convierte el hallazgo en criterios de aceptación comprobables contra el binario. La «regla sin efecto por forma de ruta» es un caso del tipo «reglas de permiso sin efecto» que RF-07 ya cubre: no agrega un tipo, agrega un defecto sembrado. Costo: un criterio en RF-02, un escenario y un defecto sembrado en el manifiesto (3 a 6 h del escritor).
- **S-C** suma valor de uso, con más superficie y sin cambiar la verificación. Se deja para después de la iteración 2.

### Recomendación y fundamento

**S-B.**

1. **RF-02, CA nuevo (CA-9):** dada una acción sobre un archivo del árbol de trabajo expresada con ruta absoluta o relativa, RIGE informa la misma decisión y la misma regla determinante que el evaluador de OpenCode 1.18.25, que evalúa la ruta relativa al árbol. Escenario: la regla `read` `/home/<usuario>/proyecto/src/productos.js` → `allow` junto a `read` `*` → `deny`; la decisión informada para `src/productos.js` es `deny`, por las dos formas de consulta.
2. **RF-07, defecto sembrado nuevo** dentro del tipo «reglas de permiso sin efecto»: una regla de permiso por archivo con ruta absoluta dentro del árbol de trabajo, que no coincide con ninguna acción. RIGE la informa con su localización y la causa («OpenCode evalúa la ruta relativa al árbol»). Control correcto: la misma regla con ruta relativa no se señala.
3. **Manifiesto (ADR-080):** se agregan el escenario del punto 1 (OE-2) y el defecto del punto 2 (OE-3) antes del corte del 07/11/2026. La base del manifiesto no cambia de otra forma.
4. **Medición final:** el brazo con RIGE de la dimensión de modificación (descriptiva, ADR-086) informa si las ejecuciones que consultan a RIGE evitan el éxito declarado falso. No es criterio de cumplimiento.

**Condiciones que invalidarían la decisión:**
1. El código del tag muestra otra normalización para algún tipo de permiso (por ejemplo, `external_directory` o rutas fuera del árbol): el CA se acota a los tipos verificados.
2. RF-02 no llega al corte del 07/11 (ADR-051, condición 1): el CA-9 pasa a la iteración siguiente y se declara.

### Decisión del autor

**Aceptado por el autor el 14/10/2026**, tal como está redactado, después de la crítica de la línea de base.

### Consecuencias

**Si se acepta:**
- **Libro:** `RF-02.md` (CA-9) y `RF-07.md` (defecto sembrado en el CA-1), por el redactor; Anexo I.
- **Referente:** se le informa el CA nuevo (PV-03); el estado de validación de RF-02 se mantiene, porque se precisa el criterio de un requisito ya validado sin cambiar su enunciado.
- **`src/`:** ficha del escritor para el manifiesto y el escenario (antes del 07/11), dentro de la iteración 2.
- **I.2.4:** sin cambio de enunciado; los indicadores de OE-2 y OE-3 ya cubren «decisión coincidente» y «reglas de permiso sin efecto».

### Evidencia

- `01-relevamiento/linea-base/verificacion/20261014-tareas-modificacion/captura-binario-20261014.txt`
- `01-relevamiento/linea-base/verificacion/20261014-analisis-LB-mod/` (incluida `verificacion-nativa-ruta/`)
- `03-requisitos/libro/catalogo/RF-02.md`, `RF-07.md`; `00-gestion/decisiones/ADR-080-conjunto-escenarios-aceptacion-sin-retiro.md`
