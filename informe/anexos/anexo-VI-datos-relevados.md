# ANEXO VI · DATOS RELEVADOS

## A.VI.1 · Instrumento de medición: composición de los casos

El instrumento mide el procedimiento delegado de consulta de la configuración efectiva de OpenCode 1.18.25. Los ejecutores son el agente `build` nativo, con la skill `customize-opencode` disponible, y una variante experimental del agente de la referente, «[AUX] Charles», ambos con `gpt-6.1-sol`; la tanda adicional P3 emplea `build` con `gpt-5.6-luna`. La medición que ejecuta el autor el 13 y el 14/10/2026 utiliza el contenedor de referencia `rige-linea-base:1.18.25`, basado en Ubuntu 26.04, y k = 3 repeticiones por caso. El ejecutor trabaja como `evaluador`, con configuración propia, y consulta el escenario del usuario `participante` mediante `como-dev`; dispone de la hoja de referencia y de la documentación sin conexión. Charles conserva su instrucción, temperatura y estructura de permisos, con el modelo sustituido por disponibilidad, sin las skills propias del equipo y con las aprobaciones interactivas denegadas. Esta elección mide la delegación relevada y mantiene disponible la ayuda nativa del fabricante; la alternativa de medir el procedimiento manual se desarrolla en el Anexo III, D-41 (ADR-053, ADR-078, ADR-079 y ADR-082).

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

*Tabla A.VI.1. Composición de los 24 casos de atribución. Fuente: elaboración propia sobre `01-relevamiento/linea-base/respuestas.md`, hoja cerrada el 13/10/2026.*

La respuesta verificada de cada caso consta en `01-relevamiento/linea-base/respuestas.md`. El registro técnico del 13/10/2026 documenta la verificación de los 24 casos contra OpenCode 1.18.25 mediante captura estática y ejecución de las decisiones de permiso con un proveedor simulado local, sin red. La captura de C-2c confirma la fusión del agente en Markdown con el JSON: el modelo procede del primero y la temperatura se conserva del segundo, lo que corrige la lectura de reemplazo completo. La ejecución de C-3f confirma que decide el conjunto de reglas propio de `general` y que la denegación de `bash` del padre queda fuera de ese conjunto; la respuesta se corrige de `deny` a `allow` antes del cierre. La evidencia se conserva en `01-relevamiento/linea-base/verificacion/20261013-captura-estatica/` y `20261013-permisos/`.

El instrumento de modificación contiene una tarea por cada uno de los mismos 24 casos, según ADR-085, con los enunciados en `01-relevamiento/linea-base/modificacion/tareas.md`, cerrados el 14/10/2026. La corrección mecánica compara el estado efectivo posterior con el objetivo y comprueba que los demás valores y decisiones de sondeo del agente objetivo se conserven; los cambios en otros agentes se registran en forma descriptiva. Las variables de entorno permanecen fijas y C-2e admite el impedimento previsto por la hoja. Antes de interpretar cada medición se aplica la validez previa de ADR-079, §2: C-1 conserva todos sus casos por debajo del umbral de problema (al menos dos errores de tres), sus ejecuciones quedan libres de censura y cada ejecución cuenta con resultado y tokens completos. Una ejecución perdida se repite; si resulta irrecuperable, se declara la exclusión del caso del conjunto pareado, y más de dos exclusiones invalidan la medición. Ante invalidez, la regla prescribe corregir la causa instrumental y repetir la línea de base; A.VI.8 documenta la desviación aceptada para modificación (Anexo III, D-41; ADR-086).

## A.VI.2 · Ejecución de la medición

Cada ejecución comienza con el escenario restaurado y una sesión nueva del agente. Este aislamiento permite medir los casos sin contrabalanceo entre participantes. El autor ejecuta las tandas de la Tabla A.VI.2 con el arnés del repositorio, que registra los pares de caso y repetición; las sondas R y E conservan las definiciones de ADR-089. Las franjas se transcriben de los registros de ejecución del 13 y el 14/10/2026.

