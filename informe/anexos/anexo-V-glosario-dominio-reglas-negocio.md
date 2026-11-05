# ANEXO V · GLOSARIO DEL DOMINIO Y REGLAS DE NEGOCIO

## A.V.1 · Glosario del dominio

El glosario fija el vocabulario normativo del informe y, más adelante, el del modelo de datos del sistema. Las definiciones precisan las del apartado I.6.3 y emplean «entrada ilegible» para las entradas que no pueden interpretarse.

| **Término**                    | **Definición operativa**                                                                                                                                        | **Falsos amigos y sinónimos**                                                      | **Fuente**              | **En disputa**                          |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|-------------------------|-----------------------------------------|
| Entrada de configuración | Representación de una vía de incorporación de configuración, registrada por resolución, sea o no un archivo | La documentación emplea *source*; el uso corriente alterna capa, alcance y nivel | A.VI.3, resultado 1; acta del 26/09/2026 | Cerrada: se adopta «entrada» en la sesión del 26/09/2026 |
| Archivo de configuración | Entrada que se materializa en un archivo del disco, con ruta y posición | No toda entrada es un archivo: cuatro de ellas no lo son | A.VI.3, resultado 1; acta del 26/09/2026 | No |
| Árbol de trabajo | Carpeta desde la que OpenCode evalúa las rutas relativas de los permisos. Con Git es la raíz del repositorio. Sin Git difiere del proyecto y la ruta se evalúa desde la raíz de la unidad. | — | H-24; A.VI.3, resultado 9; precisión pendiente (R-11, R-16) | No |
| Declaración | Representación de una asignación escrita dentro de una entrada, registrada en una resolución | — | A.VI.3, resultado 6; acta del 26/09/2026 | No |
| Declaración sin efecto | Declaración desplazada, descartada o con una referencia o patrón que carece de coincidencia en la resolución. La causa objetiva se precisa mediante los estados de I.6.3, sin inferir la intención del usuario. | Término general, sin un séptimo tipo de hallazgo | I.6.3; pendiente de revalidación (R-11) | No |
| Valor efectivo                 | Valor que OpenCode aplica a una clave tras combinar todas las entradas                                                                                          | Se distingue del valor declarado, que puede no prevalecer                          | A.VI.3, resultado 1      | No                                      |
| Procedencia | Cadena que conduce al valor efectivo: entrada, archivo y posición de la declaración determinante y, si esta contiene una sustitución, el origen de su contenido | — | A.VI.3, resultado 6; acta del 26/09/2026 | No |
| Valor implícito                | Valor que la herramienta aplica sin declaración del usuario                                                                                                     | —                                                                                  | apartado I.6.3      | No                                      |
| Regla nativa                   | Regla de permiso que la herramienta incorpora sin declaración del usuario                                                                                       | —                                                                                  | A.VI.3, resultado 7      | No                                      |
| Permiso | Decisión resultante para un agente y una acción: permitida, sujeta a confirmación o denegada | El uso corriente lo emplea también para la regla que produce la decisión | A.VI.3, resultado 5; acta del 26/09/2026 | No |
| Regla de permiso | Representación registrada en una resolución de una regla nativa o declarada que produce una decisión de permiso | Véase la entrada anterior | A.VI.3, resultado 5; acta del 26/09/2026; segunda extensión del acta del 15/10/2026 | No |
| Declaración desplazada         | Declaración reemplazada por otra de mayor precedencia sobre la misma clave                                                                                      | —                                                                                  | A.VI.3, resultado 6      | No                                      |
| Regla sin efecto | Regla que nunca determina una decisión porque otra posterior del mismo tipo abarca todos sus casos. También comprende el patrón de ruta absoluta del árbol para tipos `read` o `edit` en `read`, `edit`, `write` y `apply_patch`. | En el primer caso corresponde a la anomalía de sombreado; el segundo se precisa por la línea de base (RE-02; ADR-088) | Adaptado de Al-Shaer y Hamed (2004); RE-02; ADR-088 | No |
| Referencia no resuelta | Declaración que nombra un elemento que no figura en la resolución. Una sustitución de archivo inexistente corresponde a Entrada ilegible. | — | apartado I.6.3; Anexo III, D-61; ADR-105; precisión pendiente (R-14) | No |
| Elemento sin uso               | Elemento declarado al que ninguna declaración de un agente ni de un comando nombra                                                                | —                                                                                  | apartado I.6.3; Anexo III, D-61              | No                                      |
| Sustitución sin valor          | Sustitución de una variable de entorno no definida, que se reemplaza por un texto vacío sin advertencia                                                         | —                                                                                  | A.VI.3, resultado 13     | No                                      |
| Entrada ilegible | Entrada que no puede interpretarse, por errores de sintaxis o por referenciar una sustitución de archivo inexistente, lo que detiene su carga con error | Sustituye la denominación «fuente ilegible» del informe de la AE1 | apartado I.6.3; acta del 26/09/2026 | No |
| Entrada descartada sin error visible | Entrada que la herramienta desestima por contener un contenido inválido, cuyo descarte solo consta en el archivo de registro                | Se distingue de la entrada ilegible, que sí produce error                          | A.VI.3, resultado 14     | No                                      |
| Aprobación persistida | Autorización `always` ajena a las entradas. En v1 vive en memoria de la instancia, con patrones recortados por aridad en `bash`; el código indica que puede vencer un `deny`, sin comprobación en ejecución. En v2, por `/api`, conserva el texto literal entre sesiones y no vence un `deny` declarado. | La denominación no supone persistencia en disco en v1. RIGE modela v1 y excluye las aprobaciones. | A.VI.3, resultados 10 y 11; precisión pendiente (R-16) | No |
| Elemento | Unidad identificable de configuración, como un agente, un comando o una skill, que RIGE resuelve y relaciona | — | III.2, Tabla 2; A.VI.3, resultado 1; apartado I.6.1, Tabla 6 | No |
| Agente | Especialización de Elemento sobre la cual se manifiesta el efecto de toda la configuración | — | III.2, Tabla 2; A.VI.3, resultados 5 y 12 | No |
| Subagente | Agente que otro agente lanza mediante `task` y que se rige por su propio conjunto de reglas | — | RD-05; A.VI.3, resultado 12 | No |
| Hallazgo | Defecto detectado en el ecosistema, con su localización | — | III.2, Tabla 2; A.VI.3, resultados 3, 5, 13 y 14 | No |
| Resolución | Estado efectivo del ecosistema obtenido en un momento determinado | — | III.2, Tabla 2; A.VI.3, resultados 1 y 3 | No |
| Instrucción | Archivo de instrucciones que se incorpora al contexto de un agente; entrada de configuración cuyo contenido RIGE no evalúa | — | (Anexo III, D-61) | No |
| Elemento nativo | Elemento que la herramienta incorpora sin declaración del usuario | — | (Anexo III, D-61) | No |

