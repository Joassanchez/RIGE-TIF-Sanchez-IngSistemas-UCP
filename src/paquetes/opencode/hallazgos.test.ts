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

function prepararPosixPermisos(permission: Record<string, unknown>) {
  const entorno = crearEntornoMemoria({
    archivos: {
      "/proyecto/opencode.json": JSON.stringify({ permission }),
      "/proyecto/.git/HEAD": "ref: refs/heads/main\n",
      "/bin/git": "",
    },
    directorios: ["/proyecto", "/proyecto/.git", "/proyecto/.git/objects", "/proyecto/.git/refs", "/bin", "/hogar"],
    variables: { HOME: "/hogar", PATH: "/bin" },
    plataforma: "linux",
  });
  const ctx = adaptadorOpenCode.contexto("/proyecto", entorno);
  const res = resolver(adaptadorOpenCode, "/proyecto", entorno);
  if (!ctx.exito || !res.exito) throw new Error("Fallo en preparacion POSIX con git");
  return { ctx: ctx.valor, res: res.valor };
}

function prepararPosixGit(read: Record<string, string>) {
  return prepararPosixPermisos({ read });
}

function prepararWinPermisos(permission: Record<string, unknown>) {
  const baseWin = crearEntornoMemoria({
    archivos: {
      "D:\\proyecto\\opencode.json": JSON.stringify({ permission }),
      "D:\\proyecto\\.git\\HEAD": "ref: refs/heads/main\n",
      "C:\\bin\\git.exe": "",
    },
    directorios: ["D:\\proyecto", "D:\\proyecto\\.git", "D:\\proyecto\\.git\\objects", "D:\\proyecto\\.git\\refs", "C:\\bin", "C:\\hogar"],
    variables: { USERPROFILE: "C:\\hogar", HOME: "C:\\hogar", PATH: "C:\\bin" },
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
  if (!ctxWin.exito || !resWin.exito) throw new Error("Fallo en preparacion win32 con git");
  return { ctx: ctxWin.valor, res: resWin.valor };
}

describe("T5-28 R-1", () => {
  test("read * -> allow y /proyecto/privado/* -> deny en POSIX da ruta-absoluta-con-forma privado/* denegada", () => {
    const { ctx, res } = prepararPosixGit({ "*": "allow", "/proyecto/privado/*": "deny" });
    expect(causaRutaRegla(res, ctx, {
      agente: null, clave: ["permission", "read", "/proyecto/privado/*"],
      sujeto: "read", patron: "/proyecto/privado/*", efecto: "deny",
    })).toEqual({
      causa: "ruta-absoluta-con-forma",
      parametros: { formaRelativa: "privado/*", decision: "denegada" },
    });
  });
});

describe("T5-28 R-2", () => {
  test("mismo caso en win32 (\\proyecto\\privado\\*, unidad D:) da forma privado/*", () => {
    const baseWin = crearEntornoMemoria({
      archivos: {
        "D:\\proyecto\\opencode.json": JSON.stringify({ permission: { read: { "*": "allow", "\\proyecto\\privado\\*": "deny" } } }),
        "D:\\proyecto\\.git\\HEAD": "ref: refs/heads/main\n",
        "C:\\bin\\git.exe": "",
      },
      directorios: ["D:\\proyecto", "D:\\proyecto\\.git", "D:\\proyecto\\.git\\objects", "D:\\proyecto\\.git\\refs", "C:\\bin", "C:\\hogar"],
      variables: { USERPROFILE: "C:\\hogar", HOME: "C:\\hogar", PATH: "C:\\bin" },
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
    if (!ctxWin.exito || !resWin.exito) throw new Error("Fallo en preparacion win32 con git");
    expect(causaRutaRegla(resWin.valor, ctxWin.valor, {
      agente: null, clave: ["permission", "read", "\\proyecto\\privado\\*"],
      sujeto: "read", patron: "\\proyecto\\privado\\*", efecto: "deny",
    })).toEqual({
      causa: "ruta-absoluta-con-forma",
      parametros: { formaRelativa: "privado/*", decision: "denegada" },
    });
  });
});

describe("T5-28 R-3", () => {
  test("/proyecto/*/a.js (comodin intermedio) devuelve null", () => {
    const { ctx, res } = prepararPosixGit({ "/proyecto/*/a.js": "deny" });
    expect(causaRutaRegla(res, ctx, {
      agente: null, clave: ["permission", "read", "/proyecto/*/a.js"],
      sujeto: "read", patron: "/proyecto/*/a.js", efecto: "deny",
    })).toBeNull();
  });
});

describe("T5-28 R-4", () => {
  const sinForma = { causa: "ruta-absoluta" };
  const conForma = { causa: "ruta-absoluta-con-forma", parametros: { formaRelativa: "privado/*", decision: "denegada" } };

  type CasoTabla = {
    nombre: string;
    posix?: Record<string, unknown>;
    win32?: Record<string, unknown>;
    esperadoPosix?: typeof sinForma | typeof conForma;
    esperadoWin32?: typeof sinForma | typeof conForma;
  };

  const tabla: CasoTabla[] = [
    {
      nombre: "privado/ok.md allow -> sin forma",
      posix: { read: { "/proyecto/privado/*": "deny", "privado/ok.md": "allow" } },
      win32: { read: { "\\proyecto\\privado\\*": "deny", "privado/ok.md": "allow" } },
      esperadoPosix: sinForma,
      esperadoWin32: sinForma,
    },
    {
      nombre: "su absoluta (/proyecto/privado/ok.md) allow -> sin forma",
      posix: { read: { "/proyecto/privado/*": "deny", "/proyecto/privado/ok.md": "allow" } },
      win32: { read: { "\\proyecto\\privado\\*": "deny", "\\proyecto\\privado\\ok.md": "allow" } },
      esperadoPosix: sinForma,
      esperadoWin32: sinForma,
    },
    {
      nombre: "pri*/x allow -> sin forma",
      posix: { read: { "/proyecto/privado/*": "deny", "pri*/x": "allow" } },
      win32: { read: { "\\proyecto\\privado\\*": "deny", "pri*/x": "allow" } },
      esperadoPosix: sinForma,
      esperadoWin32: sinForma,
    },
    {
      nombre: "*.md allow -> sin forma",
      posix: { read: { "/proyecto/privado/*": "deny", "*.md": "allow" } },
      win32: { read: { "\\proyecto\\privado\\*": "deny", "*.md": "allow" } },
      esperadoPosix: sinForma,
      esperadoWin32: sinForma,
    },
    {
      nombre: "** allow -> sin forma",
      posix: { read: { "/proyecto/privado/*": "deny", "**": "allow" } },
      win32: { read: { "\\proyecto\\privado\\*": "deny", "**": "allow" } },
      esperadoPosix: sinForma,
      esperadoWin32: sinForma,
    },
    {
      nombre: "regla con sujeto * y patron privado/ok.md allow -> sin forma",
      posix: { read: { "/proyecto/privado/*": "deny" }, "*": { "privado/ok.md": "allow" } },
      win32: { read: { "\\proyecto\\privado\\*": "deny" }, "*": { "privado/ok.md": "allow" } },
      esperadoPosix: sinForma,
      esperadoWin32: sinForma,
    },
    {
      nombre: "sujeto re* y patron privado/ok.md allow -> sin forma",
      posix: { read: { "/proyecto/privado/*": "deny" }, "re*": { "privado/ok.md": "allow" } },
      win32: { read: { "\\proyecto\\privado\\*": "deny" }, "re*": { "privado/ok.md": "allow" } },
      esperadoPosix: sinForma,
      esperadoWin32: sinForma,
    },
    {
      nombre: "win32 PRIVADO/ok.md allow -> sin forma",
      win32: { read: { "\\proyecto\\privado\\*": "deny", "PRIVADO/ok.md": "allow" } },
      esperadoWin32: sinForma,
    },
    {
      nombre: "posterior con el mismo efecto (privado/x deny) -> con forma",
      posix: { read: { "/proyecto/privado/*": "deny", "privado/x": "deny" } },
      win32: { read: { "\\proyecto\\privado\\*": "deny", "privado/x": "deny" } },
      esperadoPosix: conForma,
      esperadoWin32: conForma,
    },
    {
      nombre: "regla de otro sujeto (edit privado/ok.md allow) -> con forma",
      posix: { read: { "/proyecto/privado/*": "deny" }, edit: { "privado/ok.md": "allow" } },
      win32: { read: { "\\proyecto\\privado\\*": "deny" }, edit: { "privado/ok.md": "allow" } },
      esperadoPosix: conForma,
      esperadoWin32: conForma,
    },
  ];

  test.each(tabla)("$nombre", (c) => {
    if (c.posix && c.esperadoPosix) {
      const { ctx, res } = prepararPosixPermisos(c.posix);
      expect(causaRutaRegla(res, ctx, {
        agente: null, clave: ["permission", "read", "/proyecto/privado/*"],
        sujeto: "read", patron: "/proyecto/privado/*", efecto: "deny",
      })).toEqual(c.esperadoPosix);
    }
    if (c.win32 && c.esperadoWin32) {
      const { ctx: ctxWin, res: resWin } = prepararWinPermisos(c.win32);
      expect(causaRutaRegla(resWin, ctxWin, {
        agente: null, clave: ["permission", "read", "\\proyecto\\privado\\*"],
        sujeto: "read", patron: "\\proyecto\\privado\\*", efecto: "deny",
      })).toEqual(c.esperadoWin32);
    }
  });
});

describe("T5-28 R-5", () => {
  test("<worktree>/* devuelve ruta-absoluta sin forma", () => {
    const { ctx, res } = prepararPosixGit({ "/proyecto/*": "deny" });
    expect(causaRutaRegla(res, ctx, {
      agente: null, clave: ["permission", "read", "/proyecto/*"],
      sujeto: "read", patron: "/proyecto/*", efecto: "deny",
    })).toEqual({ causa: "ruta-absoluta" });
  });
});

describe("T5-28 R-6", () => {
  test("? en el ultimo segmento (/proyecto/privado/a?.txt) da forma privado/a?.txt", () => {
    const { ctx, res } = prepararPosixGit({ "*": "allow", "/proyecto/privado/a?.txt": "deny" });
    expect(causaRutaRegla(res, ctx, {
      agente: null, clave: ["permission", "read", "/proyecto/privado/a?.txt"],
      sujeto: "read", patron: "/proyecto/privado/a?.txt", efecto: "deny",
    })).toEqual({
      causa: "ruta-absoluta-con-forma",
      parametros: { formaRelativa: "privado/a?.txt", decision: "denegada" },
    });
  });
});

describe("T5-28 R-7", () => {
  test("casos sin comodin conservan la forma esperada", () => {
    const { ctx, res } = prepararPosixGit({
      "/proyecto/src/a.js": "allow",
      "/proyecto/privado/": "deny",
      "/proyecto/.env": "allow",
    });
    expect(causaRutaRegla(res, ctx, {
      agente: null, clave: ["permission", "read", "/proyecto/src/a.js"],
      sujeto: "read", patron: "/proyecto/src/a.js", efecto: "allow",
    })).toEqual({ causa: "ruta-absoluta-con-forma", parametros: { formaRelativa: "src/a.js", decision: "permitida" } });
    expect(causaRutaRegla(res, ctx, {
      agente: null, clave: ["permission", "read", "/proyecto/privado/"],
      sujeto: "read", patron: "/proyecto/privado/", efecto: "deny",
    })).toEqual({ causa: "ruta-absoluta-con-forma", parametros: { formaRelativa: "privado", decision: "denegada" } });
    expect(causaRutaRegla(res, ctx, {
      agente: null, clave: ["permission", "read", "/proyecto/.env"],
      sujeto: "read", patron: "/proyecto/.env", efecto: "allow",
    })).toEqual({ causa: "ruta-absoluta-con-forma", parametros: { formaRelativa: ".env", decision: "permitida" } });
  });
});

describe("T5-28 C1-2", () => {
  test("/proyecto/privado/*/.. -> ruta-absoluta sin forma", () => {
    const { ctx, res } = prepararPosixGit({ "/proyecto/privado/*/..": "deny" });
    expect(causaRutaRegla(res, ctx, {
      agente: null, clave: ["permission", "read", "/proyecto/privado/*/.."],
      sujeto: "read", patron: "/proyecto/privado/*/..", efecto: "deny",
    })).toEqual({ causa: "ruta-absoluta" });
  });
});

describe("T5-28 C1-3", () => {
  test("privado/ok.md allow antes de la regla absoluta -> con forma privado/*", () => {
    const { ctx, res } = prepararPosixGit({ "privado/ok.md": "allow", "/proyecto/privado/*": "deny" });
    expect(causaRutaRegla(res, ctx, {
      agente: null, clave: ["permission", "read", "/proyecto/privado/*"],
      sujeto: "read", patron: "/proyecto/privado/*", efecto: "deny",
    })).toEqual({
      causa: "ruta-absoluta-con-forma",
      parametros: { formaRelativa: "privado/*", decision: "denegada" },
    });
  });
});
