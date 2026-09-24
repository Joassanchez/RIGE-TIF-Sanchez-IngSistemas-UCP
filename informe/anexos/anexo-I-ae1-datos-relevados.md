# ANEXO I — DATOS RELEVADOS

## A.I.1 · Instrumento de medición: composición de los casos

Cada condición de la Tabla 2 se representa con dos casos equivalentes, identificados con los sufijos \*a\* y \*b\*. La equivalencia se establece por estructura —igual cantidad de entradas involucradas y de distractores— y no por redacción. Ningún caso integra el instrumento si un comando nativo de la herramienta informa a la vez el valor y su procedencia.

| **Cód.** | **Condición**                                       | **Entradas involucradas**             | **Pregunta formulada** | **Respuesta verificada** |
|----------|-----------------------------------------------------|---------------------------------------|------------------------|--------------------------|
| C-1a     | Declaración única, sin conflicto                    | 1                                     | \[ \]                  | \[ \]                    |
| C-1b     | Declaración única, sin conflicto                    | 1 + 1 distractor de otro agente       | \[ \]                  | \[ \]                    |
| C-2a     | Combinación de fuentes de distinta precedencia      | 2                                     | \[ \]                  | \[ \]                    |
| C-2b     | Combinación de fuentes de distinta precedencia      | 2                                     | \[ \]                  | \[ \]                    |
| C-3a     | Valor o decisión sin declaración del usuario        | 0 declaradas; valor implícito         | \[ \]                  | \[ \]                    |
| C-3b     | Valor o decisión sin declaración del usuario        | 0 declaradas; regla nativa            | \[ \]                  | \[ \]                    |
| C-4a     | Decisión de permiso con reglas en fuentes distintas | 2                                     | \[ \]                  | \[ \]                    |
| C-4b     | Decisión de permiso con reglas en fuentes distintas | 2, con orden de declaración invertido | \[ \]                  | \[ \]                    |

*Tabla A.I.1. Composición de los ocho casos del instrumento. Fuente: elaboración propia.*

**Procedimiento de verificación de cada caso.** Antes de la primera sesión, cada caso se verifica ejecutando OpenCode 1.18.25 sobre el escenario correspondiente en un entorno limpio, con directorio de usuario aislado y sin plugins instalados. La verificación registra el comando ejecutado, su salida completa y la fecha, y se conserva como ficha por caso. Un caso cuya respuesta no pueda confirmarse por ejecución no integra el instrumento.

**Condición de vigencia.** Los ocho casos se verifican nuevamente antes de la medición final, sobre la misma versión. Si alguno cambiara de resultado, el caso se retira del análisis pareado y se informa el retiro, en lugar de sustituirse por otro.

## A.I.2 · Secuencias de presentación

El orden de los casos se contrabalancea de modo que ninguna condición ocupe sistemáticamente la misma posición, que los dos casos de una misma condición no resulten consecutivos y que la comparación entre variantes no quede confundida con la mitad de la sesión en que cada una se presenta. Cada participante recibe una secuencia asignada, y en la medición final recibe la misma, condición necesaria para el análisis pareado del apartado I.3.4.

| **Secuencia** | **Orden de los ocho casos** | **Participante asignado** |
|---------------|-----------------------------|---------------------------|
| S1            | \[ \]                       | \[ \]                     |
| S2            | \[ \]                       | \[ \]                     |
| S3            | \[ \]                       | \[ \]                     |
| S4            | \[ \]                       | \[ \]                     |
| S5            | \[ \]                       | \[ \]                     |
| S6            | \[ \]                       | \[ \]                     |
| S7            | \[ \]                       | \[ \]                     |
| S8            | \[ \]                       | \[ \]                     |

*Tabla A.I.2. Secuencias de contrabalanceo y asignación. Fuente: elaboración propia.*

Cuando la cantidad de participantes no resulta múltiplo de la cantidad de secuencias, las secuencias excedentes se asignan en el orden de la tabla, y el desbalance resultante se informa junto con los resultados.

## A.I.3 · Relevamiento técnico de OpenCode 1.18.25

Documento completo en el repositorio del proyecto, bajo docs/relevamiento/opencode-como-funciona.md. Sostiene las afirmaciones de los apartados I.1.1, I.1.3, I.6.2 y II.6.1, y se sintetiza aquí en sus resultados verificados.

