import type { RespuestaPermiso } from "../../../aplicacion/respuestas/contrato-generado";
import { decisionTexto as efecto, motivoSinDecision } from "../../presentacion/vocabulario";
import {
  type ContextoPresentacion,
  proyecto,
  seguro,
  regla,
  limites,
  referencias,
  terminar,
} from "./formato";

export function renderizarPermiso(r: RespuestaPermiso, c: ContextoPresentacion): string {
  const determinante = r.cadena.find(reg => reg.indice === r.determinante);
  const desplazadas = r.cadena.filter(
    reg => r.desplazadas.includes(reg.indice) && (r.determinante === null || reg.indice < r.determinante)
  );

  const lineaDecision = efecto(r.decision) + (
    r.decision === null ? `: ${seguro(motivoSinDecision(r.motivoSinDecision, r.reglas))}` : ""
  );
  const lineaConsulta = `Consulta: ${seguro(r.consulta.sujeto)} · ${seguro(r.consulta.objetivo)}`;
  const lineaDecide = `Decide: ${determinante ? regla(determinante) : "ninguna"}`;
  const lineaDesplaza = `Desplaza: ${desplazadas.length ? regla(desplazadas.at(-1)!) : "ninguna"}`;

  const lineaNativaAnulada = r.nativaAnulada
    ? [`Protección nativa anulada: #${r.nativaAnulada.regla + 1} por #${r.nativaAnulada.por + 1}`]
    : [];

  const lineasExplicacion = c.explicar
    ? [
        ...(r.explicacion ?? []).map((texto, i) =>
          seguro(i === 0 && r.decision === null ? motivoSinDecision(r.motivoSinDecision, r.reglas) : texto)
        ),
        "Cadena coincidente:",
        ...r.cadena
          .filter(reg => reg.indice === r.determinante || r.desplazadas.includes(reg.indice))
          .map(reg => regla(reg)),
      ]
    : [];

  const lineasAdvertencias = r.advertencias
    .filter(a => c.explicar || !c.limitesGenerales.has(a))
    .map(a => `Advertencia: ${seguro(r.reglas[a] ?? a)}`);

  const lineas = [
    lineaDecision,
    ...proyecto(r, c),
    lineaConsulta,
    lineaDecide,
    lineaDesplaza,
    ...lineaNativaAnulada,
    ...lineasExplicacion,
    ...lineasAdvertencias,
    ...limites(r, c),
  ];

  const indivisibles = [
    seguro(r.consulta.objetivo),
    ...r.cadena.map(reg => seguro(reg.patron)),
    ...referencias(r.cadena.map(reg => reg.declaracion)),
  ];

  return terminar(lineas, c, indivisibles);
}
