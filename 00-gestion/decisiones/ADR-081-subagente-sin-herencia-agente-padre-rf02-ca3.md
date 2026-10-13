# ADR-081 — RF-02 CA-3: el subagente se rige por su propio conjunto de reglas; las restricciones del agente padre no se heredan

- Estado: aceptado (13/10/2026)
- Fecha: 13/10/2026
- Capítulos afectados: Cap. III (Anexo I, ficha de RF-02); Cap. I (I.6.1, Tabla 6; I.6.2, F4); Anexo VI (A.VI.3, resultado 12); libro (`catalogo/RF-02.md`, `trazabilidad.md`); `01-relevamiento/opencode/como-funciona.md` §12 y `laboratorio-verificacion.md` (C-11); hoja de respuestas de la línea de base (C-3f); validación con la referente (PV-03)
- Origen: verificación de la fase 2 de la línea de base, 13/10/2026 (AD-29)
- Modifica: el criterio CA-3 de RF-02 (catálogo validado el 26/09/2026). No cambia el enunciado de RF-02
- Relacionado: ADR-075 (CA-8), ADR-079 (casos), D-06 (evaluador incorporado), RNF-02 (coincidencia con OpenCode)

### Contexto

**Criterio vigente** (`03-requisitos/libro/catalogo/RF-02.md`): «CA-3: Consultado un subagente, la cadena incluye las denegaciones heredadas del agente que lo invoca». Se apoya en A.VI.3, resultado 12, y en `como-funciona.md` §12: «Del padre se heredan las reglas `deny`».

**Evidencia nueva** (dato del repositorio, 13/10/2026):
1. **Ejecución.** Con OpenCode 1.18.25 en el contenedor, `build` con `bash` denegado en `agent.build.permission` lanza a `general` con `task`. Al subagente se le ofrece `bash` y `git status` se ejecuta (`01-relevamiento/linea-base/verificacion/20261013-permisos/C-3f/`). La denegación escrita como objeto (`{"*":"deny"}`) da el mismo resultado (`verificacion/20261013-c3f-variante-objeto/`). El subagente sí pierde `task` y `todowrite`.
2. **Código del tag** (`packages/opencode/src/agent/subagent-permissions.ts`, copia en `01-relevamiento/evidencia/opencode-subagent-permissions_20261013.ts`).
   - La función `deriveSubagentSessionPermission` toma de la **sesión** padre (`parentSessionPermission`) las reglas `deny` y las de `external_directory`, y agrega las denegaciones de `todowrite` y `task` cuando el conjunto propio del subagente no las permite.
   - El comentario del código es explícito: «Parent agent restrictions only govern that agent; the subagent's own permissions determine its capabilities».
3. **El resultado 12 confundió la sesión con el agente,** y su experimento (E-16) no conservó evidencia. Es una suposición plausible que la denegación de E-16 estuviera a un nivel que también alcanzaba a `general`.

**Consecuencia:** un RIGE que cumpla el CA-3 vigente informaría `deny` donde OpenCode decide `allow`. Eso viola RNF-02 justo en un caso de seguridad: el desarrollador cree que restringir al agente padre restringe a los subagentes que lanza, y no es así.

**La sesión no es configuración.** El conjunto de reglas de la sesión padre no proviene de las entradas de configuración que RIGE lee. Lo fija la ejecución, por ejemplo una sesión creada con permisos por la API. Esto es una suposición sobre su origen, a verificar en el código antes de implementar.

### Alternativas evaluadas

- **A · Reescribir el CA-3 con el comportamiento verificado.** La cadena del subagente es la de su propio conjunto de reglas, más las denegaciones implícitas de `task` y `todowrite` cuando su conjunto no las permite. Las reglas del agente padre no se incorporan, y RIGE lo advierte en forma explícita. Las reglas de la sesión padre quedan fuera del análisis estático y se declaran, como las aprobaciones permanentes (L-xx, I.6.4).
- **B · Eliminar el CA-3.** RF-02 quedaría sin criterio sobre subagentes.
- **C · Mantener el CA-3.** RIGE contradiría a OpenCode (RNF-02).

### Análisis (trade-offs)

- **C** es inaceptable: el oráculo la refuta.
- **B** pierde justamente el caso con más valor explicativo. Que la restricción del padre no alcance al subagente es contraintuitivo, no está documentado y tiene efecto de seguridad. Es el tipo de respuesta que justifica a RIGE.
- **A**:
  - convierte el hallazgo en un criterio verificable contra el oráculo (C-3f ya lo ejercita);
  - se implementa con lo que el evaluador incorporado ya hace (D-06), porque la función es pura y está en el tag;
  - declara el límite de la sesión en lugar de simularlo.
  - Costo: cambia un criterio validado, así que hay que informarlo a la referente, y corregir A.VI.3, I.6 y el relevamiento técnico.

