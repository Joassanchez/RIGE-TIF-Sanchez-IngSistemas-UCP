# RIGE · Prototipo v1

> Archivo de lectura exigido por la Guía de comprobación del prototipo v1 (`catedra/AE2-guia-comprobacion-v1.md`). La cátedra lo sigue al pie de la letra, sin suplir pasos.

## 1. Identificación

- **Proyecto:** RIGE — Proyecto Integrador Final 2026
- **Equipo:** Joaquín Sebastián Sánchez (autoría individual)
- **Comisión:** A · Sede Posadas
- **Actividad:** AE2 · etiqueta `v1` (esqueleto arquitectónico ejecutable)

## 2. Qué hace este prototipo

Este prototipo implementa el caso de uso vertical de consulta del valor efectivo de una clave de configuración de un agente de OpenCode 1.18.25 y su procedencia detallada, atravesando desde la interfaz web hasta la persistencia y recuperación en base de datos local SQLite. Este recorrido prueba la decisión de arquitectura hexagonal (ADR-058, ADR-060, RNF-03) que desacopla estrictamente el núcleo genérico de resolución respecto del adaptador de la herramienta.

RIGE (Resolución e Inspección de Gobernanza Efectiva) es una plataforma local de solo lectura que analiza, resuelve y explica la configuración efectiva y la procedencia de políticas en herramientas de desarrollo basadas en agentes, circunscrita en esta versión congelada a **OpenCode 1.18.25** (ADR-054, ADR-102).

El prototipo implementa de manera completa los 14 requisitos funcionales comprometidos (11 Must y 3 Should) y los 10 requisitos no funcionales arquitectónicos (7 Must y 3 Should), satisfaciendo el 100 % de los 18 requisitos Must del producto mínimo viable (V.5):

1. **Resolución determinista de valores y procedencia (RF-01, RF-03, RD-01):** resuelve el valor efectivo de cualquier clave de configuración aplicando la regla de precedencia validada RD-01 (prevalece la declaración de la última entrada que define la clave). Cada valor resuelto informa su rastro exhaustivo: archivo de origen, línea, columna, tipo de entrada y lista cronológica de declaraciones desplazadas.
2. **Descubrimiento exhaustivo de vías de configuración (RF-04):** explora las siete vías reconocidas por OpenCode 1.18.25 (`global`, `variable-config`, `proyecto`, `directorio-opencode`, `markdown`, `variable-contenido` y `variable-permiso`), reportando resumen criptográfico SHA-256, condición de observación y diagnóstico sintáctico (identificando entradas legibles, ilegibles o descartadas).
3. **Control estricto de versión del entorno (RF-05, ADR-102):** detecta la instalación activa de OpenCode en el sistema sin ejecutar su binario. Si la versión difiere de 1.18.25, rechaza la operación con código 1 (CLI) o HTTP 422 (Web). Si no puede determinarse de forma unívoca, emite advertencias estructuradas en JSON conservando los resultados analizados.
4. **Evaluación de permisos y reglas nativas (RF-02, RF-08, RF-09):** evalúa la cadena completa de permisos v1 mediante las funciones puras del evaluador nativo y Wildcard incorporadas bajo licencia MIT (RNF-10). Identifica la regla determinante, la posición en la cadena, los motivos ante consultas sin decisión (comandos compuestos de `bash`, rutas fuera del árbol) y advierte cuando una regla del usuario anula o flexibiliza una protección nativa incorporada.
5. **Modelado y listado de agentes (RF-06, RF-16, ADR-105):** cataloga todos los agentes del ecosistema (nativos y declarados en JSON), modelando sus modos de operación (`all`, `primary`, `subagent`), condiciones de visibilidad (`hidden`, `disable`) y valores implícitos de configuración. Conforme a ADR-105, los agentes definidos en Markdown se identifican con la limitación de contenido no observado (`cadena-incompleta`), evitando suposiciones sobre declaraciones inexistentes.
6. **Detección de 6 causas de hallazgos en vivo sin falsos positivos (RF-07, RE-01 a RE-04):** analiza en memoria configuraciones vigentes para identificar entradas ilegibles, entradas descartadas sin error visible, variables no definidas o vacías, referencias a agentes inexistentes o deshabilitados, reglas de permiso tapadas o sin efecto práctico (mediante inclusión formal con el algoritmo `abarca`), y subagentes sin uso.
7. **Diagnóstico de latencia por etapa (RNF-07, RF-12):** provee la opción `--tiempos` en la interfaz CLI estructurada v2, desglosando la latencia en milisegundos de reloj monotónico (`arranqueMs`, `lecturaMs`, `resolucionMs`, `salidaMs` y `totalMs`) conforme al contrato `esquemas/salida/tiempos.json`, verificado bajo arnés de latencia estricta (< 2000 ms en máquina de referencia).
8. **Aislamiento, portabilidad y persistencia local (RNF-01, RNF-04, RNF-05, RNF-06, RNF-09):** opera íntegramente fuera de línea, sin telemetría ni consumo de red. Sustituye variables y secretos de forma simbólica sin persistir ni exponer credenciales. Persiste las consultas en una base de datos SQLite propia con esquema v2 auditable, operando sin privilegios de administrador en Ubuntu 26.04 y Windows 11.
9. **Arquitectura hexagonal desacoplada (RNF-03, ADR-058, ADR-060):** desacopla estrictamente el núcleo genérico de resolución respecto de los adaptadores de herramientas específicas, permitiendo resolver adaptadores sintéticos sin alterar el motor de combinación.

