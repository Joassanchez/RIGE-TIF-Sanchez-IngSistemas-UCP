# Mapa de pruebas

T2-09 agrega `aceptacion/RF-08.test.ts`, con una prueba por CA-1 a CA-3.
Consulta el caso de uso por subproceso aislado, tanto por herramienta como
por sujeto `bash`, sobre la copia temporal de `escenarios/v2-bash/`.
Comprueba ausencia de decision y rastro determinante, motivos ordenados
sin repeticion, plantillas de advertencia y decisiones normales sobre comandos
simples recortados. CA-3 cubre aqui el caso de uso; la CLI corresponde a T2-11.
`../paquetes/opencode/comando.test.ts` cubre L-1, L-2 y L-3 con 46 casos:
comillas, escapes, operadores, sustituciones anidadas y entradas no analizables.
El comando especifico figura en `../README.md`.

T2-08 agrega `aceptacion/RF-02-CA-9.test.ts`: una prueba por fila a-j,
con consultas absolutas y relativas, decision y regla determinante, aliases
`write`/`apply_patch`, directorios y salida sin decision fuera del arbol.
En Windows repite las reglas absolutas con `/` y con separadores nativos.
La consulta por sujeto conserva el recurso literal.

`v2-ruta-bloqueo`, `v2-ruta-env` y `v2-ruta-exposicion` guardan los esperados
de CA-9/ADR-088 en `decisiones`; T2-14 verificara esas decisiones sobre los
mismos escenarios. Sus cadenas base de build se capturaron del binario.
`<RAIZ>` solo se sustituye en las copias temporales, con escape JSON.
No se necesita que exista el archivo objetivo para consultar su permiso.

`v2-worktree-valido`, `v2-worktree-sintetico` y `v2-worktree-sin-vcs`
conservan cadenas completas build/plan de OpenCode 1.18.25 y la lectura real
`debug agent build --tool read`: deny, allow y allow respectivamente.
El worktree se comprobo en `message.data.path.root` del SQLite temporal
creado por ese comando: proyecto, `/` y `/`. No se usa vendor como oraculo.
Las capturas excluyen skills externos para evitar que la subida sin VCS
alcance el hogar real; se declara en `procedencia.skillsExternosExcluidos`.
Ese eje sigue parcialmente observado en RIGE.

Las unitarias `../paquetes/opencode/worktree.test.ts` cubren el criterio
autorizado (ADR-101 propuesto): HEAD, objects/refs, gitdir, commondir,
presencia de git en PATH, variables rechazadas y variantes declaradas.
`objetivo.test.ts` comprueba recursos Linux/Windows y proyectos anidados
con entorno por puerto, sin modificar `process.env`.
`utilidades/escenario.test.ts` verifica la sustitucion nativa completa y la
inmutabilidad de la fuente. El arnes de referencias respeta `procedencia.git`:
`proyecto` inicializa en el proyecto; `sintetico` y `ninguno` no ejecutan
`git init`. El marcador `<hogar-relativo-raiz>` conserva la regla de plan
relativa a `/` sin guardar rutas reales del temporal.

