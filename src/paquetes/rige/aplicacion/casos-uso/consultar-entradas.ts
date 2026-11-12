import type { Resultado } from "../respuestas/resultado";
import { errorDesdeAnalisis, type ErrorUso } from "../errores";
import type { RespuestaEntradas } from "../respuestas/entradas";
import { versionEsquemaSalida } from "../respuestas/valores";
import { prepararProyecto, type DependenciasAnalisis } from "./analizar-proyecto";
import type { EntradaLeida } from "@rige/nucleo/resolucion/tipos";
import { resumirEntradas } from "@rige/nucleo/resolucion/resumen-entradas";
import type { ValorSustituido, ObservacionVia } from "@rige/nucleo/contrato/adaptador";
import { leerVia } from "@rige/nucleo/resolucion/leer-via";

export type ConsultarEntradas = (proyecto: string) => Resultado<RespuestaEntradas, ErrorUso>;

export function consultarEntradas(dependencias: Omit<DependenciasAnalisis, "resolucion">, proyecto: string): Resultado<RespuestaEntradas, ErrorUso> {
  const preparado = prepararProyecto(dependencias, proyecto);
  if (!preparado.exito) return preparado;
  const { canonica, contexto } = preparado.valor;
  const { adaptador, entorno } = dependencias;
  let observadas: readonly ObservacionVia[] | undefined;
  const ubicacion = adaptador.ubicar(canonica, entorno, contexto, vias => { observadas = vias; });
  if (!ubicacion.exito) return { exito: false, error: errorDesdeAnalisis(ubicacion.error) };
  const entradas: EntradaLeida[] = [];
  const sustituciones: ValorSustituido[] = [];
  const huellas: (string | null)[] = [];
  for (const [orden, via] of ubicacion.valor.entries()) {
    const lectura = leerVia(adaptador, entorno, via, orden, contexto);
    if (lectura.exito) {
      entradas.push({ ...lectura.valor.entrada, legibilidad: via.condicion === "no_observada" ? null : "legible" });
      huellas.push(lectura.valor.huella);
      sustituciones.push(...lectura.valor.declaraciones.flatMap(d => d.sustituciones ?? []));
    } else {
      if (!lectura.error.ilegible) return { exito: false, error: errorDesdeAnalisis(lectura.error) };
      entradas.push({ ...lectura.error.lectura!.entrada, legibilidad: "ilegible",
        error: { ...lectura.error.ilegible.posicion, consecuencia: lectura.error.ilegible.consecuencia } });
      huellas.push(lectura.error.lectura!.huella);
    }
  }
  dependencias.medicion?.finalizarLectura();
  const declaraciones = [...contexto.declaraciones];
  const reglas = Object.fromEntries([...new Set(declaraciones)].sort().map(codigo => {
    const plantilla = adaptador.reglas[codigo];
    if (plantilla === undefined) throw new Error(`Regla sin plantilla: ${codigo}`);
    return [codigo, plantilla];
  }));
  const vias = observadas?.map(via => ({ ...via, revisados: [...via.revisados],
    cantidad: entradas.filter(e => e.via === via.via && e.condicion !== "no_observada").length }));
  return { exito: true, valor: { esquema: versionEsquemaSalida, proyecto: canonica.replaceAll("\\", "/"), entradas,
    resumenEntradas: resumirEntradas(entradas, huellas, sustituciones, texto => entorno.resumir(texto)), declaraciones, reglas,
    ...(vias === undefined ? {} : { vias }) } };
}
