import type { EntradaLeida, ReglaCadena } from "@rige/nucleo/resolucion/tipos";
import type { RastroDecision } from "@rige/nucleo/permisos/tipos";
import type { versionEsquemaSalida } from "./valores";

export interface RespuestaPermiso extends Omit<RastroDecision, "coincidentes"> {
  readonly esquema: typeof versionEsquemaSalida;
  readonly proyecto: string;
  readonly entradas: readonly EntradaLeida[];
  readonly resumenEntradas: string;
  readonly cadena: readonly ReglaCadena[];
  readonly reglas: Readonly<Record<string, string>>;
}
