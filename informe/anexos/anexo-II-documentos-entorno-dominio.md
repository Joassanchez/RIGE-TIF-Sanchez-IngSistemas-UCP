# ANEXO II · DOCUMENTOS DEL ENTORNO O DOMINIO

## A.II.1 · Guía y acta de la sesión de validación de requisitos

La sesión de validación se realiza el 26/09/2026, en modalidad presencial y con una duración de 35 minutos, conforme al apartado X.1. Participan Valeria Areco, referente técnica de Electricidad de Misiones S. A. (EMSA), identificada en el apartado V.3, y Joaquín Sebastián Sánchez, autor del proyecto. Se aplica la «Guía y acta de la sesión de validación con la referente, RIGE», versión 2 del 25/09/2026 (Instrumento 31).

La tabla reúne las decisiones registradas en el acta, sintetizadas a partir del apartado III.4 y de la matriz de trazabilidad del Anexo III, A.III.7. Las precisiones posteriores de L-06 constan en esa matriz y se validan en la segunda extensión del acta, del 15/10/2026.

| **Decisión** | **Enunciado breve** |
|---|---|
| L-01 | RIGE opera en modo de solo lectura y escribe únicamente en su propio almacén |
| L-02 | Los comandos de terminal compuestos quedan fuera del alcance |
| L-03 | Las credenciales de autenticación quedan fuera del alcance |
| L-04 | El uso es individual y local |
| L-05 | El alcance se circunscribe a OpenCode 1.18.25 |
| L-06 | La línea de comandos expone valores efectivos, decisiones de permiso y hallazgos, con salida conforme a un esquema versionado y explicación a pedido |
| L-07 | RIGE informa el estado efectivo; la aplicación y validación de los cambios del agente quedan fuera del alcance |
| L-08 | Se adopta el vocabulario del proyecto para el informe y la interfaz |
| L-09 | La comparación entre estados resueltos y la validación completa contra el esquema de configuración quedan fuera del alcance |
| L-10 | Dos interfaces sobre el mismo núcleo; la línea de comandos es completa y la interfaz web local se limita a formularios y vistas de consulta |
| L-11 | El sistema opera sobre Ubuntu 26.04 y Windows 11 y se instala sin privilegios administrativos |
| L-12 | Las relaciones entre elementos se difieren como capacidad posterior |
| L-13 | La explicación se genera mediante plantillas deterministas |
| E-01 | El agente de programación es un sistema vecino que consume una salida estructurada, determinista y legible por máquina, con ruta y posición exactas, esquema versionado y códigos de salida que distinguen el error de la ausencia de resultado |
| E-02 | Cada resultado declara sobre qué estado de las entradas se obtiene, identificado por un resumen del conjunto leído |

*Tabla A.II.1. Decisiones registradas en el acta de la sesión de validación del 26/09/2026. Fuente: elaboración propia sobre el apartado III.4 y la matriz del Anexo III, A.III.7.*

El acta de la sesión presencial del 26/09/2026 registra 82 puntos confirmados por la referente mediante la lectura y el tratamiento de los puntos de la guía con el autor, incluidos veinte de los veintisiete requisitos actuales y once relaciones del dominio; carece de firma propia. La extensión del acta del 01/10/2026 corresponde a una conversación presencial sin registro escrito en la fecha, sobre el catálogo de ese día, y cubre RF-12, RF-14 y RNF-04 reformulados, RF-16, RF-17, RNF-09 y RNF-10 nuevos, la relación por la que una declaración origina reglas de permiso y las multiplicidades corregidas. La constancia firmada por la referente en forma presencial el 15/10/2026 respalda esta extensión y reúne las entrevistas del 29/08 y del 24/09/2026. La segunda extensión del acta, del 15/10/2026 y de modalidad presencial, cubre once cambios posteriores: L-06; RF-02 CA-8; RF-02 CA-3 y RD-05; RF-02 CA-9; RF-07; RNF-07; la relación entre resolución y elemento; Regla de permiso como entidad y término del vocabulario; RE-01; RE-03; y RR-02. La referente confirma los once cambios sin correcciones, y la constancia v2 firmada ese día ratifica además la primera extensión. El acta, las extensiones y las constancias constan en el repositorio y en el Portafolio Digital de la AE2.

