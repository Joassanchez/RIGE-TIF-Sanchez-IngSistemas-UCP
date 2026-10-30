import type { Resultado } from "../respuestas/resultado";
import { errorDesdeAnalisis, errorSolicitudInvalida, type ErrorUso } from "../errores";
import type { RespuestaEntradas } from "../respuestas/entradas";
import { versionEsquemaSalida } from "../respuestas/valores";
import type { DependenciasAnalisis } from "./analizar-proyecto";
import type { EntradaLeida } from "@rige/nucleo/resolucion/tipos";
import { resumirEntradas } from "@rige/nucleo/resolucion/resumen-entradas";
import type { ValorSustituido } from "@rige/nucleo/contrato/adaptador";

export type ConsultarEntradas = (proyecto: string) => Resultado<RespuestaEntradas, ErrorUso>;

export function consultarEntradas(dependencias: Omit<DependenciasAnalisis, "resolucion">, proyecto: string): Resultado<RespuestaEntradas, ErrorUso> {
  proyecto = proyecto.trim();
  if (proyecto.length >= 2 && ((proyecto.startsWith('"') && proyecto.endsWith('"'))
    || (proyecto.startsWith("'") && proyecto.endsWith("'")))) proyecto = proyecto.slice(1, -1).trim();
  if (!proyecto) return { exito: false, error: errorSolicitudInvalida("el proyecto está vacío") };
  const canonica = dependencias.rutas.canonica(proyecto);
  if (canonica === null) return { exito: false, error: { codigo: "proyecto-inexistente",
    mensaje: `El proyecto ${proyecto} no existe o no es un directorio.` } };
  const { adaptador, entorno } = dependencias;
  const contexto = adaptador.contexto(canonica, entorno);
  if (!contexto.exito) return { exito: false, error: errorDesdeAnalisis(contexto.error) };
  const ubicacion = adaptador.ubicar(canonica, entorno, contexto.valor);
  if (!ubicacion.exito) return { exito: false, error: errorDesdeAnalisis(ubicacion.error) };
  const entradas: EntradaLeida[] = [];
  const sustituciones: ValorSustituido[] = [];
  for (const [orden, via] of ubicacion.valor.entries()) {
    let resumen: string | null = null;
    let diagnostico: Pick<EntradaLeida, "legibilidad" | "error"> = { legibilidad: null };
    if (via.condicion !== "no_observada") {
      const archivo = via.condicion === "observada" ? entorno.leer(via.referencia) : null;
      resumen = archivo?.resumen ?? null;
      const lectura = adaptador.leer(via, archivo ? archivo.texto : entorno.variable(via.referencia)!, entorno, contexto.valor);
      if (lectura.exito) {
        diagnostico = { legibilidad: "legible" };
        sustituciones.push(...lectura.valor.flatMap(d => d.sustituciones ?? []));
      }
      else {
        if (!lectura.error.ilegible) return { exito: false, error: errorDesdeAnalisis(lectura.error) };
        diagnostico = { legibilidad: "ilegible", error: { ...lectura.error.ilegible.posicion, consecuencia: lectura.error.ilegible.consecuencia } };
      }
    }
    entradas.push({ orden, via: via.via, referencia: via.referencia.replaceAll("\\", "/"), condicion: via.condicion, resumen, ...diagnostico });
  }
  const declaraciones = [...contexto.valor.declaraciones];
  const reglas = Object.fromEntries([...new Set(declaraciones)].sort().map(codigo => {
    const plantilla = adaptador.reglas[codigo];
    if (plantilla === undefined) throw new Error(`Regla sin plantilla: ${codigo}`);
    return [codigo, plantilla];
  }));
  return { exito: true, valor: { esquema: versionEsquemaSalida, proyecto: canonica.replaceAll("\\", "/"), entradas,
    resumenEntradas: resumirEntradas(entradas, entorno, sustituciones), declaraciones, reglas } };
}
