import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos, RespuestaReglas } from "../../aplicacion/respuestas/contrato-generado";
import type { SobreAlmacen } from "../../aplicacion/respuestas/sobre";
import { html, type HtmlSeguro } from "./plantillas";
import { efectoVisual, enlace, insignia } from "./diseno";
import { fechaLocal } from "./textos";
import { parametrosPanel, type ContextoPanel } from "./panel";
import { esArchivoLocal, presentarRuta, presentarUbicacion } from "./rutas";
import {
  modoAgente,
  estadoVia,
  nombresHallazgos,
  nombreVia,
  motivoNoResolucion,
  legibilidadEntrada,
} from "../presentacion/vocabulario";
export { modoAgente, nombresHallazgos } from "../presentacion/vocabulario";
import { rolOrigen } from "../presentacion/roles";

export const anclaHallazgo = (indice: number): string => `h-${indice}`;

export function agentesProyecto(respuesta: RespuestaAgentes, id: string, contexto: ContextoPanel): HtmlSeguro {
  const agentes = [...respuesta.agentes.filter(a => !a.oculto), ...respuesta.agentes.filter(a => a.oculto)];
  return html`<section id="tabla-agentes"><h2>Agentes <small class="procedencia">Foto guardada</small></h2>
${respuesta.incompleta ? html`<div class="aviso">Listado incompleto. ${respuesta.motivos.map(m => html`<p>${motivoNoResolucion(m, respuesta.reglas)}</p>`)}</div>` : agentes.length && agentes.every(a => a.origen === "nativo") ? html`<p>Este proyecto no define agentes nuevos: usa los de OpenCode</p>` : html``}
${agentes.length ? html`<div class="tabla-contenedor" role="region" aria-label="Agentes" tabindex="0"><table class="tabla-tarjetas" role="table"><caption class="oculto-visual">Agentes</caption><thead><tr role="row"><th scope="col">Nombre</th><th scope="col">Modo</th><th scope="col">Origen</th></tr></thead><tbody>
${agentes.map(a => html`<tr role="row" class="${a.oculto ? "fila-agente atenuado" : "fila-agente"}"><td role="cell" data-etiqueta="Nombre"><a class="agente-enlace" href="${enlace(`/resoluciones/${id}/agentes/${encodeURIComponent(a.nombre)}`, parametrosPanel({ ...contexto, agente: undefined }))}">${a.nombre}</a>${a.oculto ? html` <span class="atenuado">oculto</span>` : html``}</td><td role="cell" class="atenuado" data-etiqueta="Modo">${modoAgente(a.modo)}</td><td role="cell" data-etiqueta="Origen">${insignia(a.origen, rolOrigen(a.origen))}</td></tr>`)}</tbody></table></div>` : html`<p class="estado-vacio">Sin agentes activos</p>`}
${respuesta.eliminados.length ? html`<div id="agentes-eliminados"><h3>Agentes eliminados</h3>${respuesta.eliminados.map(a => html`<p><code>${a.nombre}</code> ${insignia("eliminado / deshabilitado", "aviso")} ${presentarUbicacion(a.declaracion.referencia, a.declaracion.origen.tipo === "declarado" ? a.declaracion.origen.posicion : null, a.declaracion.via, { proyecto: respuesta.proyecto, hogar: contexto.hogar })}</p>`)}</div>` : html``}</section>`;
}

