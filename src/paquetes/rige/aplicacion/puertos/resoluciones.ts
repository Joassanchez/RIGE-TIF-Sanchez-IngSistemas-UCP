import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import type { Resultado } from "@rige/nucleo/resultado";
import type { ErrorUso } from "../errores";

export { errorResolucionInexistente } from "../errores";

export interface ResumenResolucion {
  readonly id: number;
  readonly instante: string;
  readonly resumenEntradas: string;
}

export interface ResolucionGuardada {
  readonly id: number;
  readonly instante: string;
  readonly resolucion: Resolucion;
}

export interface ProyectoReciente {
  readonly proyecto: string;
  readonly id: number;
  readonly instante: string;
  readonly cantidad: number;
}

export interface PuertoResoluciones {
  guardar(resolucion: Resolucion, instante: string): Resultado<number, ErrorUso>;
  leer(id: number): Resultado<ResolucionGuardada, ErrorUso>;
  listar(proyecto: string): Resultado<readonly ResumenResolucion[], ErrorUso>;
  listarProyectosRecientes(): Resultado<readonly ProyectoReciente[], ErrorUso>;
}

export interface PuertoReloj { ahora(): string }
export interface PuertoRutas { canonica(ruta: string): string | null }
