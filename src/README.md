# RIGE · 1.0.0

> Archivo de lectura exigido por la Guía de comprobación del prototipo v1 (`catedra/AE2-guia-comprobacion-v1.md`). La cátedra lo sigue al pie de la letra, sin suplir pasos.

## 1. Identificación

El despliegue de RIGE **1.0.0** (etiqueta prevista `v1.0.0`) se sigue en [MANUAL.md](MANUAL.md), con preparación aislada de datos y matriz de los 18 Must. Este README conserva sus ocho secciones y el antecedente del prototipo v1.

- **Proyecto:** RIGE — Proyecto Integrador Final 2026
- **Equipo:** Joaquín Sebastián Sánchez (autoría individual)
- **Comisión:** A · Sede Posadas
- **Actividad:** AE4 · etiqueta prevista `v1.0.0`; antecedente AE2 en `v1` (esqueleto arquitectónico ejecutable)

## 2. Qué hace este prototipo

Este prototipo implementa el caso de uso vertical de consulta del valor efectivo de una clave de configuración de un agente de OpenCode 1.18.25 y su procedencia detallada, atravesando desde la interfaz web hasta la persistencia y recuperación en base de datos local SQLite. Este recorrido prueba la decisión de arquitectura hexagonal (ADR-058, ADR-060, RNF-03) que desacopla estrictamente el núcleo genérico de resolución respecto del adaptador de la herramienta.

RIGE (Resolución e Inspección de Gobernanza Efectiva) es una plataforma local de solo lectura que analiza, resuelve y explica la configuración efectiva y la procedencia de políticas en herramientas de desarrollo basadas en agentes, circunscrita en esta versión congelada a **OpenCode 1.18.25** (ADR-054, ADR-102).

El prototipo implementa de manera completa los 14 requisitos funcionales comprometidos (11 Must y 3 Should) y los 10 requisitos no funcionales arquitectónicos (7 Must y 3 Should), satisfaciendo el 100 % de los 18 requisitos Must del producto mínimo viable (V.5):

1. **Resolución determinista de valores y procedencia (RF-01, RF-03, RD-01):** resuelve el valor efectivo de cualquier clave de configuración aplicando la regla de precedencia validada RD-01 (prevalece la declaración de la última entrada que define la clave). Cada valor resuelto informa su rastro exhaustivo: archivo de origen, línea, columna, tipo de entrada y lista cronológica de declaraciones desplazadas.
2. **Descubrimiento exhaustivo de vías de configuración (RF-04):** explora las ocho vías soportadas de OpenCode 1.18.25 (`global`, `variable-config`, `proyecto`, `directorio-opencode`, `markdown`, `variable-contenido`, `administrada` y `variable-permiso`), reportando resumen criptográfico SHA-256, condición de observación y diagnóstico sintáctico (identificando entradas legibles, ilegibles o descartadas). `entradas` agrega el mapa opcional `vias` con estado, cantidad de entradas y lugares revisados, incluidas las ausencias; conserva `esquema: 2`.
3. **Control estricto de versión del entorno (RF-05, ADR-102):** detecta la instalación activa de OpenCode en el sistema sin ejecutar su binario. Si la versión difiere de 1.18.25, rechaza la operación con código 1 (CLI) o HTTP 422 (Web). Si no puede determinarse de forma unívoca, emite advertencias estructuradas en JSON conservando los resultados analizados.
4. **Evaluación de permisos y reglas nativas (RF-02, RF-08, RF-09):** evalúa la cadena completa de permisos v1 mediante las funciones puras del evaluador nativo y Wildcard incorporadas bajo licencia MIT (RNF-10). Identifica la regla determinante, la posición en la cadena, los motivos ante consultas sin decisión (comandos compuestos de `bash`, rutas fuera del árbol) y advierte cuando una regla del usuario anula o flexibiliza una protección nativa incorporada.
5. **Modelado y listado de agentes (RF-06, RF-16, ADR-105):** cataloga todos los agentes del ecosistema (nativos y declarados en JSON), modelando sus modos de operación (`all`, `primary`, `subagent`), condiciones de visibilidad (`hidden`, `disable`) y valores implícitos de configuración. Conforme a ADR-105, los agentes definidos en Markdown se identifican con la limitación de contenido no observado (`cadena-incompleta`), evitando suposiciones sobre declaraciones inexistentes.
6. **Detección de 6 causas de hallazgos en vivo sin falsos positivos (RF-07, RE-01 a RE-04):** analiza en memoria configuraciones vigentes para identificar entradas ilegibles, entradas descartadas sin error visible, variables no definidas o vacías, referencias a agentes inexistentes o deshabilitados, reglas de permiso tapadas o sin efecto práctico (mediante inclusión formal con el algoritmo `abarca`), y subagentes sin uso.
7. **Diagnóstico de latencia por etapa (RNF-07, RF-12):** provee la opción `--tiempos` en la interfaz CLI estructurada v2, desglosando la latencia en milisegundos de reloj monotónico (`arranqueMs`, `lecturaMs`, `resolucionMs`, `salidaMs` y `totalMs`) conforme al contrato `esquemas/salida/tiempos.json`, verificado bajo arnés de latencia estricta (< 2000 ms en máquina de referencia).
8. **Aislamiento, portabilidad y persistencia local (RNF-01, RNF-04, RNF-05, RNF-06, RNF-09):** opera íntegramente fuera de línea, sin telemetría ni consumo de red. Sustituye variables y secretos de forma simbólica sin persistir ni exponer credenciales. Persiste las consultas en una base de datos SQLite propia con esquema v2 auditable, operando sin privilegios de administrador en Ubuntu 26.04 y Windows 11.
9. **Arquitectura hexagonal desacoplada (RNF-03, ADR-058, ADR-060):** desacopla estrictamente el núcleo genérico de resolución respecto de los adaptadores de herramientas específicas, permitiendo resolver adaptadores sintéticos sin alterar el motor de combinación.

La oferta de herramientas según la decisión (RF-10), el resumen del ecosistema (RF-11), la localización `ruta:línea:columna` (RF-12) y la conservación de las últimas 20 resoluciones inmutables por proyecto (RF-17) completan las consultas. La fidelidad se contrasta con referencias nativas (RNF-02); los contratos publicados en `esquemas/salida/` conservan `esquema: 2` (RNF-08).

**Alcance y límites:** se observa el directorio administrado (`ProgramData/opencode` en Windows, `/etc/opencode` en Linux y `/Library/Application Support/opencode` en macOS). Las vías `remota-wellknown`, `remota-organizacion` y `preferencias-macos` se declaran no observadas. RIGE no ejecuta OpenCode ni Git: descubre el worktree leyendo `.git`; sin repositorio válido usa `/`. `GIT_DIR`, `GIT_WORK_TREE`, `GIT_CEILING_DIRECTORIES` y `GIT_COMMON_DIR` definidas producen `via-no-soportada`. En Windows, las instalaciones por pnpm o bun pueden dar `version-no-determinada` con motivo `paquete-no-encontrado`; los directorios inaccesibles del `PATH` se omiten con advertencia `path-inaccesible` (ADR-106).

La detección ante `core.worktree` y `core.bare` es aproximada (ADR-101 W-B) y emite `deteccion-git-aproximada`. Con `core.worktree`, la decisión de RIGE puede diferir de la de OpenCode y el caso está caracterizado. T5-06c separa la declaración y la decisión en [sus pruebas](pruebas/aceptacion/T5-06c.test.ts), con referencias por plataforma para [core.worktree](pruebas/escenarios/v5-worktree-core.worktree/REFERENCIA.json), [core.bare](pruebas/escenarios/v5-worktree-core.bare/REFERENCIA.json) y el [control ordinario](pruebas/escenarios/v5-worktree-control-ordinario/REFERENCIA.json). Una captura ausente queda como `test.todo`.

