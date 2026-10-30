import { describe, expect, test } from "bun:test";
import { parse } from "node:path";
import { extraerEvaluaciones, normalizarEvaluaciones } from "./registro";

test("O-1 normaliza rutas temporales nativas y con barras antes de comparar", () => {
  const evaluaciones = extraerEvaluaciones('level=INFO message=evaluated permission=read pattern="C:\\\\temporal\\\\copia\\\\a.js" action.permission=read action.pattern=C:/temporal/copia/* action.action=allow\r\n');
  expect(normalizarEvaluaciones(evaluaciones, "C:\\temporal\\copia")).toEqual([
    { sujeto: "read", patronEvaluado: "<RAIZ>\\a.js", regla: { permission: "read", pattern: "<RAIZ>/*", action: "allow" } },
  ]);
  expect(() => extraerEvaluaciones("message=evaluated permission=read")).toThrow("incompleto");
  expect(() => extraerEvaluaciones("message=evaluated permission=read pattern=* action.permission=read action.pattern=* action.action=unknown")).toThrow("desconocida");
});

describe("T2-19 R-7", () => {
  test("normaliza la forma relativa a la unidad de la copia donde corre el binario", () => {
    const unidad = parse(process.cwd()).root[0]?.toUpperCase() === "Z" ? "Y:" : "Z:";
    const raiz = process.platform === "win32" ? `${unidad}\\temporal\\copia` : "/temporal/copia";
    for (const patronEvaluado of ["temporal/copia/proyecto/a.js", ...(process.platform === "win32" ? ["temporal\\copia\\proyecto\\a.js"] : [])]) {
      const sinVcs = { sujeto: "read", patronEvaluado, regla: { permission: "read", pattern: "*", action: "allow" } };
      expect(normalizarEvaluaciones([sinVcs], raiz)[0]!.patronEvaluado.replaceAll("\\", "/")).toBe("<RAIZ>/proyecto/a.js");
    }
  });
});
