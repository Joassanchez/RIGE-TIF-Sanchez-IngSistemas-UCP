import type { EntradaLeida } from "./tipos";
import type { ValorSustituido } from "../contrato/adaptador";

export function resumirEntradas(entradas: readonly EntradaLeida[], huellas: readonly (string | null)[],
  sustituciones: readonly ValorSustituido[], resumir: (texto: string) => string): string {
  const lista: unknown[] = entradas.map(entrada => [entrada.via, entrada.referencia, entrada.condicion,
    huellas[entrada.orden] ?? null]);
  if (sustituciones.length) lista.push([...new Set(sustituciones.map(s => JSON.stringify([s.tipo, s.origen, s.definido])))].sort().map(s => JSON.parse(s)));
  return resumir(JSON.stringify(lista));
}
