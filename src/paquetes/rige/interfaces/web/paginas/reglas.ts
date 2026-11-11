import { rotuloFoto } from "../textos";
import type { RespuestaReglas } from "../../../aplicacion/respuestas/reglas";
import { html, datosRespuesta } from "../plantillas";
import { declaraciones, diseno, efectoVisual, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta } from "../rutas";
import { comandoCli } from "../comando-cli";
import { selectorAgente, type ContextoPanel } from "../panel";
import { consultasPermiso } from "./consultas-permiso";

export function paginaReglas(respuesta: RespuestaReglas, id: string, contexto: ContextoPanel = {}): Response {
  const { agente, lanzadoPor, matriz } = respuesta;
  const consulta = (nombre: string) => new URLSearchParams({ id, agente: nombre, ...(lanzadoPor === undefined ? {} : { lanzadoPor }),
    ...(contexto.clave ? { clave: contexto.clave } : {}), ...(contexto.q ? { q: contexto.q } : {}) }).toString();
  const panel = { ...contexto, idResolucion: id, agente, ...(lanzadoPor === undefined ? {} : { lanzadoPor }),
    agentes: matriz.filas.map(f => ({ nombre: f.agente })) };
  const motivosFila = (fila: typeof matriz.filas[number]) => [...new Set(fila.celdas.flatMap(c => c.motivo !== null && c.motivo !== "eje-parcialmente-observado" ? [c.motivo] : []))];
  const filasLimitadas = matriz.filas.filter(f => f.error !== null || f.ejesParciales.length || f.declaraciones.length || f.advertencias.length || motivosFila(f).length);
  const ejesParciales = matriz.sujetos.filter(s => matriz.filas.some(f => f.celdas.some(c => c.sujeto === s && c.motivo === "eje-parcialmente-observado")));
  return responderHtml(200, diseno(`Reglas de ${agente}`, html`<div class="cabecera-pagina"><h1>Reglas de ${agente}</h1>
<p>¿Qué reglas rigen en este agente?</p>
<details><summary>¿Qué significa?</summary>
<p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p>${rotuloFoto(respuesta.proyecto, contexto.instante, contexto.fechaNoDisponible)}
${lanzadoPor === undefined ? html`` : html`<p>Lanzado por: <code>${lanzadoPor}</code></p>`}</details></div>
${selectorAgente(panel, "Permisos", respuesta.proyecto)}
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
${filasLimitadas.includes(f) ? html`<a href="#limites-matriz">${insignia(f.error ? "incompleta" : "parcial", "aviso")}</a>` : html``}</th>
${f.celdas.map(c => html`<td><a href="${`/reglas?${consulta(f.agente)}#cadena-completa`}">${ejesParciales.includes(c.sujeto)
    ? insignia("parcial", "aviso") : efectoVisual(c.efecto)}</a>
${c.prevalece === null ? html`` : html`<p class="ayuda">Regla ${c.prevalece}</p>`}
</td>`)}</tr>`)}</tbody></table></div>
${ejesParciales.length ? html`<p class="aviso">${insignia("parcial", "aviso")} <code>${ejesParciales.join(", ")}</code>: ${respuesta.reglas["eje-parcialmente-observado"] ?? "Eje parcialmente observado; sin decisión general."}</p>` : html``}
${matriz.motivos.map(c => html`<p class="aviso aviso--advertencia">Listado incompleto: ${respuesta.reglas[c]}</p>`)}
${matriz.noObservados.map(a => html`<p>Agente no observado: <code>${a.nombre}</code> (${a.motivo})</p>`)}</section>
${filasLimitadas.length ? html`<section id="limites-matriz"><h2>Límites</h2><ul>${filasLimitadas.map(f => html`<li><strong>${f.agente}</strong>
${f.error ? html`<p>${f.error.codigo}: ${f.error.mensaje}</p>` : html``}
${f.ejesParciales.length ? html`<p>Ejes parciales: <code>${f.ejesParciales.join(", ")}</code></p>` : html``}
${[...new Set([...f.declaraciones, ...f.advertencias, ...motivosFila(f)])].map(c => html`<p>${respuesta.reglas[c] ?? c}</p>`)}</li>`)}</ul></section>` : html``}
${declaraciones(respuesta.declaraciones, respuesta.reglas)}
${respuesta.advertencias.map(c => html`<p class="aviso aviso--advertencia">${respuesta.reglas[c]}</p>`)}
${consultasPermiso(panel, lanzadoPor)}
${comandoCli("reglas", { proyecto: respuesta.proyecto, agente, ...(lanzadoPor === undefined ? {} : { "lanzado-por": lanzadoPor }) })}
${datosRespuesta(respuesta)}`, { ...panel, proyecto: respuesta.proyecto, activa: "Permisos" }));
}
