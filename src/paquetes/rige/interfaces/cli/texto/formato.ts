import type { RespuestaValores, RespuestaPermiso } from "../../../aplicacion/respuestas/contrato-generado";
import { decisionTexto as efecto, efectoRegla, origenNativo } from "../../presentacion/vocabulario";

export interface ContextoPresentacion {
  readonly formato: "json" | "texto";
  readonly ancho: number;
  readonly esConsola: boolean;
  readonly colorHabilitado: boolean;
  readonly todo: boolean;
  readonly proyectoDesdeCarpetaActual: boolean;
  readonly explicar?: boolean;
  readonly agente?: string | undefined;
  readonly limitesGenerales: ReadonlySet<string>;
}

export type Linea = string | { readonly tabla: string };
export type Declaracion = RespuestaValores["valores"][number]["rastro"]["determinante"];

export const nombre = (ruta: string): string =>
  ruta.replaceAll("\\", "/").split("/").filter(Boolean).at(-1) ?? ruta;

export const seguro = (texto: string): string =>
  texto.replace(/[\x00-\x1f\x7f]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);

export const valor = (dato: unknown): string =>
  seguro(typeof dato === "string" ? dato : JSON.stringify(dato));

export const ancho = (c: ContextoPresentacion): number =>
  Math.max(40, Number.isFinite(c.ancho) && c.ancho > 0 ? Math.floor(c.ancho) : 100);

export const longitud = (s: string): number => Array.from(s).length;

export function recortar(s: string, limite: number): string {
  return longitud(s) <= limite ? s : Array.from(s).slice(0, limite - 1).join("") + "…";
}

export const atenuar = (s: string, c: ContextoPresentacion): string =>
  c.esConsola && c.colorHabilitado ? `\x1b[90m${s}\x1b[0m` : s;

export function tabla(
  cabecera: string[],
  filas: string[][],
  c: ContextoPresentacion,
  variable = true,
  marcas: readonly string[] = []
): Linea[] {
  const maximoColumnas = Math.max(2, Math.floor((ancho(c) + 3) / 9));
  if (cabecera.length > maximoColumnas) {
    const bloques: Linea[] = [];
    for (let inicio = 1; inicio < cabecera.length; inicio += maximoColumnas - 1) {
      const fin = inicio + maximoColumnas - 1;
      const subCabecera = [cabecera[0]!, ...cabecera.slice(inicio, fin)];
      const subFilas = filas.map(f => [f[0]!, ...f.slice(inicio, fin)]);
      bloques.push(...tabla(subCabecera, subFilas, c, variable, marcas));
    }
    return bloques;
  }
  const todas = [cabecera.map(s => s.toUpperCase()), ...filas].map(fila => fila.map(seguro));
  const tamanos = cabecera.map((_, i) => Math.max(...todas.map(fila => longitud(fila[i] ?? ""))));
  const ultima = cabecera.length - 1;
  if (variable) {
    const anchoPrevio = tamanos.slice(0, -1).reduce((a, b) => a + b, 0);
    const disponible = ancho(c) - anchoPrevio - ultima * 2;
    tamanos[ultima] = Math.min(tamanos[ultima]!, Math.max(longitud(cabecera[ultima]!), disponible));
  }
  const componer = (fila: string[]) => fila.map((s, i) => {
    const t = variable && i === ultima ? recortar(s, tamanos[i]!) : s;
    return t + " ".repeat(Math.max(0, tamanos[i]! - longitud(t)));
  }).join("  ").trimEnd();
  return [
    { tabla: atenuar(componer(todas[0]!), c) },
    { tabla: atenuar(tamanos.map(n => "-".repeat(n)).join("  "), c) },
    ...todas.slice(1).map((fila, i) => ({
      tabla: componer(fila) + (marcas[i] ? `  ${atenuar(seguro(marcas[i]!), c)}` : ""),
    })),
  ];
}

