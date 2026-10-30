import type { RespuestaEntradas } from "../../../aplicacion/respuestas/entradas";
import { datosRespuesta, html } from "../plantillas";
import { responderHtml } from "../respuesta";

export function paginaEntradas(respuesta: RespuestaEntradas): Response {
  return responderHtml(200, html`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Entradas</title></head><body>
<h1>Entradas</h1><p>Proyecto: ${respuesta.proyecto}</p>
<h2>Declaraciones</h2><ul>${respuesta.declaraciones.map(codigo => html`<li>${respuesta.reglas[codigo]}</li>`)}</ul>
<table><thead><tr><th>Orden</th><th>Vía</th><th>Referencia</th><th>Condición</th><th>Legibilidad</th><th>Error</th></tr></thead>
<tbody>${respuesta.entradas.map(entrada => html`<tr><td>${entrada.orden}</td><td>${entrada.via}</td><td>${entrada.referencia}</td><td>${entrada.condicion}</td><td>${entrada.legibilidad ?? "no observada"}</td><td>${entrada.error ? `${entrada.error.linea}:${entrada.error.columna} (${entrada.error.consecuencia})` : ""}</td></tr>`)}</tbody></table>
<p>Resumen del conjunto: ${respuesta.resumenEntradas}</p>
${datosRespuesta(respuesta)}</body></html>`);
}
