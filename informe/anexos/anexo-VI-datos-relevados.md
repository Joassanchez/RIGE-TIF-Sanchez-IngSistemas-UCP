# ANEXO VI · DATOS RELEVADOS

## A.VI.1 · Instrumento de medición: composición del banco

La unidad del instrumento y los criterios C1 a C5 de inclusión se describen en el apartado II.2.1.

El banco comprende 46 problemas: diez pedidos comunes de E1, 33 con mecanismo silencioso documentado de E2 y tres pedidos por síntoma de E4. La hoja queda cerrada el 19/10/2026; la admisión nativa vigente, realizada por el autor sin agente el 20/10/2026, reproduce 46 de 46 problemas con OpenCode y la batería vigente (banco, §§4.3.1 y 4.3.2; registro de la evidencia, A.VI.11). La Tabla A.VI.1 identifica cada problema; E4 se informa por separado de E2 para conservar la distinción entre un pedido preciso y su síntoma.

| **Código** | **Estrato** | **Tipo** | **Pedido resumido** | **Mecanismo silencioso documentado** |
|---|---|---|---|---|
| C-1 | E1 | Permiso | Pedir aprobación para editar | — |
| C-2 | E1 | Permiso | Permitir `npm run lint` | — |
| C-3 | E1 | Permiso | Denegar consultas web | — |
| C-4 | E1 | Permiso | Restablecer la edición de `build` | — |
| C-5 | E1 | Permiso | Pedir aprobación para `git commit` | — |
| C-6 | E1 | Permiso | Impedir la modificación por `revisor` | — |
| V-1 | E1 | Valor | Cambiar el modelo de `build` | — |
| V-2 | E1 | Valor | Fijar la temperatura de `plan` | — |
| V-3 | E1 | Valor | Cambiar la descripción de `build` | — |
| V-4 | E1 | Valor | Cambiar el modelo de `docs` | — |
| M-1 | E2 | Permiso | Permitir la lectura de `src/productos.js` | Regla `read` con ruta absoluta |
| M-2 | E2 | Permiso | Permitir la edición de `src/index.js` | Regla `edit` con ruta absoluta |
| M-3 | E2 | Permiso | Permitir `npm test` | Regla raíz frente a regla del agente |
| M-4 | E2 | Permiso | Denegar `git push` con argumentos | Patrón sin comodín que no cubre argumentos |
| M-5 | E2 | Permiso | Permitir leer `~/compartido` | `external_directory` frente a `read` |
| M-6 | E2 | Permiso | Permitir la edición de `revisor` | Agente en Markdown y en JSON |
| M-7 | E2 | Permiso | Pedir aprobación para `rm` | Orden de reglas con comodín |
| M-8 | E2 | Permiso | Denegar `git push` a `general` | Subagente con reglas propias |
| M-9 | E2 | Permiso | Pedir aprobación para `webfetch` | `OPENCODE_PERMISSION` frente a regla raíz |
| M-10 | E2 | Permiso | Permitir leer `.env` | Protección nativa y regla con ruta absoluta |
| N-1 | E2 | Permiso | Pedir aprobación para `npm test` | Posición heredada de la clave al fusionar |
| N-2 | E2 | Permiso | Permitir consultas web desde el directorio | `.opencode/` anidados |
| N-3 | E2 | Permiso | Permitir `npm test` a `auditor` | Misma clave en agente JSON y Markdown |
| N-4 | E2 | Permiso | Corregir la denegación de `git push` | `OPENCODE_PERMISSION` inválido descartado |
| N-5 | E2 | Permiso | Permitir editar a `build` y preservar `plan` | `allow` global que debilita a `plan` |
| N-6 | E2 | Permiso | Denegar `git push` y la lectura de `secretos.txt` | Claves PascalCase descartadas |
| N-7 | E2 | Permiso | Impedir obtener `secretos.txt` por cualquier vía | `read: deny` no gobierna `grep` ni `bash` |
| N-9 | E2 | Permiso | Denegar `git push` y preservar otros comandos | `tools` frente a `permission` |
| N-10 | E2 | Permiso | Denegar la skill `med11-interna` | `permission.skill` en el frontmatter |
| N-11 | E2 | Permiso | Pedir aprobación para `npm test` globalmente | Configuración global como enlace simbólico |
| N-12 | E2 | Permiso | Dejar a `build` en solo lectura | Lista de permitidos parcial con valores nativos |
| N-13 | E2 | Permiso | Impedir crear o sobrescribir `src/productos.js` | `write` consulta la regla de `edit` |
| N-14 | E2 | Permiso | Impedir leer las entradas de `privado` | `list: deny` no impide `read` del directorio |
| N-15 | E2 | Permiso | Corregir la denegación de edición | YAML inválido que descarta el endurecimiento |
| N-21 | E2 | Permiso | Denegar la lectura de `.env` | La documentación dice denegación, pero la herramienta pregunta |
| N-23 | E2 | Permiso | Denegar la lectura de `config/credenciales.json` | `deny` con ruta absoluta que nunca coincide |
| N-24 | E2 | Permiso | Denegar consultas web | `OPENCODE_CONFIG_CONTENT` frente a `.opencode/` |
| V-5 | E2 | Valor | Cambiar el modelo de `docs_global` | `OPENCODE_CONFIG` frente a un agente Markdown global |
| V-6 | E2 | Valor | Fijar la descripción de `build` | Sustitución `{env:VAR}` sin variable |
| V-7 | E2 | Valor | Fijar el prompt efectivo de `guia` | Prompt del frontmatter reemplazado por el cuerpo vacío |
| V-8 | E2 | Valor | Usar `reglas.md` como prompt de `guia` | `instructions` dentro de un agente no carga archivos |
| V-9 | E2 | Valor | Agregar una instrucción para todos los agentes | `.opencode/AGENTS.md` no se carga |
| V-10 | E2 | Valor | Configurar `API_TOKEN` del MCP `docs` | `env` en lugar de `environment` descartado |
| S-1 | E4 | Permiso | Restablecer la lectura de `src/productos.js` | Regla `read` con ruta absoluta, como M-1 |
| S-2 | E4 | Permiso | Pedir aprobación ante los borrados con `rm` | Orden de reglas con comodín, como M-7 |
| S-3 | E4 | Permiso | Pedir aprobación ante la ejecución de `npm test` | Posición heredada al fusionar, como N-1 |

*Tabla A.VI.1. Composición del banco. Fuente: banco, §§1 a 5, y hoja de tareas cerrada el 19/10/2026; admisión nativa del 20/10/2026 (registro de la evidencia, A.VI.11).*

Los retirados son N-8, por carecer de un inicializador determinista de aprobaciones persistidas; N-20, porque cerrar `bash` modifica diez sondas ajenas al objetivo; y N-22 y N-25, porque el comodín de `todowrite` y el patrón con `--`, respectivamente, funcionan en 1.18.25 y carecen del contraste requerido (banco, §§4.3.1 y 4.4; registro de la evidencia, A.VI.11).

El instrumento de atribución del 13/10/2026 y el de modificación del 14/10/2026 quedan como antecedentes, con sus datos en A.VI.8. La Tabla A.VI.2 conserva los 24 casos de atribución.

| **Código** | **Condición** | **Tipo** | **Pregunta resumida** |
|---|---|---|---|
| C-1a | Control | Valor | Modelo de `build` y archivo determinante. |
| C-1b | Control | Permiso | Decisión al usar `webfetch` con `build` y archivo determinante. |
| C-1c | Control | Valor | Temperatura de `plan` y archivo determinante. |
| C-1d | Control | Permiso | Decisión al modificar `src/productos.js` con `build` y archivo determinante. |
| C-1e | Control | Valor | Temperatura de `build` y archivo determinante. |
| C-1f | Control | Permiso | Decisión al leer `src/productos.js` con `build`, regla y archivo determinantes. |
| C-2a | Fusión | Valor | Modelo y temperatura de `build`, con el archivo de cada valor. |
| C-2b | Fusión | Valor | Modelo de `docs` al trabajar desde `sub/` y archivo determinante. |
| C-2c | Fusión | Valor | Modelo y temperatura de `revisor`, con la procedencia de cada valor. |
| C-2d | Fusión | Valor | Modelo de `build` y archivo determinante entre los globales. |
| C-2e | Fusión | Valor | Modelo de `build` y entrada determinante. |
| C-2f | Fusión | Valor | Modelo y temperatura de `build`, con la entrada y el archivo de cada valor. |
| C-3a | Implícito | Valor | Modelo de `plan` y procedencia del valor. |
| C-3b | Implícito | Permiso | Decisión al leer `.env` con `build` y regla determinante. |
| C-3c | Implícito | Valor | Modelo de `build` y procedencia del valor sustituido. |
| C-3d | Implícito | Permiso | Decisión al modificar `README.md` con `plan` y regla determinante. |
| C-3e | Implícito | Valor | Descripción efectiva de `plan` y procedencia de ese valor. |
| C-3f | Implícito | Permiso | Decisión para `git status` en el subagente `general` lanzado por `build` y regla determinante. |
| C-4a | Permisos combinados | Permiso | Decisión para `git status` con `build` y regla determinante. |
| C-4b | Permisos combinados | Permiso | Decisión para `git diff` con `build` y regla determinante. |
| C-4c | Permisos combinados | Permiso | Decisión al modificar `src/index.js` con `plan` y regla determinante. |
| C-4d | Permisos combinados | Permiso | Decisión para `npm install` con `build` y regla determinante. |
| C-4e | Permisos combinados | Permiso | Decisiones para `webfetch` y edición de `src/productos.js` con `build`, con la regla y entrada de cada una. |
| C-4f | Permisos combinados | Permiso | Decisión al modificar `src/productos.js` con `build`, regla y entrada determinantes. |

*Tabla A.VI.2. Casos de atribución (antecedente). Fuente: elaboración propia sobre la hoja de respuestas de atribución, cerrada el 13/10/2026 (registro de la evidencia, A.VI.11).*

## A.VI.2 · Ejecución de la medición

