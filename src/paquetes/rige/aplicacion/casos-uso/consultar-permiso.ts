import type { Resultado } from "@rige/nucleo/resultado";
import { decidir } from "@rige/nucleo/permisos/decidir";
import { errorDesdeAnalisis, errorSolicitudInvalida, type ErrorUso } from "../errores";
import { versionEsquemaSalida } from "../respuestas/valores";
import type { RespuestaPermiso } from "../respuestas/permiso";
import { analizarProyecto, type DependenciasAnalisis } from "./analizar-proyecto";

export function consultarPermiso(dependencias: DependenciasAnalisis, proyecto: string, agente: string, sujeto: string, objetivo: string, lanzadoPor?: string): Resultado<RespuestaPermiso, ErrorUso> {
  if (!agente.trim() || !sujeto.trim() || !objetivo.trim() || (lanzadoPor !== undefined && !lanzadoPor.trim())) return { exito: false,
    error: errorSolicitudInvalida("el agente, sujeto u objetivo esta vacio") };
  const analisis = analizarProyecto(dependencias, proyecto);
  if (!analisis.exito) return analisis;
  const { adaptador, entorno } = dependencias;
  const cadena = adaptador.cadena(analisis.valor, agente, entorno, lanzadoPor);
  if (!cadena.exito) return { exito: false, error: errorDesdeAnalisis(cadena.error) };
  const evaluacion = cadena.valor.ejesParciales.includes(sujeto) ? { determinante: null, coincidentes: [] }
    : adaptador.permisos.evaluar(cadena.valor.reglas, sujeto, objetivo, entorno.plataforma);
  const { coincidentes, ...decision } = decidir(cadena.valor, { sujeto, objetivo }, { ...adaptador.permisos, ...evaluacion });
  const rastro = { ...decision,
    declaraciones: [...decision.declaraciones, ...(cadena.valor.declaraciones ?? [])],
    advertencias: [...decision.advertencias, ...(cadena.valor.advertencias ?? [])],
  };
  const codigos = new Set([...Object.keys(analisis.valor.reglas), ...rastro.declaraciones, ...rastro.advertencias]);
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
  } };
}
