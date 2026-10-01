## III.2 · Dominio del Sistema de Información

### III.2.1 · Frontera entre el entorno y el dominio

El dominio es el recorte del mundo que el sistema representa y sobre cuyo estado responde. La frontera se traza elemento por elemento con una sola prueba: si el sistema controla el estado de esa cosa o si lo padece. Lo que RIGE recibe ya formado, y frente a lo cual solo puede adaptarse, integra el entorno; lo que RIGE construye y da por válido integra el dominio.

Esa prueba produce un desdoblamiento que conviene declarar de manera expresa. Los archivos de configuración pertenecen al entorno: RIGE no los modifica y los recibe con el contenido que otros escribieron. La representación que RIGE construye a partir de ellos pertenece, en cambio, al dominio: la declaración con su entrada, su archivo y su posición; la cadena ordenada de reglas de un agente; el hallazgo localizado; y la resolución fechada que agrupa todo ello. El archivo como registro externo y su representación resuelta son dos objetos distintos, y esa distinción sostiene el modo de operación de solo lectura declarado en el apartado III.4.

### III.2.2 · Entidades del dominio

El modelado sigue el procedimiento de identificación de sustantivos del dominio (Larman, 2004). Los sustantivos se toman del vocabulario que la herramienta efectivamente emplea, es decir, del esquema de configuración publicado, del código fuente analizado en el Anexo I, A.I.3 del informe de la AE1 y de la documentación de la versión 1.18.25. Luego se contrastan con los términos que usa la referente, para que el modelo y el informe compartan un único vocabulario con la organización (Evans, 2003). Cada candidata se somete a tres pruebas (identidad propia, datos y reglas propios, y pertenencia al recorte delimitado) e ingresa como entidad solo si las satisface todas. Los atributos de cada entidad constan en el Anexo V.

| **Entidad**              | **Definición operativa**                                                                             | **Fuente que la acredita**       | **Relaciones principales**                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------|----------------------------------|---------------------------------------------------------------------------------|
| Proyecto analizado       | Contexto sobre el cual se resuelve el estado efectivo de la configuración                            | AE1, I.6.4               | Se resuelve en muchas resoluciones                                              |
| Resolución               | Estado efectivo del ecosistema obtenido en un momento determinado                                    | A.I.3, resultados 1 y 3          | Lee muchas entradas; comprende muchos elementos; produce muchos hallazgos                                   |
| Entrada de configuración | Vía por la cual OpenCode incorpora configuración al resolver el estado efectivo, sea o no un archivo | A.I.3, resultado 1               | Contiene ninguna o muchas declaraciones                                                   |
| Declaración              | Asignación concreta escrita dentro de una entrada                                                    | A.I.3, resultados 3 y 6          | Compone uno o muchos elementos; puede desplazar a otra declaración; contiene sustituciones |
| Sustitución              | Reemplazo de una variable de entorno o de un archivo dentro de una declaración                       | A.I.3, resultado 13              | Pertenece a una declaración; puede ser objeto de un hallazgo              |
| Elemento                 | Unidad de configuración que RIGE resuelve y relaciona, cuyo tipo declara el adaptador                | A.I.3, resultado 1; AE1, Tabla 6 | Pertenece a una resolución; se compone de ninguna o muchas declaraciones; se relaciona con otros elementos  |
| Agente                   | Especialización de Elemento sobre la cual se manifiesta el efecto de toda la configuración           | A.I.3, resultados 5 y 12         | Evalúa una cadena de reglas; invoca muchos subagentes y puede ser invocado por muchos agentes |
| Regla de permiso         | Regla que produce una decisión de permiso, nativa de la herramienta o escrita por el usuario en una declaración | A.I.3, resultados 5, 7 y 8 | Rige sobre uno o muchos agentes; ocupa una posición en la cadena; si es declarada, proviene de una declaración |
| Hallazgo                 | Defecto detectado en el ecosistema, con su localización                                              | A.I.3, resultados 3, 5, 13 y 14      | Recae sobre un elemento, una declaración, una entrada o una sustitución                          |

*Tabla 2. Entidades del dominio, con su fuente y sus relaciones principales. Fuente: elaboración propia sobre el relevamiento técnico del Anexo I, A.I.3 del informe de la AE1.*

