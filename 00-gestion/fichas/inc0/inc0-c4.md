# Ficha inc0-c4 · Imports del workspace, `verificar` legible, analizador más simple y guarda de globales

- **Incremento / rama:** 0 · `inc0-esqueleto` (mejoras de la revisión del incremento: C1, C2, C9 y R2)
- **Escritor:** `gpt-6.1-sol`, esfuerzo `high`
- **Riesgo:** alto
- **Fuentes (leé solo estas secciones):**
  - ADR-058, tabla de reglas de dependencia y P-2 (workspace: «un import no declarado falla») (`../00-gestion/decisiones/ADR-058-arquitectura-puertos-adaptadores-estructura-src.md`);
  - ADR-062, «C1 · Invocación» y «C3 · Dependencias»;
  - `AGENTS.md` §3, §6 y §7.

## 1. Qué hay que hacer

Refactor sin cambio de comportamiento del producto, en cuatro partes:
- **C1 · Imports del workspace.** Los 6 imports relativos entre paquetes (`"../../../nucleo/resultado"`, etc.) pasan a `@rige/nucleo/…` y `@rige/opencode/…`, de modo que el aislamiento del workspace (`linker = "isolated"`) actúe.
- **C1 · `verificar` legible.** El script de una línea de `package.json` pasa a `herramientas/verificar.ts`, con el mismo comportamiento y con `bun build` escribiendo en un temporal (`--outdir`) en vez de volcar el bundle a stdout.
- **C2 · Analizador más simple.** Se quita la resolución de aliases de tsconfig, que hoy no existen, y se la reemplaza por una prueba que falla si algún tsconfig define `paths` o `baseUrl`. `red.test.ts` reutiliza el tokenizador de `analisis-arquitectura.ts` en lugar de tener el suyo.
- **C9 y R2 · Pruebas.**
  - Los helpers de subprocesos se unifican en `pruebas/utilidades/subproceso.ts`.
  - `RNF-09.test.ts` levanta un solo servidor por `describe`.
  - Las comparaciones de texto exacto de archivos de andamiaje pasan a propiedades.
  - Se agrega una guarda de **globales**: `Bun.*` y `process.*` en `paquetes/`.

**No** se toca: el comportamiento de la CLI o de la web, `plantillas.test.ts` (P-2 se elimina en inc0-c2) ni los casos de uso.

## 2. Archivos

| Archivo | Acción |
|---|---|
| `paquetes/**/*.ts` que importan otro paquete por ruta relativa (6 imports; `grep -rn 'from "\.\./.*\(nucleo\|opencode\)' paquetes`) | Ampliar: solo esos imports |
| `paquetes/nucleo/package.json`, `paquetes/opencode/package.json` | Ampliar **solo si** hace falta `exports` para que resuelvan los subpaths |
| `package.json` | Ampliar: `"verificar": "bun ./herramientas/verificar.ts"` |
| `herramientas/verificar.ts` | Crear |
| `tsconfig.json` (raíz) | Ampliar: incluir `herramientas/**/*.ts` |
| `pruebas/utilidades/analisis-arquitectura.ts` | Ampliar: quitar aliases, exportar el tokenizador y agregar el análisis de globales |
| `pruebas/arquitectura/dependencias.test.ts` | Ampliar |
| `pruebas/arquitectura/red.test.ts` | Ampliar: usar el tokenizador común |
| `pruebas/arquitectura/entorno.test.ts` | Ampliar: comparaciones por propiedad |
| `pruebas/utilidades/subproceso.ts` | Crear |
| `pruebas/aceptacion/arranque.test.ts`, `pruebas/aceptacion/RNF-09.test.ts` | Ampliar: usar `subproceso.ts` |

No toques ningún otro archivo. En particular, no toques `bun.lock` (no hay dependencias nuevas), `bunfig.toml`, `.github/` ni `README.md`.

## 3. Interfaces

```ts
// herramientas/verificar.ts — mismo algoritmo que el script actual, legible y comentado en español:
// por cada proyecto (raíz + references): tsc --noEmit con un tsconfig derivado temporal (composite:false, references:[]);
// luego bun build ./paquetes/rige/arranque/rige.ts --target=bun --outdir <temporal>. Borra el temporal; process.exit(código).

// pruebas/utilidades/analisis-arquitectura.ts
export function tokenizar(codigo: string): Token[];   // el escáner actual, exportado; falla visible ante ambigüedad
export function analizarGlobales(archivo: string, codigo: string): HallazgoDependencia[];
export async function comprobarGlobales(): Promise<HallazgoDependencia[]>;
// analizarFuente pierde la opción `aliases`; `dependencias` se conserva.

// pruebas/utilidades/subproceso.ts
export function puertoLibre(): number;
export function lanzar(temporal: string, argumentos: readonly string[], variables?: Record<string, string>):
  { codigo: number | null; salida: string; error: string };
export async function lanzarServidor(temporal: string, variables: Record<string, string>):
  Promise<{ direccion: string; puerto: number; detener(): Promise<void> }>; // lee la primera línea de stdout
```

