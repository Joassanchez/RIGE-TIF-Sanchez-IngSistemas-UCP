import type { PuertoAlmacen } from "../puertos/almacen";
import type { Resultado } from "@rige/nucleo/resultado";
import type { ErrorUso } from "../errores";
import { respuestaEstado, type RespuestaEstado } from "../respuestas/estado";

export type ConsultarEstado = () => Resultado<RespuestaEstado, ErrorUso>;

export function consultarEstado(almacen: PuertoAlmacen): Resultado<RespuestaEstado, ErrorUso> {
  const resultado = almacen.consultar();
  if (!resultado.exito) return resultado;
  return {
    exito: true,
    valor: respuestaEstado(resultado.valor),
  };
}
