# ADR-062 — Distribución, web, dependencias, configuración propia, versionado y arnés de pruebas: `bun run` sobre el código fuente, HTML del servidor con escape por defecto, dependencias de ejecución solo si OpenCode las usa en la misma versión, `rige.env` leído en forma explícita, tres versiones independientes, pruebas aisladas por subproceso y vías que observa el adaptador del v1

- Estado: aceptado (29/09/2026)
- Fecha: 29/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2 en forma directa. Resuelve la `[DECISIÓN PENDIENTE]` de la versión de TypeScript de X.4 y del Instrumento 34 (U-02, U-03); la propagación se hace con `/corregir` una vez aceptado. Afecta `src/README.md` (§3 a §6), `src/package.json`, `src/bunfig.toml`, `src/rige.env.example`, `.gitignore`, `src/AGENTS.md` (§3 y §6; lo edita el autor), la interfaz web y el adaptador de OpenCode. Alimenta el capítulo de diseño de una entrega posterior (no se adelanta)
- Origen: sesión de diseño del 29/09/2026 (pendientes AR-03, AR-11 y AR-12). Discusión de siete puntos (C1 a C7) más el alcance de lectura del adaptador del v1 (C8, que surge de verificar sobre el tag el escenario del caso vertical). El autor manifestó conformidad con las ocho recomendaciones y con el puerto 4747
- Relacionado: **aplica** ADR-032 (Bun 1.3.14, web local, GitHub Actions), ADR-058 (paquetes, puertos, convenciones 3, 5, 6 y 8; eje 8), ADR-060 (vías no observadas, O-B), ADR-061 (esquema por guion explícito, `formato_documento`) y ADR-065 (regla 4, pruebas aisladas de la configuración real). **Agrega a RNF-09** un control que no modifica sus criterios (C7)

### Contexto

ADR-058 dejó abiertos la invocación, la construcción de la web, la política de dependencias, la configuración propia de RIGE y el versionado. ADR-065 pidió incorporar aquí el aislamiento del arnés de pruebas. ADR-061 dejó para este registro el nombre del comando del esquema y la variable del almacén.

Restricciones que salen del repositorio:

- **Guía de comprobación del v1** (`catedra/AE2-guia-comprobacion-v1.md`):
  - paso 3: «versiones exactas de lenguaje, motor de base de datos y herramientas. "Última versión" no es una versión»;
  - paso 4: instalación sin errores a partir del archivo de dependencias versionado;
  - paso 5: el archivo de ejemplo «nombra todas las variables necesarias y ninguna contiene credenciales reales»;
  - paso 7: «el proceso levanta y responde en la dirección declarada»;
  - §5: el canal «instala dependencias, construye el proyecto y ejecuta al menos una prueba».
- **ADR-054:** uso y comprobación con instalación nativa en Ubuntu y Windows 11, sin privilegios administrativos. La cátedra puede comprobar en Windows (condición 3 de invalidación de ese registro).
- **RNF-09** (`03-requisitos/libro/catalogo/RNF-09.md`): `Host` limitado, solo GET, sin cabeceras que habiliten otro origen.
- **RNF-05:** ningún cliente de red en el código.

**Verificación sobre el tag `v1.18.25`** (29/09/2026; copia local del archivo cuyo SHA-256 figura en ADR-060, `44e9530d…`; rutas relativas a la raíz del tag salvo indicación):

