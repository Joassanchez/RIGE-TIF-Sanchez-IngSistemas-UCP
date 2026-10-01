import type { EstadoAlmacen } from "../puertos/almacen";

export const versionRige = "0.1.0" as const;

export interface RespuestaEstado {
  readonly esquema: 1;
  readonly versionRige: typeof versionRige;
  readonly almacen: EstadoAlmacen;
}

export type RespuestaPreparacion = RespuestaEstado;

export function respuestaEstado(almacen: EstadoAlmacen): RespuestaEstado {
  return { esquema: 1, versionRige, almacen };
}