**Regla de globales (R2):** en `paquetes/**` (sin `*.test.ts`), un identificador `Bun` o `process` seguido de `.` o `[` es un hallazgo, salvo:
- `Bun.serve` en `paquetes/rige/interfaces/web/servidor.ts`;
- `process.*` en `paquetes/rige/arranque/rige.ts`.

Las referencias `/// <reference path="…">` solo se admiten hacia un `.d.ts` de la misma carpeta.

## 4. Patrones existentes a imitar

- **Guardas:** imitá `comprobarDependencias` y `comprobarIdentificaciones`, que recorren con `Bun.Glob`, ordenan los hallazgos y se prueban con sondas sintéticas positivas y negativas. Toda prohibición nueva se prueba con una **infracción temporal revertida** (`odd/tasks/inc0-esqueleto.md` §5, precisión), como en T0-05.
- **Helpers de subproceso:** tomá el código de `lanzar` y de `servir` que hoy está duplicado en `arranque.test.ts` y `RNF-09.test.ts`: entorno de `crearEntornoAislado`, `Bun.spawn`, `finally` con `kill()` y `await exited`.
- **Propiedades en lugar de texto:**
  - `.gitattributes` contiene una regla `eol=lf` para `*`;
  - `rige.env.example` declara exactamente las claves `RIGE_PUERTO` y `RIGE_ALMACEN`, y ninguna tiene un valor que parezca credencial (prueba por claves, no por bytes);
  - `guion.d.ts` declara el módulo `*.sql` con exportación por defecto `string`;
  - `esquema.ts` referencia `guion.d.ts`.

## 5. Reglas de comportamiento (una prueba por regla, con el ID en el `describe`)

| ID | Regla |
|---|---|
| M-1 | Ningún archivo de `paquetes/` importa otro paquete por ruta relativa: la guarda lo rechaza (sonda `import "../nucleo/resultado"` desde `opencode`) y el repositorio real la cumple |
| M-2 | Un import `@rige/nucleo/...` desde un paquete que no lo declara en `dependencies` sigue rechazado (la regla actual se conserva) |
| M-3 | `bun run verificar` da salida 0 en el repositorio y **salida distinta de 0** si se introduce temporalmente un error de tipos en un paquete (mutación revertida). La salida estándar ya no incluye el bundle |
| M-4 | Una prueba falla si algún `tsconfig*.json` de `src/` define `compilerOptions.paths` o `baseUrl`; el repositorio real pasa |
| M-5 | `red.test.ts` usa `tokenizar` de `analisis-arquitectura.ts`; sus casos actuales siguen pasando sin cambios de expectativa |
| M-6 | Guarda de globales: sondas `Bun.write(…)` en `adaptadores/sistema`, `process.env` en `aplicacion`, `Bun.spawn` en `interfaces/cli` y `globalThis.process` en `nucleo` → hallazgo. `Bun.serve` en `servidor.ts` y `process.argv` en `arranque/rige.ts` → sin hallazgo. El repositorio real pasa |
| M-7 | `/// <reference path="../otro.ts" />` en un adaptador → hallazgo; `./guion.d.ts` en `almacen-sqlite` → sin hallazgo |
| M-8 | `arranque.test.ts` y `RNF-09.test.ts` usan `subproceso.ts`; RNF-09 levanta un solo servidor por `describe` (`beforeAll`/`afterAll`) y todos sus casos siguen pasando |

## 6. Pruebas

- Toda la suite actual sigue pasando. Las expectativas cambian solo en las comparaciones de texto de §4, que pasan a propiedades.
- Las guardas nuevas se prueban con sondas sintéticas, sin ejecutar las fuentes, y con una infracción real temporal revertida.
- Ninguna prueba deja servidores ni temporales.

## 7. Comandos

Desde `src/`, con `RIGE_ALMACEN` en un temporal en todo comando:

```bash
bun test pruebas/arquitectura pruebas/aceptacion   # durante el trabajo
bun test                                           # una vez, al final
bun run verificar                                  # una vez, al final
```

## 8. Resultado esperado y detención

- **Pruebas:** `bun test` completo en verde (el total puede variar por la consolidación; informalo). **`verificar`:** PASS.
- **Commit:** `refactor: imports del workspace, verificar legible y guardas simplificadas (inc0-c4)`, con una línea rojo → verde por regla (M-1 a M-8) y los resultados finales. Agregá solo los archivos de §2.
- **Respuesta final:** el JSON del esquema `../00-gestion/fichas/esquema-salida-escritor.json`.
- **Temporales:** si el sandbox no te deja borrar un temporal tuyo, nombralo en `notas` y commiteá igual.
- **Detenete sin commitear** (estado `detenida`, con la pregunta y la opción que proponés) si:
  - `tsc` o `bun build` no resuelven `@rige/nucleo/…` sin cambiar `tsconfig.base.json`, `bunfig.toml` o el lock;
  - una regla de ADR-058 tendría que relajarse;
  - hace falta tocar otro archivo o agregar una dependencia.
