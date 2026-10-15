# Especificación de las tareas de ADR-091 (medición ecológica de modificación).
# Rutas: G/ = ~participante/.config/opencode/ ; P/ = ~participante/proyecto/ ; H/ = ~participante/
# Sondas de permiso: (agente, permiso, sujeto). Sujeto de read/edit: ruta relativa al proyecto
# (como la evalúa OpenCode); de external_directory: carpeta absoluta + "/*"; de bash: el comando.
import json

S = "https://opencode.ai/config.json"
M = "google/gemini-2.5-flash"


def j(d):
    return json.dumps({"$schema": S, **d}, indent=2) + "\n"


T = {}

# ---------- Permisos ----------
T["M-1"] = dict(
    mecanismo="permiso read por archivo",
    archivos={"P/opencode.json": j({"permission": {"read": "deny"}})},
    tarea="Hacé que el agente `build` pueda leer el archivo `src/productos.js`, solo ese archivo. Los demás permisos de `build` no deben cambiar.",
    objetivo=("build", "read", "src/productos.js", "allow"),
    guardas=[("build", "read", "src/index.js"), ("build", "read", "README.md")],
    variantes={
        "correcta": {"P/opencode.json": j({"permission": {"read": {"*": "deny", "src/productos.js": "allow"}}})},
        "ingenua_absoluta": {"P/opencode.json": j({"permission": {"read": {"*": "deny", "/home/participante/proyecto/src/productos.js": "allow"}}})},
    })
T["M-2"] = dict(
    mecanismo="permiso edit por archivo",
    archivos={"G/opencode.json": j({"permission": {"edit": "ask"}})},
    tarea="Hacé que el agente `build` pueda modificar el archivo `src/index.js` sin pedir aprobación, solo ese archivo. Los demás permisos de `build` no deben cambiar.",
    objetivo=("build", "edit", "src/index.js", "allow"),
    guardas=[("build", "edit", "src/productos.js"), ("build", "edit", "README.md")],
    variantes={
        "correcta": {"P/opencode.json": j({"permission": {"edit": {"*": "ask", "src/index.js": "allow"}}})},
        "ingenua_absoluta": {"P/opencode.json": j({"permission": {"edit": {"*": "ask", "/home/participante/proyecto/src/index.js": "allow"}}})},
    })
T["M-3"] = dict(
    mecanismo="patrón de bash",
    archivos={"P/opencode.json": j({"agent": {"build": {"permission": {"bash": "deny"}}}})},
    tarea="Hacé que el agente `build` pueda ejecutar `npm test`, solo ese comando. Los demás permisos de `build` no deben cambiar.",
    objetivo=("build", "bash", "npm test", "allow"),
    guardas=[("build", "bash", "npm install"), ("build", "bash", "ls")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"build": {"permission": {"bash": {"*": "deny", "npm test": "allow"}}}}})},
        "ingenua_raiz": {"P/opencode.json": j({"permission": {"bash": {"npm test": "allow"}}, "agent": {"build": {"permission": {"bash": "deny"}}}})},
    })
T["M-4"] = dict(
    mecanismo="excepción de denegación con argumentos",
    archivos={"G/opencode.json": j({"permission": {"bash": "allow"}})},
    tarea="Hacé que el agente `build` no pueda ejecutar `git push`, con ningún argumento. Los demás permisos de `build` no deben cambiar.",
    objetivo=("build", "bash", "git push origin main", "deny"),
    guardas=[("build", "bash", "git status"), ("build", "bash", "npm test")],
    variantes={
        "correcta": {"G/opencode.json": j({"permission": {"bash": {"*": "allow", "git push *": "deny"}}})},
        "ingenua_sin_argumentos": {"G/opencode.json": j({"permission": {"bash": {"*": "allow", "git push": "deny"}}})},
    })
T["M-5"] = dict(
    mecanismo="external_directory",
    archivos={"H/compartido/notas.md": "# Notas del equipo\n"},
    tarea="Hacé que el agente `build` pueda leer los archivos de la carpeta `~/compartido` sin pedir aprobación. Los demás permisos de `build` no deben cambiar.",
    objetivo=("build", "external_directory", "/home/participante/compartido/*", "allow"),
    guardas=[("build", "external_directory", "/home/participante/otra/*"), ("build", "read", "src/index.js")],
    variantes={
        "correcta": {"P/opencode.json": j({"permission": {"external_directory": {"/home/participante/compartido/*": "allow"}}})},
        "ingenua_read": {"P/opencode.json": j({"permission": {"read": {"/home/participante/compartido/*": "allow"}}})},
    })
T["M-6"] = dict(
    mecanismo="agente en markdown y en JSON",
    archivos={"P/opencode.json": j({"agent": {"revisor": {"description": "Revisa cambios antes del commit", "permission": {"edit": "allow"}}}}),
              "P/.opencode/agent/revisor.md": "---\ndescription: Revisor de código del equipo\nmode: primary\npermission:\n  edit: deny\n---\n\nRevisá los cambios pendientes.\n"},
    tarea="Hacé que el agente `revisor` pueda modificar archivos sin pedir aprobación. Los demás permisos de `revisor` no deben cambiar.",
    objetivo=("revisor", "edit", "src/index.js", "allow"),
    guardas=[("revisor", "bash", "ls"), ("revisor", "read", "src/index.js")],
    variantes={
        "correcta": {"P/.opencode/agent/revisor.md": "---\ndescription: Revisor de código del equipo\nmode: primary\npermission:\n  edit: allow\n---\n\nRevisá los cambios pendientes.\n"},
        "ingenua_json": {"P/opencode.json": j({"agent": {"revisor": {"description": "Revisa cambios antes del commit", "permission": {"edit": "allow"}}}})},
    })
