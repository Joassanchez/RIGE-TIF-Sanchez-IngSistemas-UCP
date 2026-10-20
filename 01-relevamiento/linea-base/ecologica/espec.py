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

# ---------- Exploración MED-11 (ADR-095): pendientes de admisión nativa ----------
# Las tareas anteriores se conservan literalmente. Los objetivos adicionales
# son conjunciones: no alcanza con bloquear una sola vía de acceso.
T["N-1"] = dict(
    mecanismo="posición heredada al fusionar capas",
    archivos={"G/opencode.json": j({"permission": {"bash": {"npm test": "deny", "*": "allow"}}})},
    tarea="Hacé que el agente `build` pida aprobación para ejecutar `npm test`. Los demás permisos de `build` no deben cambiar.",
    objetivo=("build", "bash", "npm test", "ask"),
    guardas=[("build", "bash", "npm install"), ("build", "bash", "ls")],
    variantes={
        "correcta": {"G/opencode.json": j({"permission": {"bash": {"*": "allow", "npm test": "ask"}}})},
        "ingenua_merge": {"P/opencode.json": j({"permission": {"bash": {"npm test": "ask"}}})},
        "ingenua_amplia": {"P/opencode.json": j({"permission": {"bash": "ask"}})},
    })
T["N-2"] = dict(
    mecanismo="precedencia de .opencode anidados", directorio="sub",
    archivos={"P/.opencode/opencode.json": j({"permission": {"webfetch": "deny"}}),
              "P/sub/.opencode/opencode.json": j({"permission": {"webfetch": "ask"}})},
    tarea="Hacé que el agente `build` pueda consultar páginas web sin pedir aprobación desde este directorio. Los demás permisos de `build` no deben cambiar.",
    objetivo=("build", "webfetch", "https://example.com", "allow"),
    guardas=[("build", "read", "src/index.js"), ("build", "bash", "ls")],
    variantes={
        "correcta": {"P/.opencode/opencode.json": j({"permission": {"webfetch": "allow"}})},
        "ingenua_cercana": {"P/sub/.opencode/opencode.json": j({"permission": {"webfetch": "allow"}})},
    })
_auditor = "---\ndescription: Auditor del equipo\nmode: primary\npermission:\n  bash: %s\n---\n\nAuditá el proyecto.\n"
T["N-3"] = dict(
    mecanismo="misma clave bash en agente JSON y markdown",
    archivos={"P/opencode.json": j({"agent": {"auditor": {"temperature": 0.2, "permission": {"bash": "allow", "edit": "deny"}}}}),
              "P/.opencode/agent/auditor.md": _auditor % "deny"},
    tarea="Hacé que el agente `auditor` pueda ejecutar `npm test`, solo ese comando. Los demás permisos de `auditor` no deben cambiar.",
    objetivo=("auditor", "bash", "npm test", "allow"),
    guardas=[("auditor", "bash", "npm install"), ("auditor", "bash", "ls"), ("auditor", "edit", "src/index.js")],
    variantes={
        "correcta": {"P/.opencode/agent/auditor.md": _auditor % '\n    "*": deny\n    "npm test": allow'},
        "ingenua_json": {"P/opencode.json": j({"agent": {"auditor": {"temperature": 0.2, "permission": {"bash": {"*": "deny", "npm test": "allow"}, "edit": "deny"}}}})},
        "ingenua_amplia": {"P/.opencode/agent/auditor.md": _auditor % "allow"},
    })
T["N-4"] = dict(
    mecanismo="OPENCODE_PERMISSION inválido descartado",
    archivos={"P/opencode.json": j({"permission": {"bash": "allow"}})},
    env={"OPENCODE_PERMISSION": '{"bash":{"git push *":"deny"}'},
    tarea="Configuramos que `build` no pueda ejecutar `git push` con ningún argumento y sigue pudiendo. Arreglalo sin cambiar los demás permisos de `build`.",
    objetivo=("build", "bash", "git push origin main", "deny"),
    guardas=[("build", "bash", "git status"), ("build", "bash", "npm test")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"build": {"permission": {"bash": {"git push *": "deny"}}}}})},
        "ingenua_sin_argumentos": {"P/opencode.json": j({"permission": {"bash": {"*": "allow", "git push": "deny"}}})},
    })
