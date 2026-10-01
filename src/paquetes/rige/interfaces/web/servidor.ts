import type { ConsultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import type { Resultado } from "../../aplicacion/respuestas/resultado";
import { errorPuertoOcupado, type ErrorUso } from "../../aplicacion/errores";
import { conErrores, paginaErrorUso } from "./intermedios/errores";
import { conVerificacionDeOrigen } from "./intermedios/origen";
import { paginaInicio } from "./paginas/inicio";
import { html } from "./plantillas";
import { responderHtml } from "./respuesta";

export function crearManejador(puerto: number, consultar: ConsultarEstado): (solicitud: Request) => Response {
  const enrutar = (solicitud: Request): Response => {
    if (new URL(solicitud.url).pathname !== "/") {
      const pagina = html`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>RIGE</title></head><body><p>Página no encontrada.</p></body></html>`;
      return responderHtml(404, pagina);
    }
    const resultado = consultar();
    return resultado.exito ? paginaInicio(resultado.valor) : paginaErrorUso(resultado.error);
  };
  return conErrores(conVerificacionDeOrigen(puerto, enrutar));
}

export interface ServidorIniciado {
  readonly direccion: string;
  detener(): void;
}

export function iniciarServidor(puerto: number, consultar: ConsultarEstado): Resultado<ServidorIniciado, ErrorUso> {
  try {
    const servidor = Bun.serve({ hostname: "127.0.0.1", port: puerto, fetch: crearManejador(puerto, consultar) });
    return {
      exito: true,
      valor: { direccion: `http://127.0.0.1:${puerto}`, detener: () => { servidor.stop(true); } },
    };
  } catch (falla) {
    if (typeof falla === "object" && falla !== null && "code" in falla && falla.code === "EADDRINUSE") {
      return { exito: false, error: errorPuertoOcupado(puerto) };
    }
    throw falla;
  }
}
