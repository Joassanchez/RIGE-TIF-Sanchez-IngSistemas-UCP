import { html, type HtmlSeguro } from "./plantillas";

export function concordar(cantidad: number, singular: string, plural: string): string {
  return cantidad === 1 ? singular : plural;
}

export function nombreProyecto(ruta: string): string {
  if (/^[a-z]:[\\/]*$/i.test(ruta)) return ruta;
  return ruta.replace(/[\\/]+$/, "").split(/[\\/]/).at(-1) || ruta;
}

function fechaValida(instante: string): Date {
  const fecha = new Date(instante);
  if (Number.isNaN(fecha.getTime())) throw new Error("Instante inválido");
  return fecha;
}

const dosDigitos = (numero: number): string => String(numero).padStart(2, "0");
const horaLocal = (fecha: Date): string => `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;

// Hora local del servidor. Sin reloj implícito ni dependencia del navegador.
export function fechaLocal(instante: string): string {
  const fecha = fechaValida(instante);
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${horaLocal(fecha)}`;
}

export function fechaRelativa(instante: string, ahora: Date): string {
  if (Number.isNaN(ahora.getTime())) throw new Error("Instante actual inválido");
  const fecha = fechaValida(instante);
  const mismoDia = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (mismoDia(fecha, ahora)) return `hoy ${horaLocal(fecha)}`;
  const ayer = new Date(ahora);
  ayer.setDate(ayer.getDate() - 1);
  return mismoDia(fecha, ayer) ? `ayer ${horaLocal(fecha)}` : fechaLocal(instante);
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
