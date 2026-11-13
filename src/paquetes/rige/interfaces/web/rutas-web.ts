import type { Resultado } from "../../aplicacion/respuestas/resultado";
import { errorSolicitudInvalida, type ErrorUso } from "../../aplicacion/errores";
import type { SobreAlmacen } from "../../aplicacion/respuestas/sobre";
import { contenidoError, diseno } from "./diseno";
import { paginaErrorUso } from "./intermedios/errores";
import { paginaComparacion } from "./paginas/comparacion";
import { paginaConsultasPermiso } from "./paginas/consultas-permiso";
import { paginaEntradas } from "./paginas/entradas";
import { paginaHallazgos } from "./paginas/hallazgos";
import { paginaInicio } from "./paginas/inicio";
import { paginaPermiso } from "./paginas/permiso";
import { paginaReglas } from "./paginas/reglas";
import { paginaResolucion } from "./paginas/resolucion";
import { paginaResumenProyecto } from "./paginas/resumen-proyecto";
import { agenteInicial, consultaPanel, type ContextoPanel } from "./panel";
import { redirigir, responderEstilos, responderHtml } from "./respuesta";
import type { CasosWeb, PresentacionWeb } from "./servidor";

const erroresSinFoto = ["clave-no-resuelta", "agente-sin-declaraciones"];

export interface ContextoRuta {
  readonly casos: CasosWeb;
  readonly presentacion: PresentacionWeb;
  readonly solicitud: ContextoPanel;
}

export type ManejadorRuta = (url: URL, contexto: ContextoRuta) => Response;

function construirContextoSolicitud(url: URL, versionHerramienta: string): ContextoPanel {
  return {
    versionHerramienta,
    ...(url.searchParams.has("sujeto") ? { sujeto: url.searchParams.get("sujeto")! } : {}),
    clave: url.searchParams.get("clave") ?? "",
    q: url.searchParams.get("q") ?? "",
    agente: url.searchParams.get("agente") ?? undefined,
    ...(url.searchParams.has("lanzadoPor") ? { lanzadoPor: url.searchParams.get("lanzadoPor")! } : {}),
  };
}

function exigirAgente(url: URL, valor = url.searchParams.get("agente") ?? undefined): Resultado<string | undefined, Response> {
  if (valor !== undefined && !valor.trim()) {
    return { exito: false, error: paginaErrorUso(errorSolicitudInvalida("el agente está vacío")) };
  }
  return { exito: true, valor };
}

function contextoFoto(casos: CasosWeb, id: string, agente: string | undefined): Resultado<ContextoPanel, ErrorUso> {
  if (agente === undefined) return { exito: true, valor: {} };
  // El sobre público aporta los metadatos; nunca se los agrega al JSON de la consulta.
  const consulta = casos.consultarResolucion(id, agente, "");
  // El sobre depende de la proyección de valores. Su ausencia no invalida
  // una consulta de agentes/permisos/reglas que ya tuvo éxito (ADR-113).
  if (!consulta.exito && erroresSinFoto.includes(consulta.error.codigo)) {
    return { exito: true, valor: { fechaNoDisponible: consulta.error.codigo } };
  }
  return consulta.exito ? { exito: true, valor: { instante: consulta.valor.sobre.instante } } : consulta;
}

function contextoActual(url: URL, { casos, solicitud }: ContextoRuta, proyecto: string): Resultado<ContextoPanel, ErrorUso> {
  const id = url.searchParams.get("id");
  if (id === null) return { exito: true, valor: {} };
  const agentes = casos.consultarAgentes(id);
  if (!agentes.exito) return agentes;
  if (agentes.valor.proyecto !== proyecto) {
    return { exito: false, error: errorSolicitudInvalida("la resolución no pertenece al proyecto consultado") };
  }
  return {
    exito: true,
    valor: { ...solicitud, idResolucion: id, agentes: agentes.valor.agentes, agente: solicitud.agente ?? agenteInicial(agentes.valor.agentes) },
  };
}

