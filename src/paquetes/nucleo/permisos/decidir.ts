import type { Cadena } from "../resolucion/tipos";
import type { ConsultaPermiso, EvaluacionPermiso, PoliticaDecision, RastroDecision } from "./tipos";

export function decidir(cadena: Cadena, consulta: ConsultaPermiso, evaluacion: EvaluacionPermiso & PoliticaDecision, motivoPrevio: string | null = null): RastroDecision {
  const base = { agente: cadena.agente, declaraciones: evaluacion.declaraciones };
  const parcial = cadena.ejesParciales.includes(consulta.sujeto);
  if (motivoPrevio !== null || parcial) return { ...base,
    consulta: { ...consulta, objetivoEvaluado: motivoPrevio === null ? null : consulta.objetivo }, decision: null,
    motivoSinDecision: motivoPrevio ?? "eje-parcialmente-observado",
    porDefecto: false, coincidentes: [], determinante: null, desplazadas: [], nativaAnulada: null, advertencias: [],
  };
  const coincidentes = evaluacion.coincidentes.map(indice => {
    const regla = cadena.reglas.find(r => r.indice === indice);
    if (!regla) throw new Error("El evaluador devolvio un indice inexistente.");
    return regla;
  });
  const determinante = evaluacion.determinante === null ? null
    : coincidentes.find(r => r.indice === evaluacion.determinante);
  if (determinante === undefined) throw new Error("La determinante debe ser una regla coincidente.");
  const posicion = determinante === null ? -1 : coincidentes.indexOf(determinante);
  const desplazadas = coincidentes.slice(0, posicion < 0 ? 0 : posicion);
  // El orden de permisividad es vocabulario opaco proporcionado por el adaptador.
  const rango = (efecto: string): number => {
    const indice = evaluacion.ordenEfectos.indexOf(efecto);
    if (indice < 0) throw new Error("Efecto ausente del orden declarado por el adaptador.");
    return indice;
  };
  const ultimaNativa = desplazadas.findLast(r => r.origen.tipo === "nativo");
  const nativa = determinante?.origen.tipo === "declarado" && ultimaNativa
    && rango(ultimaNativa.efecto) === 0 && rango(determinante.efecto) > 0 ? ultimaNativa : undefined;
  return { ...base, consulta: { ...consulta, objetivoEvaluado: consulta.objetivo },
    decision: determinante?.efecto ?? evaluacion.efectoPorDefecto,
    motivoSinDecision: null, porDefecto: determinante === null,
    coincidentes, determinante: determinante?.indice ?? null, desplazadas: desplazadas.map(r => r.indice),
    nativaAnulada: nativa ? { regla: nativa.indice, por: determinante!.indice } : null,
    advertencias: nativa ? ["proteccion-nativa-anulada"] : [],
  };
}
