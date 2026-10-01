import type { ErrorUso } from "../../../aplicacion/errores";
import { html } from "../plantillas";
import { responderHtml } from "../respuesta";

const estadoPorCodigo: Record<ErrorUso["codigo"], number> = {
  "almacen-sin-esquema": 503,
  "configuracion-invalida": 500,
  "puerto-ocupado": 500,
};

export function paginaErrorUso(error: ErrorUso): Response {
  const pagina = html`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Error de RIGE</title></head><body><p>${error.mensaje}</p></body></html>`;
  return responderHtml(estadoPorCodigo[error.codigo], pagina);
}

export function conErrores(manejador: (solicitud: Request) => Response): (solicitud: Request) => Response {
  return (solicitud) => {
    try {
      return manejador(solicitud);
    } catch {
      const pagina = html`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Error de RIGE</title></head><body><p>Falla interna de RIGE.</p></body></html>`;
      return responderHtml(500, pagina);
    }
  };
}
