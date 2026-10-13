# syntax=docker/dockerfile:1
# Resumen del manifiesto linux/amd64 de ubuntu:26.04 (creado el 27/09/2026),
# obtenido con `docker buildx imagetools inspect ubuntu:26.04` el 13/10/2026.
ARG UBUNTU_DIGEST=sha256:88a381d5b5eeb2b35d3ad70925a362c37ce569daf43ede89ff818ec20e4d3794
FROM ubuntu:26.04@${UBUNTU_DIGEST}

# SHA-256 de package/bin/opencode de opencode-linux-x64-baseline 1.18.25.
# Contrastado el 13/10/2026: integridad sha512 del paquete igual a la publicada
# por npm, y hash igual al registrado en src/herramientas/referencias-nativas.ts.
ARG OPENCODE_SHA256=d91e0d33676d0839f7cde87924cd4127ea88c9d6784eea9f009a7d08bdc60eeb
ENV OPENCODE_DISABLE_AUTOUPDATE=1 \
    OPENCODE_DISABLE_MODELS_FETCH=1

USER root
RUN test "$(dpkg --print-architecture)" = amd64 \
    && apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
       bash ca-certificates curl git python3 sudo util-linux \
    && rm -rf /var/lib/apt/lists/*

# El contexto es exclusivamente vm/, filtrado además por .dockerignore.
COPY --chown=root:root --chmod=700 casos/ /opt/linea-base/casos/
COPY --chown=root:root --chmod=700 caso.sh verificar.sh permisos.sh medir.sh /opt/linea-base/
COPY --chown=root:root --chmod=700 ejecutores/ /opt/linea-base/ejecutores/
COPY --chown=root:root --chmod=700 indicacion.txt /opt/linea-base/indicacion.txt
COPY --chown=root:root --chmod=700 simulado/ /opt/linea-base/simulado/
COPY --chown=root:root --chmod=700 instalar.sh /opt/linea-base/instalar.sh
COPY --chown=root:root --chmod=755 como-dev /usr/local/bin/como-dev
COPY --chown=root:root docs/ /opt/linea-base/docs/
COPY --chown=root:root hoja-referencia.md /opt/linea-base/hoja-referencia.md
RUN /opt/linea-base/instalar.sh "${OPENCODE_SHA256}"

# El ejecutor arranca separado del escenario y sin privilegios de root.
USER evaluador
WORKDIR /home/evaluador/tarea
CMD ["/bin/bash", "--login"]
