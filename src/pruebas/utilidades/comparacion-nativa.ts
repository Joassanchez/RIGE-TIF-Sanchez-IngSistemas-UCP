import { test } from "bun:test";
import { normalizarRutaTemporal } from "../../herramientas/decisiones-nativas/registro";

export interface RegistroComparacion {
  (nombre: string, ejecutar: () => void | Promise<void>): void;
  todo(nombre: string, ejecutar: () => void): void;
}
interface OpcionesComparacion {
  caso: string; variante: string;
  consulta: { id: string; agente: string; sujeto: string; herramienta: string; objetivo: string; lanzadoPor?: string };
  referencia: { decisionesNativas?: readonly unknown[] };
  evaluado: string; raiz?: string; plataforma?: string; registrar?: RegistroComparacion;
}
interface DecisionCapturada {
  decision: string; regla: { sujeto: string; patron: string; efecto: string };
}
const esObjeto = (valor: unknown): valor is Record<string, unknown> => typeof valor === "object" && valor !== null && !Array.isArray(valor);

/** Las comparaciones nuevas nunca usan decisiones derivadas ni convierten capturas defectuosas en pendientes. */
export function compararConCapturaNativa(opciones: OpcionesComparacion,
  comparar: (decision: DecisionCapturada) => void | Promise<void>): void {
  const { consulta } = opciones;
  const plataforma = opciones.plataforma ?? `${process.platform}-${process.arch}`;
  const nombre = `${opciones.caso} / ${consulta.herramienta} / ${opciones.variante} / ${consulta.id} / ${plataforma}`;
  const registrar = opciones.registrar ?? test;
  // Sin procedencia se considera presente pero incompleta: debe fallar, no quedar como todo.
  const capturas = (opciones.referencia.decisionesNativas ?? []).filter(d => esObjeto(d)
    && (!esObjeto(d.procedencia) || !d.procedencia.plataforma || d.procedencia.plataforma === plataforma))
    .filter(d => esObjeto(d) && d.consulta === consulta.id);
  if (!capturas.length) {
    registrar.todo(`${nombre}: captura ausente`, () => {});
    return;
  }
  registrar(nombre, () => {
    const fallar = (motivo: string): never => { throw new Error(`${nombre}: captura nativa ${motivo}`); };
    if (capturas.length !== 1) fallar("duplicada");
    const captura = capturas[0];
    if (!esObjeto(captura)) return fallar("incompleta");
    if (!esObjeto(captura.procedencia) || captura.procedencia.plataforma !== plataforma
      || captura.procedencia.version !== "1.18.25") fallar("sin plataforma o version 1.18.25");
    for (const clave of ["agente", "sujeto", "herramienta", "objetivo", "lanzadoPor"] as const) {
      if (captura[clave] !== consulta[clave]) fallar(`inconsistente: ${clave}`);
    }
    if (captura.herramientaNoOfrecida) fallar("con herramienta no ofrecida");
    if (!Array.isArray(captura.evaluaciones) || !captura.evaluaciones.length) return fallar("sin evaluaciones");
    const normalizar = (valor: string) => (opciones.raiz ? normalizarRutaTemporal(valor, opciones.raiz) : valor).replaceAll("\\", "/");
    const coincidentes: DecisionCapturada[] = [];
    for (const evaluacion of captura.evaluaciones) {
      if (!esObjeto(evaluacion) || typeof evaluacion.sujeto !== "string" || typeof evaluacion.patronEvaluado !== "string"
        || !esObjeto(evaluacion.regla)) return fallar("con evaluacion incompleta");
      const regla = evaluacion.regla;
      if (typeof regla.permission !== "string" || typeof regla.pattern !== "string" || typeof regla.action !== "string"
        || !["allow", "ask", "deny"].includes(regla.action)) return fallar("con regla incompleta o accion invalida");
      if (evaluacion.sujeto !== consulta.sujeto || normalizar(evaluacion.patronEvaluado) !== normalizar(opciones.evaluado)) continue;
      if (regla.permission !== "*" && regla.permission !== consulta.sujeto) fallar("con regla de otro sujeto");
      coincidentes.push({ decision: regla.action, regla: { sujeto: regla.permission, patron: normalizar(regla.pattern), efecto: regla.action } });
    }
    const decision = coincidentes[0];
    if (!decision) return fallar("sin evaluacion del sujeto y objetivo esperados");
    if (coincidentes.some(d => JSON.stringify(d) !== JSON.stringify(decision))) fallar("con evaluaciones contradictorias");
    return comparar(decision);
  });
}
