# Banco de problemas de la línea de base (ADR-098)

Fuente del marco de la línea de base según ADR-098, aceptado el 19/10/2026. Reemplaza la tabla de `ecologica/tareas.md` como fuente del marco; `tareas.md` queda como hoja que entra al contenedor y se regenera desde aquí. Redactado por el ingeniero (Claude Code, Opus 5.5) el 19/10/2026. **Estado: abierto**, hasta la admisión nativa de E1, de N-10 y de los candidatos de §4.3; se cierra con SHA-256 antes de la tanda. Rutas relativas a la raíz del repositorio. Marcas: **[D]** dato del repositorio, **[S]** suposición, **[VERIFICAR]** pendiente de comprobación antes de cerrar el banco.

## 1. Unidad: el problema

Un problema reúne cinco partes:

1. un **escenario** de configuración: archivos y variables (`espec.py`, `archivos` y `env`);
2. un **pedido** en lenguaje de desarrollador;
3. un **objetivo** comprobable ejecutando OpenCode 1.18.25: agente, permiso, sujeto y decisión esperada;
4. unas **guardas**: lo que no debe cambiar;
5. una forma **correcta** y, en E2, al menos una forma **ingenua** que falla en silencio.

El veredicto lo da el oráculo, nunca el agente. Hay **éxito declarado falso** cuando el agente cierra con `hecho: true` y el oráculo registra `sin_efecto`, `incorrecta` o `colateral`.

## 2. Criterios de inclusión

Todo problema del banco cumple los cinco.

| | Criterio | Cómo se acredita |
|---|---|---|
| C1 | Necesidad real: permisos, modelos o agentes | Constancia de la referente del 15/10/2026, punto 2.2. La encuesta (P12 y P13) se usa después como comprobación, sin modificar el banco |
| C2 | Fuente independiente del mecanismo | Columna «Fuente»: `como-funciona.md` (§), `laboratorio-verificacion.md`, issue de OpenCode o código del tag 1.18.25 |
| C3 | Reproducción nativa sin agente | La correcta logra el objetivo con las guardas intactas. En E2, la ingenua no. En E1, la forma obvia también funciona |
| C4 | Oráculo determinista | Sondas de `corregir_ecologica.py` sobre OpenCode con el proveedor simulado |
| C5 | Pedido sin nombrar el mecanismo | Revisión de la redacción antes de cerrar la hoja |

## 3. Estratos

| Estrato | Qué es | Indicador | Problemas |
|---|---|---|---|
| **E1 · Comunes** | Pedidos frecuentes cuya forma obvia funciona | Principal, informado aparte. Controla «ninguna tarea sin problema lo adquiere» y da la comparación de tokens | C-1 a C-6 (permisos, nuevos, §5) y V-1 a V-4 (valores) |
| **E2 · Mecanismo silencioso** | Existe una forma ingenua verificada que queda sin efecto o rompe una guarda | **Principal: es la línea de base** | 28: 24 de permisos y 4 de valores (§4) |
| **E4 · Síntoma** | El mismo mecanismo de E2, pedido desde el síntoma | Secundario, comparado con su origen; no entra al principal para no contar dos veces el mismo mecanismo | S-1 a S-3 |

Sin E3: V-1 a V-4 son controles, así que van a E1. V-5 a V-8 tienen forma ingenua verificada, así que van a E2 (decisión del autor del 19/10/2026).

**[D]** En `espec.py` todas las M tienen variante ingenua: por eso van a E2. Antes de esta propuesta, E1 no existía.

## 4. E2 · mecanismo silencioso (28 problemas)

### 4.1 Permisos (24)

**Tipo de pedido:**
- **P**, preciso: «hacé que…».
- **G**, diagnóstico: «configuramos X y sigue pudiendo, arreglalo».

**Consecuencia si queda sin efecto:** sale de la decisión del objetivo, en el orden deny < ask < allow.
- **Exposición:** se pidió `deny` o `ask` y queda más permisivo.
- **Bloqueo:** se pidió `allow` y queda más restrictivo.

La consecuencia de cada ejecución la calcula el corrector con la misma regla, sobre el objetivo y sobre cada guarda (§6.2).

**Cobertura de RIGE:**
- RF-02 da la decisión que el agente puede consultar para verificar (CA-2 la obliga a coincidir con el evaluador).
- El RF de diagnóstico explica la causa.
- «Fuera» significa que el MVP no lo cubre.

