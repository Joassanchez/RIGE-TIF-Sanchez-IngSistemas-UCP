import { describe, expect, test } from "bun:test";
import { analizarIdentificaciones, comprobarIdentificaciones } from "../utilidades/analisis-arquitectura";

describe("T0-06 identificaciones del nucleo", () => {
  for (const codigo of [
    'const herramienta = "opencode";', 'const herramienta = "OpenCode";',
    'const variable = "OPENCODE_CONFIG";', 'const variable = "opencode_permission";',
    '// OPENCODE_CONFIG', '/* OpenCode */', 'type OpenCode = string;',
  ]) {
    test(`rechaza la fuente original: ${codigo}`, () => {
      expect(analizarIdentificaciones("paquetes/nucleo/sonda.ts", codigo).length).toBeGreaterThan(0);
    });
  }
  test("incluye las unitarias del nucleo sin cambiar el alcance de otros paquetes", () => {
    expect(analizarIdentificaciones("paquetes/nucleo/resultado.test.ts", '// OpenCode').length).toBeGreaterThan(0);
    expect(analizarIdentificaciones("paquetes/opencode/descriptor.ts", 'const herramienta = "opencode";')).toEqual([]);
    expect(analizarIdentificaciones("paquetes/nucleo/resultado.ts", 'export type Resultado<T> = T;')).toEqual([]);
  });
  test("el nucleo real no contiene identificaciones de herramienta", async () => {
    expect(await comprobarIdentificaciones()).toEqual([]);
  });
});
