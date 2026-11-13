import type { RespuestaAgentes, RespuestaReglas } from "../../../aplicacion/respuestas/contrato-generado";
import type { ErrorUso } from "../../../aplicacion/errores";
import { filaPermisos, limitesPermisosAgente, modoAgente } from "../componentes-proyecto";
import { comandoCli } from "../comando-cli";
import type { DeclaracionUbicada, RespuestaValores } from "../../../aplicacion/respuestas/valores";
import type { SobreAlmacen } from "../../../aplicacion/respuestas/sobre";
import { comparacionAnterior, selectorAgente, type ContextoPanel } from "../panel";
import { concordar, nombreAnalisis } from "../textos";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import {
  cabeceraPagina,
  datoCambioAnterior,
  datoProyecto,
  datosAnalisis,
  datosDeclaraciones,
  diseno,
  enlace,
  huellasEntradas,
  insignia,
  pieDesarrolladores,
  seccionLimites,
} from "../diseno";
import { presentarUbicacion, type ContextoRutaVisible } from "../rutas";
import { rotuloVia } from "../../presentacion/rutas";
import { rolOrigen } from "../../presentacion/roles";
import { responderHtml } from "../respuesta";
import { textoDesdeRuta } from "../../../aplicacion/casos-uso/claves";
import {
  explicarLimite,
  motivoNoResolucion,
  origenImplicito,
  origenNativo,
} from "../../presentacion/vocabulario";

export function presentarOrigen(
  declaracion: DeclaracionUbicada,
  ruta?: ContextoRutaVisible,
  reglas?: Readonly<Record<string, string>>,
  tamano: "normal" | "pequena" = "normal",
): HtmlSeguro {
  const { origen } = declaracion;
  const esPequena = tamano === "pequena";
  const chipNativo = (etiqueta: string, explicacion?: string) => explicacion === undefined
    ? html`<span class="procedencia-chip procedencia-chip--nativo${esPequena ? " procedencia-chip--pequena" : ""}">${etiqueta}</span>`
    : html`<span class="procedencia-chip procedencia-chip--nativo${esPequena ? " procedencia-chip--pequena" : ""}" title="${explicacion}">${etiqueta}</span>`;
  if (origen.tipo === "implicito") {
    const explicacion = reglas?.[origen.regla]
      ?? (origen.regla === "valor-implicito-del-agente" ? motivoNoResolucion(origen.regla, reglas) : undefined);
    return chipNativo(origenImplicito(), explicacion);
  }
  if (origen.tipo !== "declarado") {
    return chipNativo(origenNativo(origen.regla), reglas?.[origen.regla]);
  }
  const via = declaracion.via ? rotuloVia(declaracion.via, declaracion.referencia, ruta?.proyecto, true) : "Declaración";
  return html`<span class="procedencia-chip procedencia-chip--declarado${esPequena ? " procedencia-chip--pequena" : ""}">${via} · ${presentarUbicacion(declaracion.referencia, origen.posicion, declaracion.via, ruta)}</span>`;
}

function presentarDesplazadas(
  desplazadas: readonly DeclaracionUbicada[],
  ruta?: ContextoRutaVisible,
  reglas?: Readonly<Record<string, string>>,
): HtmlSeguro {
  const enOrden = [...desplazadas].reverse();
  return html`<ol class="cadena-desplazadas">${enOrden.map(
    d => html`<li class="declaracion-desplazada"><code class="valor-desplazado">${JSON.stringify(d.valor)}</code> ${presentarOrigen(d, ruta, reglas, "pequena")}</li>`,
  )}</ol>`;
}

