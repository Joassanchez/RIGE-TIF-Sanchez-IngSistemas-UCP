import type { Resultado } from "@rige/nucleo/resultado";
import { errorSolicitudInvalida, type ErrorUso } from "../errores";
import type { PuertoResoluciones } from "../puertos/resoluciones";
import type { RespuestaConsulta } from "../respuestas/consulta";
import { respuestaValores } from "./proyectar-valores";

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
  const respuesta = respuestaValores(resolucion, agente, clave === "" ? undefined : clave);
  if (!respuesta.exito) return respuesta;
  const anteriores = resoluciones.listar(resolucion.proyecto);
  if (!anteriores.exito) return anteriores;
  return { exito: true, valor: { respuesta: respuesta.valor,
    sobre: { id: guardada.valor.id, instante: guardada.valor.instante, anteriores: anteriores.valor },
  } };
}
