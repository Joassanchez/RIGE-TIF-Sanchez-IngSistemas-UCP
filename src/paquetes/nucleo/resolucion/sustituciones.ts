import type { ValorSustituidoUbicado } from "../contrato/adaptador";

export function acumularSustituciones(a?: readonly ValorSustituidoUbicado[], b?: readonly ValorSustituidoUbicado[]): readonly ValorSustituidoUbicado[] {
  return [...(a ?? []), ...(b ?? [])].sort((a, b) => a.orden - b.orden
    || a.posicion.linea - b.posicion.linea || a.posicion.columna - b.posicion.columna);
}