Las capturas `win32-x64` y `linux-x64` de T5-06c muestran que, con `core.worktree = ../proyecto`, `read`, `*` → `deny` y `sub/a.txt` → `allow`, OpenCode evalúa `sub/a.txt` y permite. En Windows, RIGE evalúa `proyecto/sub/a.txt` y deniega. La prueba compara con RIGE en la plataforma ejecutada: si coincide, acredita coincidencia; si difiere, caracteriza el límite declarado de ADR-101 W-B y exige `deteccion-git-aproximada`. El recuento RNF-02 separa ese límite de las coincidencias nativas. Las capturas Linux se obtuvieron en Ubuntu 26.04 sobre `8620aff` y se incorporaron sin modificarlas ni reemplazar Windows (T5-06c-c1). Las comparaciones de otra plataforma se registran como pendientes de ejecución allí.

`OPENCODE_CONFIG_CONTENT` se analiza como JSONC y `OPENCODE_PERMISSION` como JSON estricto; su texto crudo no se emite ni se guarda. El resumen del conjunto incorpora su huella cuando constituyen entradas (ADR-104). `OPENCODE_CONFIG_DIR` agrega un directorio y exige una ruta absoluta canónica. El TOML legado `config`, las variables `OPENCODE_DISABLE_PROJECT_CONFIG`, `OPENCODE_TEST_HOME` y `OPENCODE_TEST_MANAGED_CONFIG_DIR`, y un `name:` en frontmatter Markdown producen `via-no-soportada`.

No se valida el frontmatter de Markdown ni se analiza su contenido como declaraciones de agentes o comandos. Las referencias por nombre se limitan a `default_agent` y `command.<nombre>.agent`; un agente existente pero oculto o subagente como `default_agent` queda fuera del detector. Si hay Markdown, referencias excluidas o sustituidas, no se evalúan elementos sin uso y se declara `elementos-sin-uso-no-evaluados`. Si una entrada impide cargar la configuración, los hallazgos se declaran parciales. Los hallazgos se calculan en vivo y no se guardan.

