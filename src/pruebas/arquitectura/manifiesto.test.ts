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
    expect(validarManifiesto(leer(), matriz(), escenarios, raiz)).toEqual([]);
    const temporal = mkdtempSync(join(tmpdir(), "rige-manifiesto-"));
    try {
      cpSync(escenarios, temporal, { recursive: true });
      const entrada = join(temporal, "v1-precedencia/proyecto/opencode.json");
      writeFileSync(entrada, readFileSync(entrada, "utf8") + " ");
      expect(validarManifiesto(leer(), matriz(), temporal, raiz).join("\n")).toContain("SHA-256");
      writeFileSync(join(temporal, "v1-precedencia/nueva.txt"), "nueva");
      expect(validarManifiesto(leer(), matriz(), temporal, raiz).join("\n")).toContain("inventario");
      writeFileSync(join(temporal, "v1-precedencia/REFERENCIA.json"), "{}");
      expect(validarManifiesto(leer(), matriz(), temporal, raiz).join("\n")).toContain("referencia");
    } finally { borrarTemporal(temporal); }
  });
});

describe("T2-14 M-2", () => {
  test("R-M1 CA-3 declara oraculo derivado sin ejecucion nativa de task", () => {
    const manifiesto = leer();
    const comprobaciones = manifiesto.escenarios.flatMap(e => e.comprobaciones).filter(c => c.item === "RF-02 CA-3");
    expect(comprobaciones.length).toBeGreaterThan(0);
    expect(comprobaciones.every(c => c.fuente === "derivada")).toBe(true);
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
    expect(validarManifiesto(manifiesto, matriz(), escenarios, raiz).join("\n")).toContain("RF-02 CA-7 sin comprobacion");
    const inexistente = leer();
    inexistente.escenarios[0]!.comprobaciones[0]!.describe = "describe inexistente";
    expect(validarManifiesto(inexistente, matriz(), escenarios, raiz).join("\n")).toContain("describe inexistente");
    const informe = informarCobertura(leer(), matriz());
    expect(informe.items.filter(i => i.iteracion === 2).every(i => i.estado.startsWith("cubierto"))).toBe(true);
    expect(informe.escenarios.length).toBe(leer().escenarios.length);
    expect(informe.retiros).toEqual([]);
    expect(informe.corte).toBeNull();
    expect(informe.resultadosBase).toBe("pendiente de corte y ejecucion de aceptacion");
  });
});

describe("T2-14 M-3", () => {
  test("T3-05 y T3-06 cubren los seis tipos de RF-07, CA-2, CA-5, RE-02 y RE-03; el defecto ADR-088 queda pendiente hasta T3-08", () => {
    const manifiesto = leer();
    const informe = informarCobertura(manifiesto, matriz()).items;
    const rf07 = informe.filter(i => i.id.startsWith("RF-07 "));
    expect(rf07).toHaveLength(8);
    expect(rf07.every(i => i.estado === "cubierto")).toBe(true);
    for (const id of ["RF-07 CA-5", "RE-02", "RE-03"]) {
      expect(informe.find(i => i.id === id)).toMatchObject({ iteracion: 3, estado: "cubierto" });
    }
    expect(manifiesto.defectosSembrados).toHaveLength(1);
    expect(manifiesto.defectosSembrados[0]).toMatchObject({ escenario: "v2-ruta-bloqueo", tipo: "reglas-permiso-sin-efecto", pendiente: "RF-07, iteración 3" });
    expect(manifiesto.defectosSembrados[0]!.controlCorrecto).toMatchObject({ patron: "src/productos.js" });
  });
  test("RF-09 CA-3 queda cubierto por su escenario y aceptacion", () => {
    expect(informarCobertura(leer(), matriz()).items.find(i => i.id === "RF-09 CA-3"))
      .toMatchObject({ iteracion: 3, estado: "cubierto", escenarios: ["v3-proteccion-env"] });
  });
  test("solo los items futuros sin comprobaciones quedan pendientes", () => {
    const manifiesto = { ...leer(), iteracion: 4 };
    const items = [3, 4, 5, 6].map(iteracion => ({ id: `caso-${iteracion}`, iteracion, objetivo: "prueba", obligatorioV2: false }));
    manifiesto.escenarios[0]!.comprobaciones.push({ item: "caso-6", archivo: "pruebas/aceptacion/RF-09.test.ts", describe: "RF-09 CA-3", fuente: "referencia-binario" });
    expect(informarCobertura(manifiesto, { items }).items.map(i => i.estado))
      .toEqual(["sin cobertura", "sin cobertura", "pendiente", "cubierto"]);
  });
});
