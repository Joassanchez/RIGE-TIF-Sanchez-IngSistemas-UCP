import { describe, expect, test } from "bun:test";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describes, informarCobertura, validarManifiesto, type Manifiesto, type Matriz } from "../../herramientas/cobertura";

const raiz = resolve(import.meta.dir, "../..");
const escenarios = join(raiz, "pruebas/escenarios");
const leer = () => JSON.parse(readFileSync(join(escenarios, "MANIFIESTO.json"), "utf8")) as Manifiesto;
const matriz = () => JSON.parse(readFileSync(join(escenarios, "COBERTURA.json"), "utf8")) as Matriz;

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
    } finally { rmSync(temporal, { recursive: true, force: true }); }
  });
});

describe("T2-14 M-2", () => {
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
    expect(informe.items.filter(i => i.iteracion === 2).every(i => i.estado === "cubierto")).toBe(true);
    expect(informe.escenarios.length).toBe(leer().escenarios.length);
    expect(informe.retiros).toEqual([]);
    expect(informe.corte).toBeNull();
    expect(informe.resultadosBase).toBe("pendiente de corte y ejecucion de aceptacion");
  });
});

describe("T2-14 M-3", () => {
  test("los seis tipos RF-07 y su defecto ADR-088 quedan pendientes, nunca cubiertos", () => {
    const manifiesto = leer();
    const pendientes = informarCobertura(manifiesto, matriz()).items.filter(i => i.iteracion === 3);
    expect(pendientes).toHaveLength(6);
    expect(pendientes.map(i => i.id).sort()).toEqual(["referencias-no-resueltas", "reglas-permiso-sin-efecto", "elementos-sin-uso", "sustituciones-sin-valor", "entradas-ilegibles", "entradas-descartadas"].map(t => `RF-07 ${t}`).sort());
    expect(pendientes.every(i => i.estado === "pendiente")).toBe(true);
    expect(manifiesto.defectosSembrados).toHaveLength(1);
    expect(manifiesto.defectosSembrados[0]).toMatchObject({ escenario: "v2-ruta-bloqueo", tipo: "reglas-permiso-sin-efecto", pendiente: "RF-07, iteración 3" });
    expect(manifiesto.defectosSembrados[0]!.controlCorrecto).toMatchObject({ patron: "src/productos.js" });
    const falsa = leer();
    falsa.escenarios[0]!.comprobaciones.push({ item: pendientes[0]!.id, archivo: "pruebas/aceptacion/RF-01.test.ts", describe: "RF-01 CA-1", fuente: "derivada" });
    expect(informarCobertura(falsa, matriz()).items.filter(i => i.iteracion === 3).every(i => i.estado === "pendiente")).toBe(true);
  });
});
