import type { consultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import { errorPuertoOcupado, type ErrorUso } from "../../aplicacion/errores";
import { conErrores, paginaErrorUso } from "./intermedios/errores";
import { paginaInicio } from "./paginas/inicio";
import { html } from "./plantillas";

export type ConsultarEstado = () => ReturnType<typeof consultarEstado>;

export function crearManejador(consultar: ConsultarEstado): (solicitud: Request) => Response {
  return conErrores((solicitud) => {
    if (new URL(solicitud.url).pathname !== "/") {
      const pagina = html`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>RIGE</title></head><body><p>Página no encontrada.</p></body></html>`;
      return new Response(pagina.texto, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    const resultado = consultar();
    return resultado.exito ? paginaInicio(resultado.valor) : paginaErrorUso(resultado.error);
  });
}

export interface ServidorIniciado {
  readonly direccion: string;
  detener(): void;
}

export function iniciarServidor(puerto: number, consultar: ConsultarEstado):
  | { readonly exito: true; readonly valor: ServidorIniciado }
  | { readonly exito: false; readonly error: ErrorUso } {
  try {
    const servidor = Bun.serve({ hostname: "127.0.0.1", port: puerto, fetch: crearManejador(consultar) });
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
