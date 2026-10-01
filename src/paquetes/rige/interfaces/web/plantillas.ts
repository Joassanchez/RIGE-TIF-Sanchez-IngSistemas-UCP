export class HtmlSeguro {
  constructor(readonly texto: string) {}
}

export function sinEscapar(texto: string): HtmlSeguro {
  return new HtmlSeguro(texto);
}

function presentar(valor: unknown): string {
  if (valor instanceof HtmlSeguro) return valor.texto;
  if (Array.isArray(valor) && valor.every((fragmento) => fragmento instanceof HtmlSeguro)) {
    return valor.map((fragmento: HtmlSeguro) => fragmento.texto).join("");
  }
  return String(valor).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export function html(partes: TemplateStringsArray, ...valores: readonly unknown[]): HtmlSeguro {
  return new HtmlSeguro(partes.reduce((texto, parte, indice) =>
    texto + parte + (indice < valores.length ? presentar(valores[indice]) : ""), ""));
}
