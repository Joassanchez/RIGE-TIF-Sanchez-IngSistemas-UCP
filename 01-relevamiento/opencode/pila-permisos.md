# Qué pila de permisos corre en OpenCode 1.18.25 y si `debug agent` sirve de oráculo

Raíz del código: `packages/` del tag `v1.18.25` de `anomalyco/opencode`, obtenido del tarball `codeload.github.com/anomalyco/opencode/tar.gz/refs/tags/v1.18.25` (SHA-256 `44e9530d7be172005c7d60aef317440eecb85d557d94cce7fa35c5a7b9d9da0b`, verificado el 25/10/2026). Las rutas son relativas a esa carpeta, salvo las que empiezan con `01-relevamiento/`. Análisis del ingeniero del 25/10/2026, en la iteración 2 (ficha T2-03). Etiquetas: [CÓDIGO], lectura del tag; [EJECUCIÓN], evidencia de corridas reales del repositorio; [SUPOSICIÓN], inferencia no comprobada.

## 0. Conclusión

**Las dos pilas corren en el mismo binario. Cuál decide depende de la ruta HTTP por la que entra el prompt, no de la versión.**

| Entrada | Ruta | Motor de sesión | Permisos | Agente |
|---|---|---|---|---|
| `opencode run` (por defecto, en proceso) | `POST /session/{id}/message` | `SessionPrompt` v1 | `Permission` v1 | `Agent` v1 (`opencode/src/agent/agent.ts`) |
| TUI y app de escritorio | `POST /session/{id}/prompt_async` | v1 | v1 | v1 |
| Cliente de la API nueva (`serve` + `/api/...`) | `POST /api/session/{id}/prompt` | `SessionV2` (`core`) | `PermissionV2` | `AgentV2` (`core/src/agent.ts`) |

No hay puente: ninguna herramienta v1 convierte `{permission, patterns}` en `PermissionV2.assert`. Son dos registros de herramientas distintos. La afirmación de `01-relevamiento/opencode/como-funciona.md` (apartado «Antes de empezar», líneas 26-28) de que «en la 1.18.25 el que decide es el v2» generaliza a toda la herramienta un resultado medido solo por la API `/api` (laboratorio E-17). Para `opencode run` y la TUI decide el v1, y eso está medido en ejecución (§1.4).

## 1. Qué servicio evalúa

### 1.1 `opencode run` → v1 [CÓDIGO]
- `opencode/src/cli/cmd/run.ts:950-962`: sin `--attach`, crea un cliente `sdk/v2` con `baseUrl: "http://opencode.internal"` cuyo `fetch` llama a `Server.Default().app.fetch` (servidor en proceso).
- `run.ts:864`: `client.session.prompt(...)`; en `sdk/js/src/v2/gen/sdk.gen.ts:3742` y `:3786` ese método es `POST /session/{sessionID}/message` (ruta de la instancia v1, no `/api`).
- `opencode/src/server/routes/instance/httpapi/handlers/session.ts:52`, `:295-316`: la ruta llama a `SessionPrompt.Service.prompt` (`opencode/src/session/prompt.ts`).
- Herramientas: `opencode/src/session/tools.ts:81-87`, el `ctx.ask` de cada herramienta llama a `Permission.Service.ask` (v1, importado de `@/permission`, `tools.ts:7`) con `ruleset: Permission.merge(input.agent.permission, input.session.permission ?? [])`. `input.agent` es `Agent.Info` v1 (`tools.ts:1`).
- `opencode/src/permission/index.ts:67-100`: evalúa patrón por patrón contra `ruleset` y `approved`, registra `logInfo("evaluated", {permission, pattern, action})` (`:74`) y publica `permission.asked` (v1, `schema/src/v1/permission.ts:61`).
- `run.ts:801-822`: el bucle de `run` escucha `permission.asked` (v1) y responde `reject` (o `once` con `--auto`). Nunca escucha `permission.v2.asked`.
- TUI: `tui/src/component/prompt/...` usa `promptAsync` = `POST /session/{id}/prompt_async` (`sdk.gen.ts:4095`, `:4139`), también v1. La app usa `legacy().session.promptAsync` (`app/src/utils/server-compat.ts:200-201`).

