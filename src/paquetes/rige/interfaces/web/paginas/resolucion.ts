import type { DeclaracionUbicada, RespuestaValores } from "../../../aplicacion/respuestas/valores";
import type { SobreAlmacen } from "../../../aplicacion/respuestas/sobre";
import { html } from "../plantillas";
import { responderHtml } from "../respuesta";

function presentarDeclaracion(declaracion: DeclaracionUbicada): string {
  const { origen } = declaracion;
  if (origen.tipo !== "declarado") return `${JSON.stringify(declaracion.valor)} (${origen.tipo}: ${origen.regla})`;
  return `${JSON.stringify(declaracion.valor)} en ${declaracion.referencia}:${origen.posicion.linea}:${origen.posicion.columna} (${declaracion.via})`;
}

export function paginaResolucion(respuesta: RespuestaValores, sobre: SobreAlmacen): Response {
  const clave = respuesta.ruta === null ? null : respuesta.ruta.every(segmento => !/[./~]/.test(segmento))
    ? respuesta.ruta.join(".")
    : "/" + respuesta.ruta.map(segmento => segmento.replaceAll("~", "~0").replaceAll("/", "~1")).join("/");
  const consulta = `?agente=${encodeURIComponent(respuesta.agente)}${clave ? `&clave=${encodeURIComponent(clave)}` : ""}`;
  const pagina = html`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Resolución ${sobre.id}</title></head>
<body><h1>Resolución ${sobre.id}</h1>
<p>Página armada con la resolución leída del almacén de RIGE.</p>
<nav><a href="${`/agentes?id=${sobre.id}`}">Agentes</a>
<a href="#consultar-permiso">Consultar permiso</a></nav>
<form action="/agentes" method="get"><input type="hidden" name="id" value="${sobre.id}"><button>Listar agentes</button></form>
<form id="consultar-permiso" action="/permiso" method="get">
<input type="hidden" name="id" value="${sobre.id}">
<label>Agente <input name="agente" value="${respuesta.agente}" required></label>
<label>Herramienta <input name="herramienta" required></label>
<label>Objetivo <input name="objetivo" required></label>
<button>Consultar permiso</button></form>
<form action="/permiso" method="get">
<input type="hidden" name="id" value="${sobre.id}">
<label>Agente <input name="agente" value="${respuesta.agente}" required></label>
<label>Sujeto <input name="sujeto" required></label>
<label>Objetivo <input name="objetivo" required></label>
<button>Consultar sujeto de permiso</button></form>
<dl><dt>Proyecto</dt><dd>${respuesta.proyecto}</dd>
<dt>Instante (UTC)</dt><dd>${sobre.instante}</dd>
<dt>Herramienta</dt><dd>${respuesta.herramienta} ${respuesta.versionHerramienta}</dd>
<dt>Agente</dt><dd>${respuesta.agente}</dd>
<dt>Clave</dt><dd>${respuesta.ruta?.join(".") ?? "todas"}</dd>
<dt>Resumen de las entradas leídas</dt><dd>${respuesta.resumenEntradas}</dd></dl>
<h2>Valores efectivos</h2>
<table><thead><tr><th>Clave</th><th>Valor efectivo</th><th>Declaración determinante</th><th>Declaraciones desplazadas</th><th>Regla aplicada</th></tr></thead>
<tbody>${respuesta.valores.length ? respuesta.valores.map(({ clave, rastro }) => html`<tr><td>${clave}</td><td>${JSON.stringify(rastro.valor)}</td>
<td>${presentarDeclaracion(rastro.determinante)}</td><td>${rastro.desplazadas.length
    ? html`<ol>${rastro.desplazadas.map((declaracion) => html`<li>${presentarDeclaracion(declaracion)}</li>`)}</ol>`
    : "ninguna"}</td><td>${respuesta.reglas[rastro.determinante.regla]}</td></tr>`)
    : html`<tr><td colspan="5">${respuesta.motivo === "clave-inexistente" ? "La clave consultada no existe para el agente." : "El agente no tiene claves resueltas en el prototipo v1."}</td></tr>`}</tbody></table>
${respuesta.motivo ? html`<p>Motivo: ${respuesta.motivo}</p>` : html``}
${respuesta.noResueltas.length ? html`<h2>Claves no resueltas en el prototipo v1</h2>
<ul>${respuesta.noResueltas.map((clave) => html`<li>${clave.ruta.join(".")}: ${respuesta.reglas[clave.regla]}</li>`)}</ul>` : html``}
<h2>Entradas leídas</h2>
<table><thead><tr><th>Orden</th><th>Vía</th><th>Referencia</th><th>Condición</th><th>Resumen SHA-256</th></tr></thead>
<tbody>${respuesta.entradas.map((entrada) => html`<tr><td>${entrada.orden}</td><td>${entrada.via}</td><td>${entrada.referencia}</td><td>${entrada.condicion}</td><td>${entrada.resumen ?? "—"}</td></tr>`)}</tbody></table>
<h2>Resoluciones de este proyecto</h2>
<ul>${sobre.anteriores.map((anterior) => html`<li><a href="${`/resoluciones/${anterior.id}${consulta}`}">Resolución ${anterior.id}</a> ${anterior.instante}${anterior.id === sobre.id ? " (esta)" : ""}</li>`)}</ul>
</body></html>`;
  return responderHtml(200, pagina);
}
