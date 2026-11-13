import { describe, expect, test } from "bun:test";
import { subcomandos, ordenFaltaSubcomando } from "./subcomandos";
import { ayuda } from "./ayuda";

describe("S-2", () => {
  test("la lista de la ayuda general coincide con subcomandos.map(s => s.nombre)", () => {
    const texto = ayuda();
    for (const titulo of ["Consultar:", "Historial:", "Almacén y servidor:"]) {
      expect(texto).toContain(`${titulo}\n`);
    }
    const seccionSubcomandos = texto.split("\nOpciones generales:")[0]!;
    const listados = [...seccionSubcomandos.matchAll(/^  ([a-z-]+) {2,}(.+)$/gm)].map(m => ({
      nombre: m[1]!,
      resumen: m[2]!,
    }));
    expect(listados).toHaveLength(subcomandos.length);
    expect(new Set(listados.map(s => s.nombre))).toEqual(new Set(subcomandos.map(s => s.nombre)));
    for (const sub of subcomandos) {
      expect(sub.resumen.trim().length).toBeGreaterThan(0);
      const entrada = listados.find(s => s.nombre === sub.nombre);
      expect(entrada?.resumen).toBe(sub.resumen);
    }
  });

  test("--tiempos y opciones admitidas se derivan de la tabla para cada subcomando", () => {
    for (const sub of subcomandos) {
      const textoAyuda = ayuda(sub.nombre);
      expect(textoAyuda).not.toContain("undefined");
      if (sub.consultaProyecto) {
        expect(textoAyuda).toContain("--tiempos");
      } else {
        expect(textoAyuda).not.toContain("--tiempos");
      }
      for (const opcion of sub.opciones) {
        expect(textoAyuda).toContain(`--${opcion}`);
      }
      const opcionesUso = [...sub.uso[0].matchAll(/--([a-z-]+)/g)].map(m => m[1]!);
      expect(new Set(opcionesUso)).toEqual(new Set(sub.opciones));
    }
  });
});

describe("S-8", () => {
  test("new Set(ordenFaltaSubcomando) es igual al conjunto de nombres de la tabla menos estado", () => {
    const nombresSinEstado = new Set(subcomandos.map(s => s.nombre).filter(n => n !== "estado"));
    expect(new Set(ordenFaltaSubcomando)).toEqual(nombresSinEstado);
    expect(ordenFaltaSubcomando.includes("estado")).toBe(false);
  });
});