1. **Herramientas de desarrollo** (`package.json`, `catalog`): `typescript` 5.8.2 (línea 78), `@types/bun` 1.3.13 (38). La verificación de tipos del paquete usa `tsgo --noEmit` (`packages/opencode/package.json:9`), con `@typescript/native-preview` `7.0.0-dev.20251207.1` (79).
2. **Orden de los archivos del proyecto** (`packages/opencode/src/config/paths.ts:16-20`): se buscan `opencode.jsonc` y `opencode.json` subiendo desde el directorio hasta el worktree, y la lista se invierte. Dentro de un directorio, `opencode.json` se aplica antes y `opencode.jsonc` prevalece. En cada `.opencode` el orden es `opencode.json` y después `opencode.jsonc` (`config/config.ts:440`).
3. **Worktree sin control de versiones:** `"/"` (`packages/opencode/src/project/project.ts:217`). La búsqueda llega hasta la raíz del sistema de archivos.
4. **Directorios `.opencode`** (`paths.ts:23-41`): el directorio global; los `.opencode` del proyecto; **el `.opencode` del HOME**; `OPENCODE_CONFIG_DIR`. En ese orden. El del HOME se aplica **después** de los del proyecto, así que prevalece sobre ellos.
5. **Configuración administrada** (`config.ts:530-548`): `opencode.json` y `opencode.jsonc` de un directorio del sistema, si existe, y las preferencias administradas de macOS, que se aplican por encima de todo lo anterior.
6. **Bun del binario distribuido.** La acción de compilación del tag (`.github/actions/setup-bun/action.yml`) lee la versión del campo `packageManager` (`bun@1.3.14`) y descarga `bun-v1.3.14`. El script de compilación genera un ejecutable autónomo (`packages/opencode/script/build.ts:172`, opción `compile`), que incorpora el runtime con el que se compila (conocimiento general sobre `bun build --compile`). La rama `dev` del repositorio oficial, consultada el 29/09/2026, sigue declarando `bun@1.3.14`, `typescript` 5.8.2 y `@types/bun` 1.3.13.

**Versiones vigentes y compatibilidad** (fuentes oficiales, consultadas el 29/09/2026):

- **Bun:** la última versión es la 1.4.2 (05/09/2026; versiones publicadas en GitHub). El anuncio de la 1.4.0 declara la reescritura del runtime en Rust, 39 actualizaciones de JavaScriptCore («roughly eight months of upstream JavaScriptCore work») y cambios en las expresiones regulares (bun.com/blog/bun-v1.4.0).
- **TypeScript:** la 7.0 es estable desde el 08/07/2026. Es el compilador nativo en Go, se distribuye en el paquete `typescript` de npm y conserva el comando `tsc`. La última versión es la 7.0.2. La 6.0 (23/03/2026) es la última escrita en JavaScript (blog oficial de TypeScript; registro de npm).
- **`@types/bun`:** publica una versión por cada versión de Bun, incluida la 1.3.14 (registro de npm).
- **Compatibilidad documentada:** desde TypeScript 6, `types` está vacío por defecto y hay que declarar `"types": ["bun"]`. Lo mismo rige para TypeScript 7 (bun.com/docs/typescript-6).
- **Compatibilidad medida en el equipo del autor** (29/09/2026, carpeta temporal fuera del repositorio):
  - Bun 1.3.14 instalado desde la fuente oficial; el ZIP coincide con `SHASUMS256.txt` (`0a062093…`) y el binario, con el que contiene (`0187f68d…`);
  - TypeScript 7.0.2 con `@types/bun` 1.3.14 y `"types": ["bun"]` verifica sin errores, incluso sin `skipLibCheck`, un archivo que usa `Bun.serve`, `bun:sqlite`, `Bun.Transpiler`, `node:fs`, `node:util` y la importación de un `.sql` como texto;
  - un error de tipos intencional se detecta igual que con la 5.8.2, y ambas terminan con un código distinto de 0;
  - el SQLite integrado en Bun 1.3.14 es la versión 3.53.0, con `json_valid` disponible.

**Tensiones detectadas en la sesión:**
- **T1:** un GET disparado desde una página ajena hacia `127.0.0.1` pasa la verificación de `Host`; hace que RIGE lea una ruta y escriba en el almacén, sin devolver datos a esa página (conocimiento general).
- **T2:** Bun carga `.env` automáticamente en `process.env`, también en `bun test` (conocimiento general). RIGE lee las variables `OPENCODE_*` de su propio proceso como entradas de configuración (ADR-060, punto 2).

### Alternativas evaluadas

- **C1 · Invocación.**
  - **D-A:** `bun run` con scripts de `src/package.json`, sobre el código fuente.
  - **D-B:** Ejecutable único por plataforma con `bun build --compile`.
- **C2 · Web.**
  - **W-A:** HTML generado en el servidor con funciones de plantilla, sin JavaScript en el cliente.
  - **W-B:** Página estática que pide JSON a una ruta interna.
