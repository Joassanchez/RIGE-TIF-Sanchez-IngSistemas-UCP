# Medición ecológica y detección · MED-9

Implementa las líneas de base de ADR-091 y ADR-092 y el análisis de ADR-093.
La ampliación autorizada MED-11 incorpora N-1…N-7, N-9…N-15,
S-1…S-3 y los valores V-5…V-8 (candidatos N-16…N-19), con
k=1. La hoja ecológica pasa a exploratoria (`hoja_cerrada=false`), con hashes
en `exploracion.json`. Antes de medir o ensayar N/S hay que admitirlas con las
sondas nativas sin cuota: [procedimiento y tabla de tareas](../verificacion/20261015-exploracion/LEEME.md).
N-8 se retira por falta de un inicializador determinista de aprobaciones.
Son 22 candidatos contando la retirada, por debajo del tope autorizado de 23.
Los valores exploratorios se informan aparte y no cuentan como problemas de
permisos ni como controles V históricos. N-11 preserva y comprueba enlaces
simbólicos y archivos compartidos; su preparación admite descriptores de enlace.
Los ejemplos k=3 siguientes corresponden al protocolo histórico; para MED-11
usar `--k 1`, sin criterio de cumplimiento ni rama de respaldo.
Ejecutar estos comandos desde `01-relevamiento/linea-base/`, en Bash (Git Bash
en Windows). Python 3.11 o posterior en el anfitrión; Docker para el ingeniero.
No se requieren paquetes Python externos.

## Generar y construir

```bash
python herramientas/generar-ecologica.py --destino ecologica
bash vm/contenedor.sh construir
```

El generador lee las fuentes `espec.py`, `corpus.py`, `tareas.md` y
`deteccion.md`. `escenarios.json` contiene exclusivamente archivos, variables,
directorio, tarea e instrucción pública. Las respuestas, sus hashes de fuentes,
objetivos, guardas, variantes y clasificaciones permanecen en el anfitrión.
La detección conserva el cierre; la ecológica declara la exploración ADR-095.

El contexto de construcción es solamente `vm/`, con lista de inclusión.
`contenedor.sh` copia **solamente** `escenarios.json`, `tareas.md` y `deteccion.md`
desde esta carpeta mediante `docker cp`. Calcula sus SHA-256 en el anfitrión;
el arnés comprueba cada copia antes de medir y los registra en
`tanda.json:hashes_entradas`. Nunca copiar esta carpeta completa al contenedor.

## Ensayar sin credenciales

Elegir una carpeta fuera del repositorio. Cada destino de una tanda debe
existir y estar vacío; el contenedor no monta directorios del anfitrión.

```bash
EVIDENCIA="$HOME/rige-med9-20261015"
mkdir -p "$EVIDENCIA"
unset OPENCODE_AUTH_JSON
for dimension in ecologica deteccion; do
  mkdir -p "$EVIDENCIA/ensayo-$dimension"
  bash vm/contenedor.sh medir --ensayo --dimension "$dimension" \
    --k 1 --semilla 20261015 --limite 600 \
    --destino "$EVIDENCIA/ensayo-$dimension"
  python "herramientas/corregir_$dimension.py" \
    "$EVIDENCIA/ensayo-$dimension/ensayo/registro.jsonl" \
    --respuestas "ecologica/respuestas-$dimension.json" \
    --salida "$EVIDENCIA/ensayo-$dimension/ensayo/corregido.jsonl"
done
for dimension in ecologica deteccion; do
  otra=ecologica
  if [[ $dimension == ecologica ]]; then otra=deteccion; fi
  python herramientas/analizar.py \
    "$EVIDENCIA/ensayo-$dimension/ensayo/corregido.jsonl" \
    --dimension "$dimension" \
    --complemento "$EVIDENCIA/ensayo-$otra/ensayo/corregido.jsonl" \
    --destino "$EVIDENCIA/ensayo-$dimension/analisis"
done
```

La red del ensayo es `none`; proveedor y página de `webfetch` escuchan solo en
127.0.0.1. Los consumos son inventados y los registros declaran `ensayo: true`.
El proveedor pide `read`, `edit` y `write` a OpenCode; nunca aplica las ediciones él mismo.
Los planes producen: M-1 correcta, M-2 colateral, M-3 sin efecto, M-4 incorrecta,
M-5 sin respuesta. Las otras tareas y los controles tienen cambios correctos.
La corrección registra `discrepancia_oraculo: []` cuando ejecución y evaluador
estático coinciden; no se fuerza artificialmente esa coincidencia en el arnés.
En detección, D-A contiene detección, falso positivo y otra; D-B, sin respuesta.
Se puede repetir el ensayo de ambos ejecutores con `--ejecutor charles` y un
destino vacío distinto. No mezclar resultados de ensayo con datos reales.

