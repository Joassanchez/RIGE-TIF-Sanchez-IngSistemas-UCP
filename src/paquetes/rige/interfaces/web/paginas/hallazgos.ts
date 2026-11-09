import type { RespuestaHallazgos } from "../../../aplicacion/respuestas/hallazgos";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta } from "../rutas";

const nombresHallazgos: Readonly<Record<string, string>> = {
  "entrada-ilegible": "Entradas ilegibles", "entrada-descartada": "Entradas descartadas",
  "sustitucion-sin-valor": "Sustituciones sin valor", "referencia-no-resuelta": "Referencias no resueltas",
  "regla-sin-efecto": "Reglas sin efecto", "elemento-sin-uso": "Elementos sin uso",
};

export function paginaHallazgos(respuesta: RespuestaHallazgos): Response {
  return responderHtml(200, diseno("Hallazgos", html`
<div class="cabecera-pagina"><p class="ceja">Diagnóstico del proyecto</p><h1>Hallazgos</h1><p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p></div>
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="resumen-hallazgos"><h2>Resumen</h2>
${respuesta.resumen.elementos === null ? html`<p class="aviso aviso--advertencia">Conteos de elementos no disponibles: resolución incompleta.</p>` : html`<div class="estadisticas estadisticas--elementos" aria-label="Elementos del proyecto">
<div class="estadistica estadistica--mini"><strong>${respuesta.resumen.elementos.agentes}</strong><span>Agentes</span></div>
<div class="estadistica estadistica--mini"><strong>${respuesta.resumen.elementos.comandos}</strong><span>Comandos</span></div>
<div class="estadistica estadistica--mini"><strong>${respuesta.resumen.elementos.entradas}</strong><span>Entradas</span></div></div>`}
<div class="estadisticas">${Object.entries(respuesta.resumen.hallazgos).map(([tipo, cantidad]) => html`<div class="${cantidad === 0 ? "estadistica estadistica--cero" : "estadistica estadistica--aviso"}"><span class="estadistica__nombre">${nombresHallazgos[tipo]}</span><strong>${cantidad}</strong><small>${tipo}</small></div>`)}</div></section>
${respuesta.incompleta ? html`<div class="aviso aviso--advertencia"><p>Hallazgos parciales.</p>${respuesta.motivos.map(motivo => html`<p>${respuesta.reglas[motivo]}</p>`)}</div>` : html``}
<section id="tabla-hallazgos"><h2>Detalle de hallazgos</h2>
${respuesta.hallazgos.length ? html`<div class="tabla-contenedor" role="region" aria-label="Hallazgos" tabindex="0">
<table><thead><tr><th>Tipo</th><th>Localización</th><th>Explicación</th></tr></thead>
<tbody>${respuesta.hallazgos.map(hallazgo => html`<tr><td>${insignia(hallazgo.tipo, hallazgo.tipo)}</td><td>${presentarRuta(hallazgo.localizacion)}</td><td>${hallazgo.explicacion}</td></tr>`)}</tbody></table></div>`
    : html`<p class="estado-vacio">${respuesta.incompleta ? "Sin hallazgos observados; análisis parcial" : "Sin hallazgos en este proyecto"}</p>`}</section>
${datosRespuesta(respuesta)}`, { proyecto: respuesta.proyecto, activa: "Hallazgos" }));
}
