# Medición de la línea base con agentes de programación

**Diseño para construir y ejecutar** · RIGE · OpenCode 1.18.25 · versión 1.1 · 25/09/2026

Cambios de la 1.1: instrumento de 16 casos (4 por condición) con el caso como unidad de análisis; modelos registrados; costo; uso de RIGE por línea de comandos, con dependencia de ADR-041; corrección del bloque de entorno de `caso.sh`.

Este documento se entrega a quien construye y ejecuta la medición. Es autocontenido: no requiere haber leído el informe del proyecto. Decisión que lo respalda: `00-gestion/decisiones/ADR-040-linea-base-agentes-ejecutores-procedimiento-delegado.md` (propuesto).

> Convenciones. **[VERIFICAR]**: supuesto técnico que se comprueba en la fase 0 antes de construir sobre él. **[DECISIÓN PENDIENTE]**: lo decide el autor antes de la fase indicada. Todo lo demás está decidido.

---

## 1. Qué se mide y por qué

Un desarrollador que usa OpenCode necesita saber **qué configuración rige efectivamente sobre un agente y de dónde proviene** (qué modelo usa, si puede ejecutar un comando). La configuración se reparte entre varios archivos, variables de entorno y reglas nativas, y los comandos de la herramienta muestran el resultado, pero no su procedencia.

Una práctica real, documentada en el relevamiento, consiste en **delegar esa consulta en un agente**. Esta medición establece qué tan bien la resuelve un agente hoy (**línea de base**) y, en noviembre, qué tan bien la resuelve con RIGE disponible (**medición final**). La comparación se hace con el mismo agente, el mismo modelo y los mismos casos.

Preguntas:
- **P1.** ¿Con qué tasa de error, qué consumo de tokens y qué esfuerzo resuelve un agente la consulta «valor + fuente»?
- **P2.** ¿La dificultad crece con el tipo de consulta (condición C-1 frente a C-2, C-3 y C-4)?
- **P3.** ¿Cambia el resultado con la capacidad del modelo?

## 2. Reglas no negociables

1. **La hoja de respuestas nunca entra a la VM.** `respuestas.md` y su versión `respuestas.json` viven fuera. La corrección se hace fuera de la VM.
2. **El escenario y el ejecutor están separados.** El agente que responde no puede estar gobernado por la configuración del caso (ver 3.1).
3. **El ejecutor no modifica el escenario.** Se controla con un hash antes y después de cada ejecución; la ejecución que altera el escenario se marca y se excluye del análisis principal.
4. **Todo se congela después del piloto:** modelos, k, tiempo límite, instrucción, hoja de referencia y hoja de respuestas. La medición final usa exactamente lo mismo, más RIGE.
5. **Toda ejecución deja rastro completo:** transcripción, eventos, tokens, herramientas usadas y código de salida. Ningún resultado se reporta sin su archivo de evidencia.
6. **Los veredictos no dependen de lo que el agente dice haber hecho**, sino de su respuesta final y de la traza (mismo principio que el laboratorio).

## 3. Arquitectura

```
VM Ubuntu (x86_64) ── OpenCode 1.18.25 fijado (instalar.sh)
│
├── root
│   ├── /opt/linea-base/          casos, caso.sh, verificar.sh, medir.sh   (700, solo root)
│   └── /opt/linea-base/resultados/  salidas crudas de cada ejecución
│
├── participante   ← ESCENARIO. Sin credenciales, sin ejecutor.
│   ├── ~/.config/opencode/       configuración global del caso (la escribe caso.sh)
│   ├── ~/proyecto/               proyecto del caso, con git
│   └── ~/.bashrc                 variables de entorno del caso
│
└── evaluador      ← EJECUTOR. Otro usuario, otra configuración.
    ├── ~/.config/opencode/opencode.json   configuración propia (3.2)
    ├── ~/.local/share/opencode/           credenciales del proveedor
    └── ~/tarea/                  directorio neutro de trabajo: hoja-referencia.md, docs/
```

### 3.1 Por qué dos usuarios