## Medir las líneas de base

Antes de ejecutar, cargar `OPENCODE_AUTH_JSON` en el entorno con el objeto de
autenticación del evaluador que contiene el proveedor `openai`. No escribirlo
en comandos, archivos del repositorio ni registros. En la tanda real, el
participante recibe la misma credencial para las sesiones anidadas (ADR-098).
En ensayo no debe haber `OPENCODE_AUTH_JSON`; se usa el proveedor simulado.
Las tandas usan `build` o `[AUX] Charles`, modelo
`openai/gpt-6.1-sol`, k = 3, límite de **ejecución del agente** de 600 s y semilla
20261015. La preparación y las sondas del oráculo quedan fuera del cronómetro.
El banco vigente tiene 46 casos ecológicos (138 pares con k = 3), 11 de
detección (33 pares) y 10 M de contraste fuera del árbol (30 pares).
Para ejecutar en paralelo, usar los comandos de «Las seis tandas en cuatro
contenedores», incluido el ensayo final por ese mismo lanzador.

```bash
for dimension in ecologica deteccion; do
  for ejecutor in principal charles; do
    tanda="LB-$dimension-$ejecutor"
    mkdir -p "$EVIDENCIA/$tanda"
    bash vm/contenedor.sh medir --dimension "$dimension" \
      --tanda "$tanda" --ejecutor "$ejecutor" \
      --modelo openai/gpt-6.1-sol --k 3 --limite 600 --semilla 20261015 \
      --condicion LB --brazo LB --destino "$EVIDENCIA/$tanda"
  done
done
```

Se conservan el orden por semilla, `--casos M-1,M-2`,
`--pares M-1:2,M-2:1` y los tres intentos ante cuota/errores transitorios.
La cuota persistente detiene la tanda con `DETENCION.txt` y conserva la evidencia.
Para retomar, seleccionar solo los pares pendientes y otro destino vacío.
Corregir cada registro parcial en su directorio original y pasar todos los
corregidos como argumentos posicionales de `analizar.py`; no usar el unificador
histórico de casos C para estas dimensiones. El análisis rechaza duplicados o
repeticiones incompletas.

## Sonda fuera del árbol

Solo M-1 a M-10, descriptiva, con los ejecutores históricos de modificación:
trabajo en `/home/evaluador/tarea`, sin variable de exclusión ni envoltorio,
instrucción con la ruta absoluta del proyecto. No mezclarla con la línea de base
dentro del árbol al calcular validez o rama de respaldo.

```bash
for ejecutor in principal charles; do
  tanda="contraste-$ejecutor"
  mkdir -p "$EVIDENCIA/$tanda"
  bash vm/contenedor.sh medir --dimension ecologica --fuera-del-arbol \
    --tanda "$tanda" --ejecutor "$ejecutor" \
    --modelo openai/gpt-6.1-sol --k 3 --limite 600 --semilla 20261015 \
    --condicion LB --brazo LB --destino "$EVIDENCIA/$tanda"
  python herramientas/corregir_ecologica.py \
    "$EVIDENCIA/$tanda/$tanda/registro.jsonl" \
    --respuestas ecologica/respuestas-ecologica.json \
    --salida "$EVIDENCIA/$tanda/$tanda/corregido.jsonl"
  python herramientas/analizar.py \
    "$EVIDENCIA/$tanda/$tanda/corregido.jsonl" --dimension ecologica \
    --destino "$EVIDENCIA/$tanda/analisis"
done
```

## Corregir y analizar afuera

```bash
for ejecutor in principal charles; do
  for dimension in ecologica deteccion; do
    tanda="LB-$dimension-$ejecutor"
    python "herramientas/corregir_$dimension.py" \
      "$EVIDENCIA/$tanda/$tanda/registro.jsonl" \
      --respuestas "ecologica/respuestas-$dimension.json" \
      --salida "$EVIDENCIA/$tanda/$tanda/corregido.jsonl"
  done
  for dimension in ecologica deteccion; do
    otra=ecologica
    if [[ $dimension == ecologica ]]; then otra=deteccion; fi
    tanda="LB-$dimension-$ejecutor"
    complemento="LB-$otra-$ejecutor"
    python herramientas/analizar.py \
      "$EVIDENCIA/$tanda/$tanda/corregido.jsonl" --dimension "$dimension" \
      --complemento "$EVIDENCIA/$complemento/$complemento/corregido.jsonl" \
      --destino "$EVIDENCIA/$tanda/analisis"
  done
done
```

