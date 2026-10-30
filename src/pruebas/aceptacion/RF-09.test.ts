import { describe, expect, test } from "bun:test";
import { consultarPermisos } from "../utilidades/permisos";

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
describe("RF-09 CA-1", () => {
  test("edit allow global anula la proteccion nativa de plan con archivo y linea", () => {
    comprobarProteccion(consultarPermisos(consulta).respuestas[0]!);
  });
});
describe("RF-09 CA-2", () => {
  test("R-M2 read .env ask superada por allow no anula una denegacion nativa", () => {
    const { respuestas: [r] } = consultarPermisos([{ agente: "build", herramienta: "read", objetivo: ".env" }]);
    expect(r).toMatchObject({ decision: "allow", nativaAnulada: null, advertencias: [] });
    expect(r!.cadena.some(regla => regla.origen.tipo === "nativo" && regla.efecto === "ask")).toBe(true);
  });
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
describe("T2-06 D-3 sensibilidad RF-09 CA-1", () => {
  test("primera coincidencia no satisface la aceptacion de anulacion nativa", () => {
    expect(() => comprobarProteccion(consultarPermisos(consulta, "primera").respuestas[0]!)).toThrow();
  });
});
