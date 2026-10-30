import { describe, expect, test } from "bun:test";
import { parseTree, type Node } from "jsonc-parser";
import type { Declaracion, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { resolver } from "../../pruebas/utilidades/resolver";
import { adaptadorOpenCode } from "./adaptador";
import { leerEntrada, posicion } from "./lector";

const via: ViaUbicada = { via: "proyecto", referencia: "/p/sub/config.json", condicion: "observada" };
const contexto = { proyecto: "/p", parametros: { hogar: "/h" } };
function entorno(variables: Record<string, string> = {}, archivos: Record<string, string> = {}) {
  return crearEntornoMemoria({ variables: { HOME: "/h", ...variables }, archivos, directorios: ["/h", "/p", "/directorio"] });
}
function leer(texto: string, variables: Record<string, string> = {}, archivos: Record<string, string> = {}, entrada = via) {
  return leerEntrada(entrada, texto, entorno(variables, archivos), contexto);
}
function declaraciones(resultado: ReturnType<typeof leer>): readonly Declaracion[] {
  expect(resultado.exito).toBe(true);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}

describe("T3-04-c1 R-2", () => {
  test("el resultado comprobado conserva los marcadores definidos fuera del diagnostico", () => {
    const r = leer('{"agent":{"x":{"mode":"{env:M}"}}}', { M: "MARCA-MODO" });
    expect(r).toMatchObject({ exito: false, error: { codigo: "configuracion-invalida" } });
    expect(JSON.stringify(r)).not.toContain("MARCA-MODO");
  });
});
describe("T3-04-c1 R-4", () => {
  test.each([
    ['{"a":"prefijo {env:X} sufijo"}', { X: 'a","k":"b' }, "{env:X}", "contenido-no-soportado"],
    ['{"a":"{env:X}","b":"prefijo {env:Y} sufijo"}', { X: "seguro", Y: 'a","k":"b' }, "{env:Y}", "contenido-no-soportado"],
    ['{"a":"prefijo {env:X} sufijo"}', { X: '"' }, "{env:X}", "entrada-ilegible"],
    ['{"a":"prefijo {file:./ausente} sufijo"}', {}, "{file:./ausente}", "entrada-ilegible"],
  ] as const)("diagnostico con token original aislado: %s", (texto, variables, token, codigo) => {
    const r = leer(texto, variables);
    expect(r).toMatchObject({ exito: false, error: { codigo } });
    if (r.exito) throw new Error("Se esperaba error");
    expect(r.error.mensaje).toContain(token);
    expect(r.error.mensaje).not.toContain("prefijo");
    const p = posicion(texto, texto.indexOf(token));
    expect(r.error.mensaje).toContain(`${p.linea}:${p.columna}`);
  });
});
describe("T3-04-c1 R-5", () => {
  test("todas las posiciones de declaraciones de escenarios sin sustituciones mantienen las posiciones anteriores", async () => {
    let archivos = 0;
    for (const ruta of new Bun.Glob("**/*.{json,jsonc}").scanSync({ cwd: `${import.meta.dir}/../../pruebas/escenarios` })) {
      const texto = await Bun.file(`${import.meta.dir}/../../pruebas/escenarios/${ruta}`).text();
      if (/\{(?:env|file):[^}]+\}/.test(texto)) continue;
      archivos++;
      // Cada clave incluye todas las posiciones que el lector puede declarar.
      const pendientes: Node[] = [];
      const raiz = parseTree(texto);
      if (raiz) pendientes.push(raiz);
      while (pendientes.length) {
        const nodo = pendientes.pop()!;
        pendientes.push(...(nodo.children ?? []));
        if (nodo.type !== "property") continue;
        const offset = nodo.children![0]!.offset;
        const anterior = texto.slice(0, offset);
        // Algoritmo de ac89ccf: LF solamente.
        expect(posicion(texto, offset)).toEqual({ linea: anterior.split("\n").length, columna: offset - anterior.lastIndexOf("\n") });
      }
    }
    expect(archivos).toBeGreaterThan(0);
  });
  test("posiciones compatibles con ac89ccf: solo LF cuenta como salto, incluido CRLF", () => {
    for (const texto of ['a\rb', 'a\r\nb', '😀\nxx']) {
      for (let i = 0; i <= texto.length; i++) {
        const anterior = texto.slice(0, i);
        expect(posicion(texto, i)).toEqual({ linea: anterior.split("\n").length, columna: i - anterior.lastIndexOf("\n") });
      }
    }
  });
});
describe("T3-04-c1 R-6", () => {
  test("valida cada hoja sustituida de permisos como el binario, sin publicar el valor", () => {
    for (const A of ["", "MARCA-PERMISO", "allow", "ask", "deny"]) {
      for (const permission of [{ read: "{env:A}" }, { bash: { "*": "{env:A}" } }]) {
        for (const config of [{ permission }, { agent: { x: { permission } } }]) {
          const r = leer(JSON.stringify(config), { A });
          if (["allow", "ask", "deny"].includes(A)) expect(r.exito).toBe(true);
          else expect(r).toMatchObject({ exito: false, error: { codigo: "configuracion-invalida" } });
          expect(JSON.stringify(r)).not.toContain("MARCA-PERMISO");
        }
      }
    }
  });
});
describe("T3-04-c1 R-8", () => {
  test.each(["MARCA-X", ""])("preflight ubica la primera variable solapada y no intenta leer archivos: %s", X => {
    const texto = '{"a":"{env:PREVIA}{file:./{env:X}/{env:Y}}"}';
    const r = leerEntrada(via, texto, { ...entorno({ PREVIA: "anterior", X, Y: "MARCA-Y" }), leer() { throw new Error("No debe leer"); } }, contexto);
    expect(r).toMatchObject({ exito: false, error: { codigo: "contenido-no-soportado" } });
    if (r.exito) throw new Error("Se esperaba error");
    expect(r.error.mensaje).toContain(`{env:X} (${via.referencia}:1:${texto.indexOf("{env:X}") + 1})`);
    expect(JSON.stringify(r)).not.toContain("MARCA-");
  });
});
describe("T3-04-c1 R-10", () => {
  test("null y [] en variable permiso son legibles y no declaran; los demas escalares se rechazan", () => {
    const entrada = { ...via, via: "variable-permiso" };
    for (const texto of ["null", "[]"]) expect(declaraciones(leer(texto, {}, {}, entrada))).toEqual([]);
    for (const texto of ['"deny"', '1', 'true'])
      expect(leer(texto, {}, {}, entrada)).toMatchObject({ exito: false, error: { codigo: "contenido-no-soportado" } });
  });
});

