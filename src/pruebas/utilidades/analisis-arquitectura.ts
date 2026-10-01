import { builtinModules } from "node:module";
import { existsSync, realpathSync, statSync } from "node:fs";
import { posix, resolve } from "node:path";
import { createScanner, SyntaxKind } from "typescript/unstable/ast";

export interface HallazgoDependencia {
  archivo: string;
  motivo: string;
}

interface OpcionesAnalisis {
  dependencias?: Readonly<Record<string, string>>;
}

export interface Token {
  valor: string;
  cadena: boolean;
}

const raiz = resolve(import.meta.dir, "../..");
const normalizar = (ruta: string) => posix.normalize(ruta.replaceAll("\\", "/"));
const directorioEsquemas = normalizar(resolve(raiz, "esquemas/almacen"));
const modulo = (ruta: string) => {
  const partes = normalizar(ruta).split("/");
  if (partes[0] !== "paquetes") return "fuera";
  return partes[1] === "rige" ? `rige/${partes[2]}` : partes[1] ?? "fuera";
};
const runtime = new Set(builtinModules.map((nombre) => nombre.replace(/^node:/, "")));
const red = new Set(["http", "https", "http2", "net", "tls", "dgram", "dns"]);
const auxiliaresRuntime = new Set(["assert", "buffer", "constants", "crypto", "events", "os", "path",
  "querystring", "string_decoder", "url", "util"]);
const lecturas = new Set(["readFileSync", "readFile", "readdirSync", "readdir", "statSync", "stat",
  "lstatSync", "lstat", "realpathSync", "realpath", "existsSync", "accessSync", "access", "readlinkSync", "readlink"]);

// El scanner oficial avanza desde cada token; no consume comillas de una regex como cadenas.
export function tokenizar(codigo: string): Token[] {
  const resultado: Token[] = [];
  const scanner = createScanner(true, undefined, codigo);
  const inicioExpresion = new Set<SyntaxKind | undefined>([
    undefined, SyntaxKind.EqualsToken, SyntaxKind.EqualsGreaterThanToken, SyntaxKind.OpenParenToken,
    SyntaxKind.OpenBracketToken, SyntaxKind.OpenBraceToken, SyntaxKind.CommaToken, SyntaxKind.ColonToken,
    SyntaxKind.ExclamationToken, SyntaxKind.ReturnKeyword, SyntaxKind.ThrowKeyword, SyntaxKind.CaseKeyword,
    SyntaxKind.SemicolonToken, SyntaxKind.QuestionToken, SyntaxKind.BarBarToken, SyntaxKind.AmpersandAmpersandToken,
    SyntaxKind.TypeOfKeyword, SyntaxKind.VoidKeyword, SyntaxKind.DeleteKeyword, SyntaxKind.AwaitKeyword,
    SyntaxKind.YieldKeyword, SyntaxKind.ElseKeyword, SyntaxKind.DoKeyword, SyntaxKind.PlusToken, SyntaxKind.MinusToken,
    SyntaxKind.AsteriskToken, SyntaxKind.AsteriskAsteriskToken, SyntaxKind.PercentToken, SyntaxKind.TildeToken,
    SyntaxKind.BarToken, SyntaxKind.AmpersandToken, SyntaxKind.CaretToken, SyntaxKind.QuestionQuestionToken,
  ]);
  const finExpresion = new Set<SyntaxKind>([
    SyntaxKind.Identifier, SyntaxKind.NumericLiteral, SyntaxKind.BigIntLiteral, SyntaxKind.StringLiteral,
    SyntaxKind.RegularExpressionLiteral, SyntaxKind.NoSubstitutionTemplateLiteral, SyntaxKind.TemplateTail,
    SyntaxKind.CloseBracketToken, SyntaxKind.PlusPlusToken, SyntaxKind.MinusMinusToken,
  ]);
  const plantillas: number[] = [];
  let llaves = 0;
  let anterior: SyntaxKind | undefined;
  for (let clase = scanner.scan(); clase !== SyntaxKind.EndOfFile; clase = scanner.scan()) {
    if (clase === SyntaxKind.SlashToken || clase === SyntaxKind.SlashEqualsToken) {
      if (inicioExpresion.has(anterior)) {
        clase = scanner.reScanSlashToken();
      } else if (anterior !== undefined && !finExpresion.has(anterior) && scanner.lookAhead(() => {
        return scanner.reScanSlashToken() === SyntaxKind.RegularExpressionLiteral && !scanner.isUnterminated();
      })) {
        // Sin parser AST en proceso no se adivina si un cierre pertenece a un bloque o una expresion.
        throw new Error("Dependencia no analizable: contexto ambiguo de regex o division");
      }
    }
    if (clase === SyntaxKind.CloseBraceToken && plantillas.at(-1) === llaves) {
      clase = scanner.reScanTemplateToken(false);
      if (clase === SyntaxKind.TemplateTail) plantillas.pop();
    } else if (clase === SyntaxKind.OpenBraceToken) {
      llaves++;
    } else if (clase === SyntaxKind.CloseBraceToken) {
      llaves--;
    }
    if (clase === SyntaxKind.TemplateHead) plantillas.push(llaves);
    if (scanner.isUnterminated() || clase === SyntaxKind.Unknown) {
      throw new Error("Dependencia no analizable: token incompleto o desconocido");
    }
    const cadena = clase === SyntaxKind.StringLiteral;
    const valor = cadena ? scanner.getTokenText().slice(1, -1)
      : clase === SyntaxKind.Identifier ? scanner.getTokenValue() : scanner.getTokenText();
    resultado.push({ valor, cadena });
    anterior = clase;
  }
  return resultado;
}

