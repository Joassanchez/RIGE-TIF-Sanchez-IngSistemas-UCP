import { describe, expect, test } from "bun:test";
import { analizarIdentificaciones } from "../utilidades/analisis-arquitectura";

describe("T0-06 identificaciones del nucleo", () => {
  const casos = [
    'const herramienta = "opencode";', 'const herramienta = "OpenCode";',
    'const variable = "OPENCODE_CONFIG";', 'const variable = "opencode_permission";',
    '// OPENCODE_CONFIG', '/* OpenCode */', 'type OpenCode = string;',
  ];
  test("rechaza las identificaciones en la fuente original", () => {
    expect(casos.map(caso => ({ caso, resultado: analizarIdentificaciones("paquetes/nucleo/sonda.ts", caso).length > 0 })))
      .toEqual(casos.map(caso => ({ caso, resultado: true })));
  });
  test("incluye las unitarias del nucleo sin cambiar el alcance de otros paquetes", () => {
    expect(analizarIdentificaciones("paquetes/nucleo/resultado.test.ts", '// OpenCode').length).toBeGreaterThan(0);
    expect(analizarIdentificaciones("paquetes/opencode/descriptor.ts", 'const herramienta = "opencode";')).toEqual([]);
    expect(analizarIdentificaciones("paquetes/nucleo/resultado.ts", 'export type Resultado<T> = T;')).toEqual([]);
  });
});
