# Medición de la línea base con agentes de programación

**Diseño para construir y ejecutar** · RIGE · OpenCode 1.18.25 · versión 2.0 · 13/10/2026

Cambios de la 2.0: veinticuatro casos; dos ejecutores; modelos sobre ChatGPT Plus; consumo en tokens y equivalente a tarifas congeladas; dos brazos finales; validez previa, ramas E/C/P/N y regla numérica de k; clasificación de la fuente en dos capas.

Este documento se entrega a quien construye y ejecuta la medición. Es autocontenido: no requiere haber leído el informe del proyecto. Rige ADR-053, modificado por ADR-076, ADR-078 y ADR-079; este último fija el criterio de lectura y cumplimiento.

> Convenciones. **[VERIFICAR]**: supuesto técnico que se comprueba en la fase 0 antes de construir sobre él. **[DECISIÓN PENDIENTE]**: lo decide el autor antes de la fase indicada. Todo lo demás está decidido.

---

## 1. Qué se mide y por qué

Un desarrollador que usa OpenCode necesita saber **qué configuración rige efectivamente sobre un agente y de dónde proviene** (qué modelo usa, si puede ejecutar un comando). La configuración se reparte entre varios archivos, variables de entorno y reglas nativas, y los comandos de la herramienta muestran el resultado, pero no su procedencia.

Una práctica real, documentada en el relevamiento, consiste en **delegar esa consulta en un agente**. Esta medición establece qué tan bien la resuelve un agente hoy (**línea de base**) y, en noviembre, qué tan bien la resuelve con RIGE (**medición final**): indicado en la instrucción, brazo principal, y disponible en la hoja de referencia. La comparación se hace con el mismo ejecutor, el mismo modelo y los mismos casos (ADR-053/ADR-079).

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

Se preparan dos configuraciones separadas en `evaluador`, sin mezclarlas entre tandas:

| Elemento | Principal | Segundo ejecutor |
|---|---|---|
| Agente | `build` nativo, con la skill `customize-opencode` disponible (ADR-078) | Variante experimental de «Charles», recibida el 13/10/2026 |
| Instrucción | Nativa de `build`, más la tarea de §4.2 | Conserva la instrucción de `../evidencia/PRIV/agente-referente-charles_20261013.md`, más la tarea de §4.2 |
| Modelo y temperatura | Modelos de §3.3; temperatura si el proveedor lo permite **[VERIFICAR]** | `openai/gpt-6-luna`, temperatura 0,2 |
| Permisos | Configuración de solo lectura de abajo | Conserva la estructura recibida: `bash` denegado por defecto con sus excepciones; `edit` y todo `ask` pasan a `deny` |
| Skills | `customize-opencode` disponible | Sin `opencode`, `skillshare` y `rtk` (no recibidas); `customize-opencode` sigue denegada |
| Documentación | Sin conexión, §4.3 | La documentación en línea se reemplaza por la misma documentación sin conexión |
| Acceso a RIGE | Comando de RIGE y envoltorio de la medición permitidos en ambos brazos; nada más se habilita | Ídem, con excepciones explícitas porque su `bash` deniega por defecto |

Configuración de solo lectura del principal en `~evaluador/.config/opencode/opencode.json`:

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
- La variante Charles se instala como agente de `evaluador` y se selecciona con `--agent`; su configuración se conserva con los cambios declarados en la tabla, sin aplicar el `bash: allow` del principal.
- Antes del piloto se congela y verifica en el contenedor la **configuración efectiva de los dos ejecutores**: agente, modelo, temperatura, skills y permisos; lectura del caso e invocación de RIGE mediante el envoltorio en ambos brazos. Se guardan comandos y salidas. Si un ejecutor no puede invocar RIGE sin habilitar permisos que deniega deliberadamente, se mide solo en la línea de base y se declara (ADR-079, condición 4).
- Las negativas atribuibles a los recursos retirados se registran aparte. La anterioridad de Charles a la entrevista está pendiente del acta; si no se acredita, se usa igual como segundo ejecutor, sin citarlo como demanda revelada anterior a la entrevista (ADR-079, condición 2).

