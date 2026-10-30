import type { EntornoLectura } from "../contrato/entorno";
import type { EntradaLeida } from "./tipos";
import type { ValorSustituido } from "../contrato/adaptador";

export function resumirEntradas(entradas: readonly EntradaLeida[], entorno: EntornoLectura, sustituciones: readonly ValorSustituido[] = []): string {
  const lista: unknown[] = entradas.map(entrada => [entrada.via, entrada.referencia, entrada.condicion,
    entrada.condicion === "definida" ? entorno.resumir(entorno.variable(entrada.referencia)!) : entrada.resumen]);
  if (sustituciones.length) lista.push([...new Set(sustituciones.map(s => JSON.stringify([s.tipo, s.origen, s.definido])))].sort().map(s => JSON.parse(s)));
  return entorno.resumir(JSON.stringify(lista));
}
