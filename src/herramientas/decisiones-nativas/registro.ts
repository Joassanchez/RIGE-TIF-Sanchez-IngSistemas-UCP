import { relative } from "node:path";

export interface EvaluacionNativa { sujeto: string; patronEvaluado: string; regla: { permission: string; pattern: string; action: string } }
export interface DecisionNativa {
  consulta: string; agente: string; sujeto: string; objetivo?: string; herramienta?: string; lanzadoPor?: string;
  evaluaciones: EvaluacionNativa[]; herramientaNoOfrecida?: boolean;
  procedencia?: { comando: string[]; sha256Binario: string; version: string; fecha: string; plataforma: string };
}

export function normalizarEvaluaciones(evaluaciones: EvaluacionNativa[], raiz: string): EvaluacionNativa[] {
  const texto = (valor: string) => normalizarRutaTemporal(valor, raiz);
  return evaluaciones.map(e => ({ ...e, patronEvaluado: texto(e.patronEvaluado), regla: { ...e.regla, pattern: texto(e.regla.pattern) } }));
}

export function normalizarRutaTemporal(valor: string, raiz: string): string {
  const variantes = [...new Set([raiz, raiz.replaceAll("\\", "/"), relative("/", raiz), relative("/", raiz).replaceAll("\\", "/")])]
    .filter(Boolean).sort((a, b) => b.length - a.length);
  return variantes.reduce((texto, ruta) => texto.replaceAll(ruta, "<RAIZ>"), valor);
}

export function extraerEvaluaciones(texto: string): EvaluacionNativa[] {
  const evaluaciones: EvaluacionNativa[] = [];
  for (const linea of texto.split(/\r?\n/)) {
    const campos = Object.fromEntries([...linea.matchAll(/(?:^|\s)([\w.]+)=("(?:\\.|[^"\\])*"|[^\s]+)/g)]
      .map(([, clave, valor]) => [clave!, valor!.startsWith('"') ? JSON.parse(valor!) as string : valor!]));
    if (campos.message !== "evaluated") continue;
    for (const clave of ["permission", "pattern", "action.permission", "action.pattern", "action.action"]) {
      if (!Object.hasOwn(campos, clave)) throw new Error(`Registro evaluated incompleto: ${clave}`);
    }
    if (!["allow", "ask", "deny"].includes(campos["action.action"]!)) throw new Error("Accion nativa desconocida");
    evaluaciones.push({ sujeto: campos.permission!, patronEvaluado: campos.pattern!, regla: {
      permission: campos["action.permission"]!, pattern: campos["action.pattern"]!, action: campos["action.action"]!,
    } });
  }
  return evaluaciones;
}
