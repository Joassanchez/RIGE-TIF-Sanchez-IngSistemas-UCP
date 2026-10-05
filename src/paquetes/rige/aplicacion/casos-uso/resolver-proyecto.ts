import type { Adaptador } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import { resolver } from "@rige/nucleo/resolucion/resolver";
import { errorDesdeAnalisis, errorSolicitudInvalida, type ErrorUso } from "../errores";
import type { PuertoReloj, PuertoResoluciones, PuertoRutas } from "../puertos/resoluciones";

export interface DependenciasResolver {
  readonly adaptador: Adaptador;
  readonly entorno: EntornoLectura;
  readonly rutas: PuertoRutas;
  readonly resoluciones: PuertoResoluciones;
  readonly reloj: PuertoReloj;
}

export type ResolverProyecto = (proyecto: string) => Resultado<{ readonly id: number }, ErrorUso>;

export function resolverProyecto(dependencias: DependenciasResolver, proyecto: string): Resultado<{ readonly id: number }, ErrorUso> {
  if (!proyecto.trim()) return { exito: false, error: errorSolicitudInvalida("el proyecto esta vacio") };
  const canonica = dependencias.rutas.canonica(proyecto);
  if (canonica === null) return { exito: false, error: {
    codigo: "proyecto-inexistente", mensaje: `El proyecto ${proyecto} no existe o no es un directorio.`,
  } };
  const analisis = resolver(dependencias.adaptador, canonica, dependencias.entorno);
  if (!analisis.exito) return { exito: false, error: errorDesdeAnalisis(analisis.error) };
  const guardada = dependencias.resoluciones.guardar(analisis.valor, dependencias.reloj.ahora());
  if (!guardada.exito) return guardada;
  return { exito: true, valor: { id: guardada.valor } };
}
