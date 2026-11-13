import { subcomandos } from "./subcomandos";

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

const codigosSalida = `Códigos de salida:
  0   respuesta válida, con o sin hallazgos
  1   error de uso (proyecto o agente inexistente, almacén sin esquema, versión no soportada)
  2   argumentos inválidos
  70  falla interna
`;

export function ayuda(comando?: string): string {
  const sub = subcomandos.find(s => s.nombre === comando);
  if (sub !== undefined) {
    const [uso, primero, segundo] = sub.uso;
    const propias = [...uso.matchAll(/--([a-z-]+)( <[^>]+>)?/g)].map(([, nombre, parametro]) => {
      const clave = nombre!;
      const descripcion = descripciones[clave];
      if (descripcion === undefined) {
        throw new Error(`Falta la descripción de la opción --${clave} en la ayuda.`);
      }
      return [`--${clave}${parametro ?? ""}`, descripcion] as const;
    });
    const tiempos = sub.consultaProyecto
      ? [["--tiempos", "Diagnóstico en consultas de proyecto."] as const] : [];
    return `Uso: rige ${comando}${uso}\n\n${bloqueOpciones([...opciones, ...propias, ...tiempos])}\nEjemplos:\n  rige ${primero}\n  rige ${segundo}\n`;
  }
  return `Uso: rige <subcomando> [opciones]\n\nSubcomandos: ${subcomandos.map(s => s.nombre).join(", ")}\n\n${bloqueOpciones(opciones)}\n--proyecto usa la carpeta actual si se omite.\n--todo amplía valores, reglas y entradas; --explicar amplía permiso, reglas en texto y hallazgos.\nNO_COLOR definida (incluso vacía) deshabilita el color.\nUsá rige <subcomando> --help para opciones y ejemplos.\n\n${codigosSalida}\nEjemplos:\n  rige valores --agente build\n  rige permiso --agente build --sujeto read --objetivo archivo.ts --json\n`;
}
