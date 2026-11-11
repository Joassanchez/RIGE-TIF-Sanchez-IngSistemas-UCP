import type { RespuestaAgentes, RespuestaReglas } from "../../../aplicacion/respuestas/contrato-generado";
import type { ErrorUso } from "../../../aplicacion/errores";
import { filaPermisos, modoAgente } from "../componentes-proyecto";
import { comandoCli } from "../comando-cli";
import type { DeclaracionUbicada, RespuestaValores } from "../../../aplicacion/respuestas/valores";
import type { SobreAlmacen } from "../../../aplicacion/respuestas/sobre";
import { selectorAgente, type ContextoPanel } from "../panel";
import { concordar, nombreAnalisis } from "../textos";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { presentarRuta, presentarUbicacion } from "../rutas";
import { responderHtml } from "../respuesta";

export function presentarOrigen(declaracion: DeclaracionUbicada): HtmlSeguro {
  const { origen } = declaracion;
  if (origen.tipo !== "declarado") return html`${insignia(origen.tipo === "implicito" ? "implícito" : origen.tipo)} <code class="motivo-origen">${origen.regla}</code> ${origen.tipo === "nativo" ? "Valor de fábrica" : "Valor implícito"}`;
  const vias: Readonly<Record<string, string>> = { proyecto: "Proyecto", global: "Global", "variable-config": "Archivo indicado por variable", "directorio-opencode": "Directorio de configuración", markdown: "Agente Markdown", administrada: "Configuración administrada", "variable-contenido": "Variable de contenido", "variable-permiso": "Variable de permisos" };
  return html`${vias[declaracion.via ?? ""] ?? declaracion.via ?? "Declaración"} · ${presentarUbicacion(declaracion.referencia, origen.posicion, declaracion.via)}`;
}

function presentarDesplazada(declaracion: DeclaracionUbicada): HtmlSeguro {
  return html`<del class="valor-desplazado">${JSON.stringify(declaracion.valor)}</del> ${presentarOrigen(declaracion)}`;
}