La inclusión de patrones `abarca` es conservadora: no detecta que `a?*` está incluido en `*?`. Solo compara reglas posteriores del mismo bloque y sujeto literal; las rutas absolutas sin efecto se diagnostican para `read` y `edit` dentro de la base efectiva. Una forma relativa se propone únicamente si confirma el efecto declarado en las cadenas completas afectadas (ADR-105); también se propone para patrones con comodín en el último segmento (`privado/*`), salvo que una regla posterior de efecto distinto pueda tapar parte del conjunto.

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
cd RIGE-TIF-Sanchez-IngSistemas-UCP
git checkout v1.0.0
cd src
bun install --frozen-lockfile
```

La instalación termina con código 0. Todos los comandos siguientes se ejecutan desde `src/`.

Para disponer además del comando `rige` desde cualquier carpeta, registrar esta instalación y agregar el directorio de binarios de Bun al `PATH` (`~/.bun/bin` o `%USERPROFILE%\.bun\bin`):

```bash
bun link
```

Desde la carpeta del proyecto se puede ejecutar `rige valores --agente build`. El comando enlazado lee el `rige.env` de esta instalación, no el de la carpeta actual. `bun run rige -- …` sigue disponible desde `src/`.

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

El texto de `reglas --todo` usa el mismo índice que su JSON, desde 1. Extracto de la cadena:

```text
Cadena completa:
#1 * * → permitida · OpenCode · general
```

Los límites y ejes son comunes solo cuando aparecen en todas las filas de la matriz. `comparar --agente` muestra el resumen de lo filtrado, como la web; el JSON conserva todos los agentes. Los orígenes nativos incluyen «OpenCode · denegación de subagente».

`entradas --todo --texto` agrega los lugares revisados de cada vía. Sus estados se leen como presente, ausente, no observada o no soportada. Los modos se presentan como Principal, Subagente y Principal y subagente.

`estado --texto` muestra siempre la ruta en uso. Si la base no existe, incluye `Existe: no`, `Versión de esquema: sin esquema` y la sugerencia `bun run rige -- esquema`, con código 0. Si existe sin esquema, muestra `Existe: sí`; en ambos casos el JSON informa `versionEsquema: null`. Con esquema válido, informa versión 2 y omite la sugerencia.

La CLI elige **texto breve con tablas** si stdout es una consola interactiva; en una **tubería** o redirección devuelve el **JSON completo** de siempre. `--json` y `--texto` fuerzan el formato y son excluyentes. Sin `--proyecto`, las consultas usan la **carpeta actual**, indicada en el encabezado textual; un argumento vacío sigue siendo inválido. `--todo` amplía `valores` (incluye valores de fábrica) y `reglas` (cadena completa); con JSON no cambia nada. `permiso --explicar` agrega la explicación y las reglas coincidentes. `comparar --agente` filtra solo el texto, conservando el JSON íntegro.

`rige --help`, `rige -h` y `rige <subcomando> --help` muestran uso, opciones y ejemplos sin abrir configuración ni almacén. `rige --version` informa ambas versiones; con `--json` devuelve un objeto esquema 2. `rige estado` consulta ruta, existencia y versión del almacén sin crear directorio/base ni modificar datos o esquema (puede haber auxiliares SQLite). Si falta o no tiene esquema, termina con código 0, muestra la ruta en uso y sugiere `bun run rige -- esquema`. En texto, los errores conservan sus códigos y se muestran por stderr; `--depurar` conserva el stack de fallas internas. `rige --help` lista también los códigos de salida 0, 1, 2 y 70. En consola (`--texto`), un subcomando u opción desconocidos sugieren el candidato cercano (`¿Quisiste decir valores?`), y en JSON el error no cambia.

El color ANSI solo se habilita en consola y si **NO_COLOR** no está definida; incluso `NO_COLOR=` lo deshabilita. Texto por tubería nunca lleva color. Las tablas separan columnas con espacios y subrayan sus encabezados atenuados. Solo la última columna variable se trunca con elipsis al ancho conocido (100 por defecto, mínimo 40); nombres y decisiones se conservan completos. Los párrafos se ajustan solo en espacios: una ruta o palabra larga va entera. Las ubicaciones se acortan a archivo y posición. El pie recuerda «Respuesta completa: --json».

En `permiso` y `reglas`, los avisos generales (aprobaciones permanentes, sesión no interactiva e índices de directorios externos) se leen con `--explicar`; las advertencias propias, rutas no resueltas y análisis incompletos siguen visibles. Para pedirlos por tubería: `rige reglas --agente build --explicar --texto`. La matriz agrupa, una sola vez: «external_directory: parcial en todos los agentes; no hay decisión sin un objetivo concreto». Los modos de agente son Principal, Subagente y Principal y subagente; «oculto» es una marca atenuada en la fila.

Ejemplo de `valores --agente build --clave temperature --texto` sobre `v1-precedencia` (desde otra carpeta, con proyecto explícito):

```text
Agente: build
Proyecto: proyecto
CLAVE        VALOR  ANTES  LO DETERMINA
-----------  -----  -----  -----------------------------
temperature  0.3    0.2    opencode.jsonc:6:7 (proyecto)
Respuesta completa: --json
```

ANTES contiene el valor breve de la última desplazada; `--todo` lista todas las desplazadas con su procedencia. LO DETERMINA contiene solo la determinante. En el mismo escenario, `permiso --agente build --sujeto read --objetivo .env --texto` muestra:

```text
? PREGUNTA ANTES
Agente: build
Proyecto: proyecto
Consulta: read · .env
Decide: #10 read *.env → pregunta · OpenCode · general
Desplaza: #9 read * → permitida · OpenCode · general
Respuesta completa: --json
```

Toda referencia a reglas parte de 1, igual que la explicación. Los orígenes nativos se resumen como «OpenCode · general», «OpenCode · agente» u «OpenCode · final». Las fechas de recientes y comparación usan hora local, por ejemplo `03/01/2020 18:05`. `estado` no incluye instante. Una comparación encabeza «Cambios entre 02/01/2020 11:14 y 03/01/2020 18:05», con ids entre paréntesis atenuados, resume las cifras en una línea y agrupa «Sin cambios en: compaction, explore, …». Los cambios usan CLAVE / ANTES / DESPUÉS / LO DETERMINA; el proyecto procede de la respuesta.

```bash
bun run rige -- --help
bun run rige -- --version --json
bun run rige -- estado --texto
```

Pruebas de esta interfaz (incluyen enlace aislado en Windows desde PowerShell y cmd):

```bash
bun test paquetes/rige/interfaces/cli/ejecutar.test.ts paquetes/rige/interfaces/cli/presentacion.test.ts paquetes/rige/interfaces/cli/texto/texto.test.ts pruebas/regresion/T5-23-json.test.ts pruebas/regresion/T5-23-uso.test.ts
bun test paquetes/rige/interfaces/cli/texto/presentacion-tablas.test.ts paquetes/rige/interfaces/cli/texto/estado-entradas-texto.test.ts
bun test pruebas/arquitectura/dependencias.test.ts pruebas/arquitectura/red.test.ts pruebas/arquitectura/sustituciones.test.ts pruebas/aceptacion/RNF-03.test.ts
```

La regresión conserva un bundle de referencia y su procedencia/SHA-256 en `pruebas/datos/cli-f085d3d.*`, para funcionar también con el checkout sin historial de CI. Si el commit está disponible, extrae además su árbol completo mediante `git archive --format=tar f085d3d` y `tar -xf <archivo> -C <temporal>`, copia la dependencia local exacta `jsonc-parser` 3.3.1 y enlaza exclusivamente los workspaces extraídos, sin red. Comprueba los bytes del bundle contra esa extracción y los del candidato contra la referencia. Las mismas rutas, entradas y semillas restauradas (ids/fechas fijos) se usan por par; no se normaliza nada. Incluye errores 1/2/70, advertencia, `servir` en puerto libre y contratos de tiempos/stack. Detalle, reproducción del bundle y tabla de precedencia: [pruebas/datos/T5-23.md](pruebas/datos/T5-23.md).

Para repetir la condición Windows de unidad alternativa (PowerShell; elegir una letra libre y un temporal 8.3 existente, nunca el almacén real):

```powershell
$env:RIGE_ALMACEN = Join-Path ([IO.Path]::GetTempPath()) 'rige-prueba-almacen'
subst R: <raíz-del-repositorio>
try {
  $env:TEMP = '<temporal-8.3>'
  $env:TMP = $env:TEMP
  Set-Location R:\src
  bun test
  bun run verificar
} finally { Set-Location <raíz-del-repositorio>\src; subst R: /d }
```

Recorrido final: **Inicio → resumen → agente → permiso / hallazgos**. En Inicio, los recientes son filas compactas con fecha y cantidad a la derecha, ruta con elipsis (completa en la ayuda) y **Analizar de nuevo**; en móvil se apilan. El campo muestra el ejemplo `C:\proyectos\mi-app` como marcador atenuado.

En **Permiso**, elegí agente, herramienta y **Acción u objetivo**, y pulsá **Consultar**. Las sugerencias de herramienta no son exhaustivas. **Opciones avanzadas** reúne los formularios independientes **Como subagente de…** y **Por sujeto**; cada envío usa solo herramienta o sujeto y solo el de subagente envía lanzador. Debajo quedan las consultas rápidas. El resultado destaca **Permitido**, **Pregunta antes** o **Denegado** y **Regla que decide**, con patrón, carácter y procedencia enlazada a VS Code. **Explicación completa** conserva todas las oraciones; **Ver reglas coincidentes (n)** pliega la cadena de esa consulta, con índices desde 1. La cadena completa está en **Todas las reglas**, después de la matriz, con límites comunes una sola vez. Un comando compuesto muestra Sin decisión y su motivo; una cadena incompleta conserva el error 422.

**Hallazgos** muestra **Estado actual de los archivos**, parcialidad y motivos, y tarjetas agrupadas por tipo con causa, ubicación enlazada y acción solo cuando se desprende del tipo. Las anclas del resumen corresponden al orden original del diagnóstico, no identifican un hallazgo entre análisis. **Comparar** titula con ambas fechas locales y muestra **Clave / Antes / Después**, con procedencias enlazadas y agentes sin cambios en una línea. **Entradas** ordena por precedencia (**la de abajo prevalece**) y agrupa el mapa en **Presentes**, **Ausentes** y **No observadas**, con lugares revisados plegados.

En **Entradas**, el mapa agrupa **Presentes**, **Ausentes** y **No observadas**, conservando el orden de revisión dentro de cada grupo. Los límites de la matriz completa se consultan en **Reglas**.

El encabezado del resumen reúne ruta, fecha y versión en una línea. Las cifras distinguen la foto guardada del **Estado actual**; **Foto guardada** y **Estado actual de los archivos** rotulan sus bloques. En el agente y en permiso, hallazgos, reglas y entradas, el selector compacto queda junto al título. En el agente, **Buscar clave** forma una barra con **Filtrar**. Primero aparecen las claves declaradas, en orden de clave; **Valores de fábrica (n)** agrupa al final los valores implícitos y nativos, cerrado. **¿Qué significa?** reúne las explicaciones de precedencia e implícitos. Las **Desplazadas** muestran valor tachado y ubicación en una línea, sin numeración. Los **Sujetos de permiso** forman una cuadrícula con efecto, índice de regla en la ayuda y una leyenda común para **parcial**. **Límites del análisis** reúne las restricciones. **Ver todas las reglas de <agente>**, **Consultar permiso** y **Ver hallazgos** son botones secundarios de tamaño menor que **Analizar** o **Consultar**. **Ver entradas actuales** queda en el resumen del proyecto, accesible por la miga. En el agente, el detalle de **Entradas leídas** de la foto se conserva dentro de **Ver en la consola**.

El aviso de agentes dice «Este proyecto no define agentes nuevos: usa los de OpenCode» solo con una lista completa, no vacía y sin agentes declarados. Hallazgos muestra cifras solo para tipos presentes; los demás van en una línea «Sin hallazgos de: …». Agentes, comandos y entradas se cuentan en una línea; un conteo desconocido dice «sin dato». En permiso, la frase de decisión enlaza al editor con el nombre corto del archivo y la ruta completa en la ayuda. La advertencia de protección nativa aparece destacada una vez; su texto equivalente se conserva en **Notas del análisis**, y las demás advertencias siguen visibles. **Ver la cadena completa en Todas las reglas** es un botón secundario junto a **Ver reglas coincidentes**.

**Lo determina** muestra vía y ubicación; los archivos locales con posición enlazan a **VS Code**, con la ruta completa en la ayuda. Variables, referencias remotas y rutas relativas quedan como texto.

El resumen usa el nombre del proyecto y fecha local absoluta. Si no se puede obtener el sobre porque no hay agentes o sus valores no son consultables, abre los demás bloques con «Fecha no disponible» y «Historial no disponible para este análisis» atenuados; la cifra de análisis dice «sin dato» y se omiten enlaces de historial y comparación. Una lista vacía dice «Sin agentes activos» y conserva los eliminados. El aviso sobre agentes de fábrica solo aparece con lista completa, no vacía y sin declarados. «Sin hallazgos» verde requiere análisis completo; en caso parcial se muestran los motivos.

La web usa superficies blancas sobre fondo neutro claro, tema oscuro carbón automático y un acento índigo. La tipografía del sistema parte de 16 px; las tablas pasan a tarjetas en móvil. El encabezado muestra **RIGE** y migas de proyecto, agente y vista. El pie dice «Local · solo lectura · sin red · RIGE 1.0.0».

Inicio pregunta «¿Qué configuración rige en este proyecto?», pide **Carpeta del proyecto** y ofrece **Analizar**. Toda la tarjeta de **Proyectos recientes** abre la última foto; **Analizar de nuevo** relee las entradas. Las fotos se nombran «proyecto · fecha», con fecha local absoluta `dd/mm/aaaa hh:mm` en las vistas guardadas para que el HTML siga estable al reiniciar. Si una consulta de Agentes, Permisos o Reglas no puede obtener el sobre por valores pendientes o sin declaraciones, conserva su respuesta y avisa **Fecha no disponible** sin inventar metadatos; en Permisos y Reglas se conserva también el código técnico. Solo Inicio usa «hoy hh:mm» o «ayer hh:mm»; para otras fechas usa la absoluta. Los identificadores quedan en las direcciones y en el JSON. La ayuda larga está en **¿Qué significa?**, cerrado. Un proyecto inexistente sugiere revisar que la ruta corresponda a esta máquina. Los rechazos de origen o método no muestran migas, ruta ni versión; los errores internos mantienen un mensaje fijo.


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
bun run rige -- reglas --proyecto <ruta> --agente <nombre> [--lanzado-por <agente>] [--tiempos]
bun run rige -- agentes --proyecto <ruta> [--tiempos]
bun run rige -- entradas --proyecto <ruta> [--tiempos]
bun run rige -- hallazgos --proyecto <ruta> [--explicar] [--tiempos]
```

