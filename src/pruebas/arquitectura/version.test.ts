import { expect, test } from "bun:test";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { versionRige } from "../../paquetes/rige/aplicacion/respuestas/estado";
import { AlmacenSqlite, abrirConexion } from "../../paquetes/rige/adaptadores/almacen-sqlite/esquema";
import { RepositorioResolucionesSqlite } from "../../paquetes/rige/adaptadores/almacen-sqlite/resoluciones";
import { resolver } from "../utilidades/resolver";
import { adaptadorFicticio } from "../utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../utilidades/entorno-memoria";
import { borrarTemporal } from "../utilidades/borrar-temporal";

const versionEntrega = [1, 0, 0].join(".");

test("T5-07 M-1 version de entrega en cuatro manifiestos, constante, lock y auditoria", async () => {
  expect(versionRige as string).toBe(versionEntrega);
  for (const ruta of ["package.json", ...["nucleo", "opencode", "rige"].map(p => `paquetes/${p}/package.json`)]) {
    expect((await Bun.file(ruta).json()).version).toBe(versionEntrega);
  }
  const lock = JSON.parse((await Bun.file("bun.lock").text()).replace(/,\s*([}\]])/g, "$1"));
  for (const p of ["nucleo", "opencode", "rige"]) expect(lock.workspaces[`paquetes/${p}`].version).toBe(versionEntrega);
  const auditoria = await Bun.file("herramientas/auditoria-clonado.ps1").text();
  expect(auditoria).toContain(`RIGE ${versionEntrega}`);
  expect(auditoria).not.toContain("RIGE 0.1.0");
});

test("T5-07 M-1 recupera formato 2 anterior sin reescribir version_rige y agrega con version de entrega", () => {
  const temporal = mkdtempSync(join(tmpdir(), "rige-version-1-"));
  try {
    expect(new AlmacenSqlite(temporal, { existe: existsSync }).preparar().exito).toBe(true);
    const resultado = resolver(adaptadorFicticio, "/proyecto", crearEntornoMemoria({ archivos: {
      "/proyecto/capa-b.json": "{}", "/proyecto/capa-a.json": "{}",
    } }));
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    const documento = resultado.valor;
    const anterior = new RepositorioResolucionesSqlite(temporal, { existe: existsSync }, "0.1.0");
    const alta = anterior.guardar(documento, "2026-11-08T00:00:00Z");
    if (!alta.exito) throw new Error(alta.error.mensaje);
    const actual = new RepositorioResolucionesSqlite(temporal, { existe: existsSync }, versionRige);
    expect(actual.leer(alta.valor)).toEqual({ exito: true, valor: { id: alta.valor, instante: "2026-11-08T00:00:00Z", resolucion: documento } });
    expect(actual.guardar(documento, "2026-11-09T00:00:00Z").exito).toBe(true);
    const base = abrirConexion(join(temporal, "rige.db"));
    try {
      expect(base.query("PRAGMA user_version").get()).toEqual({ user_version: 2 });
      expect(base.query("SELECT version_rige, formato_documento, documento FROM resolucion ORDER BY id").all())
        .toEqual(["0.1.0", versionEntrega].map(version_rige => ({ version_rige, formato_documento: 2, documento: JSON.stringify(documento) })));
    } finally { base.close(); }
  } finally { borrarTemporal(temporal); }
});