El autor es responsable de la medición y utiliza un asistente de programación como herramienta de apoyo para operar el arnés y producir los registros de ejecución. La medición utiliza la imagen `rige-linea-base:1.18.25`, identificador `a691196f0e3e`, con `build` y Charles, ambos con `gpt-6.1-sol`, k = 3, semilla 20261015 y límite de 600 s por ejecución. Charles es la variante del agente de la referente descrita en el Anexo III, D-41. Cada ejecución parte del escenario restaurado y de una sesión nueva. Las tareas se barajan con la semilla y se reparten en cuatro contenedores, cada tarea en uno solo con sus tres repeticiones; cada contenedor baraja sus pares con la misma semilla (ADR-098, punto 2).

El brazo base se describe en el apartado II.2.1. Las pruebas con `opencode run` se realizan mediante `como-dev`, con el catálogo congelado y dentro del límite de la ejecución. La raíz del proyecto tiene escritura de grupo y *sticky bit*, lo que permite crear archivos y carpetas y protege los existentes del desarrollador frente al borrado o renombrado (ADR-098, punto 3).

La Tabla A.VI.3 registra las seis tandas coordinadas por el autor, sobre los problemas y el corpus del repositorio, el 20 y el 21/10/2026. El conjunto comprende 402 ejecuciones válidas.

| **Tanda** | **Fecha (Argentina)** | **Franja horaria** | **Ejecuciones válidas** | **Incidencias** |
|---|---|---|---|---|
| Ecológica, `build` | 20/10/2026 | 19:45:54 a 23:31:01 | 138 | Completa. |
| Ecológica, Charles | 20 y 21/10/2026 | 23:34:56 a 02:45:17; continuación 04:12:21 a 05:32:44 | 138 | Corte de cuota con 116/138; 22 pares pendientes completados con `--pares`. |
| Detección, `build` | 21/10/2026 | 05:32:44 a 05:47:10 | 33 | Completa. |
| Detección, Charles | 21/10/2026 | 05:47:10 a 06:06:03 | 33 | Completa. |
| Contraste, `build` | 21/10/2026 | 06:06:03 a 06:38:52; continuación 09:20:52 a 10:57:03 | 30 | Corte de cuota con 3/30; 27 pares pendientes completados con `--pares`. |
| Contraste, Charles | 21/10/2026 | 10:57:04 a 12:28:45; repetición 12:29:39 a 12:38:48 | 30 | M-8:1 incompleta, repetida una vez; se conserva la original. |

*Tabla A.VI.3. Tandas de la línea de base. Fuente: estado de tanda y documento de lectura de la medición del 20 y el 21/10/2026 (registro de la evidencia, A.VI.11). Las marcas UTC del registro se convierten a hora de Argentina (UTC−3).*

La primera tanda se detiene en la fase base, antes de ejecutar agentes, por el defecto de reparto del Contexto 13 de ADR-098. El ensayo final se repite tras MED-14 y MED-16; ambos ensayos reproducen los resultados de las 42 y las cinco ejecuciones de comprobación que registra el documento de lectura de la medición. Los fragmentos cortados por cuota se aceptan por la equivalencia entre sus controles iniciales y los controles inicial y final de la continuación (Contexto 15). Las tandas superan la parada temprana de integridad, tokens y credencial prevista en el punto 2.

La Tabla A.VI.4 sintetiza las mediciones anteriores ejecutadas por el autor el 13 y el 14/10/2026, con tres repeticiones por caso y ejecutor, y sus consecuencias para el diseño.

| **Medición** | **Fecha** | **Ejecutores** | **Ejecuciones** | **Resultado** | **Consecuencia** |
|---|---|---|---|---|---|
| Atribución | 13/10/2026 (`build` y Charles) y 14/10/2026 (P3) | `build` y Charles con `gpt-6.1-sol`; P3: `build` con `gpt-5.6-luna` | 72 por tanda, 24 casos por tres repeticiones; 54 consultas de C-2 a C-4 por tanda | `build`: 0/54 errores en C-2 a C-4, «Refuta», y cero errores en C-1; Charles: 2/54 en C-4e, un caso con problema (dos errores de tres); P3: 2/54 en C-2b y C-4e, ningún caso con problema. Charles y P3: «Confirma» en IV.3. | Reorientación hacia la verificabilidad del efecto de la configuración (apartado IV.3; ADR-090). |
| Modificación | 14/10/2026 | `build` y Charles con `gpt-6.1-sol` | 144, 24 casos por tres repeticiones y dos ejecutores | 16 sin efecto, ocho por ejecutor, con éxito declarado falso y regla con ruta absoluta; medición inválida por los controles C-1f (tres errores de tres en ambos ejecutores). | Hallazgo de la ruta absoluta, base del banco y de ADR-088; se conserva como informe descriptivo. |
| Sondas R y E | 14/10/2026 | `build` y Charles con `gpt-6.1-sol` | R: 12, dos casos por tres repeticiones y dos ejecutores; E: 24, cuatro casos por tres repeticiones y dos ejecutores | R: 12/12 correctas; E: 13/24 sin efecto, todos con regla con ruta absoluta y éxito declarado falso. | R vincula la falla bajo el criterio estricto con la redacción; E muestra la persistencia de la ruta absoluta al retirarla de la instrucción, en los casos seleccionados y con el ejecutor fuera del árbol. |

*Tabla A.VI.4. Síntesis de las mediciones anteriores. Fuente: elaboración propia sobre la adjudicación del autor y los análisis de atribución, modificación y sondas R y E y P3 del 14/10/2026 (registro de la evidencia, A.VI.11); reglas de ejecución en ADR-098, «Antecedentes absorbidos».*

Por decisión del autor del 14/10/2026, las sondas se ejecutan ese día antes de P3. Sus carpetas registran la fecha real; sus nombres internos y semilla conservan la fecha prevista originalmente, 20261021. La variación del orden y la recuperación por conectividad constan en el registro de las sondas y en ADR-098, «Antecedentes absorbidos» (Anexo III, D-41).

## A.VI.3 · Relevamiento técnico de OpenCode 1.18.25

El relevamiento técnico completo de OpenCode 1.18.25 consta en el registro de la evidencia (A.VI.11). Sostiene las afirmaciones de los apartados I.1.1, I.1.3, I.6.2 y II.6.1, y se sintetiza aquí en sus resultados verificados.

| **N.º** | **Resultado verificado**                                                                                                                                                                                                         | **Método**                                                                                              | **Estado**                                                                             |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| 1       | La configuración efectiva se construye aplicando hasta doce entradas sucesivas, cuatro de las cuales no son archivos                                                                                                             | Lectura del cargador de configuración en el código fuente del tag correspondiente                       | Verificado                                                                             |
| 2       | La documentación oficial de la versión describe un conjunto menor de entradas y omite el criterio de resolución de permisos                                                                                                       | Contraste entre la documentación del tag y el código                                                    | Verificado                                                                             |
| 3       | La fusión es profunda: dos entradas que declaran el mismo elemento combinan sus claves y producen un objeto que no consta en ningún archivo                                                                                      | Ejecución de escenarios controlados                                                                     | Verificado                                                                             |
| 4       | La precedencia entre los directorios propios de la herramienta se comporta de manera inversa a la de los archivos del proyecto                                                                                                   | Ejecución de escenarios controlados; concordante con incidencias de terceros                            | Verificado                                                                             |
| 5       | Los permisos se resuelven como lista ordenada de reglas en la que decide la última coincidencia, sin criterio de especificidad                                                                                                   | Lectura del evaluador de permisos y ejecución de escenarios                                             | Verificado                                                                             |
| 6       | Al fusionar dos entradas, la posición de una clave la fija la primera que la declara y su valor la última                                                                                                                        | Ejecución de los dos escenarios simétricos del apartado I.1.3                                           | Verificado                                                                             |
| 7       | Las reglas declaradas por el usuario se concatenan después de las nativas, de modo que una declaración amplia desactiva una protección nativa                                                                                    | Ejecución de escenario controlado; concordante con incidencia de terceros                               | Verificado                                                                             |
| 8       | Una regla de denegación con patrón general oculta la herramienta al modelo, en lugar de limitarse a denegar la acción                                                                                                            | Ejecución de escenario controlado                                                                       | Verificado                                                                             |
| 9       | La herramienta expone trece comandos de introspección; ninguno informa el archivo de origen de un valor ni evalúa una decisión para una acción concreta                                                                          | Ejecución de la familia completa de comandos y análisis de sus salidas                                  | Verificado                                                                             |
| 10      | El repositorio contiene dos motores de evaluación de permisos; en la versión 1.18.25 la decisión la produce el segundo de ellos, mientras que el comando de resolución por agente presenta las reglas con el formato del primero | Lectura de ambos motores y captura de los eventos de permiso emitidos en ejecución                      | Verificado                                                                             |
| 11      | Una aprobación permanente conserva el texto literal de la acción aprobada, subsiste entre sesiones y no revierte una denegación declarada, que constituye la única decisión que ninguna aprobación vence                         | Ejecución con agente real y verificación del registro persistido                                        | Verificado; corrige el resultado informado en la versión anterior de este relevamiento |
| 12      | El subagente se rige por su propio conjunto de reglas, más las denegaciones de task y todowrite; las reglas del agente que lo lanza no se le aplican                                                                             | Lectura del armado de permisos de subagentes en el código del tag 1.18.25 y ejecución de escenario controlado; la ejecución del 13/10/2026 corrige la lectura anterior, que confundía las reglas de la sesión con las del agente (ADR-081) | Verificado                                                                             |
| 13      | Una sustitución que referencia una variable de entorno no definida se reemplaza por una cadena vacía sin advertencia                                                                                                             | Ejecución de escenario controlado                                                                       | Verificado                                                                             |
| 14      | Una variable de entorno de configuración con contenido inválido se descarta sin error visible; el descarte solo consta en el archivo de registro                                                                                 | Ejecución de escenario controlado con registro activado                                                 | Verificado                                                                             |
| 15      | El comando de terminal se descompone en un árbol sintáctico y genera un recurso por sub-comando, de modo que una denegación que alcance a cualquiera de ellos deniega el comando completo                                        | Ejecución de escenarios con encadenamiento, tubería, secuencia y subshell, con verificación sobre disco | Verificado                                                                             |
| 16      | Las instrucciones de contexto declaradas en subdirectorios se incorporan durante la sesión, según los archivos que el agente lee, y no constituyen un dato estático de la configuración                                          | Ejecución con agente real                                                                               | Verificado                                                                             |
| 17      | El conjunto de herramientas ofrecido para un mismo agente y proyecto difiere según el modo de ejecución de la herramienta                                                                                                        | Ejecución comparada en ambos modos                                                                      | Verificado                                                                             |
| 18      | Existencia de agentes que la herramienta invoca internamente sin declaración del usuario, y alcance de las acciones que pueden ejecutar                                                                                          | Reportado por el referente en A.VI.5; verificación propia pendiente                                      | Pendiente                                                                              |
| 19      | Comportamiento de la frontera de directorio desde la herramienta de terminal en Ubuntu                                                                                                                                           | Verificado en otra plataforma; reproducción pendiente                                                   | Pendiente                                                                              |
| 20      | Posibilidad de que un plugin modifique la configuración fusionada en tiempo de carga                                                                                                                                             | —                                                                                                       | Pendiente, fuera del alcance declarado en I.6.5                                        |
| 21      | Comportamiento de la configuración administrada y de la configuración remota                                                                                                                                                     | —                                                                                                       | Pendiente, fuera del alcance declarado en I.6.5                                        |
| 22 | La configuración global admite tres archivos, config.json, opencode.json y opencode.jsonc, que se fusionan en ese orden; el criterio del primer archivo que exista rige solo para crear el archivo inicial | Lectura del cargador de la configuración global en el código fuente del tag correspondiente | Verificado en el código; verificación en ejecución pendiente |
| 23 | Al arrancar, la herramienta escribe en los directorios de configuración: crea el archivo global si no existe, agrega un archivo .gitignore e instala el paquete \@opencode-ai/plugin | Lectura del cargador de la configuración en el código fuente del tag correspondiente | Verificado en el código; verificación en ejecución pendiente |