La oferta de herramientas según la decisión (RF-10), el resumen del ecosistema (RF-11), la localización `ruta:línea:columna` (RF-12) y la conservación de las últimas 20 resoluciones inmutables por proyecto (RF-17) completan las consultas. La fidelidad se contrasta con referencias nativas (RNF-02); los contratos publicados en `esquemas/salida/` conservan `esquema: 2` (RNF-08).

**Alcance y límites:** las vías remotas y administradas se declaran no observadas. RIGE no ejecuta OpenCode ni Git: descubre el worktree leyendo `.git`; sin repositorio válido usa `/`. `GIT_DIR`, `GIT_WORK_TREE`, `GIT_CEILING_DIRECTORIES` y `GIT_COMMON_DIR` definidas producen `via-no-soportada`. En Windows, las instalaciones por pnpm o bun pueden dar `version-no-determinada` con motivo `paquete-no-encontrado`; los directorios inaccesibles del `PATH` se omiten con advertencia `path-inaccesible` (ADR-106).

La detección ante `core.worktree` y `core.bare` es aproximada (ADR-101 W-B) y emite `deteccion-git-aproximada`. Con `core.worktree`, la decisión de RIGE puede diferir de la de OpenCode y el caso está caracterizado. T5-06c separa la declaración y la decisión en [sus pruebas](pruebas/aceptacion/T5-06c.test.ts), con referencias por plataforma para [core.worktree](pruebas/escenarios/v5-worktree-core.worktree/REFERENCIA.json), [core.bare](pruebas/escenarios/v5-worktree-core.bare/REFERENCIA.json) y el [control ordinario](pruebas/escenarios/v5-worktree-control-ordinario/REFERENCIA.json). Una captura ausente queda como `test.todo`.

Las capturas `win32-x64` de T5-06c muestran una divergencia con `core.worktree = ../proyecto`: con `read`, `*` → `deny` y `sub/a.txt` → `allow`, OpenCode evalúa `sub/a.txt` y permite; RIGE evalúa `proyecto/sub/a.txt` y deniega. La prueba «límite declarado de ADR-101 W-B: divergencia caracterizada» exige la declaración y ambas decisiones; falla si alguna cambia. El recuento RNF-02 informa ese límite por separado de las coincidencias nativas. El control ordinario y `core.bare = true` coinciden en `deny` para esa configuración. Las tres filas Linux carecen de captura y quedan como `test.todo` identificados para su captura por el ingeniero en el contenedor.

`OPENCODE_CONFIG_CONTENT` se analiza como JSONC y `OPENCODE_PERMISSION` como JSON estricto; su texto crudo no se emite ni se guarda. El resumen del conjunto incorpora su huella cuando constituyen entradas (ADR-104). `OPENCODE_CONFIG_DIR` agrega un directorio y exige una ruta absoluta canónica. El TOML legado `config`, las variables `OPENCODE_DISABLE_PROJECT_CONFIG`, `OPENCODE_TEST_HOME` y `OPENCODE_TEST_MANAGED_CONFIG_DIR`, y un `name:` en frontmatter Markdown producen `via-no-soportada`.

