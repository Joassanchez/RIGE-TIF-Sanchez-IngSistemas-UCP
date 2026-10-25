import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { consultarPermisos } from "../utilidades/permisos";
import { consultarCadenas } from "../utilidades/cadenas";

interface Caso {
  id: string; agente: string; herramientas: string[]; objetivos: string[];
  decision: string | null; regla: { sujeto: string; patron: string; efecto: string } | null;
  origen?: "declarado" | "nativo"; motivoSinDecision?: string;
}
function referencia(nombre: string) {
  return JSON.parse(readFileSync(join(import.meta.dir, "../escenarios", nombre, "REFERENCIA.json"), "utf8")) as { decisiones: Caso[] };
}
const escenarios = ["v2-ruta-bloqueo", "v2-ruta-env", "v2-ruta-exposicion"];

describe("RF-02 CA-9", () => {
  for (const id of "abcdefghi") {
    test(`${id}: absoluta y relativa conservan decision, determinante y procedencia`, () => {
      for (const escenario of escenarios) for (const caso of referencia(escenario).decisiones.filter(c => c.id === id)) {
        for (const rutasNativas of process.platform === "win32" ? [false, true] : [false]) {
          const consultas = caso.herramientas.flatMap(herramienta => caso.objetivos.flatMap(objetivo => [
            { agente: caso.agente, herramienta, objetivo },
            { agente: caso.agente, herramienta, objetivo: `<RAIZ>/proyecto/${objetivo}` },
          ]));
          const { respuestas, raiz } = consultarPermisos(consultas, "ultima", "global", escenario, { git: "proyecto", rutasNativas });
          for (let i = 0; i < respuestas.length; i += 2) {
            const relativa = respuestas[i]!, absoluta = respuestas[i + 1]!;
            const consulta = consultas[i]!;
            expect(relativa.decision).toBe(caso.decision);
            expect(absoluta.decision).toBe(caso.decision);
            expect(absoluta.determinante).toBe(relativa.determinante);
            expect(absoluta.cadena).toEqual(relativa.cadena);
            const evaluado = relative(join(raiz, "proyecto"), resolve(raiz, "proyecto", consulta.objetivo));
            expect(relativa.consulta).toMatchObject({ forma: "herramienta", herramienta: consulta.herramienta,
              sujeto: consulta.herramienta === "read" ? "read" : "edit",
              objetivoEvaluado: consulta.herramienta === "apply_patch" ? evaluado.replaceAll("\\", "/") : evaluado });
            expect(absoluta.consulta.objetivoEvaluado).toBe(relativa.consulta.objetivoEvaluado);
            if (caso.decision === null) {
              expect(relativa).toMatchObject({ motivoSinDecision: "fuera-del-arbol", determinante: null, cadena: [] });
              expect(absoluta.motivoSinDecision).toBe("fuera-del-arbol");
              continue;
            }
            const determinante = relativa.cadena.find(r => r.indice === relativa.determinante)!;
            expect(caso.regla).not.toBeNull();
            expect(determinante).toMatchObject(caso.regla!);
            expect(determinante.origen.tipo).toBe(caso.origen ?? "declarado");
            if (determinante.declaracion) {
              expect(determinante.declaracion.referencia).toBe(`${raiz}/proyecto/opencode.jsonc`);
              expect(determinante.declaracion.origen).toMatchObject({ tipo: "declarado", posicion: { linea: expect.any(Number), columna: expect.any(Number) } });
            }
          }
        }
      }
    });
  }
  test("j: repo valido, HEAD sintetico y sin VCS reproducen el binario; plan usa el mismo worktree", () => {
    for (const [escenario, git] of [["v2-worktree-valido", "proyecto"], ["v2-worktree-sintetico", "sintetico"], ["v2-worktree-sin-vcs", "ninguno"]] as const) {
      const caso = referencia(escenario).decisiones[0]!;
      const { respuestas, raiz } = consultarPermisos([
        { agente: "build", herramienta: "read", objetivo: "src/a.js" },
        { agente: "build", herramienta: "read", objetivo: "<RAIZ>/proyecto/src/a.js" },
      ], "ultima", "global", escenario, { git });
      for (const respuesta of respuestas) {
        expect(respuesta.decision).toBe(caso.decision);
        expect(respuesta.cadena.find(r => r.indice === respuesta.determinante)).toMatchObject(caso.regla!);
        expect(respuesta.consulta.objetivoEvaluado).toBe(relative(git === "proyecto" ? join(raiz, "proyecto") : "/", join(raiz, "proyecto/src/a.js")));
      }
      const { referencia: ref, cadenas, normalizar } = consultarCadenas(escenario);
      expect(Object.keys(ref.cadenas)).toEqual(["build", "plan"]);
      for (const [agente, esperada] of Object.entries(ref.cadenas)) {
        expect(normalizar(cadenas[agente]!.reglas.map(r => ({ permission: r.sujeto, pattern: r.patron, action: r.efecto })))).toEqual(esperada);
      }
    }
  });
  test("consulta por sujeto conserva literalmente una ruta absoluta", () => {
    const { respuestas: [respuesta], raiz } = consultarPermisos([
      { agente: "a", sujeto: "read", objetivo: "<RAIZ>/proyecto/src/productos.js" },
    ], "ultima", "global", "v2-ruta-bloqueo", { git: "proyecto" });
    expect(respuesta).toMatchObject({ decision: "allow", consulta: { forma: "sujeto" } });
    expect(respuesta!.consulta.objetivoEvaluado!.replaceAll("\\", "/")).toBe(`${raiz}/proyecto/src/productos.js`);
  });
});
