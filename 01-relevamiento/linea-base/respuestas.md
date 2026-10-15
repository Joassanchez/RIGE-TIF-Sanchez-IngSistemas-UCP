# Hoja de respuestas de la línea base

> **Nunca entra a la máquina virtual.** La corrección se hace fuera de la VM, sobre los resultados copiados.

Reconstruida el 25/09/2026 a partir del diseño v0.3 (secciones 8.3 y 13) y de los escenarios de `vm/casos/`. Se cierra, y no se modifica más, cuando la verificación en la VM (`verificar.sh` más la ejecución de permisos) confirma cada fila. Si un caso resulta ambiguo después del cierre, se registra y se analiza por separado; las respuestas ya dadas no se reinterpretan.

El instrumento reúne **veinticuatro casos**, seis por condición.

Estado de verificación: **hoja cerrada el 13/10/2026.** Los veinticuatro casos están verificados contra OpenCode 1.18.25 en el contenedor (captura estática y fase 2, al final de esta sección); C-3f y C-2c quedaron con la respuesta corregida por la ejecución. Desde el cierre las respuestas no se modifican; un caso ambiguo se registra y se analiza por separado. Los casos marcados **[VERIFICAR]** tienen además una parte de la respuesta o una clasificación documental que se establece en la fase 2: si la ejecución contradice lo esperado, se corrige la respuesta (no el caso) y se registra, siempre antes de cerrar la hoja.

Origen: C-xa y C-xb vienen del diseño v0.3; C-xc y C-xd se agregaron el 25/09/2026 (ADR-040, rediseño del instrumento); C-xe y C-xf, agregados el 13/10/2026 (ADR-079).

## Verificación en el contenedor · 13/10/2026 (captura estática)

Imagen `rige-linea-base:1.18.25` (base `ubuntu:26.04@sha256:88a381d5…`; OpenCode 1.18.25, binario `opencode-linux-x64-baseline` con SHA-256 `d91e0d33…`, contrastado contra la integridad publicada por npm y contra `src/herramientas/referencias-nativas.ts`). Corrida con `--network none`, sin montajes; evidencia en `verificacion/20261013-captura-estatica/`. Cotejo: Codex (verificador de consistencia, solo lectura), revisado por el ingeniero.

Resultado: 12 casos de valor confirmados; 10 de permiso coherentes por lectura de la cadena de reglas (última coincidencia), con la ejecución real pendiente; C-3f y C-4f no determinables sin ejecución. Sin discrepancias y sin violaciones del criterio 8.2-3. **La hoja no se cierra** hasta ejecutar las decisiones de permiso con el proveedor simulado local (fase 2).

