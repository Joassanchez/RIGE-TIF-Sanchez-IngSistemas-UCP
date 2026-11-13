import { localizacion } from "../respuestas/localizacion";
import type { Resultado } from "../respuestas/resultado";
import { errorDesdeAnalisis, type ErrorUso } from "../errores";
import { versionEsquemaSalida, type RespuestaHallazgos } from "../respuestas/contrato-generado";
import { prepararProyecto, type DependenciasAnalisis } from "./analizar-proyecto";
import { resolverDesdeLecturas } from "@rige/nucleo/resolucion/resolver";
import { resumirEntradas } from "@rige/nucleo/resolucion/resumen-entradas";
import { detectarEntradas, detectarReferencias, detectarReglasSinEfecto, ordenarHallazgos } from "@rige/nucleo/hallazgos/detectar";
import { explicarHallazgo } from "@rige/nucleo/hallazgos/explicar";
import { leerEntradas } from "./leer-entradas";
import { plantillasDe } from "./plantillas";

const tiposHallazgo = [
  "entrada-ilegible",
  "entrada-descartada",
  "sustitucion-sin-valor",
  "referencia-no-resuelta",
  "regla-sin-efecto",
  "elemento-sin-uso",
] as const;

export type ConsultarHallazgos = (proyecto: string, opciones?: { readonly explicar?: boolean }) => Resultado<RespuestaHallazgos, ErrorUso>;

export function consultarHallazgos(dependencias: Omit<DependenciasAnalisis, "resolucion">, proyecto: string, opciones?: { readonly explicar?: boolean }): Resultado<RespuestaHallazgos, ErrorUso> {
  const preparado = prepararProyecto(dependencias, proyecto);
  if (!preparado.exito) return preparado;
  const { canonica, contexto } = preparado.valor;
  const { adaptador, entorno } = dependencias;
  const ubicacion = adaptador.ubicar(canonica, entorno, contexto);
  if (!ubicacion.exito) return { exito: false, error: errorDesdeAnalisis(ubicacion.error) };
  const leidas = leerEntradas(adaptador, entorno, ubicacion.valor, contexto, dependencias.medicion);
  if (!leidas.exito) return leidas;
  const { entradas, huellas, analizadas, lecturas, sustituciones } = leidas.valor;
  const hallazgos = detectarEntradas(analizadas);
  const incompleta = analizadas.some(a => a.ilegible?.consecuencia === "falla");
  const motivos: string[] = incompleta ? ["hallazgos-parciales"] : [];
  if (hallazgos.some(h => h.tipo === "sustitucion-sin-valor")) motivos.push("wellknown-no-observada");
  let elementosResumen: RespuestaHallazgos["resumen"]["elementos"] = null;
  let reglasResolucion: Readonly<Record<string, string>> = {};
  if (!incompleta) {
    const resuelta = resolverDesdeLecturas(adaptador, canonica, entorno, contexto, entradas, lecturas, huellas);
    if (!resuelta.exito) return { exito: false, error: errorDesdeAnalisis(resuelta.error) };
    hallazgos.push(...detectarReferencias(adaptador, resuelta.valor, contexto));
    hallazgos.push(...detectarReglasSinEfecto(adaptador, resuelta.valor, contexto));
    const elementos = adaptador.elementosSinUso?.(resuelta.valor, contexto);
    if (elementos) {
      hallazgos.push(...elementos.hallazgos);
      motivos.push(...elementos.motivos);
    }
    const resolucion = resuelta.valor;
    elementosResumen = {
      agentes: adaptador.listarAgentes(resolucion, contexto).agentes.filter(a => a.estado === "activo" || a.estado === "no-observado").length,
      comandos: new Set([...resolucion.valores, ...resolucion.noResueltas].filter(v => v.ruta[0] === "command" && v.ruta.length >= 2).map(v => v.ruta[1]!)).size,
      entradas: entradas.filter(e => e.condicion === "observada" || e.condicion === "definida").length,
    };
    reglasResolucion = resolucion.reglas;
  }
  const declaraciones = [...contexto.declaraciones];
  const reglas = plantillasDe(adaptador, [...Object.keys(reglasResolucion), ...declaraciones, ...motivos]);
  const resumenHallazgos: { [K in (typeof tiposHallazgo)[number]]: number } = {
    "entrada-ilegible": 0,
    "entrada-descartada": 0,
    "sustitucion-sin-valor": 0,
    "referencia-no-resuelta": 0,
    "regla-sin-efecto": 0,
    "elemento-sin-uso": 0,
  };
  for (const tipo of tiposHallazgo) {
    resumenHallazgos[tipo] = hallazgos.filter(h => h.tipo === tipo).length;
  }
  return { exito: true, valor: { esquema: versionEsquemaSalida, proyecto: canonica.replaceAll("\\", "/"), entradas,
    resumenEntradas: resumirEntradas(entradas, huellas, sustituciones, texto => entorno.resumir(texto)),
    incompleta, motivos, declaraciones, reglas,
    resumen: { elementos: elementosResumen, hallazgos: resumenHallazgos },
    hallazgos: ordenarHallazgos(hallazgos).map(h => ({ ...h, localizacion: localizacion(h.entrada.referencia, h.posicion),
      ...((opciones?.explicar ?? true) ? { explicacion: explicarHallazgo(h, adaptador.plantillasHallazgo) } : {}) })) } };
}
