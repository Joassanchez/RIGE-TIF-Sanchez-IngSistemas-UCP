# ANEXO VI — CLASIFICACIÓN DE LAS INCIDENCIAS POR MECANISMO

El anexo clasifica por mecanismo las 32 incidencias incluidas en el relevamiento documental del repositorio de OpenCode, cuyo criterio de búsqueda, inclusión y exclusión consta en el Anexo I, A.I.6 del informe de la AE1. Las categorías corresponden a las condiciones del instrumento de la línea de base (informe de la AE1, Tabla 2), y las incidencias que recaen sobre una exclusión del apartado III.4 se consignan con la exclusión correspondiente. La clasificación se realiza sobre el título de cada incidencia y por un único codificador, límite que se suma a los declarados en el apartado II.6.3 del informe de la AE1. Sustenta la Tabla 12 del apartado IV.3.

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
| 28658   | 21/05/2026 | Abierta    | OPENCODE_CONFIG_DIR overrides global AGENTS.md path instead of adding to it                       | Precedencia y fusión (C-2)                   |
| 28876   | 22/05/2026 | Cerrada    | Runtime 'always allow' approvals can silently override config deny rules                          | Fuera de alcance: aprobaciones permanentes   |
| 28960   | 23/05/2026 | Cerrada    | mcp config bypasses the "not user-overridable" precedence guarantee for managed/MDM configs       | Fuera de alcance: configuración administrada |
| 30415   | 02/06/2026 | Cerrada    | v1.15.13 upward config loading causes local mcp sections to shadow/replace global MCP servers     | Precedencia y fusión (C-2)                   |
| 31919   | 11/06/2026 | Cerrada    | Per-model npm override in custom provider config is ignored                                       | Precedencia y fusión (C-2)                   |
| 32581   | 16/06/2026 | Cerrada    | ollama plugin overrides api to native protocol ignoring config api setting                        | Fuera de alcance: código de plugins          |
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

*Tabla A.VI.1. Clasificación por mecanismo de las incidencias del repositorio de OpenCode. Fuente: elaboración propia sobre el relevamiento del 17/09/2026; títulos en su idioma original.*

¹ Clasificación de límite: en las incidencias n.º 13751, n.º 16495 y n.º 43669 interviene una regla nativa, de modo que admiten también la lectura como valor implícito (C-3). Se clasifican como permisos porque el comportamiento reportado es una decisión de permiso.

² La incidencia n.º 46873 corresponde a la versión 1.18.26, posterior a la versión congelada. Acredita la ocurrencia del fenómeno y el cambio de reglas entre versiones, y no el comportamiento de la versión 1.18.25.