La corrección es mecánica, sin modelo de lenguaje. En permisos exige decisiones
ejecutadas **antes y después**: no completa un oráculo ausente con `debug agent`.
Los controles V usan valores de `debug agent`. Las guardas alteradas se conservan
como colaterales aunque el objetivo siga sin efecto (M-8 ingenua). El cambio de
herramientas derivado de cambiar de modelo no se considera otra opción editada.

El análisis informa éxito declarado falso por tarea (problema: al menos 1/3),
controles V, discrepancias y medianas de tokens. ID-1 es la proporción de defectos
detectados en al menos 2/3 de las repeticiones; ID-2 incluye el detalle por ejecución.
La rama de respaldo requiere ambas líneas de base completas y válidas, de la misma
combinación y k: menos de tres tareas M con problema, ID-1 ≥ 90 % y cero falsos
positivos. Con controles V problemáticos o evidencia incompleta no se calcula.
Charles se informa separado. Esta ficha prepara LB y contraste; no habilita FIN.
El umbral secundario de tokens del 50 % sigue provisorio según ADR-093.

## Aislamiento y hechos verificados

**Datos aportados por el ingeniero, 14/10/2026, OpenCode 1.18.25:** trabajar desde
el proyecto carga su configuración; `OPENCODE_DISABLE_PROJECT_CONFIG=1` excluye
`opencode.json` y `.opencode/`; git del evaluador necesita `safe.directory = *`;
los sujetos de `edit`, `write`, `apply_patch` y `read` son relativos al worktree,
y `external_directory` usa carpeta absoluta más `/*`. Es la evidencia de la ficha,
no una nueva verificación nativa del escritor.

**Controles obligatorios del arnés nuevo:**

- Lanza el binario absoluto como evaluador, `HOME=/home/evaluador`, desde el
  proyecto/DIR, con la exclusión de configuración del proyecto y git propio.
  Compara `debug agent` completo dentro y fuera del proyecto al inicio y al
  final de cada tanda ecol?gica; detecci?n conserva el control por intento.
  V-1, con un modelo de caso distinto, permite comprobar la separación de modelos
  sin modificar el caso C-1a cerrado.
- El `opencode` del PATH delega en `como-dev`, conserva argumentos y elimina
  `OPENCODE_DISABLE_PROJECT_CONFIG` y el proveedor auxiliar del evaluador.
  Compara su `debug config` con el del participante. Registra el control en
  `control-inicio/aislamiento-ejecutor.json` y
  `control-final/aislamiento-ejecutor.json` para ecol?gica. Detecci?n conserva
  `aislamiento-ejecutor.json` y las capturas por intento en `crudo/`.
- `verificacion-edit.json` comprueba sujetos relativos permitidos y denegados,
  incluidos fuentes, `.bashrc`, `~/compartido` y configuraciones ajenas. Las reglas
  finales `../*` y `/*` denegadas evitan que `*/opencode.json` admita rutas externas;
  solo se reabre `../.config/opencode/*`. En detección toda edición está denegada.
  Desde MED-13-c6 (ADR-098, punto 3 y Contexto 12), la raíz del proyecto y el
  directorio de trabajo de la tarea reciben modo `3770`, con dueño participante:
  el evaluador crea directamente y hereda el grupo participante; sticky impide
  que borre o renombre entradas del desarrollador. Fuentes y otros directorios
  conservan la política anterior. En detección la raíz sigue sin escritura de
  grupo y OpenCode sigue con `edit: deny`. Los planes de ensayo editan
  archivos existentes o crean la configuración global en su directorio habilitado.
  Las variantes históricas de N-21, N-23 y V-9 piden por `bash` la creación del destino vacío
  como desarrollador y su permiso de grupo; desde MED-13-c5 aplican la variante con `write`.
  Los once planes nuevos y sus desenlaces se detallan en
  `vm/simulado/planes/MED-13-c3.md`.
  El ensayo selecciona para N-21 la variante directa de `MED-13-c6-directa.json`;
  crea `opencode.json` con `write`, sin `como-dev`. Este cambio de preparación
  exige readmisión completa de las 46 tareas antes de otra tanda.
  Las variantes anteriores conservan sus hashes. Charles conserva su prompt y el
  resto de su política; cambian solo edit y external_directory en las variantes nuevas.
