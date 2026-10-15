# ADR-085 — Dimensión de modificación en la medición: una tarea por caso para medir la modificación sin efecto (consecuencia 2 de I.3), con sus reglas fijadas antes de su línea de base

- Estado: aceptado (14/10/2026)
- Fecha: 14/10/2026
- **La hipótesis es anterior a la medición** (I.3 la enuncia desde el 24/09/2026, commit `4911c87`); **la decisión de medirla en forma directa es posterior** al resultado de la línea de base de atribución (rama P) y se declara así.
- Capítulos afectados: Cap. I (I.3.1, consecuencia 2; I.3.2; I.2.4, OE-4); Cap. V (V.2); Anexo VI (A.VI.7, A.VI.8); Anexo III (D-41); diseño de la medición (`DISENO-medicion-agentes.md`, §2 principio 3, §4, §5); hoja de respuestas nueva
- Origen: sesión del 14/10/2026 (pregunta del autor: si el agente no conoce la procedencia, ¿falla al modificar la configuración?)
- Relacionado: ADR-079 (reglas de ramas, que se replican), ADR-082 (k, modelo, ejecutores), ADR-084 (objetivo general), ADR-054 (contenedor)

### Contexto

1. **I.3, consecuencia 2** (dato: `informe/cap-01/I.3-necesidad-problema-responde-proyecto.md`): «una respuesta errónea sobre la fuente que determina un valor conduce a modificar un archivo sin efecto sobre el estado efectivo, y el desarrollador puede interpretar que la operación fue exitosa». Agrega que los aciertos parciales «miden esta situación de forma directa».
2. **Esa última afirmación es inexacta:** el parcial mide la atribución errónea, que es la condición previa; la modificación sin efecto no se observó.
3. **La medición vigente prohíbe modificar** (`DISENO-medicion-agentes.md`, §2, principio 3).
4. **Supuestos que pueden refutar la hipótesis:** una regla del usuario le gana a una nativa, así que en C-3b el agente puede modificar bien sin conocer la procedencia; y el agente puede comprobar con `debug agent` y corregir (ADR-079, contexto 2).

### Alternativas evaluadas

- **A · Sin medición:** se corrige I.3 (el parcial mide la condición previa; la modificación sin efecto se declara como inferencia).
- **B · Medición exploratoria:** tareas de modificación solo descriptivas, fuera del criterio.
- **C · Medición con criterio:** una tarea por caso, con reglas de ramas fijadas antes de su línea de base, como segundo criterio del OE-4 cuando su rama lo tenga.

### Análisis (trade-offs)

- **A** no cuesta nada, pero deja sin evidencia la consecuencia que justifica que la procedencia importe.
- **B** produce evidencia, pero no restituye un criterio derivado de una línea de base.
- **C** tiene el riesgo de un criterio que se agrega tras un resultado desfavorable (conocimiento general: «mover el arco»). Lo acotan cinco salvaguardas: la hipótesis es anterior; los casos salen de una regla (los 24, sin filtrar); el criterio se fija antes de observar ninguna modificación; la medición de atribución no se reemplaza y se informa primero; la corrección es mecánica. Costo: instrumento nuevo, 144 ejecuciones de línea de base y 288 en noviembre.

### Recomendación y fundamento

**C, y A en todos los casos** (la frase de I.3 se corrige igual).

