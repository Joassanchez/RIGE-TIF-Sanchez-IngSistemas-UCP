import type { Resultado } from "../respuestas/resultado";
import { errorDesdeAnalisis, type ErrorUso } from "../errores";
import type { RespuestaEntradas } from "../respuestas/contrato-generado";
import { versionEsquemaSalida } from "../respuestas/valores";
import { prepararProyecto, type DependenciasAnalisis } from "./analizar-proyecto";
import { resumirEntradas } from "@rige/nucleo/resolucion/resumen-entradas";
import type { ObservacionVia } from "@rige/nucleo/contrato/adaptador";
import { leerEntradas } from "./leer-entradas";
import { plantillasDe } from "./plantillas";

export type ConsultarEntradas = (proyecto: string) => Resultado<RespuestaEntradas, ErrorUso>;

export function consultarEntradas(dependencias: Omit<DependenciasAnalisis, "resolucion">, proyecto: string): Resultado<RespuestaEntradas, ErrorUso> {
  const preparado = prepararProyecto(dependencias, proyecto);
  if (!preparado.exito) return preparado;
  const { canonica, contexto } = preparado.valor;
  const { adaptador, entorno } = dependencias;
  let observadas: readonly ObservacionVia[] | undefined;
  const ubicacion = adaptador.ubicar(canonica, entorno, contexto, vias => { observadas = vias; });
  if (!ubicacion.exito) return { exito: false, error: errorDesdeAnalisis(ubicacion.error) };
  const leidas = leerEntradas(adaptador, entorno, ubicacion.valor, contexto, dependencias.medicion);
  if (!leidas.exito) return leidas;
  const { entradas, huellas, sustituciones } = leidas.valor;
  const declaraciones = [...contexto.declaraciones];
  const reglas = plantillasDe(adaptador, declaraciones);
  const vias = observadas?.map(via => ({ ...via, revisados: [...via.revisados],
    cantidad: entradas.filter(e => e.via === via.via && e.condicion !== "no_observada").length }));
  return { exito: true, valor: { esquema: versionEsquemaSalida, proyecto: canonica.replaceAll("\\", "/"), entradas,
    resumenEntradas: resumirEntradas(entradas, huellas, sustituciones, texto => entorno.resumir(texto)), declaraciones, reglas,
    ...(vias === undefined ? {} : { vias }) } };
}