describe("T3-04 R-1", () => {
  test.each([{ X: "MARCA-VARIABLE" }, {}, { X: "" }])("conserva plantilla y condicion %j", variables => {
    const texto = '{"description":"a{env:X}b {env:X}"}';
    expect(declaraciones(leer(texto, variables))).toEqual([{ ruta: ["description"], valor: "a{env:X}b {env:X}",
      posicion: { linea: 1, columna: 2 }, sustituciones: [...texto.matchAll(/\{env:X\}/g)].map(m => ({
        tipo: "variable", origen: "X", definido: !!variables.X, posicion: posicion(texto, m.index),
      })) }]);
  });
});

describe("T3-04 R-2", () => {
  test.each([["./a", "/p/sub/a"], ["~/a", "/h/a"], ["/a", "/a"]])("resuelve %s sin publicar contenido", (ruta, absoluta) => {
    const d = declaraciones(leer(JSON.stringify({ prompt: `{file:${ruta}}` }), {}, { [absoluta!]: " \n MARCA-ARCHIVO \n " }))[0]!;
    expect(d).toMatchObject({ valor: `{file:${ruta}}`, sustituciones: [{ tipo: "archivo", origen: absoluta, definido: true }] });
    expect(JSON.stringify(d)).not.toContain("MARCA-ARCHIVO");
  });
  test("contenido relativo al proyecto y posicion tras expansion env", () => {
    const texto = '{"a":"{env:X}",\r\n"prompt":"{file:./a}"}';
    const d = declaraciones(leer(texto, { X: "muchas-letras" }, { "/p/a": "contenido" },
      { via: "variable-contenido", referencia: "OPENCODE_CONFIG_CONTENT", condicion: "definida" }))[1]!;
    expect(d.sustituciones).toEqual([{ tipo: "archivo", origen: "/p/a", definido: true, posicion: { linea: 2, columna: 11 } }]);
  });
  test.each(["/no-existe", "/directorio", "/ilegible"])("falla con ruta original y posicion: %s", ruta => {
    const texto = JSON.stringify({ prompt: `{file:${ruta}}` });
    const e = entorno({}, { "/ilegible": "" });
    const r = leerEntrada(via, texto, { ...e, leer() { throw new Error("MARCA-EXCEPCION"); } }, contexto);
    expect(r).toMatchObject({ exito: false, error: { codigo: "entrada-ilegible", ilegible: {
      posicion: posicion(texto, texto.indexOf("{file:")), consecuencia: "falla", archivo: ruta,
    } } });
    if (r.exito) throw new Error("Se esperaba error");
    expect(r.error.mensaje).toContain(ruta);
    expect(JSON.stringify(r)).not.toContain("MARCA-EXCEPCION");
  });
  test("un archivo inaccesible incluso al comprobar el tipo produce el mismo diagnostico protegido", () => {
    const e = entorno();
    const r = leerEntrada(via, '{"prompt":"{file:./a}"}', { ...e, tipo() { throw new Error("MARCA-ACCESO"); } }, contexto);
    expect(r).toMatchObject({ exito: false, error: { codigo: "entrada-ilegible", ilegible: { archivo: "/p/sub/a", consecuencia: "falla" } } });
    expect(JSON.stringify(r)).not.toContain("MARCA-ACCESO");
  });
});

