import type { RespuestaEntradas } from "../../../aplicacion/respuestas/entradas";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta } from "../rutas";

export function paginaEntradas(respuesta: RespuestaEntradas): Response {
  return responderHtml(200, diseno("Entradas", html`
<div class="cabecera-pagina"><p class="ceja">Fuentes de configuración</p><h1>Entradas</h1>
<p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p></div>
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="tabla-entradas"><h2>Vías y legibilidad</h2>
<div class="tabla-contenedor" role="region" aria-label="Entradas" tabindex="0">
<table><thead><tr><th>Orden</th><th>Vía</th><th>Referencia</th><th>Condición</th><th>Legibilidad</th><th>Error</th></tr></thead>
<tbody>${respuesta.entradas.map(entrada => html`<tr id="${`entrada-${entrada.orden}`}"><td>${entrada.orden}</td><td>${entrada.via}</td><td>${presentarRuta(entrada.referencia)}</td><td>${insignia(entrada.condicion, entrada.condicion === "no_observada" ? "neutra" : "permitida")}</td><td>${insignia(entrada.legibilidad ?? "no observada", entrada.legibilidad === "ilegible" ? "denegada" : entrada.legibilidad === "legible" ? "permitida" : "neutra")}</td><td>${entrada.error ? html`<div class="aviso aviso--advertencia">${`${entrada.error.linea}:${entrada.error.columna} (${entrada.error.consecuencia})`}</div>` : "—"}</td></tr>`)}</tbody></table></div></section>
<p class="bloque atenuado">Resumen del conjunto: <code>${respuesta.resumenEntradas}</code></p>
${datosRespuesta(respuesta)}`, { proyecto: respuesta.proyecto, activa: "Entradas" }));
}
