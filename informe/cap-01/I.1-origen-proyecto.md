## I.1 · Origen del proyecto

### I.1.1 · Situación que da origen al proyecto

Las herramientas de programación basadas en agentes de inteligencia artificial ejecutan tareas de desarrollo de varios pasos con intervención humana reducida. Su comportamiento se ajusta mediante configuración: instrucciones de contexto, agentes y subagentes, permisos, comandos, skills y conexiones con servidores del Model Context Protocol (MCP). Galster, Mohsenimofidi, Lulla et al. (2026) sistematizan ese conjunto y verifican que los mecanismos de configuración difieren entre herramientas.

Un equipo académico de las universidades de Bamberg, Heidelberg, Bayreuth y Singapore Management University produce el conjunto de datos de Galster, Mohsenimofidi, Böhme et al. (2026). El método consiste en minería de repositorios públicos de GitHub con detección heurística de artefactos de configuración y de commits atribuidos a agentes por identidad, metadatos y patrones de mensaje. La captura de marzo de 2026 registra artefactos de configuración en 4 738 repositorios. En ese universo, el volumen mensual de commits coautorados por agentes pasa de valores próximos a cero a comienzos de 2025 a más de 40 000 en marzo de 2026. El conteo se limita a los commits con atribución identificable y describe el crecimiento en los repositorios observados; la adopción en todo el sector queda fuera de su alcance.

El proyecto se desarrolla sobre OpenCode en su versión 1.18.25, que se mantiene fija durante todo el desarrollo. La documentación de esa versión describe entradas de configuración ordenadas por precedencia, que se fusionan: una entrada posterior reemplaza a una anterior cuando ambas declaran la misma clave. El relevamiento del código fuente del tag correspondiente identifica hasta doce entradas sucesivas. Cuatro son entradas ajenas a archivos: variables de entorno, contenido inyectado por el entorno, configuración remota o preferencias administradas del sistema operativo. La documentación oficial describe un conjunto menor y ofrece un modelo incompleto del mecanismo que rige sobre el entorno del desarrollador.

La fusión profunda combina las claves de dos entradas que declaran el mismo agente y produce una composición ausente como tal del disco. OpenCode incorpora además valores implícitos y reglas nativas sin declaración del usuario. Los permisos se resuelven como una lista ordenada de reglas en la que decide la última coincidencia, sin criterio de especificidad. El estado efectivo se obtiene al resolver en conjunto todas las entradas y puede diferir del contenido de cada archivo. El relevamiento técnico acredita estas características mediante lectura del código y ejecución de escenarios controlados; el procedimiento reproducible consta en el Anexo VI, A.VI.3.

### I.1.2 · Referente consultado y alcance de su participación

Electricidad de Misiones S. A. (EMSA) participa exclusivamente como referente de validación y fuente de información contextual. La plataforma propuesta opera sobre el entorno de trabajo individual de un desarrollador; EMSA queda fuera del ámbito de implantación, conforme a la frontera establecida en el apartado I.6.4.

Se documentan tres contactos de relevamiento con Valeria Areco, desarrolladora del equipo de Sistemas de EMSA. La entrevista semiestructurada del 29/08/2026 es presencial y dura unos 30 minutos. Se aplica el instrumento descripto en el apartado II.2.3 para relevar la práctica del equipo y presentar la maqueta v0. De ese contacto procede la frecuencia de consulta utilizada en el apartado I.3.1.

La entrevista del 24/09/2026 también es presencial, dura unos 30 minutos y corresponde a una charla de seguimiento del proyecto. Aporta los episodios del apartado I.1.3 y las prácticas del equipo para suplir la carencia. El pedido de confirmación escrita de la delegación se registra el 09/10/2026. Esa práctica consta en el punto 2.2 de la constancia de entrevistas, versión 2, firmada el 15/10/2026: el equipo delega en un agente las correcciones y los cambios de configuración (Anexo VI, A.VI.5).

La sesión de validación del 26/09/2026 se realiza en forma presencial, dura 35 minutos y tiene por motivo revisar las definiciones del proyecto con la referente. Se confirman el entorno y los límites, junto con las versiones del catálogo de requisitos y del modelo del dominio presentadas ese día. La validación comprende también el recorrido de la maqueta reformulada del prototipo v0 (Anexo II, A.II.1). El problema reformulado y los criterios agregados el 22/10/2026 quedan pendientes de validación y se presentan en la próxima constancia conjunta (Anexo II). El registro de contactos, con persona, canal y motivo, consta en el Portafolio Digital.

Se descarta relevar al equipo completo mediante un cuestionario propio porque una declaración colectiva sobre un procedimiento deja sin recoger los episodios concretos de quien los vive (Anexo III, D-01). La limitación que introduce un informante único se declara en el apartado II.2.4.

### I.1.3 · Desencadenantes verificados y su evidencia

De los cinco desencadenantes considerados, el relevamiento verifica tres: disfunción operativa, oportunidad de negocio y presión competitiva.

#### a) Disfunción operativa