### 3.3 Modelos

Tres modelos de OpenAI sobre **ChatGPT Plus**, fijados por ADR-076:

| Rol | Modelo | `--model` | Función |
|---|---|---|---|
| M1 · principal | `gpt-6.1-sol` | `openai/gpt-6.1-sol` | Con `build`, decide el cumplimiento en el brazo indicado |
| M2 · más capaz | `gpt-6-astra` | `openai/gpt-6-astra` | Sensibilidad a mayor capacidad |
| M3 · liviano | `gpt-6-luna` | `openai/gpt-6-luna` | Sensibilidad a menor capacidad y comparación con Charles al mismo modelo |

`build` se mide con los tres modelos; Charles, solo con `gpt-6-luna`. **[VERIFICAR]** en la fase 0 la autenticación por suscripción y los identificadores disponibles en 1.18.25. Si `gpt-6-astra` no está disponible, se declara perdido ese análisis de sensibilidad sin tocar el criterio principal (ADR-076). No se usan los modelos gratuitos de OpenCode: el laboratorio los encontró no deterministas y observó que devolvían contenido ajeno a la sesión (hallazgo C-9).

### 3.4 Costo

- Autenticación mediante ChatGPT Plus, realizada por el autor en `evaluador`; sin clave de API de la medición. Las credenciales quedan aisladas del escenario y de la hoja de respuestas.
- Consumo por ejecución = `tokens_entrada + tokens_cache + tokens_salida`, extraídos de la sesión, incluidos los consumidos en ejecuciones erróneas o censuradas.
- `costo_usd` = Σ (tokens de cada tipo × tarifa congelada por millón / 10⁶). Fuente única: `tarifas-congeladas-20261001.json` (ADR-076), con el nivel corto o largo que corresponda por solicitud. Se conserva su hash en la tanda.
- Es un **equivalente informativo a precio de lista**, no un desembolso por consulta. No se concilia por consola ni se usa el costo calculado por OpenCode como fuente de valorización.
- Si los límites de la suscripción impiden completar la medición, se reduce k primero en el segundo ejecutor, después en los modelos secundarios, y nunca en el principal; se declara cada recorte (ADR-076, condición 3, precisada por ADR-079).

## 4. Instrumento

### 4.1 Casos

**Veinticuatro casos, seis por condición.** Los escenarios están en `vm/casos/`; las preguntas, las respuestas y los criterios de corrección, incluidos los ocho nuevos (C-1e, C-1f, C-2e, C-2f, C-3e, C-3f, C-4e y C-4f), se describen en `respuestas.md`.

| Condición | Qué se consulta | Valor + fuente | Decisión + regla |
|---|---|---|---|
| C-1 · Control | Valor o decisión declarados en una sola fuente | C-1a, C-1c, C-1e | C-1b, C-1d, C-1f |
| C-2 · Fusión | Valor que resulta de combinar entradas | C-2a, C-2b, C-2c, C-2d, C-2e, C-2f | — |
| C-3 · Implícito | Valor o decisión que no está escrito en ningún archivo de configuración | C-3a, C-3c, C-3e | C-3b, C-3d, C-3f |
| C-4 · Permisos combinados | Decisión con reglas en entradas distintas | — | C-4a, C-4b, C-4c, C-4d, C-4e, C-4f |

Doce de valor y doce de permiso. C-2 es solo de valores y C-4 solo de permisos, por definición de la condición.

**Por qué 24.** ADR-079 amplía el instrumento para dar margen al criterio sobre casos con problema: C-2 a C-4 reúnen dieciocho casos y el mínimo de la rama E es un tercio (seis). Los ocho nuevos se derivan de resultados verificados de A.VI.3 sin caso previo, dos por condición, mezclando valor más fuente y decisión más regla.

**Repetir un caso k veces no reemplaza tener más casos:** mide la variabilidad del modelo, no si el resultado se generaliza a otras configuraciones.