| **Tanda** | **Ejecutor y modelo** | **Dimensión** | **Fecha y franja horaria** | **Ejecuciones** | **Observación** |
|---|---|---|---|---|---|
| LB principal | `build`, `gpt-6.1-sol` | Atribución | 13/10/2026, 22:07:11 a 22:51:36 | 72 | Completa, k = 3. |
| LB Charles | Charles, `gpt-6.1-sol` | Atribución | 13/10/2026, 22:52:07 a 23:49:15 | 72 | Completa, k = 3. |
| LB modificación principal | `build`, `gpt-6.1-sol` | Modificación | 14/10/2026, 14:59 a 16:06 | 72 | Completa. |
| LB modificación Charles | Charles, `gpt-6.1-sol` | Modificación | 14/10/2026, 16:06 a 17:14 | 64 | Detención por cuota en C-3b:2. |
| LB modificación Charles, reanudación | Charles, `gpt-6.1-sol` | Modificación | 14/10/2026, 17:54 a 18:02 | 8 | Pares restantes; unión con parámetros y hashes idénticos. |
| Sonda R | `build` y Charles, `gpt-6.1-sol` | Sonda de atribución | 14/10/2026, 19:37 a 19:43 | 12 (6 por ejecutor) | Pregunta explícita sobre el carácter incorporado de la regla. |
| Sonda E | `build` y Charles, `gpt-6.1-sol` | Sonda de modificación | 14/10/2026, 19:43 a 21:07 | 24 pares previstos; 19 perdidos | Corte de conectividad con la API; los pares perdidos se registran como sin respuesta. |
| P3 | `build`, `gpt-5.6-luna` | Atribución | 14/10/2026, 21:07 a 21:41 | 72 | Semilla de la línea de base para comparar por caso. |
| Sonda E, recuperación | `build` y Charles, `gpt-6.1-sol` | Sonda de modificación | 14/10/2026, 21:41 a 21:56 | 19 | Cada par perdido se reemplaza por su repetición con iguales parámetros (ADR-079, §2). |

*Tabla A.VI.2. Tandas ejecutadas por el autor mediante el arnés de medición, el 13 y el 14/10/2026. Fuente: `01-relevamiento/linea-base/verificacion/20261014-analisis-LB/LEEME.md`, `20261014-analisis-LB-mod/LEEME.md` y `20261014-analisis-sondas-p3/LEEME.md`.*

Por decisión del autor del 14/10/2026, las sondas se ejecutan ese día antes de P3. Sus carpetas registran la fecha real y sus nombres internos y semilla conservan la fecha prevista originalmente, 20261021. Esta variación del orden y la recuperación por conectividad constan en el registro de las sondas y en ADR-089 (Anexo III, D-41).

## A.VI.3 · Relevamiento técnico de OpenCode 1.18.25

Documento completo en el repositorio del proyecto, bajo `01-relevamiento/opencode/como-funciona.md`. Sostiene las afirmaciones de los apartados I.1.1, I.1.3, I.6.2 y II.6.1, y se sintetiza aquí en sus resultados verificados.

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

*Tabla A.VI.3. Resultados del relevamiento técnico. Fuente: elaboración propia.*

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

*Tabla A.VI.4. Nómina del estado del arte por nivel. Fuente: documentación oficial, README o página del paquete de cada solución; prueba directa del 17/09/2026 para los comandos nativos de OpenCode, OCCM y la extensión para Claude Code.*

**Condición de vigencia.** El relevamiento corresponde al 01/10/2026, sobre un conjunto de herramientas de ritmo de cambio alto. Se revisa antes de la defensa y toda incorporación se registra con su fecha.

## A.VI.5 · Entrevista semiestructurada al referente técnico

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

*Tabla A.VI.5. Datos de la entrevista. Fuente: elaboración propia.*

