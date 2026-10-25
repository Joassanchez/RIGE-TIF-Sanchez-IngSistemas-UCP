import type { Resultado } from "../resultado";
import type { Estrategia } from "../resolucion/estrategias";
import type { EntornoLectura } from "./entorno";
import type { Cadena, DeclaracionUbicada, Resolucion } from "../resolucion/tipos";
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

export interface AgenteListado {
  readonly nombre: string;
  readonly origen: "nativo" | "declarado";
  readonly modo: string;
  readonly oculto: boolean;
}

export interface AgenteEfectivo extends AgenteListado {
  readonly estado: "activo" | "deshabilitado" | "no-observado";
  readonly motivo: string | null;
  readonly eliminacion?: DeclaracionUbicada;
}
export interface ListadoAgentes {
  readonly agentes: readonly AgenteEfectivo[];
  readonly motivos: readonly string[];
}
export interface ContextoConsulta { readonly proyecto: string; readonly entorno: EntornoLectura; readonly declaraciones?: readonly string[] }
export type SolicitudPermiso = ({ readonly sujeto: string; readonly herramienta?: never }
  | { readonly herramienta: string; readonly sujeto?: never }) & { readonly objetivo: string; readonly lanzadoPor?: string | undefined };

export interface Secuencia {
  readonly aplicaciones: readonly Aplicacion[];
  readonly noResueltas: readonly ClaveNoResuelta[];
}

export interface ErrorAnalisis { readonly categoria: "uso"; readonly codigo: string; readonly mensaje: string }

export interface ObjetivoPermiso {
  readonly sujeto: string;
  readonly objetivoEvaluado: string;
  readonly motivoSinDecision: string | null;
  readonly advertencias?: readonly string[];
}

export interface Adaptador<C extends ContextoConsulta = ContextoConsulta> {
  readonly permisos: Permisos;
  readonly identidad: Identidad;
  readonly prefijoAgente: readonly string[];
  readonly reglas: Readonly<Record<string, string>>;
  readonly estrategias: Readonly<Record<string, Estrategia>>;
  contexto(proyecto: string, entorno: EntornoLectura): Resultado<C, ErrorAnalisis>;
  ubicar(proyecto: string, entorno: EntornoLectura, contexto: C): Resultado<readonly ViaUbicada[], ErrorAnalisis>;
  leer(via: ViaUbicada, texto: string): Resultado<readonly Declaracion[], ErrorAnalisis>;
  secuenciar(lecturas: readonly LecturaEntrada[]): Resultado<Secuencia, ErrorAnalisis>;
  cadena(resolucion: Resolucion, agente: string, contexto: C, lanzadoPor?: string): Resultado<Cadena, ErrorAnalisis>;
  prepararConsulta(contexto: C, solicitud: SolicitudPermiso): Resultado<ObjetivoPermiso, ErrorAnalisis>;
  listarAgentes(resolucion: Resolucion, contexto: C): ListadoAgentes;
}