## A.II.2 · Validación del prototipo v0

El prototipo v0 es una maqueta navegable de baja fidelidad de nueve pantallas, presentada a la referente el 29/08/2026 con su conformidad, conforme al apartado I.6.6 y al punto 1.6 de la constancia de entrevistas. A partir del pedido de la referente en la entrevista del 24/09/2026, la maqueta reformulada simplifica la interfaz gráfica a cinco pantallas e incorpora la línea de comandos pensada para que la use un agente (constancia, punto 2.8). Esta maqueta se valida en la sesión del 26/09/2026 y representa el flujo relevado para la consulta del estado efectivo de la configuración.

| **N.º** | **Pantalla**                              | **Función que ilustra** |
|---------|-------------------------------------------|-------------------------|
| 1       | Selección del proyecto                    | F1                      |
| 2       | Resumen del ecosistema y de sus hallazgos | F5                      |
| 3       | Detalle de un agente                      | F2 y F3                 |
| 4       | Consulta de permiso                       | F4                      |
| 5       | Detalle de un hallazgo                    | F5 y F6                 |

*Tabla A.II.2. Pantallas de la maqueta reformulada validada el 26/09/2026. Fuente: elaboración propia.*

La maqueta reformulada, con su versión en PDF, se encuentra en <https://drive.google.com/file/d/1kz3OvG5lBim2Yb0Wyem856Li3syry-Px/view?usp=sharing>. Su validación consta en el acta de la sesión del 26/09/2026, sección 7, y en la constancia firmada por la referente el 15/10/2026, punto 2.8 (A.II.1).


## A.II.3 · Material de la organización consultada

Electricidad de Misiones S. A. participa como referente de validación y fuente de información contextual, conforme al apartado I.1.2, y no como ámbito de implantación. En consecuencia, el material incorporado se limita al que sustenta la participación del referente y no comprende documentación de procesos de la organización.

| **Documento**                                                                  | **Origen**                                                                  | **Uso en el informe**                                                     |
|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------|---------------------------------------------------------------------------|
| Constancia de participación del referente                                      | \[ \]                                                                       | Acredita la exigencia de contacto documentado                             |
| Registro de contactos: persona, canal, fecha y motivo                          | Portafolio Digital                                                          | Apartados I.1.2 y II.1.1                                                  |
| Frecuencia de consulta y vías de consumo de tokens declaradas                  | Entrevista, A.I.5                                                           | Apartados I.3.1 y II.3.3                                                  |

*Tabla A.II.3. Material de la organización consultada. Fuente: elaboración propia.*

## A.II.4 · Normativa pertinente

**Ley N.º 25.326 de Protección de los Datos Personales.** Alcanza a la entrevista del apartado II.2.3, en tanto identifica a una persona con nombre, rol y organización. La medición vigente ejecuta agentes y no registra datos personales. No alcanza al objeto sobre el que opera la plataforma. Determina el consentimiento informado y la separación de los datos identificatorios de la entrevista respecto de los de análisis. Refuerza, además, la exclusión de las credenciales de autenticación del alcance de RIGE, declarada en la Tabla 10.

**Ley N.º 27.506 de Promoción de la Economía del Conocimiento.** Constituye el marco promocional de la actividad del sector del cual provienen los recursos, conforme al apartado II.5.5.

**Ausencia de normativa sobre el objeto del proyecto.** No se identifica norma alguna que obligue a documentar, auditar o conservar la configuración de herramientas de programación basadas en agentes, conforme al apartado I.1.4. La constatación se registra como resultado del relevamiento normativo y no como supuesto.

## A.II.5 · Licencia de la herramienta base

