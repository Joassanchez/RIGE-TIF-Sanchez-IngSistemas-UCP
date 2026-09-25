# Anexo I, A.I.6 — Issues de OpenCode sobre comportamiento inesperado de configuración y permisos

**Proyecto Integrador Final · RIGE · Ingeniería en Sistemas de Información · UCP**
**Sostiene:** apartado I.3.1, tercera consecuencia acreditada — "los reportes del repositorio de OpenCode sobre permisos o configuración con un comportamiento distinto del esperado aportan evidencia de ocurrencia, con [N] casos identificados en el período [ ]".

> Nota de numeración: se asigna el rótulo A.I.6 dejando A.I.5 para la entrevista al referente de EMSA, ya referenciada así en el Capítulo I. Ajustalo si tu numeración real es otra.

---

## 1. Criterio de búsqueda (registrado antes de contar, como en el diseño de la línea de base)

| Parámetro | Definición |
|---|---|
| Repositorio | `anomalyco/opencode` (el mismo del código fuente citado en el Anexo I, A.I.3) |
| Herramienta | API de búsqueda de issues de GitHub (`api.github.com/search/issues`) |
| Período | Historia completa del repositorio hasta la fecha de consulta (17/09/2026); no se recorta por versión ni por antigüedad |
| Términos de configuración (uno de estos, en el título) | `permission`, `override`, `merge`, `precedence` |
| Filtro adicional | El término de configuración debe aparecer junto con `config` en el **título** del issue |
| Motivo del filtro por título | El repositorio tiene 26.851 issues en total; buscar estos términos en título y cuerpo sin restricción devuelve cientos de resultados por término, en su mayoría ajenos al fenómeno (menciones incidentales de "wrong", "unexpected", etc. en contextos no relacionados con configuración). Exigir ambos términos en el título es la restricción más simple que produce un conjunto revisable manualmente sin perder precisión |
| Criterio de inclusión | El issue relata un comportamiento de configuración o permisos que un usuario efectivamente vivió y no esperaba (fusión, precedencia, o decisión de permiso que no coincide con lo declarado) |
| Criterio de exclusión | Pedidos de funcionalidad nueva (`[FEATURE]`, `feat:`) que no relatan haber vivido el problema, y reportes que no versan sobre precedencia/fusión/permisos (errores de tipeo en el esquema, límites de expresividad de una API) |
| Clasificación | Abierto / cerrado. Un cerrado cuenta igual que un abierto como evidencia de ocurrencia — el estado de resolución no borra que el problema existió |

**Alternativa descartada:** buscar sin restricción de título. Se descarta porque a esa escala de repositorio el ruido supera ampliamente la señal y el conteo dejaría de ser defendible.

---

## 2. Resultado

**46 issues** cumplen el criterio de búsqueda (ambos términos en el título). De ellos:

- **12** se excluyen por ser pedidos de funcionalidad (`[FEATURE]`/`feat:`) sin relato de comportamiento ya vivido.
- **2** se excluyen por no versar sobre el fenómeno (un límite de expresividad de la API de permisos; una inconsistencia de nomenclatura singular/plural en el esquema publicado).
- **32 quedan incluidos**: **8 abiertos, 24 cerrados**.

Rango temporal de los 46 candidatos: 28/11/2025 a 16/09/2026 (un día antes de la consulta) — prácticamente toda la vida útil observable del repositorio hasta la fecha.

**Texto sugerido para I.3.1:** *"...con 32 casos identificados entre noviembre de 2025 y septiembre de 2026 (Anexo I, A.I.6)."*

---

## 3. Detalle completo (los 46 candidatos)

