# Relevamiento de la práctica de delegación (P1) y del error de los agentes (P2) · Resultados

Registro de la ejecución de `PROTOCOLO-relevamiento-delegacion.md`. Cada fila consigna fecha, fuente, qué se hizo y qué se obtuvo, incluidos los resultados nulos y los descartes con su motivo.

Fecha de corte: 09/10/2026.

## F-1 · Referente

| Fecha | Acción | Resultado |
|---|---|---|
| 09/10/2026 | El autor envía el reenvío de la sección 2.2 de `borrador-encuesta-practica.md` | Sin respuesta a la fecha. Guardar copia del correo enviado en `01-relevamiento/evidencia/` |

## F-3a · Reclasificación de las 32 incidencias de A.VI.6

**Codificación:** 09/10/2026, ingeniero (Claude Code), codificador único; revisión del autor pendiente. Material: cuerpo completo de las 32 por la API de GitHub, comentarios humanos de 25 (los de #43669, #43748, #45266, #46873, #48751 y #49333 quedan pendientes por el límite de la API sin autenticar; #41916 no tiene comentarios) y el adjunto de #37155, que es todo su contenido.

**Resultado:**

| Cat. | Casos | Incidencias |
|---|---|---|
| D-1 | 0 | — |
| D-2 | 0 | — |
| D-3 | 1 | #15664 |
| D-0 | 31 | Las restantes |

**Casos con observación:**

| N.º | Cat. | Fragmento y motivo |
|---|---|---|
| 15664 | D-3 | «opus found out that this is the issue - I verified that without "*": "ask" exclusion works». El usuario delegó el **diagnóstico** en un modelo, que acertó, y verificó el resultado probando el comportamiento. Aporta a P1 (práctica de delegar el diagnóstico) y es un caso que va en la dirección de R-4 (el usuario verifica); no aporta a P2 |
| 37155 | D-0 | El adjunto (`security.md`) describe que un agente **puede** modificar `opencode.json` y escalar sus propios permisos, sin relatar un episodio ocurrido. No es D-1, que exige una modificación ocurrida. Pertinente para la consecuencia de seguridad del I.3.1 como riesgo, no como ocurrencia. **Observación sobre A.VI.6:** el criterio de inclusión exigía un comportamiento vivido; su inclusión es discutible |
| 32581 | — | **Error de inclusión en A.VI.6.** El propio autor de la incidencia comenta: «this was filed against the wrong repo. The issue is about OpenClaw (openclaw/openclaw), not OpenCode». Corresponde excluirla: el conteo de A.VI.6 pasa de 32 a 31 incluidas |
| 11218 | D-0 | El usuario interpretó mal el orden de las reglas de permiso; un mantenedor responde que el orden es intencional y está documentado. Error humano de interpretación, sin agente |

**Lectura con las reglas del protocolo.** El corpus de A.VI.6 no aporta a P1 ni a P2 como ocurrencia: ninguna incidencia relata que un agente haya configurado mal o respondido mal sobre la configuración. Es coherente con su criterio de búsqueda, que seleccionó por título reportes sobre el comportamiento de la herramienta, no sobre su uso. F-3a no cuenta como fuente independiente para R-1; la búsqueda complementaria F-3b es la que puede encontrar casos de delegación.

## F-3b · Búsqueda complementaria de incidencias

**Búsqueda:** 09/10/2026, ingeniero, API de búsqueda de GitHub sobre `anomalyco/opencode` (título y cuerpo de incidencias y PR), `created:<=2026-10-09`.

| Cód. | Cadena | Resultados | Tratamiento |
|---|---|---|---|
| q1 | `"the agent" "opencode.json" (edited OR modified OR changed OR wrote OR broke)` | 1048 | **Descartada por imprecisa**: la búsqueda de GitHub no aplica el agrupamiento con OR como se esperaba |
| q2 | `"asked the agent" config` | 37 | Títulos revisados |
| q3 | `"asked opencode" config` | 86 | Títulos revisados (primeros 30, orden por relevancia) |
| q4 | `(agent OR LLM OR model) "modified my config"` | 2 | Títulos revisados |
| q5 | `(agent OR LLM OR model) "changed my config"` | 11 | Títulos revisados |
| q6 | `"agent create" generated` | 119 | Títulos revisados (primeros 30) |
| q7 | `agent "edited opencode.json"` | 3 | Títulos revisados |
| q8 | `"opencode.json" "the model" (hallucinated OR invented OR wrong)` | 1449 | **Descartada por imprecisa**, mismo motivo que q1 |

Preselección por título y lectura de la página completa (cuerpo y comentarios) de los candidatos. **Limitación:** se revisaron títulos, no cuerpos, de los resultados de q3 y q6 fuera de los primeros 30; la cobertura es parcial.

**Incluidas:**

| N.º | Fecha | Cat. | Qué relata |
|---|---|---|---|
| [14216](https://github.com/anomalyco/opencode/issues/14216) | 19/02/2026 | **D-1** | «I asked the agent to make an adjustment to my opencode.json file and it didn't follow the schema format»: el agente escribió una clave `subAgents` donde el esquema exige `agent` y omitió `mode`, con `$schema` declarado en el archivo (modelo MiniMax M2.5 Free). El autor: «I don't think I should need to have OpenCode's source code on my machine to expect it to know how to configure itself». Cerrada a favor de #13621 (pedido de un servidor MCP con la documentación oficial) |
| [22247](https://github.com/anomalyco/opencode/issues/22247) | 13/04/2026 | **D-1** | (En chino.) «ai修改了一个名为opencode.json文件过后 重启就一直提示无法连接服务器»: después de que la IA modificó `opencode.json`, OpenCode deja de conectar al reiniciar. El usuario: «我也不知道具体修改了什么» («tampoco sé qué modificó exactamente»). Sin solución; cerrada como consulta de soporte. Ilustra que el usuario no puede verificar lo que el agente cambió |

**Candidatas no leídas por el límite de la API:** #20307 («Granular permissions not working (or documentation bad?)») y #30151 («All is gone after MCP Server configuration»).

**Hallazgo incidental:** #47654 lleva a la skill incorporada `customize-opencode` (ver F-7).

## F-4 · Literatura académica

**Búsqueda:** 09/10/2026, ingeniero, buscador web general (no se consultaron todavía las bases ACM DL ni IEEE Xplore en forma directa). Cadenas: las dos del protocolo y variantes («LLM troubleshooting software misconfiguration», «LLM reasoning configuration precedence merge», «coding agent modifies its own settings permissions»). Cada candidato se verificó en su página de arXiv; las cifras salen del resumen original, no del fragmento del buscador.

| Candidato | Fecha | Afirmación | Qué aporta (según el resumen) | Estado |
|---|---|---|---|---|
| Lian, X., Chen, Y., Cheng, R., Huang, J., Thakkar, P., Zhang, M. y Xu, T. *Configuration Validation with Large Language Models*. arXiv:2310.09690 | v1 15/10/2023; v2 02/04/2024 | P2 | Ocho modelos sobre la configuración de diez sistemas de código abierto; el marco Ciri valida configuración con pocos ejemplos y controla alucinación y no determinismo. Informa limitaciones: tipos de error que no detecta y sesgo hacia parámetros populares. La versión de tesis (IDEALS, Illinois) agregaría debilidad en dependencias y en errores **específicos de versión**: **a verificar en el texto completo** | Incluido; preimpresión sin revisión por pares declarada |
| Ye, Z., Le, T. H. M. y Babar, M. A. *LLMSecConfig: An LLM-Based Approach for Fixing Software Container Misconfigurations*. arXiv:2502.02009 | 04/02/2025 | P2 · **R-6** | Sobre 1000 configuraciones reales de Kubernetes, el sistema (modelo + análisis estático + recuperación) corrige alrededor del 94 % con pocos errores nuevos. **El fragmento del buscador decía 40,2 %: corresponde, a verificar, a un modelo solo; el resumen informa el sistema completo** | Incluido |
| Asadli, R., Hoffman, B., Protogeros, I. y Vanbever, L. *Evaluating Agentic Configuration Repair for Computer Networks*. arXiv:2606.06212 | 04/06/2026 | P2 | Los modelos fallan con frecuencia al corregir configuraciones de red grandes y a veces introducen errores nuevos; con verificación formal y recuperación de contexto mejoran 12 % en eficacia y 17 % en seguridad, en promedio | Incluido |
| Ghorab, M. A., Abdel Latif, A. y Saied, M. A. *Kubernetes Misconfigurations in the Wild*. arXiv:2609.27030 | 22/09/2026 | P2 · **R-6** | 2662 incidencias de Stack Overflow. El mejor modelo solo corrige 89,06 %; con validación determinista contra el esquema oficial (Kubecurity), 98,50 % | Incluido |
| Galster, M., Mohsenimofidi, S., Lulla, J. L., Abubakar, M. A., Treude, C. y Baltes, S. *Configuring Agentic AI Coding Tools: An Exploratory Study*. arXiv:2602.14690 | 16/02/2026 | Contexto de P1 | 2926 repositorios; ocho mecanismos de configuración en cinco herramientas (Claude Code, Copilot, Cursor, Gemini, Codex); predominan los archivos de contexto. Acredita que configurar estas herramientas es una práctica extendida y variada; **no** estudia quién la escribe ni si se delega | Incluido como contexto |
| Kapner, B., Soceanu, C., Petrunin, A. y Gartner, H. *Scanning the Harness: Configuration Exposures in AI Coding-Agent Supply Chains*. arXiv:2609.07360 | v1 07/09/2026; v3 25/09/2026 | Contexto de P2 | 3171 repositorios (2660 configuraciones y 511 colecciones de skills): 15,4 % de las configuraciones con al menos una de tres exposiciones (paquetes MCP sin versión fija 9,8 %; permisos de ejecución amplios 2,5 %; skills con herramientas preaprobadas 3,8 %). Acredita errores en la configuración de agentes; **no** los atribuye a un agente ni a una persona | Incluido como contexto |
| `chatlatanagu2025` (*Agent READMEs*) | 2025 | Contexto de P1 | Ya registrada en `fuentes.md`, «sin verificar» | Pendiente de verificación |

**Descartes:** «Who Reasons in the Large Language Models?» (arXiv:2505.20993), por ser sobre combinación de pesos de modelos y no sobre archivos de configuración; documentación de sistemas de configuración por capas (TopMark, llm_core, Dexto), por no ser estudios; SlsDetector (arXiv:2411.00642) y CAIP (2411.14283), por no estar verificados todavía en la fuente (pendientes).

**Ausencia relevante:** no se encontró ningún estudio que evalúe a un modelo **resolviendo la precedencia o la fusión de configuración por capas**, que es la tarea de la línea de base. Los estudios incluidos tratan de validar o corregir configuración de un sistema (Kubernetes, redes, sistemas de código abierto), no de determinar el valor efectivo entre varias fuentes.

**Lectura con las reglas.** No se aplica R-5 (hay estudios). Se aplica **R-6**: dos estudios informan desempeño alto, pero solo cuando el modelo se combina con un validador determinista (89 % el modelo solo frente a 98,5 % con validación de esquema; alrededor del 94 % con análisis estático). Se informa como evidencia que matiza la hipótesis: el modelo solo se equivoca en una proporción no despreciable, y la combinación con una herramienta determinista reduce el error. Es el mismo diseño que la medición final de RIGE (el agente con y sin RIGE como herramienta determinista). El dominio difiere y se declara.

## F-5 · Encuestas sectoriales

| Fuente | Fecha | Dato pertinente | Alcance |
|---|---|---|---|
| Stack Overflow, *2025 Developer Survey*, sección IA (survey.stackoverflow.co/2025/ai) | 2025 | «Are you using AI agents in your work?» (31 877 respuestas): sí, a diario 14,1 %; semanalmente 9 %; mensualmente o menos 7,8 %; no, pero planea 17,4 %; no y no planea 37,9 %; solo autocompletado 13,8 %. «I am concerned about the accuracy of the information provided by AI agents» (28 930 respuestas): 57,1 % muy de acuerdo y 29,8 % algo de acuerdo | Verificado en la página oficial el 09/10/2026 |
| Stack Overflow, resultados de la encuesta 2026 (blog del 06/10/2026; survey.stackoverflow.co/2026) | 06/10/2026 | Más de 30 000 participantes en siete semanas. Entre quienes usan asistentes o agentes de IA: 73 % los usa a diario; 66 % trabaja con agentes de programación; agentes más citados: Claude Code (66 %) y GitHub Copilot (59 %); usos principales: generar código (67 %) y depurar (61 %); solo 20 % los usa para desplegar, operar o diagnosticar sistemas en producción | Verificado en el blog oficial; falta la página de resultados |

**Lectura.** Acreditan que el uso de agentes de programación creció y es diario en quienes los usan (contexto de P1, componente 4). Ninguna pregunta trata sobre configurar la propia herramienta. Los usos informados no incluyen la configuración del agente, lo que no la descarta pero tampoco la sostiene. El 31 % de 2025 se refiere a todos los desarrolladores, no a la población de RIGE (usuarios de OpenCode).

## F-8 · Foros y relatos (ilustrativos)

| Caso | Fecha | Qué relata | Afirmación |
|---|---|---|---|
| Bosch, R. «Claude Code's helpful escalation of privileges». Substack (rolibosch.substack.com) | 25/02/2026 | El usuario había configurado los permisos **pidiéndole al agente que modificara su propia configuración**. Más tarde, ante pushes denegados, pidió «darle permiso total ahora mismo»; el agente abrió el archivo de configuración, borró las dos reglas que denegaban `git push` y publicó los cambios | P1 (delegación del cambio de configuración, relatada por el usuario) y riesgo del I.3.1. **El resumen del buscador decía que el agente lo hizo «sin que se lo pidieran»; el texto muestra que el usuario lo pidió en forma ambigua.** Relato único, sin método |

## F-6 · Oferta de skills y agentes que configuran

**Búsqueda:** 09/10/2026, ingeniero, buscador web general y catálogos de skills. Cadenas: «opencode agent that configures opencode.json», «Claude Code skill that writes settings.json permissions», «update-config skill Claude Code».

| Oferta | Herramienta | Qué hace | Verificación |
|---|---|---|---|
| `update-config`, skill incorporada en Claude Code | Claude Code | Skill que el propio fabricante incluye para que el agente modifique la configuración de la herramienta (`settings.json`, permisos, hooks, variables de entorno) | Observada de primera mano: figura entre las skills disponibles de Claude Code 2.1.285, la herramienta con que corre el ingeniero, el 09/10/2026. Falta su fuente pública para citarla |
| `opencode-config` (IgorWarzocha, github.com/IgorWarzocha/Opencode-Workflows) | OpenCode | «Edit opencode.json, AGENTS.md, and config files»: el agente pregunta qué configurar, edita y después ejecuta `opencode run "test"` para validar | Verificada en skills.cat; sin fecha exacta («updated 9mo ago») ni cantidad de instalaciones |
| `customizing-opencode` (third774/dotfiles) | OpenCode | `opencode.json`, agentes, comandos, MCP, plugins y permisos | Solo fragmento del buscador; **a verificar** |
| `opencode-configure` (pantheon-org/tekhne) | OpenCode | Proveedores, modelos, permisos y variables de entorno | Solo fragmento del buscador; **a verificar** |
| `permissions` (Optimus-claude) | Claude Code | Crea o combina `settings.json` con reglas allow/deny y un hook de rutas | Solo fragmento del buscador; **a verificar** |

**Cruce con el IV.4:** ninguna figura en la nómina de competidores (que reúne herramientas sin modelo). **Lectura:** acredita que existe oferta, de terceros y de los propios fabricantes, para que un agente edite la configuración de su herramienta. Con F-7 es la evidencia independiente más fuerte de P1, pero mide oferta, no uso.

## Pendiente del relevamiento

- F-3a: comentarios de seis incidencias (límite de la API).
- F-3b: leer #20307 y #30151; revisar los resultados de q3 y q6 más allá de los primeros 30.
- F-4: consultar ACM DL e IEEE Xplore en forma directa; verificar SlsDetector y CAIP; leer el texto completo de Ciri.
- F-6: verificar las tres ofertas marcadas; buscar la fuente pública de `update-config`.
- F-7: ejecutar `agent create` (requiere modelo); decidir si la línea de base corre con `customize-opencode` disponible.

## F-7 · OpenCode 1.18.25

**Consulta:** 09/10/2026, por el ingeniero, sobre el código del tag `v1.18.25` de `anomalyco/opencode` (descarga directa, sin ejecución).

**Hallazgo.** El subcomando `opencode agent create` delega en un modelo de lenguaje la generación de la definición de un agente:

| Qué | Dónde (tag `v1.18.25`) |
|---|---|
| El subcomando pide al usuario una descripción en lenguaje natural de lo que debe hacer el agente | `packages/opencode/src/cli/cmd/agent.ts`, líneas 119 a 124 |
| Llama al servicio de agentes para generar la definición con un modelo («Generating agent configuration...»); si falla, informa «LLM failed to generate agent» | `agent.ts`, líneas 129 a 137 |
| El modelo produce el identificador, la descripción de uso (`whenToUse`) y el prompt de sistema; se generan con `generateObject` de la biblioteca `ai` sobre la plantilla `generate.txt` | `packages/opencode/src/agent/agent.ts`, líneas 368 a 435 |
| Los permisos y el modo **no** los decide el modelo: los elige el usuario; por omisión quedan todos permitidos (`initialValues: AVAILABLE_PERMISSIONS`) y solo se escriben como `deny` los no seleccionados | `cli/cmd/agent.ts`, líneas 139 a 197 |
| El resultado se escribe como archivo Markdown con encabezado en el directorio elegido | `cli/cmd/agent.ts`, líneas 207 a 222 |

**Alcance para P1.** El fabricante incorpora a la herramienta una vía para que un modelo redacte artefactos de configuración (definiciones de agentes). Acredita que la delegación es una práctica prevista por la propia herramienta. **No acredita** que el modelo resuelva ni decida la configuración efectiva o los permisos, ni cuánto se usa la vía.

**Hallazgo 2 · skill `customize-opencode`.** El tag incluye una skill incorporada que le enseña al agente a editar la configuración del usuario:

| Qué | Dónde (tag `v1.18.25`) |
|---|---|
| Registro de la skill con la descripción «Use ONLY when the user is editing or creating opencode's own configuration: opencode.json, opencode.jsonc, files under .opencode/, or files under ~/.config/opencode/. Also use when creating or fixing opencode agents, subagents, commands, skills, plugins, MCP servers, or permission rules» | `packages/core/src/plugin/skill.ts`, líneas 9 a 27 |
| Contenido: dónde viven los archivos, forma de `opencode.json`, agentes, comandos, plugins, MCP, permisos y «When proposing edits» (validar contra el esquema antes de escribir, conservar los campos que el usuario no pidió cambiar, recordar reiniciar) | `packages/core/src/plugin/skill/customize-opencode.md` (453 líneas) |
| Modelo de precedencia que la skill le transmite al agente: «Configs from each scope are deep-merged. Project overrides global» y, para permisos, «opencode evaluates the LAST matching rule» | `customize-opencode.md`, líneas 52 y 406 a 408 |

**Alcance.** Acredita que el fabricante prevé que el agente cree y corrija la configuración del usuario, incluidas las reglas de permiso: aporta a P1 con más fuerza que `agent create`. Para P2, el modelo de precedencia que la skill transmite es una simplificación: omite la configuración remota, `OPENCODE_CONFIG`, los directorios `.opencode` y la configuración administrada, y no trata el orden entre directorios `.opencode` anidados, objeto de las incidencias #21307 y #45266. Es una **suposición** a verificar en la medición que esa simplificación induzca errores.

**Verificación por ejecución (09/10/2026, ingeniero).** Contenedor descartable `node:22-bookworm-slim` (resumen `sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392`), sin montajes del anfitrión, sin modelo ni credenciales; `npm i -g opencode-ai@1.18.25` (integridad del registro `sha512-pS4RKJ9eKwU7Dp5G5pdj1rhMnpG5APixXzfTKNoFqv9aFVI36Rnza2jESvKifxyPZlsA65MQB03WCArY0EK6mg==`); `opencode --version` → `1.18.25`; `opencode debug skill` en un directorio vacío con `git init`.

- **Resultado:** el binario 1.18.25 carga `customize-opencode` como skill incorporada (`"location": "<built-in>"`). Es la única skill listada en un entorno sin configuración del usuario. El contenido coincide con el archivo del tag.
- **Diferencia menor:** la descripción del binario dice «agents, subagents, skills, plugins, MCP servers, or permission rules», sin «commands», que sí figura en `packages/core/src/plugin/skill.ts` del tag. El paquete de npm parece compilado desde un commit apenas distinto del tag; no afecta el hallazgo.
- **Consecuencia para la medición:** el agente de la línea de base dispone de esta skill salvo que se la desactive. Ver la decisión pendiente sobre la condición de control.
- **Límite:** es un contenedor descartable, no la imagen de ADR-054, que todavía no está construida.

**Pendiente.** Ejecutar `agent create` en el laboratorio (criterio del resultado n.º 11 del Anexo VI: leer el código no acredita el comportamiento). Requiere un modelo configurado; se hace junto con la preparación del contenedor de la medición.
