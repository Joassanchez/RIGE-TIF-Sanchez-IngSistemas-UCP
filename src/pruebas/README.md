# Mapa de pruebas

| Criterio o regla | Prueba (archivo y `describe`) |
|---|---|
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
| ADR-061: preparación explícita y esquema incompatible | `../paquetes/rige/adaptadores/almacen-sqlite/esquema.test.ts` — `T0-09 preparacion explicita SQLite`, `AL-1`; `aceptacion/arranque.test.ts` — `A-6` (rechazo sin crear ni migrar) |
| ADR-061: documento, retención e inmutabilidad | `../paquetes/rige/adaptadores/almacen-sqlite/resoluciones.test.ts` — `R-1 RF-17 CA-1`, `R-2 RF-17 CA-3`, `R-3`, `R-4` (persistencia, transacción, retención por proyecto, UPDATE prohibido y esquema exigido) |

Las rutas son relativas a esta carpeta. Los casos del analizador se conservan en tablas: una prueba compara todos los resultados e identifica cada entrada en el diff.

- `aceptacion/`: criterios del catálogo y recorridos de las interfaces; `RF-01.test.ts` conserva además las comparaciones estructuradas con las referencias nativas.
- `arquitectura/`: recorridos únicos del repositorio, regresiones sintéticas de las guardas y estructura del README.
- `escenarios/`: entradas controladas y referencias nativas; los casos que escriben usan copias temporales.
- `utilidades/`: aislamiento, dobles, copia de escenarios, subprocesos y cliente HTTP local del arnés.
- `../paquetes/`: unitarias junto al código; cada regla se verifica en su capa y los casos de uso comprueban su integración con los puertos.
