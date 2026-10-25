import { describe, expect, test } from "bun:test";
import { consultarCadenas } from "../utilidades/cadenas";
import { comparar } from "../../herramientas/referencias-nativas/comparar";
import { consultarPermisos, referenciaDecisiones } from "../utilidades/permisos";
import { readFileSync } from "node:fs";
import { decisionNativa } from "../utilidades/decision-nativa";
import type { DecisionNativa } from "../../herramientas/decisiones-nativas/registro";

describe("K-10 RF-02 CA-3", () => {
  const referencia = JSON.parse(readFileSync(new URL("../escenarios/v2-subagente/REFERENCIA.json", import.meta.url), "utf8")) as {
    decisiones: { variante: string; agente: string; sujeto: string; objetivo: string; lanzadoPor: string; decision: string; escenario?: string;
      coincidentes: { indice: number; sujeto: string; patron: string; efecto: string }[]; determinante: number }[];
    cadenas: Record<string, { permission: string; pattern: string; action: string }[]>;
    decisionesNativas?: DecisionNativa[];
  };
  const consultar = (consultas: Parameters<typeof consultarPermisos>[0], variante = "global", modo = "ultima") =>
    consultarPermisos(consultas, modo, variante, "v2-subagente").respuestas;
  test("cadenas base completas coinciden con el binario en las tres configuraciones", () => {
    for (const escenario of ["v2-subagente", "v2-subagente-comodin", "v2-subagente-task"]) {
      const { referencia, cadenas, normalizar } = consultarCadenas(escenario);
      for (const [agente, esperada] of Object.entries(referencia.cadenas)) {
        const reglas = cadenas[agente]!.reglas.map(r => ({ permission: r.sujeto, pattern: r.patron, action: r.efecto }));
        expect(comparar({ reglas: esperada }, { reglas: normalizar(reglas) })).toEqual([]);
      }
    }
  });
  for (const caso of referencia.decisiones) {
    test(`(${caso.variante}) decision y procedencia de la cadena propia`, () => {
      const [r] = consultarPermisos([caso], "ultima", "global", caso.escenario ?? "v2-subagente").respuestas;
      const refCaso = caso.escenario ? JSON.parse(readFileSync(new URL(`../escenarios/${caso.escenario}/REFERENCIA.json`, import.meta.url), "utf8")) : referencia;
      const nativa = decisionNativa(refCaso, caso, r!.consulta.objetivoEvaluado!);
      expect(r!.decision).toBe(nativa?.decision ?? caso.decision);
      if (nativa) expect(r!.cadena.find(regla => regla.indice === r!.determinante)).toMatchObject(nativa.regla);
      expect(r!.cadena.map(regla => [regla.indice, regla.sujeto, regla.patron, regla.efecto]))
        .toEqual(caso.coincidentes.map(({ indice, sujeto, patron, efecto }) => [indice, sujeto, patron, efecto]));
      expect(r!.determinante).toBe(caso.determinante);
      if (["b", "c"].includes(caso.variante)) expect(r!.cadena.at(-1)).toMatchObject({
        origen: { tipo: "nativo", regla: "denegacion-subagente" }, declaracion: null,
      });
      expect(r!.declaraciones).toContain("reglas-agente-lanzador-excluidas");
      expect(r!.declaraciones).toContain("reglas-sesion-lanzadora-excluidas");
      expect(r!.reglas["reglas-agente-lanzador-excluidas"]).toContain("no se aplican");
    });
  }
  test("(e) general conserva una sola todowrite y el agente sin ella recibe la denegacion", () => {
    const [general, vacio] = consultar(["general", "vacio"].map(agente => ({ agente, sujeto: "todowrite", objetivo: "*", lanzadoPor: "build" })));
    expect(general!.cadena.filter(r => r.sujeto === "todowrite")).toHaveLength(1);
    expect(general!.cadena.at(-1)!.origen).toEqual({ tipo: "nativo", regla: "nativa-agente" });
    expect(vacio!.cadena.at(-1)!.origen).toEqual({ tipo: "nativo", regla: "denegacion-subagente" });
  });
  test("(f) primary_tools declarado advierte sin incorporar sus denegaciones", () => {
    const consultas = [{ agente: "general", sujeto: "bash", objetivo: "git status", lanzadoPor: "build" }];
    expect(consultar(consultas)[0]!.advertencias).not.toContain("primary-tools-no-incorporado");
    const [r] = consultar(consultas, "primary");
    expect(r!.advertencias).toContain("primary-tools-no-incorporado");
    expect(r!.reglas["primary-tools-no-incorporado"]).toContain("no integran");
    expect(r!.decision).toBe("allow");
  });
  test("S-1 lanzador inexistente produce error de uso", () => {
    expect(consultar([{ agente: "general", sujeto: "task", objetivo: "general", lanzadoPor: "ausente" }], "global", "resultado")[0])
      .toMatchObject({ exito: false, error: { codigo: "agente-inexistente" } });
  });
  test("agente primary se evalua y se declara que no es invocable como subagente", () => {
    const [r] = consultar([{ agente: "build", sujeto: "bash", objetivo: "git status", lanzadoPor: "general" }]);
    expect(r!.decision).toBe("deny");
    expect(r!.declaraciones).toContain("agente-no-invocable-como-subagente");
  });
});

