import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos } from "../../../aplicacion/respuestas/contrato-generado";
import type { SobreAlmacen } from "../../../aplicacion/respuestas/sobre";
import { archivosActuales, archivosObservados, agentesProyecto, hallazgosActuales } from "../componentes-proyecto";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import {
  cabeceraPagina,
  datoCambioAnterior,
  datoProyecto,
  datosDeclaraciones,
  diseno,
  enlace,
  huellasEntradas,
  insignia,
  pieDesarrolladores,
  seccionLimites,
} from "../diseno";
import { nombreProyecto, fechaLocal, concordar } from "../textos";
import { agenteInicial, comparacionAnterior, type ContextoPanel } from "../panel";
import { responderHtml } from "../respuesta";
import { comandoCli } from "../comando-cli";
import { explicarLimite } from "../../presentacion/vocabulario";
import type { Resultado } from "../../../aplicacion/respuestas/resultado";
import type { ErrorUso } from "../../../aplicacion/errores";

function fechaCorta(instante: string): string {
  const fecha = new Date(instante);
  if (Number.isNaN(fecha.getTime())) throw new Error("Instante inválido");
  const dos = (numero: number) => String(numero).padStart(2, "0");
  return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}

function historial(sobre: SobreAlmacen | undefined): HtmlSeguro {
  if (sobre === undefined) return html`<section><p class="atenuado">Historial no disponible para este análisis</p></section>`;
  const actualIndice = sobre.anteriores.findIndex(foto => foto.id === sobre.id);
  const porDefectoDesde = sobre.anteriores[actualIndice + 1]?.id ?? sobre.anteriores[1]?.id ?? sobre.id;
  const porDefectoHasta = sobre.id;
  return html`<section id="historia"><h2>Historial (${sobre.anteriores.length})</h2>
${sobre.anteriores.length >= 2 ? html`<form class="formulario-comparar" method="get" action="/comparar">
<label>Desde <select name="desde">${sobre.anteriores.map(foto => foto.id === porDefectoDesde
    ? html`<option value="${foto.id}" selected>n.º ${foto.id} · ${fechaLocal(foto.instante)}</option>`
    : html`<option value="${foto.id}">n.º ${foto.id} · ${fechaLocal(foto.instante)}</option>`)}</select></label>
<label>Hasta <select name="hasta">${sobre.anteriores.map(foto => foto.id === porDefectoHasta
    ? html`<option value="${foto.id}" selected>n.º ${foto.id} · ${fechaLocal(foto.instante)}</option>`
    : html`<option value="${foto.id}">n.º ${foto.id} · ${fechaLocal(foto.instante)}</option>`)}</select></label>
<button type="submit" class="boton--secundario">Comparar</button></form>` : html``}
<ul class="historia">${sobre.anteriores.map((foto, indice) => html`<li><span>Análisis del ${fechaLocal(foto.instante)}</span>
${foto.id === sobre.id ? html`<a href="${`/resoluciones/${foto.id}`}" aria-current="page">Ver</a> ${insignia("esta")}` : html`<a href="${`/resoluciones/${foto.id}`}">Ver</a>`}${indice === 0 ? insignia("más reciente") : html``}
${sobre.anteriores[indice + 1] ? html`<a href="${enlace("/comparar", { desde: sobre.anteriores[indice + 1]!.id, hasta: foto.id })}">Comparar con el anterior</a>` : html``}</li>`)}</ul></section>`;
}