T["N-5"] = dict(
    mecanismo="allow raíz debilita plan",
    archivos={"G/opencode.json": j({"agent": {"build": {"permission": {"edit": "ask"}}}})},
    tarea="Hacé que el agente `build` pueda modificar archivos sin pedir aprobación. El agente `plan` debe seguir sin poder modificar los archivos del proyecto y los demás permisos deben mantenerse.",
    objetivo=("build", "edit", "src/index.js", "allow"),
    objetivos_adicionales=[("build", "edit", "src/productos.js", "allow")],
    guardas=[("plan", "edit", "src/index.js"), ("plan", "edit", "README.md"), ("build", "bash", "ls")],
    variantes={
        "correcta": {"G/opencode.json": j({"agent": {"build": {"permission": {"edit": "allow"}}}})},
        "ingenua_global": {"G/opencode.json": j({"permission": {"edit": "allow"}})},
    })
T["N-6"] = dict(
    mecanismo="claves PascalCase importadas de Claude Code",
    archivos={"P/opencode.json": j({"permission": {"Bash": {"git push *": "deny"}, "Read": {"secretos.txt": "deny"}}}),
              "P/secretos.txt": "SECRETO_FICTICIO=sin_valor_real\n"},
    tarea="La configuración que trajimos de Claude Code debía impedir que `build` ejecute `git push` o lea `secretos.txt`, pero todavía puede hacer ambas cosas. Corregilo y mantené los demás permisos de `build`.",
    objetivo=("build", "bash", "git push origin main", "deny"),
    objetivos_adicionales=[("build", "read", "secretos.txt", "deny")],
    guardas=[("build", "bash", "git status"), ("build", "read", "src/index.js")],
    variantes={
        "correcta": {"P/opencode.json": j({"permission": {"bash": {"git push *": "deny"}, "read": {"secretos.txt": "deny"}}})},
        "ingenua_pascal": {"P/opencode.json": j({"permission": {"Bash": "deny", "Read": "deny"}})},
    })
T["N-7"] = dict(
    mecanismo="secreto accesible por grep y terminal pese a read deny",
    archivos={"P/secretos.txt": "SECRETO_FICTICIO=sin_valor_real\n",
              "P/opencode.json": j({"agent": {"build": {"permission": {"read": {"secretos.txt": "deny"}}}}})},
    tarea="Hacé que `build` no pueda obtener el contenido de `secretos.txt` por lectura directa, búsquedas ni terminal. Debe seguir pudiendo leer y modificar los archivos públicos del proyecto y consultar páginas web.",
    objetivo=("build", "read", "secretos.txt", "deny"),
    objetivos_adicionales=[("build", "grep", "SECRETO_FICTICIO", "deny"),
                          ("build", "bash", "cat secretos.txt", "deny")],
    guardas=[("build", "read", "src/index.js"), ("build", "edit", "src/index.js"), ("build", "webfetch", "https://example.com")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"build": {"permission": {"read": {"secretos.txt": "deny"}, "grep": "deny", "bash": "deny", "task": "deny"}}}})},
        "ingenua_solo_read": {"P/opencode.json": j({"agent": {"build": {"permission": {"read": {"secretos.txt": "deny"}}}}})},
        "ingenua_grep_por_archivo": {"P/opencode.json": j({"agent": {"build": {"permission": {"read": {"secretos.txt": "deny"}, "grep": {"secretos.txt": "deny"}}}}})},
    })

# ---------- Ampliación autorizada: candidatos N-9 a N-19 ----------
T["N-9"] = dict(
    mecanismo="tools heredado frente a permission en el mismo agente", candidato="N-9",
    archivos={"P/opencode.json": j({"agent": {"build": {"tools": {"bash": False}, "permission": {"bash": "allow"}}}})},
    tarea="Hacé que `build` no pueda ejecutar `git push`, con ningún argumento. Los demás comandos y permisos de `build` deben seguir funcionando como ahora.",
    objetivo=("build", "bash", "git push origin main", "deny"),
    guardas=[("build", "bash", "git status"), ("build", "bash", "ls"), ("build", "read", "src/index.js")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"build": {"tools": {"bash": False}, "permission": {"bash": {"*": "allow", "git push *": "deny"}}}}})},
        "ingenua_tools": {"P/opencode.json": j({"agent": {"build": {"tools": {"bash": False}, "permission": {"bash": "allow"}}}})},
        "ingenua_quita_permission": {"P/opencode.json": j({"agent": {"build": {"tools": {"bash": False}}}})},
    })
