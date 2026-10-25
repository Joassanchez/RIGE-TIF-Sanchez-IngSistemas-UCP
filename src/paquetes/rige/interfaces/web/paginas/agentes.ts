import type { RespuestaAgentes } from "../../../aplicacion/respuestas/agentes";
import { datosRespuesta, html } from "../plantillas";
import { responderHtml } from "../respuesta";

export function paginaAgentes(respuesta: RespuestaAgentes): Response {
  return responderHtml(200, html`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Agentes</title></head><body>
<h1>Agentes</h1><p>Proyecto: ${respuesta.proyecto}</p>
<table><thead><tr><th>Nombre</th><th>Origen</th><th>Modo</th><th>Oculto</th></tr></thead>
<tbody>${respuesta.agentes.map(agente => html`<tr><td>${agente.nombre}</td><td>${agente.origen}</td><td>${agente.modo}</td><td>${agente.oculto}</td></tr>`)}</tbody></table>
<h2>Agentes eliminados</h2><ul>${respuesta.eliminados.map(agente => html`<li>${agente.nombre}: ${JSON.stringify(agente.declaracion)}</li>`)}</ul>
${respuesta.incompleta ? html`<p>Listado incompleto.</p><ul>${respuesta.motivos.map(motivo => html`<li>${respuesta.reglas[motivo]}</li>`)}</ul>` : html``}
${datosRespuesta(respuesta)}</body></html>`);
}
