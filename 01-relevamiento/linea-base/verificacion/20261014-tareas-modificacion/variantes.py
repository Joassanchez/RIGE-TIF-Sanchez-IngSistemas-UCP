# Variantes de edición por caso para verificar las tareas de modificación (ADR-085, propuesto).
# Rutas: G/ = ~/.config/opencode/ ; P/ = ~/proyecto/. Contenido completo del archivo resultante.
import json

M = "google/gemini-2.5-flash"
T = 0.55
S = "https://opencode.ai/config.json"


def j(d):
    return json.dumps({"$schema": S, **d}, indent=2) + "\n"


V = {
    # ---- C-1 (control) ----
    "C-1a": {"correcta": {"P/opencode.json": j({"agent": {"build": {"model": M}}})}},
    "C-1b": {"correcta": {"G/opencode.json": j({"permission": {"webfetch": "deny"}})}},
    "C-1c": {"correcta": {"G/opencode.json": j({"agent": {"plan": {"temperature": T}}})}},
    "C-1d": {"correcta": {"P/opencode.json": j({"permission": {"edit": "allow"}})}},
    "C-1e": {
        "correcta": {"P/.opencode/opencode.json": j({"agent": {"build": {"temperature": T}}})},
        "ingenua": {"P/opencode.json": j({"agent": {"build": {"temperature": T}}})},
    },
    "C-1f": {
        "correcta": {"G/config.json": j({"permission": {"read": {"*": "deny", "src/productos.js": "allow"}}})},
        "amplia": {"G/config.json": j({"permission": {"read": "allow"}})},
    },
    # ---- C-2 ----
    "C-2a": {
        "correcta": {"G/opencode.json": j({"agent": {"build": {"model": M, "temperature": 0.1}}})},
        "ingenua": {"P/opencode.json": j({"model": M, "agent": {"build": {"temperature": 0.7}}})},
    },
    "C-2b": {
        "correcta": {"P/.opencode/opencode.json": j({"agent": {"docs": {"model": M}}})},
        "ingenua": {"P/sub/.opencode/opencode.json": j({"agent": {"docs": {"model": M}}})},
    },
    "C-2c": {
        "correcta": {"P/.opencode/agent/revisor.md": "---\ndescription: Revisor de código del equipo\nmodel: " + M
                     + "\n---\n\nRevisá los cambios pendientes y señalá errores antes del commit.\n"},
        "ingenua": {"P/opencode.json": j({"agent": {"revisor": {"description": "Revisa cambios antes del commit",
                                                                 "model": M, "temperature": 0.2}}})},
    },
    "C-2d": {
        "correcta": {"G/opencode.jsonc": '{\n  // Configuración personal\n  "$schema": "' + S
                     + '",\n  "agent": {\n    "build": {\n      "model": "' + M + '"\n    }\n  }\n}\n'},
        "ingenua": {"G/opencode.json": j({"agent": {"build": {"model": M}}})},
    },
    "C-2e": {
        "ingenua": {"P/opencode.json": j({"agent": {"build": {"model": M}}})},
        "ingenua_md": {"P/.opencode/agent/build.md": "---\nmodel: " + M + "\n---\n"},
        "ingenua_dir": {"P/.opencode/opencode.json": j({"agent": {"build": {"model": M}}})},
    },
    "C-2f": {
        "correcta": {"G/equipo.json": j({"agent": {"build": {"model": M, "temperature": 0.5}}})},
        "correcta_proyecto": {"P/opencode.json": j({"agent": {"build": {"model": M, "temperature": 0.9}}})},
        "ingenua": {"G/opencode.json": j({"agent": {"build": {"model": M, "temperature": 0.1}}})},
    },
    # ---- C-3 ----
    "C-3a": {
        "correcta": {"P/opencode.json": j({"model": "anthropic/claude-haiku-4-5", "agent": {"plan": {"model": M}}})},
        "ingenua": {"P/opencode.json": j({"model": M})},
    },
    "C-3b": {
        "correcta": {"P/opencode.json": j({"permission": {"read": {".env": "allow"}}})},
        "amplia": {"G/opencode.json": j({"permission": {"read": "allow"}})},
    },
    "C-3c": {
        "correcta": {"P/opencode.json": j({"model": "openai/o4-mini", "agent": {"build": {"model": M}}})},
        "correcta_archivo": {"G/modelo-equipo.txt": M + "\n"},
        "ingenua": {"P/opencode.json": j({"model": M})},
    },
    "C-3d": {
        "correcta": {"P/opencode.json": j({"agent": {"plan": {"temperature": 0.1,
                                                               "permission": {"edit": {"README.md": "allow"}}}}})},
        "amplia": {"P/opencode.json": j({"agent": {"plan": {"temperature": 0.1, "permission": {"edit": "allow"}}}})},
    },
    "C-3e": {"correcta": {"P/opencode.json": j({"agent": {"plan": {"description": "Revisa-plan"}}})}},
    "C-3f": {
        "correcta": {"P/opencode.json": j({"agent": {"general": {"temperature": 0.6,
                                                                  "permission": {"bash": {"git status": "deny"}}},
                                                      "plan": {"permission": {"bash": "allow"}}}})},
        "ingenua": {"G/opencode.json": j({"agent": {"build": {"permission": {"bash": {"*": "deny", "git status": "deny"}}}}})},
    },
    # ---- C-4 ----
    "C-4a": {
        "correcta": {"P/opencode.json": j({"permission": {"bash": {"*": "deny"}},
                                           "agent": {"build": {"permission": {"bash": {"git status": "ask"}}}}})},
        "amplia": {"G/opencode.json": j({"permission": {"bash": {"*": "ask", "git *": "ask"}}})},
    },
    "C-4b": {
        "correcta": {"P/opencode.json": j({"permission": {"bash": {"*": "deny"}},
                                           "agent": {"build": {"permission": {"bash": {"git diff": "allow"}}}}})},
        "ingenua": {"G/opencode.json": j({"permission": {"bash": {"git diff": "allow", "git *": "allow", "*": "ask"}}})},
        "ingenua_final": {"G/opencode.json": j({"permission": {"bash": {"git *": "allow", "*": "ask", "git diff": "allow"}}})},
    },
    "C-4c": {
        "correcta": {"P/opencode.json": j({"agent": {"plan": {"description": "Planifica sin modificar archivos",
                                                               "permission": {"edit": "deny"}}}})},
        "quitar_global": {"G/opencode.json": j({})},
    },
    "C-4d": {
        "correcta": {"P/opencode.json": j({"permission": {"bash": {"*": "allow"}},
                                           "agent": {"build": {"permission": {"bash": {"npm install": "allow"}}}}})},
        "ingenua": {"P/opencode.json": j({"permission": {"bash": {"*": "allow", "npm install": "allow"}}})},
    },
    "C-4e": {
        "correcta": {"P/opencode.json": j({"agent": {"build": {"permission": {"webfetch": "allow", "edit": "allow"}}}})},
        "ingenua": {"P/opencode.json": j({"permission": {"edit": "allow"},
                                          "agent": {"build": {"permission": {"webfetch": "allow"}}}})},
        "ingenua_global": {"G/opencode.json": j({"permission": {"webfetch": "deny", "edit": "allow"}})},
    },
    "C-4f": {"correcta": {"P/opencode.json": j({"permission": {"edit": "allow"}})}},
}

if __name__ == "__main__":
    import sys
    json.dump(V, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
