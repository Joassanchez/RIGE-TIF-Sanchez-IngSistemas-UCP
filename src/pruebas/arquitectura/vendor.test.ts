import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { detectarVendor, validarProcedenciaReferencia } from "../utilidades/vendor";

describe("K-5 G-1 no circularidad del oraculo", () => {
  test("detecta imports directos, transitivos, reexports y ciclos", () => {
    for (const importacion of [
      'import { evaluate } from "../../paquetes/opencode/vendor/permiso"; export const esperado = evaluate("read", "x", "linux", []);',
      'import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador"; export const esperado = adaptadorOpenCode.permisos.evaluar([], "read", "x", "linux");',
      'import { evaluate as copia } from "../../paquetes/opencode/vendor/permiso"; export function esperado() { return copia("read", "x", "linux", []); }',
    ]) {
      const archivos = {
        "pruebas/aceptacion/sonda.test.ts": 'import { esperado } from "../utilidades/puente"; expect(actual).toEqual(esperado);',
        "pruebas/utilidades/puente.ts": importacion + '\nimport "../aceptacion/sonda.test";',
      };
      expect(detectarVendor(archivos)).toEqual(["pruebas/aceptacion/sonda.test.ts"]);
    }
    expect(detectarVendor({ "pruebas/aceptacion/sonda.test.ts": '// import "../../paquetes/opencode/vendor/permiso";\nconst texto = "vendor";' })).toEqual([]);
  });
  test("ningun esperado se construye con vendor ni permisos.evaluar", () => {
    const raiz = resolve(import.meta.dir, "../..");
    const archivos: Record<string, string> = {};
    for (const archivo of new Bun.Glob("{paquetes,pruebas,herramientas}/**/*.ts").scanSync({ cwd: raiz })) {
      const ruta = archivo.replaceAll("\\", "/");
      if (!ruta.split("/").includes("node_modules")) archivos[ruta] = readFileSync(resolve(raiz, ruta), "utf8");
    }
    expect(detectarVendor(archivos)).toEqual([]);
  });
  test("permite usar el adaptador real para producir el resultado observado", () => {
    expect(detectarVendor({ "pruebas/aceptacion/a.test.ts": 'import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador"; const actual = consultar(adaptadorOpenCode); expect(actual).toEqual(referencia);' })).toEqual([]);
    expect(detectarVendor({ "pruebas/aceptacion/a.test.ts": 'const esperado = adaptador.permisos.evaluar(reglas); expect(actual).toEqual(esperado);' })).toEqual(["pruebas/aceptacion/a.test.ts"]);
    expect(detectarVendor({ "pruebas/aceptacion/a.test.ts": 'import { evaluate } from "../../paquetes/opencode/vendor/permiso"; const actual = evaluate("read", "x", "linux", []); expect(actual).toEqual({ action: "ask" });' })).toEqual(["pruebas/aceptacion/a.test.ts"]);
  });
  test.each([
    'import { evaluar } from "../../paquetes/opencode/permisos"; evaluar(reglas);',
    'const { evaluar: decidir } = obj; decidir(reglas);',
    'obj["evaluar"](reglas);',
    'import * as permisos from "../../paquetes/opencode/permisos";',
  ])("X-2 rechaza acceso directo en aceptacion: %s", codigo => {
    expect(detectarVendor({ "pruebas/aceptacion/sonda.test.ts": codigo })).toEqual(["pruebas/aceptacion/sonda.test.ts"]);
  });
  test("X-2 las cadenas exigen debug agent, nunca agent list ni derivacion", () => {
    for (const comando of ["opencode agent list", ["opencode", "agent", "list"]]) {
      expect(validarProcedenciaReferencia({ cadenas: {}, procedencia: { comando } }, () => true)).not.toEqual([]);
    }
    expect(validarProcedenciaReferencia({ cadenas: {}, procedencia: { tipo: "derivada a mano", derivacion: "DERIVACION.md" } }, () => true)).not.toEqual([]);
    expect(validarProcedenciaReferencia({ cadenas: {}, procedencia: { comando: ["opencode", "debug", "agent", "build"] } }, () => false)).toEqual([]);
  });
  test("referencias de cadenas y decisiones declaran binario o derivacion comprobable", () => {
    const raiz = resolve(import.meta.dir, "../escenarios");
    expect(validarProcedenciaReferencia({ cadenas: {} }, () => false)).not.toEqual([]);
    expect(validarProcedenciaReferencia({ decisiones: [], procedencia: { decisiones: { tipo: "derivada a mano", derivacion: "DERIVACION.md" } } }, () => false)).not.toEqual([]);
    for (const archivo of new Bun.Glob("*/REFERENCIA.json").scanSync({ cwd: raiz })) {
      const referencia = JSON.parse(readFileSync(resolve(raiz, archivo), "utf8"));
      expect(validarProcedenciaReferencia(referencia, ruta => {
        try { return readFileSync(resolve(raiz, archivo, "..", ruta), "utf8").length > 0; } catch { return false; }
      }), archivo).toEqual([]);
    }
  });
});
