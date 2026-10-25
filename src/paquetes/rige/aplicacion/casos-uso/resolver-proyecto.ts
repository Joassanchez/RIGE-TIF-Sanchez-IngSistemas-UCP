import type { Resultado } from "@rige/nucleo/resultado";
import type { ErrorUso } from "../errores";
import type { PuertoReloj, PuertoResoluciones } from "../puertos/resoluciones";
import { analizarProyecto, type DependenciasAnalisis } from "./analizar-proyecto";
import { respuestaValores } from "./proyectar-valores";

export interface DependenciasResolver extends DependenciasAnalisis {
  readonly resoluciones: PuertoResoluciones;
  readonly reloj: PuertoReloj;
}

export type ResolverProyecto = (proyecto: string, agente?: string) => Resultado<{ readonly id: number }, ErrorUso>;

export function resolverProyecto(dependencias: DependenciasResolver, proyecto: string, agente?: string): Resultado<{ readonly id: number }, ErrorUso> {
  const analisis = analizarProyecto(dependencias, proyecto);
  if (!analisis.exito) return analisis;
  if (agente !== undefined) {
    const validacion = respuestaValores(analisis.valor, agente, undefined);
    if (!validacion.exito) return validacion;
  }
  const guardada = dependencias.resoluciones.guardar(analisis.valor, dependencias.reloj.ahora());
  if (!guardada.exito) return guardada;
  return { exito: true, valor: { id: guardada.valor } };
}
