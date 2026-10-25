import { describe, expect, test } from "bun:test";
import { consultarPermiso } from "./consultar-permiso";
import { adaptadorFicticio } from "../../../../pruebas/utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../../../../pruebas/utilidades/entorno-memoria";

const deps = () => ({ adaptador: adaptadorFicticio, rutas: { canonica: () => "/proyecto" },
  entorno: crearEntornoMemoria({ archivos: { "/proyecto/capa-b.json": "{}", "/proyecto/capa-a.json": "{}" } }) });

describe("T2-06 consulta en memoria", () => {
  test("T2-08 forma por herramienta delega al adaptador y conserva consulta original", () => {
    const dependencias = { ...deps(), adaptador: { ...adaptadorFicticio,
      prepararObjetivo: () => ({ exito: true as const, valor: { sujeto: "documento", objetivoEvaluado: "todos", motivoSinDecision: null } }) } };
    expect(consultarPermiso(dependencias, "/proyecto", "a", { herramienta: "lector" }, "/documento")).toMatchObject({
      exito: true, valor: { decision: "conceder", consulta: { forma: "herramienta", herramienta: "lector", sujeto: "documento", objetivo: "/documento", objetivoEvaluado: "todos" } },
    });
    expect(consultarPermiso(deps(), "/proyecto", "a", "documento", "./todos")).toMatchObject({
      exito: true, valor: { consulta: { forma: "sujeto", objetivoEvaluado: "./todos" } },
    });
    const fuera = { ...dependencias, adaptador: { ...dependencias.adaptador,
      reglas: { ...dependencias.adaptador.reglas, "fuera-del-arbol": "Recurso externo." },
      prepararObjetivo: () => ({ exito: true as const, valor: { sujeto: "documento", objetivoEvaluado: "../otro", motivoSinDecision: "fuera-del-arbol" } }) } };
    expect(consultarPermiso(fuera, "/proyecto", "a", { herramienta: "lector" }, "../otro")).toMatchObject({
      exito: true, valor: { decision: null, motivoSinDecision: "fuera-del-arbol", cadena: [], determinante: null,
        consulta: { objetivoEvaluado: "../otro" } },
    });
    for (const accion of [{ herramienta: "" }, { herramienta: "lector", sujeto: "documento" }, {}]) {
      expect(consultarPermiso(dependencias, "/proyecto", "a", accion as { herramienta: string }, "x")).toMatchObject({ exito: false });
    }
  });
  test("D-1 ficticio sin reglas: ask y ninguna escritura", () => {
    const dependencias = deps();
    dependencias.adaptador = { ...adaptadorFicticio,
      permisos: { ...adaptadorFicticio.permisos, efectoPorDefecto: "ask" }, cadena: (_, agente) => ({ exito: true,
      valor: { agente, reglas: [], ejesParciales: [] } }) };
    expect(consultarPermiso(dependencias, "/proyecto", "a", "documento", "todos")).toMatchObject({
      exito: true, valor: { esquema: 2, decision: "ask", motivoSinDecision: "sin-coincidencia", determinante: null },
    });
  });
  test("D-4 ficticio con orden y vocabulario propios atraviesa el caso de uso", () => {
    const dependencias = deps();
    dependencias.adaptador = { ...adaptadorFicticio, cadena: (_, agente) => ({ exito: true, valor: {
      agente, ejesParciales: [], reglas: [
        { indice: 0, sujeto: "documento", patron: "todos", efecto: "impedir", origen: { tipo: "nativo", regla: "base-ficticia" }, declaracion: null },
        { indice: 1, sujeto: "documento", patron: "todos", efecto: "conceder", origen: { tipo: "declarado", orden: 0,
          posicion: { linea: 1, columna: 1 } }, declaracion: null },
      ],
    } }) };
    const primera = consultarPermiso(dependencias, "/proyecto", "a", "documento", "todos");
    expect(primera).toMatchObject({ exito: true, valor: { decision: "conceder", nativaAnulada: { regla: 0, por: 1 } } });
    expect(JSON.stringify(consultarPermiso(dependencias, "/proyecto", "a", "documento", "todos"))).toBe(JSON.stringify(primera));
  });
  test("valida argumentos antes de leer y propaga errores de proyecto y cadena", () => {
    for (const [agente, sujeto, objetivo] of [["", "x", "y"], ["a", " ", "y"], ["a", "x", ""]]) {
      expect(consultarPermiso({ ...deps(), rutas: { canonica: () => { throw new Error("No leer"); } } },
        "/proyecto", agente!, sujeto!, objetivo!)).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
    }
    expect(consultarPermiso({ ...deps(), rutas: { canonica: () => null } }, "/ausente", "a", "x", "y"))
      .toMatchObject({ exito: false, error: { codigo: "proyecto-inexistente" } });
    expect(consultarPermiso({ ...deps(), adaptador: { ...adaptadorFicticio, cadena: () => ({ exito: false,
      error: { categoria: "uso", codigo: "cadena-incompleta", mensaje: "No disponible" } }) } }, "/proyecto", "a", "x", "y"))
      .toMatchObject({ exito: false, error: { codigo: "cadena-incompleta" } });
  });
});
