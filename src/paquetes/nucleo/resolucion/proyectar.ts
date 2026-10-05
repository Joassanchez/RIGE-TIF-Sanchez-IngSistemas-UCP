import type { Resultado } from "../resultado";
import type { ClaveNoResuelta } from "../contrato/adaptador";
import type { Resolucion, RastroValor } from "./tipos";

export interface ValorConsultado { readonly clave: string; readonly rastro: RastroValor }
export interface Consulta {
  readonly valores: readonly ValorConsultado[];
  readonly noResueltas: readonly ClaveNoResuelta[];
}

export type ErrorConsulta = {
  readonly codigo: "agente-sin-declaraciones" | "clave-inexistente" | "clave-no-resuelta";
  readonly mensaje: string;
};

export function clave(ruta: readonly string[]): string {
  return ruta.join(".");
}

function esPrefijo(prefijo: readonly string[], ruta: readonly string[]): boolean {
  return prefijo.length <= ruta.length && prefijo.every((parte, indice) => ruta[indice] === parte);
}

export function consultarAgente(resolucion: Resolucion, agente: string, clave: string | undefined): Resultado<Consulta, ErrorConsulta> {
  const prefijo = [...resolucion.prefijoAgente, agente];
  const ruta = clave === undefined ? prefijo : [...prefijo, ...clave.split(".")];
  const noResueltas = resolucion.noResueltas.filter((pendiente) => esPrefijo(pendiente.ruta, prefijo)
    || esPrefijo(prefijo, pendiente.ruta));
  const pendiente = noResueltas.find((pendiente) => esPrefijo(pendiente.ruta, ruta)
    || (clave !== undefined && esPrefijo(ruta, pendiente.ruta)));
  if (pendiente) return { exito: false, error: {
    codigo: "clave-no-resuelta",
    mensaje: `La clave ${clave ?? agente} no esta resuelta para el agente ${agente}: ${resolucion.reglas[pendiente.regla]}`,
  } };
  const valores = resolucion.valores.filter((valor) => valor.ruta.length > prefijo.length
    && esPrefijo(prefijo, valor.ruta));
  if (!valores.length) {
    return { exito: false, error: { codigo: "agente-sin-declaraciones", mensaje: `El agente ${agente} no tiene declaraciones.` } };
  }
  const proyectar = (rastro: RastroValor): ValorConsultado => ({ clave: rastro.ruta.slice(prefijo.length).join("."), rastro });
  if (clave === undefined) return { exito: true, valor: { valores: valores.map(proyectar), noResueltas } };
  const valor = valores.find((valor) => valor.ruta.length === ruta.length
    && ruta.every((parte, indice) => valor.ruta[indice] === parte));
  if (!valor) {
    return { exito: false, error: { codigo: "clave-inexistente", mensaje: `La clave ${clave} no existe para el agente ${agente}.` } };
  }
  return { exito: true, valor: { valores: [proyectar(valor)], noResueltas } };
}
