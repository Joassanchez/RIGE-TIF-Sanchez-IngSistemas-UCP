# ADR-065 — Método de programación de RIGE: esquema mixto, con reglas del proyecto en el repositorio, programación en OpenCode con gentle-ai y diseño y revisión en el sistema de agentes del TIF

- Estado: aceptado (29/09/2026)
- Fecha: 29/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2. Afecta `src/AGENTS.md`, `src/README.md` (sección 8, declaración de herramientas auxiliares), la bitácora (AD-24) y el arnés de pruebas de `src/pruebas/`
- Origen: sesión del 29/09/2026. El autor planteó programar con gentle-ai, que ya tiene instalado en OpenCode, y preguntó por la conveniencia de Gentle Shell, de integrar todo en el sistema de agentes del TIF o de un esquema mixto
- Relacionado: aplica ADR-058 (estructura de `src/`, pruebas de arquitectura, convenciones) y ADR-060 (contrato del adaptador y rastro), ambos aceptados el 29/09/2026; ADR-032 (stack); ADR-054 (entorno de referencia). Se relaciona con AD-24 (declaración de herramientas) y con AR-00 (actualización de `src/AGENTS.md`)

### Contexto

Con ADR-058 y ADR-060 se puede empezar a escribir el núcleo. Falta decidir con qué herramientas y bajo qué reglas se programa.

Datos del repositorio y de la verificación:

- **El autor usa OpenCode con gentle-ai** (configurador MIT de Gentleman Programming que instala flujo de trabajo, skills, memoria y una persona). En `~/.config/opencode/` constan `AGENTS.md` (persona de gentle-ai), `opencode.json`, `plugins/`, `skills/` y `commands/` (listado del 29/09/2026).
- **Los estudios sobre OpenCode estuvieron aislados de esa configuración.** El laboratorio corrió cada sesión con `HOME`, `USERPROFILE` y `XDG_*` redirigidos a `./oc-lab/home/`, con una única fuga declarada: el directorio `state` (`01-relevamiento/linea-base/laboratorio-verificacion.md`, «Aislamiento»). La medición de la línea de base corre en el contenedor con usuarios propios (ADR-054). El 29/09/2026 no había variables `OPENCODE_*` definidas en el entorno del autor ni archivos `opencode.json` o `.opencode` en `C:\Users\Joa` o en `Documents`.
- **Carga de instrucciones de OpenCode 1.18.25** (`packages/opencode/src/session/instruction.ts:60-67, 115-125`, tag verificado en ADR-060): carga el primer archivo global que exista entre `<config>/AGENTS.md` y `~/.claude/CLAUDE.md`. En el proyecto, subiendo desde el directorio de trabajo hasta la raíz del worktree, carga el primer **tipo** de archivo que encuentre en el orden `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`. Abierto en `src/`, carga `src/AGENTS.md` y ningún `CLAUDE.md`. Abierto en la raíz del repositorio, que no tiene `AGENTS.md`, cargaría el `CLAUDE.md` raíz (rol del ingeniero del TIF) junto con la persona de gentle-ai.
- **La persona de gentle-ai** indica «Never add "Co-Authored-By" or AI attribution to commits», respuestas cortas y no presentar alternativas salvo bifurcación real (`~/.config/opencode/AGENTS.md`).
- **Guía de comprobación del v1:** el `README.md` del prototipo declara las herramientas auxiliares con herramienta, función y artefacto afectado (`00-gestion/reglas-catedra.md`, sección 7).
- **`src/AGENTS.md` vigente** remite a ADR-006, ADR-021 y ADR-022, que ya no existen como archivos: ADR-006 pasó al Anexo III como D-06 y ADR-021 y ADR-022 se consolidaron en ADR-051 (`INDICE.md`).
- **Gentle Shell** (consultado el 29/09/2026, https://github.com/Gentleman-Programming/gentle-shell): entorno de trabajo sobre Pi, versión 3.5.1, licencia MIT, del mismo autor que gentle-ai y con el mismo flujo (ODD, SDD/OpenSpec opcional, evidencia de TDD, revisión, subagentes). La documentación consultada no indica qué proveedores de modelos admite.

### Alternativas evaluadas

- **H-1 · Gentle Shell** como entorno de programación.
- **H-2 · Todo en el sistema de agentes del TIF:** se incorpora a este repositorio un flujo propio de programación (por ejemplo, una skill `/implementar`).
- **H-3 · Mixto:** las reglas propias de RIGE viven en el repositorio y son independientes de la herramienta; la disciplina genérica de programación la aporta gentle-ai en OpenCode; el diseño, los planes de cada incremento y la revisión contra los ADR se hacen en el sistema de agentes del TIF.

### Análisis (trade-offs)

- **H-1** aporta un flujo curado y maduro, pero no conoce los ADR ni los criterios de aceptación. Suma un tercer runtime, con su configuración de proveedores y su propia declaración. Lo que aporte respecto de gentle-ai en OpenCode no está establecido (suposición).
- **H-2** mantiene un solo sistema que conoce los ADR, pero obliga a construir desde cero una disciplina genérica (TDD, incrementos chicos, revisión con evidencia) que ya existe curada.
- **H-3** separa dos disciplinas de naturaleza distinta:
  - la **genérica**, resuelta por una herramienta curada que el autor ya usa;
  - la **propia de RIGE** (qué prueba corresponde a qué criterio, qué puede depender de qué, qué nunca se expone), que ninguna herramienta trae y que queda en el repositorio: `src/AGENTS.md`, `pruebas/arquitectura/` y `pruebas/aceptacion/` (ADR-058).
  
  Cambiar de herramienta no rompe nada, y lo que se defiende ante el tribunal es evidencia en el repositorio que el CI ejecuta.
- Costos de H-3:
  - `src/AGENTS.md` es el único puente entre los dos sistemas y debe estar al día con los ADR (AR-00).
  - La persona de gentle-ai contradice dos prácticas del proyecto (atribución y presentación de alternativas). La primera no impide cumplir la consigna, porque la declaración va en el README y en la bitácora, pero el historial de git no deja rastro de lo que escribió el agente y la declaración la lleva el autor.
  - Hay un paso de revisión adicional antes de cada commit.

### Recomendación y fundamento

**H-3**, con estas reglas:

1. **Reglas del proyecto en el repositorio.** `src/AGENTS.md` reúne las reglas de dependencia, las restricciones no negociables, las convenciones de ADR-058 y el contrato de ADR-060, y declara que prevalecen sobre las instrucciones globales del agente dentro de `src/`. Las garantías se verifican con pruebas: una prueba por criterio de aceptación, con el ID en el nombre, y las pruebas de arquitectura de ADR-058.
2. **OpenCode se abre en `src/`**, nunca en la raíz del repositorio.
3. **Reparto:**

   | Qué | Dónde |
   |---|---|
   | Diseño, ADR y plan de cada incremento | Sistema de agentes del TIF (Claude Code), antes de programar |
   | Código y pruebas | OpenCode con gentle-ai, abierto en `src/` |
   | Revisión de cada incremento contra los ADR y los criterios | Sistema de agentes del TIF, sobre el diff, antes del commit del autor |
   | Guardarraíles | Pruebas de arquitectura y de aceptación en el CI |

4. **Pruebas aisladas de la configuración real.** El arnés de pruebas redirige `HOME`, `USERPROFILE` y `XDG_*` a un directorio temporal y vacía las variables `OPENCODE_*`, como el laboratorio. La configuración real del autor sirve para probar RIGE a mano, pero nunca como escenario ni como resultado de referencia: es personal, puede contener credenciales (RNF-04) y cambia con cada actualización de gentle-ai.
5. **Declaración.** OpenCode con gentle-ai (función: generación y edición asistida de código y pruebas; artefacto: `src/`) y el sistema de agentes del TIF (función: diseño, planes y revisión) figuran en la sección 8 de `src/README.md` y en la bitácora (AD-24). El autor revisa y hace cada commit.

**Fundamento.** Es la opción que aprovecha una herramienta curada sin delegarle las reglas de RIGE, que solo existen en este repositorio, y que deja la evidencia de cumplimiento en pruebas ejecutables y no en la herramienta usada.

**Condición que invalidaría la recomendación:**
- Que en el primer incremento el agente de OpenCode ignore o contradiga `src/AGENTS.md` de manera recurrente (dependencias prohibidas, pruebas sin criterio, escritura fuera de `src/`). En ese caso se reevalúa, y H-1 se considera solo si demuestra una capacidad que OpenCode con gentle-ai no ofrece.
- Que la cátedra objete el uso de un asistente de programación o exija otra forma de declararlo.

### Decisión del autor

Aceptado por el autor el 29/09/2026 (`/aceptar ADR-065`). En la sesión del 29/09/2026 el autor manifestó conformidad con el esquema mixto y pidió registrarlo junto con el borrador de `src/AGENTS.md`.

### Consecuencias

**Si se acepta:**

- **`src/AGENTS.md`** (lo edita el autor, AR-00): se reemplaza por el borrador de `00-gestion/borradores/src-AGENTS-borrador.md`, que corrige además las remisiones a ADR-006, ADR-021 y ADR-022.
- **`src/README.md`, sección 8:** declara las dos herramientas con su función y artefacto.
- **Bitácora:** cada incremento registra qué generó el agente y qué revisó el autor (AD-24).
- **ADR-062:** incorpora la regla 4 como convención del arnés de pruebas.
- **Revisión de incrementos:** se evalúa si hace falta una skill del sistema de agentes del TIF para revisar un diff contra los ADR y los criterios, o si alcanza con la revisión de código existente.

### Evidencia

- `~/.config/opencode/` del autor (listado del 29/09/2026; `AGENTS.md`, primeras líneas)
- `01-relevamiento/linea-base/laboratorio-verificacion.md` (sección 1, «Aislamiento»)
- Código fuente de OpenCode, tag `v1.18.25`: `packages/opencode/src/session/instruction.ts` (verificación descrita en ADR-060)
- `src/AGENTS.md` y `src/CLAUDE.md` vigentes; `00-gestion/decisiones/INDICE.md`
- `00-gestion/reglas-catedra.md`, sección 7
- Gentle Shell, https://github.com/Gentleman-Programming/gentle-shell, y gentle-ai, https://github.com/Gentleman-Programming/gentle-ai (consultados el 29/09/2026)
- Sesión del 29/09/2026
