import type { Resultado } from "../respuestas/resultado";
import type { ErrorUso } from "../errores";
import type { RespuestaAgentes } from "../respuestas/agentes";
import { versionEsquemaSalida } from "../respuestas/valores";
import { prepararAnalisis, type DependenciasAnalisis } from "./analizar-proyecto";

export type ConsultarAgentes = (proyecto: string) => Resultado<RespuestaAgentes, ErrorUso>;

export function consultarAgentes(dependencias: DependenciasAnalisis, proyecto: string): Resultado<RespuestaAgentes, ErrorUso> {
  const analisis = prepararAnalisis(dependencias, proyecto);
  if (!analisis.exito) return analisis;
  const { resolucion, contexto } = analisis.valor;
  const listado = dependencias.adaptador.listarAgentes(resolucion, contexto);
  const agentes = listado.agentes.filter(a => a.estado !== "deshabilitado").map(({ nombre, origen, modo, oculto }) => ({ nombre, origen, modo, oculto }));
  const eliminados = listado.agentes.filter(a => a.estado === "deshabilitado").map(a => {
    if (!a.eliminacion) throw new Error("Agente deshabilitado sin declaracion de eliminacion.");
    return { nombre: a.nombre, declaracion: a.eliminacion };
  });
  return { exito: true, valor: { esquema: versionEsquemaSalida, proyecto: resolucion.proyecto,
    entradas: resolucion.entradas, resumenEntradas: resolucion.resumenEntradas, agentes,
    eliminados, incompleta: listado.motivos.length > 0, motivos: listado.motivos, reglas: resolucion.reglas,
    declaraciones: resolucion.declaraciones ?? [] } };
}
