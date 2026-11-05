# ANEXO IV · EVIDENCIA DE INTEGRACIÓN CONTINUA

El anexo registra las corridas del canal de construcción del repositorio, definido en `.github/workflows/ci.yml`, con su resultado y fecha.

| **Corrida** | **Fecha** | **Rama y revisión** | **Resultado** |
|---|---|---|---|
| 36648004501 | 29/09/2026 23:59 UTC | main · 3733217 | Fallida |
| 36746614001 | 30/09/2026 16:46 UTC | main · 2209ed1 | Fallida |
| 36751247736 | 30/09/2026 17:25 UTC | main · 4fe44b1 | Fallida |
| 36801042650 | 01/10/2026 01:25 UTC | inc0-esqueleto · 11c852e | Exitosa |
| 36803500213 | 01/10/2026 01:56 UTC | inc0-esqueleto · c0c84bf | Exitosa |
| 36810937928 | 01/10/2026 03:31 UTC | inc0-esqueleto · c27aea2 | Exitosa |
| 36810950028 | 01/10/2026 03:32 UTC | main · b1432eb | Exitosa |
| 36811267869 | 01/10/2026 03:36 UTC | main · 032c942 | Exitosa |
| 36912448189 | 01/10/2026 19:11 UTC | main · 8343508 | Exitosa |
| 36919937946 | 01/10/2026 20:12 UTC | main · 66aa8e7 | Exitosa |
| 36925525349 | 01/10/2026 20:59 UTC | main · e6a2b3a | Exitosa |
| 36930293435 | 01/10/2026 21:41 UTC | main · 9d67b8e | Exitosa |
| 36933877463 | 01/10/2026 22:14 UTC | main · 03948eb | Exitosa |
| 36961599237 | 02/10/2026 03:46 UTC | main · f4ad461 | Exitosa |
| 37019687010 | 02/10/2026 14:24 UTC | main · 0a6eb57 | Exitosa |
| 37023376319 | 02/10/2026 14:56 UTC | main · dfaf300 | Exitosa |
| 37033115261 | 02/10/2026 16:19 UTC | main · 3bf9604 | Exitosa |
| 37034201193 | 02/10/2026 16:28 UTC | main · dbe036c | Exitosa |
| 37041182988 | 02/10/2026 17:30 UTC | main · 6b871bd | Exitosa |
| 38822464930 | 15/10/2026 23:16 UTC | v1 · a57c26b | Exitosa |
| [DATO PENDIENTE: identificadores y fechas de las corridas con los dos fallos de Windows] | Corrección el 30/10/2026 | Revisiones fallidas por identificar; correcciones T2-19 en `8862069` y `5007e4c` | Dos fallos corregidos |
| 41720793417 | 03/11/2026 | Iteración 3 · `893a309`, posterior a v3 | Exitosa |
| 41743284212 | 03/11/2026 | main · `0df6cb7` | Exitosa |
| 41743288096 | 03/11/2026 | congelada · `0df6cb7` | Exitosa |

*Tabla A.IV.1. Registro de las corridas del canal de construcción del repositorio. Fuente: elaboración propia.*

Las tres corridas fallidas del 29 y el 30/09/2026 preceden a la primera corrida exitosa del 01/10/2026. El 30/10 se corrigen otros dos fallos de Windows mediante T2-19: la raíz de la unidad sin repositorio y la guarda del caché con nombres cortos 8.3. Los resultados exitosos se circunscriben a las corridas listadas.

La corrida n.º 41720793417 corresponde a `893a309`, corrección T3-12 posterior a la etiqueta v3, que apunta a `d8fa23e`. Esa etiqueta carece de corrida exitosa propia registrada. La última registrada es la n.º 41743288096, sobre `congelada`, del 03/11/2026, exitosa en Ubuntu y Windows en los trabajos de verificación y referencia nativa. La n.º 41743284212 acredita la misma revisión en `main`.
