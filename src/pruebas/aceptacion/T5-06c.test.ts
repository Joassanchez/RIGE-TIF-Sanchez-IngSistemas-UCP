import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Manifiesto } from "../../herramientas/cobertura";
import { normalizarRutaTemporal } from "../../herramientas/decisiones-nativas/registro";
import { compararConCapturaNativa } from "../utilidades/comparacion-nativa";
import { consultarPermisos } from "../utilidades/permisos";

const escenarios = join(import.meta.dir, "../escenarios");
const casos = [
  { caso: "control-ordinario", git: "raiz", evaluado: "proyecto/sub/a.txt", aproximada: false },
  { caso: "core.worktree", git: "core.worktree", evaluado: "sub/a.txt", aproximada: true },
  { caso: "core.bare", git: "core.bare", evaluado: "<RAIZ>/proyecto/sub/a.txt", aproximada: true },
] as const;
function resolver(caso: typeof casos[number]) {
  return consultarPermisos([{ agente: "build", herramienta: "read", objetivo: "<RAIZ>/proyecto/sub/a.txt" }],
    "ultima", "global", `v5-worktree-${caso.caso}`, { git: caso.git });
}

describe("RF-07 CA-5 declaracion estructurada independiente de la decision", () => {
  for (const caso of casos) test(`${caso.caso} / read: declaracion de deteccion aproximada`, () => {
    const { respuestas: [respuesta] } = resolver(caso);
    expect(respuesta).toBeDefined();
    if (caso.aproximada) {
      expect(respuesta!.declaraciones).toContain("deteccion-git-aproximada");
      expect(respuesta!.reglas["deteccion-git-aproximada"]).toEqual(expect.any(String));
    } else expect(respuesta!.declaraciones).not.toContain("deteccion-git-aproximada");
  });
});

describe("RNF-02 CA-1 comparacion nativa sin fallback", () => {
  const manifiesto = JSON.parse(readFileSync(join(escenarios, "MANIFIESTO.json"), "utf8")) as Manifiesto;
  for (const caso of casos) {
    const id = `v5-worktree-${caso.caso}`;
    const escenario = manifiesto.escenarios.find(e => e.id === id);
    if (!escenario) throw new Error(`Escenario ausente: ${id}`);
    const consulta = escenario.consultas[0];
    if (!consulta) throw new Error(`Consulta ausente: ${id}`);
    const referencia = JSON.parse(readFileSync(join(escenarios, id, "REFERENCIA.json"), "utf8"));
    test(`T5-06c-c1 ${caso.caso}: capturas del ingeniero para ambas plataformas`, () => {
      expect(referencia.decisionesNativas.map((d: { procedencia: { plataforma: string } }) => d.procedencia.plataforma).sort())
        .toEqual(["linux-x64", "win32-x64"]);
    });
    for (const plataforma of ["win32-x64", "linux-x64"]) {
      compararConCapturaNativa({ caso: caso.caso === "core.worktree"
        ? "core.worktree: coincidencia o caracterizacion del limite declarado de ADR-101 W-B" : caso.caso,
        variante: "patron-relativo", consulta, referencia,
        evaluado: caso.evaluado, plataforma,
        ...(plataforma === `${process.platform}-${process.arch}` ? {} : {
          registrar: Object.assign((nombre: string) => test.todo(`${nombre}: ejecutar en su plataforma`, () => {}),
            { todo: (nombre: string) => test.todo(nombre, () => {}) }),
        }),
      }, nativa => {
        const { respuestas: [respuesta], raiz } = resolver(caso);
        const regla = respuesta!.cadena.find(r => r.indice === respuesta!.determinante);
        const obtenido = { decision: respuesta!.decision, regla: { sujeto: regla?.sujeto,
          patron: regla && normalizarRutaTemporal(regla.patron, raiz).replaceAll("\\", "/"), efecto: regla?.efecto } };
        const evaluado = normalizarRutaTemporal(respuesta!.consulta.objetivoEvaluado!, raiz).replaceAll("\\", "/");
        if (caso.caso === "core.worktree") {
          expect(respuesta!.declaraciones).toContain("deteccion-git-aproximada");
          expect(nativa).toEqual({ decision: "allow", regla: { sujeto: "read", patron: "sub/a.txt", efecto: "allow" } });
          if (obtenido.decision === nativa.decision) {
            expect(obtenido).toEqual(nativa);
            expect(evaluado).toBe(caso.evaluado);
          } else {
            expect(obtenido).toEqual({ decision: "deny", regla: { sujeto: "read", patron: "*", efecto: "deny" } });
            expect(evaluado).toBe("proyecto/sub/a.txt");
          }
        } else {
          expect(obtenido).toEqual(nativa);
          expect(evaluado).toBe(caso.evaluado);
        }
      });
    }
  }
});
