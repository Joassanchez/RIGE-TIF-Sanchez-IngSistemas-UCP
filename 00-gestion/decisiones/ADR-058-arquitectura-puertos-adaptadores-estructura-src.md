# ADR-058 — Arquitectura de RIGE: puertos y adaptadores con núcleo sin dependencias, tres paquetes aislados, manejo de errores por categorías y contrato de salida de la línea de comandos

- Estado: propuesto
- Fecha: 29/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2. Alimenta el capítulo de diseño de una entrega posterior (no se adelanta). Afecta `04-diseno/README.md` (sección 1), `src/` (estructura, `AGENTS.md`, `README.md`) y el esquema de salida de RF-03 (se agrega la respuesta de error)
- Origen: sesión de diseño del 29/09/2026 (tres pasadas de discusión con el autor sobre la arquitectura más allá del prototipo v1). Ajustado el mismo día tras la revisión de los impulsores de la arquitectura: identificación de la herramienta fuera del núcleo (RNF-03), RNF-04 aplicado al almacén, lectura de variables de entorno acreditada en el informe y renumeración de los registros previstos (ADR-059 pasa a ser la revisión del catálogo)
- Relacionado: **concreta y refina** la estructura enumerada en las consecuencias de ADR-032, sin reemplazarlo. **Completa** ADR-051 (el esquema describe una cuarta respuesta, la de error). Aplica ADR-019 (Elemento genérico y Agente), ADR-023 (almacén propio, opción B), ADR-029 (oráculo) y ADR-054 (plataformas; rutas normalizadas)

### Contexto

ADR-032 fijó el stack y, en sus consecuencias, enumeró cinco carpetas para `src/`: `nucleo/`, `adaptador-opencode/` (con `vendor/`), `interfaz/web` e `interfaz/cli`, `almacen/` y `pruebas/`. Esa lista no define la arquitectura: no dice qué puede depender de qué, dónde se coordinan los casos de uso, dónde vive la política propia de OpenCode ni cómo se tratan los errores.

Restricciones que salen del repositorio:

