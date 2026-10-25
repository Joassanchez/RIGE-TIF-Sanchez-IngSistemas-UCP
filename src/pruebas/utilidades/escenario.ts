import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

export interface OpcionesEscenario { readonly git?: "raiz" | "proyecto" | "sintetico" | "ninguno"; readonly rutasNativas?: boolean }

export function copiarEscenario(nombre: string, opciones: OpcionesEscenario = {}): { readonly raiz: string; readonly proyecto: string; borrar(): void } {
  const origen = join(import.meta.dir, "../escenarios", nombre);
  const raiz = realpathSync.native(mkdtempSync(join(tmpdir(), "rige-escenario-")));
  cpSync(origen, raiz, { recursive: true, filter: ruta => basename(ruta) !== "REFERENCIA.json" });
  function sustituir(directorio: string): void {
    for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
      const ruta = join(directorio, entrada.name);
      if (entrada.isDirectory()) sustituir(ruta);
      else if (/\.jsonc?$/.test(entrada.name)) {
        const texto = readFileSync(ruta, "utf8");
        if (texto.includes("<RAIZ>")) writeFileSync(ruta, opciones.rutasNativas && process.platform === "win32"
          ? texto.replace(/<RAIZ>([^"\r\n]*)/g, (_, sufijo: string) => JSON.stringify(raiz + sufijo.replaceAll("/", "\\")).slice(1, -1))
          : texto.replaceAll("<RAIZ>", JSON.stringify(raiz.replaceAll("\\", "/")).slice(1, -1)));
      }
    }
  }
  sustituir(raiz);
  if (opciones.git !== "ninguno") {
    const git = join(raiz, opciones.git === "proyecto" || opciones.git === "sintetico" ? "proyecto/.git" : ".git");
    mkdirSync(git);
    writeFileSync(join(git, "HEAD"), "ref: refs/heads/main\n");
    if (opciones.git !== "sintetico") for (const nombre of ["objects", "refs"]) mkdirSync(join(git, nombre));
  }
  return { raiz, proyecto: realpathSync.native(join(raiz, "proyecto")), borrar: () => rmSync(raiz, { recursive: true, force: true }) };
}
