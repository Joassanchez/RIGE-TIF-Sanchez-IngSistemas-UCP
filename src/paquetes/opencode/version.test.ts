import { describe, expect, test } from "bun:test";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { detectarVersion, type VersionInstalada } from "./version";

const paquete = (version: unknown = "1.18.25") => JSON.stringify({ name: "opencode-ai", version });
type Indeterminada = Extract<VersionInstalada, { estado: "no-determinada" }>;
const noDeterminada = (motivo: Indeterminada["motivo"]): Indeterminada => ({ estado: "no-determinada", motivo });
function detectar(archivos: Record<string, string>, variables: Record<string, string> = { PATH: "/bin" }) {
  return detectarVersion(crearEntornoMemoria({ archivos, variables }), "/p");
}

describe("T3-01 R-1", () => {
  test("sube desde la ruta fisica de un enlace linux", () => {
    const entorno = crearEntornoMemoria({ archivos: { "/b/opencode": "", "/lib/node_modules/opencode-ai/package.json": paquete() },
      variables: { PATH: "/a:/b" }, enlaces: { "/b/opencode": "/lib/node_modules/opencode-ai/bin/opencode.exe" } });
    expect(detectarVersion(entorno, "/p")).toEqual({ estado: "soportada" });
  });
});
describe("T3-01 R-2", () => {
  test("Windows usa PATHEXT, su defecto y Path; no admite el nombre sin extension", () => {
    for (const variables of [{ PATH: "C:\\npm" }, { PATH: "C:\\npm", PATHEXT: ".EXE;.CMD" }, { Path: "C:\\npm" }]) {
      const entorno = crearEntornoMemoria({ rutas: "win32", plataforma: "win32", variables,
        archivos: { "C:\\npm\\opencode.cmd": "", "C:\\npm\\node_modules\\opencode-ai\\package.json": paquete() } });
      expect(detectarVersion(entorno, "C:\\p")).toEqual({ estado: "soportada" });
    }
    expect(detectarVersion(crearEntornoMemoria({ rutas: "win32", plataforma: "win32", variables: { PATH: "C:\\npm" },
      archivos: { "C:\\npm\\opencode": "" } }), "C:\\p")).toEqual(noDeterminada("ejecutable-no-encontrado"));
  });
});
describe("T3-01 R-3", () => {
  test("compara la version por igualdad exacta", () => {
    for (const version of ["1.18.24", "v1.18.25"]) {
      expect(detectar({ "/bin/opencode": "", "/bin/node_modules/opencode-ai/package.json": paquete(version) }))
        .toEqual({ estado: "distinta", detectada: version });
    }
  });
});
describe("T3-01 R-4", () => {
  test("distingue ausencia de ejecutable, de paquete y contenido ilegible; admite BOM", () => {
    expect(detectar({})).toEqual(noDeterminada("ejecutable-no-encontrado"));
    expect(detectar({ "/bin/opencode": "" }, {})).toEqual(noDeterminada("ejecutable-no-encontrado"));
    expect(detectar({ "/bin/opencode": "" })).toEqual(noDeterminada("paquete-no-encontrado"));
    for (const texto of ["{", paquete(null), paquete(25), paquete(""), '{"name":"otro","version":"1.18.25"}', '{"name":"opencode-ai"}']) {
      expect(detectar({ "/bin/opencode": "", "/bin/node_modules/opencode-ai/package.json": texto }))
        .toEqual(noDeterminada("paquete-ilegible"));
    }
    expect(detectar({ "/bin/opencode": "", "/bin/node_modules/opencode-ai/package.json": "\uFEFF" + paquete() }))
      .toEqual({ estado: "soportada" });
  });
  test("propaga fallas de lectura y de ruta real como infraestructura", () => {
    const entorno = crearEntornoMemoria({ archivos: { "/bin/opencode": "", "/bin/package.json": paquete() }, variables: { PATH: "/bin" } });
    for (const operacion of ["leer", "real"] as const) {
      const falla = new Error("EACCES");
      expect(() => detectarVersion({ ...entorno, [operacion]: () => { throw falla; } }, "/p")).toThrow(falla);
    }
  });
});
describe("T3-01 R-5", () => {
  test("el primer directorio gana aunque otro tenga la version soportada", () => {
    expect(detectar({ "/a/opencode": "", "/a/node_modules/opencode-ai/package.json": paquete("1.18.24"),
      "/b/opencode": "", "/b/node_modules/opencode-ai/package.json": paquete() }, { PATH: "/a:/b" }))
      .toEqual({ estado: "distinta", detectada: "1.18.24" });
  });
});
describe("T3-01 R-6", () => {
  test("saltea otros paquetes y JSON roto al subir y prioriza el respaldo encontrado", () => {
    expect(detectar({ "/bin/opencode": "", "/bin/package.json": "{", "/package.json": paquete() })).toEqual({ estado: "soportada" });
    expect(detectar({ "/bin/opencode": "", "/bin/package.json": '{"name":"otro"}', "/package.json": paquete() })).toEqual({ estado: "soportada" });
    expect(detectar({ "/bin/opencode": "", "/bin/package.json": "{" })).toEqual(noDeterminada("paquete-ilegible"));
    const entorno = crearEntornoMemoria({ plataforma: "win32", rutas: "win32", variables: { PATH: "C:\\npm" },
      archivos: { "C:\\npm\\opencode.cmd": "", "C:\\npm\\package.json": "{",
        "C:\\npm\\node_modules\\opencode-ai\\package.json": paquete("1.18.24") } });
    expect(detectarVersion(entorno, "C:\\p")).toEqual({ estado: "distinta", detectada: "1.18.24" });
  });
});
