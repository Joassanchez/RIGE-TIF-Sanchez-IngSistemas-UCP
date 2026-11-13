import type { RespuestaEntradas } from "../../../aplicacion/respuestas/contrato-generado";
import { estadoVia } from "../../presentacion/vocabulario";
import {
  type ContextoPresentacion,
  proyecto,
  tabla,
  nombre,
  seguro,
  limites,
  terminar,
} from "./formato";

export function renderizarEntradas(r: RespuestaEntradas, c: ContextoPresentacion): string {
  const filas = r.entradas.map(e => [
    e.via,
    nombre(e.referencia),
    e.legibilidad === "ilegible" ? "ilegible" : e.condicion,
  ]);

  const lineasVias = (r.vias ?? []).flatMap(v => [
    `${seguro(v.via)}: ${estadoVia(v.estado)} (${v.cantidad})`,
    ...(c.todo ? v.revisados.map(rev => `Revisado: ${seguro(rev)}`) : []),
  ]);

  const lineas = [
    ...proyecto(r, c),
    "Precedencia: la de abajo prevalece",
    ...tabla(["VÍA", "ENTRADA", "CONDICIÓN"], filas, c),
    ...lineasVias,
    ...limites(r, c),
  ];

  const indivisibles = c.todo ? (r.vias ?? []).flatMap(v => v.revisados.map(seguro)) : [];
  return terminar(lineas, c, indivisibles);
}
