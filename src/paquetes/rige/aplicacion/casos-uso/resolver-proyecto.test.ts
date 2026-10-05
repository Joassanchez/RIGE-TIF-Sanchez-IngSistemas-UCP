import { describe, expect, test } from "bun:test";
import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import type { PuertoResoluciones } from "../puertos/resoluciones";
import { resolver } from "@rige/nucleo/resolucion/resolver";
import { adaptadorFicticio } from "../../../../pruebas/utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../../../../pruebas/utilidades/entorno-memoria";

const instante = "2026-10-05T12:00:00.000Z";
function entorno(texto = '{"modelo":"primero"}') {
  return crearEntornoMemoria({ archivos: {
    "/canonico/capa-b.json": texto, "/canonico/capa-a.json": '{"modelo":"segundo"}',
  } });
}

function dobles() {
  const guardadas: { resolucion: Resolucion; instante: string }[] = [];
  const llamadas: string[] = [];
  const resoluciones: PuertoResoluciones = {
    guardar(resolucion, instante) {
      guardadas.push({ resolucion, instante });
      return { exito: true, valor: guardadas.length };
    },
    leer: () => { throw new Error("No corresponde leer al resolver"); },
    listar: (proyecto) => ({ exito: true, valor: guardadas.flatMap((guardada, indice) =>
      guardada.resolucion.proyecto === proyecto ? [{
        id: indice + 1, instante: guardada.instante, resumenEntradas: guardada.resolucion.resumenEntradas,
      }] : []).reverse() }),
  };
  const dependencias = {
    adaptador: adaptadorFicticio,
    entorno: entorno(),
    rutas: { canonica: (ruta: string) => { llamadas.push(ruta); return "/canonico"; } },
    resoluciones,
    reloj: { ahora: () => { llamadas.push("reloj"); return instante; } },
  };
  return { dependencias, guardadas, llamadas };
}

describe("C-1", () => {
  test.each(["", "   ", "\t\n"])("rechaza proyecto vacio %j sin llamar los puertos", async (proyecto) => {
    const { resolverProyecto } = await import("./resolver-proyecto");
    const { dependencias, guardadas, llamadas } = dobles();
    expect(resolverProyecto(dependencias, proyecto, "a", "")).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
    expect(guardadas).toEqual([]);
    expect(llamadas).toEqual([]);
  });

  test("ruta ausente conserva la ruta pedida en el mensaje", async () => {
    const { resolverProyecto } = await import("./resolver-proyecto");
    const { dependencias, guardadas } = dobles();
    expect(resolverProyecto({ ...dependencias, rutas: { canonica: () => null } }, "./no-existe", "a", "")).toEqual({
      exito: false, error: { codigo: "proyecto-inexistente", mensaje: "El proyecto ./no-existe no existe o no es un directorio." },
    });
    expect(guardadas).toEqual([]);
  });

  test.each(["proyecto-inexistente", "via-no-soportada", "contenido-no-soportado", "entrada-ilegible", "entorno-incompleto"])(
    "propaga el error de analisis %s sin guardar ni consultar el reloj", async (codigo) => {
      const { resolverProyecto } = await import("./resolver-proyecto");
      const { dependencias, guardadas, llamadas } = dobles();
      const error = { codigo, mensaje: `Corregir ${codigo}` };
      const adaptador = { ...adaptadorFicticio, ubicar: () => ({ exito: false, error } as const) };
      expect(resolverProyecto({ ...dependencias, adaptador }, "./pedido", "a", "")).toEqual({ exito: false, error });
      expect(guardadas).toEqual([]);
      expect(llamadas).toEqual(["./pedido"]);
    },
  );

  test("codigo de analisis desconocido y excepciones de infraestructura fallan visiblemente", async () => {
    const { resolverProyecto } = await import("./resolver-proyecto");
    const { dependencias } = dobles();
    const adaptador = { ...adaptadorFicticio, ubicar: () => ({ exito: false, error: { codigo: "desconocido", mensaje: "defecto" } } as const) };
    expect(() => resolverProyecto({ ...dependencias, adaptador }, "pedido", "a", "")).toThrow("Codigo de analisis desconocido");
    const falla = new Error("Falla de infraestructura");
    expect(() => resolverProyecto({ ...dependencias, rutas: { canonica: () => { throw falla; } } }, "pedido", "a", "")).toThrow(falla);
  });

  test("resuelve con el adaptador y ruta canonica, guarda con el reloj y devuelve id", async () => {
    const { resolverProyecto } = await import("./resolver-proyecto");
    const { dependencias, guardadas, llamadas } = dobles();
    const ubicadas: string[] = [];
    const adaptador = { ...adaptadorFicticio, ubicar: (proyecto: string, entornoLectura: typeof dependencias.entorno) => {
      expect(entornoLectura).toBe(dependencias.entorno);
      ubicadas.push(proyecto);
      return adaptadorFicticio.ubicar(proyecto, entornoLectura);
    } };
    expect(resolverProyecto({ ...dependencias, adaptador }, "./pedido", "a", "modelo")).toEqual({ exito: true, valor: { id: 1 } });
    const esperada = resolver(adaptadorFicticio, "/canonico", dependencias.entorno);
    if (!esperada.exito) throw new Error(esperada.error.mensaje);
    expect(guardadas).toEqual([{ resolucion: esperada.valor, instante }]);
    expect(llamadas).toEqual(["./pedido", "reloj"]);
    expect(ubicadas).toEqual(["/canonico"]);
  });

  test("propaga el error del almacén", async () => {
    const { resolverProyecto } = await import("./resolver-proyecto");
    const { dependencias } = dobles();
    const error = { codigo: "almacen-sin-esquema", mensaje: "Ejecute bun run esquema." } as const;
    expect(resolverProyecto({ ...dependencias, resoluciones: { ...dependencias.resoluciones,
      guardar: () => ({ exito: false, error }),
    } }, "pedido", "a", "")).toEqual({ exito: false, error });
  });

  test("RelojSistema entrega ISO 8601 UTC del instante actual", async () => {
    const { RelojSistema } = await import("../../adaptadores/sistema/reloj");
    const antes = Date.now();
    const ahora = new RelojSistema().ahora();
    expect(ahora).toBe(new Date(ahora).toISOString());
    expect(Date.parse(ahora)).toBeGreaterThanOrEqual(antes);
    expect(Date.parse(ahora)).toBeLessThanOrEqual(Date.now());
  });
});

