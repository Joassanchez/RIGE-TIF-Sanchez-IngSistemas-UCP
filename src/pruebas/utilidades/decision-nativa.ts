import type { EvaluacionNativa } from "../../herramientas/decisiones-nativas/registro";
import { normalizarRutaTemporal } from "../../herramientas/decisiones-nativas/registro";

interface RegistroNativo {
  agente: string; sujeto: string; objetivo?: string; herramienta?: string; lanzadoPor?: string;
  evaluaciones: EvaluacionNativa[]; herramientaNoOfrecida?: boolean; procedencia?: { plataforma: string };
}
/** null significa referencia nativa aun no obtenida, nunca una decision calculada. */
export function decisionNativa(referencia: { decisionesNativas?: RegistroNativo[] },
  consulta: { agente: string; sujeto?: string; herramienta?: string; objetivo: string; lanzadoPor?: string }, evaluado: string, raiz?: string) {
  const sujeto = consulta.sujeto ?? (consulta.herramienta === "read" ? "read" : "edit");
  const registro = referencia.decisionesNativas?.find(d => d.agente === consulta.agente && d.sujeto === sujeto
    && d.objetivo === consulta.objetivo && d.lanzadoPor === consulta.lanzadoPor && (!d.herramienta || !consulta.herramienta || d.herramienta === consulta.herramienta));
  if (!registro) return null;
  if (registro.procedencia && registro.procedencia.plataforma !== `${process.platform}-${process.arch}`) throw new Error("Referencia de otra plataforma");
  if (registro.herramientaNoOfrecida) return null;
  const objetivo = (raiz ? normalizarRutaTemporal(evaluado, raiz) : evaluado).replaceAll("\\", "/");
  const encontrado = registro.evaluaciones.find(e => e.sujeto === sujeto && e.patronEvaluado.replaceAll("\\", "/") === objetivo);
  if (!encontrado) throw new Error("Referencia nativa sin evaluacion de la consulta");
  return { decision: encontrado.regla.action, regla: { sujeto: encontrado.regla.permission, patron: encontrado.regla.pattern, efecto: encontrado.regla.action } };
}
