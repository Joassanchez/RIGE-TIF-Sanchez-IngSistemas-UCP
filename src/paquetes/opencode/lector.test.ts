import { describe, expect, test } from "bun:test";
import type { ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import { leerEntrada, posicion } from "./lector";
import { adaptadorOpenCode } from "./adaptador";
import { resolver } from "@rige/nucleo/resolucion/resolver";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";

const via: ViaUbicada = { via: "proyecto", referencia: "/p/opencode.jsonc", condicion: "observada" };

describe("V1-03 L-5 V1-08 F-5", () => {
  test.each([
    ['{"clave":{env:CLAVE},"secreto":"CONTENIDO_NO_EMITIR"}', "{env:CLAVE}", 1, 10],
    ['// {file:./x}\r\n{"a":{env:OTRA}}', "{env:OTRA}", 2, 6],
    ['\n/* {env:} */ {"a": {file:./x}} // CONTENIDO_NO_EMITIR', "{file:./x}", 2, 20],
  ] as const)("rechaza la primera sustitucion de %j antes de parsear", (texto, patron, linea, columna) => {
    const resultado = leerEntrada({ ...via, referencia: "C:\\p\\opencode.jsonc" }, texto);
    expect(resultado).toEqual({ exito: false, error: {
      codigo: "contenido-no-soportado",
      mensaje: `El prototipo v1 no incorpora ${patron} (C:/p/opencode.jsonc:${linea}:${columna}).`,
    } });
    expect(JSON.stringify(resultado)).not.toContain("CONTENIDO_NO_EMITIR");
  });
  test("lee patrones literales en cadenas, claves y arreglos sin expandir", () => {
    const resultado = leerEntrada(via, '{"{env:CLAVE}":{"x":"{file:./x}"},"lista":["{env:OTRA}",{"x":["{file:./y}"]}]}');
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.map(({ ruta, valor }) => ({ ruta, valor }))).toEqual([
      { ruta: ["{env:CLAVE}", "x"], valor: "{file:./x}" },
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
  test("la resolucion excluye sustituciones sin leer ni emitir su contenido (RNF-04)", () => {
    const secreto = "SECRETO_EXPANDIDO_NO_EMITIR";
    const lectura = crearEntornoMemoria({ directorios: ["/p", "/h"], variables: { HOME: "/h", CLAVE: secreto }, archivos: {
      "/p/opencode.jsonc": '{"agent":{"build":{"prompt":"{env:CLAVE}","description":"{file:/secreto}"},"otro":{"steps":12}}}',
      "/secreto": secreto,
    } });
    const resultado = resolver(adaptadorOpenCode, "/p", { ...lectura, leer(ruta) {
      expect(ruta).not.toBe("/secreto");
      return lectura.leer(ruta);
    } });
    expect(resultado.exito).toBe(true);
    expect(JSON.stringify(resultado)).not.toContain(secreto);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.valores.map(v => v.ruta)).toEqual([["agent", "otro", "steps"]]);
    expect(resultado.valor.noResueltas).toEqual([
      { ruta: ["agent", "build", "description"], regla: "sustitucion-no-incorporada" },
      { ruta: ["agent", "build", "prompt"], regla: "sustitucion-no-incorporada" },
    ]);
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
      error: { codigo: "entrada-ilegible", mensaje: `La entrada C:/p/opencode.jsonc no se puede leer (${linea}:${columna}).` },
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