function manejarInicio(_url: URL, { casos, presentacion }: ContextoRuta): Response {
  const resultado = casos.consultarEstado();
  if (!resultado.exito) return paginaErrorUso(resultado.error);
  const recientes = casos.consultarProyectosRecientes();
  return recientes.exito
    ? paginaInicio(resultado.valor, recientes.valor, new Date(presentacion.reloj.ahora()))
    : paginaErrorUso(recientes.error);
}

function manejarEstilos(): Response {
  return responderEstilos();
}

function manejarComparar(url: URL, { casos }: ContextoRuta): Response {
  const agente = exigirAgente(url);
  if (!agente.exito) return agente.error;
  const resultado = casos.compararResoluciones(url.searchParams.get("desde") ?? "", url.searchParams.get("hasta") ?? "");
  return resultado.exito ? paginaComparacion(resultado.valor, agente.valor) : paginaErrorUso(resultado.error);
}

function manejarReglas(url: URL, { casos, solicitud }: ContextoRuta): Response {
  const id = url.searchParams.get("id") ?? "";
  const resultado = casos.consultarReglas(id, {
    agente: url.searchParams.get("agente") ?? "",
    ...(url.searchParams.has("lanzadoPor") ? { lanzadoPor: url.searchParams.get("lanzadoPor")! } : {}),
  });
  if (!resultado.exito) return paginaErrorUso(resultado.error);
  const foto = contextoFoto(casos, id, resultado.valor.agente);
  return foto.exito ? paginaReglas(resultado.valor, id, { ...solicitud, ...foto.valor }) : paginaErrorUso(foto.error);
}

function manejarHallazgos(url: URL, contexto: ContextoRuta): Response {
  const resultado = contexto.casos.consultarHallazgos(url.searchParams.get("proyecto") ?? "", { explicar: true });
  if (!resultado.exito) return paginaErrorUso(resultado.error);
  const actual = contextoActual(url, contexto, resultado.valor.proyecto);
  return actual.exito ? paginaHallazgos(resultado.valor, actual.valor) : paginaErrorUso(actual.error);
}

function manejarEntradas(url: URL, contexto: ContextoRuta): Response {
  const resultado = contexto.casos.consultarEntradas(url.searchParams.get("proyecto") ?? "");
  if (!resultado.exito) return paginaErrorUso(resultado.error);
  const actual = contextoActual(url, contexto, resultado.valor.proyecto);
  return actual.exito ? paginaEntradas(resultado.valor, actual.valor) : paginaErrorUso(actual.error);
}

function manejarPermiso(url: URL, { casos, solicitud }: ContextoRuta): Response {
  const parametros = url.searchParams;
  if (parametros.has("sujeto") === parametros.has("herramienta")) {
    return paginaErrorUso(errorSolicitudInvalida("indique sujeto o herramienta, en forma excluyente"));
  }
  const id = parametros.get("id") ?? "";
  const accion = parametros.has("herramienta")
    ? { herramienta: parametros.get("herramienta")! }
    : { sujeto: parametros.get("sujeto")! };
  const resultado = casos.consultarPermiso(id, {
    agente: parametros.get("agente") ?? "",
    objetivo: parametros.get("objetivo") ?? "",
    ...accion,
    ...(parametros.has("lanzadoPor") ? { lanzadoPor: parametros.get("lanzadoPor")! } : {}),
  });
  if (!resultado.exito) return paginaErrorUso(resultado.error);
  const listado = casos.consultarAgentes(id);
  const foto = contextoFoto(casos, id, resultado.valor.agente);
  if (!foto.exito) return paginaErrorUso(foto.error);
  return paginaPermiso(resultado.valor, /^[0-9]+$/.test(id) ? id : undefined, {
    ...solicitud,
    ...foto.valor,
    ...(listado.exito ? { agentes: listado.valor.agentes } : {}),
  });
}

