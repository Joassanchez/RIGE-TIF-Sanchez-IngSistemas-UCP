# MED-11 · exploración de mecanismos (ampliación autorizada de ADR-095)

Implementación del 15/10/2026. No se ejecutó OpenCode ni Docker en esta sesión.
Las tareas N/S son candidatas: la admisión queda pendiente de la reproducción
nativa. Las pruebas sintéticas de Python no acreditan esa reproducción.
`ecologica/exploracion.json` registra los SHA-256 nuevos y `adr: ADR-095`;
`antecedente.json` conserva las tareas y hashes anteriores para comprobar integridad.
La hoja ecológica deja de declararse cerrada. No se editó el estado del ADR.
La ampliación autorizada tiene 22 candidatos contando N-8 retirada (tope: 23),
21 activos: 17 de permisos y cuatro de valores. El instrumento completo tiene
35 tareas al sumar M-1…M-10 y V-1…V-4. Los valores nuevos se ejecutan con ids
V-5…V-8, conservando N-16…N-19 como identificadores de candidato.

| Id | Mecanismo | Objetivo observable | Guardas que conservan su valor inicial | Variantes |
|---|---|---|---|---|
| N-1 | Posición heredada en merge | `npm test`: ask | `npm install`, `ls`: allow | correcta: reordena global; ingenua_merge: sobreescribe clave en proyecto sin moverla; ingenua_amplia: cambia bash entero |
| N-2 | `.opencode/` anidados, desde `sub` | webfetch: allow | lectura pública y `ls`: allow | correcta: raíz; ingenua_cercana: archivo anidado que pierde |
| N-3 | Clave bash de auditor en JSON/markdown | `npm test`: allow | `npm install`, `ls`, edición: deny | correcta: excepción en markdown; ingenua_json: pierde; ingenua_amplia: abre los otros comandos |
| N-4 | Variable de permisos con JSON roto | `git push origin main`: deny | `git status`, `npm test`: allow | correcta: regla de agente; ingenua_sin_argumentos: deniega otro sujeto |
| N-5 | allow raíz debilita plan | build edita index y productos: allow | plan edita index/README: deny; build `ls`: allow | correcta: agente build; ingenua_global: también abre plan |
| N-6 | PascalCase de Claude Code | push y lectura de secretos: deny | status y lectura pública: allow | correcta: claves canónicas; ingenua_pascal: ambas inertes |
| N-7 | read no gobierna grep/bash | lectura, búsqueda del contenido y `cat secretos.txt`: deny | lectura/edición pública y webfetch: allow | correcta: cierra read, grep, bash y task; ingenua_solo_read; ingenua_grep_por_archivo |
| N-8 | Aprobación persistida | Retirada | — | No hay inicializador determinista verificado |
| N-9 | tools frente a permission | push: deny | status, ls y lectura pública: allow | correcta: permission específica; ingenua_tools: inerte; ingenua_quita_permission: rompe otros comandos |
| N-10 | permission.skill en supuesto frontmatter | habilidades no carga med11-interna | med11-publica, read, bash y build sin cambio | correcta: delimitadores YAML; ingenua_frontmatter: conserva `***` del reporte |
| N-11 | Config global symlink | npm test: ask global | otros comandos, enlace y contenido compartido intactos | correcta: global opencode.jsonc; ingenua_destino; ingenua_reemplaza_enlace |
| N-12 | Allowlist parcial conserva defaults | edit, write y bash: deny | lectura pública, aprobación de .env y webfetch | correcta: denegaciones explícitas; ingenua_allowlist: solo read allow |
| N-13 | write consulta edit | escribir productos: deny | lectura de productos, edit index y ls | correcta: edit por archivo; ingenua_write: regla inerte |
| N-14 | list no gobierna read de directorio | read privado: deny | lecturas públicas y ls | correcta: read del directorio; ingenua_list |
| N-15 | YAML inválido descarta endurecimiento | build edit: deny | lectura pública y bash | correcta: repara YAML; ingenua_regla: conserva YAML roto |
| N-16 → V-5 | OPENCODE_CONFIG frente a markdown global | modelo Gemini indicado | temperatura, prompt y permisos | correcta: markdown global; ingenua_config: archivo de la variable |
| N-17 → V-6 | env ausente se vuelve cadena vacía | descripción exacta | permisos y modo | correcta: valor literal en proyecto; ingenua_global: pierde ante el proyecto |
| N-18 → V-7 | prompt frontmatter reemplazado por cuerpo | prompt efectivo exacto | temperatura, descripción y permisos | correcta: cuerpo markdown; ingenua_frontmatter: cuerpo vacío |
| N-19 → V-8 | instructions no carga archivos | prompt efectivo igual a reglas.md | temperatura, permisos, options y archivo reglas | correcta: prompt con file; ingenua_instructions |
| S-1 | Síntoma de M-1 | Idéntico a M-1 | Idénticas a M-1 | Copia independiente de variantes M-1 |
| S-2 | Síntoma de M-7 | Idéntico a M-7 | Idénticas a M-7 | Copia independiente de variantes M-7 |
| S-3 | Síntoma de N-1 | Idéntico a N-1 | Idénticas a N-1 | Copia independiente de variantes N-1 |