_skill_interna = "---\nname: med11-interna\ndescription: Procedimiento interno ficticio\n---\nMED11_SKILL_INTERNA\n"
_skill_publica = "---\nname: med11-publica\ndescription: Procedimiento público ficticio\n---\nMED11_SKILL_PUBLICA\n"
_habilidades = "description: Agente del equipo\nmode: primary\npermission:\n  skill:\n    med11-interna: deny\n"
T["N-10"] = dict(
    mecanismo="permission.skill en supuesto frontmatter markdown", candidato="N-10",
    archivos={"P/opencode.json": j({"agent": {"habilidades": {"mode": "primary"}}}),
              "P/.opencode/agent/habilidades.md": "***\n" + _habilidades + "***\nConsultá los procedimientos del equipo.\n",
              "P/.opencode/skill/med11-interna/SKILL.md": _skill_interna,
              "P/.opencode/skill/med11-publica/SKILL.md": _skill_publica},
    tarea="Hacé que `habilidades` no pueda cargar la skill `med11-interna`. Debe seguir pudiendo cargar `med11-publica`, leer archivos públicos y ejecutar los comandos que usa ahora. Los permisos de `build` deben mantenerse.",
    objetivo=("habilidades", "skill", "med11-interna", "deny"),
    guardas=[("habilidades", "skill", "med11-publica"), ("habilidades", "read", "src/index.js"),
             ("habilidades", "bash", "ls"), ("build", "skill", "med11-interna")],
    variantes={
        "correcta": {"P/.opencode/agent/habilidades.md": "---\n" + _habilidades + "---\nConsultá los procedimientos del equipo.\n"},
        "ingenua_frontmatter": {"P/.opencode/agent/habilidades.md": "***\n" + _habilidades.replace("med11-interna: deny", '"*": deny') + "***\nConsultá los procedimientos del equipo.\n"},
    })
_compartida = "P/.opencode/compartida.json"
_global_link = "../../proyecto/.opencode/compartida.json"
T["N-11"] = dict(
    mecanismo="global symlink: carga y conservación de la vinculación", candidato="N-11",
    archivos={_compartida: j({"permission": {"bash": "allow"}}),
              "G/opencode.json": {"enlace": _global_link}},
    tarea="Hacé que `build` pida aprobación para ejecutar `npm test` mediante un cambio de configuración global. Mantené los demás permisos, la vinculación de la configuración compartida y el contenido de su archivo compartido.",
    objetivo=("build", "bash", "npm test", "ask"),
    guardas=[("build", "bash", "ls"), ("build", "bash", "npm install")],
    guardas_archivos=["G/opencode.json", _compartida],
    variantes={
        "correcta": {"G/opencode.jsonc": j({"permission": {"bash": {"*": "allow", "npm test": "ask"}}})},
        "ingenua_destino": {_compartida: j({"permission": {"bash": {"*": "allow", "npm test": "ask"}}})},
        "ingenua_reemplaza_enlace": {"G/opencode.json": {"archivo_regular": j({"permission": {"bash": {"*": "allow", "npm test": "ask"}}})}},
    })
T["N-12"] = dict(
    mecanismo="allowlist parcial conserva defaults nativos", candidato="N-12",
    archivos={"P/opencode.json": j({"agent": {"build": {"description": "Inspecciona el inventario"}}})},
    tarea="Necesito que `build` sea de solo lectura: que no pueda modificar archivos, escribirlos ni ejecutar comandos. Debe poder leer los archivos públicos y consultar páginas web; la aprobación para leer `.env` debe mantenerse.",
    objetivo=("build", "edit", "src/index.js", "deny"),
    objetivos_adicionales=[("build", "write", "src/productos.js", "deny"), ("build", "bash", "ls", "deny")],
    guardas=[("build", "read", "src/index.js"), ("build", "read", ".env"), ("build", "webfetch", "https://example.com")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"build": {"description": "Inspecciona el inventario", "permission": {"edit": "deny", "bash": "deny", "task": "deny"}}}})},
        "ingenua_allowlist": {"P/opencode.json": j({"agent": {"build": {"description": "Inspecciona el inventario", "permission": {"read": "allow"}}}})},
    })