| **N.º** | **Resultado verificado**                                                                                                                                                                                                         | **Método**                                                                                              | **Estado**                                                                             |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| 1       | La configuración efectiva se construye aplicando hasta doce entradas sucesivas, cuatro de las cuales no son archivos                                                                                                             | Lectura del cargador de configuración en el código fuente del tag correspondiente                       | Verificado                                                                             |
| 2       | La documentación oficial de la versión describe un conjunto menor de fuentes y omite el criterio de resolución de permisos                                                                                                       | Contraste entre la documentación del tag y el código                                                    | Verificado                                                                             |
| 3       | La fusión es profunda: dos entradas que declaran el mismo elemento combinan sus claves y producen un objeto que no consta en ningún archivo                                                                                      | Ejecución de escenarios controlados                                                                     | Verificado                                                                             |
| 4       | La precedencia entre los directorios propios de la herramienta se comporta de manera inversa a la de los archivos del proyecto                                                                                                   | Ejecución de escenarios controlados; concordante con incidencias de terceros                            | Verificado                                                                             |
| 5       | Los permisos se resuelven como lista ordenada de reglas en la que decide la última coincidencia, sin criterio de especificidad                                                                                                   | Lectura del evaluador de permisos y ejecución de escenarios                                             | Verificado                                                                             |
| 6       | Al fusionar dos entradas, la posición de una clave la fija la primera que la declara y su valor la última                                                                                                                        | Ejecución de los dos escenarios simétricos del apartado I.1.3                                           | Verificado                                                                             |
| 7       | Las reglas declaradas por el usuario se concatenan después de las nativas, de modo que una declaración amplia desactiva una protección nativa                                                                                    | Ejecución de escenario controlado; concordante con incidencia de terceros                               | Verificado                                                                             |
| 8       | Una regla de denegación con patrón general oculta la herramienta al modelo, en lugar de limitarse a denegar la acción                                                                                                            | Ejecución de escenario controlado                                                                       | Verificado                                                                             |
| 9       | La herramienta expone trece comandos de introspección; ninguno informa el archivo de origen de un valor ni evalúa una decisión para una acción concreta                                                                          | Ejecución de la familia completa de comandos y análisis de sus salidas                                  | Verificado                                                                             |
| 10      | El repositorio contiene dos motores de evaluación de permisos; en la versión 1.18.25 la decisión la produce el segundo de ellos, mientras que el comando de resolución por agente presenta las reglas con el formato del primero | Lectura de ambos motores y captura de los eventos de permiso emitidos en ejecución                      | Verificado                                                                             |
| 11      | Una aprobación permanente conserva el texto literal de la acción aprobada, subsiste entre sesiones y no revierte una denegación declarada, que constituye la única decisión que ninguna aprobación vence                         | Ejecución con agente real y verificación del registro persistido                                        | Verificado; corrige el resultado informado en la versión anterior de este relevamiento |
| 12      | Un subagente hereda del agente que lo invoca únicamente las reglas de denegación y las de directorio externo; el resto proviene de su propio conjunto, al que se agregan denegaciones implícitas                                 | Lectura del armado de permisos de subagentes y ejecución de escenario controlado                        | Verificado                                                                             |
| 13      | Una sustitución que referencia una variable de entorno no definida se reemplaza por una cadena vacía sin advertencia                                                                                                             | Ejecución de escenario controlado                                                                       | Verificado                                                                             |
| 14      | Una variable de entorno de configuración con contenido inválido se descarta sin error visible; el descarte solo consta en el archivo de registro                                                                                 | Ejecución de escenario controlado con registro activado                                                 | Verificado                                                                             |
| 15      | El comando de terminal se descompone en un árbol sintáctico y genera un recurso por sub-comando, de modo que una denegación que alcance a cualquiera de ellos deniega el comando completo                                        | Ejecución de escenarios con encadenamiento, tubería, secuencia y subshell, con verificación sobre disco | Verificado                                                                             |
| 16      | Las instrucciones de contexto declaradas en subdirectorios se incorporan durante la sesión, según los archivos que el agente lee, y no constituyen un dato estático de la configuración                                          | Ejecución con agente real                                                                               | Verificado                                                                             |
| 17      | El conjunto de herramientas ofrecido para un mismo agente y proyecto difiere según el modo de ejecución de la herramienta                                                                                                        | Ejecución comparada en ambos modos                                                                      | Verificado                                                                             |
| 18      | Existencia de agentes que la herramienta invoca internamente sin declaración del usuario, y alcance de las acciones que pueden ejecutar                                                                                          | Reportado por el referente en A.I.5; verificación propia pendiente                                      | Pendiente                                                                              |
| 19      | Comportamiento de la frontera de directorio desde la herramienta de terminal en Ubuntu                                                                                                                                           | Verificado en otra plataforma; reproducción pendiente                                                   | Pendiente                                                                              |
| 20      | Posibilidad de que un plugin modifique la configuración fusionada en tiempo de carga                                                                                                                                             | —                                                                                                       | Pendiente, fuera del alcance declarado en I.6.5                                        |
| 21      | Comportamiento de la configuración administrada y de la configuración remota                                                                                                                                                     | —                                                                                                       | Pendiente, fuera del alcance declarado en I.6.5                                        |

