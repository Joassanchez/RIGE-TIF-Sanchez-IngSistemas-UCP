import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ExistenciaSistema } from "./existencia";

const temporales: string[] = [];
afterEach(() => {
  for (const temporal of temporales.splice(0)) rmSync(temporal, { recursive: true, force: true });
});

describe("S-1", () => {
  test("observa archivos existentes sin crear la ruta ausente", () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-existencia-"));
    temporales.push(temporal);
    const existente = join(temporal, "archivo");
    const ausente = join(temporal, "ausente");
    writeFileSync(existente, "prueba");
    const antes = readdirSync(temporal);
    const existencia = new ExistenciaSistema();
    expect(existencia.existe(existente)).toBe(true);
    expect(existencia.existe(ausente)).toBe(false);
    expect(existsSync(ausente)).toBe(false);
    expect(readdirSync(temporal)).toEqual(antes);
  });
});
