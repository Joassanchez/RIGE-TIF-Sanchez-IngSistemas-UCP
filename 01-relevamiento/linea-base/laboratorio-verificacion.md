# Verificación empírica de OpenCode 1.18.25 — configuración efectiva y permisos

> Todos los resultados de este informe provienen de ejecuciones reales registradas en
> `./oc-lab/evidencia/<ID>.txt`. Las salidas están transcriptas literalmente.
> Donde algo no pudo comprobarse, dice "no verificable" y se explica por qué.

---

## 1. Entorno

| Ítem | Valor |
| --- | --- |
| Versión instalada | `1.18.25` (verificado con `opencode --version`) |
| Instalación | `npm install opencode-ai@1.18.25` en `./oc-lab/` — binario `node_modules/opencode-ai/bin/opencode.exe` |
| Sistema operativo | Windows 11, `Windows_NT 10.0.26200.0` x64 |
| Shell del harness | PowerShell 5.1.26100.9444 |
| Shell que usa la herramienta `bash` | **PowerShell** (no bash, no cmd) — ver hallazgo C-1 |
| Modelo principal | Proveedor **mock local** determinista (`./oc-lab/mock/mock-provider.js`), OpenAI-compatible, en `127.0.0.1` |
| Modelo secundario (real) | `opencode/big-pickle` y `opencode/mimo-v2.5-free` (free tier, sin credenciales) |
| Fecha | 2026-09-19 |

### Por qué un proveedor mock

El free tier real resultó **no determinista**. En `evidencia/E00e-freetier-probe.txt`, la
quinta invocación consecutiva de `opencode run ... 'Say OK'` devolvió texto sobre un
proyecto Android ajeno (`activity_wireless_adb.xml`, `RetailerProvisioner`) que nunca se
mencionó en la sesión. No pude determinar la causa raíz. Como los experimentos de permisos
necesitan que el modelo pida **exactamente** la herramienta bajo prueba, construí un
proveedor mock que devuelve tool calls fijas. Los resultados de permisos se validaron
contra el modelo real en E-00d y coinciden.

### Aislamiento

Cada sesión hija corrió con `HOME`, `USERPROFILE`, `XDG_CONFIG_HOME`, `XDG_DATA_HOME` y
`XDG_CACHE_HOME` apuntando a `./oc-lab/home/`. **La configuración real del usuario nunca fue
leída ni modificada.** Ver `evidencia/E00b-debug-surface.txt` (`opencode debug paths`).

> **Salvedad de aislamiento (hallazgo):** `debug paths` muestra que `state` **no** se deriva
> de `HOME` en Windows: apunta a `C:\Users\Joa\AppData\Roaming\ai.opencode.desktop\opencode`,
> que existe en el perfil real. `home`, `data`, `config`, `cache` y `log` sí quedaron
> correctamente redirigidos.

---

## 2. Comportamiento de `ask` en modo no interactivo (E-00)

**Resultado: `ask` se auto-rechaza.** No bloquea, no deniega con el mensaje de reglas, y no
se aprueba solo.

Caso mínimo (`evidencia/E00d-ask-noninteractive.txt`), config
`{"permission":{"bash":{"*":"ask"}}}`, pedido `echo ASKPROBE > sentinel.txt`:

```
STDERR:  ! permission requested: bash (echo ASKPROBE > sentinel.txt); auto-rejecting
tool state: {"status":"error","error":"The user rejected permission to use this specific tool call."}
filesystem: sentinel.txt ABSENT
```

| Config | Resultado real |
| --- | --- |
| sin reglas (default) | ejecuta |
| `bash *: ask` | **auto-rechaza** (status `error`) |
| `bash *: ask` + `--auto` | **ejecuta** |
| `bash *: deny` | herramienta **no ofrecida** al modelo |

### Cómo condiciona la lectura del resto

1. En `opencode run`, **`ask` es indistinguible de `deny` por el resultado**: ambos impiden
   la ejecución. Se distinguen por dos señales:
   - el texto del error — `ask` auto-rechazado: `"The user rejected permission to use this
     specific tool call."`; `deny` de configuración: `"The user has specified a rule which
     prevents you from using this specific tool call. Here are some of the relevant rules [...]"`;
   - la lista de herramientas ofrecidas al modelo (`toolsOffered` en el log del mock), que
     expone si la herramienta llegó a existir para el modelo.
2. Por lo tanto, en modo no interactivo **`ask` no es un punto de control útil**: degrada a
   `deny` silencioso. Sólo tiene sentido con TUI o con `--auto`.
3. El mensaje de error de `ask` es **engañoso**: dice "the user rejected" cuando ningún
   usuario fue consultado (hallazgo C-2).

---

## 3. Tabla de resultados

