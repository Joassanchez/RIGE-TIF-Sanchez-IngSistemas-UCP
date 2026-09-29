# ADR-065 — Método de programación de RIGE: esquema mixto, con reglas del proyecto en el repositorio, programación en OpenCode con gentle-ai en modo ODD y diseño y revisión en el sistema de agentes del TIF

- Estado: aceptado (29/09/2026); revisado el 29/09/2026 por excepción autorizada por el autor (ver «Decisión del autor»)
- Fecha: 29/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2 en forma directa. Afecta `src/AGENTS.md`, `src/odd/tasks/` (documentos de incremento), `src/README.md` (sección 8, declaración de herramientas auxiliares), la bitácora (AD-24), el arnés de pruebas de `src/pruebas/` y, por la declaración de los modelos usados, el Cap. X (X.3, X.4) y el Instrumento 34
- Origen: sesión del 29/09/2026. El autor planteó programar con gentle-ai, que ya tiene instalado en OpenCode, y preguntó por la conveniencia de Gentle Shell, de integrar todo en el sistema de agentes del TIF o de un esquema mixto. En la misma sesión, al preparar el primer incremento, el autor pidió reanalizar la elección sin atarse a lo decidido e introdujo ODD (Organic Driven Development)
- Relacionado: aplica ADR-058 (estructura de `src/`, pruebas de arquitectura, convenciones) y ADR-060 (contrato del adaptador y rastro), ambos aceptados el 29/09/2026; ADR-032 (stack); ADR-054 (entorno de referencia); ADR-062 (arnés de pruebas, C6; vías observadas, C8). Se relaciona con AD-24 (declaración de herramientas) y con AR-00 (actualización de `src/AGENTS.md`)

### Contexto

Con ADR-058 y ADR-060 se puede empezar a escribir el núcleo. Falta decidir con qué herramientas y bajo qué reglas se programa.

**Datos del repositorio y de la verificación (registro original):**

- **El autor usa OpenCode con gentle-ai** (configurador MIT de Gentleman Programming que instala flujo de trabajo, skills, memoria y una persona). En `~/.config/opencode/` constan `AGENTS.md` (persona de gentle-ai), `opencode.json`, `plugins/`, `skills/` y `commands/` (listado del 29/09/2026).
- **Los estudios sobre OpenCode estuvieron aislados de esa configuración.** El laboratorio corrió cada sesión con `HOME`, `USERPROFILE` y `XDG_*` redirigidos a `./oc-lab/home/`, con una única fuga declarada: el directorio `state` (`01-relevamiento/linea-base/laboratorio-verificacion.md`, «Aislamiento»). La medición de la línea de base corre en el contenedor con usuarios propios (ADR-054). El 29/09/2026 no había variables `OPENCODE_*` definidas en el entorno del autor ni archivos `opencode.json` o `.opencode` en `C:\Users\Joa` o en `Documents`.
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

### Alternativas evaluadas

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

### Análisis (trade-offs)

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

### Recomendación y fundamento

**H-3 en la forma O7**, con estas reglas:

1. **Reglas del proyecto en el repositorio.** `src/AGENTS.md` reúne las reglas de dependencia, las restricciones no negociables, las convenciones de ADR-058 y ADR-062 y el contrato de ADR-060, y declara que prevalecen sobre las instrucciones globales del agente dentro de `src/`. Las garantías se verifican con pruebas: una por criterio de aceptación, con el ID en el nombre, y las de arquitectura de ADR-058.
2. **OpenCode se abre en `src/`**, nunca en la raíz del repositorio.
3. **Un documento ODD por incremento, acordado antes de programar.** El proceso es el siguiente:
   - el sistema de agentes del TIF entrega al autor un **prompt de contexto** (objetivo, ADR y criterios aplicables, restricciones, datos verificados);
   - el agente de OpenCode explora y **propone su propio documento** `src/odd/tasks/<incremento>.md`, y se detiene antes de la primera escritura de código;
   - el sistema de agentes del TIF lo revisa contra los ADR y el catálogo, con el autor como intermediario, **en iteraciones hasta la conformidad de ambos**;
   - recién entonces se implementa;
   - al terminar, el sistema de agentes del TIF revisa el diff de la rama y entrega un prompt de correcciones, que se itera hasta el cierre.
   
   Cada prompt y cada revisión se guardan en `00-gestion/revisiones/`. Se usa el flujo orgánico de ODD; **no se usa el ciclo SDD** ni `openspec/`, que duplicarían el catálogo y los ADR.
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

