import { describe, expect, test } from "bun:test";
import type { ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import { leerEntrada as leerConEntorno, posicion } from "./lector";
import { adaptadorOpenCode } from "./adaptador";
import { resolver } from "../../pruebas/utilidades/resolver";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";

const via: ViaUbicada = { via: "proyecto", referencia: "/p/opencode.jsonc", condicion: "observada" };

const lecturaDePrueba = crearEntornoMemoria({ archivos: { "/p/x": "archivo-x", "/p/y": "archivo-y" }, variables: { HOME: "/h" } });
const contextoDePrueba = { proyecto: "/p", parametros: { hogar: "/h" } };
const leerEntrada = (via: ViaUbicada, texto: string) => leerConEntorno(via, texto, lecturaDePrueba, contextoDePrueba);
const leerAdaptador = (via: ViaUbicada, texto: string) => {
  const c = adaptadorOpenCode.contexto("/p", lecturaDePrueba);
  if (!c.exito) throw new Error(c.error.mensaje);
  return adaptadorOpenCode.leer(via, texto, lecturaDePrueba, c.valor);
};

describe("T3-03 R-2", () => {
  test("contenido JSONC definido con posiciones sobre la variable y error de sintaxis fatal", () => {
    const variable: ViaUbicada = { via: "variable-contenido", referencia: "OPENCODE_CONFIG_CONTENT", condicion: "definida" };
    expect(leerAdaptador(variable, '// comentario\n{"agent":{"build":{"description":"contenido"}}}')).toEqual({ exito: true,
      valor: [{ ruta: ["agent", "build", "description"], valor: "contenido", posicion: { linea: 2, columna: 20 } }] });
    const error = leerAdaptador(variable, '{\n "agent": ,\n}');
    expect(error.exito).toBe(false);
    if (error.exito) throw new Error("Se esperaba error");
    expect(error.error.ilegible).toEqual({ posicion: { linea: 2, columna: 11 }, consecuencia: "falla" });
    expect(error.error.mensaje).toContain("OPENCODE_CONFIG_CONTENT");
  });
});

describe("T3-03 R-3", () => {
  test("permiso estricto con prefijo, posiciones y sustituciones literales", () => {
    const variable: ViaUbicada = { via: "variable-permiso", referencia: "OPENCODE_PERMISSION", condicion: "definida" };
    expect(leerAdaptador(variable, '{"bash":{"{env:X}":"deny"}}')).toEqual({ exito: true,
      valor: [{ ruta: ["permission", "bash", "{env:X}"], valor: "deny", posicion: { linea: 1, columna: 10 } }] });
    for (const texto of ['{"bash":"deny",}', '/* x */ {}', '{"bash":}']) {
      const resultado = leerAdaptador(variable, texto);
      expect(resultado.exito).toBe(false);
      if (resultado.exito) throw new Error("Se esperaba error");
      expect(resultado.error.ilegible?.consecuencia).toBe("descartada");
    }
    for (const texto of ['null', '[]', '"deny"']) {
      const resultado = leerAdaptador(variable, texto);
      expect(resultado.exito).toBe(false);
      if (resultado.exito) throw new Error("Se esperaba error");
      expect(resultado.error.codigo).toBe("contenido-no-soportado");
    }
    const entorno = crearEntornoMemoria({ archivos: {}, directorios: ["/p", "/h"], variables: { HOME: "/h", OPENCODE_PERMISSION: '{"bash":{"{env:X}":"deny"}}' } });
    const resultado = resolver(adaptadorOpenCode, "/p", entorno);
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.noResueltas).not.toContainEqual({ ruta: ["permission", "bash", "{env:X}"], regla: "sustitucion-no-incorporada" });
    expect(resultado.valor.valores.find(v => v.ruta.join("/") === "permission/bash/{env:X}")?.valor).toBe("deny");
  });
});

describe("T3-03 R-9", () => {
  test("continua tras descartar permiso invalido y conserva el diagnostico sin el texto", () => {
    const lectura = crearEntornoMemoria({ archivos: {}, directorios: ["/p", "/h"], variables: { HOME: "/h", OPENCODE_PERMISSION: '{"MARCA_PRIVADA":,}' } });
    const resultado = resolver(adaptadorOpenCode, "/p", lectura);
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.entradas.at(-1)).toMatchObject({ via: "variable-permiso", condicion: "definida", resumen: null,
      legibilidad: "ilegible", error: { linea: 1, columna: 18, consecuencia: "descartada" } });
    expect(JSON.stringify(resultado)).not.toContain("MARCA_PRIVADA");
  });
});

