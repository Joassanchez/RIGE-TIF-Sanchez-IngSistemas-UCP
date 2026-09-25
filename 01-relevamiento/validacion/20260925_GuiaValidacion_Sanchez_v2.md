# Guía y acta de la sesión de validación con la referente — RIGE

**Proyecto:** RIGE · Plataforma local para la resolución y explicación de la configuración efectiva y su procedencia en herramientas de programación basadas en agentes
**Autor:** Sánchez, Joaquín Sebastián
**Instrumento:** 31 · Guía y acta de la sesión de validación
**Capítulos del informe que alimenta:** III · Entorno y Dominio del Sistema de Información (III.2 a III.5) y Libro de trabajo (catálogo, entidades, reglas y glosario)
**Versión:** v2 · 25 de septiembre de 2026. Reemplaza a la v1 del 22 de septiembre de 2026 (`20260922_DecisionesDelimitacion_RIGE_v1.md`); los cambios constan al final.

---

## Datos de la sesión

| Campo | Contenido |
| --- | --- |
| Referente | Valeria Areco — Desarrolladora, equipo de Sistemas de EMSA |
| Participantes | Valeria Areco (referente) · Joaquín Sebastián Sánchez (autor) |
| Fecha y hora | |
| Canal | |
| Duración | |
| Modalidad acordada | El autor adopta las decisiones y las presenta por escrito; la referente confirma, rechaza u observa cada una |

---

## Cómo leer este documento

El documento reúne lo que la referente valida: el entorno del sistema, los límites, el catálogo de requisitos, el modelo del dominio con sus relaciones, las reglas de negocio, el vocabulario y el recorrido del prototipo v0.

- En cada punto, la referente marca **Confirma** o **Rechaza** y, si corresponde, deja una observación.
- Un punto confirmado queda validado. Un punto rechazado vuelve al análisis, se reformula y se presenta de nuevo.
- Las **consultas** son preguntas cuya respuesta completa un dato del proyecto. No requieren confirmación.
- Las **decisiones de ingeniería** (sección 2) se incluyen para conocimiento. No se someten a confirmación, pero se registran las observaciones que la referente quiera dejar.

---

## Sección 0 · Entorno del sistema

Dos elementos del entorno surgen de lo relevado con la referente y condicionan el diseño.

### E-01 · El agente del equipo como consumidor de RIGE

**Decisión.** Se reconoce como sistema vecino al agente de programación que crea o modifica configuración por encargo del desarrollador. RIGE le entrega una salida estructurada, determinista y legible por máquina, con la ruta y la posición exactas de cada declaración determinante, un esquema versionado y códigos de salida que distinguen el error de la ausencia de resultado.

**Motivo.** El equipo ya consulta su configuración mediante un agente (entrevista). Ese uso impone condiciones que una interfaz pensada solo para personas no necesita.

☐ Confirma ☐ Rechaza

Observaciones:

---

### E-02 · Cambios en la configuración mientras RIGE la lee

**Decisión.** Las entradas de configuración pueden modificarse mientras RIGE las lee, por ejemplo cuando un agente las edita. Por eso cada resultado declara sobre qué estado de las entradas se obtuvo, identificado por un resumen del conjunto leído.

**Motivo.** Sin esa identificación, un resultado obtenido antes de un cambio podría tomarse como vigente después de él.

☐ Confirma ☐ Rechaza

Observaciones:

---

## Sección 1 · Límites del sistema

Una exclusión confirmada constituye una frontera del sistema. Cada límite declara qué queda dentro y qué queda fuera.

### L-01 · Edición de archivos de configuración

**Decisión.** RIGE no edita ni modifica ningún archivo de configuración. Opera en modo de solo lectura y escribe únicamente en su propio almacén.

**Motivo.** Las soluciones de terceros relevadas ya editan y navegan la configuración. El aporte diferencial de RIGE consiste en explicar el estado efectivo y su procedencia. Un sistema que modificara el mismo estado que informa dejaría de ser auditable.

**Consecuencia.** El desarrollador localiza la declaración que determina un valor y la modifica en su editor, fuera de RIGE.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-02 · Comandos de terminal compuestos

