const consultas = " [--proyecto <carpeta>]";
const usos: Record<string, readonly [string, string, string]> = {
  valores: [consultas + " --agente <nombre> [--clave <clave>] [--todo]", "valores --agente build", "valores --agente build --clave temperature --json"],
  permiso: [consultas + " --agente <nombre> (--sujeto <sujeto> | --herramienta <nombre>) --objetivo <objetivo> [--lanzado-por <agente>] [--explicar]", "permiso --agente build --sujeto read --objetivo archivo.ts", 'permiso --agente build --herramienta bash --objetivo "git status" --explicar'],
  reglas: [consultas + " --agente <nombre> [--lanzado-por <agente>] [--todo] [--explicar]", "reglas --agente build", "reglas --agente plan --explicar --texto"],
  agentes: [consultas + " [--explicar]", "agentes", "agentes --proyecto ./proyecto --json"],
  entradas: [consultas + " [--todo]", "entradas", "entradas --proyecto ./proyecto --texto --todo"],
  hallazgos: [consultas + " [--explicar]", "hallazgos", "hallazgos --explicar --json"],
  recientes: ["", "recientes", "recientes --json"],
  comparar: [" --desde <id> --hasta <id> [--agente <nombre>]", "comparar --desde 1 --hasta 2", "comparar --desde 1 --hasta 2 --agente build --texto"],
  estado: ["", "estado", "estado --json"],
  esquema: ["", "esquema", "esquema --json"],
  servir: ["", "servir", "servir --texto"],
};
const opciones: readonly (readonly [string, string])[] = [
  ["--json, --texto", "Formato explícito; consola: texto, tubería: JSON."],
  ["--help, -h", "Ayuda sin consultar configuración ni almacén."],
  ["--version", "Versión de RIGE y OpenCode."],
  ["--depurar", "Stack de fallas internas."],
];
function bloqueOpciones(filas: readonly (readonly [string, string])[]): string {
  const ancho = Math.max(...filas.map(([opcion]) => opcion.length));
  return "Opciones:\n" + filas.map(([opcion, descripcion]) => `  ${opcion.padEnd(ancho)}  ${descripcion}\n`).join("");
}
const descripciones: Readonly<Record<string, string>> = {
  proyecto: "Carpeta del proyecto; por defecto, la carpeta actual",
  agente: "Agente a consultar (en comparar, filtra solo el texto)",
  clave: "Clave o ruta de clave a consultar",
  todo: "Incluir valores de fábrica y desplazadas, la cadena completa o los lugares revisados de entradas",
  sujeto: "Sujeto del permiso; excluyente con --herramienta",
  herramienta: "Herramienta del permiso; excluyente con --sujeto",
  objetivo: "Acción u objetivo concreto del permiso",
  "lanzado-por": "Agente que lanza la consulta como subagente",
  explicar: "Ampliar la explicación y los avisos generales (reglas: en JSON se ignora)",
  desde: "Identificador del análisis anterior",
  hasta: "Identificador del análisis posterior",
};
export function ayuda(comando?: string): string {
  if (comando && Object.hasOwn(usos, comando)) {
    const [uso, primero, segundo] = usos[comando]!;
    const propias = [...uso.matchAll(/--([a-z-]+)( <[^>]+>)?/g)].map(([, nombre, parametro]) =>
      [`--${nombre}${parametro ?? ""}`, descripciones[nombre!]!] as const);
    const tiempos = ["valores", "permiso", "reglas", "agentes", "entradas", "hallazgos"].includes(comando)
      ? [["--tiempos", "Diagnóstico en consultas de proyecto."] as const] : [];
    return `Uso: rige ${comando}${uso}\n\n${bloqueOpciones([...opciones, ...propias, ...tiempos])}\nEjemplos:\n  rige ${primero}\n  rige ${segundo}\n`;
  }
  return `Uso: rige <subcomando> [opciones]\n\nSubcomandos: ${Object.keys(usos).join(", ")}\n\n${bloqueOpciones(opciones)}\n--proyecto usa la carpeta actual si se omite.\n--todo amplía valores, reglas y entradas; --explicar amplía permiso, reglas en texto y hallazgos.\nNO_COLOR definida (incluso vacía) deshabilita el color.\nUsá rige <subcomando> --help para opciones y ejemplos.\n\nEjemplos:\n  rige valores --agente build\n  rige permiso --agente build --sujeto read --objetivo archivo.ts --json\n`;
}