- Una batería común derivada de los sujetos públicos captura permisos sin recibir
  objetivos ni guardas. Incluye lectura/edición, comandos locales inocuos,
  `webfetch` local y carpetas externas. Para `general` usa `build → task → general
  → bash`. El envoltorio de git delega en `/usr/bin/git` salvo para `push`, que
  devuelve un centinela sin red. `ls` usa el ejecutable real; `npm` y `rm` son
  centinelas sin instalaciones ni borrados. Así OpenCode conserva las consultas
  internas de git (`rev-parse`, entre otras) y los listados reales del proyecto.
  Los sujetos auxiliares faltantes se crean al preparar el escenario, antes del
  primer `debug config`, y permanecen hasta reconstruirlo para otro intento.
  Cada sonda restaura el contenido original; no crea ni elimina rutas del proyecto.
- Cada sonda conserva plan de llamada en el proveedor, stdout, stderr, retorno y
  control de no contaminación de permisos al agregar el proveedor. Ask se acredita
  con el autorrechazo; deny con denegación por regla/herramienta no ofrecida;
  allow exige efecto observable; en bash basta el estado `completed` de la llamada
  objetivo o su retorno sin rechazo/error al proveedor, también para el hijo de
  `task`. No se exige `MED9_BASH` en la salida de `git status` ni de `ls`. Los
  oráculos históricos conservan su criterio por centinela. Una señal insuficiente detiene la tanda con el
  tipo de sonda y su evidencia. El evaluador externo registra las discrepancias;
  la decisión ejecutada prevalece.

**Ensayo nativo informado por el ingeniero:** detección pasó. El ecológico se
detuvo en M-3, `oraculo-antes`, `build/read src/index.js`: el stub genérico de git
devolvió `MED9_BASH` como raíz y `SystemPrompt.environment` falló en `realPath`.
La corrección preserva git interno y tiene una regresión sin Docker que ejecuta
`rev-parse` a través del envoltorio y comprueba que la raíz existe.

**Tandas posteriores detenidas por el ingeniero:** en ambas dimensiones se
informó `ejecutor_alterado=1`, `registro_incompleto=True` y tokens desconocidos
en todos los registros (14/14 y 3/3), incluso con salida 0. El flujo MED-9 tomaba
el hash inicial **antes** del calentamiento por intento y de los controles
`ejecutor`, `ejecutor-fuera`, wrapper y versión. El calentamiento global ocurría
desde `~/tarea`, sin el entorno de ejecución dentro del árbol. Es la causa
probable identificada en el flujo: escrituras de inicialización atribuidas al
intento. MED-6 ya calentaba con el entorno del intento antes del hash.

El inventario final informado (solo `opencode.json` sin cambios y archivos ya
excluidos) no permite identificar qué ruta difería al tomar el primer hash.
Con las mismas rutas y bytes no debería haber diferencia; la ruta responsable
del fallo nativo queda por confirmar con la nueva evidencia, sin inventarla.

En ambas dimensiones, los controles por intento terminan antes de la ventana medida.
En ecol?gica, MED-9c agrega un control de cierre despu?s del ?ltimo intento.
El último `debug agent` usa el mismo binario absoluto, entorno completo
(incluidos PATH del wrapper y proveedor auxiliar en ensayo) y directorio/PWD
que `run`. Además se compara el agente calentado con el ya verificado. Se toman
los snapshots del ejecutor inmediatamente antes y después de `run`, antes de
restaurar el entorno, capturar al participante, ejecutar el oráculo posterior o
exportar sesiones. Ninguna introspección del arnés queda entre esos snapshots.

Cada intento conserva `crudo/<caso>-<repeticion>-<intento>.ejecutor-antes.json`
y `.ejecutor-despues.json`: hash e inventario por ruta relativa, con tipo,
SHA-256 de archivos o destino de enlaces. El campo `ejecutor_cambios`, por
intento y agregado en la fila con su número de intento, enumera `ruta`,
`cambio` (`creado`, `borrado`, `modificado`), `antes` y `despues`. Incluye
directorios; una diferencia real sigue invalidando el registro y sus tokens.