**Decisión.** RIGE informa la decisión de permiso únicamente para comandos de terminal simples. Ante un comando compuesto —tuberías, encadenamientos, redirecciones, subshells y sustituciones de comandos— emite una advertencia en lugar de una decisión.

**Motivo.** OpenCode descompone el comando en un árbol sintáctico y evalúa cada subcomando por separado, según lo verificado en el relevamiento técnico. Informar la decisión exigiría reproducir ese análisis. Un error en la reproducción daría una decisión incorrecta con precisión aparente, que es peor que no informar ninguna.

**Consecuencia.** Una parte de los comandos de uso habitual queda sin decisión informada, con una advertencia que identifica el motivo.

**Consulta.** ¿Qué proporción de los comandos que el equipo usa habitualmente son compuestos?

Respuesta:

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-03 · Credenciales de autenticación

**Decisión.** RIGE no lee, no resuelve y no muestra credenciales de autenticación. De cada variable de entorno informa el nombre y si está definida o no, nunca su contenido.

**Motivo.** Las credenciales determinan el acceso a los modelos, no el comportamiento de los agentes, que es el objeto del sistema. Exponerlas convertiría a RIGE en un riesgo de seguridad.

**Consecuencia.** El sistema no permite diagnosticar problemas de autenticación.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-04 · Uso compartido, en servidor o por equipos

**Decisión.** RIGE es de uso individual y ejecución local, sin conexión con servicios externos. No contempla uso compartido, instalación en servidor ni estado común entre usuarios.

**Motivo.** La frontera del sistema se sitúa en el entorno de trabajo individual del desarrollador. La ejecución local y sin conexión es coherente con esa frontera y con el carácter auditable de la herramienta.

**Consecuencia.** Cada integrante del equipo puede usar RIGE en su propio entorno. No existe un estado compartido ni una vista conjunta del equipo.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-05 · Herramientas y versiones cubiertas

**Decisión.** El proyecto cubre exclusivamente OpenCode 1.18.25, versión que permanece congelada durante todo el desarrollo. Ante otra versión instalada, RIGE advierte y no presenta sus resultados como válidos.

**Motivo.** Las reglas de precedencia y de fusión cambian entre versiones. La versión fija es lo que permite verificar que el resultado de RIGE coincide con el comportamiento real de OpenCode. La arquitectura separa un núcleo independiente de la herramienta de un adaptador específico, de modo que incorporar otras herramientas es trabajo posterior y no exige rehacer el sistema.

**Consecuencia.** Otras herramientas de programación agéntica y otras versiones de OpenCode quedan fuera del alcance comprometido.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-06 · Alcance de la línea de comandos · *revisada respecto de la v1*

**Decisión.** La línea de comandos es la interfaz completa de RIGE, destinada a un agente y al desarrollador que trabaja en la terminal. Dado un proyecto y un agente, informa:

- los valores efectivos, con la procedencia de cada uno: archivo y posición de la declaración determinante;
- la decisión de permiso para una acción, con la regla que la determina;
- los hallazgos: referencias no resueltas, reglas sin efecto, elementos sin uso, sustituciones sin valor y entradas ilegibles o descartadas.

La salida es estructurada, determinista y se ajusta a un esquema publicado que declara su versión. Con la opción `--explicar`, agrega la explicación en lenguaje natural de la decisión o del hallazgo.

Quedan diferidos como trabajo posterior los listados de elementos, la exportación del ecosistema completo y la consulta inversa, que consiste en averiguar qué agentes pueden realizar una acción.

**Motivo.**
- La necesidad surge de la entrevista: un agente que crea o modifica configuración necesita saber sobre qué archivo intervenir.
- La consulta de permisos, que la v1 difería, se incorpora porque un agente solo puede usar RIGE por esta vía, y las consultas de permisos son tan relevantes como las de valores para el problema que el proyecto aborda.
- La explicación se entrega solo a pedido para no aumentar el texto que el agente procesa en cada consulta.

**Consecuencia.** El agente obtiene por esta vía valores, permisos y hallazgos. No obtiene listados ni la exportación completa.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-07 · RIGE no aplica ni valida los cambios del agente

**Decisión.** RIGE informa el estado efectivo de la configuración. No aplica cambios, no los valida y no verifica el resultado de las ediciones que un agente externo realice a partir de la información entregada. La responsabilidad sobre esas ediciones corresponde al desarrollador que opera el agente.

