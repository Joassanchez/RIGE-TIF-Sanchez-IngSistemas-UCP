#!/usr/bin/env bash
# Una tanda MED-9c en cuatro contenedores, con unión externa estricta.
set -euo pipefail
[[ $# -ge 4 && $# -le 7 ]] || {
  echo 'Uso: bash herramientas/medir-med9c-paralelo.sh <evidencia> <tanda> <ecologica|deteccion> <principal|charles> [--fuera-del-arbol] [--k K]' >&2
  exit 2
}
EVIDENCIA=$1
TANDA=$2
DIMENSION=$3
EJECUTOR=$4
FUERA=0
[[ $TANDA =~ ^[A-Za-z0-9_-]+$ ]] || { echo 'Tanda inválida.' >&2; exit 2; }
[[ $DIMENSION == ecologica || $DIMENSION == deteccion ]] || { echo 'Dimensión inválida.' >&2; exit 2; }
[[ $EJECUTOR == principal || $EJECUTOR == charles ]] || { echo 'Ejecutor inválido.' >&2; exit 2; }
K=3
shift 4
while [[ $# -gt 0 ]]; do
  case $1 in
    --fuera-del-arbol) [[ $DIMENSION == ecologica ]] || exit 2; FUERA=1; shift ;;
    --k) [[ $# -ge 2 && $2 =~ ^[1-9][0-9]*$ ]] || exit 2; K=$2; shift 2 ;;
    *) echo 'Opci?n inv?lida.' >&2; exit 2 ;;
  esac
done
cd "$(dirname "${BASH_SOURCE[0]}")/.."
[[ ! -e $EVIDENCIA/$TANDA ]] || { echo 'La tanda destino debe ser nueva.' >&2; exit 2; }
mkdir -p "$EVIDENCIA/logs"

tanda4() {
  local tanda=$1 dimension=$2 ejecutor=$3 fuera=$4
  local parte pid estado=0
  local -a casos extra seleccion pids=() registros=()
  extra=()
  if [[ $fuera == 1 ]]; then extra=(--fuera-del-arbol); fi
  local -a grupos
  mapfile -t grupos < <(python - "$dimension" "$fuera" "$K" <<'PY'
import json, sys
from pathlib import Path
dimension, fuera, k = sys.argv[1], sys.argv[2] == '1', int(sys.argv[3])
casos = json.loads(Path('ecologica/escenarios.json').read_text(encoding='utf-8'))['dimensiones'][dimension]
pares = [f'{c}:{r}' for c in casos if not fuera or c.startswith('M-') for r in range(1, k+1)]
for n in range(min(4, len(pares))):
    print(','.join(pares[n::4]))
PY
)
  [[ ${#grupos[@]} -gt 0 ]] || return 1
  for parte in "${!grupos[@]}"; do
    grupos[$parte]=${grupos[$parte]%$'\r'}
    seleccion=(--pares "${grupos[$parte]}")
    casos[$parte]=$(python - "${grupos[$parte]}" <<'PY'
import sys
print(','.join(dict.fromkeys(p.split(':')[0] for p in sys.argv[1].split(','))))
PY
)
    casos[$parte]=${casos[$parte]%$'\r'}
    mkdir -p "$EVIDENCIA/$tanda/p$parte"
    registros+=("$EVIDENCIA/$tanda/p$parte/$tanda/corregido.jsonl")
    (
      bash vm/contenedor.sh medir --dimension "$dimension" \
        --tanda "$tanda" --ejecutor "$ejecutor" \
        --modelo openai/gpt-6.1-sol --k "$K" --limite 600 --semilla 20261015 \
        --condicion LB --brazo LB --casos "${casos[$parte]}" \
        "${extra[@]}" "${seleccion[@]}" --destino "$EVIDENCIA/$tanda/p$parte"
      python "herramientas/corregir_$dimension.py" \
        "$EVIDENCIA/$tanda/p$parte/$tanda/registro.jsonl" \
        --respuestas "ecologica/respuestas-$dimension.json" \
        --salida "$EVIDENCIA/$tanda/p$parte/$tanda/corregido.jsonl"
    ) >"$EVIDENCIA/logs/$tanda-p$parte.log" 2>&1 &
    pids+=("$!")
  done
  for pid in "${pids[@]}"; do wait "$pid" || estado=1; done
  [[ $estado == 0 ]] || { echo "Tanda $tanda detenida; revisar logs y evidencia." >&2; return 1; }
  python herramientas/unir.py "${registros[@]}" \
    --salida "$EVIDENCIA/$tanda/unida/corregido.jsonl"
}

tanda4 "$TANDA" "$DIMENSION" "$EJECUTOR" "$FUERA"
