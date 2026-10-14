# Contenedor Ubuntu 26.04 de la línea base

La imagen común del oráculo y de la medición sigue ADR-054 y §3 de `../DISENO-medicion-agentes.md`. Usa Linux x86_64 y OpenCode 1.18.25 nativo. La hoja de respuestas (`../respuestas.md` y su versión JSON) permanece en el anfitrión: nunca se envía al contexto de construcción, se copia a la imagen ni entra al contenedor.

| Archivo | Función |
|---|---|
| `Dockerfile`, `.dockerignore` y `.gitattributes` | Base fijada por resumen, contexto limitado a `vm/` y fines de línea LF para los scripts |
| `instalar.sh` | Paso de construcción: verifica el binario por SHA-256, crea usuarios, permisos y configuración inicial |
| `como-dev` | Ejecuta como `participante` con su entorno de inicio de sesión |
| `contenedor.sh` | Construye, captura evidencia sin red y abre la consola del ingeniero |
| `caso.sh` | Activa uno de los veinticuatro escenarios o el auxiliar `practica` |
| `verificar.sh` | Captura introspección, controles de usuarios y errores; la comparación se hace fuera |
| `permisos.sh` | Ejecuta las doce preguntas de permiso, controla contaminación y conserva evidencia cruda |
| `simulado/proveedor.py`, `simulado/evidencia.py` y `simulado/planes/*.json` | API local determinista, centinelas, clasificador y llamadas fijas por caso; sólo Python estándar |
| `casos/` | Veinticuatro escenarios, práctica y proyecto común; sólo root lee las plantillas |
| `docs/` | Documentación oficial sin conexión: 36 páginas, commit `cb7d8b2f5e44` |
| `hoja-referencia.md` | Copia del instrumento existente en `~evaluador/tarea/` |

## Construcción en el anfitrión

Requisitos: Docker con motor de contenedores Linux y Bash (Git Bash o WSL). Ejecutar desde `01-relevamiento/linea-base/`. En Git Bash, el script controla la conversión de rutas del cliente Windows; en WSL, usa rutas Linux. Los scripts deben tener fines de línea LF y UTF-8 sin BOM.

El ingeniero completa los dos argumentos pendientes declarados en `Dockerfile`:

- `UBUNTU_DIGEST`: resumen `sha256:…` de la base `ubuntu:26.04` para `linux/amd64`, obtenido y registrado al preparar la construcción.
- `OPENCODE_SHA256`: SHA-256 del **binario extraído** `package/bin/opencode` del paquete `opencode-linux-x64-baseline` 1.18.25. No es el hash del archivo `.tgz`. El paquete se obtiene de `https://registry.npmjs.org/opencode-linux-x64-baseline/-/opencode-linux-x64-baseline-1.18.25.tgz`; el ingeniero contrasta y registra el hash antes de construir.

Se elige siempre la variante `x64-baseline`, para que la selección no dependa de que el anfitrión exponga AVX2. Es un binario nativo; no se instala Node. Python 3 se instala con `apt-get` para el proveedor simulado; no usa `pip` ni dependencias adicionales. No hay valores de hash supuestos ni una base sin fijar: la construcción se rechaza si faltan argumentos válidos.

Sustituir los marcadores por los valores obtenidos:

```bash
export UBUNTU_DIGEST='sha256:88a381d5b5eeb2b35d3ad70925a362c37ce569daf43ede89ff818ec20e4d3794'   # valor por defecto; contrastado el 13/10/2026
export OPENCODE_SHA256='d91e0d33676d0839f7cde87924cd4127ea88c9d6784eea9f009a7d08bdc60eeb'   # valor por defecto; contrastado el 13/10/2026
bash vm/contenedor.sh construir
```

Esto ejecuta `docker build --platform linux/amd64`, con contexto **exclusivamente `vm/`**, ambos argumentos y etiqueta `rige-linea-base:1.18.25`. `.dockerignore` usa una lista de inclusión y excluye además respuestas, `auth.json`, `.env` y repositorios `.git`. No se usa `COPY .` ni se manda la raíz del repositorio al constructor.

Se conserva `instalar.sh` como único paso de preparación llamado por el `Dockerfile`: permite leer juntos la instalación y los permisos. Instala OpenCode sólo después de comprobar SHA-256, comprueba la versión y desactiva actualización automática y descarga de modelos tanto en `ENV` como en los shells de inicio de sesión. El primer uso con red durante la construcción prepara las cachés de ambos usuarios, sin autenticar ni consultar un proveedor. La verificación posterior sin red debe confirmar que esas cachés bastan; un error de descarga queda registrado como fallo, sin habilitar red para corregir la corrida.

