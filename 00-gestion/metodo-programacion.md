# Método de programación de RIGE (herramienta de trabajo)

Reúne los ex ADR-065 y ADR-067, que salen del registro de decisiones el 22/10/2026 por decisión del autor: son decisiones sobre las herramientas de trabajo y no sobre RIGE (preferencia del autor: «sin ADR para las herramientas de trabajo»). El contenido no cambia. Las menciones a «ADR-065» y «ADR-067» en otros documentos, incluido `src/`, se leen aquí (`decisiones/INDICE.md`, «Equivalencias»).

## ADR-065 — Método de programación de RIGE: esquema mixto, con reglas del proyecto en el repositorio, programación en OpenCode con gentle-ai en modo ODD y diseño y revisión en el sistema de agentes del TIF

- Estado: aceptado (29/09/2026); revisado el 29/09/2026 por excepción autorizada por el autor (ver «Decisión del autor»)
- Fecha: 29/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2 en forma directa. Afecta `src/AGENTS.md`, `src/odd/tasks/` (documentos de incremento), `src/README.md` (sección 8, declaración de herramientas auxiliares), la bitácora (AD-24), el arnés de pruebas de `src/pruebas/` y, por la declaración de los modelos usados, el Cap. X (X.3, X.4) y el Instrumento 34
- Origen: sesión del 29/09/2026. El autor planteó programar con gentle-ai, que ya tiene instalado en OpenCode, y preguntó por la conveniencia de Gentle Shell, de integrar todo en el sistema de agentes del TIF o de un esquema mixto. En la misma sesión, al preparar el primer incremento, el autor pidió reanalizar la elección sin atarse a lo decidido e introdujo ODD (Organic Driven Development)
- Relacionado: aplica ADR-058 (estructura de `src/`, pruebas de arquitectura, convenciones) y ADR-060 (contrato del adaptador y rastro), ambos aceptados el 29/09/2026; ADR-032 (stack); ADR-054 (entorno de referencia); ADR-062 (arnés de pruebas, C6; vías observadas, C8). Se relaciona con AD-24 (declaración de herramientas) y con AR-00 (actualización de `src/AGENTS.md`)

#### Contexto

Con ADR-058 y ADR-060 se puede empezar a escribir el núcleo. Falta decidir con qué herramientas y bajo qué reglas se programa.

**Datos del repositorio y de la verificación (registro original):**

