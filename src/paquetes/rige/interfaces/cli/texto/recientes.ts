import type { RespuestaHistorialProyecto, RespuestaProyectosRecientes } from "../../../aplicacion/respuestas/contrato-generado";
import { fechaLocal } from "../../presentacion/fechas";
import {
  type CeldaTabla,
  type ContextoPresentacion,
  tabla,
  nombre,
  proyecto,
  terminar,
  unirBloques,
} from "./formato";

export function renderizarRecientes(r: RespuestaProyectosRecientes | RespuestaHistorialProyecto, c: ContextoPresentacion): string {
  if ("analisis" in r) {
    if (!r.analisis.length) {
      return terminar(unirBloques([proyecto(r, c), ["Sin análisis guardados"]]), c, [], { pieJson: false });
    }
    const filas: CeldaTabla[][] = r.analisis.map(a => [
      { texto: String(a.id), rol: "estructura" },
      fechaLocal(a.instante),
      a.resumenEntradas.slice(0, 12),
    ]);
    return terminar(unirBloques([proyecto(r, c), tabla(["ANÁLISIS", "INSTANTE", "RESUMEN"], filas, c, false)]), c);
  }

  if (!r.proyectos.length) {
    return terminar(["Sin proyectos recientes"], c, [], { pieJson: false });
  }

  const filas: CeldaTabla[][] = r.proyectos.map(p => [
    nombre(p.proyecto),
    { texto: String(p.id), rol: "estructura" },
    fechaLocal(p.instante),
    String(p.cantidad),
  ]);

  const lineas = tabla(["PROYECTO", "ANÁLISIS", "INSTANTE", "CANTIDAD"], filas, c, false);
  return terminar(lineas, c);
}
