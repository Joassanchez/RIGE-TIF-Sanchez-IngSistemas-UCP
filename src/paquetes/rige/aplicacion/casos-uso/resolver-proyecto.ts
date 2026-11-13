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

const compararTexto = (a: string, b: string): number => a === b ? 0 : a < b ? -1 : 1;

function serializarCanonico(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map((elemento: unknown) => elemento === undefined ? "null" : serializarCanonico(elemento)).join(",")}]`;
  if (valor !== null && typeof valor === "object") {
    const registro = valor as Record<string, unknown>;
    return `{${Object.keys(registro).sort(compararTexto)
      .filter(clave => registro[clave] !== undefined)
      .map(clave => `${JSON.stringify(clave)}:${serializarCanonico(registro[clave])}`)
      .join(",")}}`;
  }
  return JSON.stringify(valor);
}

export function resolverProyecto(dependencias: DependenciasResolver, proyecto: string, agente?: string): Resultado<{ readonly id: number }, ErrorUso> {
  const analisis = analizarProyecto(dependencias, proyecto);
  if (!analisis.exito) return analisis;
  if (agente !== undefined) {
    const validacion = respuestaValores(analisis.valor, agente, undefined);
    if (!validacion.exito) return validacion;
  }
  const anteriores = dependencias.resoluciones.listar(analisis.valor.proyecto);
  if (!anteriores.exito) return anteriores;
  const ultima = anteriores.valor[0];
  if (ultima !== undefined && ultima.resumenEntradas === analisis.valor.resumenEntradas) {
    const anterior = dependencias.resoluciones.leer(ultima.id);
    if (!anterior.exito) return anterior;
    if (serializarCanonico(anterior.valor.resolucion) === serializarCanonico(analisis.valor)) {
      return { exito: true, valor: { id: ultima.id } };
    }
  }
  const guardada = dependencias.resoluciones.guardar(analisis.valor, dependencias.reloj.ahora());
  if (!guardada.exito) return guardada;
  return { exito: true, valor: { id: guardada.valor } };
}
