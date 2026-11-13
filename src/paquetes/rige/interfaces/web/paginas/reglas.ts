import type { RespuestaReglas } from "../../../aplicacion/respuestas/contrato-generado";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import {
  cabeceraPagina,
  datoCambioAnterior,
  datoProyecto,
  datosAnalisis,
  diseno,
  efectoVisual,
  enlace,
  huellasEntradas,
  insignia,
  pieDesarrolladores,
  seccionLimites,
} from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarUbicacion } from "../rutas";
import { comandoCli } from "../comando-cli";
import { selectorAgente, type ContextoPanel } from "../panel";
import { consultasPermiso } from "./consultas-permiso";
import { rotuloVia } from "../../presentacion/rutas";
import {
  explicarLimite,
  explicarSujetoParcial,
  glifoEfecto,
  leyendaParcial,
  motivoNoResolucion,
  origenImplicito,
  origenNativo,
} from "../../presentacion/vocabulario";
import { rolCeldaMatriz, rolOrigen } from "../../presentacion/roles";

type FilaMatriz = RespuestaReglas["matriz"]["filas"][number];
type ReglaCadena = RespuestaReglas["cadena"][number];

function filaMatriz(
  fila: FilaMatriz,
  id: string,
  agenteActual: string,
  parametros: (nombre: string) => Record<string, string | undefined>,
): HtmlSeguro {
  const apertura = fila.agente === agenteActual ? html`<tr role="row" class="fila--seleccionada" aria-current="true">` : html`<tr role="row">`;
  const celdas = fila.celdas.map(c => {
    const rol = rolCeldaMatriz(c.efecto, c.motivo);
    const glifo = rol === "parcial" ? "◐" : glifoEfecto(c.efecto);
    const etiqueta = rol === "parcial" ? "parcial" : c.efecto === "allow" ? "permitida" : c.efecto === "ask" ? "pregunta" : c.efecto === "deny" ? "denegada" : "sin decisión";
    return html`<td role="cell" class="celda-matriz rol--${rol}" data-etiqueta="${c.sujeto}"><a class="matriz__efectos" href="${enlace(`/resoluciones/${encodeURIComponent(id)}/permisos`, { ...parametros(fila.agente), id: undefined, sujeto: c.sujeto })}"><span>${glifo}</span><span class="visualmente-oculto">${etiqueta}</span></a></td>`;
  });
  return html`${apertura}<th scope="row"><a href="${enlace("/reglas", parametros(fila.agente), "cadena-completa")}">${fila.agente}</a><span class="matriz__estados">${fila.oculto ? insignia("oculto") : html``}
${fila.error !== null ? html`<a href="#limites-analisis">${insignia("incompleta", "parcial")}</a>` : html``}</span></th>
${celdas}</tr>`;
}

function procedenciaCadena(regla: ReglaCadena, respuesta: RespuestaReglas, contexto: ContextoPanel): HtmlSeguro {
  if (regla.origen.tipo === "nativo") {
    const texto = respuesta.reglas[regla.origen.regla];
    return texto
      ? html`<span class="procedencia-chip procedencia-chip--nativo" title="${texto}">${origenNativo(regla.origen.regla)}</span>`
      : html`<span class="procedencia-chip procedencia-chip--nativo">${origenNativo(regla.origen.regla)}</span>`;
  }
  if (regla.origen.tipo === "implicito") {
    const texto = motivoNoResolucion(regla.origen.regla, respuesta.reglas);
    return html`<span class="procedencia-chip procedencia-chip--nativo" title="${texto}">${origenImplicito()}</span>`;
  }
  const ubicacion = regla.origen.tipo === "declarado" && regla.declaracion
    ? html`<span class="procedencia-chip procedencia-chip--declarado">${regla.declaracion.via ? rotuloVia(regla.declaracion.via, regla.declaracion.referencia, respuesta.proyecto, true) : "Declaración"}</span> · ${presentarUbicacion(regla.declaracion.referencia, regla.origen.posicion, regla.declaracion.via, { proyecto: respuesta.proyecto, hogar: contexto.hogar })}`
    : html`<span class="procedencia-chip procedencia-chip--declarado">declarado</span> · <code>Declaración sin ubicación</code>`;
  return ubicacion;
}

function notasReglas(respuesta: RespuestaReglas): HtmlSeguro {
  const vistas = new Set<string>();
  const items: HtmlSeguro[] = [];
  for (const r of respuesta.cadena) {
    if (r.origen.tipo !== "nativo" && r.origen.tipo !== "implicito") continue;
    const texto = r.origen.tipo === "implicito"
      ? motivoNoResolucion(r.origen.regla, respuesta.reglas)
      : respuesta.reglas[r.origen.regla];
    if (!texto || vistas.has(texto)) continue;
    vistas.add(texto);
    const etiqueta = r.origen.tipo === "implicito" ? origenImplicito() : origenNativo(r.origen.regla);
    items.push(html`<li><strong>${etiqueta}</strong>: ${texto}</li>`);
  }
  return items.length ? html`<ul class="notas-reglas">${items}</ul>` : html``;
}