**Guía de entrevista aplicada.** Las preguntas se ordenan de lo general a lo particular y evitan sugerir la respuesta esperada. Se registran en el orden efectivamente aplicado: (1) herramientas de programación asistida que el equipo utiliza y desde cuándo; (2) motivo por el cual el equipo las incorporó; (3) quién configura el entorno de cada desarrollador y con qué criterio; (4) situaciones en que el comportamiento del agente difirió de lo previsto, con relato de un caso concreto; (5) procedimiento seguido para averiguar qué configuración regía en ese caso y tiempo aproximado que demandó; (6) recursos y soluciones propias que el equipo construyó para resolver estas consultas; (7) frecuencia con que se presentan consultas de esta clase; (8) valor de referencia de la hora de trabajo de desarrollo y su origen; (9) consecuencias observadas cuando la respuesta resultó incorrecta.

**Transcripción.** \[Transcripción o registro completo pendiente de incorporación.\]

**Síntesis de lo declarado y de lo observado.** El contenido sustantivo de la entrevista se presenta, sin interpretación, en el apartado II.3.3 del cuerpo del informe, y comprende: composición del equipo y motivo de adopción de las herramientas; frecuencia declarada de acceso a los archivos de configuración y su tendencia; procedimiento habitual de resolución; dos episodios de comportamiento distinto del esperado; tres prácticas propias relatadas por la informante; dos vías de consumo de tokens atribuibles a la configuración; y la respuesta al enfoque presentado.

**Formulaciones textuales del informante.** Se conservan sin reformular, dado que constituyen el insumo del prototipo v0 conforme al apartado I.6.6.

| **N.º** | **Formulación registrada** | **Pantalla del prototipo que la responde** |
|---------|----------------------------|--------------------------------------------|
| 1       | \[ \]                      | \[ \]                                      |
| 2       | \[ \]                      | \[ \]                                      |
| 3       | \[ \]                      | \[ \]                                      |

*Tabla A.VI.6. Preguntas que el informante formula en su práctica. Fuente: elaboración propia sobre el registro de la entrevista.*

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

*Tabla A.VI.7. Datos cuantitativos obtenidos en la entrevista, con las tres preguntas respondidas. Fuente: elaboración propia.*

**Datos que la entrevista no aporta.** El informante no informó un valor de referencia de la hora de trabajo de desarrollo ni la proporción de sus accesos semanales que exige una resolución comparable a la que mide la línea de base. Ninguno de los dos se sustituye por una estimación propia, conforme a la decisión del apartado I.3.1.

**Efecto de la entrevista sobre la composición de la muestra.** Durante la entrevista se describió al informante el enfoque de la plataforma y el recorrido de consulta previsto. En consecuencia, el informante queda excluido de la muestra de la medición de la línea de base, conforme al apartado II.2.4.

**Validación del prototipo v0.** \[Observaciones del referente, cambios incorporados y fecha, pendientes de incorporación. La validación se efectúa sobre la maqueta construida y constituye un contacto distinto de esta entrevista.\]

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

*Tabla A.VI.8. Resultado de la aplicación de los criterios. Fuente: elaboración propia; relevamiento del 17/09/2026.*

La incidencia n.º 32581, incluida en el relevamiento del 17/09/2026, se excluye en la revisión del 09/10/2026 porque su autor declara que corresponde a OpenClaw y no a OpenCode.

**Nómina.** La nómina completa de las 46 incidencias candidatas, con número, título, fecha de apertura, estado, clasificación y motivo de inclusión o exclusión, consta en el repositorio del proyecto bajo `01-relevamiento/opencode/incidencias.md`.

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

*Tabla A.VI.9. Clasificación por mecanismo de las incidencias del repositorio de OpenCode. Fuente: elaboración propia sobre el relevamiento del 17/09/2026; títulos en su idioma original.*

¹ Clasificación de límite: en las incidencias n.º 13751, n.º 16495 y n.º 43669 interviene una regla nativa, de modo que admiten también la lectura como valor implícito (C-3). Se clasifican como permisos porque el comportamiento reportado es una decisión de permiso.

