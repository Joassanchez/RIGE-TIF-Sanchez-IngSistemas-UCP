# Propuesta para discutir · Consumo y tiempo del flujo de programación

- **Estado:** borrador para una sesión de discusión con el autor. No es un ADR. Si se decide algo, se registra como ADR propuesto (modifica o reemplaza ADR-065).
- **Fecha:** 30/09/2026
- **Origen:** incremento 0. El autor informa más de 4 h de trabajo y más del 25 % de su cuota semanal de Codex consumido (dato del autor, 30/09/2026).

## 1. Qué pasó (datos)

Fuente: base local de OpenCode (`~/.local/share/opencode/opencode.db`, tabla `session`, solo lectura), sesiones del 30/09/2026 sobre el repositorio, de 13:43 a 19:50.

| Sesión | Período | Tokens nuevos de entrada | Salida | Lectura de caché |
|---|---|---|---|---|
| Orquestador (`gentle-orchestrator`) | 13:47–19:37 | 1.126 k | 20 k | 7.230 k |
| Revisión del documento ODD (dos subagentes) | 13:49–14:46 | 332 k | 45 k | 958 k |
| Verificaciones T0-01 a T0-03 | 14:50–15:11 | 167 k | 15 k | 5.188 k |
| **«Implementar T0-04» (hizo T0-04 a T0-07)** | 15:13–17:54 | 530 k | 100 k | **34.745 k** |
| Verificador independiente de T0-05 | 16:57–17:32 | 116 k | 10 k | 2.135 k |
| Reverificación tras una interrupción | 18:51–18:54 | 79 k | 3 k | 538 k |
| T0-08 | 18:55–19:07 | 138 k | 14 k | 3.545 k |
| T0-09 (en curso) | 19:09–19:50 | 371 k | 34 k | 15.124 k |
| **Total** | | **≈ 3,0 M** | **≈ 0,25 M** | **≈ 69,5 M** |

La sesión «Implementar T0-04» tuvo 131 pasos, y su contexto llegó a **511 k tokens por paso**.

**Lectura:**
- El costo no está en lo que el modelo escribe (0,25 M) sino en lo que **vuelve a leer en cada paso**: 69,5 M de caché contra 3 M de entrada nueva.
- Una sola sesión de subagente concentra la mitad del total, porque encadenó cuatro tareas sin reiniciar el contexto.
- Cuánto descuenta la lectura de caché de la cuota de Codex **no está documentado para este plan**: suposición a verificar.

## 2. Causas probables

1. **Contextos largos que no se reinician.** Un subagente que hace varias tareas acumula código, salidas de pruebas y el documento ODD; cada paso reenvía todo.
2. **Maquinaria de gentle-ai que no usamos.** El prompt del orquestador tiene unos 90 k caracteres (ODD, SDD, RDD, relevos de consentimiento), más el `AGENTS.md` global (CodeGraph, Engram). Viaja en cada paso del orquestador.
3. **Verificación duplicada.** La «puerta de verificación delegada» de gentle-ai lanzó un verificador independiente (T0-05), y además revisa el sistema del TIF. Pagamos dos revisiones.
4. **El documento ODD se volvió pesado.** Pasó de unas 200 a más de 280 líneas (22 diferencias, mapa archivo → tarea, tablas de evidencia). Se lee y se reescribe en cada tarea.
5. **Pruebas.** El TDD estricto con «rojo por mutación temporal» en las guardas, y la suite completa corriendo a cada rato (200 pruebas en T0-09), inflan las salidas que quedan en el contexto.
6. **Un solo modelo para todo.** gpt-6.1-sol hace tanto el diseño como las tareas mecánicas (andamiaje, README, correr comandos).
7. **Especificación que el agente tuvo que reconstruir.** Dos vueltas de revisión del documento, una omisión de mi plan (casos de uso) y dos precisiones faltantes de los ADR (catálogo de `via`, tipado del `.sql`) generaron exploración y paradas.

## 3. Alternativas para discutir

