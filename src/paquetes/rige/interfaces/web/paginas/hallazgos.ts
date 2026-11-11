import { comandoCli } from "../comando-cli";
import { consultaPanel, selectorAgente, type ContextoPanel } from "../panel";
import { concordar } from "../textos";
import type { RespuestaHallazgos } from "../../../aplicacion/respuestas/hallazgos";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { anclaHallazgo, nombresHallazgos } from "../componentes-proyecto";
import { presentarRuta, presentarUbicacion, esArchivoLocal } from "../rutas";

export function paginaHallazgos(respuesta: RespuestaHallazgos, contexto: ContextoPanel = {}): Response {
  return responderHtml(200, diseno("Hallazgos", html`
<div class="cabecera-pagina"><h1>Hallazgos</h1>
<p>¿Qué problemas se observan ahora?</p>
<details><summary>¿Qué significa?</summary><p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p>
<p>Estado actual de las entradas de configuración (no es la foto guardada)</p></details></div>
${selectorAgente(contexto, "Hallazgos", respuesta.proyecto)}
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="resumen-hallazgos"><h2>Resumen</h2>
${respuesta.resumen.elementos === null ? html`<p class="aviso aviso--advertencia">Conteos de elementos no disponibles: resolución incompleta.</p>` : html`<div class="estadisticas estadisticas--elementos" aria-label="Elementos del proyecto">
<div class="estadistica estadistica--mini"><strong>${respuesta.resumen.elementos.agentes}</strong><span>${concordar(respuesta.resumen.elementos.agentes, "Agente", "Agentes")}</span></div>
<div class="estadistica estadistica--mini"><strong>${respuesta.resumen.elementos.comandos}</strong><span>${concordar(respuesta.resumen.elementos.comandos, "Comando", "Comandos")}</span></div>
<div class="estadistica estadistica--mini"><strong>${respuesta.resumen.elementos.entradas}</strong><span>${concordar(respuesta.resumen.elementos.entradas, "Entrada", "Entradas")}</span></div></div>`}
<div class="estadisticas">${Object.entries(respuesta.resumen.hallazgos).map(([tipo, cantidad]) => html`<div class="${cantidad === 0 ? "estadistica estadistica--cero" : "estadistica estadistica--aviso"}"><span class="estadistica__nombre">${concordar(cantidad, ...nombresHallazgos[tipo]!)}</span><strong>${cantidad}</strong><small>${tipo}</small></div>`)}</div></section>
${respuesta.incompleta ? html`<div class="aviso aviso--advertencia"><p>Hallazgos parciales.</p>${respuesta.motivos.map(motivo => html`<p>${respuesta.reglas[motivo]}</p>`)}</div>` : html``}
<section id="tabla-hallazgos"><h2>Detalle de hallazgos</h2>
${respuesta.hallazgos.length ? html`<div class="tabla-contenedor" role="region" aria-label="Hallazgos" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Tipo</th><th>Localización</th><th>Explicación</th></tr></thead>
<tbody>${respuesta.hallazgos.map((hallazgo, indice) => html`<tr id="${anclaHallazgo(indice)}"><td data-etiqueta="Tipo">${insignia(hallazgo.tipo, hallazgo.tipo)}</td><td data-etiqueta="Localización">${hallazgo.posicion && esArchivoLocal(hallazgo.entrada.referencia, hallazgo.entrada.via) ? presentarUbicacion(hallazgo.entrada.referencia, hallazgo.posicion, hallazgo.entrada.via) : html`<a href="${`/entradas?proyecto=${encodeURIComponent(respuesta.proyecto)}${contexto.idResolucion === undefined ? "" : `&id=${encodeURIComponent(contexto.idResolucion)}${consultaPanel(contexto)}`}#entrada-${encodeURIComponent(hallazgo.entrada.orden)}`}">${presentarRuta(hallazgo.localizacion)}</a>`}</td><td data-etiqueta="Explicación">${hallazgo.explicacion}</td></tr>`)}</tbody></table></div>`
    : html`<p class="estado-vacio">${respuesta.incompleta ? "Sin hallazgos observados; análisis parcial" : "Sin hallazgos en este proyecto"}</p>`}</section>
${comandoCli("hallazgos", { proyecto: respuesta.proyecto, explicar: true })}
${datosRespuesta(respuesta)}`, { ...contexto, proyecto: respuesta.proyecto, activa: "Hallazgos" }));
}