- **C3 · Dependencias.**
  - **Q-A:** Libre, con rangos de versión.
  - **Q-B:** Versiones exactas; en ejecución, solo las que OpenCode usa en el tag en la misma versión; en desarrollo, las herramientas mínimas.
  - Versión de TypeScript dentro de Q-B:
    - **T-5:** 5.8.2, la que declara la configuración de OpenCode;
    - **T-6:** 6.0, la última escrita en JavaScript;
    - **T-7:** 7.0.2, la última estable, con compilador nativo.
  - Versión de Bun: 1.3.14 (ADR-032) frente a la última, 1.4.2.
- **C4 · Archivo de variables.**
  - **V-A:** `.env.example`, copiado a `.env` (carga automática de Bun).
  - **V-B:** `rige.env.example`, copiado a `rige.env`, leído en forma explícita por RIGE.
- **C5 · Versionado.**
  - **N-A:** Un solo número para todo.
  - **N-B:** Tres versiones independientes: RIGE, esquema de salida y esquema de base.
- **C6 · Arnés de pruebas.**
  - **H-A:** Modificar `process.env` en cada prueba.
  - **H-B:** Entorno inyectado por puerto en las unitarias y subproceso con entorno construido en las de aceptación, más una precarga que protege el proceso de pruebas.
- **C7 · Solicitudes de otro sitio.**
  - **F-A:** Solo lo que exige RNF-09.
  - **F-B:** Además, rechazo por `Sec-Fetch-Site`.
- **C8 · Vías que observa el adaptador del v1.**
  - **O-1:** Solo las entradas del proyecto; las globales y de variables se declaran no observadas.
  - **O-2:** Todas las vías locales de archivo; las de contenido en variables fallan en forma visible si están definidas; las remotas se declaran no observadas.

### Análisis (trade-offs)

**C1.**
- **D-B:**
  - exige compilar y probar un binario por sistema operativo;
  - produce artefactos grandes;
  - en Windows, un ejecutable sin firmar suele disparar la advertencia de SmartScreen (conocimiento general), que en la comprobación es una causa de fallo ajena al código.
- **D-A:** deja un solo prerrequisito (Bun 1.3.14) y los mismos comandos en ambas plataformas.
- **«Construir»** (guía, §5) se acredita con la verificación de tipos y un `bun build` de comprobación, sin artefacto distribuido.

**C2.**
- **W-B** agrega una ruta de datos, que es superficie expuesta, y JavaScript de cliente que probar.
- **W-A** presenta el objeto de respuesta del caso de uso (paridad, ADR-058) y se prueba sobre ese objeto.
- **Riesgo común a ambas:** los valores de la configuración analizada se muestran en la página. Un valor con `<script>` se ejecutaría con el origen `127.0.0.1` (conocimiento general, inyección de código). Se mitiga con escape por defecto.

**C3.**
- **Q-A** vuelve irreproducible la instalación (paso 4) y abre la puerta a dependencias que no pasan por el criterio de fidelidad.
- **Q-B** hace que cada biblioteca de ejecución tenga una razón comprobable en el tag. `jsonc-parser` 3.3.1 es la que determina las posiciones y los errores de análisis de OpenCode (ADR-060, punto 1).
- **TypeScript.** Solo verifica tipos: Bun ejecuta el código sin compilarlo, así que la versión no afecta la fidelidad respecto del oráculo (RNF-02).
  - **T-5** coincide con la configuración de OpenCode. Pero OpenCode verifica sus tipos con el compilador nativo, no con la 5.8.2.
  - **T-6** es una versión de transición, sin ventaja propia frente a las otras dos.
  - **T-7** es estable, es la línea que OpenCode usa para verificar sus tipos, y su compatibilidad con `@types/bun` 1.3.14 está medida, no supuesta.
  - Costo de T-7: se aparta de la 5.8.2 declarada en la configuración de OpenCode, y obliga a declarar `"types": ["bun"]`.
- **Bun.** Subir a la 1.4.2 cambia el motor de JavaScript y el de expresiones regulares respecto del que incorpora el binario de OpenCode 1.18.25 (puntos 6 y siguientes de la verificación). Contradice el fundamento de ADR-032 (Anexo III, D-42): el comparador de patrones copiado traduce comodines a expresiones regulares y debe correr en el mismo motor que el oráculo. Se conserva la 1.3.14.