Los marcadores entre `<…>` se reemplazan por valores propios; los corchetes indican opciones. Estas seis consultas resuelven en memoria y no crean ni modifican el almacén. `valores` sin `--clave` consulta todas las claves; admite segmentos con puntos o puntero JSON (`/options/a.b`). Una clave ausente devuelve `valores: []`, `motivo: "clave-inexistente"` y código 0. `permiso` admite `--sujeto` en lugar de `--herramienta`, y `--lanzado-por <agente>` para contexto de subagente. Un comando compuesto devuelve `decision: null` con su motivo y código 0. `--explicar` presenta las mismas plantillas que la web para permisos y hallazgos; `valores --explicar` es inválido.

`agentes` incluye los ocultos, ordena nativos primero y luego por nombre; informa los eliminados por `disable` y la condición de listado incompleto por Markdown. `entradas` identifica vías, orden, legibilidad y consecuencias de errores, aun cuando una entrada impida resolver. `hallazgos` incluye resumen del ecosistema y seis tipos de hallazgo, con localización sobre el texto original (línea y columna desde 1, columna UTF-16).

`reglas` es una **capacidad adicional (ADR-111, T5-13)**, fuera de los 18 Must: publica la cadena completa y la matriz de agentes activos en `esquemas/salida/reglas.json`. Considera solo patrones literales `*` para el efecto general por sujeto y conserva los comodines de sujeto del evaluador. Las reglas por patrón pueden cambiar ese efecto para una acción concreta: usar `permiso`. `external_directory` es parcial, sin decisión general: muestra **parcial** con su leyenda debajo de la matriz; una cadena incompleta conserva su error. `--explicar` amplía el texto y se ignora en JSON. La web ofrece `/reglas?id=<id>&agente=<nombre>[&lanzadoPor=<agente>]` desde **Permisos**, sobre la foto guardada; la CLI consulta las entradas actuales sin abrir el almacén.

| Verificación | Ejecución | Resultado |
|---|---|---|
| Capacidad adicional · cadena y matriz | `bun herramientas/demostracion.ts v2-decision -- reglas --agente build` | Cadena en orden, índices desde 1 y matriz con prevalencia por sujeto; no agrega un Must |
| Capacidad adicional · comparación y recientes | `bun run rige -- comparar --desde <id1> --hasta <id2>`; `bun run rige -- recientes` | Fotos del mismo proyecto, cambios y procedencias; Proyectos recientes en Inicio; fuera de los Must y de la medición ADR-098 |

`comparar` y `recientes` leen solo el almacén indicado por `RIGE_ALMACEN`; no lo crean ni releen las entradas. Requieren `bun run esquema`. `/comparar?desde=<id1>&hasta=<id2>[&agente=<nombre>]` comparte el JSON íntegro con la CLI (`esquema: 2`). `--agente <nombre>` conserva ese objeto en CLI; en web filtra la presentación y sus conteos. Desde Valores, **Comparar con la anterior** y **comparar con esta** fijan la dirección temporal. Inicio lista hasta diez proyectos con su última foto, cantidad retenida y **Analizar de nuevo**, que usa el recorrido existente de resolver y guardar. Las rutas no resueltas producen comparación parcial; sustituciones solo por representación protegida, sin afirmar igualdad de contenido. Cadenas de permisos fuera de alcance. Detalles y errores en MANUAL §6 y §8.

En **Comparar**, el resumen destaca las cantidades con insignias y las fotos **Antes** y **Después** muestran fecha local absoluta. Los agentes sin diferencias se reúnen en **Sin cambios:**; los demás mantienen su sección. El filtro de agente usa pestañas con desplazamiento propio. Las columnas **Antes → Después** se apilan en móvil. La clave se lee como `a › b`; el arreglo literal queda en su `title`.

En **Proyectos recientes**, toda la tarjeta abre la última foto; **Analizar de nuevo** es el enlace secundario. El nombre destacado es el último segmento de la ruta, que aparece debajo. «Último análisis: hoy 10:42 · 3 análisis guardados» resume la actividad. Sin proyectos, una línea invita a ingresar la carpeta y pulsar Analizar. La ayuda está en el plegable cerrado **¿Qué significa?**.

```bash
bun test pruebas/regresion/T5-14.test.ts paquetes/rige/aplicacion/casos-uso/comparar-resoluciones.test.ts paquetes/rige/adaptadores/almacen-sqlite/resoluciones.test.ts
bun test ./paquetes/rige/interfaces/web/estilos.test.ts
bun test ./paquetes/rige/interfaces/web/recorrido-proyecto.test.ts
bun test ./paquetes/rige/interfaces/web/paginas/permiso.test.ts
bun test ./paquetes/rige/interfaces/web/panel.test.ts ./paquetes/rige/interfaces/web/diseno.test.ts
bun test pruebas/aceptacion/recorrido-v1.test.ts pruebas/regresion/T5-13-web.test.ts
bun test
bun run verificar
```

Para el pulido T5-20, `bun test ./paquetes/rige/interfaces/web/paginas/resolucion.test.ts` comprueba U-1 a U-12; agregar `-t U-7`, por ejemplo, selecciona una regla. Para revisar la presentación en navegador, recorrer Inicio, resumen, agente, formulario y resultado de permiso, hallazgos, reglas, comparar, entradas y errores: emular `prefers-color-scheme: light` y `dark`, a 1440 y 360 px, con los plegables cerrados y abiertos. Comprobar contraste AA, foco y ausencia de desbordamiento.

Durante TDD, `bun test ./paquetes/rige/interfaces/web/` corre solo las pruebas web; `bun test ./paquetes/rige/interfaces/web/panel.test.ts -t T5-17` filtra las de nombres y fechas. Las pruebas de aceptación que leen el HTML conservan las comprobaciones de paridad y seguridad.

Pruebas de T5-21 (F-1 a F-7), con `RIGE_ALMACEN` temporal: `bun test ./paquetes/rige/interfaces/web/paginas/resumen-proyecto.test.ts`.

Comprobación de Windows con unidad alternativa y TEMP/TMP en nombre corto 8.3 (PowerShell, desde `src/`; `R:` debe estar libre):