Si el ejecutor corriera dentro de `~participante/proyecto`, la configuración del caso lo gobernaría a él: en C-1a intentaría usar `openai/gpt-5-mini` sin credenciales, y en C-4b, con `bash *: deny`, no podría ejecutar ningún comando. Además, `caso.sh` borra `~/.local/share/opencode` del participante, donde estarían las credenciales. Por eso:

- el ejecutor arranca en `~evaluador/tarea`, fuera de todo proyecto con `opencode.json`;
- inspecciona el escenario con el comando auxiliar **`como-dev`**, que ejecuta como `participante`, con su shell de inicio de sesión (carga `~/.bashrc` y, por lo tanto, las variables de C-3a) y en el directorio de trabajo del caso:

```bash
# /usr/local/bin/como-dev   (root:root 755)
#!/usr/bin/env bash
exec sudo -u participante -i bash -c "cd \"\$HOME/proyecto${COMO_DEV_DIR:+/$COMO_DEV_DIR}\" && $*"
```

  con la regla `/etc/sudoers.d/evaluador`: `evaluador ALL=(participante) NOPASSWD: ALL`. `medir.sh` exporta `COMO_DEV_DIR` desde el `DIR` de `caso.env`;
- para que la herramienta `read` pueda leer archivos del escenario: `usermod -aG participante evaluador` y `chmod 750 /home/participante`. **[VERIFICAR]** que los archivos del caso queden legibles por el grupo después de `caso.sh` (se copian con `cp -a` y luego `chown`).

Equivalencia con el diseño con personas: la persona tenía una terminal abierta como `participante` en el directorio del caso. `como-dev` le da al agente el mismo acceso, sin agregar información.

### 3.2 Configuración del ejecutor

`~evaluador/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "read": "allow",
    "bash": "allow",
    "external_directory": "allow",
    "edit": "deny",
    "webfetch": "deny",
    "websearch": "deny"
  }
}
```

- `allow` explícito en `read`, `bash` y `external_directory`, porque en `opencode run` un `ask` se rechaza solo (laboratorio, E-00).
- `edit: deny` impide modificar archivos con herramientas nativas. **[VERIFICAR]** que cubra también `write` y `apply_patch`, con `opencode debug agent build` ejecutado como `evaluador`. Las modificaciones por `bash` se detectan con el hash (regla 3).
- `webfetch` y `websearch` en `deny` equivalen a «sin internet». La VM mantiene salida de red **solo** porque el ejecutor necesita la API del proveedor; el uso de `curl`, `wget` u otro acceso web por `bash` se detecta en la traza y marca la ejecución.
- El modelo no se fija en el archivo, sino por ejecución (`--model`, **[VERIFICAR]**).
- **Si se obtiene el agente de la referente:** se instala como agente de `evaluador` (`~/.config/opencode/agent/<nombre>.md`) y se ejecuta con `--agent <nombre>`. Se conservan su instrucción y su modelo; los permisos de esta sección prevalecen sobre los suyos y se declara. **[DECISIÓN PENDIENTE]** antes del piloto: nombre del agente y confirmación de su fecha (debe ser anterior a la entrevista).

### 3.3 Modelos

Tres modelos de una misma familia, registrados el 25/09/2026 en ADR-040 («Registro de modelos y del costo»):

| Rol | Modelo | `--model` | Función |
|---|---|---|---|
| M1 · principal | Opus 5.5 | `anthropic/claude-opus-5-5` | Modelo del agente de la referente y el más capaz a la fecha. Sobre él se enuncia el criterio de éxito |
| M2 · intermedio | Sonnet 5 | `anthropic/claude-sonnet-5` | Punto intermedio |
| M3 · económico | Haiku 4.5 | `anthropic/claude-haiku-4-5-20251001` | El de menor costo |

**[VERIFICAR]** en la fase 0 que la 1.18.25 reconoce los tres identificadores. No se usan los modelos gratuitos de OpenCode: el laboratorio los encontró no deterministas y observó que devolvían contenido ajeno a la sesión (hallazgo C-9). La temperatura se fija si el proveedor lo permite **[VERIFICAR]**.

### 3.4 Costo