**C4.**
- **V-A** mezcla la configuración de RIGE con el entorno que RIGE analiza (T2) y rompe el aislamiento de ADR-065 si el archivo existe al correr las pruebas.
- **V-B** no depende de ninguna opción de Bun. El nombre `rige.env` no coincide con los que Bun carga solo (conocimiento general, a verificar en 1.3.14), y RIGE admite en él únicamente variables propias.

**C5.**
- **N-A** acopla cambios sin relación: un cambio de la base obligaría a cambiar la versión del esquema de salida que consumen los agentes.
- **N-B** separa tres contratos con consumidores distintos: la cátedra y los usuarios (RIGE), los agentes externos (salida) y el propio almacén (base).

**C6.**
- **H-A** es frágil: una prueba que falla antes de restaurar el entorno contamina las siguientes, y un olvido lee la configuración real del autor.
- **H-B** lleva el aislamiento a la arquitectura: el entorno ya entra por un puerto (ADR-058) y el subproceso no hereda nada que no se le pase.

**C7.**
- **F-A** deja abierta T1.
- **F-B** la cierra en los navegadores que envían `Sec-Fetch-Site`, que son los actuales (conocimiento general), sin afectar a curl ni a la dirección tipeada.

**C8.**
- **O-1** es incorrecta según los puntos 4 y 5 de la verificación: una declaración en `~/.opencode/` o en la configuración administrada prevalece sobre las del proyecto. Declararla «no observada» haría que RIGE informara un valor erróneo en la máquina de la cátedra si esa vía existe, lo que contradice el principio de falla visible.
- **O-2** lee con el mismo lector todas las vías locales de archivo. Su costo marginal es bajo (suposición: entra en las 8 h del adaptador de la Tabla 18).

### Recomendación y fundamento

**D-A + W-A + Q-B + V-B + N-B + H-B + F-B + O-2.**

**C1 · Invocación** (`src/package.json`):

| Script | Qué hace |
|---|---|
| `bun run esquema` | Crea o verifica el esquema del almacén (ADR-061, C-A) |
| `bun run servir` | Arranca la web en `http://127.0.0.1:4747` |
| `bun run rige -- <subcomando>` | CLI (`valor`, `permiso`, `hallazgos`, `servir`, `esquema`; iteración 2 en adelante salvo `servir` y `esquema`) |
| `bun run verificar` | `tsc --noEmit` y `bun build` de comprobación |
| `bun test` | Pruebas |

El ejecutable único se reevalúa en la iteración 4 si las horas lo permiten.

**C2 · Web.**
- HTML generado en el servidor, sin JavaScript en el cliente.
- El ayudante de plantillas escapa todo valor por defecto. Insertar HTML sin escapar exige una función explícita, que solo usan las plantillas fijas.
- Una prueba verifica que un valor `<script>` de un escenario se presenta como texto.
- Rutas del v1:
  - `GET /`: selección del proyecto, agente y clave;
  - `GET /resolver`: resuelve, guarda y redirige a la Resolución;
  - `GET /resoluciones/:id`: lee del almacén y presenta; incluye la lista de resoluciones anteriores del Proyecto.

**C3 · Dependencias.**
- Versiones exactas, sin rangos; `bun.lock` versionado; `bun install --frozen-lockfile`.
- **Ejecución:** `jsonc-parser` 3.3.1, solo en `paquetes/opencode`.
- **Desarrollo:** `typescript` **7.0.2** (T-7) y `@types/bun` **1.3.14**, alineado con el runtime.
- **`tsconfig`:** `"types": ["bun"]` en los paquetes que usan el runtime. `paquetes/nucleo` declara `"types": []`, para que el compilador rechace cualquier referencia al runtime.
- **Runtime:** Bun 1.3.14, la versión que incorpora el binario de OpenCode 1.18.25 (ADR-032). No se sube a la 1.4.
- Sin frameworks, sin ORM y sin bibliotecas de prueba distintas de `bun test`.
- Toda dependencia nueva requiere autorización del autor y una fila en este registro o en uno que lo reemplace.