Lo que aporta información es la variedad de mecanismos, observados en el laboratorio o en el código y respaldados por incidencias cuando las hay. No se generan variantes automáticas.

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
| **Nuevo · 8.2-10 Dentro del alcance de RIGE** | Cada caso lo atiende un requisito Must del MVP y es consultable por la línea de comandos en la versión congelada. Un caso fuera del alcance castigaría a RIGE en noviembre por algo que no promete. Cumplimiento: tabla «Tipo de consulta» de `respuestas.md`; los de permisos los cubre RF-03 por línea de comandos (ADR-051) |

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
| C-1e | Control de valor en una sola entrada | ADR-079; `respuestas.md` |
| C-1f | Control de permiso en una sola entrada | ADR-079; `respuestas.md` |
| C-2e | `OPENCODE_CONFIG_CONTENT` | ADR-079; `respuestas.md` |
| C-2f | `OPENCODE_CONFIG` | ADR-079; `respuestas.md` |
| C-3e | Sustitución `{env:}` sin valor | ADR-079; `respuestas.md` |
| C-3f | Herencia de denegaciones a un subagente | ADR-079; `respuestas.md` |
| C-4e | `OPENCODE_PERMISSION` en la cadena | ADR-079; `respuestas.md` |
| C-4f | `OPENCODE_PERMISSION` inválida descartada | ADR-079; `respuestas.md` |

El caso `practica` queda como auxiliar fuera del instrumento; el piloto abarca los veinticuatro casos (sección 9).

### 4.2 Instrucción de la tarea

Mensaje común que recibe el ejecutor en cada ejecución (idéntico, salvo `{DIRECTORIO}`, `{PREGUNTA}` y el agregado del brazo indicado):

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

En la medición final hay dos brazos (ADR-079):

| Brazo | Instrucción | Función |
|---|---|---|
| **Indicado** | Se agrega: **[DECISIÓN PENDIENTE: texto exacto de la indicación]** | Principal: el desarrollador indica que se consulte RIGE |
| **Disponible** | Se conserva el mensaje común | Mide adopción sin indicación; RIGE figura en la hoja |

El texto exacto se fija antes del piloto y se congela junto con las instrucciones de los dos brazos. `uso_rige` se registra en ambos.

### 4.3 Hoja de referencia del ejecutor

`~evaluador/tarea/hoja-referencia.md` es la hoja de `vm/hoja-referencia.md` con tres cambios, y nada más:
- se quita la sección «Cómo responder», que describe el protocolo de una persona («decí listo»), porque el formato está en la instrucción;
- se quita la sección «No disponible durante la sesión»;
- en la medición final, en **ambos brazos**, se agrega **una fila** a «Comandos disponibles» con el comando de RIGE y lo que hace, según su `--help`. En el brazo disponible, esta fila es el único cambio en las ayudas de la tarea respecto de LB; en el indicado se suma la frase de §4.2. Si el agente no usa RIGE, eso también es un resultado (campo `uso_rige`).