function manejarAgentes(url: URL, { casos, solicitud }: ContextoRuta): Response {
  const id = url.searchParams.get("id") ?? "";
  const resultado = casos.consultarAgentes(id);
  if (!resultado.exito) return paginaErrorUso(resultado.error);
  return redirigir(`/resoluciones/${encodeURIComponent(id)}${consultaPanel({ ...solicitud, agente: undefined }).replace(/^&/, "?")}`);
}

function manejarResolver(url: URL, { casos }: ContextoRuta): Response {
  const agente = exigirAgente(url);
  if (!agente.exito) return agente.error;
  const clave = url.searchParams.get("clave") ?? "";
  const proyecto = url.searchParams.get("proyecto") ?? "";
  const resultado = agente.valor === undefined ? casos.resolverProyecto(proyecto) : casos.resolverProyecto(proyecto, agente.valor);
  if (!resultado.exito) return paginaErrorUso(resultado.error);
  const contexto = new URLSearchParams();
  if (agente.valor !== undefined) contexto.set("agente", agente.valor);
  if (clave) contexto.set("clave", clave);
  // encodeURIComponent conserva la codificación de los enlaces existentes (espacios como %20).
  const consulta = [...contexto].map(([nombre, valor]) => `${nombre}=${encodeURIComponent(valor)}`).join("&");
  return redirigir(`/resoluciones/${resultado.valor.id}${consulta ? `?${consulta}` : ""}`);
}

function decodificarAgente(nombreCodificado: string): Resultado<string, Response> {
  // Validar antes de decodificar, sin ocultar fallas internas con un catch.
  if (/%(?![0-9a-f]{2})/i.test(nombreCodificado)) {
    return { exito: false, error: paginaErrorUso(errorSolicitudInvalida("codificación de agente inválida")) };
  }
  try {
    return { exito: true, valor: decodeURIComponent(nombreCodificado) };
  } catch (error) {
    if (!(error instanceof URIError)) throw error;
    return { exito: false, error: paginaErrorUso(errorSolicitudInvalida("codificación de agente inválida")) };
  }
}

function manejarPermisosResolucion(id: string, url: URL, { casos, solicitud }: ContextoRuta): Response {
  const agentes = casos.consultarAgentes(id);
  if (!agentes.exito) return paginaErrorUso(agentes.error);
  const agente = solicitud.agente ?? agenteInicial(agentes.valor.agentes);
  if (agente === undefined) return redirigir(`/resoluciones/${encodeURIComponent(id)}`);
  const valido = exigirAgente(url, agente);
  if (!valido.exito) return valido.error;
  const foto = contextoFoto(casos, id, agente);
  return foto.exito
    ? paginaConsultasPermiso(agentes.valor, { ...solicitud, ...foto.valor, agente, idResolucion: id, agentes: agentes.valor.agentes })
    : paginaErrorUso(foto.error);
}

function manejarAgenteResolucion(id: string, nombreCodificado: string, url: URL, { casos, solicitud }: ContextoRuta): Response {
  const decodificado = decodificarAgente(nombreCodificado);
  if (!decodificado.exito) return decodificado.error;
  const agente = exigirAgente(url, decodificado.valor);
  if (!agente.exito) return agente.error;
  const nombre = agente.valor!;
  const resultado = casos.consultarResolucion(id, nombre, solicitud.clave ?? "");
  if (!resultado.exito) return paginaErrorUso(resultado.error);
  const listado = casos.consultarAgentes(id);
  const reglas = casos.consultarReglas(id, { agente: nombre, ...(solicitud.lanzadoPor === undefined ? {} : { lanzadoPor: solicitud.lanzadoPor }) });
  const agenteListado = listado.exito ? listado.valor.agentes.find(a => a.nombre === nombre) : undefined;
  const todos = solicitud.clave ? casos.consultarResolucion(id, nombre, "") : resultado;
  return paginaResolucion(resultado.valor.respuesta, resultado.valor.sobre, {
    ...solicitud,
    agente: nombre,
    ...(listado.exito ? { agentes: listado.valor.agentes } : {}),
  }, {
    ...(agenteListado === undefined ? {} : { agente: agenteListado }),
    ...(reglas.exito ? { reglas: reglas.valor } : { errorReglas: reglas.error }),
    cantidadDeclaradas: todos.exito ? todos.valor.respuesta.valores.filter(v => v.rastro.determinante.origen.tipo === "declarado").length : null,
  });
}

