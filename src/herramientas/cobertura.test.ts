import { describe, expect, test } from "bun:test";
import { cpSync, mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { extraerCriterios, leerCatalogo, validarMatriz, type Matriz } from "./cobertura";
import { borrarTemporal } from "../pruebas/utilidades/borrar-temporal";
import { crearEntornoAislado } from "../pruebas/utilidades/entorno-aislado";

describe("T5-04 W-4 modalidades y denominador", () => {
  test("rechaza omisiones, duplicados, modalidades y procedimientos ausentes sin confundir auxiliares con CA", () => {
    const criterios = ["RF-01 CA-1", "RF-01 CA-2"];
    const item = (id: string) => ({ id, objetivo: "prueba", iteracion: 4, obligatorioV2: false,
      verificacion: "automatica" as const, comprobaciones: [{ archivo: "pruebas/aceptacion/RF-01.test.ts", describe: "RF-01 CA-1" }] });
    const matriz: Matriz = { items: [item(criterios[0]!), item(criterios[1]!), item("auxiliar")] };
    expect(validarMatriz(matriz, criterios)).toEqual([]);
    expect(validarMatriz({ items: matriz.items.slice(1) }, criterios).join()).toContain("RF-01 CA-1 omitido");
    expect(validarMatriz({ items: [...matriz.items, item(criterios[0]!)] }, criterios).join()).toContain("duplicado");
    for (const verificacion of ["manual", "contenedor", "inventada"]) {
      const mala = structuredClone(matriz);
      Object.assign(mala.items[0]!, { verificacion });
      expect(validarMatriz(mala, criterios).join()).toContain(verificacion === "inventada" ? "modalidad" : "procedimiento");
      if (verificacion !== "inventada") {
        mala.items[0]!.procedimiento = "Ejecutar el procedimiento de prueba y conservar evidencia";
        expect(validarMatriz(mala, criterios)).toEqual([]);
      }
    }
    expect(validarMatriz({ items: [...matriz.items, item("RF-13 CA-1")] }, criterios).join()).toContain("fuera del alcance");
  });
});

describe("T5-04 W-4b catalogo solo al ejecutar", () => {
  test("importar una copia sin catalogo funciona; ejecutar el comando desde otro cwd falla nombrando el catalogo", () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-importar-cobertura-"));
    try {
      const src = join(temporal, "src");
      for (const carpeta of ["herramientas", "pruebas/utilidades", "pruebas/escenarios"]) mkdirSync(join(src, carpeta), { recursive: true });
      cpSync(join(import.meta.dir, "cobertura.ts"), join(src, "herramientas/cobertura.ts"));
      cpSync(join(import.meta.dir, "../pruebas/utilidades/analisis-arquitectura.ts"), join(src, "pruebas/utilidades/analisis-arquitectura.ts"));
      symlinkSync(resolve(import.meta.dir, "../node_modules"), join(src, "node_modules"), process.platform === "win32" ? "junction" : "dir");
      for (const archivo of ["MANIFIESTO", "COBERTURA"]) writeFileSync(join(src, `pruebas/escenarios/${archivo}.json`), "{}");
      const archivo = join(src, "herramientas/cobertura.ts");
      const opciones = { cwd: temporal, env: crearEntornoAislado(temporal, process.env), timeout: 10000 };
      const importacion = Bun.spawnSync([process.execPath, "-e", `await import(${JSON.stringify(pathToFileURL(archivo).href)});`], opciones);
      expect(importacion.exitCode, importacion.stderr.toString()).toBe(0);
      const comando = Bun.spawnSync([process.execPath, archivo], opciones);
      expect(comando.exitCode).toBe(1);
      expect(comando.stderr.toString()).toContain("Falta el catalogo de criterios");
      expect(comando.stderr.toString()).toContain(join(temporal, "03-requisitos/libro/catalogo"));
    } finally { borrarTemporal(temporal); }
  });
  test("solo extrae definiciones de la fila Criterio de aceptación, sin remisiones", () => {
    expect(extraerCriterios("RF-01", "| Criterio de aceptación | CA-1: ver RF-02, CA-9. CA-2: segundo |\n| Trazabilidad | CA-3: ajeno |"))
      .toEqual(["RF-01 CA-1", "RF-01 CA-2"]);
  });
  test("catalogo sintetico y diagnostico explicito cuando falta", () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-catalogo-"));
    try {
      const catalogo = join(temporal, "catalogo");
      expect(() => leerCatalogo(catalogo, ["RF-01"])).toThrow("catalogo");
      mkdirSync(catalogo);
      writeFileSync(join(catalogo, "RF-01.md"), "| Criterio de aceptación | CA-1: uno. CA-2: dos. |\n");
      expect(leerCatalogo(catalogo, ["RF-01"])).toEqual(["RF-01 CA-1", "RF-01 CA-2"]);
    } finally { borrarTemporal(temporal); }
  });
});