- **Clave de API exclusiva** de la medición, cargada solo en `evaluador`.
- `costo_usd` de cada ejecución = Σ (tokens de cada tipo × precio oficial por millón de tokens / 10⁶), con la tabla `precios.json` (modelo, precio de entrada, de salida, de escritura y de lectura de caché, fuente y fecha de consulta) guardada en la tanda. **No** se usa el costo que calcula OpenCode (**[VERIFICAR]** en la fase 0 si lo informa y si coincide).
- Al cerrar cada fase (piloto, línea base, final) se concilia el total calculado con el consumo de la consola del proveedor para esa clave. La diferencia se registra en `resultados/costos.md`.

## 4. Instrumento

### 4.1 Casos

**Dieciséis casos, cuatro por condición.** Los escenarios están en `vm/casos/`; las preguntas, las respuestas y los criterios de corrección, en `respuestas.md`.

| Condición | Qué se consulta | Valor + fuente | Decisión + regla |
|---|---|---|---|
| C-1 · Control | Valor o decisión declarados en una sola fuente | C-1a, C-1c | C-1b, C-1d |
| C-2 · Fusión | Valor que resulta de combinar entradas | C-2a, C-2b, C-2c, C-2d | — |
| C-3 · Implícito | Valor o decisión que no está escrito en ningún archivo de configuración | C-3a, C-3c | C-3b, C-3d |
| C-4 · Permisos combinados | Decisión con reglas en entradas distintas | — | C-4a, C-4b, C-4c, C-4d |

Ocho de valor y ocho de permiso. C-2 es solo de valores y C-4 solo de permisos, por definición de la condición.

**Por qué 16 y no 8.** El diseño con personas tenía dos casos por condición porque «tres alarga la sesión» (D-07 de la v0.3). Con agentes, ese límite no existe, y dos casos por condición dejan dos problemas:

- la tasa de error de la condición solo puede valer 0 %, 50 % o 100 %;
- un único caso peculiar (C-4b es una rareza no documentada) determina el resultado de toda la condición.

**Repetir un caso k veces no reemplaza tener más casos:** mide la variabilidad del modelo, no si el resultado se generaliza a otras configuraciones.

**Por qué 4 y no más.** Lo que aporta información es la variedad de mecanismos, no la cantidad de variantes de uno mismo. Cada caso nuevo tiene un mecanismo distinto, observado en el laboratorio o en el código, y respaldado por incidencias cuando las hay. No se generan variantes automáticas.

**Criterios de construcción** (revisión de los criterios 8.2 del antecedente v0.3):

| Criterio | Estado con agentes |
|---|---|
| 8.2-1 Derivación desde el relevamiento | Se mantiene |
| 8.2-2 Verificación en ejecución | Se mantiene (fase 2) |
| 8.2-3 Ningún comando nativo da valor **y** fuente | Se mantiene: es la salvaguarda del instrumento |
| 8.2-4 Al menos un distractor | Se mantiene |
| 8.2-5 Comandos de terminal simples | Se mantiene (los compuestos están fuera del alcance de RIGE, RF-08) |
| 8.2-6 Equivalencia estructural entre a y b | **Se elimina.** Controlaba el aprendizaje entre bloques de una sesión humana |
| 8.2-7 Clasificación documental | Se mantiene |
| 8.2-8 Respaldo externo cuando exista | Se mantiene |
| 8.2-9 Nada se repite entre casos | **Se elimina.** El agente no recuerda entre ejecuciones |
| **Nuevo · 8.2-10 Dentro del alcance de RIGE** | Cada caso lo atiende un requisito Must del MVP y es consultable por la línea de comandos en la versión congelada. Un caso fuera del alcance castigaría a RIGE en noviembre por algo que no promete. Cumplimiento: tabla «Tipo de consulta» de `respuestas.md`; los de permisos dependen de ADR-041 |

Casos nuevos y su mecanismo:

| Caso | Mecanismo | Respaldo |
|---|---|---|
| C-1c | Temperatura declarada solo en el global | Control |
| C-1d | `edit: deny` declarado solo en el proyecto | Control |
| C-2c | Agente en markdown (`.opencode/agent/`) frente al mismo agente en JSON | Laboratorio E-14; incidencia #36663 |
| C-2d | Fusión de los archivos globales `config.json` → `opencode.json` → `opencode.jsonc` | Código del tag (AD-08); incidencia #36416 |
| C-3c | Sustitución `{file:...}` | Documentada; F1 del informe |
| C-3d | Regla nativa de `plan` sobre `edit`, sin declaración | Código del tag; par de C-4c |
| C-4c | Un `edit: allow` global anula la protección nativa del modo plan | Laboratorio E-03; incidencia #39715; RF-09 |
| C-4d | La regla del agente en el global prevalece sobre la regla raíz del proyecto | Laboratorio E-18c (mecanismo análogo) |

El caso `practica` se usa solo en el piloto (sección 9).

### 4.2 Instrucción de la tarea

Mensaje que recibe el ejecutor en cada ejecución (idéntico en todas, salvo `{DIRECTORIO}` y `{PREGUNTA}`):

```
Estás ayudando a un desarrollador a entender la configuración de OpenCode 1.18.25 en esta máquina.

Su proyecto está en /home/participante/proyecto y su terminal está abierta en {DIRECTORIO}.
Para ejecutar comandos en su entorno, con sus variables y su configuración, usá:
    como-dev '<comando>'
En tu directorio actual tenés la hoja de referencia (hoja-referencia.md) y la documentación
oficial de OpenCode 1.18.25 sin conexión (docs/index.html).

No modifiques ningún archivo.

Pregunta: {PREGUNTA}

Cuando tengas la respuesta, terminá tu mensaje con un único bloque JSON con esta forma exacta:
{"respuesta": "<valor o decisión>", "fuente": "<archivo, variable o regla de la que proviene>"}
```

`{DIRECTORIO}` es `/home/participante/proyecto` o, en C-2b, `/home/participante/proyecto/sub`.

### 4.3 Hoja de referencia del ejecutor

`~evaluador/tarea/hoja-referencia.md` es la hoja de `vm/hoja-referencia.md` con tres cambios, y nada más:
- se quita la sección «Cómo responder», que describe el protocolo de una persona («decí listo»), porque el formato está en la instrucción;
- se quita la sección «No disponible durante la sesión»;
- en la medición final se agrega **una fila** a «Comandos disponibles» con el comando de RIGE y lo que hace, según su `--help`. Es el único cambio entre las dos condiciones. No se agrega a la instrucción: el agente decide si usa RIGE, igual que decide si usa `opencode debug`. Si el agente no la usa, eso también es un resultado (campo `uso_rige`).

**Dependencia:** para que RIGE pueda intervenir en los ocho casos de permisos, su línea de comandos tiene que consultar decisiones de permiso. ADR-022 lo excluyó y ADR-041 (propuesto) lo reabre. Sin ADR-041, la medición final solo puede mostrar el efecto de RIGE en los casos de valor, y se declara.

La documentación (`vm/docs/`, 36 páginas, commit `cb7d8b2f5e44`) se copia a `~evaluador/tarea/docs/`.

## 5. Artefactos a construir

| Archivo | Dónde corre | Qué hace |
|---|---|---|
| `vm/instalar.sh` (existente) | VM, root | Se amplía: crea `evaluador`, `como-dev`, la regla de `sudoers`, el grupo y los permisos (3.1), la configuración del ejecutor (3.2) y `~evaluador/tarea/` (4.3) |
| `vm/verificar.sh` (existente) | VM, root | Se amplía: además de `debug config` y `debug agent`, **ejecuta** las decisiones de permiso de C-1b, C-3b, C-4a y C-4b con un proveedor simulado que emite una llamada fija a la herramienta, y registra si la herramienta se ofreció, si se ejecutó y el texto del error. Un `ask` se distingue de un `deny` por el texto del error o por el evento `permission.v2.asked` (laboratorio, E-00) |
| `vm/medir.sh` (nuevo) | VM, root | Ejecuta una tanda (5.1) |
| `respuestas.json` (nuevo) | Fuera de la VM | Versión legible por máquina de `respuestas.md`: por caso, `respuesta` esperada, sinónimos, patrones de fuente aceptados y rechazados |
| `corregir.py` (nuevo) | Fuera de la VM | Corrige cada ejecución contra `respuestas.json` (5.2) |
| `analizar.py` (nuevo) | Fuera de la VM | Produce las tablas y los gráficos (sección 7) |

