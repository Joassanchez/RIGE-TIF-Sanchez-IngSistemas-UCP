# Análisis de la línea de base de modificación (14/10/2026)

## Fuentes

- **Registros crudos:** `../20261014-LB-mod-principal-sol/` (`build`, `gpt-6.1-sol`, de 14:59 a 16:06), `../20261014-LB-mod-charles-sol/` (`[AUX] Charles`, de 16:06 a 17:14, detenida por cuota en C-3b:2, 64 pares) y `../20261014-LB-mod-charles-b-sol/` (los 8 pares restantes con `--pares`, de 17:54 a 18:02). Las dos tandas de Charles se unen con `herramientas/unir.py` (72 de 72, 0 faltantes; parámetros y hashes idénticos). k = 3, semilla 20261014, tiempo límite 600 s. Hash de `modificacion/tareas.md`: `2f9d488a64d812a13ee83f11b62cc61fc9fa8b56784da410f77e9b55fc041f27`.
- **Corrección:** `herramientas/corregir_modificacion.py` contra `modificacion/respuestas-modificacion.json` (hoja cerrada el 14/10/2026). Sin adjudicaciones manuales: 0 revisiones pendientes.
- **Análisis:** `herramientas/analizar.py --dimension modificacion` (`informe-analizar.md`), con Charles corregido por tanda y unido. Registros de las tandas: `LB-principal.log`, `LB-charles.log`, `LB-charles-b.log`.

## Resultado

| | `build` | Charles |
|---|---|---|
| Correctas | 64 | 64 |
| Sin efecto | 8 | 8 |
| Colateral, incorrecta, sin respuesta | 0 | 0 |
| Éxito declarado falso | 8 | 8 |
| Fuera de la configuración, entorno alterado, censuradas | 0 | 0 |
| Equivalente USD | 4,55 | 4,86 |
| Validez previa (ADR-079, §2) | **no válida** (C-1f 3/3) | **no válida** (C-1f 3/3) |

**Sin efecto por caso** (`build` · Charles): C-1f (3 · 3), C-3b (3 · 3), C-1d (1 · 1), C-4e (1 · 1). Los dos ejecutores fallan en los mismos casos y con la misma frecuencia. Mecanismo único: regla de permiso por archivo con ruta absoluta; OpenCode la evalúa contra la ruta relativa al worktree y no coincide.

**Verificación nativa** (`verificacion-nativa-ruta/`): `permisos.sh C-1f` con la regla del agente (`opencode-absoluta.json`) da `deny`; con la regla relativa (`opencode-relativa.json`), `allow`.

**Acceso web:** Charles C-3b:1, C-3b:2 y C-3b:3 estaban marcados por el `$schema` dentro de un comando (falso positivo); con la regla corregida de ADR-086, punto 5 (MED-7, `herramientas/deteccion.py`), pasan a 0. Charles C-3f:2 es un acceso real con `curl` a `raw.githubusercontent.com` y conserva la marca: C-3f queda excluido del análisis de Charles, como prevé el diseño. En las tandas de atribución el recálculo no cambia ninguna fila.

**Lectura:** ADR-086 (aceptado el 14/10/2026): mediciones no válidas, causa no instrumental, sin repetición, informe descriptivo.

## Archivos que no se conservan

Los `crudo/*.eventos.txt` (se regeneran del `stdout` con `extraer_eventos` de `vm/medir.sh`) y los `corregido.jsonl` (se regeneran con `corregir_modificacion.py`).
