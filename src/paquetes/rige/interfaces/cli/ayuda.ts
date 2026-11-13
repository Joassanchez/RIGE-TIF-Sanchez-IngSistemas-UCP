import { subcomandos, type GrupoSubcomando } from "./subcomandos";

const opciones: readonly (readonly [string, string])[] = [
  ["--json, --texto", "Formato explícito; consola: texto, tubería: JSON."],
  ["--help, -h", "Ayuda sin consultar configuración ni almacén."],
  ["--version", "Versión de RIGE y OpenCode."],
  ["--depurar", "Stack de fallas internas."],
];

function bloqueOpciones(titulo: string, filas: readonly (readonly [string, string])[]): string {
  const ancho = Math.max(...filas.map(([opcion]) => opcion.length));
  return `${titulo}:\n` + filas.map(([opcion, descripcion]) => `  ${opcion.padEnd(ancho)}  ${descripcion}\n`).join("");
}

const descripciones: Readonly<Record<string, string>> = {
  proyecto: "Carpeta del proyecto; por defecto, la carpeta actual",
  agente: "Agente a consultar",
  clave: "Clave o ruta de clave a consultar",
  todo: "Incluir valores de fábrica y desplazadas, la cadena completa o los lugares revisados de entradas",
  sujeto: "Sujeto del permiso; excluyente con --herramienta",
  herramienta: "Herramienta del permiso; excluyente con --sujeto",
  objetivo: "Acción u objetivo concreto del permiso",
  "lanzado-por": "Agente que lanza la consulta como subagente",
  explicar: "Ampliar la explicación y los avisos generales (reglas: en JSON se ignora)",
  estricto: "Salir con código 3 si se detecta al menos un hallazgo",
  desde: "Identificador del análisis anterior",
  hasta: "Identificador del análisis posterior",
};

const grupos: readonly { readonly id: GrupoSubcomando; readonly titulo: string; readonly orden: readonly string[] }[] = [
  { id: "consultar", titulo: "Consultar", orden: ["agentes", "valores", "permiso", "reglas", "entradas", "hallazgos"] },
  { id: "historial", titulo: "Historial", orden: ["recientes", "comparar"] },
  { id: "almacen", titulo: "Almacén y servidor", orden: ["esquema", "estado", "servir"] },
];

function bloqueSubcomandos(): string {
  const ancho = Math.max(...subcomandos.map(s => s.nombre.length));
  return grupos.map(({ id, titulo, orden }) => {
    const delGrupo = subcomandos.filter(s => s.grupo === id);
    const ordenados = [
      ...orden.map(nombre => delGrupo.find(s => s.nombre === nombre)).filter((s): s is NonNullable<typeof s> => s !== undefined),
      ...delGrupo.filter(s => !orden.includes(s.nombre)),
    ];
    return `${titulo}:\n` + ordenados.map(s => `  ${s.nombre.padEnd(ancho)}  ${s.resumen}\n`).join("");
  }).join("\n");
}

const codigosSalida = `Códigos de salida:
  0   respuesta válida, con o sin hallazgos
  1   error de uso (proyecto o agente inexistente, almacén sin esquema, versión no soportada)
  2   argumentos inválidos
  3   hallazgos detectados con --estricto
  70  falla interna
`;

export function ayuda(comando?: string, versionHerramienta?: string): string {
  const sub = subcomandos.find(s => s.nombre === comando);
  if (sub !== undefined) {
    const [uso, primero, segundo] = sub.uso;
    const propias = [...uso.matchAll(/--([a-z-]+)( <[^>]+>)?/g)].map(([, nombre, parametro]) => {
      const clave = nombre!;
      const base = sub.descripcionesOpciones?.[clave] ?? descripciones[clave];
      if (base === undefined) {
        throw new Error(`Falta la descripción de la opción --${clave} en la ayuda.`);
      }
      const descripcion = sub.obligatorias?.includes(clave) ? `${base} (obligatoria)` : base;
      return [`--${clave}${parametro ?? ""}`, descripcion] as const;
    });
    const tiempos = sub.consultaProyecto
      ? [["--tiempos", "Diagnóstico de tiempos por stderr en consultas de proyecto."] as const] : [];
    const bloquePropias = propias.length > 0 ? `${bloqueOpciones(`Opciones de ${comando}`, propias)}\n` : "";
    const bloqueGenerales = bloqueOpciones("Opciones generales", [...opciones, ...tiempos]);
    const nota = sub.notaAyuda ? `\n${sub.notaAyuda}\n` : "";
    return `Uso: rige ${comando}${uso}\n\n${bloquePropias}${bloqueGenerales}${nota}\nEjemplos:\n  rige ${primero}\n  rige ${segundo}\n`;
  }
  const herramienta = versionHerramienta ? `OpenCode ${versionHerramienta}` : "OpenCode";
  return `Qué configuración rige en ${herramienta} y de dónde viene.\nEmpezá por: rige agentes\n\nUso: rige <subcomando> [opciones]\n\n${bloqueSubcomandos()}\n${bloqueOpciones("Opciones generales", opciones)}\n--proyecto usa la carpeta actual si se omite.\n--todo amplía valores, reglas y entradas; --explicar amplía permiso, reglas en texto y hallazgos.\nNO_COLOR definida (incluso vacía) deshabilita el color.\nUsá rige <subcomando> --help para opciones y ejemplos.\n\n${codigosSalida}\nEjemplos:\n  rige valores --agente build\n  rige permiso --agente build --sujeto read --objetivo archivo.ts --json\n`;
}
