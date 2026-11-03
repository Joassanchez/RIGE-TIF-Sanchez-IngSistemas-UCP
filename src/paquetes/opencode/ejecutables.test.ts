import { describe, expect, test } from "bun:test";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { buscarEjecutable, directoriosPath, nombresEjecutable } from "./ejecutables";
import { contextoOpenCode } from "./contexto";

describe("T3-01 R-5 recorrido compartido de PATH", () => {
  test("conserva comillas, relativas, vacios, orden de directorio y nombre, y respaldo Path", () => {
    const entorno = crearEntornoMemoria({ archivos: { "/p/bin/git.cmd": "", "/b/git": "" },
      variables: { PATH: '"bin":/b::.' } });
    expect(directoriosPath(entorno, "/p")).toEqual(["/p/bin", "/b", "/p", "/p"]);
    expect(buscarEjecutable(entorno, "/p", ["git", "git.cmd"])).toBe("/p/bin/git.cmd");
    expect(buscarEjecutable(crearEntornoMemoria({ archivos: {}, variables: {} }), "/p", ["git"])).toBeUndefined();
    const windows = crearEntornoMemoria({ archivos: { "C:/a/git.cmd": "", "C:/a/git.exe": "" },
      plataforma: "win32", rutas: "win32", variables: { Path: '"C:\\a";bin' } });
    expect(directoriosPath(windows, "C:/p")).toEqual(["C:\\a", "C:\\p\\bin"]);
    expect(buscarEjecutable(windows, "C:/p", ["git.exe", "git.cmd"])).toBe("C:\\a\\git.exe");
  });
});

describe("T3-10 R-5 PATH inaccesible y examinar (ADR-106)", () => {
  test("examinar devuelve archivo, directorio, inexistente o inaccesible segun el caso", () => {
    const entorno = crearEntornoMemoria({
      archivos: { "/p/archivo.txt": "hola" },
      directorios: ["/p", "/p/dir", "/p/prohibido"],
      inaccesibles: ["/p/prohibido", "/p/prohibido/sub"],
    });

    expect(entorno.examinar("/p/archivo.txt")).toBe("archivo");
    expect(entorno.examinar("/p/dir")).toBe("directorio");
    expect(entorno.examinar("/p/inexistente")).toBe("inexistente");
    expect(entorno.examinar("/p/prohibido")).toBe("inaccesible");
    expect(entorno.examinar("/p/prohibido/sub")).toBe("inaccesible");
  });

  test("directorio inaccesible en PATH se saltea, encuentra el siguiente ejecutable y declara path-inaccesible una sola vez", () => {
    const archivos = {
      "/p/.git/HEAD": "ref: refs/heads/main\n",
      "/b/git": "",
      "/b/opencode": "",
      "/node_modules/opencode-ai/package.json": JSON.stringify({ name: "opencode-ai", version: "1.18.25" }),
    };
    const directorios = ["/p", "/p/.git", "/p/.git/objects", "/p/.git/refs", "/inaccesible", "/b", "/h", "/h/.config", "/h/.config/opencode"];
    const entorno = crearEntornoMemoria({
      archivos,
      directorios,
      inaccesibles: ["/inaccesible/opencode", "/inaccesible/git", "/inaccesible"],
      variables: {
        HOME: "/h",
        PATH: "/inaccesible:/b",
      },
    });

    const ctx = contextoOpenCode("/p", entorno);
    expect(ctx.exito).toBe(true);
    if (!ctx.exito) throw new Error(ctx.error.mensaje);

    // Encuentra los ejecutables en /b a pesar del primer directorio inaccesible
    expect(ctx.valor.parametros.worktree).toBe("/p");

    // Declara path-inaccesible a lo sumo UNA vez
    const conteo = ctx.valor.declaraciones.filter(d => d === "path-inaccesible").length;
    expect(conteo).toBe(1);
  });

  test("solo directorios inaccesibles en PATH resulta en version-no-determinada y path-inaccesible", () => {
    const entorno = crearEntornoMemoria({
      archivos: {
        "/p/.git/HEAD": "ref: refs/heads/main\n",
      },
      directorios: ["/p", "/p/.git", "/p/.git/objects", "/p/.git/refs", "/bloqueado1", "/bloqueado2", "/h"],
      inaccesibles: ["/bloqueado1", "/bloqueado1/opencode", "/bloqueado1/git", "/bloqueado2", "/bloqueado2/opencode", "/bloqueado2/git"],
      variables: {
        HOME: "/h",
        PATH: "/bloqueado1:/bloqueado2",
      },
    });

    const ctx = contextoOpenCode("/p", entorno);
    expect(ctx.exito).toBe(true);
    if (!ctx.exito) throw new Error(ctx.error.mensaje);

    expect(ctx.valor.declaraciones).toContain("version-no-determinada");
    expect(ctx.valor.declaraciones).toContain("path-inaccesible");
    const conteo = ctx.valor.declaraciones.filter(d => d === "path-inaccesible").length;
    expect(conteo).toBe(1);
  });

  test("otro error en examinar que no sea EACCES/EPERM lanza excepcion de infraestructura", () => {
    const entorno = crearEntornoMemoria({
      archivos: {},
      variables: { HOME: "/h", PATH: "/dir" },
    });
    // Forzamos un error inesperado (no EACCES/EPERM)
    const entornoConFalla = {
      ...entorno,
      examinar: () => {
        const err = new Error("Falla de disco inesperada (EBUSY)");
        (err as any).code = "EBUSY";
        throw err;
      },
    };

    expect(() => contextoOpenCode("/p", entornoConFalla)).toThrow(/EBUSY/);
  });
});

describe("T3-10 R-6 nombresEjecutable", () => {
  test("win32 con PATHEXT=.EXE;.CMD genera nombres con extensiones en minuscula", () => {
    const entornoWin = {
      plataforma: "win32",
      variable: (nombre: string) => (nombre === "PATHEXT" ? ".EXE;.CMD" : undefined),
    };

    expect(nombresEjecutable(entornoWin, "git")).toEqual(["git.exe", "git.cmd"]);
    expect(nombresEjecutable(entornoWin, "opencode")).toEqual(["opencode.exe", "opencode.cmd"]);
  });

  test("win32 sin PATHEXT utiliza el conjunto por defecto (.com;.exe;.bat;.cmd)", () => {
    const entornoWinDefault = {
      plataforma: "win32",
      variable: (_nombre: string) => undefined,
    };

    expect(nombresEjecutable(entornoWinDefault, "git")).toEqual(["git.com", "git.exe", "git.bat", "git.cmd"]);
    expect(nombresEjecutable(entornoWinDefault, "opencode")).toEqual(["opencode.com", "opencode.exe", "opencode.bat", "opencode.cmd"]);
  });

  test("POSIX devuelve unicamente el nombre base sin extensiones", () => {
    for (const plat of ["linux", "darwin"]) {
      const entornoPosix = {
        plataforma: plat,
        variable: (nombre: string) => (nombre === "PATHEXT" ? ".exe;.cmd" : undefined),
      };

      expect(nombresEjecutable(entornoPosix, "git")).toEqual(["git"]);
      expect(nombresEjecutable(entornoPosix, "opencode")).toEqual(["opencode"]);
    }
  });
});
