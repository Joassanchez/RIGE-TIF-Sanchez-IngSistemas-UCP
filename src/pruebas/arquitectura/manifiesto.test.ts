import { borrarTemporal } from "../utilidades/borrar-temporal";
import { describe, expect, test } from "bun:test";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describes, informarCobertura, validarManifiesto, type Manifiesto, type Matriz } from "../../herramientas/cobertura";

const raiz = resolve(import.meta.dir, "../..");
const escenarios = join(raiz, "pruebas/escenarios");
const leer = () => JSON.parse(readFileSync(join(escenarios, "MANIFIESTO.json"), "utf8")) as Manifiesto;
const matriz = () => JSON.parse(readFileSync(join(escenarios, "COBERTURA.json"), "utf8")) as Matriz;
// Catalogo sintetico: las pruebas nunca leen las fichas externas a src/.
const criterios = Object.entries({ "RF-01": 2, "RF-02": 9, "RF-03": 5, "RF-04": 2, "RF-05": 2,
  "RF-06": 2, "RF-07": 5, "RF-08": 3, "RF-09": 3, "RF-10": 3, "RF-11": 1, "RF-12": 2,
  "RF-16": 3, "RF-17": 3, "RNF-01": 3, "RNF-02": 2, "RNF-03": 3, "RNF-04": 3,
  "RNF-05": 2, "RNF-06": 3, "RNF-07": 1, "RNF-08": 2, "RNF-09": 3, "RNF-10": 3 })
  .flatMap(([id, cantidad]) => Array.from({ length: cantidad }, (_, i) => `${id} CA-${i + 1}`));

describe("T5-04 W-4 W-7 cobertura completa", () => {
  test("70 CA de 24 requisitos, auxiliares separados y modalidades independientes de acreditacion", () => {
    const informe = informarCobertura(leer(), matriz());
    expect(informe.alcance.criterios).toBe(70);
    expect(informe.alcance.requisitos).toHaveLength(24);
    expect(informe.alcance.excluidos).toEqual(["RF-13", "RF-14", "RF-15"]);
    expect(informe.iteracion4.map(i => i.id)).toEqual(["RNF-06 CA-1", "RNF-06 CA-2", "RNF-06 CA-3", "RNF-07 CA-1"]);
    for (const id of ["RF-16 CA-1", "RNF-10 CA-3"]) {
      expect(informe.items.find(i => i.id === id)).toMatchObject({ verificacion: "automatica", acreditacion: "no ejecutada por este informe" });
    }
    expect(validarManifiesto(leer(), matriz(), escenarios, raiz, criterios)).toEqual([]);
  });
  test("vinculos de item sin escenario deben existir, incluso en la iteracion 4", () => {
    const alterada = matriz();
    alterada.items.push({ id: "auxiliar-sintetico", objetivo: "prueba", iteracion: 4, obligatorioV2: false, verificacion: "automatica",
      comprobaciones: [{ archivo: "pruebas/ausente.test.ts", describe: "inexistente" }] });
    expect(validarManifiesto(leer(), alterada, escenarios, raiz, criterios).join()).toContain("archivo inexistente");
    alterada.items.at(-1)!.comprobaciones![0]!.archivo = "pruebas/aceptacion/RF-01.test.ts";
    expect(validarManifiesto(leer(), alterada, escenarios, raiz, criterios).join()).toContain("describe inexistente");
  });
});

describe("T3-04 cobertura RNF-04 RNF-02", () => {
  test("los cuatro criterios tienen escenario y pruebas de la iteracion 3", () => {
    const items = informarCobertura(leer(), matriz()).items;
    for (const id of ["RNF-04 CA-1", "RNF-04 CA-2", "RNF-04 CA-3", "RNF-02 CA-1"]) {
      expect(items.find(i => i.id === id)).toMatchObject({ iteracion: 3, estado: "cubierto", escenarios: ["v3-sustituciones"] });
    }
  });
});

describe("T3-03 cobertura RF-04", () => {
  test("ambos criterios quedan cubiertos con escenarios de la iteracion 3", () => {
    const items = informarCobertura(leer(), matriz()).items;
    expect(items.find(i => i.id === "RF-04 CA-1")).toMatchObject({ iteracion: 3, estado: "cubierto", escenarios: ["v3-entradas"] });
    expect(items.find(i => i.id === "RF-04 CA-2")).toMatchObject({ iteracion: 3, estado: "cubierto", escenarios: ["v3-entradas-ilegible"] });
  });
});

