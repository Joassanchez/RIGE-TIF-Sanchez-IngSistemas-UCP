# ANEXO V · GLOSARIO DEL DOMINIO Y REGLAS DE NEGOCIO

## A.V.1 · Glosario del dominio

El glosario fija el vocabulario normativo del informe y, más adelante, el del modelo de datos del sistema. Las definiciones precisan las del apartado I.6.3 y emplean «entrada ilegible» para las entradas que no pueden interpretarse.

| **Término**                    | **Definición operativa**                                                                                                                                        | **Falsos amigos y sinónimos**                                                      | **Fuente**              | **En disputa**                          |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|-------------------------|-----------------------------------------|
| Entrada de configuración | Vía por la cual OpenCode incorpora configuración al resolver el estado efectivo, sea o no un archivo | La documentación emplea *source*; el uso corriente alterna capa, alcance y nivel | A.VI.3, resultado 1; acta del 26/09/2026 | No |
| Archivo de configuración | Entrada que se materializa en un archivo del disco, con ruta y posición | No toda entrada es un archivo: cuatro de ellas no lo son | A.VI.3, resultado 1; acta del 26/09/2026 | No |
| Declaración | Asignación concreta escrita dentro de una entrada | — | A.VI.3, resultado 6; acta del 26/09/2026 | No |
| Valor efectivo                 | Valor que OpenCode aplica a una clave tras combinar todas las entradas                                                                                          | Se distingue del valor declarado, que puede no prevalecer                          | A.VI.3, resultado 1      | No                                      |
| Procedencia | Cadena que conduce al valor efectivo: entrada, archivo y posición de la declaración determinante y, si esta contiene una sustitución, el origen de su contenido | — | A.VI.3, resultado 6; acta del 26/09/2026 | No |
| Valor implícito                | Valor que la herramienta aplica sin declaración del usuario                                                                                                     | —                                                                                  | apartado I.6.3      | No                                      |
| Regla nativa                   | Regla de permiso que la herramienta incorpora sin declaración del usuario                                                                                       | —                                                                                  | A.VI.3, resultado 7      | No                                      |
| Permiso | Decisión resultante para un agente y una acción: permitida, sujeta a confirmación o denegada | El uso corriente lo emplea también para la regla que produce la decisión | A.VI.3, resultado 5; acta del 26/09/2026 | No |
| Regla de permiso | Regla que produce una decisión de permiso, nativa de la herramienta o escrita por el usuario en una declaración | Véase la entrada anterior | A.VI.3, resultado 5; acta del 26/09/2026 | No |
| Declaración desplazada         | Declaración reemplazada por otra de mayor precedencia sobre la misma clave                                                                                      | —                                                                                  | A.VI.3, resultado 6      | No                                      |
| Regla sin efecto               | Regla de permiso que nunca determina una decisión, dado que una regla posterior del mismo tipo abarca todos los casos que ella cubre                            | Corresponde a la anomalía de sombreado                                             | adaptado de Al-Shaer y Hamed (2004) | No                                      |
| Referencia no resuelta         | Declaración que nombra por su nombre un elemento que no figura en la resolución, o un archivo inexistente                                                                                                     | —                                                                                  | apartado I.6.3; Anexo III, D-61              | No                                      |
| Elemento sin uso               | Elemento declarado al que ninguna declaración de un agente ni de un comando nombra                                                                | —                                                                                  | apartado I.6.3; Anexo III, D-61              | No                                      |
| Sustitución sin valor          | Sustitución de una variable de entorno no definida, que se reemplaza por un texto vacío sin advertencia                                                         | —                                                                                  | A.VI.3, resultado 13     | No                                      |
| Entrada ilegible | Entrada que no puede interpretarse, por errores de sintaxis o por referenciar una sustitución de archivo inexistente, lo que detiene su carga con error | Sustituye la denominación «fuente ilegible» del informe de la AE1 | apartado I.6.3; acta del 26/09/2026 | No |
| Entrada descartada sin error visible | Entrada que la herramienta desestima por contener un contenido inválido, cuyo descarte solo consta en el archivo de registro                | Se distingue de la entrada ilegible, que sí produce error                          | A.VI.3, resultado 14     | No                                      |
| Aprobación persistida          | Autorización que el desarrollador concede de manera permanente, asociada al texto literal de la acción, que subsiste entre sesiones                             | No constituye una entrada de configuración ni la muestra comando alguno            | A.VI.3, resultado 11     | No                                      |
| Elemento | Unidad de configuración que RIGE resuelve y relaciona, cuyo tipo declara el adaptador | — | III.2, Tabla 2; A.VI.3, resultado 1; AE1, Tabla 6 | No |
| Agente | Especialización de Elemento sobre la cual se manifiesta el efecto de toda la configuración | — | III.2, Tabla 2; A.VI.3, resultados 5 y 12 | No |
| Subagente | Agente que otro agente invoca y que hereda sus reglas de denegación | — | RD-05; A.VI.3, resultado 12 | No |
| Hallazgo | Defecto detectado en el ecosistema, con su localización | — | III.2, Tabla 2; A.VI.3, resultados 3, 5, 13 y 14 | No |
| Resolución | Estado efectivo del ecosistema obtenido en un momento determinado | — | III.2, Tabla 2; A.VI.3, resultados 1 y 3 | No |
| Instrucción | Archivo de instrucciones que se incorpora al contexto de un agente; entrada de configuración cuyo contenido RIGE no evalúa | — | (Anexo III, D-61) | No |
| Elemento nativo | Elemento que la herramienta incorpora sin declaración del usuario | — | (Anexo III, D-61) | No |

