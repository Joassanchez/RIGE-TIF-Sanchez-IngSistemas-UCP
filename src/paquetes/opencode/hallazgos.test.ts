import { describe, expect, test } from "bun:test";
import { posix, win32 } from "node:path";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { resolver } from "../../pruebas/utilidades/resolver";
import { adaptadorOpenCode } from "./adaptador";
import { abarca, causaRutaRegla } from "./hallazgos";
import { match } from "./vendor/wildcard";

function gerarCadenas(alfabeto: readonly string[], longitudMaxima: number): string[] {
  const resultado = [""];
  let nivel = [""];
  for (let l = 1; l <= longitudMaxima; l++) {
    const siguiente: string[] = [];
    for (const prefijo of nivel) for (const simbolo of alfabeto) siguiente.push(prefijo + simbolo);
    resultado.push(...siguiente);
    nivel = siguiente;
  }
  return resultado;
}

describe("T3-06 R-1 unidad abarca", () => {
  test("tabla de casos y contraejemplo obligatorio git * vs git?*", () => {
    expect(abarca("*", "*")).toBe(true);
    expect(abarca("*", "src/a.js")).toBe(true);
    expect(abarca("*", "git *")).toBe(true);
    expect(abarca("*", "")).toBe(true);
    expect(abarca("src/a.js", "src/a.js")).toBe(true);
    expect(abarca("git *", "git *")).toBe(true);
    expect(abarca("src/*", "src/a.js")).toBe(true);
    expect(abarca("src/*", "src/*.js")).toBe(true);
    expect(abarca("src/*.js", "src/*")).toBe(false);
    expect(abarca("privado/*", "privado/")).toBe(true);
    expect(abarca("privado/*", "privado")).toBe(false);
    expect(match("git", "git *", "linux")).toBe(true);
    expect(match("git", "git?*", "linux")).toBe(false);
    expect(abarca("git?*", "git *")).toBe(false);
    expect(abarca("git *", "git?*")).toBe(false);
    expect(abarca("git *", "git")).toBe(true);
    expect(abarca("git *", "git status")).toBe(true);
    expect(abarca("src/*", "src\\a.js")).toBe(true);
    expect(abarca("src\\*", "src/a.js")).toBe(true);
    expect(abarca("src\\a.js", "src/a.js")).toBe(true);
    expect(abarca("SRC/*", "src/a.js")).toBe(false);
    expect(abarca("src/*", "SRC/a.js")).toBe(false);
    expect(abarca("src/A.js", "src/a.js")).toBe(false);
  });

  test("T4-03 prueba exhaustiva acotada optimizada sobre alfabeto {a, /, \\, espacio, *, ?}", () => {
    const inicio = performance.now();
    const patrones = gerarCadenas(["a", "/", "\\", " ", "*", "?"], 3);
    const cadenas = gerarCadenas(["a", "/", "\\", " "], 4);
    expect(abarca("*", "a")).toBe(true);
    for (const plataforma of ["linux", "win32"] as const) {
      const coincidencias = patrones.map(p => {
        const indices: number[] = [];
        for (let i = 0; i < cadenas.length; i++) {
          if (match(cadenas[i]!, p, plataforma)) indices.push(i);
        }
        return indices;
      });
      const enConjunto = patrones.map((_, idx) => {
        const mascara = new Uint8Array(cadenas.length);
        for (const i of coincidencias[idx]!) mascara[i] = 1;
        return mascara;
      });
      for (let b = 0; b < patrones.length; b++) {
        const patronB = patrones[b]!;
        const mascaraB = enConjunto[b]!;
        for (let a = 0; a < patrones.length; a++) {
          if (!abarca(patronB, patrones[a]!)) continue;
          for (const indiceCadena of coincidencias[a]!) {
            if (!mascaraB[indiceCadena]) {
              throw new Error(`Contraejemplo en ${plataforma}: abarca(${JSON.stringify(patronB)}, ${JSON.stringify(patrones[a]!)}) pero ${JSON.stringify(cadenas[indiceCadena]!)} no coincide con el posterior.`);
            }
          }
        }
      }
    }
    expect(performance.now() - inicio).toBeLessThan(500);
  });

  test("T4-03 casos dirigidos de frontera patologica y cadenas testigo", () => {
    const inclusionesEstrictas: [posterior: string, anterior: string, testigoInverso: string][] = [
      ["**/*", "src/paquetes/opencode/hallazgos.ts", "src/otro.ts"],
      ["src/**/*", "src/paquetes/opencode/hallazgos.ts", "src/a/otro.ts"],
      ["src/*/*/*", "src/a/b/c/d/e.ts", "src/a/b/otro.ts"],
      ["src/*", "src/a/b/c/d/e.ts", "src/otro.ts"],
      ["src/*/*.ts", "src/paquetes/hallazgos.ts", "src/a/otro.ts"],
      ["src/*/*.ts", "src/paquetes/opencode/hallazgos.ts", "src/a/otro.ts"],
      ["test/???/*.spec.ts", "test/abc/hallazgos.spec.ts", "test/xyz/otra.spec.ts"],
      ["test/????/*.spec.ts", "test/abcd/hallazgos.spec.ts", "test/wxyz/otra.spec.ts"],
      ["test/*/*.spec.ts", "test/???/*.spec.ts", "test/abcd/test.spec.ts"],
      ["test/*/*.spec.ts", "test/????/*.spec.ts", "test/abc/test.spec.ts"],
      ["C:\\Archivos de Programa\\*\\bin\\*.exe", "C:/Archivos de Programa/App\\Sub/bin\\ejecutar.exe",
        "C:/Archivos de Programa/Otra/bin/otro.exe"],
      ["dir con espacios/*", "dir con espacios/sub/archivo.ts", "dir con espacios/otro.ts"],
      ["npm run * *", "npm run build", "npm run test"],
      ["npm run * *", "npm run test:watch *", "npm run build"],
      ["git checkout * *", "git checkout main", "git checkout otra"],
      ["git checkout *", "git checkout * *", "git checkout"],
      ["git * *", "git status", "git checkout"],
      ["docker * run *", "docker contenedor run", "docker otro run"],
      ["docker * run *", "docker contenedor run *", "docker otro run"],
    ];

    for (const [posterior, anterior, testigoInverso] of inclusionesEstrictas) {
      expect(abarca(posterior, anterior)).toBe(true);
      expect(abarca(anterior, posterior)).toBe(false);
      for (const plataforma of ["linux", "win32"] as const) {
        expect(match(testigoInverso, posterior, plataforma)).toBe(true);
        expect(match(testigoInverso, anterior, plataforma)).toBe(false);
      }
    }

    // Los * consecutivos son equivalentes: cada uno admite la cadena vacia.
    for (const [posterior, anterior] of [["**/*", "*/*"], ["src/**/*", "src/*/*"]] as const) {
      expect(abarca(posterior, anterior)).toBe(true);
      expect(abarca(anterior, posterior)).toBe(true);
    }

    const refutacionesConTestigo: [posterior: string, anterior: string, testigo: string][] = [
      ["src/paquetes/*.ts", "src/*/*.ts", "src/a/archivo.ts"],
      ["src/*", "src", "src"],
      ["test/???/*.spec.ts", "test/????/*.spec.ts", "test/abcd/test.spec.ts"],
      ["test/????/*.spec.ts", "test/???/*.spec.ts", "test/abc/test.spec.ts"],
      ["test/???/*.spec.ts", "test/*/*.spec.ts", "test/abcd/test.spec.ts"],
      ["npm run build", "npm run * *", "npm run test"],
      ["git status", "git * *", "git checkout"],
    ];

    for (const [posterior, anterior, testigo] of refutacionesConTestigo) {
      expect(abarca(posterior, anterior)).toBe(false);
      for (const plataforma of ["linux", "win32"] as const) {
        expect(match(testigo, anterior, plataforma)).toBe(true);
        expect(match(testigo, posterior, plataforma)).toBe(false);
      }
    }
  });
});

