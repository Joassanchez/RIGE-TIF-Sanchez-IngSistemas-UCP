import type { RespuestaEstado } from "../../../aplicacion/respuestas/estado";
import type { RespuestaProyectosRecientes } from "../../../aplicacion/respuestas/proyectos-recientes";
import { html } from "../plantillas";
import { diseno } from "../diseno";
import { responderHtml } from "../respuesta";
import { fechaRelativa, nombreProyecto } from "../textos";

export function paginaInicio(respuesta: RespuestaEstado, recientes: RespuestaProyectosRecientes = { esquema: 2, proyectos: [] }): Response {
  const ahora = new Date();
  return responderHtml(200, diseno("Inicio", html`
<div class="hero"><h1>¿Qué configuración rige en este proyecto?</h1></div>
<section id="analizar-proyecto" class="tarjeta tarjeta--principal" aria-labelledby="titulo-resolver">
<h2 id="titulo-resolver">Analizar un proyecto</h2>
<form method="get" action="/resolver">
<label>Carpeta del proyecto <input type="text" name="proyecto" placeholder="C:\\proyectos\\mi-app" required></label>
<button type="submit">Analizar</button></form>
<details id="ayuda-analizar"><summary>¿Qué significa?</summary><p>Valores, Permisos y Agentes muestran la configuración efectiva guardada, su procedencia y las reglas de permiso. Entradas y Hallazgos muestran el estado actual.</p></details>
</section>
<section id="proyectos-recientes"><h2>Proyectos recientes</h2>
${recientes.proyectos.length ? html`<ul class="recientes">${recientes.proyectos.map(p => html`<li class="tarjeta">
<a class="reciente__foto" href="${`/resoluciones/${encodeURIComponent(p.id)}`}"><strong>${nombreProyecto(p.proyecto)}</strong>
<code title="${p.proyecto}">${p.proyecto}</code><span><time datetime="${p.instante}">${fechaRelativa(p.instante, ahora)}</time> · ${p.cantidad} análisis</span></a>
<a class="reciente__reanalizar" href="${`/resolver?proyecto=${encodeURIComponent(p.proyecto)}`}">Analizar de nuevo</a></li>`)}</ul>`
    : html`<p>Ingresá la carpeta de un proyecto y pulsá Analizar para ver su configuración.</p>`}</section>`, { activa: "Inicio", almacen: respuesta.almacen }));
}
