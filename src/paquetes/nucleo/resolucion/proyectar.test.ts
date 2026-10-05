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
    expect(consultarAgente(resolucion, "a", "parametros.temperatura")).toEqual({ exito: true,
      valor: { valores: [{ clave: "parametros.temperatura", rastro: temperatura }], noResueltas: [] } });
  });

  test("sin clave devuelve todas las hojas del agente ordenadas, sin otros prefijos", async () => {
    const { consultarAgente } = await import("./proyectar");
    expect(consultarAgente(resolucion, "a", undefined)).toEqual({ exito: true,
      valor: { valores: [{ clave: "parametros.temperatura", rastro: temperatura }, { clave: "pasos", rastro: pasos }], noResueltas: [] } });
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

describe("Q-1", () => {
  test.each([
    { noResuelta: ["perfiles", "grupo", "a", "permiso"], agente: "a", clave: "permiso.editar" },
    { noResuelta: ["perfiles", "grupo", "a", "permiso"], agente: "a", clave: "permiso" },
    { noResuelta: ["perfiles", "grupo", "a", "permiso", "editar"], agente: "a", clave: "permiso" },
    { noResuelta: ["perfiles", "grupo", "x"], agente: "x", clave: "pasos" },
    { noResuelta: ["perfiles", "grupo", "x"], agente: "x", clave: undefined },
    { noResuelta: ["perfiles", "grupo"], agente: "a", clave: "pasos" },
    { noResuelta: ["perfiles"], agente: "a", clave: undefined },
  ])("rechaza consultas afectadas por $noResuelta con clave $clave", async ({ noResuelta, agente, clave }) => {
    const { consultarAgente } = await import("./proyectar");
    const resultado = consultarAgente({ ...resolucion, reglas: { excluida: "Esta forma queda sin resolver." },
      noResueltas: [{ ruta: noResuelta, regla: "excluida" }] }, agente, clave);
    expect(resultado).toMatchObject({ exito: false, error: { codigo: "clave-no-resuelta" } });
    if (resultado.exito) throw new Error("Se esperaba una clave no resuelta.");
    expect(resultado.error.mensaje).toContain(clave ?? agente);
    expect(resultado.error.mensaje).toContain("Esta forma queda sin resolver.");
  });

  test("una clave ajena a la no resuelta conserva su valor y rastro", async () => {
    const { consultarAgente } = await import("./proyectar");
    const noResueltas = [{ ruta: ["perfiles", "grupo", "a", "permiso"], regla: "excluida" }];
    expect(consultarAgente({ ...resolucion, noResueltas }, "a", "parametros.temperatura")).toEqual({
      exito: true, valor: { valores: [{ clave: "parametros.temperatura", rastro: temperatura }], noResueltas },
    });
  });
});

describe("Q-2", () => {
  test("sin clave conserva todas las hojas y solo las no resueltas del agente, sin coincidencias parciales", async () => {
    const { consultarAgente } = await import("./proyectar");
    const propia = { ruta: ["perfiles", "grupo", "a", "permiso"], regla: "excluida" };
    const otras = [{ ruta: ["perfiles", "grupo", "ab", "permiso"], regla: "excluida" },
      { ruta: ["global", "permiso"], regla: "excluida" }];
    expect(consultarAgente({ ...resolucion, noResueltas: [otras[0]!, propia, otras[1]!] }, "a", undefined)).toEqual({
      exito: true, valor: { valores: [{ clave: "parametros.temperatura", rastro: temperatura },
        { clave: "pasos", rastro: pasos }], noResueltas: [propia] },
    });
  });
});

describe("Q-3", () => {
  test("el adaptador ficticio devuelve claves relativas sin asumir la longitud del prefijo", async () => {
    const { consultarAgente } = await import("./proyectar");
    const { resolver } = await import("./resolver");
    const { adaptadorFicticio } = await import("../../../pruebas/utilidades/adaptador-ficticio");
    const { crearEntornoMemoria } = await import("../../../pruebas/utilidades/entorno-memoria");
    const resultado = resolver(adaptadorFicticio, "/proyecto", crearEntornoMemoria({ archivos: {
      "/proyecto/capa-b.json": '{"temperatura":0.3}', "/proyecto/capa-a.json": '{}',
    } }));
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.prefijoAgente).toEqual(["perfiles"]);
    const consulta = consultarAgente(resultado.valor, "a", "temperatura");
    if (!consulta.exito) throw new Error(consulta.error.mensaje);
    expect(consulta.valor).toEqual({ valores: [{ clave: "temperatura", rastro: resultado.valor.valores[0]! }], noResueltas: [] });
  });
});

describe("Q-4", () => {
  test("consulta un agente con solo claves pendientes y distingue claves no resueltas, inexistentes y agentes vacios", async () => {
    const { consultarAgente } = await import("./proyectar");
    const noResueltas = ["steps", "maxSteps"].map((clave) => ({
      ruta: [...resolucion.prefijoAgente, "a", clave], regla: "excluida",
    }));
    const pendiente: Resolucion = { ...resolucion, valores: [],
      reglas: { excluida: "Esta forma queda sin resolver." }, noResueltas: [
        ...noResueltas, { ruta: [...resolucion.prefijoAgente, "ab", "steps"], regla: "excluida" },
      ] };
    expect(consultarAgente(pendiente, "a", undefined)).toEqual({
      exito: true, valor: { valores: [], noResueltas },
    });
    for (const clave of ["steps", "maxSteps", "steps.extra"]) {
      expect(consultarAgente(pendiente, "a", clave)).toMatchObject({
        exito: false, error: { codigo: "clave-no-resuelta" },
      });
    }
    expect(consultarAgente(pendiente, "a", "temperature")).toMatchObject({
      exito: false, error: { codigo: "clave-inexistente" },
    });
    for (const clave of [undefined, "steps"]) {
      expect(consultarAgente(pendiente, "ausente", clave)).toMatchObject({
        exito: false, error: { codigo: "agente-sin-declaraciones" },
      });
    }
  });
});