### 5.1 `medir.sh`

```
Uso: sudo /opt/linea-base/medir.sh --tanda <nombre> --condicion <LB|FIN> --modelo <id> --k <n>
                                   --limite <segundos> [--agente <nombre>] [--casos C-1a,C-2b,...]
```

Para cada caso y cada repetición `r` de 1 a k:

1. `caso.sh <caso>`.
2. `hash_antes` = SHA-256 del contenido de `~participante/proyecto` (excluido `.git/`) y de `~participante/.config/opencode`, más el bloque de entorno de `~/.bashrc`.
3. Como `evaluador`, en `~evaluador/tarea`, con `COMO_DEV_DIR` exportado:
   `timeout <limite> opencode run --model <id> [--agent <nombre>] --format json "<instrucción 4.2>"` **[VERIFICAR flags con `opencode run --help`]**, y guardar stdout, stderr y el código de salida.
4. `hash_despues`; `escenario_alterado = hash_antes ≠ hash_despues`.
5. Extraer de la sesión: tokens de entrada, salida, caché y costo; herramientas invocadas con sus argumentos; duración. **[VERIFICAR]** la fuente: los eventos de `--format json`, `opencode export <sesión>` o la API del servidor.
6. Escribir una línea en `resultados/<tanda>/registro.jsonl` (sección 6), **sin corregir**.

Los casos se ejecutan en orden aleatorio, con una semilla registrada en la tanda. Si el proveedor devuelve un error transitorio (límite de tasa o 5xx), la repetición se reintenta hasta dos veces y el reintento se registra. Cualquier otro error cuenta como `sin_respuesta`.

### 5.2 `corregir.py`

1. Extrae el último bloque JSON del mensaje final. Si no existe o no se puede interpretar: `sin_respuesta` con el motivo `formato`.
2. Compara `respuesta` según `respuestas.md` (normalización y sinónimos).
3. Compara `fuente` contra los patrones aceptados y rechazados. Si no coincide con ninguno: `revision_manual`.
4. Clasifica: `correcta`, `parcial`, `incorrecta` o `sin_respuesta`. En C-3b, marca además `sigue_documentacion` si respondió `deny`.
5. Genera `revision_manual.csv` con la respuesta textual, para que el autor adjudique cada caso. La adjudicación se guarda en un archivo aparte, con su motivo, y el corrector la aplica en una segunda pasada. **La corrección no usa un modelo de lenguaje como juez.**

## 6. Registro de datos

`registro.jsonl`, una línea por ejecución:

| Campo | Contenido |
|---|---|
| `tanda`, `condicion` | Nombre de la tanda; `LB` o `FIN` |
| `modelo`, `agente` | Identificador exacto; `build` o el agente de la referente |
| `caso`, `condicion_caso`, `variante`, `repeticion` | C-2b, C-2, b, 1..k |
| `inicio`, `duracion_s`, `censurado` | Fecha y hora ISO; segundos; 1 si venció el tiempo límite |
| `codigo_salida`, `reintentos` | |
| `tokens_entrada`, `tokens_salida`, `tokens_cache`, `costo_usd` | |
| `herramientas` | Lista de invocaciones: herramienta, argumentos, resultado |
| `comandos_introspeccion` | Cuáles usó: `debug config`, `debug agent`, `debug skill`, `--help`, otros |
| `archivos_leidos` | Archivos distintos del escenario leídos (IB-4) |
| `uso_documentacion`, `uso_hoja` | 1/0 |
| `uso_rige` | Solo en `FIN`: 1 si invocó el comando de RIGE |
| `acceso_web` | 1 si intentó salir a la web por cualquier vía |
| `escenario_alterado` | 1/0 |
| `respuesta_textual` | Mensaje final completo |
| `archivo_evidencia` | Ruta de la transcripción cruda |

Campos que agrega `corregir.py`: `respuesta`, `fuente`, `resultado`, `motivo`, `sigue_documentacion`, `adjudicado_manual`.