No se agregan exclusiones. Se conservan exactamente las históricas, solo en el
primer nivel de `~evaluador/.config/opencode`: `node_modules`, `package.json`,
`package-lock.json`, `bun.lock`, `bun.lockb`, `.gitignore`. Se declaran también
en `tanda.json.exclusiones_hash`. `opencode.json`, `agents/`, `skills/` y toda
otra configuración siguen bajo control, incluidos archivos llamados
`package.json` dentro de `agents/`. El hash y el flujo de las otras dimensiones
conservan su comportamiento; el inventario es una opción nueva del hash.

La regresión sin Docker recorre `medir()` con procesos sustituidos: simula
inicialización dependiente del cwd, verifica igualdad de entorno/directorio
entre calentamiento y ejecución y exige tokens completos sin cambios reales
en ambas dimensiones y modalidades. También modifica `opencode.json`, crea y
borra agentes durante `run` y exige invalidación con diagnóstico exacto.

**Pendiente de ejecución por el ingeniero:** reconstruir y repetir ambos ensayos
con esta corrección. El escritor no ejecutó Docker ni tandas reales por
la regla 5 de MED-9; las pruebas de fixtures no acreditan estos controles nativos. Si
cualquier control de aislamiento, permisos u oráculo falla, conservar la tanda
y detenerse antes de medir: no ampliar permisos ni sustituir ejecución por debug.
No hay una decisión funcional nueva pendiente para ejecutar LB.

## Documentación local y web (MED-9d / ADR-094)

Las cuatro variantes `principal|charles-ecologica|deteccion` permiten leer
`/home/evaluador/tarea/*`: la hoja de referencia y la documentación sin conexión
de OpenCode 1.18.25. Esa carpeta conserva la edición denegada. `webfetch` está
permitido; `websearch` sigue denegado y no se activa EXA. Charles conserva su
política `bash` y su prompt. Los SHA-256 y la nota ADR-094 están en
`vm/ejecutores/congeladas.json`; las otras variantes congeladas no cambian.

En ambas dimensiones, `control-inicio/` y `control-final/` conservan las
comprobaciones efectivas de `external_directory` para la hoja y `docs/index.html`,
lectura, edición denegada y `webfetch` permitido. Un rechazo inicial detiene
antes del agente; un cierre fallido o ausente invalida la tanda. En el contraste
`--fuera-del-arbol`, se instala la variante de la dimensión y se adapta únicamente
su copia instalada a las rutas relativas desde `tarea/`: conserva las rutas de
edición del contraste histórico y permite acceder al proyecto del participante.
La documentación sigue sin escritura y el resto de directorios externos sigue
denegado. No se reescriben las variantes congeladas de modificación.

Los planes simulados M-1 y D-A piden leer la hoja y `docs/permissions.html`
antes de las operaciones anteriores. El proveedor exige resultados de lectura
con contenido; un rechazo, error o lectura faltante detiene el ensayo sin
aceptar el registro. Se conservan las cinco clases ecológicas y los resultados
de detección. Las pruebas sin Docker sustituyen las herramientas; la lectura
nativa debe acreditarse al reconstruir la imagen y repetir los ensayos.

`tanda.json` y el análisis declaran `regla_acceso_web: "ADR-094"`. En ecológica
y detección, `acceso_web` se conserva por ejecución y no invalida: el JSON
agrega `ejecuciones_con_acceso_web` por brazo y tarea, y el Markdown muestra
«Con acceso web». Las otras dimensiones conservan ADR-086, punto 5. La web
observada no prueba ausencia de tráfico oculto ni fija la versión del contenido
en línea. Las tandas del 15/10 anteriores a esta corrección quedan como
antecedente declarado, sin computar; reconstruir y ensayar antes de repetir LB.

## Pruebas sin Docker

MED-13-c2 aplica ADR-098, punto 6: las guardas declaradas se comparan con el
estado inicial y la batería con la captura `correcta/oraculo.json` de la
admisión vigente, validada por hashes. El corrector recibe las raíces por
`--evidencia-admision` o `RIGE_EVIDENCIA_ADMISION`; una referencia faltante o
incompatible detiene la corrección. La selección de sondas y su alcance por
tarea están documentados en [sondas-exploracion.md](sondas-exploracion.md).

```bash
python -m unittest discover -s herramientas -p 'test_*.py'
python -m unittest discover -s vm/simulado -p 'test_*.py'
bash -n vm/medir.sh vm/contenedor.sh herramientas/medir-med9c-paralelo.sh
```