| # | Alternativa | Qué ataca | Costo o riesgo |
|---|---|---|---|
| A | **Agentes propios de OpenCode** (sin gentle-ai en `src/`): un `rige-implementador` con prompt corto (AGENTS.md + tarea) y un `rige-explorador` barato. Sin ODD/SDD/RDD genéricos | Causas 2 y 3 | Perdemos Engram y el flujo ODD «de fábrica»; hay que escribir y mantener dos prompts. Cambia ADR-065 |
| B | **Una sesión nueva por tarea**, con un paquete de contexto mínimo (criterio, archivos, interfaces de lo ya hecho) en lugar de «leé el documento y los ADR» | Causas 1 y 4 | Más preparación de mi lado por tarea |
| C | **Documento ODD liviano**: objetivo, tareas con criterio y archivos; las diferencias y la evidencia van a los commits y a la bitácora | Causa 4 | Menos trazabilidad en un solo lugar |
| D | **Modelo por tipo de tarea**: Sol para diseño y lógica; Luna para andamiaje, README y correr comandos; razonamiento medio para el escritor | Causa 6 | Riesgo de calidad en tareas mal clasificadas |
| E | **Sin verificador independiente de gentle-ai**; la única revisión independiente es la del sistema del TIF, sobre el diff | Causa 3 | Una sola revisión; tiene que ser buena (en este incremento ya falló una vez) |
| F | **Especificación más cerrada desde el TIF**: firmas de puertos, casos de uso y respuestas, y el SQL, definidos antes de programar; el agente implementa y prueba | Causa 7 | Más trabajo de diseño previo; se acerca a «el ingeniero diseña, el agente tipea» |
| G | **Pruebas en dos niveles**: pruebas focales durante la tarea y la suite completa solo al cerrarla; «rojo por mutación» solo en las guardas nuevas | Causa 5 | Ninguno relevante si el CI corre la suite completa |
| H | **Codex CLI con gentle-ai** en lugar de OpenCode | Quizás la 2 | Mismo modelo y misma cuota; no ataca la causa 1. Cambia ADR-065 |
| J | **gentle-ai afinado** (ver §3.1): instalación en alcance de workspace, sin el componente `sdd`; se conservan el ODD, Engram y los permisos | Causas 2 y 3 | Hay que probarlo en un entorno aislado; la configuración global actual sigue afectando a otros proyectos |
| I | **Claude Code como escritor** (alternativa O1 de ADR-065) | Consumo de la cuota de Codex | Pierde la independencia entre escritor y revisor (mismo proveedor que el sistema del TIF); sesgo declarado del ingeniero, que es Claude |

### 3.1 Investigación de la alternativa J (30/09/2026)

**Fuentes:** documentación oficial (`docs/components.md`, `docs/usage.md` del repositorio de gentle-ai); código fuente de la versión instalada, 3.7.0 (`~/go/pkg/mod/github.com/gentleman-programming/gentle-ai/v3@v3.7.0`); configuración local; `gentle-ai install --dry-run`.

**Datos:**
- **Presets** (`docs/components.md`): `full-gentleman` (todo; es el instalado), `ecosystem-only` (sin permisos ni tema), `minimal` (Engram y skills de SDD) y `custom` (a elección).
- **El ODD no depende del SDD.** El código lo declara así: «deliberately independent of the SDD sections so that installing or removing optional SDD assets can never add or drop routing guidance» (`internal/components/agentguidance/inject.go:18`). En OpenCode se inyecta en el prompt del orquestador.
- **Lo que trae el componente `sdd`** (`internal/assets/opencode/sdd-orchestrator.md`): el flujo SDD, los relevos de consentimiento («Lossless Blocking Prompts»), la maquinaria de revisión de RDD y la **puerta de verificación delegada**, que es la que lanza el verificador independiente.
- **Peso medido del prompt del orquestador:** ≈ 22,5 k tokens. El ODD y sus disparadores de delegación son ≈ 4 k. El resto (≈ 18 k) es SDD, RDD y relevos que no usamos. Los bloques del `AGENTS.md` global suman ≈ 4,3 k (CodeGraph 0,75 k, persona 1,3 k, Engram 2,2 k) y viajan también en los subagentes. `src/AGENTS.md`, ≈ 3 k.
- **El documento ODD del incremento 0 pesa 99 KB (≈ 25 k tokens)**, contra unos 12 KB al aprobarse. Crecieron la evidencia por tarea (§11, unos 40 KB) y las diferencias (§13, 11 KB). Cada subagente que lo lee paga eso.
- **El verificador independiente encontró defectos reales.** En T0-05 detectó regresiones en la guarda, y de ahí sale el commit `fix: corregir regresiones de regex en la guarda T0-05` (documento ODD, §11.7). Sacarlo tiene un costo concreto.

**Lo que no se pudo verificar sin instalar:**
- `--dry-run` no lista los archivos que escribiría ni el prompt resultante.
- Sin el componente `sdd`, el código sugiere que el orquestador queda con un prompt que contiene solo el ODD (`agentguidance/inject.go:295-320`). Es una lectura del código; hay que confirmarlo con una instalación real en un entorno de prueba.