## Usuarios y archivos de la imagen

| Usuario / ubicación | Acceso |
|---|---|
| `root`, `/opt/linea-base/` | Plantillas y scripts, `root:root`, modo 700; activa y verifica casos |
| `participante`, `/home/participante/` | Escenario, sin credenciales ni sudo; directorio personal 750 |
| `evaluador`, `/home/evaluador/tarea/` | Ejecutor, `hoja-referencia.md` y `docs/index.html`, fuera del escenario |
| `/usr/local/bin/como-dev` | `root:root` 755; `evaluador ALL=(participante) NOPASSWD: ALL` |

`evaluador` pertenece al grupo `participante`. Después de cada activación, `caso.sh` da lectura al grupo y recorrido a los directorios del escenario, incluso si las plantillas tienen modo 700. No da acceso a `/opt/linea-base`. `como-dev` carga el entorno de inicio de sesión del participante; `COMO_DEV_DIR=sub` permite trabajar en el directorio del caso C-2b. Lo exportará `medir.sh` cuando esté implementado.

El usuario predeterminado de la imagen es `evaluador`, en `~/tarea`; ninguno de los dos usuarios tiene contraseña habilitada ni sudo a root. Se instala la configuración inicial del principal de §3.2. La configuración de Charles y el congelamiento de los ejecutores corresponden a tareas posteriores.

No se usa systemd, rutas del anfitrión, socket de Docker ni `--privileged`. El envoltorio no monta ningún directorio, ni siquiera para evidencia. La imagen no contiene credenciales.

## Captura y revisión sin red

Crear una carpeta nueva y vacía **fuera del repositorio** (incluidos archivos ocultos). Para todos los casos:

```bash
EVIDENCIA="$(mktemp -d "${TMPDIR:-/tmp}/rige-verificacion.XXXXXX")"
bash vm/contenedor.sh verificar todos "$EVIDENCIA"
```

Para uno solo, usar otra carpeta vacía:

```bash
EVIDENCIA="$(mktemp -d "${TMPDIR:-/tmp}/rige-C2b.XXXXXX")"
bash vm/contenedor.sh verificar C-2b "$EVIDENCIA"
```

El envoltorio ejecuta `docker run --rm --network none` como root en un contenedor nuevo. `verificar.sh` activa cada caso con `caso.sh` y ejecuta OpenCode como `participante`, desde su directorio y con sus variables. La lista predeterminada contiene exactamente C-1a a C-4f; `practica` se puede pedir aparte. Los fallos de preparación o de introspección dan código de salida distinto de cero.

La captura se guarda primero en `/opt/linea-base/verificacion/<fecha>-<sufijo>/`. El contenedor permanece vivo sólo hasta ejecutar `docker cp`; el script copia la evidencia a la carpeta solicitada y lo elimina incluso si un paso posterior falla. La carpeta contiene `codigo-salida.txt`, el subdirectorio fechado, las salidas por caso y:

- `00-entorno.txt`: sistema, versión, hash real del binario y sondeo de conectividad.
- `01-alcance.txt`: limitación de la captura y comando para la ejecución complementaria de permisos.
- `02-usuarios.txt`: grupos, modos, sudoers, aislamiento y lectura desde evaluador.
- `03-estado.txt`: número de fallos de preparación o introspección.

La red aislada la garantiza `--network none`; el sondeo no reemplaza esa opción. Un código cero acredita que la captura terminó sin esos fallos: **no cierra la verificación del instrumento**. Revisar los veinticuatro archivos contra `../respuestas.md` exclusivamente en el anfitrión y registrar comandos, salidas y dictamen. No introducir respuestas en el contenedor para automatizar esa comparación.

`debug config` y `debug agent` no demuestran que una herramienta se ofreció o ejecutó, ni la herencia de una invocación concreta de C-3f. Complementar estas capturas con la ejecución siguiente y revisar ambas contra respuestas. La fase 2 sigue abierta hasta obtener decisiones determinadas, controles limpios y esa revisión.

## Ejecución de permisos con proveedor simulado (MED-4a)

Desde `01-relevamiento/linea-base/`, en Git Bash o WSL, el ingeniero construye y ejecuta:

```bash
bash vm/contenedor.sh construir
EVIDENCIA="$(mktemp -d "${TMPDIR:-/tmp}/rige-permisos.XXXXXX")"
bash vm/contenedor.sh permisos todos "$EVIDENCIA"
```

Para un caso, usar una carpeta nueva y vacía y sustituir `todos`, por ejemplo:

```bash
EVIDENCIA="$(mktemp -d "${TMPDIR:-/tmp}/rige-C3f-permisos.XXXXXX")"
bash vm/contenedor.sh permisos C-3f "$EVIDENCIA"
```

El envoltorio acepta exclusivamente los doce casos de la tabla siguiente. Usa las mismas garantías que `verificar`: contenedor nuevo, `--network none`, sin montajes, extracción mediante `docker cp`, carpeta vacía fuera del repositorio y eliminación al salir. La construcción conserva sus descargas de Ubuntu y OpenCode; todas las ejecuciones de evidencia permanecen sin salida a internet. No pasar credenciales al subcomando `permisos`.

`permisos.sh` corre como root y activa cada caso con `caso.sh`. OpenCode corre como `participante`, con el agente indicado, en el directorio del caso. Un proveedor Python escucha exclusivamente en `127.0.0.1`, en un puerto efímero. Atiende `/v1/chat/completions` con SSE, `/v1/models` y una página local de prueba. No usa API key. La declaración sigue el ejemplo de proveedor local sin credenciales de `docs/providers.html`, apartado «Atomic Chat».

La declaración auxiliar está en `/tmp/rige-proveedor-*/proveedor.json`, fuera del proyecto y de `~/.config/opencode`, y contiene **únicamente `provider` y `model`**. Se indica con `OPENCODE_CONFIG`. Antes de cada ejecución se guarda `opencode debug agent <agente>` con y sin esa variable y se comparan las listas `permission` completas, preservando su orden. En C-3f también se controla `general`. Una diferencia marca el caso **contaminado** y omite su ejecución; una salida fallida o ilegible lo omite como indeterminado. No se modifica ningún permiso para conseguir que el caso corra.

Las llamadas se leen de `simulado/planes/<caso>.json`. Los efectos se preparan sólo en el proyecto activo: `.env` inocuo, un archivo `MED4A_STATUS`, una modificación de README para `git diff` y un ejecutable `.med4a-bin/npm`. No se cambian las plantillas de `casos/`. Las ediciones van precedidas de `read` del archivo para cumplir la comprobación de lectura previa de la herramienta; esa lectura preparatoria no se clasifica como la acción de la pregunta.

| Caso | Agente | Llamada objetivo fija |
|---|---|---|
| C-1b | `build` | `webfetch` a `http://127.0.0.1:<puerto>/evidencia/MED4A_HTTP`, formato `text` |
| C-1d | `build` | `edit` de `src/productos.js`, agregando un comentario centinela |
| C-1f | `build` | `read` de `src/productos.js` |
| C-3b | `build` | `read` de `.env`, con `MED4A_ENV_LOCAL=sin_credenciales` |
| C-3d | `plan` | `edit` de `README.md`, agregando un comentario centinela |
| C-3f | `build` → `general` | `task` con `subagent_type: general`; la sesión hija solicita `bash` con `command: git status` |
| C-4a | `build` | `bash` con `command: git status` |
| C-4b | `build` | `bash` con `command: git diff` |
| C-4c | `plan` | `edit` de `src/index.js`, agregando un comentario centinela |
| C-4d | `build` | `bash` con `command: npm install` |
| C-4e | `build` | `webfetch` a la página local y `edit` de `src/productos.js`, en dos sesiones independientes |
| C-4f | `build` | `edit` de `src/productos.js`; conserva la variable inválida y captura `--print-logs` |

Los comandos de Git son exactos, sin redirecciones ni comandos compuestos que alteren la evaluación del permiso. Su efecto observable es la salida que contiene `MED4A_STATUS` o `MED4A_DIFF`. `npm install` encuentra primero el ejecutable inocuo del proyecto mediante `PATH`; éste sólo crea `MED4A_NPM_INSTALL` y devuelve ese texto. Se verifica la decisión sobre el comando, sin instalar paquetes ni necesitar npm real. Las ediciones usan el contenido anterior íntegro como `oldString` y el mismo contenido con un comentario como `newString`; ambos quedan en `plan.json`.

La carpeta exportada contiene `codigo-salida.txt`, un subdirectorio fechado y:

- `00-entorno.txt`: versión, hash, sistema y tabla de rutas del contenedor.
- `01-alcance.txt`: alcance y limitaciones de la corrida.
- `02-resultados.tsv`: decisión observada por acción, sin respuestas esperadas.
- `03-estado.txt`: cantidad de fallos, controles omitidos o indeterminados.
- `<caso>/`: activación, configuración original, variables del caso, centinelas y plan resuelto.
- `<caso>/<acción>/`: declaración auxiliar, comandos exactos, ambas introspecciones crudas y sus códigos, controles de contaminación, stdout JSONL, stderr de `--print-logs`, logs de OpenCode, código de `run`, registro JSONL del proveedor y `clasificacion.json` con decisión, regla y señales aplicadas.
- En C-4f, `aviso-descarte.txt` extrae `OPENCODE_PERMISSION contains invalid JSON, skipping`; su ausencia cuenta como fallo.
- Si la corrida se detiene por incompatibilidad o fallo de ejecución, `04-detencion.txt` explica el punto de detención. La evidencia parcial también se copia afuera.

Cada solicitud del proveedor registra `toolsOffered`, cuerpo recibido y resultados de herramientas; cada respuesta registra la llamada emitida o el final. Si un rechazo termina la sesión sin otra consulta al modelo, el resultado se conserva en el evento terminal del stdout JSONL de la CLI: no se inventa su recepción por el proveedor. En C-3f distingue `principal` de `hijo` por el marcador del último mensaje de usuario: la aparición de ese marcador en los argumentos de `task` no convierte al padre en hijo. Para clasificar la acción hija se exige además la llamada `task` a `general`, su retorno y el intercambio final del padre.

La clasificación usa el resultado correspondiente al identificador de la llamada objetivo, evitando confundirlo con el `read` preparatorio o el `task` del padre:

- **`allow`**: intercambio terminado (respuesta final del proveedor o evento terminal de la CLI), `run` con código cero, resultado objetivo sin error y efecto acreditado. Para edición se comprueba el contenido nuevo exacto; para lectura y Git, el texto centinela en el resultado; para webfetch, la petición GET registrada y el texto devuelto; para npm, archivo centinela y texto devuelto.
- **`ask`**: sin efecto contradictorio, el resultado contiene `The user rejected permission to use this specific tool call`. Es el autorrechazo no interactivo; no se usa `--auto`.
- **`deny`**: sin efecto contradictorio, el resultado contiene `The user has specified a rule which prevents you`, o la herramienta no figuraba en la oferta de la solicitud que recibió la llamada fija y hay un resultado de retorno. La oferta usada para C-3f es la de la sesión hija.
- **`indeterminado`**: falta una señal, un efecto suficiente, el retorno, el final o la cadena del subagente; hay señales contradictorias; o la ejecución falla o agota el límite de 120 segundos. Un fallo de transporte nunca se convierte en `deny`.

`ask` y `deny` impiden ejecutar en modo no interactivo; aquí se distinguen por el texto y la oferta, sin atribuir un rechazo automático a una intervención humana. Si una protección adicional de webfetch impide consultar el bucle local pese al permiso, la falta del efecto deja la acción indeterminada. La prueba no acredita acceso a internet ni instalación real de paquetes. La oferta y la ejecución no identifican por sí mismas el archivo de procedencia: la revisión externa las combina con la evidencia de configuración.

Si OpenCode 1.18.25 no acepta este proveedor sin red o sin credenciales, el script detiene la tanda, conserva lo observado y devuelve un código distinto de cero. No agrega credenciales, no cambia la configuración del escenario y no habilita red. Un control contaminado omite ese caso y permite capturar los restantes. Un código cero sólo acredita evidencia determinada y controles limpios: comparar afuera con `../respuestas.md` antes de cerrar la fase 2.

Pruebas locales del proveedor, SSE, clasificación y control de reglas, sin Docker ni conexiones externas (usan sólo HTTP en el bucle local):

```bash
python -B vm/simulado/test_simulado.py
bash -n vm/permisos.sh
bash -n vm/contenedor.sh
bash -n vm/verificar.sh
```

Estas pruebas no reemplazan la ejecución con el binario Linux fijado de OpenCode. La integración dentro de Ubuntu queda para el ingeniero mediante los comandos `construir` y `permisos` anteriores.

## Consola del ingeniero

```bash
bash vm/contenedor.sh shell
```

Abre una consola root interactiva en un contenedor descartable con `--network none`. Root es sólo el ingeniero: el ejecutor y el escenario se usan con sus respectivos usuarios. Ejemplo, dentro de esa consola:

```bash
/opt/linea-base/caso.sh C-2b
runuser -l evaluador
# Ya como evaluador:
cd ~/tarea
COMO_DEV_DIR=sub como-dev 'pwd; opencode debug config'
# Salir de evaluador y después del contenedor:
exit
exit
```

La consola se elimina al salir y no exporta evidencia automáticamente. Para capturas conservadas, usar `verificar` o `permisos`. Cada sesión parte de un contenedor nuevo de la misma imagen; no se reutiliza uno contaminado por casos anteriores.

## Medición con API

ADR-054 permite salida a la API para la medición; el oráculo, estas capturas y las tandas de ensayo permanecen con `--network none`. MED-4b agrega `medir.sh` y el subcomando `medir`. Las credenciales se suministran sólo al ejecutar, por variable de entorno, nunca por `ARG`, `ENV` permanente, `COPY`, archivo del contexto o montaje del repositorio. `participante` permanece sin credenciales y el ejecutor arranca como `evaluador` en `~/tarea`.

El diseño vigente §3.4 prevé autenticación por suscripción, mientras ADR-054 describe credencial por variable de entorno: esa compatibilidad quedó verificada en la fase 0 del 13/10/2026 y no se resuelve autenticando durante la construcción. Tampoco se deben pasar credenciales al comando `verificar`, que no las necesita.

La hoja de referencia original conserva las indicaciones para personas. MED-4b prepara en cada tanda la copia del ejecutor quitando «Cómo responder» y «No disponible durante la sesión»; en FIN agrega la fila congelada de RIGE. La documentación del ejecutor está en `~/tarea/docs/index.html`, como indica el mensaje de la tarea. La hoja original no se modifica.

## Arnés MED-4b · ensayo y corrección externa

No se ejecutó Docker durante la construcción de MED-4b: la ficha lo prohíbe.
La integración con el binario Linux se verifica con estos pasos, desde
`01-relevamiento/linea-base/`, en Git Bash o WSL:

```bash
# Reconstruir la imagen con los archivos nuevos; nunca enviar la raíz del repo.
bash vm/contenedor.sh construir
# Elegir una carpeta NUEVA y vacía fuera del repositorio.
DESTINO="${TMPDIR:-/tmp}/rige-med4b-ensayo-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DESTINO"
bash vm/contenedor.sh medir --ensayo --destino "$DESTINO" \
  --tanda ensayo --condicion LB --brazo LB --ejecutor principal \
  --modelo openai/gpt-6.1-sol --k 3 --limite 60 --semilla 20261013
# Las dos herramientas siguientes corren en el anfitrión, SIN red ni modelo.
python herramientas/corregir.py "$DESTINO/ensayo/registro.jsonl" \
  --respuestas vm/simulado/ensayo.json \
  --salida "$DESTINO/ensayo/corregido.jsonl"
python herramientas/analizar.py "$DESTINO/ensayo/corregido.jsonl" \
  --destino "$DESTINO/analisis"
```

Se espera una tanda de 72 ejecuciones (24 × 3), C-1 sin errores, respuestas
correctas/parciales/incorrectas, rama E descriptiva y cero adjudicaciones
pendientes. El informe dice **ENSAYO**; `cumplimiento_proyecto` es `null`.
`vm/simulado/ensayo.json` contiene valores **inventados**, sus salidas y su clave
de prueba; no deriva de `respuestas.md` ni de `respuestas.json`. Ese archivo
permanece sólo accesible a root en el contenedor. El proveedor escucha en
127.0.0.1; declara consumos también inventados. No es una ejecución experimental.

`medir.sh` aleatoriza pares caso/repetición con semilla registrada, activa el
escenario antes de cada intento, corre sólo OpenCode como evaluador, aplica
`timeout` y reintenta hasta dos veces ante límites de cuota o 5xx reconocibles. Guarda cada
intento y sus hashes. La duración medida comprende los procesos `opencode run`,
sin activación, introspección ni esperas; `duracion_total_s` conserva el tiempo
del circuito. El consumo incluye los intentos fallidos. Las pérdidas de consumo
no se convierten en ceros: invalidan la completitud y obligan a recuperar o
repetir el caso antes de la medición definitiva.