**C4 · Configuración propia.**
- `src/rige.env.example` se copia a `src/rige.env`, que queda excluido en `.gitignore`.
- Prelación: entorno del proceso → `rige.env` → valores por defecto.
- Solo admite variables `RIGE_*`. Cualquier otra, en particular `OPENCODE_*`, es un error de uso visible.
- Variables:
  - `RIGE_PUERTO`: 4747 por defecto. Si el puerto está ocupado, RIGE termina con un error que nombra la variable.
  - `RIGE_ALMACEN`: directorio del almacén. Por defecto, el de ADR-058, convención 5.
- Si Bun 1.3.14 admite desactivar la carga automática en `bunfig.toml`, se desactiva como defensa adicional (a verificar).

**C5 · Versionado.**
- **RIGE:** `0.1.0` en la etiqueta `v1`. El README declara la correspondencia entre etiqueta y versión.
- **Esquema de salida:** entero `esquema: 1` en toda respuesta.
- **Base:** `PRAGMA user_version` (ADR-061). `formato_documento` es un entero propio del documento de la Resolución.

**C6 · Arnés de pruebas.**
- **Unitarias:** el entorno entra por el puerto como objeto de prueba. Nunca se modifica `process.env`.
- **Aceptación:** lanzan la CLI o el servidor como subproceso con un entorno construido desde cero.
  - `HOME`, `USERPROFILE`, `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_STATE_HOME`, `XDG_CACHE_HOME`, `LOCALAPPDATA`, `APPDATA` y `RIGE_ALMACEN` apuntan a un directorio temporal.
  - Las variables `OPENCODE_*` quedan vacías.
  - Del entorno real se heredan solo `PATH` y `SystemRoot`.
- **Precarga de `bun test`:** redirige esas mismas variables en el proceso de pruebas y falla si alguna sigue apuntando al HOME real.
- **Escenarios:** se copian a un directorio temporal antes de analizarse.
- **Guarda del repositorio:** una prueba verifica que entre `pruebas/escenarios/` y la raíz del repositorio no hay ningún `opencode.json`, `opencode.jsonc` ni `.opencode/` (puntos 2 y 3 de la verificación).

**C7 · `Sec-Fetch-Site`.**
- En todas las rutas se rechazan las solicitudes con `cross-site` o `same-site`.
- Se admiten `same-origin`, `none` y la ausencia del encabezado.
- Se suma a los controles de RNF-09 sin modificar sus criterios.

**C8 · Vías que observa el adaptador del v1.**
- **Se observan todas las vías locales de archivo del orden de aplicación:**
  - los tres archivos globales;
  - `OPENCODE_CONFIG`;
  - los archivos del proyecto, subiendo hasta el worktree;
  - los `.opencode` del proyecto y del HOME;
  - `OPENCODE_CONFIG_DIR`;
  - el directorio administrado.
- **Worktree:** se detecta subiendo hasta un directorio que contenga `.git`, sin ejecutar git. Si no se encuentra, la búsqueda llega a la raíz, como en OpenCode (punto 3). Es una suposición a verificar contra la forma en que OpenCode obtiene la raíz del repositorio.
- **Falla visible:** si `OPENCODE_CONFIG_CONTENT` u `OPENCODE_PERMISSION` están definidas, el v1 no presenta resultados y termina con un error de uso con el código estable `via-no-soportada`, que nombra la variable. Se levanta cuando el adaptador las incorpore.
- **Vías no observadas:** las remotas y las preferencias administradas de macOS figuran siempre así en el resumen de entradas (ADR-060, O-B).

**Fundamento.** Es la combinación que:
- deja a la cátedra un solo prerrequisito con versión exacta y comandos idénticos en las dos plataformas;
- hace reproducible la instalación;
- separa la configuración de RIGE del entorno que analiza;
- vuelve estructural el aislamiento de las pruebas;
- evita que el v1 informe un valor erróneo en una máquina ajena.

