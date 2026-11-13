import { describe, expect, test } from "bun:test";
import type { PuertoAlmacen } from "../puertos/almacen";
import { errorAlmacenSinEsquema, errorConfiguracionInvalida } from "../errores";
import { consultarEstado, describirAlmacen } from "./consultar-estado";
import { prepararAlmacen } from "./preparar-almacen";
import { versionRige } from "../respuestas/estado";

describe("E-1", () => {
  test("consulta el estado compatible sin preparar el almacen", () => {
    let llamadas = 0;
    const estado = { ruta: "/temporal/rige.db", versionEsquema: 1 };
    const almacen: PuertoAlmacen = {
      consultar: () => { llamadas++; return { exito: true, valor: estado }; },
      preparar: () => { throw new Error("No debe preparar"); },
    };
    const resultado = consultarEstado(almacen);
    expect(resultado).toEqual({
      exito: true,
      valor: { esquema: 2, versionRige, almacen: estado },
    });
    if (!resultado.exito) throw new Error("Se esperaba estado compatible");
    expect(resultado.valor.almacen).toBe(estado);
    expect(llamadas).toBe(1);
  });
});

describe("E-2", () => {
  test("conserva el rechazo del puerto y la indicacion de preparar el esquema", () => {
    const rechazo = { exito: false as const, error: errorAlmacenSinEsquema };
    const almacen: PuertoAlmacen = {
      consultar: () => rechazo,
      preparar: () => { throw new Error("No debe preparar"); },
    };
    expect(consultarEstado(almacen)).toBe(rechazo);
    expect(rechazo.error.mensaje).toContain("bun run esquema");
  });
});

describe("E-3", () => {
  test("propaga la excepcion de consulta sin convertirla en error de uso", () => {
    const falla = new Error("Infraestructura de prueba");
    const almacen: PuertoAlmacen = {
      consultar: () => { throw falla; },
      preparar: () => { throw new Error("No debe preparar"); },
    };
    expect(() => consultarEstado(almacen)).toThrow(falla);
  });
});

describe("E-4", () => {
  test("preparacion y consulta presentan el mismo estado", () => {
    const estado = { ruta: "/temporal/rige.db", versionEsquema: 1 };
    const almacen: PuertoAlmacen = {
      consultar: () => ({ exito: true, valor: estado }),
      preparar: () => ({ exito: true, valor: estado }),
    };
    expect(consultarEstado(almacen)).toEqual(prepararAlmacen(almacen));
  });
});

describe("S-7", () => {
  test("describirAlmacen: inexistente -> existe false, sin esquema -> versionEsquema null, otro error se propaga", () => {
    const ruta = "/temporal/rige.db";
    const almacenNoLlamado: PuertoAlmacen = {
      consultar: () => { throw new Error("No debe consultar si no existe"); },
      preparar: () => { throw new Error("No debe preparar"); },
    };
    const inexistente = describirAlmacen(almacenNoLlamado, { ruta, existe: () => false });
    expect(inexistente).toEqual({
      exito: true,
      valor: { esquema: 2, almacen: { ruta, existe: false, versionEsquema: null } },
    });

    const almacenSinEsquema: PuertoAlmacen = {
      consultar: () => ({ exito: false, error: errorAlmacenSinEsquema }),
      preparar: () => { throw new Error("No debe preparar"); },
    };
    const sinEsquema = describirAlmacen(almacenSinEsquema, { ruta, existe: () => true });
    expect(sinEsquema).toEqual({
      exito: true,
      valor: { esquema: 2, almacen: { ruta, existe: true, versionEsquema: null } },
    });

    const otroError = errorConfiguracionInvalida("RIGE_PUERTO", "abc");
    const almacenConOtroError: PuertoAlmacen = {
      consultar: () => ({ exito: false, error: otroError }),
      preparar: () => { throw new Error("No debe preparar"); },
    };
    expect(describirAlmacen(almacenConOtroError, { ruta, existe: () => true })).toEqual({
      exito: false,
      error: otroError,
    });

    const almacenOk: PuertoAlmacen = {
      consultar: () => ({ exito: true, valor: { ruta, versionEsquema: 2 } }),
      preparar: () => { throw new Error("No debe preparar"); },
    };
    expect(describirAlmacen(almacenOk, { ruta, existe: () => true })).toEqual({
      exito: true,
      valor: { esquema: 2, almacen: { ruta, existe: true, versionEsquema: 2 } },
    });
  });
});
