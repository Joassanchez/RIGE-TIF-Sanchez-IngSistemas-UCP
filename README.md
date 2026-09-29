# RIGE

**Plataforma local para la resolución y explicación de la configuración efectiva y su procedencia en herramientas de programación basadas en agentes.**

> **Instalar, ejecutar y verificar el prototipo:** [`src/README.md`](src/README.md)

## Qué es

La configuración de un agente de programación no está escrita en un solo lugar. Se reparte entre varios archivos que la herramienta combina según un orden de prioridad, valores que llegan desde variables del entorno, y reglas y elementos propios de la herramienta que no figuran en ningún archivo. Hoy, saber qué rige realmente sobre un agente obliga a revisar todo eso y deducir el resultado a mano.

RIGE lee esa configuración sin modificarla y responde, para OpenCode 1.18.25:

- **qué valor rige** en cada clave de un agente, qué archivo y qué línea lo determinan, y qué declaraciones quedan sin efecto;
- **si un agente puede realizar una acción**, debe pedir confirmación o la tiene prohibida, y qué regla lo decide;
- **qué defectos tiene la configuración**: referencias a elementos inexistentes, reglas que nunca se aplican y elementos que ningún agente puede utilizar.

Las respuestas se obtienen desde una interfaz web local, que el propio programa sirve en el equipo, y desde la terminal con salida estructurada, pensada también para que otro agente la consulte antes de operar. RIGE funciona sin conexión a internet y no ejecuta OpenCode.

## Estado

| Versión | Estado | Qué incluye |
|---|---|---|
| `v1` (prototipo) | En desarrollo | Consulta del valor efectivo de una clave de un agente, con su procedencia y las declaraciones desplazadas, sobre un proyecto con tres archivos de configuración de distinta prioridad. La resolución se guarda en un almacén local y se recupera para mostrarla. |

Las capacidades siguientes se incorporan por iteraciones.

## Tecnología

TypeScript sobre Bun 1.3.14, SQLite embebido e interfaz web local en `127.0.0.1`, con integración continua en GitHub Actions sobre Ubuntu y Windows.

## Autoría y licencia

Proyecto Integrador Final · Ingeniería en Sistemas de Información · Universidad de la Cuenca del Plata, Sede Posadas · 2026.
Autor: Joaquín Sebastián Sánchez · Docente Titular: PosDr. Darío Ezequiel Díaz · Comisión A.

El repositorio permanece privado durante la evaluación. Se publicará bajo licencia MIT después de la aprobación. Incorpora código de OpenCode, también bajo licencia MIT, con su atribución.
