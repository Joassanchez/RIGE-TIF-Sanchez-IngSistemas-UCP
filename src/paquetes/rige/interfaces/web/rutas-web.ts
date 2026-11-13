import type { Resultado } from "../../aplicacion/respuestas/resultado";
import { errorSolicitudInvalida, type ErrorUso } from "../../aplicacion/errores";
import type { SobreAlmacen } from "../../aplicacion/respuestas/sobre";
import { conTemaWeb, contenidoError, diseno, enlace, normalizarVolver, type TemaWeb } from "./diseno";
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
import { agenteInicial, comparacionAnterior, parametrosPanel, type ContextoPanel } from "./panel";
import { redirigir, redirigirTema, responderEstilos, responderHtml } from "./respuesta";
import type { CasosWeb, PresentacionWeb } from "./servidor";

const erroresSinFoto = ["clave-no-resuelta", "agente-sin-declaraciones"];

export interface ContextoRuta {
  readonly casos: CasosWeb;
  readonly presentacion: PresentacionWeb;
  readonly solicitud: ContextoPanel;
}

export type ManejadorRuta = (url: URL, contexto: ContextoRuta) => Response;

function construirContextoSolicitud(url: URL, presentacion: PresentacionWeb): ContextoPanel {
  return {
    versionHerramienta: presentacion.versionHerramienta,
    ...(presentacion.hogar === undefined ? {} : { hogar: presentacion.hogar }),
    ...(url.searchParams.has("sujeto") ? { sujeto: url.searchParams.get("sujeto")! } : {}),
    clave: url.searchParams.get("clave") ?? "",
    q: url.searchParams.get("q") ?? "",
    agente: url.searchParams.get("agente") ?? undefined,
    ...(url.searchParams.has("lanzadoPor") ? { lanzadoPor: url.searchParams.get("lanzadoPor")! } : {}),
  };
}

