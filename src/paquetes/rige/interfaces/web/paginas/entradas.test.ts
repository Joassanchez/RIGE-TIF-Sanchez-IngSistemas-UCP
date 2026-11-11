import { describe, expect, test } from "bun:test";
import { paginaEntradas } from "./entradas";
import { estilos } from "../estilos";
import { textoHtml } from "../../../../../pruebas/utilidades/html";

describe("T5-12 M-4 PC-07 PC-08", () => {
  const anterior = { esquema: 2 as const, proyecto: "/p", resumenEntradas: "abc", declaraciones: [], reglas: {}, entradas: [] };
  test("sin mapa mantiene compatibilidad y no inventa estados", async () => {
    const cuerpo = await paginaEntradas(anterior).text();
    expect(cuerpo).toContain("Mapa de vías no disponible");
    expect(cuerpo).toContain('id="tabla-entradas"');
    expect(cuerpo).not.toContain('id="mapa-vias"');
  });
  test("mapa primero, cantidades recibidas, plegables escapados y un solo JSON identico", async () => {
    const ataque = 'C:\\a&"\\</script><script>alert("x")</script>';
    const respuesta = { ...anterior, vias: [
      { via: ataque, estado: "presente" as const, cantidad: 7, revisados: [ataque] },
      { via: "vacia", estado: "ausente" as const, cantidad: 0, revisados: ["/ausente"] },
      { via: "remota", estado: "no_observada" as const, cantidad: 0, revisados: [] },
    ] };
    const cuerpo = await paginaEntradas(respuesta, { idResolucion: "foto" }).text();
    expect(cuerpo.indexOf('id="mapa-vias"')).toBeGreaterThan(0);
    expect(cuerpo.indexOf('id="mapa-vias"')).toBeLessThan(cuerpo.indexOf('id="tabla-entradas"'));
    expect(cuerpo).toContain('data-etiqueta="Cantidad">7<');
    for (const tipo of ["neutra", "no-observada"]) expect(cuerpo).toContain(`insignia--${tipo}`);
    expect(cuerpo).not.toContain("insignia--permitida");
    expect(cuerpo).toContain("<details>");
    expect(cuerpo).toContain("<summary>Lugares revisados</summary>");
    expect(cuerpo).toContain("&amp;&quot;");
    expect(cuerpo).not.toContain(ataque);
    expect(cuerpo).not.toContain("style=");
    expect(cuerpo.match(/id="respuesta"/g)).toHaveLength(1);
    expect(JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(respuesta);
    expect(cuerpo).toContain("Migas de pan");
    expect(cuerpo).not.toContain("Panel del proyecto");
    expect(estilos).toMatch(/\.insignia--no-observada\s*\{[^}]*border:[^}]*dotted/);
    expect(estilos).toMatch(/\.mapa-vias[^}]*overflow-wrap: anywhere/);
  });
});

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
    expect(textoHtml(cuerpo)).toContain("3:5 (falla)");
    expect(JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(respuesta);
  });
});