function manejarResumenResolucion(id: string, { casos, solicitud }: ContextoRuta): Response {
  const agentes = casos.consultarAgentes(id);
  if (!agentes.exito) return paginaErrorUso(agentes.error);
  const entradas = casos.consultarEntradas(agentes.valor.proyecto);
  const hallazgos = casos.consultarHallazgos(agentes.valor.proyecto, { explicar: true });
  let sobre: SobreAlmacen | undefined;
  // Un agente puede tener valores no consultables mientras otro sí entrega el sobre.
  for (const agente of agentes.valor.agentes) {
    const foto = casos.consultarResolucion(id, agente.nombre, "");
    if (foto.exito) { sobre = foto.valor.sobre; break; }
    if (!erroresSinFoto.includes(foto.error.codigo)) return paginaErrorUso(foto.error);
  }
  return paginaResumenProyecto(agentes.valor, entradas, hallazgos, id, sobre, solicitud);
}

function manejarResolucion(id: string, subruta: string | undefined, nombreCodificado: string | undefined, url: URL, contexto: ContextoRuta): Response {
  if (subruta === "/permisos") return manejarPermisosResolucion(id, url, contexto);
  if (nombreCodificado === undefined && contexto.solicitud.agente !== undefined) {
    const agente = exigirAgente(url);
    if (!agente.exito) return agente.error;
    return redirigir(`/resoluciones/${id}/agentes/${encodeURIComponent(agente.valor!)}${consultaPanel({ ...contexto.solicitud, agente: undefined }).replace(/^&/, "?")}`);
  }
  if (nombreCodificado !== undefined) return manejarAgenteResolucion(id, nombreCodificado, url, contexto);
  return manejarResumenResolucion(id, contexto);
}

function manejarNoEncontrada(url: URL): Response {
  const pagina = diseno("Error 404", contenidoError(404, `Página no encontrada. Ruta consultada: ${url.pathname}`, "pagina-inexistente"));
  return responderHtml(404, pagina);
}

const rutasExactas: Record<string, ManejadorRuta> = {
  "/estilos.css": manejarEstilos,
  "/comparar": manejarComparar,
  "/reglas": manejarReglas,
  "/hallazgos": manejarHallazgos,
  "/entradas": manejarEntradas,
  "/permiso": manejarPermiso,
  "/agentes": manejarAgentes,
  "/resolver": manejarResolver,
  "/": manejarInicio,
};

const patronResolucion = /^\/resoluciones\/([0-9]+)(\/permisos|\/agentes\/([^/]+))?$/;

export function crearEnrutador(casos: CasosWeb, presentacion: PresentacionWeb): (solicitud: Request) => Response {
  return (solicitud: Request): Response => {
    const url = new URL(solicitud.url);
    const contexto: ContextoRuta = {
      casos,
      presentacion,
      solicitud: construirContextoSolicitud(url, presentacion.versionHerramienta),
    };
    const exacto = Object.hasOwn(rutasExactas, url.pathname) ? rutasExactas[url.pathname] : undefined;
    if (exacto) return exacto(url, contexto);
    const rutaResolucion = patronResolucion.exec(url.pathname);
    if (rutaResolucion?.[1] !== undefined) {
      return manejarResolucion(rutaResolucion[1], rutaResolucion[2], rutaResolucion[3], url, contexto);
    }
    return manejarNoEncontrada(url);
  };
}
