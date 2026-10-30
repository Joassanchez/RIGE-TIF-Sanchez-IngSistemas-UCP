import { describe, expect, test } from "bun:test";
import type { Adaptador, Aplicacion, Secuencia } from "../contrato/adaptador";
import { crearEntornoMemoria } from "../../../pruebas/utilidades/entorno-memoria";
import { resolver } from "../../../pruebas/utilidades/resolver";
import * as proyeccion from "./proyectar";
import { adaptadorFicticio } from "../../../pruebas/utilidades/adaptador-ficticio";

const declarada = (ruta: readonly string[], valor: number, orden: number): Aplicacion => ({
  origen: { tipo: "declarado", orden, posicion: { linea: 1, columna: 1 } },
  ruta, valor, estrategia: "reemplazo", regla: "ultima",
});
function resolverSecuencia(secuencia: Secuencia, cantidad = 0) {
  const adaptador: Adaptador = {
    contexto: adaptadorFicticio.contexto,
    prepararConsulta: adaptadorFicticio.prepararConsulta,
    listarAgentes: adaptadorFicticio.listarAgentes,
    permisos: adaptadorFicticio.permisos,
    identidad: { herramienta: "ficticia", version: "1" }, prefijoAgente: ["agent"],
    reglas: { ultima: "Ultima aplicacion.", base: "Valor de base.", derivada: "Valor derivado." }, estrategias: {},
    ubicar: () => ({ exito: true, valor: Array.from({ length: cantidad }, (_, orden) => ({
      via: `capa-${orden}`, referencia: `/capa-${orden}`, condicion: "observada" as const,
    })) }),
    leer: () => ({ exito: true, valor: [] }),
    secuenciar: () => ({ exito: true, valor: secuencia }),
    cadena: adaptadorFicticio.cadena,
  };
  const resultado = resolver(adaptador, "/proyecto", crearEntornoMemoria({
    archivos: Object.fromEntries(Array.from({ length: cantidad }, (_, orden) => [`/capa-${orden}`, "{}"])),
  }));
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}

describe("C1-1", () => {
  test("nativo e implicito conservan origen sin consultar entradas", () => {
    const origenes = [{ tipo: "nativo", regla: "base" }, { tipo: "implicito", regla: "derivada" }] as const;
    const resolucion = resolverSecuencia({ aplicaciones: origenes.map((origen) => ({
      origen, ruta: [origen.tipo], valor: 7, estrategia: "reemplazo", regla: origen.regla,
    })), noResueltas: [] });
    expect(resolucion.entradas).toEqual([]);
    expect(resolucion.valores.map(({ determinante }) => determinante)).toEqual(origenes.map((origen) => ({
      origen, via: null, referencia: null, valor: 7, regla: origen.regla,
    })));
  });
  test("una entrada declarada inexistente sigue siendo un defecto interno", () => {
    expect(() => resolverSecuencia({ aplicaciones: [declarada(["x"], 1, 8)], noResueltas: [] }))
      .toThrow("Entrada inexistente");
  });
});

describe("C1-2 RD-02", () => {
  test("la primera declaracion fija la posicion y la ultima fija el valor", () => {
    const { valores } = resolverSecuencia({ aplicaciones: [declarada(["a", "z"], 1, 0),
      declarada(["a", "b"], 2, 1), declarada(["a", "z"], 3, 2)], noResueltas: [] }, 3);
    expect(valores.map(({ ruta, indiceFusion, valor }) => ({ ruta, indiceFusion, valor }))).toEqual([
      { ruta: ["a", "z"], indiceFusion: 0, valor: 3 }, { ruta: ["a", "b"], indiceFusion: 1, valor: 2 },
    ]);
    expect(valores[0]?.determinante.origen).toMatchObject({ tipo: "declarado", orden: 2 });
  });
});

