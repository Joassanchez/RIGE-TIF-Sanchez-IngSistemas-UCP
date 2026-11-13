import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos } from "../../../aplicacion/respuestas/contrato-generado";
import type { SobreAlmacen } from "../../../aplicacion/respuestas/sobre";
import { archivosActuales, archivosObservados, agentesProyecto, hallazgosActuales } from "../componentes-proyecto";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import { declaraciones, diseno, enlace, insignia } from "../diseno";
import { nombreProyecto, fechaLocal, concordar } from "../textos";
import { agenteInicial, type ContextoPanel } from "../panel";
import { responderHtml } from "../respuesta";
import { comandoCli } from "../comando-cli";
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
  const agenteDest = agenteInicial(agentes.agentes);
  const ultimo = sobre?.anteriores[0];
  const ultimoAnalisis = sobre !== undefined && ultimo !== undefined && ultimo.id !== sobre.id
    ? { id: ultimo.id, instante: ultimo.instante }
    : undefined;
  return responderHtml(200, diseno(nombreProyecto(agentes.proyecto), html`
<section class="cabecera-pagina"><h1>${nombreProyecto(agentes.proyecto)}</h1>
<div class="acciones metadatos-acciones"><p class="atenuado metadatos-proyecto"><span class="monoespaciado">${agentes.proyecto}</span> · ${sobre === undefined ? "Fecha no disponible" : `Análisis del ${fechaLocal(sobre.instante)}`} · n.º ${id} · OpenCode${"versionHerramienta" in agentes ? html` ${agentes.versionHerramienta}` : contexto.versionHerramienta === undefined ? html`` : html` ${contexto.versionHerramienta}`}</p>
<a class="boton boton--secundario" href="${enlace("/resolver", { proyecto: agentes.proyecto })}">Analizar de nuevo</a></div></section>
<section id="cifras"><h2>Cifras</h2><div class="bandas-resumen">
<div class="banda" role="region" aria-label="Este análisis"><h3>${sobre === undefined ? "Este análisis" : `Este análisis (${fechaCorta(sobre.instante)})`}</h3><div class="estadisticas">
<div class="estadistica" title="Foto guardada"><strong>${agentes.agentes.length}</strong><span>agentes</span><small>${declarados} ${concordar(declarados, "declarado", "declarados")}${agentes.incompleta ? " · listado incompleto" : ""}</small></div>
<div class="estadistica" title="Análisis guardados"><strong>${sobre?.anteriores.length ?? "sin dato"}</strong><span>análisis</span></div></div></div>
<div class="banda" role="region" aria-label="Ahora en disco"><h3>Ahora en disco</h3><div class="estadisticas">
<div class="estadistica"><strong>${archivos?.length ?? "sin dato"}</strong><span>archivos leídos</span><small>${ilegibles === "sin dato" ? "ilegibles: sin dato" : `${ilegibles} ${concordar(ilegibles, "ilegible", "ilegibles")}`}</small></div>
<div class="estadistica"><strong>${hallazgos.exito ? Object.values(hallazgos.valor.resumen.hallazgos).reduce((a, b) => a + b, 0) : "sin dato"}</strong><span>hallazgos</span>${hallazgos.exito && hallazgos.valor.incompleta ? html`<small>análisis parcial</small>` : html``}</div></div></div></div></section>
${agentesProyecto(agentes, id, contexto)}
${hallazgos.exito ? hallazgosActuales(hallazgos.valor, id, contexto) : html`<section id="hallazgos-actuales"><h2>Hallazgos <small class="procedencia">Estado actual de los archivos</small></h2><p class="aviso">${hallazgos.error.codigo}: ${hallazgos.error.mensaje}</p></section>`}
<section id="archivos-cambios"><h2>Archivos y cambios <small class="procedencia">Estado actual de los archivos</small></h2>${entradas.exito ? archivosActuales(entradas.valor) : html`<p class="aviso">${entradas.error.codigo}: ${entradas.error.mensaje}</p>`}<div class="acciones acciones--pie"><a class="boton boton--secundario" href="${enlace("/entradas", { proyecto: agentes.proyecto, id })}">Ver entradas actuales</a></div></section>
${historial(sobre)}
${declaraciones(agentes.declaraciones, agentes.reglas)}
${comandoCli("agentes", { proyecto: agentes.proyecto })}
${datosRespuesta(agentes)}`, {
    ...(contexto.hogar === undefined ? {} : { hogar: contexto.hogar }),
    proyecto: agentes.proyecto,
    idResolucion: id,
    activa: "Resumen",
    ...(agenteDest === undefined ? {} : { agenteDestino: agenteDest }),
    ...(ultimoAnalisis === undefined ? {} : { ultimoAnalisis }),
  }));
}
