import type { Hallazgo } from "@rige/nucleo/hallazgos/tipos";
import type { EntradaLeida } from "@rige/nucleo/resolucion/tipos";

export interface RespuestaHallazgos {
  readonly esquema: 2;
  readonly proyecto: string;
  readonly resumenEntradas: string;
  readonly entradas: readonly EntradaLeida[];
  readonly incompleta: boolean;
  readonly motivos: readonly string[];
  readonly hallazgos: readonly (Hallazgo & { readonly explicacion: string })[];
  readonly declaraciones: readonly string[];
  readonly reglas: Readonly<Record<string, string>>;
}