*Tabla A.I.3. Resultados del relevamiento técnico. Fuente: elaboración propia.*

Dos observaciones sobre la composición de la tabla. El resultado n.º 11 corrige una afirmación de la versión anterior de este relevamiento, que sostenía que una aprobación de sesión prevalecía sobre una denegación declarada. Esa lectura provenía del motor que el resultado n.º 10 identifica como no vigente en la versión analizada, y la ejecución con un agente real la desmiente. La corrección se consigna de manera expresa, y no en silencio, porque ilustra el criterio que gobierna todo el relevamiento: leer el código del tag correcto no acredita el comportamiento de la herramienta si no se ejecuta.

El resultado n.º 18 se incorpora a partir de la entrevista y no del relevamiento técnico, y se consigna como pendiente de verificación propia. Su comprobación es condición para sostener la inclusión de los elementos nativos declarada en el apartado I.6.1, y se ejecuta con el mismo procedimiento reproducible que los resultados 1 a 17.

**Procedimiento reproducible.** Los escenarios se ejecutan sobre un directorio de usuario aislado mediante la sustitución de la variable de entorno correspondiente, con un proyecto de prueba vacío y sin plugins, de modo que la única configuración presente sea la del escenario. Cada ejecución registra el comando, la salida completa y la fecha. El procedimiento y los escenarios constan en el documento completo.

## A.I.4 · Nómina del estado del arte

Relevamiento con fecha de consulta 17 de septiembre de 2026, organizado en los tres niveles del apartado I.1.3.

| **Nivel**               | **Solución**                                                                                                       | **Qué informa**                                                                                                        | **Qué no informa**                                                                                                                    |
|-------------------------|--------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| 1 · Competencia directa | Comando nativo de configuración de OpenCode                                                                        | Configuración resultante de la fusión de las fuentes declaradas                                                        | Archivo de origen de cada valor; valores implícitos; reglas nativas                                                                   |
| 1 · Competencia directa | Comando nativo de resolución por agente de OpenCode                                                                | Valores efectivos del agente y lista ordenada de sus reglas de permiso, incluidas las nativas y los valores implícitos | Archivo de origen de cada valor; distinción entre regla nativa y declarada; decisión para una acción concreta                         |
| 1 · Competencia directa | OpenCode Config Manager (icysaintdx, 2026)                                                                         | Edición y validación de archivos de configuración                                                                      | Estado efectivo; procedencia; permisos                                                                                                |
| 1 · Competencia directa | Claude Code Config Manager (Onufriichuk, 2026)                                                                     | Valores declarados por alcance, cuál prevalece y reglas de permiso por alcance                                         | Decisión para una acción concreta con su regla determinante; valores implícitos; referencias no resueltas; relaciones entre elementos |
| 1 · Competencia directa | Escáneres de seguridad de servidores MCP                                                                           | Riesgos de los servidores declarados                                                                                   | Configuración efectiva; procedencia; permisos del agente                                                                              |
| 1 · Competencia directa | Validadores de archivos de instrucciones                                                                           | Conformidad del contenido de los archivos de contexto                                                                  | Configuración efectiva; procedencia; permisos                                                                                         |
| 2 · Propuesta abierta   | Comando de procedencia propuesto para Codex (Winning, 2026)                                                        | Especifica directorio en uso, proyecto, perfil, valores efectivos y capa determinante con su archivo                   | No implementado a la fecha de consulta; alcance limitado a campos de diagnóstico frecuente                                            |
| 3 · Precedente maduro   | Resolución de configuración con origen en sistemas de control de versiones                                         | Valor efectivo, archivo y alcance que lo determinan                                                                    | Precedente de diseño; no opera sobre herramientas agénticas                                                                           |
| 3 · Precedente maduro   | Simuladores de políticas de acceso de proveedores de infraestructura                                               | Decisión para un sujeto y una acción, con la sentencia determinante                                                    | Precedente de diseño; no opera sobre herramientas agénticas                                                                           |
| 3 · Precedente maduro   | Motores de políticas con explicación de la evaluación                                                              | Decisión acompañada de la traza que la produce                                                                         | Precedente de diseño; no opera sobre herramientas agénticas                                                                           |
| 3 · Precedente maduro   | Comandos de configuración efectiva de herramientas de análisis estático, compiladores y constructores de proyectos | Configuración resultante de la herencia entre descriptores                                                             | Precedente de diseño; no opera sobre herramientas agénticas                                                                           |

