import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { rolCambio, rolCeldaMatriz, rolEfecto, rolOrigen, type RolPresentacion } from "./roles";

const rolesValidos: ReadonlySet<RolPresentacion> = new Set([
  "permitida",
  "pregunta",
  "denegada",
  "rige",
  "declarado",
  "nativo",
  "desplazado",
  "parcial",
  "estructura",
  "pista",
]);

const raizEsquemas = resolve(import.meta.dir, "../../../../esquemas/salida");
const leerEsquema = (archivo: string) =>
  JSON.parse(readFileSync(join(raizEsquemas, archivo), "utf8")) as Record<string, unknown>;

describe("T6-07 L-3 roles de presentación", () => {
  test("cada origen del contrato tiene un rol válido y distinto de pista", () => {
    const valores = leerEsquema("valores.json") as {
      $defs: { Origen: { anyOf: Array<{ properties: { tipo: { const?: string; enum?: string[] } } }> } };
    };
    const tiposOrigen = valores.$defs.Origen.anyOf.flatMap(op =>
      op.properties.tipo.const ? [op.properties.tipo.const] : (op.properties.tipo.enum ?? [])
    );
    expect(tiposOrigen.length).toBeGreaterThan(0);
    for (const tipo of tiposOrigen) {
      const rol = rolOrigen(tipo);
      expect(rolesValidos.has(rol)).toBe(true);
      expect(rol).not.toBe("pista");
      expect(rolOrigen({ tipo })).toBe(rol);
    }

    const agentes = leerEsquema("agentes.json") as {
      properties: { agentes: { items: { properties: { origen: { enum: string[] } } } } };
    };
    for (const origen of agentes.properties.agentes.items.properties.origen.enum) {
      const rol = rolOrigen(origen);
      expect(rolesValidos.has(rol)).toBe(true);
      expect(rol).not.toBe("pista");
    }
    expect(rolOrigen(null)).toBe("pista");
    expect(rolOrigen("desconocido")).toBe("pista");
  });

  test("cada tipo de cambio del contrato tiene un rol válido y distinto de pista", () => {
    const comparacion = leerEsquema("comparacion.json") as {
      $defs: { Cambio: { properties: { tipo: { enum: string[] } } } };
    };
    const tiposCambio = comparacion.$defs.Cambio.properties.tipo.enum;
    expect(tiposCambio.length).toBeGreaterThan(0);
    for (const tipo of tiposCambio) {
      const rol = rolCambio(tipo);
      expect(rolesValidos.has(rol)).toBe(true);
      expect(rol).not.toBe("pista");
    }
    expect(rolCambio(null)).toBe("pista");
    expect(rolCambio("desconocido")).toBe("pista");
  });

  test("cada efecto del contrato tiene un rol válido y distinto de pista", () => {
    for (const efecto of ["allow", "ask", "deny"]) {
      const rol = rolEfecto(efecto);
      expect(rolesValidos.has(rol)).toBe(true);
      expect(rol).not.toBe("pista");
    }
    expect(rolEfecto(null)).toBe("pista");
    expect(rolEfecto(undefined)).toBe("pista");
  });

  test("T6-23 I-1 rolCeldaMatriz distingue efecto, eje parcial y sin decision", () => {
    expect(rolCeldaMatriz("allow", null)).toBe("permitida");
    expect(rolCeldaMatriz("ask", null)).toBe("pregunta");
    expect(rolCeldaMatriz("deny", null)).toBe("denegada");
    expect(rolCeldaMatriz(null, "eje-parcialmente-observado")).toBe("parcial");
    expect(rolCeldaMatriz(null, null)).toBe("pista");
    expect(rolCeldaMatriz(null, "otro-motivo")).toBe("pista");
    expect(rolCeldaMatriz("allow", "eje-parcialmente-observado")).toBe("permitida");
  });
});
