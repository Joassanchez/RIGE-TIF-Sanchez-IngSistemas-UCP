import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createScanner, SyntaxKind } from "typescript/unstable/ast";
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

function llamadasInseguras(directorio: string): string[] {
  const inseguras: string[] = [];
  for (const archivo of new Bun.Glob("**/*.ts").scanSync({ cwd: directorio, onlyFiles: true })) {
    const scanner = createScanner(true, undefined, readFileSync(join(directorio, archivo), "utf8"));
    const tokens: { clase: SyntaxKind; texto: string }[] = [];
    const plantillas: number[] = [];
    let llaves = 0;
    for (let clase = scanner.scan(); clase !== SyntaxKind.EndOfFile; clase = scanner.scan()) {
      if (clase === SyntaxKind.CloseBraceToken && plantillas.at(-1) === llaves) {
        clase = scanner.reScanTemplateToken(false);
        if (clase === SyntaxKind.TemplateTail) plantillas.pop();
      } else if (clase === SyntaxKind.OpenBraceToken) {
        llaves++;
      } else if (clase === SyntaxKind.CloseBraceToken) {
        llaves--;
      }
      if (clase === SyntaxKind.TemplateHead) plantillas.push(llaves);
      if (scanner.isUnterminated() || clase === SyntaxKind.Unknown) throw new Error(`Fuente no analizable: ${archivo}`);
      tokens.push({ clase, texto: scanner.getTokenText() });
    }
    for (let indice = 0; indice < tokens.length; indice++) {
      const token = tokens[indice]!;
      if (token.clase !== SyntaxKind.Identifier || token.texto !== "sinEscapar"
        || tokens[indice - 1]?.clase === SyntaxKind.FunctionKeyword
        || tokens[indice + 1]?.clase !== SyntaxKind.OpenParenToken) continue;
      if (tokens[indice + 2]?.clase !== SyntaxKind.StringLiteral
        || tokens[indice + 3]?.clase !== SyntaxKind.CloseParenToken) inseguras.push(archivo);
    }
  }
  return inseguras.sort();
}

describe("P-2", () => {
  test("solo permite literales simples en sinEscapar y detecta una sonda temporal variable", () => {
    expect(llamadasInseguras(import.meta.dir)).toEqual([]);
    const temporal = mkdtempSync(join(tmpdir(), "rige-plantillas-"));
    try {
      const archivo = join(temporal, "sonda.ts");
      writeFileSync(archivo, 'sinEscapar("<hr>"); sinEscapar(\'<br>\'); // sinEscapar(variable)\nconst texto = "sinEscapar(variable)";');
      expect(llamadasInseguras(temporal)).toEqual([]);
      for (const codigo of ['sinEscapar(variable);', 'sinEscapar("<" + variable);', 'sinEscapar(`<p>${variable}</p>`);', 'html`<p>${sinEscapar(variable)}</p>`;']) {
        writeFileSync(archivo, codigo);
        expect(llamadasInseguras(temporal)).toEqual(["sonda.ts"]);
      }
    } finally { rmSync(temporal, { recursive: true, force: true }); }
  });
});
