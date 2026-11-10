import { html, type HtmlSeguro } from "./plantillas";

export function concordar(cantidad: number, singular: string, plural: string): string {
  return cantidad === 1 ? singular : plural;
}

// Hora local del servidor, sin depender de la fecha de renderizado ni del navegador.
export function presentarInstante(instante: string, incluirIso = false): HtmlSeguro {
  const fecha = new Date(instante);
  const legible = Number.isNaN(fecha.getTime()) ? instante : new Intl.DateTimeFormat("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  }).format(fecha);
  return html`<time datetime="${instante}" title="${instante}">${legible}</time>${incluirIso ? html` <code>(${instante})</code>` : html``}`;
}