describe("T2-14 M-1", () => {
  test("inventario completo, entradas y referencias conservan su SHA-256; detecta un byte y entradas nuevas", () => {
    expect(validarManifiesto(leer(), matriz(), escenarios, raiz, criterios)).toEqual([]);
    const temporal = mkdtempSync(join(tmpdir(), "rige-manifiesto-"));
    try {
      cpSync(escenarios, temporal, { recursive: true });
      const entrada = join(temporal, "v1-precedencia/proyecto/opencode.json");
      writeFileSync(entrada, readFileSync(entrada, "utf8") + " ");
      expect(validarManifiesto(leer(), matriz(), temporal, raiz, criterios).join("\n")).toContain("SHA-256");
      writeFileSync(join(temporal, "v1-precedencia/nueva.txt"), "nueva");
      expect(validarManifiesto(leer(), matriz(), temporal, raiz, criterios).join("\n")).toContain("inventario");
      writeFileSync(join(temporal, "v1-precedencia/REFERENCIA.json"), "{}");
      expect(validarManifiesto(leer(), matriz(), temporal, raiz, criterios).join("\n")).toContain("referencia");
    } finally { borrarTemporal(temporal); }
  });
});

describe("T2-14 M-2 T5-04 W-1", () => {
  test("R-M1 CA-3 declara oraculo derivado sin ejecucion nativa de task", () => {
    const manifiesto = leer();
    const comprobaciones = manifiesto.escenarios.flatMap(e => e.comprobaciones).filter(c => c.item === "RF-02 CA-3");
    expect(comprobaciones.length).toBeGreaterThan(0);
    expect(comprobaciones.every(c => c.fuente === "derivada")).toBe(true);
    for (const escenario of manifiesto.escenarios.filter(e => e.id.startsWith("v2-subagente"))) {
      expect(escenario.comprobaciones.filter(c => c.item === "RNF-02" && c.aspecto === "decisiones"))
        .toContainEqual(expect.objectContaining({ fuente: "derivada", documento: "v2-subagente/DERIVACION.md" }));
      expect(escenario.comprobaciones.filter(c => c.item === "RNF-02" && c.aspecto === "cadenas-base"))
        .toContainEqual(expect.objectContaining({ fuente: "referencia-binario" }));
    }
    expect(informarCobertura(manifiesto, matriz()).items.find(i => i.id === "RF-02 CA-3")!.estado)
      .toBe("cubierto con oráculo derivado; sin ejecución nativa de task");
  });
  test("comentarios y ejemplos de texto no son describes existentes", () => {
    expect(describes('// describe("comentario", () => {});\nconst ejemplo = \'describe("texto", () => {});\';\ndescribe("real", () => {});')).toEqual(["real"]);
  });
  test("cada obligatorio v2 tiene comprobacion y describe existente; quitar la unica falla", () => {
    expect(matriz().items.filter(i => i.obligatorioV2).map(i => i.id).sort()).toEqual([
      "RF-01 CA-1", "RF-01 CA-2", ...Array.from({ length: 9 }, (_, i) => `RF-02 CA-${i + 1}`), "RNF-02", "RNF-03",
    ].sort());
    const manifiesto = leer();
    for (const escenario of manifiesto.escenarios) escenario.comprobaciones = escenario.comprobaciones.filter(c => c.item !== "RF-02 CA-7");
    expect(validarManifiesto(manifiesto, matriz(), escenarios, raiz, criterios).join("\n")).toContain("RF-02 CA-7 sin comprobacion");
    const inexistente = leer();
    inexistente.escenarios[0]!.comprobaciones[0]!.describe = "describe inexistente";
    expect(validarManifiesto(inexistente, matriz(), escenarios, raiz, criterios).join("\n")).toContain("describe inexistente");
    const informe = informarCobertura(leer(), matriz());
    expect(informe.items.filter(i => i.iteracion === 2).every(i => i.estado.startsWith("cubierto"))).toBe(true);
    expect(informe.escenarios.length).toBe(leer().escenarios.length);
    expect(informe.retiros).toEqual([]);
    expect(informe.corte).toBeNull();
    expect(informe.resultadosBase).toBe("pendiente de corte y ejecucion de aceptacion");
  });
});

