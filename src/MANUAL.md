# Manual de despliegue de RIGE

## 1. Propósito y versión

RIGE resuelve y explica la configuración efectiva y su procedencia para **OpenCode 1.18.25**. Es local y de solo lectura sobre las entradas: únicamente guarda resoluciones en su almacén SQLite propio. Esta entrega declara RIGE **1.0.0**, etiqueta prevista **`v1.0.0`**. La etiqueta la publica el autor después de revisar el candidato; este manual no acredita su publicación.

## 2. Requisitos previos

Plataformas: **Windows 11** y **Ubuntu 26.04**, esta última de referencia. Runtime: **Bun 1.3.14**. Desarrollo: **TypeScript 7.0.2** y **`@types/bun` 1.3.14**, instalados por `bun install` desde el lock. Motor: **SQLite 3.53.0**, incorporado en Bun, sin servidor de base de datos externo.

Instalar Git y mantenerlo en `PATH`: RIGE busca su ejecutable y descubre el árbol leyendo `.git`, sin ejecutar Git. Su ausencia cambia el descubrimiento y declara `git-no-encontrado`. La instalación de OpenCode 1.18.25 es opcional para usar las referencias nativas; las demostraciones siguientes anteponen una instalación ficticia identificada como tal, que RIGE solo lee y nunca ejecuta. Sin OpenCode detectable, el producto advierte `version-no-determinada`.

En Ubuntu, instalar antes `curl` y `unzip`:

```bash
sudo apt-get update
sudo apt-get install -y curl unzip git
curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.14"
```

En Windows 11, instalar Git para Windows y Bun en el espacio del usuario, desde PowerShell:

```powershell
iex "& {$(irm https://bun.sh/install.ps1)} -Version 1.3.14"
```

Abrir una terminal nueva y comprobar:

```bash
git --version
bun --version
bun -e "import { Database } from 'bun:sqlite'; console.log(new Database(':memory:').query('select sqlite_version() as v').get().v)"
```

Se espera una versión de Git instalada, `1.3.14` y `3.53.0`, respectivamente. La instalación necesita Internet; el análisis de RIGE no.

## 3. Obtención del código

Desde una carpeta del usuario, en Bash o PowerShell:

```bash
git clone https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP.git
cd RIGE-TIF-Sanchez-IngSistemas-UCP
git checkout v1.0.0
cd src
bun install --frozen-lockfile
```

Cada comando termina con código **0**. Si la etiqueta aún no existe, el candidato no está publicado: no sustituirla por otra revisión para acreditar la entrega. Los pasos restantes parten de `src/`.

## 4. Configuración

Copiar `rige.env.example` a `rige.env`:

```bash
cp rige.env.example rige.env
```

En PowerShell:

```powershell
Copy-Item rige.env.example rige.env
```

Solo `RIGE_PUERTO` y `RIGE_ALMACEN` son asignaciones admitidas en ese archivo; otra clave da `configuracion-invalida`. Los demás ejemplos permanecen **comentados** y, si hacen falta, se establecen en la consola. No crear `.env`. La precedencia de la configuración propia es **entorno → `rige.env` → valores predeterminados** (un valor vacío permite pasar al nivel siguiente). No se admiten comillas en los valores del archivo.

