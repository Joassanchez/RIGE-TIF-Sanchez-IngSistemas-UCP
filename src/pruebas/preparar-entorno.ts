import { afterAll } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { crearEntornoAislado, variablesAisladas } from "./utilidades/entorno-aislado";

const hogaresOriginales = [process.env.HOME, process.env.USERPROFILE]
  .filter((valor): valor is string => Boolean(valor)).map((valor) => resolve(valor));
const temporal = mkdtempSync(join(tmpdir(), "rige-pruebas-"));
afterAll(() => rmSync(temporal, { recursive: true, force: true }));

for (const nombre of Object.keys(process.env)) {
  if (nombre.toUpperCase().startsWith("OPENCODE_")) delete process.env[nombre];
}
const entorno = crearEntornoAislado(temporal, process.env);
for (const nombre of variablesAisladas) process.env[nombre] = entorno[nombre];
for (const nombre of variablesAisladas) {
  const valor = process.env[nombre];
  if (!valor || resolve(valor) !== resolve(temporal) || hogaresOriginales.includes(resolve(valor))) {
    throw new Error(`Entorno de pruebas no aislado: ${nombre}`);
  }
}

globalThis.fetch = Object.assign(async () => {
  throw new Error("Red deshabilitada en las pruebas");
}, { preconnect: () => { throw new Error("Red deshabilitada en las pruebas"); } });
