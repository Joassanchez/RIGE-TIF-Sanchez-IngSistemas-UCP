import { createHash } from "node:crypto";
import { readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, posix, win32 } from "node:path";
import type { ArchivoLeido, EntornoLectura, TipoRuta } from "@rige/nucleo/contrato/entorno";

function ausente(error: unknown): boolean {
  return error instanceof Error && "code" in error && (error.code === "ENOENT" || error.code === "ENOTDIR");
}

export class EntornoLecturaSistema implements EntornoLectura {
  readonly plataforma: string;
  private readonly entorno: Readonly<Record<string, string | undefined>>;

  constructor(opciones: { readonly entorno: Readonly<Record<string, string | undefined>>; readonly plataforma: string }) {
    this.entorno = opciones.entorno;
    this.plataforma = opciones.plataforma;
  }

  variable(nombre: string): string | undefined {
    return Object.hasOwn(this.entorno, nombre) ? this.entorno[nombre] : undefined;
  }

  tipo(ruta: string): TipoRuta {
    try {
      const estado = statSync(ruta);
      return estado.isFile() ? "archivo" : estado.isDirectory() ? "directorio" : "otro";
    } catch (error) {
      if (ausente(error)) return "inexistente";
      throw error;
    }
  }

  examinar(ruta: string): TipoRuta | "inaccesible" {
    try {
      const estado = statSync(ruta);
      return estado.isFile() ? "archivo" : estado.isDirectory() ? "directorio" : "otro";
    } catch (error) {
      if (error instanceof Error && "code" in error && (error.code === "EACCES" || error.code === "EPERM")) return "inaccesible";
      if (ausente(error)) return "inexistente";
      throw error;
    }
  }

  leer(ruta: string): ArchivoLeido {
    const bytes = readFileSync(ruta);
    return { texto: bytes.toString("utf8"), resumen: createHash("sha256").update(bytes).digest("hex") };
  }

  resumir(texto: string): string {
    return createHash("sha256").update(texto, "utf8").digest("hex");
  }

  real(ruta: string): string { return realpathSync.native(ruta); }

  unir(...partes: readonly string[]): string { return join(...partes); }
  rutasPara(plataforma: string) {
    const rutas = plataforma === "win32" ? win32 : posix;
    return { unir: rutas.join, relativa: rutas.relative, padre: rutas.dirname, esAbsoluta: rutas.isAbsolute };
  }
  relativa(desde: string, hasta: string): string { return relative(desde, hasta); }
  padre(ruta: string): string { return dirname(ruta); }
  esAbsoluta(ruta: string): boolean { return isAbsolute(ruta); }

  listar(directorio: string): readonly string[] {
    try {
      return readdirSync(directorio).sort();
    } catch (error) {
      if (ausente(error)) return [];
      throw error;
    }
  }

  canonica(ruta: string): string | null {
    try {
      return realpathSync.native(resolve(ruta)).replaceAll("\\", "/");
    } catch (error) {
      if (ausente(error)) return null;
      throw error;
    }
  }
}
