import type { RespuestaHallazgos } from "../../../aplicacion/respuestas/hallazgos";
import { datosRespuesta, html } from "../plantillas";
import { responderHtml } from "../respuesta";

export function paginaHallazgos(respuesta: RespuestaHallazgos): Response {
  return responderHtml(200, html`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Hallazgos</title></head><body>
<h1>Hallazgos</h1><p>Proyecto: ${respuesta.proyecto}</p>
<h2>Declaraciones</h2><ul>${respuesta.declaraciones.map(codigo => html`<li>${respuesta.reglas[codigo]}</li>`)}</ul>
<table><thead><tr><th>Tipo</th><th>Localizaci?n</th><th>Explicaci?n</th></tr></thead>
<tbody>${respuesta.hallazgos.map(hallazgo => html`<tr><td>${hallazgo.tipo}</td><td>${hallazgo.localizacion}</td><td>${hallazgo.explicacion}</td></tr>`)}</tbody></table>
${respuesta.incompleta ? html`<p>Hallazgos parciales.</p>` : html``}
<ul>${respuesta.motivos.map(motivo => html`<li>${respuesta.reglas[motivo]}</li>`)}</ul>
${datosRespuesta(respuesta)}</body></html>`);
}