### 1.2 API `/api` → v2 [CÓDIGO]
- `opencode/src/server/routes/instance/httpapi/server.ts` monta a la vez las rutas de instancia v1 (`sessionHandlers`, `permissionHandlers` de `./handlers`) y las de `@opencode-ai/server` (`handlers`, importado en la línea 102 del archivo, `Api` en la 74).
- `server/src/handlers/session.ts:140-147`: `session.prompt` usa `SessionV2.Service`.
- `server/src/handlers/permission.ts:2-91`: solicitudes, respuestas y `permission/saved` van a `PermissionV2`.
- Herramientas v2 (`core/src/tool/*.ts`) llaman a `PermissionV2.Service.assert` (p. ej. `core/src/tool/bash.ts:104`, `:143-149`).
- `core/src/permission.ts:137-145`: `configured()` toma `agents.resolve(agentID ?? session.agent)` de `AgentV2` y usa `agent.permissions`; sin agente, `[{*,*,deny}]` (`:15`). **No hay ruleset de sesión** en v2: solo agente más aprobaciones guardadas (`:131-135`, `:155-162`).

### 1.3 Puente [CÓDIGO]
No existe. `opencode/src/permission/index.ts` solo usa `EventV2Bridge` para publicar eventos (`:8`, `:40`), con el esquema v1. En `opencode/src` no hay uso de `PermissionV2` ni de `AgentV2`. Los conjuntos de herramientas son distintos: v1 `opencode/src/tool/registry.ts:217-250` (incluye `task`); v2 `core/src/tool/` (`apply-patch, bash, edit, glob, grep, question, read, skill, todowrite, webfetch, websearch, write`; sin `task`).

### 1.4 Testigos de ejecución que separan las pilas
- [EJECUCIÓN] Las corridas de `opencode run` en el contenedor (MED-4a, `01-relevamiento/linea-base/verificacion/20261013-permisos/C-4a/bash/run.comando.txt`: `opencode --print-logs run --format json --agent build ...`) dejan en `logs-opencode/opencode.log` y en `run.stderr.txt` líneas `message=evaluated permission=bash pattern="git status" action.permission=* action.action=allow action.pattern=*`. Es el `logInfo` de `opencode/src/permission/index.ts:74`, con la forma v1. En `01-relevamiento/` hay 260 líneas así (bash, read, edit, task, webfetch, skill, grep).
- [EJECUCIÓN] Lista de herramientas, `01-relevamiento/opencode/laboratorio-verificacion.md:272-277` (C-10): `run` ofrece `bash, edit, glob, grep, read, skill, task, todowrite, webfetch, write` (registro v1); la sesión creada por la API ofrece exactamente las 12 de `core/src/tool/` (registro v2). Coincide con el código.
- [EJECUCIÓN] E-17 (`laboratorio-verificacion.md:396-432`) se hizo por `/api/session/...` (`:350`, `:596`): por eso aparecen `permission.v2.asked`, `resources` con el comando literal y `psv_` persistidos. Es v2 porque la vía era v2.
- [CÓDIGO] El binario contiene ambas pilas; `captura-binario-20261014.txt:4-5` (`permission:"read",patterns:[relative(worktree,h)]`) es el `read.ts` v1 y prueba que está presente, no que sea la única.

## 2. De dónde sale el ruleset y en qué orden

