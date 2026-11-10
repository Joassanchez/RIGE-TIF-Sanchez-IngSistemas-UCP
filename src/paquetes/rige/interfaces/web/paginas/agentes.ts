import { comandoCli } from "../comando-cli";
import type { ContextoPanel } from "../panel";
import type { RespuestaAgentes } from "../../../aplicacion/respuestas/agentes";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta } from "../rutas";

export function paginaAgentes(respuesta: RespuestaAgentes, idResolucion?: string, clave?: string, contexto: ContextoPanel = {}): Response {
  return responderHtml(200, diseno("Agentes", html`
<div class="cabecera-pagina"><p class="ceja">Inventario de agentes</p><h1>Agentes</h1><p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p></div>
${idResolucion === undefined ? html`` : html`<p>Foto guardada · resolución ${idResolucion}</p>`}
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
${respuesta.incompleta ? html`<div class="aviso aviso--advertencia"><p>Listado incompleto.</p>${respuesta.motivos.map(codigo => html`<p>${respuesta.reglas[codigo]}</p>`)}</div>` : html``}
<section id="tabla-agentes"><h2>Agentes disponibles</h2>
<div class="tabla-contenedor" role="region" aria-label="Agentes" tabindex="0">
<table><thead><tr><th>Nombre</th><th>Origen</th><th>Modo</th><th>Oculto</th></tr></thead>
<tbody>${respuesta.agentes.map(agente => html`<tr><td>${idResolucion === undefined ? html`<code>${agente.nombre}</code>` : html`<a href="${`/resoluciones/${encodeURIComponent(idResolucion)}?agente=${encodeURIComponent(agente.nombre)}${clave ? `&clave=${encodeURIComponent(clave)}` : ""}`}"><code>${agente.nombre}</code></a>`}</td><td>${insignia(agente.origen)}</td><td>${insignia(agente.modo)}</td><td>${insignia(agente.oculto ? "sí" : "no", agente.oculto ? "aviso" : "neutra")}</td></tr>`)}</tbody></table></div>
${respuesta.agentes.length ? html`` : html`<p class="estado-vacio">Sin agentes disponibles.</p>`}</section>
<section id="agentes-eliminados"><h2>Agentes eliminados</h2>
${respuesta.eliminados.length ? respuesta.eliminados.map(agente => html`<div class="aviso aviso--advertencia"><p><code>${agente.nombre}</code> ${insignia("eliminado / deshabilitado", "aviso")}: ${presentarRuta(String(agente.declaracion.localizacion ?? agente.declaracion.referencia))} (${agente.declaracion.via})</p></div>`) : html`<p class="atenuado">Ningún agente eliminado.</p>`}</section>
${comandoCli("agentes", { proyecto: respuesta.proyecto })}
${datosRespuesta(respuesta)}`, { ...contexto, proyecto: respuesta.proyecto, ...(idResolucion === undefined ? {} : { idResolucion }), ...(clave ? { clave } : {}), activa: "Agentes" }));
}
