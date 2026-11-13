import type { RespuestaComparacion } from "../../../aplicacion/respuestas/contrato-generado";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import {
  cabeceraPagina,
  datoProyecto,
  diseno,
  enlace,
  insignia,
  pieDesarrolladores,
  seccionLimites,
} from "../diseno";
import { responderHtml } from "../respuesta";
import type { ContextoPanel } from "../panel";
import type { ContextoRutaVisible } from "../rutas";
import { presentarOrigen } from "./resolucion";
import { concordar, fechaLocal, nombreProyecto } from "../textos";
import { comandoCli } from "../comando-cli";
import { explicarLimite } from "../../presentacion/vocabulario";
import { rolCambio } from "../../presentacion/roles";

function fechaLocalConSegundos(instante: string): string {
  const fecha = new Date(instante);
  if (Number.isNaN(fecha.getTime())) throw new Error("Instante inválido");
  return `${fechaLocal(instante)}:${String(fecha.getSeconds()).padStart(2, "0")}`;
}

function presentarLado(
  lado: RespuestaComparacion["comparaciones"][number]["cambios"][number]["antes"],
  ruta?: ContextoRutaVisible,
  reglas?: Readonly<Record<string, string>>,
): HtmlSeguro {
  return lado === null ? html`<span>ausente</span>` : html`<code>${JSON.stringify(lado.valor)}</code><p>${presentarOrigen(lado.determinante, ruta, reglas)}</p>`;
}