export function paginaResolucion(respuesta: RespuestaValores, sobre: SobreAlmacen,
  contexto: ContextoPanel = {}, datos: { readonly agente?: RespuestaAgentes["agentes"][number]; readonly reglas?: RespuestaReglas; readonly errorReglas?: ErrorUso; readonly cantidadDeclaradas?: number | null } = {}): Response {
  const clave = contexto.clave ?? (respuesta.ruta === null ? null : respuesta.ruta.every(segmento => !/[./~]/.test(segmento))
    ? respuesta.ruta.join(".")
    : "/" + respuesta.ruta.map(segmento => segmento.replaceAll("~", "~0").replaceAll("/", "~1")).join("/"));
  const consulta = `?agente=${encodeURIComponent(respuesta.agente)}${clave ? `&clave=${encodeURIComponent(clave)}` : ""}`;
  const q = contexto.q ?? "";
  const declaradas = datos.cantidadDeclaradas === undefined ? respuesta.valores.filter(v => v.rastro.determinante.origen.tipo === "declarado").length : datos.cantidadDeclaradas;
  const visibles = q ? respuesta.valores.filter(valor => valor.clave.toLowerCase().includes(q.toLowerCase())) : respuesta.valores;
  const precedencia = Object.hasOwn(respuesta.reglas, "orden-de-aplicacion") ? respuesta.reglas["orden-de-aplicacion"] : undefined;
  const implicitas = [...new Set(respuesta.valores.flatMap(({ rastro }) => rastro.determinante.origen.tipo === "implicito"
    ? [rastro.determinante.origen.regla] : []))].filter(codigo => Object.hasOwn(respuesta.reglas, codigo));
  const cubiertas = new Set([...(precedencia === undefined ? [] : ["orden-de-aplicacion"]), ...implicitas]);
  const detalleRegla = (codigo: string): HtmlSeguro => cubiertas.has(codigo) ? html``
    : html`<details class="regla-detalle"><summary>Regla aplicada: <code>${codigo}</code></summary><p>${Object.hasOwn(respuesta.reglas, codigo) ? respuesta.reglas[codigo] : codigo}</p></details>`;
  return responderHtml(200, diseno(nombreAnalisis(respuesta.proyecto, sobre.instante), html`
<section id="resumen-resolucion" class="cabecera-pagina">
<h1>${respuesta.agente}</h1>
<div>${datos.agente ? modoAgente(datos.agente.modo) : ""} ${datos.agente ? insignia(datos.agente.origen) : html``}${datos.agente?.origen === "nativo" ? html` · ${declaradas ?? "sin dato"} ${declaradas === 1 ? "clave declarada" : "claves declaradas"}` : html``}</div>
<p>¿Qué configuración rige en este agente?</p>
<details><summary>¿Qué significa?</summary><p>Foto guardada · ${nombreAnalisis(respuesta.proyecto, sobre.instante)}</p><p>Página armada con la resolución leída del almacén de RIGE. Configuración efectiva: ${respuesta.valores.length} ${concordar(respuesta.valores.length, "valor", "valores")}.</p>
<dl class="resumen"><div><dt>Proyecto</dt><dd>${presentarRuta(respuesta.proyecto)}</dd></div>
<div><dt>Agente</dt><dd><code>${respuesta.agente}</code></dd></div>
<div><dt>Herramienta</dt><dd>${respuesta.herramienta} ${respuesta.versionHerramienta}</dd></div>
<div><dt>Clave</dt><dd><code>${respuesta.ruta?.join(".") ?? "todas"}</code></dd></div></dl></details></section>
${selectorAgente({ ...contexto, idResolucion: sobre.id, agente: respuesta.agente, ...(clave ? { clave } : {}) }, "Valores", respuesta.proyecto)}
<div class="rejilla filtros">
<form id="filtrar-claves" action="${`/resoluciones/${sobre.id}`}" method="get">
<input type="hidden" name="agente" value="${respuesta.agente}">
${clave ? html`<input type="hidden" name="clave" value="${clave}">` : html``}
${contexto.lanzadoPor === undefined ? html`` : html`<input type="hidden" name="lanzadoPor" value="${contexto.lanzadoPor}">`}
<label>Buscar clave <input name="q" value="${q}" aria-describedby="ayuda-filtro"></label>
<p id="ayuda-filtro" class="ayuda">Filtra solo las filas visibles; no cambia la consulta ni su JSON.</p>
<button class="boton--secundario">Filtrar</button></form>
</div>
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="valores"><h2>Valores efectivos</h2>
${q ? html`<p class="aviso">Filtrado por "${q}" · ${visibles.length} de ${respuesta.valores.length} ${concordar(respuesta.valores.length, "clave", "claves")} <a href="${`/resoluciones/${sobre.id}${consulta}${contexto.lanzadoPor === undefined ? "" : `&lanzadoPor=${encodeURIComponent(contexto.lanzadoPor)}`}`}">Quitar filtro</a></p>` : html``}
${precedencia === undefined ? html`` : html`<details><summary>Cómo se decide</summary><p>${precedencia}</p></details>`}
${implicitas.map(codigo => html`<details><summary>Valores implícitos</summary><p>${respuesta.reglas[codigo]}</p></details>`)}
<div class="tabla-contenedor" role="region" aria-label="Valores efectivos" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Clave</th><th>Valor</th><th>Lo determina</th><th>Desplazadas</th></tr></thead>
<tbody>${visibles.length ? visibles.map(({ clave, rastro }) => html`<tr><td data-etiqueta="Clave">${clave}</td><td data-etiqueta="Valor">${JSON.stringify(rastro.valor)}${rastro.determinante.origen.tipo === "implicito" ? html` <span class="insignia insignia--neutra insignia--implicita">implícito</span>` : html``}</td>
<td data-etiqueta="Lo determina">${presentarOrigen(rastro.determinante)}${detalleRegla(rastro.determinante.regla)}</td><td data-etiqueta="Desplazadas">${rastro.desplazadas.length
    ? html`<ol>${rastro.desplazadas.map(declaracion => html`<li>${presentarDesplazada(declaracion)}</li>`)}</ol>`
    : "ninguna"}</td></tr>`)
    : html`<tr><td colspan="4">${respuesta.motivo === "clave-inexistente" ? "La clave consultada no existe para el agente." : q ? "Ninguna clave coincide con el filtro" : "RIGE no incorpora claves resueltas para este agente."}</td></tr>`}</tbody></table></div>
${respuesta.motivo ? html`<p class="aviso bloque">Motivo: ${respuesta.motivo}</p>` : html``}</section>
${datos.reglas ? filaPermisos(datos.reglas, String(sobre.id), { ...contexto, agente: respuesta.agente }) : datos.errorReglas ? html`<section id="permisos-agente"><h2>Sujetos de permiso</h2><p class="aviso">${datos.errorReglas.codigo}: ${datos.errorReglas.mensaje}</p></section>` : html``}
<p><a href="${`/resoluciones/${sobre.id}/permisos${consulta}${contexto.lanzadoPor === undefined ? "" : `&lanzadoPor=${encodeURIComponent(contexto.lanzadoPor)}`}`}">Consultar permiso</a></p>
${respuesta.noResueltas.length ? html`<details id="claves-no-incorporadas"><summary>Claves no incorporadas por RIGE</summary>
<ul>${respuesta.noResueltas.map(clave => html`<li>${clave.ruta.join(".")}: ${respuesta.reglas[clave.regla]}</li>`)}</ul></details>` : html``}
<details id="entradas-leidas"><summary>Entradas leídas</summary>
<dl><dt>Resumen de las entradas leídas</dt><dd>${respuesta.resumenEntradas}</dd></dl>
<div class="tabla-contenedor" role="region" aria-label="Entradas leídas" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Orden</th><th>Vía</th><th>Referencia</th><th>Condición</th><th>Resumen SHA-256</th></tr></thead>
<tbody>${respuesta.entradas.map(entrada => html`<tr id="${`entrada-leida-${entrada.orden}`}"><td data-etiqueta="Orden">${entrada.orden}</td><td data-etiqueta="Vía">${entrada.via}</td><td data-etiqueta="Referencia">${presentarRuta(entrada.referencia)}</td><td data-etiqueta="Condición">${insignia(entrada.condicion, "neutra")}</td><td data-etiqueta="Resumen SHA-256"><code>${entrada.resumen ?? "—"}</code></td></tr>`)}</tbody></table></div></details>
<p><a href="${`/entradas?proyecto=${encodeURIComponent(respuesta.proyecto)}&id=${sobre.id}&agente=${encodeURIComponent(respuesta.agente)}${clave ? `&clave=${encodeURIComponent(clave)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}${contexto.lanzadoPor === undefined ? "" : `&lanzadoPor=${encodeURIComponent(contexto.lanzadoPor)}`}`}">Ver entradas actuales</a></p>
${comandoCli("valores", { proyecto: respuesta.proyecto, agente: respuesta.agente, ...(clave ? { clave } : {}) })}
${datosRespuesta(respuesta)}`, { ...contexto, proyecto: respuesta.proyecto, idResolucion: sobre.id, agente: respuesta.agente, ...(clave ? { clave } : {}), activa: "Valores" }));
}
