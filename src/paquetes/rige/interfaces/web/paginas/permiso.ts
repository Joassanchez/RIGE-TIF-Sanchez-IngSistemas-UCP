import type { RespuestaPermiso } from "../../../aplicacion/respuestas/permiso";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno, efectoVisual } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta } from "../rutas";

export function paginaPermiso(respuesta: RespuestaPermiso, idResolucion?: string): Response {
  return responderHtml(200, diseno(`Permiso de ${respuesta.agente}`, html`
<div class="cabecera-pagina"><p class="ceja">Consulta de permiso</p><h1>Permiso de ${respuesta.agente}</h1>
<p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p>
${"lanzadoPor" in respuesta && typeof respuesta.lanzadoPor === "string" && respuesta.lanzadoPor
    ? html`<p>Lanzado por: <code>${respuesta.lanzadoPor}</code></p>` : html``}
<p><code class="ficha-codigo">${respuesta.consulta.sujeto}: ${respuesta.consulta.objetivo}</code></p></div>
<section id="resultado-permiso" class="tarjeta decision-principal"><h2>Decisión</h2>${efectoVisual(respuesta.decision)}
${respuesta.decision === null ? html`<p>Motivo: <code>${respuesta.motivoSinDecision}</code></p>` : html``}
${respuesta.herramienta ? html`<p>Herramienta: ${respuesta.herramienta.nombre}, ${respuesta.herramienta.ofrecida ? "ofrecida" : "retirada"}.</p>` : html``}
<h2>Explicación</h2>${respuesta.explicacion?.map(oracion => html`<p>${oracion}</p>`) ?? html``}</section>
${respuesta.explicacion?.length && respuesta.declaraciones.length
    ? html`<details id="notas-analisis"><summary>Notas del análisis (${respuesta.declaraciones.length})</summary>${declaraciones(respuesta.declaraciones, respuesta.reglas)}</details>`
    : declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="cadena-efectiva"><h2>Cadena efectiva</h2><p class="atenuado">Reglas coincidentes y su prevalencia, en el orden de aplicación.</p>
<div class="tabla-contenedor" role="region" aria-label="Cadena efectiva" tabindex="0">
<table><thead><tr><th>Índice</th><th>Sujeto</th><th>Patrón</th><th>Efecto</th><th>Procedencia</th><th>Prevalencia</th></tr></thead>
<tbody>${respuesta.cadena.map(regla => html`<tr class="${regla.indice === respuesta.determinante ? "fila--determinante" : "fila"}"><td>${regla.indice + 1}</td><td><code>${regla.sujeto}</code></td><td><code>${regla.patron}</code></td><td>${efectoVisual(regla.efecto)}</td>
<td><code class="ficha-codigo">${regla.origen.tipo === "declarado"
    ? `${regla.declaracion?.localizacion ?? regla.declaracion?.referencia} (${regla.declaracion?.via})`
    : `${regla.origen.tipo}: ${regla.origen.regla}`}</code></td>
<td>${regla.indice === respuesta.determinante ? html`<strong>Determinante</strong>` : "Desplazada"}</td></tr>`)}</tbody></table></div></section>
${respuesta.nativaAnulada ? html`<div class="aviso aviso--advertencia bloque"><p>Advertencia RF-09: protección nativa anulada (regla ${respuesta.nativaAnulada.regla + 1}, por ${respuesta.nativaAnulada.por + 1}).</p></div>` : html``}
${respuesta.advertencias.length ? html`<section id="advertencias"><h2>Advertencias</h2>${respuesta.advertencias.map(codigo => html`<div class="aviso aviso--advertencia"><p>${respuesta.reglas[codigo]}</p></div>`)}</section>` : html``}
${datosRespuesta(respuesta)}`, { proyecto: respuesta.proyecto, ...(idResolucion === undefined ? {} : { idResolucion }) }));
}
