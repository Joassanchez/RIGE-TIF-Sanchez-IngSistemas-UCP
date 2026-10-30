import { expect, test } from "bun:test";
import { validarEsquema } from "./validar-esquema";

test("validador falla visiblemente ante keywords desconocidas incluso en ramas no visitadas", () => {
  for (const esquema of [{ type: "string", pattern: "x" },
    { anyOf: [{ type: "string" }, { type: "number", maximum: 0 }] },
    { type: "object", properties: { ausente: { format: "email" } } }]) {
    expect(() => validarEsquema(esquema, "x")).toThrow("no soportada");
  }
});

test("T3-03-c1 R-5 validador aplica minimum y condicionales de legibilidad", () => {
  const esquema = { type: "object", properties: { linea: { type: "integer", minimum: 1 } },
    allOf: [{ if: { properties: { legibilidad: { const: "ilegible" } }, required: ["legibilidad"] }, then: { required: ["error"] } }] };
  expect(validarEsquema(esquema, {})).toEqual([]);
  expect(validarEsquema(esquema, { linea: 1, legibilidad: "legible" })).toEqual([]);
  expect(validarEsquema(esquema, { linea: 0 }).length).toBeGreaterThan(0);
  expect(validarEsquema(esquema, { legibilidad: "ilegible" }).length).toBeGreaterThan(0);
  expect(validarEsquema(esquema, { legibilidad: "ilegible", error: {} })).toEqual([]);
});

test("validador soporta refs locales, arrays, enum, uniones y objetos cerrados", () => {
  const esquema = { $defs: { numero: { type: "integer" } }, type: "object", required: ["lista"],
    properties: { lista: { type: "array", items: { $ref: "#/$defs/numero" } }, opcion: { enum: ["a", "b"] } }, additionalProperties: false };
  expect(validarEsquema(esquema, { lista: [1, 2], opcion: "a" })).toEqual([]);
  for (const valor of [{ lista: ["1"] }, { lista: [1.1] }, { lista: [], opcion: "c" }, { lista: [], extra: 1 }, {}]) {
    expect(validarEsquema(esquema, valor).length).toBeGreaterThan(0);
  }
  expect(() => validarEsquema({ $ref: "externo.json" }, {})).toThrow();
  expect(() => validarEsquema({ $ref: "#/$defs/ausente" }, {})).toThrow();
  expect(validarEsquema({ oneOf: [{ type: "number" }, { type: "integer" }] }, 1).length).toBeGreaterThan(0);
});