² La incidencia n.º 46873 corresponde a la versión 1.18.26, posterior a la versión congelada, y acredita el comportamiento reportado, no el de 1.18.25. La comparación de los archivos de configuración de agentes (`config/agent.ts`), configuración (`config.ts`), permisos (`permission.ts`) y agente (`agent/agent.ts`) no muestra diferencias entre ambas versiones (anomalyco, s. f.-a), por lo que su versión de introducción no está confirmada. El escenario reportado queda sin ejecutar contra 1.18.25; si el comportamiento ya está presente, RIGE lo reproduce porque su referencia es el comportamiento efectivo verificado contra el oráculo (RNF-02).

## A.VI.7 · Hoja de respuestas y criterio de corrección

La hoja de atribución, `01-relevamiento/linea-base/respuestas.md`, queda cerrada el 13/10/2026, después de verificar todos sus casos; desde ese cierre conserva sus respuestas. Una respuesta correcta coincide con el valor y la fuente o con la decisión de permiso y la regla determinante que exige la pregunta. El acierto parcial, con valor o decisión correctos y fuente incorrecta, se registra por separado y cuenta como error, al igual que una respuesta incorrecta o ausente. La corrección se realiza fuera del contenedor, donde permanece la hoja.

ADR-083 precisa el 14/10/2026 la extracción de una decisión escrita en texto libre, después de detectar el defecto de comparación literal y antes de conocer el resultado de la recorrección. Si la respuesta contiene exactamente una decisión distinta entre `allow`, `ask`, `deny` y sus sinónimos de la hoja, el corrector la extrae; las expresiones sin término explícito o con decisiones en conflicto pasan a revisión manual. En C-4e se separan las partes por punto y coma y se aplica la regla a cada una, en el orden de la hoja. Se conservan el texto original, la decisión extraída y la regla aplicada. La regla es mecánica y simétrica entre tandas; las decisiones formuladas con otras palabras se aceptan en la adjudicación si su significado resulta inequívoco.

La readjudicación de ADR-087 emplea un modelo de lenguaje como herramienta de apoyo para preclasificar a ciegas las planillas de respuestas, sin acceso a la clave, a las adjudicaciones previas, a `verificacion/` ni a la identidad del ejecutor. El autor revisa los veredictos contra la hoja y firma la adjudicación que rige. El registro del 14/10/2026 documenta la aceptación sin cambios de las preclasificaciones de las 61 revisiones de la línea de base, las 45 de P3 y las 6 de la sonda R; una ronda anterior con indicaciones distintas queda descartada y conservada. El autor conoce los resultados, por lo que su revisión aporta responsabilidad sobre la adjudicación y conserva la amenaza de falta de independencia. La concordancia mediante kappa de Cohen se informa en A.VI.8.

La enmienda de ADR-087 exige la fuente al nivel de la pregunta: en C-3b, C-3d, C-3f y C-4a a C-4d basta identificar la regla determinante correcta, siempre que la ubicación que eventualmente se atribuya resulte compatible con la hoja. Las demás preguntas mantienen la exigencia de archivo, entrada o procedencia. Esta enmienda se decide el 14/10/2026 después de conocer los datos y afecta la interpretación del criterio, mientras la hoja conserva sus respuestas cerradas. Se adopta porque la pregunta pide la regla; el criterio estricto que además exige su carácter nativo o su archivo se conserva como sensibilidad en A.VI.8 (Anexo III, D-41; ADR-087).

ADR-082 fija k = 3 antes de medir y suprime el piloto por su consumo de cuota. El diseño establece un tope de 600 s por ejecución del agente, con censura al alcanzarlo. La unidad temporal corresponde a la ejecución; el instrumento mide agentes mediante el procedimiento delegado.

## A.VI.8 · Registro de la medición

