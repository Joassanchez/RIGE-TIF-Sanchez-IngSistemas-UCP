# Preguntas probables de la defensa

Reunidas de las revisiones del crítico y del ingeniero (25/09 y 28/09/2026). La columna «Base de la respuesta» indica dónde está el sustento; cuando dice «preparar», el texto no cambia y la respuesta es oral. Se amplía en cada revisión.

## Problema y relevamiento

| # | Pregunta | Base de la respuesta |
|---|---|---|
| 1 | ¿Cuánto del problema queda en pie? ¿Alguna incidencia de C-4 es un comando compuesto? | IV.3; Anexo VI. Falta decir si alguna incidencia de C-4 es un comando compuesto. |
| 2 | Si EMSA no es el ámbito de implantación, ¿para quién es el sistema y por qué valida su referente? | Preparar. |
| 3 | En el Cap. I un valor hora sectorial no servía; ¿por qué en el Cap. X sí? | X.1 separa el sector del problema del sector de los recursos; nombrar D-18. |
| 4 | ¿Por qué coinciden el sector del problema y el de los recursos? | Preparar: la separación es por propósito (II.5.1 acredita el problema; II.5.5, la factibilidad). |
| 5 | ¿De dónde salen las 28 h semanales, frente a las 6 a 8 h de trabajo autónomo que supone la guía? | ADR-052. El respaldo citado es el Instrumento 24, que no está en el repositorio. |

## Validación y modelo del dominio

| # | Pregunta | Base de la respuesta |
|---|---|---|
| 6 | 82 puntos en 35 minutos: ¿se validó o se firmó? | Acta de la sesión del 26/09/2026; constancia firmada pendiente (U-04). |
| 7 | ¿Dónde están la constancia firmada, el acta y las capturas? | U-04; capturas del v0 para A.II.4. |
| 8 | Una regla de permiso nativa no está escrita en ninguna entrada: ¿por qué es una «Declaración»? | Preparar: «declaración» se usa ahí en sentido amplio (definición validada, III.2, Tabla 2). |
| 9 | ¿De cuántas declaraciones se compone un valor implícito? | III.2, Tabla 4 (0..*, con a lo sumo una determinante). |
| 10 | ¿Qué requisito implementa E-02? | Condición de diseño del Cap. VI (PV-05). |

## Arquitectura y prototipo

| # | Pregunta | Base de la respuesta |
|---|---|---|
| 11 | ¿Qué decisión arquitectónica prueba el v1? ¿Por qué no empezó por lo más riesgoso? | Preparar. |
| 12 | La referente prefiere la línea de comandos: ¿por qué el v1 acredita la web? | Preparar; falta una oración en V.5. |
| 13 | ¿Cómo se sabe que el núcleo es independiente con un solo adaptador? | Preparar. |
| 14 | ¿Por qué Bun y no Node, si son 60 líneas puras? | Mismo motor que el oráculo (JavaScriptCore, no V8), sin divergencias en expresiones regulares; prerrequisito único (X.4, D-42). |
| 15 | ¿La copia del código es «sin modificar»? | Copia literal de las funciones puras y transcripción atribuida de las reglas nativas; la fidelidad se verifica contra el oráculo (D-44). |
| 16 | ¿Por qué una base de datos en una herramienta de solo lectura? | ADR-023; esquema reproducible por guion que exige la comprobación del v1 (D-45). |
| 17 | ¿Por qué publicar el esquema de la salida y no una biblioteca? | Publicar el esquema es un contrato de datos acotado; una biblioteca compromete una API mucho mayor. La compatibilidad queda diferida en ambos casos (RNF-08 Should; I.6.5). |
| 18 | ¿El oráculo es reproducible sin red? | Depende del resultado 23 del AE1 (PV-06); imagen común (ADR-054). |

## Entorno y rendimiento

