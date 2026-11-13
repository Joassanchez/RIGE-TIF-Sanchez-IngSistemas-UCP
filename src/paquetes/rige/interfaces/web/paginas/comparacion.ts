import type { RespuestaComparacion } from "../../../aplicacion/respuestas/contrato-generado";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import { diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarOrigen } from "./resolucion";
import { concordar, fechaLocal, nombreAnalisis } from "../textos";

function presentarLado(lado: RespuestaComparacion["comparaciones"][number]["cambios"][number]["antes"]): HtmlSeguro {
  return lado === null ? html`<span>ausente</span>` : html`<code>${JSON.stringify(lado.valor)}</code><p>${presentarOrigen(lado.determinante)}</p>`;
}

export function paginaComparacion(respuesta: RespuestaComparacion, agente?: string): Response {
  const visibles = respuesta.comparaciones.filter(c => agente === undefined || c.agente === agente);
  const resumen = visibles.reduce((r, c) => ({ cambiadas: r.cambiadas + c.resumen.cambiadas, agregadas: r.agregadas + c.resumen.agregadas,
    quitadas: r.quitadas + c.resumen.quitadas, sinCambio: r.sinCambio + c.resumen.sinCambio }), { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 0 });
  const filtrar = (nombres: readonly string[]) => nombres.filter(n => agente === undefined || n === agente);
  const agregados = filtrar(respuesta.agentes.agregados), quitados = filtrar(respuesta.agentes.quitados), inciertos = filtrar(respuesta.agentes.inciertos);
  const hayCambios = resumen.cambiadas + resumen.agregadas + resumen.quitadas + agregados.length + quitados.length > 0;
  const enlace = (nombre?: string) => `/comparar?desde=${encodeURIComponent(respuesta.desde.id)}&hasta=${encodeURIComponent(respuesta.hasta.id)}${nombre === undefined ? "" : `&agente=${encodeURIComponent(nombre)}`}`;
  const nombres = [...new Set([...respuesta.agentes.comunes, ...respuesta.agentes.agregados, ...respuesta.agentes.quitados, ...respuesta.agentes.inciertos])];
  return responderHtml(200, diseno("Comparar resoluciones", html`
<section id="resumen-comparacion" class="cabecera-pagina"><h1>Cambios entre ${fechaLocal(respuesta.desde.instante)} y ${fechaLocal(respuesta.hasta.instante)}</h1>
<p>¿Qué cambió entre estos análisis?</p>
<div class="resumen-cambios" aria-label="Resumen de cambios">${insignia(`${resumen.cambiadas} ${concordar(resumen.cambiadas, "cambio", "cambios")}`, "neutra")}
${insignia(`${resumen.agregadas} ${concordar(resumen.agregadas, "clave nueva", "claves nuevas")}`, "neutra")}
${insignia(`${resumen.quitadas} ${concordar(resumen.quitadas, "quitada", "quitadas")}`, "neutra")}</div>
<p>${resumen.sinCambio} ${concordar(resumen.sinCambio, "clave sin cambio", "claves sin cambio")} en su representación.</p><p>Proyecto: <code>${respuesta.proyecto}</code></p>
<div class="fotos-comparadas"><div><h2>Antes</h2><p>${nombreAnalisis(respuesta.proyecto, respuesta.desde.instante)}</p></div>
<div><h2>Después</h2><p>${nombreAnalisis(respuesta.proyecto, respuesta.hasta.instante)}</p></div></div>
<p><a href="${`/resoluciones/${encodeURIComponent(respuesta.hasta.id)}`}">Volver a la foto</a></p></section>
<nav class="pestanas" aria-label="Filtrar comparación">${agente === undefined ? html`<a href="${enlace()}" aria-current="page">Todos los agentes</a>` : html`<a href="${enlace()}">Todos los agentes</a>`}${nombres.map(n => agente === n ? html`<a href="${enlace(n)}" aria-current="page">${n}</a>` : html`<a href="${enlace(n)}">${n}</a>`)}</nav>
${agente === undefined ? html`` : html`<p class="aviso">Filtro de presentación: ${agente}. El JSON conserva la comparación completa.</p>`}
${agregados.length ? html`<p class="aviso">Agentes agregados: ${agregados.join(", ")}</p>` : html``}
${quitados.length ? html`<p class="aviso">Agentes quitados: ${quitados.join(", ")}</p>` : html``}
${inciertos.length ? html`<p class="aviso">Presencia de agentes no comparable: ${inciertos.join(", ")}</p>` : html``}
${respuesta.parcial ? html`<p class="aviso">Comparación parcial: hay rutas o agentes no observados.</p>` : html``}
${hayCambios ? html`` : html`<p class="estado-vacio">${respuesta.parcial ? "Sin cambios en las claves comparables; comparación parcial" : "Sin cambios entre las dos fotos"}</p>`}
<details><summary>¿Qué significa?</summary><p>Las sustituciones se comparan solo por su representación protegida; no se afirma igualdad del contenido incorporado. No se comparan cadenas ni decisiones de permisos.</p></details>
${visibles.some(c => !c.cambios.length) ? html`<p class="atenuado">Sin cambios: ${visibles.filter(c => !c.cambios.length).map(c => `${c.agente} (${c.resumen.sinCambio})`).join(", ")}</p>` : html``}
${visibles.filter(c => c.cambios.length).map(c => html`<section><h2>Agente ${c.agente}</h2><p>${c.resumen.sinCambio} ${concordar(c.resumen.sinCambio, "clave sin cambio", "claves sin cambio")}.</p>
<div class="tabla-contenedor" role="region" aria-label="${`Cambios de ${c.agente}`}" tabindex="0">
<table class="tabla-tarjetas tabla-comparacion"><thead><tr><th>Clave</th><th>Antes</th><th>Después</th></tr></thead>
<tbody>${c.cambios.map(cambio => html`<tr><td data-etiqueta="Clave"><code title="${JSON.stringify(cambio.ruta)}">${cambio.ruta.join(" › ")}</code><p>${insignia(cambio.tipo, "neutra")} ${cambio.motivos.join(", ")}</p></td>
<td data-etiqueta="Antes">${presentarLado(cambio.antes)}</td><td data-etiqueta="Después">${presentarLado(cambio.despues)}</td></tr>`)}</tbody></table></div></section>`)}
${(["desde", "hasta"] as const).map(lado => html`<details><summary>Rutas no comparables y motivos (${lado})</summary>
<ul>${respuesta[lado].noComparables.map(n => html`<li><code>${JSON.stringify(n.ruta)}</code>: ${respuesta[lado].reglas[n.regla] ?? n.regla}</li>`)}
${respuesta[lado].motivosAgentes.map(m => html`<li>${respuesta[lado].reglas[m] ?? m}</li>`)}</ul></details>`)}
<details><summary>Ver en la consola</summary><p>Consulta por CLI sobre las mismas fotos</p><p><code>bun run rige -- comparar --desde &lt;id-anterior&gt; --hasta &lt;id-actual&gt;</code></p></details>
${datosRespuesta(respuesta)}`, { proyecto: respuesta.proyecto, idResolucion: respuesta.hasta.id, activa: "Comparar" }));
}
