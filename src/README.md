# RIGE · Prototipo v1

> Archivo de lectura exigido por la Guía de comprobación del prototipo v1 (`catedra/AE2-guia-comprobacion-v1.md`). La cátedra lo sigue al pie de la letra, sin suplir pasos.

## 1. Identificación

- **Proyecto:** RIGE — Proyecto Integrador Final 2026
- **Equipo:** Joaquín Sebastián Sánchez (autoría individual)
- **Comisión:** A · Sede Posadas
- **Actividad:** AE2 · etiqueta `v1` (esqueleto arquitectónico ejecutable)

## 2. Qué hace este prototipo

T2-13 agrega los valores implícitos de los agentes con origen
`implicito` y regla `valor-implicito-del-agente` (RF-06 CA-1, RD-04).
Su rastro tiene `via` y `referencia` en `null`; una declaración posterior
conserva el valor implícito en `desplazadas`. Los prompts nativos de explore,
compaction, title y summary se presentan como `{ tipo: "texto-nativo", sha256 }`.
Los resúmenes del tag figuran en `paquetes/opencode/vendor/PROCEDENCIA.md`.
Solo se informan las propiedades presentes en el tag; por ejemplo, build
no tiene `hidden` implícito. Los agentes declarados nuevos reciben
`mode: "all"` y `native: false`.

Para comprobar T2-13, con `RIGE_ALMACEN` temporal (sección 6):

```powershell
bun test pruebas/aceptacion/RF-06.test.ts paquetes/opencode
bun test pruebas/arquitectura/referencias-nativas.test.ts
bun test pruebas/aceptacion/fusion-permisos.test.ts pruebas/aceptacion/recorrido-v1.test.ts
bun test pruebas/aceptacion/RF-01.test.ts pruebas/aceptacion/RF-06.test.ts paquetes/opencode
bun run referencias --raiz (npm.cmd root -g) --regenerar
bun run referencias --raiz (npm.cmd root -g)
bun test
bun run verificar
```

La regeneración amplía `REFERENCIA.json` con `valoresAgentes`: escalares
de todos los agentes consultados y resúmenes SHA-256 de los prompts nativos.
La comparación posterior vuelve a capturar esos valores con el binario oficial.
En Bash se sustituye `(npm.cmd root -g)` por `"$(npm root -g)"`.

T2-11b consolida la consulta de permisos: `consultarPermiso(dependencias,
{ proyecto, agente, sujeto, objetivo, lanzadoPor?, explicar? })`, o el mismo
objeto con `herramienta` en lugar de `sujeto`. El adaptador prepara un contexto
por consulta y aporta `prepararConsulta` y `listarAgentes` obligatorios. El
nucleo es el unico responsable de resolver los casos sin decision.
Los metadatos `mode`, `hidden` y `disable` invalidos producen
`configuracion-invalida` con clave, archivo y linea en las tres consultas.
Toda respuesta de permiso declara `numeracion-sin-directorios-externos`;
`references` o `reference` declarados agregan `references-no-incorporado`.

Para comprobar T2-11b, con `RIGE_ALMACEN` temporal (seccion 6):

```powershell
bun test pruebas/aceptacion/T2-11b.test.ts paquetes/opencode/contexto.test.ts paquetes/opencode/agentes.test.ts paquetes/nucleo/permisos/decidir.test.ts paquetes/nucleo/resolucion/contrato.test.ts paquetes/rige/aplicacion/casos-uso/consultar-permiso.test.ts
bun test paquetes/opencode/cadena.test.ts paquetes/opencode/objetivo.test.ts paquetes/opencode/worktree.test.ts paquetes/opencode/secuenciador.test.ts paquetes/nucleo/resolucion/resolver.test.ts pruebas/utilidades/escenario.test.ts pruebas/aceptacion/RF-02.test.ts
bun run referencias --raiz (npm.cmd root -g) --regenerar --escenario v2-worktree-gitfile-roto --escenario v2-worktree-dir-invalido-anidado
bun run referencias --raiz (npm.cmd root -g)
bun test
bun run verificar
```

Los dos escenarios nuevos crean en el temporal un repositorio exterior y un
`.git` anidado invalido. El gitfile roto detiene la busqueda y deja worktree
`/`; el directorio incompleto permite encontrar el repositorio exterior.
Las referencias capturan las cadenas completas de `plan` del binario oficial
verificado. El arnes exige que `git rev-parse` falle ante el gitfile roto, y
que devuelva la raiz exterior ante el directorio invalido. Ambos declaran
`OPENCODE_DISABLE_EXTERNAL_SKILLS=true` para aislar la busqueda fuera de VCS.

El prototipo implementa el caso de uso vertical «consultar el valor efectivo de una clave de un agente de OpenCode 1.18.25, con su procedencia»: la interfaz web recibe un proyecto, un agente y una clave; la lógica aplica la regla de negocio validada RD-01 (prevalece la declaración de la última entrada que declara la clave), la resolución se guarda en el almacén SQLite propio y la página se arma con lo que se lee del almacén, con el valor, la declaración que lo determina y las declaraciones desplazadas. El recorrido prueba la decisión arquitectónica de separar un núcleo genérico, que ejecuta la combinación, de un adaptador por herramienta que declara el orden de las entradas y su estrategia (RNF-03; ADR-058 y ADR-060): el núcleo no depende del adaptador y un adaptador ficticio se resuelve sin modificarlo.

