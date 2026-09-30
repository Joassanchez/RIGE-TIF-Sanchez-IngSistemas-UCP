import type { EstadoAlmacen } from "../puertos/almacen";

export interface RespuestaPreparacion {
  readonly esquema: 1;
  readonly versionRige: "0.1.0";
  readonly almacen: EstadoAlmacen;
}
