import { describe, expect, test } from "bun:test";
import type { Resultado } from "../../paquetes/nucleo/resultado";
import type { PuertoConfiguracion } from "../../paquetes/rige/aplicacion/puertos/configuracion";
import type { PuertoAlmacen } from "../../paquetes/rige/aplicacion/puertos/almacen";
import { analizarFuente, analizarGlobales, analizarManifiesto, comprobarGlobales } from "../utilidades/analisis-arquitectura";

describe("M-1 imports entre paquetes por workspace", () => {
  test("rechaza rutas relativas y admite subpaths declarados", () => {
    expect(analizarFuente("paquetes/opencode/sonda.ts", 'import "../nucleo/resultado";').length).toBeGreaterThan(0);
    expect(analizarFuente("paquetes/opencode/sonda.ts", 'import "@rige/nucleo/resultado";', {
      dependencias: { "@rige/nucleo": "workspace:*" },
    })).toEqual([]);
  });
});

describe("M-2 dependencias del workspace declaradas", () => {
  test("rechaza un subpath si falta su dependencia", () => {
    expect(analizarFuente("paquetes/opencode/sonda.ts", 'import "@rige/nucleo/resultado";', {
      dependencias: {},
    }).length).toBeGreaterThan(0);
  });
});

describe("M-6 globales limitados al borde autorizado", () => {
  const prohibidos = [
    ["rige/adaptadores/sistema/sonda.ts", 'Bun.write("archivo", "valor");'],
    ["rige/aplicacion/sonda.ts", "process.env;"],
    ["rige/interfaces/cli/sonda.ts", 'Bun.spawn(["comando"]);'],
    ["nucleo/sonda.ts", "globalThis.process;"],
    ["nucleo/sonda.ts", 'Bun["write"]("archivo", "valor");'],
    ["rige/interfaces/web/servidor.ts", 'Bun["serve"]({});'],
    ["rige/interfaces/web/servidor.ts", "Bun.spawn([]);"],
  ] as const;
  test("rechaza los globales no autorizados", () => {
    expect(prohibidos.map(caso => {
      const [archivo, codigo] = caso;
      return { caso, resultado: analizarGlobales(`paquetes/${archivo}`, codigo).length > 0 };
    })).toEqual(prohibidos.map(caso => ({ caso, resultado: true })));
  });
  const permitidos = [
    ["rige/interfaces/web/servidor.ts", "Bun.serve({});"],
    ["rige/arranque/rige.ts", "process.argv;"],
    ["nucleo/sonda.ts", '// Bun.write();\nconst texto = "process.env"; const regex = /Bun.write/;'],
    ["nucleo/sonda.test.ts", "Bun.write(); process.env;"],
  ] as const;
  test("admite los globales autorizados y el texto inerte", () => {
    expect(permitidos.map(caso => {
      const [archivo, codigo] = caso;
      return { caso, resultado: analizarGlobales(`paquetes/${archivo}`, codigo) };
    })).toEqual(permitidos.map(caso => ({ caso, resultado: [] })));
  });
});

describe("M-7 referencias solo a declaraciones de la misma carpeta", () => {
  const rutasProhibidas = ["../otro.ts", "../guion.d.ts", "./otro.ts", "/guion.d.ts", "..\\guion.d.ts"] as const;
  test("rechaza las referencias no autorizadas", () => {
    expect(rutasProhibidas.map(caso => {
      const ruta = caso;
      return { caso, resultado: analizarFuente("paquetes/rige/adaptadores/almacen-sqlite/esquema.ts",
      `/// <reference path="${ruta}" />\nexport {};`).length > 0 };
    })).toEqual(rutasProhibidas.map(caso => ({ caso, resultado: true })));
  });
  test("admite guion.d.ts de la misma carpeta", () => {
    expect(analizarFuente("paquetes/rige/adaptadores/almacen-sqlite/esquema.ts",
      '/// <reference path="./guion.d.ts" />\nexport {};')).toEqual([]);
  });
  test("detecta referencias con espacios en la asignacion", () => {
    expect(analizarFuente("paquetes/rige/adaptadores/sistema/configuracion.ts",
      '/// <reference path = "../otro.ts" />\nexport {};').length).toBeGreaterThan(0);
  });
});

