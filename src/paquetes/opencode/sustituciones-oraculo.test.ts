import { describe, expect, test } from "bun:test";
import { resumenesExpandidos } from "./sustituciones-oraculo";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";

describe("T3-04 R-10 oraculo", () => {
  test("solo devuelve resumenes JSON de hojas, incluidos escapes, trim y claves con puntos", () => {
    const e = crearEntornoMemoria({ archivos: { "/p/a": " \n MARCA-ORACULO \n " }, variables: { X: "\\t" } });
    const r = resumenesExpandidos({ via: "proyecto", referencia: "/p/config.json", condicion: "observada" },
      '{"agent":{"x":{"description":"a{env:X}b","prompt":"{file:./a}","options":{"a.b":[1,"{env:X}"]}}}}', e,
      { proyecto: "/p", parametros: { hogar: "/h" } });
    expect(r).toEqual({ exito: true, valor: {
      '["agent","x","description"]': e.resumir(JSON.stringify("a\tb")),
      '["agent","x","prompt"]': e.resumir(JSON.stringify("MARCA-ORACULO")),
      '["agent","x","options","a.b"]': e.resumir(JSON.stringify([1, "\t"])),
    } });
    expect(JSON.stringify(r)).not.toContain("MARCA-ORACULO");
  });
});
