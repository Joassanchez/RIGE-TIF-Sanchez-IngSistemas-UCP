import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";

const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: process.env });
const resultado = resolver(adaptadorOpenCode, process.argv[2]!, entorno);
if (!resultado.exito) throw new Error(resultado.error.mensaje);
console.log(JSON.stringify(resultado.valor));
