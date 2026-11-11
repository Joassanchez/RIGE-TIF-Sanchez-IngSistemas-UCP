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
| `ProgramData` | Consola; base del directorio administrado observado en Windows (`opencode/`) | `C:/ProgramData` |
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

Las consultas de la CLI no escriben la base. Para cargar resoluciones de demostración, iniciar la web sobre la copia conservada y pulsar **«Analizar»** (§6 y RF-17 de §8). Se retienen las últimas 20 por proyecto.

## 6. Ejecución

Recorrido final: **Inicio → resumen → agente → permiso / hallazgos**. Los recientes ocupan filas compactas en escritorio: nombre, fecha y cantidad, ruta con elipsis (completa en la ayuda) y **Analizar de nuevo**. En móvil se apilan. El marcador atenuado de **Carpeta del proyecto** usa `C:\proyectos\mi-app` como ejemplo.

**Permiso** ofrece agente, herramienta (sugerencias no exhaustivas), **Acción u objetivo** y **Consultar**. **Opciones avanzadas** agrupa los formularios independientes **Como subagente de…** y **Por sujeto**. Cada envío contiene solo herramienta o sujeto; solo el formulario de subagente envía lanzador. Las consultas rápidas quedan debajo. El resultado destaca **Permitido**, **Pregunta antes** o **Denegado**, una oración de explicación y **Regla que decide** con patrón, efecto, carácter y ubicación enlazada al editor. **Explicación completa** conserva todas las oraciones. **Ver reglas coincidentes (n)** muestra solo las coincidentes de esa consulta, con determinante y desplazadas e índices desde 1; la cadena completa se enlaza en **Todas las reglas**. Se conservan herramienta ofrecida/retirada y advertencias; la anulación de protección nativa se destaca. Sin decisión se muestra el motivo llano sin insignia de efecto; una cadena incompleta mantiene el error 422.

**Hallazgos** muestra tarjetas agrupadas por tipo con **Causa**, clave o agente afectado, ubicación enlazada a VS Code y regla relacionada. **Qué hacer** aparece solo para tipos con una acción deducible. Conserva **Estado actual de los archivos**, parcialidad y motivos. Las anclas se asignan antes de agrupar y solo valen dentro del diagnóstico actual. **Todas las reglas** muestra primero la matriz, después la cadena; los límites comunes aparecen una sola vez y cada agente conserva sus límites propios. Los sujetos personalizados y `external_directory` parcial se presentan tal como los informa el caso de uso.

En **Entradas**, el mapa agrupa **Presentes**, **Ausentes** y **No observadas**, conservando el orden de revisión dentro de cada grupo. Los límites de la matriz completa se consultan en **Reglas**.

En **Todas las reglas**, por debajo de 700 px la matriz presenta una tarjeta por agente con sus sujetos e insignias sin partir; en escritorio mantiene un ancho mínimo por columna y se desplaza dentro de su contenedor. **Regla N** está en la ayuda de la insignia. La cadena reserva espacio para el sujeto y permite cortar patrones de ruta largos. La procedencia nativa se abrevia **OpenCode · general**, **OpenCode · agente** o **OpenCode · final**; la explicación íntegra está en la ayuda. Los ejes parciales comunes se muestran una vez como **Todos los agentes:**; por agente quedan solo diferencias y errores.

El resumen tiene **Analizar de nuevo** junto a los metadatos, como enlace GET a `/resolver?proyecto=…`. En recientes, la ruta con elipsis ocupa el espacio libre sin superponerse a la acción. Los valores de texto largo se cortan dentro de su celda. En móvil, los encabezados de grupo del mapa de vías quedan separados de los de columna y **Herramienta** aparece encima del campo. La prueba de maquetación verifica HTML y CSS; el ingeniero mide la geometría con Chrome a 360–1920 px.

