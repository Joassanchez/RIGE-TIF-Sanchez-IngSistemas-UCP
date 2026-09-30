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

- Bun **1.3.14**, sin actualizar a 1.4; `bun --version` debe informar `1.3.14`.
- TypeScript **7.0.2** y `@types/bun` **1.3.14**, dependencias de desarrollo exactas instaladas mediante el lock.
- SQLite integrado en Bun; no se requiere servidor externo. Su comprobación funcional corresponde a T0-09.

Estado T0-04: solo workspace y arnés; no existen todavía esquema, CLI ni servidor.

## 4. Instalación

Ejecutar desde `src/`, con Bun 1.3.14 en `PATH`. El agente usa siempre ubicaciones de usuario y almacén temporales. Los subprocesos del arnés construyen su entorno desde cero y solo heredan `PATH` y `SystemRoot`.

**Windows (PowerShell):** preparar aislamiento, instalar, verificar, restaurar el entorno y limpiar temporales.

```powershell
$original = @{}
Get-ChildItem Env: | ForEach-Object { $original[$_.Name] = $_.Value }
$padre = "C:/Users/Joa/AppData/Local/Temp/opencode"
if (-not (Test-Path -LiteralPath $padre -PathType Container)) { throw "Falta el directorio temporal" }
$temporal = Join-Path $padre ([guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $temporal | Out-Null
try {
    Get-ChildItem Env: | ForEach-Object { Remove-Item -LiteralPath "Env:$($_.Name)" }
    $env:PATH = "C:/Users/Joa/.bun/bin;" + $original["PATH"]
    $env:SystemRoot = $original["SystemRoot"]
    foreach ($nombre in @("HOME", "USERPROFILE", "XDG_CONFIG_HOME", "XDG_DATA_HOME", "XDG_STATE_HOME", "XDG_CACHE_HOME", "LOCALAPPDATA", "APPDATA", "RIGE_ALMACEN", "TEMP", "TMP")) {
        Set-Item -LiteralPath "Env:$nombre" -Value $temporal
    }
    bun --version
    bun install --frozen-lockfile
    bun test ./pruebas/arquitectura/entorno.test.ts
    bun test
    bun run verificar  # T0-04: salida 1 por arranque aun inexistente; no es PASS completo
} finally {
    Get-ChildItem Env: | ForEach-Object { Remove-Item -LiteralPath "Env:$($_.Name)" }
    foreach ($nombre in $original.Keys) { Set-Item -LiteralPath "Env:$nombre" -Value $original[$nombre] }
    Remove-Item -LiteralPath $temporal -Recurse -Force
}
```

**Ubuntu (Bash):** mismos comandos con entorno limpio. No se afirma una corrida Ubuntu en T0-04.

```bash
temporal=$(mktemp -d)
trap 'rm -rf "$temporal"' EXIT
env -i PATH="$PATH" HOME="$temporal" USERPROFILE="$temporal" \
  XDG_CONFIG_HOME="$temporal" XDG_DATA_HOME="$temporal" XDG_STATE_HOME="$temporal" \
  XDG_CACHE_HOME="$temporal" LOCALAPPDATA="$temporal" APPDATA="$temporal" \
  RIGE_ALMACEN="$temporal" TMPDIR="$temporal" bash -c '
    bun --version
    bun install --frozen-lockfile
    bun test ./pruebas/arquitectura/entorno.test.ts
    bun test
    bun run verificar
  '
```

**Desarrollo del lock:** la primera generación usa `bun install`, bajo el mismo aislamiento; luego se usa `bun install --frozen-lockfile`. Para comprobar el compilador: `bun run tsc --version` (esperado: `Version 7.0.2`). No se agregan dependencias ni se actualiza el runtime durante la verificación.

## 5. Configuración

`rige.env.example` contiene solo `RIGE_PUERTO=4747` y `RIGE_ALMACEN=`. La segunda variable designa un **directorio**, no una base; vacía seleccionará la ubicación normal del usuario cuando T0-10 implemente el lector. El agente siempre la sobrescribe con un temporal. `rige.env` queda ignorado y no es un archivo `.env`; Bun deshabilita la carga automática mediante `env = false`.