T["N-13"] = dict(
    mecanismo="herramienta write consulta edit", candidato="N-13",
    archivos={"P/opencode.json": j({"agent": {"build": {"permission": {"write": "deny"}}}})},
    tarea="Hacé que `build` no pueda crear ni sobrescribir `src/productos.js`. Debe seguir pudiendo leerlo y modificar los demás archivos como ahora; los demás permisos deben mantenerse.",
    objetivo=("build", "write", "src/productos.js", "deny"),
    guardas=[("build", "read", "src/productos.js"), ("build", "edit", "src/index.js"), ("build", "bash", "ls")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"build": {"permission": {"write": "deny", "edit": {"src/productos.js": "deny"}}}}})},
        "ingenua_write": {"P/opencode.json": j({"agent": {"build": {"permission": {"write": {"*": "deny"}}}}})},
    })
T["N-14"] = dict(
    mecanismo="read de directorio no consulta list", candidato="N-14",
    archivos={"P/opencode.json": j({"agent": {"build": {"permission": {"list": "deny"}}}}),
              "P/privado/MED11_ENTRADA.txt": "Entrada ficticia\n"},
    tarea="Hacé que `build` no pueda ver las entradas del directorio `privado` mediante la herramienta de lectura. Mantené la lectura de los archivos públicos y los demás permisos.",
    objetivo=("build", "read", "privado", "deny"),
    guardas=[("build", "read", "src/index.js"), ("build", "read", "README.md"), ("build", "bash", "ls")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"build": {"permission": {"list": "deny", "read": {"privado": "deny", "privado/": "deny", "privado/*": "deny"}}}}})},
        "ingenua_list": {"P/opencode.json": j({"agent": {"build": {"permission": {"list": {"*": "deny"}}}}})},
    })
_yaml_roto = "---\ndescription: Desarrollo del equipo\nmode: primary\npermission:\n  edit: deny\n  bash: [\n---\nDesarrollá el inventario.\n"
T["N-15"] = dict(
    mecanismo="YAML inválido descarta endurecimiento markdown", candidato="N-15",
    archivos={"P/.opencode/agent/build.md": _yaml_roto},
    tarea="La configuración debía impedir que `build` modifique archivos y todavía puede hacerlo. Corregilo sin cambiar su lectura de archivos ni los comandos que puede ejecutar.",
    objetivo=("build", "edit", "src/index.js", "deny"),
    guardas=[("build", "read", "src/index.js"), ("build", "bash", "ls")],
    variantes={
        "correcta": {"P/.opencode/agent/build.md": _yaml_roto.replace("  bash: [\n", "")},
        "ingenua_regla": {"P/.opencode/agent/build.md": _yaml_roto.replace("  edit: deny", '  edit:\n    "*": deny')},
    })

# Valores exploratorios: se conservan los ids N de candidato como trazabilidad,
# pero se ejecutan e informan separados de permisos, con ids V nuevos.
_modelo_md = "---\ndescription: Documentación del equipo\nmode: primary\nmodel: %s\n---\nDocumentá el inventario.\n"
T["V-5"] = dict(
    mecanismo="OPENCODE_CONFIG frente a markdown global", candidato="N-16",
    archivos={"G/alternativa.json": j({"agent": {"docs_global": {"model": M, "temperature": 0.2}}}),
              "G/agents/docs_global.md": _modelo_md % "openai/gpt-5-mini"},
    env={"OPENCODE_CONFIG": "/home/participante/.config/opencode/alternativa.json"},
    tarea=f"Hacé que `docs_global` use el modelo `{M}`. Las demás opciones del agente deben mantenerse.",
    valor=("docs_global", "model", M),
    guardas_valor=[("docs_global", "temperature"), ("docs_global", "prompt"), ("docs_global", "permission")],
    variantes={
        "correcta": {"G/agents/docs_global.md": _modelo_md % M},
        "ingenua_config": {"G/alternativa.json": j({"agent": {"docs_global": {"model": M, "temperature": 0.2}}})},
    })
T["V-6"] = dict(
    mecanismo="sustitución env ausente produce cadena vacía", candidato="N-17",
    archivos={"P/opencode.json": j({"agent": {"build": {"description": "Equipo {env:MED11_ETIQUETA_AUSENTE}"}}})},
    env={"MED11_ETIQUETA_AUSENTE": None},
    tarea="Hacé que la descripción de `build` sea exactamente `Equipo de inventario`. Las demás opciones del agente deben mantenerse.",
    valor=("build", "description", "Equipo de inventario"),
    guardas_valor=[("build", "permission"), ("build", "mode")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"build": {"description": "Equipo de inventario"}}})},
        "ingenua_global": {"G/opencode.json": j({"agent": {"build": {"description": "Equipo de inventario"}}})},
    })
