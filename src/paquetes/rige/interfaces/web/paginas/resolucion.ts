import type { DeclaracionUbicada, RespuestaConsulta } from "../../../aplicacion/respuestas/consulta";
import { html } from "../plantillas";
import { responderHtml } from "../respuesta";

function presentarDeclaracion(declaracion: DeclaracionUbicada): string {
  return `${JSON.stringify(declaracion.valor)} en ${declaracion.referencia}:${declaracion.posicion.linea}:${declaracion.posicion.columna} (${declaracion.via})`;
}

export function paginaResolucion(respuesta: RespuestaConsulta): Response {
  const { resolucion } = respuesta;
  const consulta = `?agente=${encodeURIComponent(respuesta.agente)}${respuesta.clave ? `&clave=${encodeURIComponent(respuesta.clave)}` : ""}`;
  const pagina = html`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Resolución ${resolucion.id}</title></head>
<body><h1>Resolución ${resolucion.id}</h1>
<p>Página armada con la resolución leída del almacén de RIGE.</p>
<dl><dt>Proyecto</dt><dd>${resolucion.proyecto}</dd>
<dt>Instante (UTC)</dt><dd>${resolucion.instante}</dd>
<dt>Herramienta</dt><dd>${resolucion.herramienta} ${resolucion.versionHerramienta}</dd>
<dt>Agente</dt><dd>${respuesta.agente}</dd>
<dt>Clave</dt><dd>${respuesta.clave ?? "todas"}</dd>
<dt>Resumen de las entradas leídas</dt><dd>${resolucion.resumenEntradas}</dd></dl>
<h2>Valores efectivos</h2>
<table><thead><tr><th>Clave</th><th>Valor efectivo</th><th>Declaración determinante</th><th>Declaraciones desplazadas</th><th>Regla aplicada</th></tr></thead>
<tbody>${respuesta.valores.map(({ clave, rastro }) => html`<tr><td>${clave}</td><td>${JSON.stringify(rastro.valor)}</td>
<td>${presentarDeclaracion(rastro.determinante)}</td><td>${rastro.desplazadas.length
    ? html`<ol>${rastro.desplazadas.map((declaracion) => html`<li>${presentarDeclaracion(declaracion)}</li>`)}</ol>`
    : "ninguna"}</td><td>${respuesta.reglas[rastro.determinante.regla]}</td></tr>`)}</tbody></table>
${respuesta.noResueltas.length ? html`<h2>Claves no resueltas en el prototipo v1</h2>
<ul>${respuesta.noResueltas.map((clave) => html`<li>${clave.ruta.join(".")}: ${respuesta.reglas[clave.regla]}</li>`)}</ul>` : html``}
<h2>Entradas leídas</h2>
<table><thead><tr><th>Orden</th><th>Vía</th><th>Referencia</th><th>Condición</th><th>Resumen SHA-256</th></tr></thead>
<tbody>${resolucion.entradas.map((entrada) => html`<tr><td>${entrada.orden}</td><td>${entrada.via}</td><td>${entrada.referencia}</td><td>${entrada.condicion}</td><td>${entrada.resumen ?? "—"}</td></tr>`)}</tbody></table>
<h2>Resoluciones de este proyecto</h2>
<ul>${respuesta.anteriores.map((anterior) => html`<li><a href="${`/resoluciones/${anterior.id}${consulta}`}">Resolución ${anterior.id}</a> ${anterior.instante}${anterior.id === resolucion.id ? " (esta)" : ""}</li>`)}</ul>
</body></html>`;
  return responderHtml(200, pagina);
}