```powershell
$rigeRaiz = (Resolve-Path ..).Path
$rigeTemporal = [System.IO.Path]::GetTempPath()
$rigeCorto = cmd /c "for %I in (`"$rigeTemporal`") do @echo %~sI"
$rigeTempAnterior = $env:TEMP
$rigeTmpAnterior = $env:TMP
$rigeAlmacenAnterior = $env:RIGE_ALMACEN
subst R: $rigeRaiz
try {
  $env:TEMP = $rigeCorto.Trim()
  $env:TMP = $rigeCorto.Trim()
  $env:RIGE_ALMACEN = Join-Path $env:TEMP 'rige-prueba-t521'
  Push-Location R:\src
  try {
    bun test
    if ($LASTEXITCODE -ne 0) { throw 'Fallo bun test' }
    bun run verificar
    if ($LASTEXITCODE -ne 0) { throw 'Fallo verificar' }
  } finally { Pop-Location }
} finally {
  $env:TEMP = $rigeTempAnterior
  $env:TMP = $rigeTmpAnterior
  $env:RIGE_ALMACEN = $rigeAlmacenAnterior
  subst R: /d
}
```

Para reproducir un temporal 8.3 concreto, asignar a `$rigeCorto` la ruta corta del temporal que se quiera reproducir antes de `subst`. Las rutas esperadas de pruebas se construyen con `realpathSync.native`, porque la ruta recibida puede usar nombres cortos.

Regresión de textos y maquetación (T5-22, B-1 a B-6 y M-1 a M-6), con `RIGE_ALMACEN` temporal:

```bash
bun test paquetes/rige/interfaces/web/estilos.test.ts
```

La prueba comprueba el HTML y las reglas CSS; la medición geométrica a 360–1920 px queda a cargo del ingeniero con Chrome.

Pruebas del pulido de presentación (Z-1 a Z-11), con `RIGE_ALMACEN` temporal:

```bash
bun test paquetes/rige/interfaces/web/panel.test.ts
bun test pruebas/regresion/T5-13-web.test.ts pruebas/regresion/T5-13-cli.test.ts pruebas/regresion/T5-14.test.ts
```

Pruebas auxiliares de la capacidad (sin CA nuevos del catálogo):

```bash
bun test pruebas/regresion/T5-13.test.ts pruebas/regresion/T5-13-cli.test.ts pruebas/regresion/T5-13-web.test.ts
```

Ejemplo ejecutable de la consulta de valores:

```bash
bun --silent run rige -- valores --proyecto pruebas/escenarios/v1-precedencia/proyecto --agente build --clave temperature
```

`--silent` evita la línea de comando que agrega Bun a stderr. La respuesta no contiene fecha, id ni historia y es idéntica ante entradas idénticas. Una versión distinta de OpenCode 1.18.25 produce `version-no-soportada`, salida vacía y código 1 (HTTP 422 en la web). Una versión indeterminada conserva el resultado y emite la advertencia estructurada `version-no-determinada`.

Con `--tiempos`, stdout conserva sus bytes y stderr agrega como última línea el JSON de `esquemas/salida/tiempos.json`: `arranqueMs` (ensamblado), `lecturaMs` (contexto, descubrimiento y lectura), `resolucionMs` (combinación y consulta), `salidaMs` (serialización y escritura) y `totalMs` (desde `ejecutarCli` hasta antes de emitir tiempos, incluidas advertencias). No incluye cargar Bun ni módulos. `esquema` y `servir` rechazan esa opción con código 2.

**Servidor web y recorrido del Instrumento 35:**

En **Todas las reglas**, por debajo de 700 px la matriz muestra una tarjeta por agente con sus sujetos e insignias sin partir; en escritorio mantiene columnas con ancho mínimo y desplazamiento dentro del contenedor. **Regla N** queda en la ayuda de la insignia. La cadena reserva espacio para el sujeto y corta patrones de ruta largos. Las procedencias nativas se abrevian **OpenCode · general**, **OpenCode · agente** y **OpenCode · final**; su explicación completa queda en la ayuda. Los ejes parciales comunes se indican una vez como **Todos los agentes:** y cada agente conserva sus diferencias y errores.

El resumen ofrece **Analizar de nuevo** junto a los metadatos: un enlace GET a `/resolver?proyecto=…`. En recientes, la ruta con elipsis ocupa el espacio libre y la acción tiene su lugar. Los valores de texto largo se cortan dentro de su celda; el mapa de vías separa los encabezados de grupo en móvil y **Herramienta** queda encima del campo.

```bash
bun run servir
```

El proceso informa `{"esquema":2,"direccion":"http://127.0.0.1:4747"}` y queda escuchando. Se usa el puerto de `RIGE_PUERTO` si está configurado. La interfaz solo acepta GET local, verifica Host y rechaza `Sec-Fetch-Site: cross-site` y `same-site`, sin CORS ni JavaScript ejecutable en el cliente.

1. Abrir `http://127.0.0.1:4747/`. Se muestra «RIGE» y «¿Qué configuración rige en este proyecto?». El inicio pide solo **Carpeta del proyecto** y ofrece **Analizar**; el pie dice «Local · solo lectura · sin red» y muestra la versión.
2. Completar **Carpeta del proyecto** con `pruebas/escenarios/v1-precedencia/proyecto` y pulsar **Analizar**. Se guarda el proyecto entero y se abre `/resoluciones/<id>`. Se abre el **Resumen del proyecto**, incluso sin agentes activos; elegir un nombre abre su página.
3. En el **Resumen del proyecto**, abrir **build**, escribir `temperature` en **Buscar clave** y pulsar **Filtrar**. En un almacén nuevo, la URL es `/resoluciones/1/agentes/build?q=temperature`. Se ve `0.3`, declarado en `…/v1-precedencia/proyecto/opencode.jsonc:6:7 (proyecto)`. Las desplazadas son `0.1` en `…/v1-precedencia/opencode.json:5:7` y `0.2` en `…/v1-precedencia/proyecto/opencode.json:5:7`, en ese orden. **¿Qué significa?** presenta RD-01 sobre la tabla; los implícitos explican RD-04. Las entradas leídas mantienen su SHA-256 y las vías remotas figuran no observadas.
4. Guardar la URL, detener con Ctrl+C, ejecutar otra vez `bun run servir` y abrirla: recupera la foto del almacén. En el resumen, **Historial** marca la foto consultada y conserva las veinte últimas.
5. **Quitar filtro** muestra todas las claves. El selector permite cambiar de agente conservando el contexto. La consulta exacta sigue en CLI, mediante `--clave`; las URL anteriores redirigen a la vista equivalente.

La página del agente conserva selector y contexto de búsqueda. Debajo de sus valores muestra la fila de **Sujetos de permiso**, su efecto general, parcialidad y límites. Cada celda abre el formulario con ese sujeto precargado y objetivo vacío; hay que completar la acción para consultar. **Ver todas las reglas de <agente>** abre la cadena y la matriz completas en `/reglas`.

El **Resumen del proyecto** (`/resoluciones/<id>`) presenta cifras, agentes de la foto, hallazgos actuales y **Archivos y cambios**. **Archivos leídos** y **Historial** son plegables cerrados. Los archivos se ordenan por precedencia: la de abajo prevalece. El mapa permanece dentro del plegable. Archivos y hallazgos indican «Estado actual de los archivos»: pueden cambiar aunque la foto sea la misma. Las variables y las vías no observadas quedan fuera del conteo de archivos; una legibilidad desconocida dice «sin dato».

**Permisos** abre `/resoluciones/<id>/permisos?agente=…`, reúne formularios y consultas rápidas, y no inventa JSON de una consulta. El selector cambia de agente dentro del formulario; en un resultado de permiso vuelve al formulario sin repetir herramienta, objetivo o lanzador. Los resultados siguen en `/permiso` con sus migas de pan y decisión destacada y toda la **Cadena efectiva**. **Claves no incorporadas por RIGE** sigue plegable en Valores; **Entradas leídas** queda dentro de **Ver en la consola**.

