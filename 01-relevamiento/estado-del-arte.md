# Anexo I, A.I.4 — Nómina del estado del arte y soluciones próximas

**Proyecto Integrador Final · RIGE · Ingeniería en Sistemas de Información · UCP**
**Sostiene:** apartado I.1.3(b) — oportunidad de negocio, y I.1.3(a) — evidencia de que la disfunción trasciende a OpenCode.
**Fecha de consulta de toda la nómina:** 17 de septiembre de 2026.

---

## Nota metodológica

Esta nómina releva, para cada solución próxima identificada, qué informa y qué no informa respecto de lo que RIGE se propone resolver: el valor efectivo de un elemento de configuración, su procedencia, y la explicación de una decisión de permisos. El criterio de inclusión es el mismo que fija I.1.3(b): soluciones que operan sobre el mismo objeto (la configuración de herramientas de programación agéntica) pero no explican por qué una acción resulta permitida, sujeta a confirmación o denegada, ni presentan valores implícitos, declaraciones sin efecto, referencias no resueltas o relaciones entre elementos del ecosistema.

---

## A.I.4.1 — Función nativa de OpenCode: `opencode debug config`

| Campo | Detalle |
|---|---|
| Tipo | Función nativa, incluida en OpenCode 1.18.25 |
| Qué informa | La configuración resultante de fusionar las fuentes declaradas por el usuario |
| Qué no informa | Valores implícitos ni reglas nativas (ver Anexo I, A.I.3.2); no informa procedencia por declaración individual; no evalúa permisos |
| Verificación | Ejecutada directamente en el Anexo I, A.I.3.1 y A.I.3.2, con salidas capturadas |
| Referencia | OpenCode. (2026). *OpenCode* (Versión 1.18.25) [Software]. GitHub. https://github.com/anomalyco/opencode/tree/v1.18.25 |

**Conclusión.** Es la función más cercana a lo que RIGE hace, pero se detiene en la configuración declarada; omite exactamente lo que un desarrollador necesita cuando la pregunta no es "qué escribí" sino "qué rige".

---

## A.I.4.2 — OpenCode Config Manager (OCCM)

| Campo | Detalle |
|---|---|
| Tipo | Aplicación de escritorio de terceros (PyQt5), edición visual de configuración |
| Qué informa | Permite editar visualmente providers, modelos, MCP, agentes y permisos sin escribir JSON a mano; valida el formato al guardar |
| Qué no informa | No resuelve ni muestra el estado efectivo tras la fusión de fuentes; no explica decisiones de permisos; no detecta declaraciones sin efecto ni referencias no resueltas |
| Referencia | icysaintdx. (2026). *OpenCode Config Manager (OCCM)* [Software]. GitHub. https://github.com/icysaintdx/OpenCode-Config-Manager |
| Fecha de consulta | 17 de septiembre de 2026 |

**Conclusión.** Resuelve el problema de editar sin errores de sintaxis, no el de saber qué configuración rige. Es un editor, no un explicador.

---

## A.I.4.3 — Extensiones de Visual Studio Code para Claude Code

### A.I.4.3.a — Claude Code Config Manager (agnislav)

| Campo | Detalle |
|---|---|
| Tipo | Extensión de VS Code |
| Qué informa, según su propia descripción | Muestra los cuatro alcances de configuración de Claude Code (Managed, Project Local, Project Shared, User) en un único árbol, **"clearly showing which values are overridden and where the effective value comes from"** — valor efectivo y cadena de sobrescritura, tal como cita I.1.3(b) |
| Cobertura declarada | Permisos (allow/deny/ask), servidores MCP, plugins, **hooks**, configuración general, variables de entorno, sandbox |
| Qué no informa | No evalúa una decisión de permiso concreta (acción + regla determinante); no detecta referencias no resueltas ni relaciones entre elementos |
| Referencia | Onufriichuk, A. (2026). *Claude Code Config Manager* (Versión 0.10.0) [Extensión de VS Code]. Visual Studio Marketplace. https://marketplace.visualstudio.com/items?itemName=agnislav.claude-code-config-manager |
| Fecha de consulta | 17 de septiembre de 2026 |

⚠ **Discrepancia con el texto actual de I.1.3(b), pendiente de tu revisión.** El párrafo vigente dice que estas extensiones no abarcan permisos ("...pero para Claude Code y sin abarcar permisos, valores implícitos ni referencias"). La descripción verificada de esta extensión contradice esa afirmación: sí cubre permisos (como listado de reglas por alcance, no como decisión evaluada). Antes de dar el dato por cerrado convendría que lo confirmes vos mismo instalando la extensión, porque la distinción real no es "no cubre permisos" sino "lista las reglas de permiso, no evalúa ni explica una decisión concreta" — que es un matiz distinto y más preciso.