T["M-7"] = dict(
    mecanismo="orden de reglas con comodín",
    archivos={"G/opencode.json": j({"permission": {"bash": {"*": "allow"}}})},
    tarea="Hacé que el agente `build` pida aprobación antes de ejecutar cualquier comando `rm`. Los demás permisos de `build` no deben cambiar.",
    objetivo=("build", "bash", "rm -rf dist", "ask"),
    guardas=[("build", "bash", "ls"), ("build", "bash", "git status")],
    variantes={
        "correcta": {"G/opencode.json": j({"permission": {"bash": {"*": "allow", "rm *": "ask"}}})},
        "ingenua_orden": {"G/opencode.json": j({"permission": {"bash": {"rm *": "ask", "*": "allow"}}})},
    })
T["M-8"] = dict(
    mecanismo="subagente",
    archivos={"G/opencode.json": j({"permission": {"bash": "allow"}})},
    tarea="Hacé que el subagente `general`, cuando lo lanza `build`, no pueda ejecutar `git push`, con ningún argumento. Los permisos de `build` no deben cambiar.",
    objetivo=("general", "bash", "git push origin main", "deny"),
    guardas=[("build", "bash", "git push origin main"), ("general", "bash", "git status")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"general": {"permission": {"bash": {"*": "allow", "git push *": "deny"}}}}})},
        "ingenua_padre": {"P/opencode.json": j({"agent": {"build": {"permission": {"bash": {"*": "allow", "git push *": "deny"}}}}})},
    })
T["M-9"] = dict(
    mecanismo="variable OPENCODE_PERMISSION",
    archivos={},
    env={"OPENCODE_PERMISSION": '{"webfetch":"allow"}'},
    tarea="Hacé que el agente `build` pida aprobación antes de usar la herramienta `webfetch`. Los demás permisos de `build` no deben cambiar.",
    objetivo=("build", "webfetch", "https://example.com", "ask"),
    guardas=[("build", "bash", "ls"), ("build", "read", "src/index.js")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"build": {"permission": {"webfetch": "ask"}}}})},
        "ingenua_raiz": {"P/opencode.json": j({"permission": {"webfetch": "ask"}})},
    })
T["M-10"] = dict(
    mecanismo="regla nativa",
    archivos={"P/.env": "API_KEY=solo-desarrollo\n"},
    tarea="Hacé que el agente `build` pueda leer el archivo `.env` del proyecto sin pedir aprobación, solo ese archivo. Los demás permisos de `build` no deben cambiar.",
    objetivo=("build", "read", ".env", "allow"),
    guardas=[("build", "read", "config/.env"), ("build", "read", ".env.local")],
    variantes={
        "correcta": {"P/opencode.json": j({"permission": {"read": {".env": "allow"}}})},
        "ingenua_absoluta": {"P/opencode.json": j({"permission": {"read": {"/home/participante/proyecto/.env": "allow"}}})},
    })

# ---------- Controles de valor (una sola declaración, sin mecanismos de permisos) ----------
T["V-1"] = dict(
    mecanismo="control: modelo",
    archivos={"P/opencode.json": j({"agent": {"build": {"model": "openai/gpt-5-mini"}}})},
    tarea=f"Hacé que el agente `build` use el modelo `{M}`. Las demás opciones de `build` no deben cambiar.",
    valor=("build", "model", M), variantes={"correcta": {"P/opencode.json": j({"agent": {"build": {"model": M}}})}})
T["V-2"] = dict(
    mecanismo="control: temperatura",
    archivos={"G/opencode.json": j({"agent": {"plan": {"temperature": 0.3}}})},
    tarea="Hacé que el agente `plan` use temperatura 0.55. Las demás opciones de `plan` no deben cambiar.",
    valor=("plan", "temperature", 0.55), variantes={"correcta": {"G/opencode.json": j({"agent": {"plan": {"temperature": 0.55}}})}})
T["V-3"] = dict(
    mecanismo="control: descripción",
    archivos={"P/opencode.json": j({"agent": {"build": {"description": "Agente de desarrollo"}}})},
    tarea="Hacé que la descripción del agente `build` sea `Desarrollo del inventario`. Las demás opciones de `build` no deben cambiar.",
    valor=("build", "description", "Desarrollo del inventario"), variantes={"correcta": {"P/opencode.json": j({"agent": {"build": {"description": "Desarrollo del inventario"}}})}})
T["V-4"] = dict(
    mecanismo="control: modelo de un agente en markdown",
    archivos={"P/.opencode/agent/docs.md": "---\ndescription: Redacta documentación\nmode: primary\nmodel: openai/gpt-5-mini\n---\n\nRedactá la documentación.\n"},
    tarea=f"Hacé que el agente `docs` use el modelo `{M}`. Las demás opciones de `docs` no deben cambiar.",
    valor=("docs", "model", M), variantes={"correcta": {"P/.opencode/agent/docs.md": f"---\ndescription: Redacta documentación\nmode: primary\nmodel: {M}\n---\n\nRedactá la documentación.\n"}})

if __name__ == "__main__":
    import sys
    json.dump(T, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