## 3. Requisitos previos

Se requiere Git y uno de estos sistemas: Ubuntu (plataforma de referencia) o Windows 11.

Se instala Bun **1.3.14** exacto:

En Ubuntu, el instalador de Bun requiere `curl` y `unzip`, que una instalación limpia no incluye. Se instalan antes de Bun:

```bash
sudo apt-get update
sudo apt-get install -y curl unzip
```

**Ubuntu (Bash):**

```bash
curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.14"
```

**Windows 11 (PowerShell):**

```powershell
iex "& {$(irm https://bun.sh/install.ps1)} -Version 1.3.14"
```

Se abre una terminal nueva para disponer de Bun en `PATH` y se comprueba la versión:

```bash
bun --version
```

La salida esperada es `1.3.14`. TypeScript **7.0.2** y `@types/bun` **1.3.14** se instalan desde el lock en el paso siguiente, no a mano. SQLite **3.53.0**, integrado en Bun 1.3.14; no se requiere servidor externo ni conexiones de red durante la ejecución de RIGE.

Se comprueba la versión del motor:

```bash
bun -e "import { Database } from 'bun:sqlite'; console.log(new Database(':memory:').query('select sqlite_version() as v').get().v)"
```

La salida esperada es `3.53.0`.

## 4. Instalación

Se clona el repositorio, se entra en `src/` y se instalan las dependencias versionadas. Los comandos son iguales en Bash y PowerShell:

```bash
git clone https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP.git
cd RIGE-TIF-Sanchez-IngSistemas-UCP/src
bun install --frozen-lockfile
```

La instalación termina con código 0. Todos los comandos siguientes se ejecutan desde `src/`.

## 5. Configuración

La copia de `rige.env.example` a `rige.env` es opcional. Sin `rige.env` se usan los valores por defecto, salvo las variables definidas en el entorno.

**Ubuntu (Bash):**

```bash
cp rige.env.example rige.env
```

**Windows 11 (PowerShell):**

```powershell
Copy-Item rige.env.example rige.env
```

La copia termina sin errores. Se edita `rige.env` si se necesitan valores locales:

| Variable | Significado | Valor por defecto |
|---|---|---|
| `RIGE_PUERTO` | Entero de 1 a 65535; puerto del servidor local | `4747` |
| `RIGE_ALMACEN` | **Directorio** del almacén, no archivo de la base; vacío selecciona la ubicación por defecto | Windows: `%LOCALAPPDATA%\rige`. Ubuntu: `$XDG_DATA_HOME/rige` si está definido, o `~/.local/share/rige` |

La prelación es: variable de entorno → `rige.env` → valor por defecto. El archivo solo admite esas dos claves; cualquier otra produce `configuracion-invalida`. No es un archivo `.env`: RIGE lo lee explícitamente y Bun no lo carga solo.

## 6. Ejecución y verificación

**1. Crear o verificar el esquema:**

```bash
bun run esquema
```

La salida contiene una línea JSON con `esquema: 2`, `versionRige: "0.1.0"`, `almacen.ruta` (ruta del archivo de la base) y `almacen.versionEsquema: 2`. El código de salida es 0. Repetir el comando no cambia el esquema ni los datos. El comando aplica `001_inicial.sql` y `002_formato2.sql` sobre un almacén vacío. Un almacén de versión 1 se rechaza sin modificarlo: se debe mover o borrar explícitamente su directorio antes de ejecutar `bun run esquema`. Las resoluciones nuevas declaran `formato: 2`; un documento de otro formato produce `almacen-sin-esquema`.

**Consultar valores por CLI (RF-03), sin preparar el almacén:**

```bash
bun --silent run rige -- valores --proyecto pruebas/escenarios/v1-precedencia/proyecto --agente build --clave temperature
```

La forma general es `bun run rige -- valores --proyecto <ruta> --agente <nombre> [--clave <ruta>]`. Omitir `--clave` consulta todas las claves del agente. La clave admite segmentos separados por puntos o un puntero JSON (por ejemplo, `/options/a.b` conserva el punto dentro del segmento). La salida es una `RespuestaValores` con `esquema: 2`, proyecto, herramienta y versión, resumen y entradas leídas, agente, `ruta` como arreglo o `null`, valores con sus rastros, reglas, claves no resueltas y `motivo`. No incluye id, instante ni historia: dos consultas sobre las mismas entradas producen el mismo JSON byte a byte. Este subcomando resuelve en memoria y no crea ni modifica el almacén.

Una clave ausente en un agente con declaraciones devuelve código 0, `valores: []` y `motivo: "clave-inexistente"`. Un proyecto o agente inexistente produce código 1 por el canal de error; omitir `--agente` o `--proyecto` produce código 2. La web presenta la misma `RespuestaValores`, acompañada de un `SobreAlmacen` con id, instante e historia.

**Consultar permisos y listar agentes por CLI (T2-11), sin preparar el almacén:**

```bash
bun run rige -- permiso --proyecto pruebas/escenarios/v2-cadena/proyecto --agente build --herramienta bash --objetivo "ls" --explicar
bun run rige -- permiso --proyecto pruebas/escenarios/v2-cadena/proyecto --agente revisor --sujeto bash --objetivo "ls" --lanzado-por build
bun run rige -- permiso --proyecto pruebas/escenarios/v2-cadena/proyecto --agente build --herramienta bash --objetivo "ls && rm x"
bun run rige -- agentes --proyecto pruebas/escenarios/v2-agentes/proyecto
```