Cada ejecución conserva caso, condición, ejecutor, agente, modelo, repetición, clasificación y motivo de corrección, junto con respuesta textual, tokens de entrada, caché y salida, duración, censura, archivos leídos o modificados, invocaciones de herramientas y comandos de introspección. `tanda.json` identifica parámetros, semilla, versión y hashes; `registro.jsonl` contiene una fila por ejecución y `crudo/` conserva las transcripciones y salidas. Los registros del autor del 13 y el 14/10/2026 se encuentran en `01-relevamiento/linea-base/verificacion/20261013-LB-principal-sol/`, `20261013-LB-charles-sol/` y las carpetas del 14/10 identificadas en los LEEME de modificación y sondas. La corrección y las adjudicaciones se vinculan con esas filas y su evidencia.

**Atribución.** La Tabla A.VI.10 transcribe la adjudicación vigente firmada por el autor el 14/10/2026, obtenida por corrección automática y revisión de las planillas de A.VI.7. Cada tanda comprende 24 casos con tres repeticiones, 72 consultas, de las cuales 54 corresponden a C-2 a C-4. Las dos primeras tandas se ejecutan el 13/10 y P3, el 14/10. La lectura aplica la Tabla 10 del apartado IV.3 de manera independiente de las ramas de ADR-079.

| **Tanda** | **Correctas sobre 72** | **Errores en C-2 a C-4 sobre 54** | **Casos con problema (ADR-079)** | **Rama (ADR-079)** | **Lectura de la Tabla 10** |
|---|---|---|---|---|---|
| `build`, `gpt-6.1-sol` | 72/72 | 0/54 | 0 | N | Refuta |
| Charles, `gpt-6.1-sol` | 70/72 | 2/54, en C-4e | 1 (C-4e, 2 de 3) | P | Confirma |
| P3, `build`, `gpt-5.6-luna` | 70/72 | 2/54, en C-2b y C-4e | 0 | N | Confirma |

*Tabla A.VI.10. Atribución por tanda según la adjudicación del autor del 14/10/2026. Fuente: `01-relevamiento/linea-base/verificacion/20261014-adjudicacion-autor/analisis-LB/informe.md` y `01-relevamiento/linea-base/verificacion/20261014-adjudicacion-autor/analisis-p3/informe.md`.*

**Sensibilidad y concordancia.** El LEEME de la adjudicación informa que, con el criterio estricto anterior a la enmienda de ADR-087, `build` queda en P por C-3b, Charles en P por C-3b, C-3d y C-4e, y P3 en E por seis casos, C-3b, C-3d y C-4a a C-4d. Con el criterio enmendado, las ramas registradas son N, P y N, respectivamente. La Tabla A.VI.11 presenta el cálculo del registro de adjudicación del 14/10/2026 sobre las revisiones manuales, 61 para la línea de base y 45 para P3. Las comparaciones entre criterios distintos miden la sensibilidad al criterio; la evidencia disponible contiene una adjudicación firmada, sin una segunda adjudicación independiente bajo el mismo criterio.

| **Comparación** | **Universo** | **Acuerdo** | **Kappa de Cohen** |
|---|---|---|---|
| Ingeniero, criterio estricto, frente a adjudicación vigente | 61 revisiones de la línea de base | 0,80 | 0,20 |
| Primera preclasificación frente a adjudicación vigente | 61 revisiones de la línea de base | 0,97 | 0,65 |
| P3, primera preclasificación estricta, frente a adjudicación vigente | 45 revisiones de P3 | 0,67 | 0,08 |

*Tabla A.VI.11. Concordancia documentada en la adjudicación del autor del 14/10/2026. Fuente: `01-relevamiento/linea-base/verificacion/20261014-adjudicacion-autor/LEEME.md`.*

**Sonda R.** El autor ejecuta el 14/10/2026 las consultas de C-3b y C-3d con una pregunta que explicita si la regla es incorporada o declarada en un archivo, tres repeticiones por caso y ejecutor. La adjudicación vigente registra 12 respuestas correctas de 12. Según la lectura fijada antes de la sonda en ADR-089, la falla original bajo el criterio estricto es dependiente de la redacción. La sonda aporta esta sensibilidad y mantiene separada la línea de base original.

