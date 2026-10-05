import type { ErrorUso } from "../../../aplicacion/errores";
import { html } from "../plantillas";
import { responderHtml } from "../respuesta";

const estadoPorCodigo: Record<ErrorUso["codigo"], number> = {
  "almacen-sin-esquema": 503,
  "configuracion-invalida": 500,
  "puerto-ocupado": 500,
  "solicitud-invalida": 400,
  "proyecto-inexistente": 404,
  "resolucion-inexistente": 404,
  "agente-sin-declaraciones": 404,
  "clave-inexistente": 404,
  "clave-no-resuelta": 422,
  "via-no-soportada": 422,
  "contenido-no-soportado": 422,
  "entrada-ilegible": 422,
  "entorno-incompleto": 500,
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
