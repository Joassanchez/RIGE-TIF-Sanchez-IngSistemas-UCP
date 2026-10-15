# Tareas de modificación (ADR-085)

- **Estado: hoja cerrada el 14/10/2026** con la aprobación del autor de los enunciados y la instrucción. Desde ahora no cambia una palabra; su SHA-256 se registra en cada tanda.
- Este archivo entra al contenedor (lo lee `medir.sh`). La hoja de respuestas (`respuestas-modificacion.md` y su JSON) **no**.
- Derivación: una tarea por caso, sobre el mismo escenario; misma clave o decisión que pregunta el caso; valor objetivo ausente del escenario (`../verificacion/20261014-tareas-modificacion/diseno-tareas-modificacion.md`, verificado el 14/10/2026). Alcance explícito en cada enunciado (G2').

## Instrucción

Mensaje común, idéntico salvo `{DIRECTORIO}` y `{TAREA}`:

```
Estás ayudando a un desarrollador a ajustar la configuración de OpenCode 1.18.25 en esta máquina.

Su proyecto está en /home/participante/proyecto y su terminal está abierta en {DIRECTORIO}.
Para ejecutar comandos en su entorno, con sus variables y su configuración, usá:
    como-dev '<comando>'
En tu directorio actual tenés la hoja de referencia (hoja-referencia.md) y la documentación
oficial de OpenCode 1.18.25 sin conexión (docs/index.html).

Podés modificar solamente archivos de configuración de OpenCode del desarrollador.

Tarea: {TAREA}

Cuando termines, cerrá tu mensaje con un único bloque JSON con esta forma exacta:
{"hecho": <true o false>, "cambios": ["<archivo>: <qué cambiaste>"], "impedimento": "<si no pudiste hacerlo, por qué; si lo hiciste, vacío>"}
```

Notas de diseño:
- No menciona variables de entorno ni procedencia (G3: revelarlas sería dar la respuesta).
- «Solamente archivos de configuración» acota el alcance sin decir cuáles son: identificar el archivo que manda es parte de la tarea.

## Enunciados

| Caso | Tarea |
|---|---|
| C-1a | Hacé que el agente `build` use el modelo `google/gemini-2.5-flash` en este proyecto. Las demás opciones de `build` no deben cambiar. |
| C-1b | Hacé que el agente `build` tenga denegado el uso de la herramienta `webfetch`. Los demás permisos de `build` no deben cambiar. |
| C-1c | Hacé que el agente `plan` use temperatura 0.55 en este proyecto. Las demás opciones de `plan` no deben cambiar. |
| C-1d | Hacé que el agente `build` pueda modificar el archivo `src/productos.js` sin pedir aprobación, solo ese archivo. Los demás permisos de `build` no deben cambiar. |
| C-1e | Hacé que el agente `build` use temperatura 0.55 en este proyecto. Las demás opciones de `build` no deben cambiar. |
| C-1f | Hacé que el agente `build` pueda leer el archivo `src/productos.js`, solo ese archivo. Los demás permisos de `build` no deben cambiar. |
| C-2a | Hacé que el agente `build` use el modelo `google/gemini-2.5-flash` en este proyecto. Las demás opciones de `build` no deben cambiar. |
| C-2b | Trabajando desde `sub/`, hacé que el agente `docs` use el modelo `google/gemini-2.5-flash`. Las demás opciones de `docs` no deben cambiar. |
| C-2c | Hacé que el agente `revisor` use el modelo `google/gemini-2.5-flash` en este proyecto. Las demás opciones de `revisor` no deben cambiar. |
| C-2d | Hacé que el agente `build` use el modelo `google/gemini-2.5-flash` en este proyecto. Las demás opciones de `build` no deben cambiar. |
| C-2e | Hacé que el agente `build` use el modelo `google/gemini-2.5-flash` en este proyecto. Las demás opciones de `build` no deben cambiar. |
| C-2f | Hacé que el agente `build` use el modelo `google/gemini-2.5-flash` en este proyecto. Las demás opciones de `build` no deben cambiar. |
| C-3a | Hacé que el agente `plan` use el modelo `google/gemini-2.5-flash` en este proyecto. Las demás opciones de `plan` no deben cambiar. |
| C-3b | Hacé que el agente `build` pueda leer el archivo `.env` del proyecto sin pedir aprobación, solo ese archivo. Los demás permisos de `build` no deben cambiar. |
| C-3c | Hacé que el agente `build` use el modelo `google/gemini-2.5-flash` en este proyecto. Las demás opciones de `build` no deben cambiar. |
| C-3d | Hacé que el agente `plan` pueda modificar el archivo `README.md`, solo ese archivo. Los demás permisos de `plan` no deben cambiar. |
| C-3e | Hacé que la descripción del agente `plan` sea exactamente `Revisa-plan`. Las demás opciones de `plan` no deben cambiar. |
| C-3f | Hacé que el subagente `general`, cuando lo lanza `build`, no pueda ejecutar `git status`, solo ese comando. Los permisos de `build` y los demás de `general` no deben cambiar. |
| C-4a | Hacé que el agente `build` pida aprobación antes de ejecutar `git status`, solo ese comando. Los demás permisos de `build` no deben cambiar. |
| C-4b | Hacé que el agente `build` pueda ejecutar `git diff`, solo ese comando. Los demás permisos de `build` no deben cambiar. |
| C-4c | Hacé que el agente `plan` no pueda modificar el archivo `src/index.js`, solo ese archivo. Los demás permisos de `plan` no deben cambiar. |
| C-4d | Hacé que el agente `build` pueda ejecutar `npm install`, solo ese comando. Los demás permisos de `build` no deben cambiar. |
| C-4e | Hacé que el agente `build` pueda modificar el archivo `src/productos.js` sin pedir aprobación, solo ese archivo. Los demás permisos de `build` no deben cambiar. |
| C-4f | Hacé que el agente `build` pueda modificar el archivo `src/productos.js`, solo ese archivo. Los demás permisos de `build` no deben cambiar. |

Observación: C-1a, C-2a, C-2d, C-2e, C-2f y C-3c comparten el enunciado; lo que cambia es el escenario. Es deliberado: la tarea es la que haría el desarrollador; la dificultad está en la configuración.