function extraerImports(codigo: string): { destino: string; clausula: Token[] }[] {
  const encontrados: { destino: string; clausula: Token[] }[] = [];
  const lista = tokenizar(codigo);
  for (let indice = 0; indice < lista.length; indice++) {
    const token = lista[indice]!;
    if (token.cadena || !["import", "export", "require"].includes(token.valor)) continue;
    if (lista[indice - 1]?.valor === ".") {
      if (token.valor === "require") throw new Error("Dependencia no analizable: cargador indirecto");
      continue;
    }
    const siguiente = lista[indice + 1];
    if (token.valor === "import" && siguiente?.valor === ".") continue;
    let destino: Token | undefined;
    let fin = indice + 1;
    if (siguiente?.valor === "(") {
      destino = lista[indice + 2];
      if (!destino?.cadena || !["(", ")", ","].includes(lista[indice + 3]?.valor ?? "")) {
        throw new Error("Dependencia no analizable: llamada con destino no literal");
      }
      fin = indice + 2;
    } else if (token.valor === "require") {
      throw new Error("Dependencia no analizable: referencia indirecta a require");
    } else if (token.valor === "import" && siguiente?.cadena) {
      destino = siguiente;
    } else {
      for (let cursor = indice + 1; cursor < lista.length; cursor++) {
        const actual = lista[cursor]!;
        if (!actual.cadena && [";", "import", "export"].includes(actual.valor)) break;
        if (!actual.cadena && actual.valor === "from" && lista[cursor + 1]?.cadena) {
          destino = lista[cursor + 1];
          fin = cursor;
          break;
        }
      }
    }
    if (destino) {
      if (destino.valor.includes("\\")) throw new Error("Dependencia no analizable: literal escapado");
      encontrados.push({ destino: destino.valor, clausula: lista.slice(indice, fin) });
    }
  }
  return encontrados;
}

function destinos(archivo: string, destino: string): string[] {
  if (destino.startsWith(".")) return [posix.join(posix.dirname(archivo), destino)];
  if (destino.startsWith("@rige/")) return [normalizar(destino.replace("@rige/", "paquetes/"))];
  return [destino];
}

function permitidoLocal(origen: string, destino: string): boolean {
  const desde = modulo(origen);
  const hacia = modulo(destino);
  if (/\.test(?:\.[cm]?[jt]sx?)?$/.test(destino)) return false;
  if (desde === "nucleo") return hacia === "nucleo";
  if (desde === "opencode") return hacia === "opencode" || hacia === "nucleo";
  if (desde === "rige/aplicacion") return hacia === "rige/aplicacion" || hacia === "nucleo";
  if (desde === "rige/adaptadores") {
    return hacia === "nucleo" || destino.startsWith("paquetes/rige/aplicacion/puertos/")
      || (hacia === desde && origen.split("/")[3] === destino.split("/")[3]);
  }
  if (desde === "rige/interfaces") {
    return hacia === desde || /^paquetes\/rige\/aplicacion\/(casos-uso\/|respuestas\/|errores(?:\.|$))/.test(destino);
  }
  return desde === "rige/arranque" && hacia !== "fuera";
}

