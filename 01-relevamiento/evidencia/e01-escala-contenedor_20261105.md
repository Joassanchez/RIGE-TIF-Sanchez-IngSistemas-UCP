# E-01 · Medición de escala de RIGE en el contenedor de referencia · 05/11/2026

Experimento E-01 del Instrumento 39. Mide cuánto crece el tiempo al multiplicar por diez el tamaño del proyecto, y dónde cede con muchas reglas de permiso.

| Campo | Valor |
|---|---|
| Fecha | 05/11/2026 |
| Revisión medida | Commit `c9b6746`, rama `cierre-ae4`, clonada dentro del contenedor. Respecto de `congelada` (`0df6cb7`) solo cambian cuatro archivos de `src/herramientas/`: el producto es el mismo |
| Imagen | `rige-medicion:congelada`, `sha256:0088bbb1962b…`. Ubuntu 26.04.1 LTS, Bun 1.3.14, 12 procesadores lógicos |
| Red | Desactivada (`--network none`) |
| Escenarios | `openchamber-doble` (32 archivos, 3 valores de permiso declarados), el mismo escenario con factor 10 (311 archivos: 110 agentes y 200 comandos en Markdown, más un JSON), y un proyecto mínimo con un agente y R reglas |
| Comandos | `bun run --silent medir:rnf07 --estricto` y `bun run --silent medir:rnf07 --escala --salida …`; sonda de reglas de una sola vez, fuera del repositorio |
| Datos crudos | `e01-escala_20261105.json` y `e01-reglas_20261105.json` |

## Serie de tamaño (10 corridas por consulta, invocación completa, ms)

| Archivos | Consulta | Mínimo | Mediana | Peor | Cociente de mediana | Cociente de peor |
|---|---|---:|---:|---:|---:|---:|
| 32 | `valores` | 42,746 | 44,441 | 54,167 | | |
| 32 | `permiso` | 45,706 | 46,527 | 50,247 | | |
| 32 | `hallazgos` | 46,712 | 53,829 | 65,895 | | |
| 32 | `permiso --explicar` | 49,006 | 50,789 | 61,181 | | |
| 311 | `valores` | 80,257 | 88,128 | 107,557 | 1,983 | 1,986 |
| 311 | `permiso` | 86,452 | 89,092 | 107,980 | 1,915 | 2,149 |
| 311 | `hallazgos` | 90,363 | 93,882 | 101,711 | 1,744 | 1,544 |
| 311 | `permiso --explicar` | 84,729 | 87,574 | 91,415 | 1,724 | 1,494 |

**Resultado de E-01.** (a) Las cuatro consultas quedan debajo de 2000 ms. (b) El cociente queda en 2,15 o menos, frente al umbral de 10. Se persevera sin caché.

## Serie de reglas de `hallazgos` (10 corridas, invocación completa, ms)

| Reglas | Mediana | Peor | Cociente de peor |
|---:|---:|---:|---:|
| 10 | 42,044 | 44,454 | |
| 100 | 55,753 | 68,698 | 1,545 |
| 1000 | 351,575 | 360,317 | 5,245 |
| 10000 | 29247,399 | 30721,215 | 85,262 |

Con 10000 reglas, la mediana de lectura es de 2909 ms y la de resolución, de 26271 ms; la salida tarda 1 ms.

## Sonda del cruce de 2000 ms (5 corridas por consulta, ms)

Sonda exploratoria, con menos corridas que el protocolo de RNF-07.

| Reglas | `valores`, peor | `permiso`, peor | `hallazgos`, peor |
|---:|---:|---:|---:|
| 1000 | 141,5 | 186,2 | 394,2 |
| 1500 | 226,6 | 264,0 | 697,0 |
| 2000 | 347,0 | 350,2 | 1187,8 |
| 2500 | 483,7 | 482,5 | 1851,4 |
| 3000 | 659,3 | 685,9 | 2683,3 |
| 4000 | 1323,2 | 1159,9 | 4663,1 |
| 5000 | 1794,5 | 1795,5 | 7547,6 |

**Resultado.** `hallazgos` cruza los 2000 ms entre 2500 y 3000 reglas en un agente. `valores` y `permiso` siguen debajo con 5000; más allá quedan sin medir, y la lectura sola ya tarda 2909 ms con 10000 reglas.

## Lectura

- **Crecimiento.** Con reglas, multiplicar por diez multiplica el tiempo por unas 85 veces entre 1000 y 10000: crecimiento superlineal, cercano al cuadrático. Afecta a la lectura y a la resolución, comunes a las tres consultas, y más a `hallazgos`.
- **Causa.** No se perfiló. La diferencia entre `hallazgos` y las otras consultas apunta a la detección, que busca en cada regla entre las posteriores (`src/paquetes/nucleo/hallazgos/detectar.ts:90`). Es una hipótesis. La lectura y la resolución crecen también por otra causa, sin identificar.
- **Corrección a la medición del 04/11.** Aquel peor caso de 147,82 ms en `valores` era atípico: hoy, con el mismo producto y el mismo protocolo, es de 53,376 ms en `valores` y 50,624 ms en `permiso`. Los márgenes de esa corrida no ordenan las consultas.

## Límites

- Una sesión, sin control de la carga del anfitrión. El peor caso puede variar casi al triple entre sesiones (147,82 frente a 53,376 ms).
- Factor 10 da 311 archivos, no 320, porque el JSON se amplía por dentro en lugar de duplicarse.
- Multiplica agentes y comandos con el mismo contenido. Conserva la profundidad de los directorios y el tamaño de cada archivo.
- Las reglas de la serie son el peor caso elegido: mismo sujeto, patrones distintos, ninguna tapa a otra, en un solo agente. No representan un proyecto real.
- No se comparó con OpenCode sobre estos escenarios: mide tiempo, no fidelidad.
- Windows 11 no se repitió. El flujo web sigue sin medir (E-02).