*Tabla A.VI.5. Resultados del relevamiento técnico. Fuente: elaboración propia.*

Dos observaciones sobre la composición de la tabla. El resultado n.º 11 corrige una afirmación de la versión anterior de este relevamiento, que sostenía que una aprobación de sesión prevalecía sobre una denegación declarada. Esa lectura provenía del motor que el resultado n.º 10 identifica como no vigente en la versión analizada, y la ejecución con un agente real la desmiente. La corrección se consigna de manera expresa, y no en silencio, porque ilustra el criterio que gobierna todo el relevamiento: leer el código del tag correcto no acredita el comportamiento de la herramienta si no se ejecuta.

El resultado n.º 18 se incorpora a partir de la entrevista y no del relevamiento técnico, y se consigna como pendiente de verificación propia. Su comprobación es condición para sostener la inclusión de los elementos nativos declarada en el apartado I.6.1, y se ejecuta con el mismo procedimiento reproducible que los resultados 1 a 17.

Los resultados n.º 22 y 23 se incorporan después de la entrega del AE1, al construir el prototipo v1, y no alteran el recuento del resultado n.º 1: la configuración global constituye una sola entrada, integrada por hasta tres archivos.

**Procedimiento reproducible.** Los escenarios se ejecutan sobre un directorio de usuario aislado mediante la sustitución de la variable de entorno correspondiente, con un proyecto de prueba vacío y sin plugins, de modo que la única configuración presente sea la del escenario. Cada ejecución registra el comando, la salida completa y la fecha. El procedimiento y los escenarios constan en el documento completo. Dado que la herramienta escribe en los directorios de configuración al arrancar (resultado n.º 23), cada reproducción de un escenario parte de una copia que ninguna ejecución anterior modificó.

## A.VI.4 · Nómina del estado del arte

La fecha de consulta es el 01/10/2026; esta nómina actualiza el relevamiento del 17/09/2026. Se incluyen soluciones que cumplen tres condiciones: están publicadas y son utilizables, operan sobre la configuración de una herramienta de programación basada en agentes y cuentan con evidencia verificable en documentación oficial, README o página del paquete. Las funciones de Amp y de Codex que evalúan una acción se verifican, además, en su documentación oficial.

Se incluyen 33 soluciones: cinco sobre OpenCode (nivel 1a) y 28 sobre otras herramientas (nivel 1b). El recuento corresponde al conjunto documental que cumple las condiciones de inclusión al 01/10/2026, sin pretensión de exhaustividad universal. El nivel 2 conserva una señal de demanda y el nivel 3, los precedentes maduros, ambos fuera de ese recuento.

La posición expresa el eje horizontal y el vertical, en ese orden. El horizontal distingue declaraciones o validación (0), resultado efectivo o fusionado (1), valores o reglas en orden de evaluación (2), y decisión para una acción con su regla determinante (3). El vertical distingue ausencia de procedencia (0), alcance o capa (1), y declaración con entrada, archivo y posición (2). La posición de un diagnóstico no equivale a la procedencia de un valor efectivo.

