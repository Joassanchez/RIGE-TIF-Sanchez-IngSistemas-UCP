#!/usr/bin/env bash
# Activa un caso de la línea base para el usuario participante.
#
# Uso (como root, entre casos, fuera del cronómetro):
#     sudo /opt/linea-base/caso.sh C-2a
#     sudo /opt/linea-base/caso.sh practica
#
# Deja al participante con exactamente el escenario del caso:
#   ~/.config/opencode/   → sólo la configuración global del caso (o vacío)
#   ~/proyecto/           → el proyecto común más los archivos del caso, con un repositorio git
#   ~/.bashrc             → las variables de entorno del caso, si las tiene
#
# Nada en el sistema de archivos visible para el participante identifica el caso:
# la ruta del proyecto es siempre la misma y las plantillas viven en /opt/linea-base,
# accesible sólo por root.
set -euo pipefail

BASE="${BASE:-/opt/linea-base}"
USUARIO="${USUARIO:-participante}"
CASO="${1:-}"

[[ $EUID -eq 0 ]] || { echo "Ejecutar como root (sudo)." >&2; exit 1; }
[[ -n "$CASO" && "$CASO" != "comun" && -d "$BASE/casos/$CASO" ]] || {
  echo "Caso inexistente: '$CASO'. Disponibles:" >&2
  ls "$BASE/casos" | grep -v '^comun$' >&2
  exit 1
}
HOMEU="$(getent passwd "$USUARIO" | cut -d: -f6)"
[[ -d "$HOMEU" ]] || { echo "No existe el usuario $USUARIO." >&2; exit 1; }

PLANTILLA="$BASE/casos/$CASO"
DIR=""; AGENTES=""
# shellcheck disable=SC1091
source "$PLANTILLA/caso.env"

# 1. Limpiar todo rastro del caso anterior
rm -rf "$HOMEU/proyecto" "$HOMEU/.config/opencode" "$HOMEU/.local/share/opencode" "$HOMEU/.local/state/opencode"
mkdir -p "$HOMEU/.config/opencode"

# 2. Configuración global del caso
if [[ -d "$PLANTILLA/global" ]]; then
  cp -a "$PLANTILLA/global/." "$HOMEU/.config/opencode/"
fi

# 3. Proyecto: común + archivos del caso, con un commit inicial
cp -a "$BASE/casos/comun/proyecto" "$HOMEU/proyecto"
if [[ -d "$PLANTILLA/proyecto" ]]; then
  cp -a "$PLANTILLA/proyecto/." "$HOMEU/proyecto/"
fi
git -C "$HOMEU/proyecto" init -q
git -C "$HOMEU/proyecto" add -A
git -C "$HOMEU/proyecto" -c user.name="dev" -c user.email="dev@example.com" \
    commit -q -m "Versión inicial"

# 4. Variables de entorno del caso (bloque marcado AL PRINCIPIO de ~/.bashrc).
#    El .bashrc de Ubuntu termina en su primera línea si el shell no es interactivo;
#    al principio, el bloque también rige para los shells de inicio de sesión no
#    interactivos (como-dev, verificar.sh). %q admite valores con comillas (JSON).
touch "$HOMEU/.bashrc"
sed -i '/^# >>> entorno local >>>$/,/^# <<< entorno local <<<$/d' "$HOMEU/.bashrc"
EXPORTS="$(grep '^EXPORT_' "$PLANTILLA/caso.env" || true)"
if [[ -n "$EXPORTS" ]]; then
  NUEVO="$(mktemp)"
  {
    echo "# >>> entorno local >>>"
    while IFS='=' read -r clave valor; do
      printf 'export %s=%q\n' "${clave#EXPORT_}" "$valor"
    done <<< "$EXPORTS"
    echo "# <<< entorno local <<<"
    cat "$HOMEU/.bashrc"
  } > "$NUEVO"
  cat "$NUEVO" > "$HOMEU/.bashrc"
  rm -f "$NUEVO"
fi

chown -R "$USUARIO:$USUARIO" "$HOMEU/proyecto" "$HOMEU/.config" "$HOMEU/.bashrc"

DESTINO="$HOMEU/proyecto${DIR:+/$DIR}"
echo "Caso $CASO listo."
echo "Cerrá todas las terminales y abrí una nueva en: ${DESTINO/#$HOMEU/\~}"
