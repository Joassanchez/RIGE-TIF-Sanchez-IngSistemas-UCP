import { describe, expect, test } from "bun:test";
import { decisionNativa } from "./decision-nativa";

describe("T2-14 preferencia del oraculo", () => {
  test("prefiere regla nativa aunque contradiga la derivada y conserva fallback solo sin evaluacion", () => {
    const consulta = { agente: "build", sujeto: "read", objetivo: "src/a.js" };
    const nativa = { consulta: "q", ...consulta, evaluaciones: [{ sujeto: "read", patronEvaluado: "src\\a.js", regla: { permission: "read", pattern: "*", action: "deny" } }] };
    const referencia = { decisiones: [{ ...consulta, decision: "allow" }], decisionesNativas: [nativa] };
    expect(decisionNativa(referencia, consulta, "src/a.js")).toEqual({ decision: "deny", regla: { sujeto: "read", patron: "*", efecto: "deny" } });
    expect(decisionNativa({}, consulta, "src/a.js")).toBeNull();
    expect(decisionNativa({ decisionesNativas: [{ ...nativa, evaluaciones: [], herramientaNoOfrecida: true }] }, consulta, "src/a.js")).toBeNull();
    expect(() => decisionNativa({ decisionesNativas: [{ ...nativa, evaluaciones: [] }] }, consulta, "src/a.js")).toThrow("sin evaluacion");
    expect(() => decisionNativa({ decisionesNativas: [{ ...nativa, procedencia: { plataforma: "otra" } }] }, consulta, "src/a.js")).toThrow("plataforma");
    expect(decisionNativa(referencia, { ...consulta, lanzadoPor: "plan" }, "src/a.js")).toBeNull();
  });
});
