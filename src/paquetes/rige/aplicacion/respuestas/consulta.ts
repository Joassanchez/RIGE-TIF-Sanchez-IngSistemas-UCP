import type { EntradaLeida } from "@rige/nucleo/resolucion/tipos";
import type { ValorConsultado } from "@rige/nucleo/resolucion/proyectar";
import type { ClaveNoResuelta } from "@rige/nucleo/contrato/adaptador";
import type { ResumenResolucion } from "../puertos/resoluciones";
import { versionRige } from "./estado";

export type { RastroValor, DeclaracionUbicada, EntradaLeida } from "@rige/nucleo/resolucion/tipos";
export type { ValorConsultado } from "@rige/nucleo/resolucion/proyectar";
export type { ClaveNoResuelta, ValorJson } from "@rige/nucleo/contrato/adaptador";

export interface RespuestaConsulta {
  readonly esquema: 1;
  readonly versionRige: typeof versionRige;
  readonly resolucion: {
    readonly id: number;
    readonly instante: string;
    readonly proyecto: string;
    readonly herramienta: string;
    readonly versionHerramienta: string;
    readonly resumenEntradas: string;
    readonly entradas: readonly EntradaLeida[];
  };
  readonly agente: string;
  readonly clave: string | null;
  readonly valores: readonly ValorConsultado[];
  readonly reglas: Readonly<Record<string, string>>;
  /** Solo las relevantes; sus rutas se presentan relativas al agente. */
  readonly noResueltas: readonly ClaveNoResuelta[];
  readonly anteriores: readonly ResumenResolucion[];
}