**Motivo.** Se desprende del modo de solo lectura de L-01. Se declara de manera expresa para que no se interprete que RIGE participa de la escritura o que avala su resultado.

**Consecuencia.** Si el agente aplica un cambio incorrecto, RIGE no lo impide ni lo advierte en el momento. Un análisis posterior muestra el estado efectivo resultante.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-09 · Comparación entre estados y validación contra el esquema

**Decisión.** Quedan fuera del alcance la comparación entre dos estados resueltos en momentos distintos y la validación completa de los archivos contra el esquema publicado de la herramienta.

**Motivo.** Ambas son funciones distintas de resolver y explicar el estado efectivo, y cada una requiere un diseño de interfaz y de pruebas propio. RIGE sí detecta las entradas ilegibles, que son las que impiden resolver.

**Consecuencia.** El sistema no responde qué cambió entre dos momentos ni actúa como validador de sintaxis de la configuración.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-10 · Dos interfaces con papeles distintos · *nueva*

**Decisión.** RIGE ofrece dos interfaces sobre el mismo núcleo, que informan los mismos resultados:
- la **línea de comandos**, completa (L-06);
- una **interfaz web local**, que se abre en el navegador del propio equipo sin conexión externa. Se limita a formularios y vistas de consulta de valores, permisos y hallazgos, sin funciones que la línea de comandos no tenga.

**Motivo.** El agente consulta por la línea de comandos. La interfaz web permite al desarrollador hacer las consultas principales sin recordar comandos. Limitarla concentra el esfuerzo en la exactitud de los resultados y no en la presentación.

**Consecuencia.** La interfaz web no ofrece exploración libre del ecosistema, filtros ni navegación entre elementos en esta etapa.

**Consulta.** ¿El equipo consultaría RIGE principalmente desde la terminal, desde el navegador o a través de su agente?

Respuesta:

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-11 · Sistemas operativos · *nueva*

**Decisión.** RIGE se acredita sobre Ubuntu 26.04, que es la plataforma de referencia, y sobre Windows 11. macOS queda sin acreditar en esta etapa. La instalación es nativa y no requiere privilegios administrativos.

**Motivo.** El relevamiento técnico se realizó sobre ambos sistemas y el proyecto dispone de los dos para verificar. No dispone de un equipo con macOS.

**Consecuencia.** RIGE puede funcionar en macOS, pero sus resultados no se garantizan en esa plataforma.

**Consulta.** ¿Qué sistemas operativos usa el equipo para programar con OpenCode?

Respuesta:

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-12 · Relaciones entre elementos · *nueva*

**Decisión.** En esta etapa no se representan los vínculos entre elementos: el modelo que usa cada agente, el agente que invoca cada comando, las herramientas que aporta cada servidor MCP y las skills disponibles para cada agente. Se registran como capacidad posterior.

**Motivo.** El proyecto prioriza lo que resuelve el problema acreditado: qué valor rige, de dónde viene y qué decide cada permiso. Las relaciones requieren un desarrollo propio que excede las horas disponibles.

**Consecuencia.** RIGE informa cada elemento y su procedencia, pero no dibuja ni lista cómo se conectan entre sí.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-13 · Explicación sin modelo de lenguaje · *nueva*

**Decisión.** La explicación en lenguaje natural se genera con plantillas fijas a partir del recorrido de la resolución, sin intervención de un modelo de lenguaje. Se ofrece para las decisiones de permiso y los hallazgos. Los valores se informan con su procedencia, sin texto explicativo.

**Motivo.**
- Un modelo de lenguaje exigiría una conexión externa, y RIGE opera sin conexión (L-04).
- Podría dar respuestas distintas ante la misma pregunta.
- Tendría un costo por uso.
- Con plantillas, la explicación se verifica igual que la decisión que explica.

**Consecuencia.** Las explicaciones son más rígidas que las de un asistente conversacional, pero idénticas ante la misma configuración.

☐ Confirma ☐ Rechaza

Observaciones:

---

## Sección 2 · Decisiones de ingeniería, para conocimiento