describe("T3-03 R-10", () => {
  test("el resumen del conjunto incluye el texto de la variable sin emitir comentarios", () => {
    const analizar = (texto: string) => resolver(adaptadorOpenCode, "/p", crearEntornoMemoria({ archivos: {}, directorios: ["/p", "/h"],
      variables: { HOME: "/h", OPENCODE_CONFIG_CONTENT: texto } }));
    const primera = analizar('// MARCA_PRIVADA\n{}');
    const segunda = analizar('// OTRO_COMENTARIO\n{}');
    expect(primera.exito && segunda.exito).toBe(true);
    if (!primera.exito || !segunda.exito) throw new Error("Se esperaba resolucion");
    expect(primera.valor.resumenEntradas).not.toBe(segunda.valor.resumenEntradas);
    expect(JSON.stringify(primera)).not.toContain("MARCA_PRIVADA");
    expect(primera.valor.entradas.find(e => e.condicion === "definida")?.resumen).toBeNull();
  });
});

describe("V1-03 L-5 V1-08 F-5", () => {
  test.each([
    ['{"clave":{env:CLAVE},"secreto":"CONTENIDO_NO_EMITIR"}', "{env:CLAVE}", 1, 10],
    ['// {file:./x}\r\n{"a":{env:OTRA}}', "{env:OTRA}", 2, 6],
    ['\n/* {env:} */ {"a": {file:./x}} // CONTENIDO_NO_EMITIR', "{file:./x}", 2, 20],
  ] as const)("rechaza la primera sustitucion de %j antes de parsear", (texto, patron, linea, columna) => {
    const resultado = leerEntrada({ ...via, referencia: "C:\\p\\opencode.jsonc" }, texto);
    expect(resultado).toEqual({ exito: false, error: { categoria: "uso",
      codigo: "contenido-no-soportado",
      mensaje: `RIGE no incorpora ${patron} (C:/p/opencode.jsonc:${linea}:${columna}).`,
    } });
    expect(JSON.stringify(resultado)).not.toContain("CONTENIDO_NO_EMITIR");
  });
  test("conserva las plantillas en cadenas y arreglos tras verificar la expansion", () => {
    const resultado = leerEntrada(via, '{"fija":{"x":"{file:./x}"},"lista":["{env:OTRA}",{"x":["{file:./y}"]}]}');
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.map(({ ruta, valor }) => ({ ruta, valor }))).toEqual([
      { ruta: ["fija", "x"], valor: "{file:./x}" },
      { ruta: ["lista"], valor: ["{env:OTRA}", { x: ["{file:./y}"] }] },
    ]);
  });
  test("ignora patrones en ambos comentarios y conserva posiciones originales", () => {
    const texto = '// {env:CLAVE}\r\n{/* {file:./x} */"steps":12}';
    expect(leerEntrada(via, texto)).toEqual({ exito: true, valor: [
      { ruta: ["steps"], valor: 12, posicion: { linea: 2, columna: 18 } },
    ] });
    const invalida = leerEntrada(via, '/* {env:CLAVE} */ {"a":}');
    expect(invalida.exito).toBe(false);
    if (invalida.exito) throw new Error("Se esperaba entrada ilegible");
    expect(invalida.error.codigo).toBe("entrada-ilegible");
  });
  test("la resolucion incorpora plantillas y lee sin emitir el contenido (RNF-04)", () => {
    const secreto = "SECRETO_EXPANDIDO_NO_EMITIR";
    const lectura = crearEntornoMemoria({ directorios: ["/p", "/h"], variables: { HOME: "/h", CLAVE: secreto }, archivos: {
      "/p/opencode.jsonc": '{"agent":{"build":{"prompt":"{env:CLAVE}","description":"{file:/secreto}"},"otro":{"steps":12}}}',
      "/secreto": secreto,
    } });
    const resultado = resolver(adaptadorOpenCode, "/p", { ...lectura, leer(ruta) {
      // El lector necesita el contenido para verificar la estructura.
      return lectura.leer(ruta);
    } });
    expect(resultado.exito).toBe(true);
    expect(JSON.stringify(resultado)).not.toContain(secreto);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.valores.filter(v => v.determinante.origen.tipo === "declarado").map(v => v.ruta)).toEqual([["agent", "build", "description"], ["agent", "build", "prompt"], ["agent", "otro", "steps"]]);
    expect(resultado.valor.noResueltas).toEqual([]);
  });
});