El encabezado del resumen reúne ruta, fecha y versión en una línea. Las cifras distinguen la foto guardada del **Estado actual**; **Foto guardada** y **Estado actual de los archivos** rotulan sus bloques. En el agente y en permiso, hallazgos, reglas y entradas, el selector compacto queda junto al título. En el agente, **Buscar clave** forma una barra con **Filtrar**. Primero aparecen las claves declaradas, en orden de clave; **Valores de fábrica (n)** agrupa al final los valores implícitos y nativos, cerrado. **¿Qué significa?** reúne las explicaciones de precedencia e implícitos. Las **Desplazadas** muestran valor tachado y ubicación en una línea, sin numeración. Los **Sujetos de permiso** forman una cuadrícula con efecto, índice de regla en la ayuda y una leyenda común para **parcial**. **Límites del análisis** reúne las restricciones. **Ver todas las reglas de <agente>**, **Consultar permiso** y **Ver hallazgos** son botones secundarios de tamaño menor que **Analizar** o **Consultar**. **Ver entradas actuales** queda en el resumen del proyecto, accesible por la miga. En el agente, el detalle de **Entradas leídas** de la foto se conserva dentro de **Ver en la consola**.

El aviso de agentes dice «Este proyecto no define agentes nuevos: usa los de OpenCode» solo con una lista completa, no vacía y sin agentes declarados. Hallazgos muestra cifras solo para tipos presentes; los demás van en una línea «Sin hallazgos de: …». Agentes, comandos y entradas se cuentan en una línea; un conteo desconocido dice «sin dato». En permiso, la frase de decisión enlaza al editor con el nombre corto del archivo y la ruta completa en la ayuda. La advertencia de protección nativa aparece destacada una vez; su texto equivalente se conserva en **Notas del análisis**, y las demás advertencias siguen visibles. **Ver la cadena completa en Todas las reglas** es un botón secundario junto a **Ver reglas coincidentes**.

**Lo determina** muestra vía y ubicación; los archivos locales con posición enlazan a **VS Code**, con ruta completa en la ayuda. Las referencias sin archivo permanecen como texto.

El resumen usa el nombre del proyecto y fecha local absoluta. Si no se puede obtener el sobre porque no hay agentes o sus valores no son consultables, abre los demás bloques con «Fecha no disponible» y «Historial no disponible para este análisis» atenuados; la cifra de análisis dice «sin dato» y se omiten enlaces de historial y comparación. Una lista vacía dice «Sin agentes activos» y conserva los eliminados. El aviso sobre agentes de fábrica solo aparece con lista completa, no vacía y sin declarados. «Sin hallazgos» verde requiere análisis completo; en caso parcial se muestran los motivos.

La web usa superficies blancas sobre fondo neutro claro, tema oscuro carbón automático y un acento índigo. La tipografía del sistema parte de 16 px; las tablas pasan a tarjetas en móvil. El encabezado muestra **RIGE** y migas de proyecto, agente y vista. El pie dice «Local · solo lectura · sin red · RIGE 1.0.0».

Inicio pregunta «¿Qué configuración rige en este proyecto?», pide **Carpeta del proyecto** y ofrece **Analizar**. Toda la tarjeta de **Proyectos recientes** abre la última foto; **Analizar de nuevo** relee las entradas. Las fotos se nombran «proyecto · fecha», con fecha local absoluta `dd/mm/aaaa hh:mm` en las vistas guardadas para que el HTML siga estable al reiniciar. Si una consulta de Agentes, Permisos o Reglas no puede obtener el sobre por valores pendientes o sin declaraciones, conserva su respuesta y avisa **Fecha no disponible** sin inventar metadatos; en Permisos y Reglas se conserva también el código técnico. Solo Inicio usa «hoy hh:mm» o «ayer hh:mm»; para otras fechas usa la absoluta. Los identificadores quedan en las direcciones y en el JSON. La ayuda larga está en **¿Qué significa?**, cerrado. Un proyecto inexistente sugiere revisar que la ruta corresponda a esta máquina. Los rechazos de origen o método no muestran migas, ruta ni versión; los errores internos mantienen un mensaje fijo.


Capacidades adicionales **comparar y recientes** (ADR-112, T5-14; fuera de los 18 Must y de la medición ADR-098):

```bash
bun run rige -- comparar --desde <id-anterior> --hasta <id-abierto> [--agente <nombre>]
bun run rige -- recientes
```

