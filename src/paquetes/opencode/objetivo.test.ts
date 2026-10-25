import { describe, expect, test } from "bun:test";
import { posix, win32 } from "node:path";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { prepararConsulta } from "./objetivo";
import { contextoOpenCode } from "./contexto";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";

function prepararObjetivo(proyecto: string, herramienta: string, objetivo: string, entorno: EntornoLectura) {
  const contexto = contextoOpenCode(proyecto, entorno);
  if (!contexto.exito) return contexto;
  return prepararConsulta(contexto.valor, { herramienta, objetivo });
}

describe("A8-1", () => {
  test("sin VCS solo contiene el directorio del proyecto; permite tambien el worktree", () => {
    const entorno = crearEntornoMemoria({ archivos: {}, variables: { HOME: "/hogar" } });
    const contexto = contextoOpenCode("/p", entorno);
    if (!contexto.exito) throw new Error(contexto.error.mensaje);
    expect(prepararConsulta(contexto.valor, { herramienta: "read", objetivo: "../fuera.txt" }))
      .toMatchObject({ valor: { motivoSinDecision: "fuera-del-arbol" } });
    expect(prepararConsulta(contexto.valor, { herramienta: "read", objetivo: "a.txt" }))
      .toMatchObject({ valor: { motivoSinDecision: null } });
    expect(prepararConsulta({ ...contexto.valor, proyecto: "/externo/p", worktree: "/w" }, { herramienta: "read", objetivo: "a.txt" }))
      .toMatchObject({ valor: { motivoSinDecision: null } });
    expect(prepararConsulta({ ...contexto.valor, proyecto: "/externo/p", worktree: "/w" }, { herramienta: "read", objetivo: "/w/a.txt" }))
      .toMatchObject({ valor: { motivoSinDecision: null } });
  });
});

describe("T2-08 objetivos por herramienta", () => {
  for (const plataforma of ["linux", "win32"]) {
    const path = plataforma === "win32" ? win32 : posix;
    const raiz = plataforma === "win32" ? "C:/w" : "/w";
    const memoria = crearEntornoMemoria({ archivos: { [`${raiz}/.git/HEAD`]: "ref: refs/heads/main", [`${raiz}/bin/git`]: "" },
      directorios: [`${raiz}/.git`, `${raiz}/.git/objects`, `${raiz}/.git/refs`], variables: { PATH: `${raiz}/bin`, HOME: "/hogar", USERPROFILE: "C:/hogar" }, plataforma });
    const entorno = { ...memoria, unir: path.join, padre: path.dirname, relativa: path.relative, esAbsoluta: path.isAbsolute,
      tipo: (ruta: string) => memoria.tipo(ruta.replaceAll("\\", "/")), leer: (ruta: string) => memoria.leer(ruta.replaceAll("\\", "/")) };
    test(`${plataforma}: proyecto anidado, aliases y directorios sin barra final`, () => {
      for (const herramienta of ["read", "edit", "write", "apply_patch"]) {
        const objetivoEvaluado = herramienta === "apply_patch" ? "p/src/a.js" : path.join("p", "src", "a.js");
        for (const objetivo of ["src/a.js", path.join(raiz, "p", "src", "a.js")]) {
          expect(prepararObjetivo(`${raiz}/p`, herramienta, objetivo, entorno)).toMatchObject({
            exito: true, valor: { sujeto: herramienta === "read" ? "read" : "edit", objetivoEvaluado, motivoSinDecision: null },
          });
        }
      }
      expect(prepararObjetivo(`${raiz}/p`, "read", "privado/", entorno))
        .toMatchObject({ valor: { objetivoEvaluado: path.join("p", "privado") } });
    });
    test(`${plataforma}: fuera del arbol y prefijos hermanos no producen decision`, () => {
      for (const objetivo of ["../../fuera.txt", `${raiz}-otro/a.txt`]) {
        expect(prepararObjetivo(`${raiz}/p`, "read", objetivo, entorno))
          .toMatchObject({ valor: { motivoSinDecision: "fuera-del-arbol" } });
      }
    });
    test(`${plataforma}: otras herramientas conservan el recurso literal y las desconocidas fallan`, () => {
      for (const herramienta of ["bash", "glob", "grep", "webfetch", "task", "todowrite", "skill"]) {
        expect(prepararObjetivo(`${raiz}/p`, herramienta, "./a/../b", entorno)).toMatchObject({
          valor: { sujeto: herramienta, objetivoEvaluado: "./a/../b", motivoSinDecision: null },
        });
      }
      expect(prepararObjetivo(`${raiz}/p`, "list", "privado", entorno)).toMatchObject({ exito: false });
    });
  }
});
