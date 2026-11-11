import { rotuloFoto } from "../textos";
import type { RespuestaReglas } from "../../../aplicacion/respuestas/reglas";
import { html, datosRespuesta } from "../plantillas";
import { diseno, efectoVisual, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta, presentarUbicacion } from "../rutas";
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
  const codigosFila = (fila: typeof matriz.filas[number]) => [...new Set([...fila.declaraciones, ...fila.advertencias, ...motivosFila(fila)])];
  const comunes = [...new Set([...respuesta.declaraciones, ...respuesta.advertencias, ...matriz.motivos,
    ...matriz.filas.flatMap(codigosFila).filter(c => matriz.filas.filter(f => codigosFila(f).includes(c)).length > 1)])];
  const filasLimitadas = matriz.filas.filter(f => f.error !== null || f.ejesParciales.length || f.declaraciones.length || f.advertencias.length || motivosFila(f).length);
  const ejesComunes = [...new Set(matriz.filas[0]?.ejesParciales ?? [])].filter(eje => matriz.filas.every(f => f.ejesParciales.includes(eje)));
  const ejesPropios = (fila: typeof matriz.filas[number]) => fila.ejesParciales.filter(eje => !ejesComunes.includes(eje));
  const filasPropias = filasLimitadas.filter(f => f.error !== null || ejesPropios(f).length || codigosFila(f).some(c => !comunes.includes(c)));
  const ejesParciales = matriz.sujetos.filter(s => matriz.filas.some(f => f.celdas.some(c => c.sujeto === s && c.motivo === "eje-parcialmente-observado")));
  const origenesNativos: Readonly<Record<string, string>> = { "nativa-general": "general", "nativa-agente": "agente", "denegacion-subagente": "final" };
  return responderHtml(200, diseno(`Reglas de ${agente}`, html`<div class="cabecera-pagina"><div class="barra-agente"><h1>Reglas de ${agente}</h1>${selectorAgente(panel, "Todas las reglas", respuesta.proyecto)}</div>
<p>¿Qué reglas rigen en este agente?</p>
<details><summary>¿Qué significa?</summary>
<p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p>${rotuloFoto(respuesta.proyecto, contexto.instante, contexto.fechaNoDisponible)}
${lanzadoPor === undefined ? html`` : html`<p>Lanzado por: <code>${lanzadoPor}</code></p>`}</details></div>

<section id="matriz-permisos"><h2>Matriz de permisos</h2>
<p>Efecto general por sujeto de permiso; las reglas por patrón pueden cambiarlo para objetivos concretos. <a href="#acciones-resolucion">Consultar permiso para una acción concreta</a>.</p>
<div class="tabla-contenedor" role="region" aria-label="Matriz de permisos" tabindex="0">
<table class="tabla-matriz"><thead><tr><th>Agente</th>${matriz.sujetos.map(s => html`<th scope="col">${s}</th>`)}</tr></thead><tbody>
${matriz.filas.map(f => html`<tr><th scope="row"><a href="${`/reglas?${consulta(f.agente)}#cadena-completa`}">${f.agente}</a><span class="matriz__estados">${f.oculto ? insignia("oculto") : html``}
${filasLimitadas.includes(f) ? html`<a href="#limites-matriz">${insignia(f.error ? "incompleta" : "parcial", "aviso")}</a>` : html``}</span></th>
${f.celdas.map(c => html`<td data-etiqueta="${c.sujeto}"><a class="matriz__efectos" href="${`/resoluciones/${encodeURIComponent(id)}/permisos?${consulta(f.agente)}&sujeto=${encodeURIComponent(c.sujeto)}`}">${efectoVisual(c.efecto, c.prevalece === null ? undefined : `Regla ${c.prevalece}`)}${c.motivo === "eje-parcialmente-observado" ? insignia("parcial", "aviso") : html``}</a>
</td>`)}</tr>`)}</tbody></table></div>
${ejesParciales.length ? html`<p class="aviso">${insignia("parcial", "aviso")} <code>${ejesParciales.join(", ")}</code>: ${respuesta.reglas["eje-parcialmente-observado"] ?? "Eje parcialmente observado; sin decisión general."}</p>` : html``}
${matriz.noObservados.map(a => html`<p>Agente no observado: <code>${a.nombre}</code> (${a.motivo})</p>`)}</section>
${filasLimitadas.length ? html`<section id="limites-matriz"><h2>Límites</h2>
${ejesComunes.length ? html`<p>Todos los agentes: <code>${ejesComunes.join(", ")}</code></p>` : html``}
${filasPropias.length ? html`<ul>${filasPropias.map(f => html`<li><strong>${f.agente}</strong>
${f.error ? html`<p>${f.error.codigo}: ${f.error.mensaje}</p>` : html``}
${ejesPropios(f).length ? html`<p>Ejes parciales: <code>${ejesPropios(f).join(", ")}</code></p>` : html``}
${codigosFila(f).filter(c => !comunes.includes(c)).map(c => html`<p>${respuesta.reglas[c] ?? c}</p>`)}</li>`)}</ul>` : html``}
</section>` : html``}
${comunes.length ? html`<section id="limites-comunes"><h2>Límites comunes</h2><ul>${comunes.map(c => html`<li>${respuesta.reglas[c] ?? c}</li>`)}</ul></section>` : html``}
<section id="cadena-completa"><h2>Cadena completa</h2><p>Orden de evaluación, con índices desde 1. Prevalece indica el efecto general por sujeto, sin evaluar objetivos.</p>
<div class="tabla-contenedor" role="region" aria-label="Cadena completa" tabindex="0">
<table class="tabla-tarjetas tabla-cadena"><thead><tr><th>Índice</th><th>Sujeto</th><th>Patrón</th><th>Efecto</th><th>Procedencia</th><th>Prevalece para *</th></tr></thead>
<tbody>${respuesta.cadena.map(r => html`<tr><td data-etiqueta="Índice">${r.indice}</td><td data-etiqueta="Sujeto"><code>${r.sujeto}</code></td>
<td data-etiqueta="Patrón"><code>${r.patron}</code></td><td data-etiqueta="Efecto">${efectoVisual(r.efecto)}</td>
<td data-etiqueta="Procedencia">${r.origen.tipo === "nativo"
    ? html`<span title="${`nativo · ${r.origen.regla}: ${respuesta.reglas[r.origen.regla] ?? "Explicación no disponible."}`}">${origenesNativos[r.origen.regla] ? `OpenCode · ${origenesNativos[r.origen.regla]}` : "OpenCode"}</span>`
    : html`${insignia(r.origen.tipo)} ${r.origen.tipo === "declarado" && r.declaracion
      ? html`${r.declaracion.via} · ${presentarUbicacion(r.declaracion.referencia, r.origen.posicion, r.declaracion.via)}` : html`<code>${r.origen.tipo === "declarado" ? "Declaración sin ubicación" : `${r.origen.regla}: ${respuesta.reglas[r.origen.regla]}`}</code>`}`}</td>
<td data-etiqueta="Prevalece para *">${r.prevalece.map(s => insignia(s))}</td></tr>`)}</tbody></table></div></section>
${consultasPermiso(panel, lanzadoPor)}
${comandoCli("reglas", { proyecto: respuesta.proyecto, agente, ...(lanzadoPor === undefined ? {} : { "lanzado-por": lanzadoPor }) })}
${datosRespuesta(respuesta)}`, { ...panel, proyecto: respuesta.proyecto, activa: "Todas las reglas" }));
}
