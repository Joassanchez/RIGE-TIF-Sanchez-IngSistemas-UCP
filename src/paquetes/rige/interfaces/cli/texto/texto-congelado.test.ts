// Regeneración de pruebas/datos/texto-T5-32.json:
// ejecutar `bun pruebas/utilidades/generar-texto-congelado.ts` desde `src/` con
// `TZ=UTC` (la zona horaria que usa `bun test`) y, por cada elemento de
// `casos`, resumir `esperado` con SHA-256 hex (UTF-8) conservando `{ id, sha256 }`
// en el mismo orden.
import { expect, test, describe } from "bun:test";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { subcomandos } from "../subcomandos";
import { type ContextoPresentacion } from "./index";
import { limitesGenerales } from "@rige/opencode/reglas";
import { generarTextoCongelado } from "../../../../../pruebas/utilidades/generar-texto-congelado";

const rutaDatos = resolve(import.meta.dir, "../../../../../pruebas/datos/texto-T5-32.json");
const datos = JSON.parse(readFileSync(rutaDatos, "utf8")) as {
  casos: {
    id: string;
    sha256: string;
  }[];
};

describe("T5-32 X-1 texto congelado", () => {
  test(`compara ${datos.casos.length} salidas de renderizar contra texto-T5-32.json`, () => {
    const generados = generarTextoCongelado();
    expect(generados.casos.length, "cantidad de casos respecto a texto-T5-32.json").toBe(datos.casos.length);
    expect(
      generados.casos.map((c) => c.id),
      "ids de casos en el mismo orden que texto-T5-32.json",
    ).toEqual(datos.casos.map((c) => c.id));

    const esperadosPorId = new Map(datos.casos.map((c) => [c.id, c.sha256]));
    const conjuntoLimites = new Set(limitesGenerales);
    for (const caso of generados.casos) {
      const sub = subcomandos.find((s) => s.nombre === caso.comando);
      expect(sub, caso.id).toBeDefined();
      const contexto: ContextoPresentacion = {
        ...caso.contexto,
        limitesGenerales: conjuntoLimites,
      };
      const salida = (sub!.renderizar as (r: unknown, c: ContextoPresentacion) => string)(
        caso.respuesta,
        contexto,
      );
      const sha256 = createHash("sha256").update(salida, "utf8").digest("hex");
      expect(sha256, `${caso.id}\n${salida}`).toBe(esperadosPorId.get(caso.id)!);
    }
  });
});