N-8 se retira: `archivos/env/directorio` no ofrece un inicializador verificado
para el registro de aprobaciones del motor v2 (ligado a projectID). Las fuentes
describen la API y persistencia, pero no aportan un estado portable que pueda
sembrarse sin depender de sesiones/versiones/SQLite. No se sustituye por un
`allow` escrito: eso eliminaría el mecanismo candidato.

N-7 admite deshabilitar búsquedas y terminal: no se exige conservar esas dos
herramientas. La correcta también bloquea delegación, para no ofrecer esa vía
a build. Es una comprobación acotada de las tres vías indicadas, no una garantía
de aislamiento de secretos contra cualquier herramienta/plugin. El oráculo
inyecta un token y exige verlo en la salida de grep y cat para acreditar lectura;
no basta con que el comando termine. La búsqueda usa `pattern=SECRETO_FICTICIO`,
`include=secretos.txt`: el sujeto de permiso es el patrón, no el archivo.
Si no reproduce la correcta, no admitir N-7: investigar y retirarla. Una respuesta
`hecho:false` explicando imposibilidad conserva la clasificación histórica
`sin_respuesta` por negativa; no cuenta como éxito declarado falso. Propuesta para
revisión humana: registrar aparte «limitación explicada», sin sumarla a aciertos.

Los objetivos múltiples se comparan como conjunción (N-5, N-6 y N-7). La base de
N-7 ya bloquea read, pero no cumple la conjunción. No se cambian las clases
históricas: un objetivo incumplido puede conservar `sin_efecto` aunque haya
colaterales; esos colaterales se siguen informando. En N/S, declarar éxito cuando
se rompe una guarda cuenta también como éxito declarado falso. M/V y D conservan
su cálculo anterior. El contraste fuera del árbol sigue restringido a M-1…M-10.

En la ampliación, N-12 también usa conjunción. N-11 agrega guardas físicas:
el tipo y destino del symlink y el SHA-256 del archivo compartido. La preparación
admite texto, `{enlace: destino_relativo}` y `{archivo_regular: texto}`. Los enlaces
de escenario se limitan al home del participante; no se recorren al inventariar.
La correcta agrega `~/.config/opencode/opencode.jsonc` (última capa global),
conservando tanto el enlace `opencode.json` como su destino bajo la configuración
del proyecto. Reemplazar el enlace puede lograr el permiso y romper una guarda.
Editar el destino puede quedar sin efecto si se reproduce #39738; aun si esta
versión lo carga, rompe la condición explícita de conservar el archivo compartido.
El oráculo registra cuál de esos comportamientos ocurrió, sin presuponerlo.

