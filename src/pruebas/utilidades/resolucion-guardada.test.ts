import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { crearResolucionGuardadaAnterior } from "./resolucion-guardada";
import { AlmacenSqlite } from "../../paquetes/rige/adaptadores/almacen-sqlite/esquema";
import { RepositorioResolucionesSqlite } from "../../paquetes/rige/adaptadores/almacen-sqlite/resoluciones";
import { versionRige } from "../../paquetes/rige/aplicacion/respuestas/estado";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { crearEntornoMemoria } from "./entorno-memoria";
import { resolver } from "./resolver";

describe("T3-01-c1 P-7 constructor de resolucion anterior", () => {
  test("inserta mediante el repositorio, conserva entradas y deja intacto el original", () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-fixture-guardada-"));
    try {
      expect(new AlmacenSqlite(temporal, { existe: existsSync }).preparar().exito).toBe(true);
      // Ausencia explicita para probar que el constructor retira las declaraciones de version.
      const analisis = resolver(adaptadorOpenCode, "/p", crearEntornoMemoria({ archivos: {}, directorios: ["/p"], variables: { HOME: "/hogar" } }));
      if (!analisis.exito) throw new Error(analisis.error.mensaje);
      const repositorio = new RepositorioResolucionesSqlite(temporal, { existe: existsSync }, versionRige);
      const alta = repositorio.guardar(analisis.valor, "2026-10-30T00:00:00.000Z");
      if (!alta.exito) throw new Error(alta.error.mensaje);
      const antes = repositorio.leer(alta.valor);
      const id = crearResolucionGuardadaAnterior(temporal, alta.valor);
      expect(id).not.toBe(alta.valor);
      expect(repositorio.leer(alta.valor)).toEqual(antes);
      const anterior = repositorio.leer(id);
      if (!anterior.exito) throw new Error(anterior.error.mensaje);
      expect(anterior.valor.resolucion.formato).toBe(2);
      expect(anterior.valor.resolucion.entradas).toEqual(analisis.valor.entradas);
      expect(anterior.valor.resolucion.declaraciones).toEqual(["git-no-encontrado"]);
      expect(anterior.valor.resolucion.contexto.declaraciones).toEqual(["git-no-encontrado"]);
      expect(anterior.valor.resolucion.reglas).not.toHaveProperty("version-no-determinada");
      expect(anterior.valor.resolucion.reglas).not.toHaveProperty("ejecutable-no-encontrado");
    } finally { rmSync(temporal, { recursive: true, force: true }); }
  });
});
