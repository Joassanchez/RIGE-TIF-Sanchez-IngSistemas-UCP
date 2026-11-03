import type { PlantillasExplicacion } from "@rige/nucleo/permisos/explicar";

export const advertidas: readonly string[] = ["version-no-determinada", "ejecutable-no-encontrado", "paquete-no-encontrado", "paquete-ilegible"];

export const plantillasExplicacion: PlantillasExplicacion = {
  determinante: "La regla {indice} de {total}, {sujeto} {patron} → {efecto}, {origen}, es la última regla coincidente; OpenCode 1.18.25 aplica la última coincidencia.",
  defecto: "No hay reglas coincidentes; la decisión es {efecto} por defecto.",
  desplazadas: "Hay {desplazadas} reglas coincidentes desplazadas.",
  anulada: "La protección nativa de la regla {indice}, {sujeto} {patron} → {efecto}, queda anulada o debilitada por la declaración determinante.",
  origenes: { declarado: "declarada en {archivo}:{linea}", implicito: "implícita", nativo: "nativa" },
  efectos: { allow: "permitida", deny: "denegada", ask: "sujeta a confirmación" },
  cierre: ["aprobaciones-permanentes-excluidas"],
};

export const reglas: Readonly<Record<string, string>> = {
  "hallazgos-parciales": "Una entrada impide cargar la configuración; no se evalúan los hallazgos que requieren la resolución.",
  "wellknown-no-observada": "RIGE no lee las credenciales de auth.json; una entrada wellknown puede definir para OpenCode una variable que RIGE informa sin valor.",
  "version-no-determinada": "No se pudo determinar la versión instalada de OpenCode; los resultados corresponden a OpenCode 1.18.25.",
  "ejecutable-no-encontrado": "No se encontró un archivo ejecutable opencode en el PATH del proceso de RIGE.",
  "paquete-no-encontrado": "No se encontró el package.json del paquete opencode-ai del ejecutable encontrado.",
  "paquete-ilegible": "El contenido del package.json no permite leer una versión del paquete opencode-ai.",
  "valor-implicito-del-agente": "Valor fijado por OpenCode 1.18.25 para el agente, sin entrada declarada (RD-04).",
  "numeracion-sin-directorios-externos": "Los índices no cuentan las reglas external_directory que OpenCode agrega por cada skill o referencia instalada.",
  "references-no-incorporado": "La configuración declara references o reference; RIGE no incorpora los directorios externos que aportan a los permisos.",
  "agente-deshabilitado": "disable: true elimina el agente, incluso si es nativo, después de fusionar la configuración.",
  "eje-parcialmente-observado": "El eje consultado está parcialmente observado; no se informa una decisión de permiso.",
  "comando-compuesto": "El comando es compuesto o no analizable; no se informa una decisión de permiso (RF-08).",
  "tuberia": "Comando compuesto: tubería (| o |&).",
  "encadenamiento": "Comando compuesto: encadenamiento (&&, || o ;).",
  "redireccion": "Comando compuesto: redirección de entrada o salida.",
  "subshell": "Comando compuesto: subshell (paréntesis).",
  "sustitucion": "Comando compuesto: sustitución de comando.",
  "segundo-plano": "Comando compuesto: segundo-plano (&).",
  "salto-de-linea": "Comando compuesto: salto-de-línea.",
  "no-analizable": "Comando no-analizable: comilla, sustitución sin cerrar o escape final.",
  "git-no-encontrado": "No se encontró un archivo ejecutable git en PATH. Se usa / como árbol de trabajo, como OpenCode sin Git.",
  "deteccion-git-aproximada": "Se detectó core.worktree, bare=true o safe.directory. La detección de Git mediante lectura no modela estas variantes (ADR-101 propuesto).",
  "fuera-del-arbol": "El archivo queda fuera del árbol de trabajo: OpenCode pide antes external_directory, un eje parcialmente observado; no se informa una decisión.",
  "denegacion-subagente": "OpenCode agrega al final de la sesión hija una denegación cuando la cadena propia no contiene el sujeto exacto (RD-05).",
  "reglas-agente-lanzador-excluidas": "Las reglas del agente que lanza mediante task no se aplican al subagente (RD-05, ADR-081).",
  "reglas-sesion-lanzadora-excluidas": "Las reglas de la sesión que lanza el subagente no integran el análisis estático.",
  "agente-no-invocable-como-subagente": "El agente tiene mode primary y no es invocable como subagente; se evalúa igualmente su cadena propia.",
  "primary-tools-no-incorporado": "Las denegaciones de sesión de experimental.primary_tools no integran el análisis.",
  "proteccion-nativa-anulada": "La declaración determinante desactiva o debilita una protección nativa coincidente anterior, de denegación o de confirmación (RD-07, ADR-103). El rastro identifica la regla nativa y la declaración con su archivo y línea.",
  "aprobaciones-permanentes-excluidas": 'Las aprobaciones permanentes ("permitir siempre") no integran el análisis.',
  "sesion-no-interactiva-excluida": "En opencode run no interactivo, la sesión agrega al final question, plan_enter y plan_exit con efecto deny; RIGE evalúa la configuración del agente.",
  "nativa-general": "Regla de permiso incorporada en los defaults de OpenCode 1.18.25.",
  "nativa-agente": "Regla de permiso incorporada para el agente nativo de OpenCode 1.18.25.",
  "nativa-final": "OpenCode agrega al final el acceso al directorio de salidas, salvo deny explícito para ese patrón exacto.",
  "sustitucion-no-incorporada": "RIGE no evalúa una regla de permiso ni un modo cuyo texto efectivo proviene de una sustitución; informa su origen y su condición",
  "tools-legado-no-incorporado": "El alias legado tools aporta reglas a permission; RIGE no incorpora esa derivación y no informa los permisos de ese ámbito para evitar un resultado incompleto.",
  "orden-de-aplicacion": "OpenCode 1.18.25 aplica las entradas en orden de precedencia; prevalece la declaración de la última entrada que declara la clave (RD-01).",
  "fuera-del-v1": "Clave que OpenCode combina o deriva con reglas que RIGE no incorpora; se resuelve en una iteración posterior.",
  "markdown-no-observado": "Agente declarado también en Markdown, que RIGE no incorpora; sus claves no se informan para no presentar un valor incompleto.",
};

