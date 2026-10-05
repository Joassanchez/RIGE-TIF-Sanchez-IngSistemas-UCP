import type { Resultado } from "../resultado";
import type { Resolucion, RastroValor } from "./tipos";

export type ErrorConsulta = {
  readonly codigo: "agente-sin-declaraciones" | "clave-inexistente";
  readonly mensaje: string;
};

export function clave(ruta: readonly string[]): string {
  return ruta.join(".");
}

export function consultarAgente(resolucion: Resolucion, agente: string, clave: string | undefined): Resultado<readonly RastroValor[], ErrorConsulta> {
  const prefijo = [...resolucion.prefijoAgente, agente];
  const valores = resolucion.valores.filter((valor) => valor.ruta.length > prefijo.length
    && prefijo.every((parte, indice) => valor.ruta[indice] === parte));
  if (!valores.length) {
    return { exito: false, error: { codigo: "agente-sin-declaraciones", mensaje: `El agente ${agente} no tiene declaraciones.` } };
  }
  if (clave === undefined) return { exito: true, valor: valores };
  const ruta = [...prefijo, ...clave.split(".")];
  const valor = valores.find((valor) => valor.ruta.length === ruta.length
    && ruta.every((parte, indice) => valor.ruta[indice] === parte));
  if (!valor) {
    return { exito: false, error: { codigo: "clave-inexistente", mensaje: `La clave ${clave} no existe para el agente ${agente}.` } };
  }
  return { exito: true, valor: [valor] };
}
