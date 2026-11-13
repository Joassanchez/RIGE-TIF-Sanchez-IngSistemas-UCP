import type { RespuestaAgentes } from "../../../aplicacion/respuestas/contrato-generado";
import { rolOrigen } from "../../presentacion/roles";
import { modoAgente, motivoNoResolucion } from "../../presentacion/vocabulario";
import {
  type CeldaTabla,
  type ContextoPresentacion,
  pintar,
  proyecto,
  tabla,
  seguro,
  ubicacion,
  limites,
  referencias,
  terminar,
  unirBloques,
} from "./formato";

export function renderizarAgentes(r: RespuestaAgentes, c: ContextoPresentacion): string {
  const ctx: ContextoPresentacion = { ...c, proyecto: c.proyecto ?? r.proyecto };
  const filas: CeldaTabla[][] = r.agentes.map(a => [
    a.nombre,
    { texto: a.origen, rol: rolOrigen(a.origen) },
    modoAgente(a.modo),
  ]);
  const marcas = r.agentes.map(a => (a.oculto ? "oculto" : ""));
  const lineasEliminados = r.eliminados.map(
    a => `${pintar("denegada", "Eliminado:", ctx)} ${seguro(a.nombre)} · ${ubicacion(a.declaracion, undefined, ctx)}`
  );
  const lineasIncompleta = r.incompleta
    ? [`${pintar("pregunta", "Análisis incompleto:", ctx)} ${r.motivos.map(m => seguro(motivoNoResolucion(m, r.reglas))).join(", ")}`]
    : [];

  const lineas = unirBloques([
    proyecto(r, ctx),
    tabla(["AGENTE", "ORIGEN", "MODO"], filas, ctx, false, marcas),
    [...lineasEliminados, ...lineasIncompleta, ...limites(r, ctx)],
  ]);

  const refs = referencias(r.eliminados.map(a => a.declaracion), ctx);
  return terminar(lineas, ctx, refs);
}
