import { describe, expect, test } from "bun:test";
import { compararConCapturaNativa, type RegistroComparacion } from "./comparacion-nativa";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { borrarTemporal } from "./borrar-temporal";
import { crearEntornoAislado } from "./entorno-aislado";

describe("T5-06a A-a5 comparacion sin fallback", () => {
  const consulta = { id: "lectura", agente: "build", sujeto: "read", objetivo: "a", herramienta: "read" };
  const captura = { consulta: consulta.id, ...consulta, evaluaciones: [
    { sujeto: "read", patronEvaluado: "a", regla: { permission: "read", pattern: "*", action: "deny" } },
  ], procedencia: { plataforma: "linux-x64", version: "1.18.25" } };
  function registrar(registros: unknown[]) {
    const pendientes: string[] = [];
    const pruebas: { nombre: string; ejecutar: () => void | Promise<void> }[] = [];
    const registro: RegistroComparacion = Object.assign((nombre: string, ejecutar: () => void | Promise<void>) => { pruebas.push({ nombre, ejecutar }); },
      { todo: (nombre: string) => { pendientes.push(nombre); } });
    const comparar = (decision: { decision: string }) => { expect(decision.decision).toBe("deny"); };
    compararConCapturaNativa({ caso: "subdirectorio", variante: "absoluta", consulta,
      referencia: { decisionesNativas: registros }, evaluado: "a", plataforma: "linux-x64", registrar: registro }, comparar);
    return { pendientes, pruebas };
  }
  test("ausencia de plataforma o consulta registra todo identificado, sin ejecutar una comparacion derivada", () => {
    for (const registros of [[], [{ ...captura, procedencia: { ...captura.procedencia, plataforma: "win32-x64" } }],
      [{ ...captura, consulta: "otra" }]]) {
      const r = registrar(registros);
      expect(r.pruebas).toEqual([]);
      expect(r.pendientes).toHaveLength(1);
      for (const dato of ["subdirectorio", "read", "absoluta", "linux-x64"]) expect(r.pendientes[0]).toContain(dato);
    }
  });
  test("la captura exacta se compara y prevalece sobre la de otra plataforma y cualquier decision derivada", async () => {
    const windows = { ...captura, evaluaciones: [], procedencia: { ...captura.procedencia, plataforma: "win32-x64" } };
    const r = registrar([windows, captura]);
    expect(r.pendientes).toEqual([]);
    expect(r.pruebas).toHaveLength(1);
    await r.pruebas[0]!.ejecutar();
  });
  test("captura presente incompleta, inconsistente o herramienta no ofrecida falla, nunca todo", () => {
    for (const cambios of [{ herramientaNoOfrecida: true }, { evaluaciones: [] }, { evaluaciones: undefined },
      { sujeto: "edit" }, { objetivo: "otro" }, { herramienta: "write" }, { agente: "plan" },
      { procedencia: { plataforma: "linux-x64", version: "1.18.24" } }, { procedencia: { plataforma: "linux-x64" } },
      { procedencia: undefined }, { evaluaciones: [{ ...captura.evaluaciones[0], patronEvaluado: "otro" }] },
      { evaluaciones: [{ ...captura.evaluaciones[0], sujeto: "edit" }] },
      { evaluaciones: [{ sujeto: "read", patronEvaluado: "a", regla: { permission: "read", action: "allow" } }] },
      { evaluaciones: [{ sujeto: "read", patronEvaluado: "a", regla: { permission: "read", pattern: "*", action: "invalida" } }] },
      { evaluaciones: [{ sujeto: "read", patronEvaluado: "a", regla: { permission: "bash", pattern: "*", action: "deny" } }] }]) {
      const r = registrar([{ ...captura, ...cambios }]);
      expect(r.pendientes).toEqual([]);
      expect(r.pruebas).toHaveLength(1);
      expect(r.pruebas[0]!.ejecutar).toThrow();
    }
    const duplicada = registrar([captura, captura]);
    expect(duplicada.pruebas[0]!.ejecutar).toThrow();
    const contradictoria = registrar([{ ...captura, evaluaciones: [...captura.evaluaciones,
      { sujeto: "read", patronEvaluado: "a", regla: { permission: "read", pattern: "*", action: "allow" } }] }]);
    expect(contradictoria.pruebas[0]!.ejecutar).toThrow();
  });
  test("bun test registra todo real ante ausencia, y falla ante captura incompleta o diferencia", () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-comparacion-nativa-"));
    try {
      for (const [registros, codigo, patron] of [[[], 0, /1 todo/], [[captura], 0, /1 pass/],
        [[{ ...captura, evaluaciones: [] }], 1, /1 fail/], [[{ ...captura, sujeto: "edit" }], 1, /1 fail/],
        [[{ ...captura, evaluaciones: [{ sujeto: "read", patronEvaluado: "a", regla: { permission: "read", pattern: "*", action: "allow" } }] }], 1, /1 fail/]] as const) {
        const archivo = join(temporal, "comparacion.test.ts");
        writeFileSync(archivo, `import { compararConCapturaNativa } from ${JSON.stringify(join(import.meta.dir, "comparacion-nativa.ts"))};
          import { expect } from "bun:test";
          compararConCapturaNativa({caso:"subdirectorio",variante:"absoluta",consulta:${JSON.stringify(consulta)},
            referencia:{decisionesNativas:${JSON.stringify(registros)}},evaluado:"a",plataforma:"linux-x64"},
            decision=>expect(decision.decision).toBe("deny"));`);
        const r = Bun.spawnSync([process.execPath, "test", archivo], { cwd: temporal,
          env: crearEntornoAislado(temporal, process.env), stdout: "pipe", stderr: "pipe", timeout: 15000 });
        expect(r.exitCode).toBe(codigo);
        expect(r.stdout.toString() + r.stderr.toString()).toMatch(patron);
      }
    } finally { borrarTemporal(temporal); }
  });
});
