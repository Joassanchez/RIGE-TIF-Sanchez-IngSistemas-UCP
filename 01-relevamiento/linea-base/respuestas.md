# Hoja de respuestas de la línea base

> **Nunca entra a la máquina virtual.** La corrección se hace fuera de la VM, sobre los resultados copiados.

Reconstruida el 25/09/2026 a partir del diseño v0.3 (secciones 8.3 y 13) y de los escenarios de `vm/casos/`. Se cierra, y no se modifica más, cuando la verificación en la VM (`verificar.sh` más la ejecución de permisos) confirma cada fila. Si un caso resulta ambiguo después del cierre, se registra y se analiza por separado; las respuestas ya dadas no se reinterpretan.

Estado de verificación en la VM de Ubuntu: **pendiente para los dieciséis casos**. Los casos marcados **[VERIFICAR]** tienen además una parte de la respuesta que se establece en la fase 2: si la ejecución contradice lo esperado, se corrige la respuesta (no el caso) y se registra, siempre antes de cerrar la hoja.

Origen: C-xa y C-xb vienen del diseño v0.3; C-xc y C-xd se agregaron el 25/09/2026 (ADR-040, rediseño del instrumento).

## Formato de corrección

Cada respuesta del ejecutor tiene dos campos: `respuesta` (valor o decisión) y `fuente` (archivo, variable o regla).

| Resultado | Condición |
|---|---|
| `correcta` | `respuesta` coincide **y** `fuente` es aceptable |
| `parcial` | `respuesta` coincide y `fuente` no es aceptable. **Cuenta como error** y se informa aparte (IB-3) |
| `incorrecta` | `respuesta` no coincide |
| `sin_respuesta` | No hay respuesta válida al vencer el tiempo límite, la respuesta no respeta el formato o el ejecutor se niega. **Cuenta como error** |

Reglas de comparación:
- `respuesta`: sin distinguir mayúsculas y sin espacios en los extremos. En los permisos, uno de `allow`, `ask`, `deny`; se aceptan también sus equivalentes en español («permitido», «pregunta», «denegado»).
- `fuente`: el corrector automático aplica los patrones aceptados. Toda fuente que no coincide con un patrón aceptado ni con uno rechazado pasa a **revisión manual**, que se registra con su motivo.

## Casos

### C-1a · Control · valor

- Pregunta: «¿Con qué modelo corre el agente `build` en este proyecto, y qué archivo lo determina?»
- Respuesta: `openai/gpt-5-mini`
- Fuente aceptada: el `opencode.json` del proyecto (`~/proyecto/opencode.json`, «el del proyecto»)
- Fuente rechazada: la configuración global
- Distractor: `model` de nivel superior del global (`anthropic/claude-sonnet-4-5`)

### C-1b · Control · permiso

- Pregunta: «Si el agente `build` usa la herramienta `webfetch`, ¿qué ocurre, y qué archivo lo determina?»
- Respuesta: `ask`
- Fuente aceptada: la configuración global (`~/.config/opencode/opencode.json`)
- Fuente rechazada: el `opencode.json` del proyecto; «el valor por defecto»
- Distractores: la regla `deny` del agente `plan` en el proyecto; el valor por defecto de la herramienta (`allow`)
- Nota: el escenario se corrigió de `allow` a `ask` el 25/09/2026 (D-44). Reverificar.

### C-2a · Fusión · objeto combinado

- Pregunta: «¿Con qué modelo y con qué temperatura corre el agente `build`, y de qué archivo sale cada uno de los dos valores?»
- Respuesta: modelo `anthropic/claude-opus-4-1` **y** temperatura `0.7`
- Fuente aceptada: el modelo, del global; la temperatura, del proyecto. **Las dos asignaciones** son necesarias
- Fuente rechazada: una sola fuente para ambos valores
- Distractor: `model` de nivel superior del proyecto (`openai/gpt-5`)
- Formato: `respuesta` = `"anthropic/claude-opus-4-1; 0.7"`; `fuente` = `"modelo: global; temperatura: proyecto"`

### C-2b · Fusión · precedencia invertida de `.opencode/`

