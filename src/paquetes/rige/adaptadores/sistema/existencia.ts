import { existsSync } from "node:fs";
import type { PuertoExistenciaAlmacen } from "../../aplicacion/puertos/almacen";

export class ExistenciaSistema implements PuertoExistenciaAlmacen {
  existe(ruta: string): boolean {
    return existsSync(ruta);
  }
}
