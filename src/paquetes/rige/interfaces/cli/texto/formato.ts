import type { RespuestaValores, RespuestaPermiso } from "../../../aplicacion/respuestas/contrato-generado";
import { rolEfecto, type RolPresentacion } from "../../presentacion/roles";
import { rutaVisible } from "../../presentacion/rutas";
import {
  decisionTexto as efecto,
  efectoRegla,
  motivoNoResolucion,
  nombreVia,
  origenImplicito,
  origenNativo,
} from "../../presentacion/vocabulario";

export interface ContextoPresentacion {
  readonly formato: "json" | "texto";
  readonly ancho: number;
  readonly esConsola: boolean;
  readonly colorHabilitado: boolean;
  readonly todo: boolean;
  readonly proyectoDesdeCarpetaActual: boolean;
  readonly explicar?: boolean;
  readonly agente?: string | undefined;
  readonly proyecto?: string | undefined;
  readonly hogar?: string | undefined;
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
  if (limite <= 0) return "";
  if (limite === 1) return longitud(s) <= 1 ? s : "…";
  return longitud(s) <= limite ? s : Array.from(s).slice(0, limite - 1).join("") + "…";
}

export const codigosAnsi: Readonly<Record<RolPresentacion, number>> = {
  permitida: 32,
  pregunta: 33,
  denegada: 31,
  declarado: 36,
  nativo: 90,
  estructura: 90,
  rige: 1,
  desplazado: 2,
  pista: 1,
  parcial: 35,
};