describe("T3-08 R-3", () => {
  const tiposValidos = new Set([
    "entrada-ilegible",
    "entrada-descartada",
    "sustitucion-sin-valor",
    "referencia-no-resuelta",
    "regla-sin-efecto",
    "elemento-sin-uso",
  ]);

  test("forma del inventario defectosSembrados, tipo valido, control.escenario existente y sin campos obsoletos", () => {
    const manifiesto = leer();
    expect(Array.isArray(manifiesto.defectosSembrados)).toBe(true);
    expect(manifiesto.defectosSembrados.length).toBeGreaterThan(0);

    const idsEscenarios = new Set(manifiesto.escenarios.map(e => e.id));

    for (const d of manifiesto.defectosSembrados) {
      expect(typeof d.id).toBe("string");
      expect(d.id.length).toBeGreaterThan(0);
      expect(idsEscenarios.has(d.escenario)).toBe(true);

      // tipo valido en TipoHallazgo
      expect(tiposValidos.has(d.tipo)).toBe(true);
      expect(typeof d.causa).toBe("string");
      expect(d.causa!.length).toBeGreaterThan(0);

      // localizacion: { archivo, linea } o { variable }
      expect(d.localizacion).toBeDefined();
      if ("archivo" in d.localizacion) {
        expect(typeof d.localizacion.archivo).toBe("string");
        expect(typeof d.localizacion.linea).toBe("number");
      } else if ("variable" in d.localizacion) {
        expect(typeof d.localizacion.variable).toBe("string");
      } else {
        expect("localizacion invalida").toBe("archivo o variable");
      }

      // clave array o null para entradas sin clave interna
      expect(d.clave === null || Array.isArray(d.clave)).toBe(true);

      // control: null solo en los 3 colaterales heredados del v2
      if (d.control === null) {
        expect(["v2-agentes", "v2-subagente", "v2-ruta-exposicion"]).toContain(d.escenario);
      } else {
        expect(d.control).toBeDefined();
        expect(idsEscenarios.has(d.control!.escenario)).toBe(true);
        expect(Array.isArray(d.control!.cambios)).toBe(true);
        expect(d.control!.cambios).not.toContain("REFERENCIA.json");
        expect(typeof d.control!.evidencia).toBe("string");
        expect(d.control!.evidencia.length).toBeGreaterThan(0);
      }

      // sin campos obsoletos (pendiente, hallazgoEsperado, controlCorrecto)
      expect((d as unknown as Record<string, unknown>).pendiente).toBeUndefined();
      expect((d as unknown as Record<string, unknown>).hallazgoEsperado).toBeUndefined();
      expect((d as unknown as Record<string, unknown>).controlCorrecto).toBeUndefined();
    }
  });

  test("coherencia de SHA-256 en todo el manifiesto", () => {
    const errores = validarManifiesto(leer(), matriz(), escenarios, raiz, criterios);
    const erroresSha = errores.filter(e => e.includes("SHA-256"));
    expect(erroresSha).toEqual([]);
  });
});

describe("T3-08 R-4", () => {
  test("cobertura exigible en iteracion 3: iteracion en manifiesto, pendientes e informe", () => {
    const manifiesto = leer();
    expect(manifiesto.iteracion).toBe(3);

    const matrizActual = matriz();
    const informe = informarCobertura(manifiesto, matrizActual);

    // Los criterios de iteracion 3 exigibles no aplazados deben estar cubiertos
    const aplazados = manifiesto.aplazados ?? {};
    for (const id of ["RNF-05 CA-1", "RNF-05 CA-2"]) {
      expect(aplazados[id]).toBeUndefined();
      expect(informe.items.find(item => item.id === id)).toMatchObject({
        estado: "cubierto", escenarios: ["v2-decision", "v3-sustituciones", "v3-sin-efecto"],
      });
    }
    expect(aplazados).toEqual({});
    for (const id of ["RF-10 CA-1", "RF-10 CA-2", "RF-10 CA-3", "RF-11 CA-1", "RNF-08 CA-1", "RNF-08 CA-2"]) {
      expect(informe.items.find(item => item.id === id)).toMatchObject({ estado: "cubierto" });
    }

    // informarCobertura marca "pendiente" solo cuando item.iteracion > manifiesto.iteracion
    for (const item of informe.items) {
      if (item.iteracion > manifiesto.iteracion) {
        expect(item.estado).toBe("pendiente");
      }
    }

    // validarManifiesto no debe dar errores con toda la iteracion cubierta
    const errores = validarManifiesto(manifiesto, matrizActual, escenarios, raiz, criterios);
    const erroresCobertura = errores.filter(e => e.includes("sin comprobacion") || e.includes("sin cobertura"));
    expect(erroresCobertura).toEqual([]);
  });

  test("quitar una comprobacion exigida no aplazada de la iteracion 3 produce error en validarManifiesto", () => {
    const manifiestoModificado = JSON.parse(JSON.stringify(leer())) as Manifiesto;
    // Quitar la comprobacion de RF-04 CA-1
    for (const esc of manifiestoModificado.escenarios) {
      esc.comprobaciones = esc.comprobaciones.filter(c => c.item !== "RF-04 CA-1");
    }
    const errores = validarManifiesto(manifiestoModificado, matriz(), escenarios, raiz, criterios);
    expect(errores.some(e => e.includes("RF-04 CA-1"))).toBe(true);
  });
});
