import { describe, expect, test } from "bun:test";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { descubrirWorktree } from "./worktree";

function entorno(archivos: Record<string, string> = {}, directorios: string[] = [], variables = {}) {
  return crearEntornoMemoria({ archivos: { "/bin/git": "", ...archivos },
    directorios, variables: { PATH: "/bin", ...variables } });
}
const head = { "/w/.git/HEAD": "ref: refs/heads/main\n" };
const estructura = ["/w/.git", "/w/.git/objects", "/w/.git/refs"];

describe("T2-08 descubrimiento autorizado ADR-101", () => {
  test("T2-11b W-1 un gitfile invalido detiene la subida aunque haya repositorio exterior", () => {
    for (const gitfile of ["basura", "gitdir: ../inexistente\n", "gitdir: ../roto\n"]) {
      expect(descubrirWorktree("/w/p", entorno({ ...head, "/w/p/.git": gitfile,
        "/w/roto/HEAD": "basura" }, [...estructura, "/w/roto"])))
        .toMatchObject({ valor: { worktree: "/" } });
    }
  });
  test("repositorio valido, HEAD sintetico y ausencia de .git", () => {
    expect(descubrirWorktree("/w/p", entorno(head, estructura))).toEqual({ exito: true, valor: { worktree: "/w", declaraciones: [] } });
    for (const e of [entorno(head, ["/w/.git"]), entorno()]) {
      expect(descubrirWorktree("/w/p", e)).toEqual({ exito: true, valor: { worktree: "/", declaraciones: [] } });
    }
  });
  test("rechaza HEAD invalido; admite hashes SHA-1/SHA-256 y sigue subiendo", () => {
    for (const texto of ["basura", "ref: otro", "a".repeat(39), ""]) {
      expect(descubrirWorktree("/w/p", entorno({ ...head, "/w/p/.git/HEAD": texto },
        [...estructura, "/w/p/.git", "/w/p/.git/objects", "/w/p/.git/refs"])))
        .toMatchObject({ valor: { worktree: "/w" } });
    }
    for (const texto of ["a".repeat(40), "B".repeat(64)]) {
      expect(descubrirWorktree("/w/p", entorno({ "/w/.git/HEAD": texto }, estructura)))
        .toMatchObject({ valor: { worktree: "/w" } });
    }
  });
  test("gitdir relativo/absoluto y commondir resuelven HEAD separado de objects/refs", () => {
    for (const destino of ["../meta/wt", "/meta/wt"]) {
      expect(descubrirWorktree("/w/p", entorno({ "/w/.git": `gitdir: ${destino}\n`,
        "/meta/wt/HEAD": "ref: refs/heads/main\n", "/meta/wt/commondir": "../comun\n" },
        ["/meta/wt", "/meta/comun", "/meta/comun/objects", "/meta/comun/refs"])))
        .toMatchObject({ valor: { worktree: "/w" } });
    }
    expect(descubrirWorktree("/w", entorno({ "/w/.git": "gitdir: /ausente" })))
      .toMatchObject({ valor: { worktree: "/" } });
  });
  test("sin git en PATH declara git-no-encontrado; no confunde directorio con ejecutable", () => {
    expect(descubrirWorktree("/w", entorno(head, estructura, { PATH: "/sin-git" })))
      .toMatchObject({ valor: { worktree: "/", declaraciones: ["git-no-encontrado"] } });
    const e = { ...entorno(head, [...estructura, "/win/git.exe"]), plataforma: "win32" };
    expect(descubrirWorktree("/w", { ...e, variable: clave => clave === "PATH" ? "/win" : undefined }))
      .toMatchObject({ valor: { worktree: "/", declaraciones: ["git-no-encontrado"] } });
    for (const nombre of ["git", "git.exe", "git.cmd"]) {
      expect(descubrirWorktree("/w", { ...e, variable: clave => clave === "PATH" ? "/sin;\"/bin\"" : undefined,
        tipo: ruta => ruta.startsWith("/bin/") ? ruta === `/bin/${nombre}` ? "archivo" : "inexistente" : e.tipo(ruta) }))
        .toMatchObject({ valor: { worktree: "/w" } });
    }
    expect(descubrirWorktree("/w", { ...entorno({ ...head, "/w/git": "" }, estructura), variable: () => undefined }))
      .toMatchObject({ valor: { worktree: "/", declaraciones: ["git-no-encontrado"] } });
  });
  test("GIT_DIR y GIT_WORK_TREE definidas incluso vacias son error de uso", () => {
    for (const nombre of ["GIT_DIR", "GIT_WORK_TREE"]) {
      expect(descubrirWorktree("/w", entorno(head, estructura, { [nombre]: "" })))
        .toMatchObject({ exito: false, error: { codigo: "via-no-soportada", mensaje: expect.stringContaining(nombre) } });
    }
  });
  test("solo declara aproximacion al detectar core.worktree, bare=true o safe.directory", () => {
    for (const config of ["[core]\nworktree = ../otro", "[core]\nbare = true", "[safe]\ndirectory = *"]) {
      expect(descubrirWorktree("/w/p", entorno({ ...head, "/w/.git/config": config }, estructura)))
        .toMatchObject({ valor: { declaraciones: ["deteccion-git-aproximada"] } });
    }
    expect(descubrirWorktree("/w/p", entorno({ ...head, "/w/.git/config": "[core]\nbare = false\n# worktree = otro" }, estructura)))
      .toMatchObject({ valor: { declaraciones: [] } });
    expect(descubrirWorktree("/bare", entorno({ "/bare/HEAD": "ref: refs/heads/main", "/bare/config": "[core]\nbare=true" },
      ["/bare", "/bare/objects", "/bare/refs"]))).toMatchObject({ valor: { worktree: "/", declaraciones: ["deteccion-git-aproximada"] } });
  });
});
