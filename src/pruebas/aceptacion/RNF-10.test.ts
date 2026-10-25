import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const raiz = resolve(import.meta.dir, "../..");
const vendor = resolve(raiz, "paquetes/opencode/vendor");
const leer = (archivo: string) => readFileSync(resolve(vendor, archivo));
const sha = (contenido: Uint8Array) => createHash("sha256").update(contenido).digest("hex");

describe("RNF-10 CA-1", () => {
  test("todos los TypeScript conservan el aviso de copyright", () => {
    const archivos = readdirSync(vendor).filter(nombre => nombre.endsWith(".ts"));
    expect(archivos).toContain("permiso.ts");
    expect(archivos).toContain("wildcard.ts");
    for (const archivo of archivos) expect(leer(archivo).toString().startsWith("// Copyright (c) 2025 opencode. Licencia MIT: ver ./LICENSE.\n")).toBe(true);
  });
});
describe("RNF-10 CA-2", () => {
  test("licencia exacta del tag y avisos declarados en la distribucion", () => {
    expect(sha(leer("LICENSE"))).toBe("625f0f619133f89bbbb2abe37369613dfa1885eba1e50d02170deb62bb42cb6b");
    const avisos = leer("AVISOS.md").toString();
    for (const texto of ["OpenCode", "1.18.25", "MIT", "Copyright (c) 2025 opencode"]) expect(avisos).toContain(texto);
    const readme = readFileSync(resolve(raiz, "README.md"), "utf8");
    for (const archivo of ["LICENSE", "AVISOS.md"]) expect(readme).toContain(`paquetes/opencode/vendor/${archivo}`);
  });
});
describe("RNF-10 CA-3", () => {
  test("todos los archivos incorporados coinciden con su SHA-256 registrado", () => {
    const procedencia = leer("PROCEDENCIA.md").toString();
    for (const archivo of readdirSync(vendor).filter(nombre => nombre !== "PROCEDENCIA.md")) {
      const fila = procedencia.split("\n").find(linea => linea.startsWith(`| ${archivo} |`));
      expect(fila).toBeDefined();
      expect(fila!.split("|")[2]!.trim()).toBe(sha(leer(archivo)));
    }
  });
});
