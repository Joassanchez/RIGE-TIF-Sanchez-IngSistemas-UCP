import type { ContextoOpenCode } from "./contexto";

export function baseRelativa(contexto: Pick<ContextoOpenCode, "proyecto" | "entorno" | "parametros">): string {
  if (contexto.parametros.worktree !== "/") return contexto.parametros.worktree;
  let raiz = contexto.proyecto;
  for (let padre = contexto.entorno.padre(raiz); padre !== raiz; padre = contexto.entorno.padre(raiz)) raiz = padre;
  return raiz;
}