function exigirAgente(url: URL, valor = url.searchParams.get("agente") ?? undefined, proyecto?: string, hogar?: string): Resultado<string | undefined, Response> {
  if (valor !== undefined && !valor.trim()) {
    return { exito: false, error: paginaErrorUso(errorSolicitudInvalida("el agente está vacío"), proyecto, hogar) };
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
  if (!consulta.exito) return consulta;
  const { sobre } = consulta.valor;
  const ultimo = sobre.anteriores[0];
  const anteriorAnalisis = comparacionAnterior(sobre);
  return {
    exito: true,
    valor: {
      instante: sobre.instante,
      ...(ultimo !== undefined && ultimo.id !== sobre.id ? { ultimoAnalisis: { id: ultimo.id, instante: ultimo.instante } } : {}),
      ...(anteriorAnalisis === undefined ? {} : { anteriorAnalisis }),
    },
  };
}

function contextoActual(url: URL, { casos, solicitud }: ContextoRuta, proyecto: string): Resultado<ContextoPanel, ErrorUso> {
  const id = url.searchParams.get("id");
  if (id === null) return { exito: true, valor: solicitud };
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

function manejarComparar(url: URL, { casos, presentacion }: ContextoRuta): Response {
  const agente = exigirAgente(url);
  if (!agente.exito) return agente.error;
  const resultado = casos.compararResoluciones(url.searchParams.get("desde") ?? "", url.searchParams.get("hasta") ?? "");
  return resultado.exito ? paginaComparacion(resultado.valor, agente.valor, { hogar: presentacion.hogar }) : paginaErrorUso(resultado.error);
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
  const proyecto = url.searchParams.get("proyecto") ?? undefined;
  const resultado = contexto.casos.consultarHallazgos(proyecto ?? "", { explicar: true });
  if (!resultado.exito) return paginaErrorUso(resultado.error, proyecto, contexto.presentacion.hogar);
  const actual = contextoActual(url, contexto, resultado.valor.proyecto);
  return actual.exito ? paginaHallazgos(resultado.valor, actual.valor)
    : paginaErrorUso(actual.error, resultado.valor.proyecto, contexto.presentacion.hogar);
}

function manejarEntradas(url: URL, contexto: ContextoRuta): Response {
  const proyecto = url.searchParams.get("proyecto") ?? undefined;
  const resultado = contexto.casos.consultarEntradas(proyecto ?? "");
  if (!resultado.exito) return paginaErrorUso(resultado.error, proyecto, contexto.presentacion.hogar);
  const actual = contextoActual(url, contexto, resultado.valor.proyecto);
  return actual.exito ? paginaEntradas(resultado.valor, actual.valor)
    : paginaErrorUso(actual.error, resultado.valor.proyecto, contexto.presentacion.hogar);
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
  return redirigir(enlace(`/resoluciones/${encodeURIComponent(id)}`, parametrosPanel({ ...solicitud, agente: undefined })));
}

function manejarResolver(url: URL, { casos, presentacion }: ContextoRuta): Response {
  const proyectoParametro = url.searchParams.get("proyecto") ?? undefined;
  const agente = exigirAgente(url, undefined, proyectoParametro, presentacion.hogar);
  if (!agente.exito) return agente.error;
  const clave = url.searchParams.get("clave") ?? "";
  const proyecto = proyectoParametro ?? "";
  const resultado = agente.valor === undefined ? casos.resolverProyecto(proyecto) : casos.resolverProyecto(proyecto, agente.valor);
  if (!resultado.exito) return paginaErrorUso(resultado.error, proyectoParametro ?? "", presentacion.hogar);
  return redirigir(enlace(`/resoluciones/${resultado.valor.id}`, { agente: agente.valor, clave: clave || undefined }));
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
    return redirigir(enlace(`/resoluciones/${id}/agentes/${encodeURIComponent(agente.valor!)}`, parametrosPanel({ ...contexto.solicitud, agente: undefined })));
  }
  if (nombreCodificado !== undefined) return manejarAgenteResolucion(id, nombreCodificado, url, contexto);
  return manejarResumenResolucion(id, contexto);
}

function manejarNoEncontrada(url: URL): Response {
  const pagina = diseno("Error 404", contenidoError(404, `Página no encontrada. Ruta consultada: ${url.pathname}`, "pagina-inexistente"));
  return responderHtml(404, pagina);
}

export function leerTemaDeCookie(solicitud: Request): TemaWeb {
  const cabecera = solicitud.headers.get("Cookie");
  if (!cabecera) return "sistema";
  for (const parte of cabecera.split(";")) {
    const indice = parte.indexOf("=");
    if (indice < 0) continue;
    if (parte.slice(0, indice).trim() !== "rige_tema") continue;
    const valor = parte.slice(indice + 1).trim();
    if (valor === "claro" || valor === "oscuro") return valor;
  }
  return "sistema";
}

function manejarTema(url: URL): Response {
  const valor = url.searchParams.get("valor");
  if (valor !== "sistema" && valor !== "claro" && valor !== "oscuro") {
    return paginaErrorUso(errorSolicitudInvalida("el tema debe ser sistema, claro u oscuro"));
  }
  return redirigirTema(normalizarVolver(url.searchParams.get("volver")), valor);
}

const rutasExactas: Record<string, ManejadorRuta> = {
  "/estilos.css": manejarEstilos,
  "/tema": manejarTema,
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
    return conTemaWeb(leerTemaDeCookie(solicitud), `${url.pathname}${url.search}`, () => {
      const contexto: ContextoRuta = {
        casos,
        presentacion,
        solicitud: construirContextoSolicitud(url, presentacion),
      };
      const exacto = Object.hasOwn(rutasExactas, url.pathname) ? rutasExactas[url.pathname] : undefined;
      if (exacto) return exacto(url, contexto);
      const rutaResolucion = patronResolucion.exec(url.pathname);
      if (rutaResolucion?.[1] !== undefined) {
        return manejarResolucion(rutaResolucion[1], rutaResolucion[2], rutaResolucion[3], url, contexto);
      }
      return manejarNoEncontrada(url);
    });
  };
}
