# Medición ecológica y detección · MED-9

Implementa las líneas de base de ADR-091 y ADR-092 y el análisis de ADR-093.
Ejecutar estos comandos desde `01-relevamiento/linea-base/`, en Bash (Git Bash
en Windows). Python 3.11 o posterior en el anfitrión; Docker para el ingeniero.
No se requieren paquetes Python externos.

## Generar y construir

```bash
python herramientas/generar-ecologica.py --destino ecologica
bash vm/contenedor.sh construir
```

El generador lee las fuentes cerradas `espec.py`, `corpus.py`, `tareas.md` y
`deteccion.md`. `escenarios.json` contiene exclusivamente archivos, variables,
directorio, tarea e instrucción pública. Las respuestas, sus hashes de fuentes,
objetivos, guardas, variantes y clasificaciones permanecen en el anfitrión.
`hoja_cerrada` se obtiene del texto, como en el generador existente.

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
El proveedor pide `read` y `edit` a OpenCode; nunca aplica las ediciones él mismo.
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
en comandos, archivos del repositorio ni registros. El participante no recibe
esa credencial. Las tandas usan `build` o `[AUX] Charles`, modelo
`openai/gpt-6.1-sol`, k = 3, límite de **ejecución del agente** de 600 s y semilla
20261015. La preparación y las sondas del oráculo quedan fuera del cronómetro.

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
  Compara `debug agent` completo dentro y fuera del proyecto en cada intento.
  V-1, con un modelo de caso distinto, permite comprobar la separación de modelos
  sin modificar el caso C-1a cerrado.
- El `opencode` del PATH delega en `como-dev`, conserva argumentos y elimina
  `OPENCODE_DISABLE_PROJECT_CONFIG` y el proveedor auxiliar del evaluador.
  Compara su `debug config` con el del participante. Registra el control en
  `aislamiento-ejecutor.json` y las capturas por intento en `crudo/`.
- `verificacion-edit.json` comprueba sujetos relativos permitidos y denegados,
  incluidos fuentes, `.bashrc`, `~/compartido` y configuraciones ajenas. Las reglas
  finales `../*` y `/*` denegadas evitan que `*/opencode.json` admita rutas externas;
  solo se reabre `../.config/opencode/*`. En detección toda edición está denegada.
  Como en MED-6, la raíz del proyecto no recibe escritura de grupo: crear una
  configuración nueva allí requiere `como-dev`. Los planes de ensayo editan
  archivos existentes o crean la configuración global en su directorio habilitado.
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

En ambas dimensiones, todos los controles terminan antes de la ventana medida.
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

## Pruebas sin Docker

```bash
python -m unittest discover -s herramientas -p 'test_*.py'
python -m unittest discover -s vm/simulado -p 'test_*.py'
bash -n vm/medir.sh vm/contenedor.sh
```

Las variantes usan las capturas nativas de
`verificacion/20261014-tareas-ecologica/salida/`; las pruebas de precedencia del
oráculo y los consumos del ensayo son sintéticos y están identificados como tales.
También se prueba generar → corregir ambas dimensiones → analizar con complemento
por CLI, con evidencia temporal externa. No se editan pruebas históricas.
