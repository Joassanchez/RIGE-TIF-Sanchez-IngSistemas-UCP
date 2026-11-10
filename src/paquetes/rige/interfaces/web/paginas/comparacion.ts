import type { RespuestaComparacion } from "../../../aplicacion/respuestas/comparacion";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import { diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarOrigen } from "./resolucion";

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
<section class="cabecera-pagina"><p class="ceja">Fotos guardadas · solo lectura</p><h1>Comparar resoluciones</h1>
<p>${resumen.cambiadas} cambios, ${resumen.agregadas} claves nuevas, ${resumen.quitadas} quitadas</p>
<p>${resumen.sinCambio} claves sin cambio en su representación.</p><p>Proyecto: <code>${respuesta.proyecto}</code></p>
<p>Foto ${respuesta.desde.id} (${respuesta.desde.instante}) antes → Foto ${respuesta.hasta.id} (${respuesta.hasta.instante}) después</p>
<p><a href="${`/resoluciones/${encodeURIComponent(respuesta.hasta.id)}`}">Volver a la foto</a></p></section>
<nav class="acciones" aria-label="Filtrar comparación"><a href="${enlace()}">Todos los agentes</a>${nombres.map(n => html`<a href="${enlace(n)}">${n}</a>`)}</nav>
${agente === undefined ? html`` : html`<p class="aviso">Filtro de presentación: ${agente}. El JSON conserva la comparación completa.</p>`}
${agregados.length ? html`<p class="aviso">Agentes agregados: ${agregados.join(", ")}</p>` : html``}
${quitados.length ? html`<p class="aviso">Agentes quitados: ${quitados.join(", ")}</p>` : html``}
${inciertos.length ? html`<p class="aviso">Presencia de agentes no comparable: ${inciertos.join(", ")}</p>` : html``}
${respuesta.parcial ? html`<p class="aviso">Comparación parcial: hay rutas o agentes no observados.</p>` : html``}
${hayCambios ? html`` : html`<p class="estado-vacio">${respuesta.parcial ? "Sin cambios en las claves comparables; comparación parcial" : "Sin cambios entre las dos fotos"}</p>`}
<p class="ayuda">Las sustituciones se comparan solo por su representación protegida; no se afirma igualdad del contenido incorporado. No se comparan cadenas ni decisiones de permisos.</p>
${visibles.map(c => html`<section><h2>Agente ${c.agente}</h2><p>${c.resumen.sinCambio} claves sin cambio.</p>
${c.cambios.length ? html`<div class="tabla-contenedor" role="region" aria-label="${`Cambios de ${c.agente}`}" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Ruta de clave</th><th>Estado y motivo</th><th>antes → después y procedencias</th></tr></thead>
<tbody>${c.cambios.map(cambio => html`<tr><td data-etiqueta="Ruta de clave"><code>${JSON.stringify(cambio.ruta)}</code></td>
<td data-etiqueta="Estado y motivo">${insignia(cambio.tipo, cambio.tipo === "agregada" ? "permitida" : cambio.tipo === "quitada" ? "denegada" : "pregunta")} ${cambio.motivos.join(", ")}</td>
<td data-etiqueta="antes → después y procedencias"><div>antes: ${presentarLado(cambio.antes)}</div><p aria-hidden="true">→</p><div>después: ${presentarLado(cambio.despues)}</div></td></tr>`)}</tbody></table></div>` : html``}</section>`)}
${(["desde", "hasta"] as const).map(lado => html`<details><summary>Rutas no comparables y motivos (${lado})</summary>
<ul>${respuesta[lado].noComparables.map(n => html`<li><code>${JSON.stringify(n.ruta)}</code>: ${respuesta[lado].reglas[n.regla] ?? n.regla}</li>`)}
${respuesta[lado].motivosAgentes.map(m => html`<li>${respuesta[lado].reglas[m] ?? m}</li>`)}</ul></details>`)}
<details><summary>Consulta por CLI sobre las mismas fotos</summary><pre><code>bun run rige -- comparar --desde ${respuesta.desde.id} --hasta ${respuesta.hasta.id}</code></pre></details>
${datosRespuesta(respuesta)}`, { proyecto: respuesta.proyecto }));
}
