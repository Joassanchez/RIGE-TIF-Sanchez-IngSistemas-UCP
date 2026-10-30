import { describe, expect, test } from "bun:test";
import { acumularSustituciones } from "./sustituciones";

describe("T3-04-c1 R-8 acumulacion", () => {
  test("acumula sin mutar y ordena por entrada, linea y columna", () => {
    const s = (orden: number, linea: number, columna: number) => ({ orden, referencia: "/a", tipo: "variable" as const,
      origen: "X", definido: true, posicion: { linea, columna } });
    const a = [s(2, 1, 1)];
    const b = [s(1, 2, 3), s(1, 1, 2), s(1, 1, 1)];
    expect(acumularSustituciones(a, b)).toEqual([b[2]!, b[1]!, b[0]!, a[0]!]);
    expect(a).toHaveLength(1);
    expect(b[0]!.posicion.linea).toBe(2);
    expect(acumularSustituciones(undefined, undefined)).toEqual([]);
  });
});
