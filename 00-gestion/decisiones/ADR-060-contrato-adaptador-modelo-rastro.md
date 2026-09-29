# ADR-060 — Contrato entre el núcleo y el adaptador (descriptor de capacidades, secuencia de aplicaciones y evaluador) y modelo del rastro (rastro de valor y rastro de decisión)

- Estado: aceptado (29/09/2026)
- Fecha: 29/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2. Alimenta el capítulo de diseño de una entrega posterior (no se adelanta). Afecta `04-diseno/README.md` (sección 1), `src/paquetes/nucleo/contrato/`, `src/paquetes/nucleo/resolucion/`, `src/paquetes/opencode/` y el esquema de salida de ADR-051 (forma del rastro). Al aceptarse, precisa RF-07 (CA-1) y RF-16 (CA-2) en el Libro de trabajo y en el Anexo I
- Origen: sesión de diseño del 29/09/2026. Verificación del código fuente de OpenCode sobre el tag `v1.18.25` (pendiente AR-05) seguida de una pasada de discusión con el autor sobre seis puntos (D1 a D6); el autor manifestó conformidad con las seis recomendaciones
- Relacionado: **aplica** ADR-058 (aceptado el 29/09/2026; política de OpenCode en el adaptador, eje 3 U-2; tipo `ValorSustituido`, eje 8; convención 2, rastro etiquetado; convención 4, posiciones), ADR-019 (Elemento genérico y Agente), ADR-029 (oráculo), ADR-051 (esquema de salida y explicación por plantillas), ADR-055 (medición por etapas) y ADR-059 (resolución genérica con proyección por agente; adaptador ficticio de RNF-03). **Cierra** la verificación AR-05 y el dato pendiente de RF-16 de AR-08

### Contexto

ADR-058 ubicó la política de OpenCode en el adaptador y dejó al núcleo los conceptos genéricos (regla, cadena ordenada, decisión, regla determinante, rastro), pero no definió el contrato entre ambos ni la forma del rastro. Sin ese contrato no se puede escribir el núcleo (AR-01).

Restricciones que salen del repositorio:

- **RNF-03:** «los tipos de elemento, el orden de precedencia, la estrategia de fusión y la forma de evaluar permisos los declara el adaptador». CA-2: ninguna identificación de la herramienta en el núcleo. CA-3: un adaptador de una herramienta ficticia se resuelve sin modificar el núcleo (`03-requisitos/libro/catalogo/RNF-03.md`).
- **Reglas de derivación validadas** (`03-requisitos/libro/reglas.md`): RD-01 (prevalece la última entrada que declara la clave), **RD-02** («en la fusión profunda, la posición de una clave la determina la primera entrada que la declara y su valor, la última»), **RD-03** (cadena ordenada nativas generales → nativas del agente → declaradas globales → declaradas del agente; determina la última coincidencia), RD-04 (valor implícito), RD-05 (herencia al subagente), RD-07 (declaración que prevalece sobre una nativa); RE-01 y RE-02.
- **RF-02 y RF-09:** la decisión de permiso se informa con la cadena de reglas, la regla determinante y su carácter nativo o declarado.
- **Acuerdo E-02 del acta del 26/09/2026:** «cada resultado declara sobre qué estado de las entradas se obtuvo, identificado por un resumen del conjunto leído» (`03-requisitos/libro/trazabilidad.md`).
- **ADR-055:** medición por etapas, también en Windows 11, sin umbral.
- **RF-03:** salida idéntica en dos ejecuciones.
- **RNF-05:** sin conexiones salientes.

**Verificación sobre el tag `v1.18.25`** (29/09/2026, código descargado de `codeload.github.com/anomalyco/opencode/tar.gz/refs/tags/v1.18.25`, SHA-256 del archivo `44e9530d7be172005c7d60aef317440eecb85d557d94cce7fa35c5a7b9d9da0b`, lectura sin ejecución; rutas relativas a `packages/`):

1. **Lector de JSONC y posiciones.**
   - `jsonc-parser` 3.3.1 (`opencode/package.json:130`), con `allowTrailingComma: true` (`opencode/src/config/parse.ts:10`).
   - Línea y columna con base 1, calculadas sobre índices de cadena de JavaScript (unidades UTF-16) cortando el texto por `\n` (`parse.ts:15-17`). Con `\r\n`, el `\r` queda al final de la línea y no altera la columna de lo que le sigue. **Confirma la convención 4 de ADR-058.**
   - Las sustituciones `{env:…}` y `{file:…}` se aplican **antes** del análisis sintáctico (`opencode/src/config/config.ts:233-240`): las posiciones de los errores de OpenCode se refieren al texto expandido, y el mensaje de error incluye el texto expandido completo (`parse.ts:28`).
   - `{env:VAR}` no definida se reemplaza por cadena vacía sin aviso y se inserta sin escapar; `{file:…}` se escapa como cadena JSON y se omite en una línea comentada con `//`; `{env:…}` se sustituye también dentro de comentarios (`opencode/src/config/variable.ts:36-38, 53-58, 85`).
