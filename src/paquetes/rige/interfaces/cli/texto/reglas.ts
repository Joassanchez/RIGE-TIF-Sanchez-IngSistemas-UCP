import type { RespuestaReglas } from "../../../aplicacion/respuestas/contrato-generado";
import { rolEfecto } from "../../presentacion/roles";
import { decisionTexto as efecto, efectoRegla, motivoNoResolucion } from "../../presentacion/vocabulario";
import {
  type CeldaTabla,
  type ContextoPresentacion,
  pintar,
  proyecto,
  tabla,
  seguro,
  regla,
  referencias,
  terminar,
  unirBloques,
} from "./formato";

export function renderizarReglas(r: RespuestaReglas, c: ContextoPresentacion): string {
  const ctx: ContextoPresentacion = { ...c, proyecto: c.proyecto ?? r.proyecto };
  const explicarCodigo = (codigo: string) => seguro(motivoNoResolucion(codigo, r.reglas));
  const visible = (codigo: string) => ctx.explicar || !ctx.limitesGenerales.has(codigo);

  const comunes = (obtener: (f: RespuestaReglas["matriz"]["filas"][number]) => readonly string[]) =>
    r.matriz.filas.length
      ? [...new Set(obtener(r.matriz.filas[0]!))].filter(s => r.matriz.filas.every(f => obtener(f).includes(s)))
      : [];

  const ejesComunes = comunes(f => f.ejesParciales);
  const avisosComunes = comunes(f => [...f.declaraciones, ...f.advertencias]).filter(visible);
  const motivo = (codigo: string) =>
    codigo === "eje-parcialmente-observado"
      ? `${pintar("parcial", "parcial", ctx)}; no hay decisión sin un objetivo concreto`
      : explicarCodigo(codigo);

  const filas: CeldaTabla[][] = r.matriz.filas.map(f => [
    f.agente === r.agente ? { texto: `▸ ${f.agente}`, rol: "rige" as const } : `  ${f.agente}`,
    ...r.matriz.sujetos.map((s): CeldaTabla => {
      const celda = f.celdas.find(cel => cel.sujeto === s);
      if (!celda || celda.efecto === null) {
        return f.ejesParciales.includes(s)
          ? { texto: "◐", rol: "parcial" }
          : { texto: "—", rol: "estructura" };
      }
      return f.ejesParciales.includes(s)
        ? { texto: "◐", rol: "parcial" }
        : { texto: efecto(celda.efecto).split(" ")[0]!, rol: rolEfecto(celda.efecto) };
    }),
  ]);

  const leyendaEfectos = ["allow", "ask", "deny"]
    .map(e => `${pintar(rolEfecto(e), efecto(e).split(" ")[0]!, ctx)} ${efectoRegla(e)}`)
    .join(" · ");
  const leyendaSimbolos = `${pintar("parcial", "◐", ctx)} ${pintar("parcial", "parcial", ctx)}, sin decisión sobre un objetivo · ${pintar("estructura", "—", ctx)} sin decisión`;

  const lineasEjesComunes = ejesComunes.map(
    s => `${seguro(s)}: ${pintar("parcial", "parcial", ctx)} en todos los agentes; no hay decisión sin un objetivo concreto`
  );
  const lineasAvisosComunes = avisosComunes.length
    ? [`Todos los agentes: ${avisosComunes.map(explicarCodigo).join("; ")}`]
    : [];

  const lineasFilas = r.matriz.filas.flatMap(f => {
    const errorFila = f.error ? [`${seguro(f.agente)}: ${seguro(f.error.mensaje)}`] : [];
    const ejesParcialesFila = f.ejesParciales
      .filter(s => !ejesComunes.includes(s))
      .map(s => `${seguro(f.agente)}/${seguro(s)}: ${motivo("eje-parcialmente-observado")}`);
    const celdasFila = f.celdas
      .filter(celda => celda.motivo !== null && !f.ejesParciales.includes(celda.sujeto))
      .map(celda => `${seguro(f.agente)}/${seguro(celda.sujeto)}: ${motivo(celda.motivo!)}`);
    const avisosFila = [...new Set([...f.declaraciones, ...f.advertencias])]
      .filter(a => visible(a) && !avisosComunes.includes(a))
      .map(a => `${seguro(f.agente)}: ${explicarCodigo(a)}`);
    return [...errorFila, ...ejesParcialesFila, ...celdasFila, ...avisosFila];
  });

  const lineasNoObservados = r.matriz.noObservados.map(
    a => `No observado: ${seguro(a.nombre)}: ${explicarCodigo(a.motivo ?? "sin dato")}`
  );
  const lineasMotivos = r.matriz.motivos
    .filter(m => !r.matriz.noObservados.some(a => a.motivo === m))
    .map(explicarCodigo);

  const lineasCadena = ctx.todo ? [`Cadena de ${seguro(r.agente)}:`, ...r.cadena.map(reg => regla(reg, 1, ctx))] : [];

  const lineasAvisosGenerales = [...new Set([...r.declaraciones, ...r.advertencias])]
    .filter(a => visible(a) && !r.matriz.filas.some(f => f.declaraciones.includes(a) || f.advertencias.includes(a)))
    .map(a => `Aviso: ${explicarCodigo(a)}`);

  const lineas = unirBloques([
    proyecto(r, ctx),
    [pintar("rige", "Matriz", ctx), ...tabla(["AGENTE", ...r.matriz.sujetos], filas, ctx, false)],
    [leyendaEfectos, leyendaSimbolos],
    [
      ...lineasEjesComunes,
      ...lineasAvisosComunes,
      ...lineasFilas,
      ...lineasNoObservados,
      ...lineasMotivos,
    ],
    lineasCadena,
    lineasAvisosGenerales,
  ]);

  const indivisibles = [
    ...r.cadena.map(reg => seguro(reg.patron)),
    ...referencias(r.cadena.map(reg => reg.declaracion), ctx),
  ];

  return terminar(lineas, ctx, indivisibles);
}