| Criterio o regla | Prueba (archivo y `describe`) |
|---|---|
| RF-02 CA-2 (cadena) y CA-8 | `aceptacion/RF-02.test.ts` (cuatro referencias del binario, cadenas completas por subproceso, sensibilidad y ubicacion original) |
| RF-06 CA-2 | `aceptacion/RF-06.test.ts` (bloques nativos y declarados de v2-cadena, contrastados con la captura) |
| T2-05 K-1 RD-07, K-2, K-3 RNF-03 | `../paquetes/opencode/cadena.test.ts` (orden, excepcion deny exacto, expansion, temporales, errores y otro vocabulario) |
| T2-05 K-4 | `aceptacion/RF-02.test.ts` (intercambia declaraciones de la cadena de RIGE); `../herramientas/referencias-nativas/comparar.test.ts` (comparacion profunda y marcadores) |
| T2-05 oraculo | `arquitectura/referencias-nativas.test.ts` (aislamiento declarativo, escenario desconocido, comparar sin escribir y regeneracion con doble del binario) |
| T2-05 aislamiento (reanudacion) | `arquitectura/referencias-nativas.test.ts` (git init, worktree, hogar aislado sin flags y rechazo antes de guardar); `../herramientas/referencias-nativas/aislamiento.test.ts` (fuga del HOME real, separadores y limites de ruta) |
| RF-01 CA-1 | `aceptacion/recorrido-v1.test.ts` — `RF-01 CA-1 · recorrido del README (guía, paso 8)`; `aceptacion/RF-01.test.ts` — `RF-01 CA-1` (referencia nativa y rastro como objeto) |
| RF-01 CA-2 | `aceptacion/recorrido-v1.test.ts` — `RF-01 CA-2; RNF-01 CA-1 CA-2`; `aceptacion/RF-01.test.ts` — `RF-01 CA-2` (referencia nativa y rastros de todas las claves) |
| RF-03 CA-1 (valores) | `aceptacion/RF-03.test.ts` — `RF-03 CA-1 (valores)` (dos escenarios, consulta completa y puntual, igualdad byte a byte y sin sobre) |
| RF-03 CA-3 (valores) | `aceptacion/RF-03.test.ts` — `RF-03 CA-3 (valores)` (ruta absoluta y posición comprobada sobre el texto original) |
| RF-03 CA-5 | `aceptacion/RF-03.test.ts` — `RF-03 CA-5` (clave ausente exitosa, agente/proyecto inexistentes y argumentos inválidos) |
| T2-02 S-1 | `aceptacion/RF-03.test.ts` — `S-1` (servidor por subproceso, respuesta del caso de uso web igual en profundidad a la CLI en ambos escenarios) |
| T2-02 S-2 ADR-061 | `aceptacion/RF-03.test.ts` — `S-2 ADR-061`; `../paquetes/rige/adaptadores/almacen-sqlite/resoluciones.test.ts` — `S-2 ADR-061` (versión 1 rechazada al servir y consultar, sin modificar bytes) |
| T2-02 S-3 ADR-061 | `../paquetes/rige/adaptadores/almacen-sqlite/resoluciones.test.ts` — `R-4` (formato SQL y formato del documento incompatibles como error de uso) |
| T2-02 S-4 ADR-058 | `../paquetes/rige/aplicacion/errores.test.ts` — `S-4 ADR-058` (código desconocido con categoría uso: 1; categoría ausente/inválida: 70); `../paquetes/rige/interfaces/web/intermedios/errores.test.ts` — `W-9` (código nuevo como HTTP 422) |
| T2-02 S-5 | `aceptacion/RF-03.test.ts` — `S-5` (valores sin crear el almacén ni modificar uno existente) |
| RF-17 CA-1 | `aceptacion/recorrido-v1.test.ts` — `RF-17` → `RF-17 CA-1` (recuperación tras reiniciar) |
| RF-17 CA-2 | `aceptacion/recorrido-v1.test.ts` — `RF-17` → `RF-17 CA-2` (resumen distinto y resolución anterior intacta) |
| RF-17 CA-3 | `aceptacion/recorrido-v1.test.ts` — `RF-17` → `RF-17 CA-3` (últimas veinte) |
| RNF-01 CA-1 y CA-2 | `aceptacion/recorrido-v1.test.ts` — `RF-01 CA-2; RNF-01 CA-1 CA-2` (SHA-256, marcas de modificación y árbol antes/después) |
| RNF-02 CA-1 | `arquitectura/referencias-nativas.test.ts` — `RN-1` a `RN-6` (comparación y guion con dobles); trabajo CI `referencia-nativa` — `bun run referencias --raiz "$(npm root -g)"` (OpenCode 1.18.25 real contra las referencias, junto con RF-01) |
| RNF-03 CA-1 | `aceptacion/RNF-03.test.ts` — `RNF-03 CA-1` (único recorrido de toda la matriz de dependencias) |
| RNF-03 CA-2 | `aceptacion/RNF-03.test.ts` — `RNF-03 CA-2` (único recorrido de identificaciones) |
| RNF-03 CA-3 | `aceptacion/RNF-03.test.ts` — `RNF-03 CA-3` (adaptador ficticio) |
| RNF-09 CA-1, CA-2 y CA-3 | `aceptacion/RNF-09.test.ts` — `RNF-09 CA-1`, `RNF-09 CA-2`, `RNF-09 CA-3`; `aceptacion/recorrido-v1.test.ts` — `V-7 RNF-09 ADR-062 C7` (defensas en resolver/recuperar, sin guardar ante rechazo) |
| RNF-10 CA-1, CA-2 y CA-3 | `aceptacion/RNF-10.test.ts` — `RNF-10 CA-1`, `RNF-10 CA-2`, `RNF-10 CA-3` (cabeceras, licencia exacta, avisos y SHA-256) |
| T2-03 V-1 a V-5 | `../paquetes/opencode/vendor/permiso.test.ts` — `V-1 evaluate`, `V-2 match`, `V-3 fromConfig`, `V-4 Object.entries`, `V-5 disabled` |
| T2-03 G-1 | `arquitectura/vendor.test.ts` — `G-1 no circularidad del oraculo` (recorrido transitivo y regresion sintetica) |
| RD-01 | `../paquetes/nucleo/resolucion/resolver.test.ts` — `N-1 RD-01` (reemplazo y procedencia); `../paquetes/opencode/ubicador.test.ts` — `U-5` (orden de archivos declarado por el adaptador) |
| T2-04 F-1 y F-2 RD-02 | `../paquetes/nucleo/resolucion/fusion.test.ts` — `T2-04 F-1 RD-02`, `T2-04 F-2`; `../paquetes/opencode/fusion.test.ts` — `T2-04 F-1 F-2`; `../paquetes/opencode/secuenciador.test.ts` — `T2-04 F-1 F-2 secuencia` (ambos sentidos, objetos vacios e historia de subarbol) |
| T2-04 F-3 y F-5 | `../paquetes/opencode/fusion.test.ts` — `T2-04 F-3`, `T2-04 F-5` (consulta de permiso del agente con procedencia y segmento con punto) |
| T2-04 F-4 | `../paquetes/nucleo/resolucion/fusion.test.ts` — `T2-04 F-4` (preorden, indices enteros, limite y claves similares) |
| T2-04 F-6 | `../paquetes/opencode/fusion.test.ts` — `T2-04 F-6` (tools bloquea su ambito completo, sin afectar otros agentes ni claves) |
| T2-04 F-7 | `../paquetes/nucleo/resolucion/fusion.test.ts` — `T2-04 F-7` (retirada del ficticio, rastro eliminado, causa y recreacion al final) |
| T2-04 F-8 | `aceptacion/RF-01.test.ts` — `RF-01 CA-1 v1-vias` (options.a resuelta contra la referencia, mismas entradas y procedencia) |
| T2-04 aceptacion RF-01 CA-1 CA-2 | `aceptacion/fusion-permisos.test.ts` — `T2-04 F-1 F-3 F-4 F-5 RF-01 CA-1 CA-2` (escenario v2-fusion-permisos por CLI, posiciones, puntero JSON, orden, determinismo y SHA-256) |
| T2-04 menores 1 a 5 | `../paquetes/nucleo/resolucion/fusion.test.ts` — `T2-04 menor 2`; `../paquetes/nucleo/resolucion/contrato.test.ts` — `C1-2 RD-02`; `../paquetes/opencode/fusion.test.ts` — `T2-04 menor 4` (indices solo en el resolver, origen copiado, z antes de b/a; web ya delega el analisis de ruta al caso de uso desde T2-02) |
| ADR-061: preparación explícita y esquema incompatible | `../paquetes/rige/adaptadores/almacen-sqlite/esquema.test.ts` — `T0-09 preparacion explicita SQLite`, `AL-1`; `aceptacion/arranque.test.ts` — `A-6` (rechazo sin crear ni migrar) |
| ADR-061: documento, retención e inmutabilidad | `../paquetes/rige/adaptadores/almacen-sqlite/resoluciones.test.ts` — `R-1 RF-17 CA-1`, `R-2 RF-17 CA-3`, `R-3`, `R-4` (persistencia, transacción, retención por proyecto, UPDATE prohibido y esquema exigido) |