No se valida el frontmatter de Markdown ni se analiza su contenido como declaraciones de agentes o comandos. Las referencias por nombre se limitan a `default_agent` y `command.<nombre>.agent`; un agente existente pero oculto o subagente como `default_agent` queda fuera del detector. Si hay Markdown, referencias excluidas o sustituidas, no se evalúan elementos sin uso y se declara `elementos-sin-uso-no-evaluados`. Si una entrada impide cargar la configuración, los hallazgos se declaran parciales. Los hallazgos se calculan en vivo y no se guardan.

La inclusión de patrones `abarca` es conservadora: no detecta que `a?*` está incluido en `*?`. Solo compara reglas posteriores del mismo bloque y sujeto literal; las rutas absolutas sin efecto se diagnostican para `read` y `edit` dentro de la base efectiva. Una forma relativa se propone únicamente si confirma el efecto declarado en las cadenas completas afectadas (ADR-105).

Las sustituciones conservan plantilla, origen, condición y posición sobre el texto original; excluyen el contenido incorporado y su huella. Las reglas de permiso con sustituciones válidas quedan excluidas (`sustitucion-no-incorporada`); un `mode` sustituido excluye al agente. RIGE no lee `auth.json` ni las variables aportadas por `wellknown`. No analiza el eje `external_directory` completo, aprobaciones permanentes ni reglas adicionales de la sesión; lo declara en las respuestas.

Una variable ausente, vacía o definida solo por `wellknown` figura con `definido: false`. El SHA-256 de las referencias de sustituciones se calcula solo sobre datos de prueba con marcadores; el oráculo de sustituciones solo lo importan pruebas y `herramientas/`, fuera del flujo del producto. `OPENCODE_PERMISSION` con `null` o `[]` es legible y no aporta declaraciones.

## 3. Requisitos previos

Se requiere Git y uno de estos sistemas: Ubuntu (plataforma de referencia) o Windows 11.

Se instala Bun **1.3.14** exacto:

En Ubuntu, el instalador de Bun requiere `curl` y `unzip`, que una instalación limpia no incluye. Se instalan antes de Bun:

```bash
sudo apt-get update
sudo apt-get install -y curl unzip
```

**Ubuntu (Bash):**

```bash
curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.14"
```

**Windows 11 (PowerShell):**

```powershell
iex "& {$(irm https://bun.sh/install.ps1)} -Version 1.3.14"
```

Se abre una terminal nueva para disponer de Bun en `PATH` y se comprueba la versión:

```bash
bun --version
```

La salida esperada es `1.3.14`. TypeScript **7.0.2** y `@types/bun` **1.3.14** se instalan desde el lock en el paso siguiente, no a mano. SQLite **3.53.0**, integrado en Bun 1.3.14; no se requiere servidor externo ni conexiones de red durante la ejecución de RIGE.

Se comprueba la versión del motor:

```bash
bun -e "import { Database } from 'bun:sqlite'; console.log(new Database(':memory:').query('select sqlite_version() as v').get().v)"
```

La salida esperada es `3.53.0`.

## 4. Instalación

Con una cuenta sin privilegios administrativos, se clona el repositorio en una
carpeta del usuario, se entra en `src/` y se instalan las dependencias localmente.
Los comandos son iguales en Bash y PowerShell:

```bash
git clone https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP.git
cd RIGE-TIF-Sanchez-IngSistemas-UCP/src
git checkout v1
bun install --frozen-lockfile
```

La instalación termina con código 0. Todos los comandos siguientes se ejecutan desde `src/`.

## 5. Configuración

La copia de `rige.env.example` a `rige.env` es opcional. Sin `rige.env` se usan los valores por defecto, salvo las variables definidas en el entorno.

**Ubuntu (Bash):**

```bash
cp rige.env.example rige.env
```

**Windows 11 (PowerShell):**

```powershell
Copy-Item rige.env.example rige.env
```

La copia termina sin errores. Se edita `rige.env` si se necesitan valores locales:

| Variable | Significado | Valor por defecto |
|---|---|---|
| `RIGE_PUERTO` | Entero de 1 a 65535; puerto del servidor local | `4747` |
| `RIGE_ALMACEN` | **Directorio** del almacén, no archivo de la base; vacío selecciona la ubicación por defecto | Windows: `%LOCALAPPDATA%\rige`. Ubuntu: `$XDG_DATA_HOME/rige` si está definido, o `~/.local/share/rige` |

La prelación es: variable de entorno → `rige.env` → valor por defecto. El archivo solo admite esas dos claves; cualquier otra produce `configuracion-invalida`. No es un archivo `.env`: RIGE lo lee explícitamente y Bun no lo carga solo.

## 6. Ejecución y verificación

Todos los comandos se ejecutan desde `src/`. Para las verificaciones se aísla el almacén en un directorio temporal nuevo y se conserva esa variable en la misma terminal durante el recorrido y el reinicio del servidor.

**PowerShell:**

```powershell
$env:RIGE_ALMACEN = Join-Path ([System.IO.Path]::GetTempPath()) ('rige-verificacion-' + [Guid]::NewGuid())
```

**Bash:**

```bash
export RIGE_ALMACEN="$(mktemp -d)/almacen"
```

**Inicialización:**

```bash
bun run esquema
```

Termina con código 0 y JSON con `esquema: 2`, `versionRige: "0.1.0"`, `almacen.ruta` y `almacen.versionEsquema: 2`. Aplica `001_inicial.sql` y `002_formato2.sql` sobre una base vacía; repetirlo no cambia los datos. Otro esquema se rechaza con `almacen-sin-esquema`: no hay migración silenciosa. Las resoluciones nuevas usan `formato: 2`.

**CLI v2:**

```bash
bun run rige -- valores --proyecto <ruta> --agente <nombre> [--clave <ruta>] [--tiempos]
bun run rige -- permiso --proyecto <ruta> --agente <nombre> --herramienta <h> --objetivo <obj> [--explicar] [--tiempos]
bun run rige -- agentes --proyecto <ruta> [--tiempos]
bun run rige -- entradas --proyecto <ruta> [--tiempos]
bun run rige -- hallazgos --proyecto <ruta> [--explicar] [--tiempos]
```

Los marcadores entre `<…>` se reemplazan por valores propios; los corchetes indican opciones. Estas cinco consultas resuelven en memoria y no crean ni modifican el almacén. `valores` sin `--clave` consulta todas las claves; admite segmentos con puntos o puntero JSON (`/options/a.b`). Una clave ausente devuelve `valores: []`, `motivo: "clave-inexistente"` y código 0. `permiso` admite `--sujeto` en lugar de `--herramienta`, y `--lanzado-por <agente>` para contexto de subagente. Un comando compuesto devuelve `decision: null` con su motivo y código 0. `--explicar` presenta las mismas plantillas que la web para permisos y hallazgos; `valores --explicar` es inválido.

`agentes` incluye los ocultos, ordena nativos primero y luego por nombre; informa los eliminados por `disable` y la condición de listado incompleto por Markdown. `entradas` identifica vías, orden, legibilidad y consecuencias de errores, aun cuando una entrada impida resolver. `hallazgos` incluye resumen del ecosistema y seis tipos de hallazgo, con localización sobre el texto original (línea y columna desde 1, columna UTF-16).

Ejemplo ejecutable de la consulta de valores:

```bash
bun --silent run rige -- valores --proyecto pruebas/escenarios/v1-precedencia/proyecto --agente build --clave temperature
```

`--silent` evita la línea de comando que agrega Bun a stderr. La respuesta no contiene fecha, id ni historia y es idéntica ante entradas idénticas. Una versión distinta de OpenCode 1.18.25 produce `version-no-soportada`, salida vacía y código 1 (HTTP 422 en la web). Una versión indeterminada conserva el resultado y emite la advertencia estructurada `version-no-determinada`.

Con `--tiempos`, stdout conserva sus bytes y stderr agrega como última línea el JSON de `esquemas/salida/tiempos.json`: `arranqueMs` (ensamblado), `lecturaMs` (contexto, descubrimiento y lectura), `resolucionMs` (combinación y consulta), `salidaMs` (serialización y escritura) y `totalMs` (desde `ejecutarCli` hasta antes de emitir tiempos, incluidas advertencias). No incluye cargar Bun ni módulos. `esquema` y `servir` rechazan esa opción con código 2.