### Recomendación y fundamento

**A.** El CA-3 nuevo queda:

> «CA-3: Consultado un subagente lanzado por un agente mediante `task` en una sesión nueva, el sistema informa la decisión según el conjunto de reglas propio del subagente, más una denegación de `task` y otra de `todowrite` cuando ese conjunto no contiene una regla con ese identificador exacto (una regla general `*` no lo evita). Declara que las reglas del agente que lo lanza no se aplican al subagente. Sobre el escenario de aceptación del subagente (ADR-080), la decisión, la cadena y su procedencia coinciden con OpenCode 1.18.25 en cuatro variantes: padre con `bash` denegado, subagente sin regla de `task`, subagente con una regla general `* → allow` sin regla de `task`, y subagente con `task → ask`. Las reglas de la sesión que lo lanza y las restricciones de `experimental.primary_tools` no integran el análisis, y se declaran: RIGE advierte cuando la configuración declara `experimental.primary_tools`.»

**Estado de validación:** RF-02 conserva «Validado», porque su enunciado no cambia (criterio del autor en ADR-073). El cambio del CA-3 se informa a la referente por PV-03, como corrección de una precisión validada sobre un dato que resultó erróneo.

**Verificación de la vía de sesión** (crítico de Codex con acceso al tag, 13/10/2026; dato del repositorio de OpenCode, commit `cb7d8b2`):
- la herramienta `task` pasa `parent.permission ?? []`;
- `opencode run` crea la sesión con denegaciones de `question`, `plan_enter` y `plan_exit` en modo no interactivo, y con `[]` en el interactivo;
- el servidor conserva el `permission` explícito de la solicitud sin consultar el agente;
- la evaluación del padre concatena las reglas del agente y las de la sesión, sin guardarlas en la sesión.

En uso normal no hay herencia de las reglas del agente padre por ninguna vía. La herencia de la sesión existe solo con permisos de sesión explícitos (API o campo `tools`). Los clientes gráficos externos a `packages/opencode/src` no se verificaron (suposición: usan el mismo servidor).

**Condiciones que invalidarían la decisión:**
1. **Una ejecución con un cliente gráfico o con la interfaz web de OpenCode muestra que el subagente recibe las reglas del agente padre.** La herencia existe por esa vía y el CA-3 la incorpora, verificada por ejecución.
2. **La referente objeta el cambio.** Se registra la objeción; el comportamiento de la herramienta no se negocia, pero se revisa cómo se presenta.

### Decisión del autor

**Aceptado por el autor el 13/10/2026** («acepto todo»), con el CA-3 corregido tras la crítica de Codex (identificador exacto de `task` y `todowrite`; `experimental.primary_tools` fuera del análisis y advertido; escenario de cuatro variantes).

### Consecuencias

**Si se acepta:**
- **Libro y Anexo I:** CA-3 de RF-02 reescrito; `trazabilidad.md` (H-12) con la corrección.
- **A.VI.3, resultado 12:** se corrige con la misma fórmula expresa que el resultado 11. Se consigna la corrección, no se reemplaza en silencio.
- **I.6:** la Tabla 6 («permiso heredado por los subagentes») y F4 («herencia declarativa») se corrigen al tratar I.6.
- **Relevamiento técnico** (`como-funciona.md` §12 y `laboratorio-verificacion.md` C-11): nota de corrección con la evidencia (la hace el ingeniero).
- **Línea de base:** C-3f queda con la respuesta corregida y la hoja puede cerrarse.
- **Conjunto de aceptación (ADR-080):** escenario del subagente con las cuatro variantes del CA-3, verificado con el arnés de permisos de la línea de base.
- **Límite nuevo** (III.4, al corregir el Cap. III): permisos de sesión y `experimental.primary_tools` fuera del análisis, con advertencia.
- **Referente:** se suma a PV-03.
- **Iteración 2 (RF-02):** la ficha del escritor toma el CA-3 nuevo.

### Evidencia

- `01-relevamiento/linea-base/verificacion/20261013-permisos/C-3f/` y `verificacion/20261013-c3f-variante-objeto/`
- `01-relevamiento/evidencia/opencode-subagent-permissions_20261013.ts` (tag v1.18.25)
- `03-requisitos/libro/catalogo/RF-02.md`; `informe/anexos/anexo-VI-datos-relevados.md`, A.VI.3, resultados 11 y 12
- `01-relevamiento/opencode/como-funciona.md` §12; `laboratorio-verificacion.md`, C-11 y E-16
