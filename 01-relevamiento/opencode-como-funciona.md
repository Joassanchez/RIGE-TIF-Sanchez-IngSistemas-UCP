# Cómo funciona OpenCode por dentro

**Guía técnica de la configuración efectiva y los permisos · versión 1.18.25**
**Proyecto Integrador Final · RIGE · Ingeniería en Sistemas de Información · UCP**

| Campo | Valor |
|---|---|
| Autor | Joaquín Sebastián Sánchez |
| Versión de la herramienta | OpenCode 1.18.25 (tag `v1.18.25` de `anomalyco/opencode`) |
| Versión de esta guía | 2 — corregida con el motor de permisos v2 y con el laboratorio de verificación |
| Última actualización | 21/09/2026 (incluye la revisión de la documentación web) |
| Método | Lectura del código fuente del tag + escenarios controlados sobre la versión instalada + laboratorio de verificación con agente real (17 experimentos, `INFORME.md`) |
| Para qué sirve | (1) entender la herramienta, (2) escribir mis propias reglas sabiendo qué hacen, (3) definir qué tiene que resolver y mostrar RIGE |

> **Etiquetas de evidencia.**
> `[EJECUCIÓN]` comprobado con un agente corriendo sobre la versión real, con doble testigo (estado de la herramienta y archivo centinela en disco) ·
> `[CONFIG]` comprobado con `opencode debug config` o `debug agent`, sin ejecutar el agente ·
> `[CÓDIGO]` leído en el fuente del tag, en el camino que efectivamente se ejecuta ·
> `[WINDOWS]` resultado obtenido en Windows 11; puede diferir en Linux ·
> `[POR VERIFICAR]` no comprobado.

---

## Antes de empezar: qué cambió en esta versión y por qué importa

La primera versión de esta guía describía el mecanismo de "permitir siempre" y la relación entre aprobaciones y `deny` leyendo `packages/opencode/src/permission/index.ts`. Esa lectura era de código real del tag correcto, **pero de un camino que no se ejecuta**.

El repositorio contiene **dos motores de permisos**. El v1, en `packages/opencode/src/permission/`, y el v2, en `packages/core/src/permission.ts`. En la 1.18.25 el que decide es el **v2**: es el que emite los eventos `permission.v2.asked` que se capturaron en el laboratorio. Las conclusiones que dependían del v1 eran falsas para esta versión y se corrigieron en las secciones 9 y 10.

La lección vale más que la corrección: **leer el código del tag correcto no alcanza para saber qué hace la herramienta.** Hay que ejecutarla. Es el motivo por el que el diseño de la línea base exige verificar cada caso en ejecución.

---

## Índice

