import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Database } from "bun:sqlite";
import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import { resolver } from "@rige/nucleo/resolucion/resolver";
import { adaptadorFicticio } from "../../../../pruebas/utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../../../../pruebas/utilidades/entorno-memoria";
import { AlmacenSqlite, abrirConexion } from "./esquema";
import { versionRige } from "../../aplicacion/respuestas/estado";

const temporales: string[] = [];
const conexiones: Database[] = [];
const instante = "2026-10-05T12:00:00.000Z";

function documento(proyecto = "/proyecto"): Resolucion {
  const resultado = resolver(adaptadorFicticio, proyecto, crearEntornoMemoria({ archivos: {
    [`${proyecto}/capa-b.json`]: '{"modelo":"primero","pasos":12}',
    [`${proyecto}/capa-a.json`]: '{"modelo":"segundo"}',
  } }));
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return { ...resultado.valor, entradas: [...resultado.valor.entradas, {
    orden: 2, via: "remota", referencia: "remota", condicion: "no_observada", resumen: null,
  }] };
}

async function escenario(preparar = true) {
  const temporal = mkdtempSync(join(tmpdir(), "rige-resoluciones-"));
  temporales.push(temporal);
  const directorio = join(temporal, "almacen");
  const ruta = join(directorio, "rige.db");
  const almacen = new AlmacenSqlite(directorio, { existe: existsSync });
  if (preparar) expect(almacen.preparar().exito).toBe(true);
  const { RepositorioResolucionesSqlite } = await import("./resoluciones");
  const repositorio = new RepositorioResolucionesSqlite(directorio, { existe: existsSync }, versionRige);
  const abrir = () => {
    const base = abrirConexion(ruta);
    conexiones.push(base);
    return base;
  };
  return { repositorio, ruta, directorio, abrir };
}

afterEach(() => {
  for (const base of conexiones.splice(0)) base.close();
  for (const temporal of temporales.splice(0)) {
    if (!resolve(temporal).startsWith(resolve(tmpdir()) + "\\") && !resolve(temporal).startsWith(resolve(tmpdir()) + "/")) {
      throw new Error("Temporal fuera del directorio del sistema");
    }
    rmSync(temporal, { recursive: true, force: true });
  }
});

describe("R-1 RF-17 CA-1", () => {
  test("recupera el documento identico, el instante y cada entrada en su tabla", async () => {
    const { repositorio, abrir } = await escenario();
    const resolucion = documento();
    const guardada = repositorio.guardar(resolucion, instante);
    expect(guardada.exito).toBe(true);
    if (!guardada.exito) throw new Error(guardada.error.mensaje);
    const leida = repositorio.leer(guardada.valor);
    expect(leida).toEqual({ exito: true, valor: { id: guardada.valor, instante, resolucion } });
    if (!leida.exito) throw new Error(leida.error.mensaje);
    expect(JSON.stringify(leida.valor.resolucion)).toBe(JSON.stringify(resolucion));
    const base = abrir();
    expect(base.query("SELECT orden, via, referencia, resumen, condicion FROM entrada_leida WHERE resolucion_id = ? ORDER BY orden")
      .all(guardada.valor)).toEqual(resolucion.entradas.map(({ orden, via, referencia, resumen, condicion }) => ({
        orden, via, referencia, resumen, condicion,
      })));
    expect(base.query("SELECT herramienta, version_herramienta, version_rige, formato_documento, documento FROM resolucion WHERE id = ?")
      .get(guardada.valor)).toEqual({ herramienta: "ficticia", version_herramienta: "1", version_rige: versionRige,
        formato_documento: 1, documento: JSON.stringify(resolucion) });
  });

  test("una entrada invalida revierte el alta completa", async () => {
    const { repositorio, abrir } = await escenario();
    const resolucion = documento();
    expect(() => repositorio.guardar({ ...resolucion, entradas: [...resolucion.entradas, resolucion.entradas[0]!] }, instante)).toThrow();
    const base = abrir();
    for (const tabla of ["proyecto", "resolucion", "entrada_leida"]) {
      expect(base.query(`SELECT count(*) AS cantidad FROM ${tabla}`).get()).toEqual({ cantidad: 0 });
    }
  });
});

