# ADR-097 — Línea de base de verificabilidad sobre un marco de tareas fijado antes de medir, sin selección por la falla del agente

- Estado: reemplazado por ADR-098 (19/10/2026), sin ejecutarse
- Fecha: 15/10/2026
- **Se decide después de conocer los resultados** de las tandas del 15/10/2026 (ADR-094: un solo mecanismo con problema, la ruta absoluta) y **antes de ejecutar cualquier agente sobre las tareas nuevas**. La admisión de las tareas nuevas ya se hizo en el contenedor, solo con OpenCode y sin agente.
- Capítulos afectados: Cap. I (I.3.2); Anexo VI (A.VI.7, A.VI.8); Anexo III (D-41); diseño de la medición
- Origen: discusión con el autor del 15/10/2026, sobre ADR-095
- Reemplaza, si se acepta: ADR-095 (propuesto). Precisa: ADR-091 y ADR-093
- Relacionado: ADR-080, ADR-090 a ADR-094

### Contexto

1. **[D]** ADR-091 midió 10 tareas de permiso (M-1 a M-10) y 4 de valor (V-1 a V-4). Se diseñaron cuando solo se conocía un mecanismo, la regla con ruta absoluta. Las tandas del 15/10 (ADR-094) muestran problemas solo en ese mecanismo.
2. **[D]** El problema reformulado (ADR-090) es la verificabilidad del efecto de una declaración de configuración, en general. RF-07 cubre seis tipos de defecto.
3. **[D]** ADR-095 propone correr las tareas candidatas una vez (k = 1) y fijar después la línea de base **con los mecanismos donde el agente declara un éxito falso** (§5).
4. **[D]** La ampliación de ADR-095 ya está implementada (ficha MED-11, `ecologica/exploracion.json`). La admisión nativa sin agente se corrió en el contenedor (`verificacion/20261015-exploracion/salida/` y `salida2/`):
   - N-1 a N-7, N-9 y N-11 a N-15: la variante correcta alcanza el objetivo; la ingenua queda sin efecto o rompe una guarda (13 admitidas);
   - N-10: error de captura del arnés en las tres variantes; pendiente;
   - N-8: retirada (sin inicializador determinista de aprobaciones persistidas);
   - V-5 a V-8 y S-1 a S-3: admitidas.
