export const reglas: Readonly<Record<"orden-de-aplicacion" | "fuera-del-v1" | "markdown-no-observado" | "tools-legado-no-incorporado" | "sustitucion-no-incorporada", string>> = {
  "sustitucion-no-incorporada": "Clave cuyo valor contiene una sustitución {env:…} o {file:…}; el prototipo v1 no incorpora sustituciones y no informa su valor (RNF-04).",
  "tools-legado-no-incorporado": "El alias legado tools aporta reglas a permission; RIGE no incorpora esa derivación y no informa los permisos de ese ámbito para evitar un resultado incompleto.",
  "orden-de-aplicacion": "OpenCode 1.18.25 aplica las entradas en orden de precedencia; prevalece la declaración de la última entrada que declara la clave (RD-01).",
  "fuera-del-v1": "Clave que OpenCode combina o deriva con reglas que el prototipo v1 no incorpora; se resuelve en una iteración posterior.",
  "markdown-no-observado": "Agente declarado también en Markdown, que el prototipo v1 no incorpora; sus claves no se informan para no presentar un valor incompleto.",
};