| Sustitución | Representación del reemplazo de una variable de entorno o de un archivo dentro de una declaración, registrada en una resolución | — | III.2, Tabla 2; A.VI.3, resultado 13 | No |
| Banco | Conjunto definido de problemas que se utiliza para medir el procedimiento delegado | Banco de problemas | apartado I.3.2; ADR-098 | No |
| Ejecución ecológica | Sesión en la que el agente recibe un pedido de cambio dentro del proyecto y dispone de sus archivos | Se registra por problema y repetición | apartado I.3.2; ADR-098 | No |
| Arnés | Conjunto de programas que prepara los escenarios, ejecuta las sesiones y registra sus resultados | Instrumento de medición | apartado I.3.2; ADR-098 | No |
| Oráculo | Referencia que comprueba el resultado mediante ejecución de OpenCode 1.18.25 | Se distingue del evaluador estático de RIGE | apartado I.3.2; ADR-098 | No |
| Ejecutor | Variante de agente que recibe los pedidos del banco | `build` o la variante declarada de Charles en esta medición | apartado I.3.2; ADR-098 | No |
| Brazo | Condición de medición que fija las instrucciones y la disponibilidad de RIGE | Se distingue del ejecutor | apartado I.3.2; ADR-098 | No |
| Exceso de alcance | Cambios adicionales respecto de la forma correcta, sin alterar una guarda declarada en el pedido | La definición de colateral consta en A.VI.7 | apartado I.3.2; ADR-098 | No |
| Lectura principal | Aplicación del criterio vigente, que separa el exceso de alcance del éxito declarado falso | Decisión posterior al dato del 22/10/2026 | apartado I.3.2; ADR-098 | No |
| Lectura preregistrada | Aplicación del criterio fijado antes de medir, que cuenta el exceso de alcance como éxito declarado falso | Conserva la interpretación anterior al 22/10/2026 | apartado I.3.2; ADR-098 | No |
| Éxito declarado falso | El agente declara terminado el cambio y el oráculo registra que no alcanza el efecto pedido. El problema presenta ese resultado en al menos dos de tres repeticiones | Se distingue del exceso de alcance de la batería | apartado I.3.2; ADR-098 | No |
| Verificación declarativa | Comprobación mediante lectura de configuración o salida de introspección, sin ejecutar OpenCode para probar el efecto | La predicción estática de RIGE se delimita en III.4 | apartado I.3.1; A.VI.8 | No |
| Acción | Atributo de la Consulta de permiso compuesto por tipo de permiso, sujeto y forma de la ruta. RD-08 regula la evaluación de su sujeto para los tipos y herramientas delimitados | Se distingue de la ejecución de la herramienta | III.2, Tabla 3; R-11 | No |
| Agente externo | Sistema vecino que escribe configuración por encargo del desarrollador o consume la salida de RIGE como actor técnico | Se distingue del Agente configurado, entidad del dominio | III.1, Tabla 1; apartado V.5 | No |

