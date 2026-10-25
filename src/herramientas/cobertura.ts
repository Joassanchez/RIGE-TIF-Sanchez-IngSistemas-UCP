import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { tokenizar } from "../pruebas/utilidades/analisis-arquitectura";

export interface Comprobacion { item: string; archivo: string; describe: string; fuente: string }
export interface ConsultaNativa {
  id: string; agente: string; sujeto: string; objetivo: string; herramienta: string;
  argumentos: Record<string, unknown>; nativa: boolean; lanzadoPor?: string;
}
export interface Escenario {
  id: string; entradas: Record<string, string>; referencia: string | null;
  agentes: string[]; claves: string[]; consultas: ConsultaNativa[]; comprobaciones: Comprobacion[];
}
export interface Manifiesto {
  corte: null | string; retiros: unknown[]; escenarios: Escenario[];
  defectosSembrados: { id: string; escenario: string; tipo: string; localizacion: { archivo: string; linea: number };
    hallazgoEsperado: string; controlCorrecto: { agente: string; patron: string; evidencia: string }; pendiente: string }[];
}
export interface Matriz { items: { id: string; objetivo: string; iteracion: number; obligatorioV2: boolean }[] }

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
      return { ...item, estado: item.iteracion === 3 ? "pendiente" : escenarios.length ? "cubierto" : "sin cobertura", escenarios };
    }),
    escenarios: manifiesto.escenarios.map(e => ({ id: e.id, comprobaciones: e.comprobaciones.length, resultado: "no ejecutado por este informe" })),
    retiros: manifiesto.retiros,
  };
}
export function validarManifiesto(manifiesto: Manifiesto, matriz: Matriz, directorio: string, raiz: string): string[] {
  const errores: string[] = [];
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
      const ruta = resolve(raiz, c.archivo);
      if (!ruta.startsWith(resolve(raiz, "pruebas") + "/") && !ruta.startsWith(resolve(raiz, "pruebas") + "\\")) throw new Error("Comprobacion fuera de pruebas");
      const codigo = readFileSync(ruta, "utf8");
      const nombres = describes(codigo);
      if (!nombres.includes(c.describe)) errores.push(`${c.archivo}: describe inexistente ${c.describe}`);
    }
  }
  for (const item of informarCobertura(manifiesto, matriz).items) {
    if (item.obligatorioV2 && item.estado !== "cubierto") errores.push(`${item.id} sin comprobacion`);
  }
  return errores;
}

if (import.meta.main) {
  const raiz = resolve(import.meta.dir, "..");
  const directorio = join(raiz, "pruebas/escenarios");
  const manifiesto = JSON.parse(readFileSync(join(directorio, "MANIFIESTO.json"), "utf8")) as Manifiesto;
  const matriz = JSON.parse(readFileSync(join(directorio, "COBERTURA.json"), "utf8")) as Matriz;
  const errores = validarManifiesto(manifiesto, matriz, directorio, raiz);
  console.log(JSON.stringify({ ...informarCobertura(manifiesto, matriz), errores }, null, 2));
  process.exitCode = errores.length ? 1 : 0;
}
