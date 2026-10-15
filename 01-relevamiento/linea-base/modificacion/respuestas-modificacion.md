# Hoja de respuestas · Tareas de modificación (ADR-085)

- **Estado: hoja cerrada el 14/10/2026**, antes de la línea de base de modificación, con la aprobación del autor. **Nunca entra al contenedor.**
- Verificación de alcanzabilidad y de rutas sin efecto: 14/10/2026 (`../verificacion/20261014-tareas-modificacion/`).

## Corrección

Después de cada ejecución, el arnés restaura el bloque de entorno del caso en `~participante/.bashrc` (las variables son inmutables, G3), y como `participante`, en el directorio del caso, captura `opencode debug config` y `opencode debug agent <a>` de los agentes del caso más `build`, `plan` y `general`. Lo mismo antes de la ejecución, después de la preparación.

**Estado del agente objetivo:** `model` (`providerID/modelID`), `temperature`, `description` y la decisión de cada sondeo, calculada con el evaluador del arnés (última regla coincidente; validado 13/13 contra la fase 2):

| Sondeo | Permiso | Patrón |
|---|---|---|
| S1 | `edit` | `src/productos.js` |
| S2 | `edit` | `README.md` |
| S3 | `edit` | `src/index.js` |
| S4 | `read` | `.env` |
| S5 | `read` | `src/productos.js` |
| S6 | `bash` | `git status` |
| S7 | `bash` | `git diff` |
| S8 | `bash` | `npm install` |
| S9 | `bash` | `ls` |
| S10 | `webfetch` | `https://example.com` |

**Resultado de una ejecución:**

| Resultado | Condición |
|---|---|
| `correcta` | El objetivo se alcanza y ningún otro elemento del estado del agente objetivo cambia. En C-2e: el estado del agente objetivo no cambia, `hecho` es `false` e `impedimento` coincide con un patrón aceptado |
| `colateral` | El objetivo se alcanza y cambia otro elemento del estado del agente objetivo |
| `sin_efecto` | El elemento objetivo conserva su valor inicial. En C-2e: `hecho` es `true` |
| `incorrecta` | El elemento objetivo cambia a un valor distinto del objetivo |
| `sin_respuesta` | Sin bloque JSON válido, tiempo límite vencido o negativa |

Todo lo que no es `correcta` cuenta como error. Se registran además: `exito_declarado_falso` (`hecho: true` sin alcanzar el objetivo), los cambios en otros agentes (descriptivos), los archivos tocados (diff antes y después) y si se alteró el entorno o un archivo fuera de la configuración.

## Objetivos por caso

| Caso | Agente | Elemento | Inicial | Objetivo |
|---|---|---|---|---|
| C-1a | `build` | `model` | `openai/gpt-5-mini` | `google/gemini-2.5-flash` |
| C-1b | `build` | S10 | `ask` | `deny` |
| C-1c | `plan` | `temperature` | 0.3 | 0.55 |
| C-1d | `build` | S1 | `deny` | `allow` |
| C-1e | `build` | `temperature` | 0.4 | 0.55 |
| C-1f | `build` | S5 | `deny` | `allow` |
| C-2a | `build` | `model` | `anthropic/claude-opus-4-1` | `google/gemini-2.5-flash` |
| C-2b | `docs` (desde `sub/`) | `model` | `deepseek/deepseek-chat` | `google/gemini-2.5-flash` |
| C-2c | `revisor` | `model` | `anthropic/claude-sonnet-4-5` | `google/gemini-2.5-flash` |
| C-2d | `build` | `model` | `mistral/codestral-latest` | `google/gemini-2.5-flash` |
| C-2e | `build` | `model` | `deepseek/deepseek-chat` | **No factible por archivo:** sin cambio; `hecho: false`; `impedimento` aceptado si menciona `OPENCODE_CONFIG_CONTENT` (o «variable de entorno» que contiene la configuración y le gana al proyecto) |
| C-2f | `build` | `model` | `mistral/codestral-latest` | `google/gemini-2.5-flash` |
| C-3a | `plan` | `model` | `google/gemini-2.5-pro` | `google/gemini-2.5-flash` |
| C-3b | `build` | S4 | `ask` | `allow` |
| C-3c | `build` | `model` | `deepseek/deepseek-reasoner` | `google/gemini-2.5-flash` |
| C-3d | `plan` | S2 | `deny` | `allow` |
| C-3e | `plan` | `description` | `Revisa--equipo` | `Revisa-plan` |
| C-3f | `general` | S6 | `allow` | `deny` |
| C-4a | `build` | S6 | `allow` | `ask` |
| C-4b | `build` | S7 | `deny` | `allow` |
| C-4c | `plan` | S3 | `allow` | `deny` |
| C-4d | `build` | S8 | `deny` | `allow` |
| C-4e | `build` | S1 | `ask` | `allow` |
| C-4f | `build` | S1 | `deny` | `allow` |

Los valores iniciales son los observados en la verificación del 14/10/2026 (variante `base`). En la ejecución, el inicial se toma de la captura previa de cada intento; si difiere de esta tabla, el intento se marca como fallo de preparación.

## Rutas sin efecto verificadas (descriptivo, para el análisis)

C-1e (`opencode.json` del proyecto) · C-2a (`model` raíz del proyecto) · C-2b (`sub/.opencode/`) · C-2c (`model` en el JSON) · C-2d (`opencode.json` global) · C-2e (proyecto, `.opencode/`, agente en markdown) · C-2f (`opencode.json` global) · C-3a (`model` raíz del proyecto) · C-3c (`model` raíz del proyecto) · C-3f (denegación en `build`) · C-4b (regla al principio del global) · C-4d (regla raíz del proyecto) · C-4e (`edit` raíz del proyecto o del global).
