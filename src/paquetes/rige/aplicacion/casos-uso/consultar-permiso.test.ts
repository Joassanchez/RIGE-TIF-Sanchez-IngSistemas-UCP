import { describe, expect, spyOn, test } from "bun:test";
import * as nucleo from "@rige/nucleo/permisos/decidir";
import { consultarPermiso } from "./consultar-permiso";
import { adaptadorFicticio } from "../../../../pruebas/utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../../../../pruebas/utilidades/entorno-memoria";
import { adaptadorOpenCode } from "../../../opencode/adaptador";

describe("A6-1", () => {
  const consultar = (plataforma: string, adaptador = adaptadorOpenCode) => {
    const entorno = crearEntornoMemoria({ archivos: { "/p/opencode.json": '{"permission":{"read":{"*":"allow","*.env":"ask"}}}' },
      directorios: ["/p"], plataforma, variables: { HOME: "/hogar", USERPROFILE: "/hogar" } });
    return consultarPermiso({ adaptador, entorno, rutas: { canonica: () => "/p" } },
      { proyecto: "/p", agente: "build", sujeto: "read", objetivo: ".ENV" });
  };
  test.each([["win32", "ask"], ["linux", "allow"]])("%s transmite la plataforma al evaluador real", (plataforma, decision) => {
    expect(consultar(plataforma!)).toMatchObject({ exito: true, valor: { decision } });
  });
  test("un mutante que fija linux pierde la coincidencia Windows", () => {
    const mutante = { ...adaptadorOpenCode, permisos: { ...adaptadorOpenCode.permisos,
      evaluar: (reglas: Parameters<typeof adaptadorOpenCode.permisos.evaluar>[0], sujeto: string, objetivo: string) =>
        adaptadorOpenCode.permisos.evaluar(reglas, sujeto, objetivo, "linux") } };
    expect(consultar("win32", mutante)).toMatchObject({ exito: true, valor: { decision: "allow" } });
    expect(() => expect(consultar("win32", mutante)).toMatchObject({ exito: true, valor: { decision: "ask" } })).toThrow();
  });
});

describe("A6-3 RD-07", () => {
  test.each([[".opencode/plans/x.md", false], ["src/a.js", true]])("plan edit %s evalua la ultima nativa coincidente", (objetivo, advertencia) => {
    const entorno = crearEntornoMemoria({ archivos: { "/p/opencode.json": '{"permission":{"edit":"allow"}}',
      "/p/.git/HEAD": "ref: refs/heads/main", "/bin/git": "" }, directorios: ["/p", "/p/.git", "/p/.git/objects", "/p/.git/refs"],
      variables: { HOME: "/hogar", PATH: "/bin" } });
    const resultado = consultarPermiso({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } },
      { proyecto: "/p", agente: "plan", herramienta: "edit", objetivo: objetivo! });
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.nativaAnulada !== null).toBe(advertencia!);
  });
});

const deps = () => ({ adaptador: adaptadorFicticio, rutas: { canonica: () => "/proyecto" },
  entorno: crearEntornoMemoria({ archivos: { "/proyecto/capa-b.json": "{}", "/proyecto/capa-a.json": "{}" } }) });

