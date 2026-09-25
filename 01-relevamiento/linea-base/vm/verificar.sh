#!/usr/bin/env bash
# Verificación de los casos en la VM (criterio 8.2-2 del diseño).
#
# Uso (como root, con la red de la VM ya cortada):
#     sudo /opt/linea-base/verificar.sh            # todos los casos
#     sudo /opt/linea-base/verificar.sh C-2b       # uno solo
#
# Para cada caso: lo activa con caso.sh, vuelca el contenido íntegro del escenario y
# ejecuta, como el participante y desde el directorio de trabajo del caso:
#     opencode --version · opencode debug config · opencode debug agent <agente>
#
# Las salidas quedan en /opt/linea-base/verificacion/<fecha-hora>/<caso>.txt.
# Este script NO compara contra las respuestas: las respuestas no están en la VM.
# La comparación se hace a mano contra sesion/casos-y-respuestas.md, y esa revisión
# es la verificación que va al anexo.
set -euo pipefail

BASE="${BASE:-/opt/linea-base}"
USUARIO="${USUARIO:-participante}"
[[ $EUID -eq 0 ]] || { echo "Ejecutar como root (sudo)." >&2; exit 1; }
HOMEU="$(getent passwd "$USUARIO" | cut -d: -f6)"
# Shell de inicio de sesión: carga ~/.profile y el bloque de entorno del caso, que
# caso.sh escribe al principio de ~/.bashrc. Es el mismo entorno que ve como-dev.
como_participante() { runuser -l "$USUARIO" -c "$1"; }

if [[ $# -gt 0 ]]; then CASOS=("$@"); else
  CASOS=(practica C-1a C-1b C-1c C-1d C-2a C-2b C-2c C-2d C-3a C-3b C-3c C-3d C-4a C-4b C-4c C-4d)
fi

SALIDA="$BASE/verificacion/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$SALIDA"

# Entorno fijo de la VM (el mismo que ve el participante)
ENTORNO_FIJO="export OPENCODE_DISABLE_AUTOUPDATE=1 OPENCODE_DISABLE_MODELS_FETCH=1"

{
  echo "Verificación de la línea base"
  echo "Fecha: $(date --iso-8601=seconds)"
  echo "Sistema: $(. /etc/os-release && echo "$PRETTY_NAME") · $(uname -r)"
  echo "Binario: $(command -v opencode)"
  echo "SHA-256: $(sha256sum "$(command -v opencode)" | cut -d' ' -f1)"
  echo "Versión: $(como_participante "$ENTORNO_FIJO; opencode --version" 2>&1)"
  echo -n "Conectividad a internet: "
  if timeout 5 bash -c 'exec 3<>/dev/tcp/1.1.1.1/443' 2>/dev/null; then echo "HAY CONEXIÓN (cortarla antes de verificar)"; else echo "sin conexión"; fi
  echo -n "Plantillas de casos fuera de $BASE: "
  FUGAS="$(find / -xdev -name caso.env -not -path "$BASE/*" 2>/dev/null | head -5)"
  if [[ -n "$FUGAS" ]]; then echo "ENCONTRADAS — borrarlas antes de medir:"; echo "$FUGAS"; else echo "ninguna"; fi
} | tee "$SALIDA/00-entorno.txt"

for CASO in "${CASOS[@]}"; do
  "$BASE/caso.sh" "$CASO" > /dev/null
  DIR=""; AGENTES=""
  # shellcheck disable=SC1091
  source "$BASE/casos/$CASO/caso.env"
  TRABAJO="$HOMEU/proyecto${DIR:+/$DIR}"
  ENTORNO_CASO="$(sed -n '/^# >>> entorno local >>>$/,/^# <<< entorno local <<<$/p' "$HOMEU/.bashrc")"
  F="$SALIDA/$CASO.txt"

  {
    echo "=================================================================="
    echo "CASO $CASO · $(date --iso-8601=seconds)"
    echo "Directorio de trabajo: ${TRABAJO/#$HOMEU/\~}"
    echo "=================================================================="
    echo
    echo "--- Escenario: configuración global (~/.config/opencode) ---"
    if compgen -G "$HOMEU/.config/opencode/*" > /dev/null; then
      for a in "$HOMEU"/.config/opencode/*; do echo "## ${a/#$HOMEU/\~}"; cat "$a"; echo; done
    else
      echo "(vacía)"
    fi
    echo "--- Escenario: archivos de configuración del proyecto ---"
    ( cd "$HOMEU/proyecto" && find . -path ./.git -prune -o \( -name 'opencode.json*' -o -name '.env' -o -path '*/.opencode/agent/*.md' \) -print | sort ) \
      | while read -r a; do echo "## ~/proyecto/${a#./}"; cat "$HOMEU/proyecto/$a"; echo; done
    echo "--- Escenario: variables de entorno del caso ---"
    [[ -n "$ENTORNO_CASO" ]] && echo "$ENTORNO_CASO" || echo "(ninguna)"
    echo
    echo "--- \$ opencode debug config ---"
    como_participante "$ENTORNO_FIJO; cd '$TRABAJO' && opencode debug config" 2>&1 || echo "(código de salida $?)"
    for AG in $AGENTES; do
      echo
      echo "--- \$ opencode debug agent $AG ---"
      como_participante "$ENTORNO_FIJO; cd '$TRABAJO' && opencode debug agent $AG" 2>&1 || echo "(código de salida $?)"
    done
  } > "$F"
  echo "  $CASO → $F"
done

echo
echo "Listo. Revisar cada archivo contra sesion/casos-y-respuestas.md."
echo "Después, restaurar la instantánea o correr caso.sh practica antes de la primera sesión."
