import { describe, expect, test } from "bun:test";
import { lstatSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const nombresProhibidos = ["opencode.json", "opencode.jsonc", ".opencode"] as const;

function comprobarRepositorio(escenarios: string, raiz: string): string[] {
  if (!isAbsolute(escenarios) || !isAbsolute(raiz)) throw new Error("El recorrido requiere rutas absolutas");
  escenarios = resolve(escenarios);
  raiz = resolve(raiz);
  const distancia = relative(raiz, escenarios);
  if (distancia === ".." || distancia.startsWith(`..${sep}`) || isAbsolute(distancia)) {
    throw new Error("El inicio esta fuera de la raiz del repositorio");
  }
  const directorios = [escenarios];
  while (directorios.at(-1) !== raiz) directorios.push(dirname(directorios.at(-1)!));
  // Validar desde la raiz antes de leer nombres evita seguir enlaces hacia otro arbol.
  for (const directorio of directorios.toReversed()) {
    const estado = lstatSync(directorio);
    if (estado.isSymbolicLink() || !estado.isDirectory()) throw new Error("Recorrido no permitido: directorio no ordinario");
  }
  const hallazgos: string[] = [];
  for (const directorio of directorios) {
    const entradas = readdirSync(directorio);
    for (const nombre of nombresProhibidos) {
      if (entradas.includes(nombre)) hallazgos.push(join(directorio, nombre));
    }
  }
  return hallazgos;
}

function conRepositorioTemporal(comprobar: (raiz: string, escenarios: string, temporal: string) => void): void {
  const temporal = mkdtempSync(join(tmpdir(), "rige-repositorio-"));
  try {
    const raiz = join(temporal, "repositorio");
    const escenarios = join(raiz, "src/pruebas/escenarios");
    mkdirSync(escenarios, { recursive: true });
    comprobar(raiz, escenarios, temporal);
  } finally {
    rmSync(temporal, { recursive: true, force: true });
  }
}

function crearEntrada(directorio: string, nombre: string): string {
  const ruta = join(directorio, nombre);
  if (nombre === ".opencode") mkdirSync(ruta);
  else writeFileSync(ruta, "{}");
  return ruta;
}

describe("T0-08 guarda del repositorio (ADR-062 C6)", () => {
  for (const nivel of ["", "src", "src/pruebas", "src/pruebas/escenarios"]) {
    for (const nombre of nombresProhibidos) {
      test(`detecta ${nombre} en ${nivel || "la raiz"}`, () => {
        conRepositorioTemporal((raiz, escenarios) => {
          const entrada = crearEntrada(join(raiz, nivel), nombre);
          expect(comprobarRepositorio(escenarios, raiz)).toEqual([entrada]);
        });
      });
    }
  }
  test("admite ancestros limpios", () => {
    conRepositorioTemporal((raiz, escenarios) => {
      expect(comprobarRepositorio(escenarios, raiz)).toEqual([]);
    });
  });
  test("no recorre fixtures descendientes ni directorios fuera de la raiz explicita", () => {
    conRepositorioTemporal((raiz, escenarios, temporal) => {
      const fixture = join(escenarios, "fixture");
      mkdirSync(fixture);
      for (const nombre of nombresProhibidos) {
        crearEntrada(fixture, nombre);
        crearEntrada(temporal, nombre);
      }
      expect(comprobarRepositorio(escenarios, raiz)).toEqual([]);
    });
  });
  test("rechaza un inicio fuera de la raiz antes de leerlo", () => {
    conRepositorioTemporal((raiz, _escenarios, temporal) => {
      expect(() => comprobarRepositorio(join(temporal, "repositorio-ajeno/inexistente"), raiz)).toThrow("fuera de la raiz");
    });
  });
  test("incluye la raiz como inicio y devuelve todos los hallazgos en orden estable", () => {
    conRepositorioTemporal((raiz, escenarios) => {
      const enRaiz = nombresProhibidos.map((nombre) => crearEntrada(raiz, nombre));
      const enEscenarios = nombresProhibidos.map((nombre) => crearEntrada(escenarios, nombre));
      expect(comprobarRepositorio(raiz, raiz)).toEqual(enRaiz);
      expect(comprobarRepositorio(escenarios, raiz)).toEqual([...enEscenarios, ...enRaiz]);
    });
  });
  test("las rutas relativas o inexistentes fallan visiblemente", () => {
    conRepositorioTemporal((raiz) => {
      expect(() => comprobarRepositorio("pruebas/escenarios", raiz)).toThrow("rutas absolutas");
      expect(() => comprobarRepositorio(raiz, "repositorio")).toThrow("rutas absolutas");
      expect(() => comprobarRepositorio(join(raiz, "inexistente"), raiz)).toThrow();
    });
  });
  test("rechaza enlaces de directorio sin recorrer su destino", () => {
    conRepositorioTemporal((raiz, _escenarios, temporal) => {
      const destino = join(temporal, "externo");
      mkdirSync(destino);
      crearEntrada(destino, "opencode.json");
      const enlace = join(raiz, "enlace");
      symlinkSync(destino, enlace, process.platform === "win32" ? "junction" : "dir");
      expect(() => comprobarRepositorio(enlace, raiz)).toThrow("directorio no ordinario");
      expect(() => comprobarRepositorio(destino, enlace)).toThrow("fuera de la raiz");
    });
  });
  test("el repositorio real no contiene configuraciones en el recorrido acotado", () => {
    expect(comprobarRepositorio(resolve(import.meta.dir, "../escenarios"), resolve(import.meta.dir, "../../.."))).toEqual([]);
  });
});