Usan exclusivamente las fotos retenidas en `RIGE_ALMACEN`, sin releer entradas ni guardar: requieren el esquema creado explícitamente con `bun run esquema`. No crean un almacén ausente. En **Historial** del resumen, cada análisis enlaza con **Comparar con el anterior**, siempre de la foto anterior a la de esa fila. `/comparar?desde=<id>&hasta=<id>[&agente=<nombre>]` muestra antes → después, ambas procedencias, agentes agregados o quitados y cantidades de claves cambiadas, nuevas, quitadas y sin cambio. El filtro de agente afecta la presentación y sus conteos, conservando el JSON completo e idéntico al de la CLI; `--agente` en la CLI conserva ese objeto íntegro.

Las rutas de claves son arreglos de segmentos: no se confunden puntos o barras dentro de un nombre. Un cambio puede ser de valor, de procedencia o de ambos. Las rutas no resueltas y las presencias inciertas quedan fuera de los conteos confirmados; se informa **comparación parcial**. Las sustituciones solo se comparan por su representación protegida, sin afirmar igualdad del contenido. No se comparan cadenas ni decisiones de permisos. `desde` es antes y `hasta` después, sin reordenar; un mismo id produce cero diferencias. Proyecto distinto o id inexistente: código CLI 1 (web 422 o 404); argumentos inválidos: CLI 2 (web 400); falla interna: CLI 70, stack solo con `--depurar`. No admiten `--tiempos` ni `--explicar`. Contratos esquema 2: `comparacion.json` y `proyectos-recientes.json`.

En Inicio, **Proyectos recientes** aparece debajo del formulario si hay fotos: hasta diez proyectos, última foto e instante y cantidad retenida (máximo veinte). El enlace abre esa foto y **Analizar de nuevo** usa `/resolver?proyecto=…`, el recorrido existente que lee las entradas actuales y guarda otra foto.

En recientes, toda la tarjeta abre la última foto; **Analizar de nuevo** es el enlace secundario. El instante se presenta como hoy, ayer o fecha absoluta. La ayuda de **Analizar** queda en el plegable cerrado **¿Qué significa?** debajo del botón.

En **Comparar**, las cantidades aparecen como insignias neutras. Las fotos **Antes** y **Después** indican proyecto y fecha local absoluta; sus valores y procedencias están en columnas lado a lado en escritorio y apiladas en móvil. La ruta se lee como `temperature` o `a › b`, con el arreglo literal en `title`. Los agentes sin diferencias se reúnen en una línea **Sin cambios:**, y el filtro por agente usa la barra de pestañas desplazable del panel.

Capacidad adicional **reglas** (ADR-111, T5-13; fuera de los 18 Must):

```bash
bun run rige -- reglas --proyecto <ruta> --agente <nombre> [--lanzado-por <agente>] [--tiempos]
bun herramientas/demostracion.ts v2-decision -- reglas --agente build
```

Desde **Permisos**, abrir **Ver cadena completa y matriz de permisos** (`/reglas?id=<id>&agente=<nombre>[&lanzadoPor=<agente>]`). La cadena muestra todas las reglas en orden, índices desde 1, efecto, procedencia y localización. La matriz incluye agentes activos y ocultos y el efecto general de cada sujeto de permiso, con enlace al formulario por sujeto y objetivo vacío; conserva el lanzador. Solo considera patrones literales `*`, con la coincidencia de sujetos del evaluador. Las reglas específicas pueden cambiar el resultado: consultar `permiso` para la acción concreta. `external_directory` es parcial, sin decisión general: muestra **parcial** y una sola leyenda explicativa debajo de la matriz. Una cadena incompleta conserva su error y celdas sin efecto; los agentes Markdown no observados y los motivos del listado incompleto se declaran aparte. La CLI resuelve una vez en memoria sin abrir el almacén; la web conserva la foto guardada aunque cambien archivos, entorno o worktree. `--explicar` se rechaza con código 2; `--tiempos` mide por stderr sin cambiar el JSON. Esquema de salida 2 propio, `esquemas/salida/reglas.json`.

Para el uso local con la configuración de §4 y el almacén de §5:

```bash
bun run servir
```

Debe informar `{"esquema":2,"direccion":"http://127.0.0.1:4747"}`. Abrir esa dirección: el inicio muestra **RIGE** y «¿Qué configuración rige en este proyecto?». Completar **Carpeta del proyecto** y pulsar **Analizar**. Se guarda el proyecto entero y se abre el **Resumen del proyecto**, incluso sin agentes activos. El pie dice «Local · solo lectura · sin red · RIGE 1.0.0». `RIGE_PUERTO` cambia el puerto; si se modifica, abrir `http://127.0.0.1:<puerto>`. Detener con **Ctrl+C**.

