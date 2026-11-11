import { rotuloFoto } from "../textos";
import { comandoCli } from "../comando-cli";
import { consultaPanel, selectorAgente, type ContextoPanel } from "../panel";
import type { RespuestaPermiso } from "../../../aplicacion/respuestas/permiso";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno, efectoVisual, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta, presentarUbicacion } from "../rutas";

export function paginaPermiso(respuesta: RespuestaPermiso, idResolucion?: string, contexto: ContextoPanel = {}): Response {
  const lanzadoPor = "lanzadoPor" in respuesta && typeof respuesta.lanzadoPor === "string" ? respuesta.lanzadoPor : undefined;
  const determinante = respuesta.determinante === null ? undefined : respuesta.cadena.find(r => r.indice === respuesta.determinante);
  const caracter = (regla: RespuestaPermiso["cadena"][number]) => regla.origen.tipo === "declarado" ? "Declarada" : regla.origen.tipo === "implicito" ? "Implícita"
    : ({ "nativa-general": "Nativa general", "nativa-agente": "Nativa del agente", "denegacion-subagente": "Denegación de subagente" } as Record<string, string>)[regla.origen.regla] ?? "Nativa";
  const procedencia = (regla: RespuestaPermiso["cadena"][number]) => regla.origen.tipo === "declarado" && regla.declaracion
    ? html`${regla.declaracion.via} · ${presentarUbicacion(regla.declaracion.referencia, regla.origen.posicion, regla.declaracion.via)}`
    : html`${caracter(regla)}${regla.origen.tipo === "declarado" ? html` · Declaración sin ubicación` : html` · ${respuesta.reglas[regla.origen.regla] ?? regla.origen.regla}`}`;
  const motivo = respuesta.motivoSinDecision === "comando-compuesto" ? "El comando contiene varias operaciones; consultá cada una por separado."
    : respuesta.motivoSinDecision === "fuera-del-arbol" ? "El objetivo está fuera del árbol observado."
    : respuesta.motivoSinDecision === "eje-parcialmente-observado" ? "Este sujeto de permiso solo se observa parcialmente."
    : respuesta.reglas[respuesta.motivoSinDecision ?? ""] ?? "No se pudo determinar el permiso para este objetivo.";
  const decision = respuesta.decision === "allow" ? insignia("Permitido", "permitida") : respuesta.decision === "ask" ? insignia("Pregunta antes", "pregunta")
    : respuesta.decision === "deny" ? insignia("Denegado", "denegada") : respuesta.decision === null ? html`<p>${motivo}</p>` : efectoVisual(respuesta.decision);
  return responderHtml(200, diseno(`Permiso de ${respuesta.agente}`, html`
<div class="cabecera-pagina"><h1>Permiso de ${respuesta.agente}</h1>
<p>¿Puede este agente realizar esta acción?</p>
<details><summary>¿Qué significa?</summary>
<p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p>
${lanzadoPor ? html`<p>Lanzado por: <code>${lanzadoPor}</code></p>` : html``}
<p><code class="ficha-codigo">${respuesta.consulta.sujeto}: ${respuesta.consulta.objetivo}</code></p>
${idResolucion === undefined ? html`` : html`${rotuloFoto(respuesta.proyecto, contexto.instante, contexto.fechaNoDisponible)}`}</details></div>
${selectorAgente({ ...contexto, agente: respuesta.agente, ...(idResolucion === undefined ? {} : { idResolucion }) }, "Permisos", respuesta.proyecto)}
<section id="resultado-permiso" class="tarjeta decision-principal"><h2>Decisión</h2>${decision}
${respuesta.explicacion?.[0] ? html`<p>${respuesta.explicacion[0]}</p>` : html``}
${respuesta.herramienta ? html`<p>Herramienta: ${respuesta.herramienta.nombre}, ${respuesta.herramienta.ofrecida ? "ofrecida" : "retirada"}.</p>` : html``}
</section>
<section id="regla-determinante"><h2>Regla que decide</h2>${determinante === undefined ? html`<p>No hay una regla determinante${respuesta.porDefecto ? "; se aplica la decisión por defecto" : " para esta consulta"}.</p>`
    : html`<div class="tarjeta"><p><code>${determinante.patron}</code> · ${efectoVisual(determinante.efecto)} · ${caracter(determinante)}</p><p>${procedencia(determinante)}</p></div>`}</section>
${respuesta.nativaAnulada ? html`<div class="aviso aviso--advertencia bloque"><p><strong>Esta declaración anula una protección nativa de OpenCode</strong> (regla ${respuesta.nativaAnulada.regla + 1}, por ${respuesta.nativaAnulada.por + 1}).</p></div>` : html``}
${respuesta.explicacion?.length ? html`<details><summary>Explicación completa</summary>${respuesta.explicacion.map(oracion => html`<p>${oracion}</p>`)}</details>` : html``}
${respuesta.explicacion?.length && respuesta.declaraciones.length
    ? html`<details id="notas-analisis"><summary>Notas del análisis (${respuesta.declaraciones.length})</summary>${declaraciones(respuesta.declaraciones, respuesta.reglas)}</details>`
    : declaraciones(respuesta.declaraciones, respuesta.reglas)}
<details id="cadena-efectiva"><summary>Ver reglas coincidentes (${respuesta.cadena.length})</summary>
<div class="tabla-contenedor" role="region" aria-label="Cadena efectiva" tabindex="0">
<table class="tabla-tarjetas"><thead><tr><th>Índice</th><th>Sujeto</th><th>Patrón</th><th>Efecto</th><th>Procedencia</th><th>Prevalencia</th></tr></thead>
<tbody>${respuesta.cadena.map(regla => html`<tr class="${regla.indice === respuesta.determinante ? "fila--determinante" : respuesta.desplazadas.includes(regla.indice) ? "fila--desplazada" : "fila"}"><td data-etiqueta="Índice">${regla.indice + 1}</td><td data-etiqueta="Sujeto"><code>${regla.sujeto}</code></td><td data-etiqueta="Patrón"><code>${regla.patron}</code></td><td data-etiqueta="Efecto">${efectoVisual(regla.efecto)}</td>
<td data-etiqueta="Procedencia">${procedencia(regla)}</td>
<td data-etiqueta="Prevalencia">${regla.indice === respuesta.determinante ? html`<strong>Determinante</strong>` : respuesta.desplazadas.includes(regla.indice) ? "Desplazada" : "Coincidente"}</td></tr>`)}</tbody></table></div></details>
${idResolucion === undefined ? html`` : html`<p><a href="${`/reglas?id=${encodeURIComponent(idResolucion)}${consultaPanel({ ...contexto, agente: respuesta.agente, ...(lanzadoPor === undefined ? {} : { lanzadoPor }) })}`}">Ver la cadena completa en Todas las reglas</a></p>`}
${respuesta.advertencias.length ? html`<section id="advertencias"><h2>Advertencias</h2>${respuesta.advertencias.map(codigo => html`<div class="aviso aviso--advertencia"><p>${respuesta.reglas[codigo]}</p></div>`)}</section>` : html``}
${comandoCli("permiso", { proyecto: respuesta.proyecto, agente: respuesta.agente,
  ...(respuesta.consulta.forma === "herramienta" ? { herramienta: respuesta.consulta.herramienta! } : { sujeto: respuesta.consulta.sujeto }),
  objetivo: respuesta.consulta.objetivo, ...(lanzadoPor ? { "lanzado-por": lanzadoPor } : {}), explicar: true })}
${datosRespuesta(respuesta)}`, { ...contexto, agente: respuesta.agente, activa: "Permiso", proyecto: respuesta.proyecto, ...(idResolucion === undefined ? {} : { idResolucion }) }));
}