| Caso | Estado | Nota |
|---|---|---|
| C-1a | confirmado | Modelo observado: openai/gpt-5-mini; coincide. 8.2-3: ningún comando capturado identifica además el archivo determinante. |
| C-1b | coherente por lectura | Última coincidencia para webfetch: webfetch * → ask; coincide. Ejecución real pendiente. 8.2-3: la salida nativa no identifica el archivo de la regla. |
| C-1c | confirmado | Temperatura observada de plan: 0.3; coincide. 8.2-3: ningún comando capturado identifica además el archivo determinante. |
| C-1d | coherente por lectura | Última coincidencia para editar src/productos.js: edit * → deny; coincide. Ejecución real pendiente. 8.2-3: la salida nativa no identifica el archivo de la regla. |
| C-1e | confirmado | Temperatura observada de build: 0.4; coincide. 8.2-3: ningún comando capturado identifica además el archivo determinante. |
| C-1f | coherente por lectura | Última coincidencia para leer src/productos.js: read * → deny; coincide. Ejecución real pendiente. 8.2-3: la salida nativa no atribuye la regla a config.json. |
| C-2a | confirmado | Valores observados: anthropic/claude-opus-4-1 y temperatura 0.7; coinciden. 8.2-3: ningún comando capturado proporciona las dos procedencias. |
| C-2b | confirmado | Desde ~/proyecto/sub, docs muestra deepseek/deepseek-chat; coincide. El distractor notas muestra groq/llama-3.3-70b-versatile. 8.2-3: ningún comando capturado identifica el archivo determinante. |
| C-2c | confirmado | Modelo observado: anthropic/claude-sonnet-4-5; temperatura: 0.2. Confirma la alternativa de fusión prevista en la hoja: modelo del Markdown y temperatura del JSON, según los archivos capturados. 8.2-3: las salidas nativas no atribuyen esos valores a sus archivos. |
| C-2d | confirmado | Modelo observado: mistral/codestral-latest; coincide. 8.2-3: ningún comando capturado atribuye el valor a opencode.jsonc. |
| C-2e | confirmado | Modelo observado: deepseek/deepseek-chat; coincide. La exportación registrada de OPENCODE_CONFIG_CONTENT coincide con caso.env. 8.2-3: las salidas nativas no atribuyen el modelo a esa variable. |
| C-2f | confirmado | Valores observados: mistral/codestral-latest y temperatura 0.9; coinciden. OPENCODE_CONFIG apunta a /home/participante/.config/opencode/equipo.json, como caso.env. 8.2-3: ningún comando capturado proporciona las dos procedencias. |
| C-3a | confirmado | Modelo observado: google/gemini-2.5-pro; coincide. La exportación registrada de OC_MODELO coincide con caso.env. 8.2-3: las salidas nativas no identifican la variable como procedencia. |
| C-3b | coherente por lectura | Última coincidencia para leer .env: read *.env → ask; src/* no coincide. Decisión esperada coincidente; ejecución real pendiente. 8.2-3: native=true identifica al agente, sin atribuir la procedencia de esta regla. |
| C-3c | confirmado | Modelo observado: deepseek/deepseek-reasoner, sin espacios adicionales; coincide con la sustitución del archivo relativo capturado. 8.2-3: las salidas nativas no identifican modelo-equipo.txt como procedencia. |
| C-3d | coherente por lectura | Última coincidencia para editar README.md: edit * → deny; las excepciones para archivos de planes no coinciden. Ejecución real pendiente. 8.2-3: native=true no atribuye la procedencia de esta regla. |
| C-3e | confirmado | Description observada: Revisa--equipo; coincide, incluidos los dos guiones. La captura no distingue variable ausente de variable definida vacía. 8.2-3: las salidas nativas no identifican conjuntamente el archivo y la variable ausente. |
| C-3f | no determinable | Build muestra bash * → deny; general consultado por separado conserva * → allow. No se capturó el lanzamiento por task desde build, por lo que no se determina la decisión heredada esperada deny. 8.2-3: ningún comando capturado muestra decisión y procedencia de esa herencia concreta. |
| C-4a | coherente por lectura | Para git status, bash * → deny precede a bash git * → allow; la última coincidencia da allow, como se espera. Ejecución real pendiente. 8.2-3: la salida nativa no identifica el archivo de la regla ganadora. |
| C-4b | coherente por lectura | Para git diff, bash git * → allow precede a bash * → deny; la última coincidencia da deny, como se espera. Ejecución real pendiente. 8.2-3: la salida nativa no identifica el archivo de la regla ganadora. |
| C-4c | coherente por lectura | Para editar src/index.js, la regla final edit * → allow prevalece sobre edit * → deny; coincide. Ejecución real pendiente. 8.2-3: la salida nativa no atribuye la regla ganadora al global. |
| C-4d | coherente por lectura | Para npm install, bash * → allow precede a bash * → deny; la última coincidencia da deny, como se espera. Ejecución real pendiente. 8.2-3: la salida nativa no atribuye la regla ganadora al agente declarado en el global. |
| C-4e | coherente por lectura | Últimas coincidencias: webfetch * → allow y edit * → ask para src/productos.js; ambas coinciden. La exportación registrada de OPENCODE_PERMISSION coincide con caso.env. Ejecución real pendiente. 8.2-3: la salida nativa no atribuye las reglas al proyecto y a la variable respectivos. |
| C-4f | no determinable | La exportación registrada conserva exactamente {"edit":"allow",}, como caso.env. La última coincidencia para editar src/productos.js da deny, coherente con la respuesta, pero no se capturó un aviso o log que acredite el descarte de la variable inválida. Ejecución real pendiente. 8.2-3: ningún comando capturado identifica además el archivo determinante. |

## Fase 2 · Ejecución de las decisiones de permiso · 13/10/2026

Doce casos de permiso ejecutados en el contenedor (`--network none`) con OpenCode 1.18.25 y un proveedor simulado local que emite la llamada fija de cada pregunta (`vm/simulado/`, `vm/permisos.sh`). Control de contaminación: las reglas de `debug agent` con y sin la declaración del proveedor coinciden en todos los casos. Evidencia: `verificacion/20261013-permisos/`.

| Caso | Esperada | Observada | Resultado |
|---|---|---|---|
| C-1b | ask | ask | coincide |
| C-1d | deny | deny | coincide |
| C-1f | deny | deny | coincide |
| C-3b | ask | ask | coincide |
| C-3d | deny | deny | coincide |
| C-3f | deny (herencia) | allow | **no coincide**: respuesta corregida (ver el caso) |
| C-4a | allow | allow | coincide |
| C-4b | deny | deny | coincide |
| C-4c | allow | allow | coincide |
| C-4d | deny | deny | coincide |
| C-4e | allow; ask | allow; ask | coincide |
| C-4f | deny | deny | coincide; registro: «OPENCODE_PERMISSION contains invalid JSON, skipping» |

Con la captura estática (doce casos de valor confirmados), los veinticuatro casos quedan verificados contra la herramienta. **Cierre de la hoja:** 13/10/2026, después de la aceptación de ADR-081 (C-3f).

**Ensayo del arnés (13/10/2026).** Tanda con proveedor simulado y respuestas inventadas: 72 ejecuciones, 36 correctas, 18 parciales y 18 incorrectas, según lo fijado en `vm/simulado/ensayo.json`; tokens registrados en las 72; medición válida. Prueba el circuito, no mide. Su evidencia queda fuera del repositorio (`.gitignore`) y se reproduce con `vm/contenedor.sh medir --ensayo`.

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

> **Precisión del 14/10/2026 (ADR-087, enmienda del eje E).** La hoja no se reabre. En las preguntas que piden solo «qué regla» (C-3b, C-3d, C-3f, C-4a a C-4d), la fuente es aceptable si identifica la regla determinante correcta; no se exige el archivo ni el carácter nativo, salvo que la fuente atribuya la regla a una ubicación rechazada. En las demás preguntas rige la hoja. Decidido después de conocer los datos y en contra de la hipótesis del proyecto; se informa la sensibilidad con el criterio anterior.

> **Precisión del 14/10/2026 (ADR-083).** La hoja no se reabre: valores, fuentes y criterios no cambian. En los casos de permiso, si `respuesta` no coincide en forma exacta, se extrae la decisión cuando el texto normalizado contiene exactamente una de `allow`, `ask`, `deny` o sus sinónimos; si no contiene ninguna o contiene dos o más distintas, va a revisión manual. En los casos compuestos (C-4e), la regla se aplica a cada parte separada por `;`. Cada fila registra `decision_extraida` y `regla_extraccion`. La regla se fijó después de detectar que 54 ejecuciones se marcaban incorrectas por la forma, y se aplicó por igual a las dos tandas antes de conocer el resultado de la recorrección.

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

### C-2c · Fusión · agente en markdown frente a JSON

- Pregunta: «¿Con qué modelo y con qué temperatura corre el agente `revisor`, y de dónde sale cada uno de los dos valores?»
- Respuesta: modelo `anthropic/claude-sonnet-4-5` **y** temperatura `0.2`
- Fuente aceptada: el modelo, de `.opencode/agent/revisor.md`; la temperatura, del `opencode.json` del proyecto. **Las dos asignaciones** son necesarias
- Fuente rechazada: `opencode.json` para el modelo; el markdown para la temperatura; «implícita» para la temperatura
- Distractor: el modelo `openai/gpt-5` del JSON
- Verificación: captura estática del 13/10/2026 (`verificacion/20261013-captura-estatica/C-2c.txt`): el markdown se **fusiona** con la declaración del JSON (las claves que declara prevalecen y las demás se conservan), y no la reemplaza. Corrige la lectura del laboratorio (C-12, «reemplazan, no fusionan»), que observó solo claves declaradas en ambos lados
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

### C-1e · Control · valor en `.opencode/opencode.json`

- Origen: agregado el 13/10/2026 (ADR-079)
- Pregunta: «¿Qué temperatura usa el agente `build` en este proyecto, y qué archivo la determina?»
- Respuesta: `0.4`
- Fuente aceptada: `~/proyecto/.opencode/opencode.json` (clave `agent.build.temperature`; «el JSON del `.opencode` del proyecto»)
- Fuente rechazada: la configuración global; `~/proyecto/opencode.json`; una temperatura nativa
- Distractor: `temperature` 0.8 del agente `plan`, en el global; no compite por `agent.build.temperature`
- Evidencia: `../opencode/como-funciona.md`, sección 3, entrada 5 y orden de carga `[CÓDIGO]`. El valor se declara en una única entrada, distinta de las de C-1a y C-1c
- Criterio 8.2-3: según la sección 16, `debug config` muestra el valor resuelto y `debug agent build` la vista del agente, sin identificar el archivo que declara esta clave

### C-1f · Control · permiso único en `config.json`

- Origen: agregado el 13/10/2026 (ADR-079)
- Pregunta: «Si el agente `build` intenta leer `src/productos.js`, ¿qué decisión de permiso corresponde, y qué regla y archivo la determinan?»
- Respuesta: `deny`
- Fuente aceptada: la regla `read: deny` de `~/.config/opencode/config.json` (regla y archivo)
- Fuente rechazada: el `opencode.json` del proyecto; una regla nativa; «el global» sin identificar `config.json`
- Distractor: `edit: allow` en el proyecto, que corresponde a otra herramienta
- Evidencia: `../opencode/como-funciona.md`, sección 3, entrada 2 (`config.json` se carga) `[CÓDIGO]`; secciones 7 y 8 (reglas del usuario después de las nativas y última coincidencia) `[CÓDIGO]`. Es la única regla declarada de `read`; el recurso consultado no es un archivo `.env`
- Criterio 8.2-3: sección 16; `debug config` no atribuye `permission.read` a un archivo y `debug agent build` no identifica la procedencia de la regla

### C-2e · Fusión · configuración en una variable frente al proyecto

- Origen: agregado el 13/10/2026 (ADR-079)
- Pregunta: «¿Con qué modelo corre el agente `build` en este proyecto, y de qué entrada sale ese valor?»
- Respuesta: `deepseek/deepseek-chat`
- Fuente aceptada: la variable de entorno `OPENCODE_CONFIG_CONTENT`, que declara `agent.build.model`
- Fuente rechazada: el `opencode.json` del proyecto; cualquier archivo como fuente determinante; `caso.env` (plantilla de activación, no entrada leída por OpenCode)
- Distractor: `openai/gpt-5`, declarado para el mismo agente en el proyecto
- Evidencia: `../opencode/como-funciona.md`, sección 3, entrada 7: `OPENCODE_CONFIG_CONTENT` le gana al proyecto `[EJECUCIÓN]`
- Criterio 8.2-3: sección 16; los comandos de introspección muestran el modelo resuelto sin atribuirlo a la variable

### C-2f · Fusión · archivo indicado por variable entre global y proyecto

- Origen: agregado el 13/10/2026 (ADR-079)
- Pregunta: «¿Con qué modelo y con qué temperatura corre el agente `build`, y de qué entrada y archivo sale cada valor?»
- Respuesta: modelo `mistral/codestral-latest` **y** temperatura `0.9`
- Fuente aceptada: modelo del archivo `~/.config/opencode/equipo.json`, indicado por `OPENCODE_CONFIG`; temperatura de `~/proyecto/opencode.json`. **Las dos asignaciones** son necesarias; «archivo indicado por `OPENCODE_CONFIG`» identifica el primero
- Fuente rechazada: `~/.config/opencode/opencode.json` para el modelo; `equipo.json` para la temperatura; «el global» para el modelo sin distinguir el archivo indicado por variable; una sola fuente para ambos valores
- Distractores: modelo `openai/gpt-5-mini` y temperatura 0.1 del global; temperatura 0.5 del archivo indicado por variable
- Formato: `respuesta` = `"mistral/codestral-latest; 0.9"`; `fuente` = `"modelo: equipo.json indicado por OPENCODE_CONFIG; temperatura: opencode.json del proyecto"`
- Evidencia: `../opencode/como-funciona.md`, sección 3, orden de las entradas 2 → 3 → 4 `[CÓDIGO]`, y entrada 3, que pierde contra el proyecto `[EJECUCIÓN]`
- Nota: el modelo comprueba que la entrada indicada por variable gana al global; la temperatura comprueba que pierde contra el proyecto. `equipo.json` no es ninguno de los tres nombres de carga global automática. La ruta exportada corresponde al usuario `participante` del entorno controlado; comprobarla antes de verificar si se usa otro usuario
- Criterio 8.2-3: sección 16; `debug config` muestra el objeto combinado sin la fuente de cada clave y `debug agent build` tampoco proporciona esas dos procedencias

### C-3e · Implícito · sustitución de variable no definida

- Origen: agregado el 13/10/2026 (ADR-079)
- Pregunta: «¿Cuál es el valor efectivo de `description` del agente `plan`, y de dónde sale ese valor?»
- Respuesta: `Revisa--equipo`
- Fuente aceptada: `~/proyecto/opencode.json`, clave `agent.plan.description`, **y** la variable no definida `RIGE_LB_ETIQUETA_AUSENTE`, cuya sustitución aporta una cadena vacía. Se requieren el archivo y la ausencia de la variable
- Fuente rechazada: el proyecto sin mencionar la variable no definida; la variable como si aportara un valor declarado; el global; la descripción nativa de `plan`
- Distractor: `Revisa-equipo`, descripción del agente `build` en el global, con un solo guion
- Evidencia: `../opencode/como-funciona.md`, sección 6, «Sustitución `{env:}` y `{file:}`» `[EJECUCIÓN]`; A.VI.3, resultado 13
- Nota: el escenario no exporta `RIGE_LB_ETIQUETA_AUSENTE`. Antes de la verificación se comprueba que tampoco esté definida en el entorno de inicio de sesión del participante; una variable definida, incluso vacía, no cumple la precondición. Los dos guiones forman parte del valor esperado
- Criterio 8.2-3: sección 16; `debug config` entrega la cadena sustituida, sin el archivo ni la variable ausente, y `debug agent plan` no añade esa procedencia

### C-3f · Implícito · el subagente no hereda la denegación del padre

- Origen: agregado el 13/10/2026 (ADR-079); **respuesta corregida el 13/10/2026 por la ejecución de la fase 2** (ver «Fase 2»)
- Pregunta: «Si el agente `build` lanza al subagente `general` para ejecutar `git status` en este proyecto, ¿qué decisión de permiso corresponde al subagente, y qué regla la determina?»
- Respuesta: `allow`
- Fuente aceptada: el conjunto de reglas propio de `general`, cuya regla nativa general (`*` → `allow`) es la última que coincide con `bash`; la denegación `bash: deny` de `agent.build.permission` en `~/.config/opencode/opencode.json` **no** se aplica al subagente. Se requiere identificar que decide el conjunto propio de `general` y no la regla del padre
- Fuente rechazada: la regla `bash: deny` de `build` como determinante o como heredada; una regla declarada de `general` (no existe); la regla `bash: allow` de `plan`
- Distractores: la denegación de `bash` del padre; `bash: allow` del agente `plan` en el proyecto
- Evidencia: ejecución del 13/10/2026 con OpenCode 1.18.25 y proveedor simulado local (`verificacion/20261013-permisos/C-3f/`): la cadena `build` → `task` → `general` se ejecuta, al subagente se le ofrece `bash` y `git status` corre. La variante con la denegación en forma de objeto (`{"*":"deny"}`) da el mismo resultado (`verificacion/20261013-c3f-variante-objeto/`). Al subagente sí se le quitan `task` y `todowrite`
- Nota: contradice A.VI.3, resultado 12, y `../opencode/como-funciona.md` §12, que afirman la herencia de las reglas `deny`. La evidencia de aquel resultado (E-16) no se conservó; la ejecución prevalece. Su consecuencia sobre RF-02 CA-3 se decide por ADR

### C-4e · Permisos combinados · variable entre raíz y agente

- Origen: agregado el 13/10/2026 (ADR-079)
- Pregunta: «Para el agente `build`, ¿qué decisiones de permiso corresponden a usar `webfetch` y a modificar `src/productos.js`, y qué regla y entrada determinan cada decisión?»
- Respuesta: `webfetch`: `allow`; edición: `ask`
- Fuente aceptada: para `webfetch`, `agent.build.permission.webfetch: allow` de `~/proyecto/opencode.json`; para la edición, `edit: ask` de la variable de entorno `OPENCODE_PERMISSION`. **Las dos asignaciones** son necesarias
- Fuente rechazada: el `permission` raíz del global para cualquiera de las dos decisiones; la variable para `webfetch`; el proyecto para la edición; una sola fuente para ambas
- Distractores: las dos reglas raíz `deny` del global; `webfetch: ask` de la variable, desplazada por la regla de agente
- Formato: `respuesta` = `"allow; ask"`; `fuente` = `"webfetch: agent.build.permission.webfetch del proyecto; edición: edit de OPENCODE_PERMISSION"`
- Evidencia: `../opencode/como-funciona.md`, sección 3, entrada 11 `[EJECUCIÓN]`, y sección 7, cadena de autoridad `[CÓDIGO]`: `permission` raíz < `OPENCODE_PERMISSION` < `agent.<n>.permission`
- Nota: `webfetch` comprueba que la variable pierde contra la regla del agente; la edición comprueba que gana a la raíz. Se pregunta por la decisión de la regla: `ask` sigue siendo `ask` aunque en una ejecución no interactiva se autorrechace (sección 11 `[EJECUCIÓN]`)
- Criterio 8.2-3: sección 16; `debug config` y `debug agent build` no atribuyen las dos reglas determinantes al archivo y a la variable respectivos

### C-4f · Permisos combinados · variable inválida descartada

- Origen: agregado el 13/10/2026 (ADR-079)
- Pregunta: «Si el agente `build` intenta modificar `src/productos.js`, ¿qué decisión de permiso corresponde, y qué regla y entrada la determinan?»
- Respuesta: `deny`
- Fuente aceptada: la regla `permission.edit: deny` de `~/proyecto/opencode.json`
- Fuente rechazada: `OPENCODE_PERMISSION`, cuyo JSON inválido se descarta; la configuración global; una regla nativa
- Distractores: la aparente intención `edit: allow` en `OPENCODE_PERMISSION`, con una coma final que invalida el JSON; `bash: ask` en el global (otra herramienta)
- Evidencia: `../opencode/como-funciona.md`, sección 17, «Mudo en consola, pero con rastro» `[EJECUCIÓN]`, y A.VI.3, resultado 14; la regla de archivo prevalece tras el descarte (secciones 7 y 8 `[CÓDIGO]`)
- Nota: el contenido exportado es exactamente `{"edit":"allow",}`. No se corrige la coma: es el defecto sembrado. Sin `--print-logs`, el aviso de descarte queda en el archivo de log; con ese flag puede aparecer en consola. No se usa JSON inválido en `OPENCODE_CONFIG_CONTENT`, que detendría la herramienta
- Criterio 8.2-3: sección 16; la configuración y el ruleset resueltos no identifican el archivo de la regla determinante. El aviso de descarte tampoco proporciona esa procedencia

## Clasificación documental (para el análisis)

| Caso | Documentada |
|---|---|
| C-1a | Sí |
| C-1b | Sí |
| C-1c | Sí |
| C-1d | Sí |
| C-2a | Parcialmente |
| C-2b | No |
| C-2c | [VERIFICAR contra `vm/docs/` y el manual embebido en la fase 2] |
| C-2d | [VERIFICAR contra `vm/docs/` y el manual embebido en la fase 2] |
| C-3a | Sí |
| C-3b | De forma incorrecta |
| C-3c | Sí |
| C-3d | [VERIFICAR contra `vm/docs/` y el manual embebido en la fase 2] |
| C-4a | Sí |
| C-4b | No |
| C-4c | [VERIFICAR contra `vm/docs/` y el manual embebido en la fase 2] |
| C-4d | [VERIFICAR contra `vm/docs/` y el manual embebido en la fase 2] |
| C-1e | [VERIFICAR la carga de `.opencode/opencode.json` contra `vm/docs/` y el manual embebido en la fase 2] |
| C-1f | [VERIFICAR el nombre global `config.json` contra `vm/docs/` y el manual embebido en la fase 2; la regla de lectura está documentada] |
| C-2e | Sí (`vm/docs/config.html`, «Precedence order»: configuración en línea después del proyecto) |
| C-2f | Sí (`vm/docs/config.html`, «Precedence order»: global → archivo indicado por variable → proyecto) |
| C-3e | Sí (`vm/docs/config.html`, «Env vars»: una variable no definida se sustituye por cadena vacía) |
| C-3f | [VERIFICAR la herencia de denegaciones del padre contra `vm/docs/` y el manual embebido en la fase 2] |
| C-4e | [VERIFICAR la posición intermedia de `OPENCODE_PERMISSION` contra `vm/docs/` y el manual embebido en la fase 2] |
| C-4f | [VERIFICAR el descarte de `OPENCODE_PERMISSION` inválida contra `vm/docs/` y el manual embebido en la fase 2] |

## Tipo de consulta (para el análisis y para el alcance de RIGE en noviembre)

| Caso | Tipo | Requisito de RIGE que la atiende |
|---|---|---|
| C-1a | Valor + fuente | RF-01, RF-06 · línea de comandos: RF-03 |
| C-1b | Decisión + regla | RF-02, RF-06, RF-09 · línea de comandos: RF-03 (ADR-051) |
| C-1c | Valor + fuente | RF-01, RF-06 · línea de comandos: RF-03 |
| C-1d | Decisión + regla | RF-02, RF-06, RF-09 · línea de comandos: RF-03 (ADR-051) |
| C-2a | Valor + fuente | RF-01, RF-06 · línea de comandos: RF-03 |
| C-2b | Valor + fuente | RF-01, RF-06 · línea de comandos: RF-03 |
| C-2c | Valor + fuente | RF-01, RF-06 · línea de comandos: RF-03 |
| C-2d | Valor + fuente | RF-01, RF-06 · línea de comandos: RF-03 |
| C-3a | Valor + fuente | RF-01, RF-06 · línea de comandos: RF-03 |
| C-3b | Decisión + regla | RF-02, RF-06, RF-09 · línea de comandos: RF-03 (ADR-051) |
| C-3c | Valor + fuente | RF-01, RF-06 · línea de comandos: RF-03 |
| C-3d | Decisión + regla | RF-02, RF-06, RF-09 · línea de comandos: RF-03 (ADR-051) |
| C-4a | Decisión + regla | RF-02, RF-06, RF-09 · línea de comandos: RF-03 (ADR-051) |
| C-4b | Decisión + regla | RF-02, RF-06, RF-09 · línea de comandos: RF-03 (ADR-051) |
| C-4c | Decisión + regla | RF-02, RF-06, RF-09 · línea de comandos: RF-03 (ADR-051) |
| C-4d | Decisión + regla | RF-02, RF-06, RF-09 · línea de comandos: RF-03 (ADR-051) |
| C-1e | Valor + fuente | RF-01, RF-04 (Must) |
| C-1f | Decisión + regla | RF-02, RF-04, RF-06 (Must) |
| C-2e | Valor + fuente | RF-01, RF-04 (Must) |
| C-2f | Valor + fuente | RF-01, RF-04 (Must) |
| C-3e | Valor + fuente | RF-01, RF-04, RF-07 (Must) |
| C-3f | Decisión + regla | RF-02 CA-3 y CA-6, RF-04, RF-06 (Must) |
| C-4e | Decisión + regla | RF-02 CA-6, RF-04 (Must) |
| C-4f | Decisión + regla | RF-02 CA-6, RF-04, RF-07 CA-1 y CA-3 (Must) |
