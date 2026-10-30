import { describe, expect, test } from "bun:test";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { buscarEjecutable, directoriosPath } from "./ejecutables";

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
