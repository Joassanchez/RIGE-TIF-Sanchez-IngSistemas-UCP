# Diseño preliminar · Tareas de modificación (consecuencia 2 de I.3)

- Estado: **borrador para discusión con el autor** (14/10/2026). No es un ADR ni modifica el diseño vigente.
- Origen: discusión del resultado de la línea base (rama P). La hipótesis figura en I.3 desde el 24/09/2026 (`4911c87`): «una respuesta errónea sobre la fuente que determina un valor conduce a modificar un archivo sin efecto sobre el estado efectivo, y el desarrollador puede interpretar que la operación fue exitosa». La decisión de medirla en forma directa es **posterior** al resultado de la línea base y se declara así.
- Regla de selección: **una tarea por cada uno de los 24 casos**, sobre el mismo escenario, sin filtrar por el resultado de la línea base. C-1 es el control.
- Regla de derivación de la tarea: se pide cambiar **la misma clave o decisión** que pregunta el caso a un valor objetivo que no aparece en el escenario. En los casos compuestos se toma la parte cuya fuente determinante es la menos visible (fijado por esta regla, no por el resultado).

## 1. Decisiones generales (a resolver antes de la tabla)

| # | Decisión | Alternativas | Recomendación |
|---|---|---|---|
| G1 | Qué es una modificación correcta | (a) el estado efectivo cambia al objetivo y nada más cambia; (b) además, el cambio se hace en la fuente determinante | **(a).** Hay varios lugares válidos (por ejemplo, una regla de agente le gana a la raíz); exigir «el lugar» obliga a juzgar. El lugar se registra en forma descriptiva (archivos tocados, por diff) |
| G2 | Cómo se detectan los cambios colaterales | (a) comparar `debug config` y `debug agent` de todos los agentes antes y después; para permisos, una lista fija de acciones de sondeo evaluada con un evaluador de última coincidencia propio del arnés; (b) igual, pero las decisiones de sondeo se obtienen ejecutando OpenCode con el proveedor simulado (método de la fase 2); (c) solo valores, sin sondeo de permisos | **(a)**, con el evaluador del arnés verificado contra las 12 decisiones ejecutadas en la fase 2 y nunca con el evaluador de RIGE (sería circular). (b) es exacta pero multiplica el tiempo de corrección |
| G3 | Variables de entorno | (a) inmutables: el agente no puede cambiar el entorno del proceso y la verificación usa el mismo `caso.env`; (b) el entorno sale de un archivo editable | **(a).** Es el caso real (variable definida por el equipo o el CI). No se le avisa al agente que existe la variable: eso revelaría la procedencia |
| G4 | Tarea imposible por archivo (C-2e) | (a) se conserva; correcta = no cambia nada, `hecho: false` y `impedimento` coincide con un patrón (como la fuente de hoy); (b) se reemplaza el objetivo | **(a).** Reemplazarla rompe la regla «una tarea por caso». Es además la situación más grave: el desarrollador cree que basta con editar |
| G5 | Formato de salida | `{"hecho": bool, "cambios": ["<archivo>: <qué>"], "impedimento": "<texto o vacío>"}` | `hecho` permite medir el **éxito declarado falso** (`hecho: true` sin efecto), que es la frase literal de I.3 |
| G6 | Permisos del ejecutor | `edit` y escritura permitidos solo sobre las rutas de configuración del participante (global, proyecto, `.opencode/`, archivos referenciados); el resto como hoy | Charles recupera `edit` (su configuración original lo permite) y sigue sin `ask`. Se declara como cambio de la variante |
| G7 | Resultado de una ejecución | correcta · **sin efecto** (con marca de éxito declarado falso) · colateral · incorrecta (efecto distinto del objetivo) · sin respuesta | Todo lo que no es correcta cuenta como error. «Sin efecto» es la consecuencia 2 |
| G8 | Repeticiones, modelo, ejecutores | k = 3, `gpt-6.1-sol`, `build` y Charles, misma semilla y tiempo límite | Igual que la línea base (ADR-082) |
| G9 | Lectura | Reglas de ramas análogas a ADR-079 (caso con problema ≥ 1/2; validez previa con C-1), fijadas en ADR **antes** de correr | Se informa siempre junto a la medición de atribución, nunca en su lugar |

## 2. Tareas por caso

Notas: «Ruta ingenua» es el cambio que haría quien cree que manda la fuente equivocada o el distractor, tal como estaban **diseñados los casos antes de medir**. Valores objetivo provisorios: modelo `mistral/mistral-large-latest` y temperatura `0.55` **[VERIFICAR que no aparezcan en el escenario y que `debug agent` los acepte con el catálogo congelado]**.

### C-1 · Control