### A.I.4.3.b — Segunda extensión: no se encontró un candidato equivalente

Se buscaron activamente extensiones de VS Code para Claude Code con la misma característica (resolución de valor efectivo + cadena de sobrescritura). Se identificaron dos candidatas adicionales que **no** cumplen el criterio con la misma claridad:

| Extensión | Qué hace | Por qué no es un match equivalente |
|---|---|---|
| Claude Code Explorer (safeekow) | Navega archivos de configuración, comandos y subagentes en un árbol | No reclama resolución de estado efectivo; es un navegador de archivos, no un resolutor |
| Claude Code Config (drewipson) | Lista reglas de permiso agrupadas por tipo/herramienta/patrón, por cada alcance por separado | Muestra las reglas de cada archivo; no fusiona ni indica cuál prevalece ni de dónde proviene el valor efectivo |

**Recomendación.** El apartado I.1.3(b) debería redactarse en singular ("una extensión de Visual Studio Code muestra...") o, si preferís mantener el plural, aclarar que la segunda referencia es a una categoría de herramientas de navegación de alcance sin resolución de efectividad, distinta de la primera. No inventé una segunda coincidencia que no encontré.

---

## A.I.4.4 — Escáneres de seguridad de servidores MCP y validadores de archivos de instrucciones

Se mantiene la caracterización general ya presente en I.1.3(b): estas herramientas auditan el contenido y la seguridad de los servidores MCP declarados, o la calidad de archivos de instrucciones, pero no persiguen el objetivo de RIGE (explicar el estado efectivo del ecosistema completo). No se identificó, en esta sesión, una herramienta puntual de este grupo que amerite cita individual; si querés una nómina específica con nombre y enlace, es un paso adicional de búsqueda que no se hizo aquí.

---

## A.I.4.5 — Evidencia de que la dificultad trasciende a OpenCode: issue de openai/codex

Corresponde a I.1.3(a), no a I.1.3(b), pero se incluye aquí porque es evidencia del mismo tipo (estado del arte / problema no resuelto en la industria).

| Campo | Detalle |
|---|---|
| Repositorio | `openai/codex` |
| Número | #26255 |
| Título | "Expose effective config provenance from the CLI" |
| Estado | Abierto |
| Fecha de apertura | 3 de junio de 2026 |
| Etiquetas | `enhancement`, `CLI`, `config` |
| Contenido relevante | Describe que Codex combina configuración base, perfiles, capas de proyecto, overrides de hilo/runtime, requisitos administrados, perfiles de permisos, hooks, MCP/apps/plugins y rutas específicas del servidor de la aplicación; que ante un comportamiento inesperado el usuario debe inferir la configuración activa por síntomas, registros o inspección manual; y propone un comando de solo lectura (`codex config inspect`) que exponga la misma información de procedencia que ya calcula internamente el servidor de la aplicación |
| Issues relacionados citados en el propio issue | #22759, #26207, #25645, #20538, #24439, #14133, #17560 — todos describen síntomas de la misma dificultad de procedencia de configuración en Codex |
| Referencia | OpenAI. (2026). *Expose effective config provenance from the CLI* (Issue n.º 26255) [Repositorio de GitHub]. https://github.com/openai/codex/issues/26255 |
| Fecha de consulta | 17 de septiembre de 2026 |

**Conclusión.** Confirma textualmente lo que I.1.3(a) afirma, sin necesidad de reformular nada del párrafo existente.

---

## Nota sobre alcance de este anexo

Esta nómina cubre específicamente el estado del arte (I.1.3-b) y la evidencia de trascendencia a otras herramientas (I.1.3-a). Quedan fuera de A.I.4, por corresponder a otras partes del informe:

- Las referencias bibliográficas verificadas en esta sesión (Kendall y Kendall, 2005, p. 2; Al-Shaer y Hamed, 2004; Sayagh et al., 2020; texto oficial de la meta 8.2 e indicador 8.2.1) van a la sección **Bibliografía**, no al Anexo I.
- El conteo de issues de OpenCode sobre comportamiento inesperado de permisos/configuración (32 casos sobre 46 candidatos revisados) corresponde al anexo que I.3.1 deja como `(Anexo [ ])` — todavía sin número asignado en tu estructura. Si querés, arma ese como A.I.6 o el número que sigas en tu numeración, con el detalle completo de los 46 casos y la clasificación aplicada.
