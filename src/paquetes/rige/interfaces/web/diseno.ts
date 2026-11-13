import { versionRige } from "../../aplicacion/respuestas/estado";
import { html, type HtmlSeguro } from "./plantillas";
import { type ContextoPanel } from "./panel";
import { dosSegmentos } from "./textos";
import { efectoConGlifo } from "../presentacion/vocabulario";
import { rolEfecto } from "../presentacion/roles";
import { presentarUbicacion, type ContextoRutaVisible } from "./rutas";

export function enlace(
  ruta: string,
  params: Readonly<Record<string, string | number | undefined | null>> = {},
  fragmento?: string,
): string {
  const buscador = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && valor !== "") {
      buscador.set(clave, String(valor));
    }
  }
  // encodeURIComponent/replaceAll("+", "%20") conserva los espacios como %20.
  const consulta = buscador.toString().replaceAll("+", "%20");
  return `${ruta}${consulta ? `?${consulta}` : ""}${fragmento ? `#${fragmento}` : ""}`;
}

interface ContextoDiseno extends ContextoPanel {
  readonly proyecto?: string;
  readonly activa?: "Inicio" | "Resumen" | "Valores" | "Permisos" | "Permiso" | "Todas las reglas" | "Comparar" | "Entradas" | "Hallazgos";
  readonly minimo?: boolean;
  readonly agenteDestino?: string;
}

function barraAnalisis(contexto: ContextoDiseno): HtmlSeguro {
  if (contexto.minimo || contexto.idResolucion === undefined || contexto.activa === "Comparar" || contexto.activa === "Inicio") return html``;
  const id = encodeURIComponent(contexto.idResolucion);
  const agente = contexto.agenteDestino ?? contexto.agente;
  const actual = contexto.activa ?? "Resumen";
  const enlaces: readonly (readonly [string, string, boolean])[] = [
    ["Resumen", `/resoluciones/${id}`, actual === "Resumen"],
    ["Agentes", agente === undefined ? `/resoluciones/${id}#tabla-agentes` : `/resoluciones/${id}/agentes/${encodeURIComponent(agente)}`, actual === "Valores"],
    ["Permisos", enlace(`/resoluciones/${id}/permisos`, { agente, lanzadoPor: contexto.lanzadoPor }), actual === "Permisos" || actual === "Permiso"],
    ["Reglas", enlace("/reglas", { id: contexto.idResolucion, agente, lanzadoPor: contexto.lanzadoPor }), actual === "Todas las reglas"],
    ["Entradas", enlace("/entradas", { proyecto: contexto.proyecto, id: contexto.idResolucion }), actual === "Entradas"],
    ["Hallazgos", enlace("/hallazgos", { proyecto: contexto.proyecto, id: contexto.idResolucion }), actual === "Hallazgos"],
    ["Historial", `/resoluciones/${id}#historia`, false],
  ];
  return html`<nav class="pestanas barra-analisis" aria-label="Vistas del análisis">${enlaces.map(([texto, href, activo]) =>
    activo ? html`<a href="${href}" aria-current="page">${texto}</a>` : html`<a href="${href}">${texto}</a>`)}</nav>`;
}

export interface OpcionesCabecera {
  readonly id?: string;
  readonly etiqueta?: "div" | "section";
  readonly titulo: HtmlSeguro | string;
  readonly pregunta: string;
  readonly contexto: HtmlSeguro;
  readonly lateral?: HtmlSeguro;
  readonly detalle?: HtmlSeguro;
  readonly extra?: HtmlSeguro;
}

