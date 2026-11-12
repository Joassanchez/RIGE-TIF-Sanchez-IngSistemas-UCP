import type { EstadoAlmacen } from "../puertos/almacen";
import { versionEsquemaSalida } from "./valores";

export const versionRige = "1.0.0" as const;

export interface RespuestaEstado {
  readonly esquema: typeof versionEsquemaSalida;
  readonly versionRige: typeof versionRige;
  readonly almacen: EstadoAlmacen;
}

export type RespuestaPreparacion = RespuestaEstado;

// Contrato propio del comando estado, ya publicado en esquemas/salida/estado.json.
export interface RespuestaEstadoCli {
  readonly esquema: typeof versionEsquemaSalida;
  readonly almacen: { readonly ruta: string; readonly existe: boolean; readonly versionEsquema: number | null };
}

export function respuestaEstado(almacen: EstadoAlmacen): RespuestaEstado {
  return { esquema: versionEsquemaSalida, versionRige, almacen };
}
