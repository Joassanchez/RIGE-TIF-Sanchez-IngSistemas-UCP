import { describe, expect, test } from "bun:test";
import { consultarCadenas } from "../utilidades/cadenas";

describe("RF-06 CA-2", () => {
  test("el origen de cada regla coincide con los bloques nativos y declarados del escenario", () => {
    const { cadenas, referencia } = consultarCadenas("v2-cadena");
    const extras: Record<string, number> = { build: 2, plan: 7, general: 1, explore: 11, revisor: 0 };
    const propias: Record<string, number> = { build: 1, plan: 2, general: 0, explore: 0, revisor: 1 };
    for (const [agente, cadena] of Object.entries(cadenas)) {
      expect(cadena.reglas).toHaveLength(referencia.cadenas[agente]!.length);
      const inicio = 12 + extras[agente]!;
      const fin = inicio + 5 + propias[agente]!;
      expect(cadena.reglas.map(r => r.origen.tipo)).toEqual(cadena.reglas.map((_, i) => i >= inicio && i < fin ? "declarado" : "nativo"));
      for (const regla of cadena.reglas) expect(regla.declaracion === null).toBe(regla.origen.tipo === "nativo");
    }
  });
});