| ID | Hipótesis | Resultado observado | Veredicto | Evidencia |
| --- | --- | --- | --- | --- |
| E-00 | — (reconocimiento) | `ask` en `run` se auto-rechaza; `--auto` lo aprueba; `deny` oculta la herramienta | **establecido** | `E00d-ask-noninteractive.txt`, `E00a-cli-surface.txt`, `E00b-debug-surface.txt`, `E00g-mock-validation.txt` |
| E-01 | Global `{*:ask, git *:allow}` + proyecto `{*:deny}` ⇒ `git status` ejecuta sin preguntar | `git status` **ejecutó** (`status=completed`). Config resuelta: `{"*":"deny","git *":"allow"}` | **confirmada** | `E01.txt` |
| E-02 | Mismas reglas con el global al revés ⇒ `git status` se deniega | `bash` **no ofrecido** al modelo (denegado). Config resuelta: `{"git *":"allow","*":"deny"}` | **confirmada** | `E02.txt` |
| E-03 | Global `edit: allow` desactiva el modo plan | El agente `plan` **editó** el archivo (`line one` → `line two`), pese a que su descripción es "Plan mode. Disallows all edit tools." | **confirmada** | `E03.txt` |
| E-04 | Sin reglas de `read`, `.env` se protege por regla nativa | `.env` → **rechazado**; `.env.example` → **permitido**; `.env.local` → **rechazado**; `notes.txt` → **permitido** | **confirmada** | `E04.txt` |
| E-05 | Con `bash *: allow`, `cat /etc/hosts` igual pregunta por `external_directory` | `cat "<fuera>"` → **rechazado**; `cat ./archivo` → permitido; `cat /etc/hosts` → rechazado; **`type "<fuera>"` → PERMITIDO** | **refutada (parcial)** | `E05.txt`, `E05b.txt`, `E05c.txt`, `E05d.txt` |
| E-06 | Con `bash *: deny` la herramienta no se ofrece; con `git *: allow` sí | `deny`: `toolsOffered` sin `bash`, la llamada cae en `invalid`. `deny + git *: allow`: `bash` presente y ejecuta | **confirmada** | `E06.txt` |
| E-07 | `ls && rm -rf ...` se deniega entero por el sub-comando `rm` | Denegado con `&&`, `;`, `|` y subshell. Canario intacto en los 4 casos | **confirmada** | `E07.txt` |
| E-08 | "Permitir siempre" guarda `git push *` (más de lo visto en pantalla) | Se guardó `{"action":"bash","resource":"git push origin main"}` — el comando **literal**, no un glob | **refutada** | `E08-E09.txt` |
| E-09 | La aprobación de sesión le gana al `deny` escrito | Con `bash *: deny` **no se genera ninguna solicitud** y `bash` no se ofrece: no hay nada que aprobar | **refutada** | `E08-E09.txt` |
| E-10 | V1 vs V2: alguna gana o se ignora en silencio | `permissions` (V2) es **error fatal de configuración**; el proceso no arranca. Avisa, no es silencioso | **establecido** | `E10.txt` |
| E-11 | `tools` heredado vs `permission` | Mismo nivel: gana `permission`. Distinto nivel: gana el más profundo (`agent.build`) | **establecido** | `E11.txt` |
| E-12 | Precedencia real de las variables de entorno | `OPENCODE_CONFIG_CONTENT` > proyecto; `OPENCODE_CONFIG_DIR` > proyecto; `OPENCODE_CONFIG` < proyecto; `OPENCODE_PERMISSION` **no existe**; `{env:NO_EXISTE}` → cadena vacía silenciosa | **establecido** | `E12.txt`, `E12R.txt`, `E12F.txt` |
| E-13 | Qué `AGENTS.md` se cargan y en qué orden | `~/.config/opencode/AGENTS.md` y `<proyecto>/AGENTS.md` entran al system prompt (global primero). `sub/AGENTS.md` y `.opencode/AGENTS.md` **no**; el de subdirectorio se inyecta al leer un archivo de ese subárbol | **establecido** | `E13.txt` |
| E-14 | Agente en `opencode.json` vs `.opencode/agent/<n>.md` | Gana el **markdown**, y reemplaza (no fusiona): `prompt` y `description` del JSON quedaron inertes | **establecido** | `E14.txt` |
| E-15 | Descubrimiento de skills, comandos y plugins | `.opencode/skill/<n>/SKILL.md` aparece en `debug skill`; `.opencode/command/<n>.md` y `.opencode/plugin/*.js` se descubren solos; el plugin cargó y su hook disparó, sin alterar el `deny` | **establecido** | `E15.txt` |
| E-16 | Qué hereda un subagente del padre | El subagente **heredó el `deny`** de `bash` (no se le ofreció) y además perdió `task` y `todowrite` | **establecido** | `E16.txt` |

---

## 4. Hipótesis refutadas

### R-1 · E-08 — "Permitir siempre" guarda **el comando literal**, no un glob

**Hipótesis:** queda aprobado `git push *`, es decir más de lo que se vio en pantalla.

**Refutación.** Aprobar `git push origin main` con `reply: "always"` produjo:

```json
{"data":[{"id":"psv_0bb25025c002pptHM5Tfhlur68","projectID":"global","action":"bash","resource":"git push origin main"}]}
```

El `resource` es la cadena exacta, no un patrón. Es **más acotado** que la hipótesis, no más
amplio. (No verifiqué si ese `resource` se compara de forma literal o por prefijo — ver §7.)

Además, la aprobación quedó registrada bajo `"projectID":"global"`. En directorios sin
repositorio git reconocido, todas las aprobaciones comparten el ámbito `global` (ver C-3).

### R-2 · E-09 — El `deny` escrito **no puede** ser vencido por una aprobación de sesión

**Hipótesis:** la aprobación de sesión le gana al `deny` escrito.

**Refutación.** Con `{"permission":{"bash":{"*":"deny"}}}`:

- la solicitud de permiso **nunca se genera** — `NO PENDING PERMISSION REQUEST (nothing to approve)`;
- `toolsOffered` del hijo: `[apply_patch, edit, glob, grep, question, read, skill, todowrite, webfetch, websearch, write]` — **sin `bash`**.

