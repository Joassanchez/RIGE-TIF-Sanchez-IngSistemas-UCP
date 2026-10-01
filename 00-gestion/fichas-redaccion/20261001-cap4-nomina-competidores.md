# Nómina de competidores · relevamiento del 01/10/2026

Insumo de las fichas del Cap. IV y de la corrección del A.I.4 (Ventana del AE1). Producido por Codex (`gpt-6.1-sol`, búsqueda web, solo lectura) el 01/10/2026; Amp `permissions test` y Codex `execpolicy check` verificados por el ingeniero en la documentación oficial. **La clasificación de Porter que rige es la de la sección 0** (decisión del autor), no la columna «Fuerza» de la tabla de Codex.

## 0. Clasificación de Porter aprobada por el autor (01/10/2026)

- **Competidores actuales** (operan sobre OpenCode): `debug config`, `debug agent`, OCCM, CC Switch, agnix.
- **Competidores potenciales** (proveedores; evidencia real): Amp `permissions test` (H3, V1), Codex `execpolicy check` (H3, V0), Codex `config/read` (H1, V1). La incidencia de Codex n.º 26255 (Winning, 2026) queda solo como señal de demanda.
- **Sustitutos:** procedimiento manual con los comandos nativos, consulta a un agente de permisos elevados, agente interno que crea y configura agentes (sin cambios) y, nuevo, los sincronizadores de fuente única (Rulesync, CC Switch), que evitan la pregunta en lugar de responderla.
- **Fuera del problema** (nivel 0 en ambos ejes; calidad y seguridad): linters y escáneres (agnix, Snyk Agent Scan, agent-bom, Ramparts, AgentLint, agentlint, leporis-agentlint, agents-md-lint) y gestores o editores (Context Editor, Markr, Claude Code Navigator, AI Context Inspector).
- Las funciones nativas de otras herramientas (Claude Code, Gemini CLI, Cursor, Copilot, Aider, Cline, Roo Code, Kilo Code, Continue, Crush, Goose) y Claude Code Config Manager son evidencia de rivalidad «en organizaciones equivalentes» (guía, §5.2), no sustitutos para quien usa OpenCode.
- **Diferencial:** ninguna herramienta ocupa el cuadrante H3 y V2 (ADR-075).

## Resultado de Codex

La ficha quedó ejecutada en modo de solo lectura: no modifiqué archivos ni instalé o ejecuté las herramientas relevadas.

**El hallazgo principal modifica el posicionamiento de RIGE:** Amp y Codex ya ofrecen funciones documentadas que evalúan una acción e identifican las reglas que determinan el resultado. **No verifiqué una herramienta que reúna simultáneamente H=3 y V=2**, incluyendo archivo y posición de la declaración determinante.

Fecha de corte: **01/10/2026**. La búsqueda cubrió los ecosistemas y registros pedidos. Sus resultados constituyen un relevamiento amplio y reproducible; no permiten demostrar la inexistencia universal de otras herramientas.

## 1. Nómina incluida

Las capacidades de la tabla proceden de las fuentes enlazadas en las fichas. **La asignación de ejes y fuerzas de Porter es mi interpretación**, limitada a lo que esas fuentes permiten verificar.

- **H:** 0 = declaraciones, inventario o validación; 1 = resultado efectivo o fusionado, aunque sea parcial; 2 = valores o reglas en orden de evaluación; 3 = decisión para una acción y regla determinante.
- **V:** 0 = sin procedencia del resultado efectivo; 1 = alcance o capa; 2 = declaración identificada mediante entrada, archivo y posición.
- **Actual:** alternativa existente dentro del ecosistema OpenCode. **Sustituto:** cubre parte de la necesidad mediante otro procedimiento o ecosistema.
- **DO:** documentación oficial. **RP:** README o página del paquete. Ninguna herramienta tiene certeza «probado».

**Encontrar un archivo o señalar la línea de un diagnóstico no demuestra V=2:** debe vincularse esa declaración con el valor efectivo o la decisión explicada.