export function cabeceraPagina(opciones: OpcionesCabecera): HtmlSeguro {
  const encabezado = typeof opciones.titulo === "string" ? html`<h1>${opciones.titulo}</h1>` : opciones.titulo;
  const superior = opciones.lateral === undefined ? encabezado : html`<div class="barra-agente">${encabezado}${opciones.lateral}</div>`;
  const cuerpo = html`${superior}
<p>${opciones.pregunta}</p>
<div class="contexto">${opciones.contexto}</div>${opciones.extra ?? html``}${opciones.detalle === undefined
    ? html`` : html`<details><summary>¿Qué significa?</summary>${opciones.detalle}</details>`}`;
  const atributoId = opciones.id === undefined ? html`` : html` id="${opciones.id}"`;
  return opciones.etiqueta === "section"
    ? html`<section${atributoId} class="cabecera-pagina">${cuerpo}</section>`
    : html`<div${atributoId} class="cabecera-pagina">${cuerpo}</div>`;
}

function avisoAnterior(contexto: ContextoDiseno): HtmlSeguro {
  if (contexto.minimo || contexto.ultimoAnalisis === undefined) return html``;
  const ultimo = encodeURIComponent(contexto.ultimoAnalisis.id);
  return html`<div class="aviso aviso--advertencia" role="note"><p>Estás viendo un análisis anterior. <a href="${`/resoluciones/${ultimo}`}">Ver el último análisis (n.º ${contexto.ultimoAnalisis.id})</a>.</p></div>`;
}

// Composición de presentación: no consulta ni modifica respuestas de aplicación.
export function diseno(titulo: string, contenido: HtmlSeguro, contexto: ContextoDiseno = {}): HtmlSeguro {
  const id = contexto.idResolucion === undefined ? undefined : encodeURIComponent(contexto.idResolucion);
  return html`<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${titulo} · RIGE</title><link rel="stylesheet" href="/estilos.css"></head>
<body><a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="cabecera"><div class="cabecera__interior">
<a class="marca" href="/" aria-label="RIGE · Inicio">RIGE</a>
${contexto.minimo ? html`` : html`<nav class="migas" aria-label="Migas de pan">
${contexto.proyecto === undefined ? html`<span aria-hidden="true">›</span><span aria-current="page">${titulo.startsWith("Error ") ? "Error" : titulo}</span>` : html`
<span aria-hidden="true">›</span>${id === undefined ? html`<span class="migas__proyecto">${dosSegmentos(contexto.proyecto)}</span>` : html`<a class="migas__proyecto" href="${`/resoluciones/${id}`}">${dosSegmentos(contexto.proyecto)}</a>`}
${contexto.agente === undefined ? html`` : html`<span aria-hidden="true">›</span>${contexto.activa === "Valores" || id === undefined ? html`<span aria-current="page">${contexto.agente}</span>` : html`<a href="${`/resoluciones/${id}/agentes/${encodeURIComponent(contexto.agente)}`}">${contexto.agente}</a>`}`}
${contexto.activa === undefined || contexto.activa === "Valores" || contexto.activa === "Resumen" ? html`` : html`<span aria-hidden="true">›</span><span aria-current="page">${contexto.activa}</span>`}`}</nav>`}</div></header>
<main id="contenido" tabindex="-1">${barraAnalisis(contexto)}${avisoAnterior(contexto)}${contenido}</main>
<footer class="pie"><p>Local · solo lectura · sin red${contexto.minimo ? html`` : html` · RIGE ${versionRige}`}</p></footer></body></html>`;
}

export function insignia(texto: unknown, tipo = "neutra", titulo?: string): HtmlSeguro {
  return titulo === undefined ? html`<span class="insignia insignia--${tipo}">${texto}</span>`
    : html`<span class="insignia insignia--${tipo}" title="${titulo}">${texto}</span>`;
}

export function efectoVisual(efecto: string | null, titulo?: string): HtmlSeguro {
  return insignia(efectoConGlifo(efecto), rolEfecto(efecto), titulo);
}

export function declaraciones(codigos: readonly string[], reglas: Readonly<Record<string, string>>): HtmlSeguro {
  return codigos.length ? html`<section id="declaraciones" aria-label="Declaraciones">
<h2>Declaraciones</h2>${codigos.map(codigo => html`<div class="aviso"><p>${reglas[codigo]}</p></div>`)}</section>` : html``;
}