describe("R-2 RF-17 CA-3", () => {
  test("retiene veinte por proyecto y borra sus entradas sin afectar al otro", async () => {
    const { repositorio, abrir } = await escenario();
    const otro = repositorio.guardar(documento("/otro"), instante);
    const ids: number[] = [];
    for (let dia = 1; dia <= 21; dia++) {
      const guardada = repositorio.guardar(documento(), `2026-10-${String(dia).padStart(2, "0")}T00:00:00.000Z`);
      if (!guardada.exito) throw new Error(guardada.error.mensaje);
      ids.push(guardada.valor);
    }
    const lista = repositorio.listar("/proyecto");
    expect(lista.exito).toBe(true);
    if (!lista.exito) throw new Error(lista.error.mensaje);
    expect(lista.valor.map(({ id }) => id)).toEqual(ids.slice(1).reverse());
    expect(repositorio.leer(ids[0]!)).toMatchObject({ exito: false, error: { codigo: "resolucion-inexistente" } });
    expect(abrir().query("SELECT count(*) AS cantidad FROM entrada_leida WHERE resolucion_id = ?").get(ids[0]!)).toEqual({ cantidad: 0 });
    expect(otro.exito).toBe(true);
    if (!otro.exito) throw new Error(otro.error.mensaje);
    expect(repositorio.leer(otro.valor).exito).toBe(true);
    expect(repositorio.listar("/otro")).toEqual({ exito: true, valor: [{
      id: otro.valor, instante, resumenEntradas: documento("/otro").resumenEntradas,
    }] });
    // Una insercion tardia con instante antiguo debe ser la descartada.
    const antigua = repositorio.guardar(documento(), "2026-09-01T00:00:00.000Z");
    expect(antigua.exito).toBe(true);
    if (!antigua.exito) throw new Error(antigua.error.mensaje);
    expect(repositorio.leer(antigua.valor).exito).toBe(false);
    expect(repositorio.listar("/proyecto")).toEqual(lista);
  });
});

describe("R-3", () => {
  test("rechaza UPDATE de la resolucion y de sus entradas", async () => {
    const { repositorio, abrir } = await escenario();
    const guardada = repositorio.guardar(documento(), instante);
    if (!guardada.exito) throw new Error(guardada.error.mensaje);
    const base = abrir();
    expect(() => base.query("UPDATE resolucion SET instante = 'otro' WHERE id = ?").run(guardada.valor)).toThrow("resolucion inmutable");
    expect(() => base.query("UPDATE entrada_leida SET via = 'otra' WHERE resolucion_id = ?").run(guardada.valor)).toThrow("entrada_leida inmutable");
    expect(repositorio.leer(guardada.valor)).toEqual({ exito: true, valor: { id: guardada.valor, instante, resolucion: documento() } });
  });
});

describe("R-4", () => {
  test("id inexistente, proyecto vacio y orden por instante e id descendentes", async () => {
    const { repositorio } = await escenario();
    expect(repositorio.leer(45)).toEqual({ exito: false, error: {
      codigo: "resolucion-inexistente", mensaje: "No existe la resolucion 45 en el almacen.",
    } });
    expect(repositorio.listar("/sin-resoluciones")).toEqual({ exito: true, valor: [] });
    const ids = [instante, "2026-10-04T00:00:00.000Z", instante].map((fecha) => {
      const resultado = repositorio.guardar(documento(), fecha);
      if (!resultado.exito) throw new Error(resultado.error.mensaje);
      return resultado.valor;
    });
    const lista = repositorio.listar("/proyecto");
    if (!lista.exito) throw new Error(lista.error.mensaje);
    expect(lista.valor.map(({ id }) => id)).toEqual([ids[2]!, ids[0]!, ids[1]!]);
  });

  test("las tres operaciones exigen esquema, incluso despues de haberlo usado", async () => {
    const { repositorio, ruta } = await escenario(false);
    for (const resultado of [repositorio.guardar(documento(), instante), repositorio.leer(1), repositorio.listar("/proyecto")]) {
      expect(resultado).toMatchObject({ exito: false, error: { codigo: "almacen-sin-esquema" } });
    }
    expect(existsSync(ruta)).toBe(false);
    const { repositorio: preparado, abrir } = await escenario();
    expect(preparado.guardar(documento(), instante).exito).toBe(true);
    abrir().exec("PRAGMA user_version = 99");
    for (const resultado of [preparado.guardar(documento(), instante), preparado.leer(1), preparado.listar("/proyecto")]) {
      expect(resultado).toMatchObject({ exito: false, error: { codigo: "almacen-sin-esquema" } });
    }
  });

  test("un formato de documento desconocido falla de forma visible", async () => {
    const { repositorio, abrir } = await escenario();
    const base = abrir();
    base.run("INSERT INTO proyecto (ruta) VALUES ('/proyecto')");
    base.query(`INSERT INTO resolucion (proyecto_id, instante, resumen_entradas, herramienta, version_herramienta,
      version_rige, formato_documento, documento) VALUES (1, ?, ?, 'ficticia', '1', ?, 2, ?)`).run(
      instante, documento().resumenEntradas, versionRige, JSON.stringify(documento()));
    expect(() => repositorio.leer(1)).toThrow("formato");
  });
});