Las candidatas descartadas se conservan con su reclasificación, porque el descarte documentado es lo que permite defender la delimitación adoptada.

| **Candidata**                                      | **Reclasificación**                               | **Criterio**                                                                    |
|----------------------------------------------------|---------------------------------------------------|---------------------------------------------------------------------------------|
| Valor efectivo                                     | Atributo de otra entidad                              | Atributo derivado del elemento, que resulta de cada resolución, igual que la procedencia                    |
| Procedencia | Atributo de otra entidad | Atributo del elemento, junto con su valor efectivo: es la cadena que conduce a la declaración determinante, no una cosa del dominio |
| Archivo | Atributo de otra entidad | Atributo de la entrada (su ruta). Como objeto del disco pertenece al entorno: el sistema lo recibe ya formado y no lo modifica |
| Consulta de permiso                                | Producto del sistema                              | Sus datos son referencias a otras entidades; no posee datos propios             |
| Desarrollador | Elemento del entorno | Actor externo, conforme al apartado III.1 |
| Agente que consume la salida por línea de comandos | Elemento del entorno | Sistema vecino, conforme al apartado III.1 (E-01) |
| Versión de OpenCode | Atributo de otra entidad | Atributo de la resolución y del proyecto analizado; opera además como restricción del entorno. No posee datos ni reglas propios dentro del sistema |
| Credencial de autenticación | Elemento del entorno | Excluida del alcance, conforme al apartado III.4 (L-03) |

*Tabla 3. Candidatas descartadas con su reclasificación. Fuente: elaboración propia.*

El modelo declara una sola especialización. El Agente se modela como entidad diferenciada porque concentra comportamiento que los demás elementos no poseen (la cadena ordenada de reglas de permiso, la herencia de denegaciones hacia los subagentes que invoca y el conjunto de instrucciones aplicables) y porque constituye el eje de la representación. Los restantes tipos comparten el mismo tratamiento de resolución y relación, por lo que no justifican entidades separadas.

### III.2.3 · Modelo del dominio

Las relaciones se enuncian como frases del negocio, de modo que validarlas consiste en comprobar si la frase resulta verdadera dicha en voz alta, y así se validaron con la referente en la sesión del 26/09/2026. La multiplicidad sigue la notación UML y se lee del extremo de origen al extremo de destino: 1 indica exactamente uno, 0..1 indica ninguno o uno, 0..* indica ninguno o muchos y 1..* indica uno o muchos; entre llaves se consignan las restricciones de orden y de exclusión.

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

*Tabla 4. Relaciones del dominio y sus multiplicidades. Fuente: elaboración propia; validadas con la referente en la sesión del 26/09/2026; las precisiones posteriores constan en la extensión del acta.*

![Modelo del dominio de RIGE](../figuras/cap-03/figura-modelo-dominio.png){width="6in"}

*Figura 1. Modelo del dominio de RIGE. Entidades, relaciones y cardinalidades. Fuente: elaboración propia sobre el relevamiento del Anexo I, A.I.3 del informe de la AE1 y el acta de validación; validadas con la referente en la sesión del 26/09/2026; las precisiones posteriores constan en la extensión del acta.*

La relación reflexiva entre elementos representa los vínculos declarados en la Tabla 7 del informe de la AE1 (el modelo que un agente utiliza, el agente que un comando invoca, las herramientas que aporta un servidor MCP y las skills disponibles para cada agente) sin que el núcleo conozca ninguno de esos tipos. El tipo de cada elemento y el de cada relación válida los declara el adaptador de la herramienta mediante su descriptor de capacidades. Ese descriptor no integra el dominio del negocio: es el contrato entre el adaptador y el núcleo, y sobre él se apoya el requisito RNF-03. La relación forma parte del modelo, pero su representación en el sistema queda diferida como capacidad posterior (RF-13), conforme a la decisión L-12 validada con la referente.

