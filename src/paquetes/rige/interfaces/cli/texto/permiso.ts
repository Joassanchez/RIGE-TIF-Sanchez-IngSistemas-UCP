import type { RespuestaPermiso } from "../../../aplicacion/respuestas/contrato-generado";
import { rolEfecto } from "../../presentacion/roles";
import { decisionTexto as efecto, motivoNoResolucion, motivoSinDecision } from "../../presentacion/vocabulario";
import {
  type ContextoPresentacion,
  pintar,
  proyecto,
  seguro,
  regla,
  limites,
  referencias,
  terminar,
  unirBloques,
} from "./formato";

export function renderizarPermiso(r: RespuestaPermiso, c: ContextoPresentacion): string {
  const ctx: ContextoPresentacion = { ...c, proyecto: c.proyecto ?? r.proyecto };
  const determinante = r.cadena.find(reg => reg.indice === r.determinante);
  const desplazadas = r.cadena.filter(
    reg => r.desplazadas.includes(reg.indice) && (r.determinante === null || reg.indice < r.determinante)
  );

  const lineaDecision = r.decision === null
    ? `${pintar("pregunta", efecto(null), ctx)}: ${seguro(motivoSinDecision(r.motivoSinDecision, r.reglas))}`
    : pintar(rolEfecto(r.decision), efecto(r.decision), ctx);
  const lineaConsulta = `Consulta: ${seguro(r.consulta.sujeto)} · ${seguro(r.consulta.objetivo)}`;
  const lineaDecide = `${pintar("rige", "Decide:", ctx)} ${determinante ? regla(determinante, 0, ctx, "rige") : "ninguna"}`;
  const lineaDesplaza = `${pintar("desplazado", "Desplaza:", ctx)} ${desplazadas.length ? regla(desplazadas.at(-1)!, 0, ctx, "desplazado") : "ninguna"}`;

  const lineaNativaAnulada = r.nativaAnulada
    ? [`${pintar("pregunta", "Protección nativa anulada:", ctx)} #${r.nativaAnulada.regla + 1} por #${r.nativaAnulada.por + 1}`]
    : [];

  const textosLimites = new Set(
    [...r.declaraciones, ...r.advertencias]
      .filter(codigo => ctx.explicar || !ctx.limitesGenerales.has(codigo))
      .flatMap(codigo => [
        seguro(motivoNoResolucion(codigo, r.reglas)),
        ...(r.reglas[codigo] ? [seguro(r.reglas[codigo])] : []),
      ])
  );

  const vistas = new Set<string>();
  const explicaciones = (r.explicacion ?? [])
    .map((texto, i) =>
      seguro(i === 0 && r.decision === null ? motivoSinDecision(r.motivoSinDecision, r.reglas) : texto)
    )
    .filter((texto, i) => {
      if (i > 0 && textosLimites.has(texto)) return false;
      if (vistas.has(texto)) return false;
      vistas.add(texto);
      return true;
    });

  const lineasExplicacion = ctx.explicar
    ? [
        ...explicaciones,
        "Cadena coincidente:",
        ...r.cadena
          .filter(reg => reg.indice === r.determinante || r.desplazadas.includes(reg.indice))
          .map(reg => regla(reg, 0, ctx, reg.indice === r.determinante ? "rige" : "desplazado")),
      ]
    : [];

  const lineasAdvertencias = r.advertencias
    .filter(a => ctx.explicar || !ctx.limitesGenerales.has(a))
    .map(a => `${pintar("pregunta", "Advertencia:", ctx)} ${seguro(motivoNoResolucion(a, r.reglas))}`);

  const lineas = unirBloques([
    [lineaDecision, ...proyecto(r, ctx), lineaConsulta],
    [lineaDecide, lineaDesplaza, ...lineaNativaAnulada],
    lineasExplicacion,
    [...lineasAdvertencias, ...limites(r, ctx)],
  ]);

  const indivisibles = [
    seguro(r.consulta.objetivo),
    ...r.cadena.map(reg => seguro(reg.patron)),
    ...referencias(r.cadena.map(reg => reg.declaracion), ctx),
  ];

  return terminar(lineas, ctx, indivisibles);
}
