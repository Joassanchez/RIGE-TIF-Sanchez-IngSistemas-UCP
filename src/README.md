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
cd RIGE-TIF-Sanchez-IngSistemas-UCP
git checkout v1.0.0
cd src
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

En **Entradas**, el mapa agrupa **Presentes**, **Ausentes** y **No observadas**, conservando el orden de revisión dentro de cada grupo. Los límites de la matriz completa se consultan en **Reglas**.

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

`reglas` es una **capacidad adicional (ADR-111, T5-13)**, fuera de los 18 Must: publica la cadena completa y la matriz de agentes activos en `esquemas/salida/reglas.json`. Considera solo patrones literales `*` para el efecto general por sujeto y conserva los comodines de sujeto del evaluador. Las reglas por patrón pueden cambiar ese efecto para una acción concreta: usar `permiso`. `external_directory` es parcial, sin decisión general: muestra **parcial** con su leyenda debajo de la matriz; una cadena incompleta conserva su error. No admite `--explicar` (código 2). La web ofrece `/reglas?id=<id>&agente=<nombre>[&lanzadoPor=<agente>]` desde **Permisos**, sobre la foto guardada; la CLI consulta las entradas actuales sin abrir el almacén.

| Verificación | Ejecución | Resultado |
|---|---|---|
| Capacidad adicional · cadena y matriz | `bun herramientas/demostracion.ts v2-decision -- reglas --agente build` | Cadena en orden, índices desde 1 y matriz con prevalencia por sujeto; no agrega un Must |
| Capacidad adicional · comparación y recientes | `bun run rige -- comparar --desde <id1> --hasta <id2>`; `bun run rige -- recientes` | Fotos del mismo proyecto, cambios y procedencias; Proyectos recientes en Inicio; fuera de los Must y de la medición ADR-098 |

`comparar` y `recientes` leen solo el almacén indicado por `RIGE_ALMACEN`; no lo crean ni releen las entradas. Requieren `bun run esquema`. `/comparar?desde=<id1>&hasta=<id2>[&agente=<nombre>]` comparte el JSON íntegro con la CLI (`esquema: 2`). `--agente <nombre>` conserva ese objeto en CLI; en web filtra la presentación y sus conteos. Desde Valores, **Comparar con la anterior** y **comparar con esta** fijan la dirección temporal. Inicio lista hasta diez proyectos con su última foto, cantidad retenida y **Analizar de nuevo**, que usa el recorrido existente de resolver y guardar. Las rutas no resueltas producen comparación parcial; sustituciones solo por representación protegida, sin afirmar igualdad de contenido. Cadenas de permisos fuera de alcance. Detalles y errores en MANUAL §6 y §8.

En **Comparar**, el resumen destaca las cantidades con insignias y las fotos **Antes** y **Después** muestran fecha local absoluta. Los agentes sin diferencias se reúnen en **Sin cambios:**; los demás mantienen su sección. El filtro de agente usa pestañas con desplazamiento propio. Las columnas **Antes → Después** se apilan en móvil. La clave se lee como `a › b`; el arreglo literal queda en su `title`.

En **Proyectos recientes**, toda la tarjeta abre la última foto; **Analizar de nuevo** es el enlace secundario. El nombre destacado es el último segmento de la ruta, que aparece debajo. «Último análisis: hoy 10:42 · 3 análisis guardados» resume la actividad. Sin proyectos, una línea invita a ingresar la carpeta y pulsar Analizar. La ayuda está en el plegable cerrado **¿Qué significa?**.

```bash
bun test pruebas/aceptacion/T5-14.test.ts paquetes/rige/aplicacion/casos-uso/comparar-resoluciones.test.ts paquetes/rige/adaptadores/almacen-sqlite/resoluciones.test.ts
bun test ./paquetes/rige/interfaces/web/sistema-visual.test.ts
bun test ./paquetes/rige/interfaces/web/recorrido-proyecto.test.ts
bun test ./paquetes/rige/interfaces/web/panel.test.ts ./paquetes/rige/interfaces/web/diseno.test.ts
bun test pruebas/aceptacion/recorrido-v1.test.ts pruebas/aceptacion/T5-13-web.test.ts
bun test
bun run verificar
```

Durante TDD, `bun test ./paquetes/rige/interfaces/web/` corre solo las pruebas web; `bun test ./paquetes/rige/interfaces/web/panel.test.ts -t T5-17` filtra las de nombres y fechas. Las pruebas de aceptación que leen el HTML conservan las comprobaciones de paridad y seguridad.

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
  $env:RIGE_ALMACEN = Join-Path $env:TEMP 'rige-prueba-t515'
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

Pruebas del pulido de presentación (Z-1 a Z-11), con `RIGE_ALMACEN` temporal:

```bash
bun test paquetes/rige/interfaces/web/pulido.test.ts
bun test pruebas/aceptacion/T5-13-web.test.ts pruebas/aceptacion/T5-13-cli.test.ts pruebas/aceptacion/T5-14.test.ts
```

Pruebas auxiliares de la capacidad (sin CA nuevos del catálogo):

```bash
bun test pruebas/aceptacion/T5-13.test.ts pruebas/aceptacion/T5-13-cli.test.ts pruebas/aceptacion/T5-13-web.test.ts
```

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

