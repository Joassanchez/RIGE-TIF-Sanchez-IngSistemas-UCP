import type { PuertoAlmacen, PuertoExistenciaAlmacen } from "../puertos/almacen";
import type { Resultado } from "@rige/nucleo/resultado";
import type { ErrorUso } from "../errores";
import { respuestaEstado, type RespuestaEstado, type RespuestaEstadoCli } from "../respuestas/estado";
import { versionEsquemaSalida } from "../respuestas/valores";

export type ConsultarEstado = () => Resultado<RespuestaEstado, ErrorUso>;

export interface UbicacionAlmacen { readonly ruta: string; readonly existe: PuertoExistenciaAlmacen["existe"] }

export function consultarEstado(almacen: PuertoAlmacen): Resultado<RespuestaEstado, ErrorUso> {
  const resultado = almacen.consultar();
  if (!resultado.exito) return resultado;
  return {
    exito: true,
    valor: respuestaEstado(resultado.valor),
  };
}

export function describirAlmacen(almacen: PuertoAlmacen, ubicacion: UbicacionAlmacen): Resultado<RespuestaEstadoCli, ErrorUso> {
  const existe = ubicacion.existe(ubicacion.ruta);
  const resultado = existe ? almacen.consultar() : null;
  if (resultado && !resultado.exito && resultado.error.codigo !== "almacen-sin-esquema") return resultado;
  return {
    exito: true,
    valor: {
      esquema: versionEsquemaSalida,
      almacen: {
        ruta: ubicacion.ruta,
        existe,
        versionEsquema: resultado?.exito ? resultado.valor.versionEsquema : null,
      },
    },
  };
}