Las rutas son relativas a esta carpeta. Los casos del analizador se conservan en tablas: una prueba compara todos los resultados e identifica cada entrada en el diff.

T2-05 usa `utilidades/consultar-cadenas.ts` como CLI del arnes: ejecuta el
contrato del adaptador en un subproceso aislado, sin adelantar la interfaz de
decisiones de T2-06. Las referencias provienen del binario, nunca del vendor.
RF-01 tambien resuelve por subproceso para conservar la guarda de no circularidad.
Los comandos para comprobar y regenerar estan en `../README.md`.

T2-06 consulta la funcion de aplicacion en `utilidades/consultar-permisos.ts`,
desde un subproceso con entorno aislado, sin implementar una interfaz de
producto. Las aceptaciones no importan vendor ni transitivamente (G-1).
`v2-decision/REFERENCIA.json` tiene cadenas del binario y decisiones derivadas
a mano documentadas en `DERIVACION.md`. El modo `primera` del arnes sustituye
solo la seleccion de la determinante para comprobar sensibilidad.

T2-07 amplia ese arnes con `lanzadoPor` y conserva el aislamiento por
subproceso. `v2-subagente/REFERENCIA.json` registra las cuatro decisiones
de RF-02 CA-3 y su procedencia del tag y de ADR-081, C-3f. Las variantes
`v2-subagente-comodin` y `v2-subagente-task` conservan el nombre `general`
y cambian solo su permiso: `* allow` o `task ask`. Las cadenas base se
regeneran con el binario; la regeneracion no recalcula las decisiones.
`primary.json` se copia a `opencode.jsonc` solo en el temporal del arnes.

