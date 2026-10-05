import { describe, expect, test } from "bun:test";
import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import { resolver } from "@rige/nucleo/resolucion/resolver";
import { consultarAgente } from "@rige/nucleo/resolucion/proyectar";
import type { PuertoResoluciones, ResumenResolucion } from "../puertos/resoluciones";
import { versionRige } from "../respuestas/estado";
import { adaptadorFicticio } from "../../../../pruebas/utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../../../../pruebas/utilidades/entorno-memoria";

const instante = "2026-10-05T12:00:00.000Z";
function dobles() {
  const resultado = resolver(adaptadorFicticio, "/proyecto", crearEntornoMemoria({ archivos: {
    "/proyecto/capa-b.json": '{"modelo":"primero","pasos":12}',
    "/proyecto/capa-a.json": '{"modelo":"segundo"}',
  } }));
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  const resolucion: Resolucion = { ...resultado.valor, reglas: { ...resultado.valor.reglas, excluida: "No resuelta" },
    noResueltas: [{ ruta: ["perfiles", "a", "permiso"], regla: "excluida" },
      { ruta: ["perfiles", "otro", "privada"], regla: "excluida" }, { ruta: ["global"], regla: "excluida" }] };
  const anteriores: readonly ResumenResolucion[] = [{ id: 7, instante, resumenEntradas: resolucion.resumenEntradas },
    { id: 6, instante: "2026-10-04T00:00:00.000Z", resumenEntradas: "a".repeat(64) }];
  const llamadas: (string | number)[] = [];
  const puerto: PuertoResoluciones = {
    guardar: () => { throw new Error("Consultar no guarda ni resuelve"); },
    leer: (id) => { llamadas.push(id); return { exito: true, valor: { id, instante, resolucion } }; },
    listar: (proyecto) => { llamadas.push(proyecto); return { exito: true, valor: anteriores }; },
  };
  return { puerto, resolucion, anteriores, llamadas };
}

describe("C-2", () => {
  test.each(["", "0", "-1", "+1", "1.5", "1e2", "0x10", "1a", " 1", "1 ", "1\n", "NaN", "Infinity", "9007199254740993"])(
    "rechaza id que no representa un entero positivo decimal seguro: %j", async (id) => {
      const { consultarResolucion } = await import("./consultar-resolucion");
      const { puerto, llamadas } = dobles();
      expect(consultarResolucion(puerto, id, "a", "")).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
      expect(llamadas).toEqual([]);
    },
  );

  test.each(["", " \t"])("rechaza agente vacio %j antes de leer", async (agente) => {
    const { consultarResolucion } = await import("./consultar-resolucion");
    const { puerto, llamadas } = dobles();
    expect(consultarResolucion(puerto, "7", agente, "")).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
    expect(llamadas).toEqual([]);
  });

  test.each(["", "modelo"])("proyecta la consulta desde el documento guardado con clave %j", async (clave) => {
    const { consultarResolucion } = await import("./consultar-resolucion");
    const { puerto, resolucion, anteriores, llamadas } = dobles();
    const proyeccion = consultarAgente(resolucion, "a", clave || undefined);
    if (!proyeccion.exito) throw new Error(proyeccion.error.mensaje);
    expect(consultarResolucion(puerto, "7", "a", clave)).toEqual({ exito: true, valor: {
      esquema: 1, versionRige,
      resolucion: { id: 7, instante, proyecto: "/proyecto", herramienta: "ficticia", versionHerramienta: "1",
        resumenEntradas: resolucion.resumenEntradas, entradas: resolucion.entradas },
      agente: "a", clave: clave || null, valores: proyeccion.valor.valores, reglas: resolucion.reglas,
      noResueltas: [{ ruta: ["permiso"], regla: "excluida" }], anteriores,
    } });
    expect(llamadas).toEqual([7, "/proyecto"]);
  });

  test("propaga sin cambios un error del nucleo sin listar", async () => {
    const agente = "a";
    const clave = "ausente";
    const { consultarResolucion } = await import("./consultar-resolucion");
    const { puerto, resolucion, llamadas } = dobles();
    const esperado = consultarAgente(resolucion, agente, clave || undefined);
    if (esperado.exito) throw new Error("Se esperaba un error de consulta");
    expect(consultarResolucion(puerto, "7", agente, clave)).toEqual(esperado);
    expect(llamadas).toEqual([7]);
  });

  test("propaga errores de leer y listar sin fabricar una respuesta", async () => {
    const { consultarResolucion } = await import("./consultar-resolucion");
    const { puerto, llamadas } = dobles();
    const inexistente = { codigo: "resolucion-inexistente", mensaje: "No existe la resolucion 7 en el almacen." } as const;
    expect(consultarResolucion({ ...puerto, leer: () => ({ exito: false, error: inexistente }) }, "7", "a", ""))
      .toEqual({ exito: false, error: inexistente });
    expect(llamadas).toEqual([]);
    const sinEsquema = { codigo: "almacen-sin-esquema", mensaje: "Ejecute bun run esquema." } as const;
    expect(consultarResolucion({ ...puerto, listar: () => ({ exito: false, error: sinEsquema }) }, "7", "a", ""))
      .toEqual({ exito: false, error: sinEsquema });
    expect(llamadas).toEqual([7]);
  });

  test("las excepciones del repositorio se propagan al borde", async () => {
    const { consultarResolucion } = await import("./consultar-resolucion");
    const { puerto } = dobles();
    const falla = new Error("Infraestructura");
    expect(() => consultarResolucion({ ...puerto, leer: () => { throw falla; } }, "7", "a", "")).toThrow(falla);
  });
});
