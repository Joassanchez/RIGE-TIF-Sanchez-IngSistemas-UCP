import { versionRige } from "../../aplicacion/respuestas/estado";
import { html, type HtmlSeguro } from "./plantillas";
import { type CambioAnterior, type ContextoPanel } from "./panel";
import { dosSegmentos, fechaLocal } from "./textos";
import { condicionEntrada, efectoConGlifo, explicarLimite } from "../presentacion/vocabulario";
import { rolEfecto } from "../presentacion/roles";
import { rotuloVia } from "../presentacion/rutas";
import { presentarRuta, presentarUbicacion, type ContextoRutaVisible } from "./rutas";

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

export type TemaWeb = "sistema" | "claro" | "oscuro";

interface TemaActivo {
  readonly tema: TemaWeb;
  readonly rutaActual: string;
}

let temaActivo: TemaActivo | undefined;

export function conTemaWeb<T>(tema: TemaWeb, rutaActual: string, ejecutar: () => T): T {
  const anterior = temaActivo;
  temaActivo = { tema, rutaActual };
  try {
    return ejecutar();
  } finally {
    temaActivo = anterior;
  }
}

export function normalizarVolver(volver: string | null | undefined): string {
  if (!volver || !volver.startsWith("/") || volver.startsWith("//") || volver.startsWith("/\\") || /[\x00-\x1f\x7f]/.test(volver)) {
    return "/";
  }
  return volver;
}

const opcionesTema: readonly (readonly [TemaWeb, string])[] = [
  ["sistema", "Sistema"],
  ["claro", "Claro"],
  ["oscuro", "Oscuro"],
];

function selectorTema(temaActual: TemaWeb, volver: string): HtmlSeguro {
  return html`<div class="selector-tema" role="group" aria-label="Tema">${opcionesTema.map(([valor, etiqueta]) => {
    const href = enlace("/tema", { valor, volver });
    return valor === temaActual
      ? html`<a href="${href}" aria-current="true">${etiqueta}</a>`
      : html`<a href="${href}">${etiqueta}</a>`;
  })}</div>`;
}

interface ContextoDiseno extends ContextoPanel {
  readonly proyecto?: string;
  readonly activa?: "Inicio" | "Resumen" | "Valores" | "Permisos" | "Permiso" | "Todas las reglas" | "Comparar" | "Entradas" | "Hallazgos";
  readonly minimo?: boolean;
  readonly agenteDestino?: string;
  readonly tema?: TemaWeb;
  readonly rutaActual?: string;
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
  ];
  return html`<nav class="pestanas barra-analisis" aria-label="Vistas del análisis">${enlaces.map(([texto, href, activo]) =>
    activo ? html`<a href="${href}" aria-current="page">${texto}</a>` : html`<a href="${href}">${texto}</a>`)}</nav>`;
}

export interface DatoContexto {
  readonly rotulo: string;
  readonly valor: HtmlSeguro | string;
  readonly clase?: string;
}

export function datoProyecto(proyecto: string): DatoContexto {
  return { rotulo: "Proyecto", valor: html`<code title="${proyecto}">${dosSegmentos(proyecto)}</code>` };
}

export function datosAnalisis(
  id: string | number | undefined,
  instante?: string,
  fechaNoDisponible?: string,
): readonly DatoContexto[] {
  if (id === undefined && instante === undefined && fechaNoDisponible === undefined) return [];
  const partes: string[] = [];
  if (id !== undefined) partes.push(`n.º ${id}`);
  if (instante !== undefined) partes.push(fechaLocal(instante));
  else if (fechaNoDisponible !== undefined) partes.push(`fecha no disponible (${fechaNoDisponible})`);
  return [{ rotulo: "Análisis", valor: partes.join(", ") }];
}

export function datoCambioAnterior(
  idActual: string | number | undefined,
  anterior?: CambioAnterior,
): readonly DatoContexto[] {
  if (idActual === undefined || anterior === undefined) return [];
  if (!anterior.cambio) {
    return [{ rotulo: "Cambios", valor: `Configuración sin cambios desde el análisis n.º ${anterior.id}`, clase: "contexto__cambio" }];
  }
  return [{
    rotulo: "Cambios",
    valor: html`La configuración cambió desde el análisis n.º ${anterior.id} · <a href="${enlace("/comparar", { desde: anterior.id, hasta: idActual })}">Comparar</a>`,
    clase: "contexto__cambio",
  }];
}