**Conclusión preliminar:**
- J recorta lo fijo por paso: ≈ 18 k tokens en el orquestador y ≈ 2 k en cada subagente, si además se saca el persona y CodeGraph.
- Pero lo fijo no fue lo que más gastó. El máximo observado fue un contexto de 511 k, y ahí dominan las salidas acumuladas y las lecturas repetidas. J solo no alcanza: hace falta además B (una sesión por tarea) y C (un documento ODD liviano, con la evidencia en los commits).

### 3.2 Segunda investigación (30/09/2026, tras las respuestas del autor)

**Respuestas del autor:**
1. Pesa todo: tiempo, cuota y atención. Nueve horas es inaceptable, y gentle-ai no funcionaba así antes.
2. Conservar lo que sea más útil.
3. El nivel de diseño previo lo propone el ingeniero.
4. Probar todo junto.
5. Medir con lo que más pesa.

**Dónde se fue el tiempo** (`opencode.db`, sesiones del 30/09):
- **Tiempo de modelo ≈ 590 min. Herramientas (pruebas, git, scripts) < 5 min.** El cuello de botella es la cantidad de pasos del modelo multiplicada por la latencia de cada paso, que crece con el tamaño del contexto.
- **459 pasos de modelo, con unas 700 llamadas a herramientas:**
  - **196 son de Engram** (`mem_update` 58, `mem_judge` 56, `mem_save` 21, resúmenes, espejos);
  - 214 son lecturas y ediciones de código;
  - 37 son lecturas del documento ODD, 26 de ADR y 18 de AGENTS.md;
  - 16 subagentes, incluido el verificador.