`permiso` requiere proyecto, agente, objetivo y exactamente una de las opciones
`--herramienta` o `--sujeto`. `--lanzado-por` es opcional. `--explicar` incluye
la explicación por plantillas de la decisión; sin ella `explicacion` es `null`.
Un comando compuesto conserva el código 0, con `decision: null` y su motivo.
Los errores se escriben solo por stderr: uso o configuración, código 1;
argumentos inválidos, 2; falla interna, 70 (`--depurar` agrega el stack).
`valores --explicar` es un argumento inválido: la explicación corresponde a
decisiones y hallazgos (ADR-051).

`agentes` lista también los ocultos y admite `--explicar`, sin agregar prosa
porque no toma decisiones. Informa nombre, origen, modo y condición de oculto.
Ordena primero los nativos y luego cada grupo por nombre con colación inglesa
explícita (`Intl.Collator("en")`) y desempate por unidades UTF-16. Para ASCII
es equivalente al `localeCompare` del tag, independientemente del locale del
proceso. `disable: true` elimina incluso un agente nativo y deja su declaración
en `eliminados`. La lista vacía es código 0. Si hay agentes Markdown que RIGE
no observa, `incompleta: true` y `motivos` explicitan la limitación.

Los contratos de las tres respuestas y de los errores están en
`esquemas/salida/` (JSON Schema 2020-12, `esquema: 2`). Son la fuente de verdad
de los tipos de respuesta; se regeneran con `bun herramientas/tipos-salida.ts`.
Para comprobar T2-11 se ejecuta
`bun test pruebas/aceptacion/RF-03.test.ts pruebas/aceptacion/RF-16.test.ts pruebas/aceptacion/RF-08.test.ts`.
Las pruebas de sensibilidad del validador y la generación se comprueban con
`bun test pruebas/utilidades/validar-esquema.test.ts herramientas/tipos-salida.test.ts`.

Para regenerar solo las referencias de agentes, con el binario oficial instalado:

```powershell
$raizNpm = npm.cmd root -g
bun run referencias --raiz $raizNpm --regenerar --escenario v2-cadena --escenario v2-agentes
```

En Bash, el equivalente es
`bun run referencias --raiz "$(npm root -g)" --regenerar --escenario v2-cadena --escenario v2-agentes`.
Sin `--regenerar`, el mismo comando compara sin escribir; sin `--escenario`,
comprueba todas las referencias. En `v2-cadena` y `v2-agentes` también captura
`opencode agent list`, conserva nombres y modos y verifica su coincidencia.

**2. Arrancar el servidor:**

```bash
bun run servir
```

Con el puerto por defecto, se escribe `{"esquema":2,"direccion":"http://127.0.0.1:4747"}` y el proceso queda escuchando. En el navegador, `http://127.0.0.1:4747` muestra «RIGE 0.1.0», la ruta del almacén y la versión de su esquema. Si se cambia `RIGE_PUERTO`, se usa el puerto configurado en la dirección.

**3. Recorrido vertical (caso de uso del Instrumento 35):**

Con el servidor en marcha:

1. Abrir `http://127.0.0.1:4747` en el navegador (o la dirección con el puerto configurado).
2. Completar el formulario: **Proyecto** `pruebas/escenarios/v1-precedencia/proyecto` (ruta relativa a `src/`, el directorio desde el que se ejecutó `bun run servir`), **Agente** `build`, **Clave** `temperature`, y pulsar «Resolver y guardar».
3. **Resultado esperado, en un almacén recién creado:** la dirección pasa a `http://127.0.0.1:4747/resoluciones/1?agente=build&clave=temperature`; la tabla «Valores efectivos» muestra `temperature` con valor `0.3`, declarado en `…/v1-precedencia/proyecto/opencode.jsonc:6:7 (proyecto)`, y dos declaraciones desplazadas, en orden: `0.1` en `…/v1-precedencia/opencode.json:5:7 (proyecto)` y `0.2` en `…/v1-precedencia/proyecto/opencode.json:5:7 (proyecto)`. «Regla aplicada» indica: «OpenCode 1.18.25 aplica las entradas en orden de precedencia; prevalece la declaración de la última entrada que declara la clave (RD-01).» «Entradas leídas» lista los tres archivos con su resumen SHA-256 y las vías remotas con condición `no_observada`; `preferencias-macos` también figura como `no_observada` en Ubuntu y Windows. Las rutas se muestran completas, con `/` como separador. Si ya hay resoluciones guardadas, se usa el número que aparece en la dirección después de resolver.
4. **Persistencia:** detener el servidor con Ctrl+C y volver a ejecutar:

   ```bash
   bun run servir
   ```

   Abrir la misma dirección de la resolución: la página muestra los mismos datos, leídos del almacén, y el texto «Página armada con la resolución leída del almacén de RIGE.» «Resoluciones de este proyecto» lista la resolución 1.
