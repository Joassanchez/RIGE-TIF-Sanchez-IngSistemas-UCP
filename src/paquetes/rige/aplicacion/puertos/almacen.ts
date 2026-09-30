import type { Resultado } from "../../../nucleo/resultado";
import type { ErrorUso } from "../errores";

export interface EstadoAlmacen {
  readonly ruta: string;
  readonly versionEsquema: number;
}

export interface PuertoAlmacen {
  preparar(): Resultado<EstadoAlmacen, ErrorUso>;
  consultar(): Resultado<EstadoAlmacen, ErrorUso>;
}
