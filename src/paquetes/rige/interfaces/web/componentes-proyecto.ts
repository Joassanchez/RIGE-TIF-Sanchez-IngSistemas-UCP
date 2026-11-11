import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos, RespuestaReglas } from "../../aplicacion/respuestas/contrato-generado";
import type { SobreAlmacen } from "../../aplicacion/respuestas/sobre";
import { html, type HtmlSeguro } from "./plantillas";
import { efectoVisual, insignia } from "./diseno";
import { fechaLocal } from "./textos";
import { consultaPanel, type ContextoPanel } from "./panel";
import { esArchivoLocal, presentarRuta, presentarUbicacion } from "./rutas";

export function modoAgente(modo: string): string {
  switch (modo) {
    case "primary": return "Principal";
    case "subagent": return "Subagente";
    case "all": return "Principal y subagente";
    default: return modo;
  }
}
export const anclaHallazgo = (indice: number): string => `h-${indice}`;
export const nombresHallazgos: Readonly<Record<string, readonly [string, string]>> = {
  "entrada-ilegible": ["Entrada ilegible", "Entradas ilegibles"], "entrada-descartada": ["Entrada descartada", "Entradas descartadas"],
  "sustitucion-sin-valor": ["Sustitución sin valor", "Sustituciones sin valor"], "referencia-no-resuelta": ["Referencia no resuelta", "Referencias no resueltas"],
  "regla-sin-efecto": ["Regla sin efecto", "Reglas sin efecto"], "elemento-sin-uso": ["Elemento sin uso", "Elementos sin uso"],
};

export function agentesProyecto(respuesta: RespuestaAgentes, id: string, contexto: ContextoPanel): HtmlSeguro {
  const agentes = [...respuesta.agentes.filter(a => !a.oculto), ...respuesta.agentes.filter(a => a.oculto)];
  return html`<section id="tabla-agentes"><h2>Agentes <small class="procedencia">Foto guardada</small></h2>
${respuesta.incompleta ? html`<div class="aviso">Listado incompleto. ${respuesta.motivos.map(m => html`<p>${respuesta.reglas[m] ?? m}</p>`)}</div>` : agentes.length && agentes.every(a => a.origen === "nativo") ? html`<p>Este proyecto no declara agentes propios: OpenCode usa sus agentes de fábrica</p>` : html``}
${agentes.length ? html`<div class="tabla-contenedor" role="region" aria-label="Agentes" tabindex="0"><table class="tabla-tarjetas"><thead><tr><th>Nombre</th><th>Modo</th><th>Origen</th></tr></thead><tbody>
${agentes.map(a => html`<tr class="${a.oculto ? "fila-agente atenuado" : "fila-agente"}"><td data-etiqueta="Nombre"><a class="agente-enlace" href="${`/resoluciones/${id}/agentes/${encodeURIComponent(a.nombre)}${consultaPanel({ ...contexto, agente: undefined }).replace(/^&/, "?")}`}">${a.nombre}</a>${a.oculto ? html` <span class="atenuado">oculto</span>` : html``}</td><td class="atenuado" data-etiqueta="Modo">${modoAgente(a.modo)}</td><td data-etiqueta="Origen">${insignia(a.origen)}</td></tr>`)}</tbody></table></div>` : html`<p class="estado-vacio">Sin agentes activos</p>`}
${respuesta.eliminados.length ? html`<div id="agentes-eliminados"><h3>Agentes eliminados</h3>${respuesta.eliminados.map(a => html`<p><code>${a.nombre}</code> ${insignia("eliminado / deshabilitado", "aviso")} ${presentarUbicacion(a.declaracion.referencia, a.declaracion.origen.tipo === "declarado" ? a.declaracion.origen.posicion : null, a.declaracion.via)}</p>`)}</div>` : html``}</section>`;
}

export function mapaVias(respuesta: RespuestaEntradas): HtmlSeguro {
  return respuesta.vias === undefined ? html`<p>Mapa de vías no disponible</p>` : html`
<section id="mapa-vias" class="mapa-vias"><h2>Mapa de vías</h2>
<div class="tabla-contenedor" role="region" aria-label="Mapa de vías" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Vía</th><th>Estado</th><th>Cantidad</th><th>Lugares revisados</th></tr></thead>
${([ ["presente", "Presentes"], ["ausente", "Ausentes"], ["no_observada", "No observadas"] ] as const).map(([estado, titulo]) => {
  const vias = respuesta.vias!.filter(via => via.estado === estado);
  return vias.length ? html`<tbody><tr class="grupo-vias"><th colspan="4" scope="rowgroup">${titulo}</th></tr>${vias.map(via => html`<tr><td data-etiqueta="Vía">${via.via}</td>
<td data-etiqueta="Estado">${insignia(via.estado === "no_observada" ? "no observada" : via.estado,
  via.estado === "no_observada" ? "no-observada" : "neutra")}</td>
<td data-etiqueta="Cantidad">${via.cantidad}</td><td data-etiqueta="Lugares revisados">${via.revisados.length ? html`<details><summary>Lugares revisados</summary>
<ul>${via.revisados.map(revisado => html`<li><code>${revisado}</code></li>`)}</ul></details>` : "—"}</td></tr>`)}</tbody>` : html``;
})}</table></div></section>`;
}

export const archivosObservados = (respuesta: RespuestaEntradas) => respuesta.entradas.filter(e => e.condicion === "observada" && esArchivoLocal(e.referencia, e.via));

