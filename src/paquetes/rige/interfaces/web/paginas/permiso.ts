import type { RespuestaPermiso } from "../../../aplicacion/respuestas/permiso";
import { datosRespuesta, html } from "../plantillas";
import { responderHtml } from "../respuesta";

export function paginaPermiso(respuesta: RespuestaPermiso): Response {
  return responderHtml(200, html`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Permiso</title></head><body>
<h1>Permiso de ${respuesta.agente}</h1>
<p>Proyecto: ${respuesta.proyecto}</p>
<p>${respuesta.consulta.sujeto}: ${respuesta.consulta.objetivo}</p>
<h2>Decisión</h2><p>${respuesta.decision ?? respuesta.motivoSinDecision}</p>
<h2>Reglas coincidentes</h2>
<table><thead><tr><th>Índice</th><th>Sujeto</th><th>Patrón</th><th>Efecto</th><th>Procedencia</th><th>Prevalencia</th></tr></thead>
<tbody>${respuesta.cadena.map(regla => html`<tr><td>${regla.indice}</td><td>${regla.sujeto}</td><td>${regla.patron}</td><td>${regla.efecto}</td>
<td>${regla.origen.tipo === "declarado"
    ? `${regla.declaracion?.referencia}:${regla.origen.posicion.linea}:${regla.origen.posicion.columna} (${regla.declaracion?.via})`
    : `${regla.origen.tipo}: ${regla.origen.regla}`}</td>
<td>${regla.indice === respuesta.determinante ? html`<strong>Determinante</strong>` : "Desplazada"}</td></tr>`)}</tbody></table>
${respuesta.nativaAnulada ? html`<p>Advertencia RF-09: protección nativa anulada (regla ${respuesta.nativaAnulada.regla}, por ${respuesta.nativaAnulada.por}).</p>` : html``}
<h2>Advertencias</h2><ul>${respuesta.advertencias.map(codigo => html`<li>${respuesta.reglas[codigo]}</li>`)}</ul>
<h2>Declaraciones</h2><ul>${respuesta.declaraciones.map(codigo => html`<li>${respuesta.reglas[codigo]}</li>`)}</ul>
<h2>Explicación</h2>${respuesta.explicacion?.map(oracion => html`<p>${oracion}</p>`) ?? html``}
${datosRespuesta(respuesta)}</body></html>`);
}