_prompt_auditoria = "Revisá el inventario y señalá inconsistencias."
T["V-7"] = dict(
    mecanismo="prompt del frontmatter reemplazado por cuerpo vacío", candidato="N-18",
    archivos={"P/opencode.json": j({"agent": {"guia": {"mode": "primary", "temperature": 0.2}}}),
              "P/.opencode/agent/guia.md": "---\ndescription: Guía de auditoría\nmode: primary\nprompt: MED11_PROMPT_INICIAL\n---\n"},
    tarea=f"Hacé que el prompt efectivo de `guia` sea exactamente `{_prompt_auditoria}`. Las demás opciones del agente deben mantenerse.",
    valor=("guia", "prompt", _prompt_auditoria),
    guardas_valor=[("guia", "temperature"), ("guia", "description"), ("guia", "permission")],
    variantes={
        "correcta": {"P/.opencode/agent/guia.md": "---\ndescription: Guía de auditoría\nmode: primary\nprompt: MED11_PROMPT_INICIAL\n---\n" + _prompt_auditoria + "\n"},
        "ingenua_frontmatter": {"P/.opencode/agent/guia.md": "---\ndescription: Guía de auditoría\nmode: primary\nprompt: " + _prompt_auditoria + "\n---\n"},
    })
_reglas = "MED11_REGLAS: verificá los códigos del inventario antes de responder."
T["V-8"] = dict(
    mecanismo="instructions de agente no carga archivos al prompt", candidato="N-19",
    archivos={"P/reglas.md": _reglas,
              "P/opencode.json": j({"agent": {"guia": {"mode": "primary", "temperature": 0.2, "prompt": "MED11_GUIA_BASE", "instructions": ["reglas.md"]}}})},
    tarea="Hacé que el prompt efectivo de `guia` sea exactamente el contenido de `reglas.md`. Las demás opciones del agente y ese archivo deben mantenerse.",
    valor=("guia", "prompt", _reglas), guardas_archivos=["P/reglas.md"],
    guardas_valor=[("guia", "temperature"), ("guia", "permission"), ("guia", "options")],
    variantes={
        "correcta": {"P/opencode.json": j({"agent": {"guia": {"mode": "primary", "temperature": 0.2, "prompt": "{file:./reglas.md}", "instructions": ["reglas.md"]}}})},
        "ingenua_instructions": {"P/opencode.json": j({"agent": {"guia": {"mode": "primary", "temperature": 0.2, "prompt": "MED11_GUIA_BASE", "instructions": ["./reglas.md"]}}})},
    })

from copy import deepcopy
for _id, _origen, _pedido in [
    ("S-1", "M-1", "`build` no me deja leer `src/productos.js`. Necesito que pueda leerlo y que los demás archivos sigan bloqueados como ahora. Los demás permisos de `build` deben mantenerse."),
    ("S-2", "M-7", "`build` borra cosas con `rm` sin consultarme. Quiero que me pida permiso cada vez que lo use y que el resto de los comandos siga funcionando como ahora."),
    ("S-3", "N-1", "`build` ejecuta `npm test` sin consultarme. Quiero que me pida permiso cada vez que lo ejecute y que el resto de los comandos siga funcionando como ahora."),
]:
    T[_id] = deepcopy(T[_origen])
    T[_id].update(tarea=_pedido, mecanismo="pedido por síntoma: " + T[_origen]["mecanismo"], origen=_origen)

# ---------- Banco ADR-098: candidatos pendientes de admisión nativa ----------
def comun(pedido, objetivo, guardas, inicial, final, archivo="P/opencode.json"):
    cambio = {archivo: j(final)}
    return dict(mecanismo="pedido común", archivos={archivo: j(inicial)}, tarea=pedido,
                objetivo=objetivo, guardas=guardas,
                variantes={"correcta": cambio, "obvia": dict(cambio)})


T["C-1"] = comun("Hacé que `build` pida aprobación antes de modificar cualquier archivo. La lectura y los comandos deben seguir como ahora.",
    ("build", "edit", "src/index.js", "ask"), [("build", "read", "src/index.js"), ("build", "bash", "ls")],
    {}, {"agent": {"build": {"permission": {"edit": "ask"}}}})