Cada resultado ofrece **Ver en la consola**, plegable, con comandos citados para Bash y PowerShell 7.3+ y esta aclaración: «No recupera esta foto; coincide si las entradas y el contexto no cambiaron». Permiso siempre incluye `--explicar`; `q` solo afecta la presentación web. Los comandos largos desplazan dentro de sus contenedores. Hasta 640 px, las tablas de valores, detalle de hallazgos, cadena de permiso y entradas pasan a tarjetas con etiquetas, conservando contenido y orden. El tema sigue al sistema, sin JavaScript ni recursos externos.

Cada página de resultado incluye exactamente el objeto del caso de uso como JSON no ejecutable, con `<` escapado. Las rutas destacan archivo y posición y conservan la ruta completa en `title`; la determinante no repite el valor y las desplazadas conservan su orden. Las reglas adicionales tienen su código y plantilla en la procedencia de la fila. Para la revisión en navegador, comprobar temas, contraste, foco y ancho de 360 px, y conservar capturas.

### Demostración aislada

```bash
bun herramientas/demostracion.ts v1-precedencia -- valores --agente build --clave temperature
bun herramientas/demostracion.ts v1-precedencia --preparar
bun herramientas/demostracion.ts --desde "<RAIZ>" -- servir
bun herramientas/demostracion.ts --desde "<RAIZ>" --puerto 4848 -- servir
```

Sustituir `<RAIZ>` por `raiz` del JSON de preparación. `--preparar` conserva escenario y almacén en un temporal para el reinicio; las consultas de una sola ejecución se limpian. Se carga el hogar, variables y topología Git de `REFERENCIA.json`, se reemplazan los marcadores de raíz y se antepone una instalación ficticia 1.18.25 que nunca se ejecuta. Solo se heredan PATH y SystemRoot. Git debe estar en PATH. Para RF-05 agregar `--version 1.18.24` antes de `--`; para otro puerto agregar `--puerto 4848`. La CLI no guarda resoluciones; se cargan con «Analizar» en la web. La matriz y los campos exactos del humo están en MANUAL §8.

```bash
bun run verificar
bun test
bun run prueba:lenta
bun run medir:rnf07 --estricto
bun run cobertura
```

Todos deben terminar con código 0. La prueba unitaria optimizada de combinatoria `abarca`, ejecutada con `bun test paquetes/opencode/hallazgos.test.ts`, corre en menos de 500 ms; la suite completa no requiere prórrogas de timeout. Durante el desarrollo se usa `bun test <archivo>` para las pruebas afectadas o el ciclo rápido por paquetes (la suite completa `bun test` y `bun run verificar` siguen siendo obligatorios al final):

```bash
bun run prueba:rapida
```

El grupo de web y aceptación se ejecuta con `bun test paquetes/rige/interfaces/web pruebas/aceptacion`.

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

Tras regenerar, se actualizan los SHA-256 de `REFERENCIA.json` en `pruebas/escenarios/MANIFIESTO.json`. La comparación del capturador comprueba la estabilidad del binario; `bun test pruebas/aceptacion/T5-06c.test.ts` contrasta las decisiones de RIGE. En Linux se usan los mismos selectores con `bun run decisiones --raiz "$(npm root -g)" --cache "${TMPDIR:-/tmp}/rige-decisiones-T5-06" --regenerar`, con `RIGE_ALMACEN` temporal. Las tres capturas Linux se incorporaron en T5-06c-c1.

| Código CLI | Situación | stdout | stderr |
|---|---|---|---|
| 0 | Respuesta válida, con o sin hallazgos o decisión | JSON | Advertencias si corresponden; tiempos si se solicitan |
| 1 | Error de uso o configuración | Vacío | JSON de error |
| 2 | Argumentos inválidos | Vacío | JSON `argumentos-invalidos` |
| 3 | Hallazgos detectados con `--estricto` | JSON | Advertencias si corresponden; tiempos si se solicitan |
| 70 | Falla interna | Vacío | JSON `interno`; stack solo con `--depurar` |

Todos los errores declaran `esquema: 2`. Sin esquema, el servidor informa `almacen-sin-esquema` y pide `bun run esquema`; si el puerto está ocupado informa `puerto-ocupado`. La web usa HTTP 400 para solicitudes inválidas, 404 para proyecto, resolución o agente inexistente y 422 para configuración no soportada o ilegible. La versión de RIGE es `1.0.0`.

## 7. Estado del canal de construcción

El archivo `.github/workflows/ci.yml` ejecuta en cada push, sobre entornos limpios `ubuntu-26.04` y `windows-latest` con Bun 1.3.14, los pasos `bun install --frozen-lockfile`, `bun run verificar` y `bun test`.

Última verificación del 10/11/2026, RIGE **1.0.0**: `bun run verificar` terminó con código 0; `bun test` registró en Windows **1364 aprobadas, 2 omitidas, 15 pendientes y 0 fallidas** y en Ubuntu **1358 aprobadas**. Las omisiones corresponden a strace exclusivo de Linux y al enlace npm exclusivo de POSIX. Las pendientes son comparaciones que requieren ejecución en la otra plataforma. El recuento no sustituye la corrida Ubuntu ni acredita un CI remoto nuevo; comprobar el commit del candidato en el enlace del canal.

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
- `pruebas/aceptacion/RF-17.test.ts`: Persistencia inmutable de resoluciones y retención de las últimas 20 (CA-1 a CA-3).
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

Las filas siguientes trasladan solo usos respaldados por la declaración de la bitácora (../00-gestion/bitacora.md). Sustituyen atribuciones anteriores que aún no estaban conciliadas.

