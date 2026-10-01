import { describe, expect, test } from "bun:test";
import { HtmlSeguro, html, sinEscapar } from "./plantillas";

describe("W-1", () => {
  test("escapa valores y compone solo fragmentos seguros sin escapar", () => {
    expect(html`<p>${"&<>\"'"}</p>`.texto).toBe("<p>&amp;&lt;&gt;&quot;&#39;</p>");
    const ataque = html`<p>${"<script>alert(1)</script>"}</p>`;
    expect(ataque).toBeInstanceOf(HtmlSeguro);
    expect(ataque.texto).not.toContain("<script");
    expect(html`${sinEscapar("<hr>")}${html`<b>${"<"}</b>`}`.texto).toBe("<hr><b>&lt;</b>");
    expect(html`${[html`<i>${1}</i>`, sinEscapar("<br>")]}`.texto).toBe("<i>1</i><br>");
    expect(html`${["<script>", "&"]}`.texto).toBe("&lt;script&gt;,&amp;");
    expect(html`${null}${undefined}${false}${42}`.texto).toBe("nullundefinedfalse42");
  });
});