function comprobarLectura(r: ReturnType<typeof consultarPermisos>["respuestas"][number]) {
  expect(r).toMatchObject({ decision: "allow", motivoSinDecision: null, desplazadas: [0, 8, 9], nativaAnulada: { regla: 9, por: 14 } });
  expect(r.cadena.map(({ sujeto, patron, efecto, origen }) => [sujeto, patron, efecto, origen.tipo])).toEqual([
    ["*", "*", "allow", "nativo"], ["read", "*", "allow", "nativo"],
    ["read", "*.env", "ask", "nativo"], ["read", "*.env", "allow", "declarado"],
  ]);
  expect(r.determinante).toBe(r.cadena.at(-1)!.indice);
}
describe("RF-02 CA-1 (decision)", () => {
  test("ultima coincidencia declarada permite leer .env y conserva el rastro ordenado", () => {
    const { respuestas: [r] } = consultarPermisos([{ agente: "build", herramienta: "read", objetivo: ".env" }]);
    const nativa = decisionNativa(referenciaDecisiones(), { agente: "build", sujeto: "read", objetivo: ".env" }, r!.consulta.objetivoEvaluado!);
    if (nativa) {
      expect(r!.decision).toBe(nativa.decision);
      expect(r!.cadena.find(regla => regla.indice === r!.determinante)).toMatchObject(nativa.regla);
    }
    comprobarLectura(r!);
  });
});

describe("RF-02 CA-2 (decision)", () => {
  test("compara decisiones derivadas a mano de la cadena nativa sin importar vendor", () => {
    const referencia = referenciaDecisiones();
    expect(referencia.decisiones.length).toBeGreaterThanOrEqual(5);
    const { respuestas } = consultarPermisos(referencia.decisiones.map(caso =>
      caso.sujeto === "read" || caso.sujeto === "edit" ? { ...caso, herramienta: caso.sujeto } : caso));
    for (const [i, esperada] of referencia.decisiones.entries()) {
      const nativa = decisionNativa(referencia, esperada, respuestas[i]!.consulta.objetivoEvaluado!);
      if (nativa) {
        expect(respuestas[i]!.decision).toBe(nativa.decision);
        expect(respuestas[i]!.cadena.find(r => r.indice === respuestas[i]!.determinante)).toMatchObject(nativa.regla);
      } else {
        expect(esperada.procedencia).toBe("derivada de la cadena nativa");
        expect(respuestas[i]).toMatchObject({ decision: esperada.decision, determinante: esperada.determinante });
        expect(respuestas[i]!.cadena.map(r => r.indice)).toEqual(esperada.coincidentes);
      }
    }
  });
});

describe("RF-02 CA-5", () => {
  test("incluye ambas declaraciones con plantilla, tambien sin decision", () => {
    const { respuestas } = consultarPermisos(["read", "external_directory"].map(sujeto => ({ agente: "build", sujeto, objetivo: ".env" })));
    for (const r of respuestas) {
      expect(r.declaraciones).toEqual(["aprobaciones-permanentes-excluidas", "sesion-no-interactiva-excluida", "numeracion-sin-directorios-externos"]);
      expect(r.reglas[r.declaraciones[0]!]).toContain('"permitir siempre"');
      expect(r.reglas[r.declaraciones[1]!]).toContain("question");
      expect(r.reglas[r.declaraciones[1]!]).toContain("plan_enter");
      expect(r.reglas[r.declaraciones[1]!]).toContain("plan_exit");
    }
    expect(respuestas[1]).toMatchObject({ decision: null, motivoSinDecision: "eje-parcialmente-observado", cadena: [],
      determinante: null, consulta: { objetivoEvaluado: null } });
  });
});