1. Abrir `http://127.0.0.1:4747/`. Se muestra «RIGE» y «¿Qué configuración rige en este proyecto?». El inicio pide solo **Carpeta del proyecto** y ofrece **Analizar**; el pie dice «Local · solo lectura · sin red» y muestra la versión.
2. Completar **Carpeta del proyecto** con `pruebas/escenarios/v1-precedencia/proyecto` y pulsar **Analizar**. Se guarda el proyecto entero y se abre `/resoluciones/<id>`. Se abre el **Resumen del proyecto**, incluso sin agentes activos; elegir un nombre abre su página.
3. En el **Resumen del proyecto**, abrir **build**, escribir `temperature` en **Buscar clave** y pulsar **Filtrar**. En un almacén nuevo, la URL es `/resoluciones/1/agentes/build?q=temperature`. Se ve `0.3`, declarado en `…/v1-precedencia/proyecto/opencode.jsonc:6:7 (proyecto)`. Las desplazadas son `0.1` en `…/v1-precedencia/opencode.json:5:7` y `0.2` en `…/v1-precedencia/proyecto/opencode.json:5:7`, en ese orden. **Cómo se decide** presenta RD-01 sobre la tabla; los implícitos explican RD-04. Las entradas leídas mantienen su SHA-256 y las vías remotas figuran no observadas.
4. Guardar la URL, detener con Ctrl+C, ejecutar otra vez `bun run servir` y abrirla: recupera la foto del almacén. En el resumen, **Historial** marca la foto consultada y conserva las veinte últimas.
5. **Quitar filtro** muestra todas las claves. El selector permite cambiar de agente conservando el contexto. La consulta exacta sigue en CLI, mediante `--clave`; las URL anteriores redirigen a la vista equivalente.

La página del agente conserva selector y contexto de búsqueda. Debajo de sus valores muestra la fila de **Sujetos de permiso**, su efecto general, parcialidad y límites. Cada celda abre el formulario con ese sujeto precargado y objetivo vacío; hay que completar la acción para consultar. **Ver todas las reglas de <agente>** abre la cadena y la matriz completas en `/reglas`.

El **Resumen del proyecto** (`/resoluciones/<id>`) presenta cifras, agentes de la foto, hallazgos actuales y **Archivos y cambios**. **Archivos leídos** y **Historial** son plegables cerrados. Los archivos se ordenan por precedencia: la de abajo prevalece. El mapa permanece dentro del plegable. Archivos y hallazgos indican «Estado actual de los archivos»: pueden cambiar aunque la foto sea la misma. Las variables y las vías no observadas quedan fuera del conteo de archivos; una legibilidad desconocida dice «sin dato».

**Permisos** abre `/resoluciones/<id>/permisos?agente=…`, reúne formularios y consultas rápidas, y no inventa JSON de una consulta. El selector cambia de agente dentro del formulario; en un resultado de permiso vuelve al formulario sin repetir herramienta, objetivo o lanzador. Los resultados siguen en `/permiso` con sus migas de pan y decisión destacada y toda la **Cadena efectiva**. **Entradas leídas** y **Claves no incorporadas por RIGE** siguen plegables en Valores.

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

Todos deben terminar con código 0. La prueba unitaria optimizada de combinatoria `abarca`, ejecutada con `bun test paquetes/opencode/hallazgos.test.ts`, corre en menos de 500 ms; la suite completa no requiere prórrogas de timeout. Durante el desarrollo se usa `bun test <archivo>` para las pruebas afectadas. El grupo de web y aceptación se ejecuta con `bun test paquetes/rige/interfaces/web pruebas/aceptacion`.

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
| 10/11 | Claude Code (`claude-opus-5-5`) | Fichas T5-10 a T5-15, ADR-112 propuesto, lanzamiento de las pre-críticas y del escritor, revisión de los diff, corridas de pruebas en Windows y Ubuntu, capturas de escritorio y móvil, demostración local y esta entrada | `.trabajo/fichas/cierre/`, `00-gestion/decisiones/ADR-112-comparar-resoluciones-recientes.md`, `bitacora.md` | [AUTOR: lectura y corrección; aceptar o rechazar ADR-111 y ADR-112] |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como revisor | Pre-críticas de las fichas T5-11 a T5-14 | `.trabajo/fichas/cierre/precriticas/` (material descartable) | Precisiones incorporadas a las fichas por Claude Code |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-10: responsive sin desbordamiento horizontal | `6eef1f4` | Windows 1281 aprobadas; emulación móvil a 360 px sin desbordamiento |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-11: panel único del proyecto (pestañas, selector, buscador, regla en una línea, comando equivalente) | `41b215c` | Windows 1296 aprobadas en `R:` con TEMP 8.3; capturas revisadas por Claude Code |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | Corrección del tiempo límite de la prueba de RNF-05 con `strace` (T5-05-c1) | `4118a09` | Ubuntu sin fallas |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-12: mapa completo de vías (ADR-111, propuesto) y corrección por TEMP 8.3 | `cc36c18`, `87c2eda` | Referencias nativas en ok en Windows y Linux |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-13: consulta `reglas` y matriz de permisos (ADR-111, propuesto) y corrección de la falla interna con `R:` | `fafbb28`, `d814418` | Windows 1331 aprobadas; Ubuntu 1325 |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-14: comparar resoluciones y proyectos recientes, en la web y en la CLI (ADR-112, propuesto) | `8136e4e` | Windows 1351 aprobadas en `R:` con TEMP 8.3; Ubuntu 1345; referencias nativas en ok; capturas revisadas por Claude Code |
| 10/11 | Codex (`gpt-6.1-sol`, esfuerzo alto), como escritor | T5-15: pulido visual final de la interfaz (un solo campo de clave visible, orden del panel, insignias, matriz, mapa de vías agrupado, comparación y plurales) | `641d220` | Windows 1364 aprobadas en `R:` con TEMP 8.3; Ubuntu 1358; capturas de escritorio y emulación móvil a 360 px sin desbordamiento, revisadas por Claude Code |
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
