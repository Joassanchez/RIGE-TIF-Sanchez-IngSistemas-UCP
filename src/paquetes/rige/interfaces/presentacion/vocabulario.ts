// Única tabla de etiquetas para la web y la consola; los códigos JSON se conservan.
const efectos: Readonly<Record<string, readonly [string, string, string]>> = {
  allow: ["Permitido", "permitida", "✓"], ask: ["Pregunta antes", "pregunta", "?"], deny: ["Denegado", "denegada", "✗"],
};
export const efectoDecision = (codigo: string | null): string => efectos[codigo ?? ""]?.[0] ?? "Sin decisión";
export const efectoRegla = (codigo: string | null): string => efectos[codigo ?? ""]?.[1] ?? "sin decisión";
export const efectoConGlifo = (codigo: string | null): string => {
  const entrada = efectos[codigo ?? ""];
  return entrada ? `${entrada[2]} ${entrada[1]}` : "sin decisión";
};
export const decisionConGlifo = (codigo: string | null): string => {
  const entrada = efectos[codigo ?? ""];
  return entrada ? `${entrada[2]} ${entrada[0]}` : "Sin decisión";
};
export const decisionTexto = (codigo: string | null): string => `${efectos[codigo ?? ""]?.[2] ?? "—"} ${efectoDecision(codigo).toUpperCase()}`;

export const plural = (n: number, singular: string, pluralForma: string): string =>
  n === 1 ? singular : pluralForma;

const modos: Readonly<Record<string, string>> = { primary: "Principal", subagent: "Subagente", all: "Principal y subagente" };
export const modoAgente = (codigo: string): string => modos[codigo] ?? codigo;

const origenes: Readonly<Record<string, string>> = {
  "nativa-general": "OpenCode · general", "nativa-agente": "OpenCode · agente", "nativa-final": "OpenCode · final",
  "denegacion-subagente": "OpenCode · denegación de subagente",
};
export const origenNativo = (codigo: string): string => origenes[codigo] ?? "OpenCode";
export const origenImplicito = (): string => "OpenCode · valor de fábrica";

const motivos: Readonly<Record<string, string>> = {
  "comando-compuesto": "El comando contiene varias operaciones; consultá cada una por separado.",
  "fuera-del-arbol": "El objetivo está fuera del árbol observado.",
  "eje-parcialmente-observado": "Este sujeto de permiso solo se observa parcialmente.",
};
export const motivoSinDecision = (codigo: string | null | undefined, reglas: Readonly<Record<string, string>>): string =>
  motivos[codigo ?? ""] ?? reglas[codigo ?? ""] ?? "No se pudo determinar el permiso para este objetivo.";

const estados: Readonly<Record<string, string>> = {
  presente: "presente",
  ausente: "ausente",
  no_observada: "no observada",
  no_soportada: "no soportada",
};
export const estadoVia = (codigo: string): string => estados[codigo] ?? codigo.replaceAll("_", " ");

const condiciones: Readonly<Record<string, string>> = {
  observada: "observada",
  no_observada: "no observada",
  definida: "definida",
};
export const condicionEntrada = (codigo: string): string => condiciones[codigo] ?? codigo.replaceAll("_", " ");

const legibilidades: Readonly<Record<string, string>> = {
  legible: "legible",
  ilegible: "ilegible",
};
export const legibilidadEntrada = (codigo: string | null | undefined): string =>
  codigo ? (legibilidades[codigo] ?? codigo.replaceAll("_", " ")) : "no observada";

const consecuencias: Readonly<Record<string, string>> = {
  falla: "falla",
  descartada: "descartada",
};
export const consecuenciaError = (codigo: string): string => consecuencias[codigo] ?? codigo;

const vias: Readonly<Record<string, string>> = {
  proyecto: "proyecto",
  global: "global",
  "variable-config": "archivo indicado por variable",
  "directorio-opencode": "directorio de configuración",
  markdown: "agente Markdown",
  administrada: "configuración administrada",
  "variable-contenido": "variable de contenido",
  "variable-permiso": "variable de permisos",
  remota: "configuración remota",
};
export const nombreVia = (codigo: string, capitalizada = false): string => {
  const etiqueta = vias[codigo] ?? codigo.replaceAll("-", " ");
  return capitalizada ? etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1) : etiqueta;
};

