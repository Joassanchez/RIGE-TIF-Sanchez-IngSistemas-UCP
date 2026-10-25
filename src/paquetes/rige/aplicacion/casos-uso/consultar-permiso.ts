import type { Resultado } from "@rige/nucleo/resultado";
import { decidir } from "@rige/nucleo/permisos/decidir";
import { explicar } from "@rige/nucleo/permisos/explicar";
import { errorDesdeAnalisis, errorSolicitudInvalida, type ErrorUso } from "../errores";
import { versionEsquemaSalida } from "../respuestas/valores";
import type { RespuestaPermiso } from "../respuestas/permiso";
import { analizarProyecto, type DependenciasAnalisis } from "./analizar-proyecto";

export type AccionPermiso = string | { readonly sujeto: string; readonly herramienta?: never } | { readonly herramienta: string; readonly sujeto?: never };

export function consultarPermiso(dependencias: DependenciasAnalisis, proyecto: string, agente: string, accion: AccionPermiso, objetivo: string, lanzadoPor?: string, opciones: { readonly explicar?: boolean } = {}): Resultado<RespuestaPermiso, ErrorUso> {
  const herramienta = typeof accion === "object" ? accion.herramienta : undefined;
  let sujeto = typeof accion === "string" ? accion : accion.sujeto ?? "";
  if (typeof accion === "object" && ((accion.sujeto !== undefined) === (herramienta !== undefined))) return { exito: false,
    error: errorSolicitudInvalida("indique sujeto o herramienta, en forma excluyente") };
  if (!agente.trim() || !(herramienta ?? sujeto).trim() || !objetivo.trim() || (lanzadoPor !== undefined && !lanzadoPor.trim())) return { exito: false,
    error: errorSolicitudInvalida("el agente, sujeto u objetivo esta vacio") };
  const analisis = analizarProyecto(dependencias, proyecto);
  if (!analisis.exito) return analisis;
  const { adaptador, entorno } = dependencias;
  let objetivoEvaluado = objetivo;
  let motivoSinDecision: string | null = null;
  let advertenciasObjetivo: readonly string[] = [];
  if (herramienta !== undefined) {
    if (!adaptador.prepararObjetivo) return { exito: false, error: errorSolicitudInvalida("el adaptador no admite consultas por herramienta") };
    const preparado = adaptador.prepararObjetivo(analisis.valor.proyecto, herramienta, objetivo, entorno);
    if (!preparado.exito) return { exito: false, error: errorDesdeAnalisis(preparado.error) };
    ({ sujeto, objetivoEvaluado, motivoSinDecision } = preparado.valor);
    advertenciasObjetivo = preparado.valor.advertencias ?? [];
  } else if (adaptador.prepararSujeto) {
    const preparado = adaptador.prepararSujeto(sujeto, objetivo);
    ({ sujeto, objetivoEvaluado, motivoSinDecision } = preparado);
    advertenciasObjetivo = preparado.advertencias ?? [];
  }
  const cadena = adaptador.cadena(analisis.valor, agente, entorno, lanzadoPor);
  if (!cadena.exito) return { exito: false, error: errorDesdeAnalisis(cadena.error) };
  const evaluacion = motivoSinDecision !== null || cadena.valor.ejesParciales.includes(sujeto) ? { determinante: null, coincidentes: [] }
    : adaptador.permisos.evaluar(cadena.valor.reglas, sujeto, objetivoEvaluado, entorno.plataforma);
  const { coincidentes, ...decision } = decidir(cadena.valor, { sujeto, objetivo: objetivoEvaluado }, { ...adaptador.permisos, ...evaluacion });
  const rastro = { ...decision,
    consulta: { sujeto, objetivo, objetivoEvaluado: herramienta === undefined ? decision.consulta.objetivoEvaluado : objetivoEvaluado,
      forma: herramienta === undefined ? "sujeto" as const : "herramienta" as const, ...(herramienta === undefined ? {} : { herramienta }) },
    ...(motivoSinDecision === null ? {} : { decision: null, motivoSinDecision }),
    declaraciones: [...decision.declaraciones, ...(cadena.valor.declaraciones ?? [])],
    advertencias: [...decision.advertencias, ...(cadena.valor.advertencias ?? []), ...advertenciasObjetivo],
  };
  const codigos = new Set([...Object.keys(analisis.valor.reglas), ...rastro.declaraciones, ...rastro.advertencias]);
  if (motivoSinDecision !== null) codigos.add(motivoSinDecision);
  for (const regla of coincidentes) {
    if (regla.origen.tipo !== "declarado") codigos.add(regla.origen.regla);
    if (regla.declaracion) codigos.add(regla.declaracion.regla);
  }
  const reglas = Object.fromEntries([...codigos].sort().map(codigo => {
    if (!Object.hasOwn(adaptador.reglas, codigo)) throw new Error(`Regla sin plantilla: ${codigo}`);
    return [codigo, adaptador.reglas[codigo]!];
  }));
  return { exito: true, valor: {
    esquema: versionEsquemaSalida, proyecto: analisis.valor.proyecto,
    entradas: analisis.valor.entradas, resumenEntradas: analisis.valor.resumenEntradas,
    ...rastro, cadena: coincidentes, reglas,
    explicacion: opciones.explicar ? explicar({ ...rastro, coincidentes }, {
      ...adaptador.permisos.plantillas, reglas: adaptador.reglas,
    }, cadena.valor.reglas.length) : null,
  } };
}
