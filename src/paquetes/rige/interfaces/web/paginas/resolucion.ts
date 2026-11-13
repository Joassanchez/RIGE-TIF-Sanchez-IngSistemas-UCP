import type { RespuestaAgentes, RespuestaReglas } from "../../../aplicacion/respuestas/contrato-generado";
import type { ErrorUso } from "../../../aplicacion/errores";
import { filaPermisos, modoAgente } from "../componentes-proyecto";
import { comandoCli } from "../comando-cli";
import type { DeclaracionUbicada, RespuestaValores } from "../../../aplicacion/respuestas/valores";
import type { SobreAlmacen } from "../../../aplicacion/respuestas/sobre";
import { selectorAgente, type ContextoPanel } from "../panel";
import { concordar, nombreAnalisis } from "../textos";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import { cabeceraPagina, declaraciones, diseno, enlace, insignia } from "../diseno";
import { presentarRuta, presentarUbicacion, type ContextoRutaVisible } from "../rutas";
import { rolOrigen, type RolPresentacion } from "../../presentacion/roles";
import { responderHtml } from "../respuesta";
import { textoDesdeRuta } from "../../../aplicacion/casos-uso/claves";
import {
  condicionEntrada,
  motivoNoResolucion,
  nombreVia,
  origenImplicito,
} from "../../presentacion/vocabulario";

export function presentarOrigen(declaracion: DeclaracionUbicada, ruta?: ContextoRutaVisible): HtmlSeguro {
  const { origen } = declaracion;
  if (origen.tipo === "implicito") return html`${insignia(origenImplicito(), rolOrigen(origen), motivoNoResolucion(origen.regla))}<details class="regla-detalle"><summary>Explicación</summary><p>${motivoNoResolucion(origen.regla)}</p></details>`;
  if (origen.tipo !== "declarado") return html`${insignia(origen.tipo, rolOrigen(origen), origen.regla)}<details class="regla-detalle"><summary>Explicación</summary><p>${origen.regla}</p></details>`;
  return html`${declaracion.via ? nombreVia(declaracion.via, true) : "Declaración"} · ${presentarUbicacion(declaracion.referencia, origen.posicion, declaracion.via, ruta)}`;
}

function rolCadena(rol: RolPresentacion, etiqueta: string): HtmlSeguro {
  return html`<span class="insignia insignia--${rol} rol--${rol}">${etiqueta}</span>`;
}

function presentarCadenaDesplazadas(
  valorRige: unknown,
  desplazadas: readonly DeclaracionUbicada[],
  ruta?: ContextoRutaVisible,
): HtmlSeguro {
  const enOrden = [...desplazadas].reverse();
  return html`<ol class="cadena-desplazadas"><li class="cadena-desplazadas__rige">${rolCadena("rige", "rige")} <code class="valor-rige">${JSON.stringify(valorRige)}</code></li>${enOrden.map(
    d => html`<li class="declaracion-desplazada"><span class="flecha-desplazada" aria-hidden="true">←</span> ${rolCadena("desplazado", "desplazado")} <span class="valor-desplazado">${JSON.stringify(d.valor)}</span> <span class="atenuado">(${presentarOrigen(d, ruta)})</span></li>`,
  )}</ol>`;
}