OpenCode se distribuye bajo licencia MIT, que admite la incorporación de porciones de su código con atribución. Esa condición sustenta la mitigación principal del riesgo declarado en el apartado I.3.5: la reutilización asegura la coincidencia por construcción solo en las funciones de evaluación de permisos incorporadas. La normalización de rutas, la integración y las dos interfaces se contrastan contra el oráculo de OpenCode 1.18.25. Texto de la licencia: \[ \].


## A.II.6 · Glosario del dominio

El glosario fija el vocabulario normativo del informe y, más adelante, el del modelo de datos del sistema. Las definiciones precisan las del apartado I.6.3 y emplean «entrada ilegible» para las entradas que no pueden interpretarse.

| **Término**                    | **Definición operativa**                                                                                                                                        | **Falsos amigos y sinónimos**                                                      | **Fuente**              | **En disputa**                          |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|-------------------------|-----------------------------------------|
| Entrada de configuración | Representación de una vía de incorporación de configuración, registrada por resolución, sea o no un archivo | La documentación emplea *source*; el uso corriente alterna capa, alcance y nivel | A.I.3, resultado 1; acta del 26/09/2026 | Cerrada: se adopta «entrada» en la sesión del 26/09/2026 |
| Archivo de configuración | Entrada que se materializa en un archivo del disco, con ruta y posición | No toda entrada es un archivo: cuatro de ellas no lo son | A.I.3, resultado 1; acta del 26/09/2026 | No |
| Árbol de trabajo | Carpeta desde la que OpenCode evalúa las rutas relativas de los permisos. Con Git es la raíz del repositorio. Sin Git difiere del proyecto y la ruta se evalúa desde la raíz de la unidad. | — | H-24; A.I.3, resultado 9; precisión pendiente (R-11, R-16) | No |
| Declaración | Representación de una asignación escrita dentro de una entrada, registrada en una resolución | — | A.I.3, resultado 6; acta del 26/09/2026 | No |
| Declaración sin efecto | Declaración desplazada, descartada o con una referencia o patrón que carece de coincidencia en la resolución. La causa objetiva se precisa mediante los estados de I.6.3, sin inferir la intención del usuario. | Término general, sin un séptimo tipo de hallazgo | I.6.3; pendiente de revalidación (R-11) | No |
| Valor efectivo                 | Valor que OpenCode aplica a una clave tras combinar todas las entradas                                                                                          | Se distingue del valor declarado, que puede no prevalecer                          | A.I.3, resultado 1      | No                                      |
| Procedencia | Cadena que conduce al valor efectivo: entrada, archivo y posición de la declaración determinante y, si esta contiene una sustitución, el origen de su contenido | — | A.I.3, resultado 6; acta del 26/09/2026 | No |
| Valor implícito                | Valor que la herramienta aplica sin declaración del usuario                                                                                                     | —                                                                                  | apartado I.6.3      | No                                      |
| Regla nativa                   | Regla de permiso que la herramienta incorpora sin declaración del usuario                                                                                       | —                                                                                  | A.I.3, resultado 7      | No                                      |
| Permiso | Decisión resultante para un agente y una acción: permitida, sujeta a confirmación o denegada | El uso corriente lo emplea también para la regla que produce la decisión | A.I.3, resultado 5; acta del 26/09/2026 | No |
| Regla de permiso | Representación registrada en una resolución de una regla nativa o declarada que produce una decisión de permiso | Véase la entrada anterior | A.I.3, resultado 5; acta del 26/09/2026; segunda extensión del acta del 15/10/2026 | No |
| Declaración desplazada         | Declaración reemplazada por otra de mayor precedencia sobre la misma clave                                                                                      | —                                                                                  | A.I.3, resultado 6      | No                                      |
| Regla sin efecto | Regla que nunca determina una decisión porque otra posterior del mismo tipo abarca todos sus casos. También comprende el patrón de ruta absoluta del árbol para tipos `read` o `edit` en `read`, `edit`, `write` y `apply_patch`. | En el primer caso corresponde a la anomalía de sombreado; el segundo se precisa por la línea de base (RE-02; ADR-088) | Adaptado de Al-Shaer y Hamed (2004); RE-02; ADR-088 | No |
| Referencia no resuelta | Declaración que nombra un elemento que no figura en la resolución. Una sustitución de archivo inexistente corresponde a Entrada ilegible. | — | apartado I.6.3; Anexo III, D-61; ADR-105; precisión pendiente (R-14) | No |
| Elemento sin uso               | Elemento declarado al que ninguna declaración de un agente ni de un comando nombra                                                                | —                                                                                  | apartado I.6.3; Anexo III, D-61              | No                                      |
| Sustitución sin valor          | Sustitución de una variable de entorno no definida, que se reemplaza por un texto vacío sin advertencia                                                         | —                                                                                  | A.I.3, resultado 13     | No                                      |
| Entrada ilegible | Entrada que no puede interpretarse, por errores de sintaxis o por referenciar una sustitución de archivo inexistente, lo que detiene su carga con error | Sustituye la denominación «fuente ilegible» del informe de la AE1 | apartado I.6.3; acta del 26/09/2026 | No |
| Entrada descartada sin error visible | Entrada que la herramienta desestima por contener un contenido inválido, cuyo descarte solo consta en el archivo de registro                | Se distingue de la entrada ilegible, que sí produce error                          | A.I.3, resultado 14     | No                                      |
| Aprobación persistida | Autorización `always` ajena a las entradas. En v1 vive en memoria de la instancia, con patrones recortados por aridad en `bash`; el código indica que puede vencer un `deny`, sin comprobación en ejecución. En v2, por `/api`, conserva el texto literal entre sesiones y no vence un `deny` declarado. | La denominación no supone persistencia en disco en v1. RIGE modela v1 y excluye las aprobaciones. | A.I.3, resultados 10 y 11; precisión pendiente (R-16) | No |
| Elemento | Unidad identificable de configuración, como un agente, un comando o una skill, que RIGE resuelve y relaciona | — | III.2, Tabla 2; A.I.3, resultado 1; apartado I.6.1, Tabla 6 | No |
| Agente | Especialización de Elemento sobre la cual se manifiesta el efecto de toda la configuración | — | III.2, Tabla 2; A.I.3, resultados 5 y 12 | No |
| Subagente | Agente que otro agente lanza mediante `task` y que se rige por su propio conjunto de reglas | — | RD-05; A.I.3, resultado 12 | No |
| Hallazgo | Defecto detectado en el ecosistema, con su localización | — | III.2, Tabla 2; A.I.3, resultados 3, 5, 13 y 14 | No |
| Resolución | Estado efectivo del ecosistema obtenido en un momento determinado | — | III.2, Tabla 2; A.I.3, resultados 1 y 3 | No |
| Instrucción | Archivo de instrucciones que se incorpora al contexto de un agente; entrada de configuración cuyo contenido RIGE no evalúa | — | (Anexo III, D-61) | No |
| Elemento nativo | Elemento que la herramienta incorpora sin declaración del usuario | — | (Anexo III, D-61) | No |

