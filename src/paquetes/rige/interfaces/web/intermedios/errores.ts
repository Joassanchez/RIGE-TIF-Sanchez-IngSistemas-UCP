import type { ErrorUso } from "../../../aplicacion/errores";
import { contenidoError, diseno } from "../diseno";
import { responderHtml } from "../respuesta";

const estadoPorCodigo: Record<ErrorUso["codigo"], number> = {
  "almacen-sin-esquema": 503,
  "configuracion-invalida": 422,
  "puerto-ocupado": 500,
  "solicitud-invalida": 400,
  "proyecto-inexistente": 404,
  "resolucion-inexistente": 404,
  "agente-sin-declaraciones": 404,
  "clave-no-resuelta": 422,
  "via-no-soportada": 422,
  "version-no-soportada": 422,
  "contenido-no-soportado": 422,
  "entrada-ilegible": 422,
  "entorno-incompleto": 500,
};

export function paginaErrorUso(error: ErrorUso, proyecto?: string, hogar?: string): Response {
  const estado = Object.hasOwn(estadoPorCodigo, error.codigo) ? estadoPorCodigo[error.codigo]! : 422;
  const contexto = proyecto === undefined && hogar === undefined ? undefined
    : { ...(proyecto === undefined ? {} : { proyecto }), ...(hogar === undefined ? {} : { hogar }) };
  return responderHtml(estado, diseno(`Error ${estado}`, contenidoError(estado, error.mensaje, error.codigo, contexto)));
}

export function conErrores(manejador: (solicitud: Request) => Response): (solicitud: Request) => Response {
  return (solicitud) => {
    try {
      return manejador(solicitud);
    } catch {
      const pagina = diseno("Error 500", contenidoError(500, "Falla interna de RIGE.", "interno"));
      return responderHtml(500, pagina);
    }
  };
}