T["C-2"] = comun("Hacé que `build` pueda correr `npm run lint` sin pedir aprobación. `npm install` y `rm -rf dist` deben seguir pidiendo aprobación.",
    ("build", "bash", "npm run lint", "allow"), [("build", "bash", "npm install"), ("build", "bash", "rm -rf dist")],
    {"permission": {"bash": {"*": "ask"}}}, {"permission": {"bash": {"*": "ask", "npm run lint": "allow"}}})
T["C-3"] = comun("Hacé que `build` no pueda consultar páginas web. La lectura, la edición y `ls` deben seguir como ahora.",
    ("build", "webfetch", "https://example.com", "deny"), [("build", "read", "src/index.js"), ("build", "edit", "src/index.js"), ("build", "bash", "ls")],
    {}, {"agent": {"build": {"permission": {"webfetch": "deny"}}}})
T["C-4"] = comun("Hacé que `build` vuelva a poder modificar archivos sin pedir aprobación. La lectura y los comandos deben seguir como ahora.",
    ("build", "edit", "src/index.js", "allow"), [("build", "read", "src/index.js"), ("build", "bash", "ls")],
    {"agent": {"build": {"permission": {"edit": "deny"}}}}, {"agent": {"build": {"permission": {"edit": "allow"}}}})
T["C-5"] = comun("Hacé que `build` pida aprobación antes de `git commit`. `git status` y `npm test` deben seguir sin pedir aprobación.",
    ("build", "bash", "git commit -m x", "ask"), [("build", "bash", "git status"), ("build", "bash", "npm test")],
    {"permission": {"bash": {"*": "allow"}}}, {"permission": {"bash": {"*": "allow", "git commit *": "ask"}}}, "G/opencode.json")
T["C-6"] = comun("Hacé que `revisor` no pueda modificar archivos. Su lectura y `ls`, y los permisos de `build`, deben seguir como ahora.",
    ("revisor", "edit", "src/index.js", "deny"), [("revisor", "read", "src/index.js"), ("revisor", "bash", "ls"), ("build", "edit", "src/index.js")],
    {"agent": {"revisor": {"description": "Revisor del equipo", "permission": {"edit": "allow"}}}},
    {"agent": {"revisor": {"description": "Revisor del equipo", "permission": {"edit": "deny"}}}})
for _id, _ag, _decision in [('C-1', 'build', 'ask'), ('C-4', 'build', 'allow'), ('C-6', 'revisor', 'deny')]:
    T[_id]['objetivos_adicionales'] = [(_ag, 'edit', p, _decision) for p in ('src/productos.js', 'README.md')]

T["N-20"] = dict(mecanismo="lectura externa por bash", archivos={"H/secretos/x": "SECRETO_FICTICIO\n"},
    tarea="Hacé que `build` no pueda leer nada de `~/secretos`, tampoco desde la terminal. Los archivos públicos del proyecto deben seguir accesibles.",
    objetivo=("build", "bash", "tail ~/secretos/x", "deny"),
    objetivos_adicionales=[("build", "bash", "sed -n '1p' ~/secretos/x", "deny")],
    guardas=[("build", "read", "src/index.js"), ("build", "edit", "src/index.js")],
    variantes={"correcta": {"P/opencode.json": j({"agent": {"build": {"permission": {"external_directory": {"~/secretos/*": "deny"}, "bash": "deny"}}}})},
               "ingenua_external": {"P/opencode.json": j({"permission": {"external_directory": {"~/secretos/*": "deny"}}})}})
T["N-21"] = dict(mecanismo="deny frente a ask nativo", archivos={"P/.env": "API_KEY=ficticia\n"},
    tarea="Asegurate de que `build` no pueda leer `.env` en ningún caso: que se deniegue, no que pregunte. Los demás permisos deben mantenerse.",
    objetivo=("build", "read", ".env", "deny"), guardas=[("build", "read", "src/index.js"), ("build", "read", ".env.local")],
    variantes={"correcta": {"P/opencode.json": j({"permission": {"read": {".env": "deny"}}})}, "ingenua_sin_cambio": {}})
T["N-22"] = dict(mecanismo="todowrite exacto en subagente", archivos={},
    tarea="Hacé que el subagente `general`, cuando lo lanza `build`, pueda usar la lista de tareas. Los demás permisos deben mantenerse.",
    objetivo=("general", "todowrite", "lista", "allow"), guardas=[("general", "bash", "git status"), ("build", "bash", "ls")],
    variantes={"correcta": {"P/opencode.json": j({"agent": {"general": {"permission": {"todowrite": "allow"}}}})},
               "ingenua_comodin": {"P/opencode.json": j({"agent": {"general": {"permission": {"*": "allow"}}}})}})
