import { describe, expect, test } from "bun:test";
import { consultarCadenas } from "../utilidades/cadenas";
import { comparar } from "../../herramientas/referencias-nativas/comparar";

describe("RF-02 CA-2 (cadena)", () => {
  for (const escenario of ["v1-precedencia", "v1-vias", "v2-fusion-permisos", "v2-cadena"]) {
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
