import { describe, expect, test } from "bun:test";
import { exclusionValor } from "./exclusiones-valores";

describe("T5-04 W-3 exclusiones aplicadas por comparador", () => {
  test("no extiende una exclusion a otro escenario, agente, clave o comparador", () => {
    expect(exclusionValor("RNF-02", "v2-cadena", "revisor", "name")).toContain("declarado");
    expect(exclusionValor("RNF-06", "v1-vias", "build", "steps")).toContain("maxSteps");
    expect(exclusionValor("RNF-02", "v1-vias", "build", "steps")).toBeUndefined();
    expect(exclusionValor("RNF-06", "v1-precedencia", "build", "steps")).toBeUndefined();
    expect(exclusionValor("RNF-06", "v1-vias", "plan", "steps")).toBeUndefined();
    expect(exclusionValor("RNF-02", "v2-cadena", "build", "name")).toBeUndefined();
    expect(exclusionValor("RNF-02", "v2-cadena", "revisor", "description")).toBeUndefined();
  });
});