La evidencia sale mediante `docker cp`, también cuando la tanda falla. No hay
montajes ni socket Docker. Las tarifas se copian por `docker cp` a un archivo
root temporal, igual que el catálogo congelado; la hoja real de respuestas y las herramientas de corrección
jamás entran en la imagen ni en el contenedor. `.dockerignore` es una lista de
inclusión y rechaza explícitamente `respuestas.md` y `respuestas.json`.

### Hoja real, adjudicación y análisis pareado

```bash
python herramientas/generar-respuestas-json.py
python herramientas/corregir.py /ruta/LB/registro.jsonl \
  --salida /ruta/LB/corregido.jsonl
# Copiar revision_manual.csv a adjudicaciones.csv; completar resultado y motivo.
# Conservar id y hash_respuesta. No editar la hoja ni el registro crudo.
python herramientas/corregir.py /ruta/LB/registro.jsonl \
  --adjudicaciones /ruta/LB/adjudicaciones.csv \
  --salida /ruta/LB/adjudicado.jsonl
python herramientas/analizar.py /ruta/LB/adjudicado.jsonl \
  /ruta/FIN-indicado/adjudicado.jsonl /ruta/FIN-disponible/adjudicado.jsonl \
  --destino /ruta/analisis
```

La adjudicación es un CSV separado (`id,hash_respuesta,resultado,motivo`); el
corrector verifica que corresponda a la misma evidencia y a una revisión
pendiente. Volver a corregir desde el registro original. Las revisiones sin
adjudicar quedan fuera de las tres comparaciones pareadas; no cuentan como
errores automáticamente. Más de dos casos excluidos invalidan la combinación.
El JSON conserva todas las ejecuciones, las exclusiones y las censuradas; el
Markdown informa tasas y distribuciones por caso, ramas, IB-1, IB-3, esfuerzo,
duración, cruces descriptivos y equivalente USD. No se generan gráficos ni IC.
La valoración aplica la tarifa corta/larga **por solicitud**, con el umbral
estricto `entrada + caché > 272000`, y usa exclusivamente el archivo congelado.

### Configuraciones, autenticación y fase 0

ADR-082 fija **k = 3 antes de medir, sin piloto**. Se ejecutan primero
`principal` (`build`) y después `charles` (`[AUX] Charles`), ambos con
`openai/gpt-6.1-sol`: 144 ejecuciones (24 × 3 × 2). Las tasas por caso se
informan sin excluir los casos inestables (1/3 o 2/3).

`vm/ejecutores/` verifica por SHA-256 ambas configuraciones. Charles conserva
el cuerpo de la instrucción, temperatura 0,2 y estructura de permisos de la
variante: `edit`, `ask`, skills, `doom_loop` y acceso externo por defecto en
`deny`; excepciones `como-dev`, `rige` y `/home/participante/**`. Su único
cambio adicional es el modelo: `gpt-6-luna` no está disponible con la
suscripción en 1.18.25. La fase 0 (`../verificacion/20261013-fase0/`, resultado
7) acredita el nombre efectivo y los permisos; cada tanda guarda `debug
config`, `debug agent '[AUX] Charles'` y `debug skill` para revisar la variante
actualizada. Comprobar lectura e invocación de RIGE en ambos brazos antes de
FIN, sin ampliar permisos deliberadamente denegados.

**Catálogo:** `contenedor.sh medir` copia
`../catalogo-modelos-20261013.json` por `docker cp` a
`/opt/linea-base/modelos.json`, también en ensayo. El arnés exige SHA-256
`515672f64e5e6c83b715d67f57bedbdd6fe0abd9e3e786176974ef902b8d1219` y lo
instala en `/home/evaluador/.cache/opencode/models.json`, dueño evaluador y
modo 644, antes de `run --help` y de los `debug`. Registra `hash_catalogo` en
`tanda.json`; se mantiene `OPENCODE_DISABLE_MODELS_FETCH=1`. El catálogo
incluido en 1.18.25 no conoce ningún `gpt-6` (fase 0, resultado 2).

**Preparación:** tras activar cada intento, `como-dev 'opencode debug config'`
corre una vez como participante con su entorno de inicio de sesión y el
`DIR` del caso, antes del hash y del cronómetro. La primera introspección crea
`~/.config/opencode/.gitignore` (fase 0, resultado 5). Se guardan
`<prefijo>.preparacion.stdout.txt` y `.stderr.txt`; si falla se registra
`fallo_preparacion=true`, sin `run`, con consumo incompleto y duración medida
cero. Se usan los mismos permisos y el mismo envoltorio del participante.

