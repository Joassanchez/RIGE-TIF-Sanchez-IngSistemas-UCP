import { describe, expect, test } from "bun:test";
import { decidir } from "./decidir";
import type { Cadena, ReglaCadena } from "../resolucion/tipos";

const regla = (indice: number, efecto: string, declarada = false): ReglaCadena => ({
  indice, sujeto: "documento", patron: "todos", efecto,
  origen: declarada ? { tipo: "declarado", orden: 0, posicion: { linea: 3, columna: 1 } }
    : { tipo: "nativo", regla: "base" }, declaracion: null,
});
const cadena = (reglas: readonly ReglaCadena[]): Cadena => ({ agente: "perfil", reglas, ejesParciales: [] });
const politica = { ordenEfectos: ["impedir", "consultar", "conceder"], efectoPorDefecto: "consultar", declaraciones: ["limite"] };
const consulta = { sujeto: "documento", objetivo: "a" };

describe("T2-06 rastro generico", () => {
  test("T2-11b K-2 motivo previo prevalece y el nucleo es dueno de sin decision", () => {
    expect(decidir(cadena([regla(0, "conceder")]), consulta,
      { ...politica, determinante: 0, coincidentes: [0] }, "no-analizable")).toMatchObject({
      decision: null, motivoSinDecision: "no-analizable", coincidentes: [], determinante: null,
      consulta: { objetivoEvaluado: "a" },
    });
  });
  test("D-1 sin coincidencia conserva el efecto por defecto, sin determinante", () => {
    expect(decidir(cadena([]), consulta, { ...politica, determinante: null, coincidentes: [] })).toEqual({
      agente: "perfil", consulta: { ...consulta, objetivoEvaluado: "a" }, decision: "consultar",
      motivoSinDecision: "sin-coincidencia", coincidentes: [], determinante: null, desplazadas: [],
      nativaAnulada: null, advertencias: [], declaraciones: ["limite"],
    });
  });
  test("D-2 eje parcial no informa decision ni objetivo evaluado", () => {
    expect(decidir({ ...cadena([]), ejesParciales: ["documento"] }, consulta,
      { ...politica, determinante: null, coincidentes: [] })).toMatchObject({
      decision: null, motivoSinDecision: "eje-parcialmente-observado", consulta: { objetivoEvaluado: null }, declaraciones: ["limite"],
    });
  });
  test("D-4 orden opaco: conserva indices completos y elige la ultima proteccion nativa anulada", () => {
    const reglas = [regla(0, "impedir"), regla(1, "conceder"), regla(2, "consultar"), regla(3, "conceder", true)];
    const rastro = decidir(cadena(reglas), consulta, { ...politica, determinante: 3, coincidentes: [0, 2, 3] });
    expect(rastro).toMatchObject({ decision: "conceder", determinante: 3, desplazadas: [0, 2],
      nativaAnulada: { regla: 2, por: 3 }, advertencias: ["proteccion-nativa-anulada"] });
    expect(rastro.coincidentes).toEqual([reglas[0]!, reglas[2]!, reglas[3]!]);
    expect(reglas[3]!.indice).toBe(3);
  });
  test.each([
    ["impedir", "consultar", true, true], ["impedir", "conceder", true, true],
    ["consultar", "conceder", true, true], ["conceder", "impedir", true, false],
    ["consultar", "consultar", true, false], ["impedir", "conceder", false, false],
  ] as const)("anulacion %s -> %s, declarada=%s", (antes, despues, declarada, advertir) => {
    const rastro = decidir(cadena([regla(0, antes), regla(1, despues, declarada)]), consulta,
      { ...politica, determinante: 1, coincidentes: [0, 1] });
    expect(rastro.nativaAnulada).toEqual(advertir ? { regla: 0, por: 1 } : null);
  });
});