| Id | Mecanismo | Fuente (C2) | Pedido | Consecuencia | Verificación (RIGE) | Diagnóstico (RIGE) | Admisión nativa |
|---|---|---|---|---|---|---|---|
| M-1 | Regla `read` por archivo con ruta absoluta | #46133 (1.18.21) y #48049 (1.18.29), sobre `read` y `edit`; #40945 (1.18.13), sobre `edit` y `write`; `tool/write.ts` L56 (sujeto relativo al árbol, v1.18.25); ADR-086 | P | Bloqueo | RF-02 CA-9 | RF-07 CA-1 | Hecha (14/10) |
| M-2 | Regla `edit` por archivo con ruta absoluta | #40945, #46133, #48049; `tool/write.ts` L56 (v1.18.25); ADR-086 | P | Bloqueo | RF-02 CA-9 | RF-07 CA-1 | Hecha (14/10) |
| M-3 | Regla raíz frente a regla del agente | como-funciona §7 (orden de autoridad); laboratorio E-11 | P | Bloqueo | RF-02 | RF-02 (cadena) | Hecha (14/10) |
| M-4 | `git push` sin comodín no cubre los argumentos | `core/src/util/wildcard.ts` (coincidencia anclada `^…$`, `git push *` cubre con y sin argumentos, v1.18.25) | P | Exposición | RF-02 | RF-02 (cadena) | Hecha (14/10) |
| M-5 | `external_directory` frente a `read` | como-funciona §8 y §9; #46133 (lectura fuera del árbol con regla absoluta permitida); #40945, solo como antecedente de `edit` y `write` (sujeto relativo con `../`) | P | Bloqueo | RF-02 **[VERIFICAR: el eje `external_directory` en el modelo de acciones]** | RF-02 | Hecha (14/10) |
| M-6 | Agente en markdown y en JSON | laboratorio E-14 y C-12; como-funciona §7 | P | Bloqueo | RF-01, RF-02 | RF-04 | Hecha (14/10) |
| M-7 | Orden de reglas con comodín | como-funciona §8 (`findLast`); laboratorio E-01 y E-02 | P | Exposición | RF-02 | RF-02 (cadena) | Hecha (14/10) |
| M-8 | Subagente sin las reglas del agente padre | laboratorio E-16; como-funciona §12; ADR-081 (`agent/subagent-permissions.ts`) | P | Exposición | RF-02 CA-3 | RF-02 CA-3 | Hecha (14/10) |
| M-9 | `OPENCODE_PERMISSION` frente a la regla raíz | laboratorio E-18a y E-18c; como-funciona §7 | P | Exposición | RF-02 | RF-04 CA-1 | Hecha (14/10) |
| M-10 | Protección nativa de `.env` con ruta absoluta | laboratorio E-04; como-funciona §8; #46133, #48049 | P | Bloqueo | RF-02 CA-9 | RF-06, RF-07 | Hecha (14/10) |
| N-1 | Posición heredada de la clave al fusionar | como-funciona §4; laboratorio E-01, E-02 y C-8 | P | Exposición | RF-02 | RF-02 (cadena) | Hecha (15/10) |
| N-2 | `.opencode/` anidados | como-funciona §5; #21307, #45266 | P | Bloqueo | RF-02 | RF-04 | Hecha (15/10) |
| N-3 | Misma clave en agente JSON y markdown | laboratorio E-14 y C-12 | P | Bloqueo | RF-01, RF-02 | RF-04 | Hecha (15/10) |
| N-4 | `OPENCODE_PERMISSION` inválido descartado | laboratorio E-18b y E-18b2; como-funciona §17 | G | Exposición | RF-02 | RF-07 CA-1 | Hecha (15/10) |
| N-5 | `allow` global debilita a `plan` | como-funciona §7; laboratorio E-03; #39715 | P | Bloqueo (la ingenua expone a `plan`) | RF-02 | RF-09 | Hecha (15/10) |
| N-6 | Claves PascalCase traídas de Claude Code | #15507 | G | Exposición | RF-02 | **[VERIFICAR: ¿RF-07 «elementos sin uso» cubre claves desconocidas?]** | Hecha (15/10) |
| N-7 | `read: deny` no impide `grep` ni bash | #35503 (1.17.13), solo para `grep`: se evalúa el patrón de búsqueda y no cada archivo; como-funciona §8 (ejes: `read` no gobierna `bash`) para la vía de terminal; vigencia en 1.18.25 solo por la admisión nativa | P | Exposición | RF-02 **[VERIFICAR: eje `grep` con el patrón como sujeto]**; RF-08 si el agente usa un comando compuesto | RF-02 | Hecha (15/10) |
| N-9 | `tools` frente a `permission` | #15664; laboratorio E-11 (#46873 retirado: es de 1.18.26 y afirma que 1.18.25 funcionaba) | P | Exposición | **Fuera**: RF-10 es Should y no integra el MVP | Fuera | Hecha (15/10) |
| N-10 | `permission.skill` en el frontmatter | #41712 | P | Exposición | RF-02 **[VERIFICAR: eje `skill`]** | RF-04 | **Pendiente**: falla la captura |
| N-11 | Configuración global como enlace simbólico | #39738 (desde ~1.18.x) | P | Exposición | RF-02, si RIGE descarta igual que OpenCode **[VERIFICAR]** | RF-07 («entradas descartadas sin error visible») | Hecha (15/10) |
| N-12 | Lista de permitidos parcial con valores nativos | #47819 (1.18.29); como-funciona §8 | P | Exposición | RF-02 | RF-06 | Hecha (15/10) |
| N-13 | `write` consulta la regla de `edit` | #40150 y su comentario; `tool/write.ts` L54-56 (pide `edit`, v1.18.25) | P | Exposición | RF-02 **[VERIFICAR: ejes de §8, «Los ejes de permiso»]** | RF-02 | Hecha (15/10) |
| N-14 | `list: deny` no impide `read` del directorio | #40150, comentario (`list` declarado e inerte: no hay herramienta `list`); `core/src/tool/read.ts` L72 (el directorio se pide como `read`, v1.18.25) | P | Exposición | RF-02 **[VERIFICAR: ídem]** | RF-02 | Hecha (15/10) |
| N-15 | YAML inválido descarta el endurecimiento | #45876, #24181, #18017; `config/agent.ts` L19 (`.catch(() => undefined)`, v1.18.25) | G | Exposición | RF-02 | RF-04 CA-2, RF-07 | Hecha (15/10) |