| # | Pregunta | Base de la respuesta |
|---|---|---|
| 19 | ¿Sobre qué proyecto y en qué hardware se miden los 2 s? | ADR-055, ADR-054; RNF-07 (PV-01, PV-02). |
| 20 | ¿Dónde probaron en un Ubuntu real? ¿Por qué no arranque dual? | X.2, X.4. |
| 21 | Una VM también es virtualización: ¿cuál es la diferencia con WSL 2? | X.4. |
| 22 | ¿Por qué la plataforma de referencia es un Linux virtualizado y no el Windows de la referente? | El oráculo y las mediciones viven en Linux; decirlo. |
| 23 | ¿Ya corrieron la medición en el contenedor? | Fase 1 de la medición (AD-26). |

## Planificación y costos

| # | Pregunta | Base de la respuesta |
|---|---|---|
| 24 | Si cae un tercio de la capacidad, ¿qué objetivo no se cumple? | V.4, Tabla 19. |
| 25 | ¿La medición final está dentro de las 190 h? | No: fase de cierre (48 h), valorizada aparte en X. |
| 26 | Si la línea de base consume 23 h, ¿cuántas quedan para corregir el AE1? | X.1, reparto efectivo de la reserva. |
| 27 | ¿USD 20 alcanza? Si el piloto da USD 60, ¿quién paga y hasta cuánto? | Tope de USD 50 con regla de recorte (ADR-057, D-48). |
| 28 | Si suprimen modelos por costo, ¿cómo responden a «un modelo mejor lo resuelve»? | X.3: qué afirmación se debilita al suprimir cada modelo. |
| 29 | ¿Por qué las horas valen $4 millones y la notebook o Claude Pro, cero? | X.3: desembolso incremental frente a costo económico. |
| 30 | Sin Claude Code, ¿siguen siendo 136 h? Construyeron con Anthropic y miden modelos de Anthropic: ¿y el sesgo? | X.4 (D-49); los casos se verifican contra el oráculo y la hoja de respuestas queda fuera del entorno. |
| 31 | ¿Por qué 40 h semanales? ¿Un estudiante cobra el promedio del sector? ¿Para qué el costo de oportunidad si no decide nada? | X.1: supuesto declarado y sesgos en los dos sentidos. |
| 32 | ¿Cuánto cuesta cada versión nueva de OpenCode? | X, soporte posterior. |
| 33 | ¿Docker Desktop es gratuito en su caso? | Sí: Docker Subscription Service Agreement, §3.2 (`docker2026ssa`). |
| 34 | ¿Dónde figura la referente como recurso? | X.1, recurso humano externo sin costo. |

## Modelo de negocios

| # | Pregunta | Base de la respuesta |
|---|---|---|
| 35 | ¿Qué decisión cambió el lienzo? | IV.1. |
| 36 | ¿Cuál es la barrera de entrada si todo es MIT? | IV.1, IV.3: no hay barrera; el proyecto se sostiene por su utilidad. |

## Iteración 2 (permisos) y versión

Decisiones del ingeniero de la iteración 2 (25/10/2026, por delegación del autor) y de la sesión del 30/10/2026. Antes estaban en el índice de fichas de `.trabajo/`, que se descarta.