export interface OpcionesCabecera {
  readonly id?: string;
  readonly etiqueta?: "div" | "section";
  readonly titulo: HtmlSeguro | string;
  readonly pregunta: string;
  readonly contexto: readonly DatoContexto[];
  readonly lateral?: HtmlSeguro;
  readonly detalle?: HtmlSeguro;
  readonly extra?: HtmlSeguro;
}

export function cabeceraPagina(opciones: OpcionesCabecera): HtmlSeguro {
  const encabezado = typeof opciones.titulo === "string" ? html`<h1>${opciones.titulo}</h1>` : opciones.titulo;
  const superior = opciones.lateral === undefined ? encabezado : html`<div class="barra-agente">${encabezado}${opciones.lateral}</div>`;
  const cuerpo = html`${superior}
<p>${opciones.pregunta}</p>
<dl class="contexto">${opciones.contexto.map(d => d.clase === "contexto__cambio"
  ? html`<div class="contexto__cambio"><dt>${d.rotulo}</dt><dd>${d.valor}</dd></div>`
  : html`<div${d.clase ? html` class="${d.clase}"` : html``}><dt>${d.rotulo}</dt><dd>${d.valor}</dd></div>`)}</dl>${opciones.extra ?? html``}${opciones.detalle === undefined
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
  const tema = contexto.tema ?? temaActivo?.tema ?? "sistema";
  const volver = normalizarVolver(contexto.rutaActual ?? temaActivo?.rutaActual);
  const atributoTema = tema === "sistema" ? html`` : html` data-tema="${tema}"`;
  return html`<!doctype html>
<html lang="es"${atributoTema}><head><meta charset="utf-8">
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
${contexto.activa === undefined || contexto.activa === "Valores" || contexto.activa === "Resumen" ? html`` : html`<span aria-hidden="true">›</span><span aria-current="page">${contexto.activa}</span>`}`}</nav>`}${selectorTema(tema, volver)}</div></header>
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

export function datosDeclaraciones(
  codigos: readonly string[],
  reglas: Readonly<Record<string, string>>,
): readonly HtmlSeguro[] {
  return codigos.map(codigo => html`${explicarLimite(codigo, reglas)}`);
}

export function seccionLimites(items: readonly (HtmlSeguro | string)[]): HtmlSeguro {
  return items.length
    ? html`<section id="limites-analisis" aria-label="Qué no cubre este análisis"><h2>Qué no cubre este análisis</h2><ul>${items.map(item => html`<li>${item}</li>`)}</ul></section>`
    : html``;
}

export interface EntradaHuella {
  readonly orden: number;
  readonly via: string;
  readonly referencia: string;
  readonly condicion: string;
  readonly resumen: string | null;
}

export function huellasEntradas(
  entradas: readonly EntradaHuella[],
  resumenEntradas: string,
  proyecto: string,
): HtmlSeguro {
  return html`<details id="entradas-leidas"><summary>Huellas de las entradas</summary>
<dl><dt>Resumen de las entradas leídas</dt><dd>${resumenEntradas}</dd></dl>
<div class="tabla-contenedor" role="region" aria-label="Entradas leídas" tabindex="0">
<table class="tabla-tarjetas" role="table"><caption class="oculto-visual">Entradas leídas</caption><thead><tr role="row"><th scope="col">Orden</th><th scope="col">Vía</th><th scope="col">Referencia</th><th scope="col">Condición</th><th scope="col">Resumen SHA-256</th></tr></thead>
<tbody>${entradas.map(entrada => html`<tr id="${`entrada-leida-${entrada.orden}`}"><td data-etiqueta="Orden">${entrada.orden}</td><td data-etiqueta="Vía">${rotuloVia(entrada.via, entrada.referencia, proyecto)}</td><td data-etiqueta="Referencia">${presentarRuta(entrada.referencia)}</td><td data-etiqueta="Condición">${insignia(condicionEntrada(entrada.condicion), "neutra")}</td><td data-etiqueta="Resumen SHA-256"><code>${entrada.resumen ?? "—"}</code></td></tr>`)}</tbody></table></div></details>`;
}

export function pieDesarrolladores(
  proyecto: string,
  comando: HtmlSeguro,
  datos: HtmlSeguro,
  huellas: HtmlSeguro = html``,
): HtmlSeguro {
  return html`<div class="pie-desarrolladores" role="region" aria-label="Para desarrolladores"><span class="pie-desarrolladores__rotulo">Para desarrolladores:</span>${comando}${datos}${huellas}<span class="pie-desarrolladores__ruta">Proyecto: <code>${proyecto}</code></span></div>`;
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
