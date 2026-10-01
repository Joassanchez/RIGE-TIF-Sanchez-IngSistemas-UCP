## X.2 · Recursos físicos y materiales

RIGE opera localmente, sin servidor ni conexiones salientes durante el análisis (RNF-05), por lo que su modo de operación permite utilizar el equipo del desarrollador sin exigir un dispositivo específico ni infraestructura de servidor. El uso y la comprobación del prototipo v1 se realizan por instalación nativa sobre las plataformas declaradas en RNF-06, sin privilegios administrativos.

El proyecto emplea un único equipo físico, propio y preexistente del autor: una computadora portátil Samsung Galaxy Book3 (750XFG), con procesador Intel Core i7-1355U de 10 núcleos y 12 hilos, 16 GB de memoria LPDDR4x, unidad de estado sólido NVMe de 512 GB y sistema operativo Windows 11 Home 10.0.26200, según la medición del equipo del 28/09/2026. Aloja el desarrollo, la plataforma Windows 11 y el entorno Linux de referencia.

El entorno Linux de referencia consiste en un contenedor Ubuntu 26.04, ejecutado con Docker Desktop sobre WSL 2, con 8 GB de memoria y 12 procesadores lógicos fijados en `.wslconfig`. Aloja la regeneración del oráculo, la medición con agentes y la de RNF-07, con el proyecto sintético dentro del contenedor. Su condición de validez, sin rutas del anfitrión expuestas, sin privilegios elevados y con los guiones de medición en funcionamiento, se verifica antes de la primera medición; la deliberación consta en el Anexo III, D-47. La instalación nativa en Ubuntu 26.04 se acredita en el canal de integración continua, que ejecuta en un ejecutor `ubuntu-26.04` y en Windows (GitHub, s. f.).

El umbral de RNF-07 vale en ese entorno declarado y la medición en Windows 11 es informativa. No se adquiere equipamiento.