**Modificación.** En las 144 ejecuciones realizadas por el autor el 14/10/2026, sobre los 24 casos con tres repeticiones y los dos ejecutores con `gpt-6.1-sol`, la corrección mecánica registra 128 correctas y 16 sin efecto, ocho por ejecutor. El análisis y la verificación nativa identifican una causa única en cada error: el agente escribe una regla con ruta absoluta y OpenCode evalúa la acción contra la ruta relativa al árbol de trabajo, de modo que el patrón queda sin coincidencia. Los errores corresponden a C-1f y C-3b, tres por ejecutor en cada caso, y C-1d y C-4e, uno por ejecutor en cada caso. En los 16, el agente declara éxito después de consultar `opencode debug agent`; el comando muestra la regla agregada y deja sin evaluar su coincidencia con la acción. La reproducción nativa en `20261014-analisis-LB-mod/verificacion-nativa-ruta/` contrasta la regla absoluta, que mantiene `deny`, con la relativa, que produce `allow`.

La validez previa invalida ambas mediciones por C-1f, con tres errores de tres en cada ejecutor: el control expone el mismo mecanismo que los casos difíciles. A ello se suma que el agente opera desde fuera del árbol del proyecto, condición que puede favorecer el uso de rutas absolutas. ADR-086 acepta después del resultado el informe descriptivo y la conservación de la invalidez, en lugar de reinterpretar la medición como válida; dispone su conservación sin repetir la línea de base porque la verificación ubica la causa en la respuesta del agente. Esta desviación de la repetición prescrita por ADR-079, §2, se desarrolla en el Anexo III, D-41. Los recuentos anteriores describen el conjunto crudo; el análisis excluye C-3f de Charles por el acceso web real de su repetición 2 mediante `curl`. ADR-086 también corrige el falso positivo del detector que tomaba el identificador `$schema` como acceso web y aplica la corrección por igual a todas las tandas.

**Sonda E.** El autor retira la ruta absoluta de la instrucción y ejecuta el 14/10/2026 los cuatro casos que presentan errores de modificación, C-1d, C-1f, C-3b y C-4e, con tres repeticiones por ejecutor. Tras reemplazar los pares perdidos por conectividad, la corrección registra 13 ejecuciones sin efecto de 24, siete de `build` y seis de Charles; la revisión de las llamadas a herramientas confirma en las 13 reglas la ruta absoluta y el éxito declarado falso. Los casos se seleccionan por haber fallado, por lo que la cifra mide persistencia en ese conjunto y no frecuencia en el universo de configuraciones. La lectura fijada por ADR-089 identifica un mecanismo propio del agente en este entorno: persiste al retirar la ruta de la instrucción. El ejecutor sigue fuera del árbol y obtiene la ubicación mediante `como-dev`, amenaza que limita esa lectura.

**Consumo.** El arnés registra los tokens por ejecución y los análisis del 14/10/2026 los valorizan con las tarifas congeladas de A.VI.10. La Tabla A.VI.12 presenta el equivalente a precio de lista informativo, redondeado a centavos, para los universos indicados. La medición utiliza la suscripción ChatGPT Plus; el equivalente expresa consumo valorizado y se distingue del desembolso de la suscripción.

| **Dimensión y ejecutor** | **Universo y fecha de ejecución** | **Equivalente informativo (USD)** |
|---|---|---|
| Atribución, `build`, `gpt-6.1-sol` | 72 consultas, 13/10/2026 | 3,84 |
| Atribución, Charles, `gpt-6.1-sol` | 72 consultas, 13/10/2026 | 4,01 |
| Atribución P3, `build`, `gpt-5.6-luna` | 72 consultas, 14/10/2026 | 0,55 |
| Modificación, `build`, `gpt-6.1-sol` | 72 ejecuciones, 14/10/2026 | 4,55 |
| Modificación, Charles, `gpt-6.1-sol` | 72 ejecuciones crudas, 14/10/2026 | 4,86 |
| Modificación, Charles, conjunto analizado | 69 ejecuciones, tras excluir C-3f, 14/10/2026 | 4,49 |