describe("M-11 accesos indirectos a globales", () => {
  const prohibidos = [
    ["globalThis['process'];", "process"],
    ['globalThis["Bun"];', "Bun"],
    ['globalThis["process"].env;', "process"],
    ["globalThis['Bun'].write('archivo', 'valor');", "Bun"],
    ["process?.env;", "process"],
    ["Bun?.write('archivo', 'valor');", "Bun"],
    ["const { env } = process;", "process"],
    ["const { write } = Bun;", "Bun"],
    ["const entorno = process;", "process"],
    ["const runtime = Bun;", "Bun"],
  ] as const;
  test("rechaza los accesos indirectos a globales", () => {
    expect(prohibidos.map(caso => {
      const [codigo, global] = caso;
      const archivo = "paquetes/rige/aplicacion/sonda.ts";
      return { caso, resultado: analizarGlobales(archivo, codigo) };
    })).toEqual(prohibidos.map(caso => {
      const [codigo, global] = caso;
      const archivo = "paquetes/rige/aplicacion/sonda.ts";
      return { caso, resultado: [{ archivo, motivo: `Global no permitido: ${global}` }] };
    }));
  });
  const permitidos = [
    ["rige/aplicacion/sonda.ts", 'const texto = "globalThis[\'process\']; process?.env; const { write } = Bun";'],
    ["rige/aplicacion/sonda.ts", "// globalThis['Bun']; process?.env; const { env } = process;"],
    ["rige/aplicacion/sonda.ts", 'const texto = `globalThis["Bun"]; Bun?.write(); const { env } = process`;'],
    ["rige/aplicacion/sonda.ts", String.raw`const patron = /globalThis\["process"\]|Bun\?\.write|= process/;`],
    ["rige/aplicacion/sonda.ts", "const { env } = configuracion; const runtime = objeto['Bun'];"],
    ["rige/aplicacion/sonda.ts", 'const nombres = ["process", "Bun"];'],
    ["rige/interfaces/web/servidor.ts", "Bun.serve({});"],
    ["rige/arranque/rige.ts", 'const { env } = process; process?.argv; globalThis["process"];'],
    ["rige/aplicacion/sonda.test.ts", 'globalThis["Bun"]; const { env } = process;'],
  ] as const;
  test("admite los accesos autorizados y el texto inerte", () => {
    expect(permitidos.map(caso => {
      const [archivo, codigo] = caso;
      return { caso, resultado: analizarGlobales(`paquetes/${archivo}`, codigo) };
    })).toEqual(permitidos.map(caso => ({ caso, resultado: [] })));
  });
});

