import type { Resultado } from "../respuestas/resultado";
import type { ErrorUso } from "../errores";
import type { PuertoResoluciones, PuertoRutas } from "../puertos/resoluciones";
import type { RespuestaHistorialProyecto, RespuestaProyectosRecientes } from "../respuestas/contrato-generado";
import { versionEsquemaSalida } from "../respuestas/valores";
import { resolverRutaProyecto } from "./analizar-proyecto";

export type ConsultarProyectosRecientes = () => Resultado<RespuestaProyectosRecientes, ErrorUso>;

export function consultarProyectosRecientes(resoluciones: PuertoResoluciones): Resultado<RespuestaProyectosRecientes, ErrorUso>;
export function consultarProyectosRecientes(resoluciones: PuertoResoluciones, rutas: PuertoRutas, proyecto: string): Resultado<RespuestaHistorialProyecto, ErrorUso>;
export function consultarProyectosRecientes(
  resoluciones: PuertoResoluciones,
  rutas: PuertoRutas,
  proyecto: string | undefined,
): Resultado<RespuestaProyectosRecientes | RespuestaHistorialProyecto, ErrorUso>;
export function consultarProyectosRecientes(
  resoluciones: PuertoResoluciones,
  rutas?: PuertoRutas,
  proyecto?: string,
): Resultado<RespuestaProyectosRecientes | RespuestaHistorialProyecto, ErrorUso> {
  if (proyecto === undefined) {
    const lista = resoluciones.listarProyectosRecientes();
    return lista.exito ? { exito: true, valor: { esquema: versionEsquemaSalida, proyectos: lista.valor } } : lista;
  }
  if (!rutas) throw new Error("Falta PuertoRutas para consultar el historial del proyecto.");
  const ruta = resolverRutaProyecto(rutas, proyecto);
  if (!ruta.exito) return ruta;
  const lista = resoluciones.listar(ruta.valor);
  return lista.exito ? { exito: true, valor: { esquema: versionEsquemaSalida, proyecto: ruta.valor, analisis: lista.valor } } : lista;
}