*Tabla A.V.1. Glosario del dominio. Fuente: elaboración propia. Los siete términos con fuente en el acta se validaron con la referente en la sesión del 26/09/2026.*

## A.V.2 · Registro de reglas de negocio

Las reglas de derivación describen el comportamiento de OpenCode 1.18.25: cinco de ellas (RD-02, RD-03, RD-05, RD-06 y RD-07) se verificaron, además, mediante la ejecución de escenarios controlados, y las dos restantes, mediante la lectura del código fuente o de la salida de los comandos de introspección.

| **Cód.** | **Tipo**    | **Enunciado verificable**                                                                                                                                                                         | **Fuente**                        | **Estado**              | **Requisito derivado** |
|----------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|-------------------------|------------------------|
| RD-01 | Derivación | El valor efectivo de una clave resulta de aplicar las entradas en su orden de precedencia; prevalece la declaración de la última entrada que la declara | H-01; acta del 26/09/2026 | Validada | RF-01 |
| RD-02 | Derivación | En la fusión profunda, la posición de una clave la determina la primera entrada que la declara y su valor, la última | H-06; acta del 26/09/2026 | Validada | RF-01 |
| RD-03 | Derivación | La decisión de permiso resulta de evaluar la cadena ordenada de reglas (nativas generales, nativas del agente, declaradas globales y declaradas del agente) y la determina la última coincidencia | H-05; acta del 26/09/2026 | Validada | RF-02 |
| RD-04 | Derivación | Si ninguna declaración del usuario alcanza una clave, rige el valor implícito de la herramienta | apartado I.6.3; acta del 26/09/2026 | Validada | RF-06 |
| RD-05 | Derivación | El subagente hereda del agente que lo invoca únicamente las reglas de denegación y las de directorio externo; el resto proviene de su propio conjunto, al que se agregan denegaciones implícitas | H-12; acta del 26/09/2026 | Validada | RF-02 |
| RD-06 | Derivación | Si la última regla coincidente para una herramienta declara patrón general y efecto de denegación, la herramienta no se ofrece al modelo; una excepción posterior vuelve a exponerla por completo | H-08; acta del 26/09/2026 | Validada | RF-10 |
| RD-07 | Derivación | Una declaración del usuario que alcanza una acción denegada por una regla nativa del agente prevalece sobre ella, dado que las declaradas se concatenan después de las nativas | H-07; acta del 26/09/2026 | Validada | RF-09 |
| RR-01 | Restricción | RIGE no modifica ninguna entrada de configuración; escribe únicamente en su propio almacén | Acta del 26/09/2026, decisión L-01 | Validada | RNF-01 |
| RR-02 | Restricción | RIGE no expone el contenido que una sustitución incorpora; informa su origen y su condición de definido o no definido | Acta del 26/09/2026, decisión L-03; acta de validación, extensión | Validada | RNF-04 |
| RR-03 | Restricción | RIGE resuelve únicamente sobre OpenCode 1.18.25; ante otra versión instalada advierte y no presenta sus resultados como válidos | Acta del 26/09/2026, decisión L-05 | Validada | RF-05 |
| RE-01 | Existencia | Un elemento ingresa a la resolución si proviene de una entrada legible o si la herramienta lo incorpora sin declaración (nativo); si una entrada es ilegible, su carga se detiene con error y se registra el hallazgo correspondiente | apartado I.6.3; acta del 26/09/2026; acta de validación, extensión | Validada | RF-04, RF-07 |
| RE-02 | Existencia | Una regla se marca sin efecto solo si existe una regla posterior del mismo tipo que abarca todos los casos que ella cubre | H-05; adaptado de Al-Shaer y Hamed (2004); acta del 26/09/2026 | Validada | RF-07 |
| RE-03 | Existencia | Un elemento declarado se marca sin uso solo si ninguna declaración de un agente ni de un comando lo nombra | apartado I.6.3; acta del 26/09/2026; acta de validación, extensión | Validada | RF-07 |