Estas exclusiones derivan de una imposibilidad técnica o de la frontera individual del sistema, y se sostienen en su fundamento de ingeniería. No se someten a confirmación, pero se registran las observaciones que la referente quiera dejar.

| Qué se incluye | Qué queda fuera | Motivo | Observaciones |
| --- | --- | --- | --- |
| Entradas del entorno individual del desarrollador | Configuración remota y la administrada a nivel de sistema operativo | Requieren privilegios administrativos y son ajenas a la frontera individual | |
| Elementos que determinan el comportamiento de los agentes | Configuración de la interfaz de la herramienta | No altera lo que un agente hace ni lo que puede hacer | |
| Permisos declarados y reglas nativas | Aprobaciones permanentes concedidas por el desarrollador | Se guardan fuera de las entradas de configuración, asociadas al texto literal de cada acción. RIGE declara esta condición junto a cada decisión | |
| Instrucciones de alcance global y de proyecto | Instrucciones declaradas en subdirectorios del proyecto | Se incorporan durante la sesión según los archivos que lee el agente, de modo que no constituyen un dato estático de la configuración | |
| Plugins como elementos declarados, con su origen | Efecto del código de los plugins sobre la configuración | Determinarlo exige ejecutar código de terceros, contrario al modo de solo lectura | |
| Declaración y habilitación de servidores MCP | Disponibilidad, contenido y seguridad de esos servidores | Corresponden a los escáneres de seguridad relevados | |
| Instrucciones como entrada de configuración | Evaluación de la calidad de su contenido | Aborda qué dicen las instrucciones y no qué configuración rige | |
| Variables de entorno del proceso de RIGE | Entorno de una sesión concreta de OpenCode y diferencias entre sus modos de ejecución | RIGE no se conecta con la ejecución de la herramienta; la condición se advierte junto a los resultados | |

---

## Sección 3 · Catálogo de requisitos

Cada requisito se presenta con su enunciado y su prioridad. La prioridad sigue el método MoSCoW:
- **Must:** el requisito se compromete y forma parte del producto mínimo viable.
- **Should:** se incorpora si las horas lo permiten.
- **Could:** es deseable y sin compromiso.
- **Won't:** queda fuera de esta etapa.

El criterio de aceptación de cada requisito consta en el catálogo del Libro de trabajo y se muestra si la referente lo solicita. Los enunciados marcados con † cambian respecto de la versión conocida.

### 3.1 · Requisitos Must (14)

| ID | Enunciado | Confirma | Rechaza | Observaciones |
| --- | --- | --- | --- | --- |
| RF-01 | Dado un agente y una clave de configuración, RIGE informa el valor efectivo, la declaración que lo determina con su entrada, archivo y posición, y las declaraciones desplazadas | ☐ | ☐ | |
| RF-02 | Dado un agente y una acción, RIGE informa la decisión de permiso, la cadena ordenada de reglas coincidentes, la regla determinante con su carácter nativo o declarado y su procedencia, y una explicación del motivo por el cual esa regla prevalece | ☐ | ☐ | |
| RF-03 † | RIGE expone por línea de comandos, dado un proyecto y un agente, los valores efectivos con su procedencia, archivo y posición y, dada una acción, la decisión de permiso con su regla determinante. La salida es estructurada, determinista y se ajusta a un esquema publicado que declara su versión; a pedido, incluye la explicación | ☐ | ☐ | |
| RF-04 | RIGE localiza las entradas de configuración aplicables al proyecto, con su tipo, su orden de precedencia y su estado de legibilidad | ☐ | ☐ | |
| RF-05 | RIGE advierte cuando la versión de OpenCode instalada difiere de la 1.18.25 y no presenta sus resultados como válidos | ☐ | ☐ | |
| RF-06 | RIGE distingue los valores que ninguna entrada declara y las reglas de permiso que la herramienta incorpora, identificándolos como implícitos o nativos | ☐ | ☐ | |
| RF-07 † | RIGE detecta referencias no resueltas, reglas de permiso sin efecto, elementos sin uso, sustituciones sin valor, entradas ilegibles y entradas descartadas sin error visible, con la localización de la declaración que los origina y una explicación de su causa, por ambas interfaces | ☐ | ☐ | |
| RF-08 | Ante un comando de terminal compuesto, RIGE emite una advertencia en lugar de informar una decisión de permiso | ☐ | ☐ | |
| RF-09 | RIGE advierte cuando una declaración del usuario desactiva una regla nativa de protección del agente | ☐ | ☐ | |
| RNF-01 | RIGE no modifica ninguna entrada de configuración; escribe únicamente en su propio almacén | ☐ | ☐ | |
| RNF-02 | El valor efectivo y la decisión de permiso que informa RIGE coinciden con los de OpenCode 1.18.25 | ☐ | ☐ | |
| RNF-03 | El núcleo no depende del adaptador de OpenCode: los tipos de elemento, el orden de precedencia, la estrategia de fusión y la forma de evaluar permisos los declara el adaptador | ☐ | ☐ | |
| RNF-04 | RIGE informa el nombre de cada variable de entorno y su condición de definida o no definida, y nunca su contenido | ☐ | ☐ | |
| RNF-05 | RIGE opera sin conexión a servicios externos durante el análisis | ☐ | ☐ | |