export function paginaComparacion(respuesta: RespuestaComparacion, agente?: string, contexto: Pick<ContextoPanel, "hogar"> = {}): Response {
  const rutaVisible: ContextoRutaVisible = { proyecto: respuesta.proyecto, hogar: contexto.hogar };
  const visibles = respuesta.comparaciones.filter(c => agente === undefined || c.agente === agente);
  const resumen = visibles.reduce((r, c) => ({ cambiadas: r.cambiadas + c.resumen.cambiadas, agregadas: r.agregadas + c.resumen.agregadas,
    quitadas: r.quitadas + c.resumen.quitadas, sinCambio: r.sinCambio + c.resumen.sinCambio }), { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 0 });
  const filtrar = (nombres: readonly string[]) => nombres.filter(n => agente === undefined || n === agente);
  const agregados = filtrar(respuesta.agentes.agregados), quitados = filtrar(respuesta.agentes.quitados), inciertos = filtrar(respuesta.agentes.inciertos);
  const hayCambios = resumen.cambiadas + resumen.agregadas + resumen.quitadas + agregados.length + quitados.length > 0;
  const enlaceAgente = (nombre?: string) => enlace("/comparar", { desde: respuesta.desde.id, hasta: respuesta.hasta.id, agente: nombre });
  const nombres = [...new Set([...respuesta.agentes.comunes, ...respuesta.agentes.agregados, ...respuesta.agentes.quitados, ...respuesta.agentes.inciertos])];
  const limites = (["desde", "hasta"] as const).flatMap(lado => {
    const etiqueta = lado === "desde" ? `Análisis n.º ${respuesta.desde.id}` : `Análisis n.º ${respuesta.hasta.id}`;
    return [
      ...respuesta[lado].noComparables.map(n => html`${etiqueta} · <code>${n.ruta.join(".")}</code>: ${explicarLimite(n.regla, respuesta[lado].reglas)}`),
      ...respuesta[lado].motivosAgentes.map(m => html`${etiqueta}: ${explicarLimite(m, respuesta[lado].reglas)}`),
    ];
  });
  return responderHtml(200, diseno("Comparar resoluciones", html`
${cabeceraPagina({
    id: "resumen-comparacion",
    etiqueta: "section",
    titulo: `Análisis n.º ${respuesta.desde.id} → n.º ${respuesta.hasta.id}`,
    pregunta: "¿Qué cambió entre estos análisis?",
    contexto: [
      datoProyecto(respuesta.proyecto),
      { rotulo: "Análisis", valor: `n.º ${respuesta.desde.id} (${fechaLocalConSegundos(respuesta.desde.instante)}) → n.º ${respuesta.hasta.id} (${fechaLocalConSegundos(respuesta.hasta.instante)})` },
      ...(agente === undefined ? [] : [{ rotulo: "Agente", valor: html`<code>${agente}</code>` }]),
    ],
    detalle: html`<p>Las sustituciones se comparan solo por su representación protegida; no se afirma igualdad del contenido incorporado. No se comparan cadenas ni decisiones de permisos.</p>`,
    extra: html`
<div class="resumen-cambios" aria-label="Resumen de cambios">${insignia(`${resumen.cambiadas} ${concordar(resumen.cambiadas, "cambio", "cambios")}`, resumen.cambiadas ? rolCambio("cambiada") : "pista")}
${insignia(`${resumen.agregadas} ${concordar(resumen.agregadas, "clave nueva", "claves nuevas")}`, resumen.agregadas ? rolCambio("agregada") : "pista")}
${insignia(`${resumen.quitadas} ${concordar(resumen.quitadas, "quitada", "quitadas")}`, resumen.quitadas ? rolCambio("quitada") : "pista")}</div>
<p>${resumen.sinCambio} ${concordar(resumen.sinCambio, "clave sin cambio", "claves sin cambio")} en su representación.</p>
<div class="fotos-comparadas"><div><h2>Antes</h2><p>${nombreProyecto(respuesta.proyecto)} · Análisis n.º ${respuesta.desde.id} del ${fechaLocalConSegundos(respuesta.desde.instante)}</p></div>
<div><h2>Después</h2><p>${nombreProyecto(respuesta.proyecto)} · Análisis n.º ${respuesta.hasta.id} del ${fechaLocalConSegundos(respuesta.hasta.instante)}</p></div></div>
<p><a href="${`/resoluciones/${encodeURIComponent(respuesta.hasta.id)}`}">Volver a la foto</a></p>`,
  })}
<nav class="pestanas" aria-label="Filtrar comparación">${agente === undefined ? html`<a href="${enlaceAgente()}" aria-current="page">Todos los agentes</a>` : html`<a href="${enlaceAgente()}">Todos los agentes</a>`}${nombres.map(n => agente === n ? html`<a href="${enlaceAgente(n)}" aria-current="page">${n}</a>` : html`<a href="${enlaceAgente(n)}">${n}</a>`)}</nav>
${agente === undefined ? html`` : html`<p class="aviso">Filtro de presentación: ${agente}. El JSON conserva la comparación completa.</p>`}
${agregados.length ? html`<p class="aviso">Agentes agregados: ${agregados.join(", ")}</p>` : html``}
${quitados.length ? html`<p class="aviso">Agentes quitados: ${quitados.join(", ")}</p>` : html``}
${inciertos.length ? html`<p class="aviso">Presencia de agentes no comparable: ${inciertos.join(", ")}</p>` : html``}
${respuesta.parcial ? html`<p class="aviso">Comparación parcial: hay rutas o agentes no observados.</p>` : html``}
${hayCambios ? html`` : html`<p class="estado-vacio">${respuesta.parcial ? "Sin cambios en las claves comparables; comparación parcial" : "Sin cambios entre las dos fotos"}</p>`}
${visibles.some(c => !c.cambios.length) ? html`<p class="atenuado">Sin cambios: ${visibles.filter(c => !c.cambios.length).map(c => `${c.agente} (${c.resumen.sinCambio})`).join(", ")}</p>` : html``}
${visibles.filter(c => c.cambios.length).map(c => html`<section><h2>Agente ${c.agente}</h2><p>${c.resumen.sinCambio} ${concordar(c.resumen.sinCambio, "clave sin cambio", "claves sin cambio")}.</p>
<div class="tabla-contenedor" role="region" aria-label="${`Cambios de ${c.agente}`}" tabindex="0">
<table class="tabla-tarjetas tabla-comparacion" role="table"><caption class="oculto-visual">Cambios de ${c.agente}</caption><thead><tr role="row"><th scope="col">Clave</th><th scope="col">Antes</th><th scope="col">Después</th></tr></thead>
<tbody>${c.cambios.map(cambio => html`<tr role="row"><td role="cell" data-etiqueta="Clave"><code title="${JSON.stringify(cambio.ruta)}">${cambio.ruta.join(" › ")}</code><p>${insignia(cambio.tipo, rolCambio(cambio.tipo))} ${cambio.motivos.join(", ")}</p></td>
<td role="cell" data-etiqueta="Antes">${presentarLado(cambio.antes, rutaVisible, respuesta.desde.reglas)}</td><td role="cell" data-etiqueta="Después">${presentarLado(cambio.despues, rutaVisible, respuesta.hasta.reglas)}</td></tr>`)}</tbody></table></div></section>`)}
${seccionLimites(limites)}
${pieDesarrolladores(
    respuesta.proyecto,
    comandoCli("comparar", { desde: String(respuesta.desde.id), hasta: String(respuesta.hasta.id), ...(agente === undefined ? {} : { agente }) }),
    datosRespuesta(respuesta),
  )}`, { ...(contexto.hogar === undefined ? {} : { hogar: contexto.hogar }), proyecto: respuesta.proyecto, idResolucion: respuesta.hasta.id, activa: "Comparar" }));
}
