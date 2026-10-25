import type { ErrorAnalisis, ObjetivoPermiso, SolicitudPermiso } from "@rige/nucleo/contrato/adaptador";
import type { Resultado } from "@rige/nucleo/resultado";
import type { ContextoOpenCode } from "./contexto";
import { prepararSujeto } from "./comando";

const herramientas = ["read", "edit", "write", "apply_patch", "bash", "glob", "grep", "webfetch", "task", "todowrite", "skill"];

export function prepararConsulta(contexto: ContextoOpenCode, solicitud: SolicitudPermiso): Resultado<ObjetivoPermiso, ErrorAnalisis> {
  const { proyecto, entorno, worktree } = contexto;
  const { herramienta, objetivo } = solicitud;
  if (herramienta === undefined) return { exito: true, valor: prepararSujeto(solicitud.sujeto, objetivo) };
  if (!herramientas.includes(herramienta)) return { exito: false, error: { categoria: "uso", codigo: "solicitud-invalida",
    mensaje: `Herramienta no soportada: ${herramienta}.` } };
  if (!["read", "edit", "write", "apply_patch"].includes(herramienta)) return { exito: true,
    valor: prepararSujeto(herramienta, objetivo) };
  const absoluto = entorno.esAbsoluta(objetivo) ? entorno.unir(objetivo) : entorno.unir(proyecto, objetivo);
  const relativa = entorno.relativa(worktree, absoluto);
  const contiene = (base: string) => {
    const ruta = entorno.relativa(base, absoluto);
    return ruta !== ".." && !ruta.startsWith("../") && !ruta.startsWith("..\\") && !entorno.esAbsoluta(ruta);
  };
  const fuera = !contiene(proyecto) && (worktree === "/" || !contiene(worktree));
  return { exito: true, valor: { sujeto: herramienta === "read" ? "read" : "edit",
    objetivoEvaluado: herramienta === "apply_patch" ? relativa.replaceAll("\\", "/") : relativa,
    motivoSinDecision: fuera ? "fuera-del-arbol" : null } };
}
