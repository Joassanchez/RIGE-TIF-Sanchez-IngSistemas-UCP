import { lugaresRevisados, mapaVias } from "../componentes-proyecto";
import { comandoCli } from "../comando-cli";
import type { ContextoPanel } from "../panel";
import type { RespuestaEntradas } from "../../../aplicacion/respuestas/contrato-generado";
import { datosRespuesta, html } from "../plantillas";
import {
  cabeceraPagina,
  datoProyecto,
  datosDeclaraciones,
  diseno,
  huellasEntradas,
  insignia,
  pieDesarrolladores,
  seccionLimites,
} from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta, presentarUbicacion } from "../rutas";
import { rotuloVia } from "../../presentacion/rutas";
import { condicionEntrada, consecuenciaError, legibilidadEntrada } from "../../presentacion/vocabulario";

export function paginaEntradas(respuesta: RespuestaEntradas, contexto: ContextoPanel = {}): Response {
  const entradas = [...respuesta.entradas].sort((a, b) => a.orden - b.orden);
  const limites = datosDeclaraciones(respuesta.declaraciones, respuesta.reglas);
  return responderHtml(200, diseno("Entradas", html`
${cabeceraPagina({
    titulo: "Entradas",
    pregunta: "¿Qué entradas se observan ahora?",
    contexto: [
      datoProyecto(respuesta.proyecto),
      ...(contexto.idResolucion === undefined ? [] : [{ rotulo: "Análisis de origen", valor: `n.º ${contexto.idResolucion}` }]),
      { rotulo: "Estado", valor: "Estado actual de las entradas de configuración (no es la foto guardada)" },
    ],
    detalle: html`<p>Lectura directa de los lugares locales de configuración en el orden en que se aplican.</p>`,
  })}
<p class="atenuado">Estado actual de los archivos · la de abajo prevalece</p>

${mapaVias(respuesta, contexto, false)}
<section id="tabla-entradas"><h2>Vías y legibilidad</h2>
<div class="tabla-contenedor" role="region" aria-label="Entradas" tabindex="0">
<table class="tabla-tarjetas" role="table"><caption class="oculto-visual">Vías y legibilidad</caption><thead><tr role="row"><th scope="col">Orden</th><th scope="col">Vía</th><th scope="col">Referencia</th><th scope="col">Condición</th><th scope="col">Legibilidad</th><th scope="col">Error</th></tr></thead>
<tbody>${entradas.map(entrada => html`<tr role="row" id="${`entrada-${entrada.orden}`}"><td role="cell" data-etiqueta="Orden">${entrada.orden}</td><td role="cell" data-etiqueta="Vía">${rotuloVia(entrada.via, entrada.referencia, respuesta.proyecto)}</td><td role="cell" data-etiqueta="Referencia">${presentarRuta(entrada.referencia)}</td><td role="cell" data-etiqueta="Condición">${insignia(condicionEntrada(entrada.condicion), "neutra")}</td><td role="cell" data-etiqueta="Legibilidad">${insignia(legibilidadEntrada(entrada.legibilidad), entrada.legibilidad === "ilegible" ? "entrada-ilegible" : "neutra")}</td><td role="cell" data-etiqueta="Error">${entrada.error ? html`<div class="aviso aviso--advertencia">${presentarUbicacion(entrada.referencia, entrada.error, entrada.via, { proyecto: respuesta.proyecto, hogar: contexto.hogar })} (${consecuenciaError(entrada.error.consecuencia)})</div>` : "—"}</td></tr>`)}</tbody></table></div></section>
${lugaresRevisados(respuesta, contexto)}
${seccionLimites(limites)}
${pieDesarrolladores(
    respuesta.proyecto,
    comandoCli("entradas", { proyecto: respuesta.proyecto }),
    datosRespuesta(respuesta),
    huellasEntradas(respuesta.entradas, respuesta.resumenEntradas, respuesta.proyecto),
  )}`, { ...contexto, proyecto: respuesta.proyecto, activa: "Entradas" }));
}