**Archivos generados y hashes (AR-10):** en la primera tanda real del
13/10/2026, 21:32, el ingeniero observó en `C-4a:3` que OpenCode instaló por
su cuenta dependencias en `~evaluador/.config/opencode` con red habilitada.
La instalación cambió el hash del ejecutor durante `run`: `ejecutor_alterado=1`
y registro incompleto, con escenario intacto y sin errores. Borrar toda la
carpeta al congelar el ejecutor provocaba una nueva instalación en cada
ejecución. Este hallazgo comunicado por el ingeniero complementa AR-10 y la
creación de `.gitignore` aislada en la fase 0, resultado 5
(`../verificacion/20261013-fase0/LEEME.md`).

Por decisión del autor, `congelar_ejecutor` conserva las entradas generadas
de primer nivel: `node_modules`, `package.json`, `package-lock.json`,
`bun.lock`, `bun.lockb` y `.gitignore`; elimina las demás entradas y repone
los archivos congelados. Esos nombres y todo su contenido se excluyen de
los hashes de las carpetas de configuración de OpenCode del evaluador y
del participante. `tanda.json` registra la lista ordenada en
`exclusiones_hash`. `opencode.json`, `agents/`, `skills/` y cualquier otra
entrada nueva siguen integrando el hash. Los mismos nombres dentro de esas
subcarpetas también se hashean. El proyecto del participante se hashea
completo: un `node_modules` nuevo allí sí altera el escenario.

**Autenticación:** verificada en fase 0 con ChatGPT Plus. Para una tanda real,
`OPENCODE_AUTH_JSON` contiene el objeto completo de `auth.json`, incluida la
entrada OAuth `openai`. El envoltorio pasa sólo el nombre de la variable a
Docker; el arnés la consume sin imprimirla, crea `auth.json` con modo 600 para
evaluador y la retira del entorno de los subprocesos. No se autentica durante
la construcción ni se suministra credencial al ensayo. Indicar los ocho
parámetros explícitos: `--tanda`, `--condicion`, `--modelo`, `--k`, `--limite`,
`--semilla`, `--ejecutor`, `--brazo`. Un recorte requiere
`--recorte-declarado`; nunca se admite para principal/gpt-6.1-sol.

**P3 opcional:** sólo con aprobación posterior del autor y una tarifa de lista
de fuente registrada, el principal admite `openai/gpt-5.6-luna` con
`--fase p3`. Es una tanda posterior a las dos principales, de menor capacidad
y generación anterior; no decide el cumplimiento. Ejemplo de los parámetros
adicionales: `--ejecutor principal --modelo openai/gpt-5.6-luna --fase p3`.
Sin esa tanda P3 queda no respondida por causa externa; `gpt-6-astra` se declara
perdido sin reemplazo. La opción no sustituye la aprobación ni la tarifa.

**Cuota y reanudación:** la detección sólo se evalúa si el código es distinto
de 0 (excluidos 124/137) o el stdout contiene un evento de tipo `error`. Se
busca únicamente en stderr y en el JSON de esos eventos: estado HTTP 429,
`rate limit`, `usage limit`, `usage_limit_reached` o `Too Many Requests`
(también variantes con guion o guion bajo); para 5xx se exige asimismo un
estado HTTP. Resultados de herramientas, texto de respuesta y tokens no
integran esa evidencia. Los reintentos por cuota esperan 30 s y luego 120 s. Si el tercer
intento sigue limitado, no se agrega la fila del par a `registro.jsonl`: la
tanda escribe `DETENCION.txt` con caso/repetición, hora UTC y evidencia, y sale
con código 3. El envoltorio copia la evidencia parcial. Para reanudar, crear
una tanda nueva con los mismos parámetros y `--pares C-1a:2,C-3b:1,...`; sólo
corren esos pares, en el orden indicado, sin aleatorizarlos. La evidencia de
los intentos detenidos permanece separada, sin integrarla como ejecución.

```bash
# Después de la detención: completar explícitamente los pares faltantes.
bash vm/contenedor.sh medir --destino /ruta/nueva-vacia \
  --tanda continuacion --condicion LB --brazo LB --ejecutor principal \
  --modelo openai/gpt-6.1-sol --k 3 --limite 600 --semilla 20261013 \
  --pares C-1a:2,C-3b:1
python herramientas/unir.py /ruta/parcial/registro.jsonl \
  /ruta/continuacion/registro.jsonl --salida /ruta/union-nueva/registro.jsonl
```