| **Nivel** | **Solución** | **Opera sobre** | **Qué informa** | **Qué no informa** | **Posición (eje horizontal, eje vertical)** |
|---|---|---|---|---|---|
| 1a · Sobre OpenCode | OpenCode `debug config` (OpenCode, 2026) | OpenCode | Configuración resuelta, serializada como JSON | Procedencia, declaraciones desplazadas, explicación de valores implícitos de agentes y decisión de permisos | (1, 0) |
| 1a · Sobre OpenCode | OpenCode `debug agent <nombre>` (OpenCode, 2026) | OpenCode | Agente resuelto, permisos y disponibilidad de herramientas; incorpora valores nativos | Archivo y posición; separación completa entre declarado e implícito; simulación explicativa con regla determinante | (2, 0) |
| 1a · Sobre OpenCode | OpenCode Config Manager (OCCM) (icysaintdx, 2026) | OpenCode | Edición y validación de proveedores, modelos, agentes, MCP, permisos y otros archivos | Estado efectivo de la herramienta en ejecución, procedencia de cada valor, implícitos y evaluación explicada de acciones | (0, 0) |
| 1a · Sobre OpenCode | CC Switch (JasonYoung, 2026) | OpenCode, Claude Code, Codex, Gemini y otros | Gestión de proveedores, MCP, instrucciones y skills; sincronización | Resolución explicada de la herramienta en ejecución; implícitos y evaluación nativa de permisos | (0, 0) |
| 1a · Sobre OpenCode | agnix (agent-sh, 2026) | Instrucciones y configuración de múltiples agentes, incluido OpenCode | Diagnósticos con archivo y posición, reglas de validación y algunos conflictos entre archivos | Resolución del estado efectivo y vinculación entre una declaración y una decisión nativa | (0, 0) |
| 1b · Sobre otras herramientas | Amp `permissions test` (Amp, s. f.) | Amp | Acción resultante, índice de regla coincidente y alcance de origen; reglas evaluadas secuencialmente | Procedencia por archivo y posición; explicación integral de toda la configuración y sus implícitos | (3, 1) |
| 1b · Sobre otras herramientas | Codex `execpolicy check` (OpenAI, 2026) | Reglas de ejecución de Codex | Decisión para un comando y reglas coincidentes; prevalece la decisión más restrictiva | Resultado completo que combine todas las restricciones de sandbox y aprobación; archivo y posición de cada regla | (3, 0) |
| 1b · Sobre otras herramientas | Claude Code Config Manager (Onufriichuk, 2026) | Claude Code | Valores por alcance, efectivos y sobrescritos; permisos; detección de solapamientos y duplicados | Cobertura completa de implícitos; decisión hipotética; procedencia completa por posición; orden nativo de evaluación de permisos no acreditado | (1, 1) |
| 1b · Sobre otras herramientas | Claude Code `/config`, `/status`, `/permissions`, `/mcp`, `/hooks` (Anthropic, 2026) | Claude Code | Preferencias actuales, estado de sesión, reglas y alcances, servidores y hooks | Explicación unificada de toda la configuración; procedencia por posición; simulador general con regla determinante | (1, 1) |
| 1b · Sobre otras herramientas | Codex app-server `config/read` (OpenAI, 2026) | Codex | Configuración efectiva, `origins` por clave y capas opcionales; fuentes y precedencias | línea y columna de la declaración; explicación completa de todos los implícitos; decisión para una acción | (1, 1) |
| 1b · Sobre otras herramientas | Cursor: reglas activas (Cursor, s. f.) | Cursor | Instrucciones activas y distinción entre reglas de proyecto y usuario | Fusión explicada de toda la configuración, implícitos y permisos con regla determinante | (1, 1) |
| 1b · Sobre otras herramientas | Copilot en VS Code: Chat Debug y Agent Debug Logs (Microsoft, s. f.-a) | Copilot en VS Code | Contexto enviado, instrucciones descubiertas, aplicadas u omitidas, archivos y herramientas de solicitudes | Procedencia por posición de valores efectivos; evaluación general de permisos con regla determinante | (1, 1) |
| 1b · Sobre otras herramientas | Aider `/settings` y salida detallada (Gauthier, 2026) | Aider | Ajustes actuales y archivos de configuración cargados | Atribución de cada valor a una declaración; reglas de permisos y decisiones explicadas | (1, 1) |
| 1b · Sobre otras herramientas | Gemini CLI `/settings`, `/policies`, `/memory show`, `/mcp` (Google, 2026) | Gemini CLI | Ajustes actuales, políticas activas, instrucciones concatenadas y estado MCP | Procedencia por declaración; política determinante para una acción; orden de evaluación demostrado por la interfaz | (1, 0) |
| 1b · Sobre otras herramientas | Cline: configuración MCP (Cline, s. f.) | Cline | Configuración e inventario MCP mediante interfaz y CLI | Resolución integral de configuración, procedencia e interpretación de permisos | (1, 0) |
| 1b · Sobre otras herramientas | Goose: gestión de extensiones (AAIF Goose, 2026) | Goose | Extensiones habilitadas, herramientas y configuración asociada | Resolución integral con procedencia; implícitos; regla determinante de una acción | (1, 0) |
| 1b · Sobre otras herramientas | Roo Code: gestión y exportación de ajustes (Roo Code Inc., 2026) | Roo Code | Ajustes, perfiles de proveedores y opciones exportables | Fusión explicada entre alcances; implícitos; decisión de permisos y declaración determinante | (0, 0) |
| 1b · Sobre otras herramientas | Kilo Code: ajustes de proveedores y configuración (Kilo Org, 2026) | Kilo Code | Gestión de proveedores y elementos configurables del agente | Inspector documentado de procedencia, configuración efectiva integral o permisos determinantes | (0, 0) |
| 1b · Sobre otras herramientas | Continue: configuración YAML (Continue, 2026) | Continue | Modelos, reglas y servidores MCP declarados; edición y recarga | Explicación del estado efectivo, procedencia, implícitos y decisiones de permisos | (0, 0) |
| 1b · Sobre otras herramientas | Crush: configuración y permisos (Charmbracelet, 2026) | Crush | Configuración y gestión de permisos declarados | Simulación explicativa de acciones; procedencia del valor efectivo por archivo y posición | (0, 0) |
| 1b · Sobre otras herramientas | Rulesync (dyoshikawa, 2026) | Diversos agentes | generación y sincronización de instrucciones, MCP, agentes, skills y permisos | Estado realmente cargado por cada herramienta en ejecución, procedencia de valores efectivos y decisiones | (0, 0) |
| 1b · Sobre otras herramientas | RuleSync (juwonllee2024-dotcom, 2026) | Claude, Cursor, Copilot y otros | Compilación, lint, diferencias, huellas de archivos y predicción de aplicabilidad de reglas canónicas | Estado efectivo del agente; semántica nativa completa de permisos; procedencia de decisiones | (0, 0) |
| 1b · Sobre otras herramientas | Snyk Agent Scan (Snyk, 2026) | Configuración de agentes, MCP y skills | Descubrimiento y riesgos de seguridad: inyección, herramientas peligrosas y cambios sospechosos | Configuración efectiva, implícitos y permisos nativos con regla determinante | (0, 0) |
| 1b · Sobre otras herramientas | agent-bom (Saad, 2026) | Agentes y servidores MCP | Inventario y relaciones entre agentes, servidores, herramientas, paquetes, vulnerabilidades y credenciales | Fusión de configuración y evaluación de permisos de la herramienta en ejecución | (0, 0) |
| 1b · Sobre otras herramientas | Ramparts (Highflame AI, 2026) | MCP y skills de agentes | Riesgos, dependencias y análisis de herramientas, recursos, prompts y skills | Estado efectivo integral; procedencia y reglas nativas determinantes | (0, 0) |
| 1b · Sobre otras herramientas | AI Context Inspector (cocaxcode, s. f.) | Múltiples agentes | Inventario de configuración, MCP, skills e instrucciones; reportes y exportación | Configuración efectiva según cada herramienta en ejecución; implícitos; decisión de permisos | (0, 0) |
| 1b · Sobre otras herramientas | Context Editor (piratf, s. f.) | Claude Code y Gemini | Navegación de archivos por entorno y proyecto | Valor ganador, implícitos, procedencia por declaración y decisiones de permisos | (0, 0) |
| 1b · Sobre otras herramientas | Markr (ApptwareLabs Pvt. Ltd., s. f.) | instrucciones y configuración de múltiples agentes | Editor, plantillas, vista previa y conteo de tokens | Resolución efectiva, procedencia y evaluación nativa de permisos | (0, 0) |
| 1b · Sobre otras herramientas | Claude Code Navigator (broker4develop, s. f.) | Claude Code | Árbol de ajustes, MCP, hooks, skills y navegación | Fusión explicada, implícitos y regla determinante de acciones | (0, 0) |
| 1b · Sobre otras herramientas | AgentLint (`@agent-lint/cli`) (samilozturk, s. f.) | Archivos de contexto e instrucciones | Calidad, referencias, conflictos y puntuaciones | Estado efectivo de la herramienta en ejecución, procedencia y permisos evaluados | (0, 0) |
| 1b · Sobre otras herramientas | agentlint (`@agentlinthq/cli`) (agentlint, 2026) | Repositorios preparados para agentes | Comprobaciones de artefactos y preparación del contexto | Fusión de configuración, implícitos y explicación de permisos | (0, 0) |
| 1b · Sobre otras herramientas | `leporis-agentlint` (Leporis14, 2026) | Configuración MCP | Comprobaciones estáticas de secretos, acceso amplio y campos de aprobación | Semántica nativa de permisos; estado efectivo y regla determinante | (0, 0) |
| 1b · Sobre otras herramientas | `agents-md-lint` y `agents-md-migrate` (Taiizor, 2026) | AGENTS.md e instrucciones de otros agentes | Validación y migración de instrucciones | Estado efectivo, procedencia y evaluación de permisos | (0, 0) |
| 2 · Señal de demanda | Comando de procedencia propuesto para Codex (Winning, 2026) | Codex | Propone informar directorio, proyecto, perfil, valores efectivos y capa determinante con su archivo | Incidencia n.º 26255 abierta y sin implementación al 01/10/2026 | No corresponde (propuesta) |
| 3 · Precedente maduro | Resolución de configuración con origen en sistemas de control de versiones | Otros dominios | Valor efectivo, archivo y alcance que lo determinan | Precedente de diseño; no opera sobre herramientas agénticas | Fuera del mapa |
| 3 · Precedente maduro | Simuladores de políticas de acceso de proveedores de infraestructura | Otros dominios | Decisión para un sujeto y una acción, con la sentencia determinante | Precedente de diseño; no opera sobre herramientas agénticas | Fuera del mapa |
| 3 · Precedente maduro | Motores de políticas con explicación de la evaluación | Otros dominios | Decisión acompañada de la traza que la produce | Precedente de diseño; no opera sobre herramientas agénticas | Fuera del mapa |
| 3 · Precedente maduro | Comandos de configuración efectiva de herramientas de análisis estático, compiladores y constructores de proyectos | Otros dominios | Configuración resultante de la herencia entre descriptores | Precedente de diseño; no opera sobre herramientas agénticas | Fuera del mapa |

*Tabla A.VI.6. Nómina del estado del arte por nivel. Fuente: documentación oficial, README o página del paquete de cada solución; prueba directa del 17/09/2026 para los comandos nativos de OpenCode, OCCM y la extensión para Claude Code.*

**Condición de vigencia.** El relevamiento corresponde al 01/10/2026, sobre un conjunto de herramientas de ritmo de cambio alto. Se revisa antes de la defensa y toda incorporación se registra con su fecha.

## A.VI.5 · Entrevista semiestructurada al referente técnico

| **Campo**                                        | **Contenido**                                                                                                                                                             |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Persona entrevistada                             | Valeria Areco                                                                                                                                                             |
| Rol                                              | Desarrolladora del equipo de Sistemas de Electricidad de Misiones S. A.                                                                                                   |
| Composición del equipo                           | Cinco integrantes                                                                                                                                                         |
| Canal                                            | Presencial en ambas entrevistas, de modalidad semiestructurada |
| Fecha                                            | 29/08/2026 y 24/09/2026; constancia firmada el 15/10/2026 |
| Duración                                         | Aproximadamente 30 minutos por entrevista |
| Motivo declarado                                 | Verificar la presencia del problema en la práctica del equipo, obtener los parámetros de valoración y registrar las preguntas que el desarrollador formula en su práctica |
| Consentimiento                                   | [DATO PENDIENTE: constancia explícita de consentimiento para las entrevistas] |
| Autorización para identificarla con nombre y rol | [DATO PENDIENTE: autorización explícita para publicar nombre y rol] |
| Registro                                         | Entrevista del 29/08: respuestas registradas por el autor en el informe de la AE1. Entrevista del 24/09: registro en II.3.3 del informe de la AE2. Ambas carecen de grabación; la reconstrucción del 15/10/2026 incorpora la memoria del autor y la confirmación de la referente |

*Tabla A.VI.7. Datos de la entrevista. Fuente: elaboración propia.*

**Guía de entrevista aplicada.** Las preguntas se ordenan de lo general a lo particular y evitan sugerir la respuesta esperada. Se registran en el orden efectivamente aplicado: (1) herramientas de programación asistida que el equipo utiliza y desde cuándo; (2) motivo por el cual el equipo las incorporó; (3) quién configura el entorno de cada desarrollador y con qué criterio; (4) situaciones en que el comportamiento del agente difirió de lo previsto, con relato de un caso concreto; (5) procedimiento seguido para averiguar qué configuración regía en ese caso y tiempo aproximado que demandó; (6) recursos y soluciones propias que el equipo construyó para resolver estas consultas; (7) frecuencia con que se presentan consultas de esta clase; (8) valor de referencia de la hora de trabajo de desarrollo y su origen; (9) consecuencias observadas cuando la respuesta resultó incorrecta.

El registro disponible es la constancia de entrevistas, versión 1, firmada por Valeria Areco el 15/10/2026. Se reconstruye a partir de los informes de la AE1 y la AE2 y de la memoria del autor; la referente confirma las afirmaciones. La versión 2 ratifica las secciones de entrevistas y agrega la segunda extensión del acta de validación. Ambas constancias figuran en el registro de fuentes.

La entrevista del 29/08/2026 aplica un guion de siete preguntas y presenta la maqueta v0. La del 24/09/2026 corresponde a una charla de seguimiento sin guion fijo. La constancia firmada respalda la utilidad de identificar el archivo que determina cada valor efectivo; carece de una descripción de revisión de archivos uno por uno.

Como consecuencia del comportamiento inesperado, se registra consumo de tokens por acciones repetidas, sin cuantificación ni atribución por separado a cada episodio. La constancia tampoco registra exposición de información ni bloqueo acreditados en esos episodios.