export function paginaResolucion(respuesta: RespuestaValores, sobre: SobreAlmacen,
  contexto: ContextoPanel = {}, datos: { readonly agente?: RespuestaAgentes["agentes"][number]; readonly reglas?: RespuestaReglas; readonly errorReglas?: ErrorUso; readonly cantidadDeclaradas?: number | null } = {}): Response {
  const clave = contexto.clave ?? (respuesta.ruta === null ? null : textoDesdeRuta(respuesta.ruta));
  const parametros = { agente: respuesta.agente, clave: clave || undefined, lanzadoPor: contexto.lanzadoPor };
  const q = contexto.q ?? "";
  const declaradas = datos.cantidadDeclaradas === undefined ? respuesta.valores.filter(v => v.rastro.determinante.origen.tipo === "declarado").length : datos.cantidadDeclaradas;
  const visibles = (q ? respuesta.valores.filter(valor => valor.clave.toLowerCase().includes(q.toLowerCase())) : [...respuesta.valores])
    .sort((a, b) => a.clave < b.clave ? -1 : a.clave > b.clave ? 1 : 0);
  const propias = visibles.filter(v => v.rastro.determinante.origen.tipo === "declarado");
  const fabrica = visibles.filter(v => v.rastro.determinante.origen.tipo !== "declarado");
  const precedencia = Object.hasOwn(respuesta.reglas, "orden-de-aplicacion") ? respuesta.reglas["orden-de-aplicacion"] : undefined;
  const implicitas = [...new Set(respuesta.valores.flatMap(({ rastro }) => rastro.determinante.origen.tipo === "implicito"
    ? [rastro.determinante.origen.regla] : []))].filter(codigo => Object.hasOwn(respuesta.reglas, codigo));
  const cubiertas = new Set([...(precedencia === undefined ? [] : ["orden-de-aplicacion"]), ...implicitas]);
  const detalleRegla = (codigo: string): HtmlSeguro => cubiertas.has(codigo) ? html``
    : html`<details class="regla-detalle"><summary>Regla aplicada</summary><p>${Object.hasOwn(respuesta.reglas, codigo) ? respuesta.reglas[codigo] : motivoNoResolucion(codigo, respuesta.reglas)}</p></details>`;
  const reglasFabrica = [...new Set(respuesta.valores.filter(v => v.rastro.determinante.origen.tipo !== "declarado")
    .map(v => v.rastro.determinante.regla))].filter(c => !cubiertas.has(c));
  const rutaVisible: ContextoRutaVisible = { proyecto: respuesta.proyecto, hogar: contexto.hogar };
  const tablaValores = (filas: typeof visibles): HtmlSeguro => html`<div class="tabla-contenedor" role="region" aria-label="Valores efectivos" tabindex="0">
<table class="tabla-tarjetas tabla-valores" role="table"><caption class="oculto-visual">Valores efectivos</caption><thead><tr role="row"><th scope="col">Clave</th><th scope="col">Valor</th><th scope="col">Lo determina</th><th scope="col">Desplazadas</th></tr></thead>
<tbody>${filas.map(({ clave, rastro }) => html`<tr><td data-etiqueta="Clave">${clave}</td><td data-etiqueta="Valor">${JSON.stringify(rastro.valor)}</td>
<td data-etiqueta="Lo determina">${presentarOrigen(rastro.determinante, rutaVisible)}${rastro.determinante.origen.tipo === "declarado" ? detalleRegla(rastro.determinante.regla) : html``}</td><td data-etiqueta="Desplazadas">${rastro.desplazadas.length
    ? presentarCadenaDesplazadas(rastro.valor, rastro.desplazadas, rutaVisible) : "ninguna"}</td></tr>`)}</tbody></table></div>`;
  const ultimo = sobre.anteriores[0];
  const ultimoAnalisis = ultimo !== undefined && ultimo.id !== sobre.id
    ? { id: ultimo.id, instante: ultimo.instante }
    : undefined;
  return responderHtml(200, diseno(nombreAnalisis(respuesta.proyecto, sobre.instante), html`
${cabeceraPagina({
    id: "resumen-resolucion",
    etiqueta: "section",
    titulo: html`<div class="identidad-agente"><h1>${respuesta.agente}</h1>
${datos.agente ? insignia(datos.agente.origen, rolOrigen(datos.agente.origen)) : html``}<span class="atenuado">${datos.agente ? modoAgente(datos.agente.modo) : ""}${datos.agente?.origen === "nativo" ? html` · ${declaradas ?? "sin dato"} ${declaradas === 1 ? "clave declarada" : "claves declaradas"}` : html``}</span></div>`,
    lateral: selectorAgente({ ...contexto, idResolucion: sobre.id, agente: respuesta.agente, ...(clave ? { clave } : {}) }, "Valores", respuesta.proyecto),
    pregunta: "¿Qué configuración rige en este agente?",
    contexto: html`${presentarRuta(respuesta.proyecto)} · ${nombreAnalisis(respuesta.proyecto, sobre.instante)} · Análisis n.º ${sobre.id} · Clave: <code>${respuesta.ruta?.join(".") ?? "todas"}</code> · ${respuesta.herramienta} ${respuesta.versionHerramienta}`,
    detalle: html`<p>Página armada con la resolución leída del almacén de RIGE. Configuración efectiva: ${respuesta.valores.length} ${concordar(respuesta.valores.length, "valor", "valores")}.</p>
<dl class="resumen"><div><dt>Proyecto</dt><dd>${presentarRuta(respuesta.proyecto)}</dd></div>
<div><dt>Agente</dt><dd><code>${respuesta.agente}</code></dd></div>
<div><dt>Herramienta</dt><dd>${respuesta.herramienta} ${respuesta.versionHerramienta}</dd></div>
<div><dt>Clave</dt><dd><code>${respuesta.ruta?.join(".") ?? "todas"}</code></dd></div></dl>
${precedencia === undefined ? html`` : html`<p>${precedencia}</p>`}
${implicitas.map(codigo => html`<p title="${codigo}">${respuesta.reglas[codigo]}</p>`)}
${reglasFabrica.map(codigo => html`<p title="${codigo}">${respuesta.reglas[codigo] ?? "Explicación no disponible."}</p>`)}
<p>El filtro de búsqueda filtra solo las filas visibles; no cambia la consulta ni su JSON.</p>`,
  })}
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="valores"><h2>Valores efectivos</h2>
<form id="filtrar-claves" class="barra-busqueda" action="${`/resoluciones/${sobre.id}`}" method="get">
<input type="hidden" name="agente" value="${respuesta.agente}">
${clave ? html`<input type="hidden" name="clave" value="${clave}">` : html``}
${contexto.lanzadoPor === undefined ? html`` : html`<input type="hidden" name="lanzadoPor" value="${contexto.lanzadoPor}">`}
<label>Buscar clave <input name="q" value="${q}" title="Filtra solo las filas visibles; no cambia la consulta ni su JSON."></label>
<button class="boton--secundario">Filtrar</button></form>
${q ? html`<p class="aviso">Filtrado por "${q}" · ${visibles.length} de ${respuesta.valores.length} ${concordar(respuesta.valores.length, "clave", "claves")} <a href="${enlace(`/resoluciones/${sobre.id}`, parametros)}">Quitar filtro</a></p>` : html``}
${propias.length ? tablaValores(propias) : html``}
${fabrica.length ? html`<details id="valores-fabrica"><summary>Valores de fábrica (${fabrica.length})</summary>${tablaValores(fabrica)}</details>` : html``}
${visibles.length ? html`` : html`<p class="estado-vacio">${respuesta.motivo === "clave-inexistente" ? "La clave consultada no existe para el agente." : q ? "Ninguna clave coincide con el filtro" : "RIGE no incorpora claves resueltas para este agente."}</p>`}
${respuesta.motivo ? html`<p class="aviso bloque">Motivo: ${motivoNoResolucion(respuesta.motivo, respuesta.reglas)}</p>` : html``}</section>
${datos.reglas ? filaPermisos(datos.reglas, String(sobre.id), { ...contexto, agente: respuesta.agente }) : datos.errorReglas ? html`<section id="permisos-agente"><h2>Sujetos de permiso</h2><p class="aviso">${datos.errorReglas.mensaje}</p></section>` : html``}
${datos.reglas ? html`` : html`<div class="acciones acciones--pie"><a class="boton boton--secundario" href="${enlace(`/resoluciones/${sobre.id}/permisos`, parametros)}">Consultar permiso</a></div>`}
${respuesta.noResueltas.length ? html`<details id="claves-no-incorporadas"><summary>Claves no incorporadas por RIGE</summary>
<ul>${respuesta.noResueltas.map(clave => html`<li>${clave.ruta.join(".")}: ${motivoNoResolucion(clave.regla, respuesta.reglas)}</li>`)}</ul></details>` : html``}
${comandoCli("valores", { proyecto: respuesta.proyecto, agente: respuesta.agente, ...(clave ? { clave } : {}) }, html`<details id="entradas-leidas"><summary>Entradas leídas</summary>
<dl><dt>Resumen de las entradas leídas</dt><dd>${respuesta.resumenEntradas}</dd></dl>
<div class="tabla-contenedor" role="region" aria-label="Entradas leídas" tabindex="0">
<table class="tabla-tarjetas" role="table"><caption class="oculto-visual">Entradas leídas</caption><thead><tr role="row"><th scope="col">Orden</th><th scope="col">Vía</th><th scope="col">Referencia</th><th scope="col">Condición</th><th scope="col">Resumen SHA-256</th></tr></thead>
<tbody>${respuesta.entradas.map(entrada => html`<tr id="${`entrada-leida-${entrada.orden}`}"><td data-etiqueta="Orden">${entrada.orden}</td><td data-etiqueta="Vía">${nombreVia(entrada.via)}</td><td data-etiqueta="Referencia">${presentarRuta(entrada.referencia)}</td><td data-etiqueta="Condición">${insignia(condicionEntrada(entrada.condicion), "neutra")}</td><td data-etiqueta="Resumen SHA-256"><code>${entrada.resumen ?? "—"}</code></td></tr>`)}</tbody></table></div></details>
`)}
${datosRespuesta(respuesta)}`, { ...contexto, proyecto: respuesta.proyecto, idResolucion: sobre.id, agente: respuesta.agente, ...(clave ? { clave } : {}), activa: "Valores", ...(ultimoAnalisis === undefined ? {} : { ultimoAnalisis }) }));
}