2. **Variables de entorno que aportan configuración** (`core/src/flag/flag.ts`): `OPENCODE_CONFIG` (21), `OPENCODE_CONFIG_CONTENT` (22), `OPENCODE_CONFIG_DIR` (63), `OPENCODE_PERMISSION` (69), `OPENCODE_DISABLE_PROJECT_CONFIG` (54), `OPENCODE_DISABLE_AUTOCOMPACT` y `OPENCODE_DISABLE_PRUNE` (28, 25). `OPENCODE_CONFIG_DIR` reemplaza además el directorio global (`core/src/global.ts:64`).
3. **Orden de aplicación** (`opencode/src/config/config.ts:370-591`), de menor a mayor prevalencia: configuración remota de proveedores autenticados (370-410) → global `config.json`, `opencode.json`, `opencode.jsonc` (272-274, 413) → `OPENCODE_CONFIG` (415-418) → archivos del proyecto desde la raíz del worktree hacia el directorio actual (420-424; `config/paths.ts:16-20`) → cada `.opencode` y `OPENCODE_CONFIG_DIR`: JSON, luego comandos, agentes y modos en Markdown (438-480) → `OPENCODE_CONFIG_CONTENT` (482-490) → configuración remota de la organización (492-528) → configuración administrada (530-548) → derivación `mode` → `agent` (550-557) → `OPENCODE_PERMISSION` (559-565) → `tools` → `permission`, por debajo de `permission` (567-578).
4. **Estrategias de combinación.**
   - Fusión profunda con `remeda.mergeDeep` (`config.ts:42-44`).
   - `instructions` se acumula con deduplicación solo en `mergeConfigConcatArrays` (46-52); entre los tres archivos globales se usa `mergeConfig` y el arreglo se reemplaza (272-274).
   - `plugin` se acumula y deduplica con registro de origen (`plugin_origins`, 344-363).
   - Agentes (`opencode/src/agent/agent.ts`): siete nativos, `build`, `plan`, `general`, `explore` y los ocultos `compaction`, `title` y `summary` (140-265); cada campo declarado reemplaza al anterior, `options` se fusiona en profundidad, `disable: true` elimina el agente y un agente nuevo recibe `mode: "all"` (267-294).
   - Permisos: lista plana por agente, reglas por defecto nativas → propias del agente nativo → `permission` declarado → propias del agente declarado → `external_directory: Truncate.GLOB → allow` agregada al final salvo denegación explícita (145-151, 293, 296-310). Cada regla se genera recorriendo `Object.entries` (`opencode/src/permission/index.ts:186-197`); la evaluación toma la última coincidencia y, si no hay ninguna, `ask` (28-36).
   - Un agente en Markdown con frontmatter ilegible se descarta sin aviso (`config/agent.ts:19`); un modo que no cumple el esquema también (50-56).
5. **Comportamiento ante contenido inválido.** `OPENCODE_PERMISSION` con JSON inválido se descarta con un aviso que solo va al log (`config.ts:560-564`); `OPENCODE_CONFIG_CONTENT` con JSON inválido es fatal (`parse.ts:26-29`). Coincide con E-12 y E-18b de `01-relevamiento/linea-base/laboratorio-verificacion.md` (tabla «Asimetría entre las dos variables»).
6. **Comando nativo que lista los agentes:** `opencode agent list` (`opencode/src/cli/cmd/agent.ts:235-252`); incluye los ocultos, ordena nativos primero y por nombre, e imprime `nombre (modo)` y el conjunto de reglas en JSON. Existe además `opencode debug agent <name>` (`cli/cmd/debug/agent.ts:5`).
7. **Agentes invocados sin declaración (H-18):** `compaction` (`opencode/src/session/compaction.ts:358`) y `title` (`opencode/src/session/prompt.ts:216`); `explore` y `general` son subagentes nativos. No se encontró una invocación literal de `summary`.
8. **Escrituras de OpenCode al leer la configuración:** agrega `$schema` al archivo leído (`config.ts:245-249`), crea la configuración global (264-270), escribe `.gitignore` (309-326) e instala dependencias con `npm` en cada directorio de configuración (452-471).