El **Resumen del proyecto** (`/resoluciones/<id>`) presenta cifras, agentes de la foto, hallazgos actuales y **Archivos y cambios**. **Archivos leídos** y **Historial** son plegables cerrados. Archivos y hallazgos indican «Estado actual de los archivos»: se releen y pueden cambiar aunque la foto sea la misma. Solo los archivos locales observados entran en el conteo; las variables y las vías no observadas quedan fuera. Una legibilidad desconocida se informa «sin dato».

**Entradas** abre con el **Mapa de vías**: ocho vías soportadas (incluida `administrada`) y tres no observadas (`remota-wellknown`, `remota-organizacion`, `preferencias-macos`). Cada fila muestra estado, cantidad de entradas y un plegable con los lugares revisados en orden de comprobación. **Presente** (neutro) significa que aportó alguna entrada, incluso ilegible o sin declaraciones; **ausente** (neutro), que se revisó sin resultado; **no observada** (gris con borde punteado), que no se revisa. Las variables vacías son ausentes; sus contenidos no aparecen en los lugares revisados. Debajo permanece la tabla de entradas y legibilidad. El JSON de CLI y web incluye el mismo campo opcional `vias`, sin cambiar `entradas`, `resumenEntradas` ni el esquema 2. Si una respuesta anterior carece del mapa, se muestra «Mapa de vías no disponible». El mapa consulta archivos actuales y no se guarda en la resolución.

Desde el resumen, elegir un agente abre `/resoluciones/<id>/agentes/<nombre>`. Su encabezado muestra modo y origen; un nativo informa cuántas claves tienen determinante declarado. **Buscar clave** es el único campo: **Filtrar** busca subcadenas sin distinguir mayúsculas, solo oculta filas y conserva el JSON íntegro. La tabla muestra **Clave**, **Valor**, **Lo determina** y **Desplazadas**; estas últimas aparecen tachadas en orden. **¿Qué significa?** conserva RD-01 y las demás explicaciones en plegables. La consulta exacta queda en la CLI; las URL anteriores con `clave` siguen siendo compatibles.

La página del agente conserva selector y contexto de búsqueda. Debajo de sus valores muestra la fila de **Sujetos de permiso**, su efecto general, parcialidad y límites. Cada celda abre el formulario con ese sujeto precargado y objetivo vacío; hay que completar la acción para consultar. **Ver todas las reglas de <agente>** abre la cadena y la matriz completas en `/reglas`.

Recorrido `v1-precedencia`: pulsar **Analizar** con la ruta `proyecto` de la copia aislada de §5. En el **Resumen del proyecto**, abrir **build**. Escribir `temperature` en **Buscar clave** y pulsar **Filtrar**. Comprobar `0.3`, **Lo determina** `Proyecto · opencode.jsonc:6:7`, las desplazadas `0.1` y `0.2` en ese orden y RD-01 en **¿Qué significa?**. Guardar `/resoluciones/<id>/agentes/build?q=temperature`; detener y reiniciar con la misma copia y abrir esa URL: conserva los valores de la foto. El JSON de esa página corresponde a `valores --agente build` completo; para contrastar una consulta CLI con `--clave temperature`, usar la URL compatible `/resoluciones/<id>?agente=build&clave=temperature`.

**Permisos** reúne **Consultar permiso**, consultas como subagente o por sujeto y **Consultas rápidas**. La página de formularios no representa una consulta ejecutada. Los resultados muestran la decisión y **Ver reglas coincidentes (n)**, con la determinante resaltada y las desplazadas atenuadas. Cada resultado incluye el plegable **Ver en la consola**, con variantes Bash y PowerShell 7.3+. La aclaración es: «No recupera esta foto; coincide si las entradas y el contexto no cambiaron». Permiso incluye siempre `--explicar`; el filtro visual no se agrega al comando.

El tema claro u oscuro sigue la preferencia del sistema. Los detalles se abren sin JavaScript y los estilos son locales en `/estilos.css`. Los hallazgos se presentan como tarjetas agrupadas. Hasta 640 px, valores efectivos, cadena de permiso y entradas pasan de tablas a tarjetas con etiquetas y el mismo contenido y orden; los comandos largos tienen desplazamiento propio.

