import { rotuloFoto } from "../textos";
import { comandoCli } from "../comando-cli";
import { parametrosPanel, selectorAgente, type ContextoPanel } from "../panel";
import type { RespuestaPermiso } from "../../../aplicacion/respuestas/contrato-generado";
import { datosRespuesta, html } from "../plantillas";
import { cabeceraPagina, declaraciones, diseno, efectoVisual, enlace, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { presentarRuta, presentarUbicacion, presentarTextoUbicado } from "../rutas";
import {
  decisionConGlifo,
  origenImplicito,
  origenNativo,
  motivoSinDecision,
  nombreVia,
} from "../../presentacion/vocabulario";
import { rolEfecto, rolOrigen } from "../../presentacion/roles";

export function paginaPermiso(respuesta: RespuestaPermiso, idResolucion?: string, contexto: ContextoPanel = {}): Response {
  const lanzadoPor = "lanzadoPor" in respuesta && typeof respuesta.lanzadoPor === "string" ? respuesta.lanzadoPor : undefined;
  const determinante = respuesta.determinante === null ? undefined : respuesta.cadena.find(r => r.indice === respuesta.determinante);
  const caracter = (regla: RespuestaPermiso["cadena"][number]) => regla.origen.tipo === "declarado" ? "Declarada" : regla.origen.tipo === "implicito" ? origenImplicito()
    : origenNativo(regla.origen.regla);
  const rutaVisible = { proyecto: respuesta.proyecto, hogar: contexto.hogar };
  const procedencia = (regla: RespuestaPermiso["cadena"][number]) => regla.origen.tipo === "declarado" && regla.declaracion
    ? html`${regla.declaracion.via ? nombreVia(regla.declaracion.via, true) : "Declaración"} · ${presentarUbicacion(regla.declaracion.referencia, regla.origen.posicion, regla.declaracion.via, rutaVisible)}`
    : html`${caracter(regla)}${regla.origen.tipo === "declarado" ? html` · Declaración sin ubicación` : html` · ${respuesta.reglas[regla.origen.regla] ?? regla.origen.regla}`}`;
  const motivo = motivoSinDecision(respuesta.motivoSinDecision, respuesta.reglas);
  // La primera oración sin decisión es su motivo (contrato del explicador).
  const explicacion = respuesta.explicacion?.map((texto, i) => i === 0 && respuesta.decision === null ? motivo : texto);
  const decision = insignia(decisionConGlifo(respuesta.decision), rolEfecto(respuesta.decision));
  const advertenciasPlegadas: readonly string[] = respuesta.nativaAnulada ? respuesta.advertencias.filter(c => c === "proteccion-nativa-anulada") : [];
  const advertenciasVisibles = respuesta.advertencias.filter(c => !advertenciasPlegadas.includes(c));
  const frase = respuesta.decision === null ? undefined : explicacion?.[0];
  const fraseDecision = frase && determinante?.origen.tipo === "declarado" && determinante.declaracion
    ? presentarTextoUbicado(frase, determinante.declaracion.referencia, determinante.origen.posicion, determinante.declaracion.via, rutaVisible) : html`${frase ?? ""}`;
  return responderHtml(200, diseno(`Permiso de ${respuesta.agente}`, html`
${cabeceraPagina({
    titulo: `Permiso de ${respuesta.agente}`,
    lateral: selectorAgente({ ...contexto, agente: respuesta.agente, ...(idResolucion === undefined ? {} : { idResolucion }) }, "Permisos", respuesta.proyecto),
    pregunta: "¿Puede este agente realizar esta acción?",
    contexto: html`${presentarRuta(respuesta.proyecto)}${idResolucion === undefined ? html`` : html` · Análisis n.º ${idResolucion} · ${rotuloFoto(respuesta.proyecto, contexto.instante, contexto.fechaNoDisponible)}`}${lanzadoPor ? html` · Lanzado por: <code>${lanzadoPor}</code>` : html``} · <code class="ficha-codigo">${respuesta.consulta.sujeto}: ${respuesta.consulta.objetivo}</code>`,
    detalle: html`<p>Muestra la regla que decide el permiso para la consulta indicada según la foto guardada.</p>`,
  })}

<section id="resultado-permiso" class="tarjeta decision-principal"><h2>Decisión</h2>${decision}${respuesta.decision === null ? html`<p>${motivo}</p>` : html``}
${frase ? html`<p>${fraseDecision}</p>` : html``}
${respuesta.herramienta ? html`<p>Herramienta: ${respuesta.herramienta.nombre}, ${respuesta.herramienta.ofrecida ? "ofrecida" : "retirada"}.</p>` : html``}
</section>
<section id="regla-determinante"><h2>Regla que decide</h2>${determinante === undefined ? html`<p>No hay una regla determinante${respuesta.porDefecto ? "; se aplica la decisión por defecto" : " para esta consulta"}.</p>`
    : html`<div class="tarjeta"><p><code>${determinante.patron}</code> · ${efectoVisual(determinante.efecto)} · ${caracter(determinante)}</p><p>${procedencia(determinante)}</p></div>`}</section>
${respuesta.nativaAnulada ? html`<div class="aviso aviso--advertencia rol--pregunta bloque"><p><strong>Advertencia: esta declaración anula una protección nativa de OpenCode</strong> (regla ${respuesta.nativaAnulada.regla + 1}, por ${respuesta.nativaAnulada.por + 1}).</p></div>` : html``}
${explicacion?.length ? html`<details><summary>Explicación completa</summary>${explicacion.map(oracion => html`<p>${oracion}</p>`)}</details>` : html``}
${(respuesta.explicacion?.length && respuesta.declaraciones.length) || advertenciasPlegadas.length
    ? html`<details id="notas-analisis"><summary>Notas del análisis (${respuesta.declaraciones.length + advertenciasPlegadas.length})</summary>${declaraciones(respuesta.declaraciones, respuesta.reglas)}${advertenciasPlegadas.map(codigo => html`<p>${respuesta.reglas[codigo]}</p>`)}</details>`
    : declaraciones(respuesta.declaraciones, respuesta.reglas)}
<div class="acciones acciones--pie"><details id="cadena-efectiva"><summary>Ver reglas coincidentes (${respuesta.cadena.length})</summary>
<div class="tabla-contenedor" role="region" aria-label="Cadena efectiva" tabindex="0">
<table class="tabla-tarjetas" role="table"><caption class="oculto-visual">Reglas coincidentes</caption><thead><tr role="row"><th scope="col">Índice</th><th scope="col">Sujeto</th><th scope="col">Patrón</th><th scope="col">Efecto</th><th scope="col">Procedencia</th><th scope="col">Prevalencia</th></tr></thead>
<tbody>${respuesta.cadena.map(regla => html`<tr class="${`${regla.indice === respuesta.determinante ? "fila--determinante " : respuesta.desplazadas.includes(regla.indice) ? "fila--desplazada " : ""}fila--${rolOrigen(regla.origen)}`}"><td data-etiqueta="Índice">${regla.indice + 1}</td><td data-etiqueta="Sujeto"><code>${regla.sujeto}</code></td><td data-etiqueta="Patrón"><code>${regla.patron}</code></td><td data-etiqueta="Efecto">${efectoVisual(regla.efecto)}</td>
<td data-etiqueta="Procedencia">${procedencia(regla)}</td>
<td data-etiqueta="Prevalencia">${regla.indice === respuesta.determinante ? html`<strong>Determinante</strong>` : respuesta.desplazadas.includes(regla.indice) ? "Desplazada" : "Coincidente"}</td></tr>`)}</tbody></table></div></details>
${idResolucion === undefined ? html`` : html`<a class="boton boton--secundario" href="${enlace("/reglas", { id: idResolucion, ...parametrosPanel({ ...contexto, agente: respuesta.agente, ...(lanzadoPor === undefined ? {} : { lanzadoPor }) }) })}">Ver la cadena completa en Todas las reglas</a>`}</div>
${advertenciasVisibles.length ? html`<section id="advertencias"><h2>Advertencias</h2>${advertenciasVisibles.map(codigo => html`<div class="aviso aviso--advertencia"><p>${respuesta.reglas[codigo]}</p></div>`)}</section>` : html``}
${comandoCli("permiso", { proyecto: respuesta.proyecto, agente: respuesta.agente,
  ...(respuesta.consulta.forma === "herramienta" ? { herramienta: respuesta.consulta.herramienta! } : { sujeto: respuesta.consulta.sujeto }),
  objetivo: respuesta.consulta.objetivo, ...(lanzadoPor ? { "lanzado-por": lanzadoPor } : {}), explicar: true })}
${datosRespuesta(respuesta)}`, { ...contexto, agente: respuesta.agente, activa: "Permiso", proyecto: respuesta.proyecto, ...(idResolucion === undefined ? {} : { idResolucion }) }));
}
