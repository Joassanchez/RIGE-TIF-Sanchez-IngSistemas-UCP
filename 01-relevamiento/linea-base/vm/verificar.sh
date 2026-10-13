#!/usr/bin/env bash
# Captura de introspección en el contenedor Ubuntu 26.04 (criterio 8.2-2).
#
# Uso (como root, con --network none):
#     /opt/linea-base/verificar.sh            # los veinticuatro casos
#     /opt/linea-base/verificar.sh C-2b       # uno solo
#
# Para cada caso: lo activa con caso.sh, vuelca el contenido íntegro del escenario y
# ejecuta, como el participante y desde el directorio de trabajo del caso:
#     opencode --version · opencode debug config · opencode debug agent <agente>
#
# Las salidas quedan en /opt/linea-base/verificacion/<fecha-hora>-<sufijo>/<caso>.txt.
# Este script NO compara contra las respuestas: no están en el contenedor.
# La comparación se hace a mano fuera del contenedor contra respuestas.md; esa revisión
# es la verificación que va al anexo.
set -euo pipefail

BASE="/opt/linea-base"
USUARIO="participante"
[[ $EUID -eq 0 ]] || { echo "Ejecutar como root dentro del contenedor." >&2; exit 1; }
HOMEU="$(getent passwd "$USUARIO" | cut -d: -f6)"
# Shell de inicio de sesión: carga ~/.profile y el bloque de entorno del caso, que
# caso.sh escribe al principio de ~/.bashrc. Es el mismo entorno que ve como-dev.
como_participante() { runuser -l "$USUARIO" -c "$1"; }

