import { describe, expect, test } from "bun:test";
import { medirConsultas } from "./medir-rnf07";

describe("T4-01 arnes RNF-07", () => {
  test("ejecuta diez corridas consecutivas por consulta y resume cada etapa", () => {
    const llamadas: (readonly string[])[] = [];
    const informe = medirConsultas("/proyecto", false, argumentos => {
      llamadas.push(argumentos);
      const n = (llamadas.length - 1) % 10 + 1;
      return { invocacionMs: n * 100, tiempos: { arranqueMs: n, lecturaMs: 2 * n, resolucionMs: 3 * n, salidaMs: n, totalMs: 7 * n } };
    });
    expect(llamadas).toHaveLength(20);
    expect(llamadas.slice(0, 10).every(args => args[0] === "valores")).toBe(true);
    expect(llamadas.slice(10).every(args => args[0] === "permiso" && args.includes("git status"))).toBe(true);
    expect(llamadas.every(args => args.includes("--tiempos") && args.includes("agent-1") && args.includes("/proyecto"))).toBe(true);
    expect(informe.codigo).toBe(0);
    for (const resultado of informe.resultados) {
      expect(resultado.invocacionMs).toEqual({ minimo: 100, mediana: 550, peor: 1000 });
      expect(resultado.lecturaMs).toEqual({ minimo: 2, mediana: 11, peor: 20 });
    }
  });
  test("el umbral estricto se aplica a la invocacion completa y falla desde 2000 ms en cualquiera de las consultas", () => {
    for (const lenta of ["valores", "permiso"]) {
      for (const peor of [1999, 2000, 2001]) {
        for (const estricto of [false, true]) {
          const informe = medirConsultas("/proyecto", estricto, args => ({
            invocacionMs: args[0] === lenta ? peor : 100,
            tiempos: { arranqueMs: 1, lecturaMs: 2, resolucionMs: 3, salidaMs: 1, totalMs: 7 },
          }));
          expect(informe.codigo).toBe(estricto && peor >= 2000 ? 1 : 0);
        }
      }
    }
  });
});
