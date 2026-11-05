# RNF-07 · Comando nativo sobre el proyecto de referencia · 04/11/2026

Medición del ingeniero que cumple la nueva medición prevista en el motivo de prioridad de RNF-07 (ADR-055, ADR-096). No mide RIGE. Salida cruda: `rnf07-comando-nativo-referencia_20261104.txt`.

| Campo | Valor |
|---|---|
| Fecha | 04/11/2026, finalizada a las 16:46 (UTC-3) |
| Equipo | Contenedor `rige-linea-base:1.18.25` (imagen `sha256:a691196f0e3e…`), Docker Desktop 29.9.2 sobre WSL 2; 12 procesadores lógicos y 8.160.690.176 bytes (`docker info`) |
| Red | Desactivada (`--network none`) |
| Herramienta | OpenCode 1.18.25; SHA-256 del binario `d91e0d33…dc60eeb`, igual al registrado en el `Dockerfile` |
| Escenario | `src/pruebas/escenarios/openchamber-doble` de la etiqueta `congelada` (`0df6cb7`), 32 archivos, extraído con `git archive` |
| Aislamiento | Copia en un temporal con `git init`; `HOME` en un directorio vacío y `XDG_*` sin definir |
| Validez | `opencode agent list`, `debug agent build` y `debug agent agent-1` terminan con código 0 y sin errores. La lista incluye los 12 agentes del escenario |
| Medición | Diez corridas consecutivas por comando, cada una un proceso nuevo; tiempo de pared con `date +%s%N`, salida descartada; todas con código 0. Antes de cada serie se ejecuta la corrida de validez, sin cronometrar |

| Corrida | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Mínimo | Mediana | Peor |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `debug agent build` (ms) | 2071 | 1767 | 1493 | 1536 | 1549 | 1496 | 1521 | 1509 | 1580 | 1553 | 1493 | 1542,5 | **2071** |
| `debug agent agent-1` (ms) | 1540 | 1554 | 1589 | 1547 | 1718 | 1767 | 1653 | 1547 | 1532 | 1532 | 1532 | 1550,5 | 1767 |

**Resultado:** en `build`, el peor caso supera los 2000 ms. Según el motivo de RNF-07, «si supera los 2 s, el umbral se revisa con la referente». Esa revisión queda abierta y la decide el autor. La corrida de 2071 ms se conserva: no hay un protocolo declarado que permita excluirla.

## Repetición del mismo día

Protocolo fijado antes de ejecutar: tres series nuevas de los dos comandos, de diez corridas cada una, cada serie en un contenedor nuevo y con todo lo demás igual; se informan todas las corridas, sin excluir ninguna. De 16:59 a 17:01. Salida cruda: `rnf07-comando-nativo-repeticion_20261104.txt`. Todas terminan con código 0.

| Serie | `build`: mínimo · mediana · peor (ms) | `agent-1`: mínimo · mediana · peor (ms) |
|---|---|---|
| 1 | 1233 · 1320 · 1508 | 1315 · 1350 · 1469 |
| 2 | 1270 · 1318 · 1402 | 1315 · 1362 · 1421 |
| 3 | 1293 · 1322,5 · 1456 | 1248 · 1304,5 · 1351 |

**Lectura conjunta:** de 80 corridas, una supera los 2000 ms, la de 2071 ms de la primera medición, que se conserva. El peor caso de la repetición es de 1508 ms. Las medianas de la primera medición son unos 200 ms mayores; esa medición corrió poco después de iniciar Docker Desktop, pero la causa de la diferencia no se determinó. La repetición no anula la cláusula del motivo de RNF-07: la revisión con la referente la decide el autor.

**Límites:**
- Son pocas corridas en una sesión: delimitan lo observado y no estiman el comportamiento general. No se controló la carga del anfitrión.
- La corrida de 2071 ms es la primera de su serie. La causa no se determinó.
- La medición del 15/10/2026 (1265 ms de peor caso) usó un escenario mínimo, de modo que la diferencia no separa el efecto del tamaño de otros factores.
- RNF-07 CA-1 fija la base `ubuntu:26.04` en `sha256:da6fc2be…`, mientras que el `Dockerfile` de esta imagen declara `sha256:88a381d5…`. No se verificó con qué base se construyó la imagen.
- Valida que OpenCode resuelve el escenario y que lista sus agentes; no compara cada valor con RIGE.