*Tabla A.I.4. Nómina del estado del arte por nivel. Fuente: elaboración propia sobre prueba directa de cada solución del nivel 1 y documentación oficial de las de nivel 3.*

**Condición de vigencia.** El relevamiento corresponde a una fecha determinada, sobre un conjunto de herramientas de ritmo de cambio alto. Se revisa antes de la defensa y toda incorporación se registra con su fecha.

## A.I.5 · Entrevista semiestructurada al referente técnico

| **Campo**                                        | **Contenido**                                                                                                                                                             |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Persona entrevistada                             | Valeria Areco                                                                                                                                                             |
| Rol                                              | Desarrolladora del equipo de Sistemas de Electricidad de Misiones S. A.                                                                                                   |
| Composición del equipo                           | Cinco integrantes                                                                                                                                                         |
| Canal                                            | \[ \]                                                                                                                                                                     |
| Fecha                                            | \[fecha\]                                                                                                                                                                 |
| Duración                                         | \[ \]                                                                                                                                                                     |
| Motivo declarado                                 | Verificar la presencia del problema en la práctica del equipo, obtener los parámetros de valoración y registrar las preguntas que el desarrollador formula en su práctica |
| Consentimiento                                   | \[ \]                                                                                                                                                                     |
| Autorización para identificarla con nombre y rol | \[ \]                                                                                                                                                                     |
| Registro                                         | \[grabación / notas\]                                                                                                                                                     |

*Tabla A.I.5. Datos de la entrevista. Fuente: elaboración propia.*

**Guía de entrevista aplicada.** Las preguntas se ordenan de lo general a lo particular y evitan sugerir la respuesta esperada. Se registran en el orden efectivamente aplicado: (1) herramientas de programación asistida que el equipo utiliza y desde cuándo; (2) motivo por el cual el equipo las incorporó; (3) quién configura el entorno de cada desarrollador y con qué criterio; (4) situaciones en que el comportamiento del agente difirió de lo previsto, con relato de un caso concreto; (5) procedimiento seguido para averiguar qué configuración regía en ese caso y tiempo aproximado que demandó; (6) recursos y soluciones propias que el equipo construyó para resolver estas consultas; (7) frecuencia con que se presentan consultas de esta clase; (8) valor de referencia de la hora de trabajo de desarrollo y su origen; (9) consecuencias observadas cuando la respuesta resultó incorrecta.

**Transcripción.** \[Transcripción o registro completo pendiente de incorporación.\]

**Síntesis de lo declarado y de lo observado.** El contenido sustantivo de la entrevista se presenta, sin interpretación, en el apartado II.3.3 del cuerpo del informe, y comprende: composición del equipo y motivo de adopción de las herramientas; frecuencia declarada de acceso a los archivos de configuración y su tendencia; procedimiento habitual de resolución; dos episodios de comportamiento distinto del esperado; tres soluciones construidas por el equipo; dos vías de consumo de tokens atribuibles a la configuración; y la respuesta al enfoque presentado.

**Formulaciones textuales del informante.** Se conservan sin reformular, dado que constituyen el insumo del prototipo v0 conforme al apartado I.6.6.

| **N.º** | **Formulación registrada** | **Pantalla del prototipo que la responde** |
|---------|----------------------------|--------------------------------------------|
| 1       | \[ \]                      | \[ \]                                      |
| 2       | \[ \]                      | \[ \]                                      |
| 3       | \[ \]                      | \[ \]                                      |