| # | Pregunta | Base de la respuesta |
|---|---|---|
| 37 | ¿El oráculo no es circular si RIGE copia el evaluador de OpenCode? | No se valida RIGE contra su copia. La cadena se compara con el ruleset que imprime `opencode debug agent` del binario verificado, y la decisión con la ejecución nativa (`opencode --print-logs run` con proveedor simulado, sin modelo): 23 decisiones reales en 7 escenarios coinciden (T2-14b, `ee67136`). Una prueba de arquitectura prohíbe importar `vendor/` desde `pruebas/aceptacion/`, y un mutante de primera coincidencia tiene que hacer fallar las aceptaciones. |
| 38 | El repositorio de OpenCode tiene dos motores de permisos: ¿cuál modela RIGE y por qué? | El v1, que es el que usan `opencode run`, la TUI y la app; el v2 solo atiende la API `/api`. Análisis en `01-relevamiento/opencode/pila-permisos.md`, que corrige `como-funciona.md` (30/10/2026). La línea de base usa `opencode run`. |
| 39 | ¿Por qué RIGE no analiza el comando compuesto de terminal con un analizador como tree-sitter? | RF-08 pide detectar que es compuesto, no decidirlo. Se usa un lexer propio que respeta comillas y escapes, y ante duda el comando se trata como compuesto (falla visible, RNF-02). Así no entra una dependencia nueva (ADR-062). |
| 40 | ¿Por qué modelan las denegaciones de sesión del subagente y no las de `opencode run`? | Se modela lo que OpenCode impone para todo cliente (las de `task.ts`, ADR-081) y se declara en cada decisión lo que depende del cliente (`question`, `plan_enter` y `plan_exit` en `run` no interactivo). |
| 41 | La cadena real de un usuario incluye reglas por los skills de `~/.claude` y `~/.agents`: ¿RIGE las ve? | No: dependen de directorios ajenos a la configuración. `external_directory` se declara como eje parcial (T2-05; `como-funciona.md`, §15, corrección del 30/10/2026). |
| 42 | ¿Por qué no ejecutan `opencode --version` para RF-05? | Tabla 9 de I.6 y ADR-102: ejecutarlo escribe en la configuración global del usuario. La versión se lee del `package.json` del paquete instalado; si no se puede determinar, se declara. |
| 43 | ¿Por qué RF-09 advierte por un `ask` y no solo por un `deny`? | ADR-103: la protección nativa de `.env` es `ask`, y una línea `read: allow` la anula sin aviso, que es el mismo mecanismo que justifica la prioridad de RF-09. |
| 44 | ¿Qué agentes invoca OpenCode sin que el usuario los declare? | `title` en cada sesión (verificado con el binario) y `compaction` al compactar; `summary` está definido sin invocación por nombre en 1.18.25 (evidencia `opencode-agentes-internos-H18`, 30/10/2026). Sus permisos son `* → deny`. |


## Iteración 3 (hallazgos y cierre)

Auditoría de calidad y arquitectura de la iteración 3 (03/11/2026).

| # | Pregunta | Base de la respuesta |
|---|---|---|
| 45 | ¿Por qué RIGE examina el `package.json` del paquete `opencode-ai` ubicado en el `PATH` en lugar de ejecutar `opencode --version`? | Invocar el comando nativo de OpenCode (incluso subcomandos informativos) produce efectos colaterales en el entorno: crea `~/.config/opencode`, escribe logs y altera marcas de tiempo, violando la restricción de solo lectura e inocuidad (ADR-060, Tabla 9 de I.6 y ADR-102). La lectura estática y determinista de `package.json` no tiene efectos colaterales, no depende de tiempos de arranque del runtime y garantiza código de salida 1 sin resultados ante versiones distintas a la 1.18.25. |
| 46 | ¿Cómo asegura RIGE que una regla de permiso previa no se catalogue falsamente como tapada por una posterior ante comodines heterogéneos (`*`, `?`)? | Se implementó un algoritmo formal de inclusión de patrones (`abarca` y `cubreRama` en `@rige/opencode/hallazgos.ts`) basado en programación dinámica bidimensional que evalúa si el lenguaje del patrón posterior contiene estrictamente al anterior con la semántica de tokens de OpenCode (`vendor/wildcard`). Además, mediante el arnés de T3-08 y `MANIFIESTO.json`, se comprobó empíricamente contra el binario nativo que la regla original queda sin efecto en la decisión real (0 falsos positivos, RNF-02). |
| 47 | Dado que Bun incluye APIs nativas de red en su entorno global (`fetch`, `WebSocket`, `node:net`), ¿cómo prueba el proyecto que RIGE no filtra datos hacia el exterior durante el análisis? | La garantía es bidimensional: 1) estática, mediante pruebas de arquitectura (`red.test.ts`) que analizan el AST del código fuente y verifican que ningún módulo fuera del servidor HTTP importe APIs de red; y 2) dinámica, mediante la prueba de aceptación de RNF-05 y el arnés `sin-red.ts`, que ejecuta el análisis completo sobre todos los escenarios precargando una biblioteca que lanza excepción ante llamadas de red (`sin-red-preload.ts`) y auditando con `strace` 0 llamadas `connect` hacia `AF_INET`/`AF_INET6`. La corrida registrada del 04/11/2026, en contenedor con `--network none`, cubre 179 subcomandos sin diferencias. Límite: el conteo es de `connect`, en Linux, y no corre en el CI (ADR-058, RNF-05). |
| 48 | Habiendo incorporado detección de hallazgos (RF-07), formato `ruta:línea:columna` (RF-12), retiro de herramientas (RF-10) y resúmenes de conteos (RF-11), ¿por qué el esquema JSON se mantiene en versión 2 y no avanzó a versión 3? | Siguiendo RNF-08 CA-1 y CA-2, todas las extensiones de la iteración 3 son estrictamente aditivas y opcionales en las estructuras preexistentes (`localizacion?: string`, `herramienta?: ...`), mientras que `hallazgos.json` es un documento nuevo. Las pruebas automatizadas contrastan las salidas contra la instantánea congelada del esquema v2 (`pruebas/esquemas-v2/`) y verifican que ningún consumidor del v2 se rompa al procesar salidas del v3. La versión mayor solo se incrementará ante roturas de contrato o supresión de propiedades obligatorias. |