**Síntesis de lo declarado y de lo observado.** El contenido sustantivo de la entrevista se presenta, sin interpretación, en el apartado II.3.3 del cuerpo del informe, y comprende: composición del equipo y motivo de adopción de las herramientas; frecuencia declarada de acceso a los archivos de configuración y su tendencia; procedimiento habitual de resolución; dos episodios de comportamiento distinto del esperado; tres prácticas propias relatadas por la informante; dos vías de consumo de tokens atribuibles a la configuración; y la respuesta al enfoque presentado.

**Formulaciones textuales del informante.** Se conservan sin reformular, dado que constituyen el insumo del prototipo v0 conforme al apartado I.6.6.

| **N.º** | **Formulación registrada** | **Pantalla del prototipo que la responde** |
|---------|----------------------------|--------------------------------------------|
| 1       | \[ \]                      | \[ \]                                      |
| 2       | \[ \]                      | \[ \]                                      |
| 3       | \[ \]                      | \[ \]                                      |

*Tabla A.VI.8. Preguntas que el informante formula en su práctica. Fuente: elaboración propia sobre el registro de la entrevista.*

**Ficha de datos cuantitativos.** Los dos datos cuantitativos que la entrevista aporta se consignan con las tres preguntas respondidas junto al dato.

| **Campo**                           | **F · Frecuencia**                                                                                                  | **P-2 · Consumo de tokens**                                                                                                                                                                   |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Dato                                | 5 accesos semanales a los archivos de configuración                                                                 | \[ \]                                                                                                                                                                                         |
| Definición del evento               | Acceso a los archivos de configuración; el informante precisa que en general se trata de consultas menores          | Tokens consumidos por dos vías: consulta del propio entorno mediante un agente de permisos elevados, y repetición de acciones cuyo resultado no se correspondió con la configuración esperada |
| Quién lo produjo                    | Valeria Areco, sobre su propia práctica                                                                             | Valeria Areco, sobre su propia práctica                                                                                                                                                       |
| Con qué método y sobre qué universo | Estimación retrospectiva, sin registro documental de respaldo; universo de una desarrolladora en un equipo de cinco | Relato de la informante sobre un gasto ya incurrido, sin registro de respaldo |
| Para qué período de referencia      | \[ \]                                                                                                               | \[ \]                                                                                                                                                                                         |
| Condición probatoria                | Demanda declarada                                                                                                   | Demanda declarada: relato de un gasto incurrido, sin constancia ni cuantificación |
| Sesgos y límites declarados         | Recuerdo retrospectivo; informante único; tendencia decreciente declarada por el propio informante                  | Magnitud no cuantificada                                                                                                                                                                      |

*Tabla A.VI.9. Datos cuantitativos obtenidos en la entrevista, con las tres preguntas respondidas. Fuente: elaboración propia.*

**Datos que la entrevista no aporta.** La referente informa un valor horario estimativo y después pide que no se cite; el proyecto no lo usa. La proporción de sus accesos semanales que exige una resolución comparable a la que mide la línea de base queda sin informar. El valor horario y esa proporción quedan sin sustituir por estimaciones propias, conforme a la decisión del apartado I.3.1.

La entrevista constituye un instrumento de relevamiento distinto de la medición con agentes (apartado II.2.4).

La fecha, la maqueta presentada y el resultado de la validación del prototipo v0 y de su reformulación constan en el Anexo II, A.II.2.

## A.VI.6 · Relevamiento documental de incidencias del repositorio de OpenCode

**Criterio de búsqueda, registrado antes del conteo.** Se admiten las incidencias cuyo título combina un término relativo al comportamiento de la configuración con el término que designa la configuración, sobre la totalidad del historial público del repositorio. La restricción al título obedece a la escala del repositorio y produce subcobertura, declarada en el apartado II.6.3: el resultado constituye un piso de ocurrencia y no una medida de prevalencia.

**Criterio de exclusión, registrado antes del conteo.** Se excluyen las incidencias que solicitan una funcionalidad sin relatar un comportamiento ya experimentado, y las que no versan sobre la resolución de la configuración o de los permisos.

| **Categoría**                                         | **Casos** |
|-------------------------------------------------------|-----------|
| Candidatas según el criterio de búsqueda              | 46        |
| Excluidas por corresponder a pedidos de funcionalidad | 12        |
| Excluidas por no versar sobre el fenómeno relevado    | 3         |
| **Incluidas**                                         | **31**    |
| Incluidas — abiertas a la fecha de consulta           | 8         |
| Incluidas — cerradas a la fecha de consulta           | 23        |

*Tabla A.VI.10. Resultado de la aplicación de los criterios. Fuente: elaboración propia; relevamiento del 17/09/2026.*

La incidencia n.º 32581, incluida en el relevamiento del 17/09/2026, se excluye en la revisión del 09/10/2026 porque su autor declara que corresponde a OpenClaw y no a OpenCode.

**Nómina.** La nómina completa de las 46 incidencias candidatas, con número, título, fecha de apertura, estado, clasificación y motivo de inclusión o exclusión, consta en el documento de incidencias del registro de la evidencia (A.VI.11).

El relevamiento propio utiliza un único codificador para la búsqueda y clasificación por título en el repositorio de OpenCode. Las incidencias incluidas abarcan del 28/11/2025 al 16/09/2026; la consulta corresponde al 17/09/2026 y la exclusión de otro proyecto se incorpora el 09/10/2026.

La búsqueda documental complementaria del 19/10/2026, realizada sobre el mismo repositorio para verificar las fuentes del banco, identifica tres reportes anteriores a la medición del mecanismo. Corresponden a las incidencias n.º 40945, 46133 y 48049, publicadas entre el 06/08/2026 y el 09/09/2026 (ns-calvinwu, 2026; ouyangjian28, 2026; nlscott, 2026). La búsqueda por título se complementa con la lectura de los reportes completos por un codificador. Se emplea Codex con búsqueda web como herramienta de apoyo para verificar las fuentes del banco; el registro de fuentes documenta la consulta y su alcance.

Estos tres antecedentes complementan el relevamiento del 17/09/2026 y se informan por separado de sus 31 incidencias incluidas. Su vigencia en OpenCode 1.18.25 se acredita mediante la admisión nativa del banco, cuyo registro consta en A.VI.11.

### Clasificación de las incidencias por mecanismo

El anexo clasifica por mecanismo las 31 incidencias incluidas en el relevamiento documental del repositorio de OpenCode, cuyo criterio de búsqueda, inclusión y exclusión consta en el Anexo VI, A.VI.6. Las categorías corresponden a las condiciones del instrumento de la línea de base (informe de la AE1, Tabla 2), y las incidencias que recaen sobre una exclusión del apartado III.4 se consignan con la exclusión correspondiente. La clasificación se realiza sobre el título de cada incidencia y por un único codificador, límite que se suma a los declarados en el apartado II.6.3. Sustenta la Tabla 9 del apartado IV.3.

| **N.º** | **Fecha**  | **Estado** | **Título de la incidencia**                                                                       | **Mecanismo**                                |
|---------|------------|------------|---------------------------------------------------------------------------------------------------|----------------------------------------------|
| 4860    | 28/11/2025 | Cerrada    | Cannot Load or Override Config File on macOS (Warp Terminal)                                      | Precedencia y fusión (C-2)                   |
| 6806    | 04/01/2026 | Cerrada    | Partial thinking config doesn't merge with defaults, causing AI_InvalidArgumentError              | Valor implícito (C-3)                        |
| 10950   | 28/01/2026 | Cerrada    | Stored OAuth credentials silently override explicit provider config                               | Fuera de alcance: credenciales               |
| 11218   | 30/01/2026 | Cerrada    | Bash permission deny rules in agent config not being enforced                                     | Decisión de permiso (C-4)                    |
| 11628   | 01/02/2026 | Cerrada    | OPENCODE_CONFIG_CONTENT does not have highest precedence config loading                           | Precedencia y fusión (C-2)                   |
| 13751   | 15/02/2026 | Cerrada    | Permission prompt appears when reading \~/.config/opencode/AGENTS.md                              | Decisión de permiso (C-4) ¹                  |
| 15664   | 02/03/2026 | Cerrada    | tools config deny rules silently overridden by "\*": "ask" in permission config                   | Decisión de permiso (C-4)                    |
| 16495   | 07/03/2026 | Cerrada    | Permission prompt shows for \~/.config/hypr directory access                                      | Decisión de permiso (C-4) ¹                  |
| 19101   | 25/03/2026 | Cerrada    | todowrite/todoread cannot be enabled for subagents via agent permission config                    | Decisión de permiso (C-4)                    |
| 21307   | 07/04/2026 | Cerrada    | .opencode/ config precedence is inverted in nested directories                                    | Precedencia y fusión (C-2)                   |
| 26351   | 08/05/2026 | Cerrada    | Model from previous session overrides current config when continuing a session                    | Fuera de alcance: estado de sesión           |
| 28177   | 18/05/2026 | Cerrada    | Config precedence ignored                                                                         | Precedencia y fusión (C-2)                   |
| 28658   | 21/05/2026 | Abierta    | OPENCODE_CONFIG_DIR overrides global AGENTS.md path instead of adding to it                       | Fuera del compromiso del período: instrucciones                   |
| 28876   | 22/05/2026 | Cerrada    | Runtime 'always allow' approvals can silently override config deny rules                          | Fuera de alcance: aprobaciones permanentes   |
| 28960   | 23/05/2026 | Cerrada    | mcp config bypasses the "not user-overridable" precedence guarantee for managed/MDM configs       | Fuera de alcance: configuración administrada |
| 30415   | 02/06/2026 | Cerrada    | v1.15.13 upward config loading causes local mcp sections to shadow/replace global MCP servers     | Fuera del compromiso del período: servidores MCP (RF-14, Could)                   |
| 31919   | 11/06/2026 | Cerrada    | Per-model npm override in custom provider config is ignored                                       | Precedencia y fusión (C-2)                   |
| 36416   | 11/07/2026 | Cerrada    | Desktop ignores permission rules in \~/.config/opencode/opencode.jsonc                            | Fuera de alcance: modo de ejecución          |
| 36663   | 13/07/2026 | Cerrada    | OPENCODE_CONFIG overridden by global agent markdown files (undocumented precedence)               | Precedencia y fusión (C-2)                   |
| 37155   | 15/07/2026 | Cerrada    | AI agent can escalate its own permissions by modifying opencode.json                              | Decisión de permiso (C-4)                    |
| 37544   | 17/07/2026 | Cerrada    | config: existing model limit override is ignored                                                  | Precedencia y fusión (C-2)                   |
| 38149   | 21/07/2026 | Cerrada    | MiniMax-M3: reasoning/thinking never activates — config overrides silently dropped                | Precedencia y fusión (C-2)                   |
| 41162   | 08/08/2026 | Abierta    | config provider-level npm override dropped for inherited models                                   | Precedencia y fusión (C-2)                   |
| 41712   | 11/08/2026 | Abierta    | permission.skill / tools.skill in standalone agent .md frontmatter is parsed but silently ignored | Decisión de permiso (C-4)                    |
| 41916   | 12/08/2026 | Abierta    | Plugin config hooks can mutate process-shared config state via shallow-merged nested objects      | Fuera de alcance: código de plugins          |
| 43669   | 20/08/2026 | Abierta    | Config permissions/agents overrides cannot override built-in agent policies                       | Decisión de permiso (C-4) ¹                  |
| 43748   | 21/08/2026 | Abierta    | Published schema at opencode.ai/config.json rejects documented V2 fields                          | Fuera de alcance: validación de esquema      |
| 45266   | 26/08/2026 | Abierta    | Config: nested .opencode directory configs merged in wrong precedence order                       | Precedencia y fusión (C-2)                   |
| 46873   | 02/09/2026 | Abierta    | Legacy agent tools config overrides user permission rules in 1.18.26                              | Decisión de permiso (C-4) ²                  |
| 48751   | 13/09/2026 | Cerrada    | Agent commits and pushes untested changes despite global permission config                        | Decisión de permiso (C-4)                    |
| 49333   | 16/09/2026 | Cerrada    | desktop: latest release crashes with V2 permissions config                                        | Fuera de alcance: falla de la aplicación     |

