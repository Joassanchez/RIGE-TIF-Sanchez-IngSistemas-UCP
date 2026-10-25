import type { ResumenResolucion } from "../puertos/resoluciones";

export interface SobreAlmacen {
  readonly id: number;
  readonly instante: string;
  readonly anteriores: readonly ResumenResolucion[];
}