function filaCadena(regla: ReglaCadena, respuesta: RespuestaReglas, contexto: ContextoPanel): HtmlSeguro {
  return html`<tr role="row" class="fila--${rolOrigen(regla.origen)}">
<td role="cell" data-etiqueta="Índice">${regla.indice}</td>
<td role="cell" data-etiqueta="Sujeto"><code>${regla.sujeto}</code></td>
<td role="cell" data-etiqueta="Patrón"><code>${regla.patron}</code></td>
<td role="cell" data-etiqueta="Efecto">${efectoVisual(regla.efecto)}</td>
<td role="cell" data-etiqueta="Procedencia">${procedenciaCadena(regla, respuesta, contexto)}</td>
<td role="cell" data-etiqueta="Prevalece para *">${regla.prevalece.length
    ? html`<div class="lista-chips"><span class="lista-chips__rotulo">Sujetos donde prevalece</span><div class="chips">${regla.prevalece.map(s => html`<span class="chip">${s}</span>`)}</div></div>`
    : html`<span class="atenuado">—</span>`}</td>
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
  const limitesItems: HtmlSeguro[] = [];
  const agregados = new Set<string>();
  const agregarLimite = (item: HtmlSeguro) => {
    if (agregados.has(item.texto)) return;
    agregados.add(item.texto);
    limitesItems.push(item);
  };
  for (const eje of ejesComunes) agregarLimite(html`Todos los agentes: ${explicarSujetoParcial(eje)}`);
  for (const c of comunes) agregarLimite(html`${explicarLimite(c, respuesta.reglas)}`);
  for (const c of generales) agregarLimite(html`${explicarLimite(c, respuesta.reglas)}`);
  for (const f of filasPropias) {
    const propios = codigosFila(f).filter(c => !comunes.includes(c));
    limitesItems.push(html`<strong>${f.agente}</strong>
${f.error ? html`<p>${f.error.mensaje}</p>` : html``}
${ejesPropios(f).map(eje => html`<p>${explicarSujetoParcial(eje)}</p>`)}
${propios.map(c => html`<p>${explicarLimite(c, respuesta.reglas)}</p>`)}`);
  }
  for (const a of matriz.noObservados) {
    agregarLimite(html`Agente no observado: <code>${a.nombre}</code> (${a.motivo ? explicarLimite(a.motivo, respuesta.reglas) : "sin dato"})`);
  }
  return responderHtml(200, diseno(`Reglas de ${agente}`, html`${cabeceraPagina({
    titulo: `Reglas de ${agente}`,
    lateral: selectorAgente(panel, "Todas las reglas", respuesta.proyecto),
    pregunta: "¿Qué reglas rigen en este agente?",
    contexto: [
      datoProyecto(respuesta.proyecto),
      ...datosAnalisis(id, contexto.instante, contexto.fechaNoDisponible),
      { rotulo: "Agente", valor: html`<code>${agente}</code>` },
      ...(lanzadoPor === undefined ? [] : [{ rotulo: "Lanzado por", valor: html`<code>${lanzadoPor}</code>` }]),
      ...datoCambioAnterior(id, contexto.anteriorAnalisis),
    ],
    detalle: html`<p>Cadena completa de reglas de permiso y matriz de todos los agentes en esta foto guardada.</p>`,
  })}

<section id="matriz-permisos"><h2>Permisos por agente</h2>
<p>Efecto general por sujeto de permiso; las reglas por patrón pueden cambiarlo para objetivos concretos. <a href="#acciones-resolucion">Consultar permiso para una acción concreta</a>.</p>
<ul class="leyenda-matriz" aria-label="Leyenda de la matriz"><li class="leyenda-chip rol--permitida">✓ permitida</li><li class="leyenda-chip rol--pregunta">? pregunta</li><li class="leyenda-chip rol--denegada">✗ denegada</li><li class="leyenda-chip rol--parcial">${leyendaParcial}</li></ul>
<div class="tabla-contenedor" role="region" aria-label="Matriz de permisos" tabindex="0">
<table class="tabla-matriz" role="table"><caption class="oculto-visual">Permisos por agente</caption><thead><tr role="row"><th scope="col">Agente</th>${matriz.sujetos.map(s => html`<th scope="col">${s}</th>`)}</tr></thead><tbody>
${filasOrdenadas.map(f => filaMatriz(f, id, agente, parametros))}</tbody></table></div>
${ejesParciales.length ? html`<p class="aviso">${insignia("parcial", "parcial")} <code>${ejesParciales.join(", ")}</code>: ${respuesta.reglas["eje-parcialmente-observado"] ?? "Eje parcialmente observado; sin decisión general."}</p>` : html``}</section>
<section id="cadena-completa"><h2>Cadena de ${agente}</h2><p>Orden de evaluación, con índices desde 1. Prevalece indica el efecto general por sujeto, sin evaluar objetivos.</p>
<div class="tabla-contenedor" role="region" aria-label="Cadena completa" tabindex="0">
<table class="tabla-tarjetas tabla-cadena" role="table"><caption class="oculto-visual">Cadena de ${agente}</caption><thead><tr role="row"><th scope="col">Índice</th><th scope="col">Sujeto</th><th scope="col">Patrón</th><th scope="col">Efecto</th><th scope="col">Procedencia</th><th scope="col">Prevalece para *</th></tr></thead>
<tbody>${respuesta.cadena.map(r => filaCadena(r, respuesta, contexto))}</tbody></table></div>${notasReglas(respuesta)}</section>
${consultasPermiso(panel, lanzadoPor)}
${seccionLimites(limitesItems)}
${pieDesarrolladores(
    respuesta.proyecto,
    comandoCli("reglas", { proyecto: respuesta.proyecto, agente, ...(lanzadoPor === undefined ? {} : { "lanzado-por": lanzadoPor }) }),
    datosRespuesta(respuesta),
    huellasEntradas(respuesta.entradas, respuesta.resumenEntradas, respuesta.proyecto),
  )}`, { ...panel, proyecto: respuesta.proyecto, activa: "Todas las reglas" }));
}