export function historial(sobre: SobreAlmacen | undefined): HtmlSeguro {
  if (sobre === undefined) return html`<p class="atenuado">Historial no disponible para este análisis</p>`;
  return html`<details id="historia"><summary>Historial (${sobre.anteriores.length})</summary><ul class="historia">${sobre.anteriores.map((foto, indice) => html`<li><span>Análisis del ${fechaLocal(foto.instante)}</span>
${foto.id === sobre.id ? html`<a href="${`/resoluciones/${foto.id}`}" aria-current="page">Ver</a> ${insignia("esta")}` : html`<a href="${`/resoluciones/${foto.id}`}">Ver</a>`}${indice === 0 ? insignia("más reciente") : html``}
${sobre.anteriores[indice + 1] ? html`<a href="${`/comparar?desde=${sobre.anteriores[indice + 1]!.id}&hasta=${foto.id}`}">Comparar con el anterior</a>` : html``}</li>`)}</ul></details>`;
}

export function filaPermisos(respuesta: RespuestaReglas, id: string, contexto: ContextoPanel): HtmlSeguro {
  const fila = respuesta.matriz.filas.find(f => f.agente === contexto.agente);
  const consulta = consultaPanel(contexto);
  const motivosParciales = fila?.celdas.some(c => c.motivo === "eje-parcialmente-observado") ?? false;
  const motivos = [...new Set([...(fila?.declaraciones ?? []), ...(fila?.advertencias ?? []), ...respuesta.matriz.motivos,
    ...(fila?.celdas.flatMap(c => c.motivo && c.motivo !== "eje-parcialmente-observado" ? [c.motivo] : []) ?? [])])];
  return html`<section id="permisos-agente"><h2>Sujetos de permiso</h2><p>Efecto general; consultá un objetivo concreto para conocer la decisión.</p>
${fila === undefined ? html`<p class="aviso">Fila no disponible.</p>` : html`
<dl class="sujetos-permiso">${fila.celdas.map(c => html`<div><dt>${c.sujeto}</dt><dd><a href="${`/resoluciones/${id}/permisos?${consulta.slice(1)}&sujeto=${encodeURIComponent(c.sujeto)}`}">${efectoVisual(c.efecto, c.prevalece === null ? undefined : `Regla ${c.prevalece}`)}${c.motivo === "eje-parcialmente-observado" ? html` ${insignia("parcial")}` : html``}</a></dd></div>`)}</dl>
${motivosParciales ? html`<p class="leyenda-parcial">${insignia("parcial")} ${respuesta.reglas["eje-parcialmente-observado"] ?? "eje-parcialmente-observado"}</p>` : html``}
${fila.error ? html`<p class="aviso">${fila.error.codigo}: ${fila.error.mensaje}</p>` : html``}
`}
<details><summary>Límites del análisis</summary>
${fila?.ejesParciales.length ? html`<p>Parcial: ${fila.ejesParciales.join(", ")}</p>` : html``}
${motivos.map(c => html`<p>${respuesta.reglas[c] ?? c}</p>`)}
${respuesta.matriz.noObservados.map(a => html`<p>Agente no observado: ${a.nombre} (${a.motivo})</p>`)}</details>
<div class="acciones acciones--pie"><a class="boton boton--secundario" href="${`/reglas?id=${id}${consulta}`}">Ver todas las reglas de ${contexto.agente}</a>
<a class="boton boton--secundario" href="${`/resoluciones/${id}/permisos?${consulta.slice(1)}`}">Consultar permiso</a></div></section>`;
}

export function archivosActuales(respuesta: RespuestaEntradas): HtmlSeguro {
  const archivos = [...archivosObservados(respuesta)].sort((a, b) => a.orden - b.orden);
  return html`<details id="archivos-leidos"><summary>Archivos leídos (${archivos.length})</summary><p>Orden de precedencia: la de abajo prevalece</p><ol>${archivos.map(e => html`<li>${e.via} · ${presentarRuta(e.referencia)} ${insignia(e.legibilidad ?? "sin dato")}</li>`)}</ol>${mapaVias(respuesta)}</details>`;
}

export function hallazgosActuales(respuesta: RespuestaHallazgos, id: string, contexto: ContextoPanel): HtmlSeguro {
  const enlace = `/hallazgos?proyecto=${encodeURIComponent(respuesta.proyecto)}&id=${id}${consultaPanel(contexto)}`;
  const tipos = [...new Set(respuesta.hallazgos.map(h => h.tipo))];
  return html`<section id="hallazgos-actuales"><h2>Hallazgos <small class="procedencia">Estado actual de los archivos</small></h2>
${respuesta.incompleta ? html`<div class="aviso">Hallazgos observados; análisis parcial.${respuesta.motivos.map(m => html`<p>${respuesta.reglas[m] ?? m}</p>`)}</div>` : html``}
${tipos.length ? html`<div class="hallazgos-resumen">${tipos.map(tipo => {
    const indice = respuesta.hallazgos.findIndex(h => h.tipo === tipo);
    const primero = respuesta.hallazgos[indice]!;
    return html`<div class="hallazgo-resumen"><span>${nombresHallazgos[tipo]?.[0] ?? tipo} ${insignia(respuesta.resumen.hallazgos[tipo])}</span><span>${primero.posicion && esArchivoLocal(primero.entrada.referencia, primero.entrada.via) ? presentarUbicacion(primero.entrada.referencia, primero.posicion, primero.entrada.via) : html`<a href="${`/entradas?proyecto=${encodeURIComponent(respuesta.proyecto)}&id=${id}${consultaPanel(contexto)}#entrada-${primero.entrada.orden}`}">${primero.localizacion}</a>`}</span><a href="${`${enlace}#${anclaHallazgo(indice)}`}">Ver</a></div>`;
  })}</div>` : respuesta.incompleta ? html`<p>Sin hallazgos observados; análisis parcial</p>` : insignia("Sin hallazgos", "permitida")}
<div class="acciones acciones--pie"><a class="boton boton--secundario" href="${enlace}">Ver hallazgos</a></div></section>`;
}