| Variable | Significado y lugar de configuración | Ejemplo |
|---|---|---|
| `RIGE_PUERTO` | Archivo o consola; entero 1–65535, predeterminado 4747 | `4747` |
| `RIGE_ALMACEN` | Archivo o consola; directorio, no archivo. Vacío: LOCALAPPDATA/rige en Windows; XDG_DATA_HOME/rige o HOME/.local/share/rige en Linux | `/tmp/rige-demo/almacen` |
| `HOME` | Consola; hogar Linux | `/tmp/rige-demo/hogar` |
| `USERPROFILE` | Consola; hogar Windows | `C:/Temp/rige-demo/hogar` |
| `LOCALAPPDATA` | Consola; base predeterminada del almacén Windows | `C:/Temp/rige-demo/datos` |
| `XDG_CONFIG_HOME` | Consola; base de configuración global, alternativa HOME/.config | `/tmp/rige-demo/hogar/.config` |
| `XDG_DATA_HOME` | Consola; datos y base del almacén Linux | `/tmp/rige-demo/datos` |
| `TEMP` | Consola; primera ubicación temporal Windows, alternativa Linux | `C:/Temp/rige-demo/tmp` |
| `TMP` | Consola; ubicación temporal alternativa | `/tmp/rige-demo/tmp` |
| `TMPDIR` | Consola; primera ubicación temporal Linux | `/tmp/rige-demo/tmp` |
| `SystemRoot` | Consola; sistema Windows y alternativa de temporales | `C:/Windows` |
| `PATH` | Consola; búsqueda de Git y del primer OpenCode | `/usr/bin` |
| `Path` | Consola; variante Windows si PATH no existe | `C:/Windows/System32` |
| `PATHEXT` | Consola; extensiones de ejecutables Windows | `.COM;.EXE;.BAT;.CMD` |
| `ProgramData` | Consola; vía administrada declarada no observada | `C:/ProgramData` |
| `OPENCODE_CONFIG` | Consola; entrada de archivo, exige ruta absoluta | `/tmp/rige-demo/externa/config.json` |
| `OPENCODE_CONFIG_DIR` | Consola; directorio absoluto canónico, agrega entradas | `/tmp/rige-demo/dir-variable` |
| `OPENCODE_CONFIG_CONTENT` | Consola; entrada JSONC, no se conserva el texto crudo | `{"agent":{}}` |
| `OPENCODE_PERMISSION` | Consola; entrada JSON estricto, no se conserva el texto crudo | `{"read":"ask"}` |
| `OPENCODE_DISABLE_PROJECT_CONFIG` | Consola; `via-no-soportada` con true o 1 | `true` |
| `OPENCODE_TEST_HOME` | Consola; `via-no-soportada` si definida, incluso vacía | `/tmp/rige-demo/hogar` |
| `OPENCODE_TEST_MANAGED_CONFIG_DIR` | Consola; `via-no-soportada` si no vacía | `/tmp/rige-demo/gestion` |
| `GIT_DIR` | Consola; directorio Git alternativo; definida produce `via-no-soportada` | `/tmp/rige-demo/.git` |
| `GIT_WORK_TREE` | Consola; árbol alternativo; definida produce `via-no-soportada` | `/tmp/rige-demo/proyecto` |
| `GIT_CEILING_DIRECTORIES` | Consola; techo de búsqueda; definida produce `via-no-soportada` | `/tmp` |
| `GIT_COMMON_DIR` | Consola; directorio común; definida produce `via-no-soportada` | `/tmp/rige-demo/comun` |
| `NOMBRE` | Consola; lectura dinámica `{env:NOMBRE}` de un nombre arbitrario; solo se informa origen y condición | `valor-de-prueba` |
| `APPDATA` | Arnés; aísla referencias nativas, no configura el producto | `C:/Temp/rige-demo/hogar` |
| `XDG_STATE_HOME` | Arnés; aislamiento de estado | `/tmp/rige-demo/hogar` |
| `XDG_CACHE_HOME` | Arnés; aislamiento de caché | `/tmp/rige-demo/hogar` |
| `OPENCODE_DISABLE_EXTERNAL_SKILLS` | Arnés de captura nativa; solo si su referencia lo declara | `true` |
| `RNF07_ESTRICTO` | Arnés `medir:rnf07`; exige peor caso menor que 2000 ms | `1` |

Las cuatro variables GIT producen `via-no-soportada` aun vacías: para el recorrido controlado deben estar ausentes. La utilidad de demostración construye el entorno desde cero y evita heredar estas variables o configuraciones personales.

## 5. Base de datos

Elegir un almacén temporal para la comprobación. Bash:

```bash
export RIGE_ALMACEN="$(mktemp -d)/almacen"
bun run esquema
```

PowerShell:

```powershell
$env:RIGE_ALMACEN = Join-Path ([IO.Path]::GetTempPath()) ('rige-demo-' + [guid]::NewGuid())
bun run esquema
```

Código esperado **0**, JSON con `versionRige: "1.0.0"` y `almacen.versionEsquema: 2`. `bun run esquema` crea el directorio propio y `rige.db`, y aplica `esquemas/almacen/001_inicial.sql` y `002_formato2.sql` en orden. Es idempotente. El esquema de salida sigue en **2**, `user_version` en **2** y `formato_documento` en **2**. No se convierten ni reescriben resoluciones guardadas: un documento formato 2 anterior conserva en SQL su `version_rige`; las nuevas altas usan 1.0.0. Para un esquema incompatible, respaldar el almacén y elegir un directorio nuevo; nunca editarlo a mano ni esperar una migración silenciosa.