El `deny` se aplica en el momento de **exponer herramientas al modelo**, no en el de
ejecutarlas. El modelo no puede ni intentar la acción, así que no hay nada que aprobar. La
hipótesis describe un camino que la implementación no permite recorrer.

### R-3 · E-05 — `external_directory` sólo protege una lista fija de verbos

**Hipótesis:** con `bash *: allow`, `cat /etc/hosts` igual pregunta, por `external_directory`.

**Refutación parcial.** La protección existe, pero **sólo para algunos comandos**. Con
`{"permission":{"bash":{"*":"allow"}}}` y un archivo fuera del proyecto:

| Comando | Veredicto |
| --- | --- |
| `cat "<fuera>"` | **BLOQUEADO** |
| `cat ..\..\outside\plain.txt` | **BLOQUEADO** |
| `Get-Content "<fuera>"` | **BLOQUEADO** |
| `cp`, `mv`, `rm`, `Remove-Item`, `Copy-Item`, `Set-Content`, `New-Item` | **BLOQUEADO** |
| `type "<fuera>"` | **PERMITIDO** — leyó el archivo |
| `gc "<fuera>"` | **PERMITIDO** — leyó el archivo |
| `more`, `tail`, `sed`, `awk`, `grep`, `rg`, `Select-String` | **PERMITIDO** |
| `del "<fuera>"` | **PERMITIDO** — borró el archivo |
| `Out-File`, `echo hi > "<fuera>"` | **PERMITIDO** — creó archivos fuera del proyecto |
| `python -c "open(...)"`, `cmd /c type`, `./"<fuera>"` | **PERMITIDO** |

Verificación en disco: `plain.txt` desapareció (`del`) y `er.txt`/`of.txt` se crearon fuera
del proyecto (`evidencia/E05c.txt`).

La lista bloqueada parece comparar el **nombre literal** del comando: `gc` y `type` (alias de
`Get-Content` en PowerShell) y `del` (alias de `Remove-Item`) **no** están en la lista,
mientras sus nombres canónicos sí.

**Contraste importante:** las herramientas nativas **sí** respetan `external_directory`
correctamente. Con `read`, `write`, `edit`, `glob` y `grep` apuntando fuera del proyecto, los
cinco fueron **BLOQUEADOS** (`evidencia/E05d.txt`). El agujero es específico de `bash`.

---

## 5. Hallazgos nuevos

### C-1 · La herramienta `bash` ejecuta **PowerShell**, no bash ni cmd

`uname -s` devuelve el error de PowerShell: `uname : El término 'uname' no se reconoce como
nombre de un cmdlet, función, archivo de script o programa ejecutable.` Y `echo %COMSPEC%`
imprime literalmente `%COMSPEC%` (PowerShell no expande `%VAR%`). `cat`, `type`, `gc`, `ls`,
`echo` funcionan porque son **alias de PowerShell** (`Get-Content`, `Get-ChildItem`,
`Write-Output`). Ver `evidencia/E05b.txt`.

Consecuencias: (a) toda regla de `bash` escrita pensando en POSIX puede no aplicar; (b) los
alias abren el agujero de C-2/R-3; (c) `bash *: deny` no bloquea PowerShell igual que bash.

### C-2 · El mensaje de error de `ask` es engañoso

En modo no interactivo, `ask` produce `"The user rejected permission to use this specific
tool call."` — pero **ningún usuario fue consultado**. No hay forma de distinguir "un humano
dijo que no" de "no había nadie para preguntar". En cambio, el `deny` de configuración sí es
explícito e incluso enumera las reglas aplicables.

### C-3 · El ámbito de proyecto colapsa a `global` sin git

Sesiones creadas en directorios de proyecto distintos (con `git init`) reportaron
`"projectID":"global"` (`evidencia/E00f-debug-agent-oracle.txt`, `E08b-api-bodies.txt`).
Como las aprobaciones "siempre" se guardan con `projectID`, un permiso concedido en un
directorio sin proyecto git **aplica a todos los directorios sin proyecto git de la máquina**.

### C-4 · V2 (`permissions`) es error fatal, no una clave ignorada

```
Error: Configuration is invalid at <ruta>\opencode.json
⚠ V2 permissions are not supported by OpenCode V1. Use V1 "permission" rules or run opencode2. permissions
```

Salida 1, el proceso no arranca. Ocurre igual con `permissions` sola, junto a `permission` en
el mismo archivo, y repartidas entre global y proyecto. **No es silencioso.**

### C-5 · Precedencia real de variables de entorno

Medido enfrentando cada variable contra el `opencode.json` del proyecto:

| Variable | Resultado | Lectura |
| --- | --- | --- |
| `OPENCODE_CONFIG_CONTENT` | **gana** al proyecto | es el merge final |
| `OPENCODE_CONFIG_DIR` | **gana** al proyecto | |
| `OPENCODE_CONFIG` | **pierde** ante el proyecto | es un config *adicional*, se fusiona antes |
| `OPENCODE_PERMISSION` | **sin efecto** | no está en la lista documentada de escape hatches; parece no existir |
| `OPENCODE_DISABLE_PROJECT_CONFIG=1` | el proyecto se saltea | ver §7 (el error observado es artefacto del harness) |

`{env:VAR}` inexistente **no avisa**: `"username": "A-{env:NO_EXISTE_XYZ}-B"` se resolvió a
`"A--B"` en stdout y stderr, sin advertencia alguna (`evidencia/E12F.txt`).

### C-6 · `AGENTS.md` de subdirectorio se inyecta dentro del resultado de la herramienta