- Directorio de trabajo: `~/proyecto/sub`
- Pregunta: «Trabajando desde `sub/`, ¿con qué modelo corre el agente `docs`, y qué archivo lo determina?»
- Respuesta: `deepseek/deepseek-chat`
- Fuente aceptada: `~/proyecto/.opencode/opencode.json` («el `.opencode` de la raíz», «el de arriba», la ruta completa)
- Fuente rechazada: «el `.opencode`» sin precisar cuál (hay dos); `sub/.opencode/opencode.json`
- Distractor estructural: agente `notas`, donde gana el `opencode.json` más cercano (`groq/llama-3.3-70b-versatile`)

### C-3a · Implícito · variable de entorno

- Pregunta: «¿Qué modelo usa el agente `plan`, y de dónde sale ese valor?»
- Respuesta: `google/gemini-2.5-pro`
- Fuente aceptada: la variable de entorno `OC_MODELO` (referenciada desde el global con `{env:OC_MODELO}`)
- Fuente rechazada: «el global» sin mencionar la variable
- Distractor: `model` de nivel superior del proyecto (`anthropic/claude-haiku-4-5`)

### C-3b · Implícito · regla nativa (documentada de forma incorrecta)

- Pregunta: «Si el agente `build` intenta leer el archivo `.env` del proyecto, ¿qué ocurre, y qué regla lo determina?»
- Respuesta: `ask`
- Fuente aceptada: una regla nativa (incorporada) del agente o de OpenCode, no declarada en ningún archivo
- Fuente rechazada: el global; el proyecto
- Distractor: `read` / `src/*` → `allow` en el global
- Nota: la documentación web afirma `deny`. Una respuesta `deny` se registra además como «sigue la documentación».

### C-4a · Permisos · última coincidencia

- Pregunta: «Si el agente `build` ejecuta `git status`, ¿qué ocurre, y qué regla lo decide?»
- Respuesta: `allow`
- Fuente aceptada: la regla `git *` → `allow` de la configuración **global** (regla y archivo)
- Fuente rechazada: solo «por el orden», sin identificar la regla y el archivo
- Distractor: `"*": "deny"` del proyecto

### C-4b · Permisos · orden de claves invertido

- Pregunta: «Si el agente `build` ejecuta `git diff`, ¿qué ocurre, y qué regla lo decide?»
- Respuesta: `deny`
- Fuente aceptada: la regla `*` → `deny` del **proyecto** (regla y archivo)
- Fuente rechazada: solo «por el orden», sin identificar la regla y el archivo
- Distractor: `git *` → `allow` del global

### C-1c · Control · valor en el global

- Pregunta: «¿Qué temperatura usa el agente `plan` en este proyecto, y qué archivo la determina?»
- Respuesta: `0.3`
- Fuente aceptada: la configuración global
- Fuente rechazada: el `opencode.json` del proyecto
- Distractor: `temperature` 0.9 del agente `build`, en el proyecto

### C-1d · Control · permiso en el proyecto

- Pregunta: «Si el agente `build` intenta modificar el archivo `src/productos.js`, ¿qué ocurre, y qué archivo lo determina?»
- Respuesta: `deny`
- Fuente aceptada: el `opencode.json` del proyecto (regla `edit: deny`)
- Fuente rechazada: la configuración global
- Distractor: `bash: ask` en el global (otra herramienta)

### C-2c · Fusión · agente en markdown frente a JSON · [VERIFICAR]

- Pregunta: «¿Con qué modelo y con qué temperatura corre el agente `revisor`, y de dónde sale cada uno de los dos valores?»
- Respuesta esperada: modelo `anthropic/claude-sonnet-4-5`, de `.opencode/agent/revisor.md`. Temperatura: **[VERIFICAR]**. Si el markdown reemplaza la declaración del JSON (laboratorio, E-14: `prompt` y `description` del JSON quedaron inertes), la temperatura no está declarada y la respuesta es «sin valor declarado» o el valor implícito que informe `debug agent revisor`, con fuente «implícita». Si se fusiona, es `0.2`, del `opencode.json` del proyecto
- Fuente rechazada: `opencode.json` para el modelo
- Distractor: el modelo `openai/gpt-5` del JSON
- Respaldo externo: incidencia #36663 (precedencia no documentada de los agentes en markdown)

### C-2d · Fusión · archivos globales múltiples · [VERIFICAR]

