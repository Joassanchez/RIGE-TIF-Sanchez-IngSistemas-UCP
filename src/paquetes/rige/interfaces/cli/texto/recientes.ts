import type { RespuestaProyectosRecientes } from "../../../aplicacion/respuestas/contrato-generado";
import { fechaLocal } from "../../presentacion/fechas";
import {
  type ContextoPresentacion,
  tabla,
  nombre,
  terminar,
} from "./formato";

export function renderizarRecientes(r: RespuestaProyectosRecientes, c: ContextoPresentacion): string {
  if (!r.proyectos.length) {
    return terminar(["Sin proyectos recientes"], c);
  }

  const filas = r.proyectos.map(p => [
    nombre(p.proyecto),
    String(p.id),
    fechaLocal(p.instante),
    String(p.cantidad),
  ]);

  const lineas = tabla(["PROYECTO", "FOTO", "INSTANTE", "CANTIDAD"], filas, c, false);
  return terminar(lineas, c);
}