const patronAnsi = /\x1b\[[0-9;]*m/g;

export const quitarAnsi = (texto: string): string => texto.replace(patronAnsi, "");

export const pintar = (
  rol: RolPresentacion,
  texto: string,
  c: Pick<ContextoPresentacion, "colorHabilitado">
): string => (!texto || !c.colorHabilitado ? texto : `\x1b[${codigosAnsi[rol]}m${texto}\x1b[0m`);

export const atenuar = (s: string, c: ContextoPresentacion): string =>
  pintar("estructura", s, c);

export interface Fragmento {
  readonly texto: string;
  readonly rol?: RolPresentacion;
}

export type CeldaTabla = string | Fragmento | readonly Fragmento[];

function normalizarCelda(celda: CeldaTabla): readonly Fragmento[] {
  if (typeof celda === "string") return [{ texto: seguro(celda) }];
  if (Array.isArray(celda)) return (celda as readonly Fragmento[]).map(f => ({ ...f, texto: seguro(f.texto) }));
  const f = celda as Fragmento;
  return [{ ...f, texto: seguro(f.texto) }];
}

function textoCelda(celda: readonly Fragmento[]): string {
  return celda.map(f => f.texto).join("");
}

function pintarCelda(
  celda: readonly Fragmento[],
  limite: number | undefined,
  c: ContextoPresentacion
): string {
  const plano = textoCelda(celda);
  if (limite === undefined || longitud(plano) <= limite) {
    return celda.map(f => (f.rol ? pintar(f.rol, f.texto, c) : f.texto)).join("");
  }
  if (limite <= 0) return "";
  if (limite === 1) {
    const rol = celda[0]?.rol;
    return rol ? pintar(rol, "…", c) : "…";
  }
  let restante = limite - 1;
  let salida = "";
  let ultimoRol: RolPresentacion | undefined;
  for (const f of celda) {
    if (restante <= 0) break;
    const chars = Array.from(f.texto);
    if (chars.length <= restante) {
      salida += f.rol ? pintar(f.rol, f.texto, c) : f.texto;
      restante -= chars.length;
      ultimoRol = f.rol;
    } else {
      const trozo = chars.slice(0, restante).join("");
      salida += f.rol ? pintar(f.rol, trozo, c) : trozo;
      restante = 0;
      ultimoRol = f.rol;
    }
  }
  return salida + (ultimoRol ? pintar(ultimoRol, "…", c) : "…");
}

export interface ConfiguracionTabla {
  readonly elasticas?: readonly number[];
  readonly apilado?: (fila: readonly string[]) => readonly string[];
  readonly marcas?: readonly string[];
}

export function tabla(
  cabecera: string[],
  filas: CeldaTabla[][],
  c: ContextoPresentacion,
  configuracion: boolean | ConfiguracionTabla = true,
  marcas: readonly string[] = []
): Linea[] {
  const opciones: ConfiguracionTabla = typeof configuracion === "boolean"
    ? { elasticas: configuracion ? [cabecera.length - 1] : [] }
    : configuracion;
  const elasticas = opciones.elasticas ?? [];
  const marcasFinal = opciones.marcas ?? marcas;
  const maximoColumnas = Math.max(2, Math.floor((ancho(c) + 3) / 9));

  if (elasticas.length === 0 && !opciones.apilado && cabecera.length > maximoColumnas) {
    const bloques: Linea[] = [];
    for (let inicio = 1; inicio < cabecera.length; inicio += maximoColumnas - 1) {
      const fin = inicio + maximoColumnas - 1;
      const subCabecera = [cabecera[0]!, ...cabecera.slice(inicio, fin)];
      const subFilas = filas.map(f => [f[0]!, ...f.slice(inicio, fin)]);
      if (bloques.length > 0) bloques.push("");
      bloques.push(...tabla(subCabecera, subFilas, c, configuracion, marcasFinal));
    }
    return bloques;
  }

  const todas = [cabecera.map(s => s.toUpperCase()), ...filas].map(fila => fila.map(normalizarCelda));
  const textos = todas.map(fila => fila.map(textoCelda));
  const tamanos = cabecera.map((_, i) => Math.max(...textos.map(fila => longitud(fila[i] ?? ""))));
  const separadores = Math.max(0, cabecera.length - 1) * 2;
  const anchoTotal = tamanos.reduce((a, b) => a + b, 0) + separadores;

  if (c.esConsola && anchoTotal > ancho(c) && (elasticas.length > 0 || opciones.apilado)) {
    const elasticasUnicas = [...new Set(elasticas.filter(i => i >= 0 && i < cabecera.length))];
    if (elasticasUnicas.length === 0 && opciones.apilado) {
      return textos.slice(1).flatMap(fila => [...opciones.apilado!(fila)]);
    }
    const anchoFijo = tamanos.reduce(
      (acum, tam, i) => (elasticasUnicas.includes(i) ? acum : acum + tam),
      separadores,
    );
    const disponible = ancho(c) - anchoFijo;
    const minimos = new Map(elasticasUnicas.map(i => [
      i,
      Math.min(tamanos[i]!, Math.max(longitud(cabecera[i]!), 6)),
    ]));
    const minNecesario = elasticasUnicas.reduce((acum, i) => acum + minimos.get(i)!, 0);
    if (disponible < minNecesario) {
      if (opciones.apilado) {
        return textos.slice(1).flatMap(fila => [...opciones.apilado!(fila)]);
      }
      for (const i of elasticasUnicas) {
        tamanos[i] = Math.max(
          longitud(cabecera[i]!),
          Math.floor(Math.max(0, disponible) / elasticasUnicas.length),
        );
      }
    } else {
      let actual = elasticasUnicas.reduce((acum, i) => acum + tamanos[i]!, 0);
      while (actual > disponible) {
        let mejor = -1;
        let mayorExceso = 0;
        for (const i of elasticasUnicas) {
          const exceso = tamanos[i]! - minimos.get(i)!;
          if (exceso > mayorExceso) {
            mayorExceso = exceso;
            mejor = i;
          }
        }
        if (mejor === -1) break;
        tamanos[mejor]!--;
        actual--;
      }
    }
  }

  const elasticasSet = c.esConsola ? new Set(elasticas) : new Set<number>();
  const componerTexto = (fila: string[]) => fila.map((s, i) => {
    const t = elasticasSet.has(i) ? recortar(s, tamanos[i]!) : s;
    return t + " ".repeat(Math.max(0, tamanos[i]! - longitud(t)));
  }).join("  ").trimEnd();
  const componerCeldas = (fila: readonly (readonly Fragmento[])[], filaTexto: string[]) => fila.map((cel, i) => {
    const t = elasticasSet.has(i) ? recortar(filaTexto[i]!, tamanos[i]!) : filaTexto[i]!;
    const pintada = pintarCelda(cel, elasticasSet.has(i) ? tamanos[i]! : undefined, c);
    return pintada + " ".repeat(Math.max(0, tamanos[i]! - longitud(t)));
  }).join("  ").replace(/ +$/, "");
  return [
    { tabla: atenuar(componerTexto(textos[0]!), c) },
    { tabla: atenuar(tamanos.map(n => "-".repeat(n)).join("  "), c) },
    ...todas.slice(1).map((fila, i) => ({
      tabla: componerCeldas(fila, textos[i + 1]!) + (marcasFinal[i] ? `  ${atenuar(seguro(marcasFinal[i]!), c)}` : ""),
    })),
  ];
}

export interface OpcionesTerminar {
  readonly pieJson?: boolean;
}

export function unirBloques(bloques: readonly (readonly Linea[])[]): Linea[] {
  const salida: Linea[] = [];
  for (const bloque of bloques) {
    if (bloque.length === 0) continue;
    if (salida.length > 0) salida.push("");
    salida.push(...bloque);
  }
  return salida;
}

export function terminar(
  lineas: readonly Linea[],
  c: ContextoPresentacion,
  indivisibles: readonly string[] = [],
  opciones: OpcionesTerminar = {}
): string {
  const origenesProtegidos = [
    ...[
      "nativa-general",
      "nativa-agente",
      "nativa-final",
      "denegacion-subagente",
    ].map(origenNativo),
    origenImplicito(),
  ];
  const efectosProtegidos = ["allow", "ask", "deny"].flatMap(e => [efecto(e), `→ ${efectoRegla(e)}`]);
  const protegidos = [...new Set([
    ...indivisibles,
    ...origenesProtegidos,
    ...efectosProtegidos,
    efecto(null),
  ])].filter(s => s.includes(" "));

  function envolver(linea: string): string[] {
    const plana = quitarAnsi(linea);
    if (longitud(plana) <= ancho(c)) return [linea];
    const mapaIndices: number[] = [];
    for (let i = 0; i < linea.length; i++) {
      if (linea[i] === "\x1b" && linea[i + 1] === "[") {
        const fin = linea.indexOf("m", i + 2);
        if (fin !== -1) {
          i = fin;
          continue;
        }
      }
      mapaIndices.push(i);
    }
    const rangos: { inicio: number; fin: number }[] = [];
    for (const texto of protegidos) {
      for (let inicio = plana.indexOf(texto); inicio !== -1; inicio = plana.indexOf(texto, inicio + texto.length)) {
        rangos.push({ inicio, fin: inicio + texto.length });
      }
    }
    const espaciosProtegidos = new Set<number>();
    for (let i = 0; i < plana.length; i++) {
      if (plana[i] === " " && rangos.some(r => i >= r.inicio && i < r.fin)) {
        espaciosProtegidos.add(mapaIndices[i]!);
      }
    }
    const palabras: string[] = [];
    let inicio = 0;
    for (let i = 0; i <= linea.length; i++) {
      if (i === linea.length || (linea[i] === " " && !espaciosProtegidos.has(i))) {
        if (i > inicio) palabras.push(linea.slice(inicio, i));
        inicio = i + 1;
      }
    }
    const prefijo = linea.match(/^ +/)?.[0] ?? "";
    const sangria = `${prefijo}  `;
    const partes: string[] = [];
    let actual = prefijo;
    for (const palabra of palabras) {
      const largoActual = longitud(quitarAnsi(actual));
      const largoPalabra = longitud(quitarAnsi(palabra));
      const separador = largoActual > longitud(prefijo) ? 1 : 0;
      if (largoActual > longitud(prefijo) && largoActual + separador + largoPalabra > ancho(c)) {
        partes.push(actual);
        actual = longitud(sangria) + largoPalabra <= ancho(c) ? sangria + palabra : palabra;
      } else {
        actual += (separador ? " " : "") + palabra;
      }
    }
    return [...partes, actual];
  }

  const conPie: readonly Linea[] = opciones.pieJson === false
    ? lineas
    : [
        ...lineas,
        ...(lineas.length > 0 && lineas.at(-1) !== "" ? [""] : []),
        pintar("estructura", "Respuesta completa: --json", c),
      ];

  return conPie
    .flatMap(linea => typeof linea === "string" ? envolver(linea) : [linea.tabla])
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

export function ubicacionFragmentos(
  d: Declaracion | null,
  origen?: RespuestaPermiso["cadena"][number]["origen"],
  c?: Pick<ContextoPresentacion, "proyecto" | "hogar">,
): readonly Fragmento[] {
  const o = d?.origen ?? origen;
  if (o === undefined) return [{ texto: "sin archivo" }];
  if (o.tipo === "nativo") {
    return [{ texto: origenNativo(o.regla), rol: "nativo" }];
  }
  if (o.tipo === "implicito") {
    return [{ texto: origenImplicito(), rol: "nativo" }];
  }
  if (o.tipo !== "declarado") return [{ texto: `${o.tipo}: ${seguro(o.regla)}` }];
  const ref = d?.referencia === null || d?.referencia === undefined
    ? "sin archivo"
    : seguro(rutaVisible(d.referencia, c?.proyecto, c?.hogar));
  const loc: Fragmento = { texto: `${ref}:${o.posicion.linea}:${o.posicion.columna}`, rol: "declarado" };
  return d?.via ? [loc, { texto: ` (${seguro(nombreVia(d.via))})` }] : [loc];
}

export function ubicacion(
  d: Declaracion | null,
  origen?: RespuestaPermiso["cadena"][number]["origen"],
  c?: Pick<ContextoPresentacion, "proyecto" | "hogar"> & Partial<Pick<ContextoPresentacion, "colorHabilitado">>,
): string {
  const ctxColor = { colorHabilitado: c?.colorHabilitado === true };
  return ubicacionFragmentos(d, origen, c)
    .map(f => f.rol ? pintar(f.rol, f.texto, ctxColor) : f.texto)
    .join("");
}

export function referencias(
  declaraciones: readonly (Declaracion | null)[],
  c?: Pick<ContextoPresentacion, "proyecto" | "hogar">,
): string[] {
  const sinColor = { proyecto: c?.proyecto, hogar: c?.hogar, colorHabilitado: false };
  return declaraciones.flatMap(d => d === null ? [] : [
    ubicacion(d, undefined, sinColor),
    ...(d.referencia ? [seguro(d.referencia), seguro(rutaVisible(d.referencia, c?.proyecto, c?.hogar)), seguro(nombre(d.referencia))] : []),
  ]);
}

export function limites(
  r: { readonly declaraciones: readonly string[]; readonly reglas: Readonly<Record<string, string>> },
  c: ContextoPresentacion
): string[] {
  return r.declaraciones
    .filter(codigo => c.explicar || !c.limitesGenerales.has(codigo))
    .map(codigo => `${pintar("pregunta", "Aviso:", c)} ${seguro(motivoNoResolucion(codigo, r.reglas))}`);
}

export function noResueltas(
  rutas: RespuestaValores["noResueltas"],
  reglas: Readonly<Record<string, string>> = {}
): string[] {
  return rutas.map(r => `No resuelta: ${seguro(r.ruta.join("."))}: ${seguro(motivoNoResolucion(r.regla, reglas))}`);
}

export function regla(
  r: RespuestaPermiso["cadena"][number],
  base: 0 | 1 = 0,
  c?: Pick<ContextoPresentacion, "proyecto" | "hogar"> & Partial<Pick<ContextoPresentacion, "colorHabilitado">>,
  destacar?: "rige" | "desplazado",
): string {
  const ctxColor = { colorHabilitado: c?.colorHabilitado === true };
  const num = r.indice + (base === 0 ? 1 : 0);
  const sujeto = seguro(r.sujeto);
  const patron = seguro(r.patron);
  const ef = efectoRegla(r.efecto);
  const ubi = ubicacion(r.declaracion, r.origen, c);
  const numTexto = pintar(destacar ?? "estructura", `#${num}`, ctxColor);
  const cuerpo = destacar ? pintar(destacar, `${sujeto} ${patron}`, ctxColor) : `${sujeto} ${patron}`;
  const efTexto = pintar(rolEfecto(r.efecto), `→ ${ef}`, ctxColor);
  return `${numTexto} ${cuerpo} ${efTexto} · ${ubi}`;
}