function notasReglas(notas: readonly string[]): HtmlSeguro {
  return notas.length ? html`<ul class="notas-reglas">${notas.map(texto => html`<li>${texto}</li>`)}</ul>` : html``;
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
  const codigosMostrados = new Set<string>();
  const textosMostrados = new Set<string>();
  const recolectarNotas = (filas: typeof visibles): readonly string[] => {
    const notas: string[] = [];
    const agregar = (codigo: string) => {
      if (codigosMostrados.has(codigo) || !Object.hasOwn(respuesta.reglas, codigo)) return;
      codigosMostrados.add(codigo);
      const texto = respuesta.reglas[codigo];
      if (texto && !textosMostrados.has(texto)) {
        textosMostrados.add(texto);
        notas.push(texto);
      }
    };
    for (const { rastro } of filas) {
      agregar(rastro.determinante.regla);
      if (rastro.determinante.origen.tipo !== "declarado") agregar(rastro.determinante.origen.regla);
      for (const d of rastro.desplazadas) {
        agregar(d.regla);
        if (d.origen.tipo !== "declarado") agregar(d.origen.regla);
      }
    }
    return notas;
  };
  const rutaVisible: ContextoRutaVisible = { proyecto: respuesta.proyecto, hogar: contexto.hogar };
  const tablaValores = (filas: typeof visibles): HtmlSeguro => html`<div class="tabla-contenedor" role="region" aria-label="Valores efectivos" tabindex="0">
<table class="tabla-tarjetas tabla-valores" role="table"><caption class="oculto-visual">Valores efectivos</caption><thead><tr role="row"><th scope="col">Clave</th><th scope="col">Valor</th><th scope="col">Lo determina</th><th scope="col">Desplazadas</th></tr></thead>
<tbody>${filas.map(({ clave, rastro }) => html`<tr class="fila--${rolOrigen(rastro.determinante.origen)}"><td data-etiqueta="Clave">${clave}</td><td data-etiqueta="Valor">${JSON.stringify(rastro.valor)}</td>
<td data-etiqueta="Lo determina">${presentarOrigen(rastro.determinante, rutaVisible, respuesta.reglas)}</td><td data-etiqueta="Desplazadas">${rastro.desplazadas.length
    ? presentarDesplazadas(rastro.desplazadas, rutaVisible, respuesta.reglas) : "—"}</td></tr>`)}</tbody></table></div>${notasReglas(recolectarNotas(filas))}`;
  const tablaFabrica = (filas: typeof visibles): HtmlSeguro => html`<p class="atenuado">Estos valores los fija OpenCode ${respuesta.versionHerramienta} cuando nadie los declara</p>
<div class="tabla-contenedor" role="region" aria-label="Valores de fábrica" tabindex="0">
<table class="tabla-tarjetas tabla-valores" role="table"><caption class="oculto-visual">Valores de fábrica</caption><thead><tr role="row"><th scope="col">Clave</th><th scope="col">Valor</th></tr></thead>
<tbody>${filas.map(({ clave, rastro }) => html`<tr class="fila--${rolOrigen(rastro.determinante.origen)}"><td data-etiqueta="Clave">${clave}</td><td data-etiqueta="Valor">${JSON.stringify(rastro.valor)}</td></tr>`)}</tbody></table></div>${notasReglas(recolectarNotas(filas))}`;
  const ultimo = sobre.anteriores[0];
  const ultimoAnalisis = ultimo !== undefined && ultimo.id !== sobre.id
    ? { id: ultimo.id, instante: ultimo.instante }
    : undefined;
  const anteriorAnalisis = comparacionAnterior(sobre);
  const limitesBrutos = [
    ...datosDeclaraciones(respuesta.declaraciones, respuesta.reglas),
    ...(datos.reglas ? limitesPermisosAgente(datos.reglas, respuesta.agente) : []),
    ...respuesta.noResueltas.map(claveItem => html`Clave no incorporada (<code>${claveItem.ruta.join(".")}</code>): ${explicarLimite(claveItem.regla, respuesta.reglas)}`),
  ];
  const limitesVistos = new Set<string>();
  const limites = limitesBrutos.filter(item => {
    if (limitesVistos.has(item.texto)) return false;
    limitesVistos.add(item.texto);
    return true;
  });
  return responderHtml(200, diseno(nombreAnalisis(respuesta.proyecto, sobre.instante), html`
${cabeceraPagina({
    id: "resumen-resolucion",
    etiqueta: "section",
    titulo: html`<div class="identidad-agente"><h1>${respuesta.agente}</h1>
${datos.agente ? insignia(datos.agente.origen, rolOrigen(datos.agente.origen)) : html``}<span class="atenuado">${datos.agente ? modoAgente(datos.agente.modo) : ""}${datos.agente?.origen === "nativo" ? html` · ${declaradas ?? "sin dato"} ${declaradas === 1 ? "clave declarada" : "claves declaradas"}` : html``}</span></div>`,
    lateral: selectorAgente({ ...contexto, idResolucion: sobre.id, agente: respuesta.agente, ...(clave ? { clave } : {}) }, "Valores", respuesta.proyecto),
    pregunta: "¿Qué configuración rige en este agente?",
    contexto: [
      datoProyecto(respuesta.proyecto),
      ...datosAnalisis(sobre.id, sobre.instante),
      { rotulo: "Agente", valor: html`<code>${respuesta.agente}</code>` },
      { rotulo: "Clave", valor: html`<code>${respuesta.ruta?.join(".") ?? "todas"}</code>` },
      { rotulo: "Herramienta", valor: `${respuesta.herramienta} ${respuesta.versionHerramienta}` },
      ...datoCambioAnterior(sobre.id, anteriorAnalisis),
    ],
    detalle: html`<p>Página armada con la resolución leída del almacén de RIGE. Configuración efectiva: ${respuesta.valores.length} ${concordar(respuesta.valores.length, "valor", "valores")}.</p>
<p>El filtro de búsqueda filtra solo las filas visibles; no cambia la consulta ni su JSON.</p>`,
  })}
<section id="valores"><h2>Valores efectivos</h2>
<form id="filtrar-claves" class="barra-busqueda" action="${`/resoluciones/${sobre.id}`}" method="get">
<input type="hidden" name="agente" value="${respuesta.agente}">
${clave ? html`<input type="hidden" name="clave" value="${clave}">` : html``}
${contexto.lanzadoPor === undefined ? html`` : html`<input type="hidden" name="lanzadoPor" value="${contexto.lanzadoPor}">`}
<label>Buscar clave <input name="q" value="${q}" title="Filtra solo las filas visibles; no cambia la consulta ni su JSON."></label>
<button class="boton--secundario">Filtrar</button></form>
${q ? html`<p class="aviso">Filtrado por "${q}" · ${visibles.length} de ${respuesta.valores.length} ${concordar(respuesta.valores.length, "clave", "claves")} <a href="${enlace(`/resoluciones/${sobre.id}`, parametros)}">Quitar filtro</a></p>` : html``}
${propias.length ? tablaValores(propias) : html``}
${fabrica.length ? html`<details id="valores-fabrica"><summary>Valores de fábrica (${fabrica.length})</summary>${tablaFabrica(fabrica)}</details>` : html``}
${visibles.length ? html`` : html`<p class="estado-vacio">${respuesta.motivo === "clave-inexistente" ? "La clave consultada no existe para el agente." : q ? "Ninguna clave coincide con el filtro" : "RIGE no incorpora claves resueltas para este agente."}</p>`}
${respuesta.motivo ? html`<p class="aviso bloque">Motivo: ${motivoNoResolucion(respuesta.motivo, respuesta.reglas)}</p>` : html``}</section>
${datos.reglas ? filaPermisos(datos.reglas, String(sobre.id), { ...contexto, agente: respuesta.agente }) : datos.errorReglas ? html`<section id="permisos-agente"><h2>Sujetos de permiso</h2><p class="aviso">${datos.errorReglas.mensaje}</p></section>` : html``}
${datos.reglas ? html`` : html`<div class="acciones acciones--pie"><a class="boton boton--secundario" href="${enlace(`/resoluciones/${sobre.id}/permisos`, parametros)}">Consultar permiso</a></div>`}
${seccionLimites(limites)}
${pieDesarrolladores(
    respuesta.proyecto,
    comandoCli("valores", { proyecto: respuesta.proyecto, agente: respuesta.agente, ...(clave ? { clave } : {}) }),
    datosRespuesta(respuesta),
    huellasEntradas(respuesta.entradas, respuesta.resumenEntradas, respuesta.proyecto),
  )}`, {
    ...contexto,
    proyecto: respuesta.proyecto,
    idResolucion: sobre.id,
    agente: respuesta.agente,
    ...(clave ? { clave } : {}),
    activa: "Valores",
    ...(ultimoAnalisis === undefined ? {} : { ultimoAnalisis }),
    ...(anteriorAnalisis === undefined ? {} : { anteriorAnalisis }),
  }));
}