| Fecha | Herramienta | Para qué | Pieza, archivo o commit | Verificación posterior |
|---|---|---|---|---|
| 13/11 | Claude Fable 5.2 (subagentes de Claude Code), como crítico | Tres pasadas de crítica externa de `src/` sin ADR (CLI, web y diseño interno): 50 hallazgos, con experimentos contra el binario 1.18.25 | Informe en el chat; fichas T6-01 a T6-20 en `.trabajo/fichas/mejoras/` (material descartable) | Cada hallazgo de fidelidad se reprodujo con el binario; NUC-13 se refutó con el binario y se retiró |
| 13/11 | Claude Code (`claude-opus-5-5`), como ingeniero | Consolidación de los hallazgos, fichas T6-01 a T6-20, ADR-115 y ADR-116 propuestos, modificación de ADR-113, verificaciones con el binario (P-5, normalización por sujeto, NUC-13), recaptura de instantáneas y revisión de los diff | `00-gestion/decisiones/`, `.trabajo/fichas/mejoras/`, `pruebas/datos/*.json` | Instantáneas recapturadas solo tras comprobar que ningún caso JSON cambió; las 37 referencias nativas en `ok` |
| 13/11 | Antigravity CLI `agy` (Gemini 4 Hydrogen High), como revisor | Pre-crítica de las fichas T6-01 a T6-20 contra el código | Informe descartable en el chat | Unos 25 bloqueantes incorporados a la sección 9 de cada ficha |
| 13/11 | Antigravity CLI `agy` (Gemini 4 Hydrogen, esfuerzos bajo a extra alto), como escritor | T6-01 a T6-19: fidelidad con OpenCode, escenarios `v6-*`, vocabulario y roles, procedencia, color, paleta, ayuda, errores, navegación y accesibilidad web, `--estricto` e historial, limpieza interna | `src/` [AUTOR: hash de los commits] | Pruebas y `verificar` corridos por Claude Code tras cada ficha; suite completa en Windows y en Ubuntu |
| 13/11 | Antigravity CLI `agy` (Gemini 3.8 Flash), como escritor | T6-20: actualización de README y MANUAL con las mejoras de fidelidad, CLI y web, y declaración de IA al día | `src/README.md`, `src/MANUAL.md` | Revisión del diff y verificación de cadenas por Claude Code |
| 12/11 | Antigravity CLI `agy` 1.5.6 (Gemini 4 Argon High), como escritor | T5-26-c1: README sin el bloque de pruebas de la ficha y nombre del archivo del almacén en una constante del adaptador; solo edición de archivos (el modo sin interfaz no habilitó comandos de git) | `90fb7cd` (commit del autor) | Cambios revisados por Claude Code; misma verificación de T5-26 |
| 12/11 | Antigravity CLI `agy` 1.5.6 (Gemini 4 Argon High), como escritor | T5-27: títulos de pruebas vigentes tras el rediseño y prueba byte a byte L-2 con un solo camino (ejecutable congelado); solo edición de archivos | [AUTOR: hash del commit de T5-27] (commit del autor) | Diff revisado por Claude Code; Windows 1490 aprobadas en `R:` con TEMP 8.3; Ubuntu 1483 |
| 12/11 | Claude Code (Claude Opus 5.5), ingeniero | Propuesta del refactor de `src/`, fichas T5-28 a T5-36 y MED-20, revisión de cada diff, regeneración de la referencia nativa de `v5-ruta-absoluta-tapada` con el binario sobre una copia, corridas de la suite en Windows y en Ubuntu (Docker) | `.trabajo/fichas/`, ADR-098 puntos 47 a 49, esta entrada | Suite y `verificar` en las dos plataformas en cada ficha; texto congelado validado contra el renderizador previo |
| 12/11 | Claude Code, subagentes `critico-codigo` y `revisor-codigo` | Inventario de diseño de `src/`, pre-críticas de MED-20, T5-28 y T5-30, crítica de T5-28 y revisión de cierre | Fichas corregidas y T5-28-c1 | Cada hallazgo, contrastado por Claude Code con el código |
| 12/11 | Antigravity CLI `agy` (Gemini 4 Argon High), como escritor | T5-28: forma relativa con comodín final, hasta agotar su cuota | `paquetes/opencode/hallazgos.ts`, escenario `v5-ruta-absoluta-tapada` | Pruebas corridas por Claude Code (EPERM del sandbox) |
| 12/11 | Antigravity CLI `agy` (Gemini 3.8 Flash), como escritor | MED-20, T5-29, T5-28-c1, T5-30 a T5-34 | Arnés de la medición y `src/` | Diff revisado y suites corridas por Claude Code |
| 12/11 | Antigravity CLI `agy` (Gemini 4 Hydrogen High), como escritor | T5-34-c1, T5-35, correcciones de cierre y T5-36 | `src/` | Diff revisado y suites corridas por Claude Code |
| 11/11 | Claude Code (`claude-opus-5-5`) | Análisis de la maqueta v0, verificación de agentes con el binario, ADR-113 propuesto, fichas T5-17 a T5-21, revisión de los diff, capturas en ambos temas y a 360 px, proyecto de prueba y ejemplos de demostración fuera del repositorio, y esta entrada | `00-gestion/decisiones/ADR-113-interfaz-web-recorrido-maqueta.md`, `.trabajo/fichas/cierre/`, `bitacora.md` | [AUTOR: lectura y corrección; aceptar o rechazar ADR-113] |
| 11/11 | Claude Code (`claude-opus-5-5`) | Auditoría automática de maquetación (CDP, 205 páginas), prueba de la CLI subcomando por subcomando, ADR-114 propuesto y fichas T5-22 a T5-24 | `00-gestion/decisiones/ADR-114-cli-salida-legible.md`, `.trabajo/fichas/cierre/` | [AUTOR: aceptar o rechazar ADR-114] |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como revisor | Pre-crítica de las fichas T5-17 a T5-19 | `.trabajo/fichas/cierre/precriticas/T5-17-19.json` (material descartable) | Diez precisiones incorporadas a las fichas por Claude Code |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como revisor | Pre-crítica de la ficha T5-23, con la verificación en el código de OpenCode 1.18.25 de que su herramienta `bash` no usa pseudoterminal | `.trabajo/fichas/cierre/precriticas/T5-23.json` (material descartable) | Nueve precisiones incorporadas por Claude Code; evidencia citada en ADR-114 |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-17: sistema visual, esqueleto, nombres de las resoluciones, inicio y errores (ADR-113) | `564eb00` | 1376 aprobadas en ambas condiciones; capturas revisadas por Claude Code |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-18: resumen del proyecto y página del agente (ADR-113) | `b8d97db` | 1391 aprobadas en ambas condiciones; aserciones de aceptación revisadas por Claude Code |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-19: permiso, hallazgos y vistas secundarias (ADR-113) | `991d43e` | 1400 aprobadas en ambas condiciones; capturas revisadas por Claude Code |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-20: pulido del recorrido nuevo (ADR-113) | `e5fa774` | 1412 aprobadas en ambas condiciones; capturas en tema claro y oscuro revisadas por Claude Code |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo medio), como escritor | T5-21: últimos ajustes del recorrido (ADR-113) | `785af26` | 1420 aprobadas en `R:` con TEMP 8.3; Ubuntu 1414; referencias nativas en ok; capturas revisadas por Claude Code |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-22: textos encimados y mejoras de uso de la web (ADR-113) | `f085d3d` | 1432 aprobadas en ambas condiciones; auditoría automática de Claude Code con Chrome sobre 205 páginas en siete anchos y capturas de los casos dudosos |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-23: CLI con texto legible en consola y JSON intacto por tubería, `--help`, `--version`, `estado`, carpeta actual por defecto y comando instalable (ADR-114) | `382c737` | 1458 aprobadas en ambas condiciones; comparación byte a byte contra `f085d3d` |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-24: pulido de la salida de texto de la CLI (numeración desde 1, avisos generales a `--explicar`, tablas alineadas, fechas legibles y ayuda por subcomando; ADR-114) | `29cfbb6` | 1470 aprobadas en ambas condiciones; prueba byte a byte del JSON sin cambios; salida revisada por Claude Code subcomando por subcomando |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo medio), como escritor | T5-24-c1: etiquetas de procedencia que no se parten en el texto de la CLI, falla detectada solo en Ubuntu | `4aa5e02` | Windows 1472 aprobadas en ambas condiciones; Ubuntu 26.04 en Docker 1465; referencias nativas en ok sobre `29cfbb6` |
| 11/11 | Codex (`gpt-6.1-sol`, esfuerzo medio), como escritor | T5-25: declaración al día en README §8 y MANUAL §11, aviso de `reglas` sin repetir y ayuda alineada | commit de esta ficha | [completa Claude Code tras la verificación] |
| 10/11 | Claude Code (`claude-opus-5-5`) | Fichas T5-10 a T5-15, ADR-112 propuesto, lanzamiento de las pre-críticas y del escritor, revisión de los diff, corridas de pruebas en Windows y Ubuntu, capturas de escritorio y móvil, demostración local y esta entrada | `.trabajo/fichas/cierre/`, `00-gestion/decisiones/ADR-112-comparar-resoluciones-recientes.md`, `bitacora.md` | [AUTOR: lectura y corrección; aceptar o rechazar ADR-111 y ADR-112] |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como revisor | Pre-críticas de las fichas T5-11 a T5-14 | `.trabajo/fichas/cierre/precriticas/` (material descartable) | Precisiones incorporadas a las fichas por Claude Code |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-10: responsive sin desbordamiento horizontal | `6eef1f4` | Windows 1281 aprobadas; emulación móvil a 360 px sin desbordamiento |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-11: panel único del proyecto (pestañas, selector, buscador, regla en una línea, comando equivalente) | `41b215c` | Windows 1296 aprobadas en `R:` con TEMP 8.3; capturas revisadas por Claude Code |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | Corrección del tiempo límite de la prueba de RNF-05 con `strace` (T5-05-c1) | `4118a09` | Ubuntu sin fallas |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-12: mapa completo de vías (ADR-111, propuesto) y corrección por TEMP 8.3 | `cc36c18`, `87c2eda` | Referencias nativas en ok en Windows y Linux |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-13: consulta `reglas` y matriz de permisos (ADR-111, propuesto) y corrección de la falla interna con `R:` | `fafbb28`, `d814418` | Windows 1331 aprobadas; Ubuntu 1325 |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-14: comparar resoluciones y proyectos recientes, en la web y en la CLI (ADR-112, propuesto) | `8136e4e` | Windows 1351 aprobadas en `R:` con TEMP 8.3; Ubuntu 1345; referencias nativas en ok; capturas revisadas por Claude Code |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-15: pulido visual final de la interfaz (un solo campo de clave visible, orden del panel, insignias, matriz, mapa de vías agrupado, comparación y plurales) | `641d220` | Windows 1364 aprobadas en `R:` con TEMP 8.3; Ubuntu 1358; capturas de escritorio y emulación móvil a 360 px sin desbordamiento, revisadas por Claude Code |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo medio), como escritor | T5-16: traslado de las filas del 10/11 a README §8 y MANUAL §11, y README sin referencias a roles del proceso | `d9324ef` | 1364 aprobadas; diff revisado por Claude Code. Esta fila se traslada en la próxima sincronización |
| 09/11 | Claude Code (`claude-opus-5-5`) | Resumen de `src/`, planteo de las decisiones de PIL-B, fichas T5-02 a T5-07 y del redactor, registro de D-75 a D-77 y R-17 a R-19, revisión de los diff, corridas de pruebas y esta entrada | `.trabajo/fichas/cierre/`, `00-gestion/anexo-III.md`, `registro-cambios-referente.md`, `pendientes.md`, `bitacora.md` | Pruebas en Windows (local y `R:` con TEMP 8.3) y en Ubuntu 26.04 en Docker. [AUTOR: lectura y corrección] |
| 09/11 | Claude Code (`claude-opus-5-5`) | Captura de diez salidas de RIGE en `ee7cbf5`, ejecutado desde un temporal | `src/pruebas/datos/salidas-ee7cbf5.json` (incorporado por el escritor en `99f8762`) | Esquema 2 en las diez y sin rutas locales; copia idéntica comprobada con `cmp` |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo alto) | Pre-crítica de las fichas T5-02 a T5-07, solo lectura | Fichas de `.trabajo/fichas/cierre/` | Hallazgos aplicados por Claude Code; un bloqueante de T5-02 descartado con evidencia |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo medio), como escritor | T5-02: conductas de RF-03, RF-05 y RF-07 | `d0ec131` | 1042 aprobadas, 2 omitidas; también en `R:` con TEMP 8.3; diff revisado por Claude Code |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-03: oráculos de RNF-08, RNF-04, RF-07, RF-01, RF-11 y RF-12 | `99f8762` | 1074 aprobadas, 2 omitidas, en ambas condiciones; cobertura sin errores |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-04: declaración de oráculos y cobertura de 24 requisitos y 70 CA; corrección por ruta 8.3 | `d29069b`, `acf8793` | 1085 aprobadas, 2 omitidas, en ambas condiciones |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-05: recuento de RNF-05, política de `strace` y paso de CI | `2882354` | Windows 1185 aprobadas; Ubuntu en Docker con `strace` y `CI=true` 1179 aprobadas y 6 pendientes de captura Linux |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-06a: arnés de decisiones nativas por plataforma, modelo y topología Git | `7f0fe72` | Windows 1196 aprobadas; `referencias` contra el binario real en ok; Ubuntu 1190 aprobadas |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-06b: matriz del árbol de trabajo, con captura del binario OpenCode 1.18.25 en win32-x64 | `e2e00f2` | 12 capturas coincidentes con RIGE; 1224 aprobadas en ambas condiciones de Windows |
| 09/11 | Claude Code (`claude-opus-5-5`) | Captura de las decisiones linux-x64 de T5-06b y T5-06c en el contenedor `rige-medicion:congelada` (OpenCode 1.18.25, hash `d91e0d33…`) sobre copias de `src/` | `.trabajo/fichas/cierre/datos/`; incorporadas por el escritor en `30f8408` y siguiente | Capturas de Windows conservadas; sin rutas del contenedor; suite en Ubuntu sin fallas |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | Incorporación de las capturas linux-x64 (T5-06b-c1) y caracterización de `core.worktree` y `core.bare` (T5-06c) | `30f8408`, `8620aff` | 1233 aprobadas en Windows; divergencia de `core.worktree` fijada como límite de ADR-101 por decisión de Claude Code con delegación del autor |
| 05/11 | Codex (`gpt-6.1-sol`, esfuerzo medio), como escritor | Modo `--escala` de la medición (T5-01) | `c9b6746` | 1021 pruebas aprobadas, 2 omitidas; `verificar` en verde, según su informe; diff revisado por Claude Code; corrida en contenedor |
| 03/11 | Codex (`gpt-6.1-sol`) y Gemini en Antigravity [AUTOR: modelo] | T3-06 a T3-11, TDD en dos modelos | `6f98774`, `f5905c0`, `ce83d8a`, `28eb7ad`, `0fc2b0e`, `32c6e79` | Revisor conforme; crítico sin bloqueantes; CI `41720793417` |
| 03/11 | [AUTOR: herramienta y modelo] | T3-12 y T4-01 a T4-04 | `893a309`, `5735544`, `4ab181a`, `5efb7b3`, `5dfa325` | 1014 pruebas; CI `41743284212` y `41743288096` |
| 30/10 | Codex (`gpt-6.1-sol`) con respaldo de Claude | T2-19 y T3-01 a T3-05 | `8862069`, `5007e4c`, `bf1daae`, `f4629c5`, `ac89ccf`, `03e02cd`, `a436ac0`, `59f18f4`, `77bd4d0`, `a8f3e64` | Suites y revisores en `.trabajo/fichas/it3/INDICE.md` |
| 25/10 | Codex (`gpt-6.1-sol`), orquestado por Claude Code | T2-01 a T2-18 | `197fc08` a `3ae11e1` | CI sobre `be010cf`; [AUTOR: revisión del diff] |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | Incorporación de las capturas linux-x64 de `core.worktree` y `core.bare` (T5-06c-c1) | `340d095` | Capturas tomadas por Claude Code en el contenedor; copias idénticas; Ubuntu 1234 aprobadas, 0 fallidas |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-08: diseño visual y de uso de la interfaz web (ADR-110, propuesto) y corrección de lectura de rutas, reglas y hallazgos | `ab65bd9`, `c82a749` | Windows 1266 aprobadas en ambas condiciones; Ubuntu 1260; revisión visual de Claude Code con capturas de Chrome en tema claro y oscuro y a 390 px. [AUTOR: recorrido de la interfaz] |
| 09/11 | Claude Code (`claude-opus-5-5`) | ADR-110 propuesto, ficha T5-08, revisión visual con capturas y demostración en Docker con un reenvío de puerto en el temporal de la sesión (fuera del repositorio) | `00-gestion/decisiones/ADR-110-interfaz-web-diseno-estilos.md`, `.trabajo/fichas/cierre/T5-08.md` | [AUTOR: aceptar o rechazar ADR-110] |
| 09/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-07: versión 1.0.0, manual de despliegue (`src/MANUAL.md`), `rige.env.example`, utilidad de demostración y README | `c54067a` | Windows 1240 aprobadas en ambas condiciones; Ubuntu con `strace` y `CI=true` 1234 aprobadas; prueba de humo del manual seguida por Claude Code sobre una copia limpia con `git archive`: código 0, `0.3` en `opencode.jsonc:6:7` y desplazadas `0.1` y `0.2`. [AUTOR: lectura del manual] |

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
