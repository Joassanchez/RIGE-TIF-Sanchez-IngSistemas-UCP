import type { Adaptador, ContextoConsulta } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import { resolver } from "@rige/nucleo/resolucion/resolver";
import { errorDesdeAnalisis, errorSolicitudInvalida, type ErrorUso } from "../errores";
import type { PuertoRutas } from "../puertos/resoluciones";

export interface DependenciasAnalisis {
  readonly adaptador: Adaptador;
  readonly entorno: EntornoLectura;
  readonly rutas: PuertoRutas;
}

export function analizarProyecto(dependencias: DependenciasAnalisis, proyecto: string): Resultado<Resolucion, ErrorUso> {
  const analisis = prepararAnalisis(dependencias, proyecto);
  return analisis.exito ? { exito: true, valor: analisis.valor.resolucion } : analisis;
}

export function prepararAnalisis(dependencias: DependenciasAnalisis, proyecto: string): Resultado<{ readonly resolucion: Resolucion; readonly contexto: ContextoConsulta }, ErrorUso> {
  proyecto = proyecto.trim();
  if (proyecto.length >= 2 && ((proyecto.startsWith('"') && proyecto.endsWith('"'))
    || (proyecto.startsWith("'") && proyecto.endsWith("'")))) proyecto = proyecto.slice(1, -1).trim();
  if (!proyecto) return { exito: false, error: errorSolicitudInvalida("el proyecto esta vacio") };
  const canonica = dependencias.rutas.canonica(proyecto);
  if (canonica === null) return { exito: false, error: {
    codigo: "proyecto-inexistente", mensaje: `El proyecto ${proyecto} no existe o no es un directorio.`,
  } };
  const contexto = dependencias.adaptador.contexto(canonica, dependencias.entorno);
  if (!contexto.exito) return { exito: false, error: errorDesdeAnalisis(contexto.error) };
  const analisis = resolver(dependencias.adaptador, canonica, dependencias.entorno, contexto.valor);
  return analisis.exito ? { exito: true, valor: { resolucion: analisis.valor, contexto: contexto.valor } }
    : { exito: false, error: errorDesdeAnalisis(analisis.error) };
}