function nombresImportados(clausula: Token[]): string[] {
  const valores = clausula.map((token) => token.valor);
  const inicio = valores.indexOf("{");
  const fin = valores.indexOf("}");
  if (inicio < 0 || fin < 0 || valores.slice(1, inicio).some((valor) => valor !== "type")) return [];
  return valores.slice(inicio + 1, fin).join(" ").split(",")
    .map((nombre) => nombre.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]!).filter(Boolean);
}

function permitidoSql(origen: string, destino: string, literal: string): boolean {
  if (!origen.startsWith("paquetes/rige/adaptadores/almacen-sqlite/")
    || !/^esquemas\/almacen\/.+\.sql$/.test(destino)
    || (!literal.startsWith(".") && literal === destino)) return false;
  const ruta = resolve(raiz, destino);
  if (!existsSync(ruta)) return false;
  // El destino fisico tambien debe quedar dentro del directorio autorizado.
  const real = normalizar(realpathSync(ruta));
  return real.startsWith(`${directorioEsquemas}/`) && real.endsWith(".sql") && statSync(real).isFile();
}

export function analizarFuente(archivo: string, codigo: string, opciones: OpcionesAnalisis = {}): HallazgoDependencia[] {
  archivo = normalizar(archivo);
  if (/\.test\.[cm]?[jt]sx?$/.test(archivo)) return [];
  const scanner = new Bun.Transpiler({ loader: /\.[jt]sx$/.test(archivo) ? "tsx" : "ts" }).scanImports(codigo);
  const imports = extraerImports(codigo);
  for (const entrada of scanner) {
    if (!imports.some((encontrado) => encontrado.destino === entrada.path)) {
      imports.push({ destino: entrada.path, clausula: [] });
    }
  }
  const hallazgos: HallazgoDependencia[] = [];
  for (const referencia of codigo.matchAll(/^\s*\/\/\/\s*<reference\s+path\s*=\s*["']([^"']+)["'][^>]*>/gm)) {
    const ruta = normalizar(referencia[1]!);
    const destino = posix.join(posix.dirname(archivo), ruta);
    if (!ruta.endsWith(".d.ts") || posix.isAbsolute(ruta)
      || posix.dirname(destino) !== posix.dirname(archivo)) {
      hallazgos.push({ archivo, motivo: `Referencia no permitida: ${ruta}` });
    }
  }
  for (const entrada of imports) {
    for (const destino of destinos(archivo, entrada.destino)) {
      let permitido = false;
      const nombreRuntime = destino.replace(/^node:/, "");
      if (destino.endsWith(".sql") || entrada.destino.endsWith(".sql")) {
        permitido = permitidoSql(archivo, destino, entrada.destino);
      } else if (destino.startsWith("paquetes/")) {
        permitido = permitidoLocal(archivo, destino)
          && !(entrada.destino.startsWith(".") && archivo.split("/")[1] !== destino.split("/")[1]);
        const origenPaquete = archivo.split("/")[1];
        const destinoPaquete = destino.split("/")[1];
        if (opciones.dependencias && origenPaquete !== destinoPaquete
          && opciones.dependencias[`@rige/${destinoPaquete}`] !== "workspace:*") permitido = false;
      } else if (nombreRuntime === "fs") {
        const nombres = nombresImportados(entrada.clausula);
        permitido = nombres.length > 0 && (archivo.startsWith("paquetes/rige/adaptadores/sistema/")
          ? nombres.every((nombre) => lecturas.has(nombre))
          : archivo.startsWith("paquetes/rige/adaptadores/almacen-sqlite/") && nombres.every((nombre) => nombre === "mkdirSync"));
      } else if (destino === "bun:sqlite") {
        permitido = archivo.startsWith("paquetes/rige/adaptadores/almacen-sqlite/");
      } else if (runtime.has(nombreRuntime)) {
        permitido = auxiliaresRuntime.has(nombreRuntime.split("/")[0]!) && !red.has(nombreRuntime.split("/")[0]!)
          && ["rige/adaptadores", "rige/interfaces", "rige/arranque"].includes(modulo(archivo))
          && nombreRuntime !== "fs/promises";
      } else if (destino === "jsonc-parser") {
        permitido = modulo(archivo) === "opencode" && opciones.dependencias?.[destino] === "3.3.1";
      }
      if (!permitido) hallazgos.push({ archivo, motivo: `Dependencia no permitida: ${entrada.destino} -> ${destino}` });
    }
  }
  return hallazgos;
}

