import { describe, expect, spyOn, test } from "bun:test";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { consultarPermiso } from "../rige/aplicacion/casos-uso/consultar-permiso";
import { consultarAgentes } from "../rige/aplicacion/casos-uso/consultar-agentes";
import { consultarValores } from "../rige/aplicacion/casos-uso/consultar-valores";
import { adaptadorOpenCode } from "./adaptador";
import * as worktree from "./worktree";
import { contextoOpenCode, restaurarContextoOpenCode } from "./contexto";
import { analizarProyecto } from "../rige/aplicacion/casos-uso/analizar-proyecto";
import { instalacionEnMemoria } from "../../pruebas/utilidades/instalacion-opencode";
import { crearEntornoOpenCode } from "../../pruebas/utilidades/entorno-opencode";

describe("T3-01-c1 P-3 ruta del error", () => {
  test("version-no-soportada identifica el package.json de subida o respaldo, sin otras lecturas", () => {
    for (const subida of [false, true]) {
      const ruta = subida ? "/lib/node_modules/opencode-ai/package.json" : "/bin/node_modules/opencode-ai/package.json";
      const entorno = crearEntornoMemoria({ archivos: { "/bin/opencode": "", [ruta]: JSON.stringify({ name: "opencode-ai", version: "1.18.24" }) },
        variables: { PATH: "/bin" }, ...(subida ? { enlaces: { "/bin/opencode": "/lib/node_modules/opencode-ai/bin/opencode.exe" } } : {}) });
      const resultado = contextoOpenCode("/p", entorno);
      expect(resultado).toMatchObject({ exito: false, error: { codigo: "version-no-soportada", mensaje: expect.stringContaining(ruta) } });
    }
  });
});

describe("T3-01 R-7", () => {
  test("version distinta precede a vias no soportadas y la indeterminada precede a git", () => {
    const instalacion = instalacionEnMemoria("/instalacion-falsa", "1.18.24");
    const distinta = crearEntornoMemoria({ archivos: instalacion.archivos,
      variables: { ...instalacion.variables, OPENCODE_CONFIG_CONTENT: "{}" } });
    expect(contextoOpenCode("/p", distinta)).toMatchObject({ exito: false,
      error: { categoria: "uso", codigo: "version-no-soportada", mensaje: expect.stringContaining("1.18.24") } });
    const resultado = contextoOpenCode("/p", crearEntornoMemoria({ archivos: {}, variables: { HOME: "/hogar" } }));
    expect(resultado).toMatchObject({ exito: true,
      valor: { declaraciones: ["version-no-determinada", "ejecutable-no-encontrado", "git-no-encontrado"] } });
  });
});

describe("A5-5", () => {
  test("sin hogar devuelve entorno-incompleto de uso", () => {
    expect(contextoOpenCode("/p", crearEntornoOpenCode({ archivos: {} }))).toMatchObject({
      exito: false, error: { categoria: "uso", codigo: "entorno-incompleto" },
    });
  });
});

describe("A5-8", () => {
  test("el respaldo Windows sin TEMP ni TMP coincide con Bun os.tmpdir", () => {
    const entorno = crearEntornoOpenCode({ archivos: {}, plataforma: "win32", variables: { USERPROFILE: "C:/hogar", SystemRoot: "C:/Windows" } });
    const contexto = contextoOpenCode("C:/p", entorno);
    if (!contexto.exito) throw new Error(contexto.error.mensaje);
    expect(contexto.valor.declaraciones).not.toContain("version-no-determinada");
    expect(contexto.valor.parametros.tmp.replaceAll("\\", "/")).toBe("C:/Windows/temp/opencode");
    // La captura de Bun corre aislada; el entorno del ejecutor no se modifica.
    if (process.platform === "win32") {
      const captura = Bun.spawnSync([process.execPath, "--eval", 'console.log(require("node:os").tmpdir())'], {
        env: { SystemRoot: "C:/Windows", TEMP: "", TMP: "", USERPROFILE: process.env.HOME!,
          RIGE_ALMACEN: process.env.RIGE_ALMACEN! }, stdout: "pipe", stderr: "pipe",
      });
      expect(captura.exitCode).toBe(0);
      expect(contexto.valor.parametros.tmp.replaceAll("\\", "/")).toBe(captura.stdout.toString().trim().replaceAll("\\", "/") + "/opencode");
    }
  });
});