Estructura de salida:

```
resultados/<tanda>/
  tanda.json          parámetros, semilla, versión de OpenCode, hash del binario, fecha, hash de la instrucción y de la hoja
  registro.jsonl
  crudo/<caso>-<r>.{stdout,stderr,eventos}.txt
```

## 7. Análisis

**Unidad de análisis: el caso.** Para cada modelo y cada caso, la tasa de error del caso es la proporción de sus k ejecuciones que no son correctas. La tasa de una condición es el promedio de las tasas de sus cuatro casos. Los intervalos de confianza no se calculan sobre las ejecuciones como si fueran independientes. Se informa siempre la tabla caso por caso, para que un caso peculiar sea visible y no quede escondido en el promedio.

Por modelo y por condición, y para C-2 a C-4 en conjunto:

| Indicador | Medida |
|---|---|
| IB-1 · Error | Tasa de error por caso (k ejecuciones) y su promedio por condición; además, cantidad de casos de la condición con al menos la mitad de sus ejecuciones erróneas |
| IB-3 · Parciales | Proporción de respuestas con valor correcto y fuente incorrecta |
| Tokens | Mediana y rango intercuartílico de los tokens totales por consulta, y costo por consulta |
| IB-4 · Esfuerzo | Mediana de archivos leídos y de invocaciones de herramientas |
| IB-2 · Tiempo | Mediana y rango intercuartílico de la duración. Peso menor: depende de la latencia del proveedor |
| Censura | Proporción de ejecuciones que vencen el tiempo límite |

Comparaciones descriptivas: C-1 frente a C-2 a C-4; casos de valor frente a casos de permiso; los pares C-3d/C-4c (misma acción, con y sin la declaración que anula la protección nativa) y C-4a/C-4b; casos documentados frente a no documentados; C-4a frente a C-4b; en C-3b, la proporción que sigue la documentación; y el uso de comandos de introspección frente a acierto. Gráficos: barras de error por condición y modelo, con intervalos; barras apiladas por tipo de resultado; cajas de tokens por condición.

Regla de lectura (fijada en ADR-040): donde el error de la línea de base es apreciable prevalece IB-1; donde se aproxima a cero prevalece el consumo de tokens. **El criterio de éxito no se define en este documento:** lo fija el informe (I.3.4) con los ADR aceptados. ADR-040 propone su forma (comparación pareada por caso sobre M1, con regla de techo). El análisis produce, para cada caso de C-2 a C-4 y cada modelo, la tasa de error y la mediana de tokens con y sin RIGE.

## 8. Procedimiento por fases

| Fase | Qué se hace | Criterio de cierre |
|---|---|---|
| **0 · Supuestos técnicos** | Resolver cada **[VERIFICAR]**: flags de `opencode run`, extracción de tokens y herramientas, alcance de `edit: deny`, modelos disponibles con `OPENCODE_DISABLE_MODELS_FETCH=1` (si el modelo fijado no figura en el catálogo empaquetado, quitar esa variable **solo** para `evaluador`), permisos de grupo | Cada punto con su comando y su salida, en `resultados/fase0.md` |
| **1 · VM** | `instalar.sh` ampliado; credenciales del proveedor para `evaluador` | `verificar.sh` sin conexión a la web e instalación íntegra |
| **2 · Verificación de casos** | `verificar.sh` ampliado; comparar cada salida con `respuestas.md`; resolver los **[VERIFICAR]** de C-2c, C-2d, C-3c, C-3d y C-4d; clasificar la documentación de los casos nuevos contra `vm/docs/` y el manual embebido; confirmar el criterio 8.2-3 de cada caso nuevo | Los dieciséis casos coinciden. `respuestas.md` pasa a **cerrada**, con fecha. Discrepancia → se corrige el caso o la respuesta, se registra y se reverifica |
| **3 · Registro previo** | El autor fija M1 a M3, el agente y la redacción final de la instrucción | Registrado en ADR-040 o en un anexo, **con fecha anterior al piloto** |
| **4 · Piloto** | `practica`, C-1a y C-4a; 3 modelos; 10 repeticiones; tiempo límite inicial de 600 s | Ver sección 9 |
| **5 · Congelamiento** | Se fijan k, el tiempo límite, la instrucción y la hoja. Hash de cada artefacto en `congelamiento.json` | Nada cambia después de este punto |
| **6 · Línea base** | `medir.sh --condicion LB` para cada modelo, con los dieciséis casos | Registro completo; sin ejecuciones perdidas sin explicación |
| **7 · Corrección y análisis** | `corregir.py`, adjudicación manual, `analizar.py` | Tablas de la sección 7; I.3.2 y II.3 del informe se completan desde ellas |
| **8 · Medición final (noviembre)** | Idéntica a la fase 6, con RIGE instalado en la VM y la fila de la hoja (4.3), sobre la versión congelada de RIGE | Mismo registro, `--condicion FIN` |

