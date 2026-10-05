import { createHash } from "node:crypto";
import { readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
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

  leer(ruta: string): ArchivoLeido {
    const bytes = readFileSync(ruta);
    return { texto: bytes.toString("utf8"), resumen: createHash("sha256").update(bytes).digest("hex") };
  }

  resumir(texto: string): string {
    return createHash("sha256").update(texto, "utf8").digest("hex");
  }

  unir(...partes: readonly string[]): string { return join(...partes); }
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