`<proyecto>/sub/AGENTS.md` **no** aparece en el system prompt, pero al leer un archivo de ese
subárbol el resultado de `read` incluyó:

```
<system-reminder>
Instructions from: C:\...\E13-agents\sub\AGENTS.md
MARKER-SUBDIR-AGENTS-MD
</system-reminder>
```

Es decir: carga **perezosa, atada al árbol leído**, no al contexto inicial.

### C-7 · La versión instalada trae su propia documentación embebida

`opencode debug skill` expone una skill interna `customize-opencode` cuyo cuerpo es
prácticamente el manual de configuración de esta versión. Allí se confirma explícitamente el
mecanismo de E-01/E-02:

> "Within an object, **insertion order matters**. opencode evaluates the LAST matching rule,
> so put broad rules first and narrow rules last."

y el modelo de fusión:

> "Configs from each scope are deep-merged. Project overrides global. Unknown top-level keys
> in `opencode.json` are rejected with `ConfigInvalidError`."

Esta skill es una fuente de verdad **consultable offline** con la versión exacta.

### C-8 · El mecanismo detrás de E-01/E-02: el orden de claves sobrevive al merge

`opencode debug config` mostró la clave ganadora con el **valor** del proyecto pero en la
**posición** del global:

- global `{"*":"ask","git *":"allow"}` + proyecto `{"*":"deny"}` → resuelto `{"*":"deny","git *":"allow"}` → gana `git *` → **allow**
- global `{"git *":"allow","*":"ask"}` + proyecto `{"*":"deny"}` → resuelto `{"git *":"allow","*":"deny"}` → gana `*` → **deny**

Sobrescribir el valor de una clave existente **no mueve su posición** en el objeto JS. Por eso
el orden en que se escriben las claves en el archivo **cambia el resultado final**.

### C-9 · El free tier real no es reproducible

Ver §1. Respuesta ajena en la quinta invocación idéntica. También apareció un 403
`"OpenCode's free tier can only be used from within OpenCode"` ejecutando **desde** opencode
(`evidencia/E00d-ask-noninteractive.txt`, caso `deny`), mensaje contradictorio con la
situación. No pude determinar la causa.

### C-10 · `opencode run` y una sesión creada por la API ofrecen herramientas distintas

Mismo proyecto y mismo agente:

| Modo | Herramientas ofrecidas |
| --- | --- |
| `opencode run` | `bash, edit, glob, grep, read, skill, task, todowrite, webfetch, write` |
| sesión vía API (`serve`) | `apply_patch, bash, edit, glob, grep, question, read, skill, todowrite, webfetch, websearch, write` |

El modo servidor agrega `apply_patch`, `question` y `websearch`, y quita `task`.

### C-11 · Los subagentes heredan permisos pero pierden herramientas

Padre con `bash *: deny` → el subagente `general` **también** tiene `bash` oculto (hereda el
`deny`), pero además su lista es más corta: pierde `task` y `todowrite`
(`evidencia/E16.txt`).

### C-12 · Los archivos de agente markdown reemplazan, no fusionan

`opencode.json → agent.myagent` y `.opencode/agent/myagent.md` declarados a la vez:
`debug agent myagent` devolvió `"prompt": "PROMPT-FROM-MARKDOWN"` y
`"description": "DESCRIPTION-FROM-MARKDOWN"`. El `prompt` y la `description` del JSON
quedaron completamente inertes.

---

## 6. Implicancias para escribir reglas de OpenCode

1. **El orden de las claves dentro del objeto es parte de la semántica.** Escribir
   `{"*":"ask","git *":"allow"}` no es equivalente a `{"git *":"allow","*":"ask"}`. Regla
   práctica: **primero lo amplio, último lo específico**, y no confiar en el orden de un
   merge entre global y proyecto — el proyecto puede ganar el *valor* de una clave sin ganar
   su *posición*.

2. **`ask` no sirve como control en automatización.** En `opencode run` equivale a `deny`
   silencioso. Para CI o scripts, usar `deny` explícito (mensaje claro y reglas citadas) o
   `--auto` conscientemente.

3. **No apoyar la seguridad en `bash` para rutas fuera del proyecto.** En Windows el chequeo
   de `external_directory` es evadible con alias triviales (`type`, `gc`, `del`) y con
   cualquier intérprete (`python`, `node`, `cmd /c`). Si hace falta confinar el sistema de
   archivos, usar las herramientas nativas (`read`/`write`/`edit`/`glob`/`grep`), que **sí**
   respetan la frontera, y **quitar `bash`** o reducirlo a patrones muy acotados.

4. **`deny` es la única garantía fuerte.** Un `deny` elimina la herramienta del conjunto que
   ve el modelo (no sólo bloquea la llamada) y ninguna aprobación de sesión lo revierte. Un
   `allow` global, en cambio, puede anular reglas nativas — incluidas las de `.env` y las del
   modo plan.

5. **Cuidado con los `allow` globales.** Un `{"permission":{"edit":"allow"}}` global desactiva
   el modo plan, y un `{"permission":{"bash":{"*":"allow"}}}` abre el agujero de rutas
   externas. Los `allow` globales son reglas que se agregan **al final** y por lo tanto ganan.

6. **Validar la configuración antes de confiar en ella.** `opencode debug config` muestra la
   fusión real y `opencode debug agent <n>` el ruleset compilado en orden de evaluación. Son
   la forma más barata de detectar una regla que quedó en una posición inesperada.

