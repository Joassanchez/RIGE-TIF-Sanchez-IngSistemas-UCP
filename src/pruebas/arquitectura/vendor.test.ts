import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { detectarVendor } from "../utilidades/vendor";

describe("G-1 no circularidad del oraculo", () => {
  test("detecta imports directos, transitivos, reexports y ciclos", () => {
    for (const importacion of [
      'import { evaluate } from "../../paquetes/opencode/vendor/permiso";',
      'export * from "../../paquetes/opencode/vendor/permiso";',
      'const copia = import("../../paquetes/opencode/vendor/permiso");',
      'const copia = require("../../paquetes/opencode/vendor/permiso");',
    ]) {
      const archivos = {
        "pruebas/aceptacion/sonda.test.ts": 'import "../utilidades/puente";',
        "pruebas/utilidades/puente.ts": importacion + '\nimport "../aceptacion/sonda.test";',
      };
      expect(detectarVendor(archivos)).toEqual(["pruebas/aceptacion/sonda.test.ts"]);
    }
    expect(detectarVendor({ "pruebas/aceptacion/sonda.test.ts": '// import "../../paquetes/opencode/vendor/permiso";\nconst texto = "vendor";' })).toEqual([]);
  });
  test("ninguna aceptacion alcanza vendor por sus imports", () => {
    const raiz = resolve(import.meta.dir, "../..");
    const archivos: Record<string, string> = {};
    for (const archivo of new Bun.Glob("{paquetes,pruebas,herramientas}/**/*.ts").scanSync({ cwd: raiz })) {
      const ruta = archivo.replaceAll("\\", "/");
      if (!ruta.split("/").includes("node_modules")) archivos[ruta] = readFileSync(resolve(raiz, ruta), "utf8");
    }
    expect(detectarVendor(archivos)).toEqual([]);
  });
});