Para el recorrido aislado, detener primero ese servidor y usar la copia de §5:

```bash
bun herramientas/demostracion.ts --desde "<RAIZ>" -- servir
```

La utilidad ejecuta `esquema` antes de servir, imprime proyecto y almacén para completar la pantalla, y publica la misma dirección local. Puede usar otro puerto con `--puerto 4848` antes de `--`; en pruebas se elige uno libre, nunca el 4747. Ctrl+C detiene el subproceso; al reiniciar con la misma `raiz` conserva la base. Solo admite GET local, verifica Host y rechaza Sec-Fetch-Site cross-site y same-site. No ofrece CORS ni JavaScript ejecutable en el cliente.

## 7. Usuario de demostración

RIGE **no tiene usuario de demostración ni acceso con credenciales**. Es local, de solo lectura sobre las entradas y escucha solo en **127.0.0.1**. Cualquier persona con acceso a esa sesión local puede consultar los datos; no hay rol ni contraseña que configurar.

## 8. Verificación

Recorrer **Inicio → resumen → agente → permiso / hallazgos** en ambos temas y a 360 px. Consultar `read .env`: comprobar decisión, **Regla que decide**, enlace al editor y **Ver reglas coincidentes** cerrado; abrir **Explicación completa** y contrastar todas las oraciones con la CLI. Probar los tres formularios de **Opciones avanzadas**, incluido un agente con barras, y un comando compuesto sin decisión. Abrir Hallazgos desde el resumen: el ancla debe llevar a la tarjeta agrupada correspondiente y conservar **Estado actual de los archivos**, parcialidad y motivos. Revisar matriz antes de cadena, límites sin repetición, comparación con tres columnas y entradas por precedencia con lugares revisados plegados. Las capturas en ambos temas y a 360 px corresponden a la revisión visual del ingeniero; las pruebas automatizadas comprueban CSS, contraste y estructura, sin acreditar una captura de navegador.

Comprobar que las migas de pan sitúan proyecto, agente y vista; que Inicio usa fechas «hoy/ayer» y las fotos guardadas usan `dd/mm/aaaa hh:mm`; y que el pie dice «Local · solo lectura · sin red». Probar una carpeta inexistente: debe sugerir revisar la ruta de esta máquina y mostrar el código en pequeño. La inspección con capturas a 360 px y en ambos temas queda a cargo del ingeniero; las pruebas de CSS verifican los tokens y sus contrastes AA.


Las capacidades adicionales se verifican sobre una misma copia temporal conservada: analizar, cambiar `temperature` y analizar de nuevo; abrir **Historial → Comparar con el anterior** o ejecutar `bun run rige -- comparar --desde <id1> --hasta <id2>`. Contrastar ambos valores y procedencias, volver a Inicio y comprobar **Proyectos recientes** frente a `bun run rige -- recientes`. No se atribuyen a estas capacidades resultados de productividad de ADR-098.

En las verificaciones de RF-03 y RF-17, abrir **Resumen del proyecto → build**, escribir `temperature` en **Buscar clave** y pulsar **Filtrar**. El filtro conserva el JSON completo de valores: para compararlo con CLI usar `valores --agente build`, sin `--clave`. Revisar **Historial**, las marcas de la foto consultada y la más reciente, y las comparaciones consecutivas. Comprobar ambos temas, foco y ancho de 360 px en navegador.

Prueba de humo (desde `src/`, idéntica en Bash y PowerShell):

```bash
bun herramientas/demostracion.ts v1-precedencia -- valores --agente build --clave temperature
```