5. **Variante:** volver a la página inicial, completar el mismo proyecto y agente, dejar **Clave** vacía y pulsar «Resolver y guardar»: la tabla «Valores efectivos» muestra `description`, `steps` y `temperature` en una nueva resolución.
6. Los valores coinciden con los de OpenCode 1.18.25 registrados en `pruebas/escenarios/v1-precedencia/REFERENCIA.json`; si el equipo tiene configuración global de OpenCode, RIGE la incorpora y la muestra con su procedencia, de modo que pueden aparecer entradas adicionales. Si esa configuración tiene sustituciones, agentes en Markdown, `mode` legado o claves derivadas, las claves afectadas figuran como «no resueltas en el prototipo v1». `agent.<nombre>.disable: true` elimina el agente desde T2-11. Si lo afectado es la clave o el agente consultado, la página de error lo informa (`clave-no-resuelta`, HTTP 422) y no se crea la resolución. Una sustitución fuera de una cadena o un `mode` que no es objeto detienen el análisis con `contenido-no-soportado`.

Se detiene el servidor con Ctrl+C antes de continuar.

**4. Verificar tipos, construcción y pruebas:**

```bash
bun run verificar
bun test
bun run prueba:lenta
```

`verificar` comprueba los tipos y la construcción y termina con código 0. Todas las pruebas pasan; `bun test` termina con código 0. Durante el desarrollo se ejecutan solo los archivos afectados con `bun test <archivos>`; las reglas de esta tarea se comprueban con `bun test pruebas/aceptacion/RF-03.test.ts paquetes/rige/aplicacion/errores.test.ts paquetes/rige/adaptadores/almacen-sqlite/resoluciones.test.ts`.

Para las ejecuciones del agente, `RIGE_ALMACEN` siempre apunta a un directorio temporal. En Bash se configura con `export RIGE_ALMACEN="$(mktemp -d)"`; en PowerShell, con `$env:RIGE_ALMACEN = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())`. El arnés crea además un entorno aislado para cada subproceso de aceptación.

**5. Comprobar las referencias nativas (opcional, separado de `bun test`):**

Con Node 22 disponible, `npm i -g opencode-ai@1.18.25` instala el binario y `npm root -g` informa la raíz global; se pasa esa ruta como `<dir>`:

```bash
bun run referencias --raiz <dir>
```

El guion verifica la versión y el SHA-256 del binario, ejecuta cada escenario en una copia temporal aislada y solo compara. En Windows, el instalador de `opencode-ai` elige entre dos binarios oficiales según el procesador (`opencode-windows-x64` u `opencode-windows-x64-baseline`); el guion acepta los dos y lo informa en una primera línea `binario: <variante> 1.18.25`. Después imprime una línea por escenario y termina con código 0 si todos coinciden, o 1 ante diferencias o errores; no regenera las referencias.

Si no se ejecuta previamente `bun run esquema`, `servir` termina con `almacen-sin-esquema` y código 1. Si el puerto está ocupado, termina con `puerto-ocupado` y código 1; se cambia `RIGE_PUERTO` por un puerto disponible.

La forma general es `bun run rige -- <subcomando>`. Para invocar directamente la CLI con el subcomando `esquema`:

```bash
bun --silent run rige -- esquema
```

Produce el mismo JSON de estado que `bun run esquema`. Sin `--silent`, `bun run` agrega su propia línea `$ bun …` al canal de error (comprobado el 30/09/2026).

| Código de salida | Situación | Canal de salida | Canal de error |
|---|---|---|---|
| 0 | Respuesta válida | JSON de respuesta | Vacío |
| 1 | Error de uso de la CLI | Vacío | JSON de error con su código: por ejemplo, `almacen-sin-esquema`, `proyecto-inexistente` o `agente-sin-declaraciones` |
| 2 | Argumentos inválidos | Vacío | JSON de error: `argumentos-invalidos` |
| 70 | Falla interna | Vacío | JSON de error: `interno`; `--depurar` agrega el stack, sin logs a disco |

La forma del error es `{"esquema":2,"error":{"codigo":"…","mensaje":"…"}}`. La tabla describe los canales de la CLI; la línea propia de `bun run` se evita con `--silent`.

La web presenta los errores de uso con estado HTTP 400 (`solicitud-invalida`), 404 (`proyecto-inexistente`, `resolucion-inexistente`, `agente-sin-declaraciones`) o 422 (`via-no-soportada`, `contenido-no-soportado`, `entrada-ilegible`, `clave-no-resuelta` y códigos nuevos del adaptador). La ruta `/resolver` guarda el proyecto completo y redirige a la consulta; la existencia del agente y de la clave se evalúa al recuperar esa resolución. Una clave ausente se presenta con éxito y con su motivo.

La etiqueta `v1` corresponde a la versión `0.1.0` de RIGE.

Herramientas de desarrollo de T2-14 (con `RIGE_ALMACEN` temporal):

```bash
bun run cobertura
bun run decisiones --raiz <directorio-global-npm> --cache <directorio-externo>
bun run decisiones --raiz <directorio-global-npm> --cache <directorio-externo> --regenerar
```

`cobertura` valida SHA-256, inventario y citas a pruebas de
`pruebas/escenarios/MANIFIESTO.json` frente a `COBERTURA.json`, e imprime JSON
con cobertura por ítem, escenarios y retiros. «Cubierto» indica vinculación a
comprobaciones existentes; los resultados de ejecución los entrega `bun test`.
RF-07 permanece pendiente de la iteración 3. El corte es `null` hasta que el
ingeniero fije la revisión de `main` del 07/11/2026; resultados de base y
adiciones quedan pendientes, sin conteos inventados.

