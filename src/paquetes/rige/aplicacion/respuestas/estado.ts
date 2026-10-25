import type { EstadoAlmacen } from "../puertos/almacen";
import { versionEsquemaSalida } from "./valores";

export const versionRige = "0.1.0" as const;

export interface RespuestaEstado {
  readonly esquema: typeof versionEsquemaSalida;
  readonly versionRige: typeof versionRige;
  readonly almacen: EstadoAlmacen;
}

export type RespuestaPreparacion = RespuestaEstado;

export function respuestaEstado(almacen: EstadoAlmacen): RespuestaEstado {
  return { esquema: versionEsquemaSalida, versionRige, almacen };
}
