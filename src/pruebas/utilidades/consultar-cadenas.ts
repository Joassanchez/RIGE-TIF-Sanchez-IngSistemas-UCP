import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";

const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: process.env });
const resolucion = resolver(adaptadorOpenCode, process.argv[2]!, entorno);
if (!resolucion.exito) throw new Error(resolucion.error.mensaje);
console.log(JSON.stringify(Object.fromEntries(process.argv.slice(3).map(agente => {
  const resultado = adaptadorOpenCode.cadena(resolucion.valor, agente, entorno);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return [agente, resultado.valor];
}))));