**Dependencia:** para que RIGE pueda intervenir en los doce casos de permisos, su línea de comandos consulta decisiones de permiso (RF-03, ADR-051, que reúne lo decidido en ADR-022 y ADR-041). Si RF-02 no cierra en la iteración 2, la medición final solo puede mostrar el efecto de RIGE en los casos de valor, y se declara (ADR-051, condición 1).

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
| `modelo`, `agente` | Identificador exacto; `build` o la variante Charles |
| `ejecutor` | Principal (`build`) o variante Charles; configuración congelada identificada |
| `brazo` | `LB`, `indicado` o `disponible` |
| `caso`, `condicion_caso`, `variante`, `repeticion` | C-2b, C-2, b, 1..k |
| `inicio`, `duracion_s`, `censurado` | Fecha y hora ISO; segundos; 1 si venció el tiempo límite |
| `codigo_salida`, `reintentos` | |
| `tokens_entrada`, `tokens_cache`, `tokens_salida`, `costo_usd` | Consumos de la sesión por tipo; su suma es el consumo de la ejecución; `costo_usd` es el equivalente a tarifas congeladas de §3.4 |
| `herramientas` | Lista de invocaciones: herramienta, argumentos, resultado |
| `comandos_introspeccion` | Cuáles usó: `debug config`, `debug agent`, `debug skill`, `--help`, otros |
| `archivos_leidos` | Archivos distintos del escenario leídos (IB-4) |
| `uso_documentacion`, `uso_hoja` | 1/0 |
| `uso_rige` | Solo en `FIN`: 1 si invocó el comando de RIGE |
| `acceso_web` | 1 si intentó salir a la web por cualquier vía |
| `escenario_alterado` | 1/0 |
| `negativa_por_recurso_retirado` | Negativa atribuible a skills, aprobaciones humanas o acceso en línea retirados; recurso y evidencia de la traza |
| `fuente_observada` | Por ejecución, qué usó el agente según la traza (§7); admite varias fuentes |
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

**Unidad de análisis: el caso.** Cada ejecutor y modelo se analiza con su propia línea de base y con comparación pareada por caso y brazo. La tasa de una condición es el promedio de las tasas de sus seis casos. Los intervalos de confianza no se calculan sobre las ejecuciones como si fueran independientes. Se informa siempre la tabla caso por caso.

### 7.1 Definiciones de ADR-079 (fijas antes del piloto)

| Término | Definición |
|---|---|
| Ejecución | Una corrida de un caso por un ejecutor y un modelo. Resultado: correcta, parcial, incorrecta o sin respuesta (`respuestas.md`); parcial y sin respuesta cuentan como error |
| Tasa de error del caso | Ejecuciones erróneas sobre k |
| Caso con problema | Tasa de error mayor o igual que 1/2; con k = 3, al menos 2 de 3; con k = 5, al menos 3 de 5 |
| IB-1 agregado | Ejecuciones erróneas sobre el total de ejecuciones de los dieciocho casos de C-2 a C-4 |
| Tokens de una ejecución | Entrada + caché + salida, según la sesión; se cuentan los consumidos en ejecuciones erróneas o censuradas |
| Tokens del caso | Mediana de los tokens de sus k ejecuciones |
| Nivel de tokens de un conjunto | Mediana de los tokens de sus casos |
| Reducción de tokens del caso | 1 − (tokens del caso con RIGE ÷ tokens del caso sin RIGE) |

### 7.2 Validez previa

Antes de leer las ramas, la medición de cada ejecutor debe cumplir las tres condiciones:

- Ningún caso de C-1 es caso con problema.
- Ninguna ejecución de C-1 está censurada.
- Todas las ejecuciones tienen registro completo de resultado y tokens. Una ejecución perdida se repite. Si no se recupera, el caso se excluye de ambas mediciones y de ambos brazos de ese ejecutor, y se declara. Los umbrales se recalculan en proporción sobre el conjunto común (un tercio y ⌈2/3⌉). Más de dos exclusiones invalidan la medición.

Si no es válida, se corrige la causa en el instrumento y se repite la línea de base completa de ese ejecutor. No se leen las ramas ni se ajusta ningún umbral.

### 7.3 Ramas y cumplimiento

Ramas sobre la línea de base de cada ejecutor y modelo; orden **E, C, P, N**, con la primera condición que se cumple (ADR-079):

