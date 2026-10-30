import { describe, expect, test } from "bun:test";
import { decisionNativa, oraculoDecision } from "./decision-nativa";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { DecisionNativa } from "../../herramientas/decisiones-nativas/registro";

describe("T2-14 preferencia del oraculo", () => {
  test("prefiere regla nativa aunque contradiga la derivada y conserva fallback solo sin evaluacion", () => {
    const consulta = { agente: "build", sujeto: "read", objetivo: "src/a.js" };
    const nativa = { consulta: "q", ...consulta, evaluaciones: [{ sujeto: "read", patronEvaluado: "src\\a.js", regla: { permission: "read", pattern: "*", action: "deny" } }] };
    const referencia = { decisiones: [{ ...consulta, decision: "allow" }], decisionesNativas: [nativa] };
    expect(decisionNativa(referencia, consulta, "src/a.js")).toEqual({ decision: "deny", regla: { sujeto: "read", patron: "*", efecto: "deny" } });
    expect(decisionNativa({}, consulta, "src/a.js")).toBeNull();
    expect(decisionNativa({ decisionesNativas: [{ ...nativa, evaluaciones: [], herramientaNoOfrecida: true }] }, consulta, "src/a.js")).toBeNull();
    expect(() => decisionNativa({ decisionesNativas: [{ ...nativa, evaluaciones: [] }] }, consulta, "src/a.js")).toThrow("sin evaluacion");
    expect(decisionNativa({ decisionesNativas: [{ ...nativa, procedencia: { plataforma: "otra" } }] }, consulta, "src/a.js")).toBeNull();
    expect(decisionNativa(referencia, { ...consulta, lanzadoPor: "plan" }, "src/a.js")).toBeNull();
  });
  test("X-1 Linux usa la derivada ante una captura win32-x64, con plataforma inyectada", () => {
    const consulta = { agente: "build", sujeto: "read", objetivo: "a" };
    const referencia = { decisionesNativas: [{ ...consulta, procedencia: { plataforma: "win32-x64" },
      evaluaciones: [{ sujeto: "read", patronEvaluado: "a", regla: { permission: "read", pattern: "*", action: "allow" } }] }] };
    expect(decisionNativa(referencia, consulta, "a", undefined, "linux-x64")).toBeNull();
    expect(oraculoDecision(referencia, consulta, "linux-x64")).toBe("derivada");
    expect(oraculoDecision(referencia, consulta, "win32-x64")).toBe("nativa win32-x64");
    expect(decisionNativa(referencia, consulta, "a", undefined, "win32-x64")).toMatchObject({ decision: "allow" });
  });
});

// Compara dos oraculos registrados, sin ejecutar el evaluador de RIGE ni vendor.
describe("X-1 derivadas validadas contra nativa win32-x64", () => {
  const directorio = join(import.meta.dir, "../escenarios");
  for (const archivo of new Bun.Glob("*/REFERENCIA.json").scanSync({ cwd: directorio })) {
    const referencia = JSON.parse(readFileSync(join(directorio, archivo), "utf8"));
    for (const registro of (referencia.decisionesNativas ?? []) as DecisionNativa[]) {
      if (registro.herramientaNoOfrecida) continue;
      test(`${archivo}: ${registro.consulta}, decision y determinante`, () => {
        const derivada = referencia.decisiones.find((d: any) => d.agente === registro.agente
          && d.lanzadoPor === registro.lanzadoPor && (d.objetivo === registro.objetivo || d.objetivos?.includes(registro.objetivo))
          && (d.sujeto === registro.sujeto || d.herramientas?.includes(registro.herramienta)));
        expect(derivada).toBeDefined();
        const evaluacion = registro.evaluaciones.find(e => e.sujeto === registro.sujeto)!;
        const nativa = decisionNativa(referencia, { ...registro, objetivo: registro.objetivo! }, evaluacion.patronEvaluado,
          undefined, registro.procedencia!.plataforma)!;
        const regla = derivada.regla ?? (() => {
          const r = referencia.cadenas[derivada.agente][derivada.determinante];
          return { sujeto: r.permission, patron: r.pattern, efecto: r.action };
        })();
        expect(nativa).toEqual({ decision: derivada.decision, regla });
      });
    }
  }
});