*Tabla A.V.1. Glosario del dominio. Fuente: elaboración propia. Los siete términos con fuente en el acta se validaron con la referente en la sesión del 26/09/2026.*

## A.V.2 · Registro de reglas de negocio

Las reglas de derivación describen el comportamiento de OpenCode 1.18.25. Cinco reglas (RD-02, RD-03, RD-05, RD-06 y RD-07) se verifican mediante escenarios controlados. RD-01 y RD-04 se verifican mediante la lectura del código o de los comandos de introspección. RD-08 se apoya en la evidencia técnica de H-24 y queda pendiente de revalidación (R-11).

| **Cód.** | **Tipo**    | **Enunciado verificable**                                                                                                                                                                         | **Fuente**                        | **Estado**              | **Requisito derivado** |
|----------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|-------------------------|------------------------|
| RD-01 | Derivación | El valor efectivo de una clave resulta de aplicar las entradas en su orden de precedencia; prevalece la declaración de la última entrada que la declara | H-01; acta del 26/09/2026 | Validada | RF-01 |
| RD-02 | Derivación | En la fusión profunda, la posición de una clave la determina la primera entrada que la declara y su valor, la última | H-06; acta del 26/09/2026 | Validada | RF-01 |
| RD-03 | Derivación | La decisión de permiso resulta de evaluar la cadena ordenada de reglas (nativas generales, nativas del agente, declaradas en `permission` raíz y declaradas del agente) y la determina la última coincidencia | H-05; acta del 26/09/2026 | Validada | RF-02 |
| RD-04 | Derivación | Si ninguna declaración del usuario alcanza una clave, rige el valor implícito de la herramienta | apartado I.6.3; acta del 26/09/2026 | Validada | RF-06 |
| RD-05 | Derivación | El subagente lanzado mediante `task` en una sesión nueva usa sus propias reglas. Se agrega una denegación de `task` y otra de `todowrite` si falta una regla con cada identificador exacto; `*` no lo evita. Las reglas del agente que lo lanza no se aplican; los permisos de sesión quedan fuera según III.4. | H-12; acta del 26/09/2026; segunda extensión del acta del 15/10/2026; precisión del identificador exacto pendiente (R-16) | Pendiente | RF-02 |
| RD-06 | Derivación | Si la última regla coincidente para una herramienta declara patrón general y efecto de denegación, la herramienta no se ofrece al modelo; una excepción posterior vuelve a exponerla por completo | H-08; acta del 26/09/2026 | Validada | RF-10 |
| RD-07 | Derivación | Una declaración del usuario que alcanza una acción denegada o sujeta a confirmación por una regla nativa prevalece sobre ella, dado que las declaradas se concatenan después de las nativas | H-07; validación del 26/09/2026 sobre la prevalencia frente a denegaciones nativas; precisión del 30/10/2026 (ADR-103), pendiente de revalidación (R-12) | Pendiente | RF-09 |
| RD-08 | Derivación | En la Consulta de permiso, el sujeto de acciones de tipo `read` o `edit` en las herramientas `read`, `edit`, `write` y `apply_patch` se evalúa con la ruta relativa al árbol de trabajo | H-24; pendiente de revalidación (R-11, R-16) | Pendiente | RF-02 |
| RR-01 | Restricción | RIGE no modifica ninguna entrada de configuración; escribe únicamente en su propio almacén | Acta del 26/09/2026, decisión L-01 | Validada | RNF-01 |
| RR-02 | Restricción | RIGE no expone el contenido que una sustitución incorpora; informa su origen y su condición de definido o no definido | Acta del 26/09/2026, decisión L-03; extensión del acta del 01/10/2026; segunda extensión del acta del 15/10/2026 | Validada | RNF-04 |
| RR-03 | Restricción | RIGE resuelve únicamente sobre OpenCode 1.18.25; ante otra versión instalada advierte y no presenta sus resultados como válidos | Acta del 26/09/2026, decisión L-05 | Validada | RF-05 |
| RE-01 | Existencia | Un elemento ingresa a la resolución si proviene de una entrada legible o si la herramienta lo incorpora sin declaración (nativo); si una entrada es ilegible, su carga se detiene con error y se registra el hallazgo correspondiente | apartado I.6.3; acta del 26/09/2026; extensión del acta del 01/10/2026; segunda extensión del acta del 15/10/2026 | Validada | RF-04, RF-07 |
| RE-02 | Existencia | Una regla se marca sin efecto si otra posterior del mismo tipo abarca todos sus casos. También si declara ruta absoluta del árbol de trabajo para `read` o `edit` en las herramientas `read`, `edit`, `write` y `apply_patch` (RF-07). | H-05; adaptado de Al-Shaer y Hamed (2004); constancia v2, punto 4.5: archivo confirmado. Extensión a directorio pendiente (R-07, R-11); A.VI.8; H-24 | Pendiente | RF-07 |
| RE-03 | Existencia | Un elemento declarado se marca sin uso solo si ninguna declaración de un agente ni de un comando lo nombra | apartado I.6.3; acta del 26/09/2026; extensión del acta del 01/10/2026; segunda extensión del acta del 15/10/2026 | Validada | RF-07 |

