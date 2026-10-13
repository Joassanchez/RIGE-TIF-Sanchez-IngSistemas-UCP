#!/usr/bin/env bash
# Paso de construcción del contenedor Ubuntu 26.04. Lo invoca el Dockerfile.
# No se ejecuta en el anfitrión, no usa systemd ni instala credenciales.
# Uso: /opt/linea-base/instalar.sh <sha256-del-binario>
set -euo pipefail
umask 022

VERSION="1.18.25"
# Una sola variante x86_64: funciona también cuando no se expone AVX2.
PAQUETE="opencode-linux-x64-baseline"
BASE="/opt/linea-base"
SHA256="${1:-}"
[[ $EUID -eq 0 ]] || { echo "Ejecutar como root dentro del contenedor." >&2; exit 1; }
[[ $(uname -m) == x86_64 ]] || { echo "Sólo x86_64." >&2; exit 1; }
[[ $SHA256 =~ ^[[:xdigit:]]{64}$ ]] || {
  echo "Falta OPENCODE_SHA256: SHA-256 contrastado del binario $PAQUETE $VERSION." >&2
  exit 2
}

echo "== OpenCode $VERSION ($PAQUETE)"
TEMPORAL="$(mktemp -d)"
trap 'rm -rf "$TEMPORAL"' EXIT
curl -fsSL --retry 3 "https://registry.npmjs.org/$PAQUETE/-/$PAQUETE-$VERSION.tgz" -o "$TEMPORAL/oc.tgz"
tar -xzf "$TEMPORAL/oc.tgz" -C "$TEMPORAL"
printf '%s  %s\n' "$SHA256" "$TEMPORAL/package/bin/opencode" | sha256sum -c -
install -m 0755 "$TEMPORAL/package/bin/opencode" /usr/local/bin/opencode
INSTALADA="$(OPENCODE_DISABLE_AUTOUPDATE=1 /usr/local/bin/opencode --version)"
[[ $INSTALADA == "$VERSION" ]] || { echo "Versión inesperada: $INSTALADA" >&2; exit 1; }

echo "== Dos usuarios y permisos (§3.1)"
useradd --create-home --user-group --shell /bin/bash participante
useradd --create-home --user-group --shell /bin/bash evaluador
usermod -aG participante evaluador
chmod 750 /home/participante /home/evaluador
printf '%s\n' 'evaluador ALL=(participante) NOPASSWD: ALL' > /etc/sudoers.d/evaluador
chmod 440 /etc/sudoers.d/evaluador
visudo -cf /etc/sudoers.d/evaluador
# Ambos usuarios tienen contraseña bloqueada y no pertenecen al grupo sudo.
for USUARIO in participante evaluador; do
  if id -nG "$USUARIO" | grep -qw sudo; then
    echo "El usuario $USUARIO no debe pertenecer a sudo." >&2; exit 1
  fi
done

# ENV alcanza docker exec; estos archivos alcanzan shells de inicio de sesión
# y runuser/sudo, que limpian las variables heredadas. Sin tocar los casos.
printf '%s\n' 'OPENCODE_DISABLE_AUTOUPDATE=1' 'OPENCODE_DISABLE_MODELS_FETCH=1' >> /etc/environment
printf '%s\n' 'export OPENCODE_DISABLE_AUTOUPDATE=1 OPENCODE_DISABLE_MODELS_FETCH=1' > /etc/profile.d/opencode-fijo.sh
chmod 644 /etc/profile.d/opencode-fijo.sh

mkdir -p /home/evaluador/tarea /home/evaluador/.config/opencode
cp -a "$BASE/docs" /home/evaluador/tarea/docs
install -m 0644 "$BASE/hoja-referencia.md" /home/evaluador/tarea/hoja-referencia.md
# Configuración inicial del principal (§3.2); Charles se prepara en otra tarea.
cat > /home/evaluador/.config/opencode/opencode.json <<'JSON'
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "read": "allow",
    "bash": "allow",
    "external_directory": "allow",
    "edit": "deny",
    "webfetch": "deny",
    "websearch": "deny"
  }
}
JSON
chown -R evaluador:evaluador /home/evaluador/tarea /home/evaluador/.config
chmod -R u+rwX,go+rX /home/evaluador/tarea
chown -R root:root "$BASE"
chmod -R 700 "$BASE"

echo "== Primer uso con red durante la construcción, sin proveedor ni credenciales"
"$BASE/caso.sh" practica
runuser -l participante -c 'cd ~/proyecto && opencode debug config >/dev/null && opencode debug agent build >/dev/null && opencode debug skill >/dev/null'
runuser -l evaluador -c 'cd ~/tarea && opencode debug config >/dev/null && opencode debug agent build >/dev/null && opencode debug skill >/dev/null'
# La imagen parte de un escenario limpio. La corrida sin red comprueba si la
# caché de primer uso basta para los escenarios; no se ocultan sus errores.
"$BASE/caso.sh" practica
echo "Construcción terminada. Verificar sin red y comparar fuera con respuestas.md."
