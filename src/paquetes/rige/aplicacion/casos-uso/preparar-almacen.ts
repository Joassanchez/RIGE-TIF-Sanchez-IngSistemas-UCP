import type { PuertoAlmacen } from "../puertos/almacen";
import type { Resultado } from "../../../nucleo/resultado";
import type { ErrorUso } from "../errores";
import type { RespuestaPreparacion } from "../respuestas/estado";

export function prepararAlmacen(almacen: PuertoAlmacen): Resultado<RespuestaPreparacion, ErrorUso> {
  const resultado = almacen.preparar();
  if (!resultado.exito) return resultado;
  return {
    exito: true,
    valor: { esquema: 1, versionRige: "0.1.0", almacen: resultado.valor },
  };
}