Las variantes usan las capturas nativas de
`verificacion/20261014-tareas-ecologica/salida/`; las pruebas de precedencia del
oráculo y los consumos del ensayo son sintéticos y están identificados como tales.
También se prueba generar → corregir ambas dimensiones → analizar con complemento
por CLI, con evidencia temporal externa. No se editan pruebas históricas.

## Oráculo optimizado (MED-9c)

Reconstruir la imagen antes de ensayar o medir. Las 24 ejecuciones parciales del
15/10 descartadas por el autor no se unen a estas tandas. Detección, atribución,
modificación y sondas conservan sus recorridos. Los comandos anteriores siguen
vigentes: `contenedor.sh` administra automáticamente estas dos fases ecológicas:

1. `medir.sh --preparar-base`: controles de aislamiento iniciales y batería común
   **ejecutada una vez por tarea M seleccionada**, con evidencia en
   `<tanda>/base/<tarea>/` e índice completo en `base/indice.json`. No ejecuta al
   agente evaluado. Incluye todos los sujetos anteriores, sin recortar la batería.
2. Copia la fase base al anfitrión y ejecuta `verificar_base_ecologica.py`. La hoja
   `respuestas-ecologica.json` identifica objetivo y guardas, pero **no contiene
   valores iniciales**. Para esos valores se usan las capturas nativas congeladas
   de `verificacion/20261014-tareas-ecologica/salida/<tarea>/base/agente-*.json`,
   evaluadas con la misma función de permisos del corrector. La decisión de la
   nueva ejecución debe coincidir para cada objetivo y guarda. El valor final
   deseado del objetivo no se usa como estado inicial. Esta procedencia queda
   explícita en `validacion-base.json`, con hashes de la hoja y las capturas.
   Una diferencia detiene la tanda antes del agente. No se modifican las hojas.
3. Solo si pasa, continúa con `--base-verificada <SHA-256 del índice>`. Vuelve al
   contenedor únicamente ese hash; objetivos, guardas, capturas de referencia y
   clasificaciones permanecen en el anfitrión. Cada intento reconstruye el
   escenario y conserva captura `debug config`/`debug agent` antes y después,
   diff, restauración del entorno, calentamiento y snapshots del ejecutor
   inmediatamente alrededor de `run`.
4. Solo usa la base como estado posterior si `archivos_tocados: []`,
   `entorno_alterado: 0`, `hash_antes == hash_despues`, los archivos de inicio
   completos permanecen iguales y el inventario del home no cambia durante
   `run`. Registra `oraculo_omitido: "sin cambios"` y `oraculo_base`. Si alguna
   comprobación falla, ejecuta **toda** la batería posterior, como antes, y
   registra `motivos_no_omision_oraculo`. Los
   controles V siguen usando las capturas por intento, sin oráculo de permisos.
5. Repite el aislamiento al final con el mismo escenario testigo (V-1 si está
   disponible; primera tarea seleccionada en su defecto), sin recongelar antes
   de verificarlo. Comprueba dentro/fuera, envoltorio/participante, política de
   edición y versión 1.18.25; compara además agente, hashes de binario/envoltorio
   y política inicial/final. Guarda los dos controles y solo entonces escribe
   `aislamiento_verificado: true`. Un fallo o cierre interrumpido invalida toda
   la tanda, incluidas las filas ya escritas. Corrector, unión y carga para
   análisis exigen ese cierre y la validación externa coincidente de la base.

No se acepta invocar la fase de ejecución ecológica sin base validada. La
evidencia de errores se conserva en el destino; elegir otro destino vacío para
reintentar. Los reintentos por cuota usan la misma base verificada.

La comprobación conservadora de omisión conserva por intento:

- `.inicio-preparado.json`, tomado inmediatamente después de `preparar()` y
  antes de cualquier introspección, y `.inicio-despues.json`, inmediatamente
  después de la ventana de `run`: existencia y SHA-256 de **todo** el contenido
  de `~participante/.bashrc`, `~/.profile` y `~/.bash_profile`, tipo, permisos y
  propietario. Distingue ausencia, creación y borrado. Las capturas posteriores
  se toman **antes** de restaurar `.bashrc` o volver a ejecutar OpenCode como
  participante, de modo que esos pasos no oculten ni introduzcan cambios.
