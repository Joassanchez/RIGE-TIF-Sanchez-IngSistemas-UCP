import * as jsonc from "jsonc-parser";
import { createScanner, parseTree, type Node, type ParseError } from "jsonc-parser";
import type { ContextoConsulta, ErrorAnalisis, Posicion, ValorSustituido, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";

const { SyntaxKind }: { readonly SyntaxKind: Readonly<Record<
  "EOF" | "StringLiteral" | "LineCommentTrivia" | "BlockCommentTrivia", number>> } = jsonc;
const tiposSustituibles = [SyntaxKind.StringLiteral, SyntaxKind.LineCommentTrivia, SyntaxKind.BlockCommentTrivia];

export function posicion(texto: string, desplazamiento: number): Posicion {
  let linea = 1;
  let inicio = 0;
  for (let i = 0; i < desplazamiento; i++) {
    if (texto[i] === "\n") { linea++; inicio = i + 1; }
  }
  return { linea, columna: desplazamiento - inicio + 1 };
}

interface Token { readonly tipo: number; readonly inicio: number; readonly fin: number; readonly texto: string }
function escanear(texto: string): { tokens: Token[]; invalido: boolean } {
  const scanner = createScanner(texto, false);
  const tokens: Token[] = [];
  let invalido = false;
  for (let tipo = scanner.scan(); tipo !== SyntaxKind.EOF; tipo = scanner.scan()) {
    const inicio = scanner.getTokenOffset();
    const fin = inicio + scanner.getTokenLength();
    tokens.push({ tipo, inicio, fin, texto: texto.slice(inicio, fin) });
    if (scanner.getTokenError() !== 0) invalido = true;
  }
  return { tokens, invalido };
}

/** Solo dentro del lector y del oraculo; nunca se incorpora a datos del dominio. */
interface SustitucionInterna { readonly enCadena: boolean; readonly inicio: number; readonly fin: number; readonly valor: ValorSustituido }
interface Tramo { readonly inicio: number; readonly fin: number; readonly original: number; readonly copiado: boolean }

export function sustituye(via: ViaUbicada): boolean {
  return via.via !== "variable-permiso" && via.via !== "markdown";
}

export function expandir(via: ViaUbicada, texto: string, entorno: EntornoLectura,
  contexto: Pick<ContextoConsulta, "proyecto" | "parametros">): Resultado<{
    readonly original: Node; readonly expandido: Node; readonly sustituciones: readonly SustitucionInterna[];
  }, ErrorAnalisis> {
  const referencia = via.referencia.replaceAll("\\", "/");
  const permiso = via.via === "variable-permiso";
  const vacio = () => {
    const nodo = parseTree("{}")!;
    return { exito: true as const, valor: { original: nodo, expandido: nodo, sustituciones: [] as readonly SustitucionInterna[] } };
  };
  if (!permiso && texto === "") return vacio();
  const literal = !sustituye(via);
  const ocurrencias = literal ? [] : [...texto.matchAll(/\{(?:env|file):[^}]+\}/g)];
  const original = escanear(texto);
  const noSoportado = (inicio: number, token: string): Resultado<never, ErrorAnalisis> => {
    const p = posicion(texto, inicio);
    return { exito: false, error: { categoria: "uso", codigo: "contenido-no-soportado",
      mensaje: `RIGE no incorpora ${token} (${referencia}:${p.linea}:${p.columna}).` } };
  };
  const tokenEn = (inicio: number) => ocurrencias.find(o => o.index === inicio)?.[0];
  const ilegible = (inicio: number, archivo?: string): Resultado<never, ErrorAnalisis> => {
    const p = posicion(texto, inicio);
    return { exito: false, error: { categoria: "uso", codigo: "entrada-ilegible",
      ilegible: { posicion: p, consecuencia: permiso ? "descartada" : "falla", ...(archivo === undefined ? {} : { archivo }) },
      mensaje: archivo === undefined ? `La entrada ${referencia} no se puede leer${tokenEn(inicio) ? ` por ${tokenEn(inicio)}` : ""} (${p.linea}:${p.columna}).`
        : `No se puede leer el archivo ${archivo} referenciado por ${tokenEn(inicio)} en ${referencia} (${p.linea}:${p.columna}).` } };
  };
  for (const m of ocurrencias) {
    const t = original.tokens.find(t => t.inicio <= m.index && m.index + m[0].length <= t.fin);
    if (!t || !tiposSustituibles.includes(t.tipo)) return noSoportado(m.index, m[0]);
  }
  const errores: ParseError[] = [];
  const raiz = parseTree(texto, errores, { allowTrailingComma: !permiso, disallowComments: permiso });
  if (permiso) {
    let valor: unknown;
    try { valor = JSON.parse(texto); } catch { return ilegible(errores[0]?.offset ?? 0); }
    if (valor === null || (Array.isArray(valor) && valor.length === 0)) return vacio();
    if (!errores.length && raiz?.type !== "object") return { exito: false, error: { categoria: "uso", codigo: "contenido-no-soportado",
      mensaje: `RIGE no incorpora ${via.referencia}: el permiso debe ser un objeto.` } };
  }
  if (errores.length || original.invalido || raiz?.type !== "object") return ilegible(errores[0]?.offset ?? raiz?.offset ?? 0);
  if (literal || !ocurrencias.length) return { exito: true, valor: { original: raiz, expandido: raiz, sustituciones: [] } };

  const enCadena = (inicio: number) => original.tokens.some(t => t.tipo === SyntaxKind.StringLiteral && t.inicio <= inicio && inicio < t.fin);
  const sustituciones: SustitucionInterna[] = [];
  const tramos: Tramo[] = [];
  let cursor = 0;
  let expandido = "";
  function agregar(contenido: string, inicio: number, copiado: boolean): void {
    tramos.push({ inicio: expandido.length, fin: expandido.length + contenido.length, original: inicio, copiado });
    expandido += contenido;
  }
  // variable.ts: primero todas las variables, incluso en comentarios y claves.
  for (const m of texto.matchAll(/\{env:([^}]+)\}/g)) {
    agregar(texto.slice(cursor, m.index), cursor, true);
    const contenido = entorno.variable(m[1]!) || "";
    agregar(contenido, m.index, false);
    sustituciones.push({ enCadena: enCadena(m.index), inicio: m.index, fin: m.index + m[0].length,
      valor: { tipo: "variable", origen: m[1]!, definido: contenido !== "", posicion: posicion(texto, m.index) } });
    cursor = m.index + m[0].length;
  }
  agregar(texto.slice(cursor), cursor, true);
  const archivos = [...expandido.matchAll(/\{file:[^}]+\}/g)];
  // Preflight completo, incluso en comentarios, antes de cualquier lectura.
  const originales: number[] = [];
  for (const m of archivos) {
    const tramo = tramos.find(t => t.copiado && t.inicio <= m.index && m.index + m[0].length <= t.fin);
    if (!tramo) {
      const t = tramos.find(t => !t.copiado && t.inicio < m.index + m[0].length
        && (m.index < t.fin || (t.inicio === t.fin && m.index <= t.inicio)));
      if (!t) throw new Error("Referencia de archivo sin tramo sustituido");
      const o = [...texto.matchAll(/\{env:([^}]+)\}/g)].find(o => o.index === t.original)!;
      return noSoportado(o.index, o[0]);
    }
    originales.push(tramo.original + m.index - tramo.inicio);
  }
  let salida = "";
  cursor = 0;
  for (const [i, m] of archivos.entries()) {
    salida += expandido.slice(cursor, m.index);
    const prefijo = expandido.slice(expandido.lastIndexOf("\n", m.index - 1) + 1, m.index).trimStart();
    if (prefijo.startsWith("//")) salida += m[0];
    else {
      const inicio = originales[i]!;
      let ruta = texto.slice(inicio + 6, inicio + m[0].length - 1);
      if (ruta.startsWith("~/")) ruta = entorno.unir(contexto.parametros.hogar!, ruta.slice(2));
      if (!entorno.esAbsoluta(ruta)) ruta = entorno.unir(via.via === "variable-contenido" ? contexto.proyecto : entorno.padre(via.referencia), ruta);
      const archivo = ruta.replaceAll("\\", "/");
      let contenido: string;
      try {
        if (entorno.tipo(ruta) !== "archivo") return ilegible(inicio, archivo);
        contenido = entorno.leer(ruta).texto;
      }
      catch { return ilegible(inicio, archivo); } // InvalidError de variable.ts, sin causa ni texto original del error.
      salida += JSON.stringify(contenido.trim()).slice(1, -1);
      sustituciones.push({ enCadena: enCadena(inicio), inicio, fin: inicio + m[0].length,
        valor: { tipo: "archivo", origen: archivo, definido: true, posicion: posicion(texto, inicio) } });
    }
    cursor = m.index + m[0].length;
  }
  salida += expandido.slice(cursor);
  const tokensE = escanear(salida);
  const erroresE: ParseError[] = [];
  const raizE = parseTree(salida, erroresE, { allowTrailingComma: true });
  if (tokensE.invalido || erroresE.length || raizE?.type !== "object") return ilegible(ocurrencias[0]!.index);
  let ultima = ocurrencias[0]!;
  for (let i = 0; i < Math.max(original.tokens.length, tokensE.tokens.length); i++) {
    const o = original.tokens[i];
    const e = tokensE.tokens[i];
    const propias = o ? ocurrencias.filter(m => o.inicio <= m.index && m.index < o.fin) : [];
    if (propias.length) ultima = propias.at(-1)!;
    const sustituido = propias.length > 0;
    if (!o || !e || o.tipo !== e.tipo || (!sustituido && o.texto !== e.texto)) return noSoportado(ultima.index, ultima[0]);
  }
  return { exito: true, valor: { original: raiz, expandido: raizE, sustituciones: sustituciones.filter(s => s.enCadena).sort((a, b) => a.inicio - b.inicio) } };
}
