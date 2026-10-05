# Instrumento 27 · Ficha de delimitación de entorno y dominio

*Proyecto: RIGE. Autor: Sánchez, Joaquín Sebastián. Destino: Capítulo III, apartados III.1, III.2 y III.4, y Portafolio de la Unidad Dos. Validación: sesión con la referente técnica de EMSA del 26/09/2026 (Instrumento 31).*

**27.1 · Entorno del Sistema de Información**

Un elemento integra el entorno solo si su supresión modifica alguna decisión del proyecto.

| **Categoría** | **Elemento** | **Fuente (Cap. II / acta)** | **Implicancia de diseño declarada** |
|---|---|---|---|
| Actores externos | Desarrollador que configura su propio entorno de trabajo | apartado I.6.4 (Tabla 9 del informe de la AE1); acta del 26/09/2026, L-13 | El agente es el eje de navegación y las decisiones de permiso y los hallazgos incluyen una explicación de sus motivos. |
| Normas | Licencia MIT de OpenCode | Anexo VII, A.VII.3 | La licencia permite incorporar las funciones de evaluación de permisos con atribución y condiciona el licenciamiento de RIGE. |
| Sistemas vecinos | OpenCode 1.18.25, con su esquema de configuración publicado, su cadencia de versiones y sus modos de ejecución | Anexo VI, A.VI.3 y A.VI.6 | OpenCode es la referencia para verificar la corrección sin que RIGE lo ejecute ni lo modifique, y sus cambios entre versiones obligan a fijar la 1.18.25 y a advertir cuando la instalada difiere. El adaptador resuelve según el comportamiento verificado del código, porque la documentación es incompleta. |
| Sistemas vecinos | Agente de programación que crea o modifica configuración por encargo del desarrollador | Acta de validación del 26/09/2026, E-01; apartado II.6.1, hallazgo HA-3 | Exige una salida estructurada, determinista y legible por máquina, con ruta y posición exactas, esquema versionado y códigos de salida definidos. |
| Sistemas vecinos | Editor de texto del desarrollador | Acta del 26/09/2026, L-01 | RIGE informa la localización en formato ruta:línea:columna (RF-12), y la apertura y la edición corresponden al editor. |
| Infraestructura | Sistema de archivos local y permisos de lectura del usuario | Acta del 26/09/2026, sección 2 | RIGE audita el entorno individual y excluye las rutas que requieren privilegios administrativos y las políticas de administración centralizada. |
| Infraestructura | Rutas de configuración dependientes del sistema operativo | Acta del 26/09/2026, L-11 | El descubrimiento resuelve las rutas según el sistema operativo, con portabilidad sobre Ubuntu 26.04 y Windows 11 (RNF-06). |
| Infraestructura | Variables de entorno del proceso de RIGE, que pueden diferir de las de la terminal desde la cual se ejecuta OpenCode | Acta del 26/09/2026, sección 2 | RIGE resuelve sobre las variables de su propio proceso y declara esta condición. |
| Infraestructura | Escritura concurrente sobre las entradas mientras RIGE opera | Acta de validación del 26/09/2026, E-02 | El resultado identifica el estado de las entradas mediante el resumen del conjunto leído. |

*Fuente: apartado III.1, Tabla 1.*

**27.2 · Frontera entre el entorno y el dominio**

El dominio es el recorte del mundo que el sistema representa y sobre cuyo estado responde. La frontera aplica una prueba: si RIGE controla el estado de un objeto o lo padece. El archivo de configuración pertenece al entorno, porque RIGE recibe el contenido escrito por otros, mientras que su representación resuelta pertenece al dominio. Esta distinción sostiene el modo de operación de solo lectura del apartado III.4.

| **Dominio (RIGE controla su estado)** | **Entorno (RIGE lo padece)** |
|---|---|
| Proyecto analizado, Resolución, Entrada de configuración, Declaración, Sustitución, Elemento, Agente, Regla de permiso, Hallazgo | Los elementos de la tabla 27.1: actores externos, normas, sistemas vecinos e infraestructura. El archivo de configuración, como objeto del disco, también pertenece al entorno: RIGE lo recibe ya formado y no lo modifica |

*Fuente: apartado III.2.1 y lista filtrada de entidades (Instrumento 28).*

**27.3 · Exclusiones motivadas**

Cada exclusión se presenta junto a la inclusión que le corresponde, con su motivo y quién la validó.

