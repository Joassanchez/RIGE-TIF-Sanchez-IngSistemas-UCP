import type { EntornoLectura } from "../contrato/entorno";
import type { EntradaLeida } from "./tipos";

export function resumirEntradas(entradas: readonly EntradaLeida[], entorno: EntornoLectura): string {
  return entorno.resumir(JSON.stringify(entradas.map(entrada => [entrada.via, entrada.referencia, entrada.condicion,
    entrada.condicion === "definida" ? entorno.resumir(entorno.variable(entrada.referencia)!) : entrada.resumen])));
}
