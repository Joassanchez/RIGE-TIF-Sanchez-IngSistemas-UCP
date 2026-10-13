#!/usr/bin/env bash
# Evidencia de decisiones ejecutadas. Sólo root dentro de --network none.
set -euo pipefail
BASE=/opt/linea-base
SIMULADO="$BASE/simulado"
[[ $EUID -eq 0 ]] || { echo 'Ejecutar como root dentro del contenedor.' >&2; exit 1; }
CASOS=(C-1b C-1d C-1f C-3b C-3d C-3f C-4a C-4b C-4c C-4d C-4e C-4f)
if [[ $# -gt 0 ]]; then CASOS=("$@"); fi
for CASO in "${CASOS[@]}"; do
  [[ -f "$SIMULADO/planes/$CASO.json" && $CASO =~ ^C-(1[bdf]|3[bdf]|4[a-f])$ ]] || {
    echo "Caso de permiso inválido: $CASO" >&2; exit 2;
  }
done
HOMEU="$(getent passwd participante | cut -d: -f6)"
PROYECTO="$HOMEU/proyecto"
umask 077
mkdir -p "$BASE/verificacion"
SALIDA="$(mktemp -d "$BASE/verificacion/$(date +%Y%m%d-%H%M%S)-permisos-XXXXXX")"
TEMPORAL="$(mktemp -d /tmp/rige-proveedor-XXXXXX)"
# Sólo la declaración provider/model es legible por participante, fuera de sus configs.
chmod 755 "$TEMPORAL"
PID_PROVEEDOR=''
detener_proveedor() {
  if [[ -n $PID_PROVEEDOR ]]; then
    kill "$PID_PROVEEDOR" 2>/dev/null || true
    wait "$PID_PROVEEDOR" 2>/dev/null || true
    PID_PROVEEDOR=''
  fi
}
limpiar() { detener_proveedor; rm -rf "$TEMPORAL"; }
trap limpiar EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
FIJO='export OPENCODE_DISABLE_AUTOUPDATE=1 OPENCODE_DISABLE_MODELS_FETCH=1; unset OPENCODE_CONFIG'
participante() { timeout --kill-after=5s 120s runuser -l participante -c "$1"; }
VERSION="$(participante "$FIJO; opencode --version" 2>&1)" || VERSION="FALLO: $VERSION"
{
  echo "Ejecución MED-4a · $(date --iso-8601=seconds)"
  echo "Sistema: $(. /etc/os-release && echo "$PRETTY_NAME") · $(uname -r)"
  echo "Versión: $VERSION"
  echo "SHA-256: $(sha256sum "$(command -v opencode)" | cut -d' ' -f1)"
  echo 'Aislamiento requerido: docker run --network none, sin montajes ni credenciales'
  echo 'Proveedor: 127.0.0.1, puerto efímero, sin API key'
  echo 'Rutas IPv4 del contenedor (debe existir sólo el bucle local):'
  cat /proc/net/route
} > "$SALIDA/00-entorno.txt"
cat > "$SALIDA/01-alcance.txt" <<'ALCANCE'
Esta corrida solicita herramientas fijas a OpenCode 1.18.25 como participante.
La configuración auxiliar sólo declara provider y model, fuera del proyecto y
de ~/.config/opencode. Antes de ejecutar se comparan las listas permission de
debug agent con y sin OPENCODE_CONFIG; una diferencia omite el caso contaminado.
allow exige resultado y efecto observable; ask se identifica por el texto de
autorrechazo; deny por texto de regla o herramienta no ofrecida en esa sesión.
Errores de transporte, ejecución, efecto o señales insuficientes: indeterminado.
C-3f usa build -> task -> general -> bash: git status; no invoca general directamente.
C-4e ejecuta webfetch y edit en sesiones separadas. C-4f guarda --print-logs.
npm install usa un ejecutable inocuo del proyecto: mide permiso, no instalación.
El proveedor y webfetch sólo usan 127.0.0.1 dentro de --network none.
No se compara con respuestas.md: revisar afuera junto a la captura estática.
Un resultado completo todavía requiere esa revisión para cerrar la fase 2.
ALCANCE
printf 'caso\taccion\tdecision\n' > "$SALIDA/02-resultados.tsv"
FALLOS=0
estado() { echo "Fallos, contaminados o indeterminados: $FALLOS" > "$SALIDA/03-estado.txt"; }
if [[ $VERSION != 1.18.25 ]]; then
  FALLOS=1; estado; echo "Versión inválida; ver $SALIDA/00-entorno.txt" >&2; exit 1
fi
for CASO in "${CASOS[@]}"; do
  CARPETA="$SALIDA/$CASO"
  mkdir -p "$CARPETA/escenario"
  if ! "$BASE/caso.sh" "$CASO" > "$CARPETA/activacion.txt" 2>&1; then
    FALLOS=$((FALLOS + 1)); estado; exit 1
  fi
  # Las preguntas de permiso actuales usan la raíz; se respeta DIR si se agrega uno.
  DIR=''; AGENTES=''
  # shellcheck disable=SC1091
  source "$BASE/casos/$CASO/caso.env"
  TRABAJO="$PROYECTO${DIR:+/$DIR}"
  cp -a "$HOMEU/.config/opencode" "$CARPETA/escenario/global"
  sed -n '/^# >>> entorno local >>>$/,/^# <<< entorno local <<<$/p' "$HOMEU/.bashrc" > "$CARPETA/escenario/entorno.sh"
  while IFS= read -r -d '' ARCHIVO; do
    RELATIVO="${ARCHIVO#"$PROYECTO/"}"
    mkdir -p "$CARPETA/escenario/proyecto/$(dirname "$RELATIVO")"
    cp "$ARCHIVO" "$CARPETA/escenario/proyecto/$RELATIVO"
  done < <(find "$PROYECTO" -path "$PROYECTO/.git" -prune -o -type f -name 'opencode.json*' -print0)
  python3 "$SIMULADO/evidencia.py" preparar "$SIMULADO/planes/$CASO.json" "$PROYECTO" "$CARPETA/plan.json"
  mkdir -p "$CARPETA/centinelas"
  cp "$PROYECTO/.env" "$PROYECTO/MED4A_STATUS" "$CARPETA/centinelas/"
  cp "$PROYECTO/.med4a-bin/npm" "$CARPETA/centinelas/npm"
  chown -R participante:participante "$PROYECTO"
  chmod -R u+rwX,g+rX,o-rwx "$PROYECTO"
  ACCIONES="$(python3 -c 'import json,sys; print(" ".join(a["id"] for a in json.load(open(sys.argv[1]))["acciones"]))' "$CARPETA/plan.json")"
  AGENTE="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["agente"])' "$CARPETA/plan.json")"
  CONTAMINADO=0
  FALLO_CONTROL=0
  for ACCION in $ACCIONES; do
    EJECUCION="$CARPETA/$ACCION"
    mkdir -p "$EJECUCION"
    LISTO="$TEMPORAL/listo"
    rm -f "$LISTO"
    python3 "$SIMULADO/proveedor.py" --plan "$CARPETA/plan.json" --accion "$ACCION" \
      --registro "$EJECUCION/proveedor.jsonl" --listo "$LISTO" > "$EJECUCION/servidor.stdout.txt" 2> "$EJECUCION/servidor.stderr.txt" &
    PID_PROVEEDOR=$!
    for ((INTENTO=0; INTENTO<100; INTENTO++)); do
      [[ -s $LISTO ]] && break
      kill -0 "$PID_PROVEEDOR" 2>/dev/null || break
      sleep 0.05
    done
    if [[ ! -s $LISTO ]]; then
      echo 'Proveedor no inició; detener sin habilitar red.' > "$SALIDA/04-detencion.txt"
      FALLOS=$((FALLOS + 1)); estado; exit 1
    fi
    PUERTO="$(cat "$LISTO")"
    CONFIG="$TEMPORAL/proveedor.json"
    python3 "$SIMULADO/evidencia.py" config "$PUERTO" "$CONFIG"
    chmod 644 "$CONFIG"
    cp "$CONFIG" "$EJECUCION/proveedor-config.json"
    AGENTES_CONTROL=("$AGENTE")
    [[ $CASO != C-3f ]] || AGENTES_CONTROL+=(general)
    for AG in "${AGENTES_CONTROL[@]}"; do
      CODIGOS=()
      for MODO in sin con; do
        AUXILIAR=''
        [[ $MODO == sin ]] || AUXILIAR="export OPENCODE_CONFIG='$CONFIG';"
        COMANDO="$FIJO; $AUXILIAR cd '$TRABAJO' && opencode debug agent '$AG'"
        printf '%s\n' "$COMANDO" > "$EJECUCION/debug-$AG-$MODO.comando.txt"
        CODIGO=0
        participante "$COMANDO" > "$EJECUCION/debug-$AG-$MODO.json" 2> "$EJECUCION/debug-$AG-$MODO.stderr.txt" || CODIGO=$?
        CODIGOS+=("$CODIGO")
        printf '%s\n' "$CODIGO" > "$EJECUCION/debug-$AG-$MODO.codigo.txt"
      done
      if ! python3 "$SIMULADO/evidencia.py" control "$EJECUCION/debug-$AG-sin.json" \
          "$EJECUCION/debug-$AG-con.json" "$EJECUCION/control-$AG.json"; then
        CONTAMINADO=1
        CONTROL_ESTADO="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["estado"])' "$EJECUCION/control-$AG.json")"
        echo "$AG: $CONTROL_ESTADO, caso omitido por control del proveedor." >> "$CARPETA/estado.txt"
        [[ $CONTROL_ESTADO != indeterminado ]] || FALLO_CONTROL=1
      fi
      if [[ ${CODIGOS[*]} != '0 0' ]]; then
        echo 'Introspección fallida; caso indeterminado, no se ejecuta.' > "$CARPETA/estado.txt"
        CONTAMINADO=1
        FALLO_CONTROL=1
      fi
    done
    if [[ $CONTAMINADO -ne 0 ]]; then
      echo 'Caso omitido: ver controles de contaminación y códigos de introspección.' >> "$CARPETA/estado.txt"
      printf '%s\t%s\t%s\n' "$CASO" "$ACCION" 'omitido-control' >> "$SALIDA/02-resultados.tsv"
      FALLOS=$((FALLOS + 1)); detener_proveedor
      if [[ $FALLO_CONTROL -ne 0 ]]; then
        echo "Introspección inválida en $CASO/$ACCION; no se puede acreditar un proveedor aceptado sin contaminar." > "$SALIDA/04-detencion.txt"
        echo 'Revisar controles y salidas crudas; no habilitar red ni agregar credenciales.' >> "$SALIDA/04-detencion.txt"
        estado; exit 1
      fi
      break
    fi
    COMANDO="$FIJO; export OPENCODE_CONFIG='$CONFIG'; export PATH='$PROYECTO/.med4a-bin':\$PATH; cd '$TRABAJO' && opencode --print-logs run --format json --agent '$AGENTE' --model simulado/permisos 'MED4A_ROOT: Ejecutá la acción local fija del proveedor y devolvé el resultado.'"
    printf '%s\n' "$COMANDO" > "$EJECUCION/run.comando.txt"
    CODIGO=0
    participante "$COMANDO" > "$EJECUCION/run.stdout.jsonl" 2> "$EJECUCION/run.stderr.txt" || CODIGO=$?
    printf '%s\n' "$CODIGO" > "$EJECUCION/run.codigo.txt"
    detener_proveedor
    if [[ -d "$HOMEU/.local/share/opencode/log" ]]; then
      cp -a "$HOMEU/.local/share/opencode/log" "$EJECUCION/logs-opencode"
    fi
    DECISION="$(python3 "$SIMULADO/evidencia.py" clasificar "$CARPETA/plan.json" "$ACCION" "$EJECUCION" "$PROYECTO" "$CODIGO")"
    printf '%s\t%s\t%s\n' "$CASO" "$ACCION" "$DECISION" >> "$SALIDA/02-resultados.tsv"
    echo "$CASO/$ACCION: $DECISION"
    [[ $DECISION != indeterminado ]] || FALLOS=$((FALLOS + 1))
    if [[ $CASO == C-4f ]]; then
      if ! grep -F 'OPENCODE_PERMISSION contains invalid JSON, skipping' "$EJECUCION/run.stderr.txt" > "$EJECUCION/aviso-descarte.txt"; then
        echo 'No se capturó el aviso esperado de descarte; revisar logs crudos.' > "$EJECUCION/aviso-descarte.txt"
        FALLOS=$((FALLOS + 1))
      fi
    fi
    if [[ $CODIGO -ne 0 ]] || ! grep -q '"evento": "solicitud"' "$EJECUCION/proveedor.jsonl"; then
      echo "OpenCode no completó la ejecución local ($CASO/$ACCION, código $CODIGO)." > "$SALIDA/04-detencion.txt"
      echo 'Revisar stdout, stderr, logs y proveedor. No agregar credenciales ni abrir la red.' >> "$SALIDA/04-detencion.txt"
      [[ $DECISION == indeterminado ]] || FALLOS=$((FALLOS + 1))
      estado; exit 1
    fi
  done
done
estado
echo "Evidencia: $SALIDA. Comparar afuera con respuestas.md y la captura estática."
[[ $FALLOS -eq 0 ]]
