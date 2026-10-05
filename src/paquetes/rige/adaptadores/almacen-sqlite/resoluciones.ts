import type { Database } from "bun:sqlite";
import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import type { Resultado } from "@rige/nucleo/resultado";
import type { PuertoExistenciaAlmacen } from "../../aplicacion/puertos/almacen";
import { errorResolucionInexistente } from "../../aplicacion/puertos/resoluciones";
import type { PuertoResoluciones, ResolucionGuardada, ResumenResolucion } from "../../aplicacion/puertos/resoluciones";
import { AlmacenSqlite, abrirConexion } from "./esquema";

type ErrorRepositorio = ReturnType<typeof errorResolucionInexistente>;

export class RepositorioResolucionesSqlite implements PuertoResoluciones {
  constructor(
    private readonly directorio: string,
    private readonly lectura: PuertoExistenciaAlmacen,
    private readonly versionRige: string,
  ) {}

  private conBase<T>(soloLectura: boolean, operar: (base: Database) => Resultado<T, ErrorRepositorio>): Resultado<T, ErrorRepositorio> {
    const estado = new AlmacenSqlite(this.directorio, this.lectura).consultar();
    if (!estado.exito) return estado;
    const base = abrirConexion(estado.valor.ruta, soloLectura);
    try {
      return operar(base);
    } finally {
      base.close();
    }
  }

  guardar(resolucion: Resolucion, instante: string): Resultado<number, ErrorRepositorio> {
    return this.conBase(false, (base) => base.transaction(() => {
      base.query("INSERT INTO proyecto (ruta) VALUES (?) ON CONFLICT(ruta) DO NOTHING").run(resolucion.proyecto);
      const proyecto = base.query<{ id: number }, [string]>("SELECT id FROM proyecto WHERE ruta = ?").get(resolucion.proyecto);
      if (proyecto === null) throw new Error("No se encontro el proyecto recien registrado");
      const alta = base.query(`INSERT INTO resolucion (proyecto_id, instante, resumen_entradas, herramienta,
        version_herramienta, version_rige, formato_documento, documento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        proyecto.id, instante, resolucion.resumenEntradas, resolucion.identidad.herramienta,
        resolucion.identidad.version, this.versionRige, 1, JSON.stringify(resolucion));
      const id = Number(alta.lastInsertRowid);
      const insertarEntrada = base.query(`INSERT INTO entrada_leida
        (resolucion_id, orden, via, referencia, resumen, condicion) VALUES (?, ?, ?, ?, ?, ?)`);
      for (const entrada of resolucion.entradas) {
        insertarEntrada.run(id, entrada.orden, entrada.via, entrada.referencia, entrada.resumen, entrada.condicion);
      }
      base.query(`DELETE FROM resolucion WHERE id IN (
        SELECT id FROM resolucion WHERE proyecto_id = ? ORDER BY instante DESC, id DESC LIMIT -1 OFFSET 20
      )`).run(proyecto.id);
      return { exito: true, valor: id } as const;
    }).immediate());
  }

  leer(id: number): Resultado<ResolucionGuardada, ErrorRepositorio> {
    return this.conBase(true, (base) => {
      const fila = base.query<{ id: number; instante: string; formato_documento: number; documento: string }, [number]>(
        "SELECT id, instante, formato_documento, documento FROM resolucion WHERE id = ?",
      ).get(id);
      if (fila === null) return { exito: false, error: errorResolucionInexistente(id) };
      if (fila.formato_documento !== 1) throw new Error(`No se admite el formato de documento ${fila.formato_documento}`);
      return { exito: true, valor: { id: fila.id, instante: fila.instante, resolucion: JSON.parse(fila.documento) as Resolucion } };
    });
  }

  listar(proyecto: string): Resultado<readonly ResumenResolucion[], ErrorRepositorio> {
    return this.conBase(true, (base) => ({ exito: true, valor: base.query<ResumenResolucion, [string]>(
      `SELECT r.id, r.instante, r.resumen_entradas AS resumenEntradas FROM resolucion r
        JOIN proyecto p ON p.id = r.proyecto_id WHERE p.ruta = ? ORDER BY r.instante DESC, r.id DESC`,
    ).all(proyecto) }));
  }
}
