import { describe, expect, test } from "bun:test";
import { comparar, normalizarRutas } from "./comparar";

describe("T2-05 K-4 comparacion profunda y sensibilidad", () => {
  test("conserva orden de reglas y rechaza el intercambio de dos declaraciones", () => {
    const reglas = [{ permission: "bash", pattern: "*", action: "ask" }, { permission: "bash", pattern: "git *", action: "allow" }];
    expect(comparar({ reglas }, { reglas: structuredClone(reglas) })).toEqual([]);
    expect(comparar({ reglas }, { reglas: reglas.toReversed() })).toHaveLength(1);
    expect(comparar({ reglas }, { reglas: [...reglas, reglas[0]] })).toHaveLength(1);
  });
  test("normaliza hogar, data y tmp con ambos separadores y respeta limites de ruta", () => {
    expect(normalizarRutas([{ pattern: "C:\\hogar\\opencode\\tool-output\\*" }, { pattern: "C:/temp/opencode/*" }, { pattern: "C:\\hogar\\x" }, { pattern: "C:/hogares/x" }],
      { data: "C:/hogar/opencode", tmp: "C:\\temp\\opencode", hogar: "C:\\hogar" })).toEqual([
      { pattern: "<data>/tool-output/*" }, { pattern: "<tmp>/*" }, { pattern: "<hogar>/x" }, { pattern: "C:/hogares/x" },
    ]);
  });
});