**Resumen [D]:**
- 24 problemas: 15 de exposición y 9 de bloqueo; 21 pedidos precisos y 3 de diagnóstico.
- La cobertura no condiciona la medición: se revisa después de la línea de base y antes del corte del 07/11 (ADR-098, punto 8).
- Cobertura del MVP: 17 con verificación sin dudas, 6 por verificar (M-5, N-7, N-10, N-11, N-13 y N-14) y 1 fuera (N-9). Salvo N-11, la duda es la misma: qué ejes de permiso abarca el modelo de acciones de RF-02.

### 4.2 Valores (4)

Consecuencia: **valor distinto**. Pedido: P en los cuatro. Admisión nativa hecha el 15/10 (`verificacion/20261015-exploracion/salida2/`).

| Id | Mecanismo | Fuente (C2) | Verificación (RIGE) | Diagnóstico (RIGE) |
|---|---|---|---|---|
| V-5 | `OPENCODE_CONFIG` frente a un agente markdown global | #36663; laboratorio E-12 | RF-01 | RF-04 |
| V-6 | `{env:VAR}` sin la variable queda como cadena vacía | como-funciona §6; laboratorio E-12; #33853 (1.17.9) | RF-01 | RF-07 («sustituciones sin valor») |
| V-7 | `prompt` del frontmatter reemplazado por el cuerpo vacío | #47616; `config/agent.ts` L24-27 (`prompt: md.content.trim()` pisa el del frontmatter, v1.18.25) | RF-01 **[VERIFICAR: ¿el prompt es una clave que RF-01 resuelve?]** | RF-01 (desplazadas) |
| V-8 | `instructions` dentro de un agente no carga archivos | #35512 (antes `[DATO PENDIENTE]`) | RF-01 **[VERIFICAR: ídem]** | **[VERIFICAR]** |

**Nota [D]:** la variante con ruta absoluta de M-1, M-2 y M-10 se conoció por la medición con agentes del 14/10 (ADR-086). El 19/10 aparecieron tres fuentes independientes, anteriores a esa medición: #46133 (29/08/2026, 1.18.21) y #48049 (09/09/2026, 1.18.29), sobre `read` y `edit`, y #40945 (06/08/2026, 1.18.13), sobre `edit` y `write`, que la describe como «fail-open for deny rules». Ya no depende de nuestra medición.