export function terminar(
  lineas: readonly Linea[],
  c: ContextoPresentacion,
  indivisibles: readonly string[] = []
): string {
  const color = c.esConsola && c.colorHabilitado;
  const origenesProtegidos = [
    "nativa-general",
    "nativa-agente",
    "nativa-final",
    "denegacion-subagente",
  ].map(origenNativo);
  const efectosProtegidos = ["allow", "ask", "deny"].flatMap(e => [efecto(e), `→ ${efectoRegla(e)}`]);
  const protegidos = [...new Set([
    ...indivisibles,
    ...origenesProtegidos,
    ...efectosProtegidos,
    efecto(null),
  ])].filter(s => s.includes(" "));

  function envolver(linea: string): string[] {
    if (longitud(linea) <= ancho(c)) return [linea];
    const rangos: { inicio: number; fin: number }[] = [];
    for (const texto of protegidos) {
      for (let inicio = linea.indexOf(texto); inicio !== -1; inicio = linea.indexOf(texto, inicio + texto.length)) {
        rangos.push({ inicio, fin: inicio + texto.length });
      }
    }
    const palabras: string[] = [];
    let inicio = 0;
    for (let i = 0; i <= linea.length; i++) {
      if (i === linea.length || (linea[i] === " " && !rangos.some(r => i >= r.inicio && i < r.fin))) {
        if (i > inicio) palabras.push(linea.slice(inicio, i));
        inicio = i + 1;
      }
    }
    const partes: string[] = [];
    let actual = "";
    for (const palabra of palabras) {
      if (actual && longitud(actual) + 1 + longitud(palabra) > ancho(c)) {
        partes.push(actual);
        actual = "";
      }
      actual += (actual ? " " : "") + palabra;
    }
    return [...partes, actual];
  }

  return [...lineas, "Respuesta completa: --json"]
    .flatMap(linea => typeof linea === "string" ? envolver(linea) : [linea.tabla])
    .map(texto => {
      if (!color) return texto;
      const codigo = texto === "Respuesta completa: --json"
        ? 90
        : texto.startsWith("✓")
          ? 32
          : texto.startsWith("?")
            ? 33
            : texto.startsWith("✗")
              ? 31
              : undefined;
      return codigo === undefined ? texto : `\x1b[${codigo}m${texto}\x1b[0m`;
    })
    .join("\n") + "\n";
}

export function proyecto(
  r: { readonly proyecto: string; readonly agente?: string },
  c: ContextoPresentacion
): string[] {
  const encAgente = r.agente === undefined ? [] : [`Agente: ${seguro(r.agente)}`];
  const sufijoCarpeta = c.proyectoDesdeCarpetaActual ? " (carpeta actual)" : "";
  const encProyecto = `Proyecto: ${seguro(nombre(r.proyecto))}${sufijoCarpeta}`;
  return [...encAgente, encProyecto];
}

export function ubicacion(
  d: Declaracion | null,
  origen?: RespuestaPermiso["cadena"][number]["origen"]
): string {
  const o = d?.origen ?? origen;
  if (o === undefined) return "sin archivo";
  if (o.tipo === "nativo") {
    return origenNativo(o.regla);
  }
  if (o.tipo !== "declarado") return `${o.tipo}: ${seguro(o.regla)}`;
  const ref = d?.referencia === null || d?.referencia === undefined
    ? "sin archivo"
    : seguro(nombre(d.referencia));
  const via = d?.via ? ` (${seguro(d.via)})` : "";
  return `${ref}:${o.posicion.linea}:${o.posicion.columna}${via}`;
}

export function referencias(declaraciones: readonly (Declaracion | null)[]): string[] {
  return declaraciones.flatMap(d => d === null ? [] : [
    ubicacion(d),
    ...(d.referencia ? [seguro(d.referencia), seguro(nombre(d.referencia))] : []),
  ]);
}

export function limites(
  r: { readonly declaraciones: readonly string[]; readonly reglas: Readonly<Record<string, string>> },
  c: ContextoPresentacion
): string[] {
  return r.declaraciones
    .filter(codigo => c.explicar || !c.limitesGenerales.has(codigo))
    .map(codigo => `Aviso: ${seguro(r.reglas[codigo] ?? codigo)}`);
}

export function noResueltas(rutas: RespuestaValores["noResueltas"]): string[] {
  return rutas.map(r => `No resuelta: ${seguro(r.ruta.join("."))}: ${seguro(r.regla)}`);
}

export function regla(r: RespuestaPermiso["cadena"][number], base: 0 | 1 = 0): string {
  const num = r.indice + (base === 0 ? 1 : 0);
  const sujeto = seguro(r.sujeto);
  const patron = seguro(r.patron);
  const ef = efectoRegla(r.efecto);
  const ubi = ubicacion(r.declaracion, r.origen);
  return `#${num} ${sujeto} ${patron} → ${ef} · ${ubi}`;
}
