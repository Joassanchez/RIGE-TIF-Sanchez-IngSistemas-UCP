import { describe, expect, test } from "bun:test";
import type { Resolucion, RastroValor } from "@rige/nucleo/resolucion/tipos";
import type { AgenteEfectivo, ValorJson } from "@rige/nucleo/contrato/adaptador";
import { adaptadorFicticio } from "../../../../pruebas/utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../../../../pruebas/utilidades/entorno-memoria";
import { resolver } from "../../../../pruebas/utilidades/resolver";
import { errorResolucionInexistente } from "../errores";
import type { PuertoResoluciones } from "../puertos/resoluciones";

const no = (): never => { throw new Error("Consulta ajena o lectura del entorno actual"); };
const entorno = crearEntornoMemoria({ archivos: {} });
function foto(): Resolucion {
  const r = resolver(adaptadorFicticio, "/proyecto", crearEntornoMemoria({ archivos: {
    "/proyecto/capa-b.json": '{"x":1}', "/proyecto/capa-a.json": '{}',
  } }));
  if (!r.exito) throw new Error(r.error.mensaje);
  return r.valor;
}
function valor(ruta: string[], dato: ValorJson, cambios: Partial<RastroValor> = {}): RastroValor {
  const base = foto().valores.find(v => v.ruta[0] === "perfiles")!;
  return { ...base, ruta: ["perfiles", "a", ...ruta], valor: dato, ...cambios };
}
function dependencias(desde: Resolucion, hasta: Resolucion, listar = adaptadorFicticio.listarAgentes) {
  const leidos: number[] = [];
  const resoluciones: PuertoResoluciones = { guardar: no, listar: no, listarProyectosRecientes: no,
    leer: id => {
      leidos.push(id);
      const resolucion = id === 1 ? desde : id === 2 ? hasta : undefined;
      return resolucion ? { exito: true, valor: { id, instante: `foto-${id}`, resolucion } }
        : { exito: false, error: errorResolucionInexistente(id) };
    } };
  return { leidos, resoluciones, adaptador: { ...adaptadorFicticio, listarAgentes: listar, contexto: no },
    rutas: { canonica: no }, entorno: { ...entorno, leer: no, variable: no, tipo: no, real: no, listar: no, examinar: no } };
}
async function comparar(desde: Resolucion, hasta: Resolucion, listar = adaptadorFicticio.listarAgentes) {
  const { compararResoluciones } = await import("./comparar-resoluciones");
  const r = compararResoluciones(dependencias(desde, hasta, listar), "1", "2");
  if (!r.exito) throw new Error(r.error.mensaje);
  return r.valor;
}