### 3.2 · Requisitos Should (5)

| ID | Enunciado | Confirma | Rechaza | Observaciones |
| --- | --- | --- | --- | --- |
| RF-10 † | RIGE informa, junto con la decisión de permiso, si la herramienta queda disponible para el modelo o si la configuración la retira por completo. *Pasa de Must a Should* | ☐ | ☐ | |
| RF-11 | RIGE presenta un resumen del ecosistema con la cantidad de elementos por tipo y la cantidad de hallazgos por tipo | ☐ | ☐ | |
| RNF-06 † | RIGE resuelve las rutas de configuración según el sistema operativo, opera sobre Ubuntu 26.04 y Windows 11 y se instala sin privilegios administrativos (L-11) | ☐ | ☐ | |
| RNF-07 † | Una consulta por línea de comandos finaliza en menos de 2 segundos sobre un proyecto del doble de tamaño que el del equipo de la referente, en el equipo de referencia del proyecto. *Ver la consulta siguiente* | ☐ | ☐ | |
| RNF-08 † | Todo cambio incompatible del esquema de salida de la línea de comandos incrementa su versión mayor, de modo que un consumidor sabe cuándo debe adaptarse | ☐ | ☐ | |

**Consulta (RNF-07).** Para dimensionar el proyecto de referencia:

| Dato del proyecto real del equipo | Respuesta |
| --- | --- |
| Cantidad aproximada de agentes y subagentes | |
| Cantidad de entradas de configuración: archivos globales, de proyecto, variables y otras | |
| Cantidad aproximada de elementos: comandos, skills, servidores MCP y otros | |
| ¿2 segundos por consulta resulta aceptable para el uso del agente del equipo? | |

### 3.3 · Requisitos Could (3) y Won't (1)

| ID | Enunciado | Prioridad | Confirma | Rechaza | Observaciones |
| --- | --- | --- | --- | --- | --- |
| RF-12 | RIGE abre en el editor configurado el archivo y la posición de la declaración que determina un valor | Could | ☐ | ☐ | |
| RF-13 | RIGE representa los vínculos entre los elementos del ecosistema (L-12) | Could | ☐ | ☐ | |
| RF-14 | RIGE exporta el estado resuelto del ecosistema a un archivo | Could | ☐ | ☐ | |
| RF-15 | RIGE presenta la matriz de agentes por tipo de permiso y responde la consulta inversa de los agentes que pueden realizar una acción determinada | Won't | ☐ | ☐ | |

---

## Sección 4 · Modelo del dominio

Las entidades son las nociones con identidad propia sobre las que el sistema trabaja. Se pregunta si cada definición coincide con el uso del equipo y si falta alguna noción que el equipo emplee.

