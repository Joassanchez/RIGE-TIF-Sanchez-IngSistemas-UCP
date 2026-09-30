import { describe, expect, test } from "bun:test";
import type { Resultado } from "../../paquetes/nucleo/resultado";
import type { PuertoConfiguracion } from "../../paquetes/rige/aplicacion/puertos/configuracion";
import type { PuertoAlmacen } from "../../paquetes/rige/aplicacion/puertos/almacen";
import { analizarFuente, analizarManifiesto, comprobarDependencias } from "../utilidades/analisis-arquitectura";

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
  for (const [ruta, codigo] of prohibidos) {
    test(`rechaza ${ruta}: ${codigo}`, async () => {
      expect(analizarFuente(`paquetes/${ruta}`, codigo).length).toBeGreaterThan(0);
    });
  }

  const permitidos = [
    ["nucleo/sonda.ts", 'import type { Resultado } from "./resultado";'],
    ["opencode/sonda.ts", 'import type { Resultado } from "../nucleo/resultado";'],
    ["rige/aplicacion/sonda.ts", 'import type { Resultado } from "../../nucleo/resultado";'],
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
  for (const [ruta, codigo] of permitidos) {
    test(`admite ${ruta}: ${codigo}`, async () => {
      expect(analizarFuente(`paquetes/${ruta}`, codigo)).toEqual([]);
    });
  }

  test("resuelve aliases y no confunde comentarios o cadenas con imports", async () => {
    expect(analizarFuente("paquetes/nucleo/sonda.ts", 'import type { X } from "@interno/descriptor";', {
      aliases: { "@interno/*": ["paquetes/opencode/*"] },
    }).length).toBeGreaterThan(0);
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

  test("el repositorio real cumple toda la matriz", async () => {
    expect(await comprobarDependencias()).toEqual([]);
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

  test("prioriza aliases exactos y exige declarar dependencias entre paquetes", async () => {
    expect(analizarFuente("paquetes/nucleo/sonda.ts", 'import "@interno/descriptor";', {
      aliases: { "@interno/*": ["paquetes/nucleo/*"], "@interno/descriptor": ["paquetes/opencode/descriptor"] },
    }).length).toBeGreaterThan(0);
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

  for (const regex of ['/"/', "/'/"]) {
    for (const dependencia of ["import type {X} from '@rige/opencode';", "type X = import('@rige/opencode').X;",
      'import type {X} from "@rige/opencode";', 'type X = import("@rige/opencode").X;']) {
      test(`regresion: no pierde tipos despues de ${regex}: ${dependencia}`, () => {
        const codigo = `const pattern = ${regex}; ${dependencia}`;
        expect(new Bun.Transpiler({ loader: "ts" }).scanImports(codigo)).toEqual([]);
        expect(analizarFuente("paquetes/nucleo/x.ts", codigo).length).toBeGreaterThan(0);
      });
    }
  }

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
