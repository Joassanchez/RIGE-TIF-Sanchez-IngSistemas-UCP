import { html, type HtmlSeguro } from "./plantillas";

// Conserva la frase y reemplaza solo la ubicación exacta de la referencia estructurada.
export function presentarTextoUbicado(texto: string, referencia: string | null, posicion: { readonly linea: number; readonly columna: number }, via?: string | null): HtmlSeguro {
  if (referencia === null) return html`${texto}`;
  const localizacion = `${referencia}:${posicion.linea}:${posicion.columna}`;
  const inicio = texto.indexOf(localizacion);
  return inicio < 0 ? html`${texto}`
    : html`${texto.slice(0, inicio)}${presentarUbicacion(referencia, posicion, via)}${texto.slice(inicio + localizacion.length)}`;
}

export function esArchivoLocal(referencia: string, via?: string | null): boolean {
  return via !== "variable-contenido" && via !== "variable-permiso" && !via?.startsWith("remota-")
    && (/^\//.test(referencia) || /^[a-z]:[\\/]/i.test(referencia) || /^\\\\[^\\]+\\/.test(referencia));
}

// La posición siempre proviene del contrato, nunca del texto de localización.
export function presentarUbicacion(referencia: string | null, posicion?: { readonly linea: number; readonly columna: number } | null, via?: string | null): HtmlSeguro {
  const ruta = referencia ?? "—";
  if (!posicion || !esArchivoLocal(ruta, via)) return html`<code>${ruta}${posicion ? `:${posicion.linea}:${posicion.columna}` : ""}</code>`;
  const normalizada = ruta.replaceAll("\\", "/");
  const codificar = (segmento: string) => encodeURIComponent(segmento).replaceAll("'", "%27").replaceAll('"', "%22");
  const partes = normalizada.split("/");
  const codificada = partes.map((parte, indice) => indice === 0 && /^[a-z]:$/i.test(parte) ? parte : codificar(parte)).join("/");
  const enlace = `vscode://file/${codificada.startsWith("/") ? codificada.slice(1) : codificada}:${posicion.linea}:${posicion.columna}`;
  return html`<a href="${enlace}" title="${`Abrir en VS Code: ${ruta}`}">${partes.at(-1)}:${posicion.linea}:${posicion.columna}</a>`;
}

export function presentarRuta(ruta: string): HtmlSeguro {
  const separador = ruta.lastIndexOf("/");
  const directorio = ruta.slice(0, separador + 1);
  const archivo = ruta.slice(separador + 1);
  // El texto del DOM conserva la ruta en orden; CSS destaca el archivo arriba.
  // Cada segmento se escapa por separado y solo se corta despues de una barra.
  return html`<code class="ruta" title="${ruta}">${directorio ? html`<span class="ruta__directorio">${directorio.split("/").slice(0, -1).map(segmento => html`<span class="ruta__segmento">${segmento}/</span><wbr>`)}</span>` : html``}<strong class="ruta__archivo">${archivo}</strong></code>`;
}