La cadena de permisos combina reglas nativas generales y propias del agente con las declaraciones globales y las del agente. La fusión y la última coincidencia descriptas en I.1.1 determinan el resultado (Anexo VI, A.VI.3).

La evidencia central es la declaración que OpenCode deja sin efecto y sin aviso. Una regla con ruta absoluta del árbol de trabajo se evalúa contra la ruta relativa y queda sin coincidencia. El comando `opencode debug` muestra la regla agregada sin evaluar si coincide con la acción; el agente puede tomar esa presencia como comprobación y declarar terminado el cambio (apartado I.3.2).

Tres reportes públicos anteriores a la medición describen reglas con rutas absolutas ignoradas sin aviso (ns-calvinwu, 2026; ouyangjian28, 2026; nlscott, 2026). La búsqueda complementaria del autor los identifica por título y lectura de los reportes en el repositorio de OpenCode, con un codificador. Se publican entre agosto y septiembre de 2026 y se verifican el 19/10/2026; su alcance es el de antecedentes individuales, con vigencia en 1.18.25 acreditada por la reproducción nativa (Anexo VI, A.VI.6).

La posición heredada de una clave al fusionar entradas y el `allow` global que debilita la protección nativa de `plan` integran el banco como N-1 y N-5. Ambos ejecutores resuelven esos problemas en la medición del autor del 20 y el 21/10/2026, con el arnés sobre el banco de I.3.2. Los resultados los distinguen del mecanismo de ruta absoluta que produce el éxito declarado falso (Anexo VI, A.VI.8).

La entrevista del 24/09/2026 aporta dos episodios vividos por la referente, una fuente independiente del autor. En el primero, se relata la invocación reiterada de un agente a sí mismo ante una configuración que no produce el efecto esperado. El segundo describe la operación de un agente a través de otro que, según el testimonio, incorpora la propia herramienta y cuya existencia y acciones posibles la referente desconoce. Faltan las configuraciones y las trazas necesarias para establecer las causas de ambos episodios y atribuirles un mecanismo de permisos. La existencia de los agentes internos del segundo episodio permanece pendiente de verificación propia (Anexo VI, A.VI.3, resultado 18). Los relatos tienen el valor de demanda declarada (Anexo VI, A.VI.5).

Las consecuencias acreditadas se circunscriben a la exposición y el bloqueo en escenarios controlados, y al consumo de tokens declarado por acciones repetidas, sin cuantificar ni atribuir por separado a cada episodio (apartado I.3.1).

Una propuesta de mejora para OpenAI Codex aporta otro antecedente de dificultad para conocer la configuración activa (Winning, 2026). Su autor describe que los usuarios la infieren a partir de síntomas, registros o inspección manual de archivos y solicita exponer la procedencia de cada valor efectivo. La propuesta enlaza siete incidencias del mismo repositorio y permanece abierta sin respuesta del equipo de mantenimiento al 1 de octubre de 2026. Es una solicitud individual, cuyo autor reúne esos antecedentes; su alcance es el de una señal de demanda.

#### b) Oportunidad de negocio

El relevamiento del estado del arte, con fecha de consulta 1 de octubre de 2026, se organiza en tres niveles. El primero reúne las soluciones que operan sobre el mismo objeto.

La ejecución propia de los trece comandos de introspección de OpenCode 1.18.25 identifica dos pertinentes: `opencode debug config` presenta la configuración fusionada sin el archivo de origen de cada valor. El comando `opencode debug agent` resuelve un agente y lista sus reglas en orden de evaluación. Su salida omite la distinción entre reglas nativas y declaradas y sus archivos de origen, y muestra las reglas sin evaluar la decisión para una acción concreta.

La versión 1.18.25 carga por defecto la skill `customize-opencode`, una instrucción dirigida al agente para crear y corregir la configuración del usuario, incluidas las reglas de permiso (OpenCode, 2026). El agente reconstruye la configuración desde los archivos con el modelo de precedencia simplificado de esa instrucción: «Project overrides global» y la última coincidencia para permisos. La línea de base del apartado I.3 mide si ese procedimiento logra el efecto que declara.

OpenCode Config Manager edita y valida la configuración, con el estado efectivo fuera de su cobertura (icysaintdx, 2026). Una extensión de Visual Studio Code para Claude Code informa valores por alcance, efectivos y sobrescritos, y detecta solapamientos y duplicados. Los valores implícitos, la procedencia por posición y la evaluación de una decisión quedan fuera de su cobertura (Onufriichuk, 2026).

Amp `permissions test` evalúa una acción e informa la regla coincidente y su alcance de origen, sin archivo ni posición de la declaración (Amp, s. f.). Codex `execpolicy check` evalúa comandos y devuelve la decisión y las reglas coincidentes, sin archivo ni posición; el resultado completo de las restricciones de sandbox y aprobación queda fuera de esa evaluación (OpenAI, 2026). El servidor de aplicación de Codex (`config/read`) informa la configuración efectiva con su origen por clave y capa, sin línea ni columna de la declaración ni decisión para una acción (OpenAI, 2026). Los escáneres de servidores MCP examinan riesgos de seguridad y los validadores de archivos de instrucciones revisan la calidad de su contenido.