7. **No usar `{env:VAR}` sin valor por defecto para nada crítico.** La sustitución fallida es
   silenciosa y produce cadena vacía. Un `deny` construido como `{env:...}` puede degradarse
   sin aviso.

8. **En Windows, escribir reglas de `bash` pensando en PowerShell.** Los comandos que el
   modelo escriba naturalmente (`cat`, `ls`, `rm`) son alias; conviene declarar reglas sobre
   los nombres canónicos y sobre los alias por separado, porque el motor compara nombres
   literales.

9. **Saber que las aprobaciones "siempre" son más angostas de lo que parecen** (comando
   literal) pero están **peor acotadas de lo que parece** (ámbito `global` si el directorio no
   es un proyecto git reconocido).

---

## 7. No verificable

| Ítem | Por qué | Qué haría falta |
| --- | --- | --- |
| **E-08 en la TUI real** | Verifiqué el flujo "permitir siempre" por la API HTTP del servidor (`POST /api/session/{id}/permission/{rid}/reply` con `{"reply":"always"}`), no por la interfaz interactiva. El comportamiento persistido es el mismo objeto que la TUI usa, pero la TUI podría ofrecer variantes adicionales. | Una TUI real con un humano (o un PTY) aceptando "permitir siempre". |
| **¿`resource` se compara literal o por prefijo?** | Sólo comprobé que se guarda el comando exacto y que una segunda llamada idéntica no vuelve a preguntar. No probé una variante (`git push origin main --force`) para ver si re-pregunta. | Repetir la llamada con el comando mutado en la misma sesión. |
| **Plugins que alteran permisos** | El plugin cargó y su hook `tool.execute.before` disparó, pero **no** ejercité el hook `config(cfg)` ni `permission.ask`. La skill interna `customize-opencode` documenta que `config` recibe "the live merged config; mutate fields here". | Un plugin que mute `cfg.permission` en el hook `config` y observar el ruleset compilado. |
| **`OPENCODE_DISABLE_PROJECT_CONFIG`** | El run terminó en `UnknownError`. La causa es un artefacto de mi harness: el bloque `provider` del mock vivía **dentro** del config de proyecto, así que al desactivarlo desapareció el proveedor. Prueba indirecta de que el proyecto efectivamente se saltea, pero no una verificación limpia. | Repetir con el proveedor declarado en el config global. |
| **Caracterización completa de `external_directory`** | Mapeé 24 verbos; no es exhaustivo. El criterio exacto (¿lista fija? ¿parseo de argumentos?) no quedó determinado. | Probar el resto de verbos y alias, y comandos con múltiples rutas. |
| **Causa del contenido ajeno del free tier** | Observado una vez, no reproducido de forma controlada. | Repetir N invocaciones idénticas y medir la tasa; o inspeccionar el tráfico hacia `opencode.ai/zen/v1`. |
| **Fuga del directorio `state`** | Confirmé que `debug paths` apunta a `C:\Users\Joa\AppData\Roaming\ai.opencode.desktop\opencode` y que existe. No caractericé qué se escribe allí ni si contiene datos de sesión. | Inspeccionar el contenido de ese directorio (no lo hice: queda fuera del alcance de no tocar datos reales). |
| **`OPENCODE_CONFIG_CONTENT` como string inline** | Mi primer intento (B) falló por comillas rotas en el pasaje por shell — error del harness, no de opencode. Lo re-verifiqué leyendo el JSON desde archivo (`E12R.txt`) y ahí funcionó. Queda la duda de si hay diferencia entre pasar el JSON inline vs. desde archivo. | Repetir el pasaje inline con un mecanismo de quoting confiable. |

---

## Anexo · Artefactos del laboratorio

```
oc-lab/
  run-exp.ps1                     # runner de evidencia (stdout/stderr separados, exit code, UTF-8)
  mock/mock-provider.js           # proveedor OpenAI-compatible determinista
  exp/                            # un script por experimento
  evidencia/                      # salidas literales, un archivo por ID
  home/                           # HOME falso (config/data/cache redirigidos)
  projects/                       # proyectos desechables de cada caso
```

Nota metodológica: todos los veredictos "ejecutó / no ejecutó" se apoyan en **dos** fuentes
independientes — el estado de la herramienta que reporta opencode (`status`, `error`) y un
**archivo centinela en disco** verificado después de la corrida. Ningún veredicto depende de
lo que el modelo dijo haber hecho.

---

# §8 · Experimentos de cierre

Corrida sobre el mismo laboratorio, con el mismo `HOME` falso, la misma instalación fijada de
`opencode-ai@1.18.25` y el mismo proveedor mock. Evidencia nueva: `evidencia/E17.txt`,
`E17b.txt`, `E17c.txt`, `E17-events.sse.txt`, `E17b-events.sse.txt`, `E17c-events.sse.txt`,
`E18.txt`, `E18b2.txt`.

Motivo de la repetición: la lectura del código del tag indicaba que (a) el objeto de permiso
lleva `info.always` con patrones **recortados por aridad** que van a un ruleset `approved` en
memoria de sesión, y (b) `OPENCODE_PERMISSION` sí existe. Ambas cosas se midieron de nuevo.

## 8.1 · Tabla de resultados

