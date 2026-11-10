import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("T3-03-c1 R-5", () => {
  test("Entrada es identica en los esquemas y exige posiciones positivas y error para ilegibles", () => {
    const raiz = join(import.meta.dir, "../../esquemas/salida");
    const entradas = readdirSync(raiz).filter(n => n.endsWith(".json"))
      .map(n => JSON.parse(readFileSync(join(raiz, n), "utf8")).$defs?.Entrada).filter(Boolean);
    expect(entradas).toHaveLength(6);
    for (const entrada of entradas) {
      expect(entrada).toEqual(entradas[0]);
      expect(entrada.properties.error.properties.linea.minimum).toBe(1);
      expect(entrada.properties.error.properties.columna.minimum).toBe(1);
      expect(entrada.allOf).toContainEqual({
        if: { properties: { legibilidad: { const: "ilegible" } }, required: ["legibilidad"] },
        then: { required: ["error"] },
      });
    }
  });
});
