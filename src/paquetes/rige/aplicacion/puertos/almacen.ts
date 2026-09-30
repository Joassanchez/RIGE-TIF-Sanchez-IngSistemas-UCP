import type { Resultado } from "../../../nucleo/resultado";
import type { ErrorUso } from "../errores";

export { errorAlmacenSinEsquema } from "../errores";

// El adaptador de sistema aportara esta lectura; consultar nunca crea archivos.
export interface PuertoExistenciaAlmacen {
  existe(ruta: string): boolean;
}

export interface EstadoAlmacen {
  readonly ruta: string;
  readonly versionEsquema: number;
}

export interface PuertoAlmacen {
  preparar(): Resultado<EstadoAlmacen, ErrorUso>;
  consultar(): Resultado<EstadoAlmacen, ErrorUso>;
}