| ID | Hipótesis | Resultado observado | Veredicto | Evidencia |
| --- | --- | --- | --- | --- |
| E-17 (precheck) | El `deny` angosto `*BRAVO*` no oculta la herramienta | `debug agent build` → `"bash": true`; reglas `{*: ask}` y luego `{*BRAVO*: deny}`. `toolsOffered` incluye `bash` | **confirmada** | `E17.txt` |
| E-17 paso 1 | `echo ALFA > alfa.txt` genera `ask` | Solicitud creada: `action=bash`, `resources=["echo ALFA > alfa.txt"]`, `save=["echo ALFA > alfa.txt"]`. `alfa.txt` creado | **confirmada** | `E17.txt` |
| **H-17a** | El paso 2 (`echo CHARLIE > charlie.txt`) **no** vuelve a pedir permiso, porque lo aprobado es un patrón recortado (`echo *`) | **Vuelve a pedir permiso.** `resources=["echo CHARLIE > charlie.txt"]`. Idem con `git config --local user.name CHARLIE` y con `git push origin other` | **refutada** | `E17.txt`, `E17b.txt`, `E17c.txt` |
| **H-17b** | El paso 3 (`echo BRAVO > bravo.txt`) **se ejecuta** pese al `deny` escrito | No se emite evento `permission.v2.asked`, la herramienta **no** corre y el centinela queda intacto | **refutada / inalcanzable** | `E17.txt`, `E17c.txt`, `E17d` en `E18.txt` |
| E-17b | ¿El ruleset de aprobación se consulta? | Comando **idéntico** repetido en la misma sesión → **no** re-pregunta | **establecido** | `E17b.txt` |
| E-17b | ¿Literal o por prefijo? | `echo ALFA > alfa2.txt` tras aprobar `echo ALFA > alfa.txt` → **re-pregunta**. La coincidencia es **literal** | **establecido** | `E17b.txt` |
| E-17c | ¿Se guarda `git push *` al aprobar `git push origin main`? | `git push origin other` → **re-pregunta**. No hay recorte por aridad observable | **refutada** | `E17c.txt` |
| E-17d | Texto del error con `deny` angosto | `The user has specified a rule which prevents you from using this specific tool call. Here are some of the relevant rules [...]` con `{bash, *BRAVO*, deny}` incluida | **establecido** | `E18.txt` |
| E-18a | `OPENCODE_PERMISSION` le gana al proyecto | `debug config` sin la variable: `bash.* = "deny"`; con la variable: `bash.* = "allow"`. `bash: true`, `status=completed` | **confirmada** | `E18.txt` |
| E-18b | JSON inválido degrada en silencio | Proceso arranca (exit 0), la variable se descarta, rige el `deny` del proyecto (`tool=invalid`). Warning `level=WARN ... "OPENCODE_PERMISSION contains invalid JSON, skipping"` | **confirmada (con matiz)** | `E18.txt`, `E18b2.txt` |
| E-18b2 | ¿Lo esconde el nivel de log o `--print-logs`? | Sin flags: **no** está en stderr, **sí** en `log/opencode.log`. Con `--print-logs` solo: **sí** está en stderr. El nivel no es la barrera | **establecido** | `E18b2.txt` |
| E-18c | Gana el agente, no la variable | Reglas de `bash` en orden: `{*: allow}` (variable) y luego `{*: deny}` (agente). `bash: false`, `tool=invalid` | **confirmada** | `E18.txt` |

## 8.2 · Resolución explícita de E-08 y E-09

### El objeto de permiso en 1.18.25 es **v2**, no v1

Lo primero que apareció, y que reordena la discusión: la solicitud de permiso que devuelve la
API **no tiene** los campos `patterns` ni `always`. Tiene otra forma:

```json
{
  "id": "per_0c21f9645001JwKuM1hmSrGoMo",
  "sessionID": "ses_f3de06cebffeBTT3rF1n58z94S",
  "action": "bash",
  "resources": ["echo ALFA > alfa.txt"],
  "save": ["echo ALFA > alfa.txt"],
  "source": { "type": "tool", "messageID": "msg_...", "callID": "call_mock_0" }
}
```

`has 'patterns' field = False` y `has 'always' field = False`, verificado explícitamente en
`E17c.txt`. El stream SSE emite eventos **`permission.v2.asked`** / **`permission.v2.replied`**,
nunca `permission.asked`. Y `resources` y `save` contienen **el comando literal** en las nueve
solicitudes capturadas (E-17, E-17b, E-17c).

Esto no refuta tu lectura del código: la ubica en otro camino. `info.always` con recorte por
aridad es la implementación **v1**; el flujo que efectivamente corre acá es el **v2**, cuyo
`save` es literal. Es una inferencia a partir del espacio de nombres de los eventos y de la
ausencia de los campos v1, no una lectura del fuente que yo no tengo.

### Registro persistido vs. ruleset de sesión: son dos mecanismos, y los dos son literales

Tenías razón en que son cosas distintas, y ahora están separadas con evidencia:

| Mecanismo | Cómo se observó | Alcance | Contenido |
| --- | --- | --- | --- |
| **Persistido** (`psv_...`) | `GET /api/permission/saved` | Sobrevive a la sesión. En un directorio sin proyecto git queda bajo `projectID: "global"` | Comando literal |
| **De sesión** (`approved`) | Comando idéntico repetido → no re-pregunta (E-17b, E-17c) | Muere con la sesión | Comando literal |

Prueba de que el persistido cruza sesiones: en E-17b, una **sesión nueva** repitió el comando
idéntico al aprobado en la sesión A y **no** volvió a preguntar. Y el registro persistido
acumuló los cuatro comandos aprobados, todos literales:

```json
{"data":[
  {"id":"psv_...","projectID":"global","action":"bash","resource":"git config --local user.name ALFA"},
  {"id":"psv_...","projectID":"global","action":"bash","resource":"git config --local user.name CHARLIE"},
  {"id":"psv_...","projectID":"global","action":"bash","resource":"git push origin main"},
  {"id":"psv_...","projectID":"global","action":"bash","resource":"git push origin other"}
]}
```