| Herramienta | Opera sobre | Qué informa | Qué no informa o no se verificó | Eje H | Eje V | Fuerza | Certeza |
|---|---|---|---|---:|---:|---|---|
| OpenCode `debug config` | OpenCode | Configuración resuelta, serializada como JSON | Procedencia, declaraciones desplazadas, explicación de valores implícitos de agentes y decisión de permisos | 1 | 0 | Actual | DO, con código publicado |
| OpenCode `debug agent <nombre>` | OpenCode | Agente resuelto, permisos y disponibilidad de herramientas; incorpora valores nativos | Archivo y posición; separación completa entre declarado e implícito; simulación explicativa con regla determinante | 2 | 0 | Actual | DO, con código publicado |
| OpenCode Config Manager — OCCM | OpenCode | Edición y validación de proveedores, modelos, agentes, MCP, permisos y otros archivos | Estado efectivo del runtime, procedencia de cada valor, implícitos y evaluación explicada de acciones | 0 | 0 | Actual | RP |
| Claude Code Config Manager | Claude Code | Valores por alcance, efectivos y sobrescritos; permisos; detección de solapamientos y duplicados | Cobertura completa de implícitos; decisión hipotética; procedencia completa por posición; orden nativo de evaluación de permisos no acreditado | 1 | 1 | Sustituto | RP |
| Claude Code `/config`, `/status`, `/permissions`, `/mcp`, `/hooks` | Claude Code | Preferencias actuales, estado de sesión, reglas y alcances, servidores y hooks | Explicación unificada de toda la configuración; procedencia por posición; simulador general con regla determinante | 1 | 1 | Sustituto | DO |
| Codex app-server `config/read` | Codex | Configuración efectiva, `origins` por clave y capas opcionales; fuentes y precedencias | Línea/columna de la declaración; explicación completa de todos los implícitos; decisión para una acción | 1 | 1 | Sustituto | DO, con código publicado |
| Codex `execpolicy check` | Reglas de ejecución de Codex | Decisión para un comando y reglas coincidentes; prevalece la decisión más restrictiva | Resultado completo que combine todas las restricciones de sandbox y aprobación; archivo y posición de cada regla | 3 | 0 | Sustituto | DO |
| Amp `permissions test` | Amp | Acción resultante, índice de regla coincidente y alcance de origen; reglas evaluadas secuencialmente | Procedencia por archivo y posición; explicación integral de toda la configuración y sus implícitos | 3 | 1 | Sustituto | DO |
| Gemini CLI `/settings`, `/policies`, `/memory show`, `/mcp` | Gemini CLI | Ajustes actuales, políticas activas, instrucciones concatenadas y estado MCP | Procedencia por declaración; política determinante para una acción; orden de evaluación demostrado por la interfaz | 1 | 0 | Sustituto | DO |
| Cursor: reglas activas | Cursor | Instrucciones activas y distinción entre reglas de proyecto y usuario | Fusión explicada de toda la configuración, implícitos y permisos con regla determinante | 1 | 1 | Sustituto | DO |
| Copilot/VS Code: Chat Debug y Agent Debug Logs | Copilot en VS Code | Contexto enviado, instrucciones descubiertas/aplicadas/omitidas, archivos y herramientas de solicitudes | Procedencia por posición de valores efectivos; evaluación general de permisos con regla determinante | 1 | 1 | Sustituto | DO |
| Aider `/settings` y salida detallada | Aider | Ajustes actuales y archivos de configuración cargados | Atribución de cada valor a una declaración; reglas de permisos y decisiones explicadas | 1 | 1 | Sustituto | DO |
| Cline: configuración MCP | Cline | Configuración e inventario MCP mediante interfaz y CLI | Resolución integral de configuración, procedencia e interpretación de permisos | 1 | 0 | Sustituto | DO |
| Roo Code: gestión/exportación de ajustes | Roo Code | Ajustes, perfiles de proveedores y opciones exportables | Fusión explicada entre alcances; implícitos; decisión de permisos y declaración determinante | 0 | 0 | Sustituto | DO |
| Kilo Code: ajustes de proveedores y configuración | Kilo Code | Gestión de proveedores y elementos configurables del agente | Inspector documentado de procedencia, configuración efectiva integral o permisos determinantes | 0 | 0 | Sustituto | RP |
| Continue: configuración YAML | Continue | Modelos, reglas y servidores MCP declarados; edición y recarga | Explicación del estado efectivo, procedencia, implícitos y decisiones de permisos | 0 | 0 | Sustituto | DO |
| Crush: configuración y permisos | Crush | Configuración y gestión de permisos declarados | Simulación explicativa de acciones; procedencia del valor efectivo por archivo y posición | 0 | 0 | Sustituto | RP |
| Goose: gestión de extensiones | Goose | Extensiones habilitadas, herramientas y configuración asociada | Resolución integral con procedencia; implícitos; regla determinante de una acción | 1 | 0 | Sustituto | DO |
| CC Switch | OpenCode, Claude Code, Codex, Gemini y otros | Gestión de proveedores, MCP, instrucciones y skills; sincronización | Resolución explicada del runtime; implícitos y evaluación nativa de permisos | 0 | 0 | Actual | RP |
| Rulesync — dyoshikawa | Diversos agentes | Generación/sincronización de instrucciones, MCP, agentes, skills y permisos | Estado realmente cargado por cada runtime, procedencia de valores efectivos y decisiones | 0 | 0 | Sustituto | RP |
| RuleSync — juwonllee2024-dotcom | Claude, Cursor, Copilot y otros | Compilación, lint, diferencias, huellas de archivos y predicción de aplicabilidad de reglas canónicas | Estado efectivo del agente; semántica nativa completa de permisos; procedencia de decisiones | 0 | 0 | Sustituto | RP |
| agnix | Instrucciones y configuración de múltiples agentes, incluido OpenCode | Diagnósticos con archivo/posición, reglas de validación y algunos conflictos entre archivos | Resolución del estado efectivo y vinculación entre una declaración y una decisión nativa | 0 | 0 | Actual | RP |
| Snyk Agent Scan | Configuración de agentes, MCP y skills | Descubrimiento y riesgos de seguridad: inyección, herramientas peligrosas y cambios sospechosos | Configuración efectiva, implícitos y permisos nativos con regla determinante | 0 | 0 | Sustituto | RP |
| agent-bom | Agentes y servidores MCP | Inventario y relaciones entre agentes, servidores, herramientas, paquetes, vulnerabilidades y credenciales | Fusión de configuración y evaluación de permisos del runtime | 0 | 0 | Sustituto | RP |
| Ramparts | MCP y skills de agentes | Riesgos, dependencias y análisis de herramientas, recursos, prompts y skills | Estado efectivo integral; procedencia y reglas nativas determinantes | 0 | 0 | Sustituto | RP |
| AI Context Inspector | Múltiples agentes | Inventario de configuración, MCP, skills e instrucciones; reportes y exportación | Configuración efectiva según cada runtime; implícitos; decisión de permisos | 0 | 0 | Sustituto | RP |
| Context Editor | Claude Code y Gemini | Navegación de archivos por entorno y proyecto | Valor ganador, implícitos, procedencia por declaración y decisiones de permisos | 0 | 0 | Sustituto | RP |
| Markr | Instrucciones/configuración de múltiples agentes | Editor, plantillas, vista previa y conteo de tokens | Resolución efectiva, procedencia y evaluación nativa de permisos | 0 | 0 | Sustituto | RP |
| Claude Code Navigator | Claude Code | Árbol de ajustes, MCP, hooks, skills y navegación | Fusión explicada, implícitos y regla determinante de acciones | 0 | 0 | Sustituto | RP |
| AgentLint — `@agent-lint/cli` | Archivos de contexto e instrucciones | Calidad, referencias, conflictos y puntuaciones | Estado efectivo del runtime, procedencia y permisos evaluados | 0 | 0 | Sustituto | RP |
| agentlint — `@agentlinthq/cli` | Repositorios preparados para agentes | Comprobaciones de artefactos y preparación del contexto | Fusión de configuración, implícitos y explicación de permisos | 0 | 0 | Sustituto | RP |
| `leporis-agentlint` | Configuración MCP | Comprobaciones estáticas de secretos, acceso amplio y campos de aprobación | Semántica nativa de permisos; estado efectivo y regla determinante | 0 | 0 | Sustituto | RP |
| `agents-md-lint` / `agents-md-migrate` | AGENTS.md e instrucciones de otros agentes | Validación y migración de instrucciones | Estado efectivo, procedencia y evaluación de permisos | 0 | 0 | Sustituto | RP |