describe("T5-14 K-1", () => {
  test("rutas ambiguas, altas, bajas, valor y procedencia; orden por segmentos sin locale", async () => {
    const base = foto();
    const x = valor(["x"], 1);
    const antes = { ...base, valores: [valor(["a.b"], 0), valor(["a", "b"], 1), x, valor(["quitada"], true)] };
    const despues = { ...base, valores: [valor(["nueva"], false), valor(["a", "b"], 2), valor(["a.b"], 0),
      { ...x, determinante: { ...x.determinante, via: "externa", referencia: "/otro hogar/config.json" } }] };
    const r = await comparar(antes, despues);
    expect(r.esquema).toBe(2);
    expect(r.agentes).toEqual({ agregados: [], quitados: [], comunes: ["a"], inciertos: [] });
    const a = r.comparaciones[0]!;
    expect(a.resumen).toEqual({ cambiadas: 2, agregadas: 1, quitadas: 1, sinCambio: 1 });
    expect(a.cambios.map(c => [c.ruta, c.tipo, c.motivos])).toEqual([
      [["a", "b"], "cambiada", ["valor"]], [["nueva"], "agregada", []],
      [["quitada"], "quitada", []], [["x"], "cambiada", ["procedencia"]],
    ]);
    expect(a.cambios.at(-1)!.despues!.determinante.localizacion).toBe("/otro hogar/config.json:1:2");
    expect(a.cambios.at(-1)!.antes!.determinante.via).toBe("capa-b");
  });
  test("objetos independientes de orden, arreglos ordenados; ignora indices y desplazadas", async () => {
    const base = foto(), x = valor(["x"], { b: 1, a: 2 });
    const modificado = { ...x, valor: { a: 2, b: 1 }, indiceFusion: 999,
      determinante: { ...x.determinante, origen: { ...x.determinante.origen, orden: 999 } }, desplazadas: [x.determinante] } as RastroValor;
    const r = await comparar({ ...base, valores: [x, valor(["lista"], [1, 2])] },
      { ...base, valores: [modificado, valor(["lista"], [2, 1])] });
    expect(r.comparaciones[0]!.resumen).toEqual({ cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 1 });
    const implicito = { ...x.determinante, origen: { tipo: "implicito" as const, regla: "base" }, via: null, referencia: null };
    const nativo = { ...implicito, origen: { tipo: "nativo" as const, regla: "base" } };
    const cambio = await comparar({ ...base, valores: [valor(["x"], 1, { determinante: implicito })] },
      { ...base, valores: [valor(["x"], 1, { determinante: nativo })] });
    expect(cambio.comparaciones[0]!.cambios[0]!.motivos).toEqual(["procedencia"]);
    expect(cambio.comparaciones[0]!.cambios[0]!.despues!.determinante).not.toHaveProperty("localizacion");
  });
  test("direccion e identidad de proyecto guardada, ids seguros antes de leer, errores y excepciones", async () => {
    const { compararResoluciones } = await import("./comparar-resoluciones");
    const base = foto(), deps = dependencias(base, base);
    for (const id of ["", "0", "-1", "+1", "1e2", "1.2", " 1", "1\n", "9007199254740992"]) {
      for (const [a, b] of [[id, "2"], ["1", id]])
        expect(compararResoluciones(deps, a!, b!)).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
    }
    expect(deps.leidos).toEqual([]);
    expect(compararResoluciones(deps, "1", "999")).toMatchObject({ exito: false, error: { codigo: "resolucion-inexistente" } });
    expect(compararResoluciones(dependencias(base, { ...base, proyecto: "/otro" }), "1", "2"))
      .toMatchObject({ exito: false, error: { codigo: "resoluciones-de-otro-proyecto" } });
    const igual = compararResoluciones(deps, "1", "1");
    expect(igual).toMatchObject({ exito: true, valor: { resumen: { cambiadas: 0, agregadas: 0, quitadas: 0 } } });
    const inversa = compararResoluciones(dependencias({ ...base, valores: [] }, base), "2", "1");
    expect(inversa).toMatchObject({ exito: true, valor: { resumen: { quitadas: 1, agregadas: 0 } } });
    expect(() => compararResoluciones({ ...deps, resoluciones: { ...deps.resoluciones, leer: no } }, "1", "2")).toThrow();
  });
  test("agentes del adaptador: nativos, disable, no observado e inventario incompleto", async () => {
    const base = foto();
    const agente = (nombre: string, estado: AgenteEfectivo["estado"] = "activo"): AgenteEfectivo =>
      ({ nombre, estado, origen: "nativo", modo: "all", oculto: false, motivo: null });
    const desde = { ...base, declaraciones: ["antes"] };
    const r = await comparar(desde, base, resolucion => resolucion === desde
      ? { agentes: [agente("a"), agente("b"), agente("incierto", "no-observado"), agente("baja")], motivos: [] }
      : { agentes: [agente("a"), agente("b", "deshabilitado"), agente("incierto"), agente("nuevo")], motivos: [] });
    expect(r.agentes).toEqual({ comunes: ["a"], agregados: ["nuevo"], quitados: ["b", "baja"], inciertos: ["incierto"] });
    expect(r.parcial).toBe(true);
    const parcial = await comparar(desde, base, resolucion => resolucion === desde
      ? { agentes: [agente("a")], motivos: ["inventario-no-observado"] }
      : { agentes: [agente("a"), agente("nuevo")], motivos: [] });
    expect(parcial.agentes.agregados).toEqual([]);
    expect(parcial.agentes.inciertos).toEqual(["nuevo"]);
    expect(parcial.desde.motivosAgentes).toEqual(["inventario-no-observado"]);
  });
  test("rutas no resueltas excluyen altas, bajas e iguales; sustituciones solo protegidas", async () => {
    const base = foto();
    const antes = { ...base, valores: [valor(["options", "x"], 1), valor(["igual"], 1)],
      noResueltas: [{ ruta: ["perfiles", "a", "options"], regla: "protegida" }] };
    const r = await comparar(antes, { ...base, valores: [valor(["options", "y"], 2), valor(["igual"], 1)] });
    expect(r.parcial).toBe(true);
    expect(r.desde.noComparables).toEqual(antes.noResueltas);
    expect(r.comparaciones[0]!.resumen).toEqual({ cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 1 });
    expect(r.sustituciones).toBe("solo-representacion-protegida");
    const raiz = await comparar({ ...base, noResueltas: [{ ruta: ["perfiles"], regla: "incompleta" }] }, base);
    expect(raiz.resumen.sinCambio).toBe(0);
  });
});