describe("V1-03 L-4", () => {
  test.each([
    ['{"a": }', 1, 7],
    ['{\r\n  "a": , "b": }', 2, 8],
    ["[1]", 1, 1],
    ["3", 1, 1],
    ["/* comentario */\n  null", 2, 3],
    ["", 1, 1],
  ] as const)("rechaza %j con la primera posicion y referencia normalizada", (texto, linea, columna) => {
    expect(leerEntrada({ ...via, referencia: "C:\\p\\opencode.jsonc" }, texto)).toEqual({
      exito: false,
      error: { categoria: "uso", codigo: "entrada-ilegible", ilegible: { posicion: { linea, columna }, consecuencia: "falla" }, mensaje: `La entrada C:/p/opencode.jsonc no se puede leer (${linea}:${columna}).` },
    });
  });
});

describe("V1-03 L-3 V1-08 F-3", () => {
  test("admite comentarios, comas finales, todas las hojas y claves duplicadas", () => {
    const texto = '{/* comentario */"vacio":{},"lista":[1,{"a":true},null],"nulo":null,"cadena":"hola","booleano":false,"duplicada":1,"duplicada":2,}';
    const resultado = leerEntrada(via, texto);
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error("La entrada debe ser legible");
    expect(resultado.valor.map(({ ruta, valor }) => ({ ruta, valor }))).toEqual([
      { ruta: ["vacio"], valor: {} },
      { ruta: ["lista"], valor: [1, { a: true }, null] },
      { ruta: ["nulo"], valor: null },
      { ruta: ["cadena"], valor: "hola" },
      { ruta: ["booleano"], valor: false },
      { ruta: ["duplicada"], valor: 1 },
      { ruta: ["duplicada"], valor: 2 },
    ]);
    expect(resultado.valor.filter(({ ruta }) => ruta[0] === "duplicada").map(({ posicion }) => posicion.columna))
      .toEqual([texto.indexOf('"duplicada"') + 1, texto.lastIndexOf('"duplicada"') + 1]);
    expect(leerEntrada(via, "{}")).toEqual({ exito: true, valor: [] });
  });
});

describe("V1-03 L-1", () => {
  test("descompone las hojas en orden de documento", () => {
    const resultado = leerEntrada(via, '{"agent":{"build":{"temperature":0.3,"steps":12}}}');
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error("La entrada debe ser legible");
    expect(resultado.valor.map(({ ruta, valor }) => ({ ruta, valor }))).toEqual([
      { ruta: ["agent", "build", "temperature"], valor: 0.3 },
      { ruta: ["agent", "build", "steps"], valor: 12 },
    ]);
  });
});

describe("V1-03 L-2", () => {
  test.each(["\n", "\r\n"])("ubica la clave original con fin de linea %j", (fin) => {
    const texto = ["// comentario", "{", '  "agent": {', '    "build": {', "      // antes de la clave", '      "temperature": 0.3', "    }", "  }", "}"].join(fin);
    expect(leerEntrada(via, texto)).toEqual({ exito: true, valor: [
      { ruta: ["agent", "build", "temperature"], valor: 0.3, posicion: { linea: 6, columna: 7 } },
    ] });
    expect(posicion(texto, texto.indexOf('"temperature"'))).toEqual({ linea: 6, columna: 7 });
  });
  test("cuenta dos unidades UTF-16 para un caracter fuera del BMP", () => {
    const texto = '{/*😀*/"steps":12}';
    expect(leerEntrada(via, texto)).toEqual({ exito: true, valor: [
      { ruta: ["steps"], valor: 12, posicion: { linea: 1, columna: 8 } },
    ] });
    expect(posicion("", 0)).toEqual({ linea: 1, columna: 1 });
  });
});
