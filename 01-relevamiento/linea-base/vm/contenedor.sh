#!/usr/bin/env bash
# Envoltorio del anfitrión (Git Bash o WSL). Nunca monta el repositorio.
set -euo pipefail

IMAGEN="rige-linea-base:1.18.25"
ORIGEN="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPOSITORIO="$(cd "$ORIGEN/../../.." && pwd -P)"
CONTENEDOR=""
# Git Bash no debe convertir las rutas Linux que se pasan a docker run/exec.
export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'

uso() {
  cat >&2 <<'USO'
Uso (en el anfitrión):
  UBUNTU_DIGEST=sha256:... OPENCODE_SHA256=... bash vm/contenedor.sh construir
  bash vm/contenedor.sh verificar <C-1a..C-4f|practica|todos> <carpeta-vacía>
  bash vm/contenedor.sh permisos <C-1b|C-1d|C-1f|C-3b|C-3d|C-3f|C-4a..C-4f|todos> <carpeta-vacía>
  bash vm/contenedor.sh shell
  bash vm/contenedor.sh medir --ensayo --destino <carpeta-vacía> [opciones de medir.sh]
  OPENCODE_AUTH_JSON='<JSON de autenticación>' bash vm/contenedor.sh medir --destino <carpeta-vacía> [opciones]
La evidencia debe estar fuera del repositorio; no se monta ningún directorio.
USO
}
fallar() { echo "$*" >&2; exit 2; }
# Con conversión MSYS desactivada, las rutas del anfitrión se convierten
# explícitamente para el cliente Docker nativo de Windows. WSL usa sus rutas.
ruta_docker() {
  if command -v cygpath >/dev/null 2>&1; then cygpath -m "$1"; else printf '%s\n' "$1"; fi
}
limpiar() {
  if [[ -n $CONTENEDOR ]]; then docker rm -f "$CONTENEDOR" >/dev/null 2>&1 || true; fi
}

