import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { tokenizar } from "../pruebas/utilidades/analisis-arquitectura";

export type TipoHallazgoManifiesto =
  | "entrada-ilegible"
  | "entrada-descartada"
  | "sustitucion-sin-valor"
  | "referencia-no-resuelta"
  | "regla-sin-efecto"
  | "elemento-sin-uso";

export interface LocalizacionDefectoArchivo {
  archivo: string;
  linea: number;
}
export interface LocalizacionDefectoVariable {
  variable: string;
}
export type LocalizacionDefecto = LocalizacionDefectoArchivo | LocalizacionDefectoVariable;

export interface ControlDefecto {
  escenario: string;
  agente: string | null;
  clave: readonly string[] | null;
  cambios: string[];
  evidencia: string;
}

export interface DefectoSembrado {
  id: string;
  escenario: string;
  tipo: TipoHallazgoManifiesto;
  causa: string;
  localizacion: LocalizacionDefecto;
  clave: readonly string[] | null;
  parametros?: Record<string, unknown>;
  control: ControlDefecto | null;
}

export interface Comprobacion {
  item: string; archivo: string; describe: string; fuente: string;
  documento?: string; aspecto?: "decisiones" | "cadenas-base";
}
export interface ConsultaNativa {
  id: string; agente: string; sujeto: string; objetivo: string; herramienta: string;
  argumentos: Record<string, unknown>; nativa: boolean; lanzadoPor?: string;
}
export interface Escenario {
  id: string; entradas: Record<string, string>; referencia: string | null;
  agentes: string[]; claves: string[]; consultas: ConsultaNativa[]; comprobaciones: Comprobacion[];
}
export interface Manifiesto {
  iteracion: number;
  corte: null | string; retiros: unknown[]; escenarios: Escenario[];
  defectosSembrados: DefectoSembrado[];
  aplazados?: Record<string, string>;
}
export interface ItemCobertura {
  id: string; objetivo: string; iteracion: number; obligatorioV2: boolean;
  verificacion: "automatica" | "manual" | "contenedor";
  comprobaciones?: { archivo: string; describe: string }[];
  procedimiento?: string;
  limite?: string;
}
export interface Matriz { items: ItemCobertura[] }

export const alcance = [...Array.from({ length: 12 }, (_, i) => `RF-${String(i + 1).padStart(2, "0")}`),
  "RF-16", "RF-17", ...Array.from({ length: 10 }, (_, i) => `RNF-${String(i + 1).padStart(2, "0")}`)];
export function extraerCriterios(requisito: string, texto: string): string[] {
  const fila = texto.split(/\r?\n/).find(linea => /^\| Criterio de aceptación \|/.test(linea));
  if (!fila) throw new Error(`${requisito}: catalogo sin fila Criterio de aceptación`);
  return [...fila.matchAll(/\b(CA-\d+):/g)].map(m => `${requisito} ${m[1]}`);
}
export function leerCatalogo(directorio: string, requisitos: readonly string[] = alcance): string[] {
  if (!existsSync(directorio)) throw new Error(`Falta el catalogo de criterios: ${directorio}`);
  return requisitos.flatMap(id => {
    const ruta = join(directorio, `${id}.md`);
    if (!existsSync(ruta)) throw new Error(`Falta ficha del catalogo: ${ruta}`);
    return extraerCriterios(id, readFileSync(ruta, "utf8"));
  });
}
export function validarMatriz(matriz: Matriz, criterios: readonly string[]): string[] {
  const errores: string[] = [];
  for (const id of criterios) if (!matriz.items.some(i => i.id === id)) errores.push(`${id} omitido`);
  const vistos = new Set<string>();
  for (const item of matriz.items) {
    if (vistos.has(item.id)) errores.push(`${item.id} duplicado`);
    vistos.add(item.id);
    if (/\bCA-\d+\b/.test(item.id) && !criterios.includes(item.id)) errores.push(`${item.id} fuera del alcance`);
    if (!["automatica", "manual", "contenedor"].includes(item.verificacion)) errores.push(`${item.id}: modalidad invalida`);
    if (["manual", "contenedor"].includes(item.verificacion) && !item.procedimiento?.trim()) errores.push(`${item.id}: procedimiento requerido`);
  }
  return errores;
}