describe("T3-04 R-3", () => {
  test("comentarios env no declaran valores; file tras // no se lee", () => {
    expect(declaraciones(leer('// {env:X} {file:no-existe}\n{}', { X: "sin-efecto" }))).toEqual([]);
    expect(declaraciones(leer('/* {env:X} */ {}', { X: "sin-efecto" }))).toEqual([]);
    expect(declaraciones(leer('// {file:no-existe}\r\n{"a":1}'))[0]!.posicion).toEqual({ linea: 2, columna: 2 });
  });
  test("file en bloque se lee como en el binario (codigo 1)", () => {
    expect(leer('/* {file:no-existe} */ {}')).toMatchObject({ exito: false, error: { codigo: "entrada-ilegible", ilegible: { consecuencia: "falla" } } });
  });
  test("una sustitucion en comentarios dentro de una hoja tampoco anota su valor", () => {
    const ds = declaraciones(leer('{"vacio":{/*{env:X}*/},"lista":[/*{env:X}*/1]}', { X: "sin-efecto" }));
    expect(ds.every(d => !d.sustituciones)).toBe(true);
  });
});

describe("T3-04 R-4", () => {
  test.each(["{file:{env:X}}", "{file:./{env:X}/a}"])("rechaza ruta interpolada antes de leer: %s", token => {
    for (const existe of [false, true]) {
      const e = entorno({ X: "MARCA-RUTA" }, existe ? { "/p/sub/MARCA-RUTA": "x", "/p/sub/MARCA-RUTA/a": "x" } : {});
      const r = leerEntrada(via, JSON.stringify({ prompt: token }), { ...e, leer() { throw new Error("No debe leer ningun archivo"); } }, contexto);
      expect(r).toMatchObject({ exito: false, error: { codigo: "contenido-no-soportado" } });
      expect(JSON.stringify(r)).not.toContain("MARCA-RUTA");
    }
  });
  test.each([
    ['{"a":"{env:X}"}', "{file:MARCA-INYECTADA}", "contenido-no-soportado"],
    ['{"a":"{env:X}"}', 'a","k":"MARCA-ESTRUCTURA', "contenido-no-soportado"],
    ['// {env:X}\n{}', "\n} MARCA-LINEA", "entrada-ilegible"],
    ['/* {env:X} */ {}', "*/ } MARCA-BLOQUE", "entrada-ilegible"],
    ['{"a":"{env:X}"}', '"', "entrada-ilegible"],
  ])("verifica %s sin emitir el contenido", (texto, contenido, codigo) => {
    const r = leer(texto!, { X: contenido! });
    expect(r).toMatchObject({ exito: false, error: { codigo } });
    expect(JSON.stringify(r)).not.toContain("MARCA-");
    if (codigo === "entrada-ilegible") expect(r).toMatchObject({ error: { ilegible: {
      posicion: posicion(texto!, texto!.indexOf("{env:")), consecuencia: "falla",
    } } });
  });
  test("admite escape valido y repeticiones con posiciones originales UTF-16", () => {
    const texto = '{/*😀*/"a":"{env:X}","b":"{env:X}"}';
    const ds = declaraciones(leer(texto, { X: "\\t" }));
    expect(ds.map(d => d.valor)).toEqual(["{env:X}", "{env:X}"]);
    expect(ds.map(d => d.sustituciones![0]!.posicion)).toEqual([posicion(texto, texto.indexOf("{env:")), posicion(texto, texto.lastIndexOf("{env:"))]);
  });
});