1. **Tareas:** una por cada uno de los 24 casos, sobre el mismo escenario. Se pide cambiar la misma clave o decisión que pregunta el caso a un valor objetivo ausente del escenario; en los compuestos, la parte cuya fuente determinante es la menos visible. Detalle en `01-relevamiento/linea-base/verificacion/20261014-tareas-modificacion/diseno-tareas-modificacion.md`; hoja de tareas en `01-relevamiento/linea-base/modificacion/tareas.md`.
2. **Correcta:** el estado efectivo del agente objetivo después de la tarea coincide con el objetivo y no cambia ningún otro valor ni decisión de sondeo **de ese agente**. El lugar del cambio y los cambios en otros agentes se registran en forma descriptiva y no cuentan como error. El enunciado de cada tarea declara su alcance: «solo para `<archivo o comando>`; las demás decisiones y valores de `<agente>` no deben cambiar».
3. **Cambios colaterales:** se comparan `debug config` y `debug agent` del agente objetivo (y, en forma descriptiva, de los demás agentes del escenario más `build`, `plan` y `general`), antes y después; para permisos, una lista fija de acciones de sondeo evaluada con un evaluador de última coincidencia propio del arnés, verificado contra las decisiones ejecutadas en la fase 2 (13 de 13 el 14/10/2026). Nunca con el evaluador de RIGE.
4. **Variables de entorno inmutables:** la verificación usa el mismo `caso.env`; la instrucción no menciona la variable.
5. **C-2e (no factible por archivo):** correcta si no cambia nada, `hecho` es `false` e `impedimento` coincide con el patrón de `OPENCODE_CONFIG_CONTENT`.
6. **Salida:** `{"hecho": bool, "cambios": [...], "impedimento": "..."}`. Se informa siempre el **éxito declarado falso** (`hecho: true` sin efecto).
7. **Resultados:** correcta, sin efecto, colateral, incorrecta, sin respuesta; todo lo que no es correcta cuenta como error.
8. **Permisos del ejecutor:** edición permitida solo sobre las rutas de configuración del participante. Charles recupera `edit` (su configuración original lo permite), se declara.
9. **Repeticiones y ejecutores:** k = 3, `gpt-6.1-sol`, `build` y Charles, igual que ADR-082.
10. **Reglas de lectura:** las de ADR-079, §1 a §3, aplicadas a la tasa de error de modificación (validez previa con C-1; caso con problema ≥ 1/2; ramas E, P y N; la rama C no aplica). En la rama E, su criterio es el segundo criterio del OE-4 (ADR-084); en P y N, rige la no regresión y se informa caso por caso. En N, la consecuencia 2 de I.3 se reformula como no observada.
11. **Orden:** verificación de cada tarea contra OpenCode 1.18.25 en el contenedor → aceptación de este registro → ficha del escritor → línea de base de modificación → medición final.
12. **Verificación hecha el 14/10/2026** (sin red, sin modelo; `01-relevamiento/linea-base/verificacion/20261014-tareas-modificacion/`):
    - las 23 tareas factibles son alcanzables y C-2e no lo es por proyecto, `.opencode/` ni agente en markdown;
    - todas las rutas ingenuas previstas sin efecto lo son (13 casos); en C-4b, la regla agregada al final del global sí tiene efecto (la ruta ingenua es al principio);
    - valores objetivo: `google/gemini-2.5-flash`, `0.55`, `Revisa-plan`;
    - el criterio de colaterales sobre todos los agentes marcaba como error ediciones razonables; se acotó al agente objetivo (punto 2), con una segunda captura que lo comprueba;
    - directorio administrado: el binario 1.18.25 lo fija en `/etc/opencode` en Linux (función `managedConfigDir`; `verificacion/20261014-tareas-modificacion/captura-binario-20261014.txt`), salvo la variable de prueba `OPENCODE_TEST_MANAGED_CONFIG_DIR`, inmutable por el punto 4; `/etc/opencode` no existe y `/etc` no es escribible por el participante (verificado el 14/10/2026). C-2e queda no factible por archivo.

**Condiciones que invalidarían la decisión:**
1. La corrección de alguna tarea no puede ser mecánica (sondeo de permisos o C-2e): esa tarea se retira antes de la línea de base, con su motivo; si se retiran más de dos, se vuelve a A.
2. La cuota no alcanza para la línea de base de modificación antes del corte del 14/11/2026: se vuelve a B.
3. El docente objeta agregar la dimensión después del resultado (LB-01): se vuelve a B.

### Decisión del autor

**Aceptado por el autor el 14/10/2026**, en la misma sesión en que aprobó el diseño preliminar, las recomendaciones G1 a G9, el ajuste G2' (colateral solo en el agente objetivo) y los enunciados e instrucción de `01-relevamiento/linea-base/modificacion/tareas.md` (hoja cerrada el 14/10/2026). La aceptación es posterior a la verificación de las tareas contra el binario (punto 12) y a dos ensayos con proveedor simulado; el primero detectó que los patrones de `edit` con rutas absolutas no coinciden con el sujeto relativo que usa OpenCode (`path.relative(worktree, archivo)`), y se corrigieron antes de medir.

### Consecuencias

**Si se acepta:**
- **Diseño de la medición:** sección nueva para la dimensión de modificación; §2, principio 3, con la excepción.
- **Arnés:** ficha del escritor (copia del escenario por ejecución, permisos de edición acotados, captura antes y después, evaluador de sondeo con pruebas, corrector nuevo).
- **Informe:** I.3.1 corrige la consecuencia 2; I.3.2 suma el indicador; OE-4; V.2 (fechas y cuota); A.VI.8 declara el origen posterior al resultado.
- **Cuota:** compite con P3; se planifican juntas.

### Evidencia

- `informe/cap-01/I.3-necesidad-problema-responde-proyecto.md` (consecuencia 2); `git log -S "modificación de archivos que no prevalecen"` → `4911c87` (24/09/2026)
- `01-relevamiento/linea-base/respuestas.md` (distractores de cada caso); `01-relevamiento/opencode/como-funciona.md` (§3, orden de las entradas)
- `01-relevamiento/linea-base/verificacion/20261014-tareas-modificacion/` (diseño, scripts, capturas y evaluación); `01-relevamiento/linea-base/modificacion/` (tareas y hoja)
