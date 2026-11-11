import { describe, expect, test } from "bun:test";
import { presentarRuta, presentarUbicacion } from "./rutas";

describe("T5-18 R-8 rutas UNC", () => {
  test("rutas absolutas de Windows normalizadas y vías remotas se distinguen por su referencia estructurada", () => {
    for (const ruta of ["\\\\servidor\\carpeta\\a b.json", "//servidor/carpeta/a b.json"]) {
      expect(presentarUbicacion(ruta, { linea: 2, columna: 3 }, "proyecto").texto).toContain('href="vscode://file//servidor/carpeta/a%20b.json:2:3"');
    }
    expect(presentarUbicacion("//servidor/carpeta/a b.json", { linea: 2, columna: 3 }, "remota-wellknown").texto).not.toContain("<a ");
  });
});

describe("T5-08-c1 C2 rutas", () => {
  test("escapa cada segmento y el title completo; conserva todo el texto visible", () => {
    const ruta = '/directorio <uno>/a & b/\'"archivo"\'.jsonc:12:3';
    const cuerpo = presentarRuta(ruta).texto;
    expect(cuerpo).toContain('title="/directorio &lt;uno&gt;/a &amp; b/&#39;&quot;archivo&quot;&#39;.jsonc:12:3"');
    expect(cuerpo).toContain('<strong class="ruta__archivo">&#39;&quot;archivo&quot;&#39;.jsonc:12:3</strong>');
    expect(cuerpo).toContain('class="ruta__directorio"');
    expect(cuerpo).toContain('class="ruta__segmento">directorio &lt;uno&gt;/</span><wbr>');
    expect(cuerpo).toContain('class="ruta__segmento">a &amp; b/</span><wbr>');
    expect(cuerpo.replace(/<[^>]*>/g, "")).toBe('/directorio &lt;uno&gt;/a &amp; b/&#39;&quot;archivo&quot;&#39;.jsonc:12:3');
    expect(cuerpo).not.toContain("<uno>");
    expect(cuerpo).not.toMatch(/style=|<script|<style/i);
  });
  test.each(["archivo.json:1:2", "OPENCODE_CONFIG", "/", "/p/", "C:/raiz/proyecto"])("conserva %s sin normalizar ni omitir segmentos", ruta => {
    const cuerpo = presentarRuta(ruta).texto;
    expect(cuerpo).toContain(`title="${ruta}"`);
    expect(cuerpo.replace(/<[^>]*>/g, "")).toBe(ruta);
    expect(cuerpo.match(/<wbr>/g)?.length ?? 0).toBe(ruta.split("/").length - 1);
  });
});
