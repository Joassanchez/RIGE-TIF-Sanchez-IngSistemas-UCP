# MED-13-c4 · Evidencia portable y V-9

La exportación de resultados se describe en `vm/LEEME.md`, sección
«Exportación portable de evidencia». Todos los enlaces se conservan dentro
del tar; su extracción para corrección/análisis usa descriptores JSON.
N-11 puede corregirse sin recrear el enlace de la configuración global.

## Captura del sistema en ensayo y tanda real

La salida nativa de V-9 aportada en `rige-ensayo-20261020c` contiene un
evento `type=error` anterior a la solicitud. El código anterior intentaba
leer después un registro de proveedor que no había llegado a crearse.
La captura nueva no usa ese registro ni infiere el prompt leyendo AGENTS.md.

La función `LLMRequestPrep.prepare` de OpenCode 1.18.25 ensambla el sistema
y llama al hook `experimental.chat.system.transform` antes de preparar el
transporte. Para OpenAI con OAuth, luego usa ese sistema como `instructions`;
para los demás proveedores lo incorpora como mensajes de sistema.
Fuente: [request.ts del tag v1.18.25](https://github.com/anomalyco/opencode/blob/v1.18.25/packages/opencode/src/session/llm/request.ts).
El contrato del hook está en
[packages/plugin/src/index.ts](https://github.com/anomalyco/opencode/blob/v1.18.25/packages/plugin/src/index.ts).

`captura-sistema.mjs` recibe ese sistema, guarda una copia sin modificarlo y
lanza `RIGE_MED13_SISTEMA_CAPTURADO` antes de la inferencia. La excepción es
deliberada: esta sonda no necesita generar texto ni ejecutar herramientas.
En ensayo se resuelve `simulado/permisos` sin servidor de proveedor; en real
se mantiene el modelo real de la tanda, su autenticación y la configuración
del proyecto. La medición del agente continúa usando el modelo real habitual.
No se interpreta una respuesta textual de un modelo como prueba del idioma.
La sesión recibe un título explícito para impedir una solicitud auxiliar del
agente `title`, cuyo sistema no corresponde al agente `build` observado.
La condición está en
[SessionPrompt.ensureTitle](https://github.com/anomalyco/opencode/blob/v1.18.25/packages/opencode/src/session/prompt.ts).

La configuración temporal añade únicamente el plugin local. `XDG_DATA_HOME`
y `XDG_STATE_HOME` aíslan los datos de la sonda; el directorio de configuración
del desarrollador no cambia. Su credencial se copia con modo 0600 al almacén
temporal y se elimina con él, sin copiarse a la evidencia. El catálogo/caché
del desarrollador sigue siendo el ya preparado. Fuente de las rutas XDG:
[core/src/global.ts](https://github.com/anomalyco/opencode/blob/v1.18.25/packages/core/src/global.ts).

Se conservan en cada captura `antes`/`despues`:

- `sistema-prompt.jsonl`: sistema, sesión, modelo y marcador del corte;
- `sistema-hook.mjs`: código exacto del observador;
- `sistema.json`: observación del idioma, modelo, fuente, hash del hook y
  `inferencia_ejecutada=false`;
- `sistema.stdout.jsonl` y `sistema.stderr.txt`: diagnóstico de la CLI.

Una salida CLI con error y sin prueba del hook detiene la captura con un
diagnóstico; no produce `instruccion_espanol=false` ni un FileNotFoundError.
También se rechazan timeouts, sistemas vacíos y capturas de otro modelo.

Próximo ensayo nativo: incluir N-11 y V-9; C-1 y M-1 conservan sus controles
anidados. Estas pruebas locales no sustituyen la ejecución nativa del ingeniero.
No se modificaron las hojas cerradas ni el Dockerfile. `.dockerignore` incluye
explícitamente el observador `.mjs` para la próxima construcción.
