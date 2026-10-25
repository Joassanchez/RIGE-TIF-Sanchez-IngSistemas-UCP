import { posix } from "node:path";
import { extraerImports, tokenizar } from "./analisis-arquitectura";

/** Guarda heuristica: sigue auxiliares, no demuestra flujo de datos arbitrario.
 * La garantia de fondo es X-1: las derivadas se contrastan con capturas nativas.
 * Se admite importar el adaptador para producir el observado.
 */
export function detectarVendor(archivos: Readonly<Record<string, string>>): string[] {
  const prohibido = (destino: string) => /(?:\/vendor(?:\/|$)|\/opencode\/permisos(?:\.ts)?$)/.test(destino);
  const contaminados = new Map<string, Set<string>>();
  const fuentes = Object.entries(archivos).filter(([ruta]) => ruta.startsWith("pruebas/"));
  const tokens = new Map(fuentes.map(([ruta, codigo]) => [ruta, tokenizar(codigo)]));
  for (const [ruta] of fuentes) contaminados.set(ruta, new Set());
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const [ruta, codigo] of fuentes) {
      const marcados = contaminados.get(ruta)!;
      const t = tokens.get(ruta)!;
      const marcar = (nombre: string) => { if (!marcados.has(nombre)) { marcados.add(nombre); cambio = true; } };
      for (const { destino } of extraerImports(codigo)) {
        const resuelta = posix.join(posix.dirname(ruta), destino).replace(/\.ts$/, "") + ".ts";
        const indice = t.findIndex(token => token.cadena && token.valor === destino);
        const inicio = t.slice(0, indice).findLastIndex(token => ["import", "export"].includes(token.valor));
        const nombres = t.slice(inicio + 1, indice).filter(token => !token.cadena && /^[\w$]+$/.test(token.valor)
          && !["from", "as", "type"].includes(token.valor)).map(token => token.valor);
        if (prohibido(destino)) for (const nombre of nombres) marcar(nombre);
        else for (const nombre of nombres) if (contaminados.get(resuelta)?.has(nombre)) marcar(nombre);
      }
      const impura = (expresion: typeof t) => expresion.some((token, i) => token.cadena
        ? token.valor === "evaluar" || prohibido(token.valor) && ["import", "require"].includes(expresion[i - 2]?.valor ?? "")
        : marcados.has(token.valor) || token.valor === "evaluar");
      for (let i = 0; i < t.length; i++) {
        if (["const", "let", "var"].includes(t[i]!.valor) && t[i + 2]?.valor === "=") {
          let fin = i + 3;
          while (fin < t.length && t[fin]!.valor !== ";") fin++;
          if (impura(t.slice(i + 3, fin))) marcar(t[i + 1]!.valor);
        }
        if (t[i]!.valor === "function" && t[i + 1] && t[i + 2]?.valor === "(") {
          const inicio = t.findIndex((token, indice) => indice > i && token.valor === "{");
          let fin = inicio + 1, profundidad = 1;
          while (fin < t.length && profundidad) {
            if (t[fin]!.valor === "{") profundidad++;
            if (t[fin]!.valor === "}") profundidad--;
            fin++;
          }
          if (impura(t.slice(inicio + 1, fin))) marcar(t[i + 1]!.valor);
        }
      }
    }
  }
  return fuentes.filter(([ruta]) => {
    if (!ruta.startsWith("pruebas/aceptacion/")) return false;
    const t = tokens.get(ruta)!;
    if (extraerImports(archivos[ruta]!).some(({ destino }) => prohibido(destino))) return true;
    const marcados = contaminados.get(ruta)!;
    for (let i = 0; i < t.length; i++) {
      if (t[i]!.valor === "evaluar") return true;
      if (/^(esperad[oa]s?|referencia|expected\w*)$/.test(t[i]!.valor) && marcados.has(t[i]!.valor)) return true;
      if (["toEqual", "toBe", "toMatchObject"].includes(t[i]!.valor) && t[i + 1]?.valor === "(") {
        let profundidad = 1;
        for (let j = i + 2; j < t.length && profundidad; j++) {
          if (t[j]!.valor === "(") profundidad++;
          if (t[j]!.valor === ")") profundidad--;
          if (!t[j]!.cadena && marcados.has(t[j]!.valor)) return true;
        }
      }
    }
    return false;
  }).map(([ruta]) => ruta).sort();
}

export function validarProcedenciaReferencia(referencia: Record<string, any>, hayArchivo: (ruta: string) => boolean): string[] {
  const errores: string[] = [];
  for (const campo of ["cadenas", "decisiones"]) {
    if (!Object.hasOwn(referencia, campo)) continue;
    const procedencia = referencia.procedencia?.[campo] ?? (campo === "cadenas" ? referencia.procedencia : undefined);
    const comando = procedencia?.comando;
    if (campo === "cadenas") {
      if (typeof comando === "string" && /^opencode\s+debug\s+agent(?:\s|$)/.test(comando)
        || Array.isArray(comando) && comando[0] === "opencode" && comando[1] === "debug" && comando[2] === "agent") continue;
      errores.push("cadenas: falta comando debug agent del binario");
      continue;
    }
    if (typeof comando === "string" && /^opencode\s/.test(comando) || Array.isArray(comando) && comando[0] === "opencode") continue;
    if (procedencia?.tipo === "derivada a mano" && procedencia.derivacion === "DERIVACION.md" && hayArchivo(procedencia.derivacion)) continue;
    errores.push(`${campo}: falta comando del binario o DERIVACION.md`);
  }
  return errores;
}