*Tabla A.VI.11. Clasificación por mecanismo de las incidencias del repositorio de OpenCode. Fuente: elaboración propia sobre el relevamiento del 17/09/2026; títulos en su idioma original.*

¹ Clasificación de límite: en las incidencias n.º 13751, n.º 16495 y n.º 43669 interviene una regla nativa, de modo que admiten también la lectura como valor implícito (C-3). Se clasifican como permisos porque el comportamiento reportado es una decisión de permiso.

² La incidencia n.º 46873 corresponde a la versión 1.18.26, posterior a la versión congelada, y acredita el comportamiento reportado, no el de 1.18.25. La comparación de los archivos de configuración de agentes (`config/agent.ts`), configuración (`config.ts`), permisos (`permission.ts`) y agente (`agent/agent.ts`) no muestra diferencias entre ambas versiones (anomalyco, s. f.-a), por lo que su versión de introducción no está confirmada. El escenario reportado queda sin ejecutar contra 1.18.25; si el comportamiento ya está presente, RIGE lo reproduce porque su referencia es el comportamiento efectivo verificado contra el oráculo (RNF-02).

## A.VI.7 · Criterio de corrección

El oráculo ejecuta OpenCode 1.18.25 sobre el estado final que deja el agente y compara el resultado con el objetivo y las guardas. La modificación es correcta cuando logra el objetivo y conserva las guardas; queda sin efecto si mantiene el estado que se pide cambiar, e incorrecta si produce otro resultado distinto del pedido. El colateral sobre guarda declarada es la alteración respecto del estado inicial de lo que el pedido exige preservar. El colateral de batería es toda diferencia respecto de la forma correcta de referencia, capturada durante la admisión nativa con la batería vigente (ADR-098, puntos 5 y 6).

Un problema cuenta con éxito declarado falso cuando lo presenta en al menos dos de tres repeticiones; también se informa la lectura con una de tres, según el indicador de la Tabla 3 del apartado I.3.2. El colateral de batería se registra como exceso de alcance y se informa aparte. Esta última regla se decide después del dato; la definición original, que cuenta todo colateral, se conserva como lectura preregistrada (Tabla A.VI.14; Anexo III, D-41).

La comparación con la referencia distingue lo que se cambia de más de los efectos que la forma correcta produce necesariamente en OpenCode. La sensibilidad sin colateral cuenta únicamente los resultados sin efecto e incorrectos y conserva, en las tandas ecológicas del 20 y el 21/10/2026 de ambos ejecutores, los cinco problemas de E2 con al menos dos de tres repeticiones (ADR-098, punto 6; informes ecológicos de la medición del 20 y el 21/10/2026, registro de la evidencia, A.VI.11).

La consecuencia se calcula mecánicamente por ejecución con el orden `deny < ask < allow`: exposición si el objetivo o una sonda queda más permisivo que lo esperado, bloqueo si queda más restrictivo y valor distinto cuando el valor efectivo difiere del pedido (ADR-098, punto 7).

El proceso se obtiene de la traza de herramientas y comandos. Se registran la exploración de archivos de configuración, incluida la lectura por `bash`, el uso de documentación, `webfetch` y la skill; los archivos y la capa editada, contrastada con la de referencia; y la verificación posterior a la última edición, clasificada como ausente, declarativa, de comportamiento o con RIGE. Los turnos se miden por la cantidad de solicitudes. El registro acredita lo ejecutado sin pedir al agente un autoinforme sobre su método (ADR-098, punto 10).

En detección se corrige por archivo y clave del defecto sembrado, con las formas correctas como controles. Los indicadores ID-1 e ID-2 se definen en la Tabla 3 del apartado I.3.2; un defecto queda con problema si falta su detección en al menos dos repeticiones (ADR-098, punto 11; ADR-093, §2).

Como antecedente, la hoja de atribución queda cerrada el 13/10/2026. La adjudicación firmada por el autor el 14/10/2026 utiliza un modelo de lenguaje como herramienta de apoyo para preclasificar a ciegas las planillas (registro de la evidencia, A.VI.11).

## A.VI.8 · Registro de la medición

Cada ejecución conserva problema, estrato, ejecutor, agente, modelo, repetición, clasificación y motivo de corrección, junto con respuesta textual, tokens de entrada, caché y salida, duración, censura, archivos leídos o modificados, invocaciones de herramientas y comandos de introspección. El archivo de tanda identifica parámetros, semilla, versión y hashes; el registro contiene una fila por ejecución y la captura cruda conserva las transcripciones y salidas (registro de la evidencia, A.VI.11). La evidencia de las tandas del 20 y el 21/10/2026 se documenta en el documento de lectura de la medición; la captura completa queda archivada con SHA-256 según ese documento y el de archivo de la evidencia (A.VI.11). Los seis informes corresponden al reanálisis con MED-17 del 22/10/2026; su archivo de análisis también tiene SHA-256 documentado.

### Resultado por problema

La Tabla A.VI.12 presenta las fracciones de la lectura principal obtenidas por corrección mecánica y revisión de los archivos finales de las tandas ecológicas, coordinadas por el autor el 20 y el 21/10/2026. Cada fracción corresponde a tres repeticiones del problema con cada ejecutor.

| **Problema** | **Mecanismo observado** | **`build`** | **Charles** | **Consecuencia** |
|---|---|---|---|---|
| M-1 (E2) | Ruta absoluta en regla `read` | 2/3 | 3/3 | Bloqueo |
| M-2 (E2) | Ruta absoluta en regla `edit` | 2/3 | 2/3 | Bloqueo |
| M-10 (E2) | Ruta absoluta en regla de lectura de `.env` | 3/3 | 3/3 | Bloqueo |
| N-23 (E2) | Ruta absoluta en regla `read` con `deny` | 3/3 | 3/3 | Exposición |
| N-14 (E2) | Ruta absoluta en regla `read` del directorio (Charles: 2/3; repetición 1: solo `list: deny`, sin ruta absoluta) | 3/3 | 3/3 | Exposición |
| S-1 (E4) | Ruta absoluta en regla `read` | 2/3 | 3/3 | Bloqueo |
| N-21 (E2, solo con problema en la lectura preregistrada) | Sin mecanismo observado de falta de efecto; exceso de alcance | 3/3 (preregistrada) | 3/3 (preregistrada) | Bloqueo |

*Tabla A.VI.12. Problemas con éxito declarado falso, lectura principal. Fuente: informes ecológicos y documento de casos con error de la medición del 20 y el 21/10/2026 (registro de la evidencia, A.VI.11); la fila de N-21 conserva la lectura preregistrada.*

El mecanismo se cuenta por problema; por ejecución, la ruta absoluta explica 32 de las 33 ejecuciones sin efecto de las tandas ecológicas, según la revisión de los archivos finales documentada en el documento de casos con error (registro de la evidencia, A.VI.11).

Con una de tres repeticiones, la lectura principal suma N-21 en `build`, por una guarda `.env.local` alterada, y N-13 en Charles, por una regla con ruta absoluta (documento de lectura y los dos informes ecológicos, registro de la evidencia, A.VI.11).

La lectura preregistrada de las tandas del 20 y el 21/10/2026, producidas por el autor con el arnés, registra seis problemas de E2 y tres mecanismos con ambos ejecutores. En E1 suma C-6, el pedido de impedir que `revisor` modifique archivos, por las restricciones adicionales sobre `bash` y `task`.

El exceso de alcance aparece en C-6, N-21, S-3 y M-2 en tres de tres repeticiones de ambos ejecutores. En C-6 se restringen `bash` y `task`; en N-21, otros `.env`; en S-3 se agrega `npm test *` en `ask`; en M-2 la regla se limita a `build`. Charles registra además una de tres repeticiones en N-7, N-12 y N-13. Los informes ecológicos separan estos resultados y los archivos finales se documentan en el documento de casos con error (registro de la evidencia, A.VI.11); S-3 y M-2 se registran como defectos de la referencia en la Tabla A.VI.14.

