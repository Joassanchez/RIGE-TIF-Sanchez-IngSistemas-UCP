import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { ValorSustituido } from "../../paquetes/nucleo/contrato/adaptador";
import { analizarFuente, extraerImports } from "../utilidades/analisis-arquitectura";

// Tambien lo comprueba tsc: no hay ningun campo de contenido ni de resumen.
type Claves = "tipo" | "origen" | "definido" | "posicion";
const clavesExactas: [Exclude<keyof ValorSustituido, Claves>, Exclude<Claves, keyof ValorSustituido>] extends [never, never] ? true : never = true;
describe("T3-04 R-9", () => {
  test("solo pruebas y herramientas pueden importar el oraculo, tambien con aliases y reexports", () => {
    expect(clavesExactas).toBe(true);
    for (const destino of ["./sustituciones-oraculo", "./sustituciones-oraculo.ts", "./sustituciones-oraculo.js", "@rige/opencode/sustituciones-oraculo"]) {
      for (const fuente of [`import { resumenesExpandidos } from "${destino}";`, `export * from "${destino}";`, `import("${destino}");`]) {
        expect(analizarFuente("paquetes/opencode/sonda.ts", fuente).some(h => h.motivo.includes("oraculo"))).toBe(true);
        expect(analizarFuente("paquetes/opencode/sonda.test.ts", fuente)).toEqual([]);
      }
    }
    const raiz = resolve(import.meta.dir, "../..");
    for (const ruta of new Bun.Glob("paquetes/**/*.ts").scanSync({ cwd: raiz })) {
      if (ruta.endsWith(".test.ts")) continue;
      expect(extraerImports(readFileSync(join(raiz, ruta), "utf8")).filter(i => i.destino.includes("sustituciones-oraculo"))).toEqual([]);
    }
  });
  test("esquemas publican la forma protegida sin cambiar esquema 2", async () => {
    for (const nombre of ["valores", "permiso", "agentes"]) {
      const e = await Bun.file(resolve(import.meta.dir, `../../esquemas/salida/${nombre}.json`)).json();
      expect(e.properties.esquema.const).toBe(2);
      expect(Object.keys(e.$defs.ValorSustituido.properties).sort()).toEqual(["definido", "origen", "posicion", "tipo"]);
      expect(e.$defs.Declaracion.properties.sustituciones.items.$ref).toBe("#/$defs/ValorSustituido");
    }
  });
});