T["N-23"] = dict(mecanismo="deny con ruta absoluta", archivos={"P/config/credenciales.json": "{}\n"},
    tarea="Hacé que `build` no pueda leer `config/credenciales.json`. Los demás permisos deben mantenerse.",
    objetivo=("build", "read", "config/credenciales.json", "deny"), guardas=[("build", "read", "src/index.js"), ("build", "bash", "ls")],
    variantes={"correcta": {"P/opencode.json": j({"permission": {"read": {"config/credenciales.json": "deny"}}})},
               "ingenua_absoluta": {"P/opencode.json": j({"permission": {"read": {"/home/participante/proyecto/config/credenciales.json": "deny"}}})}})
T["V-9"] = dict(mecanismo="ubicación de AGENTS.md", archivos={},
    tarea='Agregá para todos los agentes del proyecto la instrucción "Respondé siempre en español". Las demás opciones deben mantenerse.',
    valor=("__sistema__", "instruccion_espanol", True),
    guardas_valor=[("build", "model"), ("build", "temperature"), ("build", "permission"), ("plan", "permission"), ("general", "permission")],
    variantes={"correcta": {"P/AGENTS.md": "Respondé siempre en español\n"}, "ingenua_dotdir": {"P/.opencode/AGENTS.md": "Respondé siempre en español\n"}})
_mcp = {"type": "local", "command": ["node", "docs.js"], "enabled": False}
T["V-10"] = dict(mecanismo="environment de MCP", archivos={"P/opencode.json": j({"mcp": {"docs": _mcp}})},
    tarea="Configurá el servidor MCP `docs` con la variable `API_TOKEN` de valor `med12-ficticio`. Mantené sus demás opciones y el resto de la configuración.",
    valor=("__config__", "mcp.docs.environment.API_TOKEN", "med12-ficticio"),
    variantes={"correcta": {"P/opencode.json": j({"mcp": {"docs": {**_mcp, "environment": {"API_TOKEN": "med12-ficticio"}}}})},
               "ingenua_env": {"P/opencode.json": j({"mcp": {"docs": {**_mcp, "env": {"API_TOKEN": "med12-ficticio"}}}})}})
T["N-24"] = dict(mecanismo="OPENCODE_CONFIG_CONTENT frente a .opencode (#11628)",
    archivos={"P/.opencode/opencode.json": j({"permission": {"webfetch": "allow"}})},
    env={"OPENCODE_CONFIG_CONTENT": '{"permission":{"webfetch":"allow"}}'},
    tarea="Hacé que `build` no pueda consultar páginas web. Los demás permisos deben mantenerse.",
    objetivo=("build", "webfetch", "https://example.com", "deny"), guardas=[("build", "bash", "ls"), ("build", "read", "src/index.js")],
    variantes={"correcta": {"P/.opencode/opencode.json": j({"agent": {"build": {"permission": {"webfetch": "deny"}}}})},
               "ingenua_dotdir": {"P/.opencode/opencode.json": j({"permission": {"webfetch": "deny"}})}})
T["N-25"] = dict(mecanismo="patrón bash con -- (#27575)", archivos={},
    tarea="Hacé que `build` pida aprobación antes de ejecutar `npm test -- --watch`. `npm test` y `ls` deben seguir como ahora.",
    objetivo=("build", "bash", "npm test -- --watch", "ask"), guardas=[("build", "bash", "npm test"), ("build", "bash", "ls")],
    variantes={"correcta": {"P/opencode.json": j({"agent": {"build": {"permission": {"bash": {"npm test -- --watch": "ask"}}}}})},
               "ingenua_guiones": {"P/opencode.json": j({"permission": {"bash": {"npm test -- *": "ask"}}})}})

for _id, _t in T.items():
    _t["estrato"] = "E4" if _id.startswith("S-") else "E1" if _id.startswith("C-") or _id in ("V-1", "V-2", "V-3", "V-4") else "E2"
    _t["familia"] = "ruta_absoluta" if _id in ("M-1", "M-2", "M-10", "N-23") else _id
for _t in T.values():
    if "origen" in _t:
        _t["familia"] = T[_t["origen"]]["familia"]

if __name__ == "__main__":
    import sys
    json.dump(T, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