describe("T2-11b contexto", () => {
  test("X-3 guarda solo los datos del contexto y consulta sin descubrir el entorno actual", () => {
    const entorno = crearEntornoOpenCode({ archivos: {}, directorios: ["/p"], plataforma: "linux",
      variables: { HOME: "/hogar", XDG_DATA_HOME: "/datos", TMPDIR: "/temporal", SECRETO: "no-guardar" } });
    const deps = { adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } };
    const analisis = analizarProyecto(deps, "/p");
    if (!analisis.exito) throw new Error(analisis.error.mensaje);
    expect(analisis.valor).toMatchObject({ contexto: { plataforma: "linux", declaraciones: ["git-no-encontrado"],
      parametros: { worktree: "/", hogar: "/hogar", data: "/datos/opencode", tmp: "/temporal/opencode" } } });
    expect(JSON.stringify(analisis.valor)).not.toContain("no-guardar");
    const esperado = consultarPermiso(deps, { proyecto: "/p", agente: "plan", sujeto: "edit", objetivo: "a" });
    const hoy = crearEntornoMemoria({ archivos: {}, plataforma: "win32", variables: {} });
    const guardada = consultarPermiso({ ...deps, entorno: hoy, resolucion: JSON.parse(JSON.stringify(analisis.valor)),
      adaptador: { ...adaptadorOpenCode, contexto: () => { throw new Error("No redescubrir"); },
        permisos: { ...adaptadorOpenCode.permisos, evaluar: (...args) => {
          expect(args[3]).toBe("linux");
          return adaptadorOpenCode.permisos.evaluar(...args);
        } } } }, { proyecto: "/p", agente: "plan", sujeto: "edit", objetivo: "a" });
    expect(guardada).toEqual(esperado);
  });
  describe("A8-5", () => { test("las declaraciones de descubrimiento llegan a valores y agentes", () => {
    for (const aproximada of [false, true]) {
      const entorno = crearEntornoOpenCode({ archivos: aproximada ? { "/p/.git/HEAD": "ref: refs/heads/main", "/bin/git": "",
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
      const entorno = crearEntornoOpenCode({ archivos: {}, directorios: ["/p"], variables: { HOME: "/hogar" } });
      const resultado = consultarPermiso({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } },
        { proyecto: "/p", agente: "plan", herramienta: "read", objetivo: "a" });
      expect(resultado.exito).toBe(true);
      expect(resultado.exito && resultado.valor.declaraciones).not.toContain("version-no-determinada");
      expect(espia).toHaveBeenCalledTimes(1);
      expect(consultarAgentes({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } }, "/p").exito).toBe(true);
      expect(espia).toHaveBeenCalledTimes(2);
      expect(consultarValores({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } }, "/p", "plan", undefined).exito).toBe(true);
      expect(espia).toHaveBeenCalledTimes(3);
    } finally { espia.mockRestore(); }
  }); });
  describe("A11-3", () => { test("via no soportada precede a hogar ausente", () => {
    const entorno = crearEntornoOpenCode({ archivos: {}, directorios: ["/p"], variables: { OPENCODE_TEST_HOME: "/no-soportado" } });
    const deps = { adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } };
    expect(consultarValores(deps, "/p", "plan", undefined)).toMatchObject({ exito: false, error: { codigo: "via-no-soportada" } });
  }); });
  test("C-2 falta el hogar de la plataforma: error de uso en las tres consultas sin fallback", () => {
    for (const plataforma of ["linux", "win32"]) {
      const entorno = crearEntornoOpenCode({ plataforma, archivos: {}, directorios: ["/p"],
        variables: plataforma === "win32" ? { HOME: "/no-usar" } : { USERPROFILE: "/no-usar" } });
      const deps = { adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } };
      for (const resultado of [consultarAgentes(deps, "/p"), consultarValores(deps, "/p", "x", undefined),
        consultarPermiso(deps, { proyecto: "/p", agente: "x", sujeto: "read", objetivo: "a" })]) {
        expect(resultado).toMatchObject({ exito: false, error: { codigo: "entorno-incompleto" } });
      }
    }
  });
});

describe("T6-18 Q-1 Q-2 restaurarContextoOpenCode", () => {
  const entorno = crearEntornoMemoria({ archivos: {}, plataforma: "linux" });
  const base = {
    proyecto: "/p",
    declaraciones: ["git-no-encontrado"],
    parametros: { hogar: "/hogar", config: "/hogar/.config/opencode", data: "/datos/opencode", tmp: "/tmp/opencode", worktree: "/" },
  };

  test("Q-2 restaura un contexto valido de formato 2 sin alterar sus datos", () => {
    const restaurado = adaptadorOpenCode.restaurarContexto(base, entorno);
    expect(restaurado).toEqual({
      exito: true,
      valor: { proyecto: "/p", entorno, declaraciones: ["git-no-encontrado"], parametros: base.parametros },
    });
  });

  test("Q-1 rechaza parametros ausentes, vacios o con tipo invalido como almacen-sin-esquema", () => {
    const { hogar: _, ...sinHogar } = base.parametros;
    const { worktree: __, ...sinWorktree } = base.parametros;
    for (const parametros of [
      sinHogar,
      sinWorktree,
      { ...base.parametros, hogar: "" },
      { ...base.parametros, data: 123 as unknown as string },
      {} as Record<string, string>,
      null as unknown as Record<string, string>,
    ]) {
      expect(restaurarContextoOpenCode({ ...base, parametros }, entorno)).toMatchObject({
        exito: false,
        error: { categoria: "uso", codigo: "almacen-sin-esquema" },
      });
    }
    expect(restaurarContextoOpenCode({ ...base, proyecto: "" }, entorno)).toMatchObject({
      exito: false,
      error: { categoria: "uso", codigo: "almacen-sin-esquema" },
    });
    expect(restaurarContextoOpenCode({ ...base, declaraciones: [1 as unknown as string] }, entorno)).toMatchObject({
      exito: false,
      error: { categoria: "uso", codigo: "almacen-sin-esquema" },
    });
  });
});