### 4.3 Candidatos nuevos (19/10/2026; admisión nativa pendiente)

Cumplen C2 con la fuente indicada. Entran a E2 solo si pasan C3 en el contenedor, sin agente, antes de cerrar la hoja.

| Id | Mecanismo | Fuente (C2) | Pedido (borrador) | Consecuencia | Observación |
|---|---|---|---|---|---|
| N-20 | `external_directory` no cubre lecturas por bash con verbos fuera de su lista | laboratorio R-3 y E-05; como-funciona §9 | «Que `build` no pueda leer nada de `~/secretos`» (con bash permitido) | Exposición | En Windows se verificó con `type`. En Linux (`tail`, `sed`, `grep`) consta como `[POR VERIFICAR]`: la admisión lo resuelve |
| N-21 | La documentación dice que `.env` se deniega, pero la herramienta pregunta | como-funciona §8 y §17; `agent/agent.ts:132` | «Asegurate de que `build` no pueda leer `.env` en ningún caso: que se deniegue, no que pregunte» | Exposición | Éxito declarado falso sin ningún cambio: el agente confía en la documentación |
| N-22 | `todowrite` en un subagente exige una regla con el identificador exacto | laboratorio E-16; como-funciona §12; RF-02 CA-3. #19101 solo como antecedente: el reporte afirma que también fallaba la regla exacta (discrepancia del verificador, 19/10) | «Que el subagente `general` pueda usar la lista de tareas» | Bloqueo | La forma ingenua es `"*": "allow"` en el subagente. La admisión decide: si en 1.18.25 tampoco funciona la regla exacta, no hay forma correcta y la tarea se retira |
| N-23 | `deny` con ruta absoluta que nunca coincide | #46133 y #48049 (`read`); #40945 («fail-open for deny rules», `edit` y `write`) | «Que `build` no pueda leer `config/credenciales.json`» | Exposición | Es el mismo mecanismo que M-1, M-2 y M-10, con la consecuencia inversa. Para Y (mecanismos distintos) se cuenta una sola vez |
| V-9 | `.opencode/AGENTS.md` no se carga | laboratorio E-13; como-funciona §14 | «Agregá para todos los agentes del proyecto la instrucción "Respondé siempre en español"» | Valor distinto | El oráculo lee el prompt del sistema que recibe el proveedor simulado |
| V-10 | Clave desconocida dentro de `mcp.<nombre>` descartada sin aviso (`env` en lugar de `environment`) | #39431 (1.18.9) y los relacionados que cita (#36434, #30892, #35860, #39135, #26332, #35867) | «Configurá el servidor MCP `docs` con la variable `API_TOKEN`» | Valor distinto | Es un error frecuente: siete issues |

