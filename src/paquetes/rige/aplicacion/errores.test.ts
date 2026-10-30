import { describe, expect, test } from "bun:test";
import { errorDesdeAnalisis } from "./errores";
import { ejecutarCli, type Ensamblado } from "../interfaces/cli/ejecutar";

describe("S-4 ADR-058", () => {
  test.each([
    { categoria: "uso", codigo: "nuevo-del-adaptador", esperado: 1 },
    { categoria: undefined, codigo: "entrada-ilegible", esperado: 70 },
    { categoria: "interna", codigo: "entrada-ilegible", esperado: 70 },
  ])("categoria $categoria y codigo $codigo salen con $esperado", ({ categoria, codigo, esperado }) => {
    const error = { categoria, codigo, mensaje: "Error del adaptador" };
    let salida = "";
    let diagnostico = "";
    const ensamblar = (): Ensamblado => ({ exito: false, error: errorDesdeAnalisis(error) });
    const resultado = ejecutarCli(["esquema"], ensamblar, {
      escribirSalida: texto => { salida += texto; }, escribirError: texto => { diagnostico += texto; },
    });
    expect(resultado).toBe(esperado);
    expect(salida).toBe("");
    expect(JSON.parse(diagnostico).error.codigo).toBe(esperado === 1 ? codigo : "interno");
  });
});