interface Manifiesto {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export function analizarManifiesto(paquete: string, manifiesto: Manifiesto): HallazgoDependencia[] {
  const permitidas: Record<string, Record<string, string>> = {
    nucleo: {}, opencode: { "@rige/nucleo": "workspace:*", "jsonc-parser": "3.3.1" },
    rige: { "@rige/nucleo": "workspace:*", "@rige/opencode": "workspace:*" },
  };
  const hallazgos: HallazgoDependencia[] = [];
  for (const seccion of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"] as const) {
    for (const [nombre, version] of Object.entries(manifiesto[seccion] ?? {})) {
      if (seccion !== "dependencies" || permitidas[paquete]?.[nombre] !== version) {
        hallazgos.push({ archivo: `paquetes/${paquete}/package.json`, motivo: `${seccion} no permitida: ${nombre}@${version}` });
      }
    }
  }
  return hallazgos;
}

export async function comprobarDependencias(): Promise<HallazgoDependencia[]> {
  const hallazgos: HallazgoDependencia[] = [];
  for (const paquete of ["nucleo", "opencode", "rige"]) {
    const manifiesto: Manifiesto = await Bun.file(resolve(raiz, "paquetes", paquete, "package.json")).json();
    hallazgos.push(...analizarManifiesto(paquete, manifiesto));
    for (const ruta of new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}").scanSync({ cwd: resolve(raiz, "paquetes", paquete) })) {
      if (ruta.replaceAll("\\", "/").split("/").includes("node_modules")) continue;
      const archivo = `paquetes/${paquete}/${normalizar(ruta)}`;
      hallazgos.push(...analizarFuente(archivo, await Bun.file(resolve(raiz, archivo)).text(), {
        dependencias: manifiesto.dependencies ?? {},
      }));
    }
  }
  return hallazgos.sort((a, b) => a.archivo.localeCompare(b.archivo) || a.motivo.localeCompare(b.motivo));
}

export function analizarIdentificaciones(archivo: string, codigo: string): HallazgoDependencia[] {
  archivo = normalizar(archivo);
  return archivo.startsWith("paquetes/nucleo/") && /opencode/i.test(codigo)
    ? [{ archivo, motivo: "Identificacion de herramienta en la fuente original del nucleo" }] : [];
}

export async function comprobarIdentificaciones(): Promise<HallazgoDependencia[]> {
  const hallazgos: HallazgoDependencia[] = [];
  for (const ruta of new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}").scanSync({ cwd: resolve(raiz, "paquetes/nucleo") })) {
    const relativa = normalizar(ruta);
    if (relativa.split("/").includes("node_modules")) continue;
    const archivo = `paquetes/nucleo/${relativa}`;
    hallazgos.push(...analizarIdentificaciones(archivo, await Bun.file(resolve(raiz, archivo)).text()));
  }
  return hallazgos.sort((a, b) => a.archivo.localeCompare(b.archivo));
}

export function analizarGlobales(archivo: string, codigo: string): HallazgoDependencia[] {
  archivo = normalizar(archivo);
  if (!archivo.startsWith("paquetes/") || /\.test\.[cm]?[jt]sx?$/.test(archivo)) return [];
  const hallazgos: HallazgoDependencia[] = [];
  const lista = tokenizar(codigo);
  for (const [indice, token] of lista.entries()) {
    if (token.cadena || !["Bun", "process"].includes(token.valor)) continue;
    const acceso = lista[indice + 1]?.valor;
    const global = lista[indice - 2]?.valor === "globalThis" && lista[indice - 1]?.valor === ".";
    if (acceso !== "." && acceso !== "[" && !global) continue;
    if (token.valor === "process" && archivo === "paquetes/rige/arranque/rige.ts") continue;
    if (token.valor === "Bun" && acceso === "." && lista[indice + 2]?.valor === "serve"
      && archivo === "paquetes/rige/interfaces/web/servidor.ts") continue;
    hallazgos.push({ archivo, motivo: `Global no permitido: ${token.valor}` });
  }
  return hallazgos;
}

export async function comprobarGlobales(): Promise<HallazgoDependencia[]> {
  const hallazgos: HallazgoDependencia[] = [];
  for (const ruta of new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}").scanSync({ cwd: resolve(raiz, "paquetes") })) {
    const relativa = normalizar(ruta);
    if (relativa.split("/").includes("node_modules")) continue;
    const archivo = `paquetes/${relativa}`;
    hallazgos.push(...analizarGlobales(archivo, await Bun.file(resolve(raiz, archivo)).text()));
  }
  return hallazgos.sort((a, b) => a.archivo.localeCompare(b.archivo) || a.motivo.localeCompare(b.motivo));
}
