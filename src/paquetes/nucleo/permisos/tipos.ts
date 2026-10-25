import type { ReglaCadena } from "../resolucion/tipos";

export interface ConsultaPermiso { readonly sujeto: string; readonly objetivo: string }
export interface EvaluacionPermiso {
  readonly determinante: number | null;
  readonly coincidentes: readonly number[];
}
export interface PoliticaDecision {
  readonly ordenEfectos: readonly string[];
  readonly efectoPorDefecto: string;
  readonly declaraciones: readonly string[];
}
export interface Permisos extends PoliticaDecision {
  evaluar(reglas: readonly ReglaCadena[], sujeto: string, objetivo: string, plataforma: string): EvaluacionPermiso;
}
export interface RastroDecision {
  readonly agente: string;
  readonly consulta: ConsultaPermiso & { readonly objetivoEvaluado: string | null };
  readonly decision: string | null;
  readonly motivoSinDecision: string | null;
  readonly coincidentes: readonly ReglaCadena[];
  readonly determinante: number | null;
  readonly desplazadas: readonly number[];
  readonly nativaAnulada: { readonly regla: number; readonly por: number } | null;
  readonly advertencias: readonly string[];
  readonly declaraciones: readonly string[];
}
