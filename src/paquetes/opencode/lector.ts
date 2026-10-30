import * as jsonc from "jsonc-parser";
import { createScanner, getNodeValue, parseTree, type Node, type ParseError } from "jsonc-parser";
import type { Declaracion, ErrorAnalisis, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import type { Resultado } from "@rige/nucleo/resultado";

// Usar los tokens de runtime como numeros evita el const enum ambiental con verbatimModuleSyntax.
const { SyntaxKind }: { readonly SyntaxKind: Readonly<Record<
  "EOF" | "StringLiteral" | "LineCommentTrivia" | "BlockCommentTrivia", number
>> } = jsonc;

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
  const permiso = via.via === "variable-permiso";
  const scanner = createScanner(texto, false);
  let token = scanner.scan();
  for (const sustitucion of permiso ? [] : texto.matchAll(/\{(env|file):[^}]*\}/g)) {
    while (token !== SyntaxKind.EOF && scanner.getTokenOffset() + scanner.getTokenLength() <= sustitucion.index) {
      token = scanner.scan();
    }
    const dentro = scanner.getTokenOffset() <= sustitucion.index
      && sustitucion.index + sustitucion[0].length <= scanner.getTokenOffset() + scanner.getTokenLength();
    if (dentro && [SyntaxKind.StringLiteral, SyntaxKind.LineCommentTrivia, SyntaxKind.BlockCommentTrivia].includes(token)) continue;
    const { linea, columna } = posicion(texto, sustitucion.index);
    return { exito: false, error: { categoria: "uso",
      codigo: "contenido-no-soportado",
      mensaje: `RIGE no incorpora ${sustitucion[0]} (${via.referencia.replaceAll("\\", "/")}:${linea}:${columna}).`,
    } };
  }
  const errores: ParseError[] = [];
  const raiz = parseTree(texto, errores, { allowTrailingComma: !permiso, disallowComments: permiso });
  let invalido = errores.length > 0;
  if (permiso) {
    try { JSON.parse(texto); }
    catch { invalido = true; }
    if (!invalido && raiz?.type !== "object") return { exito: false, error: { categoria: "uso", codigo: "contenido-no-soportado",
      mensaje: `RIGE no incorpora ${via.referencia}: el permiso debe ser un objeto.`,
    } };
  }
  if (invalido || raiz?.type !== "object") {
    const { linea, columna } = posicion(texto, errores[0]?.offset ?? (permiso ? 0 : raiz?.offset ?? 0));
    return { exito: false, error: { categoria: "uso",
      codigo: "entrada-ilegible",
      ilegible: { posicion: { linea, columna }, consecuencia: permiso ? "descartada" : "falla" },
      mensaje: `La entrada ${via.referencia.replaceAll("\\", "/")} no se puede leer (${linea}:${columna}).`,
    } };
  }
  const declaraciones: Declaracion[] = [];
  function recorrer(nodo: Node, ruta: readonly string[]): void {
    for (const propiedad of nodo.children ?? []) {
      const [clave, valor] = propiedad.children!;
      const rutaHoja = [...ruta, getNodeValue(clave!) as string];
      if (valor!.type === "object" && valor!.children?.length) recorrer(valor!, rutaHoja);
      else declaraciones.push({
        ruta: rutaHoja, valor: getNodeValue(valor!), posicion: posicion(texto, clave!.offset),
      });
    }
  }
  recorrer(raiz, permiso ? ["permission"] : []);
  return { exito: true, valor: declaraciones };
}
