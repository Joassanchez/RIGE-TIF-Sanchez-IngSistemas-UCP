import type { RespuestaEstado } from "../../../aplicacion/respuestas/estado";
import type { RespuestaProyectosRecientes } from "../../../aplicacion/respuestas/contrato-generado";
import { html } from "../plantillas";
import { diseno, enlace } from "../diseno";
import { responderHtml } from "../respuesta";
import { dosSegmentos, fechaRelativa } from "../textos";

export function paginaInicio(respuesta: RespuestaEstado, recientes: RespuestaProyectosRecientes = { esquema: 2, proyectos: [] }, ahora: Date): Response {
  return responderHtml(200, diseno("Inicio", html`
<section class="hero" aria-labelledby="titulo-bienvenida">
<h1 id="titulo-bienvenida">¿Qué configuración rige en tu proyecto?</h1>
<p class="atenuado">Inspeccioná qué agentes, reglas de permiso y valores efectivos aplican en tu carpeta, con su origen exacto.</p>
<div id="analizar-proyecto" class="tarjeta" aria-labelledby="titulo-resolver">
<h2 id="titulo-resolver">Analizar un proyecto</h2>
<form method="get" action="/resolver">
<label>Carpeta del proyecto <input type="text" name="proyecto" placeholder="C:\\proyectos\\mi-app" required></label>
<button type="submit">Analizar</button></form>
<details id="ayuda-analizar"><summary>¿Qué significa?</summary><p>Valores, Permisos y Agentes muestran la configuración efectiva guardada, su procedencia y las reglas de permiso. Entradas y Hallazgos muestran el estado actual.</p></details>
</div>
</section>
<section id="proyectos-recientes"><h2>Proyectos recientes</h2>
${recientes.proyectos.length ? html`<ul class="recientes">${recientes.proyectos.map(p => html`<li class="tarjeta">
<a class="reciente__foto" href="${`/resoluciones/${encodeURIComponent(p.id)}`}"><strong>${dosSegmentos(p.proyecto)}</strong>
<code title="${p.proyecto}">${p.proyecto}</code><span><time datetime="${p.instante}">${fechaRelativa(p.instante, ahora)}</time> · ${p.cantidad} análisis</span></a>
<div class="reciente__acciones"><a class="reciente__ver" href="${`/resoluciones/${encodeURIComponent(p.id)}`}">Ver análisis</a>
<a class="reciente__reanalizar" href="${enlace("/resolver", { proyecto: p.proyecto })}">Analizar de nuevo</a></div></li>`)}</ul>`
    : html`<p>Ingresá la carpeta de un proyecto y pulsá Analizar para ver su configuración.</p>`}</section>`, { activa: "Inicio" }));
}
