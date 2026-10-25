import type { Adaptador, ContextoConsulta } from "../../paquetes/nucleo/contrato/adaptador";
import type { EntornoLectura } from "../../paquetes/nucleo/contrato/entorno";
import { resolver as resolverNucleo } from "../../paquetes/nucleo/resolucion/resolver";

/** Ensamblado de prueba: prepara explicitamente el contexto antes del motor. */
export function resolver(adaptador: Adaptador, proyecto: string, entorno: EntornoLectura, contexto?: ContextoConsulta) {
  const preparado = contexto ? { exito: true as const, valor: contexto } : adaptador.contexto(proyecto, entorno);
  return preparado.exito ? resolverNucleo(adaptador, proyecto, entorno, preparado.valor) : preparado;
}
