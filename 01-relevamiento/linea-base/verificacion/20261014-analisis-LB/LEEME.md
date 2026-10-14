# Análisis de la línea de base (13 y 14/10/2026)

## Fuentes

- **Registros crudos:**
  - `../20261013-LB-principal-sol/` (`build`, `gpt-6.1-sol`, de 22:07:11 a 22:51:36);
  - `../20261013-LB-charles-sol/` (`[AUX] Charles`, `gpt-6.1-sol`, de 22:52:07 a 23:49:15).

  k = 3 y semilla 20261013 en las dos tandas (ADR-082). Las dos tienen 72 de 72 ejecuciones, sin ejecuciones incompletas, alteradas, censuradas ni reintentadas.
- **Corrección:** `herramientas/corregir.py` contra `respuestas.json` (hoja cerrada el 13/10/2026), con la regla de ADR-083 para las decisiones de permiso escritas como frase.
- **Análisis:** `herramientas/analizar.py`, con `tarifas-congeladas-20261001.json`.

## Adjudicación

- **Quién:** el ingeniero (Claude Code, Opus 5.5), por delegación expresa del autor (13/10/2026: «hazlos tú, de la mejor forma posible»). Cada fila de `adjudicaciones-*.csv` lleva su motivo.
- **Cuántas:** 61 en total. Son 36 de la primera corrección (casos C-1f, C-2a, C-2c, C-2f, C-3f y C-4f, todas correctas) y 25 producidas por la regla de ADR-083.
- **Criterio de C-3b y C-3d:** estricto, **confirmado por el autor el 14/10/2026**.
  - Correcta: la fuente afirma que la regla es nativa o incorporada, tal como exige la hoja («regla nativa no declarada en ningún archivo»).
  - Parcial: la fuente solo describe la regla efectiva que muestra `debug agent`.
- **Sensibilidad (se declara):** con un criterio laxo, 10 ejecuciones (C-3b: 6; C-3d: 4) pasan a correctas. `build` quedaría con 0 casos con problema (rama N) y Charles con 1 (rama P).

## Resultado

| | `build` + `gpt-6.1-sol` | Charles + `gpt-6.1-sol` |
|---|---|---|
| Validez previa | válida | válida |
| Casos con problema (C-2 a C-4) | 1 (C-3b) | 3 (C-3b, C-3d, C-4e) |
| Rama (ADR-079) | P | P |
| IV.3 | Reordena | Reordena |
| Errores de valor | 0 | 0 (todos los errores son parciales) |
| Equivalente en dólares | 3,84 | 4,01 |

Detalle por caso en `resumen-por-caso.txt` e `informe.md`.

## Archivos derivados que no se conservan

El 14/10/2026 se comprobó que estos archivos se regeneran idénticos y después se eliminaron:
- `corregido-*.jsonl` y `analisis.json`;
- los 144 `crudo/*.eventos.txt` de las dos tandas, que salen del `stdout` (y, en C-3f, de los `export`) con la función `extraer_eventos` de `vm/medir.sh`.

Para regenerarlos, desde `01-relevamiento/linea-base/`, con el arnés en la versión del commit que los acompaña:

```bash
for t in principal charles; do
  python herramientas/corregir.py verificacion/20261013-LB-$t-sol/registro.jsonl \
    --adjudicaciones verificacion/20261014-analisis-LB/adjudicaciones-LB-$t-sol.csv \
    --salida <destino>/corregido-LB-$t-sol.jsonl
done
python herramientas/analizar.py <destino>/corregido-LB-principal-sol.jsonl \
  <destino>/corregido-LB-charles-sol.jsonl \
  --tarifas tarifas-congeladas-20261001.json --destino <destino>
```
