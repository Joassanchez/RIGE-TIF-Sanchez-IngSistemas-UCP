import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { OpcionesEscenario } from "../../pruebas/utilidades/escenario";
import { esFalloGitfile } from "./aislamiento";

export interface ControlGit {
  modo: NonNullable<OpcionesEscenario["git"]>;
  comando: string[]; codigo: number; salida: string; error: string;
}

/** Controla la topologia del temporal, sin consultar ni imponer el worktree de RIGE. */
export function prepararGitReferencia(copia: { raiz: string; proyecto: string }, modo: ControlGit["modo"],
  cwd: string, env: Record<string, string>, contexto: string): ControlGit | undefined {
  if (modo === "sintetico" || modo === "ninguno") return undefined;
  const raizRepositorio = modo === "proyecto" ? copia.proyecto : copia.raiz;
  // Las topologias especiales ya tienen HEAD, objects, refs y config explicitos.
  if (modo !== "core.worktree" && modo !== "core.bare") {
    const inicio = Bun.spawnSync(["git", "init", "--quiet", "--initial-branch=main"], {
      cwd: raizRepositorio, env, stdout: "pipe", stderr: "pipe", timeout: 30000,
    });
    if (inicio.exitCode !== 0) throw new Error(`git init fallo en ${contexto} (estado ${inicio.exitCode}): ${inicio.stderr.toString().trim()}`);
  }
  const comando = ["git", "rev-parse", "--show-toplevel"];
  const resultado = Bun.spawnSync(comando, { cwd, env, stdout: "pipe", stderr: "pipe", timeout: 10000 });
  const salida = resultado.stdout.toString().trim();
  const error = resultado.stderr.toString().trim();
  const esperada = modo === "core.worktree" ? copia.proyecto : raizRepositorio;
  const coincide = (a: string, b: string) => process.platform === "win32"
    ? resolve(a).toLowerCase() === resolve(b).toLowerCase() : resolve(a) === resolve(b);
  const valida = modo === "core.bare"
    ? resultado.exitCode === 128 && !salida && /must be run in a work tree/i.test(error)
    : modo === "gitfile-roto"
      ? esFalloGitfile(resultado.exitCode, error, readFileSync(join(copia.proyecto, ".git"), "utf8"), copia.proyecto)
      : resultado.exitCode === 0 && Boolean(salida) && coincide(salida, esperada);
  if (!valida) throw new Error(`Worktree nativo no aislado en ${contexto} (estado ${resultado.exitCode}): ${error}`);
  const normalizar = (texto: string) => texto.replaceAll("\\", "/").replaceAll(copia.raiz.replaceAll("\\", "/"), "<RAIZ>");
  return { modo, comando, codigo: resultado.exitCode, salida: normalizar(salida), error: normalizar(error) };
}