| **Qué se incluye**                                          | **Qué queda fuera**                                                                                               | **Por qué motivo**                                                                                                                                                                                                                    | **Quién lo validó**    | **Estado y constancia**                                                       |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|--------------------------------------------------------------------------------|
| Lectura de la configuración                                 | Edición de los archivos                                                                                           | La edición ya está cubierta por las soluciones relevadas y modificar el estado informado impide auditarlo. | Referente | Validado · acta, L-01 |
| Comandos de terminal simples                                | Comandos compuestos: tuberías, encadenamientos, redirecciones, subshells y sustituciones                          | Informar una decisión correcta exige reproducir el análisis de cada subcomando que realiza la herramienta. | Referente | Validado · acta, L-02 |
| Proveedores y modelos declarados                            | Credenciales de autenticación                                                                                     | Las credenciales determinan el acceso a los modelos y su exposición introduce un riesgo de seguridad. | Referente | Validado · acta, L-03 |
| Uso individual y local                                      | Uso compartido, en servidor o por equipos                                                                         | La frontera se sitúa en el entorno individual del desarrollador. | Referente | Validado · acta, L-04 |
| OpenCode 1.18.25                                            | Otras herramientas y otras versiones                                                                              | La versión congelada permite verificar la corrección y otras herramientas se incorporan mediante adaptadores. | Referente | Validado · acta, L-05 |
| Consulta por línea de comandos de valores efectivos, decisiones de permiso y hallazgos, con salida conforme a un esquema versionado y explicación a pedido | Listados de elementos distintos de los agentes y consulta inversa por esa vía | El agente necesita una consulta por línea de comandos con explicación a pedido y listado de agentes como punto de partida. | Referente | Validado · acta, L-06 y su extensión |
| Información sobre el estado efectivo para un agente externo | Aplicación o validación de los cambios que ese agente realiza                                                     | La escritura y la validación de los cambios corresponden al agente bajo responsabilidad del desarrollador. | Referente | Validado · acta, L-07 |
| Estado resuelto completo del proyecto (RF-14)               | Comparación entre dos estados resueltos                                                                           | La comparación requiere una función con interfaz y pruebas propias. | Referente | Validado · acta, L-09 |
| Detección de entradas ilegibles                             | Validación completa contra el esquema de configuración publicado de la herramienta                                | La validación del esquema constituye una función distinta de la resolución del estado efectivo. | Referente | Validado · acta, L-09 |
| Interfaz web local limitada a formularios y vistas de consulta de valores, permisos y hallazgos | Exploración libre del ecosistema, filtros y navegación entre elementos en la interfaz web | La interfaz web limitada concentra el esfuerzo en la exactitud de los resultados. | Referente | Validado · acta, L-10 |
| Ubuntu 26.04, plataforma de referencia, y Windows 11, con instalación nativa sin privilegios administrativos | Acreditación en macOS | El proyecto dispone de Ubuntu y Windows para verificar y carece de un equipo con macOS. | Referente | Validado · acta, L-11 |
| Cada elemento con su procedencia | Representación de los vínculos entre elementos | Las relaciones requieren un desarrollo propio que excede las horas del período. | Referente | Validado · acta, L-12 |
| Explicación de las decisiones de permiso y de los hallazgos mediante plantillas deterministas | Explicación generada por un modelo de lenguaje | Las plantillas permiten verificar la explicación sin conexión externa, variabilidad ni costo por uso. | Referente | Validado · acta, L-13 |
| Entradas del entorno individual del desarrollador           | Configuración remota y administrada a nivel de sistema operativo                                                  | Requieren privilegios y exceden la frontera individual. | Autor | Fundamentada · Anexo III, A.III.3 |
| Elementos que determinan el comportamiento de los agentes   | Configuración de la interfaz de la herramienta                                                                    | No altera el comportamiento de los agentes. | Autor | Fundamentada · Anexo III, A.III.3 |
| Reglas de permiso declaradas y nativas                        | Aprobaciones permanentes concedidas por el desarrollador                                                          | Su lectura es una función distinta de la resolución. | Autor | Fundamentada · Anexo III, A.III.3 |
| Instrucciones de alcance global y de proyecto como entradas de configuración (su orden de incorporación no se compromete en el período) | Instrucciones declaradas en subdirectorios del proyecto                                                           | Su incorporación depende de los archivos leídos durante la sesión. | Autor | Fundamentada · Anexo III, A.III.3 |
| Plugins como elementos declarados, con su origen            | Efecto del código de los plugins sobre la configuración                                                           | Exige ejecutar código de terceros. | Autor | Fundamentada · Anexo III, A.III.3 |
| Declaración y habilitación de servidores MCP                | Disponibilidad, contenido y seguridad de esos servidores                                                          | Corresponden al objeto de los escáneres de seguridad. | Autor | Fundamentada · Anexo III, A.III.3 |
| Instrucciones como entrada de configuración                 | Evaluación de la calidad de su contenido                                                                          | Aborda el contenido y no la configuración efectiva. | Autor | Fundamentada · Anexo III, A.III.3 |
| Variables de entorno del proceso de RIGE                    | Entorno de ejecución de una sesión concreta de OpenCode, y diferencias de disponibilidad entre modos de ejecución | RIGE opera sin conectarse a la ejecución de OpenCode. | Autor | Fundamentada · Anexo III, A.III.3 |

*Fuente: apartado III.4, Tabla 5. Las exclusiones validadas por la referente constan en el acta del 26/09/2026 (Instrumento 31); las decisiones de ingeniería se fundamentan en el Anexo III, A.III.3, y se pusieron en conocimiento de la referente en la misma sesión.*
