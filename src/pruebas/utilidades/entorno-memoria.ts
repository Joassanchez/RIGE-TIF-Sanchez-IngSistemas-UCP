import { createHash } from "node:crypto";
import { posix } from "node:path";
import type { EntornoLectura } from "../../paquetes/nucleo/contrato/entorno";

export function crearEntornoMemoria(opciones: {
  readonly archivos: Readonly<Record<string, string>>;
  readonly directorios?: readonly string[];
  readonly variables?: Readonly<Record<string, string>>;
  readonly plataforma?: string;
}): EntornoLectura {
  const archivos = new Map(Object.entries(opciones.archivos).map(([ruta, texto]) => [posix.normalize(ruta), texto]));
  const directorios = new Set((opciones.directorios ?? []).map((ruta) => posix.normalize(ruta)));
  const resumir = (texto: string) => createHash("sha256").update(texto, "utf8").digest("hex");
  return {
    plataforma: opciones.plataforma ?? "linux",
    variable: (nombre) => Object.hasOwn(opciones.variables ?? {}, nombre) ? opciones.variables![nombre] || undefined : undefined,
    tipo(ruta) {
      const normalizada = posix.normalize(ruta);
      return archivos.has(normalizada) ? "archivo" : directorios.has(normalizada) ? "directorio" : "inexistente";
    },
    leer(ruta) {
      const texto = archivos.get(posix.normalize(ruta));
      if (texto === undefined) throw new Error(`Archivo inexistente: ${ruta}`);
      return { texto, resumen: resumir(texto) };
    },
    resumir,
    unir: (...partes) => posix.join(...partes),
    padre: (ruta) => posix.dirname(posix.normalize(ruta)),
    esAbsoluta: (ruta) => posix.isAbsolute(ruta),
  };
}