Lo que el código muestra y un descriptor declarativo simple no contiene: derivaciones posteriores a la fusión (puntos 3 y 4), una estrategia que depende del par de entradas (`instructions`), la eliminación de un elemento (`disable`) y reglas que la herramienta agrega al final (`Truncate.GLOB`).

### Alternativas evaluadas

**D1 · Quién resuelve**
- **R-A:** Descriptor declarativo: el adaptador declara capas ordenadas y una estrategia por clave; el núcleo resuelve.
- **R-B:** El adaptador resuelve y devuelve el resultado con su rastro; el núcleo solo presenta.
- **R-C:** El adaptador entrega una **secuencia de aplicaciones** en el orden en que la herramienta las aplica (declaración, ruta de clave, estrategia, código de regla); el núcleo las ejecuta con estrategias intercambiables y construye el rastro.

**D2 · Unidad del rastro**
- **T-A:** Un rastro genérico único, por ruta de clave.
- **T-B:** Dos rastros: **rastro de valor** por ruta de clave y **rastro de decisión** por consulta de permiso.

**D3 · Orígenes de un valor**
- **O-A:** Dos orígenes: declarado y nativo.
- **O-B:** Tres orígenes: **declarado** (con su vía de ingreso), **implícito** (derivación de la herramienta, con código de regla) y **nativo** (literal de la herramienta).

**D4 · Posiciones frente a las sustituciones**
- **P-A:** Tomar las posiciones sobre el texto expandido, como OpenCode.
- **P-B:** Tomar las posiciones sobre el texto original y representar cada sustitución como un nodo simbólico.

**D5 · Evaluación de permisos**
- **E-A:** El núcleo evalúa con una semántica declarada en datos (orden y criterio de coincidencia).
- **E-B:** El adaptador aporta el evaluador como función pura, detrás de una interfaz del contrato.

**D6 · Medición y resumen de las entradas leídas**
- **M-A:** Medición permanente incluida en la respuesta; resumen sobre el contenido de todas las entradas.
- **M-B:** Medición a pedido por el canal de error, con reloj inyectado; resumen sobre archivos por contenido y sobre variables por nombre y condición.

### Análisis (trade-offs)

**D1.**
- **R-A** no puede expresar lo que muestra la verificación (puntos 3 y 4) sin convertir el descriptor en un lenguaje propio: condiciones, derivaciones y eliminaciones terminarían codificadas en datos que solo el adaptador de OpenCode entiende.
- **R-B** vacía el núcleo. El adaptador ficticio de RNF-03 (CA-3) pasaría con cualquier diseño, porque no ejercitaría nada del núcleo, y cada adaptador produciría su propio rastro, con lo que la explicación y la paridad entre interfaces dejarían de ser uniformes.
- **R-C** reparte el trabajo según RNF-03: el adaptador **declara** el orden y la estrategia de cada aplicación; el núcleo las **ejecuta** y registra cada paso. El núcleo trae una biblioteca de estrategias genéricas (reemplazo, fusión profunda con conservación de la posición de la primera declaración según RD-02, acumulación con deduplicación, eliminación, derivación). Para no violar CA-3, la estrategia es una interfaz del contrato: un adaptador puede aportar una propia sin modificar el núcleo.
- Costo de R-C: el adaptador de OpenCode tiene que reproducir el orden de `config.ts` como secuencia, y cada paso de la secuencia es un punto de divergencia con la herramienta. Lo controla el oráculo (ADR-029).

**D2.**
- **T-A** obliga a tratar la lista de reglas de permiso como un valor más. Pierde la posición efectiva de cada regla en la cadena, que es lo que determina la decisión (RD-03), y oculta el efecto de RD-02 sobre esa posición: si el global declara `bash: {"*": "ask", "git *": "allow"}` y el proyecto redefine `"*": "deny"`, la clave `"*"` conserva su posición original, `git *` sigue después y sigue ganando.
- **T-B** separa dos motivos de prevalencia distintos: en el rastro de valor, «declarada en una entrada posterior» (RD-01); en el rastro de decisión, «posterior en la cadena efectiva» (RD-03). El segundo registra la posición efectiva de cada regla, su procedencia (entrada, línea, columna) y la posición que le asignó la fusión.
- Costo de T-B: dos formas en el esquema de salida. Ya están separadas en ADR-051 (valores y permisos).

