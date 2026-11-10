import type { RespuestaEstado } from "../../../aplicacion/respuestas/estado";
import type { RespuestaProyectosRecientes } from "../../../aplicacion/respuestas/proyectos-recientes";
import { html } from "../plantillas";
import { diseno } from "../diseno";
import { responderHtml } from "../respuesta";

export function paginaInicio(respuesta: RespuestaEstado, recientes: RespuestaProyectosRecientes = { esquema: 2, proyectos: [] }): Response {
  return responderHtml(200, diseno("Inicio", html`
<div class="hero"><p class="ceja">De la configuración a la certeza</p>
<h1>¿Qué configuración rige de verdad?</h1>
<p>RIGE muestra la configuración efectiva de tus agentes, de dónde viene cada valor y qué regla decide cada permiso.</p></div>
<section class="tarjeta tarjeta--principal" aria-labelledby="titulo-resolver">
<h2 id="titulo-resolver">Analizar un proyecto</h2>
<form method="get" action="/resolver">
<label>Proyecto <input type="text" name="proyecto" placeholder="Ruta del proyecto" required></label>
<button type="submit">Analizar</button></form>
<p class="ayuda">El panel reúne Valores, Permisos y Agentes de la foto guardada, y Entradas y Hallazgos del estado actual.</p>
</section>
${recientes.proyectos.length ? html`<section id="proyectos-recientes" class="tarjeta"><h2>Proyectos recientes</h2>
<ul class="historia">${recientes.proyectos.map(p => html`<li><a href="${`/resoluciones/${encodeURIComponent(p.id)}`}">${p.proyecto}</a>
<time>${p.instante}</time><span>${p.cantidad} fotos guardadas</span>
<a class="boton boton--secundario" href="${`/resolver?proyecto=${encodeURIComponent(p.proyecto)}`}">Analizar de nuevo</a></li>`)}</ul></section>` : html``}`, { activa: "Inicio", almacen: respuesta.almacen }));
}