| Criterio T2-07 | Prueba en `aceptacion/RF-02.test.ts` |
|---|---|
| RF-02 CA-3 (a)-(d) | decision, indices, cadena propia, origen y declaraciones de exclusion |
| RF-02 CA-3 (e) | una sola regla todowrite de general y agregado para agente sin ella |
| RF-02 CA-3 (f) | advertencia solo con primary_tools, sin incorporar su deny |
| S-1 | lanzador inexistente: agente-inexistente |
| Agente primary | se evalua e informa que no es invocable como subagente |

| Criterio T2-06 | Prueba |
|---|---|
| RF-02 CA-1, CA-2 (decision), CA-5, CA-8 (decision) | `aceptacion/RF-02.test.ts` (decision, cadena, origen, declaraciones y referencia independiente) |
| RF-09 CA-1, CA-2 | `aceptacion/RF-09.test.ts` (anulacion nativa de plan, build sin edit declarado y bash deny) |
| D-1 | `../paquetes/rige/aplicacion/casos-uso/consultar-permiso.test.ts` (ficticio sin reglas: ask); `../paquetes/nucleo/permisos/decidir.test.ts` (defecto opaco) |
| D-2 | `aceptacion/RF-02.test.ts` CA-5; `../paquetes/nucleo/permisos/decidir.test.ts` (eje parcial) |
| D-3 | `aceptacion/RF-02.test.ts`, `aceptacion/RF-09.test.ts` (las mismas aserciones rechazan primera coincidencia) |
| D-4 RNF-03 | `../paquetes/nucleo/permisos/decidir.test.ts`, `../paquetes/rige/aplicacion/casos-uso/consultar-permiso.test.ts` (otro vocabulario y orden de efectos) |
| D-5 | `../paquetes/opencode/permisos.test.ts` (win32 y linux, sin cambiar process.env) |

- `aceptacion/`: criterios del catálogo y recorridos de las interfaces; `RF-01.test.ts` conserva además las comparaciones estructuradas con las referencias nativas.
- `arquitectura/`: recorridos únicos del repositorio, regresiones sintéticas de las guardas y estructura del README.
- `escenarios/`: entradas controladas y referencias nativas; los casos que escriben usan copias temporales.
- `utilidades/`: aislamiento, dobles, copia de escenarios, subprocesos y cliente HTTP local del arnés.
- `../paquetes/`: unitarias junto al código; cada regla se verifica en su capa y los casos de uso comprueban su integración con los puertos.
