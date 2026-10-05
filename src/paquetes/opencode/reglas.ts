export const reglas: Readonly<Record<"orden-de-aplicacion" | "fuera-del-v1" | "markdown-no-observado", string>> = {
  "orden-de-aplicacion": "OpenCode 1.18.25 aplica las entradas en orden de precedencia; prevalece la declaración de la última entrada que declara la clave (RD-01).",
  "fuera-del-v1": "Clave que OpenCode combina o deriva con reglas que el prototipo v1 no incorpora; se resuelve en una iteración posterior.",
  "markdown-no-observado": "Agente declarado también en Markdown, que el prototipo v1 no incorpora; sus claves no se informan para no presentar un valor incompleto.",
};
