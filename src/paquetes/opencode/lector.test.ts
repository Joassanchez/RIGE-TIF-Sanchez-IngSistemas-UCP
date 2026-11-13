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
    for (const texto of ['null', '[]']) expect(leerAdaptador(variable, texto)).toEqual({ exito: true, valor: [] });
    for (const texto of ['"deny"']) {
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
  ] as const)("rechaza %j con la primera posicion y referencia normalizada", (texto, linea, columna) => {
    expect(leerEntrada({ ...via, referencia: "C:\\p\\opencode.jsonc" }, texto)).toEqual({
      exito: false,
      error: { categoria: "uso", codigo: "entrada-ilegible", ilegible: { posicion: { linea, columna }, consecuencia: "falla" }, mensaje: `La entrada C:/p/opencode.jsonc no se puede leer (${linea}:${columna}).` },
    });
  });
});

describe("T6-01", () => {
  const viaJson: ViaUbicada = { via: "proyecto", referencia: "/p/opencode.json", condicion: "observada" };

  test("B-1: archivo opencode.json de 0 bytes (y solo BOM) da exito, cero declaraciones y sin entrada-ilegible", () => {
    for (const contenido of ["", "\uFEFF"]) {
      expect(leerEntrada(viaJson, contenido)).toEqual({ exito: true, valor: [] });
      const entorno = crearEntornoMemoria({ archivos: { "/p/opencode.json": contenido }, directorios: ["/p", "/h"], variables: { HOME: "/h" } });
      const res = resolver(adaptadorOpenCode, "/p", entorno);
      expect(res.exito).toBe(true);
      if (!res.exito) throw new Error(res.error.mensaje);
      expect(res.valor.valores.filter(v => v.determinante.origen.tipo === "declarado")).toEqual([]);
      expect(res.valor.entradas).toContainEqual({
        orden: expect.any(Number),
        via: "proyecto",
        referencia: "/p/opencode.json",
        condicion: "observada",
        resumen: entorno.resumir(contenido),
      });
    }
  });

  test("B-2: BOM UTF-8 inicial se ignora y las posiciones no cuentan el BOM; SHA-256 conserva bytes originales", () => {
    expect(leerEntrada(viaJson, '\uFEFF{"temperature": 0.3}')).toEqual({
      exito: true,
      valor: [{ ruta: ["temperature"], valor: 0.3, posicion: { linea: 1, columna: 2 } }],
    });
    expect(leerEntrada(viaJson, '\uFEFF\n{"temperature": 0.3}')).toEqual({
      exito: true,
      valor: [{ ruta: ["temperature"], valor: 0.3, posicion: { linea: 2, columna: 2 } }],
    });
    const conBom = '\uFEFF{"temperature": 0.3}';
    const entorno = crearEntornoMemoria({ archivos: { "/p/opencode.json": conBom }, directorios: ["/p", "/h"], variables: { HOME: "/h" } });
    const res = resolver(adaptadorOpenCode, "/p", entorno);
    expect(res.exito).toBe(true);
    if (!res.exito) throw new Error(res.error.mensaje);
    expect(res.valor.entradas.find(e => e.referencia === "/p/opencode.json")?.resumen).toBe(entorno.resumir(conBom));
    expect(entorno.resumir(conBom)).not.toBe(entorno.resumir('{"temperature": 0.3}'));
  });

  test("B-3: BOM + {env:X} y {file:...} en linea 1 conservan posicion correcta", () => {
    const entorno = crearEntornoMemoria({ archivos: { "/p/x": "archivo-x" }, variables: { HOME: "/h", X: "valor" } });
    expect(leerConEntorno(viaJson, '\uFEFF{"description":"{env:X}"}', entorno, contextoDePrueba)).toEqual({
      exito: true,
      valor: [{
        ruta: ["description"],
        valor: "{env:X}",
        posicion: { linea: 1, columna: 2 },
        sustituciones: [{ tipo: "variable", origen: "X", definido: true, posicion: { linea: 1, columna: 17 } }],
      }],
    });
    expect(leerConEntorno(viaJson, '\uFEFF{"prompt":"{file:./x}"}', entorno, contextoDePrueba)).toEqual({
      exito: true,
      valor: [{
        ruta: ["prompt"],
        valor: "{file:./x}",
        posicion: { linea: 1, columna: 2 },
        sustituciones: [{ tipo: "archivo", origen: "/p/x", definido: true, posicion: { linea: 1, columna: 12 } }],
      }],
    });
    expect(leerConEntorno(viaJson, '\uFEFF{"a":{env:X}}', entorno, contextoDePrueba)).toEqual({
      exito: false,
      error: {
        categoria: "uso",
        codigo: "contenido-no-soportado",
        mensaje: "RIGE no incorpora {env:X} (/p/opencode.json:1:6).",
      },
    });
  });

  test("B-4: archivo con solo espacios sigue siendo entrada-ilegible", () => {
    for (const contenido of ["  \n", "\uFEFF  \n"]) {
      expect(leerEntrada(viaJson, contenido)).toEqual({
        exito: false,
        error: {
          categoria: "uso",
          codigo: "entrada-ilegible",
          ilegible: { posicion: { linea: 2, columna: 1 }, consecuencia: "falla" },
          mensaje: "La entrada /p/opencode.json no se puede leer (2:1).",
        },
      });
    }
  });

  test("B-5: OPENCODE_PERMISSION vacia conserva el comportamiento anterior", () => {
    const variablePermiso: ViaUbicada = { via: "variable-permiso", referencia: "OPENCODE_PERMISSION", condicion: "definida" };
    expect(leerAdaptador(variablePermiso, "")).toEqual({
      exito: false,
      error: {
        categoria: "uso",
        codigo: "entrada-ilegible",
        ilegible: { posicion: { linea: 1, columna: 1 }, consecuencia: "descartada" },
        mensaje: "La entrada OPENCODE_PERMISSION no se puede leer (1:1).",
      },
    });
    const entorno = crearEntornoMemoria({ archivos: {}, directorios: ["/p", "/h"], variables: { HOME: "/h", OPENCODE_PERMISSION: "" } });
    const res = resolver(adaptadorOpenCode, "/p", entorno);
    expect(res.exito).toBe(true);
    if (!res.exito) throw new Error(res.error.mensaje);
    expect(res.valor.entradas.some(e => e.via === "variable-permiso")).toBe(false);
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
      { ruta: ["duplicada"], valor: 2 },
    ]);
    expect(resultado.valor.filter(({ ruta }) => ruta[0] === "duplicada").map(({ posicion }) => posicion.columna))
      .toEqual([texto.lastIndexOf('"duplicada"') + 1]);
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

describe("T6-03", () => {
  test("D-1: permission duplicado reemplaza entero al anterior y conserva solo la segunda regla", () => {
    const texto = '{"permission":{"bash":{"rm *":"deny"}},"permission":{"bash":{"ls *":"allow"}}}';
    const columnaLs = texto.indexOf('"ls *"') + 1;
    expect(leerEntrada(via, texto)).toEqual({
      exito: true,
      valor: [{ ruta: ["permission", "bash", "ls *"], valor: "allow", posicion: { linea: 1, columna: columnaLs } }],
    });
    const entorno = crearEntornoMemoria({ archivos: { "/p/opencode.jsonc": texto }, directorios: ["/p", "/h"], variables: { HOME: "/h" } });
    const ctx = adaptadorOpenCode.contexto("/p", entorno);
    expect(ctx.exito).toBe(true);
    if (!ctx.exito) throw new Error(ctx.error.mensaje);
    const res = resolver(adaptadorOpenCode, "/p", entorno, ctx.valor);
    expect(res.exito).toBe(true);
    if (!res.exito) throw new Error(res.error.mensaje);
    const cad = adaptadorOpenCode.cadena(res.valor, "build", ctx.valor);
    expect(cad.exito).toBe(true);
    if (!cad.exito) throw new Error(cad.error.mensaje);
    const declaradas = cad.valor.reglas.filter(r => r.origen.tipo === "declarado");
    expect(declaradas).toHaveLength(1);
    expect(declaradas[0]).toMatchObject({
      sujeto: "bash",
      patron: "ls *",
      efecto: "allow",
      origen: { tipo: "declarado", posicion: { linea: 1, columna: columnaLs } },
    });
  });

  test("D-2: escalar duplicado conserva la segunda ocurrencia y su posicion", () => {
    const texto = '{"temperature":0.1,"temperature":0.2}';
    const columnaSegunda = texto.lastIndexOf('"temperature"') + 1;
    expect(leerEntrada(via, texto)).toEqual({
      exito: true,
      valor: [{ ruta: ["temperature"], valor: 0.2, posicion: { linea: 1, columna: columnaSegunda } }],
    });
    const entorno = crearEntornoMemoria({ archivos: { "/p/opencode.jsonc": texto }, directorios: ["/p", "/h"], variables: { HOME: "/h" } });
    const res = resolver(adaptadorOpenCode, "/p", entorno);
    expect(res.exito).toBe(true);
    if (!res.exito) throw new Error(res.error.mensaje);
    const rastro = res.valor.valores.find(v => v.ruta.join("/") === "temperature");
    expect(rastro?.valor).toBe(0.2);
    expect(rastro?.determinante.origen).toMatchObject({ tipo: "declarado", posicion: { linea: 1, columna: columnaSegunda } });
    expect(rastro?.desplazadas).toEqual([]);
  });

  test("D-3: duplicado escalar -> objeto y objeto -> escalar conserva el valor efectivo final", () => {
    const escalarAObjeto = '{"agent":{"build":{"options":1,"options":{"a":2}}}}';
    expect(leerEntrada(via, escalarAObjeto)).toEqual({
      exito: true,
      valor: [{ ruta: ["agent", "build", "options", "a"], valor: 2, posicion: { linea: 1, columna: escalarAObjeto.indexOf('"a"') + 1 } }],
    });
    const res1 = resolver(adaptadorOpenCode, "/p", crearEntornoMemoria({
      archivos: { "/p/opencode.jsonc": escalarAObjeto }, directorios: ["/p", "/h"], variables: { HOME: "/h" },
    }));
    expect(res1.exito).toBe(true);
    if (!res1.exito) throw new Error(res1.error.mensaje);
    expect(res1.valor.valores.filter(v => v.ruta.slice(0, 3).join("/") === "agent/build/options"))
      .toMatchObject([{
        ruta: ["agent", "build", "options", "a"],
        valor: 2,
        determinante: { origen: { posicion: { linea: 1, columna: escalarAObjeto.indexOf('"a"') + 1 } } },
      }]);

    const objetoAEscalar = '{"agent":{"build":{"options":{"a":2},"options":1}}}';
    expect(leerEntrada(via, objetoAEscalar)).toEqual({
      exito: true,
      valor: [{ ruta: ["agent", "build", "options"], valor: 1, posicion: { linea: 1, columna: objetoAEscalar.lastIndexOf('"options"') + 1 } }],
    });
    const res2 = resolver(adaptadorOpenCode, "/p", crearEntornoMemoria({
      archivos: { "/p/opencode.jsonc": objetoAEscalar }, directorios: ["/p", "/h"], variables: { HOME: "/h" },
    }));
    expect(res2.exito).toBe(true);
    if (!res2.exito) throw new Error(res2.error.mensaje);
    expect(res2.valor.valores.filter(v => v.ruta.slice(0, 3).join("/") === "agent/build/options"))
      .toMatchObject([{
        ruta: ["agent", "build", "options"],
        valor: 1,
        determinante: { origen: { posicion: { linea: 1, columna: objetoAEscalar.lastIndexOf('"options"') + 1 } } },
      }]);
  });

  test("D-4: duplicado anidado en agent.build emite solo la ultima ocurrencia de agent.build", () => {
    const texto = '{"agent":{"build":{"temperature":0.1,"prompt":"uno"},"build":{"steps":12}}}';
    expect(leerEntrada(via, texto)).toEqual({
      exito: true,
      valor: [{ ruta: ["agent", "build", "steps"], valor: 12, posicion: { linea: 1, columna: texto.indexOf('"steps"') + 1 } }],
    });
    const res = resolver(adaptadorOpenCode, "/p", crearEntornoMemoria({
      archivos: { "/p/opencode.jsonc": texto }, directorios: ["/p", "/h"], variables: { HOME: "/h" },
    }));
    expect(res.exito).toBe(true);
    if (!res.exito) throw new Error(res.error.mensaje);
    expect(res.valor.valores.filter(v => v.determinante.origen.tipo === "declarado").map(v => ({ ruta: v.ruta, valor: v.valor })))
      .toEqual([{ ruta: ["agent", "build", "steps"], valor: 12 }]);
  });

  test("no rechaza sustituciones descartadas por una clave posterior ni desalinea original y expandido", () => {
    const claveInvalidaDescartada = '{"a":{"{env:X}":1},"a":{"b":2}}';
    expect(leerEntrada(via, claveInvalidaDescartada)).toEqual({
      exito: true,
      valor: [{ ruta: ["a", "b"], valor: 2, posicion: { linea: 1, columna: claveInvalidaDescartada.indexOf('"b"') + 1 } }],
    });

    const modoYArchivo = '{"agent":{"build":{"mode":"{env:NO_EXISTE}","prompt":"{env:X}"},"build":{"mode":"primary","prompt":"{file:./x}"}}}';
    expect(leerEntrada(via, modoYArchivo)).toEqual({
      exito: true,
      valor: [
        { ruta: ["agent", "build", "mode"], valor: "primary", posicion: { linea: 1, columna: modoYArchivo.lastIndexOf('"mode"') + 1 } },
        {
          ruta: ["agent", "build", "prompt"],
          valor: "{file:./x}",
          posicion: { linea: 1, columna: modoYArchivo.lastIndexOf('"prompt"') + 1 },
          sustituciones: [{ tipo: "archivo", origen: "/p/x", definido: true, posicion: { linea: 1, columna: modoYArchivo.indexOf("{file:./x}") + 1 } }],
        },
      ],
    });

    const permisoDescartado = '{"permission":{"{env:X}":{"rm *":"{env:NO_EXISTE}","rm *":"allow"}}}';
    expect(leerEntrada(via, permisoDescartado)).toMatchObject({
      exito: true,
      valor: [{ ruta: ["permission", "{env:X}"], valor: { "rm *": "allow" } }],
    });

    const prototipo = '{"__proto__":1,"constructor":2,"__proto__":3}';
    expect(leerEntrada(via, prototipo).exito).toBe(true);
    const resProto = leerEntrada(via, prototipo);
    if (!resProto.exito) throw new Error(resProto.error.mensaje);
    expect(resProto.valor.map(({ ruta, valor }) => ({ ruta, valor }))).toEqual([
      { ruta: ["constructor"], valor: 2 },
      { ruta: ["__proto__"], valor: 3 },
    ]);
  });
});

describe("T6-02 normalizacion de permission como accion", () => {
  test("normaliza permission literal en raiz y en agente conservando la posicion de la clave", () => {
    expect(leerEntrada(via, '{\n  "permission": "allow"\n}')).toEqual({
      exito: true,
      valor: [{ ruta: ["permission", "*"], valor: "allow", posicion: { linea: 2, columna: 3 } }],
    });
    const agente = leerEntrada(via, '{\n  "agent": {\n    "build": {\n      "permission": "deny"\n    }\n  }\n}');
    expect(agente).toEqual({
      exito: true,
      valor: [{ ruta: ["agent", "build", "permission", "*"], valor: "deny", posicion: { linea: 4, columna: 7 } }],
    });
    const agenteLlamadoPermission = leerEntrada(via, '{\n  "agent": {\n    "permission": {\n      "permission": "ask"\n    }\n  }\n}');
    expect(agenteLlamadoPermission).toEqual({
      exito: true,
      valor: [{ ruta: ["agent", "permission", "permission", "*"], valor: "ask", posicion: { linea: 4, columna: 7 } }],
    });
  });

  test("normaliza permission por sustitucion y rechaza acciones invalidas sustituidas", () => {
    const entorno = crearEntornoMemoria({
      archivos: { "/p/perm": "deny", "/p/mala": "otro" },
      variables: { HOME: "/h", ACCION: "allow", MALA: "talvez" },
    });
    expect(leerConEntorno(via, '{\n  "permission": "{env:ACCION}"\n}', entorno, contextoDePrueba)).toEqual({
      exito: true,
      valor: [{
        ruta: ["permission", "*"],
        valor: "{env:ACCION}",
        posicion: { linea: 2, columna: 3 },
        sustituciones: [{ tipo: "variable", origen: "ACCION", definido: true, posicion: { linea: 2, columna: 18 } }],
      }],
    });
    const porArchivo = leerConEntorno(
      via,
      '{\n  "agent": {\n    "build": {\n      "permission": "{file:./perm}"\n    }\n  }\n}',
      entorno,
      contextoDePrueba,
    );
    expect(porArchivo).toMatchObject({
      exito: true,
      valor: [{
        ruta: ["agent", "build", "permission", "*"],
        valor: "{file:./perm}",
        posicion: { linea: 4, columna: 7 },
        sustituciones: [{ tipo: "archivo", definido: true, posicion: { linea: 4, columna: 22 } }],
      }],
    });
    if (!porArchivo.exito) throw new Error(porArchivo.error.mensaje);
    expect(porArchivo.valor[0]?.sustituciones?.[0]?.origen).toContain("perm");

    expect(leerConEntorno(via, '{"permission":"{env:MALA}"}', entorno, contextoDePrueba))
      .toMatchObject({ exito: false, error: { codigo: "configuracion-invalida" } });
    expect(leerConEntorno(via, '{"agent":{"build":{"permission":"{file:./mala}"}}}', entorno, contextoDePrueba))
      .toMatchObject({ exito: false, error: { codigo: "configuracion-invalida" } });
  });

  test("marca solo permission.* como no resuelta ante sustitucion sin desplazar bash hermano", () => {
    const entorno = crearEntornoMemoria({
      plataforma: "linux",
      archivos: {
        "/h/.config/opencode/opencode.json": '{"permission":"{env:ACCION}"}',
        "/p/opencode.json": '{"permission":{"bash":"deny"}}',
      },
      directorios: ["/p", "/h", "/h/.config", "/h/.config/opencode"],
      variables: { HOME: "/h", XDG_CONFIG_HOME: "/h/.config", ACCION: "allow" },
    });
    const resultado = resolver(adaptadorOpenCode, "/p", entorno);
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.noResueltas).toMatchObject([
      { ruta: ["permission", "*"], regla: "sustitucion-no-incorporada" },
    ]);
    expect(resultado.valor.noResueltas).toHaveLength(1);
    expect(resultado.valor.valores.find(v => v.ruta.join(".") === "permission.bash")?.valor).toBe("deny");
    expect(resultado.valor.valores.find(v => v.ruta.join(".") === "permission.*")).toBeUndefined();
  });

  test("no normaliza valores no string, sujetos individuales ni OPENCODE_PERMISSION", () => {
    const raiz = leerEntrada(via, '{"permission":{}}');
    expect(raiz.exito).toBe(true);
    if (!raiz.exito) throw new Error(raiz.error.mensaje);
    expect(raiz.valor.map(d => d.ruta)).toEqual([["permission"]]);

    const agente = leerEntrada(via, '{"agent":{"build":{"permission":{}}}}');
    expect(agente.exito).toBe(true);
    if (!agente.exito) throw new Error(agente.error.mensaje);
    expect(agente.valor.map(d => d.ruta)).toEqual([["agent", "build", "permission"]]);

    for (const noValido of ["null", "true", "123", "[]"]) {
      expect(leerEntrada(via, `{"permission":${noValido}}`)).toMatchObject({
        exito: false,
        error: { categoria: "uso", codigo: "configuracion-invalida" },
      });
      expect(leerEntrada(via, `{"agent":{"build":{"permission":${noValido}}}}`)).toMatchObject({
        exito: false,
        error: { categoria: "uso", codigo: "configuracion-invalida" },
      });
    }

    expect(leerEntrada(via, '{"permission":{"bash":"allow"}}')).toMatchObject({
      exito: true,
      valor: [{ ruta: ["permission", "bash"], valor: "allow" }],
    });
    expect(leerEntrada(via, '{"agent":{"build":{"permission":{"bash":"deny"}}}}')).toMatchObject({
      exito: true,
      valor: [{ ruta: ["agent", "build", "permission", "bash"], valor: "deny" }],
    });

    const envPermiso: ViaUbicada = { via: "variable-permiso", referencia: "OPENCODE_PERMISSION", condicion: "definida" };
    expect(leerAdaptador(envPermiso, '{"permission":"allow"}')).toEqual({
      exito: true,
      valor: [{ ruta: ["permission", "permission"], valor: "allow", posicion: { linea: 1, columna: 2 } }],
    });
    expect(leerAdaptador(envPermiso, '"allow"')).toMatchObject({
      exito: false,
      error: { codigo: "contenido-no-soportado" },
    });
  });

  test("claves duplicadas en un mismo archivo conservan la ultima declaracion vigente", () => {
    expect(leerEntrada(via, '{"permission":{"bash":"deny"},"permission":"allow"}')).toEqual({
      exito: true,
      valor: [{ ruta: ["permission", "*"], valor: "allow", posicion: { linea: 1, columna: 31 } }],
    });
    expect(leerEntrada(via, '{"permission":"allow","permission":{"bash":"deny"}}')).toEqual({
      exito: true,
      valor: [{ ruta: ["permission", "bash"], valor: "deny", posicion: { linea: 1, columna: 37 } }],
    });
  });
});

describe("T6-05", () => {
  test("I-1 rechaza permissions en raiz o en agent.<n> con su posicion", () => {
    expect(leerEntrada(via, '{"permissions":{"bash":"deny"}}')).toEqual({
      exito: false,
      error: {
        categoria: "uso",
        codigo: "configuracion-invalida",
        mensaje: "Configuración inválida en permissions (/p/opencode.jsonc:1:2).",
      },
    });
    expect(leerEntrada(via, '{"agent":{"x":{"permissions":{"bash":"deny"}}}}')).toEqual({
      exito: false,
      error: {
        categoria: "uso",
        codigo: "configuracion-invalida",
        mensaje: "Configuración inválida en agent.x.permissions (/p/opencode.jsonc:1:16).",
      },
    });
    expect(leerEntrada(via, '{"agent":{"permissions":{"mode":"subagent"}}}')).toMatchObject({
      exito: true,
      valor: [{ ruta: ["agent", "permissions", "mode"], valor: "subagent" }],
    });
  });

  test("I-2 rechaza las cinco claves solo-accion cuando no tienen accion valida", () => {
    expect(leerEntrada(via, '{"permission":{"webfetch":{"*":"deny"}}}')).toEqual({
      exito: false,
      error: {
        categoria: "uso",
        codigo: "configuracion-invalida",
        mensaje: "Configuración inválida en permission.webfetch (/p/opencode.jsonc:1:16).",
      },
    });
    for (const clave of ["todowrite", "question", "webfetch", "websearch", "doom_loop"]) {
      for (const invalido of ['{"*":"deny"}', "{}", "[]", "1", '"maybe"']) {
        expect(leerEntrada(via, `{"permission":{"${clave}":${invalido}}}`)).toMatchObject({
          exito: false,
          error: { categoria: "uso", codigo: "configuracion-invalida" },
        });
        expect(leerEntrada(via, `{"agent":{"x":{"permission":{"${clave}":${invalido}}}}}`)).toMatchObject({
          exito: false,
          error: { categoria: "uso", codigo: "configuracion-invalida" },
        });
      }
    }
  });

  test("rechaza acciones literales invalidas en permission pero conserva tratamiento de OPENCODE_PERMISSION", () => {
    expect(leerEntrada(via, '{"permission":{"bash":"maybe"}}')).toEqual({
      exito: false,
      error: {
        categoria: "uso",
        codigo: "configuracion-invalida",
        mensaje: "Configuración inválida en permission.bash (/p/opencode.jsonc:1:16).",
      },
    });
    expect(leerEntrada(via, '{"permission":"maybe"}')).toEqual({
      exito: false,
      error: {
        categoria: "uso",
        codigo: "configuracion-invalida",
        mensaje: "Configuración inválida en permission (/p/opencode.jsonc:1:2).",
      },
    });
    expect(leerEntrada(via, '{"agent":{"x":{"permission":{"bash":{"git *":"maybe"}}}}}')).toEqual({
      exito: false,
      error: {
        categoria: "uso",
        codigo: "configuracion-invalida",
        mensaje: "Configuración inválida en agent.x.permission.bash.git * (/p/opencode.jsonc:1:38).",
      },
    });

    const envPermiso: ViaUbicada = { via: "variable-permiso", referencia: "OPENCODE_PERMISSION", condicion: "definida" };
    expect(leerAdaptador(envPermiso, '{"bash":"maybe"}')).toMatchObject({ exito: true });
    expect(leerAdaptador(envPermiso, '{"webfetch":{"*":"deny"}}')).toMatchObject({ exito: true });
  });

  test("I-3 e I-4 validan tipos de propiedades conocidas de agente sin filtrar sustituciones", () => {
    expect(leerEntrada(via, '{"agent":{"x":{"temperature":"hot"}}}')).toEqual({
      exito: false,
      error: {
        categoria: "uso",
        codigo: "configuracion-invalida",
        mensaje: "Configuración inválida en agent.x.temperature (/p/opencode.jsonc:1:16).",
      },
    });
    expect(leerEntrada(via, '{"agent":{"x":{"steps":-1}}}')).toEqual({
      exito: false,
      error: {
        categoria: "uso",
        codigo: "configuracion-invalida",
        mensaje: "Configuración inválida en agent.x.steps (/p/opencode.jsonc:1:16).",
      },
    });
    for (const [clave, valor] of [
      ["top_p", '"high"'],
      ["temperature", "{}"],
      ["steps", "0"],
      ["steps", "1.5"],
      ["steps", '"5"'],
      ["steps", '{"a":1}'],
      ["prompt", "123"],
      ["description", "false"],
      ["model", "{}"],
      ["color", "[]"],
    ] as const) {
      expect(leerEntrada(via, `{"agent":{"x":{"${clave}":${valor}}}}`)).toMatchObject({
        exito: false,
        error: { categoria: "uso", codigo: "configuracion-invalida" },
      });
    }
    const conEnv = leerEntrada(via, '{"agent":{"x":{"temperature":"{env:HOME}"}}}');
    expect(conEnv).toMatchObject({ exito: false, error: { categoria: "uso", codigo: "configuracion-invalida" } });
    if (!conEnv.exito) expect(conEnv.error.mensaje).not.toContain("/h");
  });

  test("I-5 acepta valores validos en las mismas claves", () => {
    expect(leerEntrada(via, JSON.stringify({
      permission: {
        todowrite: "allow",
        question: "ask",
        webfetch: "deny",
        websearch: "allow",
        doom_loop: "deny",
        bash: "allow",
      },
      agent: {
        x: {
          temperature: 0.5,
          top_p: 0.9,
          steps: 5,
          prompt: "Instrucciones",
          description: "Agente de prueba",
          model: "anthropic/claude-sonnet-4-5",
          color: "#112233",
          permission: { webfetch: "deny", bash: { "git *": "allow" } },
        },
      },
    }))).toMatchObject({ exito: true });
    expect(leerEntrada(via, '{"agent":{"x":{"prompt":"{env:HOME}"}}}')).toMatchObject({ exito: true });
  });
});
