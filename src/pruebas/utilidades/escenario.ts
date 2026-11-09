import { borrarTemporal } from "./borrar-temporal";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, parse, relative } from "node:path";

export interface OpcionesEscenario { readonly git?: "raiz" | "proyecto" | "sintetico" | "ninguno" | "gitfile-roto" | "dir-invalido-anidado" | "core.worktree" | "core.bare"; readonly rutasNativas?: boolean; readonly raizTemporal?: string }

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
        // Sin VCS, la forma exacta incluye el temporal relativo a la unidad del proyecto.
        // Se obtiene de la topologia del escenario, nunca del resultado de RIGE.
        const original = readFileSync(ruta, "utf8");
        const texto = original.replaceAll("<RAIZ_RELATIVA_UNIDAD>",
          JSON.stringify(relative(parse(raiz).root, raiz).replaceAll("\\", "/")).slice(1, -1));
        if (texto.includes("<RAIZ>")) writeFileSync(ruta, opciones.rutasNativas && process.platform === "win32"
          ? texto.replace(/<RAIZ>([^"\r\n]*)/g, (_, sufijo: string) => JSON.stringify(raiz + sufijo.replaceAll("/", "\\")).slice(1, -1))
          : texto.replaceAll("<RAIZ>", JSON.stringify(raiz.replaceAll("\\", "/")).slice(1, -1)));
        else if (texto !== original) writeFileSync(ruta, texto);
      }
    }
  }
  sustituir(raiz);
  if (opciones.git !== "ninguno") {
    const git = opciones.git === "core.bare" ? raiz : join(raiz, opciones.git === "proyecto" || opciones.git === "sintetico" ? "proyecto/.git" : ".git");
    if (git !== raiz) mkdirSync(git);
    writeFileSync(join(git, "HEAD"), "ref: refs/heads/main\n");
    if (opciones.git !== "sintetico") for (const nombre of ["objects", "refs"]) mkdirSync(join(git, nombre));
    if (opciones.git === "core.worktree" || opciones.git === "core.bare") writeFileSync(join(git, "config"),
      `[core]\n\trepositoryformatversion = 0\n\tbare = ${opciones.git === "core.bare"}\n${opciones.git === "core.worktree" ? "\tworktree = ../proyecto\n" : ""}`);
  }
  if (opciones.git === "gitfile-roto") writeFileSync(join(raiz, "proyecto/.git"), "gitdir: ../inexistente\n");
  if (opciones.git === "dir-invalido-anidado") {
    mkdirSync(join(raiz, "proyecto/.git"));
    writeFileSync(join(raiz, "proyecto/.git/HEAD"), "ref: refs/heads/main\n");
  }
  return { raiz, proyecto: realpathSync.native(join(raiz, "proyecto")), borrar: () => borrarTemporal(raiz) };
}