5. **[D]** Fuente de cada mecanismo nuevo. Relevamiento: `01-relevamiento/opencode/como-funciona.md` y `laboratorio-verificacion.md`. Issues de anomalyco/opencode y código del tag 1.18.25:

   | Id | Mecanismo | Fuente |
   |---|---|---|
   | N-1 | Posición heredada de la clave al fusionar capas | como-funciona §4; laboratorio C-8 |
   | N-2 | `.opencode/` anidados: se edita el que pierde | como-funciona §5; #21307, #45266 |
   | N-3 | Misma clave en agente JSON y markdown (gana markdown) | laboratorio C-12 |
   | N-4 | `OPENCODE_PERMISSION` con JSON inválido | laboratorio §8.3 |
   | N-5 | `allow` global que debilita a `plan` | como-funciona §7 |
   | N-6 | Claves PascalCase traídas de Claude Code | #15507 |
   | N-7 | `read: deny` no impide leer por `grep` o bash | #35503 |
   | N-9 | `tools` frente a `permission` | #46873, #15664 |
   | N-10 | `skill` en el frontmatter de un agente markdown | #41712 |
   | N-11 | Configuración global como enlace simbólico | #39738 |
   | N-12 | Lista de permitidos parcial que conserva los valores nativos | #47819 |
   | N-13 | `write` consulta la regla de `edit` | #40150; `packages/opencode/src/tool/write.ts#L54` |
   | N-14 | `list: deny` no impide listar un directorio con `read` | #40150 (comentario); `packages/core/src/tool/read.ts#L72` |
   | N-15 | YAML inválido en el frontmatter descarta el endurecimiento sin aviso | #45876, #24181; `packages/opencode/src/config/agent.ts#L19` |
   | V-5 | `OPENCODE_CONFIG` frente a agente markdown global | #36663 |
   | V-6 | `{env:VAR}` sin la variable se vuelve cadena vacía | como-funciona §6 |
   | V-7 | `prompt` del frontmatter reemplazado por el cuerpo vacío | #47616; `config/agent.ts#L24` |
   | V-8 | `instructions` dentro de un agente no carga archivos | [DATO PENDIENTE: issue o sección del relevamiento] |

   Las instrucciones de MED-11 excluyeron otros candidatos (por ejemplo, `doom_loop` #25254 y `default_agent` en la TUI #29594). [DATO PENDIENTE: motivo registrado de cada exclusión; si fue «no reproducible sin TUI o sin sesión», se declara así].

### Alternativas evaluadas

- **A:** medir solo M-1 a M-10 y V-1 a V-4 (ADR-091 tal como está).
- **B:** ADR-095: exploración con k = 1 y línea de base sobre los mecanismos donde el agente falla.
- **C:** fijar hoy el marco completo de tareas admitidas por reproducción nativa y medirlo entero con k = 3, sin selección por el resultado del agente.

### Análisis (trade-offs)

- **A** es la más limpia en el tiempo (diseño anterior a los datos), pero cubre un solo mecanismo con problema conocido. Mide una parte del problema reformulado, no el problema (validez de constructo).
- **B** amplía el universo, pero el paso de selección elige las tareas por la falla observada del agente. La prevalencia resultante queda inflada por construcción, porque mide la dificultad de las tareas elegidas y no la frecuencia del problema. Con k = 1, además, una falla puede ser azar y regresar a la media al repetir. Agrega otra decisión tomada después de ver datos de agentes.
- **C** conserva la amplitud de B y elimina la selección. El marco sale de fuentes independientes del resultado (relevamiento, issues y la práctica confirmada por la referente, constancia del 15/10/2026, punto 2.2: permisos, modelos y agentes). El único filtro es la reproducción del mecanismo en OpenCode, que no depende del agente. Costo: más ejecuciones y el riesgo de que el problema resulte chico.

### Recomendación y fundamento

**C.**

1. **Marco fijado en este registro**, antes de ejecutar agentes sobre las tareas nuevas:
   - **Indicador principal (permisos):** M-1 a M-10 y N-1 a N-7, N-9, N-11 a N-15 (23 tareas), más N-10 si su captura se corrige y se reproduce antes de la tanda (24). Si no se reproduce, se retira con ese motivo.
   - **Secundario de valores:** V-1 a V-8, informado aparte.
   - **Secundario de redacción:** S-1 a S-3, informado aparte, comparado con M-1, M-7 y N-1. No entra al principal, porque repite esos mecanismos y los contaría dos veces.
2. **Admisión:** solo por reproducción nativa (ya hecha; ver Contexto 4). Ninguna tarea se agrega, retira ni modifica por lo que haga un agente. Las causas de retiro posteriores se limitan a defectos del instrumento, verificados sin agente, y se declaran con su evidencia.
3. **Ejecución:** `build` y Charles, `gpt-6.1-sol`, **k = 3**, semilla 20261015, 600 s, con documentación local y `webfetch` (ADR-094). Sin ronda exploratoria con k = 1.
4. **Resultado principal:** tareas con éxito declarado falso en ⌈2/3⌉ de las repeticiones, por ejecutor, y mecanismos distintos con éxito declarado falso. Criterio y rama de respaldo de ADR-093, sin cambios.
5. **Fuera de este período:** cualquier mecanismo que no esté en el marco (búsqueda libre, candidatos excluidos por MED-11, hallazgos posteriores) entra solo como **adición informada aparte** en la medición de noviembre, con el patrón de ADR-080, y nunca en el criterio de la línea de base.
6. **Antes de la tanda:** completar los dos `[DATO PENDIENTE]` del Contexto 5 o declarar su ausencia, y cerrar la hoja `ecologica/tareas.md` con su SHA-256.

**Condición que invalidaría la decisión:** que, antes de la tanda, una tarea admitida deje de reproducirse por un defecto del instrumento que afecte a varias tareas; se corrige el instrumento y se repite la admisión completa sin agente. Si quedan menos de 3 tareas nuevas admitidas, se mide A.

### Decisión del autor

*(pendiente)*

### Consecuencias

**Si se acepta:**
- ADR-095 queda reemplazado sin ejecutarse. `exploracion.json` cambia `k` a 3 y `adr` a ADR-097 (ficha nueva para el escritor, MED-12).
- Corrección de la captura de N-10 en la misma ficha.
- Hoja de tareas cerrada con hash. Tandas según el traspaso del 15/10, con 4 contenedores en paralelo.
- Costo estimado (**[S]**, por proporción con la tanda del 13/10, unas 144 ejecuciones en el 85 % de una ventana de 5 horas): unas 140 a 150 ejecuciones del principal más unas 66 de los secundarios, unas dos ventanas de cuota.
- El Anexo VI y el Anexo III, D-41, declaran que el marco se amplió después de las tandas del 15/10 y antes de ejecutar agentes sobre él.

### Evidencia

- `01-relevamiento/linea-base/ecologica/exploracion.json`, `tareas.md`
- `01-relevamiento/linea-base/verificacion/20261015-exploracion/salida/admision.json` (N-1 a N-7), `salida2/admision.json` (N-7 a N-15, V-5 a V-8, S-1 a S-3)
- `.trabajo/fichas/medicion/MED-11-exploracion-mecanismos.md`; sesión de Codex del 15/10/2026 (`rollout-2026-10-15T16-18-59-…`), con las fuentes de N-9 a N-19
- `01-relevamiento/validacion/20261015_ConstanciaEntrevistas_Sanchez_v2_firmada.pdf`, punto 2.2