*Tabla A.V.2. Registro de reglas de negocio. Fuente: elaboración propia.*

## A.V.3 · Atributos de las entidades del dominio

| **Entidad**              | **Atributos**                                                                                                                                     |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Proyecto analizado       | Ruta raíz, árbol de trabajo, versión de OpenCode detectada                                                                                                          |
| Resolución               | Fecha y hora, versión de la herramienta, resumen del conjunto de entradas leídas                                                                  |
| Entrada de configuración | Resolución a la que pertenece, tipo, orden de precedencia, ruta si corresponde, estado de legibilidad                                                                            |
| Declaración              | Clave, valor declarado, línea y columna, estado determinante o desplazada                                                                         |
| Sustitución              | Origen, condición de definida o no definida                                                                                                       |
| Elemento                 | Tipo, nombre, valor efectivo derivado por agente y clave en cada resolución, procedencia, estado de uso                                                                                                       |
| Agente                   | Modelo efectivo, instrucciones aplicables de alcance global y de proyecto en orden, cadena de reglas de permiso, condición de subagente invocable |
| Regla de permiso         | Patrón de coincidencia, decisión, carácter nativo o declarado. Posición y estado efectiva o sin efecto: atributos de su pertenencia a la cadena de cada agente                                |
| Hallazgo                 | Tipo, elemento, declaración, entrada, sustitución o regla de permiso sobre la que recae, localización, severidad; ampliación pendiente de revalidación (R-11) |

