import { describe, expect, test } from "bun:test";
import type { RespuestaEstado } from "../../aplicacion/respuestas/estado";
import { errorAlmacenSinEsquema, errorConfiguracionInvalida } from "../../aplicacion/errores";
import { ejecutarCli, type Ensamblado } from "./ejecutar";

const respuesta: RespuestaEstado = {
  esquema: 1, versionRige: "0.1.0", almacen: { ruta: "/temporal/rige.db", versionEsquema: 1 },
};
const exitoso = (): Ensamblado => ({
  exito: true, valor: { prepararAlmacen: () => ({ exito: true, valor: respuesta }) },
});

function ejecutar(argumentos: readonly string[], ensamblar: () => Ensamblado = exitoso) {
  let salida = "";
  let error = "";
  const codigo = ejecutarCli(argumentos, ensamblar, {
    escribirSalida: (texto) => { salida += texto; },
    escribirError: (texto) => { error += texto; },
  });
  return { codigo, salida, error };
}

describe("CLI-1", () => {
  test("serializa la respuesta valida en una sola linea del canal de salida", () => {
    expect(ejecutar(["esquema"])).toEqual({
      codigo: 0, salida: JSON.stringify(respuesta) + "\n", error: "",
    });
  });
});

describe("CLI-2", () => {
  test("presenta errores de uso del ensamblado y del caso de uso en el canal de error", () => {
    for (const origen of ["ensamblado", "caso de uso"]) {
      const error = origen === "ensamblado"
        ? errorConfiguracionInvalida("RIGE_PUERTO", "valor de prueba")
        : errorAlmacenSinEsquema;
      const ensamblar = (): Ensamblado => origen === "ensamblado"
        ? { exito: false, error }
        : { exito: true, valor: { prepararAlmacen: () => ({ exito: false, error }) } };
      expect(ejecutar(["esquema"], ensamblar)).toEqual({
        codigo: 1, salida: "", error: JSON.stringify({ esquema: 1, error }) + "\n",
      });
    }
  });
});

describe("CLI-3", () => {
  test("rechaza argumentos invalidos sin ensamblar, incluidos errores de parseArgs", () => {
    const invalidos = [
      { argumentos: [], mencionado: "subcomando" },
      { argumentos: ["otro"], mencionado: "otro" },
      { argumentos: ["esquema", "extra"], mencionado: "extra" },
      { argumentos: ["esquema", "--x"], mencionado: "--x" },
      { argumentos: ["esquema", "--depurar=si"], mencionado: "--depurar" },
    ];
    for (const { argumentos, mencionado } of invalidos) {
      let llamadas = 0;
      const resultado = ejecutar(argumentos, () => { llamadas++; return exitoso(); });
      expect(resultado.codigo).toBe(2);
      expect(resultado.salida).toBe("");
      const error = JSON.parse(resultado.error);
      expect(error).toEqual({
        esquema: 1,
        error: { codigo: "argumentos-invalidos", mensaje: expect.stringContaining(mencionado) },
      });
      expect(resultado.error).toBe(JSON.stringify(error) + "\n");
      expect(llamadas).toBe(0);
    }
  });
});

describe("CLI-4", () => {
  test("captura fallas del ensamblado y del caso de uso sin publicar su detalle", () => {
    const falla = new Error("Detalle privado de infraestructura");
    falla.stack = "Stack privado de infraestructura";
    const ensamblados: (() => Ensamblado)[] = [
      () => { throw falla; },
      () => ({ exito: true, valor: { prepararAlmacen: () => { throw falla; } } }),
    ];
    for (const ensamblar of ensamblados) {
      expect(ejecutar(["esquema"], ensamblar)).toEqual({
        codigo: 70, salida: "",
        error: JSON.stringify({ esquema: 1, error: { codigo: "interno", mensaje: "Falla interna de RIGE." } }) + "\n",
      });
    }
  });
});

describe("CLI-5", () => {
  test("depurar agrega solo el stack interno y admite ambas posiciones", () => {
    const falla = new Error("Detalle privado de infraestructura");
    falla.stack = "Stack de prueba";
    const errorConfiguracion = errorConfiguracionInvalida("RIGE_PUERTO", "valor de prueba");
    const errorEnsamblado = (): Ensamblado => ({ exito: false, error: errorConfiguracion });
    const errorCaso = (): Ensamblado => ({
      exito: true, valor: { prepararAlmacen: () => ({ exito: false, error: errorAlmacenSinEsquema }) },
    });
    const casos = [
      { argumentos: ["esquema"], ensamblar: exitoso },
      { argumentos: ["esquema"], ensamblar: errorEnsamblado },
      { argumentos: ["esquema"], ensamblar: errorCaso },
      { argumentos: [], ensamblar: exitoso },
      { argumentos: ["otro"], ensamblar: exitoso },
      { argumentos: ["esquema", "extra"], ensamblar: exitoso },
      { argumentos: ["esquema", "--x"], ensamblar: exitoso },
      { argumentos: ["esquema", "--depurar=si"], ensamblar: exitoso },
    ];
    for (const { argumentos, ensamblar } of casos) {
      const normal = ejecutar(argumentos, ensamblar);
      expect(ejecutar(["--depurar", ...argumentos], ensamblar)).toEqual(normal);
      expect(ejecutar([...argumentos, "--depurar"], ensamblar)).toEqual(normal);
    }
    const fallas: (() => Ensamblado)[] = [
      () => { throw falla; },
      () => ({ exito: true, valor: { prepararAlmacen: () => { throw falla; } } }),
    ];
    for (const ensamblar of fallas) {
      for (const argumentos of [["--depurar", "esquema"], ["esquema", "--depurar"]]) {
        expect(ejecutar(argumentos, ensamblar)).toEqual({
          codigo: 70, salida: "",
          error: JSON.stringify({
            esquema: 1, error: { codigo: "interno", mensaje: "Falla interna de RIGE.", stack: falla.stack },
          }) + "\n",
        });
      }
    }
  });
});