**D3.**
- **O-A** confunde lo que la herramienta escribe como literal con lo que deriva de una declaración del usuario (`mode` → `primary`, `tools` → `permission`, `mode: "all"` por defecto, `Truncate.GLOB`). Para RF-06 y RD-04 esa diferencia es el contenido mismo de la explicación.
- **O-B** da a cada origen su explicación: el declarado nombra entrada, vía y posición; el implícito nombra la regla de derivación; el nativo nombra la regla nativa y, si fue desplazada, queda como «regla nativa anulada» (RF-09, RD-07).
- Las entradas remotas (puntos 1 y 7 del orden) no se pueden leer sin conexiones salientes (RNF-05). Con O-B se declaran como vías **no observadas** en el resumen de entradas, en lugar de omitirlas en silencio.

**D4.**
- **P-A** hereda dos defectos: las posiciones no corresponden al archivo que abre el usuario, y cualquier mensaje que las acompañe contiene el texto expandido, con los secretos sustituidos (punto 1 de la verificación). Choca con RNF-04 y con el eje 8 de ADR-058.
- **P-B** conserva la posición del archivo y encaja con `ValorSustituido`. Costo: RIGE reimplementa la detección de sustituciones sobre el texto original y debe reproducir sus asimetrías (`{env:}` en comentarios, `{file:}` omitido tras `//`). Esas asimetrías son candidatas a hallazgo.

**D5.**
- **E-A** exige describir en datos el comparador de patrones, que en OpenCode ignora mayúsculas en Windows (ADR-032) y expande `~` y `$HOME` (`permission/index.ts`). Es semántica de la herramienta y no generaliza.
- **E-B** coincide con el texto de RNF-03 («la forma de evaluar permisos la declara el adaptador») y con ADR-058 (copia atribuida del evaluador, eje 7). El núcleo recibe la regla determinante y la cadena, y construye el rastro de decisión.

**D6.**
- **M-A** rompe RF-03: dos ejecuciones sobre las mismas entradas darían salidas distintas.
- **M-B** mide las etapas ubicar → leer → analizar → secuenciar → combinar → evaluar → serializar con un reloj que entra por puerto, solo con `--medir` y por el canal de error. El resumen de E-02 es un SHA-256 sobre la lista canónica de pares (vía, resumen del contenido), ordenada.
- Trade-off de M-B: el resumen del contenido de una variable que guarda un secreto de baja entropía se puede atacar por fuerza bruta. Por eso las variables entran al resumen con su nombre y su condición, no con su contenido. Costo: un cambio que afecta solo el contenido de una variable no modifica el resumen. Se declara en el resultado.

### Recomendación y fundamento

**R-C + T-B + O-B + P-B + E-B + M-B.**

**Contrato del adaptador** (`nucleo/contrato/`). El descriptor de capacidades declara:

| Parte | Qué aporta el adaptador | Qué hace el núcleo |
|---|---|---|
| Identidad | nombre y versión soportada (constante) | la incluye en la respuesta; no la interpreta |
| Tipos de elemento | tipos genéricos y la especialización Agente (ADR-019) | proyecta la resolución por agente (ADR-059) |
| Ubicador | vías de ingreso aplicables (archivo, Markdown, variable, remota no observada) | pide la lectura por el puerto de solo lectura |
| Lector | análisis sintáctico con posiciones sobre el texto original y nodos `ValorSustituido` | nada: recibe declaraciones con posición |
| Secuenciador | la secuencia ordenada de aplicaciones (declaración u origen implícito o nativo, ruta, estrategia, código de regla) | ejecuta cada aplicación con la estrategia indicada y registra el rastro de valor |
| Estrategias | cuáles de la biblioteca usa, y las propias si hacen falta | provee la biblioteca y la interfaz |
| Evaluador | función pura: consulta → regla determinante sobre la cadena del agente | construye el rastro de decisión |
| Reglas | catálogo de códigos opacos con su plantilla de explicación | motor de plantillas (ADR-051) |
| Hallazgos | detectores propios (ADR-058) | detectores genéricos y agregación |

**Modelo del rastro:**

- **Rastro de valor** (por agente y ruta de clave): valor efectivo; declaración determinante (origen, vía, entrada, línea, columna, código de regla); motivo de prevalencia; declaraciones desplazadas en orden; posición asignada por la fusión (RD-02); herencia si corresponde.
- **Rastro de decisión** (por agente y consulta): decisión; cadena efectiva completa con índice, origen y procedencia de cada regla; regla determinante con su motivo de prevalencia (RD-03); reglas coincidentes desplazadas; reglas heredadas (RD-05); regla nativa anulada (RD-07, RF-09).
- **Resumen de entradas leídas** (E-02), en toda respuesta: lista de vías con su resumen, vías no observadas y resumen del conjunto.

