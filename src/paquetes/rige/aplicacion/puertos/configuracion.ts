import type { Resultado } from "../../../nucleo/resultado";
import type { ErrorUso } from "../errores";

export interface ConfiguracionRige {
  readonly puerto: number;
  readonly directorioAlmacen: string;
}

export interface PuertoConfiguracion {
  leer(): Resultado<ConfiguracionRige, ErrorUso>;
}