export function mapaVias(respuesta: RespuestaEntradas): HtmlSeguro {
  return respuesta.vias === undefined ? html`<p>Mapa de vías no disponible</p>` : html`
<section id="mapa-vias" class="mapa-vias"><h2>Mapa de vías</h2>
<div class="tabla-contenedor" role="region" aria-label="Mapa de vías" tabindex="0">
<table class="tabla-tarjetas" role="table"><caption class="oculto-visual">Mapa de vías</caption><thead><tr role="row"><th scope="col">Vía</th><th scope="col">Estado</th><th scope="col">Cantidad</th><th scope="col">Lugares revisados</th></tr></thead>
${([ ["presente", "Presentes"], ["ausente", "Ausentes"], ["no_observada", "No observadas"], ["no_soportada", "No soportadas"] ] as const).map(([estado, titulo]) => {
  const vias = respuesta.vias!.filter(via => via.estado === estado);
  return vias.length ? html`<tbody><tr role="row" class="grupo-vias"><th colspan="4" scope="rowgroup">${titulo}</th></tr>${vias.map(via => html`<tr role="row"><td role="cell" data-etiqueta="Vía">${nombreVia(via.via)}</td>
<td role="cell" data-etiqueta="Estado">${insignia(estadoVia(via.estado),
  via.estado === "no_observada" ? "no-observada" : "neutra")}</td>
<td role="cell" data-etiqueta="Cantidad">${via.cantidad}</td><td role="cell" data-etiqueta="Lugares revisados">${via.revisados.length ? html`<details><summary>Lugares revisados</summary>
<ul>${via.revisados.map(revisado => html`<li><code>${revisado}</code></li>`)}</ul></details>` : "—"}</td></tr>`)}</tbody>` : html``;
})}</table></div></section>`;
}

export const archivosObservados = (respuesta: RespuestaEntradas) => respuesta.entradas.filter(e => e.condicion === "observada" && esArchivoLocal(e.referencia, e.via));

export function historial(sobre: SobreAlmacen | undefined): HtmlSeguro {
  if (sobre === undefined) return html`<p class="atenuado">Historial no disponible para este análisis</p>`;
  return html`<details id="historia"><summary>Historial (${sobre.anteriores.length})</summary><ul class="historia">${sobre.anteriores.map((foto, indice) => html`<li><span>Análisis del ${fechaLocal(foto.instante)}</span>
${foto.id === sobre.id ? html`<a href="${`/resoluciones/${foto.id}`}" aria-current="page">Ver</a> ${insignia("esta")}` : html`<a href="${`/resoluciones/${foto.id}`}">Ver</a>`}${indice === 0 ? insignia("más reciente") : html``}
${sobre.anteriores[indice + 1] ? html`<a href="${enlace("/comparar", { desde: sobre.anteriores[indice + 1]!.id, hasta: foto.id })}">Comparar con el anterior</a>` : html``}</li>`)}</ul></details>`;
}

export function filaPermisos(respuesta: RespuestaReglas, id: string, contexto: ContextoPanel): HtmlSeguro {
  const fila = respuesta.matriz.filas.find(f => f.agente === contexto.agente);
  const panel = parametrosPanel(contexto);
  const motivosParciales = fila?.celdas.some(c => c.motivo === "eje-parcialmente-observado") ?? false;
  const motivos = [...new Set([...(fila?.declaraciones ?? []), ...(fila?.advertencias ?? []), ...respuesta.matriz.motivos,
    ...(fila?.celdas.flatMap(c => c.motivo && c.motivo !== "eje-parcialmente-observado" ? [c.motivo] : []) ?? [])])];
  return html`<section id="permisos-agente"><h2>Sujetos de permiso</h2><p>Efecto general; consultá un objetivo concreto para conocer la decisión.</p>
${fila === undefined ? html`<p class="aviso">Fila no disponible.</p>` : html`
<dl class="sujetos-permiso">${fila.celdas.map(c => html`<div><dt>${c.sujeto}</dt><dd><a href="${enlace(`/resoluciones/${id}/permisos`, { ...panel, sujeto: c.sujeto })}">${efectoVisual(c.efecto, c.prevalece === null ? undefined : `Regla ${c.prevalece}`)}${c.prevalece === null ? html`` : html` <span class="atenuado regla-prevalece">Regla ${c.prevalece}</span>`}${c.motivo === "eje-parcialmente-observado" ? html` ${insignia("parcial", "parcial")}` : html``}</a></dd></div>`)}</dl>
${motivosParciales ? html`<p class="leyenda-parcial">${insignia("parcial", "parcial")} ${motivoNoResolucion("eje-parcialmente-observado", respuesta.reglas)}</p>` : html``}
${fila.error ? html`<p class="aviso">${fila.error.mensaje}</p>` : html``}
`}
<details><summary>Límites del análisis</summary>
${fila?.ejesParciales.length ? html`<p>Parcial: ${fila.ejesParciales.join(", ")}</p>` : html``}
${motivos.map(c => html`<p>${motivoNoResolucion(c, respuesta.reglas)}</p>`)}
${respuesta.matriz.noObservados.map(a => html`<p>Agente no observado: ${a.nombre} (${a.motivo ? motivoNoResolucion(a.motivo, respuesta.reglas) : "sin dato"})</p>`)}</details>
<div class="acciones acciones--pie"><a class="boton boton--secundario" href="${enlace("/reglas", { id, ...panel })}">Ver todas las reglas de ${contexto.agente}</a>
<a class="boton boton--secundario" href="${enlace(`/resoluciones/${id}/permisos`, panel)}">Consultar permiso</a></div></section>`;
}