**Adaptador ficticio** (RNF-03, CA-3; en `pruebas/`): usa **primera coincidencia** en la evaluación, reemplazo de listas y un orden de capas distinto del de OpenCode. Un ficticio que imitara a OpenCode no probaría la independencia del núcleo.

**Fundamento.** Es la combinación que cumple el texto de RNF-03 sin trasladar la semántica de OpenCode al núcleo, expresa lo que la verificación del tag encontró y hace visibles en el rastro las reglas validadas RD-02 y RD-03, de las que depende la decisión de permiso.

**Condición que invalidaría la recomendación:**
- Que el oráculo muestre una combinación de OpenCode 1.18.25 que no se pueda expresar como aplicación ordenada (R-C).
- Que el oráculo muestre que la posición de una regla de permiso no depende de la fusión (el caso de RD-02 descrito en D2). La verificación se hace en la iteración 2, con el trabajo de oráculo previsto en `iteraciones.md`.
- Que el adaptador ficticio necesite modificar el núcleo para resolverse.

### Decisión del autor

Aceptado por el autor el 29/09/2026 (`/aceptar ADR-060`). En la sesión del 29/09/2026 el autor manifestó conformidad con las recomendaciones D1 a D6.

### Consecuencias

**Si se acepta:**

- **Libro de trabajo y Anexo I:**
  - **RF-16, CA-2:** el `[DATO PENDIENTE]` se reemplaza por «el conjunto coincide con el que informa `opencode agent list` en la versión 1.18.25».
  - **RF-07, CA-1:** «una variable de entorno de configuración con contenido inválido, que la herramienta descarta sin emitir error» se precisa como «la variable `OPENCODE_PERMISSION` con contenido inválido, que la herramienta descarta con un aviso que solo registra en su archivo de log». `OPENCODE_CONFIG_CONTENT` inválida detiene OpenCode y no es un defecto silencioso.
  - Ambos requisitos pasan a «Pendiente» y se informan a la referente (PV-03).
- **H-18:** la identidad de los agentes nativos queda establecida por el código (punto 7). La invocación de `summary` sigue sin confirmar y se verifica en la iteración 2.
- **ADR-058:** se cierran las dos marcas «sujeta a AR-05» (convención 4 y convención 10). Los nombres de las variables son los del punto 2.
- **ADR-029 y ADR-054:** el oráculo debe ejecutar OpenCode sobre una copia de cada escenario y con la red controlada, porque OpenCode escribe en las entradas y lanza instalaciones al leer la configuración (punto 8). Se registra como pendiente; no modifica esos registros.
- **ADR-051:** el esquema de salida incorpora el rastro de valor, el rastro de decisión y el resumen de entradas leídas.
- **Hallazgos candidatos** (se evalúan con RF-07, sin ampliar su alcance en este registro): `{env:}` dentro de un comentario, agente en Markdown descartado sin aviso, `instructions` reemplazado entre archivos globales.
- **`04-diseno/README.md`, sección 1:** se agrega la fila de este registro.

**Decisiones que este registro no toma:**
- Persistencia del rastro y retención (ADR-061).
- Forma concreta del esquema JSON del rastro (iteración 2, con la convención 1 de ADR-058).
- Pruebas metamórficas de la procedencia (ADR-063).

### Evidencia

- Código fuente de OpenCode, tag `v1.18.25` (archivo y SHA-256 en el Contexto): `opencode/src/config/parse.ts`, `config.ts`, `paths.ts`, `variable.ts`, `agent.ts`; `opencode/src/agent/agent.ts`; `opencode/src/permission/index.ts`; `opencode/src/cli/cmd/agent.ts`; `opencode/src/session/compaction.ts`, `prompt.ts`; `core/src/flag/flag.ts`, `core/src/global.ts`
- `01-relevamiento/linea-base/laboratorio-verificacion.md` (E-12, E-18, «Asimetría entre las dos variables»)
- `03-requisitos/libro/catalogo/RNF-03.md`, `RF-02.md`, `RF-07.md`, `RF-09.md`, `RF-16.md`; `03-requisitos/libro/reglas.md`; `03-requisitos/libro/trazabilidad.md` (H-18, E-02)
- ADR-019, ADR-029, ADR-032, ADR-051, ADR-054, ADR-055, ADR-058, ADR-059
- Sesión de diseño del 29/09/2026