Esperar código **0**, stderr vacío y un objeto esquema 2, versión RIGE 1.0.0. Comparar `valores[0].rastro.valor` = **0.3**; `determinante.referencia` termina en **`/proyecto/opencode.jsonc`**, posición **línea 6, columna 7**, vía `proyecto`; `desplazadas` contiene **0.1 y 0.2, en ese orden**, de `opencode.json:5:7` y `proyecto/opencode.json:5:7`. Hay tres entradas observadas. La prueba automatizada normaliza `\` a `/` y sustituye la raíz temporal por `<RAIZ>` al comparar las referencias. **No se promete igualdad literal del JSON entre máquinas o copias temporales distintas**: rutas y resúmenes pueden variar. Repetir sobre una misma copia conservada sí permite comprobar determinismo byte a byte.

En la matriz, `demo E -- COMANDO` abrevia **`bun herramientas/demostracion.ts E -- COMANDO`**; `demo --desde "<RAIZ>" -- COMANDO` usa la copia conservada de §5. Cada comando de respaldo se ejecuta desde `src/` como `bun test <archivo>`. Las filas RNF son controles técnicos, no inferencias a partir de una pantalla.

| Requisito | Preparación | Comando o pantalla | Resultado observable | Prueba automatizada |
|---|---|---|---|---|
| Capacidad adicional · ADR-111 (sin Must nuevo) | Copia aislada `v2-decision` | `demo v2-decision -- reglas --agente build`; en Permisos, abrir cadena y matriz | Cadena completa, prevalencia general por sujeto, limitaciones y JSON idéntico en CLI y web; foto guardada inmutable | `pruebas/aceptacion/T5-13.test.ts`; `T5-13-cli.test.ts`; `T5-13-web.test.ts` |
| Capacidad adicional · ADR-112 (sin Must nuevo) | Dos fotos de una copia `v1-precedencia` | `bun run rige -- comparar --desde <id1> --hasta <id2>`; `bun run rige -- recientes` | Cambio y ambas procedencias, Proyectos recientes, consultas sin escrituras, paridad CLI/web | `pruebas/aceptacion/T5-14.test.ts` |
| RF-01 | Copia aislada `v1-precedencia` | `demo v1-precedencia -- valores --agente build --clave temperature`; repetir sin `--clave temperature` | 0.3, origen proyecto/opencode.jsonc:6:7, desplazadas 0.1 y 0.2; sin clave aparece el mismo rastro junto a las demás claves | `pruebas/aceptacion/RF-01.test.ts` |
| RF-02 | `v2-decision`, hogar y Git de su referencia | `demo v2-decision -- permiso --agente build --herramienta read --objetivo .env --explicar` | allow, regla declarada `*.env` determinante sobre ask nativo, cadena, procedencia y explicación de prevalencia | `pruebas/aceptacion/RF-02.test.ts`; `RF-02-explicacion.test.ts` |
| RF-03 | Preparar `v1-precedencia` una sola vez con `--preparar` | Repetir dos veces `demo --desde "<RAIZ>" -- valores --agente build --clave temperature`; servir esa copia, pulsar Analizar, abrir build y comparar el JSON `id="respuesta"` de la página | Salidas CLI idénticas en la misma copia; objeto de valores igual al JSON no ejecutable de la web, esquema 2. Para permiso y hallazgos repetir sus consultas con y sin `--explicar` sobre la misma copia | `pruebas/aceptacion/RF-03.test.ts` |
| RF-04 | `v3-entradas` y `v3-entradas-ilegible`, variables cargadas desde sus referencias | `demo v3-entradas -- entradas`; `demo v3-entradas-ilegible -- entradas` | Siete tipos de vía con orden y legibilidad; solo la entrada sembrada proyecto/.opencode/opencode.json es ilegible en el segundo caso | `pruebas/aceptacion/RF-04.test.ts` |
| RF-05 | Paquete ficticio 1.18.24, sin tocar la instalación real | `bun herramientas/demostracion.ts v1-precedencia --version 1.18.24 -- valores --agente build` | stdout vacío, stderr con version-no-soportada (esperada 1.18.25, detectada 1.18.24), código 1 | `pruebas/aceptacion/RF-05.test.ts` |
| RF-06 | `v2-decision`, build sin descripción declarada | `demo v2-decision -- valores --agente build --clave description`; consultar además el permiso read .env de RF-02 | description implícita, sin entrada atribuida ni desplazadas; cadena distingue nativo de declarado | `pruebas/aceptacion/RF-06.test.ts` |
| RF-07 | Defectos y controles de MANIFIESTO.defectos: entradas-ilegible/entradas, permiso-invalido/control-permiso, sustituciones/control-sustituciones, referencias/control-referencias, sin-efecto/control-sin-efecto, sin-uso/control-sin-uso (todos con prefijo v3-) | Para cada par: `demo <escenario> -- hallazgos --explicar`; servir la copia preparada y abrir `/hallazgos?proyecto=<PROYECTO-codificado>` para contrastar con la web | Seis tipos sembrados, causa y ubicación; cada defecto desaparece en su control. Los hallazgos parciales se declaran, sin confundirlos con cero defectos | `pruebas/aceptacion/RF-07.test.ts` |
| RF-08 | `v2-decision` | `demo v2-decision -- permiso --agente build --herramienta bash --objetivo "ls \| cat"` (escribir la barra sin la contrabarra de escape de esta tabla) | decision null, motivo de comando compuesto, código 0 | `pruebas/aceptacion/RF-08.test.ts` |
| RF-09 | `v3-proteccion-env`, Git en proyecto | `demo v3-proteccion-env -- permiso --agente build --herramienta read --objetivo .env --explicar` | allow y advertencia proteccion-nativa-anulada; se identifican la regla nativa y la declarada | `pruebas/aceptacion/RF-09.test.ts` |
| RF-16 | `v2-agentes` | `demo v2-agentes -- agentes` | Incluye zeta como subagente y registra explore eliminado por disable; nativos primero y nombres ordenados | `pruebas/aceptacion/RF-16.test.ts` |
| RF-17 | Copia `v1-precedencia` conservada de §5; servidor aislado de §6 | En inicio: Carpeta del proyecto = ruta `proyecto` impresa, **Analizar**. Abrir **build**, **Buscar clave** = temperature, **Filtrar**; verificar RD-01 y desplazadas 0.1 y 0.2. Guardar la URL `/resoluciones/<id>/agentes/build?q=temperature`; Ctrl+C, reiniciar con la misma raiz, abrir esa URL | Recupera 0.3 y procedencia sin releer las entradas, con «Página armada con la resolución leída del almacén de RIGE.»; historial disponible. La retención de 20 se comprueba técnicamente | `pruebas/aceptacion/recorrido-v1.test.ts`; `paquetes/rige/adaptadores/almacen-sqlite/resoluciones.test.ts` |
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

En RF-03, obtener el JSON del código fuente entre `<script type="application/json" id="respuesta">` y `</script>`. Comparar objetos completos: el resumen embebe **agentes** de la foto; la página del agente, **valores**. Las rutas antiguas redirigen con 303 y conservan el contexto que corresponda. **Entradas** y **Hallazgos** siguen disponibles por URL y desde el resumen, y embeben sus propias respuestas actuales.

En la página del agente, **Valores efectivos** asocia cada valor con **Lo determina** y las declaraciones **Desplazadas**. Abrir **Claves no incorporadas por RIGE** y, dentro de **Ver en la consola**, **Entradas leídas** para el detalle de la foto. El **Historial** está en el resumen: conserva veinte análisis, marca la foto consultada y la más reciente y permite **Ver** y **Comparar con el anterior**.

Las ubicaciones locales con posición estructurada son enlaces a **VS Code** (`vscode://file/`): muestran el nombre corto y línea/columna, y la ruta completa en la ayuda «Abrir en VS Code». No muestran contenido ni fragmentos del archivo. Variables, referencias remotas y rutas relativas permanecen como texto; un hallazgo sin archivo mantiene el enlace a su entrada. Las anclas de hallazgos son posiciones en la respuesta actual y no identifican el mismo hallazgo entre análisis.

Para la revisión visual en navegador, capturar claro y oscuro, comprobar contraste AA, foco de teclado y ancho de 360 px. Las pruebas automatizadas no acreditan esa revisión.

## 9. Pruebas automatizadas

```bash
bun run verificar
bun test
bun run cobertura
```

Todos terminan con código **0**. Última verificación del **10/11/2026**: Windows, **1364 aprobadas, 2 omitidas, 15 pendientes y 0 fallidas**; Ubuntu, **1358 aprobadas**. Las pendientes son comparaciones que deben correr en su plataforma; las omitidas corresponden a strace y al enlace npm exclusivo de POSIX. Este recuento no sustituye la corrida Ubuntu ni las referencias contra el binario real. `cobertura` informa la trazabilidad de requisitos, escenarios, CA y oráculos, con cero errores; no es porcentaje de líneas.

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
