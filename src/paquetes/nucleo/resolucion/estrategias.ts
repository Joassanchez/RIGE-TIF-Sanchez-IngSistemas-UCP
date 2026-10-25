import type { DeclaracionUbicada, RastroEnFusion } from "./tipos";

export interface EstadoFusion {
  obtener(ruta: readonly string[]): RastroEnFusion | undefined;
  hojasBajo(ruta: readonly string[]): readonly RastroEnFusion[];
  fijar(ruta: readonly string[], rastro: RastroEnFusion): void;
  /** Vacia el contenido, conservando la posicion de la clave. */
  vaciarBajo(ruta: readonly string[]): readonly RastroEnFusion[];
  eliminarBajo(ruta: readonly string[]): readonly RastroEnFusion[];
  registrarEliminadas(rastros: readonly RastroEnFusion[], causa: DeclaracionUbicada): void;
}
export type Estrategia = (estado: EstadoFusion, nueva: DeclaracionUbicada, ruta: readonly string[]) => void;

export const reemplazo: Estrategia = (estado, nueva, ruta) => {
  const anterior = estado.obtener(ruta);
  estado.fijar(ruta, { ruta, valor: nueva.valor, determinante: nueva, motivo: "entrada-posterior",
    desplazadas: anterior ? [...anterior.desplazadas, anterior.determinante] : [] });
};

export const reemplazoSubarbol: Estrategia = (estado, nueva, ruta) => {
  const anteriores = estado.vaciarBajo(ruta);
  estado.fijar(ruta, { ruta, valor: nueva.valor, determinante: nueva, motivo: "entrada-posterior",
    desplazadas: [...new Set(anteriores.flatMap(r => [...r.desplazadas, r.determinante]))] });
};

export const eliminacion: Estrategia = (estado, nueva, ruta) => {
  estado.registrarEliminadas(estado.eliminarBajo(ruta), nueva);
};

export const biblioteca: Readonly<Record<string, Estrategia>> = { reemplazo, reemplazoSubarbol, eliminacion };
