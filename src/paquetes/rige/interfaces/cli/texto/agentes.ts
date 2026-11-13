import type { RespuestaAgentes } from "../../../aplicacion/respuestas/contrato-generado";
import { modoAgente } from "../../presentacion/vocabulario";
import {
  type ContextoPresentacion,
  proyecto,
  tabla,
  seguro,
  ubicacion,
  limites,
  referencias,
  terminar,
} from "./formato";

export function renderizarAgentes(r: RespuestaAgentes, c: ContextoPresentacion): string {
  const filas = r.agentes.map(a => [a.nombre, a.origen, modoAgente(a.modo)]);
  const marcas = r.agentes.map(a => (a.oculto ? "oculto" : ""));
  const lineasEliminados = r.eliminados.map(
    a => `Eliminado: ${seguro(a.nombre)} · ${ubicacion(a.declaracion)}`
  );
  const lineasIncompleta = r.incompleta
    ? [`Análisis incompleto: ${r.motivos.map(seguro).join(", ")}`]
    : [];

  const lineas = [
    ...proyecto(r, c),
    ...tabla(["AGENTE", "ORIGEN", "MODO"], filas, c, false, marcas),
    ...lineasEliminados,
    ...lineasIncompleta,
    ...limites(r, c),
  ];

  const refs = referencias(r.eliminados.map(a => a.declaracion));
  return terminar(lineas, c, refs);
}
