import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { copiarEscenario } from "../pruebas/utilidades/escenario";
import { crearEntornoAislado } from "../pruebas/utilidades/entorno-aislado";
import { archivosConfiguracion, generarReglas, multiplicarEscenario } from "./generar-escala";

function contenido(proyecto: string) {
  return Object.fromEntries(archivosConfiguracion(proyecto).map(ruta => [relative(proyecto, ruta), readFileSync(ruta).toString("hex")]));
}

describe("E-1 factor de tamano", () => {
  test("N=1 conserva bytes; N=3 multiplica elementos y conserva contenidos y formas", () => {
    const a = copiarEscenario("openchamber-doble"), b = copiarEscenario("openchamber-doble");
    try {
      const antes = contenido(a.proyecto);
      multiplicarEscenario(a.proyecto, 1);
      expect(contenido(a.proyecto)).toEqual(antes);
      multiplicarEscenario(a.proyecto, 3);
      multiplicarEscenario(b.proyecto, 3);
      expect(contenido(a.proyecto)).toEqual(contenido(b.proyecto));
      const config = JSON.parse(readFileSync(join(a.proyecto, ".opencode/opencode.json"), "utf8"));
      expect(Object.keys(config.agent)).toHaveLength(3);
      expect(config.agent["agent-1--escala-2"]).toEqual(config.agent["agent-1"]);
      expect(Object.keys(config.lsp)).toHaveLength(42);
      for (const [nombre, valor] of Object.entries(config.lsp)) {
        if (!nombre.includes("--escala-")) expect(config.lsp[`${nombre}--escala-3`]).toEqual(valor);
      }
      for (const [carpeta, cantidad] of [["agent", 33], ["commands", 60]] as const) {
        const dir = join(a.proyecto, ".opencode", carpeta);
        expect(readdirSync(dir)).toHaveLength(cantidad);
        for (const nombre of readdirSync(dir).filter(n => !n.includes("--escala-"))) {
          expect(readFileSync(join(dir, nombre.replace(".md", "--escala-2.md")))).toEqual(readFileSync(join(dir, nombre)));
        }
      }
      expect(archivosConfiguracion(a.proyecto)).toHaveLength(94);
      expect(() => multiplicarEscenario(a.proyecto, 0)).toThrow();
    } finally { a.borrar(); b.borrar(); }
  });
});

describe("E-2 serie de reglas", () => {
  test("diez patrones relativos distintos sin reglas tapadas ni rutas absolutas", () => {
    const copia = copiarEscenario("openchamber-doble");
    try {
      generarReglas(copia.proyecto, 10);
      const config = JSON.parse(readFileSync(join(copia.proyecto, "opencode.json"), "utf8"));
      expect(Object.keys(config.agent)).toEqual(["agent-1"]);
      const patrones = Object.keys(config.agent["agent-1"].permission.read);
      expect(patrones).toHaveLength(10);
      expect(new Set(patrones).size).toBe(10);
      expect(patrones.every(p => /^documentos\/archivo-\d+\.txt$/.test(p))).toBe(true);
      expect(archivosConfiguracion(copia.proyecto)).toHaveLength(1);
      const proceso = Bun.spawnSync([process.execPath, "run", "--silent", "rige", "hallazgos", "--proyecto", copia.proyecto], {
        cwd: join(import.meta.dir, ".."), env: crearEntornoAislado(copia.raiz, process.env), stdout: "pipe", stderr: "pipe",
      });
      expect(proceso.exitCode).toBe(0);
      const respuesta = JSON.parse(proceso.stdout.toString());
      expect(respuesta.hallazgos.filter((h: { tipo: string }) => h.tipo === "regla-sin-efecto")).toEqual([]);
    } finally { copia.borrar(); }
  });
});
