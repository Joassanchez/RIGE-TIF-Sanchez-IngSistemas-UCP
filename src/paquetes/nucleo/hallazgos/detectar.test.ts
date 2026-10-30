import { describe, expect, test } from "bun:test";
import { ordenarHallazgos } from "./detectar";
import type { Hallazgo } from "./tipos";

describe("T3-05 orden determinista", () => {
  test("desempata por posicion, tipo, causa y clave sin mutar la entrada", () => {
    const base: Hallazgo = { tipo: "referencia-no-resuelta", causa: "a", entrada: { orden: 0, via: "archivo", referencia: "/p/a", condicion: "observada" },
      posicion: { linea: 1, columna: 1 }, clave: ["a"], parametros: {} };
    const ordenados: Hallazgo[] = [base, { ...base, clave: ["b"] }, { ...base, causa: "b" },
      { ...base, tipo: "sustitucion-sin-valor" }, { ...base, posicion: { linea: 1, columna: 2 } },
      { ...base, posicion: { linea: 2, columna: 1 } }, { ...base, entrada: { ...base.entrada, orden: 1 } }];
    const invertidos = [...ordenados].reverse();
    expect(ordenarHallazgos(invertidos)).toEqual(ordenados);
    expect(invertidos).toEqual([...ordenados].reverse());
  });
});
