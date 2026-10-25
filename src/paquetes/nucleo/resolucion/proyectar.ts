import type { Resultado } from "../resultado";
import type { ClaveNoResuelta } from "../contrato/adaptador";
import type { Resolucion, RastroValor } from "./tipos";

export interface ValorConsultado { readonly clave: string; readonly rastro: RastroValor }
export interface Consulta {
  readonly valores: readonly ValorConsultado[];
  readonly noResueltas: readonly ClaveNoResuelta[];
  readonly motivo: "clave-inexistente" | null;
}

export type ErrorConsulta = {
  readonly categoria: "uso";
  readonly codigo: "agente-sin-declaraciones" | "clave-no-resuelta" | "solicitud-invalida";
  readonly mensaje: string;
};

export function clave(ruta: readonly string[]): string {
  return ruta.join(".");
}

export function rutaDesdeTexto(texto: string): Resultado<readonly string[], ErrorConsulta> {
  if (!texto || (texto.startsWith("/") && /~(?![01])/.test(texto))) return { exito: false, error: {
    categoria: "uso",
    codigo: "solicitud-invalida", mensaje: "La clave esta vacia o el puntero JSON tiene un escape invalido.",
  } };
  return { exito: true, valor: texto.startsWith("/")
    ? texto.slice(1).split("/").map((parte) => parte.replaceAll("~1", "/").replaceAll("~0", "~"))
    : texto.split(".") };
}

function esPrefijo(prefijo: readonly string[], ruta: readonly string[]): boolean {
  return prefijo.length <= ruta.length && prefijo.every((parte, indice) => ruta[indice] === parte);
}

export function consultarAgente(resolucion: Resolucion, agente: string, relativa: readonly string[] | undefined): Resultado<Consulta, ErrorConsulta> {
  const prefijo = [...resolucion.prefijoAgente, agente];
  const ruta = relativa === undefined ? prefijo : [...prefijo, ...relativa];
  const textoClave = relativa === undefined ? agente : clave(relativa);
  const noResueltas = resolucion.noResueltas.filter((pendiente) => esPrefijo(pendiente.ruta, prefijo)
    || esPrefijo(prefijo, pendiente.ruta));
  const pendiente = noResueltas.find((pendiente) => esPrefijo(pendiente.ruta, ruta)
    || (relativa !== undefined && esPrefijo(ruta, pendiente.ruta)));
  if (pendiente) return { exito: false, error: {
    categoria: "uso",
    codigo: "clave-no-resuelta",
    mensaje: `La clave ${textoClave} no esta resuelta para el agente ${agente}: ${resolucion.reglas[pendiente.regla]}`,
  } };
  const valores = resolucion.valores.filter((valor) => valor.ruta.length > prefijo.length
    && esPrefijo(prefijo, valor.ruta));
  if (!valores.length && !noResueltas.some((pendiente) => pendiente.ruta.length > prefijo.length
    && esPrefijo(prefijo, pendiente.ruta))) {
    return { exito: false, error: { categoria: "uso", codigo: "agente-sin-declaraciones", mensaje: `El agente ${agente} no tiene declaraciones.` } };
  }
  const proyectar = (rastro: RastroValor): ValorConsultado => ({ clave: rastro.ruta.slice(prefijo.length).join("."), rastro });
  if (relativa === undefined) return { exito: true, valor: { valores: valores.map(proyectar), noResueltas, motivo: null } };
  const valor = valores.find((valor) => valor.ruta.length === ruta.length
    && ruta.every((parte, indice) => valor.ruta[indice] === parte));
  if (!valor) {
    return { exito: true, valor: { valores: [], noResueltas, motivo: "clave-inexistente" } };
  }
  return { exito: true, valor: { valores: [proyectar(valor)], noResueltas, motivo: null } };
}
