import type { ConsultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import type { ResolverProyecto } from "../../aplicacion/casos-uso/resolver-proyecto";
import type { ConsultarResolucion } from "../../aplicacion/casos-uso/consultar-resolucion";
import type { Resultado } from "../../aplicacion/respuestas/resultado";
import { errorPuertoOcupado, errorSolicitudInvalida, type ErrorUso } from "../../aplicacion/errores";
import { conErrores, paginaErrorUso } from "./intermedios/errores";
import { conVerificacionDeOrigen } from "./intermedios/origen";
import { paginaInicio } from "./paginas/inicio";
import { paginaResolucion } from "./paginas/resolucion";
import type { consultarPermisoGuardado, consultarAgentesGuardados } from "../../aplicacion/casos-uso/consultar-guardada";
import { paginaPermiso } from "./paginas/permiso";
import { paginaAgentes } from "./paginas/agentes";
import { html } from "./plantillas";
import { redirigir, responderHtml } from "./respuesta";

export interface CasosWeb {
  readonly consultarEstado: ConsultarEstado;
  readonly resolverProyecto: ResolverProyecto;
  readonly consultarResolucion: ConsultarResolucion;
  readonly consultarPermiso: (id: string, solicitud: Parameters<typeof consultarPermisoGuardado>[2]) => ReturnType<typeof consultarPermisoGuardado>;
  readonly consultarAgentes: (id: string) => ReturnType<typeof consultarAgentesGuardados>;
}

export function crearManejador(puerto: number, casos: CasosWeb): (solicitud: Request) => Response {
  const enrutar = (solicitud: Request): Response => {
    const url = new URL(solicitud.url);
    if (url.pathname === "/permiso") {
      const parametros = url.searchParams;
      if (parametros.has("sujeto") === parametros.has("herramienta")) {
        return paginaErrorUso(errorSolicitudInvalida("indique sujeto o herramienta, en forma excluyente"));
      }
      const accion = parametros.has("herramienta") ? { herramienta: parametros.get("herramienta")! }
        : { sujeto: parametros.get("sujeto")! };
      const resultado = casos.consultarPermiso(parametros.get("id") ?? "", {
        agente: parametros.get("agente") ?? "", objetivo: parametros.get("objetivo") ?? "",
        ...accion,
        ...(parametros.has("lanzadoPor") ? { lanzadoPor: parametros.get("lanzadoPor")! } : {}),
      });
      return resultado.exito ? paginaPermiso(resultado.valor) : paginaErrorUso(resultado.error);
    }
    if (url.pathname === "/agentes") {
      const resultado = casos.consultarAgentes(url.searchParams.get("id") ?? "");
      return resultado.exito ? paginaAgentes(resultado.valor) : paginaErrorUso(resultado.error);
    }
    if (url.pathname === "/resolver") {
      const agente = url.searchParams.get("agente") ?? "";
      const clave = url.searchParams.get("clave") ?? "";
      if (!agente.trim()) return paginaErrorUso(errorSolicitudInvalida("el agente esta vacio"));
      const resultado = casos.resolverProyecto(url.searchParams.get("proyecto") ?? "");
      if (!resultado.exito) return paginaErrorUso(resultado.error);
      return redirigir(`/resoluciones/${resultado.valor.id}?agente=${encodeURIComponent(agente)}${clave ? `&clave=${encodeURIComponent(clave)}` : ""}`);
    }
    const id = /^\/resoluciones\/([0-9]+)$/.exec(url.pathname)?.[1];
    if (id !== undefined) {
      const clave = url.searchParams.get("clave") ?? "";
      const resultado = casos.consultarResolucion(id, url.searchParams.get("agente") ?? "", clave);
      return resultado.exito ? paginaResolucion(resultado.valor.respuesta, resultado.valor.sobre) : paginaErrorUso(resultado.error);
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