### ¿Se mantienen las refutaciones del informe original?

**R-1 (E-08) se mantiene, mejor caracterizada.** La refutación original decía: no se guarda
`git push *`, se guarda el comando literal. Eso sigue en pie, y ahora está medido en los dos
mecanismos y en dos formas de comando distintas — incluido tu ejemplo exacto: aprobar
`git push origin main` y después pedir `git push origin other` **vuelve a preguntar**
(`E17c.txt`). No hay recorte por aridad observable.

Matiz importante: el informe original **no había medido** el ruleset de sesión, y ese hueco
era real. Lo medí (E-17b, comando idéntico → no re-pregunta) y el resultado es que el ruleset
de sesión **existe y se consulta**, pero con el mismo contenido literal. La conclusión no
cambia; la descripción ahora es completa en vez de parcial.

**R-2 (E-09) se mantiene y se refuerza.** El diagnóstico original era "el `deny` oculta la
herramienta, así que nunca hay solicitud que aprobar". Eso era correcto pero incompleto.
Corrí el escenario que faltaba — `deny` **angosto**, `tools.bash = true`, la herramienta
visible, otras dos aprobaciones "siempre" ya concedidas en la misma sesión — y el `deny` igual
ganó:

- `git config --local user.name BRAVO` → **ningún** evento `permission.v2.asked`;
- el centinela en `.git/config` quedó en `CHARLIE`, no pasó a `BRAVO`;
- control en sesión nueva: el centinela quedó en `CONTROL-SENTINEL`.

Así que la refutación se sostiene por dos vías independientes: el `deny` impide que exista una
solicitud **y** gana aunque existan aprobaciones de sesión en juego.

**Lo que NO puedo afirmar: que el orden de evaluación esté refutado.** La pregunta de fondo
—`approved` se pasa después de la configuración y `findLast` decide— sigue siendo cierta en el
código pero **inalcanzable** por el flujo normal: para que una aprobación ancha pudiera cubrir
un comando denegado, la aprobación tendría que ser ancha, y la evidencia muestra que es
literal. Un comando denegado nunca genera solicitud, así que nunca puede aprobarse. Marqué
H-17b como *refutada / inalcanzable* y no como *refutada* a secas, porque el experimento no
pudo poner a prueba el orden: lo que puso a prueba es que ese estado no se alcanza.

### Defecto de mi propio harness en E-17c

En E-17c, el paso WHISKEY imprimió `NO PERMISSION REQUEST RAISED (an existing approval
covered it)`. **Esa etiqueta estaba mal**: el texto asumía una de las dos causas posibles. El
SSE (`E17c-events.sse.txt`) muestra que entre el `replied` de CHARLIE y el `asked` de
`git push origin main` no hay ningún evento para WHISKEY, y el centinela no cambió: fue el
`deny`, no una aprobación. El veredicto se apoya en el SSE y en el centinela, no en mi
etiqueta.

## 8.3 · Corrección de E-12 respecto de `OPENCODE_PERMISSION`

**La variable existe y funciona.** La conclusión del §5/C-5 ("sin efecto, parece no existir")
es **incorrecta** y queda reemplazada por esta:

| Prueba | Resultado |
| --- | --- |
| `OPENCODE_PERMISSION={"bash":{"*":"allow"}}` + proyecto `{"permission":{"bash":{"*":"deny"}}}` | `debug config` pasa de `"*": "deny"` a `"*": "allow"`; `bash: true`; el comando **ejecuta** |
| Igual, pero contra `agent.build.permission.bash.* = "deny"` | Gana el **agente**: las reglas de `bash` quedan `{*: allow}` (variable) y luego `{*: deny}` (agente); `bash: false` |

Es decir: es un **escape hatch de nivel raíz**, no un override absoluto. Se fusiona después de
las fuentes de archivo pero **antes** de las reglas de agente.

### Por qué E-12 la hizo parecer inexistente

Fueron **dos defectos míos**, no comportamiento de opencode:

1. **E-12, caso D.** El JSON se pasó inline:
   `-EnvSetup "`$env:OPENCODE_PERMISSION='{ `"bash`": { `"*`": `"allow`" } }';"`.
   Esa cadena viaja a `powershell.exe -Command <string>` a través del quoting de la línea de
   comandos de Windows, que destroza las comillas internas. La variable quedaba con un JSON
   inválido. Y ahora sabemos exactamente qué pasa en ese caso (ver abajo): **se descarta en
   silencio**. Resultado idéntico a "no existe".

2. **E-12R, caso D2.** Peor: mi función `CfgProbe` tenía la variable **hardcodeada**.
   `exp/E12R.ps1` contiene `$cmd = "`$env:OPENCODE_CONFIG_CONTENT = (Get-Content -Raw '$valFile'); ..."`
   sin importar el nombre del caso. El caso llamado `D2-PERMISSION-allow` **nunca tocó
   `OPENCODE_PERMISSION`**: seteó `OPENCODE_CONFIG_CONTENT` con `{"bash":{"*":"allow"}}`, que
   tiene una clave de nivel raíz desconocida. Ese caso no probó nada y no debí reportarlo como
   evidencia de la variable.

Tu diagnóstico de la causa raíz (JSON roto por quoting) era correcto para el caso D, y el caso
D2 era todavía peor de lo que suponías.

