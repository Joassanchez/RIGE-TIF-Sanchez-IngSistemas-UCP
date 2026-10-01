# RIGE · Prototipo v1

> Archivo de lectura exigido por la Guía de comprobación del prototipo v1 (`catedra/AE2-guia-comprobacion-v1.md`). La cátedra lo sigue al pie de la letra, sin suplir pasos. Completar las ocho secciones antes de crear la etiqueta `v1`.

## 1. Identificación

- **Proyecto:** RIGE — Proyecto Integrador Final 2026
- **Equipo:** Joaquín Sebastián Sánchez (autoría individual)
- **Comisión:** A · Sede Posadas
- **Actividad:** AE2 · etiqueta `v1` (esqueleto arquitectónico ejecutable)

## 2. Qué hace este prototipo

[DATO PENDIENTE: caso de uso vertical implementado, en dos oraciones, y qué decisión arquitectónica prueba (Cap. V, V.5).]

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

La salida esperada es `1.3.14`. TypeScript **7.0.2** y `@types/bun` **1.3.14** se instalan desde el lock en el paso siguiente, no a mano. SQLite viene integrado en Bun; no se requiere servidor externo ni conexiones de red durante la ejecución de RIGE.

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

Con el puerto por defecto, se escribe `{"esquema":1,"direccion":"http://127.0.0.1:4747"}` y el proceso queda escuchando. En el navegador, `http://127.0.0.1:4747` muestra «RIGE 0.1.0», la ruta del almacén y la versión de su esquema. Si se cambia `RIGE_PUERTO`, se usa el puerto configurado en la dirección. Se detiene con Ctrl+C antes de continuar.

**3. Verificar tipos, construcción y pruebas:**

```bash
bun run verificar
bun test
```

`verificar` comprueba los tipos y la construcción y termina con código 0. Todas las pruebas pasan; `bun test` termina con código 0.

Si no se ejecuta previamente `bun run esquema`, `servir` termina con `almacen-sin-esquema` y código 1. Si el puerto está ocupado, termina con `puerto-ocupado` y código 1; se cambia `RIGE_PUERTO` por un puerto disponible.

La forma general es `bun run rige -- <subcomando>`. Para invocar directamente la CLI con el subcomando `esquema`:

```bash
bun --silent run rige -- esquema
```

Produce el mismo JSON de estado que `bun run esquema`. Sin `--silent`, `bun run` agrega su propia línea `$ bun …` al canal de error (comprobado el 30/09/2026).

| Código de salida | Situación | Canal de salida | Canal de error |
|---|---|---|---|
| 0 | Respuesta válida | JSON de respuesta | Vacío |
| 1 | Error de uso | Vacío | JSON de error: `almacen-sin-esquema`, `configuracion-invalida` o `puerto-ocupado` |
| 2 | Argumentos inválidos | Vacío | JSON de error: `argumentos-invalidos` |
| 70 | Falla interna | Vacío | JSON de error: `interno`; `--depurar` agrega el stack, sin logs a disco |

La forma del error es `{"esquema":1,"error":{"codigo":"…","mensaje":"…"}}`. La tabla describe los canales de la CLI; la línea propia de `bun run` se evita con `--silent`.

Correspondencia prevista: la etiqueta `v1` corresponderá a la versión `0.1.0` de RIGE.

## 7. Estado del canal de construcción

El archivo `.github/workflows/ci.yml` ejecuta en cada push, en `ubuntu-latest` y `windows-latest` con Bun 1.3.14, `bun install --frozen-lockfile`, `bun run verificar` y `bun test`. Las pruebas incluyen criterios del catálogo: `pruebas/aceptacion/RNF-03.test.ts` (CA-1, CA-2) y `pruebas/aceptacion/RNF-09.test.ts` (CA-1 a CA-3).

El [registro de corridas](https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP/actions/workflows/ci.yml) permite consultar los resultados. La primera corrida exitosa en las dos plataformas, comprobada por el ingeniero en la API de GitHub, es del **30/09/2026, 22:26 (UTC−3)**, commit `11c852e`: [corrida 36801042650](https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP/actions/runs/36801042650).

## 8. Declaración de herramientas auxiliares

| Período | Herramienta y modelo | Función | Artefacto afectado |
|---|---|---|---|
| 29/09/2026–30/09/2026 (T0-01 a T0-09) | OpenCode con gentle-ai 3.7; modelos `opencode-go/mimo-v2.6-pro` y `openai/gpt-6.1-sol` | Escritura del código y de las pruebas por delegación sobre el documento ODD | `src/` hasta el commit `a613de6`; `odd/tasks/inc0-esqueleto.md` |
| Desde el 30/09/2026 (T0-10 en adelante) | Codex (`gpt-6.1-sol`, plan ChatGPT Plus) como escritor, orquestado por Claude Code (`claude-opus-5-5`) | Escritura del código y de las pruebas sobre fichas del ingeniero; revisión por los subagentes `revisor-codigo` (Sonnet 5.5) y `critico-codigo` (Opus 5.5) | `src/` desde el commit `5ca3431`; este README |

El diseño, los requisitos y las decisiones (ADR) son del autor; las herramientas escriben y revisan código bajo esas decisiones.

Conforme al Protocolo de Uso Autorizado. Si no hubo uso, se consigna de manera expresa.
