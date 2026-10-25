import { describe, expect, test } from "bun:test";
import { evaluar } from "./permisos";
import type { ReglaCadena } from "@rige/nucleo/resolucion/tipos";

const reglas: ReglaCadena[] = ["*", "*.env", "*.env"].map((patron, indice) => ({
  indice, sujeto: "read", patron, efecto: indice === 1 ? "ask" : "allow",
  origen: { tipo: "nativo", regla: "prueba" }, declaracion: null,
}));

describe("T2-06 evaluador", () => {
  test("devuelve indices por identidad, incluyendo duplicados; ninguna coincidencia es null", () => {
    expect(evaluar(reglas, "read", ".env", "linux")).toEqual({ determinante: 2, coincidentes: [0, 1, 2] });
    expect(evaluar(reglas, "edit", ".env", "linux")).toEqual({ determinante: null, coincidentes: [] });
  });
  test("D-5 sensibilidad win32 y linux, en sujeto y objetivo", () => {
    expect(evaluar(reglas, "READ", ".ENV", "win32")).toEqual({ determinante: 2, coincidentes: [0, 1, 2] });
    expect(evaluar(reglas, "read", ".ENV", "linux")).toEqual({ determinante: 0, coincidentes: [0] });
    expect(evaluar(reglas, "READ", ".env", "linux").determinante).toBeNull();
  });
});