1. [Cómo reproducir todo esto](#1-cómo-reproducir-todo-esto)
2. [El modelo mental en dos frases](#2-el-modelo-mental-en-dos-frases)
3. [De dónde sale la configuración: las doce entradas](#3-de-dónde-sale-la-configuración-las-doce-entradas)
4. [La fusión profunda y el orden de las claves](#4-la-fusión-profunda-y-el-orden-de-las-claves)
5. [La inversión de precedencia de `.opencode/`](#5-la-inversión-de-precedencia-de-opencode)
6. [Valores que no están en ningún archivo](#6-valores-que-no-están-en-ningún-archivo)
7. [Agentes: nativos, derivados y propios](#7-agentes-nativos-derivados-y-propios)
8. [Permisos: la lista ordenada y la última coincidencia](#8-permisos-la-lista-ordenada-y-la-última-coincidencia)
9. [Cómo se decide un comando de terminal](#9-cómo-se-decide-un-comando-de-terminal)
10. [Aprobaciones "permitir siempre"](#10-aprobaciones-permitir-siempre)
11. [`ask` sin nadie que responda](#11-ask-sin-nadie-que-responda)
12. [Subagentes: qué heredan y qué no](#12-subagentes-qué-heredan-y-qué-no)
13. [Herramientas que desaparecen](#13-herramientas-que-desaparecen)
14. [Instrucciones de contexto: `AGENTS.md`](#14-instrucciones-de-contexto-agentsmd)
15. [Skills, comandos y plugins](#15-skills-comandos-y-plugins)
16. [Los comandos de introspección: qué muestran y qué no](#16-los-comandos-de-introspección-qué-muestran-y-qué-no)
17. [Errores ruidosos y degradaciones mudas](#17-errores-ruidosos-y-degradaciones-mudas)
18. [Checklist para escribir mis propias reglas](#18-checklist-para-escribir-mis-propias-reglas)
19. [Qué implica todo esto para RIGE](#19-qué-implica-todo-esto-para-rige)
20. [Mapa del código fuente](#20-mapa-del-código-fuente)
21. [Pendientes](#21-pendientes)

---

## 1. Cómo reproducir todo esto

Todo se prueba en un entorno aislado:

```bash
mkdir sandbox && cd sandbox
npm install opencode-ai@1.18.25            # versión exacta, sin tocar la instalación global

export HOME=$PWD/fakehome                  # la configuración global pasa a ser la del experimento
mkdir -p "$HOME/.config/opencode"
cat > "$HOME/.config/opencode/opencode.json" <<'EOF'
{ "permission": { "bash": { "*": "ask", "git *": "allow" } } }
EOF

mkdir proj && cd proj && git init -q .
cat > opencode.json <<'EOF'
{ "permission": { "bash": { "*": "deny" } } }
EOF

../node_modules/.bin/opencode debug config
../node_modules/.bin/opencode debug agent build
```

El `HOME` falso es lo que vuelve confiable la prueba: sin él, la configuración global real se suma al escenario.

**Advertencia de aislamiento en Windows** `[WINDOWS]`: redirigir `HOME`, `USERPROFILE` y las variables `XDG_*` redirige la configuración, los datos, la caché y los logs, pero **no** el directorio `state`, que sigue apuntando a `%APPDATA%\ai.opencode.desktop\opencode`. Verificarlo siempre con `opencode debug paths`.

**Para experimentos de permisos con agente**, dos recomendaciones del laboratorio:

- Usar un **proveedor mock local** que devuelva llamadas a herramientas fijas. El modelo real no es determinista y no garantiza que pida exactamente la herramienta bajo prueba.
- Apoyar cada veredicto en **dos testigos independientes**: el estado que informa la herramienta y un archivo centinela en disco verificado después. Nunca en lo que el modelo dice haber hecho.

Para leer el código fuente del tag:

```bash
curl -L -o oc.tar.gz https://codeload.github.com/anomalyco/opencode/tar.gz/refs/tags/v1.18.25
tar xzf oc.tar.gz
```

---

## 2. El modelo mental en dos frases

> **1. La configuración efectiva es un único objeto JSON construido fusionando en profundidad muchas fuentes, una encima de la otra.** No hay un archivo que "gane": ganan claves sueltas, y el objeto resultante puede no existir en ningún archivo.
>
> **2. Los permisos son una lista ordenada de reglas, y decide la última que coincide.** No hay ranking de especificidad. Una regla `*` escrita después de una regla específica la anula.

La mayor parte de las sorpresas de OpenCode salen de pensar la configuración como archivos que se pisan enteros, y los permisos como reglas que se ordenan de lo general a lo específico. Ninguna de las dos cosas es cierta.

La propia herramienta lo dice, tanto en la documentación web (`permissions.mdx`: *the last matching rule winning*) como en su manual embebido (sección 16): *insertion order matters; opencode evaluates the LAST matching rule, so put broad rules first and narrow rules last.*

---

## 3. De dónde sale la configuración: las doce entradas

`Config` arma el objeto aplicando estas fuentes **en este orden**; la de más abajo gana cuando hay conflicto en la misma clave. `[CÓDIGO]` — `packages/opencode/src/config/config.ts`

| # | Fuente | Ruta o variable | Notas |
|---|---|---|---|
| 1 | Configuración remota `.well-known` | Una URL | Requiere red |
| 2 | **Configuración global** | `~/.config/opencode/opencode.jsonc`, luego `opencode.json`, luego `config.json` | Primer candidato que exista |
| 3 | Archivo apuntado por variable | `OPENCODE_CONFIG` | **Pierde contra el proyecto** `[EJECUCIÓN]` |
| 4 | **Archivos `opencode.json` / `.jsonc` del proyecto** | Ascendiendo desde el directorio actual hasta la raíz del worktree | Gana el más cercano |
| 5 | **Directorios `.opencode/`** | El global, los del ascenso, el de `$HOME`, y `OPENCODE_CONFIG_DIR` | Gana el más lejano (sección 5). `OPENCODE_CONFIG_DIR` **le gana al proyecto** `[EJECUCIÓN]` |
| 6 | Agentes y comandos en markdown | `.opencode/agent/*.md`, `.opencode/command/*.md` | Los agentes markdown reemplazan campos del JSON (sección 7) |
| 7 | Configuración completa en una variable | `OPENCODE_CONFIG_CONTENT` | **Le gana al proyecto** `[EJECUCIÓN]` |
| 8 | Configuración remota de la organización | Cuenta activa | Requiere red y sesión |
| 9 | Directorio administrado | Configuración gestionada | Despliegues corporativos |
| 10 | Preferencias administradas de macOS (MDM) | Perfil `.mobileconfig` | Pisa todo lo anterior |
| 11 | Permisos por variable de entorno | `OPENCODE_PERMISSION` | Le gana al `permission` de nivel raíz, **pierde contra `agent.<n>.permission`** `[EJECUCIÓN]` |
| 12 | Traducción del bloque `tools` heredado | `tools: { x: false }` → `permission.x: "deny"` | Mismo nivel: gana `permission`. Niveles distintos: gana el más profundo `[EJECUCIÓN]` |

`OPENCODE_DISABLE_PROJECT_CONFIG` desactiva la configuración del proyecto `[POR VERIFICAR limpiamente]`.

Además, **las claves desconocidas en el nivel superior se rechazan** con `ConfigInvalidError` y el proceso no arranca. En particular, escribir `permissions` (plural, esquema V2) en lugar de `permission` es un **error fatal**, con el mensaje *V2 permissions are not supported by OpenCode V1* `[EJECUCIÓN]`. No es una declaración ignorada en silencio.

**Lo que hay que retener:** cuando alguien pregunta "¿de dónde sale este valor?", las respuestas posibles son doce, y cuatro de ellas no son archivos.

---

## 4. La fusión profunda y el orden de las claves

La fusión es **profunda**: si dos fuentes declaran el mismo objeto, se combinan sus claves.

```jsonc
// global
{ "agent": { "build": { "model": "anthropic/claude-opus-4-1", "temperature": 0.1 } } }
// proyecto/opencode.json
{ "model": "openai/gpt-5", "agent": { "build": { "temperature": 0.7 } } }

// resultado de `opencode debug config`   [CONFIG]
{ "model": "openai/gpt-5",
  "agent": { "build": { "model": "anthropic/claude-opus-4-1", "temperature": 0.7 } } }
```

El agente `build` corre con el modelo del global y la temperatura del proyecto. **Ese objeto no está escrito en ningún archivo.**

### La consecuencia menos obvia: la posición de las claves

> **La posición de una clave la fija el primer archivo que la declara. El valor lo fija el último.** `[CONFIG]` `[EJECUCIÓN]`

```jsonc
// global:    { "bash": { "*": "ask",  "git *": "allow" } }
// proyecto:  { "bash": { "*": "deny" } }
// fusionado: { "*": "deny", "git *": "allow" }     ← posición del global, valor del proyecto

// global:    { "bash": { "git *": "allow", "*": "ask" } }
// proyecto:  { "bash": { "*": "deny" } }
// fusionado: { "git *": "allow", "*": "deny" }
```

Mismas reglas en los dos escenarios. Con un agente real corriendo, el primero **ejecuta** `git status` y el segundo lo **deniega** `[EJECUCIÓN]`. El manual embebido de la herramienta documenta que el orden importa *dentro de un objeto*; lo que **no** documenta es que, al fusionar dos archivos, la posición la hereda el primero.

---

## 5. La inversión de precedencia de `.opencode/`

En `config/paths.ts`, `files()` recolecta los `opencode.json` subiendo por el árbol y termina con **`.toReversed()`**; `directories()` recolecta los `.opencode/` y **no invierte**. Como gana el último, el resultado es opuesto:

| Tipo de archivo | Quién gana |
|---|---|
| `opencode.json` en directorios anidados | El **más cercano** al directorio de trabajo |
| `.opencode/opencode.json` en directorios anidados | El **más lejano** (el de la raíz) |

Comprobado `[CONFIG]` con cuatro archivos simétricos, ejecutando desde `sub/`:

```
proyecto/
├── opencode.json                 → agent.notas.model = "prov/RAIZ-plano"
├── .opencode/opencode.json       → agent.docs.model  = "prov/RAIZ-dotdir"
└── sub/
    ├── opencode.json             → agent.notas.model = "prov/SUB-plano"
    └── .opencode/opencode.json   → agent.docs.model  = "prov/SUB-dotdir"

docs  -> prov/RAIZ-dotdir     ← ganó el lejano
notas -> prov/SUB-plano       ← ganó el cercano
```

Además, los `.opencode/` se aplican **después** de los `opencode.json`, así que también le ganan al `opencode.json` de la raíz. Hay dos issues de usuarios reportando esto (#21307 y #45266).

> **Regla práctica:** no mezclar los dos estilos en un mismo árbol. Usar `opencode.json` planos, cuya precedencia es la intuitiva.

---

## 6. Valores que no están en ningún archivo

### Sustitución `{env:}` y `{file:}`

Antes de parsear el JSON, el texto pasa por una sustitución (`config/variable.ts`):

| Token | Qué hace | Si no existe |
|---|---|---|
| `{env:VARIABLE}` | Reemplaza por el valor de la variable de entorno | **Cadena vacía, sin ningún aviso** — `"A-{env:NO_EXISTE}-B"` resuelve a `"A--B"` `[EJECUCIÓN]` |
| `{file:ruta}` | Reemplaza por el contenido del archivo | **Error de carga** |

La ruta de `{file:}` es relativa al archivo de configuración, no al directorio de trabajo.

Dos consecuencias: el valor efectivo puede estar en el entorno o en otro archivo, fuera de todo `opencode.json`; y una referencia a una variable inexistente produce un valor vacío legítimo en apariencia.

### Variables de entorno de configuración

`OPENCODE_CONFIG_CONTENT` y `OPENCODE_PERMISSION` meten configuración completa o permisos directamente desde el entorno. Su comportamiento ante JSON inválido es **asimétrico** (sección 17), y es una fuente de errores difíciles de ver.

---

## 7. Agentes: nativos, derivados y propios

OpenCode trae agentes nativos (`build`, `plan`, `general`, `explore`, y otros internos). Sus permisos se arman así `[CÓDIGO]` — `packages/opencode/src/agent/agent.ts`:

```
permisos del agente = merge(
    defaults,                    ← reglas base comunes (incluye la protección de .env)
    extras nativos del agente,   ← lo propio de build, de plan, etc.
    reglas del usuario           ← el bloque `permission` de nivel superior
)
                                 + agent.<nombre>.permission, al final
```

Orden real de autoridad, dado que decide la última coincidencia:

```
base nativa  <  extras del agente  <  permission raíz  <  OPENCODE_PERMISSION  <  agent.<n>.permission
```

### Un `allow` global desactiva el agente `plan`

El agente `plan` tiene `edit: { "*": "deny" }` entre sus extras. Pero las reglas del usuario se agregan después:

```jsonc
// ~/.config/opencode/opencode.json
{ "permission": { "edit": "allow" } }
```

```
$ opencode debug agent plan          (reglas de edit)
edit *                        deny     ← nativa del agente plan
edit .opencode/plans/*.md     allow
edit *                        allow    ← regla del usuario, última → gana
```

Con un agente real corriendo en modo `plan`, **editó el archivo** `[EJECUCIÓN]`. Una sola línea en el archivo global desactiva silenciosamente la protección del modo plan. Coincide con el issue #39715.

### Agentes declarados en markdown

Un agente puede declararse en `opencode.json` y a la vez en `.opencode/agent/<nombre>.md`. Cuando se declararon los dos, **ganó el markdown**: el `prompt` y la `description` del JSON quedaron sin ningún efecto `[EJECUCIÓN]`. Es una excepción visible al modelo general de fusión profunda: para esos campos no hay combinación, hay reemplazo.

### Otros detalles

- `agent.<nombre>.disable: true` elimina el agente.
- Un agente declarado con un nombre nuevo se **crea**, con los permisos base más los del usuario.
- El bloque `mode` heredado se fusiona dentro de `agent`.

---

## 8. Permisos: la lista ordenada y la última coincidencia

### De objeto a lista

El bloque `permission` se convierte en una lista de reglas recorriendo las claves **en el orden en que están escritas**:

```jsonc
{ "bash": { "*": "ask", "git *": "allow" }, "webfetch": "allow" }
```
```
1. bash      *       ask
2. bash      git *   allow
3. webfetch  *       allow
```

Un valor string (`"webfetch": "allow"`) equivale al patrón `*`. En los patrones, `~` y `$HOME` se expanden.

### La evaluación, en el motor que corre

```ts
// packages/core/src/permission.ts  (motor v2)   [CÓDIGO]
rulesets.flat()
  .findLast(rule => match(action, rule.action) && match(resource, rule.resource))
  ?? { action, resource: "*", effect: "ask" }
```

1. **`findLast`**: gana la **última** regla que coincide. No hay ranking de especificidad.
2. **Si ninguna regla coincide, el efecto es `ask`.**
3. **Varios recursos en una misma solicitud**: si alguno da `deny`, la solicitud se deniega; si alguno da `ask`, se pregunta; sólo si todos dan `allow` se ejecuta.

### Los ejes de permiso

| Eje | Qué gobierna |
|---|---|
| `bash` | Ejecución de comandos de terminal |
| `read` | Lectura de archivos, con protección nativa de `.env` |
| `edit` | Edición y escritura |
| `webfetch` | Acceso a contenido web |
| `external_directory` | Acceso a rutas fuera del proyecto |
| `task` | Lanzar subagentes |
| `todowrite` / `todoread` | Lista de tareas |
| `question` | Preguntar al usuario |
| `plan_enter` / `plan_exit` | Entrar y salir del modo plan |
| `doom_loop` | Detección de bucles |
| `skill` | Uso de skills |

### Protección nativa de `.env`

Sin ninguna regla de `read` declarada `[EJECUCIÓN]`:

| Archivo | Resultado |
|---|---|
| `.env` | Rechazado |
| `.env.local` | Rechazado |
| `.env.example` | Permitido |
| `notes.txt` | Permitido |

La regla viene de los defaults nativos: no está en ningún archivo de configuración y `debug agent` la muestra sin indicar que es nativa.

> **La documentación contradice el comportamiento.** `permissions.mdx` afirma que los `.env` se **deniegan** por defecto (`"*.env": "deny"`, `"*.env.*": "deny"`). El código (`packages/opencode/src/agent/agent.ts:132`) y el ruleset compilado dicen **`ask`** `[CÓDIGO]` `[CONFIG]`. En modo `opencode run` las dos cosas se ven iguales, porque un `ask` se autorrechaza (sección 11); en la TUI, por la regla, el agente debería **preguntar** en lugar de bloquear `[POR VERIFICAR en ejecución]`. Quien confíe en la documentación cree que el archivo está protegido sin excepción, cuando en realidad basta con aprobar la solicitud.

---

## 9. Cómo se decide un comando de terminal

### Comandos compuestos

La herramienta `shell` parsea el comando a un árbol sintáctico y genera **un recurso por sub-comando**. Con `{"*":"allow","rm *":"deny"}`, pedir `ls && rm -rf ...` se deniega **entero**, y lo mismo con `;`, con `|` y con subshells. El archivo canario quedó intacto en los cuatro casos `[EJECUCIÓN]`.

### `external_directory` desde la terminal

Las herramientas nativas (`read`, `write`, `edit`, `glob`, `grep`) respetan correctamente la frontera del proyecto: apuntadas afuera, las cinco fueron bloqueadas `[EJECUCIÓN]`.

Desde `bash` la historia es otra `[EJECUCIÓN]` `[WINDOWS]`. Con `{"bash":{"*":"allow"}}` y un archivo fuera del proyecto:

| Bloqueados | Permitidos |
|---|---|
| `cat`, `Get-Content`, `cp`, `mv`, `rm`, `Remove-Item`, `Copy-Item`, `Set-Content`, `New-Item` | `type`, `gc`, `del`, `more`, `tail`, `sed`, `awk`, `grep`, `rg`, `Select-String`, `Out-File`, `echo > <fuera>`, `python -c`, `cmd /c` |

Verificado en disco: `del` borró el archivo externo y `echo >` creó archivos fuera del proyecto. El chequeo parece comparar **nombres literales de una lista fija**: `gc` y `type` son alias de `Get-Content`, y `del` de `Remove-Item`, pero sólo los nombres canónicos están bloqueados.

**Advertencia de plataforma:** en Windows, la herramienta `bash` ejecuta **PowerShell**, no bash. Los alias que abren el agujero son de PowerShell. Pero `tail`, `sed`, `awk` y `grep` son nombres POSIX, así que es probable que el agujero persista en Linux. `[POR VERIFICAR en Ubuntu]`

### La aridad de comandos

El código contiene un diccionario de aridades (`git` → 2 tokens, `npm run` → 3…) en `packages/opencode/src/permission/arity.ts`. **En la 1.18.25 no afecta lo que se aprueba** (sección 10): pertenece al camino v1.

---

## 10. Aprobaciones "permitir siempre"

> **Corrección respecto de la versión 1 de esta guía.** Se afirmaba que "permitir siempre" guardaba un prefijo recortado por aridad (aprobar `git push origin main` aprobaba `git push *`) y que una aprobación de sesión le ganaba a un `deny` de configuración. **Las dos cosas son falsas en la 1.18.25.** Describían el motor v1.

### Lo que se guarda es el comando literal

La solicitud de permiso en el motor v2 tiene esta forma `[EJECUCIÓN]`:

```json
{ "action": "bash",
  "resources": ["echo ALFA > alfa.txt"],
  "save":      ["echo ALFA > alfa.txt"] }
```

Al responder "siempre", se persiste `save` tal cual. Consecuencias medidas `[EJECUCIÓN]`:

| Aprobado con "siempre" | Pedido después | Resultado |
|---|---|---|
| `git push origin main` | `git push origin main` | No vuelve a preguntar |
| `git push origin main` | `git push origin other` | **Vuelve a preguntar** |
| `echo ALFA > alfa.txt` | `echo ALFA > alfa2.txt` | **Vuelve a preguntar** |

La coincidencia es **literal**. "Permitir siempre" no amplía nada; tampoco sirve de mucho como atajo, porque no cubre ni una variante del mismo comando.

### Dónde se guarda

Las aprobaciones van a una tabla persistente, asociadas a un `projectID` `[CÓDIGO]` — `packages/core/src/permission/saved.ts`. **Sobreviven a la sesión**: una sesión nueva que repite el comando aprobado no vuelve a preguntar `[EJECUCIÓN]`. Se pueden consultar por la API del servidor (`GET /api/permission/saved`), pero **ningún comando de `debug` las muestra**.

En el laboratorio, las aprobaciones quedaron bajo `projectID: "global"`, incluso en directorios con `git init`. Si ese es el comportamiento real, una aprobación concedida en un proyecto no reconocido aplicaría a todos los demás en la misma situación. `[POR VERIFICAR — puede ser un efecto del arnés de prueba]`

### Una aprobación nunca le gana a un `deny`

```ts
// packages/core/src/permission.ts  (motor v2)   [CÓDIGO]
const rules = yield* configured(input.sessionID, input.agent)
if (denied(input, rules)) return { effect: "deny", rules }   // ← corta acá
const all = [...rules, ...(yield* savedRules())]
```

El `deny` de configuración se chequea **antes** de consultar las aprobaciones guardadas. Comprobado con un `deny` angosto que deja la herramienta visible y dos aprobaciones "siempre" ya concedidas en la sesión: el comando denegado no generó solicitud y no se ejecutó `[EJECUCIÓN]`. Es una protección deliberada, probablemente la corrección del issue #28876.

---

## 11. `ask` sin nadie que responda

En modo no interactivo (`opencode run`), un permiso `ask` **se rechaza automáticamente** `[EJECUCIÓN]`:

```
! permission requested: bash (echo ASKPROBE > sentinel.txt); auto-rejecting
```

| Configuración | En `opencode run` |
|---|---|
| Sin reglas (por defecto) | Ejecuta |
| `bash *: ask` | **Rechazado automáticamente** |
| `bash *: ask` + `--auto` | Ejecuta |
| `bash *: deny` | La herramienta no se ofrece al modelo |

Dos detalles importantes:

- El mensaje de error dice *"The user rejected permission..."* aunque **ningún usuario fue consultado**. Engañoso.
- Un `deny` de configuración produce otro texto, que enumera las reglas aplicables. La diferencia de texto es la única forma de distinguir, por el resultado, "no había nadie para preguntar" de "está prohibido".

En automatización (CI, scripts), **`ask` equivale a `deny`**.

Además, **`opencode run` y una sesión creada por el servidor ofrecen conjuntos de herramientas distintos** para el mismo agente y proyecto: el modo servidor agrega `apply_patch`, `question` y `websearch`, y quita `task` `[EJECUCIÓN]`. El conjunto de herramientas depende del modo de ejecución, no sólo de la configuración.

---

## 12. Subagentes: qué heredan y qué no

Cuando un agente lanza un subagente `[CÓDIGO]` — `agent/subagent-permissions.ts`:

- Del padre se heredan **las reglas `deny`** y las de `external_directory`.
- El resto lo aporta el ruleset propio del subagente.
- Se agregan denegaciones implícitas de `todowrite` y `task`.

Con el padre en `bash *: deny`, el subagente `general` tampoco tuvo `bash`, y además perdió `task` y `todowrite` `[EJECUCIÓN]`. Las restricciones viajan hacia abajo; los permisos amplios no.

---

## 13. Herramientas que desaparecen

Si la última regla que coincide con una herramienta tiene patrón `*` y efecto `deny`, la herramienta **no se le ofrece al modelo** `[EJECUCIÓN]`:

| Configuración | Efecto |
|---|---|
| `"bash": { "*": "deny" }` | El modelo no ve `bash` |
| `"bash": { "*": "deny", "git *": "allow" }` | La última regla ya no es la `*`: `bash` vuelve a estar visible |

Consecuencia: agregar una excepción `allow` a una denegación general no sólo abre esa excepción; **vuelve a exponer la herramienta completa al modelo**, que puede intentar cualquier comando y recibir un rechazo por cada uno.

---

## 14. Instrucciones de contexto: `AGENTS.md`

`[EJECUCIÓN]`

| Ubicación | ¿Se carga? | Cuándo |
|---|---|---|
| `~/.config/opencode/AGENTS.md` | Sí | En el system prompt, primero |
| `<proyecto>/AGENTS.md` | Sí | En el system prompt, después del global |
| `<proyecto>/sub/AGENTS.md` | **Perezosamente** | Recién cuando el agente lee un archivo de ese subárbol, y se inyecta **dentro del resultado de `read`** |
| `<proyecto>/.opencode/AGENTS.md` | No | — |

El caso del subdirectorio es el importante: las instrucciones que rigen sobre el agente **dependen de qué archivos leyó durante la sesión**. No son un dato estático de la configuración.

---

## 15. Skills, comandos y plugins

`[EJECUCIÓN]`

| Elemento | Dónde se declara | Cómo se descubre |
|---|---|---|
| Skill | `.opencode/skill/<nombre>/SKILL.md` | Automático; aparece en `opencode debug skill` |
| Comando | `.opencode/command/<nombre>.md` | Automático |
| Plugin | `.opencode/plugin/*.js` | Automático; el plugin se cargó y su hook `tool.execute.before` se disparó |

Un plugin cargado **no alteró un `deny`** en la prueba realizada. Pero la documentación embebida indica que el hook `config` recibe la configuración fusionada en vivo y permite modificarla: un plugin **puede** reescribir permisos. `[POR VERIFICAR]`

---

## 16. Los comandos de introspección: qué muestran y qué no

| Comando | Qué muestra | Qué **no** muestra | ¿Documentado en la web? |
|---|---|---|---|
| `opencode debug config` | El JSON resuelto completo | De qué fuente viene cada clave; reglas nativas; valores implícitos | De pasada |
| `opencode debug agent <n>` | Ruleset compilado del agente, **con reglas nativas**, en orden de evaluación | Cuál regla es nativa y cuál del usuario; de dónde viene cada una; **las aprobaciones guardadas** | No |
| `opencode debug skill` | Skills disponibles, **incluido el manual embebido** | Origen de cada skill | No |
| `opencode debug paths` | Rutas de configuración, datos, caché, estado | — | No |
| `opencode debug info` | Versión, sistema, plugins | — | No |
| `opencode agent list` | Agentes disponibles | Sus permisos | Sí |

### El manual embebido

`opencode debug skill` expone una skill interna, `customize-opencode`, cuyo cuerpo es prácticamente el manual de configuración de esta versión `[EJECUCIÓN]`. Es consultable sin conexión y corresponde exactamente a la versión instalada. Entre otras cosas, dice explícitamente que el orden de inserción importa, que gana la última regla que coincide, que las configuraciones se fusionan en profundidad con el proyecto por encima del global, y que las claves desconocidas se rechazan.

Es una fuente documental exacta para la versión instalada y disponible sin conexión. Conviene contrastarla con el comportamiento igual que la web: ninguna documentación reemplaza la ejecución (ver `.env` en la sección 8).

### Una salvedad sobre `debug agent`

`debug agent` muestra las reglas con la forma del motor v1 (`permission` / `pattern` / `action`). El motor que decide, el v2, usa otra forma (`action` / `resource` / `effect`) y además incorpora las aprobaciones guardadas. La semántica de orden coincide, y todos los resultados de ejecución lo confirman, así que para la configuración estática la salida es confiable. Pero **no es la vista completa de lo que se evalúa**.

> **La conclusión que sostiene el proyecto:** los comandos nativos responden **qué** valor rige y **qué** regla decide. Ninguno responde **de dónde sale**. Y el origen puede ser cualquiera de doce entradas, una variable de entorno, una regla nativa, o una aprobación persistida que ningún comando muestra.

---

## 17. Errores ruidosos y degradaciones mudas

Una distinción útil tanto para escribir configuración como para RIGE: algunos errores detienen la herramienta, otros la dejan seguir con algo distinto de lo declarado.

| Situación | Comportamiento | Tipo |
|---|---|---|
| Clave de nivel superior desconocida | `ConfigInvalidError`, no arranca | **Ruidoso** |
| `permissions` (V2) en lugar de `permission` | Error fatal, no arranca | **Ruidoso** |
| `OPENCODE_CONFIG_CONTENT` con JSON inválido | Error fatal, no arranca | **Ruidoso** |
| `{file:}` a un archivo inexistente | Error de carga | **Ruidoso** |
| `{env:}` a una variable inexistente | Cadena vacía, sin aviso | **Mudo** |
| `OPENCODE_PERMISSION` con JSON inválido | Se descarta entera y sigue con la configuración de archivo | **Mudo en consola** |
| `ask` en modo no interactivo | Rechazo automático con un mensaje que menciona a un usuario inexistente | **Engañoso** |
| Protección de `.env` | La documentación dice `deny`; la herramienta aplica `ask` | **Documentación incorrecta** |

### Mudo en consola, pero con rastro

El descarte de `OPENCODE_PERMISSION` produce un aviso `level=WARN` `[EJECUCIÓN]`. El nivel no es lo que lo oculta: OpenCode **sólo copia los logs a la consola con `--print-logs`**. Sin ese flag, el aviso va únicamente a `log/opencode.log` en el directorio de datos.

Consecuencia práctica: un endurecimiento de permisos pasado por variable de entorno puede no aplicarse nunca sin que el operador vea nada en pantalla. Para auditar, **hay que leer el archivo de log, no la consola**.

---

## 18. Checklist para escribir mis propias reglas

**Estructura de archivos**

- [ ] Usar `opencode.json` planos, no `.opencode/opencode.json`.
- [ ] No mezclar los dos estilos en un mismo árbol; evitar `.opencode/` anidados.
- [ ] Escribir siempre `permission` en singular: el plural es un error fatal.
- [ ] Si declaro un agente en markdown, no dejar también `prompt` o `description` en el JSON: no tienen efecto.

**Permisos**

- [ ] Escribir **primero lo general y después lo específico**: `{ "*": "deny", "git *": "allow" }`.
- [ ] Recordar que si otro archivo ya declaró una clave, la posición la fijó él. Verificar con `debug agent`.
- [ ] No poner permisos con patrón `*` en el `permission` de nivel superior del global: pisan las protecciones nativas de `plan`. Ponerlos en `agent.build.permission`.
- [ ] Poner los endurecimientos que importan en `agent.<n>.permission`: ahí no los pisa ni el `permission` raíz ni `OPENCODE_PERMISSION`.
- [ ] Recordar que un `deny` con `*` oculta la herramienta; con excepciones, vuelve a estar visible.
- [ ] **No confiar en `bash` para confinar el sistema de archivos.** Si hace falta confinar, usar las herramientas nativas (`read`, `write`, `edit`, `glob`, `grep`), que sí respetan la frontera, y reducir `bash` a patrones muy acotados o quitarlo.

**Uso diario**

- [ ] El `deny` es la única garantía fuerte: ninguna aprobación lo vence.
- [ ] "Permitir siempre" aprueba sólo el comando literal, y queda guardado entre sesiones.
- [ ] En scripts y CI, `ask` equivale a `deny`. Usar `deny` explícito o `--auto` a conciencia.
- [ ] Después de tocar la configuración, correr `opencode debug agent <el agente que uso>` y leer las últimas reglas: son las que mandan.

**Valores y entorno**

- [ ] Si uso `{env:...}`, verificar que la variable exista: si no, el valor queda vacío sin aviso.
- [ ] Si uso `OPENCODE_PERMISSION`, validar el JSON antes y revisar el log con `--print-logs`: si está roto, se descarta en silencio.
- [ ] En Windows, pensar las reglas de `bash` en PowerShell y cubrir alias y nombres canónicos por separado.

---

## 19. Qué implica todo esto para RIGE

| Hallazgo | Lo que RIGE tiene que resolver |
|---|---|
| Doce entradas de configuración, cuatro fuera de archivos | Inventariar **todas** las fuentes, incluidas variables de entorno y configuración administrada |
| Ningún comando informa procedencia | **Mostrar el origen de cada clave y de cada regla.** Es la función diferencial del producto |
| La fusión produce objetos que no existen en ningún archivo | Mostrar el valor efectivo **y** la cadena de fuentes que lo produjo, clave por clave |
| La posición de la clave la fija el primer archivo | Al explicar un permiso, mostrar **por qué** una regla quedó en la posición que quedó |
| Precedencia invertida de `.opencode/` | Implementar el orden real, no el documentado, y explicar por qué ganó una fuente lejana |
| Agentes markdown reemplazan campos del JSON | Marcar las declaraciones del JSON que quedaron **sin efecto** |
| `{env:}` vacío silencioso | Detectar **referencias no resueltas** y marcarlas como tales |
| `OPENCODE_PERMISSION` con JSON roto se descarta mudo | Validar las variables de entorno de configuración y advertir cuando se descartan |
| Última coincidencia, no especificidad | Señalar la regla **determinante** y las que quedaron sin efecto por estar antes |
| Reglas nativas invisibles | Distinguir regla nativa, regla del usuario, regla heredada |
| Un `allow` global desactiva `plan` | **Advertir cuando una regla del usuario anula una protección nativa** |
| `deny` con `*` oculta la herramienta | Informar el efecto sobre la disponibilidad de la herramienta, no sólo la decisión |
| Aprobaciones persistidas, invisibles para `debug` | Declarar que el análisis es de la configuración; opcionalmente leer las aprobaciones guardadas si se decide ampliar el alcance |
| `AGENTS.md` de subdirectorio se carga según lo leído | Declarar que las instrucciones de contexto dependen de la sesión |
| El conjunto de herramientas cambia entre `run` y servidor | Declarar que la disponibilidad de herramientas depende del modo de ejecución |
| `bash` no confina el sistema de archivos | Advertir cuando la configuración confía en `bash` para aislar rutas |
| Comandos compuestos | Fuera del alcance actual; avisar que el comando es compuesto en lugar de dar una respuesta incompleta |

---

## 20. Mapa del código fuente

Sobre el tag `v1.18.25`:

| Qué quiero ver | Dónde está |
|---|---|
| **Motor de permisos que se ejecuta (v2)**: evaluación, corte por `deny`, aprobaciones | `packages/core/src/permission.ts` |
| Aprobaciones persistidas por proyecto | `packages/core/src/permission/saved.ts` |
| Variables de entorno (`OPENCODE_PERMISSION` y otras) | `packages/core/src/flag/flag.ts` |
| Orden completo de fusión de fuentes | `packages/opencode/src/config/config.ts` |
| Rutas de configuración y ascenso por directorios | `packages/opencode/src/config/paths.ts` |
| Sustitución `{env:}` y `{file:}` | `packages/opencode/src/config/variable.ts` |
| Agentes nativos y armado de sus permisos | `packages/opencode/src/agent/agent.ts` |
| Herencia de permisos de subagentes | `packages/opencode/src/agent/subagent-permissions.ts` |
| Parseo del comando de terminal | `packages/opencode/src/tool/shell.ts` |
| Motor v1 (no se ejecuta en esta versión) y diccionario de aridades | `packages/opencode/src/permission/index.ts`, `arity.ts` |
| Documentación web del tag (36 páginas en inglés) | `packages/web/src/content/docs/*.mdx` |

---

## 21. Pendientes

- [ ] Reproducir en Ubuntu el comportamiento de `external_directory` desde `bash` con `cat`, `tail`, `sed`, `awk` y `head`.
- [ ] Verificar si las aprobaciones quedan bajo `projectID: "global"` también en un proyecto git reconocido, o si fue un efecto del arnés.
- [ ] Verificar si un plugin puede reescribir permisos desde el hook `config`.
- [ ] Verificar limpiamente `OPENCODE_DISABLE_PROJECT_CONFIG`, con el proveedor declarado en el global.
- [ ] Confirmar en ejecución que la lectura de `.env` **pregunta** (evento `permission.v2.asked` por la API del servidor) y no deniega, como afirma la documentación.
