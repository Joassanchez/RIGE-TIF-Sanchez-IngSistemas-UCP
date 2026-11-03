# Verificación de RNF-05 (T3-09)

Desde `src/`, con Bun 1.3.14 y Git instalados, en PowerShell:

```powershell
$env:RIGE_ALMACEN = Join-Path ([IO.Path]::GetTempPath()) 'rige-sin-red-almacen'
$referencia = Join-Path ([IO.Path]::GetTempPath()) 'rige-sin-red.json'
bun test pruebas/aceptacion/RNF-05.test.ts
bun run sin-red --salida $referencia
bun run sin-red --comparar $referencia
```

`--escenario <id>` se puede repetir; sin selección se recorren todos los
escenarios del manifiesto. Se ejecutan `valores`, `agentes`, `entradas`,
`hallazgos --explicar` y cada consulta de `permiso`. Con `fallaEsperada`,
se ejecutan solamente `entradas` y `hallazgos`.

La referencia es un arreglo ordenado de `{ escenario, subcomando, codigo,
sha256 }`. Las consultas se identifican como `permiso:<id>`. El hash corresponde
al JSON del par `[stdout normalizado, stderr normalizado]`; el código de salida
se compara por separado. Se detectan cambios, registros ausentes y adicionales.

Las copias se crean exclusivamente en `<temporal>/rige-sin-red-<escenario>` y
se eliminan al terminar. Si esa ruta existe, la corrida falla sin borrarla.
Esto evita que los resúmenes de entradas y los hashes de archivos con `<RAIZ>`
cambien por el nombre aleatorio del temporal. Las rutas visibles se sustituyen
por `<RAIZ>` antes del hash, incluidas las rutas escapadas en JSON.
La comparación requiere la misma plataforma y raíz temporal. Se conservan
todos los campos y resúmenes. Hogar, almacén e instalación falsa de OpenCode
1.18.25 están en la copia; solo se heredan PATH y SystemRoot.

En Linux, `--strace` registra cada CLI con
`strace -f -e trace=connect,sendto,sendmsg -o <temporal>` e informa los conteos
de `connect` AF_INET, AF_INET6 y AF_UNIX por separado. AF_INET o AF_INET6 distintos
de cero dan código 1, igual que una diferencia contra la referencia. AF_UNIX
siempre se informa. La traza se elimina junto con la copia. Sin Linux o sin
`strace`, la opción termina con código 2 y un diagnóstico.

## Docker con Ubuntu 26.04 y red deshabilitada

Ejecutar en **Bash desde `src/`**, con Docker disponible. La preparación instala
Bun, Git, strace y dependencias con red disponible. El repositorio se monta en
solo lectura. Una copia en `/trabajo` permite instalar dependencias Linux sin
tocar el original. La imagen intermedia conserva esa copia para ambas corridas.

```bash
repo="$(cd .. && pwd)"
evidencia="$(mktemp -d)"
docker run --name rige-sin-red-preparar \
  --mount "type=bind,src=$repo,dst=/repo,readonly" \
  ubuntu:26.04 bash -euc '
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y --no-install-recommends ca-certificates curl unzip git strace
    curl -fsSL https://bun.sh/install -o /tmp/instalar-bun.sh
    bash /tmp/instalar-bun.sh bun-v1.3.14
    export PATH="/root/.bun/bin:$PATH"
    export RIGE_ALMACEN=/tmp/rige-preparacion-almacen
    mkdir /trabajo
    tar -C /repo/src --exclude=node_modules -cf /tmp/fuentes.tar .
    tar -C /trabajo -xf /tmp/fuentes.tar
    cd /trabajo
    bun install --frozen-lockfile
    bun --version
    strace --version
  '
docker commit rige-sin-red-preparar rige-sin-red:ubuntu26.04-bun1.3.14
docker rm rige-sin-red-preparar

docker run --rm --network bridge \
  --mount "type=bind,src=$repo,dst=/repo,readonly" \
  --mount "type=bind,src=$evidencia,dst=/evidencia" \
  --workdir /trabajo \
  --env PATH=/root/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  --env RIGE_ALMACEN=/tmp/rige-almacen --env TMPDIR=/tmp \
  rige-sin-red:ubuntu26.04-bun1.3.14 \
  bun run sin-red --salida /evidencia/sin-red.json

docker run --rm --network none --cap-add SYS_PTRACE \
  --security-opt seccomp=unconfined \
  --mount "type=bind,src=$repo,dst=/repo,readonly" \
  --mount "type=bind,src=$evidencia,dst=/evidencia,readonly" \
  --workdir /trabajo \
  --env PATH=/root/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  --env RIGE_ALMACEN=/tmp/rige-almacen --env TMPDIR=/tmp \
  rige-sin-red:ubuntu26.04-bun1.3.14 \
  bun run sin-red --comparar /evidencia/sin-red.json --strace

printf 'Referencia conservada en %s/sin-red.json\n' "$evidencia"
```

La segunda corrida debe terminar en 0, sin diferencias, e informar
`AF_INET: 0`, `AF_INET6: 0` y `AF_UNIX: 0`. Ambas usan la misma imagen y raíz
temporal. Preparar nuevamente la imagen si cambia el código. La corrida Docker
la realiza el ingeniero; en Windows la suite omite strace.