| **Tipo de elemento** | **Qué resuelve RIGE**                                                          | **Requisito**        |
|----------------------|--------------------------------------------------------------------------------|----------------------|
| Agente y subagente   | Valores efectivos, procedencia, declaraciones desplazadas y cadena de reglas de permiso | RF-01, RF-02, RF-06  |
| Modelo               | Modelo efectivo de cada agente, con su procedencia                             | RF-01                |
| Instrucción          | Sin resolución comprometida en el período                                      | —                    |
| Comando              | Sin resolución comprometida en el período                                      | —                    |
| Skill                | Sin resolución comprometida en el período                                      | —                    |
| Servidor MCP         | Descubiertos como declaraciones de las entradas; su resolución completa corresponde a RF-14 (Could) | — |
| Servidor LSP         | Descubiertos como declaraciones de las entradas; su resolución completa corresponde a RF-14 (Could) | — |
| Plugin               | Descubiertos como declaraciones de las entradas; su resolución completa corresponde a RF-14 (Could) | — |

*Tabla 5. Tipos de elemento que declara el adaptador de OpenCode 1.18.25, con el requisito que cubre su resolución. Fuente: elaboración propia sobre el Anexo I, A.I.3 del informe de la AE1 y el catálogo de requisitos del Anexo I.*

Quedan fuera del compromiso del período los archivos de instrucciones que aplican y su orden de incorporación, la definición efectiva de los comandos, la disponibilidad y la ubicación de las skills, el estado de carga de los plugins y la agrupación de los servidores LSP por lenguaje. Las skills integran el modelo del dominio, pero ningún requisito compromete su resolución en este período: su disponibilidad para cada agente forma parte de la representación de vínculos diferida como capacidad posterior (RF-13), conforme a la decisión L-12. RF-01 compromete la resolución de las claves de un agente, incluido su modelo efectivo. Los servidores MCP y LSP y los plugins se descubren como declaraciones de las entradas; su resolución completa corresponde a RF-14 (Could), que informa por línea de comandos el estado resuelto completo de un proyecto: sus elementos, los valores efectivos con su procedencia y los hallazgos, como capacidad diferida.

### III.2.4 · Reglas de negocio y glosario

El dominio se gobierna por trece reglas de negocio de tres tipos: siete de derivación, que establecen cómo se calcula un dato a partir de otros; tres de restricción, que prohíben un estado o una transición; y tres de existencia, que condicionan la creación de una instancia. Las reglas constan validadas con la referente en el acta de validación. Las de derivación describen el comportamiento de OpenCode 1.18.25: cinco de ellas (RD-02, RD-03, RD-05, RD-06 y RD-07) se verificaron, además, mediante la ejecución de escenarios controlados, y las dos restantes, mediante la lectura del código fuente o de la salida de los comandos de introspección. Las de existencia fijan cuándo el sistema registra un elemento o un hallazgo, y las de restricción derivan de decisiones de alcance. El registro completo, con enunciado verificable, fuente, estado y requisito derivado, consta en el Anexo V; la Tabla 6 reproduce una regla de cada tipo.

| **Cód.** | **Tipo**    | **Enunciado verificable**                                                                                                                                                                         | **Fuente**                        | **Estado**              | **Requisito derivado** |
|----------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|-------------------------|------------------------|
| RD-03    | Derivación  | La decisión de permiso resulta de evaluar la cadena ordenada de reglas (nativas generales, nativas del agente, declaradas globales y declaradas del agente) y la determina la última coincidencia | H-05; acta de validación | Validada | RF-02                  |
| RR-01    | Restricción | RIGE no modifica ninguna entrada de configuración; escribe únicamente en su propio almacén                                                                                                        | Acta de validación, decisión L-01 | Validada                | RNF-01                 |
| RE-02    | Existencia  | Una regla se marca sin efecto solo si existe una regla posterior del mismo tipo que abarca todos los casos que ella cubre                                                                         | H-05; Al-Shaer y Hamed (2004); acta de validación | Validada | RF-07                  |

*Tabla 6. Reglas de negocio representativas, una por tipo. Registro completo en el Anexo V. Fuente: elaboración propia.*

El glosario del dominio consta en el Anexo V y fija el vocabulario normativo de este informe. Dos términos presentaban un uso ambiguo, y ambos se resolvieron con la referente en la misma sesión de validación. El primero es la denominación de las vías por las que llega la configuración: la documentación de la herramienta emplea *source*, el uso corriente alterna entre capa, alcance y nivel, y el informe de la AE1 alternaba entre fuente y entrada. Se adopta «entrada de configuración» y las demás se registran como sinónimos. El segundo es «permiso», que el uso corriente aplica tanto a la decisión como a la regla que la produce; el informe reserva «permiso» para la decisión y «regla de permiso» para la declaración que la origina.