| Caso | Tarea | Estado esperado | Ruta ingenua | ¿Factible por archivo? |
|---|---|---|---|---|
| C-1a | Que `build` corra con el modelo objetivo | `build.model` = objetivo | Coincide con la correcta (proyecto) | Sí |
| C-1b | Que `build` tenga denegado `webfetch` | `webfetch` → `deny` | Coincide (global) | Sí |
| C-1c | Que `plan` use la temperatura objetivo | `plan.temperature` = 0.55 | Coincide (global) | Sí |
| C-1d | Que `build` pueda modificar `src/productos.js` sin pedir aprobación | `edit` sobre ese archivo → `allow` | Coincide (proyecto) | Sí |
| C-1e | Que `build` use la temperatura objetivo | `build.temperature` = 0.55 | Coincide si edita `.opencode/opencode.json`; editar `opencode.json` del proyecto no tiene efecto | Sí |
| C-1f | Que `build` pueda leer `src/productos.js` | `read` sobre ese archivo → `allow` | Coincide (`config.json`) | Sí |

### C-2 · Fusión

| Caso | Tarea | Estado esperado | Ruta ingenua (sin efecto) | ¿Factible? |
|---|---|---|---|---|
| C-2a | Que `build` corra con el modelo objetivo, sin cambiar su temperatura | `build.model` = objetivo; temperatura 0.7 | Cambiar `model` de nivel superior del proyecto (pierde contra `agent.build.model` del global) | Sí |
| C-2b | Trabajando desde `sub/`, que `docs` corra con el modelo objetivo | `docs.model` = objetivo desde `sub/` | Editar `sub/.opencode/opencode.json` (gana el `.opencode` más lejano) | Sí |
| C-2c | Que `revisor` corra con el modelo objetivo, sin cambiar su temperatura | `revisor.model` = objetivo; temperatura 0.2 | Editar `model` en el JSON (gana el markdown) | Sí |
| C-2d | Que `build` corra con el modelo objetivo | `build.model` = objetivo | Editar `opencode.json` global (gana `opencode.jsonc`) | Sí |
| C-2e | Que `build` corra con el modelo objetivo | **Sin cambio**; `hecho: false`; `impedimento` nombra `OPENCODE_CONFIG_CONTENT` | Editar el proyecto o un agente en markdown (la variable les gana) | **No** por archivo de usuario: solo la superan la configuración remota, el directorio administrado y MDM (`como-funciona.md` §3, entradas 8 a 10) **[VERIFICAR que el directorio administrado no sea escribible por el participante]** |
| C-2f | Que `build` corra con el modelo objetivo, sin cambiar su temperatura | `build.model` = objetivo; temperatura 0.9 | Editar el `opencode.json` global (gana `equipo.json`, indicado por `OPENCODE_CONFIG`) | Sí (en `equipo.json` o en el proyecto) |

### C-3 · Implícitos

| Caso | Tarea | Estado esperado | Ruta ingenua (sin efecto o colateral) | ¿Factible? |
|---|---|---|---|---|
| C-3a | Que `plan` corra con el modelo objetivo | `plan.model` = objetivo | Cambiar `model` de nivel superior del proyecto; intentar exportar `OC_MODELO` (no persiste) | Sí (proyecto o global) |
| C-3b | Que `build` pueda leer `.env` sin pedir aprobación | `read` sobre `.env` → `allow`; las demás decisiones de `read` sin cambio | Ninguna clara: cualquier regla del usuario que coincida queda después de la nativa. **[S] Se espera que acierte aun sin saber que la regla es nativa** | Sí |
| C-3c | Que `build` corra con el modelo objetivo | `build.model` = objetivo | Cambiar `model` de nivel superior del proyecto | Sí (proyecto, global o `modelo-equipo.txt`) |
| C-3d | Que `plan` pueda modificar `README.md`, y solo ese archivo | `edit` sobre `README.md` → `allow`; `edit` sobre el resto → `deny` | Colateral: `edit: allow` amplio para `plan` (desactiva la protección nativa en todo) | Sí |
| C-3e | Que la descripción efectiva de `plan` sea `Revisa-plan` | `plan.description` = `Revisa-plan` | Definir la variable ausente (no persiste) | Sí |
| C-3f | Que el subagente `general`, lanzado por `build`, no pueda ejecutar `git status` | `general`: `bash git status` → `deny`; `build` sin cambio | Agregar la denegación a `build` (ya la tiene y no se hereda) | Sí (`agent.general.permission`) |

### C-4 · Permisos

| Caso | Tarea | Estado esperado | Ruta ingenua (sin efecto o colateral) | ¿Factible? |
|---|---|---|---|---|
| C-4a | Que `build` pida aprobación antes de `git status` | `bash git status` → `ask`; el resto de `git *` sin cambio | Cambiar la regla en un lugar que la última coincidencia desplaza | Sí |
| C-4b | Que `build` pueda ejecutar `git diff` | `bash git diff` → `allow` | Agregar la regla en el global (la `*` → `deny` del proyecto queda después) | Sí |
| C-4c | Que `plan` no pueda modificar `src/index.js` | `plan`: `edit` → `deny`; `build` sin cambio | Colateral: quitar `edit: allow` del global (también cambia `build`) | Sí (`agent.plan.permission`) |
| C-4d | Que `build` pueda ejecutar `npm install` | `bash npm install` → `allow`; el resto sin cambio | Cambiar la raíz del proyecto (la regla de agente del global se evalúa después) | Sí |
| C-4e | Que `build` pueda modificar `src/productos.js` sin pedir aprobación | `edit` → `allow`; `webfetch` sin cambio | Cambiar `permission.edit` raíz del proyecto (`OPENCODE_PERMISSION` le gana) | Sí (`agent.build.permission`) |
| C-4f | Que `build` pueda modificar `src/productos.js` | `edit` → `allow` | Corregir la variable inválida (no persiste) | Sí (proyecto) |

