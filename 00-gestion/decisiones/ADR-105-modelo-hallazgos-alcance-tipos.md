# ADR-105 — Modelo de hallazgos y alcance de cada tipo (RF-07)

- Estado: aceptado (02/11/2026)
- Fecha: 30/10/2026
- Capítulos afectados: `src/` (núcleo `hallazgos/`, adaptador de OpenCode); README; Cap. VI (cuando se redacte)
- Origen: fichas T3-05 y T3-06 de la iteración 3, preparadas por el ingeniero con el mandato del autor del 30/10/2026

### Contexto

- RF-07 (validado) enumera seis tipos de hallazgo con localización y explicación de su causa, idéntica ante entradas idénticas (CA-2), y cero falsos positivos sobre controles verificados (CA-1). ADR-058 (M-2) fija que un defecto de la configuración es un hallazgo y ubica los detectores genéricos en el núcleo y los propios en el adaptador.
- El glosario define «referencia no resuelta» como una declaración que nombra un elemento que no figura en la resolución, **o un archivo inexistente**; D-61 fija que se detecta por nombre, sin los vínculos de RF-13.
- En OpenCode 1.18.25, un `{file:…}` inexistente y un JSON inválido en un archivo o en `OPENCODE_CONFIG_CONTENT` hacen terminar la carga con error; un `OPENCODE_PERMISSION` inválido se descarta con código 0 (contrastado con el binario el 30/10/2026). Un comando Markdown con *frontmatter* YAML roto se carga entero como plantilla, también con código 0.

### Alternativas evaluadas

- **H-A:** Hallazgo como texto ya explicado (mensaje libre por detector).
- **H-B:** Hallazgo como dato puro (`tipo`, `causa`, `entrada`, `posicion`, `clave`, `parametros`), con la explicación armada por una plantilla del adaptador por causa.

Para el alcance:

- **A-1:** Detectar también el *frontmatter* roto de los Markdown como «descartada sin error visible».
- **A-2:** No detectarlo y declararlo como limitación.

Para las referencias por nombre:

- **R-1:** Toda clave cuyo valor pueda ser un nombre (incluidos patrones de `permission.task`).
- **R-2:** Solo las claves que nombran un agente con un valor exacto: `default_agent` y `command.<n>.agent`.

### Análisis (trade-offs)

- **H-A** no garantiza CA-2 (la identidad del texto depende de cada detector) ni separa los datos de su presentación para la CLI y la web (CA-3, CA-4). **H-B** hace la explicación una función pura de los datos, los parámetros son verificables (solo nombres, rutas y claves: RNF-04) y la misma estructura sirve a los seis tipos.
- **A-1** exige reproducir el analizador YAML de OpenCode (dependencia nueva o una aproximación); un criterio distinto produce falsos positivos, que CA-1 no admite. **A-2** pierde un caso que el entorno de aceptación no exige (CA-1 nombra `OPENCODE_PERMISSION`).
- **R-1** trata como referencia un patrón comodín, que no nombra un elemento (un patrón sin coincidencias no es un defecto). **R-2** cubre las claves que OpenCode resuelve contra el conjunto de agentes.

### Recomendación y fundamento

**H-B, A-2 y R-2**, con estas reglas:

1. Entrada ilegible: toda vía con error de sintaxis, o con un `{file:…}` inexistente, que hace fallar a OpenCode; se informan todas. El glosario define la sustitución de archivo inexistente en dos filas («Entrada ilegible», que también la nombra RE-01, y «Referencia no resuelta», «o un archivo inexistente»); se adopta la primera, más específica, y la precisión de la segunda (archivos referenciados que no detienen la carga, hoy fuera del alcance) va al registro acumulado de validación con la referente.
2. Entrada descartada sin error visible: `OPENCODE_PERMISSION` inválida.
3. Sustitución sin valor: `{env:X}` con `X` ausente o vacía en cualquier declaración leída de una entrada legible (incluidas las desplazadas y las excluidas); un token en un comentario no es hallazgo. Como RIGE no lee `auth.json`, la respuesta declara que una entrada `wellknown` puede definir la variable para OpenCode.
4. Referencia no resuelta: `default_agent` o `command.<n>.agent` con un nombre no vacío, no sustituido, que no está en la resolución o está deshabilitado, con una causa y un efecto propios de cada clave. Un `default_agent` que nombra un subagente o un agente oculto también hace fallar a OpenCode, pero el agente figura en la resolución: no es una referencia no resuelta y queda como limitación.
5. Si una entrada hace fallar la carga, no hay resolución: los detectores que la necesitan no corren y la respuesta se declara incompleta (`hallazgos-parciales`).
6. Orden determinista por precedencia de la entrada, posición, tipo y clave.
7. Los hallazgos se calculan solo en vivo (leen las entradas actuales) y no se guardan; no se ofrecen sobre una resolución guardada.
8. «Elemento sin uso» (T3-06) aplica RE-03 al pie de la letra, por nombre: un subagente declarado y activo está sin uso si ninguna declaración de un agente ni de un comando lo nombra (`command.<n>.agent`, `default_agent`, `@nombre` en una plantilla o un prompt, o una clave de `permission.task` igual al nombre, con cualquier efecto). Se descartó un criterio de «inaccesible»: OpenCode 1.18.25 deja mencionar con `@` un subagente aunque `task` lo deniegue (`session/prompt.ts:1220-1231`, `tool/task.ts:119`), así que casi nunca sería cierto. La explicación no afirma inaccesibilidad. Si hay agentes o comandos en Markdown (contenido no observado), no se evalúa.
9. «Regla de permiso sin efecto» (T3-06): solo reglas declaradas e incorporadas; «abarca» se decide con una inclusión de patrones conservadora (si afirma, es cierta), comprobada en forma exhaustiva acotada contra `Wildcard.match`; una regla se compara solo con las posteriores de su mismo bloque (raíz con raíz, agente con agente), lo que vale para toda cadena; la causa de ruta absoluta se limita a `read` y `edit` con sujeto literal y a rutas contenidas en la base efectiva del contexto. Prioriza los cero falsos positivos de CA-1 sobre la totalidad de las inclusiones posibles; el README da un ejemplo de inclusión no detectada.

**Condición que la invalidaría:** que el binario muestre que OpenCode ignora sin efecto un `default_agent` o un `command.<n>.agent` inexistente (no sería un defecto observable), o que la referente pida detectar el *frontmatter* roto; en ese caso se revisa A-2 con una dependencia aceptada por ADR.

### Decisión del autor

Aceptado por el autor el 02/11/2026.

### Consecuencias

- `nucleo/hallazgos/` con el modelo, los detectores genéricos y `explicarHallazgo`; el adaptador aporta `referencias` y `plantillasHallazgo`.
- README: limitación del *frontmatter* de los Markdown y del alcance de las referencias por nombre.
- T3-06 suma «regla sin efecto» (RE-02) y «elemento sin uso» (RE-03) con el mismo modelo.

### Evidencia

- `03-requisitos/libro/catalogo/RF-07.md` (CA-1, CA-2); `glosario.md`; `reglas.md` (RE-01 a RE-03); Anexo III, D-61.
- Experimentos con el binario 1.18.25 del 30/10/2026 (registrados en el traspaso de la iteración 3 y en las referencias `v3-entradas-ilegible` y `v3-permiso-invalido`).