### 2.1 v1 (lo que evalúa `run` y la TUI) [CÓDIGO]
`opencode/src/agent/agent.ts`:
1. `defaults` (`:119-136`): `* allow`, `doom_loop ask`, `external_directory {* ask, Truncate.GLOB, tmp/*, skills/*, references/* allow}`, `question/plan_enter/plan_exit deny`, `read {* allow, *.env ask, *.env.* ask, *.env.example allow}`.
2. Extras nativos del agente (`build :141`, `plan :156`, `general :182`, `explore :196`).
3. `user = fromConfig(cfg.permission ?? {})` (`:138`), con la config ya fusionada por `mergeDeep` (global, proyecto, `.opencode`, `OPENCODE_CONFIG`, `OPENCODE_PERMISSION` en `opencode/src/config/config.ts:559-565`, `tools` legacy en `:567-578`).
4. `agent.<n>.permission` vía `fromConfig` (`:267-294`, al final; agente nuevo = `merge(defaults, user)` antes).
5. `external_directory Truncate.GLOB allow` al final salvo `deny` explícito (`:296-310`).
`fromConfig` en `opencode/src/permission/index.ts:186-198`.

**Al evaluar** se agregan, detrás del agente (`tools.ts:86`): `session.permission`. En `run` no interactivo (sin `--interactive`, `run.ts:273`, `:430-448`, `:519-521`, `:554-564`) son `question * deny`, `plan_enter * deny`, `plan_exit * deny`. Después, `approved` en memoria de la instancia (`index.ts:73`, se llena solo con `always`, `:144-150`; `run` nunca responde `always`). En subagentes, la sesión hija lleva el `childPermission` de `opencode/src/tool/task.ts:139-172` y `subagent-permissions.ts:14-27`; `prompt.ts:341-346` usa el mismo `merge`. `doom_loop` se evalúa solo con `agent.permission` (`opencode/src/session/processor.ts:372-379`).

### 2.2 v2 (solo la vía `/api`) [CÓDIGO]
- Nativos: `core/src/plugin/agent.ts:108-118` (`defaults`), `build :121-131`, `plan :133-150`, `general :152-157`, `explore :159-178`. Se registran antes que la config (`core/src/plugin/internal.ts:111` y `:115`).
- Config: `core/src/config.ts:147-161` lee cada `opencode.json(c)` por separado y, si tiene claves v1, la migra (`core/src/v1/config/migrate.ts:30-33`, `:74-95`, `:106-124`). Fuentes (`config.ts:163-201`): directorio global de config, `opencode.json(c)` desde el directorio hasta la raíz del proyecto, `.opencode/`. **No lee** `OPENCODE_CONFIG`, `OPENCODE_CONFIG_CONTENT` ni `OPENCODE_PERMISSION` (en `core/src` solo aparece la definición, `core/src/flag/flag.ts:69`). Un archivo con error de parseo se descarta en silencio (`:151-153`).
- Apilado (`core/src/config/plugin/agent.ts:70-111`): a cada agente se le agregan **todas** las `permissions` raíz de todos los documentos, concatenadas sin `mergeDeep`; después, documento por documento, las de `agents.<id>`. Un agente nuevo parte de `Info.empty` con `permissions: []` (`schema/src/agent.ts:35-36`, `core/src/agent.ts:56-58`): **sin defaults nativos**.
- Orden v2: nativas generales → nativas del agente → raíz de cada documento (concatenadas) → `agents.<id>` de cada documento.

## 3. ¿`debug agent` es el ruleset que evalúa la sesión?

`opencode/src/cli/cmd/debug/agent.handler.ts:33` y `:60-64`: imprime `Agent.Service.get(name)` v1 tal cual.

### 3.1 Frente a `run`, TUI y app (v1): sí, con tres ajustes [CÓDIGO]
Es el mismo objeto (`agent.permission`), regla por regla y en el mismo orden. Para reproducir la decisión de la sesión:
1. Agregar al final la `session.permission`: en `run` no interactivo, `question/plan_enter/plan_exit * deny` (`run.ts:430-448`); en la TUI, vacía salvo lo que fije el cliente [SUPOSICIÓN: no leí el `session.create` de la TUI].
2. Subagentes: agregar el `childPermission` (`task.ts:139-172`), que no muestra `debug agent`.
3. Aprobaciones `always` en memoria de la instancia (`index.ts:144-150`), con patrones recortados por aridad en bash (`shell.ts:407-410`). En `run` no se producen.