Ventana de la línea base: del 02/10 al 16/10/2026 (ADR-039).

## 9. Piloto

Los datos del piloto **no se incorporan** a la línea base. Se usan `practica`, C-1a y C-4a; que el piloto use dos casos del instrumento se declara, y después del piloto no se modifica ningún caso ni la instrucción. Decide:

| Parámetro | Regla |
|---|---|
| Tiempo límite | Ninguna ejecución de C-1 debe vencerlo, y en C-4 debe vencerse en menos de la mitad de las ejecuciones (mismo criterio que ADR-003). Si C-1 se censura, se amplía el límite y se repite |
| k | Si las 10 repeticiones de un caso con un modelo coinciden casi siempre en su resultado, k = 3. Si varían, k = 5. Se elige un solo k para toda la medición. La información sobre la generalización viene de los 16 casos, no de repetir [suposición del ingeniero; se confirma con los datos] |
| Costo | Costo medio por ejecución de cada modelo × 16 casos × k × 2 condiciones (sección 3.4) → recursos financieros del Cap. X |
| Formato | Proporción de `sin_respuesta` por formato. Si supera 1 de cada 10 en algún modelo, se ajusta la redacción del bloque JSON y se repite el piloto |
| Integridad | Ninguna ejecución altera el escenario ni accede a la web. Si ocurre, se endurece la configuración (3.2) y se repite el piloto |
| Invalidación | Si M1 acierta casi todo en C-4 **y** no consume más tokens que en C-1, se informa al autor **antes de seguir**: es la condición que invalida ADR-040 |

## 10. Amenazas a la validez que se declaran

| Amenaza | Tratamiento |
|---|---|
| Se mide el procedimiento delegado, no el manual | Declarada; la extensión de la práctica se estima con la encuesta de ADR-040 |
| Dependencia del modelo | Tres niveles; comparación dentro de cada modelo; identificador y fecha registrados |
| No determinismo | k repeticiones; transcripciones completas |
| El modelo puede conocer la documentación por su entrenamiento | Es parte de la práctica real; se declara. En C-3b, «seguir la documentación» se mide |
| Casos construidos por el autor | Criterios 8.2; cuatro mecanismos por condición; los casos con incidencias reales asociadas (C-2b, C-2c, C-2d, C-4c) y los observados en el laboratorio se informan como tales |
| Una sola familia de modelos | Se declara: el resultado no se generaliza a otros proveedores |
| El ejecutor modifica el escenario o sale a la web | Hash antes y después; detección en la traza; exclusión y registro |
| Cambios del proveedor entre octubre y noviembre | Identificador con fecha; si el proveedor retira el modelo, se declara y se informa el reemplazo sin mezclarlo en la comparación pareada |
| Un único autor diseña, construye y adjudica | Hoja de respuestas cerrada antes de medir; corrección automática; adjudicaciones manuales registradas con motivo; evidencia cruda disponible para terceros |

## 11. Qué entrega quien ejecuta

1. `resultados/fase0.md` con los supuestos resueltos.
2. La evidencia de `verificar.sh` y `respuestas.md` cerrada.
3. `congelamiento.json`.
4. Las tandas `LB` completas, con el registro, la evidencia cruda, la corrección y las adjudicaciones.
5. Las tablas y los gráficos de la sección 7.
6. Horas reales y costo real, para la bitácora y el Cap. X.
