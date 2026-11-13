import { describe, expect, test } from "bun:test";
import { paginaEntradas } from "./entradas";
import { estilos } from "../estilos";
import { seccionHtml, textoHtml } from "../../../../../pruebas/utilidades/html";

function css(selector: string, texto = estilos): string {
  return [...texto.replace(/\/\*[^]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectores]) => selectores!.split(",").some(s => s.trim() === selector))
    .map(([, , declaraciones]) => declaraciones).join("\n");
}

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
    expect(cuerpo).toContain('id="lugares-revisados"');
    expect(cuerpo).toContain('href="#revisados-');
    expect(cuerpo.match(/<table[\s\S]*?<\/table>/g)?.join("") ?? "").not.toContain("<details");
    expect(cuerpo).not.toContain("insignia--permitida");
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

describe("Mapa de vías y presentación de entradas", () => {
  const json = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);
  const base = { esquema: 2 as const, proyecto: "/proyecto", entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };

  test("T5-15 Z-6 mapa agrupado: presentes, ausentes, no observadas; mantiene orden interno y JSON original", async () => {
    const respuesta = { ...base, vias: [
      { via: "remota", estado: "no_observada" as const, cantidad: 0, revisados: [] },
      { via: "vacia", estado: "ausente" as const, cantidad: 0, revisados: [] },
      ...["segunda", "primera"].map(via => ({ via, estado: "presente" as const, cantidad: 1, revisados: [] })) ] };
    const cuerpo = await paginaEntradas(respuesta).text();
    const mapa = seccionHtml(cuerpo, "mapa-vias");
    const posiciones = ["Presentes", ">segunda</td>", ">primera</td>", "Ausentes", ">vacia</td>", "No observadas", ">configuración remota</td>"].map(s => mapa.indexOf(s));
    expect(posiciones.every(p => p >= 0)).toBe(true);
    expect(posiciones).toEqual([...posiciones].sort((a, b) => a - b));
    expect(json(cuerpo)).toEqual(respuesta);
  });

  test("T5-22 B-4 mapa en tarjetas sin encabezados de columna sticky sobre el grupo", async () => {
    const entradas = { ...base, vias: [{ via: "proyecto", estado: "presente" as const, cantidad: 1, revisados: ["/p/opencode.json"] }] };
    const s = await paginaEntradas(entradas).text();
    expect(s).toContain('class="grupos-entradas"');
    expect(s).toContain('class="grupo-entradas grupo-entradas--presente"');
    expect(s).toContain('class="grupo-entradas grupo-entradas--ausente"');
    expect(s).toContain('class="grupo-entradas grupo-entradas--no-observada"');
    expect(css(".grupo-entradas--presente")).toMatch(/border-left-color:\s*var\(--marca\)/);
    expect(css(".grupo-entradas--ausente")).toMatch(/border-left-color:\s*var\(--neutro\)/);
    expect(css(".grupo-entradas--no-observada")).toMatch(/border-left-color:\s*var\(--parcial\)/);
    const movil = estilos.split("@media (max-width: 640px) {").slice(1).join("\n");
    expect(css(".tabla-tarjetas thead th", movil)).toMatch(/position:\s*static/);
    expect(css(".grupos-entradas", estilos)).toMatch(/gap:\s*1\.5rem/);
  });

  test("P-7 archivos por precedencia, mapa agrupado y lugares plegados", async () => {
    const contexto = { idResolucion: "7", agente: "a/b", agentes: [{ nombre: "a/b" }], instante: "2026-11-11T12:00:00Z" };
    const entradasP7 = { ...base, entradas: [
      { orden: 2, via: "proyecto", referencia: "/p/proyecto/config.json", condicion: "observada" as const, resumen: "x" },
      { orden: 0, via: "global", referencia: "/global/config.json", condicion: "observada" as const, resumen: "y" },
    ], vias: [{ via: "proyecto", estado: "presente" as const, cantidad: 1, revisados: ["/p/proyecto/config.json"] },
      { via: "ausente", estado: "ausente" as const, cantidad: 0, revisados: ["/ausente"] }, { via: "remota", estado: "no_observada" as const, cantidad: 0, revisados: [] }] };
    const cuerpo = await paginaEntradas(entradasP7, contexto).text();
    expect(cuerpo).toContain("la de abajo prevalece");
    expect(cuerpo.indexOf('id="entrada-0"')).toBeLessThan(cuerpo.indexOf('id="entrada-2"'));
    for (const grupo of ["Presentes", "Ausentes", "No observadas"]) expect(cuerpo).toContain(grupo);
    expect(cuerpo).toContain('id="lugares-revisados"');
    expect(cuerpo.match(/<table[\s\S]*?<\/table>/g)?.join("") ?? "").not.toContain("<details");
    expect(cuerpo).not.toMatch(/<details[^>]* open/); expect(json(cuerpo)).toEqual(entradasP7);
    const pie = cuerpo.split('class="pie-desarrolladores"')[1]!;
    expect(pie).toContain('id="entradas-leidas"');
    expect(cuerpo.split('class="pie-desarrolladores"')[0]).not.toMatch(/\b[0-9a-f]{64}\b/);
  });
});
