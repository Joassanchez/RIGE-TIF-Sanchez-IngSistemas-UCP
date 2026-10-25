// Borde del arnes: consulta la funcion de aplicacion sin agregar una CLI de producto.
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";

const [proyecto, consultasJson, modo] = process.argv.slice(2);
const consultas = JSON.parse(consultasJson!) as { agente: string; sujeto?: string; herramienta?: string; objetivo: string; lanzadoPor?: string; explicar?: boolean }[];
const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: process.env });
const adaptador = modo === "primera" ? { ...adaptadorOpenCode, permisos: { ...adaptadorOpenCode.permisos,
  evaluar: (...args: Parameters<typeof adaptadorOpenCode.permisos.evaluar>) => {
    const evaluacion = adaptadorOpenCode.permisos.evaluar(...args);
    return { ...evaluacion, determinante: evaluacion.coincidentes[0] ?? null };
  },
} } : adaptadorOpenCode;
console.log(JSON.stringify(consultas.map(({ agente, sujeto, herramienta, objetivo, lanzadoPor, explicar }) => {
  const resultado = consultarPermiso({ adaptador, entorno, rutas: { canonica: () => proyecto! } }, { proyecto: proyecto!, agente: agente, ...(herramienta === undefined ? { sujeto: sujeto! } : { herramienta }), objetivo: objetivo , lanzadoPor: lanzadoPor, ...({ explicar: explicar === true }) });
  if (!resultado.exito) {
    if (modo === "resultado") return resultado;
    throw new Error(resultado.error.mensaje);
  }
  return resultado.valor;
})));