**Condición que invalidaría la recomendación:**
- Que Bun 1.3.14 cargue también archivos con el nombre `rige.env`. En ese caso se cambia el nombre (C4).
- Que una versión posterior de `@types/bun` 1.3.x o de TypeScript 7 rompa la verificación de tipos medida (C3). En ese caso se vuelve a T-5.
- Que se adopte una versión de OpenCode construida sobre Bun 1.4. En ese caso se reevalúa la versión del runtime junto con el oráculo (C3).
- Que observar las vías globales empuje el adaptador por encima de sus 8 h (C8). En ese caso, la presencia de cualquier vía global se trata también como falla visible.
- Que la cátedra exija un ejecutable sin runtime (C1).

### Decisión del autor

Aceptado por el autor el 29/09/2026 (`/aceptar ADR-062`). En la sesión del 29/09/2026 el autor manifestó conformidad con C1 a C8 y con el puerto 4747. La deliberación de C3 que corresponde al informe (versión de TypeScript, X.4) consta en el Anexo III, D-56.

**Revisión del 29/09/2026 (excepción autorizada por el autor).** Al preparar el entorno, el autor pidió investigar la documentación oficial e instalar la última versión compatible de Bun y de TypeScript. La investigación mostró dos cosas:
- la razón por la que se había descartado el compilador nativo (versión preliminar) dejó de ser cierta, porque TypeScript 7 es estable;
- Bun 1.4 cambia el motor respecto del de OpenCode 1.18.25.

El autor decidió **reescribir este registro en lugar de abrir uno nuevo**, por el alcance acotado del cambio. Esto es una excepción a la práctica de reemplazar un ADR aceptado. Lo que cambia es solo C3:
- TypeScript pasa de 5.8.2 a 7.0.2;
- `@types/bun` queda fijado en 1.3.14;
- se declara `"types": ["bun"]`;
- se ratifica Bun 1.3.14.

La versión anterior del texto queda en el historial de git.

**Precisión del 05/10/2026 al implementar el v1 (C8; propuesta del ingeniero con autorización general del autor para las decisiones del v1; pendiente de su conformidad).** Se volvió a leer el tag (`packages/opencode/src/config/config.ts:259-275, 365-560`, `config/paths.ts`, `config/agent.ts`, `config/entry-name.ts`, `config/managed.ts`, `core/src/flag/flag.ts`, `core/src/global.ts`, `core/src/fs-util.ts:168-182`, `core/src/v1/config/agent.ts:43-80`). El detalle queda en `src/paquetes/opencode/ubicador.ts`, `lector.ts` y `secuenciador.ts` y en sus pruebas. La regla que gobierna todas las precisiones: **ante lo que el v1 no reproduce, la clave afectada se informa como «no resuelta en el prototipo v1» y el resto se resuelve; la falla visible queda para lo que impide determinar qué claves están afectadas.** Así el recorrido funciona también en una máquina con configuración propia de OpenCode (comprobado con la del autor, que tiene gentle-ai). Lo que precisa C8:
- **Variables con falla visible** (`via-no-soportada`), con la semántica exacta de `flag.ts`: `OPENCODE_CONFIG_CONTENT`, `OPENCODE_PERMISSION` y `OPENCODE_TEST_MANAGED_CONFIG_DIR` cuando no están vacías; `OPENCODE_CONFIG_DIR` y `OPENCODE_TEST_HOME` cuando están presentes; `OPENCODE_DISABLE_PROJECT_CONFIG` solo con `true` o `1`; `OPENCODE_CONFIG` relativa; el archivo TOML heredado `config` del directorio global. `OPENCODE_CONFIG` absoluta se observa.
- **Markdown:** los agentes y modos en Markdown se leen (entran al resumen de E-02) pero no se interpretan; el agente que definen (nombre según `config/entry-name.ts`) queda no resuelto. Si el frontmatter declara `name:`, no se puede saber qué agente afecta: falla visible. Se descartó la falla visible ante cualquier Markdown porque impediría el recorrido en una máquina con agentes propios.
- **Sustituciones `{env:}`/`{file:}`:** dentro de una cadena, la clave queda no resuelta (RNF-04 se cumple: nunca se expande ni se muestra contenido); en un comentario no afecta; fuera de una cadena, `contenido-no-soportado`. Límite conocido (pregunta probable de la defensa): OpenCode inserta el contenido de `{env:}` sin escapar sobre el texto crudo (`config/variable.ts:36-38`), de modo que una variable cuyo contenido tenga comillas puede alterar la estructura de la entrada; RIGE no lee el contenido de las variables (RNF-04, E-02) y no puede detectarlo, por lo que en ese caso las demás claves de esa entrada podrían diferir. Se resuelve en la iteración 3 con `ValorSustituido`.
- **Claves no resueltas:** `permission`, `tools`, `instructions`, `plugin`, `permission`/`tools` de cada agente; el agente afectado por `mode` o `disable`; `steps` cuando un archivo declara `maxSteps`; las claves desconocidas del agente y su `options` (OpenCode las normaliza por archivo antes de fusionar); y toda ruta declarada como objeto en una entrada y como valor en otra (`forma-en-conflicto`). Toda otra hoja se resuelve con reemplazo, que coincide con `mergeDeep` hoja por hoja (RD-01).
- **Worktree:** un `.git` es válido si es un directorio con `HEAD` o un archivo `gitdir:` (cierra AR-13 para el v1).
- **Errores de uso nuevos** (código 1 en la CLI; estados HTTP en la web): `proyecto-inexistente`, `entrada-ilegible`, `entorno-incompleto`, `contenido-no-soportado`, `solicitud-invalida`, `agente-sin-declaraciones`, `clave-inexistente`, `clave-no-resuelta` y `resolucion-inexistente`.
- **Resultados de referencia:** dos escenarios generados una sola vez con OpenCode 1.18.25 (`opencode debug agent build`, binario `opencode-windows-x64@1.18.25`, SHA-256 `ef06e41a…`) y versionados con su procedencia (`src/pruebas/escenarios/*/REFERENCIA.json`): `v1-precedencia` (tres niveles del proyecto, el caso del README) y `v1-vias` (global, `OPENCODE_CONFIG`, `.opencode` anidados, `.opencode` del HOME, `maxSteps` y conflicto de forma). El segundo confirmó con la herramienta que el `.opencode` más cercano al proyecto tiene **menor** prevalencia que el de un nivel superior. El CI no ejecuta OpenCode. OpenCode no modificó los archivos de configuración (con `$schema` presente) pero agregó `.gitignore` en cada directorio de configuración (AR-10).