describe("T3-04 R-5", () => {
  test("tokens vacios permanecen literales en lector y secuenciador", () => {
    const ds = declaraciones(leer('{"agent":{"x":{"description":"{env:} {file:}"}}}'));
    expect(ds[0]).not.toHaveProperty("sustituciones");
    const r = adaptadorOpenCode.secuenciar([{ orden: 0, via, declaraciones: ds }]);
    expect(r).toMatchObject({ exito: true, valor: { noResueltas: [] } });
  });
});

describe("T3-04 R-6", () => {
  test("tambien rechaza sustituciones de claves dentro de arreglos y distingue escapes del texto crudo", () => {
    expect(leer('{"lista":[{"{env:K}":1}]}', { K: "model" })).toMatchObject({ exito: false, error: { codigo: "contenido-no-soportado" } });
    const d = declaraciones(leer('{"permission":{"bash":{"\\u007benv:P} *":"{env:A}"}}}', { A: "deny" }))[0]!;
    expect(d.ruta).toEqual(["permission", "bash", "{env:P} *"]);
    expect(d.sustituciones?.map(s => s.origen)).toEqual(["A"]);
  });
  test("excluye solo permisos y modo validado; conserva origen y condicion", () => {
    const texto = '{"permission":{"bash":{"{env:P} *":{"hija":"deny"}},"read":"{env:A}"},"agent":{"x":{"permission":{"edit":"{env:A}"},"mode":"{env:M}"},"y":{"description":"{env:A}"}}}';
    const ds = declaraciones(leer(texto, { P: "ls", A: "deny", M: "subagent" }));
    const r = adaptadorOpenCode.secuenciar([{ orden: 3, via, declaraciones: ds }]);
    expect(r.exito).toBe(true);
    if (!r.exito) throw new Error(r.error.mensaje);
    expect(r.valor.noResueltas.map(p => p.ruta)).toEqual([
      ["permission", "bash", "{env:P} *"], ["permission", "read"], ["agent", "x", "permission", "edit"], ["agent", "x"],
    ]);
    for (const p of r.valor.noResueltas) expect(p.sustituciones).toEqual([expect.objectContaining({ orden: 3, referencia: via.referencia, definido: true })]);
    expect(r.valor.aplicaciones.find(a => a.ruta.join("/") === "agent/y/description")?.sustituciones).toHaveLength(1);
  });
  test.each([
    ['{"agent":{"{env:A}":{"description":"x"}}}', "contenido-no-soportado"],
    ['{"{env:K}":1}', "contenido-no-soportado"],
    ['{"agent":{"x":{"hidden":"{env:H}"}}}', "configuracion-invalida"],
    ['{"agent":{"x":{"disable":"{env:H}"}}}', "configuracion-invalida"],
    ['{"agent":{"x":{"mode":"{env:M}"}}}', "configuracion-invalida"],
  ])("rechaza claves y propiedades invalidas %s", (texto, codigo) => {
    const resultado = leer(texto!, { A: "MARCA-AGENTE", K: "MARCA-CLAVE", H: "MARCA-BOOLEANO", M: "MARCA-MODO" });
    expect(resultado).toMatchObject({ exito: false, error: { codigo } });
    expect(JSON.stringify(resultado)).not.toContain("MARCA-");
  });
  test("acumula exclusiones de entradas distintas y el listado observa el modo excluido", () => {
    const e = entorno({ M: "subagent", A: "allow", B: "deny" }, {
      "/h/.config/opencode/opencode.json": '{"permission":{"read":"{env:A}"}}',
      "/p/opencode.json": '{"permission":{"read":"{env:B}"},"agent":{"x":{"mode":"{env:M}"}}}',
    });
    const r = resolver(adaptadorOpenCode, "/p", e);
    expect(r.exito).toBe(true);
    if (!r.exito) throw new Error(r.error.mensaje);
    expect(r.valor.noResueltas[0]!.sustituciones?.map(s => [s.origen, s.orden, s.referencia])).toEqual([
      ["A", 1, "/h/.config/opencode/opencode.json"], ["B", 2, "/p/opencode.json"],
    ]);
    const ctx = adaptadorOpenCode.contexto("/p", e);
    if (!ctx.exito) throw new Error(ctx.error.mensaje);
    expect(adaptadorOpenCode.listarAgentes(r.valor, ctx.valor).agentes.find(a => a.nombre === "x")?.estado).toBe("no-observado");
  });
});

