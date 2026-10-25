import { describe, expect, test } from "bun:test";
import { consultarCadenas } from "../utilidades/cadenas";
import { comparar } from "../../herramientas/referencias-nativas/comparar";
import { consultarPermisos, referenciaDecisiones } from "../utilidades/permisos";

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
    const { respuestas: [r] } = consultarPermisos([{ agente: "build", sujeto: "read", objetivo: ".env" }]);
    comprobarLectura(r!);
  });
});

describe("RF-02 CA-2 (decision)", () => {
  test("compara decisiones derivadas a mano de la cadena nativa sin importar vendor", () => {
    const referencia = referenciaDecisiones();
    expect(referencia.decisiones.length).toBeGreaterThanOrEqual(5);
    const { respuestas } = consultarPermisos(referencia.decisiones);
    for (const [i, esperada] of referencia.decisiones.entries()) {
      expect(esperada.procedencia).toBe("derivada de la cadena nativa");
      expect(respuestas[i]).toMatchObject({ decision: esperada.decision, determinante: esperada.determinante });
      expect(respuestas[i]!.cadena.map(r => r.indice)).toEqual(esperada.coincidentes);
    }
  });
});

describe("RF-02 CA-5", () => {
  test("incluye ambas declaraciones con plantilla, tambien sin decision", () => {
    const { respuestas } = consultarPermisos(["read", "external_directory"].map(sujeto => ({ agente: "build", sujeto, objetivo: ".env" })));
    for (const r of respuestas) {
      expect(r.declaraciones).toEqual(["aprobaciones-permanentes-excluidas", "sesion-no-interactiva-excluida"]);
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
          const a = declaradas[0]!.indice, b = declaradas[1]!.indice;
          [mutada[a], mutada[b]] = [mutada[b]!, mutada[a]!];
          expect(comparar({ reglas: esperada }, { reglas: normalizar(mutada) })).not.toEqual([]);
        }
      }
    });
  }
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
