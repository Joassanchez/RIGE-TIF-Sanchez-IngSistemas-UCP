import type { PuertoAlmacen } from "../puertos/almacen";
import type { Resultado } from "@rige/nucleo/resultado";
import type { ErrorUso } from "../errores";
import { respuestaEstado, type RespuestaPreparacion } from "../respuestas/estado";

export function prepararAlmacen(almacen: PuertoAlmacen): Resultado<RespuestaPreparacion, ErrorUso> {
  const resultado = almacen.preparar();
  if (!resultado.exito) return resultado;
  return {
    exito: true,
    valor: respuestaEstado(resultado.valor),
  };
}
