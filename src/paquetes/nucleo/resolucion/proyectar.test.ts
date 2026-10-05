import { describe, expect, test } from "bun:test";
import type { Resolucion, RastroValor } from "./tipos";

const rastro = (ruta: readonly string[], valor: number): RastroValor => ({
  ruta, valor,
  determinante: { orden: 0, via: "capa-a", referencia: "/entrada.json", posicion: { linea: 1, columna: 1 }, valor, regla: "orden" },
  motivo: "entrada-posterior", desplazadas: [],
});
const temperatura = rastro(["perfiles", "grupo", "a", "parametros", "temperatura"], 0.3);
const pasos = rastro(["perfiles", "grupo", "a", "pasos"], 12);
const resolucion: Resolucion = {
  formato: 1, identidad: { herramienta: "ficticia", version: "1" }, proyecto: "/proyecto",
  prefijoAgente: ["perfiles", "grupo"], reglas: { orden: "Orden." }, entradas: [], resumenEntradas: "",
  valores: [temperatura, pasos, rastro(["perfiles", "grupo", "ab", "pasos"], 4), rastro(["otro", "a", "pasos"], 8)], noResueltas: [],
};

describe("N-8", () => {
  test("con clave relativa partida por puntos devuelve solo el rastro exacto", async () => {
    const { consultarAgente } = await import("./proyectar");
    expect(consultarAgente(resolucion, "a", "parametros.temperatura")).toEqual({ exito: true, valor: [temperatura] });
  });

  test("sin clave devuelve todas las hojas del agente ordenadas, sin otros prefijos", async () => {
    const { consultarAgente } = await import("./proyectar");
    expect(consultarAgente(resolucion, "a", undefined)).toEqual({ exito: true, valor: [temperatura, pasos] });
  });

  test.each(["inexistente", "parametros", "parametros.temperatura.extra"])("la clave ausente %s produce clave-inexistente", async (clave) => {
    const { consultarAgente } = await import("./proyectar");
    const resultado = consultarAgente(resolucion, "a", clave);
    expect(resultado.exito).toBe(false);
    if (resultado.exito) throw new Error("Se esperaba un error.");
    expect(resultado.error.codigo).toBe("clave-inexistente");
    expect(resultado.error.mensaje).toContain(clave);
  });

  test.each([undefined, "pasos"])("sin hojas del agente informa agente-sin-declaraciones (clave %s)", async (clave) => {
    const { consultarAgente } = await import("./proyectar");
    const resultado = consultarAgente(resolucion, "ausente", clave);
    expect(resultado.exito).toBe(false);
    if (resultado.exito) throw new Error("Se esperaba un error.");
    expect(resultado.error.codigo).toBe("agente-sin-declaraciones");
    expect(resultado.error.mensaje).toContain("ausente");
  });

  test("clave une la ruta con puntos", async () => {
    const { clave } = await import("./proyectar");
    expect(clave(["perfiles", "a", "parametros", "temperatura"])).toBe("perfiles.a.parametros.temperatura");
  });
});
