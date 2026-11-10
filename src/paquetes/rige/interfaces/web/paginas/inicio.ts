import type { RespuestaEstado } from "../../../aplicacion/respuestas/estado";
import type { RespuestaProyectosRecientes } from "../../../aplicacion/respuestas/proyectos-recientes";
import { html } from "../plantillas";
import { diseno } from "../diseno";
import { responderHtml } from "../respuesta";
import { concordar, presentarInstante } from "../textos";

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
<p id="ayuda-analizar" class="ayuda">El panel reúne Valores, Permisos y Agentes de la foto guardada, y Entradas y Hallazgos del estado actual.</p>
</section>
${recientes.proyectos.length ? html`<section id="proyectos-recientes" class="tarjeta"><h2>Proyectos recientes</h2>
<ul class="historia recientes">${recientes.proyectos.map(p => html`<li><strong>${p.proyecto}</strong>
${presentarInstante(p.instante)}<span>${p.cantidad} ${concordar(p.cantidad, "foto guardada", "fotos guardadas")}</span>
<a class="boton" href="${`/resoluciones/${encodeURIComponent(p.id)}`}">Abrir la última foto</a>
<a class="boton boton--secundario" href="${`/resolver?proyecto=${encodeURIComponent(p.proyecto)}`}">Analizar de nuevo</a></li>`)}</ul></section>` : html``}`, { activa: "Inicio", almacen: respuesta.almacen }));
}