export const nombresHallazgos: Readonly<Record<string, readonly [string, string]>> = {
  "entrada-ilegible": ["Entrada ilegible", "Entradas ilegibles"],
  "entrada-descartada": ["Entrada descartada", "Entradas descartadas"],
  "sustitucion-sin-valor": ["Sustitución sin valor", "Sustituciones sin valor"],
  "referencia-no-resuelta": ["Referencia no resuelta", "Referencias no resueltas"],
  "regla-sin-efecto": ["Regla sin efecto", "Reglas sin efecto"],
  "elemento-sin-uso": ["Elemento sin uso", "Elementos sin uso"],
};
export const tipoHallazgo = (codigo: string, cantidad = 1): string => {
  const par = nombresHallazgos[codigo];
  return par ? plural(cantidad, par[0], par[1]) : codigo.replaceAll("-", " ");
};

const causasHallazgos: Readonly<Record<string, string>> = {
  "sintaxis-invalida": "Sintaxis JSON(C) inválida",
  "archivo-inexistente": "Archivo referenciado inexistente",
  "permiso-invalido": "Permiso inválido en OPENCODE_PERMISSION",
  "variable-sin-valor": "Variable de entorno sin valor",
  "agente-predeterminado-inexistente": "Agente predeterminado inexistente",
  "agente-comando-inexistente": "Agente de comando inexistente",
  "tapada-por-posterior": "Tapada por regla posterior",
  "ruta-absoluta": "Ruta absoluta en lugar de relativa",
  "ruta-absoluta-con-forma": "Ruta absoluta con forma relativa equivalente",
  "subagente-sin-uso": "Subagente sin uso",
  "ruta-no-encontrada": "Ruta no encontrada",
};
export const causaHallazgo = (codigo: string, reglas: Readonly<Record<string, string>> = {}): string =>
  reglas[codigo] ?? causasHallazgos[codigo] ?? codigo.replaceAll("-", " ");

const motivosResolucion: Readonly<Record<string, string>> = {
  "clave-inexistente": "La clave consultada no existe para el agente.",
  "no-observada": "no observada",
  "no-resuelta": "no resuelta",
  "forma-v2-no-incorporada": "forma v2 de OpenCode no incorporada",
  "markdown-no-observado": "Agente declarado también en Markdown, que RIGE no incorpora; sus claves no se informan para no presentar un valor incompleto.",
  "fuera-del-v1": "Clave que OpenCode combina o deriva con reglas que RIGE no incorpora; se resuelve en una iteración posterior.",
  "sustitucion-no-incorporada": "RIGE no evalúa una regla de permiso ni un modo cuyo texto efectivo proviene de una sustitución; informa su origen y su condición.",
  "tools-legado-no-incorporado": "El alias legado tools aporta reglas a permission; RIGE no incorpora esa derivación y no informa los permisos de ese ámbito para evitar un resultado incorrecto.",
  "hallazgos-parciales": "Una entrada impide cargar la configuración; no se evalúan los hallazgos que requieren la resolución.",
  "wellknown-no-observada": "RIGE no lee las credenciales de auth.json; una entrada wellknown puede definir para OpenCode una variable que RIGE informa sin valor.",
  "elementos-sin-uso-no-evaluados": "Hay agentes o comandos con contenido no observado, o declaraciones de uso excluidas o con sustituciones; no se evalúan los elementos sin uso.",
  "proteccion-nativa-anulada": "La declaración determinante desactiva o debilita una protección nativa coincidente anterior, de denegación o de confirmación.",
  "proteccion-anulada": "protección nativa anulada",
  "sin-regla": "sin regla",
  "cadena-incompleta": "Cadena de reglas incompleta.",
  "eje-parcialmente-observado": "Este sujeto de permiso solo se observa parcialmente.",
  "agente-deshabilitado": "Agente deshabilitado mediante disable: true.",
};
export const motivoNoResolucion = (codigo: string, reglas: Readonly<Record<string, string>> = {}): string =>
  reglas[codigo] ?? motivosResolucion[codigo] ?? codigo.replaceAll("-", " ").replaceAll("_", " ");