Los datos de prueba están en `pruebas/escenarios/`, sus SHA-256 y defectos/control en `MANIFIESTO.json`, y su preparación en cada `REFERENCIA.json`. **No analizar directamente esos archivos para acreditar los resultados**: el hogar global y el repositorio contenedor alterarían las entradas. La utilidad siguiente copia el escenario a un temporal, reemplaza `<RAIZ>` (y la forma relativa a la unidad cuando corresponda), prepara `.git` según `procedencia.git` (por defecto `raiz`), aísla hogar, datos XDG, APPDATA y ProgramData, y carga variables de archivos según la referencia. Hereda solo PATH y SystemRoot, antepone el paquete ficticio opencode-ai 1.18.25 y no ejecuta sus archivos. Git debe seguir disponible en el PATH heredado.

Para una consulta aislada que se limpia al terminar:

```bash
bun herramientas/demostracion.ts v1-precedencia -- valores --agente build --clave temperature
```

Para conservar la copia y su almacén durante el recorrido web:

```bash
bun herramientas/demostracion.ts v1-precedencia --preparar
```

Guardar el objeto JSON que imprime (`raiz`, `proyecto`, `almacen`, `versionFicticia`). En los pasos siguientes, **`<RAIZ>` se sustituye por el valor literal de `raiz`**, entre comillas; **`<PROYECTO>` por `proyecto`**. No son rutas del repositorio. La copia se conserva para reinicios; después de detener el servidor puede eliminarse ese directorio temporal desde el explorador de archivos.

Las consultas de la CLI no escriben la base. Para cargar resoluciones de demostración, iniciar la web sobre la copia conservada y pulsar **«Resolver y guardar»** (§6 y RF-17 de §8). Se retienen las últimas 20 por proyecto.

## 6. Ejecución

Para el uso local con la configuración de §4 y el almacén de §5:

```bash
bun run servir
```

Debe informar `{"esquema":2,"direccion":"http://127.0.0.1:4747"}`. Abrir esa dirección: el inicio muestra **RIGE 1.0.0**, almacén y esquema 2. `RIGE_PUERTO` cambia el puerto; si se modifica, abrir `http://127.0.0.1:<puerto>`. Detener con **Ctrl+C**.

Para el recorrido aislado, detener primero ese servidor y usar la copia de §5:

```bash
bun herramientas/demostracion.ts --desde "<RAIZ>" -- servir
```

La utilidad ejecuta `esquema` antes de servir, imprime proyecto y almacén para completar la pantalla, y publica la misma dirección local. Puede usar otro puerto con `--puerto 4848` antes de `--`; en pruebas se elige uno libre, nunca el 4747. Ctrl+C detiene el subproceso; al reiniciar con la misma `raiz` conserva la base. Solo admite GET local, verifica Host y rechaza Sec-Fetch-Site cross-site y same-site. No ofrece CORS ni JavaScript ejecutable en el cliente.

## 7. Usuario de demostración

RIGE **no tiene usuario de demostración ni acceso con credenciales**. Es local, de solo lectura sobre las entradas y escucha solo en **127.0.0.1**. Cualquier persona con acceso a esa sesión local puede consultar los datos; no hay rol ni contraseña que configurar.

## 8. Verificación

Prueba de humo (desde `src/`, idéntica en Bash y PowerShell):

```bash
bun herramientas/demostracion.ts v1-precedencia -- valores --agente build --clave temperature
```