**Servidor web y recorrido del Instrumento 35:**

```bash
bun run servir
```

El proceso informa `{"esquema":2,"direccion":"http://127.0.0.1:4747"}` y queda escuchando. Se usa el puerto de `RIGE_PUERTO` si está configurado. La interfaz solo acepta GET local, verifica Host y rechaza `Sec-Fetch-Site: cross-site` y `same-site`, sin CORS ni JavaScript ejecutable en el cliente.

1. Abrir `http://127.0.0.1:4747/`. Debe mostrar «RIGE 0.1.0», la ruta del almacén y su esquema 2.
2. Completar **Proyecto** con `pruebas/escenarios/v1-precedencia/proyecto`, **Agente** con `build` y **Clave** con `temperature`. Pulsar «Resolver y guardar».
3. En un almacén nuevo, se llega a `/resoluciones/1?agente=build&clave=temperature`. El valor es `0.3`, declarado en `…/v1-precedencia/proyecto/opencode.jsonc:6:7 (proyecto)`. Las desplazadas son `0.1` en `…/v1-precedencia/opencode.json:5:7` y `0.2` en `…/v1-precedencia/proyecto/opencode.json:5:7`, en ese orden. Se presenta RD-01 y cada archivo leído con su SHA-256; vías remotas y preferencias de macOS aparecen no observadas. Las rutas completas usan `/`.
4. Detener con Ctrl+C, ejecutar otra vez `bun run servir` en la misma terminal y abrir la misma dirección. Debe recuperar los mismos datos con «Página armada con la resolución leída del almacén de RIGE.» y el enlace de historia de la resolución 1.
5. Volver al inicio y dejar **Clave** vacía: aparece una nueva resolución con `description`, `steps` y `temperature`. Los valores de referencia están en `pruebas/escenarios/v1-precedencia/REFERENCIA.json`.
6. Detener el servidor con Ctrl+C antes de continuar. Si ya había resoluciones, usar el id obtenido en el paso 3. La configuración global propia puede agregar entradas y modificar resultados: para la comprobación controlada se usa el arnés aislado siguiente.

La web recupera valores, agentes y permisos desde la resolución guardada con su contexto original; no relee entradas para esas consultas. Para observar cambios se crea otra resolución. `/entradas?proyecto=<ruta-codificada>` y `/hallazgos?proyecto=<ruta-codificada>` consultan las entradas actuales sin guardar. Cada página de consulta incluye el mismo objeto del caso de uso que la CLI como JSON no ejecutable, con `<` escapado.

**Verificación técnica:**

```bash
bun run verificar
bun test
bun run prueba:lenta
bun run medir:rnf07 --estricto
bun run cobertura
```

Todos deben terminar con código 0. La prueba unitaria optimizada de combinatoria `abarca`, ejecutada con `bun test paquetes/opencode/hallazgos.test.ts`, corre en menos de 500 ms; la suite completa no requiere prórrogas de timeout. Durante el desarrollo se usa `bun test <archivo>` para las pruebas afectadas.

El arnés RNF-07 copia `openchamber-doble` a un temporal (32 archivos, 12 agentes, 14 LSP y 20 comandos), aísla el entorno y ejecuta diez consultas de valores y diez de permiso en procesos nuevos. Informa mínimo, mediana y peor caso por etapa. `invocacionMs` mide el subproceso completo, incluido Bun; `--estricto` o `RNF07_ESTRICTO=1` exige un peor caso menor que 2000 ms. Sin la opción, `bun run medir:rnf07` es diagnóstico. La acreditación corresponde al contenedor Ubuntu 26.04 de referencia (ADR-054/055), con el escenario dentro de su sistema de archivos; Windows aporta diagnóstico.

### Verificación de RNF-06 (T4-02)

La instalación local usa `bun install --frozen-lockfile` sin privilegios administrativos, con Bun y el repositorio en el espacio del usuario. `bun test pruebas/aceptacion/RNF-06.test.ts` compara entradas y valores con rutas Linux/Windows, contrasta las referencias Windows y verifica scripts y almacenes propios. La simulación de rutas y Windows Server de CI no sustituyen la comprobación manual en Windows 11 exigida por ADR-054.

