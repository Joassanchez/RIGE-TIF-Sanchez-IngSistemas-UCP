import type { ErrorAnalisis, ObjetivoPermiso } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import { descubrirWorktree } from "./worktree";

const herramientas = ["read", "edit", "write", "apply_patch", "bash", "glob", "grep", "webfetch", "task", "todowrite", "skill"];

export function prepararObjetivo(proyecto: string, herramienta: string, objetivo: string, entorno: EntornoLectura): Resultado<ObjetivoPermiso, ErrorAnalisis> {
  if (!herramientas.includes(herramienta)) return { exito: false, error: { categoria: "uso", codigo: "solicitud-invalida",
    mensaje: `Herramienta no soportada: ${herramienta}.` } };
  if (!["read", "edit", "write", "apply_patch"].includes(herramienta)) return { exito: true,
    valor: { sujeto: herramienta, objetivoEvaluado: objetivo, motivoSinDecision: null } };
  const descubrimiento = descubrirWorktree(proyecto, entorno);
  if (!descubrimiento.exito) return descubrimiento;
  const absoluto = entorno.esAbsoluta(objetivo) ? entorno.unir(objetivo) : entorno.unir(proyecto, objetivo);
  const relativa = entorno.relativa(descubrimiento.valor.worktree, absoluto);
  const fuera = relativa === ".." || relativa.startsWith("../") || relativa.startsWith("..\\") || entorno.esAbsoluta(relativa);
  return { exito: true, valor: { sujeto: herramienta === "read" ? "read" : "edit",
    objetivoEvaluado: herramienta === "apply_patch" ? relativa.replaceAll("\\", "/") : relativa,
    motivoSinDecision: fuera ? "fuera-del-arbol" : null } };
}
