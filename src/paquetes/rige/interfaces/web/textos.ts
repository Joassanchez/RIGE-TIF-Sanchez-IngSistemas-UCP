import { html, type HtmlSeguro } from "./plantillas";
import { fechaLocal } from "../presentacion/fechas";
export { fechaLocal, fechaRelativa } from "../presentacion/fechas";

export function concordar(cantidad: number, singular: string, plural: string): string {
  return cantidad === 1 ? singular : plural;
}

export function nombreProyecto(ruta: string): string {
  if (/^[a-z]:[\\/]*$/i.test(ruta)) return ruta;
  return ruta.replace(/[\\/]+$/, "").split(/[\\/]/).at(-1) || ruta;
}

export function nombreAnalisis(proyecto: string, instante: string): string {
  return `${nombreProyecto(proyecto)} · ${fechaLocal(instante)}`;
}

// Sin sobre (p. ej. una lista sin agentes), no se inventan fechas ni se expone el id.
export function rotuloFoto(proyecto: string, instante?: string, fechaNoDisponible?: string): HtmlSeguro {
  return instante === undefined
    ? fechaNoDisponible === undefined ? html`` : html`<small>Fecha no disponible (${fechaNoDisponible})</small>`
    : html`<p>Foto guardada · ${nombreAnalisis(proyecto, instante)}</p>`;
}

export function presentarInstante(instante: string): HtmlSeguro {
  return html`<time datetime="${instante}">${fechaLocal(instante)}</time>`;
}
