import { describe, expect, test } from "bun:test";
import { posix, win32 } from "node:path";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { baseRelativa, raizUnidad } from "./base-relativa";
import { contextoOpenCode } from "./contexto";

describe("T2-19 R-3", () => {
  for (const plataforma of ["linux", "win32"]) {
    test(`${plataforma}: conserva worktree con git y usa la raiz de la unidad sin VCS`, () => {
      const rutas = plataforma === "win32" ? win32 : posix;
      const proyecto = plataforma === "win32" ? "D:\\proyecto\\anidado" : "/proyecto/anidado";
      const entorno = { ...crearEntornoMemoria({ archivos: {}, plataforma, variables: { HOME: "/hogar", USERPROFILE: "C:\\hogar" } }),
        unir: rutas.join, padre: rutas.dirname,
        relativa: (d: string, h: string) => rutas.relative(plataforma === "win32" ? win32.resolve("Z:\\", d) : d, h) };
      const resultado = contextoOpenCode(proyecto, entorno);
      if (!resultado.exito) throw new Error(resultado.error.mensaje);
      const contexto = resultado.valor;
      expect(baseRelativa(contexto)).toBe(plataforma === "win32" ? "D:\\" : "/");
      expect(contexto.parametros.worktree).toBe("/");
      const worktree = plataforma === "win32" ? "D:\\repositorio" : "/repositorio";
      expect(baseRelativa({ ...contexto, parametros: { ...contexto.parametros, worktree } })).toBe(worktree);
    });
  }
});

describe("T2-19 C-2", () => {
  for (const plataforma of ["linux", "win32"]) {
    test(`${plataforma}: raizUnidad depende del proyecto aunque el worktree sea otro`, () => {
      const rutas = plataforma === "win32" ? win32 : posix;
      const proyecto = plataforma === "win32" ? "D:\\proyecto\\anidado" : "/proyecto/anidado";
      const entorno = { ...crearEntornoMemoria({ archivos: {}, plataforma, variables: { HOME: "/hogar", USERPROFILE: "C:\\hogar" } }),
        unir: rutas.join, padre: rutas.dirname };
      const resultado = contextoOpenCode(proyecto, entorno);
      if (!resultado.exito) throw new Error(resultado.error.mensaje);
      const worktree = plataforma === "win32" ? "C:\\repositorio" : "/repositorio";
      const contexto = { ...resultado.valor, parametros: { ...resultado.valor.parametros, worktree } };
      expect(raizUnidad(contexto)).toBe(plataforma === "win32" ? "D:\\" : "/");
      expect(baseRelativa(contexto)).toBe(worktree);
    });
  }
});
