import { describe, expect, test } from "bun:test";
import { paginaEntradas } from "./entradas";

describe("T3-03 R-6 escape de entradas", () => {
  test("escapa todas las referencias y declaraciones e incluye datos JSON sin etiquetas ejecutables", async () => {
    const ataque = '</script><script>alert("x")</script>';
    const respuesta = { esquema: 2 as const, proyecto: ataque, resumenEntradas: "a".repeat(64), declaraciones: ["advertencia"],
      reglas: { advertencia: ataque }, entradas: [{ orden: 0, via: ataque, referencia: ataque, condicion: "observada" as const,
        resumen: "b".repeat(64), legibilidad: "ilegible" as const, error: { linea: 3, columna: 5, consecuencia: "falla" as const } }] };
    const pagina = paginaEntradas(respuesta);
    expect(pagina.status).toBe(200);
    const cuerpo = await pagina.text();
    expect(cuerpo).not.toContain(ataque);
    expect(cuerpo).toContain("&lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(cuerpo).toContain("3:5 (falla)");
    expect(JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(respuesta);
  });
});
