import { describe, expect, test } from "bun:test";
import { subcomandos, ordenFaltaSubcomando } from "./subcomandos";
import { ayuda } from "./ayuda";

describe("S-2", () => {
  test("la lista de la ayuda general coincide con subcomandos.map(s => s.nombre)", () => {
    const listaEsperada = subcomandos.map(s => s.nombre).join(", ");
    expect(ayuda()).toContain(`Subcomandos: ${listaEsperada}\n`);
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
