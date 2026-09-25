#!/usr/bin/env bash
# Instalación de la VM de la línea base. Se corre UNA vez, CON internet, antes de cortar la red.
#
# Uso (desde la carpeta vm/ copiada a la VM):
#     sudo ./instalar.sh
#
# Hace:
#   1. Instala OpenCode 1.18.25 (binario nativo, sin Node) en /usr/local/bin/opencode.
#   2. Desactiva la actualización automática y la descarga de modelos, sin tocar
#      ninguna configuración de caso.
#   3. Copia casos y scripts a /opt/linea-base (sólo root puede leerlo).
#   4. Deja la documentación offline y la hoja de referencia en el home del participante.
#   5. Ejecuta OpenCode una vez como el participante, con red, para que cualquier
#      descarga de primer uso ocurra ahora y no durante una sesión.
set -euo pipefail

VERSION="1.18.25"
USUARIO="${USUARIO:-participante}"
BASE="/opt/linea-base"
ORIGEN="$(cd "$(dirname "$0")" && pwd)"

[[ $EUID -eq 0 ]] || { echo "Ejecutar como root (sudo)." >&2; exit 1; }
[[ "$(uname -m)" == "x86_64" ]] || { echo "Sólo x86_64." >&2; exit 1; }
HOMEU="$(getent passwd "$USUARIO" | cut -d: -f6 || true)"
[[ -n "$HOMEU" && -d "$HOMEU" ]] || {
  echo "No existe el usuario '$USUARIO'. Crearlo antes (sin permisos de sudo):" >&2
  echo "    sudo adduser $USUARIO" >&2
  exit 1
}
if id -nG "$USUARIO" | grep -qw sudo; then
  echo "AVISO: '$USUARIO' pertenece al grupo sudo. El participante no debe poder leer $BASE." >&2
  echo "       Quitarlo con: sudo deluser $USUARIO sudo" >&2
fi

como_participante() { runuser -u "$USUARIO" -- env HOME="$HOMEU" USER="$USUARIO" PATH="/usr/local/bin:/usr/bin:/bin" bash -c "$1"; }

echo "== 1. Dependencias"
FALTAN=()
for p in git curl; do command -v "$p" > /dev/null || FALTAN+=("$p"); done
if [[ ${#FALTAN[@]} -gt 0 ]]; then
  apt-get update -qq || echo "   (aviso: algún repositorio no respondió; se intenta igual)"
  apt-get install -y -qq "${FALTAN[@]}" ca-certificates > /dev/null
fi
echo "   git y curl disponibles"

echo "== 2. OpenCode $VERSION"
# Los procesadores virtuales a veces no exponen AVX2: en ese caso se usa la variante baseline,
# que es la misma que elegiría el instalador oficial.
if grep -qw avx2 /proc/cpuinfo; then PAQUETE="opencode-linux-x64"; else PAQUETE="opencode-linux-x64-baseline"; fi
TMP="$(mktemp -d)"
curl -fsSL "https://registry.npmjs.org/$PAQUETE/-/$PAQUETE-$VERSION.tgz" -o "$TMP/oc.tgz"
tar -xzf "$TMP/oc.tgz" -C "$TMP"
install -m 0755 "$TMP/package/bin/opencode" /usr/local/bin/opencode
rm -rf "$TMP"
INSTALADA="$(OPENCODE_DISABLE_AUTOUPDATE=1 /usr/local/bin/opencode --version)"
[[ "$INSTALADA" == "$VERSION" ]] || { echo "Versión inesperada: $INSTALADA" >&2; exit 1; }
echo "   $PAQUETE $INSTALADA · sha256 $(sha256sum /usr/local/bin/opencode | cut -d' ' -f1)"

echo "== 3. Congelar la versión"
for VAR in OPENCODE_DISABLE_AUTOUPDATE OPENCODE_DISABLE_MODELS_FETCH; do
  grep -q "^$VAR=" /etc/environment || echo "$VAR=1" >> /etc/environment
done

echo "== 4. Plantillas y scripts en $BASE (sólo root)"
rm -rf "$BASE"
mkdir -p "$BASE"
cp -a "$ORIGEN/casos" "$BASE/casos"
install -m 0755 "$ORIGEN/caso.sh" "$ORIGEN/verificar.sh" "$BASE/"
chown -R root:root "$BASE"
chmod 700 "$BASE"

echo "== 5. Documentación y hoja de referencia para el participante"
rm -rf "$HOMEU/Documentacion-OpenCode"
cp -a "$ORIGEN/docs" "$HOMEU/Documentacion-OpenCode"
install -m 0644 "$ORIGEN/hoja-referencia.md" "$HOMEU/hoja-referencia.md"
chown -R "$USUARIO:$USUARIO" "$HOMEU/Documentacion-OpenCode" "$HOMEU/hoja-referencia.md"

echo "== 6. Primer uso con red"
"$BASE/caso.sh" practica > /dev/null
como_participante 'export OPENCODE_DISABLE_AUTOUPDATE=1 OPENCODE_DISABLE_MODELS_FETCH=1;
  cd ~/proyecto && opencode debug config > /dev/null && opencode debug agent build > /dev/null && opencode debug skill > /dev/null'
echo "   OK"

echo
echo "IMPORTANTE: borrar la carpeta desde la que se instaló ($ORIGEN)."
echo "            Contiene las plantillas de los casos, y el participante no debe poder leerlas."
echo
echo "Instalación terminada. Siguientes pasos:"
echo "  1. Cortar la red de la VM."
echo "  2. sudo $BASE/verificar.sh   (y revisar las salidas contra casos-y-respuestas.md)"
echo "  3. sudo $BASE/caso.sh practica"
echo "  4. Sacar la instantánea."
