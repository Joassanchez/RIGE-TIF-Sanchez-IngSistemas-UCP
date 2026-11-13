import type { Adaptador, ContextoConsulta } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import { resolver } from "@rige/nucleo/resolucion/resolver";
import { errorAlmacenSinEsquema, errorDesdeAnalisis, errorProyectoInexistente, errorSolicitudInvalida, type ErrorUso } from "../errores";
import type { PuertoRutas } from "../puertos/resoluciones";

/** Marca el limite real entre lectura y resolucion; no forma parte de los datos del dominio. */
export interface MedicionAnalisis { finalizarLectura(): void }

export interface DependenciasAnalisis {
  readonly adaptador: Adaptador;
  readonly entorno: EntornoLectura;
  readonly rutas: PuertoRutas;
  readonly resolucion?: Resolucion;
  readonly medicion?: MedicionAnalisis | undefined;
}

export function analizarProyecto(dependencias: DependenciasAnalisis, proyecto: string): Resultado<Resolucion, ErrorUso> {
  const analisis = prepararAnalisis(dependencias, proyecto);
  return analisis.exito ? { exito: true, valor: analisis.valor.resolucion } : analisis;
}

export function prepararAnalisis(dependencias: DependenciasAnalisis, proyecto: string): Resultado<{ readonly resolucion: Resolucion; readonly contexto: ContextoConsulta }, ErrorUso> {
  if (dependencias.resolucion) {
    const resolucion = dependencias.resolucion;
    const rawContexto: unknown = resolucion.contexto;
    if (typeof rawContexto !== "object" || rawContexto === null || Array.isArray(rawContexto)
      || !Object.hasOwn(rawContexto, "plataforma")) {
      return { exito: false, error: errorAlmacenSinEsquema };
    }
    const plataforma = (rawContexto as { readonly plataforma?: unknown }).plataforma;
    if (typeof plataforma !== "string" || !plataforma) {
      return { exito: false, error: errorAlmacenSinEsquema };
    }
    const { plataforma: _, ...datos } = resolucion.contexto;
    const actual = dependencias.entorno;
    const noLeer = (): never => { throw new Error("Una resolución guardada no consulta el entorno actual."); };
    const entorno: EntornoLectura = { plataforma, variable: noLeer, tipo: noLeer, examinar: noLeer, leer: noLeer, listar: noLeer, real: noLeer,
      resumir: texto => actual.resumir(texto), rutasPara: plataforma => actual.rutasPara(plataforma),
      ...actual.rutasPara(plataforma) };
    const contexto = dependencias.adaptador.restaurarContexto(datos, entorno);
    if (!contexto.exito) return { exito: false, error: errorDesdeAnalisis(contexto.error) };
    return { exito: true, valor: { resolucion, contexto: contexto.valor } };
  }
  const preparado = prepararProyecto(dependencias, proyecto);
  if (!preparado.exito) return preparado;
  const { canonica, contexto } = preparado.valor;
  const analisis = resolver(dependencias.adaptador, canonica, dependencias.entorno, contexto,
    dependencias.medicion === undefined ? undefined : () => dependencias.medicion!.finalizarLectura());
  return analisis.exito ? { exito: true, valor: { resolucion: analisis.valor, contexto } }
    : { exito: false, error: errorDesdeAnalisis(analisis.error) };
}

export function resolverRutaProyecto(rutas: PuertoRutas, proyecto: string): Resultado<string, ErrorUso> {
  proyecto = proyecto.trim();
  if (proyecto.length >= 2 && ((proyecto.startsWith('"') && proyecto.endsWith('"'))
    || (proyecto.startsWith("'") && proyecto.endsWith("'")))) proyecto = proyecto.slice(1, -1).trim();
  if (!proyecto) return { exito: false, error: errorSolicitudInvalida("el proyecto está vacío") };
  const canonica = rutas.canonica(proyecto);
  if (canonica === null) return { exito: false, error: errorProyectoInexistente(proyecto) };
  return { exito: true, valor: canonica };
}

export function prepararProyecto(dependencias: Omit<DependenciasAnalisis, "resolucion">, proyecto: string):
  Resultado<{ readonly canonica: string; readonly contexto: ContextoConsulta }, ErrorUso> {
  const ruta = resolverRutaProyecto(dependencias.rutas, proyecto);
  if (!ruta.exito) return ruta;
  const canonica = ruta.valor;
  const contexto = dependencias.adaptador.contexto(canonica, dependencias.entorno);
  if (!contexto.exito) return { exito: false, error: errorDesdeAnalisis(contexto.error) };
  return { exito: true, valor: { canonica, contexto: contexto.valor } };
}
