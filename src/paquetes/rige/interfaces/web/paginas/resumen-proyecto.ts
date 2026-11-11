import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos } from "../../../aplicacion/respuestas/contrato-generado";
import type { SobreAlmacen } from "../../../aplicacion/respuestas/sobre";
import { archivosActuales, archivosObservados, agentesProyecto, hallazgosActuales, historial } from "../componentes-proyecto";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno } from "../diseno";
import { nombreProyecto, fechaLocal, concordar } from "../textos";
import { presentarRuta } from "../rutas";
import type { ContextoPanel } from "../panel";
import { responderHtml } from "../respuesta";
import { comandoCli } from "../comando-cli";
import type { Resultado } from "../../../aplicacion/respuestas/resultado";
import type { ErrorUso } from "../../../aplicacion/errores";

export function paginaResumenProyecto(agentes: RespuestaAgentes, entradas: Resultado<RespuestaEntradas, ErrorUso>, hallazgos: Resultado<RespuestaHallazgos, ErrorUso>,
  id: string, sobre?: SobreAlmacen, contexto: ContextoPanel = {}): Response {
  const archivos = entradas.exito ? archivosObservados(entradas.valor) : undefined;
  const declarados = agentes.agentes.filter(a => a.origen === "declarado").length;
  const ilegibles = archivos === undefined || archivos.some(a => a.legibilidad === undefined || a.legibilidad === null) ? "sin dato" : archivos.filter(a => a.legibilidad === "ilegible").length;
  return responderHtml(200, diseno(nombreProyecto(agentes.proyecto), html`
<section class="cabecera-pagina"><h1>${nombreProyecto(agentes.proyecto)}</h1><p>¿Qué configuración rige en este proyecto?</p>
${presentarRuta(agentes.proyecto)}
${sobre === undefined ? html`<p class="atenuado">Fecha no disponible</p>` : html`<p>Análisis del ${fechaLocal(sobre.instante)}</p>`}<p>OpenCode 1.18.25</p></section>
<section id="cifras"><h2>Cifras</h2><div class="estadisticas">
<div class="estadistica"><strong>${agentes.agentes.length}</strong><span>Agentes · foto guardada</span><small>${declarados} ${concordar(declarados, "declarado", "declarados")}${agentes.incompleta ? " · listado incompleto" : ""}</small></div>
<div class="estadistica"><strong>${archivos?.length ?? "sin dato"}</strong><span>Archivos leídos · Estado actual de los archivos</span><small>ilegibles: ${ilegibles}</small></div>
<div class="estadistica"><strong>${hallazgos.exito ? Object.values(hallazgos.valor.resumen.hallazgos).reduce((a, b) => a + b, 0) : "sin dato"}</strong><span>Hallazgos · Estado actual de los archivos</span>${hallazgos.exito && hallazgos.valor.incompleta ? html`<small>análisis parcial</small>` : html``}</div>
<div class="estadistica"><strong>${sobre?.anteriores.length ?? "sin dato"}</strong><span>Análisis guardados</span></div></div></section>
${agentesProyecto(agentes, id, contexto)}
${hallazgos.exito ? hallazgosActuales(hallazgos.valor, id, contexto) : html`<section id="hallazgos-actuales"><h2>Hallazgos</h2><p>Estado actual de los archivos</p><p class="aviso">${hallazgos.error.codigo}: ${hallazgos.error.mensaje}</p></section>`}
<section id="archivos-cambios"><h2>Archivos y cambios</h2>${entradas.exito ? archivosActuales(entradas.valor) : html`<p>Estado actual de los archivos</p><p class="aviso">${entradas.error.codigo}: ${entradas.error.mensaje}</p>`}<p><a href="${`/entradas?proyecto=${encodeURIComponent(agentes.proyecto)}&id=${id}`}">Ver todas las entradas actuales</a></p>${historial(sobre)}</section>
${declaraciones(agentes.declaraciones, agentes.reglas)}
${comandoCli("agentes", { proyecto: agentes.proyecto })}
${datosRespuesta(agentes)}`, { proyecto: agentes.proyecto, idResolucion: id }));
}