export function paginaResumenProyecto(agentes: RespuestaAgentes, entradas: Resultado<RespuestaEntradas, ErrorUso>, hallazgos: Resultado<RespuestaHallazgos, ErrorUso>,
  id: string, sobre?: SobreAlmacen, contexto: ContextoPanel = {}): Response {
  const archivos = entradas.exito ? archivosObservados(entradas.valor) : undefined;
  const declarados = agentes.agentes.filter(a => a.origen === "declarado").length;
  const ilegibles = archivos === undefined || archivos.some(a => a.legibilidad === undefined || a.legibilidad === null) ? "sin dato" : archivos.filter(a => a.legibilidad === "ilegible").length;
  const totalHallazgos = hallazgos.exito ? Object.values(hallazgos.valor.resumen.hallazgos).reduce((a, b) => a + b, 0) : undefined;
  const claseArchivos = typeof ilegibles === "number" && ilegibles > 0 ? "estadistica rol--denegada" : "estadistica";
  const claseHallazgos = totalHallazgos !== undefined && totalHallazgos > 0 ? "estadistica rol--pregunta" : "estadistica";
  const agenteDest = agenteInicial(agentes.agentes);
  const ultimo = sobre?.anteriores[0];
  const ultimoAnalisis = sobre !== undefined && ultimo !== undefined && ultimo.id !== sobre.id
    ? { id: ultimo.id, instante: ultimo.instante }
    : undefined;
  const anteriorAnalisis = comparacionAnterior(sobre);
  const version = "versionHerramienta" in agentes ? String(agentes.versionHerramienta) : contexto.versionHerramienta;
  const limitesBrutos = [
    ...datosDeclaraciones(agentes.declaraciones, agentes.reglas),
    ...agentes.motivos.map(m => html`${explicarLimite(m, agentes.reglas)}`),
    ...(entradas.exito ? datosDeclaraciones(entradas.valor.declaraciones, entradas.valor.reglas) : []),
    ...(hallazgos.exito ? [
      ...datosDeclaraciones(hallazgos.valor.declaraciones, hallazgos.valor.reglas),
      ...hallazgos.valor.motivos.map(m => html`${explicarLimite(m, hallazgos.valor.reglas)}`),
    ] : []),
  ];
  const vistos = new Set<string>();
  const limites = limitesBrutos.filter(item => {
    if (vistos.has(item.texto)) return false;
    vistos.add(item.texto);
    return true;
  });
  return responderHtml(200, diseno(nombreProyecto(agentes.proyecto), html`
${cabeceraPagina({
    etiqueta: "section",
    titulo: nombreProyecto(agentes.proyecto),
    lateral: html`<a class="boton boton--secundario" href="${enlace("/resolver", { proyecto: agentes.proyecto })}">Analizar de nuevo</a>`,
    pregunta: "¿Qué configuración rige en este proyecto?",
    contexto: [
      datoProyecto(agentes.proyecto),
      { rotulo: "Análisis", valor: sobre === undefined ? `n.º ${id}, fecha no disponible` : `n.º ${id}, ${fechaLocal(sobre.instante)}` },
      ...(version === undefined ? [] : [{ rotulo: "Herramienta", valor: `OpenCode ${version}` }]),
      ...datoCambioAnterior(id, anteriorAnalisis),
    ],
    detalle: html`<p>Resumen de la foto guardada de agentes junto con el estado actual de archivos y hallazgos.</p>`,
  })}
<section id="cifras"><h2>Cifras</h2><div class="bandas-resumen">
<div class="banda" role="region" aria-label="Este análisis"><h3>${sobre === undefined ? "Este análisis" : `Este análisis (${fechaCorta(sobre.instante)})`}</h3><div class="estadisticas">
<div class="estadistica" title="Foto guardada"><strong>${agentes.agentes.length}</strong><span>agentes</span><small>${declarados} ${concordar(declarados, "declarado", "declarados")}${agentes.incompleta ? " · listado incompleto" : ""}</small></div>
<div class="estadistica" title="Análisis guardados"><strong>${sobre?.anteriores.length ?? "sin dato"}</strong><span>análisis</span></div></div></div>
<div class="banda" role="region" aria-label="Ahora en disco"><h3>Ahora en disco</h3><div class="estadisticas">
<div class="${claseArchivos}"><strong>${archivos?.length ?? "sin dato"}</strong><span>archivos leídos</span><small>${ilegibles === "sin dato" ? "ilegibles: sin dato" : `${ilegibles} ${concordar(ilegibles, "ilegible", "ilegibles")}`}</small></div>
<div class="${claseHallazgos}"><strong>${totalHallazgos ?? "sin dato"}</strong><span>hallazgos</span>${hallazgos.exito && hallazgos.valor.incompleta ? html`<small>análisis parcial</small>` : html``}</div></div></div></div></section>
${agentesProyecto(agentes, id, contexto)}
${hallazgos.exito ? hallazgosActuales(hallazgos.valor, id, contexto) : html`<section id="hallazgos-actuales"><h2>Hallazgos <small class="procedencia">Estado actual de los archivos</small></h2><p class="aviso">${hallazgos.error.codigo}: ${hallazgos.error.mensaje}</p></section>`}
<section id="archivos-cambios"><h2>Archivos y cambios <small class="procedencia">Estado actual de los archivos</small></h2>${entradas.exito ? archivosActuales(entradas.valor, contexto) : html`<p class="aviso">${entradas.error.codigo}: ${entradas.error.mensaje}</p>`}<div class="acciones acciones--pie"><a class="boton boton--secundario" href="${enlace("/entradas", { proyecto: agentes.proyecto, id })}">Ver entradas actuales</a></div></section>
${historial(sobre)}
${seccionLimites(limites)}
${pieDesarrolladores(
    agentes.proyecto,
    comandoCli("agentes", { proyecto: agentes.proyecto }),
    datosRespuesta(agentes),
    entradas.exito
      ? huellasEntradas(entradas.valor.entradas, entradas.valor.resumenEntradas, agentes.proyecto)
      : huellasEntradas(agentes.entradas, agentes.resumenEntradas, agentes.proyecto),
  )}`, {
    ...(contexto.hogar === undefined ? {} : { hogar: contexto.hogar }),
    proyecto: agentes.proyecto,
    idResolucion: id,
    activa: "Resumen",
    ...(agenteDest === undefined ? {} : { agenteDestino: agenteDest }),
    ...(ultimoAnalisis === undefined ? {} : { ultimoAnalisis }),
    ...(anteriorAnalisis === undefined ? {} : { anteriorAnalisis }),
  }));
}
