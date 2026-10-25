import { describe, expect, test } from "bun:test";
import { adaptadorFicticio } from "../../../../pruebas/utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../../../../pruebas/utilidades/entorno-memoria";

const dependencias = () => ({
  adaptador: adaptadorFicticio,
  entorno: crearEntornoMemoria({ archivos: {
    "/proyecto/capa-b.json": '{"modelo":"primero","a.b":true}',
    "/proyecto/capa-a.json": '{"modelo":"segundo"}',
  } }),
  rutas: { canonica: () => "/proyecto" },
});

describe("T2-02 consulta en memoria", () => {
  test("conserva segmentos de un puntero JSON y omitir clave consulta todas", async () => {
    const { consultarValores } = await import("./consultar-valores");
    const deps = dependencias();
    const todas = consultarValores(deps, "pedido", "a", undefined);
    expect(todas).toMatchObject({ exito: true, valor: { esquema: 2, ruta: null, motivo: null } });
    if (!todas.exito) throw new Error(todas.error.mensaje);
    expect(todas.valor.valores.map(v => v.clave)).toEqual(["modelo", "a.b"]);
    const puntual = consultarValores(deps, "pedido", "a", "/a.b");
    expect(puntual).toMatchObject({ exito: true, valor: { ruta: ["a.b"], motivo: null } });
    if (!puntual.exito) throw new Error(puntual.error.mensaje);
    expect(puntual.valor.valores).toEqual([todas.valor.valores[1]!]);
  });

  test.each(["", " \t"])("agente vacio %j se rechaza antes de leer", async (agente) => {
    const { consultarValores } = await import("./consultar-valores");
    expect(consultarValores({ ...dependencias(), rutas: { canonica: () => { throw new Error("No leer"); } } },
      "pedido", agente, undefined)).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
  });

  test("clave invalida y agente inexistente son errores de uso; clave ausente es exito", async () => {
    const { consultarValores } = await import("./consultar-valores");
    const deps = dependencias();
    expect(consultarValores(deps, "pedido", "a", "/~2")).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
    expect(consultarValores(deps, "pedido", "ausente", undefined)).toMatchObject({ exito: false, error: { codigo: "agente-sin-declaraciones" } });
    expect(consultarValores(deps, "pedido", "a", "ausente")).toMatchObject({ exito: true, valor: { valores: [], motivo: "clave-inexistente" } });
  });
});