### Fichas breves y evidencia

Las versiones son las últimas publicaciones **verificadas en el canal indicado**. No equiparo versiones de una extensión, CLI y aplicación de escritorio. «Gratuito» se refiere a la distribución del componente; no incluye consumo de modelos o servicios externos.

1. **OpenCode `debug config` — Anomaly.** Versión analizada: **1.18.25**; última release verificada: **1.18.34, 30/09/2026**. Licencia MIT; distribución gratuita. La documentación explica la configuración fusionada; el código publicado de 1.18.25 confirma que el comando imprime `cfg.get()`, sin un mapa de procedencia. [Documentación](https://dev.opencode.ai/docs/config), [implementación 1.18.25](https://raw.githubusercontent.com/anomalyco/opencode/v1.18.25/packages/opencode/src/cli/cmd/debug/config.ts), [última release](https://github.com/anomalyco/opencode/releases/tag/v1.18.34).

2. **OpenCode `debug agent` — Anomaly.** Misma versión, fecha, licencia y precio que el anterior. El código de 1.18.25 muestra el agente resuelto y disponibilidad de herramientas. **La opción `--tool` ejecuta la herramienta**, por lo que no constituye un simulador de solo lectura equivalente a RIGE. [Comando](https://raw.githubusercontent.com/anomalyco/opencode/v1.18.25/packages/opencode/src/cli/cmd/debug/agent.ts), [implementación](https://raw.githubusercontent.com/anomalyco/opencode/v1.18.25/packages/opencode/src/cli/cmd/debug/agent.handler.ts).

3. **OCCM — icysaintdx/IcySaint.** **1.8.0**; publicación de GitHub **16/02/2026**, mientras el changelog la fecha **17/02/2026**. MIT; distribución gratuita. Revisé README y releases: existe y permite gestionar permisos, aunque no explica su evaluación efectiva. [Repositorio](https://github.com/icysaintdx/OpenCode-Config-Manager), [releases](https://github.com/icysaintdx/OpenCode-Config-Manager/releases).

4. **Claude Code Config Manager — Agnislav Onufriichuk.** **0.10.0, 27/03/2026**, según manifiesto y changelog; MIT; extensión de distribución gratuita. Verifiqué Marketplace, README y changelog. Hay detección de sobrescrituras y solapamientos. La navegación que resalta la clave JSON aparece también en cambios **no publicados**, que no cuento como capacidad instalada. [Marketplace](https://marketplace.visualstudio.com/items?itemName=agnislav.claude-code-config-manager), [repositorio y changelog](https://github.com/agnislav/claude-code-config-manager).

5. **Funciones nativas de Claude Code — Anthropic.** Última release verificada: **2.1.286, 30/09/2026**. Licencia y precio aplicable: **[NO ENCONTRADO]** en las fuentes examinadas. `/config` abre preferencias; `/status` informa estado de sesión; `/permissions` gestiona reglas. No documentan conjuntamente un explicador equivalente a RIGE. [Comandos oficiales](https://code.claude.com/docs/en/commands), [release](https://github.com/anthropics/claude-code/releases/tag/v2.1.286).

6. **Codex `config/read` — OpenAI.** **0.159.3, 30/09/2026**; Apache-2.0; distribución gratuita. Documentación y protocolo publicado confirman configuración efectiva, `origins` y capas. El origen puede identificar una fuente y archivo, pero no la posición de la declaración. [App-server](https://developers.openai.com/codex/app-server/), [protocolo publicado](https://raw.githubusercontent.com/openai/codex/rust-v0.159.3/codex-rs/app-server-protocol/src/protocol/v2/config.rs), [release](https://github.com/openai/codex/releases/tag/rust-v0.159.3).

7. **Codex `execpolicy check` — OpenAI.** Misma versión, fecha, licencia y precio. La documentación muestra un comando hipotético, su decisión y reglas coincidentes. Su alcance es **execpolicy**: no acredita por sí solo la autorización final bajo todas las restricciones del agente. [Documentación oficial de reglas](https://developers.openai.com/codex/rules/).

8. **Amp `permissions test` — Amp.** Versión, fecha de versión y licencia: **[NO ENCONTRADO]**. Producto con modalidades gratuitas y pagas. La documentación muestra expresamente `action`, `matched-rule` y `source`; también explica la evaluación secuencial. [Función documentada](https://ampcode.com/notes/permissions), [precios](https://ampcode.com/pricing).

9. **Gemini CLI — Google.** **0.62.0, 29/09/2026**; Apache-2.0; cliente gratuito. Verifiqué comandos de ajustes, políticas, memoria y MCP. La concatenación de instrucciones no incluye una explicación por declaración del resultado. [Comandos](https://geminicli.com/docs/reference/commands/), [release](https://github.com/google-gemini/gemini-cli/releases/tag/v0.62.0).

10. **Reglas activas de Cursor — Cursor.** Versión, fecha, licencia y precio: **[NO ENCONTRADO]**. La documentación acredita reglas activas y alcances; no un inspector integral de permisos y procedencia. [Documentación oficial](https://docs.cursor.com/context/rules-for-ai).

11. **Depuración de Copilot/VS Code — Microsoft/GitHub.** Versión específica del componente, fecha, licencia y precio: **[NO ENCONTRADO]**. Revisé documentación del contexto de solicitudes y descubrimiento de instrucciones. No confundí esos registros con procedencia de valores por posición. [Chat Debug](https://code.visualstudio.com/docs/agents/agent-troubleshooting/chat-debug-view), [diagnóstico del contexto](https://code.visualstudio.com/learn/foundations/debugging-and-whats-happening-behind-the-scenes).

12. **Aider — Paul Gauthier.** Paquete `aider-chat` **0.86.2, 12/02/2026**; licencia Apache; distribución gratuita. `/settings` imprime ajustes actuales; la salida detallada identifica archivos cargados, sin atribución completa por clave. [Comandos](https://aider.chat/docs/usage/commands.html), [paquete](https://pypi.org/project/aider-chat/).

13. **Configuración MCP de Cline — Cline.** Versión y fecha del componente inspeccionado, licencia y precio: **[NO ENCONTRADO]**. La documentación acredita configuración MCP por interfaz y CLI. No trasladé la versión de Cline Desktop a su extensión o CLI. [Documentación](https://docs.cline.bot/mcp/mcp-overview), [Marketplace](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev).

14. **Gestión de ajustes de Roo Code — Roo Code Inc.** **3.54.0, 15/05/2026**. Licencia y precio: **[NO ENCONTRADO]**. Verifiqué exportación y gestión de ajustes, sin explicación de la fusión efectiva. [Documentación](https://roocodeinc.github.io/Roo-Code/features/settings-management/), [release](https://github.com/RooCodeInc/Roo-Code/releases/tag/v3.54.0).

15. **Configuración de Kilo Code — Kilo Org.** **7.8.3, 01/10/2026**. Licencia y precio: **[NO ENCONTRADO]**. README y release acreditan producto publicado y gestión de proveedores/configuración; no encontré un explicador equivalente. [Repositorio](https://github.com/Kilo-Org/kilocode), [release](https://github.com/Kilo-Org/kilocode/releases/tag/v7.8.3).

16. **Configuración de Continue — Continue.** Canal VS Code: **2.0.0-vscode, 19/06/2026**. Licencia y precio: **[NO ENCONTRADO]**. Revisé referencia YAML y configuración local. [Referencia](https://docs.continue.dev/reference), [configuración](https://docs.continue.dev/customize/deep-dives/configuration), [release](https://github.com/continuedev/continue/releases/tag/v2.0.0-vscode).

17. **Configuración/permisos de Crush — Charmbracelet.** **0.97.1, 29/09/2026**; **FSL-1.1-MIT**; distribución gratuita. README acredita comandos y configuración de permisos. No corresponde describir su licencia actual simplemente como MIT. [Repositorio](https://github.com/charmbracelet/crush), [release](https://github.com/charmbracelet/crush/releases/tag/v0.97.1).

18. **Extensiones de Goose — AAIF/colaboradores de Goose.** **1.52.0, 23/09/2026**; Apache-2.0; distribución gratuita. Documentación acredita extensiones habilitadas y su gestión. [Documentación](https://goose-docs.ai/docs/getting-started/using-extensions/), [release](https://github.com/aaif-goose/goose/releases/tag/v1.52.0).

19. **CC Switch — JasonYoung, repositorio farion1231.** **3.20.4, 22/09/2026**; MIT; gratuito. README y release acreditan gestión multiherramienta, incluyendo OpenCode. [Repositorio](https://github.com/farion1231/cc-switch), [release](https://github.com/farion1231/cc-switch/releases/tag/v3.20.4).

20. **Rulesync — dyoshikawa.** **24.0.0, 28/09/2026**; MIT; distribución gratuita. Genera y sincroniza archivos; no verifica por sí mismo qué terminó cargando cada agente. [Repositorio](https://github.com/dyoshikawa/rulesync), [release](https://github.com/dyoshikawa/rulesync/releases/tag/v24.0.0).

21. **RuleSync — juwonllee2024-dotcom y colaboradores.** **1.2.0, 21/08/2026**; MIT; distribución gratuita. Tiene artefacto instalable publicado. Es **otro proyecto**: su README advierte que el nombre npm pertenece a una herramienta distinta. Revisé lint, compilación, `receipt` y predicción de aplicabilidad. [Repositorio](https://github.com/juwonllee2024-dotcom/rulesync), [releases](https://github.com/juwonllee2024-dotcom/rulesync/releases).

22. **agnix — agent-sh.** **0.56.1, 30/09/2026**; MIT o Apache-2.0; distribución gratuita. Valida instrucciones y configuración con diagnósticos localizados. Esos diagnósticos no identifican el origen de un resultado efectivo. [Repositorio](https://github.com/agent-sh/agnix), [release](https://github.com/agent-sh/agnix/releases/tag/v0.56.1).

23. **Snyk Agent Scan — Snyk.** Paquete `snyk-agent-scan` **0.6.8, 29/09/2026**; Apache-2.0. Código disponible gratuitamente; condiciones/precio del servicio asociado: **[NO ENCONTRADO]**. Es la continuidad del proyecto conocido como `mcp-scan`. [Repositorio](https://github.com/snyk/agent-scan), [paquete](https://pypi.org/project/snyk-agent-scan/).

24. **agent-bom — Wagdy Saad, msaad00.** **0.107.0, 30/09/2026**; Apache-2.0; distribución gratuita. La página del paquete documenta inventarios y relaciones de seguridad entre agentes y MCP. [Paquete y documentación](https://pypi.org/project/agent-bom/).

25. **Ramparts — Highflame AI.** **0.8.7, 21/08/2026**; Apache-2.0; distribución gratuita, con posibles servicios/modelos externos. Revisé README y release; las capacidades descritas en la rama principal no se consideran automáticamente presentes en cualquier release anterior. [Repositorio](https://github.com/highflame-ai/ramparts), [release](https://github.com/highflame-ai/ramparts/releases/tag/v0.8.7).

26. **AI Context Inspector — cocaxcode.** Paquete `@cocaxcode/ai-context-inspector` **0.4.10**; fecha exacta: **[NO ENCONTRADO]**; MIT; distribución gratuita. Inventaría configuración y genera reportes; no reproduce íntegramente los runtimes inspeccionados. [Repositorio](https://github.com/cocaxcode/ai-context-inspector), [npm](https://www.npmjs.com/package/%40cocaxcode/ai-context-inspector).

27. **Context Editor — piratf.** Release **0.3.0**; día y mes visibles: **02/03**; año de publicación: **[NO ENCONTRADO]** en la página consultada. MPL-2.0; extensión de distribución gratuita. Está publicada en Marketplace y Open VSX; agrupa y abre archivos. [Marketplace](https://marketplace.visualstudio.com/items?itemName=piratf.context-editor), [Open VSX](https://open-vsx.org/extension/piratf/context-editor), [releases](https://github.com/piratf/context-editor/releases).

28. **Markr — ApptwareLabs Pvt. Ltd.** Versión y fecha: **[NO ENCONTRADO]**. Licencia propia: uso personal gratuito; determinados usos comerciales requieren licencia comercial. Importe: **[NO ENCONTRADO]**. Revisé funcionalidades y condiciones publicadas. [Marketplace](https://marketplace.visualstudio.com/items?itemName=Apptware-Product-Lab.markr).

29. **Claude Code Navigator — broker4develop.** Versión, fecha, licencia y precio: **[NO ENCONTRADO]**. La publicación documenta navegación de configuración; no demuestra que todos los archivos mencionados equivalgan a fuentes efectivas del runtime actual. [Marketplace](https://marketplace.visualstudio.com/items?itemName=broker4develop.claude-settings-manager).

30. **AgentLint — samilozturk, `@agent-lint/cli`.** **0.8.1**; fecha exacta: **[NO ENCONTRADO]**; MIT; distribución gratuita. Revisé paquete y README: evalúa calidad de contexto e instrucciones. [npm](https://www.npmjs.com/package/%40agent-lint/cli), [repositorio](https://github.com/samilozturk/agentlint).

31. **agentlint — organización agentlint, `@agentlinthq/cli`.** Release **2.3.0, 12/06/2026**; MIT; CLI gratuita. Es distinto del anterior: revisa preparación del repositorio para agentes. [Repositorio](https://github.com/agentlint/agentlint), [release](https://github.com/agentlint/agentlint/releases/tag/v2.3.0).

32. **`leporis-agentlint` — Leporis14.** **0.1.3, 27/06/2026**; MIT; distribución gratuita. README y paquete documentan análisis estático de MCP. Sus comprobaciones de campos de aprobación no acreditan evaluación de permisos nativos de OpenCode, Claude o Codex. [PyPI](https://pypi.org/project/leporis-agentlint/), [README](https://github.com/Leporis14/agentlint).

33. **`agents-md-lint` / `agents-md-migrate` — Taiizor.** Kit `agents-md-cookbook` **1.0.0, 14/06/2026**; versiones individuales de los paquetes: **[NO ENCONTRADO]**; MIT; distribución gratuita. README y release acreditan linter y migradores. [Repositorio](https://github.com/Taiizor/agents-md-cookbook), [releases](https://github.com/Taiizor/agents-md-cookbook/releases).

## 2. Cambios respecto de A.I.4

| Registro del 17/09/2026 | Resultado de la verificación |
|---|---|
| OpenCode muestra configuración fusionada sin procedencia | **Confirmado.** `debug config` imprime configuración resuelta; no explica el origen por declaración. |
| OpenCode muestra el agente efectivo y sus permisos | **Confirmado con límite.** `debug agent` aporta valores nativos y disponibilidad de herramientas. `--tool` ejecuta una herramienta; no equivale a evaluar hipotéticamente una acción y mostrar su regla determinante. |
| OCCM no informa permisos | **Corregir.** Sí permite gestionarlos. Lo no acreditado es su **evaluación efectiva y explicada**, no la existencia de una sección de permisos. |
| Claude Code Config Manager informa alcances y sobrescrituras | **Confirmado.** Sigue existiendo; versión verificada 0.10.0. |
| Claude Code Config Manager no informa relaciones | **Corregir.** El changelog documenta solapamientos de hooks/permisos y duplicados. Son relaciones parciales, no un grafo integral del runtime. |
| Claude Code Config Manager en H=2, V=1 | **Revisar a H=1, V=1 con la evidencia disponible.** Está acreditada la precedencia entre alcances y el valor efectivo; no encontré prueba suficiente de que presente las reglas en el orden nativo de evaluación de permisos. |
| Escáneres MCP y validadores de instrucciones genéricos | **Sustituir categorías por nombres verificables:** agnix, Snyk Agent Scan, agent-bom, Ramparts y los linters incluidos. |
| Procedencia de Codex como propuesta | **Separar propuesta de producto.** La incidencia sigue siendo evidencia de demanda; `config/read` ya es una función real que aporta configuración efectiva y orígenes por capa. |
| Ninguna alternativa llega al nivel horizontal 3 | **Retirar.** Amp y Codex execpolicy alcanzan H=3 dentro de sus respectivos alcances. |
| Ninguna alternativa reúne H=3 y V=2 | **Mantener como resultado del relevamiento**, evitando convertirlo en una afirmación universal de inexistencia. |

**Incidencia Codex n.º 26255.** Al corte consultado continúa abierta, sin implementación vinculada en su sección de desarrollo. Tampoco encontré `codex config inspect` o `codex config explain` en la referencia oficial de comandos. Por tanto, **no encontré evidencia de que el comando propuesto se haya implementado después del 17/09/2026**. La existencia de `config/read` no demuestra esa implementación: es otra interfaz y debe relevarse por separado. [Incidencia](https://github.com/openai/codex/issues/26255), [referencia CLI](https://developers.openai.com/codex/cli/reference/).

## 3. Descartadas y candidatas no incorporadas

Las condiciones son: **C1**, publicación utilizable; **C2**, operación pertinente sobre configuración de agentes de programación; **C3**, evidencia primaria verificable.

| Herramienta o propuesta | Decisión y motivo |
|---|---|
| Propuesta `codex config inspect/explain`, incidencia 26255 | **Descartada como herramienta: no cumple C1.** Se conserva como demanda y posible entrada futura. |
| Git `config --show-origin --show-scope` | **Fuera de la nómina: no cumple C2.** Es un antecedente de procedencia, no configuración de agentes de programación. |
| AWS IAM Policy Simulator | **Fuera de la nómina: no cumple C2.** Evalúa políticas de infraestructura. |
| OPA como producto independiente | **Fuera de la nómina: no cumple C2 por sí solo.** Su integración documentada con Amp sí constituye una relación pertinente. |
| ESLint `--print-config`, TypeScript `--showConfig`, Maven `help:effective-pom` | **Fuera de la nómina: no cumplen C2.** Son antecedentes técnicos de otros dominios. |
| `mcp-rampart` | **No incluido: C2 no acreditada para esta comparación.** El paquete localizado se centra en auditar implementaciones de servidores; no debe confundirse con Ramparts de Highflame. |
| ClaudeConfig para Claude Desktop | **No incluido: C2 no acreditada.** La publicación localizada gestiona MCP de Claude Desktop; no demuestra operación sobre un agente de programación. |
| RFC, artículos y propuestas de MCP Shield/SandboxScan sin artefacto publicado verificado | **No incluidos: C1 no acreditada.** Una descripción conceptual no basta. |
| `mcp-scan` de tutoriales de Agent Governance Toolkit | **Pendiente: C1 no acreditada para la función concreta.** Encontrar documentación de una implementación en desarrollo no demuestra su presencia en un paquete publicado. |
| `@tonyclaw/agent-inspector` | **Pendiente de verificación.** La evidencia localizada se concentra en tráfico/proxy; no acredité suficientemente un inspector de configuración pertinente y publicado con las capacidades buscadas. |
| `@riskaverse/toolgate` | **Pendiente de verificación primaria completa: C3.** No lo descarto como producto inexistente; no lo incorporo sin verificar publicación y alcance de sus políticas. |
| `aglint` de AdGuard | **Descartado: no cumple C2.** La coincidencia nominal no corresponde a un linter de configuración de agentes. |
| Prompts y consejos de listas awesome sin herramienta publicada | **Descartados: no cumplen C1 como herramienta.** Pueden ser procedimientos manuales sustitutos. |

## 4. Referencias APA 7

Las funciones del mismo producto comparten una referencia de software; las fuentes específicas de comportamiento están enlazadas en sus fichas.

- Anomaly. (2026). *OpenCode* (Versión 1.18.34) [Software]. GitHub. [Release](https://github.com/anomalyco/opencode/releases/tag/v1.18.34).
- icysaintdx. (2026). *OpenCode Config Manager (OCCM)* (Versión 1.8.0) [Software]. GitHub. [Repositorio](https://github.com/icysaintdx/OpenCode-Config-Manager).
- Onufriichuk, A. (2026). *Claude Code Config Manager* (Versión 0.10.0) [Extensión de VS Code]. Visual Studio Marketplace. [Publicación](https://marketplace.visualstudio.com/items?itemName=agnislav.claude-code-config-manager).
- Anthropic. (2026). *Claude Code* (Versión 2.1.286) [Software]. GitHub. [Release](https://github.com/anthropics/claude-code/releases/tag/v2.1.286).
- OpenAI. (2026). *Codex* (Versión 0.159.3) [Software]. GitHub. [Release](https://github.com/openai/codex/releases/tag/rust-v0.159.3).
- Amp. (s. f.). *How we think about permissions* [Documentación de software]. Recuperado el 1 de octubre de 2026, de [Amp](https://ampcode.com/notes/permissions).
- Google. (2026). *Gemini CLI* (Versión 0.62.0) [Software]. GitHub. [Release](https://github.com/google-gemini/gemini-cli/releases/tag/v0.62.0).
- Cursor. (s. f.). *Rules* [Documentación de software]. Recuperado el 1 de octubre de 2026, de [Cursor Docs](https://docs.cursor.com/context/rules-for-ai).
- Microsoft. (s. f.). *Chat debug view* [Documentación de software]. Recuperado el 1 de octubre de 2026, de [Visual Studio Code](https://code.visualstudio.com/docs/agents/agent-troubleshooting/chat-debug-view).
- Gauthier, P. (2026). *aider-chat* (Versión 0.86.2) [Software]. PyPI. [Paquete](https://pypi.org/project/aider-chat/).
- Cline. (s. f.). *MCP overview* [Documentación de software]. Recuperado el 1 de octubre de 2026, de [Cline Docs](https://docs.cline.bot/mcp/mcp-overview).
- Roo Code Inc. (2026). *Roo Code* (Versión 3.54.0) [Software]. GitHub. [Release](https://github.com/RooCodeInc/Roo-Code/releases/tag/v3.54.0).
- Kilo Org. (2026). *Kilo Code* (Versión 7.8.3) [Software]. GitHub. [Release](https://github.com/Kilo-Org/kilocode/releases/tag/v7.8.3).
- Continue. (2026). *Continue* (Versión 2.0.0-vscode) [Extensión de VS Code]. GitHub. [Release](https://github.com/continuedev/continue/releases/tag/v2.0.0-vscode).
- Charmbracelet. (2026). *Crush* (Versión 0.97.1) [Software]. GitHub. [Release](https://github.com/charmbracelet/crush/releases/tag/v0.97.1).
- AAIF Goose. (2026). *Goose* (Versión 1.52.0) [Software]. GitHub. [Release](https://github.com/aaif-goose/goose/releases/tag/v1.52.0).
- JasonYoung. (2026). *CC Switch* (Versión 3.20.4) [Software]. GitHub. [Repositorio](https://github.com/farion1231/cc-switch).
- dyoshikawa. (2026). *Rulesync* (Versión 24.0.0) [Software]. GitHub. [Repositorio](https://github.com/dyoshikawa/rulesync).
- juwonllee2024-dotcom. (2026). *RuleSync* (Versión 1.2.0) [Software]. GitHub. [Repositorio](https://github.com/juwonllee2024-dotcom/rulesync).
- agent-sh. (2026). *agnix* (Versión 0.56.1) [Software]. GitHub. [Repositorio](https://github.com/agent-sh/agnix).
- Snyk. (2026). *snyk-agent-scan* (Versión 0.6.8) [Software]. PyPI. [Paquete](https://pypi.org/project/snyk-agent-scan/).
- Saad, W. (2026). *agent-bom* (Versión 0.107.0) [Software]. PyPI. [Paquete](https://pypi.org/project/agent-bom/).
- Highflame AI. (2026). *Ramparts* (Versión 0.8.7) [Software]. GitHub. [Repositorio](https://github.com/highflame-ai/ramparts).
- cocaxcode. (s. f.). *AI Context Inspector* (Versión 0.4.10) [Software]. npm. Recuperado el 1 de octubre de 2026, de [paquete](https://www.npmjs.com/package/%40cocaxcode/ai-context-inspector).
- piratf. (s. f.). *Context Editor* (Versión 0.3.0) [Extensión de VS Code]. Visual Studio Marketplace. Recuperado el 1 de octubre de 2026, de [publicación](https://marketplace.visualstudio.com/items?itemName=piratf.context-editor).
- ApptwareLabs Pvt. Ltd. (s. f.). *Markr* [Extensión de VS Code]. Visual Studio Marketplace. Recuperado el 1 de octubre de 2026, de [publicación](https://marketplace.visualstudio.com/items?itemName=Apptware-Product-Lab.markr).
- broker4develop. (s. f.). *Claude Code Navigator* [Extensión de VS Code]. Visual Studio Marketplace. Recuperado el 1 de octubre de 2026, de [publicación](https://marketplace.visualstudio.com/items?itemName=broker4develop.claude-settings-manager).
- samilozturk. (s. f.). *AgentLint* (Versión 0.8.1) [Software]. npm. Recuperado el 1 de octubre de 2026, de [paquete](https://www.npmjs.com/package/%40agent-lint/cli).
- agentlint. (2026). *agentlint* (Versión 2.3.0) [Software]. GitHub. [Repositorio](https://github.com/agentlint/agentlint).
- Leporis14. (2026). *leporis-agentlint* (Versión 0.1.3) [Software]. PyPI. [Paquete](https://pypi.org/project/leporis-agentlint/).
- Taiizor. (2026). *agents-md-cookbook: agents-md-lint y agents-md-migrate* (Versión del kit 1.0.0) [Software]. GitHub. [Repositorio](https://github.com/Taiizor/agents-md-cookbook).

Referencia adicional de demanda, **no de herramienta incluida**:

- Winning, S. (2026). *Expose effective config provenance from the CLI* (Incidencia n.º 26255) [Incidencia de GitHub]. [OpenAI/Codex](https://github.com/openai/codex/issues/26255).

## 5. Amenazas para RIGE

- **Amp — H=3, V=1.** Es el antecedente funcional más cercano a la explicación de permisos: devuelve acción, regla coincidente y alcance. Debilita directamente la exclusividad del eje horizontal. No acredita archivo y posición ni opera sobre OpenCode. [Evidencia](https://ampcode.com/notes/permissions).

- **Codex `execpolicy check` — H=3, V=0.** Ya proporciona evaluación determinista de comandos y reglas coincidentes. Su alcance más estrecho impide equipararlo con toda la autorización efectiva del agente. [Evidencia](https://developers.openai.com/codex/rules/).

- **OpenCode `debug agent` — H=2, V=0.** Es la amenaza nativa más inmediata porque trabaja sobre el mismo runtime y ya resuelve agentes, permisos y herramientas. Añadir una explicación de coincidencias y conservar posiciones de origen podría acercarlo al objetivo de RIGE; esa evolución es una **inferencia**, no una función publicada verificada.

- **Codex `config/read` — H=1, V=1.** Existe infraestructura concreta de configuración efectiva y procedencia por clave/capa. Agregar posiciones sería una evolución técnicamente plausible, pero no está demostrado en el protocolo publicado consultado. [Protocolo](https://raw.githubusercontent.com/openai/codex/rust-v0.159.3/codex-rs/app-server-protocol/src/protocol/v2/config.rs).

- **Claude Code Config Manager — H=1, V=1.** Ya explica sobrescrituras y detecta relaciones parciales. La navegación a declaraciones lo acerca visualmente al problema de procedencia, pero no acredité cobertura publicada que justifique V=2.

- **agnix — H=0, V=0 en estos ejes.** Tiene análisis y diagnósticos con posiciones, una base útil para desarrollar procedencia. Actualmente esas posiciones pertenecen a hallazgos de validación, no al origen de un valor efectivo o una decisión.

**Ninguna herramienta verificada alcanzó el cuadrante de RIGE, H=3 y V=2.** La diferenciación defendible debe formularse como la combinación de **semántica de OpenCode 1.18.25, decisión y regla determinante, procedencia por declaración, implícitos y declaraciones sin efecto**. El relevamiento no sostiene que evaluar y explicar permisos sea, por sí solo, una capacidad inédita.

En Porter, los proveedores nativos son **entrantes potenciales al alcance integral de RIGE**; sus funciones ya publicadas son competidores o sustitutos presentes. La incidencia de Codex refuerza la demanda, pero no constituye un producto competidor.

## 6. Consultas realizadas

Consulté primero A.I.4, IV.3, IV.4 y las tres filas de fuentes indicadas. Después recorrí documentación oficial, repositorios, releases, manifiestos, changelogs y registros de distribución.

| Sitio o familia | Consultas representativas |
|---|---|
| OpenCode y GitHub | `OpenCode debug config debug agent CLI documentation`; `github icysaintdx OpenCode Config Manager releases` |
| Claude Code y Marketplace | `agnislav claude code config manager marketplace`; `site:code.claude.com/docs "/permissions" "/status"` |
| Codex | `github openai codex 26255 provenance`; `site:developers.openai.com/codex "execpolicy" "check"`; `"config/read" origins` |
| Gemini CLI | `site:geminicli.com "/permissions" "/settings" policy` |
| Gestores multiherramienta | `AI coding agent config manager cc-switch rulesync ai-rules npm`; `"OpenCode" "config" "inspector" npm` |
| Linters | `agent instructions linter "npm" agnix`; `"AGENTS.md" linter "npm" "aglint"` |
| Seguridad MCP | `MCP security scanner mcp-scan agent configuration`; `"MCP" scanner "Ramparts" pypi` |
| Extensiones | `site:open-vsx.org "claude" "config"`; búsquedas equivalentes en Visual Studio Marketplace |
| Inspectores de permisos | `"Claude Code" "permission checker" npm`; consultas por permisos de Amp y Codex |
| GitHub Topics y listas | Tema `agent-config`; listas `hesreallyhim/awesome-claude-code` y `punkpeye/awesome-mcp-servers` |

También revisé específicamente Cline, Roo Code, Kilo Code, Aider, Continue, Amp, Crush, Goose, Cursor y Copilot.

**Límites de reproducción:** algunos registros tienen metadatos dinámicos o respuestas restringidas. Cuando no pude verificar versión, fecha, licencia o precio, quedó **[NO ENCONTRADO]**. Las listas awesome se usaron para descubrir candidatos; la inclusión se sustentó en fuentes primarias. No se realizaron pruebas de comportamiento.