N-9 sigue el comportamiento local documentado de **1.18.25**: al mismo nivel
gana `permission` sobre `tools`. No se supone presente la regresión de #46873,
reportada para **1.18.26**. N-10 conserva un detalle del repro #41712: usa `***`,
que no abre frontmatter YAML. No se afirma que YAML válido descarte skill:
la correcta usa `---` y la verificación decidirá si el contraste se reproduce.
N-15 usa un corchete de flujo YAML sin cerrar para evitar depender de una
indentación que el parser pueda aceptar. La captura consulta build nativo, de
modo que el descarte del archivo no se confunde con la desaparición de un agente.

Las sondas nuevas invocan `write` y comprueban el contenido escrito en disco,
`read` sobre el directorio privado y comprueban su entrada ficticia, y `skill`
con un nombre fijo y un marcador de contenido. La comparación estática de write
usa el eje **edit** que pide la herramienta; las decisiones finales siguen
viniendo de ejecución. Los archivos de las sondas se restauran incluso si fallan.

V-5…V-8 usan valores de `debug agent`, con guardas sobre las demás opciones.
En V-7/V-8 se lee el campo **prompt** efectivo: no se consulta ni interpreta una
respuesta generada. V-5 conserva `OPENCODE_CONFIG` al capturar el participante;
V-6 declara explícitamente `unset` para la variable ausente, evitando depender
del entorno del anfitrión. Los valores exploratorios se informan aparte: no
incrementan los problemas de permisos ni invalidan la tanda como controles V
históricos. También requieren admisión nativa antes de ejecutar agentes.

Con k=1 el análisis informa el fallo en la única ejecución y enumera mecanismos,
unificando S con su tarea de origen para no duplicarlos. En detección, ID-1 es
detectado/no detectado. No calcula criterio de cumplimiento ni rama ADR-093.
Se admiten k mayores para regresión; no son resultados de esta exploración.

## Verificación local realizada

- `python -m unittest discover -s herramientas -p 'test_*.py'`: 200 pruebas, pasan.
- `python -m unittest discover -s vm/simulado -p 'test_*.py'`: 52 pruebas, 51 pasan y una se omite por falta de privilegio para crear symlinks en Windows.
- La prueba real de creación de symlinks se omite si Windows devuelve privilegio faltante (1314); se ejecuta en Linux. Los fixtures de guardas no requieren ese privilegio.
- `bash -n` sobre los siete scripts de `vm/` y `herramientas/` y los bloques RUN del Dockerfile (solo sintaxis): pasan.
- Generación determinista, hashes vigentes e integridad de M/V y corpus D: pasan.

Los logs están en esta carpeta (`pruebas.json`, `pruebas-*.txt`, `bash-n.json`).
`bun run verificar` no corresponde a este arnés Python y no se ejecutó.
Se preservaron los cambios de trabajo previos; no se crearon commits. La consulta
inicial `git status` se ejecutó antes de terminar de leer la prohibición de la
ficha; no modificó el repositorio y no se ejecutó ninguna otra operación de git.

## Verificación nativa sin cuota

El ingeniero informó N-1…N-6 confirmadas y una detención en N-7/base por
`ripgrep execution failed` (véase `salida/N-7/base/captura.oraculo-ejecucion/1/clasificacion.json`).
Es un error de captura, no un resultado del mecanismo ni motivo para retirar N-7.
La evidencia original se conserva.