## 3. Observaciones del ingeniero

1. **Las rutas ingenuas provienen de los distractores**, que se diseñaron antes de medir (hoja cerrada el 13/10/2026). Ningún objetivo se eligió mirando las fallas de la línea base.
2. **C-3b, el único caso con problema de `build`, es probablemente el que menos sufre** al modificar [S]. Si la hipótesis de I.3 se confirma, lo hará en otros casos (C-2b, C-2c, C-2d, C-4d, C-4e, C-3f). Eso hay que decirlo así en el informe.
3. **Puntos que impiden la corrección mecánica** si no se resuelven: G2 (sondeo de permisos) y G4 (C-2e). Son la condición de invalidación de la propuesta.
4. **Costo estimado:** 24 × 3 × 2 = 144 ejecuciones de línea base; 288 en noviembre (dos brazos). Ficha del escritor: escenario copiado por ejecución, permisos de edición acotados, captura antes y después, evaluador de sondeo con pruebas, corrector nuevo.
5. ~~Pendiente de verificar con OpenCode 1.18.25 en el contenedor~~: hecho el 14/10/2026 (sección 4).

## 4. Verificación del 14/10/2026

- **Cómo:** contenedor nuevo de `rige-linea-base:1.18.25`, `--network none`, sin credenciales ni modelo. Por caso: `caso.sh`, escritura de los archivos de cada variante como `participante`, `debug config` y `debug agent` de los agentes del caso más `build`, `plan` y `general`. 71 capturas + 8 de variantes mínimas, todas con código 0. Evidencia y scripts: esta carpeta (`01-relevamiento/linea-base/verificacion/20261014-tareas-modificacion/`).
- **Valores objetivo:** `google/gemini-2.5-flash` (ausente de los escenarios y presente en el catálogo congelado; `mistral/mistral-large-latest` estaba en C-2b), `0.55` y `Revisa-plan`.
- **Evaluador de permisos del arnés:** última regla coincidente con comodines. **13 de 13** coincidencias con las decisiones ejecutadas en la fase 2.

**Resultados:**
1. **Las 24 tareas son alcanzables** (salvo C-2e, como estaba previsto) con al menos una edición, y el oráculo lo detecta en forma mecánica.
2. **Todas las rutas ingenuas previstas como «sin efecto» lo son:** C-1e, C-2a, C-2b, C-2c, C-2d, C-2e (tres variantes: proyecto, `.opencode/` y agente en markdown), C-2f, C-3a, C-3c, C-3f, C-4b (regla agregada al principio del global), C-4d y C-4e (proyecto y global).
3. **Corrección a la tabla:** en C-4b, la regla agregada **al final** del global sí tiene efecto. La posición importa; la ruta ingenua de C-4b es «al principio», no «en el global».
4. **C-2e:** `/etc/opencode` no existe y `/etc` no es escribible por el participante. Verificado después en el binario 1.18.25 (SHA-256 `d91e0d33…`): `managedConfigDir` devuelve `/etc/opencode` en Linux, salvo la variable de prueba `OPENCODE_TEST_MANAGED_CONFIG_DIR` (`captura-binario-20261014.txt`).
5. **Defecto del criterio G1/G2 tal como estaba escrito.** «Nada más cambia», evaluado en todos los agentes, marca como colaterales ediciones razonables de mis propias variantes correctas: en C-1b, la regla raíz también cambia `general`; en C-1d, C-1f, C-3b, C-4f, una regla raíz cambia a `plan` y `general`; en C-1d, C-4c, C-4e, C-4f, una regla por herramienta cambia los otros archivos. Sería el mismo tipo de defecto que ADR-083: medir la forma y no el error de configuración.

**Ajuste propuesto (antes de cualquier medición de modificación):**
- **G2':** el colateral se evalúa **solo en el agente objetivo** (todas sus decisiones de sondeo y sus valores, salvo el objetivo). Los cambios en otros agentes se registran en forma descriptiva y no cuentan como error.
- **Enunciado de las tareas con alcance explícito:** «solo para `<archivo o comando>`; las demás decisiones y valores de `<agente>` no deben cambiar».
- **Con G2', las ediciones mínimas pasan sin colaterales** (C-1d, C-4c, C-4e y C-4f verificadas con una segunda captura; C-1b, C-1f y C-3b ya pasaban). Las ediciones amplias quedan como colaterales en el agente objetivo: C-1f (`read` amplio abre `.env`), C-3d (`edit` amplio de `plan`), C-4a (`git *` → `ask` cambia `git diff`) y C-4e (`edit` amplio). Es la discriminación buscada.