*Tabla A.V.3. Atributos de las entidades del dominio. Fuente: elaboración propia.*

La Consulta de permiso es un producto transitorio, con acción (tipo de permiso, sujeto y forma de la ruta) y decisión de permiso como atributos. RD-08 regula la evaluación del sujeto de la acción; la precisión queda pendiente de revalidación (R-11).

## A.V.4 · Relaciones del dominio

La multiplicidad sigue la notación UML y se lee del extremo de origen al extremo de destino: 1 indica exactamente uno, 0..1 indica ninguno o uno, 0..* indica ninguno o muchos y 1..* indica uno o muchos; entre llaves se consignan las restricciones de orden y de exclusión.

| **Relación**                                                                                         | **Multiplicidad** |
|------------------------------------------------------------------------------------------------------|-------------------|
| Un proyecto analizado se resuelve en muchas resoluciones sucesivas                                   | 1 a 1..*          |
| Una resolución lee muchas entradas de configuración                                                  | 1 a 1..*          |
| Una resolución comprende uno o muchos elementos, declarados o incorporados por la herramienta | 1 a 1..* |
| Una entrada contiene ninguna o muchas declaraciones                                                            | 1 a 0..*          |
| Una declaración contiene ninguna o muchas sustituciones                                              | 1 a 0..*          |
| Una declaración puede quedar desplazada por la siguiente declaración de mayor precedencia en la cadena                    | 0..1 a 0..1       |
| Un elemento se compone de cero o más declaraciones, con a lo sumo una determinante por clave del elemento, pendiente de revalidación (R-11). Una declaración global compone uno o muchos elementos; sin declaración rige el valor implícito | 1..* a 0..* |
| Un elemento se relaciona con muchos otros elementos, con un tipo de relación declarado               | 0..* a 0..*       |
| Un agente evalúa una cadena ordenada de muchas reglas de permiso; una regla rige sobre uno o muchos agentes                                     | 1..* a 1..* {ordenada} |
| Una declaración origina ninguna o muchas reglas de permiso; una regla nativa no proviene de ninguna declaración | 0..1 a 0..* |
| Un agente puede lanzar muchos subagentes y un subagente puede ser lanzado por muchos agentes; el subagente se rige por su propio conjunto de reglas (RD-05)                             | 0..* a 0..* |
| Una resolución produce ninguno o muchos hallazgos                                                    | 1 a 0..*          |
| Un hallazgo recae sobre un elemento, una declaración, una entrada, una sustitución o una regla de permiso, pendiente de revalidación (R-11) | 0..* a 1 {xor: elemento, declaración, entrada, sustitución o regla de permiso} |

*Tabla A.V.4. Relaciones del dominio y sus multiplicidades. Fuente: elaboración propia. Once relaciones validadas con la referente en la sesión del 26/09/2026; la relación entre declaración y regla de permiso y las multiplicidades, en la extensión del acta del 01/10/2026; la relación entre resolución y elemento, en la segunda extensión del 15/10/2026.*

Entrada se registra por resolución. El valor efectivo y la declaración determinante corresponden a cada agente y clave. La relación «desplaza» enlaza declaraciones consecutivas y se recorre en cadena. La posición y el carácter efectivo de una regla pertenecen a su pertenencia a la cadena de cada agente.