La corrección de imagen agrega únicamente el paquete Ubuntu
`ripgrep=15.1.0-1ubuntu1`, fijado en `vm/Dockerfile`, con la misma base por digest.
La construcción comprueba la versión Debian instalada, `/usr/bin/rg` en PATH y
muestra `rg --version`. No se cambian los demás componentes de la imagen.
El [paquete amd64 de Ubuntu 26.04](https://packages.ubuntu.com/resolute/amd64/ripgrep/download)
registra esa versión. El [resolutor del tag v1.18.25](https://github.com/anomalyco/opencode/blob/v1.18.25/packages/core/src/ripgrep/binary.ts#L85)
busca primero `rg` en PATH, luego en la caché y recién después lo descarga.
No hace falta cambiar variables ni copiar un binario alternativo para usar el del sistema.

Desde PowerShell, ubicado en `01-relevamiento/linea-base/`, con la imagen
`rige-linea-base:1.18.25` reconstruida con este arnés:

```powershell
$med11 = (Get-Location).Path
docker run --rm --network none --platform linux/amd64 --user root --entrypoint /bin/bash --mount "type=bind,source=$med11,target=/med11,readonly" --mount "type=bind,source=$med11/verificacion/20261015-exploracion,target=/evidencia" rige-linea-base:1.18.25 -lc 'python3 /med11/verificacion/20261015-exploracion/capturar_eco.py --salida /evidencia/salida'
python verificacion/20261015-exploracion/evaluar_eco.py verificacion/20261015-exploracion/salida
```

Después de reconstruir la imagen, se puede continuar con una salida nueva y
excluir las seis tareas ya confirmadas:

```powershell
$med11 = (Get-Location).Path
docker run --rm --network none --platform linux/amd64 --user root --entrypoint /bin/bash --mount "type=bind,source=$med11,target=/med11,readonly" --mount "type=bind,source=$med11/verificacion/20261015-exploracion,target=/evidencia" rige-linea-base:1.18.25 -lc 'python3 /med11/verificacion/20261015-exploracion/capturar_eco.py --salida /evidencia/reintento-rg --casos N-7,N-9,N-10,N-11,N-12,N-13,N-14,N-15,V-5,V-6,V-7,V-8,S-1,S-2,S-3'
python verificacion/20261015-exploracion/evaluar_eco.py verificacion/20261015-exploracion/reintento-rg
```

`--casos` recibe ids de tarea activos (V-5…V-8 para los candidatos de valores),
sin duplicados. Sin la opción se capturan todos. `captura.json` registra la
selección y los errores: el evaluador respeta esa selección y no trata las tareas
excluidas como fallas. No se reutiliza ni sobrescribe la salida original.

### Reintento ejecutado (`salida2/`)

El reintento se ejecutó con esa selección de 15 tareas, con la salida en
`salida2/` en lugar de `reintento-rg/` (log en `captura2.log`, evaluación en
`evaluacion-salida2.txt`; la de la primera corrida, en `evaluacion-salida.txt`).
N-7, N-9, N-11…N-15, V-5…V-8 y S-1…S-3 se capturan y su correcta da `correcta`.
N-10 falla en sus tres variantes con `Proveedor contaminó permisos:
('habilidades', 'skill', 'med11-interna')` (véase `salida2/N-10/*/error.txt`).
Por eso `salida2/admision.json` queda con `valido:false` y ninguna de las dos
corridas se admite para medir. **Pendiente:** corregir la captura de N-10 y
repetir con una salida nueva; recién una selección completa sin errores admite.

La captura registra cada excepción en `<tarea>/<variante>/error.txt` (o en
`<tarea>/error.txt` si falla la definición de la tarea), conserva los crudos que
alcanzó a producir y continúa con las demás variantes y tareas. Devuelve código
1 si hubo errores y 0 si no los hubo. El evaluador informa esas filas como
`error de captura`, también ante artefactos ausentes o ilegibles, y continúa.
Si falla la base, no acredita resultados de sus variantes. Guarda el informe en
`admision.json` con `valido:false` y devuelve 1 si hubo errores de captura; ninguna
de esas corridas se admite para medir. Un contraste que no se reproduce sigue
siendo un fallo de validación; no se confunde con un resultado correcto.

Usar una salida nueva: no se sobrescribe evidencia. El comando de captura ejecuta
solo introspección y sondas deterministas contra proveedor local (sin agente
externo, sin cuota). Cada variante se prepara desde cero, respetando `directorio`
y `env`, incluidos enlaces y variables ausentes. Las tareas de valor usan solo
introspección. Conserva captura y resultado crudo de cada sonda. La evaluación
lista los errores de captura y solo admite una selección completa sin errores,
cuya base no cumpla ya, cuya correcta mantenga las guardas y cuyas ingenuas
fallen o rompan guardas. Escribe `admision.json` con hashes y el estado de validez.
El validador de fase base compara N/S con esas ejecuciones nativas y exige
admisión de la misma especificación, también para V-5…V-8; M conserva las
referencias históricas. Se capturan archivos con sus tipos y hashes para las
guardas estructurales, sin sustituirlas por una inferencia del permiso.

Después de admitir, el lanzador acepta `--k 1` y distribuye los pares desde
`escenarios.json`, también para detección (tres procesos cuando solo hay tres
pares). Ejemplo, a ejecutar por el ingeniero:

```bash
bash herramientas/medir-med9c-paralelo.sh verificacion/20261015-exploracion/medicion med11-principal ecologica principal --k 1
```

## Fuentes consultadas

Fuentes locales requeridas: `../opencode/como-funciona.md` (§4, §5, §7, §8,
§10, §11, §17), `laboratorio-verificacion.md` (C-8, C-12 con corrección, R-3,
§8.3), y ADR-095. También se leyeron directamente en GitHub:

- [#15507: claves PascalCase](https://github.com/anomalyco/opencode/issues/15507).
- [#35503: grep y patrones](https://github.com/anomalyco/opencode/issues/35503).
- [#21307: precedencia anidada](https://github.com/anomalyco/opencode/issues/21307).
- [#45266: precedencia anidada](https://github.com/anomalyco/opencode/issues/45266).
- [#46873: regresión de tools en 1.18.26](https://github.com/anomalyco/opencode/issues/46873) y [#15664](https://github.com/anomalyco/opencode/issues/15664).
- [#41712: skill en markdown](https://github.com/anomalyco/opencode/issues/41712).
- [#39738: global symlink](https://github.com/anomalyco/opencode/issues/39738).
- [#47819: defaults y allowlist parcial](https://github.com/anomalyco/opencode/issues/47819).
- [#40150: write/edit y read de directorio](https://github.com/anomalyco/opencode/issues/40150).
- [#45876](https://github.com/anomalyco/opencode/issues/45876) y [#24181](https://github.com/anomalyco/opencode/issues/24181): YAML inválido.
- [#36663: OPENCODE_CONFIG y markdown global](https://github.com/anomalyco/opencode/issues/36663).
- [#47616: prompt en frontmatter](https://github.com/anomalyco/opencode/issues/47616).
- [#35512: instructions de agente](https://github.com/anomalyco/opencode/issues/35512).

Código del tag v1.18.25 consultado directamente:
[defaults y merge del agente](https://github.com/anomalyco/opencode/blob/v1.18.25/packages/opencode/src/agent/agent.ts#L267),
[normalización tools/permission y opciones desconocidas](https://github.com/anomalyco/opencode/blob/v1.18.25/packages/core/src/v1/config/agent.ts#L62),
[carga markdown y prompt](https://github.com/anomalyco/opencode/blob/v1.18.25/packages/opencode/src/config/agent.ts#L19),
[write pide edit](https://github.com/anomalyco/opencode/blob/v1.18.25/packages/opencode/src/tool/write.ts#L49),
[read de directorios](https://github.com/anomalyco/opencode/blob/v1.18.25/packages/core/src/tool/read.ts#L67).

Los issues motivan candidatos; la admisión corresponde exclusivamente a la
ejecución sobre 1.18.25. No se extrapola su versión reportada a la imagen.