| Entidad | Definición | Confirma | Rechaza | Observaciones |
| --- | --- | --- | --- | --- |
| Proyecto analizado | Contexto sobre el cual se resuelve el estado efectivo de la configuración | ☐ | ☐ | |
| Resolución | Estado efectivo del ecosistema obtenido en un momento determinado | ☐ | ☐ | |
| Entrada de configuración | Vía por la cual OpenCode incorpora configuración al resolver el estado efectivo, sea o no un archivo | ☐ | ☐ | |
| Declaración | Asignación concreta escrita dentro de una entrada | ☐ | ☐ | |
| Sustitución | Reemplazo de una variable de entorno o de un archivo dentro de una declaración | ☐ | ☐ | |
| Elemento | Unidad de configuración que RIGE resuelve y relaciona, cuyo tipo declara el adaptador | ☐ | ☐ | |
| Agente | Elemento sobre el cual se manifiesta el efecto de toda la configuración; evalúa una cadena de reglas de permiso e invoca subagentes | ☐ | ☐ | |
| Regla de permiso | Declaración que produce una decisión de permiso, de carácter nativo o declarado por el usuario | ☐ | ☐ | |
| Hallazgo | Defecto detectado en el ecosistema, con su localización | ☐ | ☐ | |

Las relaciones entre entidades se enuncian como frases. Se valida si cada frase resulta verdadera dicha en voz alta.

| Relación | Cardinalidad | Confirma | Rechaza | Observaciones |
| --- | --- | --- | --- | --- |
| Un proyecto analizado se resuelve en muchas resoluciones sucesivas | 1 a N | ☐ | ☐ | |
| Una resolución lee muchas entradas de configuración | 1 a N | ☐ | ☐ | |
| Una entrada contiene muchas declaraciones | 1 a N | ☐ | ☐ | |
| Una declaración contiene ninguna o muchas sustituciones | 1 a N | ☐ | ☐ | |
| Una declaración puede quedar desplazada por otra declaración de mayor precedencia | 1 a 1, opcional | ☐ | ☐ | |
| Un elemento se compone de muchas declaraciones, de las cuales una resulta determinante | 1 a N | ☐ | ☐ | |
| Un elemento se relaciona con muchos otros elementos, con un tipo de relación declarado | N a N | ☐ | ☐ | |
| Un agente evalúa una cadena ordenada de muchas reglas de permiso | 1 a N | ☐ | ☐ | |
| Un agente puede invocar muchos subagentes, y cada subagente hereda de aquel sus reglas de denegación | 1 a N | ☐ | ☐ | |
| Una resolución produce ninguno o muchos hallazgos | 1 a N | ☐ | ☐ | |
| Un hallazgo recae sobre un elemento o sobre una declaración | 1 a 1 | ☐ | ☐ | |

La relación entre elementos forma parte del modelo aunque su representación en el sistema quede diferida (L-12).

**Consulta.** ¿Hay alguna noción que el equipo use al hablar de su configuración y que no figure en las tablas?

Respuesta:

---

## Sección 5 · Reglas de negocio

Las reglas de **derivación** y de **existencia** describen cómo se comporta OpenCode 1.18.25 y fueron verificadas en ejecución durante el relevamiento técnico. Se pregunta si coinciden con la experiencia del equipo. Las reglas de **restricción** derivan de los límites de la sección 1.

| Cód. | Tipo | Enunciado | Confirma | Rechaza | Observaciones |
| --- | --- | --- | --- | --- | --- |
| RD-01 | Derivación | El valor efectivo de una clave resulta de aplicar las entradas en su orden de precedencia; prevalece la declaración de la última entrada que la declara | ☐ | ☐ | |
| RD-02 | Derivación | En la fusión profunda, la posición de una clave la determina la primera entrada que la declara, y su valor, la última | ☐ | ☐ | |
| RD-03 | Derivación | La decisión de permiso resulta de evaluar la cadena ordenada de reglas —nativas generales, nativas del agente, declaradas globales y declaradas del agente— y la determina la última coincidencia | ☐ | ☐ | |
| RD-04 | Derivación | Si ninguna declaración del usuario alcanza una clave, rige el valor implícito de la herramienta | ☐ | ☐ | |
| RD-05 | Derivación | El subagente hereda del agente que lo invoca únicamente las reglas de denegación y las de directorio externo; el resto proviene de su propio conjunto, al que se agregan denegaciones implícitas | ☐ | ☐ | |
| RD-06 | Derivación | Si la última regla coincidente para una herramienta declara patrón general y efecto de denegación, la herramienta no se ofrece al modelo; una excepción posterior vuelve a exponerla por completo | ☐ | ☐ | |
| RD-07 | Derivación | Una declaración del usuario que alcanza una acción denegada por una regla nativa del agente prevalece sobre ella, dado que las declaradas se concatenan después de las nativas | ☐ | ☐ | |
| RE-01 | Existencia | Un elemento ingresa a la resolución solo si proviene de una entrada legible; si la entrada es ilegible, su carga se detiene con error y se registra el hallazgo | ☐ | ☐ | |
| RE-02 | Existencia | Una regla se marca sin efecto solo si existe una regla posterior del mismo tipo que abarca todos los casos que ella cubre | ☐ | ☐ | |
| RE-03 | Existencia | Un elemento se marca sin uso solo si ningún agente puede utilizarlo y ninguna declaración lo referencia | ☐ | ☐ | |
| RR-01 | Restricción | RIGE no modifica ninguna entrada de configuración; escribe únicamente en su propio almacén (L-01) | ☐ | ☐ | |
| RR-02 | Restricción | RIGE no expone el contenido de una variable de entorno; informa su nombre y su condición de definida o no definida (L-03) | ☐ | ☐ | |
| RR-03 | Restricción | RIGE resuelve únicamente sobre OpenCode 1.18.25; ante otra versión instalada advierte y no presenta sus resultados como válidos (L-05) | ☐ | ☐ | |

