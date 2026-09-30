import { describe, expect, test } from "bun:test";
import type { PuertoAlmacen } from "../puertos/almacen";
import { errorAlmacenSinEsquema } from "../errores";
import { prepararAlmacen } from "./preparar-almacen";

describe("T0-09 preparacion por puerto en memoria", () => {
  test("devuelve una respuesta unica y determinista sin consultar otro puerto", () => {
    let llamadas = 0;
    const estado = { ruta: "/temporal/rige.db", versionEsquema: 1 };
    const almacen: PuertoAlmacen = {
      preparar: () => { llamadas++; return { exito: true, valor: estado }; },
      consultar: () => { throw new Error("No debe consultar"); },
    };
    const esperado = {
      exito: true,
      valor: { esquema: 1, versionRige: "0.1.0", almacen: estado },
    } as const;
    expect(prepararAlmacen(almacen)).toEqual(esperado);
    expect(prepararAlmacen(almacen)).toEqual(esperado);
    expect(llamadas).toBe(2);
  });

  test("conserva el error de uso del puerto sin envolverlo ni inventar estado", () => {
    const rechazo = { exito: false as const, error: errorAlmacenSinEsquema };
    const almacen: PuertoAlmacen = {
      preparar: () => rechazo,
      consultar: () => { throw new Error("No debe consultar"); },
    };
    expect(prepararAlmacen(almacen)).toBe(rechazo);
  });

  test("propaga la excepcion de infraestructura sin convertirla en error de uso", () => {
    const falla = new Error("Infraestructura de prueba");
    const almacen: PuertoAlmacen = {
      preparar: () => { throw falla; },
      consultar: () => { throw new Error("No debe consultar"); },
    };
    expect(() => prepararAlmacen(almacen)).toThrow(falla);
  });
});
