import { borrarTemporal } from "./borrar-temporal";
import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { crearInstalacionOpenCode, instalacionEnMemoria } from "./instalacion-opencode";
import { crearEntornoMemoria } from "./entorno-memoria";

describe("T3-01 R-12 instalacion falsa", () => {
  test("disco y memoria contienen envoltorios y el paquete solo si hay version", () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-instalacion-"));
    try {
      for (const version of ["1.18.25", null]) {
        const directorio = join(temporal, version ?? "sin-paquete", "instalacion-falsa");
        crearInstalacionOpenCode(directorio, version);
        const memoria = instalacionEnMemoria(directorio, version);
        expect(memoria.variables.PATH).toBe(directorio);
        for (const [ruta, texto] of Object.entries(memoria.archivos)) expect(readFileSync(ruta, "utf8")).toBe(texto);
        expect(existsSync(join(directorio, "opencode"))).toBe(true);
        expect(existsSync(join(directorio, "opencode.cmd"))).toBe(true);
        expect(existsSync(join(directorio, "node_modules/opencode-ai/package.json"))).toBe(version !== null);
      }
    } finally { borrarTemporal(temporal); }
  });
  test("memoria resuelve enlaces y todas las operaciones de rutas Windows", () => {
    const entorno = crearEntornoMemoria({ rutas: "win32", plataforma: "win32",
      archivos: { "C:/npm/./opencode.cmd": "envoltorio" }, directorios: ["C:/npm/./carpeta"],
      enlaces: { "C:/npm/opencode.cmd": "C:/lib/../lib/binario.exe" } });
    expect(entorno.real("C:\\npm\\opencode.cmd")).toBe("C:\\lib\\binario.exe");
    expect(entorno.real("C:/npm/carpeta")).toBe("C:\\npm\\carpeta");
    expect(entorno.tipo("C:\\npm\\opencode.cmd")).toBe("archivo");
    expect(entorno.leer("C:\\npm\\opencode.cmd").texto).toBe("envoltorio");
    expect(entorno.unir("C:/npm", "carpeta", "..")).toBe("C:\\npm");
    expect(entorno.padre("C:/npm/carpeta")).toBe("C:\\npm");
    expect(entorno.relativa("C:/npm", "C:/npm/carpeta")).toBe("carpeta");
    expect(entorno.esAbsoluta("C:/npm")).toBe(true);
    expect(entorno.listar("C:/npm/carpeta")).toEqual([]);
  });
});
