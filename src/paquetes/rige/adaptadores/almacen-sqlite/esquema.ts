/// <reference path="./guion.d.ts" />
import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import guion from "../../../../esquemas/almacen/001_inicial.sql" with { type: "text" };
import { errorAlmacenSinEsquema } from "../../aplicacion/puertos/almacen";
import type { EstadoAlmacen, PuertoAlmacen, PuertoExistenciaAlmacen } from "../../aplicacion/puertos/almacen";
import type { Resultado } from "../../../nucleo/resultado";

type Estado = Resultado<EstadoAlmacen, typeof errorAlmacenSinEsquema>;

export function abrirConexion(ruta: string, soloLectura = false): Database {
  const base = new Database(ruta, soloLectura ? { readonly: true } : { create: true });
  let configurada = false;
  try {
    base.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA secure_delete = ON;");
    configurada = true;
    return base;
  } finally {
    if (!configurada) base.close();
  }
}

function inventario(base: Database): string {
  return JSON.stringify(base.query("SELECT type, name, tbl_name, sql FROM sqlite_schema ORDER BY type, name").all());
}

function esquemaCoincide(base: Database): boolean {
  const referencia = abrirConexion(":memory:");
  try {
    referencia.exec(guion);
    return inventario(base) === inventario(referencia);
  } finally {
    referencia.close();
  }
}

function versionEsquema(base: Database): number {
  const fila = base.query<{ user_version: number }, []>("PRAGMA user_version").get();
  if (fila === null) throw new Error("SQLite no devolvio user_version");
  return fila.user_version;
}

export class AlmacenSqlite implements PuertoAlmacen {
  private readonly directorio: string;
  private readonly ruta: string;

  constructor(directorio: string, private readonly lectura: PuertoExistenciaAlmacen) {
    this.directorio = resolve(directorio);
    this.ruta = join(this.directorio, "rige.db");
  }

  private estado(): Estado {
    return { exito: true, valor: { ruta: this.ruta.replaceAll("\\", "/"), versionEsquema: 1 } };
  }

  preparar(): Estado {
    mkdirSync(this.directorio, { recursive: true });
    const base = abrirConexion(this.ruta);
    try {
      const resultado = base.transaction((): Estado => {
        const version = versionEsquema(base);
        if (version === 0 && inventario(base) === "[]") {
          base.exec(guion);
        } else if (version !== 1 || !esquemaCoincide(base)) {
          return { exito: false, error: errorAlmacenSinEsquema };
        }
        return this.estado();
      }).immediate();
      // WAL es persistente y se configura fuera de la transaccion, solo tras validar.
      if (resultado.exito) base.exec("PRAGMA journal_mode = WAL");
      return resultado;
    } finally {
      base.close();
    }
  }

  consultar(): Estado {
    if (!this.lectura.existe(this.ruta)) return { exito: false, error: errorAlmacenSinEsquema };
    const base = abrirConexion(this.ruta, true);
    try {
      return base.transaction((): Estado => {
        if (versionEsquema(base) !== 1 || !esquemaCoincide(base)) {
          return { exito: false, error: errorAlmacenSinEsquema };
        }
        return this.estado();
      })();
    } finally {
      base.close();
    }
  }
}
