import type { DeclaracionUbicada, RastroValor } from "./tipos";

export type Estrategia = (anterior: RastroValor | undefined, nueva: DeclaracionUbicada, ruta: readonly string[]) => RastroValor;

export const reemplazo: Estrategia = (anterior, nueva, ruta) => ({
  ruta,
  valor: nueva.valor,
  determinante: nueva,
  motivo: "entrada-posterior",
  desplazadas: anterior ? [...anterior.desplazadas, anterior.determinante] : [],
});

export const biblioteca: Readonly<Record<string, Estrategia>> = { reemplazo };
