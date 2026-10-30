import { borrarTemporal } from "./utilidades/borrar-temporal";
import { afterAll } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { crearEntornoAislado, variablesAisladas } from "./utilidades/entorno-aislado";
import { crearInstalacionOpenCode } from "./utilidades/instalacion-opencode";

const hogaresOriginales = [process.env.HOME, process.env.USERPROFILE]
  .filter((valor): valor is string => Boolean(valor)).map((valor) => resolve(valor));
const temporal = mkdtempSync(join(tmpdir(), "rige-pruebas-"));
afterAll(() => borrarTemporal(temporal));

for (const nombre of Object.keys(process.env)) {
  if (nombre.toUpperCase().startsWith("OPENCODE_")) delete process.env[nombre];
}
const entorno = crearEntornoAislado(temporal, process.env);
for (const nombre of variablesAisladas) process.env[nombre] = entorno[nombre];
const instalacion = join(temporal, "instalacion-falsa");
crearInstalacionOpenCode(instalacion, "1.18.25");
const clavePath = process.platform === "win32" ? Object.keys(process.env).find(nombre => nombre.toUpperCase() === "PATH") ?? "PATH" : "PATH";
process.env[clavePath] = instalacion + (process.env[clavePath] === undefined ? "" : delimiter + process.env[clavePath]);
for (const nombre of variablesAisladas) {
  const valor = process.env[nombre];
  if (!valor || resolve(valor) !== resolve(temporal) || hogaresOriginales.includes(resolve(valor))) {
    throw new Error(`Entorno de pruebas no aislado: ${nombre}`);
  }
}

globalThis.fetch = Object.assign(async () => {
  throw new Error("Red deshabilitada en las pruebas");
}, { preconnect: () => { throw new Error("Red deshabilitada en las pruebas"); } });
