# RIGE · Prototipo v1

> Archivo de lectura exigido por la Guía de comprobación del prototipo v1 (`catedra/AE2-guia-comprobacion-v1.md`). La cátedra lo sigue al pie de la letra, sin suplir pasos.

## 1. Identificación

- **Proyecto:** RIGE — Proyecto Integrador Final 2026
- **Equipo:** Joaquín Sebastián Sánchez (autoría individual)
- **Comisión:** A · Sede Posadas
- **Actividad:** AE2 · etiqueta `v1` (esqueleto arquitectónico ejecutable)

## 2. Qué hace este prototipo

El prototipo implementa el caso de uso vertical «consultar el valor efectivo de una clave de un agente de OpenCode 1.18.25, con su procedencia»: la interfaz web recibe un proyecto, un agente y una clave; la lógica aplica la regla de negocio validada RD-01 (prevalece la declaración de la última entrada que declara la clave), la resolución se guarda en el almacén SQLite propio y la página se arma con lo que se lee del almacén, con el valor, la declaración que lo determina y las declaraciones desplazadas. El recorrido prueba la decisión arquitectónica de separar un núcleo genérico, que ejecuta la combinación, de un adaptador por herramienta que declara el orden de las entradas y su estrategia (RNF-03; ADR-058 y ADR-060): el núcleo no depende del adaptador y un adaptador ficticio se resuelve sin modificarlo.

## 3. Requisitos previos

Se requiere Git y uno de estos sistemas: Ubuntu (plataforma de referencia) o Windows 11.

Se instala Bun **1.3.14** exacto:

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

La salida contiene una línea JSON con `esquema: 1`, `versionRige: "0.1.0"`, `almacen.ruta` (ruta del archivo de la base) y `almacen.versionEsquema: 1`. El código de salida es 0. Repetir el comando no cambia el esquema ni los datos.

**2. Arrancar el servidor:**

```bash
bun run servir
```

Con el puerto por defecto, se escribe `{"esquema":1,"direccion":"http://127.0.0.1:4747"}` y el proceso queda escuchando. En el navegador, `http://127.0.0.1:4747` muestra «RIGE 0.1.0», la ruta del almacén y la versión de su esquema. Si se cambia `RIGE_PUERTO`, se usa el puerto configurado en la dirección.

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
6. Los valores coinciden con los de OpenCode 1.18.25 registrados en `pruebas/escenarios/v1-precedencia/REFERENCIA.json`; si el equipo tiene configuración global de OpenCode, RIGE la incorpora y la muestra con su procedencia, de modo que pueden aparecer entradas adicionales. Si esa configuración tiene sustituciones, agentes en Markdown, `mode`, `disable` o claves derivadas, las claves afectadas figuran como «no resueltas en el prototipo v1». Si lo afectado es la clave o el agente consultado, la página de error lo informa (`clave-no-resuelta`, HTTP 422) y no se crea la resolución. Una sustitución fuera de una cadena o un `mode` que no es objeto detienen el análisis con `contenido-no-soportado`.

Se detiene el servidor con Ctrl+C antes de continuar.

**4. Verificar tipos, construcción y pruebas:**

```bash
bun run verificar
bun test
```

`verificar` comprueba los tipos y la construcción y termina con código 0. Todas las pruebas pasan; `bun test` termina con código 0.

**5. Comprobar las referencias nativas (opcional, separado de `bun test`):**

Con Node 22 disponible, `npm i -g opencode-ai@1.18.25` instala el binario y `npm root -g` informa la raíz global; se pasa esa ruta como `<dir>`:

```bash
bun run referencias --raiz <dir>
```

El guion verifica la versión y el SHA-256 del binario, ejecuta cada escenario en una copia temporal aislada y solo compara: imprime una línea por escenario y termina con código 0 si todos coinciden, o 1 ante diferencias o errores; no regenera las referencias.

Si no se ejecuta previamente `bun run esquema`, `servir` termina con `almacen-sin-esquema` y código 1. Si el puerto está ocupado, termina con `puerto-ocupado` y código 1; se cambia `RIGE_PUERTO` por un puerto disponible.

La forma general es `bun run rige -- <subcomando>`. Para invocar directamente la CLI con el subcomando `esquema`:

```bash
bun --silent run rige -- esquema
```

Produce el mismo JSON de estado que `bun run esquema`. Sin `--silent`, `bun run` agrega su propia línea `$ bun …` al canal de error (comprobado el 30/09/2026).

| Código de salida | Situación | Canal de salida | Canal de error |
|---|---|---|---|
| 0 | Respuesta válida | JSON de respuesta | Vacío |
| 1 | Error de uso de la CLI | Vacío | JSON de error: `almacen-sin-esquema`, `configuracion-invalida` o `puerto-ocupado` |
| 2 | Argumentos inválidos | Vacío | JSON de error: `argumentos-invalidos` |
| 70 | Falla interna | Vacío | JSON de error: `interno`; `--depurar` agrega el stack, sin logs a disco |

La forma del error es `{"esquema":1,"error":{"codigo":"…","mensaje":"…"}}`. La tabla describe los canales de la CLI; la línea propia de `bun run` se evita con `--silent`.

La web presenta los errores de uso con estado HTTP 400 (`solicitud-invalida`), 404 (`proyecto-inexistente`, `resolucion-inexistente`, `agente-sin-declaraciones`, `clave-inexistente`) o 422 (`via-no-soportada`, `contenido-no-soportado`, `entrada-ilegible`, `clave-no-resuelta`).

La etiqueta `v1` corresponde a la versión `0.1.0` de RIGE.

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

El diseño, los requisitos y las decisiones (ADR) son del autor; las herramientas escriben y revisan código bajo esas decisiones.

Uso conforme al Protocolo de Uso Autorizado, en los períodos declarados en la tabla.
