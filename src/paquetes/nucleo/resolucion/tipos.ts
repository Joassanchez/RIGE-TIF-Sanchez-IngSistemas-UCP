import type { ClaveNoResuelta, Identidad, Posicion, ValorJson } from "../contrato/adaptador";

export interface DeclaracionUbicada {
  readonly orden: number;
  readonly via: string;
  readonly referencia: string;
  readonly posicion: Posicion;
  readonly valor: ValorJson;
  readonly regla: string;
}

export interface RastroValor {
  readonly ruta: readonly string[];
  readonly valor: ValorJson;
  readonly determinante: DeclaracionUbicada;
  readonly motivo: string;
  readonly desplazadas: readonly DeclaracionUbicada[];
}

export interface EntradaLeida {
  readonly orden: number;
  readonly via: string;
  readonly referencia: string;
  readonly condicion: "observada" | "no_observada";
  readonly resumen: string | null;
}

export interface Resolucion {
  readonly formato: 1;
  readonly identidad: Identidad;
  readonly proyecto: string;
  readonly prefijoAgente: readonly string[];
  readonly reglas: Readonly<Record<string, string>>;
  readonly entradas: readonly EntradaLeida[];
  readonly resumenEntradas: string;
  readonly valores: readonly RastroValor[];
  readonly noResueltas: readonly ClaveNoResuelta[];
}
