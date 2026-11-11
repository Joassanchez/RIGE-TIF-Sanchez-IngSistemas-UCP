import type { ConsultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import type { ResolverProyecto } from "../../aplicacion/casos-uso/resolver-proyecto";
import type { ConsultarResolucion } from "../../aplicacion/casos-uso/consultar-resolucion";
import type { CompararResoluciones } from "../../aplicacion/casos-uso/comparar-resoluciones";
import type { ConsultarProyectosRecientes } from "../../aplicacion/casos-uso/consultar-proyectos-recientes";
import { paginaComparacion } from "./paginas/comparacion";
import type { Resultado } from "../../aplicacion/respuestas/resultado";
import { errorPuertoOcupado, errorSolicitudInvalida, type ErrorUso } from "../../aplicacion/errores";
import { conErrores, paginaErrorUso } from "./intermedios/errores";
import { conVerificacionDeOrigen } from "./intermedios/origen";
import { paginaInicio } from "./paginas/inicio";
import { paginaResolucion } from "./paginas/resolucion";
import type { consultarPermisoGuardado, consultarAgentesGuardados, consultarReglasGuardadas } from "../../aplicacion/casos-uso/consultar-guardada";
import { paginaReglas } from "./paginas/reglas";
import { paginaPermiso } from "./paginas/permiso";
import { paginaAgentes } from "./paginas/agentes";
import type { ConsultarHallazgos } from "../../aplicacion/casos-uso/consultar-hallazgos";
import { paginaHallazgos } from "./paginas/hallazgos";
import type { ConsultarEntradas } from "../../aplicacion/casos-uso/consultar-entradas";
import { paginaEntradas } from "./paginas/entradas";
import { contenidoError, diseno } from "./diseno";
import { redirigir, responderHtml, responderEstilos } from "./respuesta";
import { agenteInicial, type ContextoPanel } from "./panel";
import { paginaConsultasPermiso } from "./paginas/consultas-permiso";

export interface CasosWeb {
  readonly compararResoluciones: CompararResoluciones;
  readonly consultarProyectosRecientes: ConsultarProyectosRecientes;
  readonly consultarReglas: (id: string, solicitud: Parameters<typeof consultarReglasGuardadas>[2]) => ReturnType<typeof consultarReglasGuardadas>;
  readonly consultarEntradas: ConsultarEntradas;
  readonly consultarHallazgos: ConsultarHallazgos;
  readonly consultarEstado: ConsultarEstado;
  readonly resolverProyecto: ResolverProyecto;
  readonly consultarResolucion: ConsultarResolucion;
  readonly consultarPermiso: (id: string, solicitud: Parameters<typeof consultarPermisoGuardado>[2]) => ReturnType<typeof consultarPermisoGuardado>;
  readonly consultarAgentes: (id: string) => ReturnType<typeof consultarAgentesGuardados>;
}

export function crearManejador(puerto: number, casos: CasosWeb): (solicitud: Request) => Response {
  const enrutar = (solicitud: Request): Response => {
    const url = new URL(solicitud.url);
    const contextoSolicitud = { clave: url.searchParams.get("clave") ?? "", q: url.searchParams.get("q") ?? "", agente: url.searchParams.get("agente") ?? undefined,
      ...(url.searchParams.has("lanzadoPor") ? { lanzadoPor: url.searchParams.get("lanzadoPor")! } : {}) };
    const contextoFoto = (id: string, agente: string | undefined): Resultado<ContextoPanel, ErrorUso> => {
      if (agente === undefined) return { exito: true, valor: {} };
      // El sobre público aporta los metadatos; nunca se los agrega al JSON de la consulta.
      const consulta = casos.consultarResolucion(id, agente, "");
      // El sobre depende de la proyección de valores. Su ausencia no invalida
      // una consulta de agentes/permisos/reglas que ya tuvo éxito (ADR-113).
      if (!consulta.exito && ["clave-no-resuelta", "agente-sin-declaraciones"].includes(consulta.error.codigo)) {
        return { exito: true, valor: { fechaNoDisponible: consulta.error.codigo } };
      }
      return consulta.exito ? { exito: true, valor: { instante: consulta.valor.sobre.instante } } : consulta;
    };
    const contextoActual = (proyecto: string): Resultado<ContextoPanel, ErrorUso> => {
      const id = url.searchParams.get("id");
      if (id === null) return { exito: true, valor: {} };
      const agentes = casos.consultarAgentes(id);
      if (!agentes.exito) return agentes;
      if (agentes.valor.proyecto !== proyecto) return { exito: false, error: errorSolicitudInvalida("la resolución no pertenece al proyecto consultado") };
      return { exito: true, valor: { ...contextoSolicitud, idResolucion: id, agentes: agentes.valor.agentes,
        agente: contextoSolicitud.agente ?? agenteInicial(agentes.valor.agentes) } };
    };
    if (url.pathname === "/estilos.css") return responderEstilos();
    if (url.pathname === "/comparar") {
      const agente = url.searchParams.get("agente");
      if (agente !== null && !agente.trim()) return paginaErrorUso(errorSolicitudInvalida("el agente está vacío"));
      const resultado = casos.compararResoluciones(url.searchParams.get("desde") ?? "", url.searchParams.get("hasta") ?? "");
      return resultado.exito ? paginaComparacion(resultado.valor, agente ?? undefined) : paginaErrorUso(resultado.error);
    }
    if (url.pathname === "/reglas") {
      const id = url.searchParams.get("id") ?? "";
      const resultado = casos.consultarReglas(id, { agente: url.searchParams.get("agente") ?? "",
        ...(url.searchParams.has("lanzadoPor") ? { lanzadoPor: url.searchParams.get("lanzadoPor")! } : {}) });
      if (!resultado.exito) return paginaErrorUso(resultado.error);
      const foto = contextoFoto(id, resultado.valor.agente);
      return foto.exito ? paginaReglas(resultado.valor, id, { ...contextoSolicitud, ...foto.valor }) : paginaErrorUso(foto.error);
    }
    if (url.pathname === "/hallazgos") {
      const resultado = casos.consultarHallazgos(url.searchParams.get("proyecto") ?? "", { explicar: true });
      if (!resultado.exito) return paginaErrorUso(resultado.error);
      const contexto = contextoActual(resultado.valor.proyecto);
      return contexto.exito ? paginaHallazgos(resultado.valor, contexto.valor) : paginaErrorUso(contexto.error);
    }
    if (url.pathname === "/entradas") {
      const resultado = casos.consultarEntradas(url.searchParams.get("proyecto") ?? "");
      if (!resultado.exito) return paginaErrorUso(resultado.error);
      const contexto = contextoActual(resultado.valor.proyecto);
      return contexto.exito ? paginaEntradas(resultado.valor, contexto.valor) : paginaErrorUso(contexto.error);
    }
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
      const id = parametros.get("id") ?? "";
      if (!resultado.exito) return paginaErrorUso(resultado.error);
      const listado = casos.consultarAgentes(id);
      const foto = contextoFoto(id, resultado.valor.agente);
      if (!foto.exito) return paginaErrorUso(foto.error);
      return paginaPermiso(resultado.valor, /^[0-9]+$/.test(id) ? id : undefined, {
        ...contextoSolicitud, ...foto.valor, ...(listado.exito ? { agentes: listado.valor.agentes } : {}),
      });
    }
    if (url.pathname === "/agentes") {
      const resultado = casos.consultarAgentes(url.searchParams.get("id") ?? "");
      const id = url.searchParams.get("id") ?? "";
      if (!resultado.exito) return paginaErrorUso(resultado.error);
      const foto = contextoFoto(id, agenteInicial(resultado.valor.agentes));
      if (!foto.exito) return paginaErrorUso(foto.error);
      return paginaAgentes(resultado.valor, /^[0-9]+$/.test(id) ? id : undefined, contextoSolicitud.clave, {
        ...foto.valor,
        ...contextoSolicitud, agente: contextoSolicitud.agente ?? agenteInicial(resultado.valor.agentes), agentes: resultado.valor.agentes,
      });
    }
    if (url.pathname === "/resolver") {
      const agente = url.searchParams.get("agente");
      const clave = url.searchParams.get("clave") ?? "";
      if (agente !== null && !agente.trim()) return paginaErrorUso(errorSolicitudInvalida("el agente está vacío"));
      const proyecto = url.searchParams.get("proyecto") ?? "";
      const resultado = agente === null ? casos.resolverProyecto(proyecto) : casos.resolverProyecto(proyecto, agente);
      if (!resultado.exito) return paginaErrorUso(resultado.error);
      const contexto = new URLSearchParams();
      if (agente !== null) contexto.set("agente", agente);
      if (clave) contexto.set("clave", clave);
      // encodeURIComponent conserva la codificación de los enlaces existentes (espacios como %20).
      const consulta = [...contexto].map(([nombre, valor]) => `${nombre}=${encodeURIComponent(valor)}`).join("&");
      return redirigir(`/resoluciones/${resultado.valor.id}${consulta ? `?${consulta}` : ""}`);
    }
    const rutaResolucion = /^\/resoluciones\/([0-9]+)(\/permisos)?$/.exec(url.pathname);
    const id = rutaResolucion?.[1];
    if (id !== undefined) {
      if (rutaResolucion?.[2]) {
        const agentes = casos.consultarAgentes(id);
        if (!agentes.exito) return paginaErrorUso(agentes.error);
        const agente = contextoSolicitud.agente ?? agenteInicial(agentes.valor.agentes);
        if (agente === undefined) return redirigir(`/agentes?id=${encodeURIComponent(id)}`);
        if (!agente.trim()) return paginaErrorUso(errorSolicitudInvalida("el agente está vacío"));
        const foto = contextoFoto(id, agente);
        return foto.exito ? paginaConsultasPermiso(agentes.valor, { ...contextoSolicitud, ...foto.valor, agente, idResolucion: id, agentes: agentes.valor.agentes }) : paginaErrorUso(foto.error);
      }
      const clave = url.searchParams.get("clave") ?? "";
      let agente = url.searchParams.get("agente");
      const agentes = agente === null ? casos.consultarAgentes(id) : undefined;
      if (agentes !== undefined) {
        if (!agentes.exito) return paginaErrorUso(agentes.error);
        agente = agenteInicial(agentes.valor.agentes) ?? null;
        if (agente === null) return redirigir(`/agentes?id=${encodeURIComponent(id)}`);
      }
      const resultado = casos.consultarResolucion(id, agente!, clave);
      if (!resultado.exito) return paginaErrorUso(resultado.error);
      const listado = agentes ?? casos.consultarAgentes(id);
      return paginaResolucion(resultado.valor.respuesta, resultado.valor.sobre, {
        clave, q: url.searchParams.get("q") ?? "", ...(listado.exito ? { agentes: listado.valor.agentes } : {}),
      });
    }
    if (url.pathname !== "/") {
      const pagina = diseno("Error 404", contenidoError(404, `Página no encontrada. Ruta consultada: ${url.pathname}`, "pagina-inexistente"));
      return responderHtml(404, pagina);
    }
    const resultado = casos.consultarEstado();
    if (!resultado.exito) return paginaErrorUso(resultado.error);
    const recientes = casos.consultarProyectosRecientes();
    return recientes.exito ? paginaInicio(resultado.valor, recientes.valor) : paginaErrorUso(recientes.error);
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