| Sustitución | Representación del reemplazo de una variable de entorno o de un archivo dentro de una declaración, registrada en una resolución | — | III.2, Tabla 2; A.I.3, resultado 13 | No |
| Banco | Conjunto definido de problemas que se utiliza para medir el procedimiento delegado | Banco de problemas | apartado I.3.2; ADR-098 | No |
| Ejecución ecológica | Sesión en la que el agente recibe un pedido de cambio dentro del proyecto y dispone de sus archivos | Se registra por problema y repetición | apartado I.3.2; ADR-098 | No |
| Arnés | Conjunto de programas que prepara los escenarios, ejecuta las sesiones y registra sus resultados | Instrumento de medición | apartado I.3.2; ADR-098 | No |
| Oráculo | Referencia que comprueba el resultado mediante ejecución de OpenCode 1.18.25 | Se distingue del evaluador estático de RIGE | apartado I.3.2; ADR-098 | No |
| Ejecutor | Variante de agente que recibe los pedidos del banco | `build` o la variante declarada de Charles en esta medición | apartado I.3.2; ADR-098 | No |
| Brazo | Condición de medición que fija las instrucciones y la disponibilidad de RIGE | Se distingue del ejecutor | apartado I.3.2; ADR-098 | No |
| Exceso de alcance | Cambios adicionales respecto de la forma correcta, sin alterar una guarda declarada en el pedido | La definición de colateral consta en A.I.7 | apartado I.3.2; ADR-098 | No |
| Lectura principal | Aplicación del criterio vigente, que separa el exceso de alcance del éxito declarado falso | Decisión posterior al dato del 22/10/2026 | apartado I.3.2; ADR-098 | No |
| Lectura preregistrada | Aplicación del criterio fijado antes de medir, que cuenta el exceso de alcance como éxito declarado falso | Conserva la interpretación anterior al 22/10/2026 | apartado I.3.2; ADR-098 | No |
| Éxito declarado falso | El agente declara terminado el cambio y el oráculo registra que no alcanza el efecto pedido. El problema presenta ese resultado en al menos dos de tres repeticiones | Se distingue del exceso de alcance de la batería | apartado I.3.2; ADR-098 | No |
| Verificación declarativa | Comprobación mediante lectura de configuración o salida de introspección, sin ejecutar OpenCode para probar el efecto | La predicción estática de RIGE se delimita en III.4 | apartado I.3.1; A.I.8 | No |
| Acción | Atributo de la Consulta de permiso compuesto por tipo de permiso, sujeto y forma de la ruta. RD-08 regula la evaluación de su sujeto para los tipos y herramientas delimitados | Se distingue de la ejecución de la herramienta | III.2, Tabla 3; R-11 | No |
| Agente externo | Sistema vecino que escribe configuración por encargo del desarrollador o consume la salida de RIGE como actor técnico | Se distingue del Agente configurado, entidad del dominio | III.1, Tabla 1; apartado V.5 | No |