| Rama | Condición | Criterio en la medición final, brazo indicado |
|---|---|---|
| **E · error** | Al menos 6 de 18 casos con problema y el IB-1 de C-2 a C-4 supera al de C-1; coincide con «Confirma» o «Reordena» de IV.3 | Al menos ⌈2/3⌉ de los casos con problema dejan de serlo; ningún caso sin problema pasa a tenerlo; el IB-1 agregado disminuye. Tokens como criterio secundario: la mediana de las reducciones de los dieciocho casos no es negativa |
| **C · costo** | Menos de 6 casos con problema y nivel de tokens de C-2 a C-4 al menos doble del de C-1 (X = 2) | Mediana de las reducciones de tokens de los dieciocho casos de al menos 30 % (Y = 30 %); ningún caso sin problema pasa a tenerlo; el IB-1 agregado no aumenta |
| **P · problema bajo el mínimo** | De 1 a 5 casos con problema, sin condición de C | Sin criterio de cumplimiento; se ejecuta la medición final y se informa caso por caso, descriptivamente |
| **N · sin problema** | Ningún caso con problema, sin condición de C | Sin criterio de mejora; condición 1 de ADR-053 y condición 4 de ADR-078 (reevaluar el objeto) solo si el segundo ejecutor también cae en N |

La regla de confirmación, reordenamiento y refutación de **IV.3 se evalúa siempre e independientemente**; conserva sus consecuencias sobre la selección y el orden del flujo. Su única vinculación con las ramas: con seis o más casos con problema y «Refuta», se informa **rama P**. En C, la meta del objetivo general pasa a tokens por ADR-079, no por IV.3.

El **cumplimiento del proyecto** se declara sobre `build`, `gpt-6.1-sol` y el **brazo indicado**. Cada ejecutor y modelo determina su propia rama; la medición final se ejecuta para todos los que no caen en N, salvo la condición de acceso a RIGE de §3.2. Los otros ejecutores y modelos, y el brazo disponible, se informan siempre con la misma regla, sin decidir el cumplimiento.

| Lectura de los brazos | Interpretación |
|---|---|
| Indicado y disponible cumplen | RIGE resuelve y el agente lo adopta |
| Cumple solo el indicado | RIGE resuelve si el desarrollador lo indica |
| El indicado no cumple | El objetivo no se alcanza |

Siempre se informan las ramas, las tasas por caso **sin binarizar**, los retrocesos con su causa y todas las ejecuciones censuradas. En P y N se respeta la ausencia de criterio que fija la tabla. Los umbrales son convenciones aceptadas antes de medir, sin significado estadístico atribuido (ADR-079).

### 7.4 Indicadores y comparaciones

Por ejecutor, modelo y brazo, por condición y para C-2 a C-4 en conjunto:

| Indicador | Medida |
|---|---|
| IB-1 · Error | Tasa de error por caso (k ejecuciones) y su promedio por condición; además, cantidad de casos de la condición con al menos la mitad de sus ejecuciones erróneas |
| IB-3 · Parciales | Proporción de respuestas con valor correcto y fuente incorrecta |
| Tokens | Mediana y rango intercuartílico por consulta; mediana por caso y nivel del conjunto para las ramas; equivalente a precio de lista de §3.4 |
| IB-4 · Esfuerzo | Mediana de archivos leídos y de invocaciones de herramientas |
| IB-2 · Tiempo | Mediana y rango intercuartílico de la duración. Peso menor: depende de la latencia del proveedor |
| Censura | Proporción de ejecuciones que vencen el tiempo límite |

Comparaciones descriptivas: C-1 frente a C-2 a C-4; casos de valor frente a casos de permiso; los pares C-3d/C-4c (misma acción, con y sin la declaración que anula la protección nativa) y C-4a/C-4b; casos documentados frente a no documentados; C-4a frente a C-4b; en C-3b, la proporción que sigue la documentación; y el uso de comandos de introspección frente a acierto. Gráficos: barras de error por condición y modelo, con intervalos; barras apiladas por tipo de resultado; cajas de tokens por condición.

### 7.5 Clasificación de la fuente en dos capas

| Capa | Momento y evidencia | Registro |
|---|---|---|
| **Cobertura disponible** | Por caso, antes del piloto, con evidencia de las ayudas disponibles | Etiquetas múltiples: documentación, comando nativo, skill del fabricante y solo ejecución. Cada etiqueta indica si cubre la respuesta completa, solo el valor o la cubre incorrectamente (C-3b) |
| **Fuente observada** | Por ejecución, a partir de la traza | `fuente_observada`: qué usó el agente; se distingue de la fuente de configuración que declara en su respuesta |

