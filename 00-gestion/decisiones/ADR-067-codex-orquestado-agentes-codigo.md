# ADR-067 — Programación de `src/` con Codex orquestado por el ingeniero, un subagente escritor por tarea y revisión y crítica con subagentes de Claude, sin gentle-ai

- Estado: aceptado (30/09/2026)
- Fecha: 30/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2 en forma directa. Afecta la declaración de herramientas (`src/README.md` §8, bitácora, AD-24), el Cap. X (X.3 y X.4, herramientas y su costo) y el Instrumento 34
- Origen: sesión del 30/09/2026. El incremento 0 bajo ADR-065 llevó unas 9 h para 9 de 14 tareas y consumió más del 25 % de la cuota semanal de Codex (dato del autor). Propuesta y mediciones en `00-gestion/borradores/propuesta-consumo-programacion.md` (AR-15)
- Relacionado: **modifica** ADR-065. Reemplaza sus reglas 2, 3, 6, 7 y 9 y el uso de OpenCode con gentle-ai. Conserva las reglas 1 (reglas en `src/AGENTS.md`), 4 (TDD estricto), 5 (commits solo en la rama del incremento) y 8 (pruebas aisladas). Actualiza el diseño del sistema de agentes (`00-gestion/diseno-sistema-agentes.md`, §3, §5, §8 y §12). Deja sin efecto la asignación de modelos de AR-14 y la configuración de OpenCode de AR-11

### Contexto

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

### Alternativas evaluadas

- **K1:** mantener ADR-065 (OpenCode con gentle-ai 3.7).
- **K2:** gentle-ai afinado (alcance de workspace, sin SDD, persona ni CodeGraph).
- **K3:** OpenCode sin gentle-ai, con un agente propio.
- **K4:** Codex en VS Code, con el autor como intermediario de cada tarea.
- **K5:** Codex orquestado por el ingeniero. Un subagente escritor (Codex) por tarea, con contexto nuevo. Revisión y crítica con subagentes de Claude.
- **K6:** Claude Code como escritor.

### Análisis (trade-offs)

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

### Recomendación y fundamento

**K5**, con estas reglas:

1. **Roles de la línea de código del sistema de agentes del TIF:**

   | Agente | Qué hace | Cuándo | Modelo | Escribe |
   |---|---|---|---|---|
   | Ingeniero (sesión principal de Claude Code) | Fichas, orquestación, primer control de cada tarea | Siempre | `claude-opus-5-5` | Solo `00-gestion/` |
   | `escritor` (Codex, `codex exec`) | Implementa una ficha con TDD estricto y un commit | Una ejecución nueva por tarea | `gpt-6.1-sol`, esfuerzo medio | `src/` y `.git`, en la rama del incremento |
   | `revisor-codigo` (subagente de Claude, `.claude/agents/`) | Conformidad: ficha, ADR, reglas de dependencia, pruebas en verde, criterios de aceptación | Tareas marcadas como riesgosas y cierre del incremento | `claude-sonnet-5-5`, esfuerzo alto | No |
   | `critico-codigo` (subagente de Claude, `.claude/agents/`) | Mejora: simplicidad, duplicación, acoplamiento, pruebas faltantes o sobrantes, preguntas probables de la defensa (ISO/IEC 25010, mantenibilidad) | Cierre del incremento, o a pedido del autor | `claude-opus-5-5`, esfuerzo alto | No |
   | Autor | Aprueba los ADR y las mejoras que se aplican; sube la rama y une con `main` | — | — | — |