**Auditoría local de clonado limpio (PowerShell):**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File herramientas/auditoria-clonado.ps1
```

Clona la revisión confirmada de la rama local actual en un temporal, exige Bun 1.3.14, instala desde el lock, verifica tipos y construcción, copia `rige.env.example`, crea el esquema y ejecuta la prueba optimizada con límite de 500 ms. Aísla hogar, variables y almacén; antepone un paquete OpenCode 1.18.25 falso de prueba, sin ejecutarlo. Consulta `temperature` por CLI y comprueba HTTP 200 en un puerto libre. Detiene el servidor y borra sus temporales, normalizando antes los atributos de solo lectura. No incluye cambios sin commit; la autocomprobación por un tercero en otra máquina y la consulta de la etiqueta publicada y de GitHub Actions corresponden a la matriz del Instrumento 35.

**Referencias nativas:**

Con Node 22 y npm disponibles, se instala el paquete oficial y se compara sin regenerar capturas:

```bash
npm i -g opencode-ai@1.18.25
bun run referencias --raiz <dir-global-npm>
```

En Bash, la última línea es `bun run referencias --raiz "$(npm root -g)"`. En PowerShell:

```powershell
$raizNpm = npm.cmd root -g
bun run referencias --raiz $raizNpm
```

El arnés verifica versión y SHA-256 del binario, usa copias temporales aisladas y termina con código 0 si coinciden las referencias. En Windows acepta los binarios oficiales x64 y x64-baseline. Ejecuta OpenCode solo como oráculo de pruebas; RIGE no lo ejecuta durante el análisis. Para decisiones nativas, cobertura y reglas de regeneración/retiro (ADR-080), consultar [pruebas/README.md](pruebas/README.md).

Otras herramientas de comprobación:

```bash
bun run decisiones --raiz <dir-global-npm> --cache <directorio-temporal-externo>
bun run sin-red --salida <archivo-temporal>
bun run sin-red --comparar <archivo-temporal>
```

Los esquemas publicados generan los tipos de respuesta con `bun herramientas/tipos-salida.ts`. `decisiones` compara contra el binario oficial y puede instalar el proveedor auxiliar; es una herramienta de desarrollo. La comprobación Linux sin red y `--strace` se documentan en [herramientas/sin-red.md](herramientas/sin-red.md). Las pruebas automatizadas construyen su entorno desde cero, heredan solo PATH y SystemRoot y no leen la configuración real del usuario.

`decisiones` admite `--escenario <id>` repetible. Sin `--regenerar` compara; con esa opción reemplaza solo las capturas de la plataforma actual y conserva las demás. Para capturar T5-06c en PowerShell, con el paquete oficial ya instalado y su SDK integrado:

```powershell
$env:RIGE_ALMACEN = Join-Path ([IO.Path]::GetTempPath()) 'rige-T5-06-almacen'
$raizNpm = npm.cmd root -g
$cache = Join-Path ([IO.Path]::GetTempPath()) 'rige-decisiones-T5-06'
bun run decisiones --raiz $raizNpm --cache $cache --regenerar --escenario v5-worktree-control-ordinario --escenario v5-worktree-core.worktree --escenario v5-worktree-core.bare
bun run decisiones --raiz $raizNpm --cache $cache --escenario v5-worktree-control-ordinario --escenario v5-worktree-core.worktree --escenario v5-worktree-core.bare
```

Tras regenerar, se actualizan los SHA-256 de `REFERENCIA.json` en `pruebas/escenarios/MANIFIESTO.json`. La comparación del capturador comprueba la estabilidad del binario; `bun test pruebas/aceptacion/T5-06c.test.ts` contrasta las decisiones de RIGE. En Linux se usan los mismos selectores con `bun run decisiones --raiz "$(npm root -g)" --cache "${TMPDIR:-/tmp}/rige-decisiones-T5-06" --regenerar`, con `RIGE_ALMACEN` temporal. Las filas Linux de T5-06c quedan pendientes hasta obtener sus capturas.

| Código CLI | Situación | stdout | stderr |
|---|---|---|---|
| 0 | Respuesta válida, con o sin hallazgos o decisión | JSON | Advertencias si corresponden; tiempos si se solicitan |
| 1 | Error de uso o configuración | Vacío | JSON de error |
| 2 | Argumentos inválidos | Vacío | JSON `argumentos-invalidos` |
| 70 | Falla interna | Vacío | JSON `interno`; stack solo con `--depurar` |

Todos los errores declaran `esquema: 2`. Sin esquema, el servidor informa `almacen-sin-esquema` y pide `bun run esquema`; si el puerto está ocupado informa `puerto-ocupado`. La web usa HTTP 400 para solicitudes inválidas, 404 para proyecto, resolución o agente inexistente y 422 para configuración no soportada o ilegible. La versión de RIGE es `0.1.0`.

## 7. Estado del canal de construcción

El archivo `.github/workflows/ci.yml` ejecuta en cada push, sobre entornos limpios `ubuntu-26.04` y `windows-latest` con Bun 1.3.14, los pasos `bun install --frozen-lockfile`, `bun run verificar` y `bun test`.

Corrida local de referencia del 03/11/2026: `bun run verificar` terminó con código 0; `bun test` registró **1014 aprobadas, 2 omitidas y 0 fallidas**. Las omisiones corresponden a strace exclusivo de Linux y al enlace npm exclusivo de POSIX.

La batería de aceptación verifica el cumplimiento estricto de los criterios del catálogo:

- `pruebas/aceptacion/RF-01.test.ts`: Precedencia y resolución de entradas (CA-1, CA-2).
- `pruebas/aceptacion/recorrido-v1.test.ts`: Recorrido vertical completo de punta a punta (RF-01, RF-17, RNF-01 y RNF-09).
- `pruebas/aceptacion/RF-02.test.ts`, `RF-02-explicacion.test.ts`, `RF-02-CA-9.test.ts`: Evaluación determinista de permisos, explicaciones y resolución contextual de worktrees.
- `pruebas/aceptacion/RF-03.test.ts`: Consulta de valores efectivos y contratos JSON.
- `pruebas/aceptacion/RF-04.test.ts`: Descubrimiento de las 7 vías y diagnóstico de legibilidad.
- `pruebas/aceptacion/RF-05.test.ts`: Detección estricta de versión 1.18.25 y motivos indeterminados.
- `pruebas/aceptacion/RF-06.test.ts`: Modelado de agentes y valores implícitos.
- `pruebas/aceptacion/RF-07.test.ts`: Detección de las 6 causas de hallazgos sin falsos positivos.
- `pruebas/aceptacion/RF-08.test.ts`: Delimitación y lexer de comandos en herramientas de acción.
- `pruebas/aceptacion/RF-09.test.ts`: Detección de reglas nativas y protecciones anuladas.
- `pruebas/aceptacion/RF-10.test.ts`: Efecto de la decisión sobre la oferta de herramientas de acción.
- `pruebas/aceptacion/RF-11.test.ts`: Resumen del ecosistema y conteos de hallazgos.
- `pruebas/aceptacion/RF-12.test.ts`: Localización precisa (archivo, línea, columna) de declaraciones y hallazgos.
- `pruebas/aceptacion/RF-16.test.ts`: Listado de agentes del proyecto.
- `pruebas/aceptacion/RNF-02.test.ts`: Paridad con resultados oficiales de referencia.
- `pruebas/aceptacion/RNF-03.test.ts`: Independencia arquitectónica del núcleo respecto a adaptadores.
- `pruebas/aceptacion/RNF-04.test.ts`: Protección de secretos en sustituciones.
- `pruebas/aceptacion/RNF-05.test.ts`: Aislamiento sin red ni conexiones externas.
- `pruebas/aceptacion/RNF-06.test.ts`: Portabilidad Linux/Windows y ejecución sin privilegios de administración.
- `pruebas/aceptacion/RNF-07.test.ts`: Latencia y tiempos de respuesta por etapa.
- `pruebas/aceptacion/RNF-08.test.ts`: Compatibilidad y versionado de los esquemas de salida.
- `pruebas/aceptacion/RNF-09.test.ts`: Aislamiento de interfaz web local.
- `pruebas/aceptacion/RNF-10.test.ts`: Licencia MIT y atribución de evaluador incorporado.

También existen `arranque.test.ts`, `fusion-permisos.test.ts`, `T2-11b.test.ts` y `T2-12.test.ts` en `pruebas/aceptacion/`, que verifican arranque, composición de permisos y consultas guardadas con paridad CLI/web. El canal ejecuta además `bun run prueba:lenta`; su trabajo `referencia-nativa` compara las capturas con OpenCode 1.18.25 real en ambas plataformas.

El [registro de corridas](https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP/actions/workflows/ci.yml) permite consultar la ejecución en ambas plataformas. La primera corrida exitosa documentada es del **30/09/2026, 22:26 (UTC−3)**, commit `11c852e`: [corrida 36801042650](https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP/actions/runs/36801042650).

## 8. Declaración de herramientas auxiliares

| Período | Herramienta y modelo | Función | Artefacto afectado |
|---|---|---|---|
| 29/09/2026–30/09/2026 (T0-01 a T0-09) | OpenCode con gentle-ai 3.7; modelos `opencode-go/mimo-v2.6-pro` y `openai/gpt-6.1-sol` | Escritura del código y de las pruebas por delegación sobre el documento ODD | `src/` hasta el commit `a613de6`; `odd/tasks/inc0-esqueleto.md` |
| Desde el 30/09/2026 (T0-10 en adelante) | Codex (`gpt-6.1-sol`, plan ChatGPT Plus) como escritor, orquestado por Claude Code (`claude-opus-5-5`) | Escritura del código y de las pruebas sobre fichas del ingeniero; revisión por los subagentes `revisor-codigo` (Sonnet 5.5) y `critico-codigo` (Opus 5.5) | `src/` desde el commit `5ca3431`; este README |
| 05/10/2026 (prototipo v1, V1-01 a V1-09) | Codex (`gpt-6.1-sol`) como escritor, orquestado por Claude Code (`claude-opus-5-5`); revisión de conformidad por Codex (`gpt-6-luna`) y crítica por el subagente `critico-codigo` (Opus 5.5); OpenCode 1.18.25 (binario `opencode-windows-x64@1.18.25`) ejecutado una vez por el ingeniero para generar los resultados de referencia | Escritura, revisión y generación de referencias | `src/` desde el commit `1b684d5`; `pruebas/escenarios/*/REFERENCIA.json` |
| 13/10/2026 (V1-13) | Claude Code (`claude-opus-5-5`), por autorización expresa del autor como excepción a ADR-067 | Escritura del cambio y de sus pruebas sobre la ficha V1-13: aceptación de la variante baseline oficial del binario de OpenCode en Windows | `herramientas/referencias-nativas.ts`, `pruebas/arquitectura/referencias-nativas.test.ts`, este README |
| 03/11/2026 (Iteración 4: T4-01 a T4-04) | Codex (`gpt-6.1-sol`, plan ChatGPT Plus) como escritor de código y pruebas, orquestado y auditado por Antigravity (Gemini 2.5 Flash / Pro) y Claude Code (`claude-opus-5-5`); revisión cruzada por subagentes `revisor-codigo` (Sonnet 5.5) y `critico-codigo` (Opus 5.5) | Implementación de `--tiempos` y arnés estricto de latencia RNF-07; suite formal de aceptación de portabilidad RNF-06; optimización de prueba combinatoria `abarca` en `hallazgos.test.ts`; consolidación de `src/README.md` y auditoría de clonado limpio | `src/`, `esquemas/salida/tiempos.json`, `pruebas/aceptacion/RNF-06.test.ts`, `pruebas/aceptacion/RNF-07.test.ts`, `instrumentos/` |

El diseño, los requisitos y las decisiones (ADR) son del autor; las herramientas escriben y revisan código bajo esas decisiones.

Uso conforme al Protocolo de Uso Autorizado, en los períodos declarados en la tabla.

### Licencia del evaluador incorporado

RIGE incorpora las funciones puras del evaluador de permisos v1 y Wildcard de
OpenCode 1.18.25, Copyright (c) 2025 opencode, bajo licencia MIT. Se distribuyen
el texto completo en [LICENSE](paquetes/opencode/vendor/LICENSE) y el archivo de
[avisos](paquetes/opencode/vendor/AVISOS.md). La
[procedencia](paquetes/opencode/vendor/PROCEDENCIA.md) registra los orígenes,
los cambios de envoltorio y los SHA-256. Esta copia no es el oráculo de las
pruebas de aceptación.