*Tabla A.I.5.1. Preguntas que el informante formula en su práctica. Fuente: elaboración propia sobre el registro de la entrevista.*

**Ficha de datos cuantitativos.** Los dos datos cuantitativos que la entrevista aporta se consignan con las tres preguntas respondidas junto al dato.

| **Campo**                           | **F · Frecuencia**                                                                                                  | **P-2 · Consumo de tokens**                                                                                                                                                                   |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Dato                                | 5 accesos semanales a los archivos de configuración                                                                 | \[ \]                                                                                                                                                                                         |
| Definición del evento               | Acceso a los archivos de configuración; el informante precisa que en general se trata de consultas menores          | Tokens consumidos por dos vías: consulta del propio entorno mediante un agente de permisos elevados, y repetición de acciones cuyo resultado no se correspondió con la configuración esperada |
| Quién lo produjo                    | Valeria Areco, sobre su propia práctica                                                                             | Valeria Areco, sobre su propia práctica                                                                                                                                                       |
| Con qué método y sobre qué universo | Estimación retrospectiva, sin registro documental de respaldo; universo de una desarrolladora en un equipo de cinco | Observación de un gasto ya incurrido, sin cuantificación                                                                                                                                      |
| Para qué período de referencia      | \[ \]                                                                                                               | \[ \]                                                                                                                                                                                         |
| Condición probatoria                | Demanda declarada                                                                                                   | Demanda revelada                                                                                                                                                                              |
| Sesgos y límites declarados         | Recuerdo retrospectivo; informante único; tendencia decreciente declarada por el propio informante                  | Magnitud no cuantificada                                                                                                                                                                      |

*Tabla A.I.5.2. Datos cuantitativos obtenidos en la entrevista, con las tres preguntas respondidas. Fuente: elaboración propia.*

**Datos que la entrevista no aporta.** El informante no informó un valor de referencia de la hora de trabajo de desarrollo ni la proporción de sus accesos semanales que exige una resolución comparable a la que mide la línea de base. Ninguno de los dos se sustituye por una estimación propia, conforme a la decisión del apartado I.3.1.

**Efecto de la entrevista sobre la composición de la muestra.** Durante la entrevista se describió al informante el enfoque de la plataforma y el recorrido de consulta previsto. En consecuencia, el informante queda excluido de la muestra de la medición de la línea de base, conforme al apartado II.2.4.

**Validación del prototipo v0.** \[Observaciones del referente, cambios incorporados y fecha, pendientes de incorporación. La validación se efectúa sobre la maqueta construida y constituye un contacto distinto de esta entrevista.\]

## A.I.6 · Relevamiento documental de incidencias del repositorio de OpenCode

**Criterio de búsqueda, registrado antes del conteo.** Se admiten las incidencias cuyo título combina un término relativo al comportamiento de la configuración con el término que designa la configuración, sobre la totalidad del historial público del repositorio. La restricción al título obedece a la escala del repositorio y produce subcobertura, declarada en el apartado II.6.3: el resultado constituye un piso de ocurrencia y no una medida de prevalencia.

**Criterio de exclusión, registrado antes del conteo.** Se excluyen las incidencias que solicitan una funcionalidad sin relatar un comportamiento ya experimentado, y las que no versan sobre la resolución de la configuración o de los permisos.

| **Categoría**                                         | **Casos** |
|-------------------------------------------------------|-----------|
| Candidatas según el criterio de búsqueda              | 46        |
| Excluidas por corresponder a pedidos de funcionalidad | 12        |
| Excluidas por no versar sobre el fenómeno relevado    | 2         |
| **Incluidas**                                         | **32**    |
| Incluidas — abiertas a la fecha de consulta           | 8         |
| Incluidas — cerradas a la fecha de consulta           | 24        |

*Tabla A.I.6. Resultado de la aplicación de los criterios. Fuente: elaboración propia; relevamiento del 17/09/2026.*

**Nómina.** La nómina completa de las 46 incidencias candidatas, con número, título, fecha de apertura, estado, clasificación y motivo de inclusión o exclusión, consta en el repositorio del proyecto bajo docs/relevamiento/incidencias-opencode.md y se incorpora impresa a continuación. \[Nómina pendiente de incorporación impresa.\]

## A.I.7 · Hoja de respuestas y criterio de corrección