[[ $# -ge 1 ]] || { uso; exit 2; }
SUBCOMANDO=$1
shift
case "$SUBCOMANDO" in
  construir)
    [[ $# -eq 0 ]] || { uso; exit 2; }
    # Valores contrastados el 13/10/2026 (ver Dockerfile); se pueden sobrescribir.
    UBUNTU_DIGEST=${UBUNTU_DIGEST:-sha256:88a381d5b5eeb2b35d3ad70925a362c37ce569daf43ede89ff818ec20e4d3794}
    OPENCODE_SHA256=${OPENCODE_SHA256:-d91e0d33676d0839f7cde87924cd4127ea88c9d6784eea9f009a7d08bdc60eeb}
    [[ ${UBUNTU_DIGEST:-} =~ ^sha256:[[:xdigit:]]{64}$ ]] || fallar "Completar UBUNTU_DIGEST con el resumen de ubuntu:26.04 para linux/amd64."
    [[ ${OPENCODE_SHA256:-} =~ ^[[:xdigit:]]{64}$ ]] || fallar "Completar OPENCODE_SHA256 con el hash contrastado del binario x64-baseline 1.18.25."
    command -v docker >/dev/null 2>&1 || fallar "No se encuentra el cliente Docker."
    docker build --platform linux/amd64 --tag "$IMAGEN" \
      --build-arg "UBUNTU_DIGEST=$UBUNTU_DIGEST" \
      --build-arg "OPENCODE_SHA256=$OPENCODE_SHA256" \
      --file "$(ruta_docker "$ORIGEN/Dockerfile")" "$(ruta_docker "$ORIGEN")"
    ;;
  verificar|permisos)
    [[ $# -eq 2 ]] || { uso; exit 2; }
    CASO=$1
    [[ $CASO == todos || $CASO =~ ^(practica|C-[1-4][a-f])$ ]] || fallar "Caso inválido: '$CASO'."
    if [[ $SUBCOMANDO == permisos ]]; then
      [[ $CASO == todos || $CASO =~ ^C-(1[bdf]|3[bdf]|4[a-f])$ ]] || fallar "No es un caso de permiso: '$CASO'."
    fi
    [[ -d $2 ]] || fallar "La carpeta de evidencia debe existir y estar vacía."
    EVIDENCIA="$(cd "$2" && pwd -P)"
    # Windows no distingue mayúsculas: comparar también en minúsculas.
    case "${EVIDENCIA,,}/" in
      "${REPOSITORIO,,}/"*) fallar "La evidencia debe quedar fuera del repositorio." ;;
    esac
    [[ -z $(find "$EVIDENCIA" -mindepth 1 -maxdepth 1 -print -quit) ]] || fallar "La carpeta de evidencia no está vacía (incluidos archivos ocultos)."
    command -v docker >/dev/null 2>&1 || fallar "No se encuentra el cliente Docker."
    CONTENEDOR="rige-$SUBCOMANDO-$$-$RANDOM"
    trap limpiar EXIT
    trap 'exit 130' INT
    trap 'exit 143' TERM
    # Se mantiene vivo sólo hasta copiar la evidencia; --rm y el trap lo eliminan.
    # La captura activa cada caso con caso.sh antes de ejecutar la introspección.
    docker run --rm --detach --network none --platform linux/amd64 \
      --name "$CONTENEDOR" --user root --workdir /opt/linea-base \
      "$IMAGEN" /bin/bash -c '
        mkdir -p /opt/linea-base/verificacion
        if [[ $1 == todos ]]; then "/opt/linea-base/$2.sh"
        else "/opt/linea-base/$2.sh" "$1"; fi
        codigo=$?
        printf "%s\n" "$codigo" > /opt/linea-base/verificacion/codigo-salida.txt
        touch /opt/linea-base/captura-terminada
        exec sleep infinity
      ' _ "$CASO" "$SUBCOMANDO" >/dev/null
    docker exec "$CONTENEDOR" /bin/bash -c '
      while [[ ! -f /opt/linea-base/captura-terminada ]]; do sleep 1; done
    '
    docker logs "$CONTENEDOR"
    docker cp "$CONTENEDOR:/opt/linea-base/verificacion/." "$(ruta_docker "$EVIDENCIA")"
    CODIGO="$(cat "$EVIDENCIA/codigo-salida.txt")"
    [[ $CODIGO =~ ^[0-9]+$ && $CODIGO -le 255 ]] || fallar "Código de salida de la captura inválido."
    echo "Evidencia copiada a $EVIDENCIA; comparar con respuestas.md fuera del contenedor."
    if [[ $SUBCOMANDO == verificar ]]; then
      echo "Complementar con permisos todos <carpeta-vacía> (01-alcance.txt)."
    else
      echo "Revisar controles de contaminación, clasificaciones y evidencia cruda (01-alcance.txt)."
    fi
    exit "$CODIGO"
    ;;
  medir)
    ENSAYO=0
    DIMENSION=atribucion
    SONDA=
    DESTINO=''
    ARGUMENTOS=()
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --sonda) [[ $# -ge 2 ]] || fallar 'Falta archivo para --sonda.'; SONDA=$2; ARGUMENTOS+=(--sonda "/opt/linea-base/$(basename "$SONDA")"); shift 2 ;;
        --sonda=*) SONDA=${1#--sonda=}; ARGUMENTOS+=(--sonda "/opt/linea-base/$(basename "$SONDA")"); shift ;;
        --ensayo) ENSAYO=1; ARGUMENTOS+=(--ensayo); shift ;;
        --destino) [[ $# -ge 2 ]] || fallar 'Falta carpeta para --destino.'; DESTINO=$2; shift 2 ;;
        --dimension) [[ $# -ge 2 ]] || fallar 'Falta valor para --dimension.'; DIMENSION=$2; ARGUMENTOS+=(--dimension "$2"); shift 2 ;;
        --dimension=*) DIMENSION=${1#--dimension=}; ARGUMENTOS+=("$1"); shift ;;
        *) ARGUMENTOS+=("$1"); shift ;;
      esac
    done
    [[ $DIMENSION == atribucion || $DIMENSION == modificacion ]] || fallar 'Dimensión inválida.'
    if [[ $DIMENSION == modificacion && $ENSAYO -eq 1 && " ${ARGUMENTOS[*]} " != *' --hash-tareas '* && " ${ARGUMENTOS[*]} " != *' --hash-tareas='* ]]; then
      HASH_TAREAS=$(sha256sum "$ORIGEN/../modificacion/tareas.md")
      ARGUMENTOS+=(--hash-tareas "${HASH_TAREAS%% *}")
    fi
    [[ -n $DESTINO && -d $DESTINO ]] || fallar 'Indicar --destino con una carpeta existente y vacía fuera del repositorio.'
    EVIDENCIA="$(cd "$DESTINO" && pwd -P)"
    case "${EVIDENCIA,,}/" in
      "${REPOSITORIO,,}/"*) fallar 'La evidencia debe quedar fuera del repositorio.' ;;
    esac
    [[ -z $(find "$EVIDENCIA" -mindepth 1 -maxdepth 1 -print -quit) ]] || fallar 'La carpeta destino no está vacía.'
    RED=(--network none)
    CREDENCIAL=()
    if [[ $ENSAYO -eq 0 ]]; then
      [[ -n ${OPENCODE_AUTH_JSON:-} ]] || fallar 'Falta OPENCODE_AUTH_JSON del evaluador; sólo por variable de entorno.'
      RED=(--network bridge)
      # Docker recibe el NOMBRE de la variable, nunca su contenido en argv.
      CREDENCIAL=(--env OPENCODE_AUTH_JSON)
    elif [[ -n ${OPENCODE_AUTH_JSON:-} ]]; then
      fallar 'Quitar OPENCODE_AUTH_JSON para la tanda de ensayo.'
    fi
    command -v docker >/dev/null 2>&1 || fallar 'No se encuentra el cliente Docker.'
    CONTENEDOR="rige-medir-$$-$RANDOM"
    trap limpiar EXIT
    trap 'exit 130' INT
    trap 'exit 143' TERM
    # Arranque sin montajes; copiar tarifas y catálogo también en el ensayo.
    docker run --rm --detach --init "${RED[@]}" "${CREDENCIAL[@]}" --platform linux/amd64 \
      --name "$CONTENEDOR" --user root --workdir /opt/linea-base \
      "$IMAGEN" sleep infinity >/dev/null
    docker cp "$(ruta_docker "$ORIGEN/../tarifas-congeladas-20261001.json")" "$CONTENEDOR:/opt/linea-base/tarifas.json"
    docker cp "$(ruta_docker "$ORIGEN/../catalogo-modelos-20261013.json")" "$CONTENEDOR:/opt/linea-base/modelos.json"
    if [[ $DIMENSION == modificacion ]]; then
      docker cp "$(ruta_docker "$ORIGEN/../modificacion/tareas.md")" "$CONTENEDOR:/opt/linea-base/tareas.md"
    fi
    if [[ -n $SONDA ]]; then
      [[ -f $SONDA ]] || fallar 'Archivo de sonda inexistente.'
      docker cp "$(ruta_docker "$SONDA")" "$CONTENEDOR:/opt/linea-base/$(basename "$SONDA")"
    fi
    # exec no imprime ni exporta la credencial en el registro de la tarea.
    CODIGO=0
    docker exec "$CONTENEDOR" /opt/linea-base/medir.sh "${ARGUMENTOS[@]}" || CODIGO=$?
    # Preservar también la evidencia de un fallo o detención de fase 0.
    docker cp "$CONTENEDOR:/opt/linea-base/resultados/." "$(ruta_docker "$EVIDENCIA")" || {
      echo 'La medición se detuvo antes de crear resultados; revisar el error anterior.' >&2
      exit "${CODIGO:-1}"
    }
    echo "Resultados copiados a $EVIDENCIA; corregir y analizar afuera."
    exit "$CODIGO"
    ;;
  shell)
    [[ $# -eq 0 ]] || { uso; exit 2; }
    command -v docker >/dev/null 2>&1 || fallar "No se encuentra el cliente Docker."
    # Root es sólo la consola del ingeniero. El ejecutor se inicia como evaluador.
    docker run --rm --interactive --tty --network none --platform linux/amd64 \
      --user root --workdir /opt/linea-base "$IMAGEN" /bin/bash --login
    ;;
  *) uso; exit 2 ;;
esac