Ningún comando nativo informa a la vez la respuesta y su procedencia. Se cruzan la cobertura disponible y la fuente observada con el resultado y los tokens; se informan aparte las negativas atribuibles a recursos retirados.

## 8. Procedimiento por fases

| Fase | Qué se hace | Criterio de cierre |
|---|---|---|
| **0 · Supuestos técnicos** | Resolver cada **[VERIFICAR]**: flags de `opencode run`, extracción de tokens y herramientas, alcance de `edit: deny`, modelos disponibles con `OPENCODE_DISABLE_MODELS_FETCH=1` (si el modelo fijado no figura en el catálogo empaquetado, quitar esa variable **solo** para `evaluador`), permisos de grupo | Cada punto con su comando y su salida, en `resultados/fase0.md` |
| **1 · Contenedor** | Instalación ampliada; el autor autentica ChatGPT Plus como `evaluador` | Instalación íntegra, aislamiento y registro de tokens verificados |
| **2 · Verificación de casos y ejecutores** | Verificar los veinticuatro casos contra el binario 1.18.25 en el contenedor, incluidos los seis marcados **[VERIFICAR]**; comparar con `respuestas.md`; clasificar cobertura disponible y confirmar el criterio 8.2-3; congelar y verificar la configuración efectiva de ambos ejecutores, lectura del caso y acceso a RIGE en los dos brazos (§3.2) | Los veinticuatro casos coinciden; `respuestas.md` cerrada con fecha y evidencias. Discrepancia → corrección registrada y reverificación. Acceso imposible sin ampliar permisos deliberadamente denegados → ese ejecutor solo en LB |
| **3 · Registro previo** | Registrar modelos, configuraciones de los dos ejecutores, reglas de §7 y redacción final de las instrucciones y hojas de los brazos; consulta previa al docente (ADR-078/ADR-079) | ADR-053 modificado por ADR-076, ADR-078 y ADR-079 y artefactos registrados **antes del piloto** |
| **4 · Piloto** | Veinticuatro casos, diez ejecuciones por caso, `build` con `gpt-6.1-sol`; tiempo límite inicial de 600 s | Ver sección 9; datos separados de LB |
| **5 · Congelamiento** | Se fijan k, el tiempo límite, la instrucción y la hoja. Hash de cada artefacto en `congelamiento.json` | Nada cambia después de este punto |
| **6 · Línea base** | `medir.sh --condicion LB`, veinticuatro casos, `build` con M1 a M3 y Charles con `gpt-6-luna`, k de §9 salvo recortes declarados (§3.4) | Registro completo; validez previa de §7.2. Si falla, corregir la causa y repetir LB completa de ese ejecutor |
| **7 · Corrección y análisis** | `corregir.py`, adjudicación manual, `analizar.py`; determinar rama propia por ejecutor y modelo e informar IV.3 independientemente | Tablas de §7; I.3.2 y II.3 del informe se completan desde ellas |
| **8 · Medición final (noviembre)** | Mismos casos, ejecutor, modelo y k, con RIGE congelado y los dos brazos (§4.2–4.3); para todos los que no caen en N y pueden invocarlo | Mismo registro, `--condicion FIN`, brazo indicado y disponible identificados; validez previa y lectura de §7 |

Ventana de la línea base: del 02/10 al 16/10/2026 (ADR-039).

## 9. Piloto

Los datos del piloto **no integran** la línea de base. Antes de ejecutarlo se verifican los veinticuatro casos y la configuración efectiva de los dos ejecutores en el contenedor (§8). Se ejecutan **los veinticuatro casos, diez veces cada uno**, con `build` y `gpt-6.1-sol` (240 ejecuciones). Después del piloto no se modifica ningún caso ni la instrucción; cualquier ajuste requerido se verifica y el piloto se repite antes del congelamiento. Decide:

| Parámetro | Regla |
|---|---|
| Tiempo límite | Ninguna ejecución de C-1 debe vencerlo, y en C-4 debe vencerse en menos de la mitad de las ejecuciones (mismo criterio que ADR-003). Si C-1 se censura, se amplía el límite y se repite |
| k | Concordancia del caso = proporción de sus diez ejecuciones con el resultado más frecuente (correcta o errónea). Si al menos el 90 % de los casos tiene concordancia de 9/10 o más, k = 3; si no, k = 5. Mismo k para todos los ejecutores y modelos, salvo recortes declarados de §3.4. El umbral de problema (1/2) no se revisa con los datos |
| Inestabilidad | Tasa de error del piloto entre 30 % y 70 %: caso marcado como inestable e informado, **sin excluirlo** |
| Consumo y equivalente | Tokens y equivalente de §3.4 por ejecución y para las tandas previstas: veinticuatro casos por combinación de ejecutor/modelo; LB y dos brazos finales para las combinaciones que corresponda medir. El piloto solo estima el consumo del principal; los límites siguen §3.4 |
| Formato | Proporción de `sin_respuesta` por formato en el principal. Si supera 1 de cada 10, se ajusta la redacción del bloque JSON y se repite el piloto |
| Integridad | Ninguna ejecución altera el escenario ni accede a la web. Si ocurre, se endurece la configuración (3.2) y se repite el piloto |
| Validez y lectura | Validez previa y ramas de ADR-079 (§7), sin ajustar umbrales. La reevaluación del objeto se activa solo en N si el segundo ejecutor también cae en N; no se decide a partir del piloto del principal solamente |

## 10. Amenazas a la validez que se declaran

| Amenaza | Tratamiento |
|---|---|
| Se mide el procedimiento delegado, no el manual | Declarada; la extensión de la práctica se estima con la encuesta de ADR-053/ADR-078 |
| Dependencia del modelo | Tres niveles; comparación dentro de cada modelo; identificador y fecha registrados |
| No determinismo | k repeticiones; transcripciones completas |
| El modelo puede conocer la documentación por su entrenamiento | Es parte de la práctica real; se declara. En C-3b, «seguir la documentación» se mide |
| Casos construidos por el autor | Criterios 8.2; seis casos por condición; los casos con incidencias reales asociadas (C-2b, C-2c, C-2d, C-4c) y los observados en el laboratorio se informan como tales |
| Una sola familia de modelos | Se declara: el resultado no se generaliza a otros proveedores |
| El ejecutor modifica el escenario o sale a la web | Hash antes y después; detección en la traza; exclusión y registro |
| Cambios del proveedor entre octubre y noviembre | Identificador con fecha; si el proveedor retira el modelo, se declara y se informa el reemplazo sin mezclarlo en la comparación pareada |
| Un único autor diseña, construye y adjudica | Hoja de respuestas cerrada antes de medir; corrección automática; adjudicaciones manuales registradas con motivo; evidencia cruda disponible para terceros |
| La variante Charles no es la práctica de la referente | Sin sus skills y sin aprobaciones humanas; documentación sin conexión. Cambios declarados, configuración efectiva verificada y negativas por recursos retirados registradas (ADR-079) |
| Comparación Charles frente a `build` | Al mismo modelo (`gpt-6-luna`) mide el efecto conjunto de instrucción, permisos y ayudas; no se atribuye a un componente aislado (ADR-079) |
| Costo humano de verificar fuera de la medición | ADR-078, K-A: se releva con la encuesta y la referente. Si la mayoría de quienes delegan verifica probando el comportamiento, K-A no alcanza y se reevalúa el diseño |

## 11. Qué entrega quien ejecuta

1. `resultados/fase0.md` con los supuestos resueltos.
2. La evidencia de `verificar.sh` y `respuestas.md` cerrada.
3. `congelamiento.json`.
4. Las tandas `LB` completas, con el registro, la evidencia cruda, la corrección y las adjudicaciones.
5. Las tablas y los gráficos de la sección 7.
6. Horas reales y costo real, para la bitácora y el Cap. X.
