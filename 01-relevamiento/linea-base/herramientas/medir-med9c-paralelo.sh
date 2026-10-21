#!/usr/bin/env bash
# Una tanda MED-9c en cuatro contenedores, con unión externa estricta.
set -euo pipefail
[[ $# -ge 4 ]] || {
  echo 'Uso: bash herramientas/medir-med9c-paralelo.sh <evidencia> <tanda> <ecologica|deteccion> <principal|charles> [--fuera-del-arbol] [--k K] [--ensayo] [--casos A,B,...]' >&2
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
SEMILLA=20261015
ENSAYO=0
CASOS=''
shift 4
while [[ $# -gt 0 ]]; do
  case $1 in
    --fuera-del-arbol) [[ $DIMENSION == ecologica ]] || exit 2; FUERA=1; shift ;;
    --k) [[ $# -ge 2 && $2 =~ ^[1-9][0-9]*$ ]] || exit 2; K=$2; shift 2 ;;
    --ensayo) ENSAYO=1; shift ;;
    --casos) [[ $# -ge 2 && -n $2 ]] || exit 2; CASOS=$2; shift 2 ;;
    *) echo 'Opción inválida.' >&2; exit 2 ;;
  esac
done
if [[ $ENSAYO == 1 && -n ${OPENCODE_AUTH_JSON:-} ]]; then
  echo 'El ensayo requiere un entorno sin OPENCODE_AUTH_JSON.' >&2
  exit 2
fi
cd "$(dirname "${BASH_SOURCE[0]}")/.."
[[ ! -e $EVIDENCIA/$TANDA ]] || { echo 'La tanda destino debe ser nueva.' >&2; exit 2; }
mkdir -p "$EVIDENCIA/logs"

tanda4() {
  local tanda=$1 dimension=$2 ejecutor=$3 fuera=$4
  local parte pid reparto estado=0
  local -a extra union pids=() registros=()
  extra=()
  if [[ $fuera == 1 ]]; then extra=(--fuera-del-arbol); fi
  if [[ $ENSAYO == 1 ]]; then extra+=(--ensayo); fi
  union=()
  if [[ -n $CASOS ]]; then union=(--casos "$CASOS"); fi
  local -a grupos
  reparto=$(python - "$dimension" "$fuera" "$K" "$SEMILLA" "$CASOS" "$EVIDENCIA/$tanda/reparto.json" <<'PY'
import json, random, sys
from pathlib import Path
dimension, fuera, k = sys.argv[1], sys.argv[2] == '1', int(sys.argv[3])
semilla, seleccion, destino = int(sys.argv[4]), sys.argv[5], Path(sys.argv[6])
banco = json.loads(Path('ecologica/escenarios.json').read_text(encoding='utf-8'))['dimensiones'][dimension]
casos = seleccion.split(',') if seleccion else [c for c in banco if not fuera or c.startswith('M-')]
if (not casos or len(set(casos)) != len(casos) or not set(casos) <= set(banco)
        or (fuera and any(not c.startswith('M-') for c in casos))):
    sys.exit('Casos inválidos para la dimensión/modalidad.')
random.Random(semilla).shuffle(casos)
partes = [casos[n::min(4, len(casos))] for n in range(min(4, len(casos)))]
destino.parent.mkdir(parents=True, exist_ok=True)
destino.write_text(json.dumps(dict(semilla=semilla, k=k, partes=partes), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for parte in partes:
    print(','.join(parte))
PY
) || return 1
  mapfile -t grupos <<< "$reparto"
  [[ ${#grupos[@]} -gt 0 ]] || return 1
  for parte in "${!grupos[@]}"; do
    grupos[$parte]=${grupos[$parte]%$'\r'}
    mkdir -p "$EVIDENCIA/$tanda/p$parte"
    registros+=("$EVIDENCIA/$tanda/p$parte/$tanda/corregido.jsonl")
    (
      bash vm/contenedor.sh medir --dimension "$dimension" \
        --tanda "$tanda" --ejecutor "$ejecutor" \
        --modelo openai/gpt-6.1-sol --k "$K" --limite 600 --semilla "$SEMILLA" \
        --condicion LB --brazo LB --casos "${grupos[$parte]}" \
        "${extra[@]}" --destino "$EVIDENCIA/$tanda/p$parte"
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
    "${union[@]}" \
    --salida "$EVIDENCIA/$tanda/unida/corregido.jsonl"
}

tanda4 "$TANDA" "$DIMENSION" "$EJECUTOR" "$FUERA"