export function archivosActuales(respuesta: RespuestaEntradas): HtmlSeguro {
  const archivos = [...archivosObservados(respuesta)].sort((a, b) => a.orden - b.orden);
  return html`<details id="archivos-leidos"><summary>Archivos leídos (${archivos.length})</summary><p>Orden de precedencia: la de abajo prevalece</p><ol>${archivos.map(e => html`<li>${nombreVia(e.via)} · ${presentarRuta(e.referencia)} ${insignia(e.legibilidad ?? "sin dato")}</li>`)}</ol>${mapaVias(respuesta)}</details>`;
}

export function hallazgosActuales(respuesta: RespuestaHallazgos, id: string, contexto: ContextoPanel): HtmlSeguro {
  const panel = parametrosPanel(contexto);
  const urlHallazgos = enlace("/hallazgos", { proyecto: respuesta.proyecto, id, ...panel });
  const tipos = [...new Set(respuesta.hallazgos.map(h => h.tipo))];
  return html`<section id="hallazgos-actuales"><h2>Hallazgos <small class="procedencia">Estado actual de los archivos</small></h2>
${respuesta.incompleta ? html`<div class="aviso">Hallazgos observados; análisis parcial.${respuesta.motivos.map(m => html`<p>${motivoNoResolucion(m, respuesta.reglas)}</p>`)}</div>` : html``}
${tipos.length ? html`<div class="hallazgos-resumen">${tipos.map(tipo => {
    const indice = respuesta.hallazgos.findIndex(h => h.tipo === tipo);
    const primero = respuesta.hallazgos[indice]!;
    return html`<div class="hallazgo-resumen"><span>${nombresHallazgos[tipo]?.[0] ?? tipo} ${insignia(respuesta.resumen.hallazgos[tipo])}</span><span>${primero.posicion && esArchivoLocal(primero.entrada.referencia, primero.entrada.via) ? presentarUbicacion(primero.entrada.referencia, primero.posicion, primero.entrada.via, { proyecto: respuesta.proyecto, hogar: contexto.hogar }) : html`<a href="${enlace("/entradas", { proyecto: respuesta.proyecto, id, ...panel }, `entrada-${primero.entrada.orden}`)}">${primero.localizacion}</a>`}</span><a href="${`${urlHallazgos}#${anclaHallazgo(indice)}`}">Ver</a></div>`;
  })}</div>` : respuesta.incompleta ? html`<p>Sin hallazgos observados; análisis parcial</p>` : insignia("Sin hallazgos", "neutra")}
<div class="acciones acciones--pie"><a class="boton boton--secundario" href="${urlHallazgos}">Ver hallazgos</a></div></section>`;
}
