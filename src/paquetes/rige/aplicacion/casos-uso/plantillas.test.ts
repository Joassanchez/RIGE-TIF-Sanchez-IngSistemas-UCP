import { describe, expect, it } from "bun:test";
import { plantillasDe } from "./plantillas";

describe("plantillasDe", () => {
  it("D-2: con códigos repetidos y desordenados devuelve claves únicas ordenadas", () => {
    const adaptador = {
      reglas: {
        B: "Plantilla B",
        A: "Plantilla A",
        C: "Plantilla C",
      },
    };
    const resultado = plantillasDe(adaptador, ["C", "A", "B", "A", "C"]);
    expect(Object.keys(resultado)).toEqual(["A", "B", "C"]);
    expect(resultado).toEqual({
      A: "Plantilla A",
      B: "Plantilla B",
      C: "Plantilla C",
    });
  });

  it("D-2: con un código sin plantilla lanza Error con el código faltante", () => {
    const adaptador = {
      reglas: {
        A: "Plantilla A",
      },
    };
    expect(() => plantillasDe(adaptador, ["A", "FALTA"])).toThrow("Regla sin plantilla: FALTA");
  });
});
