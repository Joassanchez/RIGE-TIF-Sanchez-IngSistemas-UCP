# Sondas descriptivas de ADR-089

Hoja cerrada el 14/10/2026. Ejecutar después del 20/10/2026, en la misma
ventana de cuota que P3, en orden P3 → R → E. Si falta cuota, cortar E primero.
No reemplazan LB, ni cambian corrección, umbrales, ramas o la invalidez de ADR-086.

Desde `01-relevamiento/linea-base/`, en Git Bash o WSL, con Docker preparado y
`OPENCODE_AUTH_JSON` ya exportada por el autor (no imprimirla). Reconstruir la
imagen con el arnés actualizado:

```bash
bash vm/contenedor.sh construir
EVIDENCIA="$HOME/evidencia-MED8-20261021"
mkdir -p "$EVIDENCIA"
HASH_R=$(sha256sum sondas/sonda-R.md)
HASH_R=${HASH_R%% *}
HASH_E=$(sha256sum sondas/sonda-E.md)
HASH_E=${HASH_E%% *}
HASH_TAREAS=$(sha256sum modificacion/tareas.md)
HASH_TAREAS=${HASH_TAREAS%% *}
```

Cada destino de medición debe existir y estar vacío, fuera del repositorio.
Los dos bucles constituyen las tandas R (12 ejecuciones) y E (24), cada una con
build (`principal`) y `[AUX] Charles` (`charles`), modelo `gpt-6.1-sol`, k = 3,
límite 600 s y semilla 20261021. Las respuestas nunca entran al contenedor.

```bash
for EJECUTOR in principal charles; do
  mkdir "$EVIDENCIA/R-$EJECUTOR"
  bash vm/contenedor.sh medir --destino "$EVIDENCIA/R-$EJECUTOR" \
    --tanda "20261021-sonda-R-$EJECUTOR" --dimension atribucion \
    --sonda sondas/sonda-R.md --hash-sonda "$HASH_R" \
    --casos C-3b,C-3d --condicion LB --brazo LB --ejecutor "$EJECUTOR" \
    --modelo openai/gpt-6.1-sol --k 3 --limite 600 --semilla 20261021
 done

for EJECUTOR in principal charles; do
  mkdir "$EVIDENCIA/E-$EJECUTOR"
  bash vm/contenedor.sh medir --destino "$EVIDENCIA/E-$EJECUTOR" \
    --tanda "20261021-sonda-E-$EJECUTOR" --dimension modificacion \
    --sonda sondas/sonda-E.md --hash-sonda "$HASH_E" --hash-tareas "$HASH_TAREAS" \
    --casos C-1d,C-1f,C-3b,C-4e --condicion LB --brazo LB --ejecutor "$EJECUTOR" \
    --modelo openai/gpt-6.1-sol --k 3 --limite 600 --semilla 20261021
 done
```

La sonda R copia literalmente las dos preguntas de ADR-089. La E conserva el
bloque de instrucción de `tareas.md`, sustituyendo únicamente las dos primeras
frases sobre ubicación y ejecución por «El desarrollador tiene su proyecto
abierto en su terminal; para ejecutar comandos en él, con sus variables y su
configuración, usá:». Los puntos suspensivos del ADR indican la continuación
conservada. Los cuatro enunciados se leen de `tareas.md`, validado con su hash.

Corrección externa, con las mismas hojas cerradas:

```bash
for EJECUTOR in principal charles; do
  python herramientas/corregir.py "$EVIDENCIA/R-$EJECUTOR/registro.jsonl" \
    --respuestas respuestas.json --salida "$EVIDENCIA/R-$EJECUTOR/corregido.jsonl"
  python herramientas/corregir_modificacion.py "$EVIDENCIA/E-$EJECUTOR/registro.jsonl" \
    --respuestas modificacion/respuestas-modificacion.json \
    --salida "$EVIDENCIA/E-$EJECUTOR/corregido.jsonl"
done
```

Si aparecen revisiones manuales, resolverlas con la hoja existente y volver a
correr el mismo corrector agregando `--adjudicaciones <CSV>`; no editar el crudo.

Para comparar, copiar la evidencia histórica íntegra fuera del repositorio.
Conservar las correcciones al lado de su `crudo/`, porque el análisis E usa sus
copias y diffs. Recalcular la corrección con ADR-086 y conservar las
adjudicaciones humanas ya aprobadas, si las hay:

```bash
for EJECUTOR in principal charles; do
  cp -R "verificacion/20261013-LB-$EJECUTOR-sol" "$EVIDENCIA/LB-R-$EJECUTOR"
  cp -R "verificacion/20261014-LB-mod-$EJECUTOR-sol" "$EVIDENCIA/LB-E-$EJECUTOR"
  python herramientas/corregir.py "$EVIDENCIA/LB-R-$EJECUTOR/registro.jsonl" \
    --respuestas respuestas.json --salida "$EVIDENCIA/LB-R-$EJECUTOR/corregido.jsonl"
  python herramientas/corregir_modificacion.py "$EVIDENCIA/LB-E-$EJECUTOR/registro.jsonl" \
    --respuestas modificacion/respuestas-modificacion.json \
    --salida "$EVIDENCIA/LB-E-$EJECUTOR/corregido.jsonl"
done
cp -R verificacion/20261014-LB-mod-charles-b-sol "$EVIDENCIA/LB-E-charles-b"
python herramientas/corregir_modificacion.py "$EVIDENCIA/LB-E-charles-b/registro.jsonl" \
  --respuestas modificacion/respuestas-modificacion.json \
  --salida "$EVIDENCIA/LB-E-charles-b/corregido.jsonl"
```

Charles repitió C-3b:2 en la tanda b. Seleccionar esa repetición y excluir la
anterior en un archivo derivado, sin cambiar los registros:

```bash
python - "$EVIDENCIA/LB-E-charles" <<'PY'
from pathlib import Path
import json, sys
base = Path(sys.argv[1])
rows = [json.loads(l) for l in (base / 'corregido.jsonl').read_text(encoding='utf-8').splitlines()]
rows = [r for r in rows if (r['caso'], r['repeticion']) != ('C-3b', 2)]
(base / 'seleccion.jsonl').write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows), encoding='utf-8')
PY

python herramientas/analizar.py --sonda R --dimension atribucion \
  "$EVIDENCIA/LB-R-principal/corregido.jsonl" "$EVIDENCIA/LB-R-charles/corregido.jsonl" \
  "$EVIDENCIA/R-principal/corregido.jsonl" "$EVIDENCIA/R-charles/corregido.jsonl" \
  --destino "$EVIDENCIA/analisis-R"
python herramientas/analizar.py --sonda E --dimension modificacion \
  "$EVIDENCIA/LB-E-principal/corregido.jsonl" "$EVIDENCIA/LB-E-charles/seleccion.jsonl" \
  "$EVIDENCIA/LB-E-charles-b/corregido.jsonl" \
  "$EVIDENCIA/E-principal/corregido.jsonl" "$EVIDENCIA/E-charles/corregido.jsonl" \
  --destino "$EVIDENCIA/analisis-E"
```

`informe.md` y `analisis.json` comparan por caso y ejecutor, sin ramas ni
cumplimiento. R: errores 0/3 → dependiente de la redacción; 1/3 → inestable;
2/3 o 3/3 → robusta a la redacción. E: proporción de patrones que empiezan con
`/` sobre todas las reglas de permiso de los archivos tocados y proporción
`sin_efecto` sobre las ejecuciones. Un permiso escalar cuenta como patrón `*`.
Se cuentan los archivos finales de cada intento, sin sumar reglas nativas de
`debug agent`. Si ambas proporciones llegan a cero: inducido por la instrucción;
si no: propio del agente en este entorno. El ejecutor sigue fuera del árbol.

Se exigen tres repeticiones completas y únicas por caso en ambos lados. Si
faltan datos, hay contaminación o el denominador de reglas es cero, la lectura
queda no concluyente. Los contenidos nuevos se validan contra el hash final;
los históricos se reconstruyen desde `archivos-antes` y los diffs registrados.
En C-3b de Charles (repeticiones 1 y 3 originales y 2 de la tanda b), la creación
por bash no conserva contenido final reconstruible con el hash: su proporción
de rutas LB queda pendiente y la lectura conjunta no concluyente. No se
sustituye esa evidencia por la configuración efectiva combinada. Los errores y
`sin_efecto` se informan igualmente. Una modificación que impida encontrar el
proyecto debe declararse no concluyente según ADR-089, además de la tabla.

Verificación sin red ni Docker:

```bash
python -m unittest discover -s herramientas -p 'test_*.py'
python -m unittest discover -s vm/simulado -p 'test_*.py'
bash -n vm/medir.sh vm/contenedor.sh
```
