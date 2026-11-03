import type { ClaveNoResuelta, ContextoResolucion, Identidad, Origen, ValorJson, ValorSustituido } from "../contrato/adaptador";

export interface ReglaCadena {
  readonly indice: number;
  readonly sujeto: string;
  readonly patron: string;
  readonly efecto: string;
  readonly origen: Origen;
  readonly declaracion: DeclaracionUbicada | null;
}

export interface Cadena {
  readonly agente: string;
  readonly reglas: readonly ReglaCadena[];
  readonly ejesParciales: readonly string[];
  readonly declaraciones: readonly string[];
  readonly advertencias: readonly string[];
}

export interface DeclaracionUbicada {
  readonly origen: Origen;
  /** Presentes solo si origen.tipo === "declarado". */
  readonly via: string | null;
  readonly referencia: string | null;
  readonly localizacion?: string;
  readonly valor: ValorJson;
  readonly regla: string;
  readonly sustituciones?: readonly ValorSustituido[];
}

export interface RastroValor {
  readonly ruta: readonly string[];
  readonly indiceFusion: number;
  readonly valor: ValorJson;
  readonly determinante: DeclaracionUbicada;
  readonly motivo: string;
  readonly desplazadas: readonly DeclaracionUbicada[];
}

/** La posicion definitiva la asigna el resolver al recorrer el arbol final. */
export type RastroEnFusion = Omit<RastroValor, "indiceFusion">;
export interface RastroEliminado extends RastroEnFusion {
  readonly ordenEliminacion: number;
  /** Declaracion que ordeno la eliminacion; determinante sigue siendo la del valor eliminado. */
  readonly eliminacion: DeclaracionUbicada;
}

export interface EntradaLeida {
  readonly orden: number;
  readonly via: string;
  readonly referencia: string;
  readonly condicion: "observada" | "no_observada" | "definida";
  readonly resumen: string | null;
  readonly legibilidad?: "legible" | "ilegible" | null;
  readonly error?: { readonly linea: number; readonly columna: number; readonly consecuencia: "falla" | "descartada" };
}

export interface Resolucion {
  readonly formato: 2;
  readonly identidad: Identidad;
  readonly proyecto: string;
  readonly prefijoAgente: readonly string[];
  readonly reglas: Readonly<Record<string, string>>;
  readonly declaraciones: readonly string[];
  readonly contexto: ContextoResolucion;
  readonly entradas: readonly EntradaLeida[];
  readonly resumenEntradas: string;
  readonly valores: readonly RastroValor[];
  readonly eliminadas: readonly RastroEliminado[];
  readonly noResueltas: readonly ClaveNoResuelta[];
}
