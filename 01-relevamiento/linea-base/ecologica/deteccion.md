# Detección de declaraciones sin efecto (ADR-092)

- **Estado: hoja cerrada el 14/10/2026** (delegación del autor). Corpus verificado contra OpenCode 1.18.25: `../verificacion/20261014-tareas-ecologica/evaluacion-corpus.txt`.
- Entra al contenedor. El corpus con la clasificación (`corpus.py`) **no** entra. Escenarios: D-A (permisos), D-B (valores), D-C (entradas). Tipos de RF-07 no incluidos por no ser verificables en forma mecánica: referencias no resueltas, elementos sin uso, entradas ilegibles.

## Instrucción

```
Estás ayudando a un desarrollador a revisar la configuración de OpenCode 1.18.25 de su proyecto.

Estás trabajando en el directorio de su proyecto. Para ejecutar comandos con su entorno (sus variables y su configuración), usá:
    como-dev '<comando>'
Tenés la hoja de referencia en /home/evaluador/tarea/hoja-referencia.md y la documentación
oficial de OpenCode 1.18.25 sin conexión en /home/evaluador/tarea/docs/index.html.

No modifiques ningún archivo.

Pregunta: ¿Hay declaraciones en la configuración de OpenCode del desarrollador (archivos globales, del proyecto, agentes y variables de entorno) que no producen efecto en la configuración efectiva? Indicá cada una con su archivo (o variable), su clave o regla, y por qué no produce efecto.

Cuando termines, cerrá tu mensaje con un único bloque JSON con esta forma exacta:
{"sin_efecto": [{"archivo": "<ruta o variable>", "clave": "<clave o regla>", "motivo": "<por qué>"}]}
Si no encontrás ninguna, devolvé la lista vacía.
```