function presentarMensajeError(mensaje: string, contexto?: ContextoRutaVisible): HtmlSeguro {
  const conReferencia = /\(([^()]+):(\d+):(\d+)\)/.exec(mensaje);
  if (conReferencia) {
    const posicion = { linea: Number(conReferencia[2]), columna: Number(conReferencia[3]) };
    const ubicacion = presentarUbicacion(conReferencia[1]!, posicion, undefined, contexto);
    return html`${mensaje.slice(0, conReferencia.index)}(${ubicacion})${mensaje.slice(conReferencia.index + conReferencia[0].length)}`;
  }
  const soloPosicion = /\((\d+):(\d+)\)/.exec(mensaje);
  if (soloPosicion) {
    const posicion = { linea: Number(soloPosicion[1]), columna: Number(soloPosicion[2]) };
    const antes = mensaje.slice(0, soloPosicion.index);
    const despues = mensaje.slice(soloPosicion.index + soloPosicion[0].length);
    const entrada = /^La entrada (.+?)( no se puede leer.*)$/.exec(antes);
    if (entrada) {
      return html`La entrada ${presentarUbicacion(entrada[1]!, posicion, undefined, contexto)}${entrada[2]!.trimEnd()}${despues}`;
    }
    const enRuta = /^(.*\ben )(.+?)\s+$/.exec(antes);
    if (enRuta) {
      return html`${enRuta[1]}${presentarUbicacion(enRuta[2]!, posicion, undefined, contexto)}${despues}`;
    }
  }
  return html`${mensaje}`;
}

export function contenidoError(estado: number, mensaje: string, codigo: string, contexto?: ContextoRutaVisible): HtmlSeguro {
  const titulos: Readonly<Record<number, string>> = { 400: "Revisá la consulta", 404: "Página no encontrada",
    422: "No se pudo completar la consulta", 500: "Ocurrió un problema", 503: "Almacén no disponible" };
  const proyectoInexistente = codigo === "proyecto-inexistente";
  const titulo = proyectoInexistente ? "No encontramos el proyecto" : titulos[estado] ?? "No se pudo completar la consulta";
  const texto = codigo === "resolucion-inexistente"
    ? mensaje.replace(/^No existe la resolución [0-9]+ en el almacén\.$/, "No encontramos ese análisis en el almacén.")
    : mensaje;
  const proyecto = contexto?.proyecto;
  const reintentarFormulario = estado !== 500 && estado !== 503 && proyecto !== undefined && (proyectoInexistente || estado === 400);
  const accionesProyecto = estado !== 500 && estado !== 503 && !reintentarFormulario && proyecto !== undefined && proyecto.trim() !== "";
  // También los errores de uso clasificados como 500 conservan el mensaje fijo.
  return html`<section class="tarjeta pagina-error"><h1>${titulo}</h1><p>${estado === 500 ? "Falla interna de RIGE." : presentarMensajeError(texto, contexto)}</p>
${proyectoInexistente ? html`<p>Revisá la ruta y comprobá que la carpeta exista en esta máquina.</p>` : html``}
${reintentarFormulario ? html`<form method="get" action="/resolver">
<label>Carpeta del proyecto <input type="text" name="proyecto" value="${proyecto}" placeholder="C:\\proyectos\\mi-app" required></label>
<button type="submit">Analizar</button></form>
<p><a class="boton boton--secundario" href="/">Volver al inicio</a></p>`
    : accionesProyecto ? html`<div class="acciones">
<a class="boton" href="${enlace("/hallazgos", { proyecto })}">Ver hallazgos</a>
<a class="boton boton--secundario" href="${enlace("/entradas", { proyecto })}">Ver entradas</a>
<a class="boton boton--secundario" href="${enlace("/resolver", { proyecto })}">Reintentar</a>
<a class="boton boton--secundario" href="/">Volver al inicio</a></div>`
    : html`<p><a class="boton" href="/">Volver al inicio</a></p>`}<small class="codigo-error">${estado === 500 ? "interno" : codigo}</small></section>`;
}