*Tabla A.II.4. Glosario del dominio. Fuente: elaboración propia. Los siete términos con fuente en el acta se validaron con la referente en la sesión del 26/09/2026.*

## A.II.7 · Registro de reglas de negocio

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
| RE-02 | Existencia | Una regla se marca sin efecto si otra posterior del mismo tipo abarca todos sus casos. También si declara ruta absoluta del árbol de trabajo para `read` o `edit` en las herramientas `read`, `edit`, `write` y `apply_patch` (RF-07). | H-05; adaptado de Al-Shaer y Hamed (2004); constancia v2, punto 4.5: archivo confirmado. Extensión a directorio pendiente (R-07, R-11); A.I.8; H-24 | Pendiente | RF-07 |
| RE-03 | Existencia | Un elemento declarado se marca sin uso solo si ninguna declaración de un agente ni de un comando lo nombra | apartado I.6.3; acta del 26/09/2026; extensión del acta del 01/10/2026; segunda extensión del acta del 15/10/2026 | Validada | RF-07 |

*Tabla A.II.5. Registro de reglas de negocio. Fuente: elaboración propia.*

## A.II.8 · Atributos de las entidades del dominio

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

*Tabla A.II.6. Atributos de las entidades del dominio. Fuente: elaboración propia.*

La Consulta de permiso es un producto transitorio, con acción (tipo de permiso, sujeto y forma de la ruta) y decisión de permiso como atributos. RD-08 regula la evaluación del sujeto de la acción; la precisión queda pendiente de revalidación (R-11).

## A.II.9 · Relaciones del dominio

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

*Tabla A.II.7. Relaciones del dominio y sus multiplicidades. Fuente: elaboración propia. Once relaciones validadas con la referente en la sesión del 26/09/2026; la relación entre declaración y regla de permiso y las multiplicidades, en la extensión del acta del 01/10/2026; la relación entre resolución y elemento, en la segunda extensión del 15/10/2026.*

Entrada se registra por resolución. El valor efectivo y la declaración determinante corresponden a cada agente y clave. La relación «desplaza» enlaza declaraciones consecutivas y se recorre en cadena. La posición y el carácter efectivo de una regla pertenecen a su pertenencia a la cadena de cada agente.