### Asimetría entre las dos variables, con JSON inválido

| Variable | JSON inválido | Efecto |
| --- | --- | --- |
| `OPENCODE_PERMISSION` | `{invalid` | **Avisa y sigue**: `level=WARN message="OPENCODE_PERMISSION contains invalid JSON, skipping" err="SyntaxError: JSON Parse error: Expected '}'"`. El proceso arranca y rige la configuración de archivo |
| `OPENCODE_CONFIG_CONTENT` | JSON roto | **Fatal**: `Error: Configuration is invalid` / `Config file at OPENCODE_CONFIG_CONTENT is not valid JSON(C)` y no arranca (`evidencia/E12.txt`) |

### Cuán silenciosa es la degradación: matiz

El §7 y tu enunciado decían "un warning que no se ve sin `--log-level DEBUG`". Medido en
`E18b2.txt`, la barrera **no es el nivel de log**:

| Flags | ¿En stderr? | ¿En `log/opencode.log`? |
| --- | --- | --- |
| (ninguno) | **No** | **Sí** |
| `--print-logs` | Sí | Sí |
| `--print-logs --log-level DEBUG` | Sí | Sí |

El mensaje es `level=WARN`, que está **por encima** del umbral por defecto: el nivel nunca lo
filtró. Lo que ocurre es que opencode **sólo espeja logs a stderr con `--print-logs`**. Sin ese
flag el warning va únicamente al archivo de log.

Consecuencia práctica, más precisa que "silencioso": la degradación es **muda en la consola**
pero **queda registrada** en `$XDG_DATA_HOME/opencode/log/opencode.log`. Un endurecimiento de
permisos pasado por variable puede no aplicarse nunca sin que el operador vea nada — pero hay
rastro si sabe dónde mirar.

## 8.4 · Implicancias: qué cambia del §6

De las nueve reglas del §6, **ninguna se cae**. Dos se refuerzan y aparecen tres nuevas.

- **Regla 4 ("`deny` es la única garantía fuerte") — reforzada.** Ahora hay dos vías: el `deny`
  impide que exista una solicitud, y además gana cuando la herramienta **sí** está visible y ya
  hay aprobaciones de sesión concedidas (E-17c, `deny` angosto).
- **Regla 9 ("las aprobaciones 'siempre' son más angostas de lo que parecen") — reforzada y
  precisada.** Es **literal**, verificado en dos formas de comando, incluido `git push`. Esto
  además **cierra la pregunta abierta del §7**: la coincidencia es literal, no por prefijo.
  Aprobaciones "siempre" son casi inútiles como comodidad: no cubren ni una variante del mismo
  comando.
- **Nueva 10 · Un `allow` por `OPENCODE_PERMISSION` es de nivel raíz y pierde contra el
  agente.** Si el endurecimiento vive en `agent.<n>.permission`, una variable de entorno no lo
  va a debilitar. Pero si vive en `permission` de nivel raíz, **sí**: la variable lo pisa. Un
  `deny` de nivel raíz pasado por archivo **no** es resistente a una variable de entorno.
- **Nueva 11 · Validar el JSON de `OPENCODE_PERMISSION` o no confiar en él.** Con JSON inválido
  la variable se descarta entera y el proceso arranca igual, con la configuración de archivo.
  La diferencia con `OPENCODE_CONFIG_CONTENT` (que es fatal) hace fácil asumir que la otra
  también falla ruidosamente. No lo hace.
- **Nueva 12 · Para auditar, mirar el log, no la consola.** La consola sólo muestra logs con
  `--print-logs`. `log/opencode.log` recibe los `WARN` siempre. Un chequeo de cumplimiento
  debería leer ese archivo, no el stderr del proceso.
- **Nueva 13 · No apoyar la trazabilidad en el mensaje de error.** Un `ask` auto-rechazado y
  un `deny` producen textos distintos y ambos son accionables; pero cuando no hay ninguna
  solicitud, la ausencia de evento `permission.v2.asked` es la única señal de que el `deny`
  cortó antes. Si se instrumenta sobre los eventos, hay que escuchar `permission.v2.*`.

## 8.5 · No verificable en esta ronda

| Ítem | Por qué | Qué haría falta |
| --- | --- | --- |
| El recorte por aridad de `info.always` (v1) | El objeto expuesto por la API en 1.18.25 es **v2** (`resources`/`save`) y no tiene los campos `patterns`/`always`; los eventos son `permission.v2.*`. No puedo observar el campo interno v1 desde afuera | Instrumentar el binario, o ejecutar una build con el motor v1 activo, y volcar `info.always` |
| ¿`approved` gana a un `deny` en el orden de evaluación? | **Inalcanzable**: una aprobación es literal y un comando denegado nunca genera solicitud, así que no existe un estado con una aprobación que cubra un comando denegado | Una vía que inyecte una aprobación ancha sin pasar por el flujo de solicitud (p. ej. escribir el ruleset de sesión por API), o una versión donde `always` sí recorte |
| Estado de la herramienta en cada paso de E-17c | `/api/session/{id}/message` y `opencode export` no devolvieron las partes de herramienta en el formato que esperaba mi script; el bloque "SESSION A tool outcomes" salió vacío | Reintentar con el shape correcto de `/api/session/{id}/history` o del evento `session.next.tool.*`. El veredicto de E-17c se apoya en el SSE y el centinela, que son suficientes, pero falta ese tercer testigo |
| E-17 con la TUI real | Igual que en §7: usé la API HTTP del servidor | Una TUI con PTY |
