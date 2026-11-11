const consultas = " [--proyecto <carpeta>]";
const usos: Record<string, readonly [string, string, string]> = {
  valores: [consultas + " --agente <nombre> [--clave <clave>] [--todo]", "valores --agente build", "valores --agente build --clave temperature --json"],
  permiso: [consultas + " --agente <nombre> (--sujeto <sujeto> | --herramienta <nombre>) --objetivo <objetivo> [--lanzado-por <agente>] [--explicar]", "permiso --agente build --sujeto read --objetivo archivo.ts", 'permiso --agente build --herramienta bash --objetivo "git status" --explicar'],
  reglas: [consultas + " --agente <nombre> [--lanzado-por <agente>] [--todo]", "reglas --agente build", "reglas --agente plan --todo"],
  agentes: [consultas + " [--explicar]", "agentes", "agentes --proyecto ./proyecto --json"],
  entradas: [consultas, "entradas", "entradas --proyecto ./proyecto --texto"],
  hallazgos: [consultas + " [--explicar]", "hallazgos", "hallazgos --explicar --json"],
  recientes: ["", "recientes", "recientes --json"],
  comparar: [" --desde <id> --hasta <id> [--agente <nombre>]", "comparar --desde 1 --hasta 2", "comparar --desde 1 --hasta 2 --agente build --texto"],
  estado: ["", "estado", "estado --json"],
  esquema: ["", "esquema", "esquema --json"],
  servir: ["", "servir", "servir --texto"],
};
const opciones = "Opciones:\n  --json, --texto  Formato explícito; consola: texto, tubería: JSON.\n  --help, -h      Ayuda sin consultar configuración ni almacén.\n  --version       Versión de RIGE y OpenCode.\n  --depurar       Stack de fallas internas.\n";
export function ayuda(comando?: string): string {
  if (comando && Object.hasOwn(usos, comando)) {
    const [uso, primero, segundo] = usos[comando]!;
    return `Uso: rige ${comando}${uso}\n\n${opciones}  Las opciones específicas figuran en Uso.\n  --tiempos       Diagnóstico en consultas de proyecto.\n\nEjemplos:\n  rige ${primero}\n  rige ${segundo}\n`;
  }
  return `Uso: rige <subcomando> [opciones]\n\nSubcomandos: ${Object.keys(usos).join(", ")}\n\n${opciones}\n--proyecto usa la carpeta actual si se omite.\n--todo amplía valores y reglas; --explicar amplía permiso y hallazgos.\nNO_COLOR definida (incluso vacía) deshabilita el color.\nUsá rige <subcomando> --help para opciones y ejemplos.\n\nEjemplos:\n  rige valores --agente build\n  rige permiso --agente build --sujeto read --objetivo archivo.ts --json\n`;
}
