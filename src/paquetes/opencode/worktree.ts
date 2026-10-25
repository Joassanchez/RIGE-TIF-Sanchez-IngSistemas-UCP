import type { ErrorAnalisis } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";

export interface Worktree { readonly worktree: string; readonly declaraciones: readonly string[] }

/** Aproximacion autorizada en T2-08 (ADR-101 propuesto): solo lectura, nunca ejecuta git. */
export function descubrirWorktree(proyecto: string, entorno: EntornoLectura): Resultado<Worktree, ErrorAnalisis> {
  for (const nombre of ["GIT_DIR", "GIT_WORK_TREE", "GIT_CEILING_DIRECTORIES", "GIT_COMMON_DIR"]) {
    if (entorno.variable(nombre) !== undefined) return { exito: false, error: { categoria: "uso",
      codigo: "via-no-soportada", mensaje: `La detección del árbol no incorpora ${nombre}.` } };
  }
  const resolver = (base: string, ruta: string) => entorno.esAbsoluta(ruta) ? entorno.unir(ruta) : entorno.unir(base, ruta);
  const ejecutables = entorno.plataforma === "win32" ? ["git", "git.exe", "git.cmd"] : ["git"];
  const rutaPath = entorno.variable("PATH") ?? entorno.variable("Path");
  const directorios = rutaPath === undefined ? [] : rutaPath.split(entorno.plataforma === "win32" ? ";" : ":");
  const hayGit = directorios.some(dir => ejecutables.some(nombre =>
    entorno.tipo(entorno.unir(resolver(proyecto, dir.replace(/^"(.*)"$/, "$1") || "."), nombre)) === "archivo"));
  if (!hayGit) return { exito: true, valor: { worktree: "/", declaraciones: ["git-no-encontrado"] } };

  function estructura(git: string): string | null {
    if (entorno.tipo(git) !== "directorio" || entorno.tipo(entorno.unir(git, "HEAD")) !== "archivo") return null;
    const head = entorno.leer(entorno.unir(git, "HEAD")).texto.trim();
    if (!/^ref: refs\/[^\s]+$/.test(head) && !/^(?:[a-f\d]{40}|[a-f\d]{64})$/i.test(head)) return null;
    const commondir = entorno.unir(git, "commondir");
    const comun = entorno.tipo(commondir) === "archivo" ? resolver(git, entorno.leer(commondir).texto.trim()) : git;
    return ["objects", "refs"].every(nombre => entorno.tipo(entorno.unir(comun, nombre)) === "directorio") ? comun : null;
  }
  function aproximada(config: string): boolean {
    if (entorno.tipo(config) !== "archivo") return false;
    let seccion = "";
    for (const linea of entorno.leer(config).texto.split(/\r?\n/)) {
      const texto = linea.trim();
      const cabecera = /^\[([^\]]+)\]/.exec(texto);
      if (cabecera) { seccion = cabecera[1]!.toLowerCase(); continue; }
      const par = /^(\w+)\s*=\s*(.*?)\s*(?:[;#].*)?$/.exec(texto);
      if (!par) continue;
      const clave = par[1]!.toLowerCase();
      if (seccion === "core" && (clave === "worktree" || clave === "bare" && /^(true|yes|on|1)$/i.test(par[2]!))) return true;
    }
    return false;
  }
  const declaraciones = new Set<string>();
  let actual = entorno.unir(proyecto);
  for (;;) {
    // Un repositorio desnudo no representa el arbol de trabajo consultado.
    if (estructura(actual) && aproximada(entorno.unir(actual, "config"))) declaraciones.add("deteccion-git-aproximada");
    const candidato = entorno.unir(actual, ".git");
    let git: string | undefined;
    if (entorno.tipo(candidato) === "directorio") git = candidato;
    else if (entorno.tipo(candidato) === "archivo") {
      const destino = /^gitdir: (.+)\r?\n?$/.exec(entorno.leer(candidato).texto);
      if (destino) git = resolver(actual, destino[1]!.trim());
    }
    const comun = git === undefined ? null : estructura(git);
    if (git !== undefined && comun !== null) {
      if (aproximada(entorno.unir(comun, "config")) || comun !== git && aproximada(entorno.unir(git, "config"))) {
        declaraciones.add("deteccion-git-aproximada");
      }
      return { exito: true, valor: { worktree: actual, declaraciones: [...declaraciones] } };
    }
    // Git aborta ante el primer gitfile roto; un directorio incompleto si se ignora.
    if (entorno.tipo(candidato) === "archivo") return { exito: true,
      valor: { worktree: "/", declaraciones: [...declaraciones] } };
    const padre = entorno.padre(actual);
    if (padre === actual) break;
    actual = padre;
  }
  return { exito: true, valor: { worktree: "/", declaraciones: [...declaraciones] } };
}
