import type { ErrorUso } from "../../../aplicacion/errores";
import { html } from "../plantillas";

export function paginaErrorUso(error: ErrorUso): Response {
  const pagina = html`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Error de RIGE</title></head><body><p>${error.mensaje}</p></body></html>`;
  return new Response(pagina.texto, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export function conErrores(manejador: (solicitud: Request) => Response): (solicitud: Request) => Response {
  return (solicitud) => {
    try {
      return manejador(solicitud);
    } catch {
      const pagina = html`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Error de RIGE</title></head><body><p>Falla interna de RIGE.</p></body></html>`;
      return new Response(pagina.texto, { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
  };
}
