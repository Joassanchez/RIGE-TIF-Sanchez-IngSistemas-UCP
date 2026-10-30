import { describe, expect, test } from "bun:test";
import { leerVia } from "./leer-via";
import { adaptadorFicticio } from "../../../pruebas/utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../../../pruebas/utilidades/entorno-memoria";

describe("T3-03-c1 R-4 lectura comun", () => {
  test("lee una sola vez y solo la marca constituyeEntrada aporta contenido variable", () => {
    let leidas = 0;
    const memoria = crearEntornoMemoria({ archivos: { "/a": "{}" }, variables: { CONFIG: "{}" } });
    const entorno = { ...memoria, variable: (n: string) => { leidas++; return memoria.variable(n); } };
    const contexto = { proyecto: "/p", entorno, parametros: {}, declaraciones: [] };
    for (const constituyeEntrada of [undefined, true] as const) {
      leidas = 0;
      const r = leerVia(adaptadorFicticio, entorno, { via: "contenido", referencia: "CONFIG", condicion: "definida",
        ...(constituyeEntrada ? { constituyeEntrada } : {}) }, 2, contexto);
      expect(r.exito).toBe(true);
      if (!r.exito) throw new Error(r.error.mensaje);
      expect(leidas).toBe(1);
      expect(r.valor.huella).toBe(constituyeEntrada ? memoria.resumir("{}") : null);
      expect(r.valor.entrada).toEqual({ orden: 2, via: "contenido", referencia: "CONFIG", condicion: "definida", resumen: null });
    }
    const archivo = leerVia(adaptadorFicticio, entorno, { via: "archivo", referencia: "/a", condicion: "observada" }, 0, contexto);
    expect(archivo).toMatchObject({ exito: true, valor: { huella: memoria.resumir("{}"), entrada: { resumen: memoria.resumir("{}") } } });
  });
});