## Iteración 4 (estabilización y versión congelada)

Auditoría de calidad, rendimiento y portabilidad de la iteración 4 (03/11/2026).

| # | Pregunta | Base de la respuesta |
|---|---|---|
| 49 | ¿Por qué el arnés de RNF-07 mide tiempos internos monotónicos (`performance.now`) desglosados en cuatro etapas además del tiempo global de proceso? | El tiempo global de proceso medido desde el exterior incluye la inicialización del runtime (Bun/V8), la carga de bibliotecas dinámicas del sistema operativo y la resolución de módulos. El desglose monotónico interno en cuatro etapas (`arranqueMs`, `lecturaMs`, `resolucionMs`, `salidaMs`) permite aislar la latencia algorítmica pura de RIGE y demostrar ante el tribunal que la resolución en el núcleo y la evaluación de permisos insumen una fracción mínima (~20-30 ms) del presupuesto de 2000 ms, facilitando el diagnóstico de regresiones en entornos restringidos sin acoplarse a fluctuaciones del planificador del host (RNF-07, ADR-055). |
| 50 | ¿Por qué la normalización con separadores `/` de RNF-06 se aplica exclusivamente en la capa de aserción de pruebas y no en la salida de producción en Windows? | Conforme a ADR-054 y el principio de no interferencia con herramientas del anfitrión, RIGE debe integrarse idiomáticamente en cada sistema operativo: en Windows emite rutas nativas con `\` y en Linux con `/`. Forzar rutas con `/` en la salida estándar de Windows corrompería la interoperabilidad con herramientas nativas de PowerShell, editores y scripts del usuario. La normalización con `/` relativa al proyecto se aplica como un contrato de prueba de aceptación para verificar la equivalencia semántica estricta entre plataformas sin degradar la fidelidad nativa. |
| 51 | El problema de contención de lenguajes regulares ($L(A) \subseteq L(B)$) es PSPACE-completo. ¿Por qué decidieron implementar un algoritmo de programación dinámica ad-hoc (`cubreRama` / `abarca`) en lugar de convertir patrones a autómatas deterministas mínimos o emplear un oráculo puramente empírico por muestreo? | La sintaxis de comodines de OpenCode no es una expresión regular general, sino una subálgebra acotada a literales, `?`, `*` y el sufijo disyuntivo `" *"`. Construir y minimizar DFAs para cada regla dinámica violaría el presupuesto estricto de rendimiento (< 2000 ms en RNF-07) y agregaría dependencias pesadas ajenas al proyecto (violando ADR-062). Por otro lado, un oráculo empírico por muestreo solo puede probar contraejemplos existenciales ($\exists s$), pero es incapaz de certificar contención universal ($\forall s$), lo que generaría falsos positivos catastróficos al declarar tapadas reglas de seguridad activas. La programación dinámica en memoria $O(|B| \cdot |A|)$ resuelve el problema de forma conservadora en microsegundos y con garantía formal estricta. |
| 52 | OpenCode presenta peculiaridades en su función `match`, como transformar únicamente el sufijo final `" *"` en `( .*)?`. ¿Cómo garantiza RIGE que su algoritmo de contención formal no diverja de la semántica del motor nativo? | Mediante dos salvaguardas: 1) descomposición canónica en ramas: la función `ramas()` proyecta el patrón con `" *"` en el par disyuntivo $[P, P \setminus \text{" *"}]$, exigiendo cuantificación universal sobre las ramas de $A$ contra las de $B$; y 2) verificación cruzada automatizada: en cada ejecución de la suite de pruebas se contrasta el algoritmo formal contra el oráculo empírico extraído literalmente del tag 1.18.25 (`vendor/wildcard.ts`), comprobando concordancia absoluta sin falsos positivos en Linux y Windows. |
| 53 | Al optimizar la prueba combinatoria en T4-03 se acotó el espacio de búsqueda exhaustiva a patrones de longitud 3 y cadenas de longitud 4. ¿No introduce esto el riesgo de que existan contraejemplos de mayor longitud no detectados? | No, debido al lema de acoplamiento local de la gramática de comodines: las interacciones no lineales entre comodines contiguos (`**`, `*?`, `?*`, espacios con comodín) alcanzan saturación estructural en secuencias de longitud 3. Además, los fenómenos de mayor longitud (rutas profundas, espacios en nombres de binarios, prefijos absolutos de Windows) se cubren mediante una batería complementaria de casos patológicos dirigidos y escenarios de integración en `MANIFIESTO.json` auditados contra el binario real en CI. |
| 54 | En el script de auditoría de clonado limpio (`auditoria-clonado.ps1`), ¿por qué se antepone en el `PATH` un ejecutable ficticio `opencode.cmd` que retorna código 99? | Funciona como un canario de regresión y prueba empírica de no-ejecución (ADR-060, ADR-102, Tabla 9 de I.6). Si RIGE tuviese un acoplamiento oculto que invocara al binario nativo (por ejemplo para averiguar la versión) en lugar de resolver de forma puramente estática el `package.json` del paquete en `PATH`, el subproceso fallaría inmediatamente con código 99 y abortaría la auditoría. Demuestra de forma hermética que el análisis es 100 % estático y de solo lectura. |
| 55 | OpenCode permite declarar agentes mediante archivos Markdown con frontmatter YAML. ¿Por qué RIGE rehúsa parsear el cuerpo del Markdown o validar su frontmatter, emitiendo la advertencia de `cadena-incompleta`? | Conforme a ADR-105, OpenCode interpreta Markdown mediante un cargador tolerante y no estructurado destinado a instrucciones en lenguaje natural. Intentar inferir agentes, dependencias o permisos desde texto libre sin una especificación formal generaría falsos positivos o falsos negativos (violando RNF-02). RIGE detecta la existencia del agente para el catálogo (RF-06, RF-16), pero declara formalmente `cadena-incompleta` e inhibe el diagnóstico de elementos sin uso para preservar la honestidad del análisis estático. |
| 56 | ¿Por qué la guía de comprobación y la auditoría local exigen clonar el repositorio mediante `git clone --no-hardlinks` en una ruta temporal aislada en lugar de verificar sobre el propio árbol de trabajo del autor? | Para certificar la repetibilidad hermética y la ausencia de artefactos fantasmas (archivos temporales en `node_modules`, bases SQLite locales en `LOCALAPPDATA`, variables `.env` residuales o ficheros sin commitear). Clonar con `--no-hardlinks` garantiza que cualquier evaluador independiente, partiendo únicamente del árbol rastreado por git (`git checkout v1`) y del `bun.lock` inmutable, obtenga idéntico resultado sin depender de configuraciones o privilegios del entorno del autor (RNF-06). |


