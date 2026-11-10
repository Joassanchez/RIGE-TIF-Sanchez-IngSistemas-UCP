import { comandoCli } from "../comando-cli";
import type { DeclaracionUbicada, RespuestaValores } from "../../../aplicacion/respuestas/valores";
import type { SobreAlmacen } from "../../../aplicacion/respuestas/sobre";
import { selectorAgente, type ContextoPanel } from "../panel";
import { concordar } from "../textos";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { presentarRuta } from "../rutas";
import { responderHtml } from "../respuesta";

export function presentarOrigen(declaracion: DeclaracionUbicada): HtmlSeguro {
  const { origen } = declaracion;
  if (origen.tipo !== "declarado") return html`${insignia(origen.tipo === "implicito" ? "implícito" : origen.tipo)} <code class="motivo-origen">${origen.regla}</code>`;
  return html`${insignia(declaracion.via)} ${presentarRuta(String(declaracion.localizacion ?? declaracion.referencia))}`;
}

function presentarDesplazada(declaracion: DeclaracionUbicada): HtmlSeguro {
  return html`<span class="valor-desplazado">${JSON.stringify(declaracion.valor)}</span> ${presentarOrigen(declaracion)}`;
}

export function paginaResolucion(respuesta: RespuestaValores, sobre: SobreAlmacen,
  contexto: ContextoPanel = {}): Response {
  const clave = contexto.clave ?? (respuesta.ruta === null ? null : respuesta.ruta.every(segmento => !/[./~]/.test(segmento))
    ? respuesta.ruta.join(".")
    : "/" + respuesta.ruta.map(segmento => segmento.replaceAll("~", "~0").replaceAll("/", "~1")).join("/"));
  const consulta = `?agente=${encodeURIComponent(respuesta.agente)}${clave ? `&clave=${encodeURIComponent(clave)}` : ""}`;
  const q = contexto.q ?? "";
  const indiceActual = sobre.anteriores.findIndex(foto => foto.id === sobre.id);
  const anterior = indiceActual < 0 ? undefined : sobre.anteriores[indiceActual + 1];
  const enlaceComparar = (desde: number) => `/comparar?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(sobre.id)}&agente=${encodeURIComponent(respuesta.agente)}`;
  const visibles = q ? respuesta.valores.filter(valor => valor.clave.toLowerCase().includes(q.toLowerCase())) : respuesta.valores;
  const precedencia = Object.hasOwn(respuesta.reglas, "orden-de-aplicacion") ? respuesta.reglas["orden-de-aplicacion"] : undefined;
  const implicitas = [...new Set(respuesta.valores.flatMap(({ rastro }) => rastro.determinante.origen.tipo === "implicito"
    ? [rastro.determinante.origen.regla] : []))].filter(codigo => Object.hasOwn(respuesta.reglas, codigo));
  const cubiertas = new Set([...(precedencia === undefined ? [] : ["orden-de-aplicacion"]), ...implicitas]);
  const detalleRegla = (codigo: string): HtmlSeguro => cubiertas.has(codigo) ? html``
    : html`<details class="regla-detalle"><summary>Regla aplicada: <code>${codigo}</code></summary><p>${Object.hasOwn(respuesta.reglas, codigo) ? respuesta.reglas[codigo] : codigo}</p></details>`;
  return responderHtml(200, diseno(`Resolución ${sobre.id}`, html`
<section id="resumen-resolucion" class="cabecera-pagina"><p class="ceja">Configuración efectiva · ${respuesta.valores.length} ${concordar(respuesta.valores.length, "valor", "valores")}</p>
<h1>Resolución ${sobre.id}</h1>
<p>Foto guardada el ${sobre.instante}</p>
<p>Página armada con la resolución leída del almacén de RIGE.</p>
<dl class="resumen"><div><dt>Proyecto</dt><dd>${presentarRuta(respuesta.proyecto)}</dd></div>
<div><dt>Agente</dt><dd><code>${respuesta.agente}</code></dd></div>
<div><dt>Herramienta</dt><dd>${respuesta.herramienta} ${respuesta.versionHerramienta}</dd></div>
<div><dt>Clave</dt><dd><code>${respuesta.ruta?.join(".") ?? "todas"}</code></dd></div></dl></section>
${selectorAgente({ ...contexto, idResolucion: sobre.id, agente: respuesta.agente, ...(clave ? { clave } : {}) }, "Valores", respuesta.proyecto)}
<div class="rejilla filtros">
<form id="filtrar-claves" action="${`/resoluciones/${sobre.id}`}" method="get">
<input type="hidden" name="agente" value="${respuesta.agente}">
${clave ? html`<input type="hidden" name="clave" value="${clave}">` : html``}
<label>Buscar clave <input name="q" value="${q}" aria-describedby="ayuda-filtro"></label>
<p id="ayuda-filtro" class="ayuda">Filtra solo las filas visibles; no cambia la consulta ni su JSON.</p>
<button class="boton--secundario">Filtrar</button></form>
<details><summary>Consulta exacta (avanzada)</summary>
<form id="consultar-clave" action="${`/resoluciones/${sobre.id}`}" method="get">
<input type="hidden" name="agente" value="${respuesta.agente}">
${q ? html`<input type="hidden" name="q" value="${q}">` : html``}
<label>Clave <input name="clave" value="${clave ?? ""}" aria-describedby="ayuda-clave"></label>
<p id="ayuda-clave" class="ayuda">Vacía: todas las claves. Segmentos con puntos o puntero JSON, por ejemplo /options/a.b.</p>
<button class="boton--secundario">Consultar clave</button></form></details></div>
${anterior ? html`<p class="acciones"><a href="${enlaceComparar(anterior.id)}">Comparar con la anterior</a></p>` : html``}
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="valores"><h2>Valores efectivos</h2>
${q ? html`<p class="aviso">Filtrado por "${q}" · ${visibles.length} de ${respuesta.valores.length} ${concordar(respuesta.valores.length, "clave", "claves")} <a href="${`/resoluciones/${sobre.id}${consulta}`}">Quitar filtro</a></p>` : html``}
${precedencia === undefined ? html`` : html`<p>Cómo se decide: ${precedencia}</p>`}
${implicitas.map(codigo => html`<p>Valores implícitos: ${respuesta.reglas[codigo]}</p>`)}
<div class="tabla-contenedor" role="region" aria-label="Valores efectivos" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Clave</th><th>Valor efectivo</th><th>Declaración determinante</th><th>Declaraciones desplazadas</th></tr></thead>
<tbody>${visibles.length ? visibles.map(({ clave, rastro }) => html`<tr><td data-etiqueta="Clave">${clave}</td><td data-etiqueta="Valor efectivo">${JSON.stringify(rastro.valor)}${rastro.determinante.origen.tipo === "implicito" ? html` <span class="insignia insignia--neutra insignia--implicita">implícito</span>` : html``}</td>
<td data-etiqueta="Declaración determinante">${presentarOrigen(rastro.determinante)}${detalleRegla(rastro.determinante.regla)}</td><td data-etiqueta="Declaraciones desplazadas">${rastro.desplazadas.length
    ? html`<ol>${rastro.desplazadas.map(declaracion => html`<li>${presentarDesplazada(declaracion)}</li>`)}</ol>`
    : "ninguna"}</td></tr>`)
    : html`<tr><td colspan="4">${respuesta.motivo === "clave-inexistente" ? "La clave consultada no existe para el agente." : q ? "Ninguna clave coincide con el filtro" : "RIGE no incorpora claves resueltas para este agente."}</td></tr>`}</tbody></table></div>
${respuesta.motivo ? html`<p class="aviso bloque">Motivo: ${respuesta.motivo}</p>` : html``}</section>
${respuesta.noResueltas.length ? html`<details id="claves-no-incorporadas"><summary>Claves no incorporadas por RIGE</summary>
<ul>${respuesta.noResueltas.map(clave => html`<li>${clave.ruta.join(".")}: ${respuesta.reglas[clave.regla]}</li>`)}</ul></details>` : html``}
<details id="entradas-leidas"><summary>Entradas leídas</summary>
<dl><dt>Resumen de las entradas leídas</dt><dd>${respuesta.resumenEntradas}</dd></dl>
<div class="tabla-contenedor" role="region" aria-label="Entradas leídas" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Orden</th><th>Vía</th><th>Referencia</th><th>Condición</th><th>Resumen SHA-256</th></tr></thead>
<tbody>${respuesta.entradas.map(entrada => html`<tr id="${`entrada-leida-${entrada.orden}`}"><td data-etiqueta="Orden">${entrada.orden}</td><td data-etiqueta="Vía">${entrada.via}</td><td data-etiqueta="Referencia">${presentarRuta(entrada.referencia)}</td><td data-etiqueta="Condición">${insignia(entrada.condicion, entrada.condicion === "no_observada" ? "neutra" : "permitida")}</td><td data-etiqueta="Resumen SHA-256"><code>${entrada.resumen ?? "—"}</code></td></tr>`)}</tbody></table></div></details>
<section id="historia"><h2>Resoluciones de este proyecto</h2>
<ul class="historia">${sobre.anteriores.map(anterior => html`<li>${anterior.id === sobre.id
    ? html`<a href="${`/resoluciones/${anterior.id}${consulta}`}" aria-current="page">Resolución ${anterior.id}</a>`
    : html`<a href="${`/resoluciones/${anterior.id}${consulta}`}">Resolución ${anterior.id}</a>`} <time>${anterior.instante}</time>${anterior.id === sobre.id ? html`<span class="insignia insignia--neutra">(esta)</span>` : html``}${indiceActual >= 0 && sobre.anteriores.findIndex(foto => foto.id === anterior.id) > indiceActual ? html`<a href="${enlaceComparar(anterior.id)}">comparar con esta</a>` : html``}</li>`)}</ul></section>
${comandoCli("valores", { proyecto: respuesta.proyecto, agente: respuesta.agente, ...(clave ? { clave } : {}) })}
${datosRespuesta(respuesta)}`, { ...contexto, proyecto: respuesta.proyecto, idResolucion: sobre.id, agente: respuesta.agente, ...(clave ? { clave } : {}), activa: "Valores" }));
}
