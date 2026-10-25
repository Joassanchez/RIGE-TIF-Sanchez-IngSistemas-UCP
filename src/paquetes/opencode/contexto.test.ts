import { describe, expect, spyOn, test } from "bun:test";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { consultarPermiso } from "../rige/aplicacion/casos-uso/consultar-permiso";
import { consultarAgentes } from "../rige/aplicacion/casos-uso/consultar-agentes";
import { consultarValores } from "../rige/aplicacion/casos-uso/consultar-valores";
import { adaptadorOpenCode } from "./adaptador";
import * as worktree from "./worktree";
import { contextoOpenCode } from "./contexto";

describe("A5-5", () => {
  test("sin hogar devuelve entorno-incompleto de uso", () => {
    expect(contextoOpenCode("/p", crearEntornoMemoria({ archivos: {} }))).toMatchObject({
      exito: false, error: { categoria: "uso", codigo: "entorno-incompleto" },
    });
  });
});

describe("A5-8", () => {
  test("el respaldo Windows sin TEMP ni TMP coincide con Bun os.tmpdir", () => {
    const entorno = crearEntornoMemoria({ archivos: {}, plataforma: "win32", variables: { USERPROFILE: "C:/hogar", SystemRoot: "C:/Windows" } });
    const contexto = contextoOpenCode("C:/p", entorno);
    if (!contexto.exito) throw new Error(contexto.error.mensaje);
    expect(contexto.valor.tmp.replaceAll("\\", "/")).toBe("C:/Windows/temp/opencode");
    // La captura de Bun corre aislada; el entorno del ejecutor no se modifica.
    if (process.platform === "win32") {
      const captura = Bun.spawnSync([process.execPath, "--eval", 'console.log(require("node:os").tmpdir())'], {
        env: { SystemRoot: "C:/Windows", TEMP: "", TMP: "", USERPROFILE: process.env.HOME!,
          RIGE_ALMACEN: process.env.RIGE_ALMACEN! }, stdout: "pipe", stderr: "pipe",
      });
      expect(captura.exitCode).toBe(0);
      expect(contexto.valor.tmp.replaceAll("\\", "/")).toBe(captura.stdout.toString().trim().replaceAll("\\", "/") + "/opencode");
    }
  });
});

describe("T2-11b contexto", () => {
  describe("A8-5", () => { test("las declaraciones de descubrimiento llegan a valores y agentes", () => {
    for (const aproximada of [false, true]) {
      const entorno = crearEntornoMemoria({ archivos: aproximada ? { "/p/.git/HEAD": "ref: refs/heads/main", "/bin/git": "",
        "/p/.git/config": "[core]\nworktree = ../otro" } : {}, directorios: ["/p", "/p/.git", "/p/.git/objects", "/p/.git/refs"],
        variables: { HOME: "/hogar", PATH: aproximada ? "/bin" : "/sin-git" } });
      const deps = { adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } };
      const codigo = aproximada ? "deteccion-git-aproximada" : "git-no-encontrado";
      for (const resultado of [consultarValores(deps, "/p", "build", undefined), consultarAgentes(deps, "/p")]) {
        expect(resultado).toMatchObject({ exito: true, valor: { declaraciones: [codigo], reglas: { [codigo]: expect.any(String) } } });
      }
    }
  }); });
  describe("A11-4", () => { test("C-1 cada consulta descubre el worktree exactamente una vez", () => {
    const espia = spyOn(worktree, "descubrirWorktree");
    try {
      const entorno = crearEntornoMemoria({ archivos: {}, directorios: ["/p"], variables: { HOME: "/hogar" } });
      const resultado = consultarPermiso({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } },
        { proyecto: "/p", agente: "plan", herramienta: "read", objetivo: "a" });
      expect(resultado.exito).toBe(true);
      expect(espia).toHaveBeenCalledTimes(1);
      expect(consultarAgentes({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } }, "/p").exito).toBe(true);
      expect(espia).toHaveBeenCalledTimes(2);
      expect(consultarValores({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } }, "/p", "plan", undefined).exito).toBe(true);
      expect(espia).toHaveBeenCalledTimes(3);
    } finally { espia.mockRestore(); }
  }); });
  describe("A11-3", () => { test("via no soportada precede a hogar ausente", () => {
    const entorno = crearEntornoMemoria({ archivos: {}, directorios: ["/p"], variables: { OPENCODE_CONFIG_CONTENT: "{}" } });
    const deps = { adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } };
    expect(consultarValores(deps, "/p", "plan", undefined)).toMatchObject({ exito: false, error: { codigo: "via-no-soportada" } });
  }); });
  test("C-2 falta el hogar de la plataforma: error de uso en las tres consultas sin fallback", () => {
    for (const plataforma of ["linux", "win32"]) {
      const entorno = crearEntornoMemoria({ plataforma, archivos: {}, directorios: ["/p"],
        variables: plataforma === "win32" ? { HOME: "/no-usar" } : { USERPROFILE: "/no-usar" } });
      const deps = { adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } };
      for (const resultado of [consultarAgentes(deps, "/p"), consultarValores(deps, "/p", "x", undefined),
        consultarPermiso(deps, { proyecto: "/p", agente: "x", sujeto: "read", objetivo: "a" })]) {
        expect(resultado).toMatchObject({ exito: false, error: { codigo: "entorno-incompleto" } });
      }
    }
  });
});