Esperar código **0**, stderr vacío y un objeto esquema 2, versión RIGE 1.0.0. Comparar `valores[0].rastro.valor` = **0.3**; `determinante.referencia` termina en **`/proyecto/opencode.jsonc`**, posición **línea 6, columna 7**, vía `proyecto`; `desplazadas` contiene **0.1 y 0.2, en ese orden**, de `opencode.json:5:7` y `proyecto/opencode.json:5:7`. Hay tres entradas observadas. La prueba automatizada normaliza `\` a `/` y sustituye la raíz temporal por `<RAIZ>` al comparar las referencias. **No se promete igualdad literal del JSON entre máquinas o copias temporales distintas**: rutas y resúmenes pueden variar. Repetir sobre una misma copia conservada sí permite comprobar determinismo byte a byte.

En la matriz, `demo E -- COMANDO` abrevia **`bun herramientas/demostracion.ts E -- COMANDO`**; `demo --desde "<RAIZ>" -- COMANDO` usa la copia conservada de §5. Cada comando de respaldo se ejecuta desde `src/` como `bun test <archivo>`. Las filas RNF son controles técnicos, no inferencias a partir de una pantalla.

| Requisito | Preparación | Comando o pantalla | Resultado observable | Prueba automatizada |
|---|---|---|---|---|
| RF-01 | Copia aislada `v1-precedencia` | `demo v1-precedencia -- valores --agente build --clave temperature`; repetir sin `--clave temperature` | 0.3, origen proyecto/opencode.jsonc:6:7, desplazadas 0.1 y 0.2; sin clave aparece el mismo rastro junto a las demás claves | `pruebas/aceptacion/RF-01.test.ts` |
| RF-02 | `v2-decision`, hogar y Git de su referencia | `demo v2-decision -- permiso --agente build --herramienta read --objetivo .env --explicar` | allow, regla declarada `*.env` determinante sobre ask nativo, cadena, procedencia y explicación de prevalencia | `pruebas/aceptacion/RF-02.test.ts`; `RF-02-explicacion.test.ts` |
| RF-03 | Preparar `v1-precedencia` una sola vez con `--preparar` | Repetir dos veces `demo --desde "<RAIZ>" -- valores --agente build --clave temperature`; servir esa copia, resolver y comparar el JSON `id="respuesta"` de la página | Salidas CLI idénticas en la misma copia; objeto de valores igual al JSON no ejecutable de la web, esquema 2. Para permiso y hallazgos repetir sus consultas con y sin `--explicar` sobre la misma copia | `pruebas/aceptacion/RF-03.test.ts` |
| RF-04 | `v3-entradas` y `v3-entradas-ilegible`, variables cargadas desde sus referencias | `demo v3-entradas -- entradas`; `demo v3-entradas-ilegible -- entradas` | Siete tipos de vía con orden y legibilidad; solo la entrada sembrada proyecto/.opencode/opencode.json es ilegible en el segundo caso | `pruebas/aceptacion/RF-04.test.ts` |
| RF-05 | Paquete ficticio 1.18.24, sin tocar la instalación real | `bun herramientas/demostracion.ts v1-precedencia --version 1.18.24 -- valores --agente build` | stdout vacío, stderr con version-no-soportada (esperada 1.18.25, detectada 1.18.24), código 1 | `pruebas/aceptacion/RF-05.test.ts` |
| RF-06 | `v2-decision`, build sin descripción declarada | `demo v2-decision -- valores --agente build --clave description`; consultar además el permiso read .env de RF-02 | description implícita, sin entrada atribuida ni desplazadas; cadena distingue nativo de declarado | `pruebas/aceptacion/RF-06.test.ts` |
| RF-07 | Defectos y controles de MANIFIESTO.defectos: entradas-ilegible/entradas, permiso-invalido/control-permiso, sustituciones/control-sustituciones, referencias/control-referencias, sin-efecto/control-sin-efecto, sin-uso/control-sin-uso (todos con prefijo v3-) | Para cada par: `demo <escenario> -- hallazgos --explicar`; servir la copia preparada y abrir `/hallazgos?proyecto=<PROYECTO-codificado>` para contrastar con la web | Seis tipos sembrados, causa y ubicación; cada defecto desaparece en su control. Los hallazgos parciales se declaran, sin confundirlos con cero defectos | `pruebas/aceptacion/RF-07.test.ts` |
| RF-08 | `v2-decision` | `demo v2-decision -- permiso --agente build --herramienta bash --objetivo "ls \| cat"` (escribir la barra sin la contrabarra de escape de esta tabla) | decision null, motivo de comando compuesto, código 0 | `pruebas/aceptacion/RF-08.test.ts` |
| RF-09 | `v3-proteccion-env`, Git en proyecto | `demo v3-proteccion-env -- permiso --agente build --herramienta read --objetivo .env --explicar` | allow y advertencia proteccion-nativa-anulada; se identifican la regla nativa y la declarada | `pruebas/aceptacion/RF-09.test.ts` |
| RF-16 | `v2-agentes` | `demo v2-agentes -- agentes` | Incluye zeta como subagente y registra explore eliminado por disable; nativos primero y nombres ordenados | `pruebas/aceptacion/RF-16.test.ts` |
| RF-17 | Copia `v1-precedencia` conservada de §5; servidor aislado de §6 | En inicio: Proyecto = ruta `proyecto` impresa, Agente = build, Clave = temperature, «Resolver y guardar». Guardar la URL `/resoluciones/<id>?agente=build&clave=temperature`; Ctrl+C, reiniciar con la misma raiz, abrir esa URL | Recupera 0.3 y procedencia sin releer las entradas, con «Página armada con la resolución leída del almacén de RIGE.»; historial disponible. La retención de 20 se comprueba técnicamente | `pruebas/aceptacion/recorrido-v1.test.ts`; `paquetes/rige/adaptadores/almacen-sqlite/resoluciones.test.ts` |
| RNF-01 | Escenarios temporales; resúmenes SHA-256 antes y después de consultar y guardar | `bun test pruebas/aceptacion/RF-01.test.ts pruebas/aceptacion/recorrido-v1.test.ts` | Mismos bytes de entradas; solo cambia el almacén propio | `pruebas/aceptacion/RF-01.test.ts`; `pruebas/aceptacion/recorrido-v1.test.ts` |
| RNF-02 | Capturas por plataforma, derivaciones y límites declarados separados | `bun test pruebas/aceptacion/RNF-02.test.ts pruebas/aceptacion/T5-06c.test.ts` | Coincidencia de valores y decisiones utilizables con OpenCode 1.18.25; recuento explícito de evidencia, pendientes y límite core.worktree de ADR-101 W-B según comparación en esa plataforma | `pruebas/aceptacion/RNF-02.test.ts`; `pruebas/aceptacion/T5-06c.test.ts` |
| RNF-03 | Análisis de dependencias y adaptador ficticio | `bun test pruebas/aceptacion/RNF-03.test.ts` | Cero dependencias del núcleo hacia OpenCode, cero identificadores de herramienta; adaptador ficticio resuelto sin cambiar el núcleo | `pruebas/aceptacion/RNF-03.test.ts` |
| RNF-04 | Sustituciones de entorno, archivo y entrada de variable con marcadores conocidos | `bun test pruebas/aceptacion/RNF-04.test.ts` | Cero apariciones del contenido en CLI, web, diagnóstico, depuración y SQLite; origen y condición conservados | `pruebas/aceptacion/RNF-04.test.ts` |
| RNF-05 | Arnés con fetch bloqueado y comparación sin red; Ubuntu con strace para monitor | `bun test pruebas/aceptacion/RNF-05.test.ts`; procedimiento `herramientas/sin-red.md` | Cero conexiones salientes de análisis y mismo resultado sin red. La prueba strace se omite en Windows; no acredita allí el monitor Linux | `pruebas/aceptacion/RNF-05.test.ts` |
| RNF-09 | Subproceso web en puerto libre y solicitudes HTTP técnicas | `bun test pruebas/aceptacion/RNF-09.test.ts` | Host ajeno, métodos distintos de GET y Sec-Fetch-Site ajeno rechazados; cero cabeceras CORS | `pruebas/aceptacion/RNF-09.test.ts` |
| RNF-10 | Copia MIT incorporada en vendor y sus hashes de procedencia | `bun test pruebas/aceptacion/RNF-10.test.ts` | Copyright, LICENSE y AVISOS presentes; resúmenes coinciden con PROCEDENCIA.md | `pruebas/aceptacion/RNF-10.test.ts` |

Para escribir el comando de RF-08 sin escape de tabla:

```bash
bun herramientas/demostracion.ts v2-decision -- permiso --agente build --herramienta bash --objetivo "ls | cat"
```

En RF-03, el JSON embebido se obtiene del código fuente de la página, entre `<script type="application/json" id="respuesta">` y `</script>`, interpretando `\u003c` como `<` al parsear JSON. Comparar objetos, no el HTML ni el sobre con fecha/id del almacén. El mismo origen de navegador permite recorrer los enlaces de permisos, agentes e historia de la resolución guardada. Para `/hallazgos` y `/entradas`, codificar la ruta de proyecto como parámetro de URL (por ejemplo, con el formulario de la página inicial).

## 9. Pruebas automatizadas

```bash
bun run verificar
bun test
bun run cobertura
```

Todos terminan con código **0**. Corrida local de esta rama del **09/11/2026**, Windows: **1240 aprobadas, 2 omitidas, 15 pendientes y 0 fallidas**. Las pendientes son comparaciones que deben correr en su plataforma; las omitidas corresponden a strace y al enlace npm exclusivo de POSIX. Este recuento no sustituye la corrida Ubuntu ni las referencias contra el binario real. `cobertura` informa la trazabilidad de requisitos, escenarios, CA y oráculos, con cero errores; no es porcentaje de líneas.

Consultar la [corrida de CI del candidato](https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP/actions/workflows/ci.yml), verificar que corresponda al commit que se etiquetará y que ambos sistemas terminen en verde. No se declara aquí una corrida remota nueva: la publicación de la etiqueta y su respaldo en CI son pasos del autor. El canal usa Bun 1.3.14, instalación congelada, verificar y pruebas. El README §6 documenta también referencias nativas, prueba lenta y arneses de red y latencia.

## 10. Problemas frecuentes

- **Puerto ocupado:** detener el servidor anterior con Ctrl+C o cambiar RIGE_PUERTO en consola/rige.env; en la utilidad usar `--puerto 4848` antes de `--`. Abrir la nueva dirección.
- **`almacen-sin-esquema`:** comprobar el directorio de RIGE_ALMACEN y ejecutar `bun run esquema` con la misma configuración. Para un formato incompatible, conservar la base anterior como respaldo y seleccionar un directorio nuevo. No se migra ni se reescribe en silencio.
- **`version-no-soportada`:** el primer OpenCode de PATH no es 1.18.25. Instalar la versión admitida para el uso real o usar el paquete ficticio de la demostración. No suprimir el error ni presentar resultados de otra versión como válidos.
- **`version-no-determinada` en Windows con pnpm o bun:** un lanzador puede impedir ubicar el package.json de opencode-ai sin ejecutar procesos. La consulta continúa con advertencia. Para referencias nativas usar la instalación npm 1.18.25 del README §6; para la matriz, usar la utilidad aislada. No inferir la versión desde el nombre del ejecutable.
- **Resultados afectados por configuración global propia:** no consultar directamente los escenarios del repositorio. Usar `demostracion.ts`, que copia a temporales, carga el hogar y variables de la referencia y excluye OPENCODE_* y GIT_* ajenas. En una copia conservada reutilizar `--desde` para comparar determinismo.
- **Git ausente de PATH:** RIGE no lo ejecuta, pero declara `git-no-encontrado` y cambia la base del árbol. Instalar Git y abrir una terminal nueva antes de repetir el recorrido.
- **Valores literales sensibles (D-76):** un valor escrito en forma literal en una declaración, aunque sea una credencial, **se informa y se guarda como cualquier valor declarado**. RNF-04 excluye el contenido incorporado por sustituciones `{env:…}` o `{file:…}`; no detecta ni enmascara credenciales literales. Los escenarios solo contienen datos de prueba.

## 11. Terceros e inteligencia artificial

Los componentes de terceros, versiones y licencias se detallan en el **Capítulo IX** del informe. El evaluador de permisos v1 y Wildcard de OpenCode 1.18.25 está incorporado bajo MIT; se incluyen LICENSE, AVISOS.md y PROCEDENCIA.md en `paquetes/opencode/vendor/`. La declaración de IA que sigue reproduce exactamente README §8 y debe conciliarse con la bitácora antes de la entrega.

Las filas siguientes trasladan solo usos respaldados por la declaración de la bitácora (../00-gestion/bitacora.md). Sustituyen atribuciones anteriores que aún no estaban conciliadas; no se infieren herramientas desde las fichas.

| Fecha | Herramienta | Para qué | Pieza, archivo o commit | Verificación posterior |
|---|---|---|---|---|
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
| 09/11 (T5-06c-c1) | [AUTOR: completar] | [AUTOR: completar] | Capturas Linux incorporadas y comparación por plataforma | [AUTOR: completar] |
| 09/11 (T5-07) | [AUTOR: completar] | [AUTOR: completar] | Versión 1.0.0, README y MANUAL | [AUTOR: completar] |

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