La hoja de respuestas se cierra y se verifica antes de la primera sesión y no se modifica una vez iniciada la medición. Una respuesta es correcta cuando coinciden el valor y su fuente o, en las condiciones de permisos, la decisión y la regla determinante. El acierto parcial —valor o decisión correctos con fuente o regla incorrectas— se computa como error y se registra por separado, dado que expresa la segunda consecuencia acreditada en el apartado I.3.1.

| **Cód.**    | **Respuesta verificada** | **Variantes aceptables**                                             | **No aceptable**                                             |
|-------------|--------------------------|----------------------------------------------------------------------|--------------------------------------------------------------|
| C-1a a C-4b | \[ \]                    | \[Formas equivalentes de nombrar el mismo archivo o la misma regla\] | \[Identificación de una fuente distinta de la determinante\] |

*Tabla A.I.7. Estructura de la hoja de respuestas. Fuente: elaboración propia.*

**Tratamiento de los casos ambiguos.** Si durante la medición un caso resulta ambiguo, se registra como tal y se analiza por separado, sin reinterpretar las respuestas ya clasificadas ni modificar el criterio. La decisión de retirarlo del análisis se toma una sola vez y se informa.

**Límite de observación.** Alcanzado el límite, la respuesta se registra como error con tiempo censurado en el valor del límite. El valor se determina en la prueba piloto conforme al criterio del apartado I.3.2 y queda congelado desde la primera sesión. Valor adoptado: \[ \] s. Resultado de la prueba piloto que lo sustenta: \[ \].

## A.I.8 · Registro de la medición

**Protocolo de sesión.** La sesión se administra de manera remota y supervisada, con grabación de pantalla bajo consentimiento informado, sobre una máquina virtual con instalación limpia de OpenCode 1.18.25, restaurada antes de cada sesión y sin acceso a internet, condición que se verifica al inicio y se registra. El cronometraje se inicia al concluir la lectura de la pregunta y finaliza cuando el participante declara haber resuelto la consulta o al alcanzarse el límite. La sesión comprende presentación y consentimiento, capacitación breve sobre el entorno, los ocho casos en la secuencia asignada y cierre.

**Estructura del registro por respuesta.** Participante (código), secuencia, posición del caso en la secuencia, código del caso, condición, tiempo en segundos, censura, clasificación (correcta, parcial, errónea), respuesta textual, comandos de introspección utilizados, consultas a la documentación o a la hoja de referencia, y archivos abiertos.

| **Participante** | **Perfil** | **Secuencia** | **Respuestas correctas** | **IB-1 individual** | **Mediana de tiempo** | **Completó la medición final** |
|------------------|------------|---------------|--------------------------|---------------------|-----------------------|--------------------------------|
| P01 a P\[N\]     | \[ \]      | \[ \]         | \[ \]                    | \[ \]               | \[ \]                 | \[ \]                          |

*Tabla A.I.8. Estructura del registro por participante. Fuente: elaboración propia.*

**Protección de datos.** Conforme a la Ley N.º 25.326, los participantes se identifican por código; los datos identificatorios se conservan separados de los datos de análisis; las grabaciones se eliminan en el plazo declarado en el consentimiento. Formulario de consentimiento: \[ \].

**Resultados.** \[Registro completo pendiente de incorporación, una vez ejecutada la medición.\]

## A.I.9 · Composición de los gráficos previstos

La composición de las figuras que representan los resultados de la medición queda fijada antes de conocer los datos, de modo que la forma de presentarlos no se decida una vez obtenidos.

**Figura 3 — Tiempo de resolución por condición.** Diagrama de caja. Eje horizontal: condición (C-1 a C-4). Eje vertical: tiempo de resolución en segundos. Cada caja representa mediana, cuartiles y valores atípicos. Línea horizontal de referencia en el límite de observación. Bajo cada caja, el recuento de observaciones censuradas y el denominador de la categoría. Las observaciones censuradas se incluyen en el cálculo con el valor del límite, criterio que se declara en el pie.

**Figura 4 — Proporción de respuestas erróneas por condición.** Gráfico de barras. Eje horizontal: condición (C-1 a C-4). Eje vertical: proporción de respuestas erróneas, en porcentaje, de 0 a 100. Barra de error correspondiente al intervalo de confianza del 95 % calculado por el método de Clopper-Pearson. Sobre cada barra, el denominador de la categoría.