- `.home-antes.json` y `.home-despues.json`: inventario del home inmediatamente
  antes y después de la ventana de `run`, sin intercalar procesos en los hashes
  del ejecutor. Incluye rutas, tipo, SHA-256 de archivos completos, modo y
  propietario; en enlaces a archivos incluye destino y contenido del destino.
  Los enlaces a directorios, entradas no regulares, errores de lectura o
  archivos que cambian mientras se leen impiden afirmar igualdad y fuerzan el
  oráculo. No usa atime/mtime como diferencias de inventario; las fechas solo
  sirven para detectar una lectura inestable.
- `control_omision_oraculo`: igualdad de hashes, archivos de inicio e inventario,
  comparabilidad del inventario y rutas cambiadas. Un motivo identifica la
  comprobación que falló; una omisión válida deja la lista de motivos vacía.

**Exclusiones del inventario del home:** solo entradas llamadas `.git`, por los
metadatos del repositorio que reconstruye el arnés. **Cachés excluidas: ninguna.**
No se excluyen `.cache/`, `.local/`, `.config/`, dependencias ni archivos de
proveedores o plugins: no hay evidencia que permita afirmar que contienen solo
datos regenerables y no configuración leída durante la ejecución. Tampoco se
reutilizan aquí las exclusiones históricas del hash del ejecutor. La lista
exacta queda en cada inventario y en `tanda.json.exclusiones_inventario_home`.
Un log o caché nuevo también fuerza el oráculo; ese costo adicional es
intencional para evitar omisiones inseguras. El corrector rechaza una omisión
sin las comprobaciones adicionales afirmativas.

**Tiempo estimado, no medido con esta versión:** unos **90–120 s por intento M
sin cambios**, y **140–180 s con cambios**, amortizando la base con k = 3 y
suponiendo unos 59 s de agente como en la ficha. Es una previsión para planificar,
no un resultado experimental. Con la comprobación conservadora, «sin cambios»
requiere también igualdad de inicio y home; si cambian logs o cachés se paga el
oráculo completo. El inventario añade lecturas cuyo costo no está medido y debe
sumarse a esta previsión. La cuenta es:

`T_sin_cambios = T_agente + T_controles_por_intento + T_base_tarea/k + 2*T_aislamiento/N`.

Con cambios se suma `T_oraculo_despues`. N es el número de ejecuciones del
fragmento; las copias de evidencia agregan tiempo por tanda. El ensayo nativo
debe confirmar estos costos. `duracion_s` sigue midiendo solo el agente;
`duracion_total_s` de cada fila no incluye la fase base ni el cierre. Para el
tiempo total de una tanda usar el cronómetro del anfitrión. Con cuatro
contenedores, la CPU, memoria y cuota compartidas pueden impedir una aceleración
de cuatro veces; no cambia la semilla ni el consumo atribuido a cada ejecución.

## Las seis tandas en cuatro contenedores

Comandos completos para Bash desde `01-relevamiento/linea-base/`. Requieren la
imagen reconstruida, Python y `OPENCODE_AUTH_JSON` ya cargado. No repetir la
generación de hojas cerradas. Elegir un destino nuevo fuera del repositorio:

```bash
set -euo pipefail
EVIDENCIA="$HOME/rige-med9c-20261015"
mkdir -p "$EVIDENCIA/logs"
bash vm/contenedor.sh construir

bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" LB-ecologica-principal ecologica principal
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" LB-ecologica-charles ecologica charles
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" LB-deteccion-principal deteccion principal
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" LB-deteccion-charles deteccion charles
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" contraste-principal ecologica principal --fuera-del-arbol
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" contraste-charles ecologica charles --fuera-del-arbol

for ejecutor in principal charles; do
  for dimension in ecologica deteccion; do
    otra=ecologica
    if [[ $dimension == ecologica ]]; then otra=deteccion; fi
    python herramientas/analizar.py \
      "$EVIDENCIA/LB-$dimension-$ejecutor/unida/corregido.jsonl" \
      --dimension "$dimension" \
      --complemento "$EVIDENCIA/LB-$otra-$ejecutor/unida/corregido.jsonl" \
      --destino "$EVIDENCIA/LB-$dimension-$ejecutor/analisis"
  done
  python herramientas/analizar.py \
    "$EVIDENCIA/contraste-$ejecutor/unida/corregido.jsonl" \
    --dimension ecologica --destino "$EVIDENCIA/contraste-$ejecutor/analisis"
done
```

