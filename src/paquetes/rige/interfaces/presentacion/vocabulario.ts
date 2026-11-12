// Única tabla de etiquetas para la web y la consola; los códigos JSON se conservan.
const efectos: Readonly<Record<string, readonly [string, string, string]>> = {
  allow: ["Permitido", "permitida", "✓"], ask: ["Pregunta antes", "pregunta", "?"], deny: ["Denegado", "denegada", "✗"],
};
export const efectoDecision = (codigo: string | null): string => efectos[codigo ?? ""]?.[0] ?? "Sin decisión";
export const efectoRegla = (codigo: string | null): string => efectos[codigo ?? ""]?.[1] ?? "sin decisión";
export const decisionTexto = (codigo: string | null): string => `${efectos[codigo ?? ""]?.[2] ?? "—"} ${efectoDecision(codigo).toUpperCase()}`;

const modos: Readonly<Record<string, string>> = { primary: "Principal", subagent: "Subagente", all: "Principal y subagente" };
export const modoAgente = (codigo: string): string => modos[codigo] ?? codigo;
const origenes: Readonly<Record<string, string>> = {
  "nativa-general": "OpenCode · general", "nativa-agente": "OpenCode · agente", "nativa-final": "OpenCode · final",
  "denegacion-subagente": "OpenCode · denegación de subagente",
};
export const origenNativo = (codigo: string): string => origenes[codigo] ?? "OpenCode";
const motivos: Readonly<Record<string, string>> = {
  "comando-compuesto": "El comando contiene varias operaciones; consultá cada una por separado.",
  "fuera-del-arbol": "El objetivo está fuera del árbol observado.",
  "eje-parcialmente-observado": "Este sujeto de permiso solo se observa parcialmente.",
};
export const motivoSinDecision = (codigo: string | null | undefined, reglas: Readonly<Record<string, string>>): string =>
  motivos[codigo ?? ""] ?? reglas[codigo ?? ""] ?? "No se pudo determinar el permiso para este objetivo.";
const estados: Readonly<Record<string, string>> = { presente: "presente", ausente: "ausente", no_observada: "no observada", no_soportada: "no soportada" };
export const estadoVia = (codigo: string): string => estados[codigo] ?? codigo;
