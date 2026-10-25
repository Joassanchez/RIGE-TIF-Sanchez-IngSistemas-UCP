import type { Resultado } from "@rige/nucleo/resultado";
import { errorSolicitudInvalida, type ErrorUso } from "../errores";
import type { RespuestaValores } from "../respuestas/valores";
import { respuestaValores } from "./proyectar-valores";
import { analizarProyecto, type DependenciasAnalisis } from "./analizar-proyecto";

export type ConsultarValores = (proyecto: string, agente: string, clave: string | undefined) => Resultado<RespuestaValores, ErrorUso>;

export function consultarValores(dependencias: DependenciasAnalisis, proyecto: string, agente: string, clave: string | undefined): Resultado<RespuestaValores, ErrorUso> {
  if (!agente.trim()) return { exito: false, error: errorSolicitudInvalida("el agente esta vacio") };
  const analisis = analizarProyecto(dependencias, proyecto);
  return analisis.exito ? respuestaValores(analisis.valor, agente, clave) : analisis;
}