La lectura explícita y la configuración del producto siguen pendientes de T0-10. No se necesita crear `rige.env` para verificar el arnés. La guía completa se termina en T0-13.

## 6. Ejecución y verificación

**T0-05:** con el aislamiento de §4 ya preparado, ejecutar `bun test ./pruebas/arquitectura/dependencias.test.ts ./pruebas/aceptacion/RNF-03.test.ts`, luego `bun test` y `bun run verificar`. Arquitectura y RNF-03 CA-1 importan directamente el mismo análisis; las guardas no lanzan subprocesos ni ejecutan sus fuentes sintéticas. Se controlan dependencias explícitas de valor y tipo, aliases y manifiestos. Las formas calculadas no soportadas fallan visiblemente; no es un sandbox ni una prueba del destino usado por mkdirSync. Las unitarias de paquetes se verifican desde el tsconfig raíz con tipos Bun; el núcleo de producto mantiene types=[] y sin DOM.

La corrección de T0-05 conserva `Bun.Transpiler.scanImports` y lo complementa con el scanner oficial en proceso de TypeScript 7.0.2, exclusivamente en las pruebas. No usa el parser AST nativo, que requiere un subproceso; el análisis no se presenta como AST completo y rechaza visiblemente contextos ambiguos de regex/división. La evidencia inicial de `5107696` se conserva como entrega rechazada por la verificación independiente; las regresiones de comillas y funciones flecha quedan permanentes.

En T0-04, las pruebas verifican aislamiento, bloqueo de `fetch`, subprocesos y tsconfigs mediante fuentes temporales con errores intencionales y controles válidos. Solo la precarga modifica `process.env`; las pruebas usan objetos de entorno y eliminan sus temporales.

`bun run verificar` sigue las referencias raíz para comprobar cada paquete con fuentes, además de las pruebas. Ejecuta `tsc --noEmit` con configuraciones derivadas temporales, sin exigir artefactos de referencias ni generar `tsbuildinfo`. Informa los paquetes aún vacíos como pendientes. Finalmente intenta `bun build ./paquetes/rige/arranque/rige.ts --target=bun`, sin archivo de salida: hoy falla porque ese arranque pertenece a T0-11a. **El resultado parcial no acredita la construcción completa ni el CI.**

`bun run esquema`, `bun run servir` y `bun run rige -- <subcomando>` apuntan al arranque futuro; no son operativos ni se ejecutan en T0-04. La dirección prevista es `http://127.0.0.1:4747`; no hay servidor implementado. Los pasos finales se completarán en sus tareas, no mediante stubs.

## 7. Estado del canal de construcción

[DATO PENDIENTE: dónde se consulta el registro de corridas (`.github/workflows/ci.yml`) y qué verifica el canal: instalación, construcción y al menos una prueba ligada a un criterio de aceptación del catálogo.]

T0-04 acredita verificaciones locales en Windows con Bun 1.3.14; no se ejecutó el CI ni se declara construcción completa. El canal existente no se modifica.

## 8. Declaración de herramientas auxiliares

| Herramienta | Función | Artefacto afectado |
|---|---|---|
| [DATO PENDIENTE] | | |

| Período | Agente / modelo efectivo | Función y artefactos |
|---|---|---|
| T0-04, 30/09/2026 | `general` / `openai/gpt-6.1-sol` | Implementación delegada del workspace y arnés, pruebas TDD, README parcial y evidencia ODD; sin agentes hijos, RDD desactivado |
| T0-05, 30/09/2026 | `general` / `openai/gpt-6.1-sol` | Guardas compartidas de dependencias, contratos mínimos, aceptación RNF-03 CA-1 y evidencia ODD; sin agentes hijos, RDD desactivado |

Conforme al Protocolo de Uso Autorizado. Si no hubo uso, se consigna de manera expresa.
