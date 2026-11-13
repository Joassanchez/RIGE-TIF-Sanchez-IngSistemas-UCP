// Única tabla de etiquetas para la web y la consola; los códigos JSON se conservan.
const efectos: Readonly<Record<string, readonly [string, string, string]>> = {
  allow: ["Permitido", "permitida", "✓"], ask: ["Pregunta antes", "pregunta", "?"], deny: ["Denegado", "denegada", "✗"],
};
export const efectoDecision = (codigo: string | null): string => efectos[codigo ?? ""]?.[0] ?? "Sin decisión";
export const efectoRegla = (codigo: string | null): string => efectos[codigo ?? ""]?.[1] ?? "sin decisión";
export const glifoEfecto = (codigo: string | null): string => efectos[codigo ?? ""]?.[2] ?? "—";
export const leyendaParcial = "◐ parcial: RIGE no puede decidirlo sin conocer el objetivo concreto";
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
  "valor-implicito-del-agente": "Valor fijado por OpenCode para el agente, sin entrada declarada (RD-04).",
  "orden-de-aplicacion": "OpenCode aplica las entradas en orden de precedencia; prevalece la declaración de la última entrada que declara la clave (RD-01).",
};
export const motivoNoResolucion = (codigo: string, reglas: Readonly<Record<string, string>> = {}): string =>
  reglas[codigo] ?? motivosResolucion[codigo] ?? codigo.replaceAll("-", " ").replaceAll("_", " ");

const sujetosParciales: Readonly<Record<string, string>> = {
  external_directory: "Acceso a carpetas fuera del proyecto (external_directory): RIGE no puede decidirlo sin saber qué carpeta se pide",
  bash: "Comandos de terminal (bash): RIGE no puede decidirlo sin conocer el comando concreto",
  edit: "Edición de archivos (edit): RIGE no puede decidirlo sin conocer la ruta concreta",
  read: "Lectura de archivos (read): RIGE no puede decidirlo sin conocer la ruta concreta",
  glob: "Búsqueda de archivos por patrón (glob): RIGE no puede decidirlo sin conocer el patrón concreto",
  grep: "Búsqueda de texto en archivos (grep): RIGE no puede decidirlo sin conocer el patrón concreto",
  list: "Listado de carpetas (list): RIGE no puede decidirlo sin conocer la ruta concreta",
  webfetch: "Consultas web (webfetch): RIGE no puede decidirlo sin conocer la URL concreta",
  task: "Lanzamiento de subagentes (task): RIGE no puede decidirlo sin conocer el subagente concreto",
  skill: "Uso de habilidades (skill): RIGE no puede decidirlo sin conocer la habilidad concreta",
  question: "Preguntas al usuario (question): RIGE no puede decidirlo sin conocer la pregunta concreta",
  plan_enter: "Cambio a modo plan (plan_enter): RIGE no puede decidirlo sin conocer la operación concreta",
  plan_exit: "Salida del modo plan (plan_exit): RIGE no puede decidirlo sin conocer la operación concreta",
  todowrite: "Escritura de lista de tareas (todowrite): RIGE no puede decidirlo sin conocer la operación concreta",
  todoread: "Lectura de lista de tareas (todoread): RIGE no puede decidirlo sin conocer la operación concreta",
};

export const explicarSujetoParcial = (sujeto: string): string =>
  sujetosParciales[sujeto] ?? `${sujeto}: RIGE no puede decidirlo sin conocer el objetivo concreto`;

const limitesLlanos: Readonly<Record<string, string>> = {
  "aprobaciones-permanentes-excluidas": "Aprobaciones permanentes durante la sesión («permitir siempre»): RIGE analiza la configuración guardada, no lo aprobado al vuelo",
  "sesion-no-interactiva-excluida": "Ejecuciones no interactivas (opencode run): en una sesión sin teclado OpenCode deniega question, plan_enter y plan_exit al final; RIGE evalúa la configuración del agente",
  "numeracion-sin-directorios-externos": "Reglas agregadas por habilidades instaladas (external_directory): los índices mostrados no cuentan esas reglas automáticas",
  "references-no-incorporado": "Carpetas externas declaradas (references / reference): RIGE no incorpora los permisos que aportan esos directorios",
  "reglas-agente-lanzador-excluidas": "Permisos del agente que lanza mediante task: no se heredan al subagente; se evalúa la cadena propia del subagente",
  "reglas-sesion-lanzadora-excluidas": "Reglas temporales de la sesión que lanza: no integran este análisis estático",
  "agente-no-invocable-como-subagente": "Agente principal consultado como subagente (mode: primary): OpenCode no permite invocarlo así; RIGE muestra igual su cadena propia",
  "primary-tools-no-incorporado": "Herramientas experimentales (experimental.primary_tools): sus denegaciones de sesión no integran este análisis",
  "proteccion-nativa-anulada": "Protección de fábrica anulada: la regla determinante debilita o desactiva una protección anterior de OpenCode",
  "sustitucion-no-incorporada": "Valores armados con sustituciones ({env:…} o {file:…}): RIGE no evalúa permisos ni modos cuyo texto depende de una sustitución; muestra su origen y condición",
  "tools-legado-no-incorporado": "Alias legado de herramientas (tools): RIGE no incorpora su conversión a permisos y omite ese ámbito para evitar un resultado incompleto",
  "fuera-del-v1": "Claves combinadas o derivadas fuera del alcance actual: RIGE todavía no las resuelve",
  "markdown-no-observado": "Agentes definidos en archivos Markdown (.md): RIGE no los incorpora y omite sus claves para evitar valores incompletos",
  "forma-v2-no-incorporada": "Formas de esquema v2 (agents, commands o model como objeto): RIGE no las normaliza y omite las claves afectadas",
  "hallazgos-parciales": "Hallazgos incompletos: un error impide cargar toda la configuración y no se evalúan los hallazgos que requieren resolverla",
  "wellknown-no-observada": "Credenciales y fuentes remotas (auth.json / wellknown): RIGE no lee secretos ni orígenes remotos",
  "elementos-sin-uso-no-evaluados": "Elementos sin uso omitidos: hay agentes o comandos con contenido no observado o sustituciones, por lo que no se evalúan elementos sin uso",
  "git-no-encontrado": "Detección del proyecto sin Git: no se encontró git en PATH y se usó / como raíz del árbol, igual que OpenCode sin Git",
  "deteccion-git-aproximada": "Variantes avanzadas de Git (core.worktree, bare=true, safe.directory): la detección por lectura de archivos no las modela por completo",
  "cadena-incompleta": "Cadena de reglas incompleta: no se pudieron resolver todas las entradas de permiso del agente",
  "eje-parcialmente-observado": "Sujeto de permiso parcial: RIGE no puede decidirlo sin conocer el objetivo concreto",
  "version-no-determinada": "Versión instalada de OpenCode no determinada: los resultados corresponden a la versión soportada de OpenCode",
  "ejecutable-no-encontrado": "Ejecutable de OpenCode no encontrado en PATH: el análisis usa las reglas de la versión soportada de OpenCode",
  "paquete-no-encontrado": "Paquete opencode-ai no encontrado junto al ejecutable: no se pudo verificar la versión instalada",
  "paquete-ilegible": "Archivo package.json de opencode-ai ilegible: no se pudo leer la versión instalada",
  "path-inaccesible": "Carpetas inaccesibles en PATH: se omitieron candidatos sin permiso de lectura",
};

export const explicarLimite = (codigo: string, reglas: Readonly<Record<string, string>> = {}): string =>
  limitesLlanos[codigo] ?? motivoNoResolucion(codigo, reglas);
