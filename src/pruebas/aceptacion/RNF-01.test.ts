import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { copiarEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { lanzar } from "../utilidades/subproceso";
import { borrarTemporal } from "../utilidades/borrar-temporal";

function inventario(raiz: string, relativo = ""): { ruta: string; sha256: string | null; mtime: number }[] {
  return readdirSync(join(raiz, relativo), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entrada => {
    const ruta = relativo ? `${relativo}/${entrada.name}` : entrada.name;
    const absoluta = join(raiz, ruta);
    return entrada.isDirectory() ? [{ ruta: `${ruta}/`, sha256: null, mtime: statSync(absoluta).mtimeMs }, ...inventario(raiz, ruta)]
      : [{ ruta, sha256: createHash("sha256").update(readFileSync(absoluta)).digest("hex"), mtime: statSync(absoluta).mtimeMs }];
  });
}

describe("RNF-01 CA-1 CA-2 CA-3 T5-04 W-6", () => {
  test("analisis completo conserva SHA-256, mtime e inventario de toda la copia, incluidos archivos incorporados por lectura", () => {
    const almacen = mkdtempSync(join(tmpdir(), "rige-solo-lectura-"));
    try {
      for (const nombre of ["v1-vias", "v3-entradas", "v3-sustituciones"]) {
        const referencia = JSON.parse(readFileSync(join(import.meta.dir, "../escenarios", nombre, "REFERENCIA.json"), "utf8"));
        const copia = copiarEscenario(nombre, { git: referencia.procedencia.git ?? "raiz" });
        try {
          const variables = { ...entornoDeReferencia(referencia, copia), RIGE_ALMACEN: almacen };
          // Se prepara todo antes de tomar el inventario. El .git sintetico delimita el descubrimiento.
          expect(lanzar(almacen, ["esquema"], variables).codigo).toBe(0);
          const antes = inventario(copia.raiz);
          expect(antes.filter(f => f.sha256 !== null).length).toBeGreaterThan(3);
          if (nombre === "v3-sustituciones") expect(antes.some(f => f.ruta.startsWith("entorno/") && f.sha256)).toBe(true);
          for (const argumentos of [["agentes"], ["entradas"], ["valores", "--agente", "build"], ["hallazgos"],
            ["permiso", "--agente", "build", "--herramienta", "read", "--objetivo", "src/a.js"]]) {
            const resultado = lanzar(almacen, [...argumentos, "--proyecto", copia.proyecto], variables);
            expect(resultado.codigo, resultado.error).toBe(0);
            expect(JSON.parse(resultado.salida).esquema).toBe(2);
          }
          const despues = inventario(copia.raiz);
          expect(despues.map(f => f.ruta)).toEqual(antes.map(f => f.ruta));
          expect(despues.map(f => [f.ruta, f.sha256])).toEqual(antes.map(f => [f.ruta, f.sha256]));
          expect(despues.map(f => [f.ruta, f.mtime])).toEqual(antes.map(f => [f.ruta, f.mtime]));
        } finally { copia.borrar(); }
      }
    } finally { borrarTemporal(almacen); }
  });
});