describe("T3-04 R-7", () => {
  test("markdown y permiso no expanden y el secuenciador no redetecta plantillas", () => {
    const e = entorno({ X: '" MARCA-LITERAL' });
    for (const [entrada, texto] of [
      [{ ...via, via: "markdown", elemento: ["agent", "x"] }, '---\ndescription: "{env:X}"\n---\n{file:no-existe}'],
      [{ ...via, via: "variable-permiso" }, '{"read":"{env:X}"}'],
    ] as const) {
      const ctx = adaptadorOpenCode.contexto("/p", e);
      if (!ctx.exito) throw new Error(ctx.error.mensaje);
      const r = adaptadorOpenCode.leer(entrada, texto, e, ctx.valor);
      expect(r.exito).toBe(true);
      if (!r.exito) throw new Error(r.error.mensaje);
      expect(r.valor.every(d => !d.sustituciones)).toBe(true);
      const s = adaptadorOpenCode.secuenciar([{ orden: 0, via: entrada, declaraciones: r.valor }]);
      expect(s.exito && s.valor.noResueltas.every(p => p.regla !== "sustitucion-no-incorporada")).toBe(true);
    }
  });
});

describe("T3-04 R-11", () => {
  test("no incorpora la huella del contenido de archivos referenciados y deduplica las ternas", () => {
    function analizar(contenido: string) {
      const e = entorno({ X: "definida" }, { "/p/opencode.json": '{"a":"{file:./a} {env:X} {env:X}"}', "/p/a": contenido });
      const r = resolver(adaptadorOpenCode, "/p", e);
      if (!r.exito) throw new Error(r.error.mensaje);
      const lista: unknown[] = r.valor.entradas.map(v => [v.via, v.referencia, v.condicion, v.resumen]);
      lista.push([["archivo", "/p/a", true], ["variable", "X", true]]);
      expect(r.valor.resumenEntradas).toBe(e.resumir(JSON.stringify(lista)));
      return r.valor.resumenEntradas;
    }
    expect(analizar("MARCA-ARCHIVO-UNO")).toBe(analizar("MARCA-ARCHIVO-DOS"));
  });
  test("resumen depende de condicion, nunca del contenido, y preserva el caso sin sustituciones", () => {
    function resumen(X?: string) {
      const e = entorno(X === undefined ? {} : { X }, { "/p/opencode.json": '{"agent":{"x":{"description":"{env:X}"}}}' });
      const r = resolver(adaptadorOpenCode, "/p", e);
      if (!r.exito) throw new Error(r.error.mensaje);
      return r.valor.resumenEntradas;
    }
    expect(resumen("uno")).toBe(resumen("otro"));
    expect(resumen("uno")).not.toBe(resumen());
    expect(resumen("")).toBe(resumen());
    const e = entorno({}, { "/p/opencode.json": '{"agent":{"x":{"description":"literal"}}}' });
    const r = resolver(adaptadorOpenCode, "/p", e);
    if (!r.exito) throw new Error(r.error.mensaje);
    expect(r.valor.resumenEntradas).toBe(e.resumir(JSON.stringify(r.valor.entradas.map(v => [v.via, v.referencia, v.condicion, v.resumen]))));
  });
});
