## IX.3 · Infraestructura y entornos de trabajo

RIGE se ejecuta en el equipo del desarrollador, sin infraestructura de servidor propia, y guarda sus resoluciones en un almacén SQLite fuera del proyecto analizado. La escucha local, la operación sin conexiones salientes y la lectura de configuración sin escritura se describen en IX.1.1. La aplicación se ejecuta sobre el código fuente con `bun run`. Su configuración se lee de `rige.env` en forma explícita, con el puerto 4747 como valor por defecto (ADR-062). El equipo del autor utilizado para la construcción se describe en X.2 y los recursos tecnológicos, en X.4.

La Tabla IX.5 distingue el propósito de cada entorno y el procedimiento para reproducirlo.

| **Entorno** | **Propósito** | **Plataforma** | **Cómo se reproduce** |
|---|---|---|---|
| Desarrollo | Construcción y pruebas del proyecto | Windows 11, en el equipo descrito en X.2 | Bun 1.3.14 e instalación con el archivo de bloqueo mediante `bun install --frozen-lockfile` |
| Integración continua | Verificación de tipos, construcción de comprobación, pruebas y prueba lenta en cada envío; segundo trabajo contra OpenCode 1.18.25 instalado como referencia nativa | Ubuntu 26.04 y Windows en GitHub Actions | Archivo del canal versionado con el código, con los trabajos `verificar` y `referencia-nativa` |
| Contenedor de referencia | Oráculo de OpenCode, mediciones con agentes y medición de RNF-07 | Imagen Ubuntu 26.04 fijada por resumen, con OpenCode verificado por su resumen SHA-256 | Definición de la imagen versionada; Docker Desktop sobre WSL 2 (X.2) |
| Comprobación | Ejecución por un tercero según el manual | Instalación nativa, sin contenedor | Requisitos previos con versión exacta y comandos del archivo de lectura del código |
| Uso | Consulta del desarrollador o de un agente externo | Equipo del desarrollador, con Ubuntu 26.04 o Windows 11 | El mismo procedimiento que la comprobación |

*Tabla IX.5. Entornos de trabajo de RIGE, con su propósito y su forma de reproducirlos. Fuente: elaboración propia (registro de la evidencia, Anexo I, A.I.11).*

Los documentos de reproducción incluyen la declaración de herramientas auxiliares en el archivo de lectura del código, que también se consulta en la bitácora.

Se adopta la matriz de plataformas para verificar la instalación nativa y un contenedor común para fijar el entorno del oráculo y obtener mediciones comparables (ADR-054). Se descarta limitar la comprobación al contenedor porque exige un motor de contenedores en el equipo del tercero (Anexo III, D-27). La distribución WSL dedicada se descarta como entorno de medición porque su aislamiento depende de la configuración y su reproducción queda limitada a Windows (Anexo III, D-47).

Las pruebas de aceptación se ejecutan en subprocesos con un entorno construido desde cero y escenarios copiados a temporales. La seguridad de la web comprende solo consultas GET, verificación del encabezado `Host`, sin CORS y rechazo de solicitudes de otro sitio mediante `Sec-Fetch-Site` (RNF-09, ADR-062).

El estado del canal se acredita en el Capítulo XIII y en la evidencia de integración continua del Anexo III. La matriz de plataformas usa Windows Server; la acreditación de RNF-06 en Windows 11 con una cuenta sin privilegios administrativos sigue pendiente de la comprobación manual (ADR-054).