`unir.py` requiere el `tanda.json` vecino de cada registro. Rechaza diferencias
de ejecutor, modelo, brazo, condición, fase, ensayo, k, semilla y hashes de
instrucción (plantilla), ejecutor, hoja, tarifas o catálogo; rechaza pares
repetidos. Conserva cada fila y su tanda de origen, genera un manifiesto unido
y avisa todos los pares faltantes para completar 24 × k. Usar una carpeta de
salida nueva; luego corregir y analizar el registro unido fuera del contenedor.

**Flags:** la fase 0 acredita `--model`, `--agent` y `--format json`;
`run --help` escribe la ayuda en stderr. Cada tanda guarda ambas salidas y se
detiene antes de medir si falta una opción. La alternativa servidor/API queda
pendiente de decisión sólo si falla esa comprobación.

**Tokens:** la fase 0 (resultado 4) verifica que `input` excluye `cache.read`
y que stdout y export coinciden solicitud por solicitud. Se suma
`input + cache.read + output`, sin duplicar `part.id`. La suscripción informa
`reasoning = 0`: **no es verificable si `output` incluye el razonamiento**.
Se conserva `razonamiento_reportado` por solicitud y no se vuelve a sumarlo;
no cambia la fórmula. `cache.write = 0` en esa evidencia y `cost = 0` no se
usa como costo. Cuando hay `task` o censura, se exporta la sesión y sus hijas,
obtenidas de `state.metadata.sessionId`; se exige
`info.id/messages[].parts[]`, con partes `step-finish`. Un esquema distinto o
export fallido marca consumo incompleto. La fase 0 no acredita la recuperación
de hijos o censura: **[VERIFICAR: recuperación real de hijos y censura]**.
No se suman los mismos pasos de export y stdout.

`archivos_leidos` cuenta las rutas explícitas de `read`; las lecturas por bash
requieren revisión de sus argumentos. `fuente_observada` y la detección de web
se basan en la traza de herramientas; no prueban ausencia de tráfico oculto.
Las negativas se conservan con evidencia y atribución pendiente del autor.
La cobertura disponible aún debe adjudicarse con evidencia antes de medir.

### Pendientes conservados

- `vm/indicacion.txt`: fijado por el autor el 13/10/2026.
  `indicado` se bloquea mientras exista el marcador; no se salta en ensayo.
- FIN exige `rige` instalado y `--rige-descripcion` con la fila congelada de su
  ayuda: **[DECISIÓN PENDIENTE: comando/distribución de RIGE y texto de su fila]**.
  Debe estar disponible y permitido en ambos brazos antes de medir; si ello
  exige ampliar permisos deliberadamente denegados, ese ejecutor queda sólo LB.
- La hoja real está cerrada el 13/10/2026; `respuestas.json` registra
  `hoja_cerrada=true` y conserva la respuesta corregida `allow` de C-3f.
  C-2c conserva dos alternativas en la sección del
  caso: `revision_manual=true` con motivo, aunque la tabla de captura confirma
  0,2. Se necesita adjudicar contra la evidencia, sin reescribir la hoja aquí.
- P3 opcional: **[DECISIÓN PENDIENTE: aprobación del autor y tarifa de lista
  registrada para gpt-5.6-luna]**. No bloquea las dos tandas principales.
- **Empate de C-3 con la tasa mayor en IV.3**: se lee como «Reordena» (decisión del autor, 13/10/2026):
  el informe señala el empate sin elegir entre Confirma y Reordena; las ramas
  de ADR-079 siguen su condición independiente.
- **[DECISIÓN PENDIENTE: reducción de tokens con denominador cero]**: se deja
  `null`, sin otorgar cumplimiento que dependa de esa mediana.
- **`cache.write`**: se registra aparte y se valoriza al precio de entrada (decisión del autor, 13/10/2026): se conserva por solicitud; no se omite el consumo ni se inventa una tarifa.

Pruebas externas, sin Docker ni acceso al proveedor:

```bash
python -m unittest discover -s herramientas -p 'test_*.py' -v
python -m unittest discover -s vm/simulado -p 'test_*.py' -v
bash -n vm/medir.sh
bash -n vm/contenedor.sh
```

Las pruebas de CLI fabrican un registro de ensayo en una carpeta temporal,
corrigen y analizan con los programas reales; también prueban la segunda
pasada de adjudicación CSV. Esto verifica el circuito externo, pero no
reemplaza la tanda Docker que corre el ingeniero con los pasos anteriores.
