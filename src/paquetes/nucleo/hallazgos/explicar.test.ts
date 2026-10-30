import { describe, expect, test } from "bun:test";
import { explicarHallazgo } from "./explicar";
import type { Hallazgo } from "./tipos";

const base: Hallazgo = { tipo: "entrada-ilegible", causa: "sintaxis-invalida", entrada: {
  orden: 0, via: "archivo", referencia: "/p/a.json", condicion: "observada" },
  posicion: { linea: 2, columna: 3 }, clave: ["permission", "read", "/abs/src/productos.js"], parametros: {} };
describe("T3-05 R-9", () => {
  test("falla por plantilla o marcador sin valor y no sustituye parametros recursivamente", () => {
    expect(() => explicarHallazgo(base, {})).toThrow();
    expect(() => explicarHallazgo(base, { "sintaxis-invalida": "{ausente}" })).toThrow();
    expect(() => explicarHallazgo({ ...base, clave: null }, { "sintaxis-invalida": "{clave}" })).toThrow();
    expect(explicarHallazgo({ ...base, parametros: { agente: "{entrada}" } }, { "sintaxis-invalida": "{agente} {entrada} {posicion} {clave}" }))
      .toBe('{entrada} /p/a.json 2:3 permission.read["/abs/src/productos.js"]');
  });
  test("representa segmentos especiales mediante JSON entre corchetes", () => {
    expect(explicarHallazgo({ ...base, clave: ["raiz", "a.b", "*", "dos palabras", 'una"comilla'] }, { "sintaxis-invalida": "{clave}" }))
      .toBe('raiz["a.b"]["*"]["dos palabras"]["una\\"comilla"]');
  });
});
