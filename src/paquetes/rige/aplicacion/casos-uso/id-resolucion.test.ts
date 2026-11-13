import { describe, expect, it } from "bun:test";
import { esIdResolucion } from "./id-resolucion";

describe("esIdResolucion", () => {
  it("D-3: acepta enteros positivos decimales válidos", () => {
    expect(esIdResolucion("1")).toBe(true);
    expect(esIdResolucion("42")).toBe(true);
  });

  it("D-3: rechaza cadenas vacías, ceros, negativos, flotantes, notación científica, espacios y números fuera de rango seguro", () => {
    expect(esIdResolucion("")).toBe(false);
    expect(esIdResolucion("0")).toBe(false);
    expect(esIdResolucion("-1")).toBe(false);
    expect(esIdResolucion("1.0")).toBe(false);
    expect(esIdResolucion("1e3")).toBe(false);
    expect(esIdResolucion(" 1")).toBe(false);
    expect(esIdResolucion("9007199254740993")).toBe(false);
  });
});
