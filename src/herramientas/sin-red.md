# Verificación de RNF-05 (T3-09, recuento T5-05)

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

La prueba R-1 intercepta clientes de red **en el proceso** mediante precarga.
Exige código 0 y stdout no vacío tras `trim` en cada consulta, además de igualdad
con la corrida normal. Es apoyo automatizado: la acreditación de CA-2 con la
interfaz deshabilitada corresponde al contenedor con `--network none`.

En Linux, `--strace` registra cada CLI con
`strace -f -yy -e trace=connect,sendto,sendmsg -o <temporal>`. Cada análisis
trazado debe terminar con código 0 y stdout no vacío tras `trim`; una CLI fallida
o vacía no acredita CA-1, aunque la traza no contenga intentos externos.

El informe contiene una línea por llamada (`connect`, `sendto`, `sendmsg`),
seguida de un objeto JSON con estos conteos de **intentos**, incluidos los fallidos:

| Campo | Destinos |
|---|---|
| `externoIPv4` | AF_INET fuera de 127.0.0.0/8 |
| `externoIPv6` | AF_INET6 fuera de ::1 y de las mapeadas locales indicadas abajo |
| `loopbackIPv4` | IPv4 127.0.0.0/8 |
| `loopbackIPv6` | IPv6 ::1, incluso expandida; IPv4 mapeada en IPv6 cuyo IPv4 pertenece a 127.0.0.0/8 |
| `unix` | AF_UNIX |
| `netlink` | AF_NETLINK |
| `otras` | Otra familia explícita distinta de AF_INET/AF_INET6 (p. ej. AF_UNSPEC) |
| `indeterminados` | Destino no resoluble o llamada incompleta |

Las IPv4 mapeadas (`::ffff:a.b.c.d` o su forma hexadecimal) conservan el conteo
IPv6: si el IPv4 pertenece a 127/8 son locales; las demás son externas. Las
direcciones privadas y no especificadas no se excluyen del total externo.
La clasificación usa el `sockaddr` de destino; no busca familias en el payload.
Los envíos conectados con destino `NULL` se resuelven mediante el par remoto del
descriptor anotado por `-yy`. Sin ese dato, el destino es indeterminado y la
comprobación falla. Las líneas `unfinished`/`resumed` se reúnen por PID y se cuentan
una sola vez; si falta una parte, no se acredita un cero.

Se exigen **cero intentos externos** y **cero destinos indeterminados**. Los
conteos locales y de otras familias se informan y **no tienen que ser cero**.
El código del comando es 0 solo si todas las CLI trazadas fueron exitosas, el
recuento cumple esas condiciones y no hay diferencias contra la referencia
(si se pidió comparar). Es 1 ante un intento externo, destino indeterminado,
análisis fallido/vacío, error del trazador o diferencia; es 2 por argumentos
inválidos o por pedir `--strace` sin Linux o sin strace instalado. Ante un intento
externo se interrumpe el recorrido y se informa escenario, subcomando y recuento,
sin descontarlo por atribuirlo al runtime. La traza se elimina junto con la copia.

En `bun test`, R-3 ejecuta strace en Linux si está disponible. En Linux sin strace
y con `CI` exactamente `true`, falla con un mensaje explícito; fuera de ese CI se
omite con el motivo en el título. En Windows se omite incluso con `CI=true`.
El trabajo `verificar` instala strace antes de `bun test` solo en el runner Linux.
Este recuento cubre las tres llamadas indicadas, no todas las llamadas de red
posibles, y no reemplaza la evidencia del contenedor ni declara cerrado PIL-02.

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
`externoIPv4: 0`, `externoIPv6: 0` e `indeterminados: 0` en el objeto JSON de cada
llamada. Los conteos locales se conservan aunque sean distintos de cero.
Ambas usan la misma imagen y raíz
temporal. Preparar nuevamente la imagen si cambia el código. La corrida Docker
la realiza el ingeniero; en Windows la suite omite strace.
