import { html, type HtmlSeguro } from "./plantillas";

export function presentarRuta(ruta: string): HtmlSeguro {
  const separador = ruta.lastIndexOf("/");
  const directorio = ruta.slice(0, separador + 1);
  const archivo = ruta.slice(separador + 1);
  // El texto del DOM conserva la ruta en orden; CSS destaca el archivo arriba.
  // Cada segmento se escapa por separado y solo se corta despues de una barra.
  return html`<code class="ruta" title="${ruta}">${directorio ? html`<span class="ruta__directorio">${directorio.split("/").slice(0, -1).map(segmento => html`<span class="ruta__segmento">${segmento}/</span><wbr>`)}</span>` : html``}<strong class="ruta__archivo">${archivo}</strong></code>`;
}