describe("T2-06 consulta en memoria", () => {
  describe("A11-2", () => { test("incluye la plantilla del motivo decidido por el nucleo", () => {
    const resultado = consultarPermiso({ ...deps(), adaptador: { ...adaptadorFicticio,
      cadena: (_, agente) => ({ exito: true, valor: { agente, reglas: [], declaraciones: [], advertencias: [], ejesParciales: ["documento"] } }),
      reglas: { ...adaptadorFicticio.reglas, "eje-parcialmente-observado": "Eje parcial." },
    } }, { proyecto: "/proyecto", agente: "a", sujeto: "documento", objetivo: "todos" });
    expect(resultado).toMatchObject({ exito: true, valor: { motivoSinDecision: "eje-parcialmente-observado",
      reglas: { "eje-parcialmente-observado": "Eje parcial." } } });
  }); });
  test("T2-11b K-2 el caso de uso conserva decision y motivo emitidos por el nucleo", () => {
    const original = nucleo.decidir;
    const espia = spyOn(nucleo, "decidir").mockImplementation((...args) => ({
      ...original(...args), motivoSinDecision: "motivo-del-nucleo",
    }));
    try {
      const base = deps();
      const resultado = consultarPermiso({ ...base, adaptador: { ...base.adaptador,
        prepararConsulta: () => ({ exito: true, valor: { sujeto: "documento", objetivoEvaluado: "todos", motivoSinDecision: "no-observado" } }),
        reglas: { ...base.adaptador.reglas, "no-observado": "Sin observacion.", "motivo-del-nucleo": "Motivo del nucleo." },
      } }, { proyecto: "/proyecto", agente: "a", sujeto: "documento", objetivo: "todos" });
      expect(espia).toHaveBeenCalledTimes(1);
      expect(resultado).toMatchObject({ exito: true, valor: { decision: null, motivoSinDecision: "motivo-del-nucleo" } });
    } finally { espia.mockRestore(); }
  });
  test("T2-08 forma por herramienta delega al adaptador y conserva consulta original", () => {
    const dependencias = { ...deps(), adaptador: { ...adaptadorFicticio,
      prepararConsulta: () => ({ exito: true as const, valor: { sujeto: "documento", objetivoEvaluado: "todos", motivoSinDecision: null } }) } };
    expect(consultarPermiso(dependencias, { proyecto: "/proyecto", agente: "a", herramienta: "lector", objetivo: "/documento" })).toMatchObject({
      exito: true, valor: { decision: "conceder", consulta: { forma: "herramienta", herramienta: "lector", sujeto: "documento", objetivo: "/documento", objetivoEvaluado: "todos" } },
    });
    expect(consultarPermiso(deps(), { proyecto: "/proyecto", agente: "a", sujeto: "documento", objetivo: "./todos" })).toMatchObject({
      exito: true, valor: { consulta: { forma: "sujeto", objetivoEvaluado: "./todos" } },
    });
    const fuera = { ...dependencias, adaptador: { ...dependencias.adaptador,
      reglas: { ...dependencias.adaptador.reglas, "fuera-del-arbol": "Recurso externo." },
      prepararConsulta: () => ({ exito: true as const, valor: { sujeto: "documento", objetivoEvaluado: "../otro", motivoSinDecision: "fuera-del-arbol" } }) } };
    expect(consultarPermiso(fuera, { proyecto: "/proyecto", agente: "a", herramienta: "lector", objetivo: "../otro" })).toMatchObject({
      exito: true, valor: { decision: null, motivoSinDecision: "fuera-del-arbol", cadena: [], determinante: null,
        consulta: { objetivoEvaluado: "../otro" } },
    });
    for (const accion of [{ herramienta: "" }, { herramienta: "lector", sujeto: "documento" }, {}]) {
      expect(consultarPermiso(dependencias, { proyecto: "/proyecto", agente: "a", ...(accion as { herramienta: string }), objetivo: "x" })).toMatchObject({ exito: false });
    }
  });
  test("D-1 ficticio sin reglas: ask y ninguna escritura", () => {
    const dependencias = deps();
    dependencias.adaptador = { ...adaptadorFicticio,
      permisos: { ...adaptadorFicticio.permisos, efectoPorDefecto: "ask" }, cadena: (_, agente) => ({ exito: true,
      valor: { agente, reglas: [], ejesParciales: [], declaraciones: [], advertencias: [] } }) };
    expect(consultarPermiso(dependencias, { proyecto: "/proyecto", agente: "a", sujeto: "documento", objetivo: "todos" })).toMatchObject({
      exito: true, valor: { esquema: 2, decision: "ask", motivoSinDecision: null, porDefecto: true, determinante: null },
    });
  });
  test("D-4 ficticio con orden y vocabulario propios atraviesa el caso de uso", () => {
    const dependencias = deps();
    dependencias.adaptador = { ...adaptadorFicticio, cadena: (_, agente) => ({ exito: true, valor: {
      agente, ejesParciales: [], declaraciones: [], advertencias: [], reglas: [
        { indice: 0, sujeto: "documento", patron: "todos", efecto: "impedir", origen: { tipo: "nativo", regla: "base-ficticia" }, declaracion: null },
        { indice: 1, sujeto: "documento", patron: "todos", efecto: "conceder", origen: { tipo: "declarado", orden: 0,
          posicion: { linea: 1, columna: 1 } }, declaracion: null },
      ],
    } }) };
    const primera = consultarPermiso(dependencias, { proyecto: "/proyecto", agente: "a", sujeto: "documento", objetivo: "todos" });
    expect(primera).toMatchObject({ exito: true, valor: { decision: "conceder", nativaAnulada: { regla: 0, por: 1 } } });
    expect(JSON.stringify(consultarPermiso(dependencias, { proyecto: "/proyecto", agente: "a", sujeto: "documento", objetivo: "todos" }))).toBe(JSON.stringify(primera));
  });
  test("valida argumentos antes de leer y propaga errores de proyecto y cadena", () => {
    for (const [agente, sujeto, objetivo] of [["", "x", "y"], ["a", " ", "y"], ["a", "x", ""]]) {
      expect(consultarPermiso({ ...deps(), rutas: { canonica: () => { throw new Error("No leer"); } } }, { proyecto: "/proyecto", agente: agente!, sujeto: sujeto!, objetivo: objetivo! })).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
    }
    expect(consultarPermiso({ ...deps(), rutas: { canonica: () => null } }, { proyecto: "/ausente", agente: "a", sujeto: "x", objetivo: "y" }))
      .toMatchObject({ exito: false, error: { codigo: "proyecto-inexistente" } });
    expect(consultarPermiso({ ...deps(), adaptador: { ...adaptadorFicticio, cadena: () => ({ exito: false,
      error: { categoria: "uso", codigo: "cadena-incompleta", mensaje: "No disponible" } }) } }, { proyecto: "/proyecto", agente: "a", sujeto: "x", objetivo: "y" }))
      .toMatchObject({ exito: false, error: { codigo: "cadena-incompleta" } });
  });
});
