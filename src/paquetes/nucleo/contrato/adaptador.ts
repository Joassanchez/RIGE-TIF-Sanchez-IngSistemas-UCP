import type { Resultado } from "../resultado";
import type { Estrategia } from "../resolucion/estrategias";
import type { EntornoLectura } from "./entorno";
import type { Cadena, Resolucion } from "../resolucion/tipos";
import type { Permisos } from "../permisos/tipos";

export type ValorJson = null | boolean | number | string | readonly ValorJson[] | { readonly [clave: string]: ValorJson };
export interface Posicion { readonly linea: number; readonly columna: number }
export interface Identidad { readonly herramienta: string; readonly version: string }

export interface ViaUbicada {
  readonly via: string;
  readonly referencia: string;
  readonly condicion: "observada" | "no_observada";
  /** Nombre del elemento que la via declara por completo. */
  readonly elemento?: string;
}

export interface Declaracion {
  readonly ruta: readonly string[];
  readonly valor: ValorJson;
  readonly posicion: Posicion;
}

export interface LecturaEntrada {
  readonly orden: number;
  readonly via: ViaUbicada;
  readonly declaraciones: readonly Declaracion[];
}

export type Origen =
  | { readonly tipo: "declarado"; readonly orden: number; readonly posicion: Posicion }
  | { readonly tipo: "implicito"; readonly regla: string }
  | { readonly tipo: "nativo"; readonly regla: string };

export interface Aplicacion {
  readonly origen: Origen;
  readonly ruta: readonly string[];
  readonly valor: ValorJson;
  readonly estrategia: string;
  readonly regla: string;
}

export interface ClaveNoResuelta { readonly ruta: readonly string[]; readonly regla: string }

export interface Secuencia {
  readonly aplicaciones: readonly Aplicacion[];
  readonly noResueltas: readonly ClaveNoResuelta[];
}

export interface ErrorAnalisis { readonly categoria: "uso"; readonly codigo: string; readonly mensaje: string }

export interface Adaptador {
  readonly permisos: Permisos;
  readonly identidad: Identidad;
  readonly prefijoAgente: readonly string[];
  readonly reglas: Readonly<Record<string, string>>;
  readonly estrategias: Readonly<Record<string, Estrategia>>;
  ubicar(proyecto: string, entorno: EntornoLectura): Resultado<readonly ViaUbicada[], ErrorAnalisis>;
  leer(via: ViaUbicada, texto: string): Resultado<readonly Declaracion[], ErrorAnalisis>;
  secuenciar(lecturas: readonly LecturaEntrada[]): Resultado<Secuencia, ErrorAnalisis>;
  cadena(resolucion: Resolucion, agente: string, entorno: EntornoLectura, lanzadoPor?: string): Resultado<Cadena, ErrorAnalisis>;
}