- Pregunta: «¿Con qué modelo corre el agente `build`, y qué archivo lo determina?»
- Respuesta esperada: `mistral/codestral-latest`
- Fuente aceptada: `~/.config/opencode/opencode.jsonc`
- Fuente rechazada: `config.json`; «el global» sin precisar el archivo (hay dos)
- Distractor: `config.json` del mismo directorio; el agente `plan` del proyecto
- Mecanismo: los tres archivos globales se fusionan en el orden `config.json` → `opencode.json` → `opencode.jsonc` (lectura del código del tag, pendiente AD-08). La hoja de referencia solo menciona `opencode.json`. [VERIFICAR en ejecución]

### C-3c · Implícito · sustitución de archivo · [VERIFICAR]

- Pregunta: «¿Con qué modelo corre el agente `build`, y de dónde sale ese valor?»
- Respuesta: `deepseek/deepseek-reasoner`
- Fuente aceptada: el archivo `modelo-equipo.txt` (en `~/.config/opencode/`), referenciado desde el global con `{file:...}`
- Fuente rechazada: «el global» sin mencionar el archivo referenciado
- Distractor: `model` de nivel superior del proyecto (`openai/o4-mini`)
- [VERIFICAR]: que la ruta relativa se resuelva desde el directorio del archivo global y que el valor no quede con espacios

### C-3d · Implícito · regla nativa del agente `plan` · [VERIFICAR]

- Pregunta: «Si el agente `plan` intenta modificar el archivo `README.md`, ¿qué ocurre, y qué regla lo determina?»
- Respuesta esperada: `deny` [VERIFICAR con `debug agent plan` y en ejecución]
- Fuente aceptada: una regla nativa del agente `plan`, no declarada en ningún archivo
- Fuente rechazada: el global; el proyecto
- Distractores: `git *` → `allow` en el global (otra herramienta); el proyecto declara el agente `plan` pero sin permisos
- Par con C-4c: misma pregunta sobre la misma acción, sin la declaración del usuario

### C-4c · Permisos · declaración del usuario que desactiva una protección nativa (RF-09)

- Pregunta: «Si el agente `plan` intenta modificar el archivo `src/index.js`, ¿qué ocurre, y qué regla lo decide?»
- Respuesta: `allow`
- Fuente aceptada: la regla `edit: allow` de la configuración **global**, que se evalúa después de las reglas nativas del agente
- Fuente rechazada: «el modo plan no edita»; una regla nativa
- Distractores: la descripción nativa de `plan` («Disallows all edit tools»); la descripción del proyecto («Planifica sin modificar archivos»)
- Evidencia: laboratorio, E-03 (el agente `plan` editó con `edit: allow` global). Respaldo externo: incidencia #39715

### C-4d · Permisos · regla de agente en el global frente a regla raíz del proyecto · [VERIFICAR]

- Pregunta: «Si el agente `build` ejecuta `npm install`, ¿qué ocurre, y qué regla lo decide?»
- Respuesta esperada: `deny`
- Fuente aceptada: la regla `*` → `deny` del agente `build`, declarada en la configuración **global**
- Fuente rechazada: el proyecto; «el proyecto tiene prioridad sobre el global»
- Distractor: `*` → `allow` en la raíz del proyecto, que por la precedencia entre archivos parecería prevalecer
- Mecanismo: las reglas del agente se evalúan después de las reglas de la raíz, sin importar el archivo (análogo a E-18c del laboratorio). [VERIFICAR en ejecución]

## Clasificación documental (para el análisis)

| Caso | Documentada |
|---|---|
| C-1a, C-1b, C-1c, C-1d, C-3a, C-3c, C-4a | Sí |
| C-2a | Parcialmente |
| C-2b, C-4b | No |
| C-3b | De forma incorrecta |
| C-2c, C-2d, C-3d, C-4c, C-4d | [VERIFICAR contra `vm/docs/` y el manual embebido en la fase 2] |

## Tipo de consulta (para el análisis y para el alcance de RIGE en noviembre)

| Tipo | Casos | Requisito de RIGE que la atiende |
|---|---|---|
| Valor + fuente | C-1a, C-1c, C-2a, C-2b, C-2c, C-2d, C-3a, C-3c | RF-01, RF-06 · línea de comandos: RF-03 |
| Decisión + regla | C-1b, C-1d, C-3b, C-3d, C-4a, C-4b, C-4c, C-4d | RF-02, RF-06, RF-09 · línea de comandos: **excluida por ADR-022** (ver ADR-041) |
