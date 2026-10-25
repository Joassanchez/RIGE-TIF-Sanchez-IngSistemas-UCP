import { describe, expect, spyOn, test } from "bun:test";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { consultarPermiso } from "../rige/aplicacion/casos-uso/consultar-permiso";
import { consultarAgentes } from "../rige/aplicacion/casos-uso/consultar-agentes";
import { consultarValores } from "../rige/aplicacion/casos-uso/consultar-valores";
import { adaptadorOpenCode } from "./adaptador";
import * as worktree from "./worktree";

describe("T2-11b contexto", () => {
  test("C-1 una consulta por herramienta descubre el worktree exactamente una vez", () => {
    const espia = spyOn(worktree, "descubrirWorktree");
    try {
      const entorno = crearEntornoMemoria({ archivos: {}, directorios: ["/p"], variables: { HOME: "/hogar" } });
      const resultado = consultarPermiso({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } },
        { proyecto: "/p", agente: "plan", herramienta: "read", objetivo: "a" });
      expect(resultado.exito).toBe(true);
      expect(espia).toHaveBeenCalledTimes(1);
    } finally { espia.mockRestore(); }
  });
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