2. **Ficha por tarea**, escrita por el ingeniero en `00-gestion/fichas/<incremento>/<tarea>.md`, de una página:
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
     -s workspace-write --add-dir ../.git --json -o <salida> "Ejecutá la ficha ../00-gestion/fichas/<incremento>/<tarea>.md"
   ```

   Condiciones:
   - sin red en el sandbox;
   - sin subagentes, MCP ni hooks, porque `--ignore-user-config` omite el `config.toml`;
   - las reglas vienen de `src/AGENTS.md`, que Codex lee de forma nativa.

   Verificado el 30/09/2026: sin `windows.sandbox="elevated"` el sandbox de Windows rechaza todo comando y la sesión queda en solo lectura (primer intento de T0-10, sin cambios en el repositorio). Como `--ignore-user-config` omite el `config.toml`, el ajuste se pasa con `-c`. Queda por verificar en la primera tarea la escritura en temporales del sistema que exige ADR-062 C6.

   **Ajustes posteriores a T0-10** (30/09/2026, aplicados en `/programar`):
   - **Respuesta final estructurada.** Se pide con `--output-schema ../00-gestion/fichas/esquema-salida-escritor.json`, que fija estado (`completada`, `detenida` o `fallida`), commits, pruebas, `verificar`, archivos, pregunta y notas. Probado el 30/09/2026.
   - **Reanudación.** Si el escritor se detiene con una consulta, se continúa la misma sesión con `codex exec … resume <id>`, que reutiliza la caché.
   - **Plantilla.** Las fichas siguen `00-gestion/fichas/PLANTILLA.md`, con la sección «Patrones existentes a imitar». Su omisión causó la única consulta de T0-10.
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

### Decisión del autor

Aceptado por el autor el 30/09/2026, con autorización expresa al ingeniero para aplicar todas las consecuencias, incluidas las ediciones de `CLAUDE.md` y `src/AGENTS.md`. La asignación de modelos de la regla 7 la definió el ingeniero a pedido del autor.

### Consecuencias

- **`.claude/`** (lo arma el ingeniero; `.claude/` no se versiona):
  - agentes `revisor-codigo` y `critico-codigo`;
  - comandos `/programar <tarea>` y `/revisar-codigo <tarea|incremento>`;
  - permiso explícito de `codex exec` en `settings.json`.
- **`CLAUDE.md`** (lo edita el autor): la regla 4 admite que el escritor, lanzado por el ingeniero, commitee en la rama del incremento. La §5 menciona la línea de código.
- **`src/AGENTS.md` §1 y §7** (lo edita el autor): se reemplazan las menciones al flujo ODD y a gentle-ai por «la ficha de la tarea (`../00-gestion/fichas/…`)» y la evidencia en el mensaje del commit.
- **`00-gestion/diseno-sistema-agentes.md`:** §3 (Codex en lugar de OpenCode Go, modelos por rol, cupo), §5 (los dos subagentes y el escritor externo), §8 (comandos) y §12 (permisos).
- **Pendientes:** AR-15 se cierra con este registro. AR-11 y AR-14 quedan sin efecto en lo que respecta a OpenCode. U-02 recibe el dato del plan: ChatGPT Plus; su costo sigue como `[DATO PENDIENTE]`.
- **Informe:** X.3, X.4 y el Instrumento 34 declaran Codex (plan ChatGPT Plus) en lugar de OpenCode Go, con `/corregir` una vez aceptado.

### Evidencia

- `00-gestion/borradores/propuesta-consumo-programacion.md` (§1, §3.1, §3.2 y §4), con las consultas sobre `~/.local/share/opencode/opencode.db`.
- Pruebas de `codex exec` del 30/09/2026: 20.043 tokens con gentle-ai contra 14.488 sin gentle-ai.
- Código fuente de gentle-ai 3.7.0 (`~/go/pkg/mod/github.com/gentleman-programming/gentle-ai/v3@v3.7.0`); [notas de versión](https://github.com/Gentleman-Programming/gentle-ai/releases); issue [gentle-shell #1494](https://github.com/Gentleman-Programming/gentle-shell/issues/1494).
- [Precios y límites de Codex (uibakery)](https://uibakery.io/blog/openai-codex-pricing).
- Respaldo de la configuración anterior: `~/respaldo-gentle-20260930/`.
