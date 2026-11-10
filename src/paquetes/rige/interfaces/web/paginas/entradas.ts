import { comandoCli } from "../comando-cli";
import { selectorAgente, type ContextoPanel } from "../panel";
import type { RespuestaEntradas } from "../../../aplicacion/respuestas/entradas";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta } from "../rutas";

export function paginaEntradas(respuesta: RespuestaEntradas, contexto: ContextoPanel = {}): Response {
  return responderHtml(200, diseno("Entradas", html`
<div class="cabecera-pagina"><p class="ceja">Fuentes de configuración</p><h1>Entradas</h1>
<p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p>
<p>Estado actual de las entradas de configuración (no es la foto guardada)</p></div>
${selectorAgente(contexto, "Entradas", respuesta.proyecto)}
${respuesta.vias === undefined ? html`<p>Mapa de vías no disponible</p>` : html`
<section id="mapa-vias" class="mapa-vias"><h2>Mapa de vías</h2>
<div class="tabla-contenedor" role="region" aria-label="Mapa de vías" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Vía</th><th>Estado</th><th>Cantidad</th><th>Lugares revisados</th></tr></thead>
${([ ["presente", "Presentes"], ["ausente", "Ausentes"], ["no_observada", "No observadas"] ] as const).map(([estado, titulo]) => {
  const vias = respuesta.vias!.filter(via => via.estado === estado);
  return vias.length ? html`<tbody><tr class="grupo-vias"><th colspan="4" scope="rowgroup">${titulo}</th></tr>${vias.map(via => html`<tr><td data-etiqueta="Vía">${via.via}</td>
<td data-etiqueta="Estado">${insignia(via.estado === "no_observada" ? "no observada" : via.estado,
  via.estado === "presente" ? "permitida" : via.estado === "ausente" ? "neutra" : "no-observada")}</td>
<td data-etiqueta="Cantidad">${via.cantidad}</td><td data-etiqueta="Lugares revisados">${via.revisados.length ? html`<details><summary>Lugares revisados</summary>
<ul>${via.revisados.map(revisado => html`<li><code>${revisado}</code></li>`)}</ul></details>` : "—"}</td></tr>`)}</tbody>` : html``;
})}</table></div></section>`}
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="tabla-entradas"><h2>Vías y legibilidad</h2>
<div class="tabla-contenedor" role="region" aria-label="Entradas" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Orden</th><th>Vía</th><th>Referencia</th><th>Condición</th><th>Legibilidad</th><th>Error</th></tr></thead>
<tbody>${respuesta.entradas.map(entrada => html`<tr id="${`entrada-${entrada.orden}`}"><td data-etiqueta="Orden">${entrada.orden}</td><td data-etiqueta="Vía">${entrada.via}</td><td data-etiqueta="Referencia">${presentarRuta(entrada.referencia)}</td><td data-etiqueta="Condición">${insignia(entrada.condicion, entrada.condicion === "no_observada" ? "neutra" : "permitida")}</td><td data-etiqueta="Legibilidad">${insignia(entrada.legibilidad ?? "no observada", entrada.legibilidad === "ilegible" ? "denegada" : entrada.legibilidad === "legible" ? "permitida" : "neutra")}</td><td data-etiqueta="Error">${entrada.error ? html`<div class="aviso aviso--advertencia">${`${entrada.error.linea}:${entrada.error.columna} (${entrada.error.consecuencia})`}</div>` : "—"}</td></tr>`)}</tbody></table></div></section>
<p class="bloque atenuado">Resumen del conjunto: <code>${respuesta.resumenEntradas}</code></p>
${comandoCli("entradas", { proyecto: respuesta.proyecto })}
${datosRespuesta(respuesta)}`, { ...contexto, proyecto: respuesta.proyecto, activa: "Entradas" }));
}
