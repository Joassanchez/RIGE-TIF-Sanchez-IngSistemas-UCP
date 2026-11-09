import type { DeclaracionUbicada, RespuestaValores } from "../../../aplicacion/respuestas/valores";
import type { SobreAlmacen } from "../../../aplicacion/respuestas/sobre";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { presentarRuta } from "../rutas";
import { responderHtml } from "../respuesta";

function presentarOrigen(declaracion: DeclaracionUbicada): HtmlSeguro {
  const { origen } = declaracion;
  if (origen.tipo !== "declarado") return html`${insignia(origen.tipo === "implicito" ? "implícito" : origen.tipo)} <code class="motivo-origen">${origen.regla}</code>`;
  return html`${insignia(declaracion.via)} ${presentarRuta(String(declaracion.localizacion ?? declaracion.referencia))}`;
}

function presentarDesplazada(declaracion: DeclaracionUbicada): HtmlSeguro {
  return html`<span class="valor-desplazado">${JSON.stringify(declaracion.valor)}</span> ${presentarOrigen(declaracion)}`;
}

export function paginaResolucion(respuesta: RespuestaValores, sobre: SobreAlmacen): Response {
  const clave = respuesta.ruta === null ? null : respuesta.ruta.every(segmento => !/[./~]/.test(segmento))
    ? respuesta.ruta.join(".")
    : "/" + respuesta.ruta.map(segmento => segmento.replaceAll("~", "~0").replaceAll("/", "~1")).join("/");
  const consulta = `?agente=${encodeURIComponent(respuesta.agente)}${clave ? `&clave=${encodeURIComponent(clave)}` : ""}`;
  const reglasUsadas = [...new Set(respuesta.valores.map(valor => valor.rastro.determinante.regla))].filter(codigo => codigo.trim().length > 0);
  return responderHtml(200, diseno(`Resolución ${sobre.id}`, html`
<section id="resumen-resolucion" class="cabecera-pagina"><p class="ceja">Configuración efectiva · ${respuesta.valores.length} valores</p>
<h1>Resolución ${sobre.id}</h1>
<p>Página armada con la resolución leída del almacén de RIGE.</p>
<dl class="resumen"><div><dt>Proyecto</dt><dd>${presentarRuta(respuesta.proyecto)}</dd></div>
<div><dt>Agente</dt><dd><code>${respuesta.agente}</code></dd></div>
<div><dt>Instante (UTC)</dt><dd>${sobre.instante}</dd></div>
<div><dt>Herramienta</dt><dd>${respuesta.herramienta} ${respuesta.versionHerramienta}</dd></div>
<div><dt>Clave</dt><dd><code>${respuesta.ruta?.join(".") ?? "todas"}</code></dd></div></dl></section>
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="valores"><h2>Valores efectivos</h2>
<div class="tabla-contenedor" role="region" aria-label="Valores efectivos" tabindex="0">
<table><thead><tr><th>Clave</th><th>Valor efectivo</th><th>Declaración determinante</th><th>Declaraciones desplazadas</th><th>Regla aplicada</th></tr></thead>
<tbody>${respuesta.valores.length ? respuesta.valores.map(({ clave, rastro }) => html`<tr><td>${clave}</td><td>${JSON.stringify(rastro.valor)}${rastro.determinante.origen.tipo === "implicito" ? html` <span class="insignia insignia--neutra insignia--implicita">implícito</span>` : html``}</td>
<td>${presentarOrigen(rastro.determinante)}</td><td>${rastro.desplazadas.length
    ? html`<ol>${rastro.desplazadas.map(declaracion => html`<li>${presentarDesplazada(declaracion)}</li>`)}</ol>`
    : "ninguna"}</td><td>${rastro.determinante.regla.trim() ? insignia(rastro.determinante.regla)
      : html`<details class="regla-detalle"><summary>Regla aplicada</summary><p>${respuesta.reglas[rastro.determinante.regla]}</p></details>`}</td></tr>`)
    : html`<tr><td colspan="5">${respuesta.motivo === "clave-inexistente" ? "La clave consultada no existe para el agente." : "RIGE no incorpora claves resueltas para este agente."}</td></tr>`}</tbody></table></div>
${reglasUsadas.length ? html`<div id="leyenda-reglas" class="leyenda-reglas"><h3>Reglas aplicadas</h3><dl>${reglasUsadas.map(codigo => html`<dt>${insignia(codigo)}</dt><dd>${respuesta.reglas[codigo]}</dd>`)}</dl></div>` : html``}
${respuesta.motivo ? html`<p class="aviso bloque">Motivo: ${respuesta.motivo}</p>` : html``}</section>
<section id="acciones-resolucion"><h2>Seguir explorando</h2><div class="rejilla">
<div class="tarjeta"><h3>Consultar permiso</h3>
<form id="consultar-permiso" action="/permiso" method="get">
<input type="hidden" name="id" value="${sobre.id}">
<label>Agente <input name="agente" value="${respuesta.agente}" required></label>
<div class="grupo-campos"><label>Herramienta <input name="herramienta" placeholder="read" required></label>
<label>Objetivo <input name="objetivo" placeholder=".env" required></label></div>
<button>Consultar permiso</button></form>
<details><summary>Consultar por sujeto</summary><form action="/permiso" method="get">
<input type="hidden" name="id" value="${sobre.id}">
<label>Agente <input name="agente" value="${respuesta.agente}" required></label>
<label>Sujeto <input name="sujeto" required></label>
<label>Objetivo <input name="objetivo" required></label>
<button class="boton--secundario">Consultar sujeto de permiso</button></form></details></div>
<div class="tarjeta"><h3>Agentes de esta resolución</h3><p class="atenuado">Revisá el origen, el modo y la visibilidad de cada agente.</p>
<form action="/agentes" method="get"><input type="hidden" name="id" value="${sobre.id}"><button class="boton--secundario">Listar agentes</button></form></div>
</div></section>
${respuesta.noResueltas.length ? html`<details id="claves-no-incorporadas"><summary>Claves no incorporadas por RIGE</summary>
<ul>${respuesta.noResueltas.map(clave => html`<li>${clave.ruta.join(".")}: ${respuesta.reglas[clave.regla]}</li>`)}</ul></details>` : html``}
<details id="entradas-leidas"><summary>Entradas leídas</summary>
<dl><dt>Resumen de las entradas leídas</dt><dd>${respuesta.resumenEntradas}</dd></dl>
<div class="tabla-contenedor" role="region" aria-label="Entradas leídas" tabindex="0">
<table><thead><tr><th>Orden</th><th>Vía</th><th>Referencia</th><th>Condición</th><th>Resumen SHA-256</th></tr></thead>
<tbody>${respuesta.entradas.map(entrada => html`<tr><td>${entrada.orden}</td><td>${entrada.via}</td><td>${presentarRuta(entrada.referencia)}</td><td>${insignia(entrada.condicion, entrada.condicion === "no_observada" ? "neutra" : "permitida")}</td><td><code>${entrada.resumen ?? "—"}</code></td></tr>`)}</tbody></table></div></details>
<section id="historia"><h2>Resoluciones de este proyecto</h2>
<ul class="historia">${sobre.anteriores.map(anterior => html`<li>${anterior.id === sobre.id
    ? html`<a href="${`/resoluciones/${anterior.id}${consulta}`}" aria-current="page">Resolución ${anterior.id}</a>`
    : html`<a href="${`/resoluciones/${anterior.id}${consulta}`}">Resolución ${anterior.id}</a>`} <time>${anterior.instante}</time>${anterior.id === sobre.id ? html`<span class="insignia insignia--neutra">(esta)</span>` : html``}</li>`)}</ul></section>
${datosRespuesta(respuesta)}`, { proyecto: respuesta.proyecto, idResolucion: sobre.id }));
}
