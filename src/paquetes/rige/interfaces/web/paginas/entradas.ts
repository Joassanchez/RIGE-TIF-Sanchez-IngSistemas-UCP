import { mapaVias } from "../componentes-proyecto";
import { comandoCli } from "../comando-cli";
import { selectorAgente, type ContextoPanel } from "../panel";
import type { RespuestaEntradas } from "../../../aplicacion/respuestas/entradas";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta, presentarUbicacion } from "../rutas";

export function paginaEntradas(respuesta: RespuestaEntradas, contexto: ContextoPanel = {}): Response {
  return responderHtml(200, diseno("Entradas", html`
<div class="cabecera-pagina"><h1>Entradas</h1>
<p>¿Qué entradas se observan ahora?</p>
<details><summary>¿Qué significa?</summary>
<p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p>
<p>Estado actual de las entradas de configuración (no es la foto guardada)</p></details></div>
${selectorAgente(contexto, "Entradas", respuesta.proyecto)}
${mapaVias(respuesta)}
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="tabla-entradas"><h2>Vías y legibilidad</h2>
<div class="tabla-contenedor" role="region" aria-label="Entradas" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Orden</th><th>Vía</th><th>Referencia</th><th>Condición</th><th>Legibilidad</th><th>Error</th></tr></thead>
<tbody>${respuesta.entradas.map(entrada => html`<tr id="${`entrada-${entrada.orden}`}"><td data-etiqueta="Orden">${entrada.orden}</td><td data-etiqueta="Vía">${entrada.via}</td><td data-etiqueta="Referencia">${presentarRuta(entrada.referencia)}</td><td data-etiqueta="Condición">${insignia(entrada.condicion, "neutra")}</td><td data-etiqueta="Legibilidad">${insignia(entrada.legibilidad ?? "no observada", entrada.legibilidad === "ilegible" ? "entrada-ilegible" : "neutra")}</td><td data-etiqueta="Error">${entrada.error ? html`<div class="aviso aviso--advertencia">${presentarUbicacion(entrada.referencia, entrada.error, entrada.via)} (${entrada.error.consecuencia})</div>` : "—"}</td></tr>`)}</tbody></table></div></section>
<p class="bloque atenuado">Resumen del conjunto: <code>${respuesta.resumenEntradas}</code></p>
${comandoCli("entradas", { proyecto: respuesta.proyecto })}
${datosRespuesta(respuesta)}`, { ...contexto, proyecto: respuesta.proyecto, activa: "Entradas" }));
}
