import type { RespuestaHallazgos } from "../../../aplicacion/respuestas/hallazgos";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";

export function paginaHallazgos(respuesta: RespuestaHallazgos): Response {
  return responderHtml(200, diseno("Hallazgos", html`
<div class="cabecera-pagina"><p class="ceja">Diagnóstico del proyecto</p><h1>Hallazgos</h1><p>Proyecto: <code>${respuesta.proyecto}</code></p></div>
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="resumen-hallazgos"><h2>Resumen</h2>
${respuesta.resumen.elementos === null ? html`<p class="aviso aviso--advertencia">Conteos de elementos no disponibles: resolución incompleta.</p>` : html`<p class="atenuado">Agentes: ${respuesta.resumen.elementos.agentes}. Comandos: ${respuesta.resumen.elementos.comandos}. Entradas: ${respuesta.resumen.elementos.entradas}.</p>`}
<div class="estadisticas">${Object.entries(respuesta.resumen.hallazgos).map(([tipo, cantidad]) => html`<div class="${cantidad === 0 ? "estadistica estadistica--cero" : "estadistica"}"><strong>${cantidad}</strong><span>${tipo}</span></div>`)}</div></section>
${respuesta.incompleta ? html`<div class="aviso aviso--advertencia"><p>Hallazgos parciales.</p>${respuesta.motivos.map(motivo => html`<p>${respuesta.reglas[motivo]}</p>`)}</div>` : html``}
<section id="tabla-hallazgos"><h2>Detalle de hallazgos</h2>
${respuesta.hallazgos.length ? html`<div class="tabla-contenedor" role="region" aria-label="Hallazgos" tabindex="0">
<table><thead><tr><th>Tipo</th><th>Localización</th><th>Explicación</th></tr></thead>
<tbody>${respuesta.hallazgos.map(hallazgo => html`<tr><td>${insignia(hallazgo.tipo, hallazgo.tipo)}</td><td><code class="ficha-codigo">${hallazgo.localizacion}</code></td><td>${hallazgo.explicacion}</td></tr>`)}</tbody></table></div>`
    : html`<p class="estado-vacio">${respuesta.incompleta ? "Sin hallazgos observados; análisis parcial" : "Sin hallazgos en este proyecto"}</p>`}</section>
${datosRespuesta(respuesta)}`, { proyecto: respuesta.proyecto, activa: "Hallazgos" }));
}
