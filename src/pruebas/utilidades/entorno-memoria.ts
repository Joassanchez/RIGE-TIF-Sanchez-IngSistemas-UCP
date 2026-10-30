import { createHash } from "node:crypto";
import { posix, win32 } from "node:path";
import type { EntornoLectura } from "../../paquetes/nucleo/contrato/entorno";

export function crearEntornoMemoria(opciones: {
  readonly archivos: Readonly<Record<string, string>>;
  readonly directorios?: readonly string[];
  readonly variables?: Readonly<Record<string, string>>;
  readonly plataforma?: string;
  readonly rutas?: "win32";
  readonly enlaces?: Readonly<Record<string, string>>;
}): EntornoLectura {
  const rutas = opciones.rutas === "win32" ? win32 : posix;
  const archivos = new Map(Object.entries(opciones.archivos).map(([ruta, texto]) => [rutas.normalize(ruta), texto]));
  const directorios = new Set((opciones.directorios ?? []).map((ruta) => rutas.normalize(ruta)));
  const enlaces = new Map(Object.entries(opciones.enlaces ?? {}).map(([ruta, destino]) => [rutas.normalize(ruta), rutas.normalize(destino)]));
  const resumir = (texto: string) => createHash("sha256").update(texto, "utf8").digest("hex");
  return {
    plataforma: opciones.plataforma ?? "linux",
    rutasPara(plataforma) {
      const rutas = plataforma === "win32" ? win32 : posix;
      return { unir: rutas.join, relativa: rutas.relative, padre: rutas.dirname, esAbsoluta: rutas.isAbsolute };
    },
    variable: (nombre) => Object.hasOwn(opciones.variables ?? {}, nombre) ? opciones.variables![nombre] : undefined,
    tipo(ruta) {
      const normalizada = rutas.normalize(ruta);
      return archivos.has(normalizada) ? "archivo" : directorios.has(normalizada) ? "directorio" : "inexistente";
    },
    leer(ruta) {
      const texto = archivos.get(rutas.normalize(ruta));
      if (texto === undefined) throw new Error(`Archivo inexistente: ${ruta}`);
      return { texto, resumen: resumir(texto) };
    },
    resumir,
    real: (ruta) => enlaces.get(rutas.normalize(ruta)) ?? rutas.normalize(ruta),
    unir: (...partes) => rutas.join(...partes),
    relativa: (desde, hasta) => rutas.relative(desde, hasta),
    padre: (ruta) => rutas.dirname(rutas.normalize(ruta)),
    esAbsoluta: (ruta) => rutas.isAbsolute(ruta),
    listar(directorio) {
      const normalizada = rutas.normalize(directorio);
      if (!directorios.has(normalizada)) return [];
      const prefijo = normalizada.endsWith(rutas.sep) ? normalizada : `${normalizada}${rutas.sep}`;
      const nombres = new Set<string>();
      for (const ruta of [...archivos.keys(), ...directorios]) {
        if (ruta.startsWith(prefijo) && ruta !== normalizada) nombres.add(ruta.slice(prefijo.length).split(rutas.sep)[0]!);
      }
      return [...nombres].sort();
    },
  };
}
