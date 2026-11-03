import { localizacion } from "@rige/nucleo/permisos/explicar";
import type { DeclaracionUbicada } from "@rige/nucleo/resolucion/tipos";

export { localizacion };

/** Proyeccion aditiva: no modifica la declaracion de la resolucion almacenada. */
export function localizarDeclaracion(declaracion: DeclaracionUbicada): DeclaracionUbicada {
  return declaracion.origen.tipo === "declarado" && declaracion.referencia !== null
    ? { ...declaracion, localizacion: localizacion(declaracion.referencia, declaracion.origen.posicion) }
    : declaracion;
}