### Detección y contraste

La detección comprende 33 ejecuciones por ejecutor, con once defectos y tres repeticiones, en las tandas del 21/10/2026. La Tabla A.VI.13 transcribe la corrección por archivo y clave del corpus.

| **Defecto** | **Detectado por `build` (de 3)** | **Detectado por Charles (de 3)** |
|---|---|---|
| D1 | 3 | 3 |
| D2, regla `read` con ruta absoluta sobre `.env` | 1 | 0 |
| D3 | 3 | 3 |
| D4 | 3 | 3 |
| D5, sustitución `{env:VAR}` sin variable | 0 | 1 |
| D6 | 3 | 3 |
| D7 | 3 | 3 |
| N-10-ingenua_frontmatter-D | 3 | 3 |
| N-23-ingenua_absoluta-D | 0 | 1 |
| N-24-ingenua_dotdir-D | 3 | 3 |
| V-10-ingenua_env-D | 3 | 3 |

*Tabla A.VI.13. Detección por defecto sembrado. Fuente: informes de detección de la medición del 21/10/2026; D2 y D5 se describen en el documento de lectura de la medición (registro de la evidencia, A.VI.11).*

El contraste fuera del árbol es descriptivo y comprende M-1 a M-10 con tres repeticiones por ejecutor el 21/10/2026. En la lectura principal, M-1 y M-10 registran tres de tres éxitos declarados falsos con ambos; M-2 registra una de tres con `build` y dos de tres con Charles, y el resto, cero de tres. La lectura preregistrada registra M-2 con tres de tres en ambos. MED-17 sustituye M-8:1 de Charles por la repetición completa y conserva la original como fila reemplazada; los dos informes declaran el contraste válido (informes de contraste, registro de la evidencia, A.VI.11).

### Proceso y costo

La clasificación por traza de las 138 ejecuciones ecológicas de cada ejecutor registra que todos los éxitos declarados falsos de la lectura principal siguen a una verificación declarativa con `opencode debug`: 16 con `build` (14 en E2 y dos en E4) y 18 con Charles (15 en E2 y tres en E4). `build` registra 129 verificaciones declarativas, ocho ejecuciones sin verificación y una de comportamiento; Charles, 133, cuatro y una, respectivamente. Los informes ecológicos registran cero sesiones anidadas en ambos ejecutores. Según el documento de lectura de la medición (registro de la evidencia, A.VI.11), las 276 ejecuciones usan la skill y la documentación local, y ninguna utiliza `webfetch`.

El costo por ejecución se expresa en USD con las tarifas congeladas de A.VI.10, incluida la caché (ADR-098, punto 9). Para las tandas ecológicas del 20 y el 21/10/2026, el análisis de costo incorporado en ADR-098 registra medianas de USD 0,0603 en E1 y 0,0667 en E2 con `build`, y de USD 0,0717 y 0,0764 con Charles. El Contexto 19 informa un costo equivalente para ejecuciones correctas y fallidas y una proporción de caché del 82 % de los tokens totales. En E2 se registran 14 llamadas con éxito declarado falso de `build` y 15 de Charles. Las fallas son casi deterministas por problema; repetir el pedido en una sesión nueva tiende a reproducirlas. La derivación de los límites de la salvaguarda y las alternativas descartadas se desarrollan en el Anexo III, D-41.

### Cobertura y decisiones del análisis

La cobertura de RIGE sobre estos problemas se establece en el apartado I.3.4. La precisión de RF-02 CA-9 para archivos y directorios se acepta el 22/10/2026 (ADR-088); la revalidación ante la referente y la incorporación de los escenarios al manifiesto quedan pendientes (apartado V.2).

La lectura principal deja sin éxito declarado falso los restantes problemas de E2 y los de valores. La preregistrada conserva los cinco problemas principales y suma N-21, que deniega otros `.env` además del solicitado y queda como problema observado sin cobertura declarada. La meta resulta de cuatro problemas con ambas lecturas; cambia la cobertura informada cuando ese caso se clasifica como exceso de alcance (Anexo III, D-41).

La Tabla A.VI.14 distingue las decisiones anteriores a la medición de las que siguen a sus datos. Las alternativas y sus fundamentos se desarrollan en D-41.

| **Decisión** | **Fecha** | **Momento** | **Efecto sobre el resultado** |
|---|---|---|---|
| Procedimiento delegado y agentes como ejecutores (antecedente consolidado) | 28/09/2026 | Antes de medir | Fija el objeto y la unidad inicial; el diseño posterior lo reemplaza. |
| Error como criterio principal, consumo como secundario y skill nativa disponible | 09/10/2026 | Antes de medir | Fija la condición del instrumento de atribución; los datos informales del AE1 quedan fuera. |
| Regla de ramas, 24 casos y segundo ejecutor Charles | 13/10/2026 | Antes de medir | Fija la interpretación histórica de atribución y sus brazos finales. |
| `gpt-6.1-sol`, k = 3, sin piloto y P3 opcional | 13/10/2026 | Antes de medir | Responde a la disponibilidad de modelos y conserva tres repeticiones por caso. |
| Extracción de decisiones en texto libre | 14/10/2026 | Después del dato | Corrige el defecto de comparación literal en ambas tandas sin cambiar la hoja. |
| Objetivo sobre indicadores y no regresión, luego reemplazado | 14/10/2026 | Después del dato | Conserva el objetivo histórico anterior al criterio de ADR-093. |
| Medir modificación sobre los 24 casos | 14/10/2026 | Después del dato | Agrega la dimensión tras conocer atribución; sus reglas se fijan antes de ejecutarla. |
| Modificación inválida, informe descriptivo y corrección del detector web | 14/10/2026 | Después del dato | Conserva el resultado sin repetirlo; separa `$schema` del acceso web y excluye C-3f de Charles por `curl`. |
| Readjudicación y enmienda del nivel de fuente exigido | 14/10/2026 | Después del dato | Cambia la interpretación del criterio, conserva la hoja y muestra la sensibilidad estricta. |
| Sondas R y E con lectura fijada | 14/10/2026 | Antes de medir | Comprueba sensibilidades de redacción y ruta, sin modificar las ramas previas. |
| Reorientación hacia la verificabilidad (ADR-090) | 14/10/2026 | Después del dato | Aplica «Refuta» del apartado IV.3 y conserva atribución como antecedente. |
| Medición ecológica dentro del proyecto y corpus de detección | 14/10/2026 | Antes de medir | Fija oráculo, indicador y corrección de defectos por archivo y clave. |
| Documentación local y `webfetch` permitido y registrado | 15/10/2026 | Después del dato | Cambia el brazo base y dispone repetir las cuatro líneas de base dentro del árbol. |
| Exploración con k = 1, luego reemplazada | 19/10/2026 (reemplazo) | Después del dato | La propuesta queda como antecedente y se reemplaza sin ejecutarse. |
| Marco de problemas admitidos nativamente, sin selección por falla del agente | 19/10/2026 (reemplazo) | Antes de medir | Reemplaza la exploración con una repetición; antecede al banco consolidado. |
| Banco estratificado, umbral de dos de tres, regla de cobertura y hoja cerrada | 19/10/2026 | Antes de ejecutar agentes sobre el banco | Fija el marco tras los datos anteriores y conserva la lectura con una de tres. |
| Credencial del desarrollador y sesiones anidadas contadas | 20/10/2026 | Antes de ejecutar agentes sobre el banco | Habilita probar con `opencode run` sin avisarlo en la instrucción. |
| Batería contra la forma correcta y raíz con escritura de grupo y *sticky bit* | 20/10/2026 | Antes de ejecutar agentes sobre el banco | Readmite los 46 problemas con la batería y el entorno vigentes. |
| Detención de la primera tanda y corrección del reparto (MED-14) | 20/10/2026 | Antes de ejecutar agentes sobre el banco | Descarta la fase base sin consumo de agentes y repite el ensayo con el lanzador real. |
| C-6 como resultado, sin invalidar, y sensibilidad sin colateral | 21/10/2026 | Después del dato | Conserva la tanda de `build` e informa la lectura alternativa. |
| Aceptación de fragmentos cortados por cuota (MED-16) | 21/10/2026 | Después del dato | Completa los pares pendientes y acepta los fragmentos por equivalencia de controles. |
| Colateral de batería como exceso de alcance | 22/10/2026 | Después del dato | X pasa de seis a cinco en ambos ejecutores; se conserva la lectura preregistrada. |
| Mecanismo observado en los archivos finales | 22/10/2026 | Después del dato | Y pasa de tres familias a un mecanismo observado, la ruta absoluta. |
| Defectos de referencia en S-3 y M-2 | 22/10/2026 | Después del dato | Sin efecto sobre X; se dispone corregirlos antes de noviembre con readmisión y ensayo. La comparación de la medición final usa esta línea de base; la fracción de M-2 se conserva porque sus éxitos declarados falsos son sin efecto. |
| Costo como salvaguarda en USD por problema | 22/10/2026 | Después del dato | Reemplaza el umbral de reducción; los límites se fundamentan en D-41. |
| Fila incompleta del contraste de Charles sustituida (MED-17) | 22/10/2026 | Después del dato | El análisis usa la repetición de M-8:1 y declara válidas las seis dimensiones, sin repetir el ensayo por un cambio de análisis. |

*Tabla A.VI.14. Decisiones del diseño y del análisis según su momento. Fuente: ADR-098, «Antecedentes absorbidos», puntos 2 a 13 y Contextos 13 a 21; ADR-090; documento de lectura de la medición, «Reanálisis con MED-17» (registro de la evidencia, A.VI.11).*

### Informe de la medición final

El criterio principal se evalúa en el brazo que indica al agente que consulte RIGE para verificar el cambio, denominado «RIGE indicado». El informe conserva por separado:

- El brazo con RIGE disponible y los resultados de Charles.

- La proporción descriptiva de problemas de E2 corregidos al primer intento con RIGE indicado.

