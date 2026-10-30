import type { ContextoOpenCode } from "./contexto";

export function baseRelativa(contexto: Pick<ContextoOpenCode, "proyecto" | "entorno" | "parametros">): string {
  return contexto.parametros.worktree !== "/" ? contexto.parametros.worktree : raizUnidad(contexto);
}

export function raizUnidad(contexto: Pick<ContextoOpenCode, "proyecto" | "entorno">): string {
  // OpenCode 1.18.25 hace process.chdir al proyecto (cli/cmd/tui.ts:203, cli/cmd/run.ts:339): su "/" es la raiz de esa unidad.
  let raiz = contexto.proyecto;
  for (let padre = contexto.entorno.padre(raiz); padre !== raiz; padre = contexto.entorno.padre(raiz)) raiz = padre;
  return raiz;
}