describe("T3-06 R-6 unidad causaRutaRegla", () => {
  test("contencion en base efectiva, unidades en win32 y sujetos no relativos", () => {
    const entornoPosix = crearEntornoMemoria({
      archivos: { "/proyecto/opencode.json": '{"permission":{"read":{"/proyecto/src/a.js":"allow"}}}' },
      directorios: ["/proyecto", "/hogar"],
      variables: { HOME: "/hogar" },
      plataforma: "linux",
    });
    const ctxPosix = adaptadorOpenCode.contexto("/proyecto", entornoPosix);
    const resPosix = resolver(adaptadorOpenCode, "/proyecto", entornoPosix);
    if (!ctxPosix.exito || !resPosix.exito) throw new Error("Fallo en preparacion POSIX");
    expect(causaRutaRegla(resPosix.valor, ctxPosix.valor, {
      agente: null, clave: ["permission", "read", "/proyecto/src/a.js"], sujeto: "read", patron: "/proyecto/src/a.js", efecto: "allow",
    })).toEqual({ causa: "ruta-absoluta-con-forma", parametros: { formaRelativa: "proyecto/src/a.js", decision: "permitida" } });
    expect(causaRutaRegla(resPosix.valor, ctxPosix.valor, {
      agente: null, clave: ["permission", "bash", "/proyecto/src/a.js"], sujeto: "bash", patron: "/proyecto/src/a.js", efecto: "allow",
    })).toBeNull();

    const baseWin = crearEntornoMemoria({
      archivos: { "D:\\proyecto\\opencode.json": '{"permission":{"read":{"\\\\proyecto\\\\src\\\\a.js":"deny"}}}' },
      directorios: ["D:\\proyecto", "C:\\hogar"],
      variables: { USERPROFILE: "C:\\hogar", HOME: "C:\\hogar" },
      plataforma: "win32",
      rutas: "win32",
    });
    const entornoWin = {
      ...baseWin,
      unir: win32.join,
      padre: win32.dirname,
      relativa: (d: string, h: string) => win32.relative(win32.resolve("C:\\", d), win32.resolve("C:\\", h)),
    };
    const ctxWin = adaptadorOpenCode.contexto("D:\\proyecto", entornoWin);
    const resWin = resolver(adaptadorOpenCode, "D:\\proyecto", entornoWin);
    if (!ctxWin.exito || !resWin.exito) throw new Error("Fallo en preparacion win32");
    expect(causaRutaRegla(resWin.valor, ctxWin.valor, {
      agente: null, clave: ["permission", "read", "E:/otro/a.txt"], sujeto: "read", patron: "E:/otro/a.txt", efecto: "deny",
    })).toBeNull();
    expect(causaRutaRegla(resWin.valor, ctxWin.valor, {
      agente: null, clave: ["permission", "read", "\\proyecto\\src\\a.js"], sujeto: "read", patron: "\\proyecto\\src\\a.js", efecto: "deny",
    })).toEqual({ causa: "ruta-absoluta-con-forma", parametros: { formaRelativa: "proyecto/src/a.js", decision: "denegada" } });
    void posix;
  });
});