export const sha256 = (archivo: string) => createHash("sha256").update(readFileSync(archivo)).digest("hex");
export function describes(codigo: string): string[] {
  const lista = tokenizar(codigo);
  return lista.flatMap((token, i) => !token.cadena && token.valor === "describe" && lista[i + 1]?.valor === "("
    && lista[i + 2]?.cadena && lista[i + 3]?.valor === "," ? [lista[i + 2]!.valor] : []);
}
export function archivos(directorio: string): string[] {
  return [...new Bun.Glob("**/*").scanSync({ cwd: directorio, onlyFiles: true, dot: true })].map(r => r.replaceAll("\\", "/")).sort();
}
export function informarCobertura(manifiesto: Manifiesto, matriz: Matriz) {
  return {
    corte: manifiesto.corte,
    resultadosBase: "pendiente de corte y ejecucion de aceptacion",
    resultadosAdiciones: "pendiente de corte y ejecucion de aceptacion",
    // Este informe mide inventario y vinculacion, no inventa resultados de bun test.
    items: matriz.items.map(item => {
      const escenarios = manifiesto.escenarios.filter(e => e.comprobaciones.some(c => c.item === item.id)).map(e => e.id);
      const comprobaciones = manifiesto.escenarios.flatMap(e => e.comprobaciones).filter(c => c.item === item.id);
      const derivadaSubagente = item.id === "RF-02 CA-3" && comprobaciones.length > 0
        && comprobaciones.every(c => c.fuente === "derivada");
      const vinculadas = [...comprobaciones, ...(item.comprobaciones ?? [])];
      return { ...item, estado: item.iteracion > manifiesto.iteracion ? "pendiente" : derivadaSubagente
        ? "cubierto con oráculo derivado; sin ejecución nativa de task" : vinculadas.length ? "cubierto" : "sin cobertura", escenarios,
        acreditacion: item.verificacion !== "automatica" ? "pendiente de procedimiento" : "no ejecutada por este informe",
        oraculos: [...new Set(comprobaciones.map(c => c.fuente))], comprobaciones: vinculadas };
    }),
    escenarios: manifiesto.escenarios.map(e => ({ id: e.id, comprobaciones: e.comprobaciones.length, resultado: "no ejecutado por este informe" })),
    retiros: manifiesto.retiros,
    alcance: { requisitos: alcance, excluidos: ["RF-13", "RF-14", "RF-15"],
      criterios: matriz.items.filter(i => /\bCA-\d+$/.test(i.id)).length,
      auxiliares: matriz.items.filter(i => !/\bCA-\d+$/.test(i.id)).length },
    iteracion4: matriz.items.filter(i => i.iteracion === 4).map(i => ({ id: i.id, verificacion: i.verificacion, procedimiento: i.procedimiento })),
  };
}
export function validarManifiesto(manifiesto: Manifiesto, matriz: Matriz, directorio: string, raiz: string, criterios: readonly string[]): string[] {
  const errores = validarMatriz(matriz, criterios);
  const validarVinculo = (c: { archivo: string; describe: string }) => {
    const ruta = resolve(raiz, c.archivo);
    const base = resolve(raiz, "pruebas");
    if (!ruta.startsWith(base + "/") && !ruta.startsWith(base + "\\")) {
      errores.push(`${c.archivo}: comprobacion fuera de pruebas`); return;
    }
    if (!existsSync(ruta)) { errores.push(`${c.archivo}: archivo inexistente`); return; }
    if (!describes(readFileSync(ruta, "utf8")).includes(c.describe)) errores.push(`${c.archivo}: describe inexistente ${c.describe}`);
  };
  for (const item of matriz.items) for (const c of item.comprobaciones ?? []) validarVinculo(c);
  const ids = manifiesto.escenarios.map(e => e.id).sort();
  const reales = readdirSync(directorio, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort();
  if (JSON.stringify(ids) !== JSON.stringify(reales)) errores.push("inventario de escenarios diferente");
  for (const escenario of manifiesto.escenarios) {
    const rutas = archivos(join(directorio, escenario.id));
    const entradas = rutas.filter(r => r !== "REFERENCIA.json");
    if (JSON.stringify(Object.keys(escenario.entradas).sort()) !== JSON.stringify(entradas)) errores.push(`${escenario.id}: inventario de entradas diferente`);
    for (const ruta of entradas) if (sha256(join(directorio, escenario.id, ruta)) !== escenario.entradas[ruta]) errores.push(`${escenario.id}/${ruta}: SHA-256 diferente`);
    const referencia = rutas.includes("REFERENCIA.json") ? sha256(join(directorio, escenario.id, "REFERENCIA.json")) : null;
    if (referencia !== escenario.referencia) errores.push(`${escenario.id}: referencia SHA-256 diferente`);
    for (const c of escenario.comprobaciones) {
      if (!matriz.items.some(i => i.id === c.item)) errores.push(`${c.item}: item desconocido`);
      validarVinculo(c);
    }
  }
  for (const item of informarCobertura(manifiesto, matriz).items) {
    if (item.verificacion === "automatica" && !item.comprobaciones.length
      && !manifiesto.aplazados?.[item.id]) errores.push(`${item.id} sin comprobacion`);
  }
  for (const [id, tarea] of Object.entries(manifiesto.aplazados ?? {})) {
    if (!matriz.items.some(i => i.id === id && i.iteracion <= manifiesto.iteracion)
      || !/^T\d+-\d+$/.test(tarea)) errores.push(`${id}: aplazamiento invalido`);
  }
  return errores;
}

if (import.meta.main) {
  try {
    const raiz = resolve(import.meta.dir, "..");
    const directorio = join(raiz, "pruebas/escenarios");
    const manifiesto = JSON.parse(readFileSync(join(directorio, "MANIFIESTO.json"), "utf8")) as Manifiesto;
    const matriz = JSON.parse(readFileSync(join(directorio, "COBERTURA.json"), "utf8")) as Matriz;
    const criterios = leerCatalogo(resolve(import.meta.dir, "../../03-requisitos/libro/catalogo"));
    const errores = validarManifiesto(manifiesto, matriz, directorio, raiz, criterios);
    console.log(JSON.stringify({ ...informarCobertura(manifiesto, matriz), errores }, null, 2));
    process.exitCode = errores.length ? 1 : 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