describe("T0-05 analisis de dependencias", () => {
  test("el scanner Bun omite imports de tipos: el analisis debe recuperarlos", async () => {
    const codigo = 'import type { Descriptor } from "@rige/opencode"; export type { Otro } from "@rige/opencode";';
    expect(new Bun.Transpiler({ loader: "ts" }).scanImports(codigo)).toEqual([]);
    expect(analizarFuente("paquetes/nucleo/sonda.ts", codigo).length).toBeGreaterThan(0);
  });

  const prohibidos = [
    ["nucleo/sonda.ts", 'import "@rige/opencode";'],
    ["nucleo/sonda.ts", 'import "../opencode/descriptor";'],
    ["nucleo/sonda.ts", 'import "node:fs";'],
    ["opencode/sonda.ts", 'export * from "../rige/aplicacion/errores";'],
    ["opencode/sonda.ts", 'import "ajena";'],
    ["rige/aplicacion/sonda.ts", 'import "../adaptadores/sistema/configuracion";'],
    ["rige/aplicacion/sonda.ts", 'import "@rige/opencode";'],
    ["rige/aplicacion/sonda.ts", 'import "node:path";'],
    ["rige/adaptadores/sistema/sonda.ts", 'import "../../aplicacion/casos-uso/preparar-almacen";'],
    ["rige/adaptadores/sistema/sonda.ts", 'import "../almacen-sqlite/esquema";'],
    ["rige/adaptadores/sistema/sonda.ts", 'import { writeFileSync } from "node:fs";'],
    ["rige/adaptadores/sistema/sonda.ts", 'import fs from "node:fs";'],
    ["rige/adaptadores/almacen-sqlite/sonda.ts", 'import { readFileSync } from "node:fs";'],
    ["rige/adaptadores/almacen-sqlite/sonda.ts", 'import * as fs from "node:fs";'],
    ["rige/interfaces/cli/sonda.ts", 'import "../../adaptadores/sistema/configuracion";'],
    ["rige/interfaces/cli/sonda.ts", 'import type { Puerto } from "../../aplicacion/puertos/almacen";'],
    ["rige/interfaces/cli/sonda.ts", 'import "@rige/nucleo";'],
    ["rige/interfaces/cli/sonda.ts", 'import "bun:sqlite";'],
    ["rige/arranque/sonda.ts", 'import "node:fs";'],
    ["rige/arranque/sonda.ts", 'import "bun:sqlite";'],
    ["rige/arranque/sonda.ts", 'import "node:https";'],
    ["rige/arranque/sonda.ts", 'import "node:child_process";'],
    ["rige/adaptadores/sistema/sonda.ts", 'import "@rige/rige/aplicacion/puertos/../../interfaces/cli/ejecutar";'],
    ["nucleo/sonda.ts", 'import { type Descriptor } from "@rige/opencode";'],
    ["nucleo/sonda.ts", 'export { type Descriptor } from "@rige/opencode";'],
    ["nucleo/sonda.ts", 'export { type Descriptor as "import" } from "@rige/opencode";'],
    ["nucleo/sonda.ts", 'import type { "export" as Descriptor } from "@rige/opencode";'],
    ["nucleo/sonda.ts", 'type T = import("@rige/opencode").Descriptor;'],
    ["nucleo/sonda.ts", 'const cargar = () => import("@rige/opencode");'],
    ["nucleo/sonda.ts", 'const paquete = require("@rige/opencode");'],
  ] as const;
  test("rechaza todas las dependencias prohibidas", () => {
    expect(prohibidos.map(caso => ({ caso, resultado: analizarFuente(`paquetes/${caso[0]}`, caso[1]).length > 0 })))
      .toEqual(prohibidos.map(caso => ({ caso, resultado: true })));
  });

  const permitidos = [
    ["nucleo/sonda.ts", 'import type { Resultado } from "./resultado";'],
    ["opencode/sonda.ts", 'import type { Resultado } from "@rige/nucleo/resultado";'],
    ["rige/aplicacion/sonda.ts", 'import type { Resultado } from "@rige/nucleo/resultado";'],
    ["rige/adaptadores/sistema/sonda.ts", 'import type { Puerto } from "../../aplicacion/puertos/configuracion";'],
    ["rige/adaptadores/sistema/sonda.ts", 'import { readFileSync as leer, existsSync } from "node:fs";'],
    ["rige/adaptadores/almacen-sqlite/sonda.ts", 'import { mkdirSync as crear } from "node:fs";'],
    ["rige/adaptadores/almacen-sqlite/sonda.ts", 'import { Database } from "bun:sqlite";'],
    ["rige/interfaces/cli/sonda.ts", 'import { parseArgs } from "node:util";'],
    ["rige/interfaces/cli/sonda.ts", 'import "../../aplicacion/casos-uso/consultar-estado";'],
    ["rige/interfaces/web/sonda.ts", 'import "../../aplicacion/respuestas/estado";'],
    ["rige/interfaces/cli/sonda.ts", 'import "../../aplicacion/errores";'],
    ["rige/arranque/sonda.ts", 'import "../adaptadores/sistema/configuracion";'],
  ] as const;
  test("admite todas las dependencias permitidas", () => {
    expect(permitidos.map(caso => ({ caso, resultado: analizarFuente(`paquetes/${caso[0]}`, caso[1]) })))
      .toEqual(permitidos.map(caso => ({ caso, resultado: [] })));
  });

  test("no confunde comentarios o cadenas con imports", async () => {
    expect(analizarFuente("paquetes/nucleo/sonda.ts", '// import "@rige/opencode";\nconst ejemplo = \'import "@rige/opencode";\';')).toEqual([]);
    expect(analizarFuente("paquetes/nucleo/sonda.ts", 'import "./../../../fuera";').length).toBeGreaterThan(0);
  });

  test("falla visiblemente ante imports calculados y no ejecuta la fuente", async () => {
    for (const codigo of ['import(nombre);', 'require(nombre);', 'const cargar = require;', 'import(`@rige/${nombre}`);', 'module.require("@rige/opencode");']) {
      expect(() => analizarFuente("paquetes/nucleo/sonda.ts", codigo)).toThrow("no analizable");
    }
    expect(() => analizarFuente("paquetes/nucleo/sonda.ts", "import {")).toThrow();
  });

  test("manifiestos controlados aun sin imports y tests separados del producto", async () => {
    expect(analizarManifiesto("nucleo", { dependencies: { "@rige/opencode": "workspace:*" } }).length).toBeGreaterThan(0);
    expect(analizarManifiesto("opencode", { dependencies: { "jsonc-parser": "^3.3.1" } }).length).toBeGreaterThan(0);
    expect(analizarManifiesto("opencode", { dependencies: { "jsonc-parser": "3.3.1" } })).toEqual([]);
    expect(analizarManifiesto("rige", { devDependencies: { ajena: "1.0.0" } }).length).toBeGreaterThan(0);
    expect(analizarFuente("paquetes/nucleo/resultado.test.ts", 'import {test} from "bun:test";')).toEqual([]);
    expect(analizarFuente("paquetes/nucleo/resultado.ts", 'import {test} from "bun:test";').length).toBeGreaterThan(0);
    expect(analizarFuente("paquetes/nucleo/resultado.ts", 'import "./resultado.test";').length).toBeGreaterThan(0);
  });


  test("descriptor y error minimo tienen contratos estables", async () => {
    const { versionSoportada } = await import("../../paquetes/opencode/descriptor");
    const { errorAlmacenSinEsquema } = await import("../../paquetes/rige/aplicacion/errores");
    expect(versionSoportada).toBe("1.18.25");
    expect(errorAlmacenSinEsquema.codigo).toBe("almacen-sin-esquema");
    expect(errorAlmacenSinEsquema.mensaje).toContain("bun run esquema");
  });

  test("los puertos permiten dobles puros y Resultado distingue exito y error", () => {
    const configuracion: PuertoConfiguracion = { leer: () => ({ exito: true, valor: { puerto: 4747, directorioAlmacen: "temporal" } }) };
    const almacen: PuertoAlmacen = {
      preparar: () => ({ exito: true, valor: { ruta: "temporal/rige.db", versionEsquema: 1 } }),
      consultar: () => ({ exito: false, error: { codigo: "almacen-sin-esquema", mensaje: "Ejecute bun run esquema" } }),
    };
    expect(configuracion.leer().exito).toBe(true);
    expect(almacen.preparar().exito).toBe(true);
    expect(almacen.consultar().exito).toBe(false);
    // @ts-expect-error Una respuesta fallida exige error, no valor.
    const invalido: Resultado<number, string> = { exito: false, valor: 1 };
    expect(invalido.exito).toBe(false);
  });

  test("exige declarar dependencias entre paquetes", async () => {
    for (const destino of ["@rige/nucleo", "../nucleo/resultado"]) {
      expect(analizarFuente("paquetes/opencode/sonda.ts", `import "${destino}";`, { dependencias: {} }).length).toBeGreaterThan(0);
    }
    expect(analizarFuente("paquetes/opencode/sonda.ts", 'import "jsonc-parser";', { dependencias: { "jsonc-parser": "3.3.1" } })).toEqual([]);
    expect(analizarFuente("paquetes/opencode/sonda.ts", 'import "jsonc-parser";')).not.toEqual([]);
  });

  test("las futuras unitarias usan tipos Bun de raiz sin contaminar el nucleo", async () => {
    const raiz = await Bun.file(new URL("../../tsconfig.json", import.meta.url)).json();
    const nucleo = await Bun.file(new URL("../../paquetes/nucleo/tsconfig.json", import.meta.url)).json();
    expect(raiz.include).toContain("paquetes/**/*.test.ts");
    expect(raiz.compilerOptions.types).toEqual(["bun"]);
    expect(nucleo.exclude).toContain("**/*.test.ts");
    expect(nucleo.compilerOptions.types).toEqual([]);
  });

  test("el recorrido lexico distingue regex de imports y conserva tipos en divisiones", () => {
    expect(analizarFuente("paquetes/nucleo/sonda.ts", 'const patron = /import "externo"/;')).toEqual([]);
    expect(analizarFuente("paquetes/nucleo/sonda.ts", 'const valor = a / (b as import("@rige/opencode").Tipo) / c;').length).toBeGreaterThan(0);
  });

  test("regresiones: conserva los tipos despues de regex con comillas", () => {
    const casos = ['/"/', "/'/"].flatMap(regex => ["import type {X} from '@rige/opencode';", "type X = import('@rige/opencode').X;",
      'import type {X} from "@rige/opencode";', 'type X = import("@rige/opencode").X;'].map(dependencia => ({ regex, dependencia })));
    expect(casos.map(caso => {
      const codigo = `const pattern = ${caso.regex}; ${caso.dependencia}`;
      return { caso, importsBun: new Bun.Transpiler({ loader: "ts" }).scanImports(codigo),
        rechazado: analizarFuente("paquetes/nucleo/x.ts", codigo).length > 0 };
    })).toEqual(casos.map(caso => ({ caso, importsBun: [], rechazado: true })));
  });

  test("regresion: regex de una funcion flecha no declara un import", () => {
    const codigo = 'const pattern = () => /import "external"/;';
    expect(new Bun.Transpiler({ loader: "ts" }).scanImports(codigo)).toEqual([]);
    expect(analizarFuente("paquetes/nucleo/x.ts", codigo)).toEqual([]);
  });

  test("no interpreta silenciosamente una regex con contexto gramatical ambiguo", () => {
    for (const codigo of ['if (condicion) /"/.test(texto); import type {X} from "@rige/opencode";',
      'if (condicion) /import "external"/.test(texto);']) {
      expect(new Bun.Transpiler({ loader: "ts" }).scanImports(codigo)).toEqual([]);
      expect(() => analizarFuente("paquetes/nucleo/x.ts", codigo)).toThrow("no analizable");
    }
  });
});