`decisiones` verifica el SHA-256 y la versión del binario oficial, copia cada
escenario y consulta un proveedor SSE fijo en `127.0.0.1`, en puerto libre.
Solo ejecuta consultas con `nativa: true`. `--cache` es opcional, apunta fuera
del repositorio y conserva el paquete del proveedor entre corridas; sin él
se usa un caché temporal. OpenCode puede instalar ese paquete desde npm: la
corrida real corresponde al ingeniero fuera del sandbox. RIGE no incorpora
esta herramienta al runtime. La configuración auxiliar agrega proveedor y
modelo y conserva las reglas de permiso del escenario.
La inicialización Git aislada admite hasta 30 segundos; si falla, informa
escenario, consulta, estado y el diagnóstico de Git sin guardar referencias.

Sin `--regenerar`, compara sin escribir; con él, guarda `decisionesNativas`
en cada referencia, incluidas todas las evaluaciones, regla ganadora y
procedencia (comando, hash, versión, fecha y plataforma). Después de regenerar
se actualiza el SHA-256 de `REFERENCIA.json` en el manifiesto y se revisa el
diff; las entradas del escenario conservan sus resúmenes. Una referencia de
otra plataforma no se acepta como comparación equivalente. La ausencia de
líneas `evaluated` queda como `herramientaNoOfrecida: true`, sin decisión.
Las aceptaciones RF-02 CA-1/2/3/9 prefieren la evaluación nativa de su consulta;
si aún no hay una evaluación usan las decisiones derivadas conservadas. Las
consultas contextuales de subagentes quedan declaradas con `nativa: false`:
ejecutar `run --agent` sobre el subagente no reproduce el contexto de `task`.
El selector admite esas referencias cuando se obtengan con ese contexto.

Las reglas de modificación y retiro son las de ADR-080: todo cambio posterior
al corte conserva su obligación de prueba y requiere evidencia y autorización
del autor; una falla de RIGE no autoriza un retiro. `retiros` registra todos
los retiros desde la incorporación, incluidos los anteriores al corte.

## 7. Estado del canal de construcción

El archivo `.github/workflows/ci.yml` ejecuta en cada push, en `ubuntu-26.04` y `windows-latest` con Bun 1.3.14, `bun install --frozen-lockfile`, `bun run verificar` y `bun test`. Las pruebas de aceptación ligadas a criterios del catálogo son:

- `pruebas/aceptacion/RF-01.test.ts` (CA-1, CA-2; incluye el escenario `v1-vias`).
- `pruebas/aceptacion/recorrido-v1.test.ts` (RF-01 CA-1 y CA-2 por la web; RF-17 CA-1 a CA-3; RNF-01; RNF-09; V-0 reproduce la ruta relativa del README sin copiar el escenario y se omite si el repositorio no tiene `.git`).
- `pruebas/aceptacion/RNF-03.test.ts` (CA-1 a CA-3).
- `pruebas/aceptacion/RNF-09.test.ts` (CA-1 a CA-3).

El trabajo adicional `referencia-nativa` compara en ambas plataformas las capturas con OpenCode 1.18.25 real para RNF-02 CA-1; las reglas del guion se prueban sin ese binario con `bun test pruebas/arquitectura/referencias-nativas.test.ts`.

El [registro de corridas](https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP/actions/workflows/ci.yml) permite consultar los resultados. La primera corrida exitosa en las dos plataformas, comprobada por el ingeniero en la API de GitHub, es del **30/09/2026, 22:26 (UTC−3)**, commit `11c852e`: [corrida 36801042650](https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP/actions/runs/36801042650).

## 8. Declaración de herramientas auxiliares

| Período | Herramienta y modelo | Función | Artefacto afectado |
|---|---|---|---|
| 29/09/2026–30/09/2026 (T0-01 a T0-09) | OpenCode con gentle-ai 3.7; modelos `opencode-go/mimo-v2.6-pro` y `openai/gpt-6.1-sol` | Escritura del código y de las pruebas por delegación sobre el documento ODD | `src/` hasta el commit `a613de6`; `odd/tasks/inc0-esqueleto.md` |
| Desde el 30/09/2026 (T0-10 en adelante) | Codex (`gpt-6.1-sol`, plan ChatGPT Plus) como escritor, orquestado por Claude Code (`claude-opus-5-5`) | Escritura del código y de las pruebas sobre fichas del ingeniero; revisión por los subagentes `revisor-codigo` (Sonnet 5.5) y `critico-codigo` (Opus 5.5) | `src/` desde el commit `5ca3431`; este README |
| 05/10/2026 (prototipo v1, V1-01 a V1-09) | Codex (`gpt-6.1-sol`) como escritor, orquestado por Claude Code (`claude-opus-5-5`); revisión de conformidad por Codex (`gpt-6-luna`) y crítica por el subagente `critico-codigo` (Opus 5.5); OpenCode 1.18.25 (binario `opencode-windows-x64@1.18.25`) ejecutado una vez por el ingeniero para generar los resultados de referencia | Escritura, revisión y generación de referencias | `src/` desde el commit `1b684d5`; `pruebas/escenarios/*/REFERENCIA.json` |
| 13/10/2026 (V1-13) | Claude Code (`claude-opus-5-5`), por autorización expresa del autor como excepción a ADR-067 | Escritura del cambio y de sus pruebas sobre la ficha V1-13: aceptación de la variante baseline oficial del binario de OpenCode en Windows | `herramientas/referencias-nativas.ts`, `pruebas/arquitectura/referencias-nativas.test.ts`, este README |

