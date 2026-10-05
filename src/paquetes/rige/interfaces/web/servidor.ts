import type { ConsultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import type { ResolverProyecto } from "../../aplicacion/casos-uso/resolver-proyecto";
import type { ConsultarResolucion } from "../../aplicacion/casos-uso/consultar-resolucion";
import type { Resultado } from "../../aplicacion/respuestas/resultado";
import { errorPuertoOcupado, errorSolicitudInvalida, type ErrorUso } from "../../aplicacion/errores";
import { conErrores, paginaErrorUso } from "./intermedios/errores";
import { conVerificacionDeOrigen } from "./intermedios/origen";
import { paginaInicio } from "./paginas/inicio";
import { paginaResolucion } from "./paginas/resolucion";
import { html } from "./plantillas";
import { redirigir, responderHtml } from "./respuesta";

export interface CasosWeb {
  readonly consultarEstado: ConsultarEstado;
  readonly resolverProyecto: ResolverProyecto;
  readonly consultarResolucion: ConsultarResolucion;
}

export function crearManejador(puerto: number, casos: CasosWeb): (solicitud: Request) => Response {
  const enrutar = (solicitud: Request): Response => {
    const url = new URL(solicitud.url);
    if (url.pathname === "/resolver") {
      const agente = url.searchParams.get("agente") ?? "";
      const clave = url.searchParams.get("clave") ?? "";
      if (!agente.trim()) return paginaErrorUso(errorSolicitudInvalida("el agente esta vacio"));
      const resultado = casos.resolverProyecto(url.searchParams.get("proyecto") ?? "", agente, clave);
      if (!resultado.exito) return paginaErrorUso(resultado.error);
      return redirigir(`/resoluciones/${resultado.valor.id}?agente=${encodeURIComponent(agente)}${clave ? `&clave=${encodeURIComponent(clave)}` : ""}`);
    }
    const id = /^\/resoluciones\/([0-9]+)$/.exec(url.pathname)?.[1];
    if (id !== undefined) {
      const resultado = casos.consultarResolucion(id, url.searchParams.get("agente") ?? "", url.searchParams.get("clave") ?? "");
      return resultado.exito ? paginaResolucion(resultado.valor) : paginaErrorUso(resultado.error);
    }
    if (url.pathname !== "/") {
      const pagina = html`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>RIGE</title></head><body><p>Página no encontrada.</p></body></html>`;
      return responderHtml(404, pagina);
    }
    const resultado = casos.consultarEstado();
    return resultado.exito ? paginaInicio(resultado.valor) : paginaErrorUso(resultado.error);
  };
  return conErrores(conVerificacionDeOrigen(puerto, enrutar));
}

export interface ServidorIniciado {
  readonly direccion: string;
  detener(): void;
}

export function iniciarServidor(puerto: number, casos: CasosWeb): Resultado<ServidorIniciado, ErrorUso> {
  try {
    const servidor = Bun.serve({ hostname: "127.0.0.1", port: puerto, fetch: crearManejador(puerto, casos) });
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