**Cuota de Codex:** el consumo se estima con la entrada, la entrada en caché y la salida. La caché cuesta cerca de un décimo de la entrada: 6,25 contra 62,5 créditos por millón en GPT-5.4 ([uibakery](https://uibakery.io/blog/openai-codex-pricing)). Los 69,5 M de caché equivalen a unos 7 M de entrada, más que los 3 M de entrada directa. **Achicar el contexto es la palanca principal, también para la cuota.**

**Evidencia externa:** el issue [gentle-shell #1494](https://github.com/Gentleman-Programming/gentle-shell/issues/1494) (abierto el 27/09/2026, sin respuesta de los mantenedores) mide gentle 3.7.0 con `openai-codex/gpt-6-sol` sobre una tarea trivial:
- **245 s contra 46 s** sin extensiones;
- **≈ 1,30 M tokens contra ≈ 113 k**;
- 5 subagentes verificadores y 10 operaciones de Engram;
- el mismo resultado en los dos casos.

Las notas de versión explican por qué «antes no era así»:
- **3.1.0:** evaluación de riesgo por cada commit;
- **3.2.1:** «Delegation is mandatory in ODD», con un tope que corta la sesión tras unas 20 llamadas;
- **3.5.0:** RDD activado por defecto.

El autor venía de 2.1.11 (ADR-065, contexto).

**Consecuencia para J:** los disparadores de delegación obligatoria y el espejo en Engram forman parte del propio bloque ODD, que J conserva. J recorta el prompt, pero deja intactos los dos mayores generadores de pasos. **J se descarta.**

## 4. Recomendación v2: perfil liviano de RIGE, sin gentle-ai en el ciclo de programación

Sigue siendo **OpenCode con `openai/gpt-6.1-sol`**. Lo que cambia es el arnés.

1. **Perfil aislado.** `OPENCODE_CONFIG_DIR` apunta a `~/.config/opencode-rige/`, con su propio `opencode.json`:
   - un solo agente primario `rige`, con un prompt de una página: cumplir `src/AGENTS.md`, ejecutar la ficha de la tarea, TDD, un commit y detenerse;
   - los permisos actuales, más la negación de `merge` y `tag`;
   - sin el `AGENTS.md` de gentle-ai, sin Engram ni CodeGraph, y sin plugins (`--pure`).

   gentle-ai queda intacto para el resto de tus proyectos. Según ADR-060, en el tag 1.18.25 `OPENCODE_CONFIG_DIR` reemplaza el directorio global; que haga lo mismo en 1.18.33 es una suposición a verificar al armarlo.
2. **Sin subagentes por defecto.** La tarea es chica (2 a 6 archivos) y la hace el agente primario. Se evitan los arranques en frío y las lecturas repetidas.
3. **Una sesión por tarea**, cerrada después del commit.
4. **Una ficha de tarea que prepara el ingeniero** (respuesta a la pregunta 3). Ocupa una página:
   - el criterio;
   - los archivos a crear o modificar;
   - las firmas e interfaces que tiene que respetar;
   - la lista de pruebas;
   - los comandos;
   - las condiciones de detención.

   El diseño lo decide el sistema del TIF con el autor; el agente implementa y prueba. El documento del incremento pasa a ser un índice de fichas con casillas.
5. **La evidencia va en el mensaje del commit** (rojo y verde, con su comando y resultado), no en un documento que crece.
6. **Razonamiento medio por defecto; alto solo en las fichas marcadas como complejas.** El modelo admite low, medium, high, xhigh y max (`~/.cache/opencode/models.json`).
7. **Pruebas focales mientras trabaja; la suite completa y `verificar`, una vez antes del commit.** Las salidas largas se recortan.
8. **Verificación independiente del ingeniero en cada tarea:** corre `bun run verificar` y `bun test` sobre la rama y revisa el diff contra la ficha. Así no gasta cuota de Codex. Reemplaza al verificador de gentle-ai, que encontró defectos reales en T0-05, así que la revisión incluye ejecutar las pruebas. El CI completa el control.

**Prueba: todo junto, en lo que queda del incremento 0** (T0-10 a T0-13). Da una comparación en el mismo incremento y sobre el mismo tipo de trabajo.

**Medición por tarea:**
- tiempo de reloj;
- tokens (la consulta de §1 sobre `opencode.db`);
- porcentaje de la cuota semanal de Codex antes y después, que anota el autor;
- correcciones que haga falta pedir en la revisión.

**Línea de base del incremento 0** (T0-01 a T0-09): ≈ 1 h de reloj y ≈ 8 M de tokens por tarea.

**Meta:** ≤ 15 min y ≤ 1/5 de los tokens por tarea, sin más correcciones que en la línea de base.

**Condición que invalida la recomendación:** que tras dos tareas la mejora sea menor que ×3, o que las correcciones aumenten. En ese caso se prueba **Codex CLI** con el mismo esquema (ficha, una sesión por tarea, sin gentle-ai), que es el arnés propio de OpenAI y lee `AGENTS.md` de forma nativa.

**Formalización:** un ADR propuesto que modifica ADR-065. Reemplaza «OpenCode con gentle-ai 3.7 en modo ODD» y conserva el TDD, un commit por tarea, que el autor une y sube, y la declaración de herramientas.

## 4.bis Recomendación preliminar anterior (reemplazada por §4)

*Revisada tras §3.1.* Combinar **J + B + C + G**, con **D** a prueba en el incremento 1, y **A** solo si J falla:
- **gentle-ai afinado (J):** alcance de workspace, sin `sdd`, sin persona ni CodeGraph; se conservan el ODD, Engram y los permisos;
- **una sesión por tarea (B)**, con un paquete de contexto que preparo yo;
- **documento del incremento corto (C):** la evidencia de cada tarea va en el mensaje del commit, no en el documento;
- **pruebas focales, y la suite completa al cerrar (G)**;
- **E queda en duda.** El verificador encontró defectos reales en T0-05. Alternativa: un solo verificador al cierre del incremento, no uno por tarea.

Si J no deja un orquestador funcional sin `sdd`, se pasa a A (agentes propios).

**Condición que la invalidaría:** que el consumo del incremento 1 con este esquema no baje de forma clara respecto del incremento 0, medido con la misma consulta a `opencode.db`, o que la calidad del diff empeore (más correcciones en la revisión).

## 5. Preguntas para la sesión

1. ¿Qué pesa más para vos: la cuota de Codex, el tiempo de reloj o tu tiempo de atención (aprobar commits, pasar mensajes)?
2. ¿Queremos conservar algo de gentle-ai (Engram, el persona, el TDD guiado) o lo dejamos solo fuera de `src/`?
3. ¿Cuánto diseño previo querés que haga el sistema del TIF (alternativa F)? Afecta cómo se declara el aporte personal.
4. ¿Probamos D (modelo por tipo de tarea) o preferimos una sola variable a la vez para poder medir?
5. ¿Cómo medimos? Propuesta: la misma consulta de tokens por sesión, más el porcentaje de cuota antes y después, registrado en la bitácora.

## 6. Qué no cambia

TDD estricto, un commit por tarea en la rama del incremento, el autor une y sube, las reglas de `src/AGENTS.md` y la declaración de herramientas (ADR-065, regla 9).