---

## Sección 6 · Vocabulario del proyecto (L-08)

La documentación de la herramienta y el uso corriente emplean términos distintos para lo mismo —fuente, capa, alcance, nivel— y usan «permiso» tanto para la decisión como para la regla. Se adoptan los siguientes términos, que rigen en el informe y en la interfaz del sistema.

| Término | Definición | Confirma | Rechaza | Término que usa el equipo |
| --- | --- | --- | --- | --- |
| Entrada de configuración | Cada una de las vías por las que OpenCode incorpora configuración al resolver el estado efectivo, sea o no un archivo | ☐ | ☐ | |
| Archivo de configuración | Entrada que se materializa en un archivo del disco, con ruta y posición | ☐ | ☐ | |
| Declaración | Cada asignación concreta escrita dentro de una entrada | ☐ | ☐ | |
| Procedencia | Cadena que conduce al valor efectivo: entrada, archivo y posición de la declaración determinante y, si esta contiene una sustitución, el origen de su contenido | ☐ | ☐ | |
| Permiso | Decisión resultante para un agente y una acción: permitida, sujeta a confirmación o denegada | ☐ | ☐ | |
| Regla de permiso | Declaración que produce esa decisión, de carácter nativo o declarado por el usuario | ☐ | ☐ | |
| Entrada ilegible | Entrada que no puede interpretarse, por errores de sintaxis o por referenciar una sustitución de archivo inexistente, lo que detiene su carga con error | ☐ | ☐ | |

Si el término del equipo difiere del adoptado, se registra como sinónimo en el glosario del dominio.

---

## Sección 7 · Prototipo v0 (maqueta)

| Campo | Contenido |
| --- | --- |
| Herramienta | [DATO PENDIENTE: herramienta con que se construyó la maqueta] |
| Enlace | [DATO PENDIENTE: enlace a la maqueta navegable] |
| Naturaleza | Maqueta navegable de baja fidelidad y no funcional: no calcula, no persiste ni lee archivos, y sus datos son ilustrativos |

La maqueta representa el recorrido de consulta del desarrollador. Se valida el **flujo**, no la estética: si cada pantalla responde una pregunta que el equipo efectivamente formula, si el orden es el que el equipo seguiría y si falta o sobra alguna pantalla. La columna «En la versión comprometida» indica qué parte de cada pantalla llega a la interfaz web limitada (L-10).

| N.º | Pantalla | Qué muestra | En la versión comprometida | Confirma | Rechaza | Observaciones |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Selección del proyecto | Elección del proyecto a analizar | Incluida | ☐ | ☐ | |
| 2 | Resumen del ecosistema y de sus hallazgos | Cantidad de elementos y de hallazgos por tipo | Condicionada: el resumen es Should (RF-11); los hallazgos, Must (RF-07) | ☐ | ☐ | |
| 3 | Detalle de un agente | Valores efectivos, procedencia, declaraciones desplazadas y elementos relacionados | Incluida, salvo los elementos relacionados, que quedan diferidos (L-12) | ☐ | ☐ | |
| 4 | Consulta de permiso | Decisión, cadena de reglas y regla determinante, con su explicación | Incluida (RF-02) | ☐ | ☐ | |
| 5 | Detalle de un hallazgo | Localización de la declaración que lo origina y explicación de su causa | Incluida (RF-07) | ☐ | ☐ | |

