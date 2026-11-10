import type { RespuestaReglas } from "../../../aplicacion/respuestas/reglas";
import { html, datosRespuesta } from "../plantillas";
import { declaraciones, diseno, efectoVisual, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta } from "../rutas";
import { comandoCli } from "../comando-cli";
import type { ContextoPanel } from "../panel";
import { consultasPermiso } from "./consultas-permiso";

export function paginaReglas(respuesta: RespuestaReglas, id: string, contexto: ContextoPanel = {}): Response {
  const { agente, lanzadoPor, matriz } = respuesta;
  const consulta = (nombre: string) => new URLSearchParams({ id, agente: nombre, ...(lanzadoPor === undefined ? {} : { lanzadoPor }) }).toString();
  const panel = { ...contexto, idResolucion: id, agente, ...(lanzadoPor === undefined ? {} : { lanzadoPor }),
    agentes: matriz.filas.map(f => ({ nombre: f.agente })) };
  return responderHtml(200, diseno(`Reglas de ${agente}`, html`<h1>Reglas de ${agente}</h1>
<p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p><p>Foto guardada · resolución ${id}</p>
${lanzadoPor === undefined ? html`` : html`<p>Lanzado por: <code>${lanzadoPor}</code></p>`}
<section id="cadena-completa"><h2>Cadena completa</h2><p>Orden de evaluación, con índices desde 1. Prevalece indica el efecto general por sujeto, sin evaluar objetivos.</p>
<div class="tabla-contenedor" role="region" aria-label="Cadena completa" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Índice</th><th>Sujeto</th><th>Patrón</th><th>Efecto</th><th>Procedencia</th><th>Prevalece para *</th></tr></thead>
<tbody>${respuesta.cadena.map(r => html`<tr><td data-etiqueta="Índice">${r.indice}</td><td data-etiqueta="Sujeto"><code>${r.sujeto}</code></td>
<td data-etiqueta="Patrón"><code>${r.patron}</code></td><td data-etiqueta="Efecto">${efectoVisual(r.efecto)}</td>
<td data-etiqueta="Procedencia">${insignia(r.origen.tipo)} <code>${r.origen.tipo === "declarado"
    ? `${r.declaracion?.localizacion ?? r.declaracion?.referencia} (${r.declaracion?.via})` : `${r.origen.regla}: ${respuesta.reglas[r.origen.regla]}`}</code></td>
<td data-etiqueta="Prevalece para *">${r.prevalece.map(s => insignia(s))}</td></tr>`)}</tbody></table></div></section>
<section id="matriz-permisos"><h2>Matriz de permisos</h2>
<p>Efecto general por sujeto de permiso; las reglas por patrón pueden cambiarlo para objetivos concretos. <a href="#acciones-resolucion">Consultar permiso para una acción concreta</a>.</p>
<div class="tabla-contenedor" role="region" aria-label="Matriz de permisos" tabindex="0">
<table><thead><tr><th>Agente</th>${matriz.sujetos.map(s => html`<th scope="col">${s}</th>`)}</tr></thead><tbody>
${matriz.filas.map(f => html`<tr><th scope="row"><a href="${`/reglas?${consulta(f.agente)}#cadena-completa`}">${f.agente}</a>${f.oculto ? insignia("oculto") : html``}
${f.error ? html`<p>${f.error.codigo}: ${f.error.mensaje}</p>` : html``}
<details><summary>Límites de la fila</summary>${f.declaraciones.map(c => html`<p class="ayuda">${respuesta.reglas[c]}</p>`)}${f.advertencias.map(c => html`<p class="aviso aviso--advertencia">${respuesta.reglas[c]}</p>`)}</details></th>
${f.celdas.map(c => html`<td><a href="${`/reglas?${consulta(f.agente)}#cadena-completa`}">${c.motivo === "eje-parcialmente-observado"
    ? insignia("parcial, sin decisión") : efectoVisual(c.efecto)}</a>
${c.prevalece === null ? html`` : html`<p class="ayuda">Regla ${c.prevalece}</p>`}
${c.motivo ? html`<p>${respuesta.reglas[c.motivo] ?? c.motivo}</p>` : html``}</td>`)}</tr>`)}</tbody></table></div>
${matriz.motivos.map(c => html`<p class="aviso aviso--advertencia">Listado incompleto: ${respuesta.reglas[c]}</p>`)}
${matriz.noObservados.map(a => html`<p>Agente no observado: <code>${a.nombre}</code> (${a.motivo})</p>`)}</section>
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
${respuesta.advertencias.map(c => html`<p class="aviso aviso--advertencia">${respuesta.reglas[c]}</p>`)}
${consultasPermiso(panel, lanzadoPor)}
${comandoCli("reglas", { proyecto: respuesta.proyecto, agente, ...(lanzadoPor === undefined ? {} : { "lanzado-por": lanzadoPor }) })}
${datosRespuesta(respuesta)}`, { ...panel, proyecto: respuesta.proyecto, activa: "Permisos" }));
}