### 3.2 Frente a la vía `/api` (v2): no; diferencias de reglas nativas [CÓDIGO]
| Agente | Solo en v1 (`debug agent`) | Solo en v2 |
|---|---|---|
| todos | `doom_loop * ask` (`agent.ts:121`); `external_directory <skill>/*` y `<reference>/*` allow (`:108-113`); `external_directory Truncate.GLOB allow` repetida al final (`:296-310`) | — |
| `plan` | `task general deny` (`agent.ts:165-166`) | — |
| `explore` | `list allow`, `bash allow` (`agent.ts:204-205`) | — |
| agente nuevo de config | `defaults` completos delante (`agent.ts:277`) | nada nativo: arranca vacío |
Además: `Truncate.GLOB` (v1, `opencode/src/tool/truncate.ts:17`) y `TRUNCATION_GLOB` (v2, `core/src/plugin/agent.ts:11`, `data/tool-output/*`) [SUPOSICIÓN: misma ruta; no comparé `TRUNCATION_DIR`]. La config del usuario también difiere: v1 funde capas con `mergeDeep` (una clave repetida conserva su posición y toma el último valor); v2 concatena reglas de cada archivo (las dos sobreviven, gana la última por `findLast`). v2 ignora `OPENCODE_CONFIG*` y `OPENCODE_PERMISSION`, y solo expande `~`/`$HOME` en `external_directory/read/edit` (`config/plugin/agent.ts:119-138`).

## 4. Bash: un recurso por subcomando o comando entero

- v1 (`run`, TUI): **un patrón por subcomando** parseado con tree-sitter (`opencode/src/tool/shell.ts:378-414`, `ask :263-291`); el primer `deny` corta la llamada entera (`permission/index.ts:75-79`). [CÓDIGO]
- v2 (`/api`): **comando entero como un solo recurso** (`core/src/tool/bash.ts:143-149`; TODO de parseo en `:66-68`). [CÓDIGO]
- Conciliación con `como-funciona.md` §9 (`ls && rm -rf` con `{"*":"allow","rm *":"deny"}` denegado entero, [EJECUCIÓN]): **solo es compatible con v1**. En v2 el recurso `ls && rm -rf x` no coincide con `rm *`: `Wildcard.match` ancla con `^...$` (`core/src/util/wildcard.ts:3-14`), y gana `* allow`, así que se habría permitido. La misma sección muestra otra marca del v1: `cat`, `rm`, `cp`, `mv`, `Get-Content`, `Remove-Item`, `Copy-Item`, `Set-Content` y `New-Item` bloqueados fuera del proyecto, y los alias permitidos. Es la lista `FILES` del v1 (`shell.ts:28-49`). En v2 el aviso de rutas externas es solo informativo (`bash.ts:79-95`, `:139-142`) y no bloquea nada. Conclusión: los resultados de §9 se midieron por la vía v1 (`run`) y los de §10 (aprobación literal, `psv_`), por la vía v2 (`/api`). §9 dice «un recurso por sub-comando» y es correcto para `run`; la cabecera, que atribuye todo al v2, no lo es. [CÓDIGO + EJECUCIÓN]
- La aridad (`opencode/src/permission/arity.ts`) **sí** rige en v1 para `always` (`shell.ts:407-410`); `como-funciona.md` §9-§10 la descarta para la 1.18.25 a partir de la evidencia v2.

## 5. Decisiones del binario sin modelo real

