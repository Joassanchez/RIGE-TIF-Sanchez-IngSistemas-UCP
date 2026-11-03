# ADR-106 — Precisión de ADR-102: pnpm y bun en Windows, y directorios del `PATH` inaccesibles

- Estado: aceptado (02/11/2026)
- Fecha: 30/10/2026
- Capítulos afectados: `src/` (`opencode/ejecutables.ts`, `version.ts`); README (limitaciones); Cap. VI (cuando se redacte)
- Origen: crítica de T3-01 (hallazgos 2 y 6), pendientes de decisión registrados en el índice de la iteración 3; decidido por el ingeniero con el mandato del autor del 30/10/2026

### Contexto

- ADR-102 (aceptado) ubica OpenCode por el primer `opencode` del `PATH` y sube desde su ruta real hasta el `package.json` de `opencode-ai`, con el respaldo `<directorio>/node_modules/opencode-ai/package.json` para el envoltorio de npm en Windows. Su análisis dice que la vía «cubre npm, pnpm y bun».
- La crítica de T3-01 mostró que en Windows pnpm y bun no dejan el paquete junto al ejecutable: pnpm instala un envoltorio `opencode.cmd` cuyo paquete está en un almacén global con un número de versión del formato en la ruta, y bun un `opencode.exe` que apunta a `~/.bun/install/global/node_modules/`. Con ADR-102 literal, esas instalaciones caen en `version-no-determinada`. En Linux y macOS son enlaces simbólicos y la vía funciona.
- Si un directorio del `PATH` no se puede examinar (`EACCES`, `EPERM`), `entorno.tipo` lanza una excepción de infraestructura y el análisis entero termina con error, aunque la versión es solo una comprobación previa.
- Un intérprete de órdenes (`execvp`) que no puede examinar un directorio del `PATH` lo saltea y sigue con el siguiente: el `opencode` que ejecutaría es el primero de un directorio accesible.

### Alternativas evaluadas

Para pnpm y bun en Windows:

- **G-A:** Precisar ADR-102: caen en `version-no-determinada` (resultados con la advertencia), como `curl`, brew y scoop.
- **G-B:** Agregar las rutas conocidas de los almacenes globales de pnpm y bun.

Para un directorio inaccesible:

- **P-A:** Falla visible (código 1) con un error de uso.
- **P-B:** Saltear el directorio como `execvp` y declarar `path-inaccesible` como advertencia.
- **P-C:** Mantener la excepción (código de defecto interno).

### Análisis (trade-offs)

- **G-B** depende de rutas que cambian entre versiones de cada gestor (el número del formato de pnpm) y puede leer una instalación distinta de la que ejecuta el envoltorio: informaría una versión que no es la real, lo que es peor que no informarla (RNF-02). **G-A** es la falla visible que ADR-102 ya eligió para las instalaciones que no puede leer, y no afecta al entorno del proyecto ni al CI, que instalan con npm.
- **P-A** bloquea un análisis por una comprobación que, sin versión, ya se presenta con advertencia (N-2 de ADR-102). **P-C** presenta como defecto interno una condición del entorno. **P-B** reproduce lo que hace el sistema al ejecutar `opencode`: si el ejecutable está en un directorio inaccesible, tampoco lo ejecutaría; la advertencia evita el silencio.

### Recomendación y fundamento

**G-A y P-B.**

1. ADR-102 queda precisado: en Windows, una instalación por pnpm o bun da `version-no-determinada` con el motivo `paquete-no-encontrado`; el README lo declara entre las limitaciones.
2. En la búsqueda del ejecutable, un candidato cuyo examen falla con `EACCES` o `EPERM` se trata como ausente y la búsqueda sigue. La respuesta declara `path-inaccesible` (advertida por el canal de error, como `version-no-determinada`), una sola vez por ejecución. Cualquier otro error del sistema sigue siendo una excepción.

**Condición que la invalidaría:** que el entorno de la referente o de la medición final instale OpenCode con pnpm o bun en Windows; entonces se reevalúa G-B, limitada al gestor detectado y con una prueba contra una instalación real.

### Decisión del autor

Aceptado por el autor el 02/11/2026.

### Consecuencias

- `src/`: `buscarEjecutable` distingue el examen inaccesible; regla `path-inaccesible` en `opencode/reglas.ts` y en `advertidas`. Se implementa en la tarea T3-10 (condicionados) de la iteración 3.
- README: limitación de pnpm y bun en Windows.
- ADR-102, análisis de V-B: «cubre npm, pnpm y bun» se lee «npm en todas las plataformas; pnpm y bun donde instalan enlaces simbólicos».

### Evidencia

- ADR-102; crítica de T3-01 (30/10/2026, hallazgos 2 y 6); `src/paquetes/opencode/version.ts:19-50` y `ejecutables.ts:12-20` (commit `ac89ccf`); `src/paquetes/rige/adaptadores/sistema/entorno-lectura.ts:7` (solo `ENOENT` y `ENOTDIR` cuentan como inexistente).
