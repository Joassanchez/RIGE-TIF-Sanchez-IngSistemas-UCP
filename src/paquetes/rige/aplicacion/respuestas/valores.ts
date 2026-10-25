import type { ClaveNoResuelta } from "@rige/nucleo/contrato/adaptador";
import type { EntradaLeida } from "@rige/nucleo/resolucion/tipos";
import type { ValorConsultado } from "@rige/nucleo/resolucion/proyectar";

export const versionEsquemaSalida = 2 as const;
export type { DeclaracionUbicada, EntradaLeida, RastroValor } from "@rige/nucleo/resolucion/tipos";
export type { ValorConsultado } from "@rige/nucleo/resolucion/proyectar";
export type { ClaveNoResuelta, ValorJson } from "@rige/nucleo/contrato/adaptador";

export interface RespuestaValores {
  readonly esquema: typeof versionEsquemaSalida;
  readonly versionRige: string;
  readonly proyecto: string;
  readonly herramienta: string;
  readonly versionHerramienta: string;
  readonly resumenEntradas: string;
  readonly entradas: readonly EntradaLeida[];
  readonly agente: string;
  readonly ruta: readonly string[] | null;
  readonly valores: readonly ValorConsultado[];
  readonly reglas: Readonly<Record<string, string>>;
  readonly noResueltas: readonly ClaveNoResuelta[];
  readonly motivo: string | null;
}
