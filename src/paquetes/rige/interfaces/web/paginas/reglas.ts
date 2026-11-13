import { rotuloFoto } from "../textos";
import type { RespuestaReglas } from "../../../aplicacion/respuestas/contrato-generado";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import { cabeceraPagina, diseno, efectoVisual, enlace, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta, presentarUbicacion } from "../rutas";
import { comandoCli } from "../comando-cli";
import { selectorAgente, type ContextoPanel } from "../panel";
import { consultasPermiso } from "./consultas-permiso";
import { motivoNoResolucion, nombreVia, origenImplicito, origenNativo } from "../../presentacion/vocabulario";
import { rolOrigen } from "../../presentacion/roles";

type FilaMatriz = RespuestaReglas["matriz"]["filas"][number];
type ReglaCadena = RespuestaReglas["cadena"][number];

function filaMatriz(
  fila: FilaMatriz,
  id: string,
  agenteActual: string,
  limitada: boolean,
  parametros: (nombre: string) => Record<string, string | undefined>,
): HtmlSeguro {
  const apertura = fila.agente === agenteActual ? html`<tr role="row" class="fila--seleccionada" aria-current="true">` : html`<tr role="row">`;
  const celdas = fila.celdas.map(c => html`<td role="cell" data-etiqueta="${c.sujeto}"><a class="matriz__efectos" href="${enlace(`/resoluciones/${encodeURIComponent(id)}/permisos`, { ...parametros(fila.agente), sujeto: c.sujeto })}">${efectoVisual(c.efecto, c.prevalece === null ? undefined : `Regla ${c.prevalece}`)}${c.prevalece === null ? html`` : html` <span class="atenuado regla-prevalece">Regla ${c.prevalece}</span>`}${c.motivo === "eje-parcialmente-observado" ? insignia("parcial", "parcial") : html``}</a>
</td>`);
  return html`${apertura}<th scope="row"><a href="${enlace("/reglas", parametros(fila.agente), "cadena-completa")}">${fila.agente}</a><span class="matriz__estados">${fila.oculto ? insignia("oculto") : html``}
${limitada ? html`<a href="#limites-matriz">${insignia(fila.error ? "incompleta" : "parcial", "parcial")}</a>` : html``}</span></th>
${celdas}</tr>`;
}

function procedenciaCadena(regla: ReglaCadena, respuesta: RespuestaReglas, contexto: ContextoPanel): HtmlSeguro {
  if (regla.origen.tipo === "nativo") {
    const texto = respuesta.reglas[regla.origen.regla] ?? "Explicación no disponible.";
    return html`<details class="regla-detalle"><summary title="${`nativo · ${regla.origen.regla}: ${texto}`}">${origenNativo(regla.origen.regla)}</summary><p>${texto}</p></details>`;
  }
  if (regla.origen.tipo === "implicito") {
    const texto = motivoNoResolucion(regla.origen.regla, respuesta.reglas);
    return html`<details class="regla-detalle"><summary title="${texto}">${origenImplicito()}</summary><p>${texto}</p></details>`;
  }
  const ubicacion = regla.origen.tipo === "declarado" && regla.declaracion
    ? html`${regla.declaracion.via ? nombreVia(regla.declaracion.via, true) : "Declaración"} · ${presentarUbicacion(regla.declaracion.referencia, regla.origen.posicion, regla.declaracion.via, { proyecto: respuesta.proyecto, hogar: contexto.hogar })}`
    : html`<code>Declaración sin ubicación</code>`;
  return html`${insignia(regla.origen.tipo, rolOrigen(regla.origen))} ${ubicacion}`;
}

function filaCadena(regla: ReglaCadena, respuesta: RespuestaReglas, contexto: ContextoPanel): HtmlSeguro {
  return html`<tr role="row" class="fila--${rolOrigen(regla.origen)}">
<td role="cell" data-etiqueta="Índice">${regla.indice}</td>
<td role="cell" data-etiqueta="Sujeto"><code>${regla.sujeto}</code></td>
<td role="cell" data-etiqueta="Patrón"><code>${regla.patron}</code></td>
<td role="cell" data-etiqueta="Efecto">${efectoVisual(regla.efecto)}</td>
<td role="cell" data-etiqueta="Procedencia">${procedenciaCadena(regla, respuesta, contexto)}</td>
<td role="cell" data-etiqueta="Prevalece para *">${regla.prevalece.map(s => insignia(s, "rige"))}</td>
</tr>`;
}

