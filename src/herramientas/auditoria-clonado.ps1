# Autocomprobacion local del prototipo v1 sobre un clon de la revision confirmada.
$ErrorActionPreference = 'Stop'
$origen = (Get-Item (Join-Path $PSScriptRoot "../..")).FullName
$raizTemporal = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd('\', '/')
$temporal = Join-Path $raizTemporal ('rige-clon-' + [Guid]::NewGuid().ToString('N'))
$destino = Join-Path $temporal 'repositorio'
$entornoOriginal = [Environment]::GetEnvironmentVariables('Process')
$servidorProceso = $null
$posicionado = $false

function Confirmar-Codigo([string] $operacion) {
    if ($LASTEXITCODE -ne 0) {
        throw "$operacion termino con codigo $LASTEXITCODE."
    }
}

try {
    New-Item -ItemType Directory -Path $temporal | Out-Null
    $env:RIGE_ALMACEN = Join-Path $temporal 'almacen'
    Write-Host '==> 1. Clonando la revision local confirmada ...'
    git clone --quiet --no-hardlinks -- $origen $destino
    Confirmar-Codigo 'git clone'
    Push-Location (Join-Path $destino 'src')
    $posicionado = $true

    Write-Host '==> 2. Verificando Bun 1.3.14 ...'
    $bunVersion = bun --version
    Confirmar-Codigo 'bun --version'
    if ($bunVersion -ne '1.3.14') {
        throw "Version de Bun incorrecta: esperada 1.3.14, encontrada $bunVersion."
    }
    $bun = (Get-Command bun -CommandType Application).Source

    Write-Host '==> 3. Instalando dependencias desde bun.lock ...'
    & $bun install --frozen-lockfile
    Confirmar-Codigo 'bun install --frozen-lockfile'

    Write-Host '==> 4. Verificando tipos y construccion ...'
    & $bun run verificar
    Confirmar-Codigo 'bun run verificar'

    Write-Host '==> 5. Copiando rige.env.example y aislando el entorno ...'
    Copy-Item -LiteralPath 'rige.env.example' -Destination 'rige.env'
    # Las ejecuciones del producto heredan solo PATH y SystemRoot del anfitrion.
    # Los temporales del runtime tambien quedan dentro de esta auditoria.
    $variablesTemporales = @('HOME', 'USERPROFILE', 'XDG_CONFIG_HOME', 'XDG_DATA_HOME',
        'XDG_STATE_HOME', 'XDG_CACHE_HOME', 'LOCALAPPDATA', 'APPDATA', 'ProgramData', 'TEMP', 'TMP')
    foreach ($nombre in $variablesTemporales) {
        $ruta = Join-Path $temporal $nombre
        New-Item -ItemType Directory -Path $ruta | Out-Null
        [Environment]::SetEnvironmentVariable($nombre, $ruta, 'Process')
    }
    $env:RIGE_ALMACEN = Join-Path $temporal 'almacen'
    # Mantener siempre las rutas del shell definidas evita caches relativos al cwd.
    $variablesPermitidas = $variablesTemporales + @('PATH', 'SystemRoot', 'RIGE_ALMACEN')
    foreach ($nombre in @([Environment]::GetEnvironmentVariables('Process').Keys)) {
        if ($nombre -notin $variablesPermitidas) {
            [Environment]::SetEnvironmentVariable($nombre, $null, 'Process')
        }
    }
    $instalacion = Join-Path $temporal 'instalacion-falsa'
    New-Item -ItemType Directory -Path (Join-Path $instalacion 'node_modules/opencode-ai') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $instalacion 'opencode.cmd') -Value '@exit /b 99' -Encoding ASCII
    Set-Content -LiteralPath (Join-Path $instalacion 'node_modules/opencode-ai/package.json') -Encoding ASCII `
        -Value '{"name":"opencode-ai","version":"1.18.25"}'
    $env:PATH = $instalacion + [System.IO.Path]::PathSeparator + $env:PATH

    Write-Host '==> 6. Creando esquema en el almacen temporal ...'
    & $bun run esquema
    Confirmar-Codigo 'bun run esquema'

    Write-Host '==> 7. Comprobando hallazgos.test.ts (< 500 ms) ...'
    $reloj = [System.Diagnostics.Stopwatch]::StartNew()
    & $bun test paquetes/opencode/hallazgos.test.ts
    $codigoPrueba = $LASTEXITCODE
    $reloj.Stop()
    if ($codigoPrueba -ne 0) { throw "hallazgos.test.ts termino con codigo $codigoPrueba." }
    Write-Host "Prueba optimizada: $($reloj.ElapsedMilliseconds) ms."
    if ($reloj.Elapsed.TotalMilliseconds -ge 500) {
        throw "hallazgos.test.ts excedio el limite estricto de 500 ms ($($reloj.ElapsedMilliseconds) ms)."
    }

    Write-Host '==> 8. Consultando el valor efectivo por CLI ...'
    $json = & $bun --silent run rige -- valores --proyecto pruebas/escenarios/v1-precedencia/proyecto `
        --agente build --clave temperature
    Confirmar-Codigo 'consulta CLI'
    $respuestaCli = ($json -join "`n") | ConvertFrom-Json
    if ($respuestaCli.esquema -ne 2 -or @($respuestaCli.valores).Count -ne 1 -or
        $respuestaCli.valores[0].rastro.valor -ne 0.3) {
        throw 'La CLI no devolvio temperature = 0.3 con esquema 2.'
    }

    Write-Host '==> 9. Comprobando arranque y parada del servidor web ...'
    $reserva = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
    try {
        $reserva.Start()
        $puertoPrueba = $reserva.LocalEndpoint.Port
    }
    finally { $reserva.Stop() }
    $env:RIGE_PUERTO = [string] $puertoPrueba
    # Es el punto de entrada de bun run servir; un unico PID permite detenerlo completo.
    $servidorProceso = Start-Process -FilePath $bun -ArgumentList './paquetes/rige/arranque/rige.ts', 'servir' `
        -WorkingDirectory (Get-Location).Path -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $temporal 'servidor-salida.log') `
        -RedirectStandardError (Join-Path $temporal 'servidor-error.log')
    $limite = [System.Diagnostics.Stopwatch]::StartNew()
    while ($true) {
        if ($servidorProceso.HasExited) {
            throw "El servidor termino antes de responder: $(Get-Content -Raw -LiteralPath (Join-Path $temporal 'servidor-error.log'))"
        }
        try {
            $respuesta = Invoke-WebRequest -Uri "http://127.0.0.1:$puertoPrueba/" -UseBasicParsing -TimeoutSec 1
            break
        }
        catch [System.Net.WebException] {
            if ($_.Exception.Status -ne [System.Net.WebExceptionStatus]::ConnectFailure -or
                $limite.Elapsed.TotalSeconds -ge 10) { throw }
            Start-Sleep -Milliseconds 100
        }
    }
    if ($respuesta.StatusCode -ne 200 -or $respuesta.Content -notmatch 'RIGE 0.1.0') {
        throw 'La pagina inicial no respondio HTTP 200 con RIGE 0.1.0.'
    }
    Stop-Process -Id $servidorProceso.Id -Force
    $servidorProceso.WaitForExit()
    Write-Host "Servidor detenido tras responder HTTP 200 en el puerto $puertoPrueba."
    Write-Host 'AUDITORIA EXITOSA: clon, instalacion, esquema, prueba optimizada, CLI y servidor local verificados.'
}
finally {
    try {
        if ($servidorProceso -and -not $servidorProceso.HasExited) {
            Stop-Process -Id $servidorProceso.Id -Force
            $servidorProceso.WaitForExit()
        }
        if ($posicionado) { Pop-Location }
        # Verificar el destino absoluto antes de cualquier borrado recursivo.
        $rutaFinal = [System.IO.Path]::GetFullPath($temporal)
        if ([System.IO.Path]::GetDirectoryName($rutaFinal) -ne $raizTemporal -or
            [System.IO.Path]::GetFileName($rutaFinal) -notmatch '^rige-clon-[0-9a-f]{32}$') {
            throw "Destino temporal fuera de la raiz prevista: $rutaFinal"
        }
        if (Test-Path -LiteralPath $rutaFinal) {
            Get-ChildItem -LiteralPath $rutaFinal -Recurse -Force | ForEach-Object { $_.Attributes = 'Normal' }
            Remove-Item -LiteralPath $rutaFinal -Recurse -Force
        }
    }
    finally {
        foreach ($nombre in $entornoOriginal.Keys) {
            [Environment]::SetEnvironmentVariable($nombre, $entornoOriginal[$nombre], 'Process')
        }
        foreach ($nombre in @([Environment]::GetEnvironmentVariables('Process').Keys)) {
            if (-not $entornoOriginal.Contains($nombre)) {
                [Environment]::SetEnvironmentVariable($nombre, $null, 'Process')
            }
        }
    }
}