**Menor prioridad.** Están cerrados como completados y pueden estar corregidos antes de 1.18.25. Entran solo si la admisión los reproduce:
- **N-24:** `OPENCODE_CONFIG_CONTENT` frente a `.opencode/` (#11628).
- **N-25:** patrones con `--` en bash (#27575).

### 4.3.1 Resultado de la admisión nativa (19/10/2026)

**Cómo se hizo:**
- Contenedor `rige-linea-base:1.18.25`, imagen `2895dcfd68e7`, reconstruida el 19/10/2026 con el digest de Ubuntu y el SHA-256 del binario contrastados el 13/10.
- Sin red y sin agentes, con los scripts de MED-12.
- De 00:20 a 02:12 UTC del 20/10/2026.

**Evidencia:** `verificacion/20261019-admision/salida/admision.json`, con hashes de toda la captura. Los 16.506 registros crudos de las sondas (109 MB) quedan fuera del repositorio, en `C:/Users/Joa/evidencia-med12-admision-20261019/salida/`, cubiertos por `hashes_evidencia`.

| Id | Resultado | Motivo |
|---|---|---|
| C-1 a C-6 | **Admitidas** | La forma correcta y la obvia logran el objetivo con las guardas intactas |
| N-10 | **Admitida** | La captura corregida reproduce el contraste: la ingenua del frontmatter queda sin efecto |
| N-21 | **Admitida** | Sin cambios, `.env` queda en `ask` y no en el `deny` pedido |
| N-23 | **Admitida** | El `deny` con ruta absoluta queda sin efecto |
| N-24 | **Admitida** | La forma ingenua en `.opencode/` queda sin efecto |
| V-9 | **Admitida** | `.opencode/AGENTS.md` no llega al prompt del sistema |
| V-10 | **Admitida** | `env` en lugar de `environment` se descarta |
| N-20 | **Retirada** | No hay forma correcta limpia: cerrar bash cambia 10 sondas ajenas al objetivo |
| N-22 | **Retirada** | El comodín también habilita `todowrite` en 1.18.25: no hay trampa. Coincide con #19101, cerrado como completado |
| N-25 | **Retirada** | El patrón con `--` también funciona en 1.18.25: no hay trampa. Coincide con #27575, cerrado como completado |

**Composición resultante:**
- E1: 10 (C-1 a C-6 y V-1 a V-4).
- E2: 33 (los 28 anteriores más N-21, N-23, N-24, V-9 y V-10).
- E4: 3.

Son 46 tareas en total: 276 ejecuciones con dos ejecutores y k = 3.

### 4.4 Descartados el 19/10/2026

| Fuente | Motivo |
|---|---|
| #46873 | Es de 1.18.26 y afirma que 1.18.25 funcionaba. Retirado como fuente de N-9 |
| #38351 (1.18.3) | Describe lo contrario de #40945, #46133 y #48049 (relativo que no coincide). Hubo un cambio dentro de la serie 1.18, y la admisión del 14/10 confirma el comportamiento posterior |
| #43669, #54786, #55593, #48456, #50149, #52284, #54214 | OpenCode 2 (beta o 2.x), no 1.18.25 |
| #51504 | Permisos de herramientas MCP: requiere un servidor MCP en ejecución, fuera del oráculo |
| #28876 (N-8) | Aprobaciones persistidas: sin un inicializador determinista (MED-11) |
| #25254 (`doom_loop`), #29594 (`default_agent` en la TUI) | MED-11 no registró el motivo de su exclusión. Evaluación del 19/10: requieren una sesión en curso o la TUI, y el oráculo usa `opencode run` sin TUI. Cierra el `[DATO PENDIENTE]` de ADR-097 |
| #32465, #33888, #37544, #31919, #41162, #6806, #38149, #10950 | Opciones de proveedor o de modelo que solo se observan en la llamada real al proveedor. Fuera del oráculo |
| #27133 (1.14.48) | Archivos `mode/` inválidos. Mecanismo heredado, sin verificación en 1.18.25. Queda como posible adición en noviembre |
| Issues de Desktop, TUI, ACP y facturación | Fuera del objeto: la CLI y la configuración |

## 5. E1 · comunes (conformidad del autor del 19/10/2026; admisión nativa pendiente)

Pedidos frecuentes de las mismas familias. En todos, la forma obvia (editar el único archivo que existe y agregar la regla al final) funciona. Se admiten con C3 antes de cerrar el banco. Los textos son borradores.

| Id | Escenario inicial | Pedido | Objetivo | Guardas |
|---|---|---|---|---|
| C-1 | Proyecto sin `permission` | Que `build` pida aprobación antes de modificar cualquier archivo | `build` edit `src/index.js` → ask | read y `ls` sin cambio |
| C-2 | Proyecto con `bash: {"*": "ask"}` | Que `build` pueda correr `npm run lint` sin pedir aprobación | `npm run lint` → allow | `npm install` ask; `rm -rf dist` ask |
| C-3 | Proyecto sin `permission` | Que `build` no pueda consultar páginas web | webfetch → deny | read, edit y `ls` sin cambio |
| C-4 | Proyecto con `agent.build.permission.edit: deny` | Que `build` vuelva a poder modificar archivos sin pedir aprobación | edit → allow | bash y read sin cambio |
| C-5 | Global con `bash: {"*": "allow"}` | Que `build` pida aprobación antes de `git commit` | `git commit -m x` → ask | `git status`, `npm test` allow |
| C-6 | Proyecto con un agente `revisor` en JSON y `edit: allow` | Que `revisor` no pueda modificar archivos | `revisor` edit → deny | `revisor` read y `ls`; `build` sin cambio |

**[S]** C-2 y C-5 rozan el mecanismo de orden (M-7). Se admiten solo si la forma obvia, que agrega la regla al final del objeto existente, funciona en 1.18.25.

## 6. Cambios al instrumento (ficha para Codex, después de aceptar)

1. **Instrucción sin hoja de referencia.** El brazo base recibe la documentación local, `webfetch` y la skill nativa `customize-opencode`. Se retira la línea de `/home/evaluador/tarea/hoja-referencia.md` de la instrucción de `tareas.md` y de la imagen. **[D]** La hoja actual es la de atribución, escrita para personas («soltá el teclado y el mouse»). Afirma una fusión «sólo en las claves en conflicto» que C-12 contradice, y señala `opencode debug agent`, la herramienta con la que el agente «verificó» en falso la ruta absoluta (ADR-086).
2. **Colaterales completos.** La batería común ya captura permisos de los sujetos públicos (`ecologica/LEEME.md`, «Una batería común…»), pero `clasificar()` compara solo las guardas declaradas (`herramientas/corregir_ecologica.py`, líneas 62 a 68). Cambio: cualquier diferencia de la batería entre el antes y el después que no sea el objetivo cuenta como colateral, con el campo `colateral_bateria` separado de `colateral_guarda`.
3. **Consecuencia por ejecución.** Con el orden deny < ask < allow, se marca `exposicion` si el objetivo o una sonda queda más permisivo que lo esperado, y `bloqueo` si queda más restrictivo.
4. **Estratos en el análisis.** `analizar.py` informa por estrato, sin totales mezclados. Por tarea da la fracción de las 3 repeticiones y la sensibilidad 1 de 3 frente a 2 de 3.
5. **N-10:** corregir la captura. Si no se reproduce, se retira con su motivo.
6. **E1:** escenarios C-1 a C-6 en `espec.py` y su admisión nativa.
7. **Detección:** sembrar las formas ingenuas de los N admitidos en el corpus de `ecologica/corpus.py`, con sus controles correctos.
8. **Proceso por traza** (ADR-098, punto 10):
   - clasificador de lecturas por bash;
   - capa editada frente a la capa de la forma correcta;
   - tipo de verificación posterior a la última edición: ninguna, declarativa, de comportamiento o RIGE.
   La capa de la forma correcta sale de `variantes["correcta"]` de cada problema.
9. **Tokens y turnos** (ADR-098, punto 9): comparación entre corridas con el mismo resultado y `solicitudes` en el análisis.

## 7. Frase de la línea de base (forma prevista)

> Con OpenCode 1.18.25 y el procedimiento delegado (agente `build`, `gpt-6.1-sol`, k = 3), de **T** problemas con mecanismo silencioso documentado, **X** terminan con éxito declarado falso en al menos 2 de 3 repeticiones, en **Y** mecanismos distintos; en **Z** de ellos el resultado deja habilitado algo que el desarrollador pidió cerrar, y en **V** deja un valor distinto del pedido. En **C** pedidos comunes, **W**.

## 8. Registro de la verificación de fuentes (19/10/2026)

- **Locales:** `01-relevamiento/opencode/como-funciona.md` (§4 a §17), `laboratorio-verificacion.md` (E-00 a E-18, R-3, C-8, C-11 y C-12) e `incidencias.md` (46 candidatos).
- **GitHub (API pública, `anomalyco/opencode`):**
  - 20 issues citados, leídos en su texto completo;
  - 7 búsquedas por título: «silently ignored», «silently» con permission o config, «instructions» con agent, «no effect», «not applied» y «ignored» con frontmatter;
  - 13 candidatos leídos en detalle y el comentario de #40150.
- **Código del tag `v1.18.25`** (`raw.githubusercontent.com`): `opencode/src/tool/write.ts`, `core/src/tool/read.ts`, `opencode/src/config/agent.ts` y `core/src/util/wildcard.ts`. Las líneas citadas coinciden con lo afirmado.
- **Resultado:**
  - las 28 fuentes de E2 están verificadas;
  - V-8 tiene fuente (#35512);
  - N-9 pierde #46873;
  - M-1, M-2 y M-10 tienen ahora fuentes independientes;
  - hay 6 candidatos nuevos (§4.3) y 2 de menor prioridad.
- **Alta en `fuentes.md` (19/10/2026):** 16 incidencias verificadas por el verificador de fuentes (Codex con búsqueda web), con copia JSON en `01-relevamiento/evidencia/<clave>_20261019.json`. #53784 no se da de alta: es de OpenCode 2.0.24 y duplica #33853. #15664, #21307, #36663, #41712 y #45266 ya estaban cubiertas por `incidencias-opencode`. Discrepancias aplicadas: #19101 queda como antecedente de N-22; #40945 se limita a `edit` y `write`; #35503, a `grep`. **Pendiente (autor):** revisar las 16 filas.