export const reglasHallazgos: Readonly<Record<string, string>> = {
  "elementos-sin-uso-no-evaluados": "Hay agentes o comandos con contenido no observado, o declaraciones de uso excluidas o con sustituciones; no se evalúan los elementos sin uso.",
};

export const plantillasHallazgo: Readonly<Record<string, string>> = {
  "tapada-por-posterior": "La regla {sujeto} {patron} → {efecto} ({clave}) queda sin efecto: la regla posterior {sujeto} {patronPosterior} → {efectoPosterior}, declarada en {origenPosterior}, abarca todos sus casos y OpenCode 1.18.25 aplica la última coincidencia.",
  "ruta-absoluta": "La regla {sujeto} {patron} → {efecto} declara una ruta absoluta del árbol de trabajo y no coincide con ninguna acción: OpenCode 1.18.25 evalúa la ruta relativa al árbol de trabajo.",
  "ruta-absoluta-con-forma": "La regla {sujeto} {patron} → {efecto} declara una ruta absoluta del árbol de trabajo y no coincide con ninguna acción: OpenCode 1.18.25 evalúa la ruta relativa al árbol de trabajo. Con la forma relativa {formaRelativa}, en la misma posición, la decisión es " + "{decision}.",
  "subagente-sin-uso": "Ningún agente ni comando nombra al subagente {agente}; solo queda disponible para la herramienta task, a criterio del modelo, o por mención directa del usuario.",
  "sintaxis-invalida": "La entrada {entrada} no es JSON(C) válido en {posicion}; OpenCode 1.18.25 termina con error al cargar la configuración.",
  "archivo-inexistente": "La entrada {entrada} referencia en {posicion}, mediante una sustitución de archivo, el archivo {archivo}, que no existe o no se puede leer; OpenCode 1.18.25 termina con error al cargar la configuración.",
  "permiso-invalido": "OPENCODE_PERMISSION no es JSON válido; OpenCode 1.18.25 la descarta sin error visible y solo lo registra en su archivo de registro.",
  "variable-sin-valor": "{clave} referencia la variable {variable}, que no está definida o está vacía en el proceso de RIGE; OpenCode 1.18.25 la reemplaza por un texto vacío sin advertencia.",
  "agente-predeterminado-inexistente": "{clave} nombra el agente {agente}, que no figura en la resolución (no existe o está deshabilitado); OpenCode 1.18.25 termina con error al elegir el agente predeterminado.",
  "agente-comando-inexistente": "{clave} nombra el agente {agente}, que no figura en la resolución (no existe o está deshabilitado); OpenCode 1.18.25 termina con error al ejecutar ese comando.",
};
