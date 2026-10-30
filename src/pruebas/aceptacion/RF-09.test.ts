import { describe, expect, test } from "bun:test";
import { consultarPermisos } from "../utilidades/permisos";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { consultarCadenas, type ReferenciaCadenas } from "../utilidades/cadenas";
import type { DecisionNativa } from "../../herramientas/decisiones-nativas/registro";

const escenario = "v3-proteccion-env";
const lecturas = [".env", ".env.example"].map(objetivo => ({ agente: "build", herramienta: "read", objetivo }));
const consultarLecturas = () => consultarPermisos(lecturas, "ultima", "global", escenario, { git: "proyecto" }).respuestas;

const consulta = [{ agente: "plan", sujeto: "edit", objetivo: "src/a.js" }];
function comprobarProteccion(r: ReturnType<typeof consultarPermisos>["respuestas"][number]) {
  expect(r.decision).toBe("allow");
  expect(r.nativaAnulada).not.toBeNull();
  expect(r.advertencias).toEqual(["proteccion-nativa-anulada"]);
  const nativa = r.cadena.find(regla => regla.indice === r.nativaAnulada!.regla)!;
  expect(nativa).toMatchObject({ sujeto: "edit", patron: "*", efecto: "deny", origen: { tipo: "nativo", regla: "nativa-agente" } });
  const declarada = r.cadena.find(regla => regla.indice === r.nativaAnulada!.por)!;
  expect(declarada).toMatchObject({ efecto: "allow", origen: { tipo: "declarado", posicion: { linea: 4, columna: 5 } },
    declaracion: { via: "global" } });
  expect(declarada.declaracion!.referencia).toEndWith("/hogar/.config/opencode/opencode.json");
  expect(r.reglas[r.advertencias[0]!]).toBeTruthy();
}
describe("T3-02 R-5", () => {
  describe("RF-09 CA-1", () => {
    test("edit allow global anula la proteccion nativa de plan con archivo y linea", () => {
      comprobarProteccion(consultarPermisos(consulta).respuestas[0]!);
    });
  });
  describe("RF-09 CA-2", () => {
    test("build sin edit declarado y bash deny no anulan protecciones", () => {
      const { respuestas } = consultarPermisos([
        { agente: "build", sujeto: "edit", objetivo: "src/a.js" },
        { agente: "build", sujeto: "bash", objetivo: "git status" },
      ], "ultima", "sin-edit");
      expect(respuestas[0]).toMatchObject({ decision: "allow", determinante: 0, nativaAnulada: null, advertencias: [] });
      expect(respuestas[0]!.cadena[0]).toMatchObject({ sujeto: "*", origen: { tipo: "nativo" }, declaracion: null });
      expect(respuestas[1]).toMatchObject({ decision: "deny", nativaAnulada: null, advertencias: [] });
    });
  });
});

describe("RF-09 CA-3 (patrón declarado)", () => {
  test("R-M2 read *.env allow debilita la confirmacion nativa", () => {
    const { respuestas: [r] } = consultarPermisos([{ agente: "build", herramienta: "read", objetivo: ".env" }]);
    expect(r).toMatchObject({ decision: "allow", advertencias: ["proteccion-nativa-anulada"] });
    const nativa = r!.cadena.find(regla => regla.indice === r!.nativaAnulada!.regla)!;
    const declarada = r!.cadena.find(regla => regla.indice === r!.nativaAnulada!.por)!;
    expect(nativa).toMatchObject({ sujeto: "read", patron: "*.env", efecto: "ask", origen: { tipo: "nativo" } });
    expect(declarada).toMatchObject({ sujeto: "read", patron: "*.env", efecto: "allow", declaracion: { via: "global" } });
  });
});

describe("RF-09 CA-3", () => {
  describe("T3-02 R-2", () => {
    test("read allow global debilita la proteccion de .env con archivo y posicion", () => {
      const r = consultarLecturas()[0]!;
      expect(r).toMatchObject({ decision: "allow", advertencias: ["proteccion-nativa-anulada"] });
      const nativa = r.cadena.find(regla => regla.origen.tipo === "nativo" && regla.sujeto === "read" && regla.patron === "*.env")!;
      const declarada = r.cadena.find(regla => regla.indice === r.determinante)!;
      expect(nativa.efecto).toBe("ask");
      expect(r.nativaAnulada).toEqual({ regla: 9, por: 14 });
      expect(declarada).toMatchObject({ sujeto: "read", patron: "*", efecto: "allow",
        origen: { tipo: "declarado", posicion: { linea: 3, columna: 5 } }, declaracion: { via: "global" } });
      expect(declarada.declaracion!.referencia).toEndWith("/hogar/.config/opencode/opencode.json");
    });
  });
});

describe("RF-09 CA-2", () => {
  describe("T3-02 R-3", () => {
    test(".env.example conserva la ultima nativa allow sin advertencia", () => {
      const r = consultarLecturas()[1]!;
      expect(r).toMatchObject({ decision: "allow", nativaAnulada: null, advertencias: [] });
      expect(r.cadena.filter(regla => r.desplazadas.includes(regla.indice) && regla.origen.tipo === "nativo").at(-1))
        .toMatchObject({ sujeto: "read", patron: "*.env.example", efecto: "allow" });
    });
  });
});

describe("T3-02 R-4", () => {
  test("decisiones, ganadoras y cadena build coinciden con el binario", () => {
    const referencia = JSON.parse(readFileSync(join(import.meta.dir, "../escenarios", escenario, "REFERENCIA.json"), "utf8")) as
      ReferenciaCadenas & { decisionesNativas: DecisionNativa[] };
    expect(referencia.decisionesNativas).toHaveLength(2);
    for (const [i, r] of consultarLecturas().entries()) {
      const registro = referencia.decisionesNativas.find(d => d.consulta === `q${i}-read-${lecturas[i]!.objetivo}`)!;
      const evaluacionNativa = registro.evaluaciones.find(e => e.sujeto === "read" && e.patronEvaluado === lecturas[i]!.objetivo)!;
      expect(evaluacionNativa.regla.action).toBe("allow");
      expect(r.decision).toBe(evaluacionNativa.regla.action);
      expect(r.cadena.find(regla => regla.indice === r.determinante)).toMatchObject({
        sujeto: evaluacionNativa.regla.permission, patron: evaluacionNativa.regla.pattern, efecto: evaluacionNativa.regla.action,
      });
    }
    const { cadenas, normalizar } = consultarCadenas(escenario);
    expect(normalizar(cadenas.build!.reglas.map(r => ({ permission: r.sujeto, pattern: r.patron, action: r.efecto }))))
      .toEqual(referencia.cadenas.build);
  });
});
describe("T2-06 D-3 sensibilidad RF-09 CA-1", () => {
  test("primera coincidencia no satisface la aceptacion de anulacion nativa", () => {
    expect(() => comprobarProteccion(consultarPermisos(consulta, "primera").respuestas[0]!)).toThrow();
  });
});
