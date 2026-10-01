import type { Resultado } from "@rige/nucleo/resultado";
import type { ErrorUso } from "../errores";

export { errorAlmacenSinEsquema, errorAlmacenIncompatible } from "../errores";

// El adaptador de sistema aporta la lectura de existencia sin crear archivos.
export interface PuertoExistenciaAlmacen {
  existe(ruta: string): boolean;
}

export interface EstadoAlmacen {
  readonly ruta: string;
  readonly versionEsquema: number;
}

export interface PuertoAlmacen {
  preparar(): Resultado<EstadoAlmacen, ErrorUso>;
  // Consultar puede crear los auxiliares -wal y -shm de SQLite dentro del almacen.
  // No crea el directorio ni la base y no modifica el esquema ni los datos.
  consultar(): Resultado<EstadoAlmacen, ErrorUso>;
}
