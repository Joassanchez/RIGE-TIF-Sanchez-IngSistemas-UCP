import type { Resultado } from "@rige/nucleo/resultado";
import { consultarAgente } from "@rige/nucleo/resolucion/proyectar";
import { errorDesdeAnalisis, errorSolicitudInvalida, type ErrorUso } from "../errores";
import type { PuertoResoluciones } from "../puertos/resoluciones";
import type { RespuestaConsulta } from "../respuestas/consulta";
import { versionRige } from "../respuestas/estado";

export type ConsultarResolucion = (id: string, agente: string, clave: string) => Resultado<RespuestaConsulta, ErrorUso>;

export function consultarResolucion(resoluciones: PuertoResoluciones, id: string, agente: string, clave: string): Resultado<RespuestaConsulta, ErrorUso> {
  const numero = Number(id);
  if (!id || /[^0-9]/.test(id) || !Number.isSafeInteger(numero) || numero <= 0) {
    return { exito: false, error: errorSolicitudInvalida("el id debe ser un entero positivo en decimal") };
  }
  if (!agente.trim()) return { exito: false, error: errorSolicitudInvalida("el agente esta vacio") };
  const guardada = resoluciones.leer(numero);
  if (!guardada.exito) return guardada;
  const { resolucion } = guardada.valor;
  const valores = consultarAgente(resolucion, agente, clave === "" ? undefined : clave);
  if (!valores.exito) return { exito: false, error: errorDesdeAnalisis(valores.error) };
  const anteriores = resoluciones.listar(resolucion.proyecto);
  if (!anteriores.exito) return anteriores;
  return { exito: true, valor: {
    esquema: 1,
    versionRige,
    resolucion: {
      id: guardada.valor.id,
      instante: guardada.valor.instante,
      proyecto: resolucion.proyecto,
      herramienta: resolucion.identidad.herramienta,
      versionHerramienta: resolucion.identidad.version,
      resumenEntradas: resolucion.resumenEntradas,
      entradas: resolucion.entradas,
    },
    agente,
    clave: clave === "" ? null : clave,
    valores: valores.valor,
    reglas: resolucion.reglas,
    noResueltas: resolucion.noResueltas,
    anteriores: anteriores.valor,
  } };
}