| # | Estado | Fecha | Clasificación | Título |
|---|---|---|---|---|
| [4860](https://github.com/anomalyco/opencode/issues/4860) | cerrado | 2025-11-28 | **Incluido** | Cannot Load or Override Config File on macOS (Warp Terminal) |
| [4960](https://github.com/anomalyco/opencode/issues/4960) | cerrado | 2025-12-01 | Excluido (feature) | [FEATURE]: Add visibility flags for merged config and system prompt |
| [6806](https://github.com/anomalyco/opencode/issues/6806) | cerrado | 2026-01-04 | **Incluido** | Partial thinking config doesn't merge with defaults, causing AI_InvalidArgumentError |
| [7136](https://github.com/anomalyco/opencode/issues/7136) | cerrado | 2026-01-06 | Excluido (feature) | Config Flag to mark part of the global config as non-overridable per project |
| [7844](https://github.com/anomalyco/opencode/issues/7844) | cerrado | 2026-01-11 | Excluido (feature) | [FEATURE]: Add "editor" configuration option in config.json to override system EDITOR |
| [7908](https://github.com/anomalyco/opencode/issues/7908) | cerrado | 2026-01-12 | Excluido (feature) | [FEATURE]: Allow baseUrl to be overrided by web command or server config |
| [8524](https://github.com/anomalyco/opencode/issues/8524) | cerrado | 2026-01-14 | Excluido (no aplica) | New permissions config types not expressive enough in SDK |
| [10950](https://github.com/anomalyco/opencode/issues/10950) | cerrado | 2026-01-28 | **Incluido** | [Bug]: Stored OAuth credentials silently override explicit provider config |
| [11218](https://github.com/anomalyco/opencode/issues/11218) | cerrado | 2026-01-30 | **Incluido** | Bash permission deny rules in agent config not being enforced |
| [11628](https://github.com/anomalyco/opencode/issues/11628) | cerrado | 2026-02-01 | **Incluido** | OPENCODE_CONFIG_CONTENT does not have highest precedence config loading |
| [12334](https://github.com/anomalyco/opencode/issues/12334) | cerrado | 2026-02-05 | Excluido (feature) | [FEATURE]: TUI config option to open edit permission prompts in fullscreen by default |
| [13751](https://github.com/anomalyco/opencode/issues/13751) | cerrado | 2026-02-15 | **Incluido** | Permission prompt appears when reading ~/.config/opencode/AGENTS.md |
| [15664](https://github.com/anomalyco/opencode/issues/15664) | cerrado | 2026-03-02 | **Incluido** | tools config deny rules silently overridden by "*": "ask" in permission config |
| [16495](https://github.com/anomalyco/opencode/issues/16495) | cerrado | 2026-03-07 | **Incluido** | Permission prompt shows for ~/.config/hypr directory access |
| [17232](https://github.com/anomalyco/opencode/issues/17232) | cerrado | 2026-03-12 | Excluido (feature) | [FEATURE]: Support `opencode.local.json` for project-local config overrides |
| [19101](https://github.com/anomalyco/opencode/issues/19101) | cerrado | 2026-03-25 | **Incluido** | `todowrite`/`todoread` cannot be enabled for subagents via agent `permission` config |
| [20681](https://github.com/anomalyco/opencode/issues/20681) | cerrado | 2026-04-02 | Excluido (feature) | feat: support github ref plugins and config model limit overrides |
| [21307](https://github.com/anomalyco/opencode/issues/21307) | cerrado | 2026-04-07 | **Incluido** ⭑ | `.opencode/` config precedence is inverted in nested directories |
| [22211](https://github.com/anomalyco/opencode/issues/22211) | cerrado | 2026-04-12 | Excluido (feature) | feat: per-model timeout, permissions, and wildcard glob config |
| [26351](https://github.com/anomalyco/opencode/issues/26351) | cerrado | 2026-05-08 | **Incluido** | [BUG]: Model from previous session overrides current config when continuing a session |
| [28177](https://github.com/anomalyco/opencode/issues/28177) | cerrado | 2026-05-18 | **Incluido** | Config precedence ignored |
| [28658](https://github.com/anomalyco/opencode/issues/28658) | abierto | 2026-05-21 | **Incluido** | OPENCODE_CONFIG_DIR overrides global AGENTS.md path instead of adding to it |
| [28876](https://github.com/anomalyco/opencode/issues/28876) | cerrado | 2026-05-22 | **Incluido** ⭑ | bug: runtime 'always allow' approvals can silently override config deny rules |
| [28926](https://github.com/anomalyco/opencode/issues/28926) | cerrado | 2026-05-23 | Excluido (feature) | [FEATURE] acp: 'Always allow (all projects)' option that writes to global permission config |
| [28960](https://github.com/anomalyco/opencode/issues/28960) | cerrado | 2026-05-23 | **Incluido** | mcp config bypasses the "not user-overridable" precedence guarantee for managed/MDM configs |
| [30415](https://github.com/anomalyco/opencode/issues/30415) | cerrado | 2026-06-02 | **Incluido** | v1.15.13 upward config loading causes local mcp sections to shadow/replace global MCP servers |
| [31919](https://github.com/anomalyco/opencode/issues/31919) | cerrado | 2026-06-11 | **Incluido** | Per-model npm override in custom provider config is ignored |
| [32581](https://github.com/anomalyco/opencode/issues/32581) | cerrado | 2026-06-16 | **Incluido** | ollama plugin overrides api to native protocol ignoring config api setting |
| [34265](https://github.com/anomalyco/opencode/issues/34265) | cerrado | 2026-06-28 | Excluido (feature) | [FEATURE]: also provide JSON config for `Permission required` |
| [36416](https://github.com/anomalyco/opencode/issues/36416) | cerrado | 2026-07-11 | **Incluido** | Desktop ignores permission rules in ~/.config/opencode/opencode.jsonc |
| [36663](https://github.com/anomalyco/opencode/issues/36663) | cerrado | 2026-07-13 | **Incluido** | OPENCODE_CONFIG overridden by global agent markdown files (undocumented precedence) |
| [37155](https://github.com/anomalyco/opencode/issues/37155) | cerrado | 2026-07-15 | **Incluido** ⭑ | AI agent can escalate its own permissions by modifying opencode.json |
| [37544](https://github.com/anomalyco/opencode/issues/37544) | cerrado | 2026-07-17 | **Incluido** | config: existing model limit override is ignored |
| [38149](https://github.com/anomalyco/opencode/issues/38149) | cerrado | 2026-07-21 | **Incluido** | MiniMax-M3: reasoning/thinking never activates — config overrides silently dropped |
| [38799](https://github.com/anomalyco/opencode/issues/38799) | abierto | 2026-07-25 | Excluido (feature) | [FEATURE]: Make `bash` tool respect `shell` config or add env var override |
| [39715](https://github.com/anomalyco/opencode/issues/39715) | abierto | 2026-07-30 | Excluido (feature) | [FEATURE]: Warn users when Plan mode permissions are silently overridden by global config |
| [41162](https://github.com/anomalyco/opencode/issues/41162) | abierto | 2026-08-08 | **Incluido** | bug: config provider-level npm override dropped for inherited models |
| [41712](https://github.com/anomalyco/opencode/issues/41712) | abierto | 2026-08-11 | **Incluido** | permission.skill / tools.skill in standalone agent .md frontmatter is parsed but silently ignored |
| [41916](https://github.com/anomalyco/opencode/issues/41916) | abierto | 2026-08-12 | **Incluido** | Plugin config hooks can mutate process-shared config state via shallow-merged nested objects |
| [43669](https://github.com/anomalyco/opencode/issues/43669) | abierto | 2026-08-20 | **Incluido** | Config permissions/agents overrides cannot override built-in agent policies |
| [43748](https://github.com/anomalyco/opencode/issues/43748) | abierto | 2026-08-21 | **Incluido** | published schema at opencode.ai/config.json rejects documented V2 fields |
| [45266](https://github.com/anomalyco/opencode/issues/45266) | abierto | 2026-08-26 | **Incluido** ⭑ | Config: nested .opencode directory configs merged in wrong precedence order |
| [46873](https://github.com/anomalyco/opencode/issues/46873) | abierto | 2026-09-02 | **Incluido** | Legacy agent `tools` config overrides user `permission` rules in 1.18.26 |
| [48751](https://github.com/anomalyco/opencode/issues/48751) | cerrado | 2026-09-13 | **Incluido** | Agent commits and pushes untested changes despite global permission config |
| [48812](https://github.com/anomalyco/opencode/issues/48812) | abierto | 2026-09-13 | Excluido (no aplica) | schema uses permission (singular), should be permissions (plural) for V2 |
| [49333](https://github.com/anomalyco/opencode/issues/49333) | cerrado | 2026-09-16 | **Incluido** | desktop: latest release crashes with V2 permissions config |

⭑ Casos especialmente ilustrativos, útiles como cita puntual además del conteo agregado:
- **#21307** y **#45266** — confirman de forma independiente, en la vida real, el mismo mecanismo de precedencia invertida en directorios anidados que se verificó en el Anexo I, A.I.3.4.
- **#28876** — confirma que las aprobaciones concedidas en tiempo de ejecución pueden sobrescribir silenciosamente reglas de configuración, relacionado con el mecanismo de herencia de subagentes del Anexo I, A.I.3.9.
- **#37155** — evidencia directa del riesgo de seguridad ya declarado en I.1.3(a) y I.3.1: un agente puede escalar sus propios permisos modificando la configuración.

---

## 4. Advertencia sobre el uso de este número

Esta clasificación la hice yo aplicando el criterio que definimos juntos; no es un conteo automático libre de juicio. Antes de citar "32 casos" en el informe final, te conviene:

1. Revisar vos mismo al menos los casos marcados "Incluido" que te generen dudas — la clasificación de límite (por ejemplo, #19101 o #43748) es defendible pero no la única posible.
2. Decidir si preferís informar el número agregado (32) o desagregarlo como en la Tabla 5 de tu diseño de línea base (por ejemplo, separando "precedencia/fusión" de "permisos" como subcategorías).
3. Si en la Instancia Oral te preguntan por qué el filtro fue "ambos términos en el título" y no en título+cuerpo, la respuesta está en la sección 1 de este anexo: a la escala del repositorio, título+cuerpo sin restricción no es manejable ni defendible.