**Preguntas para la referente:**
- ¿El recorrido responde las preguntas que el equipo se hace sobre su configuración?
- ¿Falta alguna pantalla o alguna información que el equipo necesitaría ver?
- ¿El orden de las pantallas es el que el equipo seguiría?

Respuestas:

---

## Sección 8 · Consultas y pedidos pendientes

| Tema | Detalle | Respuesta |
| --- | --- | --- |
| Comandos compuestos (L-02) | Proporción de comandos compuestos en el uso habitual | |
| Interfaz preferida (L-10) | Terminal, navegador o agente | |
| Sistemas operativos (L-11) | Sistemas en uso en el equipo | |
| Tamaño del proyecto (RNF-07) | Agentes, entradas y elementos; aceptación del umbral de 2 segundos | |
| Nociones faltantes (sección 4) | Términos del dominio no incluidos | |
| Prototipo v0 (sección 7) | Recorrido, pantallas faltantes y orden | |
| Agente del equipo | Pedido enviado: definición del agente con que el equipo consulta su configuración y, si existe, la del agente con que crea otros agentes; fecha de su última modificación y autorización para citarlo como aporte del equipo de Sistemas de EMSA | |

---

## Conformidad de la referente

Los puntos de las secciones 0, 1 y 3 a 7 fueron presentados, leídos y tratados en la fecha consignada al inicio de este documento.

Puntos confirmados:

Puntos rechazados o con observación:

Observaciones generales:

Constancia de conformidad de la referente (firma o correo de conformidad):

---
---

## Cambios respecto de la versión 1

La v1 (22/09/2026) se limitaba a los límites del sistema y a la terminología. La v2 incorpora las decisiones adoptadas por el autor entre el 22 y el 25 de septiembre de 2026 y amplía el alcance de la sesión a lo que la cátedra exige validar: catálogo de requisitos y modelo del dominio (Guía AE2, sección 14, actividad b).

| Punto | Cambio | Decisión que lo origina |
| --- | --- | --- |
| L-06 | La consulta de permisos por línea de comandos deja de estar diferida; se agregan los hallazgos, el esquema versionado y la explicación a pedido | ADR-036, ADR-041, ADR-042 |
| L-08 | Pasa a la sección 6 y se agrega «entrada ilegible» | ADR-020 |
| L-10 a L-13 | Límites nuevos: interfaces, sistemas operativos, relaciones entre elementos y explicación sin modelo de lenguaje | ADR-042, ADR-037, ADR-034, ADR-021 y ADR-036 |
| Secciones 0 y 2 a 6 | Nuevas: entorno (elementos de III.1 que remiten al acta), decisiones de ingeniería para conocimiento, catálogo, modelo del dominio con relaciones y cardinalidades, reglas y vocabulario | Guía AE2 (sesión de validación del modelo del dominio y del catálogo) |
| RF-03, RF-07, RF-10, RNF-06, RNF-07, RNF-08 | Enunciados o prioridad actualizados (†) | ADR-035, ADR-036, ADR-037, ADR-041, ADR-042, ADR-044 |
| Sección 7 | Nueva: validación del flujo del prototipo v0, pendiente desde la AE1 (I.6.6) | ADR-009; pendiente R-03 |
| v1, 2.1 · Verificaciones técnicas | Resueltas en el relevamiento técnico: herencia de reglas en subagentes (Anexo I, A.I.3, resultado 12; RD-05), sustitución de una variable no definida por texto vacío (resultado 13) y descomposición de comandos compuestos (resultado 15; H-15) | Relevamiento técnico |
| v1, 2.2 · Persistencia | Resuelta: almacén propio sin caché; la caché queda diferida | ADR-023 |
| v1, 2.3 · Alcance según las horas | Cerrado: 14 requisitos Must de 23, coincidentes con el producto mínimo viable | ADR-030, ADR-035 |
