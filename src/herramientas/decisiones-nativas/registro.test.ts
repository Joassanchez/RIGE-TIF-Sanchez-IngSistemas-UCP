import { expect, test } from "bun:test";
import { extraerEvaluaciones, normalizarEvaluaciones } from "./registro";
import { join, relative, resolve } from "node:path";

test("O-1 normaliza rutas temporales nativas y con barras antes de comparar", () => {
  const evaluaciones = extraerEvaluaciones('level=INFO message=evaluated permission=read pattern="C:\\\\temporal\\\\copia\\\\a.js" action.permission=read action.pattern=C:/temporal/copia/* action.action=allow\r\n');
  expect(normalizarEvaluaciones(evaluaciones, "C:\\temporal\\copia")).toEqual([
    { sujeto: "read", patronEvaluado: "<RAIZ>\\a.js", regla: { permission: "read", pattern: "<RAIZ>/*", action: "allow" } },
  ]);
  expect(() => extraerEvaluaciones("message=evaluated permission=read")).toThrow("incompleto");
  expect(() => extraerEvaluaciones("message=evaluated permission=read pattern=* action.permission=read action.pattern=* action.action=unknown")).toThrow("desconocida");
  const raiz = resolve("temporal/copia");
  const sinVcs = { sujeto: "read", patronEvaluado: relative("/", join(raiz, "proyecto/a.js")), regla: { permission: "read", pattern: "*", action: "allow" } };
  expect(normalizarEvaluaciones([sinVcs], raiz)[0]!.patronEvaluado.replaceAll("\\", "/")).toBe("<RAIZ>/proyecto/a.js");
});