export function paginaReglas(respuesta: RespuestaReglas, id: string, contexto: ContextoPanel = {}): Response {
  const { agente, lanzadoPor, matriz } = respuesta;
  const parametros = (nombre: string) => ({
    id,
    agente: nombre,
    lanzadoPor,
    clave: contexto.clave || undefined,
    q: contexto.q || undefined,
  });
  const panel = { ...contexto, idResolucion: id, agente, ...(lanzadoPor === undefined ? {} : { lanzadoPor }),
    agentes: matriz.filas.map(f => ({ nombre: f.agente })) };
  const motivosFila = (fila: FilaMatriz) => [...new Set(fila.celdas.flatMap(c => c.motivo !== null && c.motivo !== "eje-parcialmente-observado" ? [c.motivo] : []))];
  const codigosFila = (fila: FilaMatriz) => [...new Set([...fila.declaraciones, ...fila.advertencias, ...motivosFila(fila)])];
  const comunes = (matriz.filas[0] ? codigosFila(matriz.filas[0]) : []).filter(c => matriz.filas.every(f => codigosFila(f).includes(c)));
  const generales = [...new Set([...respuesta.declaraciones, ...respuesta.advertencias, ...matriz.motivos])]
    .filter(c => !matriz.filas.some(f => codigosFila(f).includes(c)));
  const filasLimitadas = matriz.filas.filter(f => f.error !== null || f.ejesParciales.length || f.declaraciones.length || f.advertencias.length || motivosFila(f).length);
  const ejesComunes = [...new Set(matriz.filas[0]?.ejesParciales ?? [])].filter(eje => matriz.filas.every(f => f.ejesParciales.includes(eje)));
  const ejesPropios = (fila: FilaMatriz) => fila.ejesParciales.filter(eje => !ejesComunes.includes(eje));
  const filasPropias = filasLimitadas.filter(f => f.error !== null || ejesPropios(f).length || codigosFila(f).some(c => !comunes.includes(c)));
  const ejesParciales = matriz.sujetos.filter(s => matriz.filas.some(f => f.celdas.some(c => c.sujeto === s && c.motivo === "eje-parcialmente-observado")));
  const filasOrdenadas = [
    ...matriz.filas.filter(f => f.agente === agente),
    ...matriz.filas.filter(f => f.agente !== agente),
  ];
  return responderHtml(200, diseno(`Reglas de ${agente}`, html`${cabeceraPagina({
    titulo: `Reglas de ${agente}`,
    lateral: selectorAgente(panel, "Todas las reglas", respuesta.proyecto),
    pregunta: "¿Qué reglas rigen en este agente?",
    contexto: html`${presentarRuta(respuesta.proyecto)} · Análisis n.º ${id} · ${rotuloFoto(respuesta.proyecto, contexto.instante, contexto.fechaNoDisponible)}${lanzadoPor === undefined ? html`` : html` · Lanzado por: <code>${lanzadoPor}</code>`}`,
    detalle: html`<p>Cadena completa de reglas de permiso y matriz de todos los agentes en esta foto guardada.</p>`,
  })}

<section id="matriz-permisos"><h2>Permisos por agente</h2>
<p>Efecto general por sujeto de permiso; las reglas por patrón pueden cambiarlo para objetivos concretos. <a href="#acciones-resolucion">Consultar permiso para una acción concreta</a>.</p>
<div class="tabla-contenedor" role="region" aria-label="Matriz de permisos" tabindex="0">
<table class="tabla-matriz" role="table"><caption class="oculto-visual">Permisos por agente</caption><thead><tr role="row"><th scope="col">Agente</th>${matriz.sujetos.map(s => html`<th scope="col">${s}</th>`)}</tr></thead><tbody>
${filasOrdenadas.map(f => filaMatriz(f, id, agente, filasLimitadas.includes(f), parametros))}</tbody></table></div>
${ejesParciales.length ? html`<p class="aviso">${insignia("parcial", "parcial")} <code>${ejesParciales.join(", ")}</code>: ${respuesta.reglas["eje-parcialmente-observado"] ?? "Eje parcialmente observado; sin decisión general."}</p>` : html``}
${matriz.noObservados.map(a => html`<p>Agente no observado: <code>${a.nombre}</code> (${a.motivo ? motivoNoResolucion(a.motivo, respuesta.reglas) : "sin dato"})</p>`)}</section>
${filasLimitadas.length ? html`<section id="limites-matriz"><h2>Límites</h2>
${ejesComunes.length ? html`<p>Todos los agentes: <code>${ejesComunes.join(", ")}</code></p>` : html``}
${filasPropias.length ? html`<ul>${filasPropias.map(f => html`<li><strong>${f.agente}</strong>
${f.error ? html`<p>${f.error.mensaje}</p>` : html``}
${ejesPropios(f).length ? html`<p>Ejes parciales: <code>${ejesPropios(f).join(", ")}</code></p>` : html``}
${codigosFila(f).filter(c => !comunes.includes(c)).map(c => html`<p>${motivoNoResolucion(c, respuesta.reglas)}</p>`)}</li>`)}</ul>` : html``}
</section>` : html``}
${comunes.length ? html`<section id="limites-comunes"><h2>Límites comunes</h2><ul>${comunes.map(c => html`<li>${motivoNoResolucion(c, respuesta.reglas)}</li>`)}</ul></section>` : html``}
${generales.length ? html`<section id="limites-analisis"><h2>Límites del análisis</h2><ul>${generales.map(c => html`<li>${motivoNoResolucion(c, respuesta.reglas)}</li>`)}</ul></section>` : html``}
<section id="cadena-completa"><h2>Cadena de ${agente}</h2><p>Orden de evaluación, con índices desde 1. Prevalece indica el efecto general por sujeto, sin evaluar objetivos.</p>
<div class="tabla-contenedor" role="region" aria-label="Cadena completa" tabindex="0">
<table class="tabla-tarjetas tabla-cadena" role="table"><caption class="oculto-visual">Cadena de ${agente}</caption><thead><tr role="row"><th scope="col">Índice</th><th scope="col">Sujeto</th><th scope="col">Patrón</th><th scope="col">Efecto</th><th scope="col">Procedencia</th><th scope="col">Prevalece para *</th></tr></thead>
<tbody>${respuesta.cadena.map(r => filaCadena(r, respuesta, contexto))}</tbody></table></div></section>
${consultasPermiso(panel, lanzadoPor)}
${comandoCli("reglas", { proyecto: respuesta.proyecto, agente, ...(lanzadoPor === undefined ? {} : { "lanzado-por": lanzadoPor }) })}
${datosRespuesta(respuesta)}`, { ...panel, proyecto: respuesta.proyecto, activa: "Todas las reglas" }));
}