*Tabla A.V.2. Registro de reglas de negocio. Fuente: elaboración propia.*

## A.V.3 · Atributos de las entidades del dominio

| **Entidad**              | **Atributos**                                                                                                                                     |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Proyecto analizado       | Ruta raíz, versión de OpenCode detectada                                                                                                          |
| Resolución               | Fecha y hora, versión de la herramienta, resumen del conjunto de entradas leídas                                                                  |
| Entrada de configuración | Tipo, orden de precedencia, ruta si corresponde, estado de legibilidad                                                                            |
| Declaración              | Clave, valor declarado, línea y columna, estado determinante o desplazada                                                                         |
| Sustitución              | Origen, condición de definida o no definida                                                                                                       |
| Elemento                 | Tipo, nombre, valor efectivo como atributo derivado del elemento que resulta de cada resolución, procedencia, estado de uso                                                                                                       |
| Agente                   | Modelo efectivo, instrucciones aplicables de alcance global y de proyecto en orden, cadena de reglas de permiso, condición de subagente invocable |
| Regla de permiso         | Patrón de coincidencia, decisión, posición en la cadena, carácter nativo o declarado, estado efectiva o sin efecto                                |
| Hallazgo                 | Tipo, elemento, declaración, entrada o sustitución sobre la que recae, localización, severidad                                                                |

*Tabla A.V.3. Atributos de las entidades del dominio. Fuente: elaboración propia.*

## A.V.4 · Relaciones del dominio

La multiplicidad sigue la notación UML y se lee del extremo de origen al extremo de destino: 1 indica exactamente uno, 0..1 indica ninguno o uno, 0..* indica ninguno o muchos y 1..* indica uno o muchos; entre llaves se consignan las restricciones de orden y de exclusión.

| **Relación**                                                                                         | **Multiplicidad** |
|------------------------------------------------------------------------------------------------------|-------------------|
| Un proyecto analizado se resuelve en muchas resoluciones sucesivas                                   | 1 a 1..*          |
| Una resolución lee muchas entradas de configuración                                                  | 1 a 1..*          |
| Una resolución comprende uno o muchos elementos, declarados o incorporados por la herramienta | 1 a 1..* |
| Una entrada contiene ninguna o muchas declaraciones                                                            | 1 a 0..*          |
| Una declaración contiene ninguna o muchas sustituciones                                              | 1 a 0..*          |
| Una declaración puede quedar desplazada por otra declaración de mayor precedencia                    | 0..1 a 0..1       |
| Un elemento se compone de ninguna o muchas declaraciones, de las cuales a lo sumo una resulta determinante; una declaración global compone uno o muchos elementos; sin declaración rige el valor implícito | 1..* a 0..* |
| Un elemento se relaciona con muchos otros elementos, con un tipo de relación declarado               | 0..* a 0..*       |
| Un agente evalúa una cadena ordenada de muchas reglas de permiso; una regla rige sobre uno o muchos agentes                                     | 1..* a 1..* {ordenada} |
| Una declaración origina ninguna o muchas reglas de permiso; una regla nativa no proviene de ninguna declaración | 0..1 a 0..* |
| Un agente puede invocar muchos subagentes y un subagente puede ser invocado por muchos agentes; en cada invocación, el subagente hereda las reglas de denegación del agente que lo invoca | 0..* a 0..* |
| Una resolución produce ninguno o muchos hallazgos                                                    | 1 a 0..*          |
| Un hallazgo recae sobre un elemento, una declaración, una entrada o una sustitución                                   | 0..* a 1 {xor: elemento, declaración, entrada o sustitución} |

*Tabla A.V.4. Relaciones del dominio y sus multiplicidades. Fuente: elaboración propia; validadas con la referente en la sesión del 26/09/2026.*
