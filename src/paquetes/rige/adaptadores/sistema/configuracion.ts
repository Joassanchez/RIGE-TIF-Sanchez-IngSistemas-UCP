import type { Resultado } from "@rige/nucleo/resultado";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { errorConfiguracionInvalida, type ErrorUso } from "../../aplicacion/puertos/configuracion";
import type { ConfiguracionRige, PuertoConfiguracion } from "../../aplicacion/puertos/configuracion";

export interface OpcionesConfiguracion {
  readonly entorno: Readonly<Record<string, string | undefined>>;
  readonly rutaArchivo: string;
  readonly plataforma: string;
}

export class ConfiguracionSistema implements PuertoConfiguracion {
  constructor(private readonly opciones: OpcionesConfiguracion) {}

  leer(): Resultado<ConfiguracionRige, ErrorUso> {
    const { entorno, rutaArchivo, plataforma } = this.opciones;
    const archivo = new Map<string, string>();
    if (existsSync(rutaArchivo)) {
      const lineas = readFileSync(rutaArchivo, "utf8").split(/\r\n|\n|\r/);
      for (const [indice, original] of lineas.entries()) {
        const linea = original.trim();
        if (!linea || linea.startsWith("#")) continue;
        const separador = linea.indexOf("=");
        if (separador === -1) {
          return { exito: false, error: errorConfiguracionInvalida(`linea ${indice + 1}`, "falta el separador =") };
        }
        const clave = linea.slice(0, separador).trim();
        if (clave !== "RIGE_PUERTO" && clave !== "RIGE_ALMACEN") {
          return { exito: false, error: errorConfiguracionInvalida(clave, "variable no admitida en rige.env") };
        }
        archivo.set(clave, linea.slice(separador + 1).trim());
      }
    }

    const textoPuerto = entorno.RIGE_PUERTO?.trim() || archivo.get("RIGE_PUERTO") || "4747";
    const puerto = Number(textoPuerto);
    if (!/^\d+$/.test(textoPuerto) || !Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
      return { exito: false, error: errorConfiguracionInvalida("RIGE_PUERTO", "debe ser un entero decimal entre 1 y 65535") };
    }

    let directorio = entorno.RIGE_ALMACEN?.trim() || archivo.get("RIGE_ALMACEN");
    if (!directorio) {
      if (plataforma === "win32") {
        const base = entorno.LOCALAPPDATA?.trim();
        if (!base) return { exito: false, error: errorConfiguracionInvalida("LOCALAPPDATA", "falta la base del almacen") };
        directorio = resolve(base, "rige");
      } else {
        const baseXdg = entorno.XDG_DATA_HOME?.trim();
        if (baseXdg) {
          directorio = resolve(baseXdg, "rige");
        } else {
          const base = entorno.HOME?.trim();
          if (!base) return { exito: false, error: errorConfiguracionInvalida("HOME", "falta la base del almacen") };
          directorio = resolve(base, ".local", "share", "rige");
        }
      }
    }
    return { exito: true, valor: { puerto, directorioAlmacen: resolve(directorio) } };
  }
}
