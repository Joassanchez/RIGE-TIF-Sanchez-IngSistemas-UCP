# ADR-101 — Worktree con el criterio de descubrimiento de git, sin ejecutar procesos

- Estado: aceptado (25/10/2026)
- Fecha: 25/10/2026
- Capítulos afectados: ninguno del cuerpo en forma directa; precisa ADR-062 C8 (vías del adaptador del v1) y cierra AR-13. Afecta `src/` (adaptador: detección del worktree, RF-02 CA-9, regla nativa de `plan`), `src/AGENTS.md` §5 (lo edita el autor) y la frontera de III.4 si el autor decide declararla.
- Origen: iteración 2, tarea T2-08 (25/10/2026). La revisión de T2-05 y el escritor de T2-08 encontraron que el criterio del v1 no coincide con el de OpenCode 1.18.25. Decisión tomada por el ingeniero con la delegación del autor del 25/10/2026 («libertad para tomar las mejores decisiones»), sujeta a su aceptación.

### Contexto

1. **[D] OpenCode 1.18.25 obtiene la raíz del repositorio ejecutando git:** `rev-parse --show-toplevel`, `--git-dir` y `--git-common-dir` (`packages/core/src/git.ts:184-201`, tag verificado). Si git no está instalado, el descubrimiento termina sin repositorio (`git.ts:954-975`).
2. **[D] Sin repositorio, la pila v1 asigna `worktree = "/"`** (`packages/opencode/src/project/project.ts:217`). Las herramientas de archivo piden permiso sobre `path.relative(worktree, archivo)` (ADR-088), así que fuera de git el recurso es una ruta casi absoluta y ningún patrón relativo coincide.
3. **[D] Criterio del v1 de RIGE** (ADR-062 C8, precisión AR-13): «un `.git` es válido si es un directorio con `HEAD` o un archivo `gitdir:`». En T2-05 un `.git` sintético con solo `HEAD` no fue repositorio para el binario, y la búsqueda de skills subió hasta el HOME real (T2-05, commit `b892fa1`: la primera regeneración del oráculo filtró los skills reales del autor y se corrigió el aislamiento). Los dos criterios difieren.
4. **[D] RIGE es de solo lectura** y no ejecuta procesos: `src/AGENTS.md` §2 y §3 (solo `adaptadores/sistema` hace E/S de lectura).

### Alternativas evaluadas

- **W-A:** ejecutar `git rev-parse` desde RIGE.
- **W-B:** reproducir el criterio de descubrimiento de git leyendo `.git`, sin ejecutar procesos, y comprobar por archivo la presencia del ejecutable en `PATH`.
- **W-C:** conservar el criterio del v1 y declarar la diferencia.

### Análisis (trade-offs)

- **W-A** es la más fiel por construcción, pero introduce la ejecución de procesos externos en una herramienta de solo lectura. Eso amplía la superficie (variables de entorno de git, `safe.directory`, hooks no, pero sí configuración del usuario) y contradice la arquitectura de ADR-058, que limita la E/S a la lectura.
- **W-B** reproduce `is_git_directory` de git: `HEAD` con una referencia o un hash, `objects/` y `refs/`; `gitdir:` y `commondir`. Coincide con el binario en los tres casos contrastados en T2-08: repositorio válido, `.git` sintético y sin `.git`. No cubre `GIT_DIR`, `GIT_WORK_TREE`, `core.worktree`, repositorios desnudos ni `safe.directory`: las variables se rechazan con falla visible y lo demás se declara cuando se detecta.
- **W-C** deja a RIGE informando decisiones distintas de las de OpenCode fuera de git o con `.git` incompletos, que es exactamente el riesgo principal (RNF-02).

### Recomendación y fundamento

**W-B.** Conserva la propiedad de solo lectura sin ejecución y alcanza la fidelidad en los casos comunes. Lo que no modela queda declarado o falla de forma visible, nunca en silencio (RNF-02). La ausencia de git se trata como OpenCode (`"/"`), detectada por la existencia del ejecutable en `PATH`, con la declaración `git-no-encontrado`.

**Condición que la invalidaría:** que la regeneración de referencias muestre una diferencia con el binario en algún escenario del manifiesto (ADR-080) atribuible al descubrimiento del repositorio. En ese caso se reevalúa W-A con un ADR de reemplazo.

**Precisión del 25/10/2026 (crítica del incremento y T2-11b, contrastada con el binario):** OpenCode corre git en el **primer** `.git` que encuentra al subir (`packages/core/src/git.ts:185-192`, `matches[0]`):

- **`.git` archivo inválido** (gitfile mal formado o que apunta a un repositorio inexistente): el binario da `worktree = "/"` aunque haya un repositorio válido más arriba; `git rev-parse` aborta con «gitfile does not point to a valid repository». RIGE corta la búsqueda con `"/"` (escenario `v2-worktree-gitfile-roto`).
- **`.git` directorio que no cumple `is_git_directory`, anidado en un repositorio válido:** se conserva el comportamiento contrastado con el binario (escenario `v2-worktree-dir-invalido-anidado`, commit `ba45345`).

**Precisión del 30/10/2026 (T2-19, CI de Windows contrastado con el binario):** con `worktree = "/"`, OpenCode calcula `path.relative("/", …)` (regla `edit` del agente `plan`; patrón evaluado de `read`, `edit`, `write` y `apply_patch`). En Windows, `"/"` se resuelve contra la unidad del directorio actual del proceso, y OpenCode hace `process.chdir` al proyecto (`cli/cmd/tui.ts:203`, `cli/cmd/run.ts:339`). Por eso RIGE toma como `"/"` la raíz de la unidad del proyecto y no la de su propio proceso (`paquetes/opencode/base-relativa.ts`, commits `8862069` y `5007e4c`). El valor público de `worktree` sigue siendo `"/"`. **Supuesto declarado:** RIGE modela OpenCode lanzado desde el proyecto (TUI, `run`, `debug agent`). Con `serve`, la web o `attach`, el directorio actual es el del servidor y queda fuera del alcance. Aprobada por el autor en la sesión del 30/10/2026.

### Decisión del autor

Aceptado por el autor el 25/10/2026, tal como está redactado (incluida la precisión del 25/10 sobre el `.git` anidado), al cierre de la iteración 2.

### Consecuencias

- **`src/`:** una sola función de worktree en el adaptador (T2-08), usada por CA-9 y por la regla nativa de `plan` (`cadena.ts`); escenarios con referencia del binario para los tres casos.
- **`src/AGENTS.md` §5 (lo edita el autor):** reemplazar la precisión AR-13 por este criterio y sumar `GIT_DIR` y `GIT_WORK_TREE` a los casos de `via-no-soportada`.
- **III.4 (frontera, si el autor lo decide):** los casos de git no modelados.

### Evidencia

- Código del tag `v1.18.25`, del tarball `codeload.github.com/anomalyco/opencode/tar.gz/refs/tags/v1.18.25` verificado (SHA-256 `44e9530d7be172005c7d60aef317440eecb85d557d94cce7fa35c5a7b9d9da0b`): `packages/core/src/git.ts:184-201` y `954-975`; `packages/opencode/src/project/project.ts:216-217`.
- Commits de T2-05 (`b892fa1`) y de T2-08 en la rama `v2-permisos`.
