import { rotuloFoto } from "../textos";
import type { RespuestaAgentes } from "../../../aplicacion/respuestas/contrato-generado";
import { html } from "../plantillas";
import { diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { camposContexto, selectorAgente, type ContextoPanel } from "../panel";
import { presentarRuta } from "../rutas";

export function paginaConsultasPermiso(respuesta: RespuestaAgentes, contexto: ContextoPanel): Response {
  return responderHtml(200, diseno("Permisos", html`<div class="cabecera-pagina"><div class="barra-agente"><h1>Permisos</h1>${selectorAgente(contexto, "Permisos", respuesta.proyecto)}</div>
<p>¿Qué permiso querés consultar?</p>
<details><summary>¿Qué significa?</summary>
<p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p>${rotuloFoto(respuesta.proyecto, contexto.instante, contexto.fechaNoDisponible)}</details></div>
<p><a href="${`/reglas?id=${encodeURIComponent(contexto.idResolucion!)}&agente=${encodeURIComponent(contexto.agente ?? "")}${contexto.lanzadoPor === undefined ? "" : `&lanzadoPor=${encodeURIComponent(contexto.lanzadoPor)}`}${contexto.clave ? `&clave=${encodeURIComponent(contexto.clave)}` : ""}${contexto.q ? `&q=${encodeURIComponent(contexto.q)}` : ""}`}">Ver cadena completa y matriz de permisos</a></p>
${consultasPermiso(contexto, contexto.lanzadoPor)}`, { ...contexto, proyecto: respuesta.proyecto, activa: "Permiso" }));
}

export function consultasPermiso(contexto: ContextoPanel, lanzadoPor?: string) {
  const id = contexto.idResolucion!;
  const agente = contexto.agente ?? "";
  const selector = html`<label>Agente <select name="agente" required>${(contexto.agentes ?? [{ nombre: agente }]).map(a => a.nombre === agente
    ? html`<option value="${a.nombre}" selected>${a.nombre}</option>` : html`<option value="${a.nombre}">${a.nombre}</option>`)}</select></label>`;
  const accion = html`<label>Herramienta <input name="herramienta" list="sugerencias-herramienta" placeholder="read" required pattern=".*\\S.*" aria-describedby="ayuda-herramientas"></label>
<label>Acción u objetivo <input name="objetivo" placeholder=".env" required pattern=".*\\S.*"></label>`;
  return html`<section id="acciones-resolucion"><h2>Consultar permiso</h2>
<form id="consultar-permiso" class="formulario-permiso" action="/permiso" method="get">
<input type="hidden" name="id" value="${id}">${camposContexto(contexto)}
${selector}${accion}<button>Consultar</button></form>
<datalist id="sugerencias-herramienta">${["read", "edit", "bash", "glob", "grep", "task"].map(h => html`<option value="${h}"></option>`)}</datalist>
<p id="ayuda-herramientas" class="ayuda">Sugerencias no exhaustivas; podés escribir otro nombre de herramienta.</p>
<details${contexto.sujeto === undefined ? html`` : html` open`}><summary>Opciones avanzadas</summary>
<h3>Como subagente de…</h3>
<form id="consultar-permiso-subagente" class="formulario-permiso" action="/permiso" method="get">
<input type="hidden" name="id" value="${id}">${camposContexto(contexto)}
${selector}
<label>Lanzado por (subagente) <input name="lanzadoPor" value="${lanzadoPor ?? ""}" aria-describedby="ayuda-lanzado-por" required pattern=".*\\S.*"></label>
${accion}<button class="boton--secundario">Consultar permiso como subagente</button></form>
<p id="ayuda-lanzado-por" class="ayuda">agente que lo lanza, para evaluar el permiso en contexto de subagente</p>
<h3>Por sujeto</h3><form id="consultar-permiso-sujeto" class="formulario-permiso" action="/permiso" method="get">
<input type="hidden" name="id" value="${id}">${camposContexto(contexto)}
${selector}
<label>Sujeto de permiso <input name="sujeto" value="${contexto.sujeto ?? ""}" required pattern=".*\\S.*"></label>
<label>Acción u objetivo <input name="objetivo" value="" required pattern=".*\\S.*"></label>
<button class="boton--secundario">Consultar sujeto de permiso</button></form></details>
<section id="consultas-rapidas"><h3>Consultas rápidas</h3><ul class="consultas-rapidas">
${([["read", ".env"], ["edit", "opencode.json"], ["bash", "git status"], ["bash", "rm -rf build"]] as const).map(([herramienta, objetivo]) => html`<li><a href="${`/permiso?id=${encodeURIComponent(id)}&agente=${encodeURIComponent(agente)}&herramienta=${encodeURIComponent(herramienta)}&objetivo=${encodeURIComponent(objetivo)}${contexto.clave ? `&clave=${encodeURIComponent(contexto.clave)}` : ""}${contexto.q ? `&q=${encodeURIComponent(contexto.q)}` : ""}${lanzadoPor === undefined ? "" : `&lanzadoPor=${encodeURIComponent(lanzadoPor)}`}`}" class="consulta-rapida">${insignia(herramienta)} <code>${objetivo}</code></a></li>`)}
</ul></section></section>
`;
}