El diseño, los requisitos y las decisiones (ADR) son del autor; las herramientas escriben y revisan código bajo esas decisiones.

Uso conforme al Protocolo de Uso Autorizado, en los períodos declarados en la tabla.

### Licencia del evaluador incorporado

RIGE incorpora las funciones puras del evaluador de permisos v1 y Wildcard de
OpenCode 1.18.25, Copyright (c) 2025 opencode, bajo licencia MIT. Se distribuyen
el texto completo en [LICENSE](paquetes/opencode/vendor/LICENSE) y el archivo de
[avisos](paquetes/opencode/vendor/AVISOS.md). La
[procedencia](paquetes/opencode/vendor/PROCEDENCIA.md) registra los origenes,
los cambios de envoltorio y los SHA-256. Esta copia no es el oraculo de las
pruebas de aceptacion.

Para comprobar esta tarea, con `RIGE_ALMACEN` temporal como se indica en §6:
`bun test paquetes/opencode/vendor pruebas/aceptacion/RNF-10.test.ts pruebas/arquitectura/vendor.test.ts`.

T2-05 construye la cadena de permisos del agente con las reglas nativas y
declaradas, sus indices y su procedencia. El eje `external_directory` queda
parcialmente observado: no se buscan directorios de skills ni references.
T2-06 agrega la consulta de decisiones como funcion de aplicacion
`consultarPermiso(dependencias, proyecto, agente, sujeto, objetivo)`, sin CLI ni
web de permisos todavia. Evalua al consultar, sin guardar la decision. La
respuesta presenta las coincidentes con sus indices originales, la
determinante, las desplazadas y la proteccion nativa anulada, si corresponde.
`external_directory` devuelve `decision: null` y motivo
`eje-parcialmente-observado`. Todas las respuestas declaran las aprobaciones
permanentes excluidas y las reglas adicionales de la sesion no interactiva.

T2-07 admite `consultarPermiso(dependencias, proyecto, agente, sujeto, objetivo, lanzadoPor?)`.
Con lanzador, usa la cadena propia del subagente y agrega al final las
denegaciones de `todowrite` y `task` si falta el sujeto exacto. Declara que
las reglas del agente lanzador no se aplican y que las de su sesion quedan
fuera del analisis. Un agente `primary` se evalua igualmente y se declara.
`experimental.primary_tools` declarado produce la advertencia
`primary-tools-no-incorporado`; sus denegaciones no se incorporan.

T2-08 admite como cuarto argumento `{ herramienta: "read" }` (tambien
`edit`, `write`, `apply_patch`, `bash`, `glob`, `grep`, `webfetch`, `task`,
`todowrite` y `skill`). El sujeto en string, o `{ sujeto: "read" }`, conserva
la forma literal anterior. `consulta.forma` distingue ambas formas;
`consulta.objetivoEvaluado` presenta el recurso evaluado. Las herramientas
de archivo resuelven el objetivo contra el proyecto y lo hacen relativo al
worktree; `write`/`apply_patch` evalúan `edit`. Fuera del arbol se responde
sin decision, con `fuera-del-arbol`.

Por autorizacion del ingeniero del 25/10 (ADR-101 propuesto), el adaptador
descubre Git solo mediante lectura: sube hasta un `.git` con HEAD valido,
objects/refs, o resuelve gitdir/commondir. Sin repositorio usa `/`. Sin un
archivo git en PATH agrega `git-no-encontrado`. `GIT_DIR` o `GIT_WORK_TREE`
definidas producen `via-no-soportada`; core.worktree, bare=true o
safe.directory detectados se declaran como `deteccion-git-aproximada`.
RIGE no ejecuta Git. El arnes de pruebas y referencias si lo ejecuta para
preparar y contrastar repositorios aislados.

T2-09 aplica la frontera de RF-08 tanto a `{ herramienta: "bash" }` como
al sujeto `bash`. Un lexer propio respeta comillas y escapes; los comandos
compuestos devuelven `decision: null`, `motivoSinDecision: "comando-compuesto"`
y advertencias con motivos en orden de aparicion, sin repetir. Una comilla
sin cerrar o un escape final produce `no-analizable`. Los simples se evaluan
sin espacios iniciales ni finales y conservan el objetivo original en la consulta.
La CLI de producto se agrega en T2-11; las pruebas usan el arnes aislado.
El adaptador puede preparar consultas por sujeto mediante el puerto opcional
`prepararSujeto`; `ObjetivoPermiso.advertencias` lleva codigos de sus plantillas.

Para comprobar T2-09, con `RIGE_ALMACEN` temporal:

```bash
bun test paquetes/opencode/comando.test.ts pruebas/aceptacion/RF-08.test.ts
```

Para comprobar T2-08, con `RIGE_ALMACEN` temporal:

```bash
bun test pruebas/aceptacion/RF-02-CA-9.test.ts paquetes/opencode
bun test pruebas/utilidades/escenario.test.ts paquetes/rige/aplicacion/casos-uso/consultar-permiso.test.ts herramientas/referencias-nativas/comparar.test.ts pruebas/arquitectura/referencias-nativas.test.ts
```