### Decisión del autor

Aceptado por el autor el 29/09/2026 (`/aceptar ADR-065`). En la sesión del 29/09/2026 el autor manifestó conformidad con el esquema mixto y pidió registrarlo junto con el borrador de `src/AGENTS.md`.

**Revisión del 29/09/2026 (excepción autorizada por el autor).** Al preparar el incremento 0, el autor objetó la cantidad de artefactos de SDD, introdujo ODD y pidió reanalizar la elección sin atarse a lo decidido. Eligió O7 y la instalación de gentle-ai 3.7.0, que realizó él mismo. Después pidió desinstalarlo de Claude Code. Por el alcance acotado del cambio, decidió **reescribir este registro en lugar de abrir uno nuevo**, como excepción a la práctica de reemplazar un ADR aceptado. Se mantiene H-3 y cambia la forma de usar gentle-ai (ODD, documento por incremento, commits en la rama del incremento, sin SDD, sin instalación en Claude Code). La versión anterior del texto queda en el historial de git.

**Segunda precisión del mismo día (a pedido del autor).** El documento ODD de cada incremento no lo redacta el sistema de agentes del TIF: lo propone el agente de OpenCode a partir de un prompt de contexto y se ajusta en iteraciones hasta la conformidad, antes de programar (regla 3). El diff se revisa con el mismo mecanismo.

### Consecuencias

- **`src/AGENTS.md`:** §1 remite a `src/odd/tasks/`; §7 declara ODD, TDD estricto, commits solo en la rama del incremento y la prohibición de subir, unir o etiquetar.
- **`00-gestion/planes/`** deja de usarse. El plan del incremento 0 queda como base del prompt de contexto en `00-gestion/revisiones/20260929_inc0-base-contexto.md`.
- **`CLAUDE.md` raíz, §5:** en una sesión abierta en `src/` rigen `src/AGENTS.md` y el documento del incremento; el ingeniero del TIF no programa ni escribe en `src/odd/`.
- **`src/README.md`, sección 8, y bitácora:** la declaración de la regla 9.
- **Cap. X e Instrumento 34:** declarar los proveedores de modelos de gentle-ai, con su condición y costo, una vez obtenido el dato.
- **`.gitignore`:** si ODD crea archivos de estado o de memoria local dentro de `src/`, se decide en el primer incremento si se versionan.
- **Revisión de incrementos:** se evalúa si hace falta una skill del sistema de agentes del TIF para revisar un diff contra los ADR y los criterios.

### Evidencia

- `~/.config/opencode/` del autor (listados del 29/09/2026: `AGENTS.md`, `opencode.json`, `skills/`, `prompts/sdd/`); `~/.gentle-ai/state.json` y `~/.gentle-ai/backups/`
- gentle-ai, documentación oficial (`docs/usage.md`, sección ODD; `docs/intended-usage.md`; `docs/quickstart.md`) y notas de versiones 3.0.1 a 3.7.0, https://github.com/Gentleman-Programming/gentle-ai (consultadas el 29/09/2026)
- `01-relevamiento/linea-base/laboratorio-verificacion.md` (sección 1, «Aislamiento»)
- Código fuente de OpenCode, tag `v1.18.25`: `packages/opencode/src/session/instruction.ts` (verificación descrita en ADR-060)
- `src/AGENTS.md`, `src/CLAUDE.md` y `.claude/settings.json` del repositorio
- `00-gestion/reglas-catedra.md`, sección 7
- Gentle Shell, https://github.com/Gentleman-Programming/gentle-shell (consultado el 29/09/2026)
- Sesión del 29/09/2026
