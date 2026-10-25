import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

export function copiarProyectoTemporal(origen: string): { raiz: string; borrar(): void } {
  const temporal = mkdtempSync(join(tmpdir(), "rige-proyecto-"));
  const raiz = join(temporal, "src");
  cpSync(origen, raiz, { recursive: true, filter: ruta => !["node_modules", ".git"].includes(basename(ruta)) });
  const enlazar = (desde: string, hasta: string) => symlinkSync(desde, hasta, process.platform === "win32" ? "junction" : "dir");
  enlazar(join(origen, "node_modules"), join(raiz, "node_modules"));
  for (const paquete of ["rige", "opencode"]) {
    const modulos = join(raiz, "paquetes", paquete, "node_modules");
    mkdirSync(join(modulos, "@rige"), { recursive: true });
    for (const dependencia of paquete === "rige" ? ["nucleo", "opencode"] : ["nucleo"]) {
      enlazar(join(raiz, "paquetes", dependencia), join(modulos, "@rige", dependencia));
    }
    if (paquete === "opencode") enlazar(join(origen, "paquetes/opencode/node_modules/jsonc-parser"), join(modulos, "jsonc-parser"));
  }
  return { raiz, borrar: () => {
    if (!resolve(temporal).startsWith(resolve(tmpdir()) + (process.platform === "win32" ? "\\" : "/"))) throw new Error("Copia fuera del temporal");
    rmSync(temporal, { recursive: true, force: true });
  } };
}
