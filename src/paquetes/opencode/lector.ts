import { getNodeValue, parseTree, type Node, type ParseError } from "jsonc-parser";
import type { Declaracion, ErrorAnalisis, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import type { Resultado } from "@rige/nucleo/resultado";

export function posicion(texto: string, desplazamiento: number): { linea: number; columna: number } {
  let linea = 1;
  let inicioLinea = 0;
  for (let indice = 0; indice < desplazamiento; indice++) {
    if (texto[indice] === "\n") {
      linea++;
      inicioLinea = indice + 1;
    }
  }
  return { linea, columna: 1 + desplazamiento - inicioLinea };
}

export function leerEntrada(via: ViaUbicada, texto: string): Resultado<readonly Declaracion[], ErrorAnalisis> {
  const sustitucion = /\{(env|file):[^}]*\}/.exec(texto);
  if (sustitucion) {
    const { linea, columna } = posicion(texto, sustitucion.index);
    return { exito: false, error: {
      codigo: "contenido-no-soportado",
      mensaje: `El prototipo v1 no incorpora ${sustitucion[0]} (${via.referencia.replaceAll("\\", "/")}:${linea}:${columna}).`,
    } };
  }
  const errores: ParseError[] = [];
  const raiz = parseTree(texto, errores, { allowTrailingComma: true });
  if (errores.length || raiz?.type !== "object") {
    const { linea, columna } = posicion(texto, errores[0]?.offset ?? raiz?.offset ?? 0);
    return { exito: false, error: {
      codigo: "entrada-ilegible",
      mensaje: `La entrada ${via.referencia.replaceAll("\\", "/")} no se puede leer (${linea}:${columna}).`,
    } };
  }
  const declaraciones: Declaracion[] = [];
  function recorrer(nodo: Node, ruta: readonly string[]): void {
    for (const propiedad of nodo.children ?? []) {
      const [clave, valor] = propiedad.children!;
      const rutaHoja = [...ruta, getNodeValue(clave!) as string];
      if (valor!.type === "object") recorrer(valor!, rutaHoja);
      else declaraciones.push({
        ruta: rutaHoja, valor: getNodeValue(valor!), posicion: posicion(texto, clave!.offset),
      });
    }
  }
  recorrer(raiz, []);
  return { exito: true, valor: declaraciones };
}
