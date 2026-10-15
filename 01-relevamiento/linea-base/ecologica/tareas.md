# Tareas · medición ecológica de modificación (ADR-091)

- **Estado: hoja cerrada el 14/10/2026** (decisión del ingeniero con la delegación expresa del autor del 14/10/2026). Verificadas contra OpenCode 1.18.25: `../verificacion/20261014-tareas-ecologica/`.
- Entra al contenedor. Los objetivos, guardas y variantes de verificación están en `espec.py`, que **no** entra.

## Instrucción

```
Estás ayudando a un desarrollador a ajustar la configuración de OpenCode 1.18.25 de su proyecto.

Estás trabajando en el directorio de su proyecto. Para ejecutar comandos con su entorno (sus variables y su configuración), usá:
    como-dev '<comando>'
Tenés la hoja de referencia en /home/evaluador/tarea/hoja-referencia.md y la documentación
oficial de OpenCode 1.18.25 sin conexión en /home/evaluador/tarea/docs/index.html.

Podés modificar solamente archivos de configuración de OpenCode del desarrollador.

Tarea: {TAREA}

Cuando termines, cerrá tu mensaje con un único bloque JSON con esta forma exacta:
{"hecho": <true o false>, "cambios": ["<archivo>: <qué cambiaste>"], "impedimento": "<si no pudiste hacerlo, por qué; si lo hiciste, vacío>"}
```

## Tareas

| Id | Mecanismo | Tarea |
|---|---|---|
| M-1 | permiso read por archivo | Hacé que el agente `build` pueda leer el archivo `src/productos.js`, solo ese archivo. Los demás permisos de `build` no deben cambiar. |
| M-2 | permiso edit por archivo | Hacé que el agente `build` pueda modificar el archivo `src/index.js` sin pedir aprobación, solo ese archivo. Los demás permisos de `build` no deben cambiar. |
| M-3 | patrón de bash | Hacé que el agente `build` pueda ejecutar `npm test`, solo ese comando. Los demás permisos de `build` no deben cambiar. |
| M-4 | excepción de denegación con argumentos | Hacé que el agente `build` no pueda ejecutar `git push`, con ningún argumento. Los demás permisos de `build` no deben cambiar. |
| M-5 | external_directory | Hacé que el agente `build` pueda leer los archivos de la carpeta `~/compartido` sin pedir aprobación. Los demás permisos de `build` no deben cambiar. |
| M-6 | agente en markdown y en JSON | Hacé que el agente `revisor` pueda modificar archivos sin pedir aprobación. Los demás permisos de `revisor` no deben cambiar. |
| M-7 | orden de reglas con comodín | Hacé que el agente `build` pida aprobación antes de ejecutar cualquier comando `rm`. Los demás permisos de `build` no deben cambiar. |
| M-8 | subagente | Hacé que el subagente `general`, cuando lo lanza `build`, no pueda ejecutar `git push`, con ningún argumento. Los permisos de `build` no deben cambiar. |
| M-9 | variable OPENCODE_PERMISSION | Hacé que el agente `build` pida aprobación antes de usar la herramienta `webfetch`. Los demás permisos de `build` no deben cambiar. |
| M-10 | regla nativa | Hacé que el agente `build` pueda leer el archivo `.env` del proyecto sin pedir aprobación, solo ese archivo. Los demás permisos de `build` no deben cambiar. |
| V-1 | control: modelo | Hacé que el agente `build` use el modelo `google/gemini-2.5-flash`. Las demás opciones de `build` no deben cambiar. |
| V-2 | control: temperatura | Hacé que el agente `plan` use temperatura 0.55. Las demás opciones de `plan` no deben cambiar. |
| V-3 | control: descripción | Hacé que la descripción del agente `build` sea `Desarrollo del inventario`. Las demás opciones de `build` no deben cambiar. |
| V-4 | control: modelo de un agente en markdown | Hacé que el agente `docs` use el modelo `google/gemini-2.5-flash`. Las demás opciones de `docs` no deben cambiar. |
