import type { Posicion } from "../contrato/adaptador";

export type TipoHallazgo = "entrada-ilegible" | "entrada-descartada" | "sustitucion-sin-valor"
  | "referencia-no-resuelta" | "regla-sin-efecto" | "elemento-sin-uso";
export interface EntradaHallazgo {
  readonly orden: number;
  readonly via: string;
  readonly referencia: string;
  readonly condicion: "observada" | "definida";
}
export interface Hallazgo {
  readonly tipo: TipoHallazgo;
  readonly causa: string;
  readonly entrada: EntradaHallazgo;
  readonly posicion: Posicion;
  readonly clave: readonly string[] | null;
  readonly parametros: Readonly<Record<string, string>>;
}