describe("T0-09 excepcion SQL limitada al almacen", () => {
  const origen = "paquetes/rige/adaptadores/almacen-sqlite/esquema.ts";

  const permitidos = ["../../../../esquemas/almacen/001_inicial.sql",
    "../../../../esquemas/almacen/../almacen/001_inicial.sql"] as const;
  test("admite los imports SQL normalizados", () => {
    expect(permitidos.map(caso => {
      const destino = caso;
      return { caso, resultado: analizarFuente(origen, `import guion from "${destino}" with { type: "text" };`) };
    })).toEqual(permitidos.map(caso => ({ caso, resultado: [] })));
  });

  const prohibidos = ["./ajeno.sql", "./../sistema/ajeno.sql", "../../../../esquemas/salida/ajeno.sql",
    "../../../../esquemas/almacen/../../ajeno.sql", "../../../../esquemas/almacen/inexistente.sql",
    "../../../../esquemas/almacen/001_inicial.sql/", "sql-externo", "esquemas/almacen/001_inicial.sql"] as const;
  test("rechaza los destinos SQL no autorizados", () => {
    expect(prohibidos.map(caso => {
      const destino = caso;
      return { caso, resultado: analizarFuente(origen, `import guion from "${destino}" with { type: "text" };`).length > 0 };
    })).toEqual(prohibidos.map(caso => ({ caso, resultado: true })));
  });

  test("la declaracion solo exporta string para SQL y no se interpreta como import", async () => {
    const archivo = "paquetes/rige/adaptadores/almacen-sqlite/guion.d.ts";
    const codigo = await Bun.file(new URL(`../../${archivo}`, import.meta.url)).text();
    expect(codigo).toMatch(/declare\s+module\s+["']\*\.sql["']\s*\{/);
    expect(codigo).toMatch(/const\s+(\w+)\s*:\s*string\s*;\s*export\s+default\s+\1\s*;/);
    expect(codigo).not.toMatch(/\bany\b/);
    expect(analizarFuente(archivo, codigo)).toEqual([]);
    const adaptador = await Bun.file(new URL(`../../${origen}`, import.meta.url)).text();
    expect(adaptador).toMatch(/^\s*\/\/\/\s*<reference\s+path=["']\.\/guion\.d\.ts["']\s*\/>/m);
  });
});

describe("M-9 SQL rechazado por origen no autorizado", () => {
  const capasProhibidas = ["nucleo", "opencode", "rige/aplicacion", "rige/adaptadores/sistema",
    "rige/interfaces/cli", "rige/arranque", "rige/adaptadores/almacen-sqlite-ajeno"] as const;
  test("rechaza SQL desde todas las capas no autorizadas", () => {
    expect(capasProhibidas.map(caso => {
      const capa = caso;
      const archivo = `paquetes/${capa}/sonda.ts`;
      const profundidad = `paquetes/${capa}`.split("/").length;
      const relativo = "../".repeat(profundidad) + "esquemas/almacen/001_inicial.sql";
      return { caso, resultado: analizarFuente(archivo, `import guion from "${relativo}" with { type: "text" };`) };
    })).toEqual(capasProhibidas.map(caso => {
      const capa = caso;
      const archivo = `paquetes/${capa}/sonda.ts`;
      const profundidad = `paquetes/${capa}`.split("/").length;
      const relativo = "../".repeat(profundidad) + "esquemas/almacen/001_inicial.sql";
      return { caso, resultado: [
        { archivo, motivo: `Origen SQL no autorizado: ${relativo} -> esquemas/almacen/001_inicial.sql` },
      ] };
    }));
  });
});

describe("Repositorio real", () => {
  test("cumple las restricciones de globales", async () => {
    expect(await comprobarGlobales()).toEqual([]);
  });
});