describe("C1-3", () => {
  test("los valores y las pendientes siguen su primera aparicion, con deduplicacion", () => {
    const { valores, noResueltas } = resolverSecuencia({
      aplicaciones: [declarada(["z"], 1, 0), declarada(["a"], 2, 0)],
      noResueltas: ["z", "a", "z"].map((nombre) => ({ ruta: [nombre], regla: "ultima" })),
    }, 1);
    expect(valores.map(({ ruta, indiceFusion }) => [ruta, indiceFusion])).toEqual([[["z"], 0], [["a"], 1]]);
    expect(noResueltas.map(({ ruta }) => ruta)).toEqual([["z"], ["a"]]);
  });
});

describe("C1-4", () => {
  test("las claves hermanas conservan el orden del objeto declarado", () => {
    const objeto = JSON.parse('{"z":1,"a":2}') as Record<string, number>;
    const { valores } = resolverSecuencia({ aplicaciones: Object.entries(objeto).map(([nombre, valor]) =>
      declarada([nombre], valor, 0)), noResueltas: [] }, 1);
    expect(valores.map(({ ruta }) => ruta)).toEqual([["z"], ["a"]]);
  });
});

describe("C1-5", () => {
  test("consulta segmentos con punto y decodifica punteros JSON sin ambiguedad", () => {
    const ruta = ["agent", "build", "permission", "read", "*.env"];
    const resolucion = resolverSecuencia({ aplicaciones: [declarada(ruta, 1, 0),
      declarada(["agent", "build", "permission", "read", "*", "env"], 2, 0)], noResueltas: [] }, 1);
    expect(proyeccion.consultarAgente(resolucion, "build", ruta.slice(2))).toMatchObject({
      exito: true, valor: { valores: [{ rastro: { ruta, valor: 1 } }] },
    });
    expect(proyeccion.rutaDesdeTexto("/permission/read/*.env")).toEqual({ exito: true, valor: ruta.slice(2) });
    expect(proyeccion.rutaDesdeTexto("/src~1productos.js/~0/~01/")).toEqual({
      exito: true, valor: ["src/productos.js", "~", "~1", ""],
    });
    for (const texto of ["/x~", "/x~2"]) expect(proyeccion.rutaDesdeTexto(texto)).toMatchObject({ exito: false });
  });
});

describe("C1-6", () => {
  test("admite las claves del v1 y rechaza el texto vacio como error de uso", () => {
    expect(proyeccion.rutaDesdeTexto("temperature")).toEqual({ exito: true, valor: ["temperature"] });
    expect(proyeccion.rutaDesdeTexto("options.a")).toEqual({ exito: true, valor: ["options", "a"] });
    expect(proyeccion.rutaDesdeTexto("")).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
  });
});

describe("C1-7 RNF-03", () => {
  test("T2-11b K-1 preparacion y listado son obligatorios con vocabulario ficticio", () => {
    const obligatorio: Required<Pick<Adaptador, "prepararConsulta" | "listarAgentes">> = adaptadorFicticio;
    const entorno = crearEntornoMemoria({ archivos: { "/proyecto/capa-a.json": "{}", "/proyecto/capa-b.json": "{}" } });
    const contexto = adaptadorFicticio.contexto("/proyecto", entorno);
    const resolucion = resolver(adaptadorFicticio, "/proyecto", entorno);
    if (!contexto.exito || !resolucion.exito) throw new Error("Preparacion fallida");
    expect(obligatorio.prepararConsulta(contexto.valor, { sujeto: "documento", objetivo: "todos" }))
      .toEqual({ exito: true, valor: { sujeto: "documento", objetivoEvaluado: "todos", motivoSinDecision: null } });
    expect(obligatorio.listarAgentes(resolucion.valor, contexto.valor).agentes.map(a => a.nombre)).toEqual(["a"]);
  });
  test("el adaptador ficticio declara su propio vocabulario nativo", () => {
    const resultado = resolver(adaptadorFicticio, "/proyecto", crearEntornoMemoria({ archivos: {
      "/proyecto/capa-b.json": "{}", "/proyecto/capa-a.json": "{}",
    } }));
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.valores.find(({ determinante }) => determinante.origen.tipo === "nativo"))
      .toMatchObject({ determinante: { origen: { tipo: "nativo", regla: "base-ficticia" }, via: null, referencia: null } });
  });
});
