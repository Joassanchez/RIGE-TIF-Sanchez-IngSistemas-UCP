import type { Resultado } from "../respuestas/resultado";
import type { SolicitudPermiso } from "@rige/nucleo/contrato/adaptador";
import { errorSolicitudInvalida, type ErrorUso } from "../errores";
import type { PuertoResoluciones } from "../puertos/resoluciones";
import type { DependenciasAnalisis } from "./analizar-proyecto";
import { consultarPermiso } from "./consultar-permiso";
import { consultarAgentes } from "./consultar-agentes";
import { consultarReglas } from "./consultar-reglas";
import { esIdResolucion } from "./id-resolucion";

function sobreGuardada<T>(dependencias: DependenciasAnalisis & { readonly resoluciones: PuertoResoluciones }, id: string,
  consultar: (dependencias: DependenciasAnalisis, proyecto: string) => Resultado<T, ErrorUso>): Resultado<T, ErrorUso> {
  if (!esIdResolucion(id)) {
    return { exito: false, error: errorSolicitudInvalida("el id debe ser un entero positivo en decimal") };
  }
  const numero = Number(id);
  const guardada = dependencias.resoluciones.leer(numero);
  if (!guardada.exito) return guardada;
  const { resolucion } = guardada.valor;
  return consultar({ ...dependencias, resolucion }, resolucion.proyecto);
}

export function consultarPermisoGuardado(dependencias: DependenciasAnalisis & { readonly resoluciones: PuertoResoluciones },
  id: string, solicitud: SolicitudPermiso & { readonly agente: string }) {
  return sobreGuardada(dependencias, id, (analisis, proyecto) => consultarPermiso(analisis, { ...solicitud, proyecto, explicar: true }));
}

export function consultarAgentesGuardados(dependencias: DependenciasAnalisis & { readonly resoluciones: PuertoResoluciones }, id: string) {
  return sobreGuardada(dependencias, id, consultarAgentes);
}

export function consultarReglasGuardadas(dependencias: DependenciasAnalisis & { readonly resoluciones: PuertoResoluciones },
  id: string, solicitud: { readonly agente: string; readonly lanzadoPor?: string | undefined }) {
  return sobreGuardada(dependencias, id, (analisis, proyecto) => consultarReglas(analisis, { ...solicitud, proyecto }));
}