- La lectura con una de tres repeticiones y la lectura preregistrada.

- La consecuencia, el proceso y el contraste fuera del árbol.

El conjunto reservado contiene variantes de ruta absoluta sobre archivos y directorios con archivos y herramientas que el manifiesto de aceptación de RIGE no usa. Se mide con y sin RIGE y se informa aparte del criterio principal. Si alcanza la cuota, se incorpora un brazo sin RIGE que pide probar el efecto ejecutando OpenCode; su omisión se declara como límite (Anexo III, D-41).

El corte del 07/11/2026 congela el MVP cuya cobertura delimita la meta. El texto de la instrucción del brazo descriptivo se fija antes del congelamiento del 14/11/2026.

### Antecedentes

El instrumento de atribución mide las respuestas sobre el valor o la decisión y su procedencia; el de modificación comprueba si el cambio logra el objetivo y conserva los sondeos. Las sondas R y E examinan, respectivamente, la sensibilidad a la redacción sobre la regla y a la retirada de la ruta absoluta de la instrucción; P3 repite la atribución con otro modelo. La adjudicación corresponde al autor, que la firma el 14/10/2026 con preclasificación ciega de las planillas asistida por un modelo de lenguaje, y declara que su conocimiento de los resultados limita la independencia. La modificación se conserva como informe descriptivo por la invalidez de sus controles C-1f. La Tabla A.VI.4 sintetiza los resultados y sus consecuencias; el detalle consta en el registro de la evidencia (A.VI.11).

La aplicación de «Refuta» y la reorientación del problema se presentan en el apartado IV.3; la deliberación del diseño se desarrolla en el Anexo III, D-41.

## A.VI.9 · Composición de los gráficos previstos

La representación gráfica de la línea de base consta en el apartado II.4.2.

## A.VI.10 · Tarifas de referencia congeladas para la valorización del consumo

Las tarifas quedan fijadas al 01/10/2026 y se aplican a toda valorización del consumo de la medición con agentes, incluida la línea de base, la medición final y el Capítulo I, aunque el proveedor las modifique o retire un modelo, de modo que cualquier repetición use los mismos valores. La medición se paga con la suscripción ChatGPT Plus, de USD 20 mensuales, y la valorización constituye un equivalente informativo.

| Modelo | Rol | Contexto corto (entrada / entrada en caché / salida) | Contexto largo (entrada / entrada en caché / salida) | Mensajes estimados por ventana de cinco horas con ChatGPT Plus |
|---|---|---|---|---|
| `gpt-6.1-sol` | Principal | 2,00 / 0,10 / 10,00 | 4,00 / 0,20 / 15,00 | 15 a 160 |
| `gpt-6-astra` | Secundario, mayor capacidad | 10,00 / 1,00 / 50,00 | 20,00 / 2,00 / 75,00 | 5 a 45 |
| `gpt-6-luna` | Secundario, menor capacidad | 0,10 / 0,01 / 0,50 | 0,20 / 0,02 / 0,75 | 350 a 3.000 |

*Tabla A.VI.15. Tarifas de referencia congeladas al 01/10/2026, en USD por millón de tokens, nivel Standard. Fuente: OpenAI (s. f.-a, s. f.-b), consultado el 01/10/2026.*

Por solicitud, se aplica la tarifa de contexto largo si la entrada total (sin caché más en caché) supera 272 000 tokens y la de contexto corto en caso contrario; el costo = (entrada sin caché × tarifa de entrada + entrada en caché × tarifa de caché + salida × tarifa de salida) / 1 000 000, y el costo de un caso es la suma de sus solicitudes.

Los mensajes por ventana son estimaciones del proveedor y no límites garantizados.

Los datos constan también en el archivo versionado de tarifas congeladas al 01/10/2026 (registro de la evidencia, A.VI.11) y un cambio posterior de tarifas no los modifica.

## A.VI.11 · Registro de la evidencia

La evidencia consta en el repositorio entregado, en la revisión [DATO PENDIENTE: etiqueta o commit de la entrega del AE2] de https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP. La captura completa de la línea de base, archivada con SHA-256, consta en el Portafolio Digital: [DATO PENDIENTE: enlace a la carpeta del Portafolio Digital con el archivo de la evidencia].

| **Evidencia** | **Contenido** | **Ubicación en el repositorio** |
|---|---|---|
| Constancia de entrevistas, v1 | Entrevistas y primera extensión del acta de validación, con firma del 15/10/2026. | `01-relevamiento/validacion/20261015_ConstanciaEntrevistas_Sanchez_v1.md` |
| Constancia de entrevistas, v2 | Ratificación de las entrevistas y de la primera extensión, y confirmación de los once cambios de la segunda extensión, con firma del 15/10/2026. | `01-relevamiento/validacion/20261015_ConstanciaEntrevistas_Sanchez_v2.md` |
| Banco ecológico | Problemas admitidos, estratos y admisión nativa. | `01-relevamiento/linea-base/ecologica/banco.md` |
| Hoja de tareas ecológicas | Enunciados de la hoja cerrada el 19/10/2026. | `01-relevamiento/linea-base/ecologica/tareas.md` |
| Medición del 20 y el 21/10/2026 | Documento de lectura, parámetros, archivo con SHA-256 y reanálisis con MED-17. | `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/LEEME.md` |
| Estado de tanda | Fechas, ejecución y continuaciones de las seis tandas. | `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/ESTADO-tanda.txt` |
| Informe ecológico de `build` | Resultados del reanálisis con MED-17 del 22/10/2026. | `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/eco-principal/informe.md` |
| Informe ecológico de Charles | Resultados del reanálisis con MED-17 del 22/10/2026. | `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/eco-charles/informe.md` |
| Informe de detección de `build` | Resultados del reanálisis con MED-17 del 22/10/2026. | `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/det-principal/informe.md` |
| Informe de detección de Charles | Resultados del reanálisis con MED-17 del 22/10/2026. | `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/det-charles/informe.md` |
| Informe de contraste de `build` | Resultados del reanálisis con MED-17 del 22/10/2026. | `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/contraste-principal/informe.md` |
| Informe de contraste de Charles | Resultados del reanálisis con MED-17 del 22/10/2026. | `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/contraste-charles/informe.md` |
| Casos con error | Revisión de los archivos finales y mecanismo observado. | `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/casos-con-error.md` |
| Archivo de la evidencia | Captura completa archivada con SHA-256. | `01-relevamiento/linea-base/verificacion/20261020-archivo-evidencia/LEEME.md` |
| Hoja de respuestas de atribución | Los 24 casos y sus respuestas, cierre del 13/10/2026. | `01-relevamiento/linea-base/respuestas.md` |
| Captura estática de los 24 casos | Comprobación contra OpenCode 1.18.25 del 13/10/2026. | `01-relevamiento/linea-base/verificacion/20261013-captura-estatica/` |
| Ejecución de permisos de los 24 casos | Comprobación del 13/10/2026 con proveedor simulado local, sin red. | `01-relevamiento/linea-base/verificacion/20261013-permisos/` |
| Análisis inicial de atribución | Documento de lectura y análisis del 14/10/2026, conservados como antecedente. | `01-relevamiento/linea-base/verificacion/20261014-analisis-LB/LEEME.md` |
| Adjudicación del autor | Procedimiento, asistencia declarada y aceptación del 14/10/2026. | `01-relevamiento/linea-base/verificacion/20261014-adjudicacion-autor/LEEME.md` |
| Adjudicación: atribución de `build` y Charles | Informe con la adjudicación vigente del autor. | `01-relevamiento/linea-base/verificacion/20261014-adjudicacion-autor/analisis-LB/informe.md` |
| Adjudicación: atribución de P3 | Informe con la adjudicación vigente del autor. | `01-relevamiento/linea-base/verificacion/20261014-adjudicacion-autor/analisis-p3/informe.md` |
| Adjudicación: sonda R | Informe con la adjudicación vigente del autor. | `01-relevamiento/linea-base/verificacion/20261014-adjudicacion-autor/analisis-R/informe.md` |
| Tareas de modificación | Enunciados cerrados de los 24 casos. | `01-relevamiento/linea-base/modificacion/tareas.md` |
| Análisis de modificación | Resultados, invalidez, acceso web y lectura descriptiva. | `01-relevamiento/linea-base/verificacion/20261014-analisis-LB-mod/LEEME.md` |
| Informe de modificación | Análisis de las ejecuciones del 14/10/2026. | `01-relevamiento/linea-base/verificacion/20261014-analisis-LB-mod/informe-analizar.md` |
| Verificación nativa de ruta | Contraste entre la regla con ruta absoluta y la relativa. | `01-relevamiento/linea-base/verificacion/20261014-analisis-LB-mod/verificacion-nativa-ruta/` |
| Sondas R y E y P3 | Diseño, ejecución, recuperación y resultado de la sonda E. | `01-relevamiento/linea-base/verificacion/20261014-analisis-sondas-p3/LEEME.md` |
| Tarifas de P3 | Tarifas congeladas para valorizar P3 fuera del contenedor. | `01-relevamiento/linea-base/tarifas-congeladas-20261014-p3.json` |
| Tarifas de referencia | Tarifas congeladas al 01/10/2026. | `01-relevamiento/linea-base/tarifas-congeladas-20261001.json` |
| Relevamiento técnico | Funcionamiento verificado de OpenCode 1.18.25 y escenarios reproducibles. | `01-relevamiento/opencode/como-funciona.md` |
| Incidencias | Nómina completa y clasificación de las 46 incidencias candidatas. | `01-relevamiento/opencode/incidencias.md` |
| ADR-090 | Aplicación de «Refuta» y reorientación del problema. | `00-gestion/decisiones/ADR-090-refuta-reformulacion-verificabilidad.md` |
| ADR-098 | Diseño consolidado de la línea de base y antecedentes absorbidos. | `00-gestion/decisiones/ADR-098-linea-base-consolidada-banco-estratificado.md` |

*Tabla A.VI.16. Registro de la evidencia. Fuente: elaboración propia sobre el repositorio entregado.*
