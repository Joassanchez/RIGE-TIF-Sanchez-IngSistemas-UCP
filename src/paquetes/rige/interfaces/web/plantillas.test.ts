import { describe, expect, test } from "bun:test";
import { html } from "./plantillas";

describe("W-1", () => {
  test("escapa valores y compone solo fragmentos seguros sin escapar", () => {
    expect(html`<p>${"&<>\"'"}</p>`.texto).toBe("<p>&amp;&lt;&gt;&quot;&#39;</p>");
    const ataque = html`<p>${"<script>alert(1)</script>"}</p>`;
    expect(ataque.texto).not.toContain("<script");
    expect(html`${html`<hr>`}${html`<b>${"<"}</b>`}`.texto).toBe("<hr><b>&lt;</b>");
    expect(html`${[html`<i>${1}</i>`, html`<br>`]}`.texto).toBe("<i>1</i><br>");
    expect(html`${["<script>", "&"]}`.texto).toBe("&lt;script&gt;,&amp;");
    expect(html`${null}${undefined}${false}${42}`.texto).toBe("nullundefinedfalse42");
  });
});

describe("P-1", () => {
  test("escapa cada caracter, entidades, arreglos mixtos y valores sin duplicar el escape seguro", () => {
    for (const [entrada, salida] of [["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ['"', "&quot;"], ["'", "&#39;"]] as const) {
      expect(html`${entrada}`.texto).toBe(salida);
    }
    expect(html`${"&amp;"}`.texto).toBe("&amp;amp;");
    expect(html`<section>${html`<b>${"<&"}</b>`}</section>`.texto).toBe("<section><b>&lt;&amp;</b></section>");
    const mixto = html`${[html`<i>${"<"}</i>`, "<script>&"]}`.texto;
    expect(mixto).not.toContain("<");
    expect(mixto).toContain("&lt;script&gt;&amp;");
    expect(html`${42}|${0}|${null}|${undefined}`.texto).toBe("42|0|null|undefined");
  });
});

describe("W-6", () => {
  test("exporta solo html y escapa un script interpolado", async () => {
    expect(Object.keys(await import("./plantillas"))).toEqual(["html"]);
    expect(html`<p>${"<script>alert(1)</script>"}</p>`.texto)
      .toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  });
});
