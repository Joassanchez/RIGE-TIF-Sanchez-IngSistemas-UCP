import { describe, expect, test } from "bun:test";
import { comprobarDependencias, comprobarIdentificaciones } from "../utilidades/analisis-arquitectura";

describe("RNF-03 CA-1", () => {
  test("el analisis estatico registra cero dependencias del nucleo hacia el adaptador", async () => {
    expect((await comprobarDependencias()).filter((hallazgo) => hallazgo.archivo.startsWith("paquetes/nucleo/"))).toEqual([]);
  });
});

describe("RNF-03 CA-2", () => {
  test("ninguna identificacion de la herramienta aparece en el codigo original del nucleo", async () => {
    expect(await comprobarIdentificaciones()).toEqual([]);
  });
});
