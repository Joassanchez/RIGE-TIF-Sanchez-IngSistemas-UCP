import { describe, expect, test } from "bun:test";
import { win32 } from "node:path";
import { comparar, marcadorRelativoRaiz, normalizarRutas } from "./comparar";

describe("T2-19 R-4", () => {
  const rutas = { parse: win32.parse,
    relative: (desde: string, hasta: string) => win32.relative(win32.resolve("Z:\\", desde), hasta) };
  test("el marcador usa la unidad de la copia aunque el proceso este en Z:", () => {
    expect(marcadorRelativoRaiz("C:\\t\\copia\\proyecto", "C:\\t\\copia\\hogar", rutas)).toBe("t\\copia\\hogar");
  });
  test("falla explicitamente si hogar y copia estan en unidades distintas", () => {
    expect(() => marcadorRelativoRaiz("D:\\t\\copia\\proyecto", "C:\\t\\copia\\hogar", rutas)).toThrow("misma unidad");
  });
});

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
  test("T2-08 plan sin VCS conserva la ruta relativa a / con marcador propio", () => {
    expect(normalizarRutas([{ pattern: "Users/Joa/temporal/hogar/opencode/plans/*.md" }], {
      data: "C:/Users/Joa/temporal/hogar/opencode", hogar: "C:/Users/Joa/temporal/hogar", tmp: "C:/tmp",
      "hogar-relativo-raiz": "Users/Joa/temporal/hogar",
    })).toEqual([{ pattern: "<hogar-relativo-raiz>/opencode/plans/*.md" }]);
  });
});