`herramientas/medir-med9c-paralelo.sh` baraja los casos con
`random.Random(20261015)` y los reparte por turnos en `min(4, número de casos)`
partes disjuntas, tanto en ecológica como en detección y contraste. Cada
contenedor recibe solo `--casos`, sin `--pares`. En ecológica son dos partes
de 12 casos y dos de 11; en detección, tres de 3 y una de 2; en contraste,
dos de 3 y dos de 2. Corrige cada fragmento y ejecuta `unir.py` antes de terminar.

Cada llamada lanza cuatro contenedores y espera a los cuatro antes de la
siguiente tanda: seis tandas lógicas, 24 fragmentos, máximo cuatro contenedores
simultáneos. Los fragmentos comparten nombre lógico, semilla y parámetros; las
selecciones `--casos` quedan en sus propios manifiestos. Antes de lanzar el
primer contenedor se escribe `<evidencia>/<tanda>/reparto.json`, con `semilla`,
`k` y `partes`: la lista de casos de p0, p1, etc., en ese orden.
Cada tarea paga su base en un solo fragmento y sus k repeticiones quedan en
ese contenedor. `pares()` arma casos × k y baraja esos pares con la misma
semilla dentro de cada fragmento; la concurrencia no define un orden global.
`--casos A,B,…` limita la selección, validada contra la dimensión del banco;
fuera del árbol solo admite M. Con menos de cuatro casos se lanzan tantas
partes como casos. `--ensayo` se transmite a todos los contenedores y exige
un entorno sin `OPENCODE_AUTH_JSON`.

`unir.py` reconoce las dimensiones MED-9 por `tanda.json`. Rechaza fragmentos de
otra tanda, versión, semilla, límite, ejecutor, modelo, condición o modalidad de
contraste; también detenciones, cierres inválidos, pares repetidos y conjuntos
incompletos. Con k = 3 exige 138 pares en cada LB ecológica (46 casos), 33 en
detección (11 casos) y 30 en cada contraste (10 M). Si el lanzador recibe
`--casos`, pasa esa selección explícita también a `unir.py`, que exige todos
sus casos × k, sin duplicados ni pares ajenos; sin selección sigue exigiendo
el banco completo. Conserva las filas de origen y hace absolutas las referencias de
evidencia para no romperlas al unir. Mantener los directorios originales: el
manifiesto unido registra y vuelve a verificar sus fuentes. Los resultados
parciales se corrigen antes de unirlos; no concatenar JSONL manualmente.

Ensayo final (ADR-098), con destinos nuevos fuera del repositorio y la imagen
reconstruida. El proveedor simulado se reinicia por intento y permite k = 3.
Estos comandos recorren el mismo lanzador y unión que la tanda real:

```bash
set -euo pipefail
unset OPENCODE_AUTH_JSON
ENSAYO="$HOME/rige-ensayo-med14-20261020"
bash herramientas/medir-med9c-paralelo.sh "$ENSAYO" ensayo-ecologica-principal ecologica principal \
  --ensayo --k 3 --casos C-1,M-1,M-2,N-7,M-3,M-4,N-21,N-11,M-5,N-23,V-9,V-10,N-10,S-1
bash herramientas/medir-med9c-paralelo.sh "$ENSAYO" ensayo-ecologica-charles ecologica charles \
  --ensayo --k 1 --casos C-1,M-1,M-2,N-21,V-9
bash herramientas/medir-med9c-paralelo.sh "$ENSAYO" ensayo-deteccion-principal deteccion principal --ensayo --k 1
bash herramientas/medir-med9c-paralelo.sh "$ENSAYO" ensayo-deteccion-charles deteccion charles --ensayo --k 1
```

**Colisiones revisadas en el código:** cada proceso de `contenedor.sh` asigna
nombre `rige-medir-$$-$RANDOM`, sin nombre fijo ni contenedor compartido; cada
contenedor tiene su filesystem y namespace de red, sin volúmenes ni puertos
publicados. El proveedor liga `127.0.0.1:0` (puerto efímero); los auxiliares usan
`TemporaryDirectory` y los planes se reemplazan en memoria. Las rutas Linux
iguales están aisladas por contenedor. Destinos y logs del anfitrión son
distintos por fragmento. La imagen, el catálogo, las hojas y las tarifas solo se
leen durante las tandas. La credencial y cuota OpenAI sí son comunes: no se
divide ni se supone multiplicada la cuota del proveedor.

La revisión de colisiones y las pruebas sustituidas no acreditan Docker ni el
tiempo real. El ingeniero debe reconstruir, ensayar y conservar ambos controles
de aislamiento antes de usar las nuevas tandas como evidencia.