En el nivel de funciones propuestas, Winning (2026) solicita un comando de solo lectura para la interfaz de línea de comandos de Codex. La propuesta detalla el directorio de configuración en uso, el proyecto y el perfil seleccionado. Se piden los valores efectivos de los campos más consultados y, para cada uno, la capa determinante y su archivo de origen. La coincidencia con el enfoque de RIGE aporta una señal independiente de su pertinencia. Al 1 de octubre de 2026, la propuesta sigue sin implementación en la interfaz de línea de comandos; la procedencia por clave y capa sí se ofrece mediante el servidor de aplicación de Codex.

Como precedentes de diseño se consideran las soluciones de otros dominios. Los sistemas de control de versiones informan el valor efectivo de cada opción junto con el archivo y el alcance que lo determinan. Los gestores de dependencias distinguen los valores declarados de los valores por defecto; las herramientas de análisis estático y los constructores de proyectos exponen la configuración efectiva aplicable. En materia de permisos, los simuladores de políticas de proveedores de infraestructura identifican la sentencia determinante y los motores de políticas devuelven la decisión con la traza de su evaluación. Al-Shaer y Hamed (2004) formalizan la anomalía de sombreado, uno de los mecanismos que deja una regla sin efecto, y proponen su detección sistemática.

La oportunidad reside en combinar la decisión con su regla determinante y la procedencia por declaración (entrada, archivo y posición). Se incluyen los valores implícitos, las declaraciones sin efecto y las referencias no resueltas. Se descarta situar el diferencial solo en la explicación de una decisión porque Amp y Codex ya ofrecen esa función (Anexo III, D-59).

#### c) Presión competitiva

La declaración de la referente sobre su equipo acredita este desencadenante como demanda declarada. En la entrevista del 29/08/2026, Valeria Areco informa que el equipo de Sistemas de EMSA tiene cinco integrantes e incorpora estas herramientas a comienzos de 2026. El relato refiere a ese equipo y recoge dos motivos jerarquizados por la informante. Uno es la actualización tecnológica frente a la adopción creciente en el sector; el determinante es sostener el volumen de trabajo comprometido sin ampliar la dotación (Anexo VI, A.VI.5). El crecimiento de los commits coautorados por agentes que registran Galster, Mohsenimofidi, Böhme et al. (2026), citado en I.1.1, aporta contexto sobre el universo observado. Dar por terminado un cambio sin verificar su efecto debilita la confianza en la delegación que motiva la adopción.

El detalle del contraste de soluciones de I.1.3 b) consta en el Anexo VI, A.VI.4.

### I.1.4 · Desencadenantes no verificados

Los dos desencadenantes restantes carecen de evidencia suficiente para integrar el origen del proyecto. La exigencia normativa de documentar, auditar o conservar esta configuración queda sin acreditar. La Ley N.º 25.326 de Protección de los Datos Personales alcanza a los datos personales registrados en la entrevista y la constancia; la configuración sobre la que opera la plataforma queda fuera de ese objeto.

La obsolescencia tecnológica se manifiesta en la frecuencia con que la herramienta publica nuevas versiones. Según el conteo propio de los metadatos de OpenCode, el equipo publica 227 versiones estables entre el 1 de enero y el 30 de septiembre de 2026. Las notas de publicación declaran cambios de configuración, permisos o agentes en 43 de ellas (anomalyco, s. f.-c; anomalyco, s. f.-d). El conteo usa el registro del productor, consultado el 1 de octubre de 2026 y sin auditoría independiente; las notas informan cambios cuya necesidad de readaptación de RIGE queda por determinar. El proyecto trata la obsolescencia tecnológica como riesgo, incluido en el registro de riesgos del Capítulo VI, y la mitiga mediante la versión fija declarada en el apartado I.1.1.

### I.1.5 · Desencadenante dominante y subordinación causal

Se declara dominante la disfunción operativa: una declaración queda sin efecto y sin aviso, y el agente da el cambio por hecho. El permiso efectivo difiere entonces del supuesto y produce exposición o bloqueo en los escenarios controlados del apartado I.3.1.

La oportunidad de negocio deriva de esa dificultad de verificación y de la combinación ausente en las soluciones relevadas, descripta en I.1.3 b). Una solución que cubra esa verificación satisface la demanda que abre la oportunidad. La sola identificación del nicho deja pendiente la comprobación del efecto de cada cambio.

La presión competitiva amplifica la necesidad de delegar el trabajo. Resolver la disfunción atenúa la presión sobre esa delegación al dar una base verificable a la confianza en el resultado. La presión externa por adoptar herramientas y sostener el volumen de trabajo permanece; su aumento, por sí mismo, deja pendiente la verificación del cambio.

El problema se enuncia sobre la disfunción operativa y la línea de base mide el éxito declarado falso del procedimiento delegado, con el costo como salvaguarda (apartado I.3).
