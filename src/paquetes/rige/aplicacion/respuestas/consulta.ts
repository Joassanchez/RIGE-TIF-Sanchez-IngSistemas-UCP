import type { RespuestaValores } from "./valores";
import type { SobreAlmacen } from "./sobre";

export interface RespuestaConsulta {
  readonly respuesta: RespuestaValores;
  readonly sobre: SobreAlmacen;
}
