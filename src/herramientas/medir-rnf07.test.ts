import { describe, expect, test } from "bun:test";
import { medirConsultas, medirEscala, opcionesMedicion, publicarEscala } from "./medir-rnf07";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario } from "../pruebas/utilidades/escenario";

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

const escenariosTamano = [1, 10].map(cantidad => ({ serie: "tamano" as const, cantidad, proyecto: `/n${cantidad}`, archivos: cantidad === 1 ? 32 : 311 }));
const escenariosReglas = [10, 100, 1000, 10000].map(cantidad => ({ serie: "reglas" as const, cantidad, proyecto: `/r${cantidad}`, archivos: 1 }));

describe("E-3 mediciones de tamano", () => {
  test("cuatro consultas por N, diez procesos consecutivos y argumentos validos", () => {
    const llamadas: (readonly string[])[] = [];
    const informe = medirEscala(escenariosTamano, args => {
      llamadas.push(args);
      return { invocacionMs: llamadas.length, tiempos: { arranqueMs: 1, lecturaMs: 2, resolucionMs: 3, salidaMs: 1, totalMs: 7 } };
    });
    expect(llamadas).toHaveLength(80);
    expect(informe.resultados).toHaveLength(8);
    for (let grupo = 0; grupo < 8; grupo++) {
      const bloque = llamadas.slice(grupo * 10, grupo * 10 + 10);
      expect(bloque.every(a => JSON.stringify(a) === JSON.stringify(bloque[0]))).toBe(true);
      expect(bloque[0]![0]).toBe(["valores", "permiso", "hallazgos", "permiso"][grupo % 4]!);
      expect(bloque[0]).toContain("--tiempos");
      expect(bloque[0]!.includes("--explicar")).toBe(grupo % 4 === 3);
      if (grupo % 4 !== 2) expect(bloque[0]).toContain("agent-1");
      if (grupo % 4 === 1 || grupo % 4 === 3) expect(bloque[0]).toContain("git status");
    }
    expect(informe.resultados[0]!.tiempos?.lecturaMs.mediana).toBe(2);
  });
});

describe("E-4 mediciones de reglas", () => {
  test("timeout 120 s, diez corridas por R y continua despues de un corte", () => {
    let llamadas = 0;
    const informe = medirEscala(escenariosReglas, (args, timeout) => {
      expect(args[0]).toBe("hallazgos");
      expect(timeout).toBe(120000);
      llamadas++;
      return llamadas === 11 ? { corte: true as const } : { invocacionMs: 2 };
    });
    expect(llamadas).toBe(40);
    expect(informe.resultados[1]!.estado).toBe("corte");
    expect(informe.resultados[1]!.cortes).toBe(1);
    expect(informe.resultados[1]!.invocacionMs).toBeNull();
    expect(informe.resultados[2]!.cociente).toBeNull();
    expect(informe.resultados[3]!.estado).toBe("completa");
    expect(informe.codigo).toBe(0);
  });
});

describe("E-5 salida de escala", () => {
  test("estadisticas, cocientes entre pares comparables y mismo JSON que la tabla", () => {
    let llamada = 0;
    const informe = medirEscala([...escenariosTamano, ...escenariosReglas], args => {
      const n = ++llamada % 10 || 10;
      return { invocacionMs: n * (args.includes("/n10") ? 10 : 1) };
    });
    expect(informe.resultados[0]!.invocacionMs).toEqual({ minimo: 1, mediana: 5.5, peor: 10 });
    for (const r of informe.resultados.slice(4, 8)) expect(r.cociente).toEqual({ mediana: 10, peor: 10 });
    expect(informe.resultados[8]!.cociente).toBeNull();
    expect(informe.resultados[9]!.cociente).toEqual({ mediana: 1, peor: 1 });
    expect(medirEscala(escenariosTamano, () => ({ invocacionMs: 0 })).resultados[4]!.cociente).toEqual({ mediana: null, peor: null });
    const copia = copiarEscenario("openchamber-doble");
    try {
      const lineas: string[] = [];
      const ruta = join(copia.raiz, "resultado.json");
      const publicado = publicarEscala(informe, "plataforma-prueba", "abc123", ruta, l => lineas.push(l));
      expect(JSON.parse(readFileSync(ruta, "utf8"))).toEqual(publicado);
      expect(publicado.resultados).toEqual(informe.resultados);
      expect(lineas.join("\n")).toContain("abc123");
      expect(lineas.join("\n")).toContain("plataforma-prueba");
      expect(lineas.filter(l => l.startsWith("Serie"))).toHaveLength(2);
      expect(lineas.join("\n")).toContain("311");
      const corte = medirEscala(escenariosReglas, () => ({ corte: true }));
      const tabla: string[] = [];
      publicarEscala(corte, "p", "c", undefined, l => tabla.push(l));
      expect(tabla.join("\n")).toContain("corte");
    } finally { copia.borrar(); }
  });
});

describe("E-6 sin veredicto", () => {
  test("no aplica umbral, conserva errores y rechaza escala con estricto", () => {
    expect(medirEscala(escenariosTamano, () => ({ invocacionMs: 9000 })).codigo).toBe(0);
    const fallo = medirEscala(escenariosReglas, () => ({ codigo: 70, error: "error de prueba" }));
    expect(fallo.codigo).toBe(1);
    expect(fallo.error).toContain("error de prueba");
    expect(medirEscala(escenariosTamano, () => ({ corte: true })).codigo).toBe(1);
    expect(() => opcionesMedicion(["--escala", "--estricto"])).toThrow();
    expect(opcionesMedicion(["--escala", "--salida", "resultado.json"])).toEqual({ escala: true, estricto: false, salida: "resultado.json" });
    expect(() => opcionesMedicion(["--escala", "--salida"])).toThrow();
    expect(() => opcionesMedicion(["--salida", "resultado.json"])).toThrow();
  });
});

describe("E-7 no regresion", () => {
  test("sin escala conserva modos y consultas originales", () => {
    expect(opcionesMedicion([])).toEqual({ escala: false, estricto: false, salida: undefined });
    expect(opcionesMedicion(["--estricto"]).estricto).toBe(true);
    const args: (readonly string[])[] = [];
    medirConsultas("p", false, a => {
      args.push(a);
      return { invocacionMs: 1, tiempos: { arranqueMs: 1, lecturaMs: 1, resolucionMs: 1, salidaMs: 1, totalMs: 4 } };
    });
    expect(args[0]).toEqual(["valores", "--proyecto", "p", "--agente", "agent-1", "--tiempos"]);
    expect(args[10]).toEqual(["permiso", "--proyecto", "p", "--agente", "agent-1", "--herramienta", "bash", "--objetivo", "git status", "--tiempos"]);
    expect(args).toHaveLength(20);
  });
});