describe("RF-02 CA-8 (decision)", () => {
  test("la determinante declarada identifica entrada global, archivo y linea; nativa sin archivo", () => {
    const { respuestas: [declarada, nativa], raiz } = consultarPermisos([
      { agente: "build", sujeto: "read", objetivo: ".env" }, { agente: "build", sujeto: "edit", objetivo: "src/a.js" },
    ]);
    expect(declarada!.cadena.at(-1)).toMatchObject({ origen: { tipo: "declarado", posicion: { linea: 3, columna: 15 } },
      declaracion: { via: "global", referencia: `${raiz}/hogar/.config/opencode/opencode.json` } });
    const { respuestas: [r] } = consultarPermisos([{ agente: "general", sujeto: "task", objetivo: "a" }]);
    expect(r!.cadena.at(-1)).toMatchObject({ origen: { tipo: "nativo" }, declaracion: null });
    expect(nativa!.entradas.some(e => e.condicion === "observada" && e.resumen?.length === 64)).toBe(true);
    expect(nativa!.resumenEntradas).toHaveLength(64);
  });
});

describe("T2-06 D-3 sensibilidad RF-02 CA-1", () => {
  test("primera coincidencia hace fallar el resultado y la determinante esperados", () => {
    const consulta = [{ agente: "build", sujeto: "read", objetivo: ".env" }];
    const { respuestas: [mutada] } = consultarPermisos(consulta, "primera");
    expect(mutada!.determinante).toBe(0);
    expect(mutada!.cadena.find(r => r.indice === mutada!.determinante)!.origen.tipo).not.toBe("declarado");
    expect(mutada!.nativaAnulada).toBeNull();
    expect(() => comprobarLectura(mutada!)).toThrow();
  });
});

describe("RF-02 CA-2 (cadena)", () => {
  let mutaciones = 0;
  for (const escenario of ["v1-precedencia", "v1-vias", "v2-fusion-permisos", "v2-cadena", "v2-decision"]) {
    test(escenario, () => {
      const { referencia, cadenas, normalizar } = consultarCadenas(escenario);
      expect(Object.keys(referencia.cadenas).length).toBeGreaterThanOrEqual(4);
      for (const [agente, esperada] of Object.entries(referencia.cadenas)) {
        const cadena = cadenas[agente]!;
        expect(cadena.ejesParciales).toEqual(["external_directory"]);
        const reglas = cadena.reglas.map(r => ({ permission: r.sujeto, pattern: r.patron, action: r.efecto }));
        expect(comparar({ reglas: esperada }, { reglas: normalizar(reglas) })).toEqual([]);
        // K-4: muta la cadena producida por RIGE, conservando su longitud.
        const mutada = structuredClone(reglas);
        const declaradas = cadena.reglas.filter(r => r.origen.tipo === "declarado");
        if (declaradas.length >= 2) {
          mutaciones++;
          const a = declaradas[0]!.indice, b = declaradas[1]!.indice;
          [mutada[a], mutada[b]] = [mutada[b]!, mutada[a]!];
          expect(comparar({ reglas: esperada }, { reglas: normalizar(mutada) })).not.toEqual([]);
        }
      }
    });
  }
  describe("A5-3 K-4", () => { test("ejecuta al menos una mutacion", () => { expect(mutaciones).toBeGreaterThan(0); }); });
});

describe("RF-02 CA-8", () => {
  test("la declaracion conserva archivo, linea y columna; la nativa carece de archivo", () => {
    const { cadenas, raiz } = consultarCadenas("v2-cadena");
    const reglas = cadenas.build!.reglas;
    expect(reglas.find(r => r.sujeto === "edit" && r.efecto === "deny")).toMatchObject({
      origen: { tipo: "declarado", posicion: { linea: 5, columna: 9 } },
      declaracion: { referencia: `${raiz.replaceAll("\\", "/")}/proyecto/opencode.json` },
    });
    expect(reglas.find(r => r.sujeto === "read" && r.patron === "*.env")).toMatchObject({
      origen: { tipo: "nativo" }, declaracion: null,
    });
  });
});