### Consecuencias

**Si se acepta:**

- **`src/README.md`:**
  - §3: Bun 1.3.14, TypeScript 7.0.2 y SQLite 3.53.0, integrado en Bun 1.3.14;
  - §4: `bun install --frozen-lockfile` y `bun run esquema`;
  - §5: `rige.env.example` y sus dos variables;
  - §6: `bun run servir` y `http://127.0.0.1:4747`.
- **`.gitignore`:** agregar `rige.env`.
- **ADR-058, árbol de `src/`:** `.env.example` se lee como `rige.env.example`.
- **`src/AGENTS.md`** (lo edita el autor):
  - §3: la política de dependencias de C3;
  - §6: el arnés de C6;
  - §5: el escape por defecto de la web.
- **Contrato de salida (ADR-058):** `via-no-soportada` se suma como código estable de error de uso (código 1), sin agregar filas.
- **Informe (con `/corregir`, una vez aceptado):** la `[DECISIÓN PENDIENTE]` de la versión de TypeScript en X.4 y en el Instrumento 34 pasa a 7.0.2 (U-02, U-03).
- **Referente (PV-03):** informar el control de `Sec-Fetch-Site` junto con RNF-09.
- **Pendientes:** AR-03 se cierra al aceptarse. AR-11 queda abierto solo por la declaración de herramientas.

### Evidencia

- Código fuente de OpenCode, tag `v1.18.25` (archivo y SHA-256 en ADR-060): `package.json`; `packages/opencode/package.json`; `packages/opencode/src/config/paths.ts`, `config.ts`; `packages/opencode/src/project/project.ts`
- `catedra/AE2-guia-comprobacion-v1.md` (pasos 3 a 7; §5; §6, causas de fallo)
- `00-gestion/reglas-catedra.md`, §7
- `03-requisitos/libro/catalogo/RNF-05.md`, `RNF-09.md`; `03-requisitos/libro/iteraciones.md` (iteración 1)
- ADR-032, ADR-054, ADR-058, ADR-060, ADR-061, ADR-065
- Sesión de diseño del 29/09/2026