Las referencias de los tres escenarios `v2-worktree-*` incluyen la cadena
de plan y el resultado real de `opencode debug agent build --tool read
--params '{"filePath":"src/a.js"}'`. El worktree procede de
`SELECT data FROM message` en el SQLite **temporal** de OpenCode, campo
`path.root`. Para repetir la comparacion de cadenas se usa el comando
`bun run referencias --raiz <directorio-global-npm>` documentado abajo.
El arnes respeta el modo Git de cada referencia. En los escenarios sin worktree valido, `OPENCODE_DISABLE_EXTERNAL_SKILLS=true`
evita que la busqueda ascendente de skills salga del temporal. No se usa en
`v2-worktree-valido`; cada exclusion figura en la procedencia.
La regeneracion de cadenas conserva las decisiones y la captura de lectura;
la verificacion de las demas decisiones CA-9 corresponde a T2-14.

Para comprobar T2-07, con `RIGE_ALMACEN` temporal:

```bash
bun test pruebas/aceptacion/RF-02.test.ts paquetes/opencode
```

Para comprobar T2-06, con `RIGE_ALMACEN` temporal:

```bash
bun test paquetes pruebas/aceptacion/RF-02.test.ts pruebas/aceptacion/RF-09.test.ts
```

Durante TDD se pueden seleccionar solo los archivos nuevos:

```bash
bun test paquetes/nucleo/permisos/decidir.test.ts paquetes/opencode/permisos.test.ts paquetes/rige/aplicacion/casos-uso/consultar-permiso.test.ts pruebas/aceptacion/RF-02.test.ts pruebas/aceptacion/RF-09.test.ts
```

El escenario `v2-decision` usa una entrada global aislada. Sus decisiones se
derivan a mano de la cadena capturada por el binario, como documenta
`pruebas/escenarios/v2-decision/DERIVACION.md`; regenerar las referencias no
recalcula ese campo. El arnes consulta el caso de uso en el mismo proceso, con un entorno inyectado
y aislado. La guarda G-1 comprueba la procedencia de los esperados.

Con `RIGE_ALMACEN` en un temporal, las pruebas y el oraculo se ejecutan desde `src/`:

```powershell
$env:RIGE_ALMACEN = Join-Path ([IO.Path]::GetTempPath()) 'rige-pruebas'
bun test paquetes/opencode pruebas/aceptacion/RF-02.test.ts pruebas/aceptacion/RF-06.test.ts
bun test herramientas/referencias-nativas pruebas/arquitectura/referencias-nativas.test.ts
bun run referencias --raiz (npm.cmd root -g) --regenerar
bun run referencias --raiz (npm.cmd root -g)
bun test
bun run verificar
```

En Bash: `bun run referencias --raiz "$(npm root -g)" --regenerar` genera las
capturas; sin `--regenerar` solo compara y nunca escribe referencias. Se exige
el binario oficial 1.18.25 con SHA-256 admitido. Cada `REFERENCIA.json` declara
su directorio, hogar relativo a la copia y `OPENCODE_CONFIG` si corresponde.
Las cadenas conservan el orden del binario; data, tmp y hogar se normalizan a
`<data>`, `<tmp>` y `<hogar>`, con separadores `/`.

La herramienta requiere Git: ejecuta `git init --quiet --initial-branch=main`
en cada copia temporal y `git rev-parse --show-toplevel` desde el directorio
consultado. Un `.git/HEAD` sintetico no basta para el binario y permitia que la
busqueda ascendente de skills alcanzara el hogar real. HOME, USERPROFILE,
APPDATA y LOCALAPPDATA se aislan en todos los escenarios. No se deshabilitan
skills mediante flags en los escenarios con Git validado. Los escenarios
de descubrimiento de T2-08 declaran la excepcion de skills externos indicada
arriba. Una regla normalizada que contenga el HOME real hace
fallar la herramienta antes de guardar la referencia. El diagnostico se
conserva en `procedencia.aislamiento`.

Para comprobar la fusion de subarboles y los permisos con procedencia (T2-04),
con `RIGE_ALMACEN` temporal como se indica en §6:

```bash
bun test paquetes/nucleo paquetes/opencode
bun test paquetes/nucleo/resolucion/fusion.test.ts paquetes/nucleo/resolucion/resolver.test.ts paquetes/nucleo/resolucion/contrato.test.ts paquetes/opencode/fusion.test.ts paquetes/opencode/secuenciador.test.ts pruebas/aceptacion/fusion-permisos.test.ts pruebas/aceptacion/RF-01.test.ts
bun test pruebas/aceptacion/RF-03.test.ts pruebas/aceptacion/recorrido-v1.test.ts
```

`pruebas/escenarios/v2-fusion-permisos/global.json` contiene la entrada global;
la aceptacion la copia al hogar temporal y consulta el caso de uso en memoria,
con ese entorno inyectado.
La resolucion conserva el formato 2 y siempre incluye `eliminadas`, con el rastro
original y la declaracion `eliminacion` que lo retiro. Los indices de fusion se asignan por
preorden final; `eliminadas` usa su propio `ordenEliminacion`. `tools`
marca su ambito de permisos como no resuelto con `tools-legado-no-incorporado`.

T2-10 agrega explicaciones deterministas de decisiones de permiso en el nucleo.
El adaptador aporta las plantillas y el vocabulario; los marcadores desconocidos,
sin valor y las reglas sin plantilla producen una falla visible. El caso de uso
admite `consultarPermiso(dependencias, proyecto, agente, accion, objetivo,
lanzadoPor, { explicar: true })`; sin esa opcion, `explicacion` es `null`.
La explicacion identifica la determinante, su posicion en la cadena completa,
el origen y las desplazadas; tambien explica el efecto por defecto, las
protecciones nativas anuladas y los motivos sin decision. Cierra con las
aprobaciones permanentes excluidas. `RespuestaValores` no incorpora explicacion.
La CLI y la web integran estas explicaciones (T2-11 y T2-12).