- **El autor usa OpenCode con gentle-ai** (configurador MIT de Gentleman Programming que instala flujo de trabajo, skills, memoria y una persona). En `~/.config/opencode/` constan `AGENTS.md` (persona de gentle-ai), `opencode.json`, `plugins/`, `skills/` y `commands/` (listado del 29/09/2026).
- **Los estudios sobre OpenCode estuvieron aislados de esa configuración.** El laboratorio corrió cada sesión con `HOME`, `USERPROFILE` y `XDG_*` redirigidos a `./oc-lab/home/`, con una única fuga declarada: el directorio `state` (`01-relevamiento/opencode/laboratorio-verificacion.md`, «Aislamiento»). La medición de la línea de base corre en el contenedor con usuarios propios (ADR-054). El 29/09/2026 no había variables `OPENCODE_*` definidas en el entorno del autor ni archivos `opencode.json` o `.opencode` en `C:\Users\Joa` o en `Documents`.
- **Carga de instrucciones de OpenCode 1.18.25** (`packages/opencode/src/session/instruction.ts:60-67, 115-125`, tag verificado en ADR-060): carga el primer archivo global que exista entre `<config>/AGENTS.md` y `~/.claude/CLAUDE.md`. En el proyecto, subiendo desde el directorio de trabajo hasta la raíz del worktree, carga el primer **tipo** de archivo que encuentre en el orden `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`. Abierto en `src/`, carga `src/AGENTS.md` y ningún `CLAUDE.md`. Abierto en la raíz del repositorio, que no tiene `AGENTS.md`, cargaría el `CLAUDE.md` raíz (rol del ingeniero del TIF) junto con la persona de gentle-ai.
- **La persona de gentle-ai** indica «Never add "Co-Authored-By" or AI attribution to commits», respuestas cortas y no presentar alternativas salvo bifurcación real (`~/.config/opencode/AGENTS.md`).
- **Guía de comprobación del v1:** el `README.md` del prototipo declara las herramientas auxiliares con herramienta, función y artefacto afectado (`00-gestion/reglas-catedra.md`, sección 7).
- **Gentle Shell** (consultado el 29/09/2026, https://github.com/Gentleman-Programming/gentle-shell): entorno de trabajo sobre Pi, versión 3.5.1, licencia MIT, del mismo autor que gentle-ai y con el mismo flujo. La documentación consultada no indica qué proveedores de modelos admite.

**Datos incorporados en la revisión del 29/09/2026:**

- **Flujo de gentle-ai 2.1.11**, instalado entonces: el agente por defecto de OpenCode es `gentle-orchestrator`, que recorre un ciclo SDD de ocho fases (`sdd-explore` a `sdd-archive`). Genera unos seis artefactos por cambio en `openspec/`, en la raíz del repositorio git, o en Engram. Activa TDD estricto con evidencia rojo-verde-refactorización cuando detecta un ejecutor de pruebas (`~/.config/opencode/skills/sdd-init/SKILL.md`, `sdd-apply/SKILL.md`, `_shared/openspec-convention.md`). En este proyecto esos artefactos duplican el catálogo (criterios de aceptación) y los ADR (diseño), y `sdd-design` puede volver a decidir arquitectura por fuera de los ADR.
- **ODD en gentle-ai 3.x** (documentación oficial, `docs/usage.md` e `intended-usage.md`, consultada el 29/09/2026; versión 3.7.0 del 23/09/2026):
  - protocolo: autorizar → explorar → resolver dudas → clasificar → registrar antes de la primera escritura → implementar tarea por tarea → cerrar con evidencia;
  - **un solo documento por funcionalidad**, `odd/tasks/<nombre>.md`, con objetivo, problema, por qué, alcance, restricciones, tareas con ID y criterios de aceptación, evidencia, progreso y siguiente paso; el trabajo chico no genera artefactos;
  - TDD según el modo configurado («la presencia de pruebas sola no activa TDD»);
  - cada tarea cierra con un commit por unidad de trabajo **en una rama de la funcionalidad**; subir, abrir la solicitud de integración y unir con la rama principal son decisiones del usuario;
  - revisión por recibos (RDD), activada por el usuario, con revisores de otras familias de modelos.
- **Protocolo ODD instalado** (prompt de `gentle-orchestrator` en `~/.config/opencode/opencode.json`, después de actualizar): la ruta del documento es relativa (`odd/tasks/<feature-name>.md`), y un documento existente se retoma («Resume an interrupted feature … then the task file itself»).
- **Instalación en Windows:** gentle-ai 3.x no publica binarios para Windows ni actualiza su bucket de scoop hasta contar con firma de código; se instala compilando con Go (nota de la versión 3.7.0). El autor lo instaló así el 29/09/2026 (`~/go/bin/gentle-ai.exe`, versión 3.7.0) y lo sincronizó con OpenCode.
- **Instalación en Claude Code, revertida.** La sincronización incorporó también a Claude Code (preset `full-gentleman`): un `~/.claude/CLAUDE.md` global con el protocolo ODD «en cada pedido» (creación de `odd/` y commits sin pedir permiso), ganchos en cada mensaje y en cada delegación, y `"defaultMode": "bypassPermissions"`. Eso ponía en conflicto las instrucciones del sistema de agentes del TIF y eliminaba las confirmaciones del autor. Se desinstaló de Claude Code (`gentle-ai uninstall --agent claude-code`) y se restauró `~/.claude/settings.json` desde la instantánea previa a la instalación. OpenCode conserva gentle-ai 3.7.0.
- **Modelos que usa gentle-ai en OpenCode** (`~/.config/opencode/opencode.json` y `~/.gentle-ai/state.json`): `deepseek-v4-pro`, `kimi-k2.7-code`, `qwen3.7`, `glm-5.2` a través del proveedor `opencode-go`, y modelos de `openai` y `github-copilot` en algunos revisores. Ninguno de Anthropic. Su costo no está declarado en el Cap. X: `[DATO PENDIENTE: condición y costo de la suscripción a opencode-go y de los demás proveedores]`.
- **Proyecto del repositorio:** `.claude/settings.json` niega a Claude Code toda operación de git que modifique el repositorio (`commit`, `add`, `push`, `checkout`, `branch -d`, etc.). OpenCode no lee ese archivo.

#### Alternativas evaluadas

**Registro original:**
- **H-1 · Gentle Shell** como entorno de programación.
- **H-2 · Todo en el sistema de agentes del TIF:** un flujo propio de programación en este repositorio.
- **H-3 · Mixto:** reglas propias de RIGE en el repositorio; disciplina genérica de programación aportada por gentle-ai en OpenCode; diseño, planes y revisión en el sistema de agentes del TIF.

**Revisión del 29/09/2026** (reanálisis pedido por el autor, con criterios fijados antes de puntuar):
- **O1:** solo Claude Code (una sesión programa, otra revisa).
- **O2:** OpenCode con gentle-ai y ciclo SDD completo.
- **O3:** OpenCode con el agente nativo `build`, sin orquestador.
- **O4:** Claude Code programa; gentle-ai en OpenCode revisa.
- **O5:** el autor programa; la IA solo consulta y revisa.
- **O6:** agentes propios.
- **O7:** OpenCode con gentle-ai 3.7 en modo ODD; el documento de cada incremento lo escribe el sistema de agentes del TIF.

#### Análisis (trade-offs)

**Registro original:**
- **H-1** aporta un flujo curado, pero no conoce los ADR ni los criterios, y suma un tercer runtime con su propia declaración.
- **H-2** mantiene un solo sistema, pero obliga a construir desde cero una disciplina genérica que ya existe curada.
- **H-3** separa la disciplina genérica, resuelta por una herramienta curada, de la propia de RIGE, que queda en el repositorio (`src/AGENTS.md`, `pruebas/arquitectura/`, `pruebas/aceptacion/`). Cambiar de herramienta no rompe nada, y lo que se defiende es evidencia que el CI ejecuta.

**Revisión del 29/09/2026.** Se puntuaron las opciones (1 a 3) con nueve criterios tomados del proyecto:
- calidad y fidelidad (RNF-02);
- conformidad con los ADR;
- evidencia para el tribunal;
- independencia entre quien escribe y quien revisa;
- costo y declaración (Cap. X);
- configuración y mantenimiento;
- continuidad ante límites de un proveedor;
- capacidad del autor de explicar el código;
- horas (ADR-052).

| Opción | Total | Con calidad y horas ×2 |
|---|---|---|
| O1 · solo Claude Code | 21 | 27 |
| O2 · gentle-ai con SDD | 15 | 19 |
| O3 · OpenCode `build` | 17 | 21 |
| O4 · Claude escribe, gentle-ai revisa | 24 | 30 |
| O5 · a mano | 24 | 27 |
| O6 · agentes propios | 16 | 19 |
| O7 · gentle-ai 3.7 con ODD | 22 a 23 | 27 a 28 |

- **O1** pierde en independencia (el mismo proveedor escribe y revisa) y en continuidad.
- **O2** pierde en conformidad (rediseña) y en cantidad de artefactos.
- **O4 y O7** quedan próximas. O7 conserva la herramienta elegida en el registro original y trae de fábrica el registro de evidencia en un solo documento. Su costo es la instalación por compilación en Windows y la declaración de modelos de otros proveedores.
- El ingeniero advirtió un sesgo posible hacia O1 (es Claude Code) y un sesgo inicial a favor de la comodidad que el puntaje corrigió. La calidad relativa de los modelos que escriben el código es una suposición y no se ponderó más allá de un punto.

#### Recomendación y fundamento

**H-3 en la forma O7**, con estas reglas:

1. **Reglas del proyecto en el repositorio.** `src/AGENTS.md` reúne las reglas de dependencia, las restricciones no negociables, las convenciones de ADR-058 y ADR-062 y el contrato de ADR-060, y declara que prevalecen sobre las instrucciones globales del agente dentro de `src/`. Las garantías se verifican con pruebas: una por criterio de aceptación, con el ID en el nombre, y las de arquitectura de ADR-058.
2. **OpenCode se abre en `src/`**, nunca en la raíz del repositorio.
3. **Un documento ODD por incremento, acordado antes de programar.** El proceso es el siguiente:
   - el sistema de agentes del TIF entrega al autor un **prompt de contexto** (objetivo, ADR y criterios aplicables, restricciones, datos verificados);
   - el agente de OpenCode explora y **propone su propio documento** `src/odd/tasks/<incremento>.md`, y se detiene antes de la primera escritura de código;
   - el sistema de agentes del TIF lo revisa contra los ADR y el catálogo, con el autor como intermediario, **en iteraciones hasta la conformidad de ambos**;
   - recién entonces se implementa;
   - al terminar, el sistema de agentes del TIF revisa el diff de la rama y entrega un prompt de correcciones, que se itera hasta el cierre.
   
   Cada prompt y cada revisión se guardan en `.trabajo/revisiones/`. Se usa el flujo orgánico de ODD; **no se usa el ciclo SDD** ni `openspec/`, que duplicarían el catálogo y los ADR.
4. **TDD estricto**, declarado en `src/AGENTS.md` (ejecutor `bun test`), con la tabla de evidencia rojo-verde-refactorización en el documento del incremento.
5. **Commits del agente solo en la rama del incremento**, con mensajes Conventional Commits. El autor revisa, une con `main` y sube. El agente nunca sube, nunca une y nunca crea etiquetas.
6. **Reparto:**

   | Qué | Dónde |
   |---|---|
   | Diseño, ADR y prompt de contexto de cada incremento | Sistema de agentes del TIF (Claude Code), antes de programar |
   | Documento ODD del incremento | Lo propone el agente de OpenCode; lo revisa el sistema de agentes del TIF hasta la conformidad |
   | Código, pruebas y commits en la rama del incremento | OpenCode con gentle-ai 3.7 (ODD), abierto en `src/` |
   | Revisión de otra familia de modelos | Revisores de gentle-ai (RDD o `judgment-day`), si el autor los activa |
   | Revisión contra los ADR y los criterios | Sistema de agentes del TIF, sobre el diff de la rama, antes de que el autor una con `main` |
   | Guardarraíles | Pruebas de arquitectura y de aceptación en el CI |
   | Oráculo | OpenCode 1.18.25 exacto, en WSL o en el contenedor (ADR-029, ADR-054), nunca el de uso diario |

7. **gentle-ai no se instala en Claude Code.** El sistema de agentes del TIF conserva sus instrucciones y las confirmaciones del autor.
8. **Pruebas aisladas de la configuración real** (ADR-062, C6). La configuración real del autor nunca sirve como escenario ni como resultado de referencia.
9. **Declaración.** En la sección 8 de `src/README.md` y en la bitácora (AD-24):
   - OpenCode con gentle-ai 3.7, con los modelos efectivamente usados (función: generación y edición asistida de código y pruebas, y commits en la rama del incremento; artefacto: `src/`);
   - el sistema de agentes del TIF (función: diseño, documentos de incremento y revisión).

**Fundamento.** Aprovecha una herramienta curada sin delegarle las reglas de RIGE. Reduce los artefactos a un documento por incremento que coincide con el plan que el diseño ya requería. Deja la evidencia de cumplimiento en pruebas ejecutables, en la tabla de TDD y en los commits por unidad de trabajo. Y mantiene separados el sistema que diseña y revisa y el que escribe.

**Condición que invalidaría la recomendación:**
- Que en el primer incremento el agente ignore o contradiga `src/AGENTS.md` o el documento ODD de manera recurrente (dependencias prohibidas, pruebas sin criterio, escritura fuera de `src/`, decisiones de diseño propias). En ese caso se pasa a O4, con el mismo documento de incremento.
- Que la exploración de ODD proponga cambios de arquitectura que contradigan los ADR.
- Que gentle-ai deje de compilar o de correr en Windows (firma de código, Control inteligente de aplicaciones). En ese caso, O4.
- Que la cátedra objete el uso de un asistente de programación o exija otra forma de declararlo.

#### Decisión del autor

Aceptado por el autor el 29/09/2026 (`/aceptar ADR-065`). En la sesión del 29/09/2026 el autor manifestó conformidad con el esquema mixto y pidió registrarlo junto con el borrador de `src/AGENTS.md`.

**Revisión del 29/09/2026 (excepción autorizada por el autor).** Al preparar el incremento 0, el autor objetó la cantidad de artefactos de SDD, introdujo ODD y pidió reanalizar la elección sin atarse a lo decidido. Eligió O7 y la instalación de gentle-ai 3.7.0, que realizó él mismo. Después pidió desinstalarlo de Claude Code. Por el alcance acotado del cambio, decidió **reescribir este registro en lugar de abrir uno nuevo**, como excepción a la práctica de reemplazar un ADR aceptado. Se mantiene H-3 y cambia la forma de usar gentle-ai (ODD, documento por incremento, commits en la rama del incremento, sin SDD, sin instalación en Claude Code). La versión anterior del texto queda en el historial de git.

**Segunda precisión del mismo día (a pedido del autor).** El documento ODD de cada incremento no lo redacta el sistema de agentes del TIF: lo propone el agente de OpenCode a partir de un prompt de contexto y se ajusta en iteraciones hasta la conformidad, antes de programar (regla 3). El diff se revisa con el mismo mecanismo.

#### Consecuencias

- **`src/AGENTS.md`:** §1 remite a `src/odd/tasks/`; §7 declara ODD, TDD estricto, commits solo en la rama del incremento y la prohibición de subir, unir o etiquetar.
- **`00-gestion/planes/`** deja de usarse. El plan del incremento 0 queda como base del prompt de contexto en `20260929_inc0-base-contexto.md` (retirada; consta en el commit `0a6eb57`).
- **`CLAUDE.md` raíz, §5:** en una sesión abierta en `src/` rigen `src/AGENTS.md` y el documento del incremento; el ingeniero del TIF no programa ni escribe en `src/odd/`.
- **`src/README.md`, sección 8, y bitácora:** la declaración de la regla 9.
- **Cap. X e Instrumento 34:** declarar los proveedores de modelos de gentle-ai, con su condición y costo, una vez obtenido el dato.
- **`.gitignore`:** si ODD crea archivos de estado o de memoria local dentro de `src/`, se decide en el primer incremento si se versionan.
- **Revisión de incrementos:** se evalúa si hace falta una skill del sistema de agentes del TIF para revisar un diff contra los ADR y los criterios.

#### Evidencia

- `~/.config/opencode/` del autor (listados del 29/09/2026: `AGENTS.md`, `opencode.json`, `skills/`, `prompts/sdd/`); `~/.gentle-ai/state.json` y `~/.gentle-ai/backups/`
- gentle-ai, documentación oficial (`docs/usage.md`, sección ODD; `docs/intended-usage.md`; `docs/quickstart.md`) y notas de versiones 3.0.1 a 3.7.0, https://github.com/Gentleman-Programming/gentle-ai (consultadas el 29/09/2026)
- `01-relevamiento/opencode/laboratorio-verificacion.md` (sección 1, «Aislamiento»)
- Código fuente de OpenCode, tag `v1.18.25`: `packages/opencode/src/session/instruction.ts` (verificación descrita en ADR-060)
- `src/AGENTS.md`, `src/CLAUDE.md` y `.claude/settings.json` del repositorio
- `00-gestion/reglas-catedra.md`, sección 7
- Gentle Shell, https://github.com/Gentleman-Programming/gentle-shell (consultado el 29/09/2026)
- Sesión del 29/09/2026

## ADR-067 — Programación de `src/` con Codex orquestado por el ingeniero, un subagente escritor por tarea y revisión y crítica con subagentes de Claude, sin gentle-ai

- Estado: aceptado (30/09/2026)
- Fecha: 30/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2 en forma directa. Afecta la declaración de herramientas (`src/README.md` §8, bitácora, AD-24), el Cap. X (X.3 y X.4, herramientas y su costo) y el Instrumento 34
- Origen: sesión del 30/09/2026. El incremento 0 bajo ADR-065 llevó unas 9 h para 9 de 14 tareas y consumió más del 25 % de la cuota semanal de Codex (dato del autor). Propuesta y mediciones en `propuesta-consumo-programacion.md` (retirada; consta en el commit `0a6eb57`) (AR-15)
- Relacionado: **modifica** ADR-065. Reemplaza sus reglas 2, 3, 6, 7 y 9 y el uso de OpenCode con gentle-ai. Conserva las reglas 1 (reglas en `src/AGENTS.md`), 4 (TDD estricto), 5 (commits solo en la rama del incremento) y 8 (pruebas aisladas). Actualiza el diseño del sistema de agentes (documento retirado; consta en el commit `0a6eb57`, §3, §5, §8 y §12). Deja sin efecto la asignación de modelos de AR-14 y la configuración de OpenCode de AR-11

#### Contexto

**Mediciones del incremento 0** (base local de OpenCode, `opencode.db`, sesiones del 30/09/2026):
- **Tiempo:** ≈ 590 min de modelo contra menos de 5 min de herramientas (pruebas, git, scripts). El tiempo lo explica la cantidad de pasos del modelo, no el trabajo.
- **Pasos:** 459 pasos de modelo y unas 700 llamadas a herramientas. De esas llamadas, 196 fueron a Engram, 37 lecturas del documento ODD, 26 de ADR, y hubo 16 subagentes.
- **Tokens:** ≈ 3,0 M de entrada nueva, ≈ 69,5 M de lectura de caché y ≈ 0,25 M de salida. Un solo subagente llegó a 511 k tokens de contexto por paso.
- **Documento ODD:** pasó de unos 12 KB a 99 KB.

**Cuota de Codex.** El consumo se estima con la entrada, la entrada en caché (a cerca de un décimo del precio) y la salida ([uibakery](https://uibakery.io/blog/openai-codex-pricing)). El contexto acumulado es la palanca principal. El plan del autor es **ChatGPT Plus** (campo `plan_type` de los registros de sesión de Codex, `~/.codex/sessions`).

**Evidencia externa.** Issue [gentle-shell #1494](https://github.com/Gentleman-Programming/gentle-shell/issues/1494), abierto el 27/09/2026 y sin respuesta: gentle 3.7.0 con `gpt-6-sol` en una tarea trivial tarda 245 s contra 46 s y consume ≈ 1,30 M contra ≈ 113 k tokens, con el mismo resultado. Las notas de versión muestran tres cambios que explican el comportamiento: delegación obligatoria desde la 3.2.1, evaluación por commit desde la 3.1.0 y RDD activado por defecto desde la 3.5.0. El autor trabajaba antes con la 2.1.11.

**Verificaciones del 30/09/2026:**
- El ODD vive en el bloque de ruteo, independiente del componente SDD (`internal/components/agentguidance/inject.go:18`, v3.7.0). Por eso un gentle-ai «afinado» conserva la delegación obligatoria y el espejo en Engram.
- gentle-ai estaba inyectado también en Codex: `AGENTS.md` global de 24 KB, instrucciones de Engram, hook de inicio, MCP y subagentes.
- Con `codex exec --ignore-user-config`, el `AGENTS.md` global igual se cargaba: 20.043 tokens de entrada para una respuesta de tres palabras.
- El autor decidió desinstalar gentle-ai (`gentle-ai uninstall --all`), con respaldo en `~/respaldo-gentle-20260930/`. La desinstalación no quitó el bloque de ruteo de `~/.codex/AGENTS.md`, que se movió al respaldo.
- La misma prueba dio después **14.488 tokens**, sin rastros de Engram, ODD ni CodeGraph.

#### Alternativas evaluadas

- **K1:** mantener ADR-065 (OpenCode con gentle-ai 3.7).
- **K2:** gentle-ai afinado (alcance de workspace, sin SDD, persona ni CodeGraph).
- **K3:** OpenCode sin gentle-ai, con un agente propio.
- **K4:** Codex en VS Code, con el autor como intermediario de cada tarea.
- **K5:** Codex orquestado por el ingeniero. Un subagente escritor (Codex) por tarea, con contexto nuevo. Revisión y crítica con subagentes de Claude.
- **K6:** Claude Code como escritor.

#### Análisis (trade-offs)

- **K1** reproduce el costo medido. La causa es estructural y no tiene corrección publicada.
- **K2** recorta el prompt fijo, pero conserva los dos mayores generadores de pasos, que viven en el bloque ODD.
- **K3** resuelve el consumo, pero sin gentle-ai OpenCode no aporta nada que justifique no usar el arnés propio del modelo, y no resuelve la orquestación.
- **K4** deja al autor como orquestador manual de cada tarea (rechazado por el autor).
- **K5:**
  - pone la orquestación en el sistema de agentes del TIF, que ya diseña y revisa;
  - usa el arnés nativo de OpenAI para el modelo que el autor paga;
  - reinicia el contexto en cada tarea;
  - mantiene la independencia entre quien escribe (OpenAI) y quien revisa y critica (Anthropic).

  Su costo es que la orquestación y las revisiones consumen el plan de Claude, y que el ingeniero lanza un proceso que commitea.
- **K6** pierde la independencia entre escritor y revisor, que serían de la misma familia, y contradice el rol del ingeniero en CLAUDE.md.

#### Recomendación y fundamento

**K5**, con estas reglas:

1. **Roles de la línea de código del sistema de agentes del TIF:**

   | Agente | Qué hace | Cuándo | Modelo | Escribe |
   |---|---|---|---|---|
   | Ingeniero (sesión principal de Claude Code) | Fichas, orquestación, primer control de cada tarea | Siempre | `claude-opus-5-5` | Solo `00-gestion/` |
   | `escritor` (Codex, `codex exec`) | Implementa una ficha con TDD estricto y un commit | Una ejecución nueva por tarea | `gpt-6.1-sol`, esfuerzo medio | `src/` y `.git`, en la rama del incremento |
   | `revisor-codigo` (subagente de Claude, `.claude/agents/`) | Conformidad: ficha, ADR, reglas de dependencia, pruebas en verde, criterios de aceptación | Tareas marcadas como riesgosas y cierre del incremento | `claude-sonnet-5-5`, esfuerzo alto | No |
   | `critico-codigo` (subagente de Claude, `.claude/agents/`) | Mejora: simplicidad, duplicación, acoplamiento, pruebas faltantes o sobrantes, preguntas probables de la defensa (ISO/IEC 25010, mantenibilidad) | Cierre del incremento, o a pedido del autor | `claude-opus-5-5`, esfuerzo alto | No |
   | Autor | Aprueba los ADR y las mejoras que se aplican; sube la rama y une con `main` | — | — | — |

2. **Ficha por tarea**, escrita por el ingeniero en `.trabajo/fichas/<incremento>/<tarea>.md`, de una página:
   - los criterios de aceptación que cubre;
   - los archivos a crear o modificar;
   - las firmas e interfaces que debe respetar;
   - la lista de pruebas;
   - los comandos exactos;
   - las condiciones de detención;
   - el modelo y el esfuerzo, si difieren de los de la regla 1.

   El documento del incremento es una lista de tareas con casillas. El documento ODD del incremento 0 queda congelado como antecedente.
3. **Lanzamiento del escritor**, desde la raíz del repositorio y en segundo plano:

   ```bash
   codex exec --ignore-user-config -c 'windows.sandbox="elevated"' -C src -m gpt-6.1-sol -c model_reasoning_effort=medium \
     -s workspace-write --add-dir ../.git --json -o <salida> "Ejecutá la ficha ../.trabajo/fichas/<incremento>/<tarea>.md"
   ```

   Condiciones:
   - sin red en el sandbox;
   - sin subagentes, MCP ni hooks, porque `--ignore-user-config` omite el `config.toml`;
   - las reglas vienen de `src/AGENTS.md`, que Codex lee de forma nativa.

   Verificado el 30/09/2026: sin `windows.sandbox="elevated"` el sandbox de Windows rechaza todo comando y la sesión queda en solo lectura (primer intento de T0-10, sin cambios en el repositorio). Como `--ignore-user-config` omite el `config.toml`, el ajuste se pasa con `-c`. Queda por verificar en la primera tarea la escritura en temporales del sistema que exige ADR-062 C6.

   **Ajustes posteriores a T0-10** (30/09/2026, aplicados en `/programar`):
   - **Respuesta final estructurada.** Se pide con `--output-schema ../.agents/plantillas/esquema-salida-escritor.json`, que fija estado (`completada`, `detenida` o `fallida`), commits, pruebas, `verificar`, archivos, pregunta y notas. Probado el 30/09/2026.
   - **Reanudación.** Si el escritor se detiene con una consulta, se continúa la misma sesión con `codex exec … resume <id>`, que reutiliza la caché.
   - **Plantilla.** Las fichas siguen `.agents/plantillas/ficha-escritor.md`, con la sección «Patrones existentes a imitar». Su omisión causó la única consulta de T0-10.
   - **Temporales.** La escritura en temporales del sistema quedó verificada en T0-10: las pruebas de C4 y la suite completa corrieron dentro del sandbox.
4. **Ciclo por tarea:**
   1. el escritor hace TDD estricto: pruebas focales mientras trabaja; la suite completa y `bun run verificar` una vez antes del commit;
   2. deja **un commit** en la rama, con la evidencia rojo-verde en el mensaje;
   3. si algo contradice la ficha o un ADR, se detiene y deja la pregunta en su respuesta final;
   4. el ingeniero corre `bun run verificar` y `bun test` sobre la rama y compara el diff con la ficha;
   5. las correcciones se piden en una nueva ejecución del escritor, con un commit nuevo;
   6. las dudas de diseño van al autor.
5. **Cierre del incremento:**
   1. `revisor-codigo` y `critico-codigo` corren en paralelo, con contexto limpio (`/revisar-codigo incremento`);
   2. el ingeniero consolida los hallazgos y el autor elige qué se aplica;
   3. las mejoras locales van como fichas de refactorización, y las que cambian decisiones pasan por `/decidir`;
   4. el autor sube la rama, corre el CI y une con `main`.
6. **Commits.** Solo el escritor commitea, solo en la rama del incremento. `push`, `merge` y `tag` quedan reservados al autor. `.claude/settings.json` sigue negando `git commit` al ingeniero y a los subagentes de Claude, y admite en forma explícita `codex exec`.
7. **Criterio de asignación de modelos** (precios de la API de Anthropic por millón de tokens de entrada y salida, referencia del 25/09/2026: Fable 5.1 10/50, Opus 5.5 4/20, Sonnet 5.5 2/10, Haiku 4.5 1/5; modelos de Codex del plan según `~/.codex/models_cache.json`):
   - **juicio y decisiones** (ingeniero, redactor, crítico del informe, `critico-codigo`): Opus 5.5. `critico-codigo` va con esfuerzo alto porque no corre en cada tarea;
   - **contraste contra una lista concreta** (revisores del informe, `revisor-codigo`): Sonnet 5.5, la generación vigente de Sonnet con el mismo precio que Sonnet 5, que es la que usaban hasta ahora. `revisor-codigo` va con esfuerzo alto, porque ejecuta y lee pruebas;
   - **escritor**: `gpt-6.1-sol` con esfuerzo medio. Con esfuerzo alto en las fichas marcadas como complejas. `gpt-6-luna` para tareas mecánicas (documentación, configuración), si la ficha lo indica;
   - **Fable 5.1 y `gpt-6-astra`** no se asignan por defecto. Cuestan unas 2,5 y 5 veces más que Opus 5.5 y Sol. Se reservan para una revisión puntual que el autor pida, por ejemplo antes de la defensa.
8. **Modelos configurables en un solo lugar por agente.** Los subagentes de Claude, en la línea `model:` de su archivo, y solo admiten modelos de Anthropic. El escritor, en el comando `/programar` o en la ficha. La tabla del diseño (§3.2) se mantiene al día, para que la declaración sea fiel.
9. **Medición por tarea**, a partir de la salida `--json` y de `~/.codex/sessions`: tiempo de reloj, tokens (entrada, caché y salida), porcentaje de la cuota semanal y correcciones requeridas. El ingeniero la informa al autor en cada tarea y la registra en la bitácora.
10. **Declaración** (`src/README.md` §8 y bitácora), por período:
   - hasta el 30/09/2026, OpenCode con gentle-ai 3.7 (`opencode-go/mimo-v2.6-pro` y `openai/gpt-6.1-sol`);
   - desde el incremento 0, tarea T0-10, Codex (`gpt-6.1-sol`, plan ChatGPT Plus) como escritor, orquestado por el sistema de agentes del TIF (Claude Code, `claude-opus-5-5`), que diseña, revisa y critica.

**Condición que invalidaría la recomendación:**
- Que tras las dos primeras tareas (T0-10 y T0-11a) la mejora frente a la línea de base del incremento 0 (≈ 1 h y ≈ 8 M de tokens por tarea) sea menor que ×3 en tiempo o en tokens.
- Que las correcciones por tarea aumenten.
- Que el sandbox de Codex en Windows no permita correr las pruebas aisladas de ADR-062 C6. En ese caso se evalúa ejecutar el escritor en WSL.
- Que la cátedra objete la declaración.

#### Decisión del autor

Aceptado por el autor el 30/09/2026, con autorización expresa al ingeniero para aplicar todas las consecuencias, incluidas las ediciones de `CLAUDE.md` y `src/AGENTS.md`. La asignación de modelos de la regla 7 la definió el ingeniero a pedido del autor.

#### Consecuencias

- **`.claude/`** (lo arma el ingeniero; `.claude/` no se versiona):
  - agentes `revisor-codigo` y `critico-codigo`;
  - comandos `/programar <tarea>` y `/revisar-codigo <tarea|incremento>`;
  - permiso explícito de `codex exec` en `settings.json`.
- **`CLAUDE.md`** (lo edita el autor): la regla 4 admite que el escritor, lanzado por el ingeniero, commitee en la rama del incremento. La §5 menciona la línea de código.
- **`src/AGENTS.md` §1 y §7** (lo edita el autor): se reemplazan las menciones al flujo ODD y a gentle-ai por «la ficha de la tarea (`../.trabajo/fichas/…`)» y la evidencia en el mensaje del commit.
- **Diseño del sistema de agentes (retirado; consta en el commit `0a6eb57`):** §3 (Codex en lugar de OpenCode Go, modelos por rol, cupo), §5 (los dos subagentes y el escritor externo), §8 (comandos) y §12 (permisos).
- **Pendientes:** AR-15 se cierra con este registro. AR-11 y AR-14 quedan sin efecto en lo que respecta a OpenCode. U-02 recibe el dato del plan: ChatGPT Plus; su costo sigue como `[DATO PENDIENTE]`.
- **Informe:** X.3, X.4 y el Instrumento 34 declaran Codex (plan ChatGPT Plus) en lugar de OpenCode Go, con `/corregir` una vez aceptado.

#### Evidencia

- `propuesta-consumo-programacion.md` (retirada; consta en el commit `0a6eb57`) (§1, §3.1, §3.2 y §4), con las consultas sobre `~/.local/share/opencode/opencode.db`.
- Pruebas de `codex exec` del 30/09/2026: 20.043 tokens con gentle-ai contra 14.488 sin gentle-ai.
- Código fuente de gentle-ai 3.7.0 (`~/go/pkg/mod/github.com/gentleman-programming/gentle-ai/v3@v3.7.0`); [notas de versión](https://github.com/Gentleman-Programming/gentle-ai/releases); issue [gentle-shell #1494](https://github.com/Gentleman-Programming/gentle-shell/issues/1494).
- [Precios y límites de Codex (uibakery)](https://uibakery.io/blog/openai-codex-pricing).
- Respaldo de la configuración anterior: `~/respaldo-gentle-20260930/`.
