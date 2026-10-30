import { describe, expect, test } from "bun:test";
import { borrarTemporal } from "./borrar-temporal";

describe("T3-03-c1 R-9", () => {
  test("reintenta EBUSY y advierte sin excepcion al agotar los intentos", () => {
    let intentos = 0;
    const avisos: string[] = [];
    const pausas: number[] = [];
    borrarTemporal("temporal", {
      borrar: () => { if (++intentos <= 2) throw Object.assign(new Error("ocupado"), { code: "EBUSY" }); },
      esperar: ms => { pausas.push(ms); }, advertir: texto => { avisos.push(texto); },
    });
    expect(intentos).toBe(3);
    expect(pausas).toEqual([50, 50]);
    expect(avisos).toEqual([]);
    intentos = 0;
    expect(() => borrarTemporal("temporal", {
      borrar: () => { intentos++; throw Object.assign(new Error("ocupado"), { code: "EBUSY" }); },
      esperar: () => {}, advertir: texto => { avisos.push(texto); },
    })).not.toThrow();
    expect(intentos).toBe(11);
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toContain("temporal");
  });
});
