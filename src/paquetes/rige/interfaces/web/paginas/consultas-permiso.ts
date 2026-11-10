import type { RespuestaAgentes } from "../../../aplicacion/respuestas/agentes";
import { html } from "../plantillas";
import { diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { camposContexto, selectorAgente, type ContextoPanel } from "../panel";
import { presentarRuta } from "../rutas";

export function paginaConsultasPermiso(respuesta: RespuestaAgentes, contexto: ContextoPanel): Response {
  return responderHtml(200, diseno("Permisos", html`<div class="cabecera-pagina"><h1>Permisos</h1>
<p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p><p>Foto guardada · resolución ${contexto.idResolucion}</p></div>
${selectorAgente(contexto, "Permisos", respuesta.proyecto)}
<p><a href="${`/reglas?id=${encodeURIComponent(contexto.idResolucion!)}&agente=${encodeURIComponent(contexto.agente ?? "")}${contexto.lanzadoPor === undefined ? "" : `&lanzadoPor=${encodeURIComponent(contexto.lanzadoPor)}`}${contexto.clave ? `&clave=${encodeURIComponent(contexto.clave)}` : ""}${contexto.q ? `&q=${encodeURIComponent(contexto.q)}` : ""}`}">Ver cadena completa y matriz de permisos</a></p>
${consultasPermiso(contexto, contexto.lanzadoPor)}`, { ...contexto, proyecto: respuesta.proyecto, activa: "Permisos" }));
}

export function consultasPermiso(contexto: ContextoPanel, lanzadoPor?: string) {
  const id = contexto.idResolucion!;
  const agente = contexto.agente ?? "";
  const lanzador = lanzadoPor === undefined ? html`` : html`<input type="hidden" name="lanzadoPor" value="${lanzadoPor}">`;
  return html`<section id="acciones-resolucion"><h2>Consultar permiso</h2><div class="rejilla filtros">
<div class="tarjeta"><h3>Consultar permiso</h3>
<form id="consultar-permiso" action="/permiso" method="get">
<input type="hidden" name="id" value="${id}">${camposContexto(contexto)}${lanzador}
<label>Agente <input name="agente" value="${agente}" required></label>
<div class="grupo-campos"><label>Herramienta <input name="herramienta" placeholder="read" required></label>
<label>Objetivo <input name="objetivo" placeholder=".env" required></label></div>
<button>Consultar permiso</button></form>
<details><summary>Consultar como subagente (opcional)</summary>
<form id="consultar-permiso-subagente" action="/permiso" method="get">
<input type="hidden" name="id" value="${id}">${camposContexto(contexto)}
<label>Agente <input name="agente" value="${agente}" required></label>
<label>Lanzado por (subagente) <input name="lanzadoPor" value="${lanzadoPor ?? ""}" aria-describedby="ayuda-lanzado-por" required pattern=".*\\S.*"></label>
<p id="ayuda-lanzado-por" class="ayuda">agente que lo lanza, para evaluar el permiso en contexto de subagente</p>
<div class="grupo-campos"><label>Herramienta <input name="herramienta" placeholder="read" required></label>
<label>Objetivo <input name="objetivo" placeholder=".env" required></label></div>
<button class="boton--secundario">Consultar permiso como subagente</button></form></details>
<details><summary>Consultar por sujeto</summary><form action="/permiso" method="get">
<input type="hidden" name="id" value="${id}">${camposContexto(contexto)}${lanzador}
<label>Agente <input name="agente" value="${agente}" required></label>
<label>Sujeto <input name="sujeto" required></label>
<label>Objetivo <input name="objetivo" required></label>
<button class="boton--secundario">Consultar sujeto de permiso</button></form></details>
<section id="consultas-rapidas"><h3>Consultas rápidas</h3><ul class="consultas-rapidas">
${([["read", ".env"], ["edit", "opencode.json"], ["bash", "git status"], ["bash", "rm -rf build"]] as const).map(([herramienta, objetivo]) => html`<li><a href="${`/permiso?id=${encodeURIComponent(id)}&agente=${encodeURIComponent(agente)}&herramienta=${encodeURIComponent(herramienta)}&objetivo=${encodeURIComponent(objetivo)}${contexto.clave ? `&clave=${encodeURIComponent(contexto.clave)}` : ""}${contexto.q ? `&q=${encodeURIComponent(contexto.q)}` : ""}${lanzadoPor === undefined ? "" : `&lanzadoPor=${encodeURIComponent(lanzadoPor)}`}`}" class="consulta-rapida">${insignia(herramienta)} <code>${objetivo}</code></a></li>`)}
</ul></section></div>
</div></section>
`;
}