if [[ $# -gt 0 ]]; then CASOS=("$@"); else
  CASOS=(C-1a C-1b C-1c C-1d C-1e C-1f
         C-2a C-2b C-2c C-2d C-2e C-2f
         C-3a C-3b C-3c C-3d C-3e C-3f
         C-4a C-4b C-4c C-4d C-4e C-4f)
fi
for CASO in "${CASOS[@]}"; do
  [[ $CASO =~ ^(practica|C-[1-4][a-f])$ && -f "$BASE/casos/$CASO/caso.env" ]] || {
    echo "Caso inexistente: '$CASO'." >&2; exit 2;
  }
done

umask 077
mkdir -p "$BASE/verificacion"
SALIDA="$(mktemp -d "$BASE/verificacion/$(date +%Y%m%d-%H%M%S)-XXXXXX")"
FALLOS=0

# Entorno fijo del contenedor (el mismo que ve el participante).
ENTORNO_FIJO="export OPENCODE_DISABLE_AUTOUPDATE=1 OPENCODE_DISABLE_MODELS_FETCH=1"
VERSION="$(como_participante "$ENTORNO_FIJO; opencode --version" 2>&1)" || FALLOS=$((FALLOS + 1))
[[ $VERSION == 1.18.25 ]] || FALLOS=$((FALLOS + 1))

{
  echo "Verificación de la línea base"
  echo "Fecha: $(date --iso-8601=seconds)"
  echo "Sistema: $(. /etc/os-release && echo "$PRETTY_NAME") · $(uname -r)"
  echo "Binario: $(command -v opencode)"
  echo "SHA-256: $(sha256sum "$(command -v opencode)" | cut -d' ' -f1)"
  echo "Versión: $VERSION"
  echo -n "Conectividad a internet: "
  if timeout 5 bash -c 'exec 3<>/dev/tcp/1.1.1.1/443' 2>/dev/null; then
    echo "HAY CONEXIÓN: corrida inválida; usar --network none"
  else echo "sin conexión (sondeo; el aislamiento lo fija --network none)"; fi
  echo -n "Plantillas de casos fuera de $BASE: "
  FUGAS="$(find / -xdev -name caso.env -not -path "$BASE/*" 2>/dev/null | head -5)"
  if [[ -n "$FUGAS" ]]; then echo "ENCONTRADAS — borrarlas antes de medir:"; echo "$FUGAS"; else echo "ninguna"; fi
} | tee "$SALIDA/00-entorno.txt"
if grep -qE 'HAY CONEXIÓN|ENCONTRADAS' "$SALIDA/00-entorno.txt"; then
  FALLOS=$((FALLOS + 1))
fi

cat > "$SALIDA/01-alcance.txt" <<'ALCANCE'
Esta corrida captura configuración y reglas resueltas; no ejecuta herramientas.
La ejecución complementaria se obtiene con contenedor.sh permisos todos
<carpeta-vacía>, en un contenedor nuevo con --network none y proveedor local.
En particular, debug agent general no acredita la herencia de una invocación
concreta en C-3f; permisos.sh solicita task desde build hacia general.
La fase 2 requiere ambas capturas, decisiones determinadas, controles de
contaminación limpios y revisión contra respuestas.md fuera del contenedor.
El proveedor escucha sólo en 127.0.0.1, sin credenciales; no abrir internet
para resolver errores de la ejecución complementaria.
ALCANCE

# Evidencia de la separación de usuarios y acceso de grupo, sin systemd.
{
  stat -c '%a %U:%G %n' "$BASE" "$BASE/casos" "$BASE/caso.sh" "$BASE/verificar.sh" /home/participante /usr/local/bin/como-dev /etc/sudoers.d/evaluador
  id participante
  id evaluador
  visudo -cf /etc/sudoers.d/evaluador
  for USUARIO_PRUEBA in participante evaluador; do
    if runuser -l "$USUARIO_PRUEBA" -c 'test ! -r /opt/linea-base/caso.sh && test ! -x /opt/linea-base/casos'; then
      echo "$USUARIO_PRUEBA: plantillas inaccesibles"
    else echo "$USUARIO_PRUEBA: FALLO de aislamiento"; FALLOS=$((FALLOS + 1)); fi
    if runuser -l "$USUARIO_PRUEBA" -c 'sudo -n -u root true' >/dev/null 2>&1; then
      echo "$USUARIO_PRUEBA: FALLO, puede ejecutar como root"; FALLOS=$((FALLOS + 1))
    else echo "$USUARIO_PRUEBA: sin sudo a root"; fi
  done
  if runuser -l evaluador -c 'test -r ~/tarea/docs/index.html && test -r ~/tarea/hoja-referencia.md && test "$(como-dev "id -un")" = participante'; then
    echo "evaluador: documentación y como-dev disponibles"
  else echo "evaluador: FALLO de preparación"; FALLOS=$((FALLOS + 1)); fi
} > "$SALIDA/02-usuarios.txt" 2>&1

for CASO in "${CASOS[@]}"; do
  "$BASE/caso.sh" "$CASO" > /dev/null
  if ! runuser -l evaluador -c 'test -r /home/participante/proyecto/src/productos.js && ilegible=$(find /home/participante/.config/opencode /home/participante/proyecto -type f ! -readable -print -quit) && test -z "$ilegible"'; then
    echo "$CASO: FALLO de lectura del escenario desde evaluador" >> "$SALIDA/02-usuarios.txt"
    FALLOS=$((FALLOS + 1))
  fi
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
    como_participante "$ENTORNO_FIJO; cd '$TRABAJO' && opencode debug config" 2>&1 || {
      CODIGO=$?; echo "(código de salida $CODIGO)"; FALLOS=$((FALLOS + 1));
    }
    for AG in $AGENTES; do
      echo
      echo "--- \$ opencode debug agent $AG ---"
      como_participante "$ENTORNO_FIJO; cd '$TRABAJO' && opencode debug agent $AG" 2>&1 || {
        CODIGO=$?; echo "(código de salida $CODIGO)"; FALLOS=$((FALLOS + 1));
      }
    done
  } > "$F"
  echo "  $CASO → $F"
done

echo
echo "Captura terminada. Revisar cada archivo contra respuestas.md fuera del contenedor."
echo "Complementar con contenedor.sh permisos todos <carpeta-vacía>: ver 01-alcance.txt."
echo "Fallos de preparación o introspección: $FALLOS" | tee "$SALIDA/03-estado.txt"
echo "Usar un contenedor nuevo para cada sesión."
[[ $FALLOS -eq 0 ]]
