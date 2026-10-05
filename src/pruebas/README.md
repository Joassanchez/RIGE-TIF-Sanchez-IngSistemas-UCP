# Mapa de pruebas

| Criterio o regla | Prueba (archivo y `describe`) |
|---|---|
| RF-01 CA-1 | `aceptacion/recorrido-v1.test.ts` — `RF-01 CA-1 · recorrido del README (guía, paso 8)`; `aceptacion/RF-01.test.ts` — `RF-01 CA-1` (referencia nativa y rastro como objeto) |
| RF-01 CA-2 | `aceptacion/recorrido-v1.test.ts` — `RF-01 CA-2; RNF-01 CA-1 CA-2`; `aceptacion/RF-01.test.ts` — `RF-01 CA-2` (referencia nativa y rastros de todas las claves) |
| RF-17 CA-1 | `aceptacion/recorrido-v1.test.ts` — `RF-17` → `RF-17 CA-1` (recuperación tras reiniciar) |
| RF-17 CA-2 | `aceptacion/recorrido-v1.test.ts` — `RF-17` → `RF-17 CA-2` (resumen distinto y resolución anterior intacta) |
| RF-17 CA-3 | `aceptacion/recorrido-v1.test.ts` — `RF-17` → `RF-17 CA-3` (últimas veinte) |
| RNF-01 CA-1 y CA-2 | `aceptacion/recorrido-v1.test.ts` — `RF-01 CA-2; RNF-01 CA-1 CA-2` (SHA-256, marcas de modificación y árbol antes/después) |
| RNF-03 CA-1 | `aceptacion/RNF-03.test.ts` — `RNF-03 CA-1` (único recorrido de toda la matriz de dependencias) |
| RNF-03 CA-2 | `aceptacion/RNF-03.test.ts` — `RNF-03 CA-2` (único recorrido de identificaciones) |
| RNF-03 CA-3 | `aceptacion/RNF-03.test.ts` — `RNF-03 CA-3` (adaptador ficticio) |
| RNF-09 CA-1, CA-2 y CA-3 | `aceptacion/RNF-09.test.ts` — `RNF-09 CA-1`, `RNF-09 CA-2`, `RNF-09 CA-3`; `aceptacion/recorrido-v1.test.ts` — `V-7 RNF-09 ADR-062 C7` (defensas en resolver/recuperar, sin guardar ante rechazo) |
| RD-01 | `../paquetes/nucleo/resolucion/resolver.test.ts` — `N-1 RD-01` (reemplazo y procedencia); `../paquetes/opencode/ubicador.test.ts` — `U-5` (orden de archivos declarado por el adaptador) |
| ADR-061: preparación explícita y esquema incompatible | `../paquetes/rige/adaptadores/almacen-sqlite/esquema.test.ts` — `T0-09 preparacion explicita SQLite`, `AL-1`; `aceptacion/arranque.test.ts` — `A-6` (rechazo sin crear ni migrar) |
| ADR-061: documento, retención e inmutabilidad | `../paquetes/rige/adaptadores/almacen-sqlite/resoluciones.test.ts` — `R-1 RF-17 CA-1`, `R-2 RF-17 CA-3`, `R-3`, `R-4` (persistencia, transacción, retención por proyecto, UPDATE prohibido y esquema exigido) |

Las rutas son relativas a esta carpeta. Los casos del analizador se conservan en tablas: una prueba compara todos los resultados e identifica cada entrada en el diff.

- `aceptacion/`: criterios del catálogo y recorridos de las interfaces; `RF-01.test.ts` conserva además las comparaciones estructuradas con las referencias nativas.
- `arquitectura/`: recorridos únicos del repositorio, regresiones sintéticas de las guardas y estructura del README.
- `escenarios/`: entradas controladas y referencias nativas; los casos que escriben usan copias temporales.
- `utilidades/`: aislamiento, dobles, copia de escenarios, subprocesos y cliente HTTP local del arnés.
- `../paquetes/`: unitarias junto al código; cada regla se verifica en su capa y los casos de uso comprueban su integración con los puertos.