- **RNF-03:** el núcleo no depende del adaptador de OpenCode. «Los tipos de elemento, el orden de precedencia, la estrategia de fusión y la forma de evaluar permisos los declara el adaptador» (`03-requisitos/libro/catalogo/RNF-03.md`).
- **ADR-019:** Elemento genérico con Agente como única especialización. El descriptor de capacidades del adaptador es el contrato entre adaptador y núcleo (III.2.3).
- **RNF-01, RNF-04 y RNF-05:** solo lectura sobre las entradas, sin exponer el contenido de las variables de entorno, sin conexiones salientes. `src/AGENTS.md` las declara no negociables.
- **ADR-051:** la CLI es la interfaz completa y la web queda limitada, pero la web no ofrece nada que falte en la CLI. OE-1 y OE-2 exigen que ambas interfaces coincidan.
- **Criterio de aceptación de RF-03:** salida idéntica en dos ejecuciones, validada contra el esquema publicado. El error va por el canal de error y no por el de salida, con código distinto de 0.
- **Criterio de aceptación de RF-05:** la advertencia va antes de presentar cualquier resultado, por el canal de error y con código distinto de 0.
- **Criterio de aceptación de RF-04:** la entrada con error de sintaxis se identifica como ilegible y el análisis continúa.
- **RE-01:** una entrada ilegible detiene su propia carga y registra un hallazgo.
- **Motivo de la prioridad de RNF-02:** «informar con precisión aparente un resultado erróneo agravaría el problema en lugar de reducirlo».
- **Guía de comprobación del v1** (`catedra/AE2-guia-comprobacion-v1.md`, pasos 6 a 8): esquema de base creado por guion, un proceso que responde en la dirección declarada, y un dato que se recupera del almacén y se muestra.
- **Documentación de Bun** (consultada el 29/09/2026, https://bun.com/docs/pm/isolated-installs): desde la versión 1.3.2, un proyecto nuevo con workspaces usa por defecto la instalación aislada, en la que «Packages can only access their explicitly declared dependencies». Con `install.hoist = false`, un import no declarado falla. ADR-032 fija Bun 1.3.14.

### Alternativas evaluadas

**Eje 1 · Estilo de arquitectura**
- **A-1:** Capas según la lista de ADR-032: núcleo, adaptador, interfaces y almacén como carpetas hermanas, y cada interfaz coordina el recorrido.
- **A-2:** Puertos y adaptadores. Un núcleo sin E/S; una capa de aplicación con los casos de uso y los puertos; adaptadores de dos clases (de herramienta y de sistema); interfaces que solo traducen; un único punto de ensamblado.

**Eje 2 · Empaquetado**
- **P-1:** Un solo paquete con carpetas. Los límites los controla una prueba de arquitectura.
- **P-2:** Workspaces de Bun con instalación aislada y tres paquetes: `nucleo`, `opencode` y `rige`.
- **P-3:** Workspaces con un paquete por capa (seis o más).

**Eje 3 · Ubicación de la política de permisos y de fusión de OpenCode** (RD-02, RD-03, RD-05, RD-07)
- **U-1:** En el núcleo, con el adaptador aportando solo `evaluate`.
- **U-2:** En el adaptador. El núcleo define los conceptos genéricos (regla, cadena ordenada, decisión, regla determinante, rastro).

**Eje 4 · Garantía de RNF-01, RNF-04 y RNF-05**
- **G-1:** Convención y revisión de código.
- **G-2:** Por construcción, con la forma de los puertos, un tipo opaco para los valores de entorno y pruebas de arquitectura.

**Eje 5 · Manejo de errores**
- **M-1:** Excepciones en todo el código, con un manejador global.
- **M-2:** Por categorías. Los defectos de la configuración son hallazgos; las respuestas sin decisión son variantes de la respuesta; los errores de uso son valores tipados (`Resultado<T, E>`); las fallas de infraestructura y los defectos internos son excepciones que se capturan una sola vez, en el borde de cada interfaz.

**Eje 6 · Idioma de los identificadores**
- **I-1:** Español para el dominio, las carpetas y los casos de uso, sin tildes ni ñ en los identificadores.
- **I-2:** Inglés en todo el código.

**Eje 7 · Política de la copia atribuida del evaluador**
- **V-1:** Copia sin ninguna modificación.
- **V-2:** Extracción literal de las funciones, con cambios limitados a imports y envoltorio, registrados con el hash del original y el de la versión propia.

### Análisis (trade-offs)

**Estilo.**
- **A-1** duplica el recorrido descubrir → resolver → guardar → responder en cada interfaz. La coincidencia que exige ADR-051 queda librada a mantener dos copias iguales.
- Además, en A-1 el almacén y las interfaces dependen de SQLite directamente. RNF-03 se cumpliría para OpenCode pero no para la infraestructura, y nada se puede probar sin disco.
- **A-2** escribe cada caso de uso una sola vez. Ambas interfaces reciben el mismo objeto de respuesta, así que la paridad queda garantizada por diseño.
- En A-2 el almacén es una implementación de un puerto. Hay una versión en memoria para las pruebas, y la caché por hash (ADR-023, opción C), si se retoma, es un envoltorio del puerto.
- Costo de A-2: dos carpetas más (`aplicacion/` y `arranque/`) y un nivel de indirección.

**Empaquetado.**
- **P-1** es el de menor costo, pero RNF-03, que es la decisión arquitectónica que el catálogo presenta como la que habilita otras herramientas, dependería de una prueba escrita a mano.
- **P-2** hace que la dependencia prohibida no compile y falle al ejecutar. La evidencia es inmediata: el `package.json` de `nucleo` no declara dependencias. El costo es un `package.json` y un `tsconfig` por paquete. El comando de instalación de la cátedra no cambia (`bun install`).
- **P-3** multiplica esa configuración sin proteger ningún requisito adicional.
- En todos los casos sigue haciendo falta la prueba de arquitectura: los workspaces no controlan los módulos del runtime (`node:fs`, `bun:sqlite`, red).
- Durante la discusión, el ingeniero sostuvo primero P-1 con el argumento de que Bun sube todas las dependencias al `node_modules` raíz. La documentación consultada lo refuta para la versión fijada, y la recomendación cambió a P-2.

**Política de OpenCode.**
- **U-1** introduce en el núcleo el orden nativas → declaradas, «la última coincidencia gana» y la herencia de denegaciones a los subagentes, que son semántica de OpenCode. Contradice el texto de RNF-03.
- **U-2** es la lectura literal de RNF-03 y de ADR-019.

**Garantías.**
- **G-1** no deja evidencia verificable.
- **G-2** convierte cada restricción en una propiedad de la estructura:
  - el puerto de lectura no ofrece operaciones de escritura (RNF-01);
  - un valor que proviene del entorno se representa con un tipo opaco que los serializadores de salida **y el del almacén** solo emiten como nombre y condición. El criterio de RNF-04 alcanza expresamente al «almacén propio», así que la prueba busca el valor también en el archivo de la base;
  - una prueba prohíbe importar módulos de red, y las pruebas reemplazan `fetch` por una función que falla (RNF-05);
  - las reglas de dependencia se escriben como datos, y la prueba busca además identificadores de la herramienta (`opencode`, `OPENCODE_`, …) en el código del núcleo, conforme a la segunda condición del criterio de RNF-03.
- Precisión surgida de la discusión: el puerto de entorno no puede limitarse a informar si una variable está definida. OpenCode incorpora configuración desde variables de entorno (suposición a verificar sobre el tag 1.18.25: `OPENCODE_CONFIG`, `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG_CONTENT`), y la entidad «Entrada de configuración» admite vías que no son archivos (`03-requisitos/libro/entidades.md`). Por eso la protección se ubica en el tipo del valor y no en la prohibición de leerlo. La lectura del contenido está además comprometida en el informe: la Tabla 9 de I.6.4 declara las variables de entorno como «entrada de solo lectura, limitada a las variables que OpenCode utiliza en su configuración», y el criterio de RF-07 incluye «una variable de entorno de configuración con contenido inválido, que la herramienta descarta sin emitir error». Queda por verificar sobre el tag solo el nombre exacto de cada variable (AR-05).

**Errores.**
- **M-1** mezcla dos cosas que el sistema tiene que distinguir. Una entrada con error de sintaxis es un hallazgo que el criterio de RF-04 exige informar con su localización, no una falla.
- Peor todavía, en M-1 un manejador que convierte una excepción en un valor plausible produce exactamente el defecto que describe el motivo de RNF-02. Ejemplo: el evaluador copiado devuelve `ask` cuando ninguna regla coincide; si un error propio se tradujera en «ninguna coincidencia», RIGE informaría `ask` con total seguridad.
- **M-2** obliga al compilador a tratar cada error esperado y concentra la traducción a canales, códigos y páginas en un solo punto por interfaz.

**Idioma.**
- **I-1** mantiene el vocabulario que validó la referente (glosario, entidades, reglas) y la trazabilidad directa entre el código y el Libro de trabajo.
- **I-2** es lo convencional, pero obliga a mantener una tabla de traducción entre el dominio validado y el código.

**Copia atribuida.**
- **V-1** no es realizable: ADR-032 ya establece que se copia la lógica sin su servicio, y los imports internos del monorepo de OpenCode (por ejemplo, el de `Wildcard`) hay que reescribirlos.
- **V-2** hace visible y verificable cada divergencia.

### Recomendación y fundamento

**A-2 + P-2 + U-2 + G-2 + M-2 + I-1 + V-2**, con la estructura y las convenciones que siguen.

**Estructura de `src/`** (raíz del proyecto de código):

```
src/
├── package.json            workspaces
├── bunfig.toml             instalación aislada, install.hoist = false
├── tsconfig.base.json · bun.lock · .env.example
├── README.md · AGENTS.md · CLAUDE.md · LICENSE · NOTICE (atribución MIT de OpenCode)
├── esquemas/
│   ├── salida/v1/          valores · permiso · hallazgos · error (.schema.json)
│   └── almacen/            guiones de esquema numerados (001_inicial.sql, …)
├── paquetes/
│   ├── nucleo/             sin dependencias ni E/S
│   │   ├── dominio/        entidades de ADR-019 y tipos de valor (posición, procedencia, ValorDeEntorno)
│   │   ├── contrato/       descriptor de capacidades, AdaptadorHerramienta, LectorSoloLectura
│   │   ├── resolucion/     motor genérico que aplica la precedencia y la fusión declaradas, con rastro
│   │   ├── hallazgos/      interfaz Detector y detectores genéricos
│   │   ├── explicacion/    motor de plantillas y plantillas genéricas (las de cada regla las aporta el adaptador)
│   │   └── resultado.ts    Resultado<T, E>
│   ├── opencode/           depende solo de @rige/nucleo
│   │   ├── descubrimiento/ entradas aplicables y rutas por sistema operativo
│   │   ├── lectura/        JSONC y Markdown con línea y columna
│   │   ├── politica/       precedencia · fusión (RD-02) · sustituciones · permisos (RD-03, RD-05, RD-07)
│   │   ├── explicaciones/  plantillas de las reglas propias de la herramienta
│   │   ├── detectores/     propios de la herramienta (RE-02, sustituciones sin valor)
│   │   ├── reglas-nativas/ transcripción atribuida
│   │   ├── vendor/         extracción atribuida + LICENSE + PROCEDENCIA.md
│   │   └── descriptor.ts   incluye la versión soportada (1.18.25)
│   └── rige/               la aplicación
│       ├── aplicacion/     puertos · casos-uso · respuestas · errores.ts
│       ├── adaptadores/    almacen-sqlite · sistema (archivos, entorno, reloj)
│       ├── interfaces/     cli (ejecutar.ts) · web (intermedios/)
│       └── arranque/       rige.ts, único punto de entrada y de ensamblado
└── pruebas/
    ├── escenarios/         proyectos de prueba (global/ y proyecto/)
    ├── referencia/         resultados versionados (ADR-029)
    ├── aceptacion/         una prueba por criterio (RF-01.test.ts, …)
    ├── arquitectura/       RNF-01, RNF-03, RNF-04, RNF-05 e integridad de vendor/
    └── oraculo/            regeneración en el contenedor (ADR-054)
```

Las pruebas unitarias van junto al código (`*.test.ts`). La carpeta del adaptador no lleva la versión en el nombre: la versión soportada es una constante del descriptor, y la etiqueta de origen queda en `PROCEDENCIA.md`.

**Reglas de dependencia** (las controlan el empaquetado y `pruebas/arquitectura/`):

| Módulo | Puede depender de |
|---|---|
| `nucleo` | nada externo; ningún módulo del runtime con E/S |
| `opencode` | `nucleo` (dominio y contrato) y las bibliotecas que admita la política de dependencias (ADR-062) |
| `rige/aplicacion` | `nucleo` |
| `rige/adaptadores` | `rige/aplicacion` (puertos) y `nucleo` (dominio). Solo `adaptadores/sistema` importa `node:fs`, y solo en lectura; solo `adaptadores/almacen-sqlite` importa `bun:sqlite` |
| `rige/interfaces` | `rige/aplicacion` (casos de uso y respuestas); nunca los adaptadores |
| `rige/arranque` | todo |
| cualquiera | ningún cliente de red |

**Convenciones:**

1. **Paridad entre interfaces.** Los casos de uso devuelven objetos de respuesta, que son el único modelo que ven las interfaces. La CLI los serializa y la web los presenta. Una prueba valida contra el esquema publicado cada respuesta de cada escenario. Los tipos y el esquema tienen una sola fuente de verdad; cuál es se decide con el esquema concreto (iteración 2).
2. **Rastro etiquetado.** Cada paso de la resolución registra el código de la regla de negocio que aplicó (RD-01, RD-02, …), y las plantillas de explicación se indexan por ese código. Las reglas de derivación describen el comportamiento de OpenCode 1.18.25 (III.2.4), de modo que el núcleo trata esos códigos como **etiquetas opacas** que aporta el adaptador, y las plantillas de cada regla residen en el adaptador. El núcleo conserva el motor de plantillas y las plantillas genéricas. Así se cumple la segunda condición del criterio de RNF-03: «ninguna identificación de la herramienta aparece en el código del núcleo».
3. **Principio de falla visible.** Ante un defecto interno, RIGE falla de forma visible y nunca completa con un valor por defecto. Ningún `catch` devuelve un valor del dominio. Rige como regla de revisión de código y, donde se pueda, como prueba de arquitectura.
4. **Determinismo (RF-03):**
   - la fecha y la hora de la Resolución y su identificador se guardan en el almacén, pero no integran la respuesta de la CLI;
   - el orden de las claves es estable;
   - las rutas se normalizan (ADR-054);
   - las posiciones se expresan en línea y columna con base 1, y la columna se cuenta en unidades UTF-16. Es la unidad nativa de las cadenas del runtime y la que usan los editores; se confirma frente a la que informe el lector que use OpenCode;
   - `\r\n` cuenta como un solo fin de línea. Se relaciona con R-06 (`.gitattributes`).
5. **Almacén:**
   - se ubica fuera del proyecto analizado, en el directorio de datos del usuario (`$XDG_DATA_HOME/rige` o `~/.local/share/rige`; `%LOCALAPPDATA%\rige`), o en el que indique la configuración propia de RIGE;
   - usa WAL y un tiempo de espera ante bloqueos, porque un agente puede invocar la CLI en paralelo;
   - la política de retención se fija con el modelo de datos (ADR-061);
   - la web presenta lo que *leyó* del almacén, y una prueba verifica que guardar y leer una resolución devuelve exactamente lo mismo.
6. **Web local.** Escucha solo en `127.0.0.1`. Tiene dos intermediarios escritos como funciones que envuelven al enrutador, sin framework:
   - `conVerificacionDeOrigen`: cabecera `Host` limitada a `127.0.0.1:<puerto>` y `localhost:<puerto>`, sin cabeceras CORS y solo el método GET. Mitiga que una página abierta en el navegador lea la configuración mediante DNS rebinding, lo que burlaría la frontera de I.6.4 («sin aceptar conexiones de otros equipos»). ADR-059 propone el requisito correspondiente (RNF-09);
   - `conErrores`: traduce los errores a código HTTP y a una página.
7. **Plataforma como parámetro.** El comparador de patrones copiado ignora las mayúsculas en Windows (ADR-032). La plataforma se le pasa como parámetro para poder probar ambos comportamientos desde el CI en Ubuntu, y los resultados de referencia se guardan por plataforma cuando difieren.
8. **Un solo comando `rige`,** con subcomandos: `valor`, `permiso`, `hallazgos` y `servir`. Los argumentos se leen con `util.parseArgs` del runtime.
9. **Diagnóstico.** La opción `--depurar` escribe en el canal de error el rastro y el stack de los errores internos. No se escriben logs a disco. El tipo opaco de entorno protege también este canal.

**Contrato de salida de la CLI** (completa ADR-051 con la respuesta de error):

| Situación | Canal de salida | Canal de error | Código |
|---|---|---|---|
| Respuesta válida, con o sin hallazgos | JSON de respuesta | — | 0 |
| Comando compuesto (RF-08) | JSON con `decision: null` y la advertencia con su motivo | — | 0 |
| Error de uso: proyecto, agente o clave inexistente | vacío | JSON de error con código estable | 1 |
| Argumentos inválidos | vacío | JSON de error | 2 |
| Versión distinta de la 1.18.25 (RF-05) | vacío | advertencia con la versión esperada y la detectada | 3 |
| Falla interna | vacío | JSON de error `interno` (el stack solo con `--depurar`) | 70 |

Dos interpretaciones de criterios de aceptación que este registro fija:

- **RF-05.** El criterio dice «antes de presentar resultado alguno», lo que admite resultados después de la advertencia; RR-03 dice «no presenta sus resultados como válidos». Se adopta **no presentar ningún resultado**. Un agente que ignora el canal de error consumiría como válidos resultados que no lo son, y ese es el riesgo principal del proyecto. La web actúa igual.
- **RF-08.** El criterio no fija el código de salida. Se adopta **0**, porque es una respuesta correcta que declara que no decide; un código distinto de 0 la confundiría con un error de uso.

**Fundamento.** Es la única combinación que, a la vez:
- hace verificables por la estructura las cinco restricciones no negociables de `src/AGENTS.md`;
- vuelve la paridad entre interfaces una consecuencia del diseño y no de la disciplina;
- respeta el texto de RNF-03 sobre quién declara la precedencia, la fusión y los permisos;
- protege el riesgo principal ante los defectos del propio RIGE.

**Condición que invalidaría la recomendación:**
- Que la instalación aislada de Bun 1.3.14 genere fricción real con `tsc`, `bun test` o el CI. En ese caso se vuelve a P-1, a bajo costo, porque las carpetas coinciden con los paquetes.
- Que el adaptador de una herramienta ficticia que exige el criterio revisado de RNF-03 (ADR-059) muestre que la separación en tres paquetes no corresponde a la frontera real entre lo genérico y lo propio de la herramienta.
- Que la cátedra exija un framework o una organización de código específica.

### Decisión del autor

Pendiente de formalizar con `/aceptar`. En la sesión del 29/09/2026 el autor manifestó conformidad con la propuesta en su conjunto, incluidos el manejo de errores y el contrato de salida, y pidió registrarla.

### Consecuencias

**Si se acepta:**

- **ADR-032:** su lista de carpetas se lee según la estructura de este registro. El resto de ADR-032 sigue vigente.
- **ADR-051:** el esquema de salida describe cuatro respuestas (valores, permisos, hallazgos y error).
- **`src/AGENTS.md`** (lo edita el autor, como en LI-01): agregar la referencia a ADR-058, la tabla de reglas de dependencia, el principio de falla visible y el contrato de salida.
- **`04-diseno/README.md`, sección 1:** actualizar el estado de la fila de este registro.
- **Anexo III:** se agrega la deliberación cuando el capítulo de diseño la requiera.
- **R-06 (`.gitattributes`):** se relaciona con la convención 4. La normalización del repositorio no exime a RIGE de leer `\r\n` en los proyectos de los usuarios.

**Decisiones que este registro no toma** (se abren como pendientes AR-01 a AR-06):

| Tema | Registro previsto |
|---|---|
| Contrato del adaptador (descriptor de capacidades) y modelo del rastro | ADR-060 |
| Ciclo de vida de la Resolución, identidad del Proyecto entre resoluciones, modelo de datos SQLite y retención (cierra R-08, sección 2) | ADR-061 |
| Distribución e invocación (`bun run` o ejecutable único), construcción de la web (HTML del servidor o JSON a una ruta interna), política de dependencias, configuración propia y versionado de RIGE, del esquema de salida y del esquema de base | ADR-062 |
| Pruebas metamórficas para verificar la procedencia contra el oráculo, como complemento de ADR-029 | ADR-063 |
| Puntos de medición por etapas en la resolución (ADR-055) | ADR-060 o ADR-062 |
| Cómo se detecta la versión instalada sin ejecutar OpenCode (RF-05 frente a la Tabla 9 de I.6); cómo se informa un valor efectivo que proviene de una sustitución de entorno | a decidir antes de la iteración 3 |

### Evidencia

- `03-requisitos/libro/catalogo/RF-03.md`, `RF-04.md`, `RF-05.md`, `RF-08.md` (criterios de aceptación); `RNF-01.md` a `RNF-05.md`
- `03-requisitos/libro/entidades.md`; `03-requisitos/libro/reglas.md` (RD-02, RD-03, RD-05, RD-07, RE-01, RE-02, RR-03)
- ADR-019, ADR-023, ADR-029, ADR-032, ADR-051, ADR-054, ADR-055
- `src/AGENTS.md`
- `catedra/AE2-guia-comprobacion-v1.md` (pasos 6 a 8)
- `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` (Tabla 9)
- Documentación de Bun, «Isolated installs», https://bun.com/docs/pm/isolated-installs (consultada el 29/09/2026)
- Sesión de diseño del 29/09/2026
