import type { EvaluacionNativa } from "../../herramientas/decisiones-nativas/registro";
import { normalizarRutaTemporal } from "../../herramientas/decisiones-nativas/registro";

interface RegistroNativo {
  agente: string; sujeto: string; objetivo?: string; herramienta?: string; lanzadoPor?: string;
  evaluaciones: EvaluacionNativa[]; herramientaNoOfrecida?: boolean; procedencia?: { plataforma: string };
}
type Referencia = { decisionesNativas?: RegistroNativo[] };
type Consulta = { agente: string; sujeto?: string; herramienta?: string; objetivo: string; lanzadoPor?: string };
function buscar(referencia: Referencia, consulta: Consulta) {
  const sujeto = consulta.sujeto ?? (consulta.herramienta === "read" ? "read" : "edit");
  return referencia.decisionesNativas?.find(d => d.agente === consulta.agente && d.sujeto === sujeto
    && d.objetivo === consulta.objetivo && d.lanzadoPor === consulta.lanzadoPor && (!d.herramienta || !consulta.herramienta || d.herramienta === consulta.herramienta));
}
export function oraculoDecision(referencia: Referencia, consulta: Consulta, plataforma = `${process.platform}-${process.arch}`): string {
  const registro = buscar(referencia, consulta);
  return registro && !registro.herramientaNoOfrecida && (!registro.procedencia || registro.procedencia.plataforma === plataforma)
    ? `nativa ${registro.procedencia?.plataforma ?? plataforma}` : "derivada";
}
/** null significa captura ausente, herramienta no ofrecida o plataforma distinta; nunca una decision calculada. */
export function decisionNativa(referencia: Referencia, consulta: Consulta, evaluado: string, raiz?: string,
  plataforma = `${process.platform}-${process.arch}`) {
  const registro = buscar(referencia, consulta);
  if (!registro || registro.procedencia && registro.procedencia.plataforma !== plataforma) return null;
  if (registro.herramientaNoOfrecida) return null;
  const objetivo = (raiz ? normalizarRutaTemporal(evaluado, raiz) : evaluado).replaceAll("\\", "/");
  const encontrado = registro.evaluaciones.find(e => e.sujeto === registro.sujeto && e.patronEvaluado.replaceAll("\\", "/") === objetivo);
  if (!encontrado) throw new Error("Referencia nativa sin evaluacion de la consulta");
  return { decision: encontrado.regla.action, regla: { sujeto: encontrado.regla.permission, patron: encontrado.regla.pattern, efecto: encontrado.regla.action } };
}
