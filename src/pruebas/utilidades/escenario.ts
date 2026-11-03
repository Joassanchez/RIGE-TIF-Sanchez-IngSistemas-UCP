import { borrarTemporal } from "./borrar-temporal";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

export interface OpcionesEscenario { readonly git?: "raiz" | "proyecto" | "sintetico" | "ninguno" | "gitfile-roto" | "dir-invalido-anidado"; readonly rutasNativas?: boolean; readonly raizTemporal?: string }

export function copiarEscenario(nombre: string, opciones: OpcionesEscenario = {}): { readonly raiz: string; readonly proyecto: string; borrar(): void } {
  const origen = join(import.meta.dir, "../escenarios", nombre);
  // Una ruta explicita se reserva de forma exclusiva: nunca se reutiliza una copia ajena.
  const raiz = realpathSync.native(opciones.raizTemporal === undefined
    ? mkdtempSync(join(tmpdir(), "rige-escenario-"))
    : (mkdirSync(opciones.raizTemporal), opciones.raizTemporal));
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
  if (opciones.git === "gitfile-roto") writeFileSync(join(raiz, "proyecto/.git"), "gitdir: ../inexistente\n");
  if (opciones.git === "dir-invalido-anidado") {
    mkdirSync(join(raiz, "proyecto/.git"));
    writeFileSync(join(raiz, "proyecto/.git/HEAD"), "ref: refs/heads/main\n");
  }
  return { raiz, proyecto: realpathSync.native(join(raiz, "proyecto")), borrar: () => borrarTemporal(raiz) };
}