Para comprobar T2-10, con `RIGE_ALMACEN` temporal como se indica en §6:

```bash
bun test paquetes/nucleo/permisos/explicar.test.ts pruebas/aceptacion/RF-02-explicacion.test.ts
bun test paquetes
bun test
bun run verificar
```

T2-12 agrega las paginas GET `/permiso?id=…&agente=…&herramienta=…&objetivo=…`
(o `sujeto` en lugar de `herramienta`, y opcionalmente `lanzadoPor`) y
`/agentes?id=…`. La pagina de una resolucion guardada ofrece los enlaces y
formularios. Las consultas usan los mismos casos de uso que la CLI sobre el
documento guardado y su contexto original (worktree, hogar, data, tmp,
plataforma y declaraciones); cambiar una entrada o el entorno no modifica esa
resolucion. Para observar el cambio hay que resolver nuevamente desde el inicio.
El permiso siempre muestra la explicacion. Ambas paginas incluyen la respuesta
como JSON no ejecutable, con `<` serializado como `\u003c` para impedir el cierre
de la etiqueta de datos.

Para comprobar T2-14, con `RIGE_ALMACEN` temporal como se indica en §6:

```bash
bun test pruebas/arquitectura herramientas
bun test pruebas/aceptacion/RF-02.test.ts pruebas/aceptacion/RF-02-CA-9.test.ts pruebas/aceptacion/T2-11b.test.ts pruebas/utilidades/decision-nativa.test.ts
bun run cobertura
bun test
bun run verificar
```

Para comprobar T2-12, con `RIGE_ALMACEN` temporal como se indica en §6:

```bash
bun test pruebas/aceptacion/T2-12.test.ts
bun test paquetes/rige/interfaces pruebas/aceptacion
bun test
bun run verificar
```

Para comprobar T2-15 (incluida la sonda M-3 sobre una copia temporal):

```bash
bun test paquetes pruebas herramientas
bun run prueba:lenta
bun run verificar
```

Las aceptaciones de repositorios validos requieren Git disponible en PATH, como
se indica en los requisitos previos. RIGE solo comprueba su archivo ejecutable;
el oraculo nativo ejecuta Git. Las capturas manuales que no reproduce el arnes
se identifican expresamente como manuales en su procedencia.

T2-15 agrega `porDefecto` a permisos: si es true, la decision es el efecto
por defecto y `motivoSinDecision` es null. `eliminadas`, y las declaraciones
y advertencias de cada cadena, son arreglos siempre presentes. Los valores y
el listado de agentes incluyen las declaraciones del descubrimiento del arbol.
Los agentes solo en Markdown figuran en el listado incompleto; consultarlos
o usarlos como lanzador produce `cadena-incompleta` con `markdown-no-observado`.

T2-16 valida las decisiones derivadas contra las capturas nativas disponibles.
En Linux se usa el oráculo derivado si la captura pertenece a Windows; cada
título indica el oráculo. RF-02 CA-3 permanece cubierto con oráculo derivado,
sin ejecución nativa de `task`. Las resoluciones de formato 2 conservan los
datos del contexto original, sin guardar variables de entorno ni puertos de E/S;
las consultas guardadas no vuelven a descubrir `.git`. No hay migración.
RF-09 advierte cuando una declaración supera una denegación nativa; superar
una nativa `ask` no produce esa advertencia. La web numera las reglas desde 1.

Para comprobar T2-16, con `RIGE_ALMACEN` temporal como en §6:

```powershell
bun test pruebas/utilidades/decision-nativa.test.ts pruebas/aceptacion/RF-02.test.ts pruebas/aceptacion/RF-02-CA-9.test.ts
bun test paquetes/opencode/contexto.test.ts pruebas/aceptacion/T2-12.test.ts
bun test pruebas/arquitectura/vendor.test.ts pruebas/arquitectura/manifiesto.test.ts
bun test paquetes/nucleo/permisos/decidir.test.ts pruebas/aceptacion/RF-09.test.ts pruebas/aceptacion/RF-02-explicacion.test.ts
bun test paquetes/rige/aplicacion/casos-uso/consultar-permiso.test.ts paquetes/opencode/secuenciador.test.ts paquetes/rige/interfaces/web/paginas/resolucion.test.ts pruebas/aceptacion/recorrido-v1.test.ts
bun test paquetes/opencode/lector.test.ts paquetes/opencode/ubicador.test.ts paquetes/opencode/cadena.test.ts paquetes/nucleo/resolucion/proyectar.test.ts pruebas/aceptacion/RF-03.test.ts
bun test paquetes/opencode/objetivo.test.ts paquetes/rige/aplicacion/casos-uso/resolver-proyecto.test.ts paquetes/nucleo/resolucion/resolver.test.ts pruebas/aceptacion/RF-08.test.ts
bun test pruebas/aceptacion/RNF-10.test.ts pruebas/aceptacion/RF-06.test.ts
bun run cobertura
bun test
bun run prueba:lenta
bun run referencias --raiz (npm.cmd root -g)
bun run verificar
```

En Bash, la referencia se comprueba con
`bun run referencias --raiz "$(npm root -g)"`.
