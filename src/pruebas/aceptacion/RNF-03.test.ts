import { describe, expect, test } from "bun:test";
import { comprobarDependencias } from "../utilidades/analisis-arquitectura";

describe("RNF-03 CA-1", () => {
  test("el analisis estatico registra cero dependencias del nucleo hacia el adaptador", async () => {
    expect((await comprobarDependencias()).filter((hallazgo) => hallazgo.archivo.startsWith("paquetes/nucleo/"))).toEqual([]);
  });
});