- **`vm/verificar.sh` y `vm/permisos.sh` ya no existen**: se borraron en el commit `9244a53`. Se recuperan con `git show 9244a53^:01-relevamiento/linea-base/vm/permisos.sh` (y `verificar.sh`). `verificar.sh` solo capturaba `debug config` y `debug agent`. `permisos.sh` (MED-4a) era el que ejecutaba decisiones: levantaba el proveedor simulado, escribía una config con `provider.simulado` (`@ai-sdk/openai-compatible`, `baseURL http://127.0.0.1:<puerto>/v1`, modelo `simulado/permisos`; ejemplo en `01-relevamiento/linea-base/verificacion/20261013-permisos/C-4a/bash/proveedor-config.json`), la pasaba por `OPENCODE_CONFIG` y corría `opencode --print-logs run --format json --agent <a> --model simulado/permisos '<prompt>'`. Su evidencia está en `verificacion/20261013-permisos/` y `20261013-c3f-variante-objeto/`. [EJECUCIÓN]
- Vigente: `01-relevamiento/linea-base/vm/simulado/proveedor.py` (solo biblioteca estándar, OpenAI `chat/completions` con y sin streaming, escucha en `127.0.0.1`). Devuelve en orden las llamadas fijas de `plan["acciones"][id=accion]["llamadas"]` y registra lo que se ofrece (`toolsOffered`) y los resultados. **Perdió su `main()`** en `9244a53`; la versión anterior (`git show 9244a53^:.../simulado/proveedor.py`) acepta `--plan --accion --registro --listo` y escribe el puerto en `--listo`. Hoy lo importan `ensayo.py` y `ecologica.py`.
- **Contenedor**: `permisos.sh` exige root, `runuser`, `timeout`, `/opt/linea-base` y `--network none` (`git show 9244a53^:...permisos.sh`, líneas 1-35). Solo corre en la imagen de `vm/` (`vm/LEEME.md`, `vm/contenedor.sh`).
- **Windows**: viable sin el contenedor [SUPOSICIÓN fundada en la evidencia]. Hay `opencode` 1.18.25 en `%APPDATA%\npm` y Python 3.11 en el anfitrión (comprobado hoy con `--version`). El laboratorio original corrió en Windows con `opencode.exe` 1.18.25 y un proveedor simulado en Node (`laboratorio-verificacion.md:11-19`; `oc-lab/` no está en el repositorio). Procedimiento mínimo:
  1. `HOME`, `USERPROFILE` y `XDG_*` apuntando a un directorio de prueba vacío. `state` no se aísla (`como-funciona.md:93`); verificar con `opencode debug paths`.
  2. Lanzar `proveedor.py` con el `main()` recuperado, o un envoltorio de 10 líneas con `ThreadingHTTPServer(("127.0.0.1",0), manejador(Proveedor(plan, accion, registro)))`, y un `plan.json` con la herramienta y los argumentos a probar.
  3. Config auxiliar fuera del proyecto con solo `provider` y `model`, por `OPENCODE_CONFIG`; antes, comparar `debug agent` con la variable y sin ella (control de contaminación de MED-4a).
  4. `opencode --print-logs run --format json --agent <a> --model simulado/permisos "..."`. La decisión se lee en las líneas `message=evaluated permission=<p> pattern=<x> action.*` de stderr o de `log/opencode.log`: regla ganadora exacta por patrón. `deny` aparece además como error de la herramienta, y `ask` como `permission requested: ...; auto-rejecting`.
  Salvedades de Windows: bash ejecuta PowerShell (parser `tree-sitter-powershell`, `shell.ts:257-260`), `Wildcard.match` es insensible a mayúsculas en `win32` (`wildcard.ts:13`) y los recursos de archivo usan `\` (el `match` los normaliza). Las decisiones obtenidas en Windows no son intercambiables con las de Linux para patrones con mayúsculas o bash.
- Alternativa sin herramientas: la vía `/api` (v2) se ejerce con `opencode serve` + `POST /api/session` + `POST /api/session/{id}/prompt` y el mismo proveedor; la decisión se lee en los eventos `permission.v2.asked` o en su ausencia, como en E-17.

## No verificado
- `session.permission` que crea la TUI al abrir una sesión (no leído).
- Igualdad de `Truncate.GLOB` y `TRUNCATION_GLOB`.
- Que el log `evaluated` salga también sin `--print-logs` en el archivo `log/opencode.log` en Windows (en Linux sí: `logs-opencode/opencode.log`).