describe("C-3 RF-17 CA-2", () => {
  test("cambiar una entrada produce dos ids y resumenes distintos al listar", async () => {
    const { resolverProyecto } = await import("./resolver-proyecto");
    const { dependencias } = dobles();
    let actual = entorno();
    const entornoMutable = { ...actual, leer: (ruta: string) => actual.leer(ruta) };
    expect(resolverProyecto({ ...dependencias, entorno: entornoMutable }, "pedido", "a", "")).toEqual({ exito: true, valor: { id: 1 } });
    actual = entorno('{"modelo":"modificado"}');
    expect(resolverProyecto({ ...dependencias, entorno: entornoMutable }, "pedido", "a", "")).toEqual({ exito: true, valor: { id: 2 } });
    const lista = dependencias.resoluciones.listar("/canonico");
    if (!lista.exito) throw new Error(lista.error.mensaje);
    expect(lista.valor.map(({ id }) => id)).toEqual([2, 1]);
    expect(lista.valor[0]!.resumenEntradas).not.toBe(lista.valor[1]!.resumenEntradas);
    expect(lista.valor.every(({ resumenEntradas }) => /^[0-9a-f]{64}$/.test(resumenEntradas))).toBe(true);
  });
});

describe("C-4", () => {
  test.each([["ausente", "", "agente-sin-declaraciones"], ["a", "ausente", "clave-inexistente"]])(
    "no guarda ni consulta el reloj con agente %s y clave %s", async (agente, clave, codigo) => {
      const { resolverProyecto } = await import("./resolver-proyecto");
      const { dependencias, guardadas, llamadas } = dobles();
      expect(resolverProyecto(dependencias, "pedido", agente!, clave!)).toMatchObject({ exito: false, error: { codigo } });
      expect(guardadas).toEqual([]);
      expect(llamadas).toEqual(["pedido"]);
    },
  );

  test.each(["", " \t"])("rechaza agente vacio %j antes de resolver", async (agente) => {
    const { resolverProyecto } = await import("./resolver-proyecto");
    const { dependencias, guardadas, llamadas } = dobles();
    expect(resolverProyecto(dependencias, "pedido", agente, "")).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
    expect(guardadas).toEqual([]);
    expect(llamadas).toEqual([]);
  });

  test("una clave no resuelta conserva su error y una consulta valida guarda exactamente una vez", async () => {
    const { resolverProyecto } = await import("./resolver-proyecto");
    const { dependencias, guardadas, llamadas } = dobles();
    const adaptador = { ...adaptadorFicticio, reglas: { ...adaptadorFicticio.reglas, excluida: "No se resuelve esta clave." },
      secuenciar: (lecturas: Parameters<typeof adaptadorFicticio.secuenciar>[0]) => {
        const secuencia = adaptadorFicticio.secuenciar(lecturas);
        if (!secuencia.exito) return secuencia;
        return { exito: true, valor: { ...secuencia.valor, noResueltas: [{ ruta: ["perfiles", "a", "permiso"], regla: "excluida" }] } } as const;
      },
    };
    const resultado = resolverProyecto({ ...dependencias, adaptador }, "pedido", "a", "permiso.editar");
    expect(resultado).toMatchObject({ exito: false, error: { codigo: "clave-no-resuelta", mensaje: expect.stringContaining("No se resuelve esta clave.") } });
    expect(guardadas).toEqual([]);
    expect(llamadas).toEqual(["pedido"]);
    expect(resolverProyecto({ ...dependencias, adaptador }, "pedido", "a", "modelo")).toEqual({ exito: true, valor: { id: 1 } });
    expect(guardadas).toHaveLength(1);
    expect(llamadas).toEqual(["pedido", "pedido", "reloj"]);
  });
});

describe("C-5", () => {
  test.each([
    ['  "C:\\x"  ', "C:\\x"],
    ["'  /p  '", "/p"],
    ["  /p  ", "/p"],
    ["\"' /p '\"", "' /p '"],
    ['"/p', '"/p'],
    ["/p'", "/p'"],
  ])("normaliza %j antes de canonica como %j", async (proyecto, esperado) => {
    const { resolverProyecto } = await import("./resolver-proyecto");
    const { dependencias, guardadas, llamadas } = dobles();
    expect(resolverProyecto(dependencias, proyecto!, "a", "modelo")).toEqual({ exito: true, valor: { id: 1 } });
    expect(llamadas).toEqual([esperado, "reloj"]);
    expect(guardadas).toHaveLength(1);
  });

  test.each(['"  "', "' '"])("rechaza ruta entre comillas vacia %j sin puertos", async (proyecto) => {
    const { resolverProyecto } = await import("./resolver-proyecto");
    const { dependencias, llamadas } = dobles();
    expect(resolverProyecto(dependencias, proyecto, "a", "")).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
    expect(llamadas).toEqual([]);
  });
});