*Tabla A.VI.12. Consumo valorizado por el arnés y los análisis de la medición del autor. Fuente: análisis LB y P3 de `20261014-adjudicacion-autor/`, y LEEME e `informe-analizar.md` de `20261014-analisis-LB-mod/`, bajo `01-relevamiento/linea-base/verificacion/`.*

Las tarifas de P3 constan en `01-relevamiento/linea-base/tarifas-congeladas-20261014-p3.json`; el análisis las aplica fuera del contenedor porque la imagen conserva las tarifas del 01/10. El registro aporta evidencia sobre estos casos construidos, ejecutores y modelos de una misma familia; las repeticiones describen su variabilidad y el costo humano de verificar permanece fuera de la medición.

El resultado de atribución lleva a aplicar «Refuta» y a reorientar el problema hacia la verificabilidad del efecto de la configuración (apartado IV.3; Anexo III, D-41; ADR-090).

## A.VI.9 · Composición de los gráficos previstos

La composición de las figuras que representan los resultados de la medición queda fijada antes de conocer los datos, de modo que la forma de presentarlos no se decida una vez obtenidos.

**Figura 3 — Tiempo de resolución por condición.** Diagrama de caja. Eje horizontal: condición (C-1 a C-4). Eje vertical: tiempo de resolución en segundos. Cada caja representa mediana, cuartiles y valores atípicos. Línea horizontal de referencia en el límite de observación. Bajo cada caja, el recuento de observaciones censuradas y el denominador de la categoría. Las observaciones censuradas se incluyen en el cálculo con el valor del límite, criterio que se declara en el pie.

**Figura 4 — Proporción de respuestas erróneas por condición.** Gráfico de barras. Eje horizontal: condición (C-1 a C-4). Eje vertical: proporción de respuestas erróneas, en porcentaje, de 0 a 100. Barra de error correspondiente al intervalo de confianza del 95 % calculado por el método de Clopper-Pearson. Sobre cada barra, el denominador de la categoría.

## A.VI.10 · Tarifas de referencia congeladas para la valorización del consumo

Las tarifas quedan fijadas al 01/10/2026 y se aplican a toda valorización del consumo de la medición con agentes, incluida la línea de base, la medición final y el Capítulo I, aunque el proveedor las modifique o retire un modelo, de modo que cualquier repetición use los mismos valores. La medición se paga con la suscripción ChatGPT Plus, de USD 20 mensuales, y la valorización constituye un equivalente informativo.

| Modelo | Rol | Contexto corto (entrada / entrada en caché / salida) | Contexto largo (entrada / entrada en caché / salida) | Mensajes estimados por ventana de cinco horas con ChatGPT Plus |
|---|---|---|---|---|
| `gpt-6.1-sol` | Principal | 2,00 / 0,10 / 10,00 | 4,00 / 0,20 / 15,00 | 15 a 160 |
| `gpt-6-astra` | Secundario, mayor capacidad | 10,00 / 1,00 / 50,00 | 20,00 / 2,00 / 75,00 | 5 a 45 |
| `gpt-6-luna` | Secundario, menor capacidad | 0,10 / 0,01 / 0,50 | 0,20 / 0,02 / 0,75 | 350 a 3.000 |

*Tabla A.VI.13. Tarifas de referencia congeladas al 01/10/2026, en USD por millón de tokens, nivel Standard. Fuente: OpenAI (s. f.-a, s. f.-b), consultado el 01/10/2026.*

Por solicitud, se aplica la tarifa de contexto largo si la entrada total (sin caché más en caché) supera 272 000 tokens y la de contexto corto en caso contrario; el costo = (entrada sin caché × tarifa de entrada + entrada en caché × tarifa de caché + salida × tarifa de salida) / 1 000 000, y el costo de un caso es la suma de sus solicitudes.

Los mensajes por ventana son estimaciones del proveedor y no límites garantizados.

Los datos constan también en el archivo versionado del repositorio `01-relevamiento/linea-base/tarifas-congeladas-20261001.json` y un cambio posterior de tarifas no los modifica.
