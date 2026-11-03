import { localizacion } from "../respuestas/localizacion";
import type { Resultado } from "../respuestas/resultado";
import { errorDesdeAnalisis, type ErrorUso } from "../errores";
import type { RespuestaHallazgos } from "../respuestas/hallazgos";
import { prepararProyecto, type DependenciasAnalisis } from "./analizar-proyecto";
import type { LecturaEntrada } from "@rige/nucleo/contrato/adaptador";
import { leerVia } from "@rige/nucleo/resolucion/leer-via";
import { resolverDesdeLecturas } from "@rige/nucleo/resolucion/resolver";
import { resumirEntradas } from "@rige/nucleo/resolucion/resumen-entradas";
import { detectarEntradas, detectarReferencias, detectarReglasSinEfecto, ordenarHallazgos, type EntradaAnalizada } from "@rige/nucleo/hallazgos/detectar";
import { explicarHallazgo } from "@rige/nucleo/hallazgos/explicar";

export type ConsultarHallazgos = (proyecto: string, opciones?: { readonly explicar?: boolean }) => Resultado<RespuestaHallazgos, ErrorUso>;

export function consultarHallazgos(dependencias: Omit<DependenciasAnalisis, "resolucion">, proyecto: string, opciones?: { readonly explicar?: boolean }): Resultado<RespuestaHallazgos, ErrorUso> {
  const preparado = prepararProyecto(dependencias, proyecto);
  if (!preparado.exito) return preparado;
  const { canonica, contexto } = preparado.valor;
  const { adaptador, entorno } = dependencias;
  const ubicacion = adaptador.ubicar(canonica, entorno, contexto);
  if (!ubicacion.exito) return { exito: false, error: errorDesdeAnalisis(ubicacion.error) };
  const analizadas: EntradaAnalizada[] = [];
  const lecturas: LecturaEntrada[] = [];
  const huellas: (string | null)[] = [];
  for (const [orden, via] of ubicacion.valor.entries()) {
    const lectura = leerVia(adaptador, entorno, via, orden, contexto);
    if (lectura.exito) {
      analizadas.push({ entrada: { ...lectura.valor.entrada, legibilidad: via.condicion === "no_observada" ? null : "legible" },
        declaraciones: lectura.valor.declaraciones });
      huellas.push(lectura.valor.huella);
      lecturas.push({ orden, via, declaraciones: lectura.valor.declaraciones });
    } else {
      if (!lectura.error.ilegible) return { exito: false, error: errorDesdeAnalisis(lectura.error) };
      const { ilegible } = lectura.error;
      analizadas.push({ entrada: { ...lectura.error.lectura!.entrada, legibilidad: "ilegible",
        error: { ...ilegible.posicion, consecuencia: ilegible.consecuencia } }, declaraciones: [], ilegible });
      huellas.push(lectura.error.lectura!.huella);
      lecturas.push({ orden, via, declaraciones: [] });
    }
  }
  const entradas = analizadas.map(a => a.entrada);
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
  const codigos = [...new Set([...Object.keys(reglasResolucion), ...declaraciones, ...motivos])].sort();
  const reglas = Object.fromEntries(codigos.map(codigo => {
    if (!Object.hasOwn(adaptador.reglas, codigo)) throw new Error(`Regla sin plantilla: ${codigo}`);
    return [codigo, adaptador.reglas[codigo]!];
  }));
  return { exito: true, valor: { esquema: 2, proyecto: canonica.replaceAll("\\", "/"), entradas,
    resumenEntradas: resumirEntradas(entradas, huellas, lecturas.flatMap(l => l.declaraciones.flatMap(d => d.sustituciones ?? [])), texto => entorno.resumir(texto)),
    incompleta, motivos, declaraciones, reglas,
    resumen: { elementos: elementosResumen, hallazgos: {
      "entrada-ilegible": hallazgos.filter(h => h.tipo === "entrada-ilegible").length,
      "entrada-descartada": hallazgos.filter(h => h.tipo === "entrada-descartada").length,
      "sustitucion-sin-valor": hallazgos.filter(h => h.tipo === "sustitucion-sin-valor").length,
      "referencia-no-resuelta": hallazgos.filter(h => h.tipo === "referencia-no-resuelta").length,
      "regla-sin-efecto": hallazgos.filter(h => h.tipo === "regla-sin-efecto").length,
      "elemento-sin-uso": hallazgos.filter(h => h.tipo === "elemento-sin-uso").length,
    } },
    hallazgos: ordenarHallazgos(hallazgos).map(h => ({ ...h, localizacion: localizacion(h.entrada.referencia, h.posicion),
      ...((opciones?.explicar ?? true) ? { explicacion: explicarHallazgo(h, adaptador.plantillasHallazgo) } : {}) })) } };
}
