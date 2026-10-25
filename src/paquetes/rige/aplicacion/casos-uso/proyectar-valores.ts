import type { Resultado } from "@rige/nucleo/resultado";
import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import { consultarAgente, rutaDesdeTexto } from "@rige/nucleo/resolucion/proyectar";
import { errorDesdeAnalisis, errorSolicitudInvalida, type ErrorUso } from "../errores";
import { versionRige } from "../respuestas/estado";
import { versionEsquemaSalida, type RespuestaValores } from "../respuestas/valores";

export function respuestaValores(resolucion: Resolucion, agente: string, clave: string | undefined): Resultado<RespuestaValores, ErrorUso> {
  if (!agente.trim()) return { exito: false, error: errorSolicitudInvalida("el agente esta vacio") };
  const ruta = clave === undefined ? undefined : rutaDesdeTexto(clave);
  if (ruta && !ruta.exito) return { exito: false, error: errorDesdeAnalisis(ruta.error) };
  const segmentos = ruta?.valor;
  const consulta = consultarAgente(resolucion, agente, segmentos);
  if (!consulta.exito) return { exito: false, error: errorDesdeAnalisis(consulta.error) };
  return { exito: true, valor: {
    esquema: versionEsquemaSalida, versionRige,
    proyecto: resolucion.proyecto, herramienta: resolucion.identidad.herramienta,
    versionHerramienta: resolucion.identidad.version,
    resumenEntradas: resolucion.resumenEntradas, entradas: resolucion.entradas,
    agente, ruta: segmentos ?? null, valores: consulta.valor.valores, reglas: resolucion.reglas,
    noResueltas: consulta.valor.noResueltas.map(pendiente => ({ ...pendiente,
      ruta: pendiente.ruta.slice(resolucion.prefijoAgente.length + 1),
    })),
    motivo: consulta.valor.motivo,
  } };
}
