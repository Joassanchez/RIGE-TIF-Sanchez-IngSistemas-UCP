import type { SolicitudPermiso } from "@rige/nucleo/contrato/adaptador";
import type { Resultado } from "@rige/nucleo/resultado";
import { decidir } from "@rige/nucleo/permisos/decidir";
import { explicar } from "@rige/nucleo/permisos/explicar";
import { errorDesdeAnalisis, errorSolicitudInvalida, type ErrorUso } from "../errores";
import { versionEsquemaSalida } from "../respuestas/valores";
import type { RespuestaPermiso } from "../respuestas/permiso";
import { prepararAnalisis, type DependenciasAnalisis } from "./analizar-proyecto";

export type SolicitudConsultaPermiso = SolicitudPermiso & { readonly proyecto: string; readonly agente: string; readonly explicar?: boolean | undefined };

export function consultarPermiso(dependencias: DependenciasAnalisis, solicitud: SolicitudConsultaPermiso): Resultado<RespuestaPermiso, ErrorUso> {
  const { proyecto, agente, objetivo, lanzadoPor, herramienta } = solicitud;
  let sujeto = solicitud.sujeto ?? "";
  if ((solicitud.sujeto !== undefined) === (herramienta !== undefined)) return { exito: false,
    error: errorSolicitudInvalida("indique sujeto o herramienta, en forma excluyente") };
  if (!agente.trim() || !(herramienta ?? sujeto).trim() || !objetivo.trim() || (lanzadoPor !== undefined && !lanzadoPor.trim())) return { exito: false,
    error: errorSolicitudInvalida("el agente, sujeto u objetivo está vacío") };
  const analisis = prepararAnalisis(dependencias, proyecto);
  if (!analisis.exito) return analisis;
  const { adaptador } = dependencias;
  const { resolucion, contexto } = analisis.valor;
  const preparado = adaptador.prepararConsulta(contexto, solicitud);
  if (!preparado.exito) return { exito: false, error: errorDesdeAnalisis(preparado.error) };
  const { objetivoEvaluado, motivoSinDecision } = preparado.valor;
  sujeto = preparado.valor.sujeto;
  const advertenciasObjetivo = preparado.valor.advertencias ?? [];
  const cadena = adaptador.cadena(resolucion, agente, contexto, lanzadoPor);
  if (!cadena.exito) return { exito: false, error: errorDesdeAnalisis(cadena.error) };
  const evaluacion = motivoSinDecision !== null ? { determinante: null, coincidentes: [] }
    : adaptador.permisos.evaluar(cadena.valor.reglas, sujeto, objetivoEvaluado, contexto.entorno.plataforma);
  const { coincidentes, ...decision } = decidir(cadena.valor, { sujeto, objetivo: objetivoEvaluado }, { ...adaptador.permisos, ...evaluacion }, motivoSinDecision);
  const rastro = { ...decision,
    consulta: { ...decision.consulta, objetivo,
      forma: herramienta === undefined ? "sujeto" as const : "herramienta" as const, ...(herramienta === undefined ? {} : { herramienta }) },
    declaraciones: [...decision.declaraciones, ...cadena.valor.declaraciones],
    advertencias: [...decision.advertencias, ...cadena.valor.advertencias, ...advertenciasObjetivo],
  };
  const codigos = new Set([...Object.keys(resolucion.reglas), ...rastro.declaraciones, ...rastro.advertencias]);
  if (decision.motivoSinDecision !== null) codigos.add(decision.motivoSinDecision);
  for (const regla of coincidentes) {
    if (regla.origen.tipo !== "declarado") codigos.add(regla.origen.regla);
    if (regla.declaracion) codigos.add(regla.declaracion.regla);
  }
  const reglas = Object.fromEntries([...codigos].sort().map(codigo => {
    if (!Object.hasOwn(adaptador.reglas, codigo)) throw new Error(`Regla sin plantilla: ${codigo}`);
    return [codigo, adaptador.reglas[codigo]!];
  }));
  return { exito: true, valor: {
    esquema: versionEsquemaSalida, proyecto: resolucion.proyecto,
    entradas: resolucion.entradas, resumenEntradas: resolucion.resumenEntradas,
    ...rastro, cadena: coincidentes, reglas,
    explicacion: solicitud.explicar ? explicar({ ...rastro, coincidentes }, {
      ...adaptador.permisos.plantillas, reglas: adaptador.reglas,
    }, cadena.valor.reglas.length) : null,
  } };
}