describe("T6-18 propagacion de error de contexto guardado", () => {
  test("devuelve ErrorUso en lugar de lanzar excepcion cuando prepararAnalisis falla", async () => {
    const { compararResoluciones } = await import("./comparar-resoluciones");
    const base = foto();
    const invalida: Resolucion = { ...base, contexto: { ...base.contexto, plataforma: "" } };
    for (const [desde, hasta] of [[invalida, base], [base, invalida]] as const) {
      expect(compararResoluciones(dependencias(desde, hasta), "1", "2")).toMatchObject({
        exito: false,
        error: { codigo: "almacen-sin-esquema" },
      });
    }
    const sinHogar = dependencias(base, base);
    const rechazo = {
      ...sinHogar,
      adaptador: {
        ...sinHogar.adaptador,
        restaurarContexto: () => ({
          exito: false as const,
          error: { categoria: "uso" as const, codigo: "almacen-sin-esquema", mensaje: "Falta hogar." },
        }),
      },
    };
    expect(compararResoluciones(rechazo, "1", "2")).toEqual({
      exito: false,
      error: { codigo: "almacen-sin-esquema", mensaje: "Falta hogar." },
    });
  });
});

describe("T6-19 compararUltimasResoluciones y consultarProyectosRecientes --proyecto", () => {
  test("H-4: compara los dos ultimos analisis del proyecto y falla con analisis-insuficientes si hay menos de 2", async () => {
    const { compararUltimasResoluciones } = await import("./comparar-resoluciones");
    const base = foto();
    const sinProyecto = compararUltimasResoluciones({
      ...dependencias(base, base),
      rutas: { canonica: () => null },
    }, "/no-existe");
    expect(sinProyecto).toMatchObject({ exito: false, error: { codigo: "proyecto-inexistente" } });

    for (const cantidad of [0, 1]) {
      const deps = dependencias(base, base);
      const insuf = compararUltimasResoluciones({
        ...deps,
        rutas: { canonica: () => "/proyecto" },
        resoluciones: {
          ...deps.resoluciones,
          listar: () => ({
            exito: true,
            valor: cantidad === 0 ? [] : [{ id: 1, instante: "foto-1", resumenEntradas: "a" }],
          }),
        },
      }, "/proyecto");
      expect(insuf).toMatchObject({ exito: false, error: { codigo: "analisis-insuficientes" } });
    }

    const deps = dependencias(base, base);
    const ok = compararUltimasResoluciones({
      ...deps,
      rutas: { canonica: () => "/proyecto" },
      resoluciones: {
        ...deps.resoluciones,
        listar: () => ({
          exito: true,
          // listar devuelve mas reciente primero: [2] es hasta, [1] es desde
          valor: [
            { id: 2, instante: "foto-2", resumenEntradas: "r2" },
            { id: 1, instante: "foto-1", resumenEntradas: "r1" },
            { id: 99, instante: "foto-0", resumenEntradas: "r0" },
          ],
        }),
      },
    }, "/proyecto");
    expect(ok.exito).toBe(true);
    if (!ok.exito) return;
    expect(ok.valor.desde.id).toBe(1);
    expect(ok.valor.hasta.id).toBe(2);
    expect(deps.leidos).toEqual([1, 2]);
  });

  test("H-3: consultarProyectosRecientes con proyecto canoniza, devuelve esquema 2 y propaga errores", async () => {
    const { consultarProyectosRecientes } = await import("./consultar-proyectos-recientes");
    const deps = dependencias(foto(), foto());
    const inexistente = consultarProyectosRecientes(deps.resoluciones, { canonica: () => null }, "/ausente");
    expect(inexistente).toMatchObject({ exito: false, error: { codigo: "proyecto-inexistente" } });

    const analisis = [
      { id: 4, instante: "2026-02-02T00:00:00Z", resumenEntradas: "h4" },
      { id: 2, instante: "2026-01-01T00:00:00Z", resumenEntradas: "h2" },
    ];
    const ok = consultarProyectosRecientes(
      { ...deps.resoluciones, listar: p => ({ exito: true, valor: p === "/canonico" ? analisis : [] }) },
      { canonica: () => "/canonico" },
      " ./relativo ",
    );
    expect(ok).toEqual({
      exito: true,
      valor: { esquema: 2, proyecto: "/canonico", analisis },
    });
  });
});
