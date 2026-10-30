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
