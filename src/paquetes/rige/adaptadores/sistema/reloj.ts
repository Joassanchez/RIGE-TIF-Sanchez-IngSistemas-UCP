import type { PuertoReloj } from "../../aplicacion/puertos/resoluciones";

export class RelojSistema implements PuertoReloj {
  ahora(): string {
    return new Date().toISOString();
  }
}
