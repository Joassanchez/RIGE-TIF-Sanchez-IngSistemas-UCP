class HtmlSeguro {
  constructor(readonly texto: string) {}
}

export type { HtmlSeguro };

// Solo serializa datos JSON; nunca acepta HTML arbitrario sin escapar.
export function datosRespuesta(respuesta: unknown): HtmlSeguro {
  const dato = JSON.stringify(respuesta).replaceAll("<", "\\u003c");
  return new HtmlSeguro(`<script type="application/json" id="respuesta">${dato}</script>`);
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
