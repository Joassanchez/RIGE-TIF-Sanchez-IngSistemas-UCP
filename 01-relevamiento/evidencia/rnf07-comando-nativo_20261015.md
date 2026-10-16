# RNF-07 · Tiempo del comando nativo de OpenCode · 15/10/2026

Medición del ingeniero para fundar el umbral de RNF-07 (ADR-096).

| Campo | Valor |
|---|---|
| Fecha | 15/10/2026 |
| Equipo | Contenedor de referencia `rige-linea-base:1.18.25` (Ubuntu 26.04, `linux/amd64`), Docker Desktop sobre WSL 2; 12 procesadores lógicos y 8 GB asignados (`docker info`: 12 CPU, 8.160.690.176 bytes) |
| Red | Desactivada (`--network none`) |
| Herramienta | OpenCode 1.18.25 (`opencode --version`) |
| Escenario | `src/pruebas/escenarios/v1-precedencia` (tres entradas de proyecto: `opencode.json` del padre, `proyecto/opencode.json` y `proyecto/opencode.jsonc`) |
| Aislamiento | Copia del escenario en un temporal con `git init`; `HOME` en un directorio vacío y `XDG_*` vacías |
| Comando | `opencode debug agent build`, ejecutado desde `proyecto/` |
| Validez | Una corrida previa, sin cronometrar, termina con código 0 y devuelve `temperature` 0.3 y la descripción del escenario, igual que `REFERENCIA.json` |
| Medición | Diez corridas consecutivas, cada una un proceso nuevo; tiempo de pared con `date +%s%N`, salida descartada |

| Corrida | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| ms | 1265 | 1163 | 1131 | 1177 | 1199 | 1150 | 1176 | 1258 | 1244 | 1160 |

**Resumen:** mínimo 1131 ms; mediana 1176,5 ms; peor caso 1265 ms.

**Límites:** el escenario es mínimo (tres archivos, un agente). No es el proyecto de referencia de RNF-07 CA-1 (doble de openchamber `fc012ae`), que no se midió porque el contenedor corre sin red. No se midió RIGE: la CLI del v1 no tiene todavía un subcomando de consulta.
