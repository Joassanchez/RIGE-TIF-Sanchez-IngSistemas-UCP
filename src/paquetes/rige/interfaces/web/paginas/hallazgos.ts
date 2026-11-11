import { comandoCli } from "../comando-cli";
import { consultaPanel, selectorAgente, type ContextoPanel } from "../panel";
import { concordar } from "../textos";
import type { RespuestaHallazgos } from "../../../aplicacion/respuestas/hallazgos";
import { datosRespuesta, html } from "../plantillas";
import { declaraciones, diseno, insignia } from "../diseno";
import { responderHtml } from "../respuesta";
import { anclaHallazgo, nombresHallazgos } from "../componentes-proyecto";
import { presentarRuta, presentarUbicacion, esArchivoLocal } from "../rutas";

export function paginaHallazgos(respuesta: RespuestaHallazgos, contexto: ContextoPanel = {}): Response {
  // Los índices se asignan en el orden del contrato antes de agrupar (igual que el resumen).
  const indexados = respuesta.hallazgos.map((hallazgo, indice) => ({ hallazgo, indice }));
  const tipos = [...new Set(respuesta.hallazgos.map(h => h.tipo))];
  const acciones: Readonly<Record<string, string>> = {
    "entrada-ilegible": "Revisá la sintaxis y la legibilidad de la entrada indicada.",
    "referencia-no-resuelta": "Revisá la referencia indicada y que su destino exista.",
    "sustitucion-sin-valor": "Revisá que el origen de la sustitución esté disponible.",
  };
  return responderHtml(200, diseno("Hallazgos", html`
<div class="cabecera-pagina"><div class="barra-agente"><h1>Hallazgos <small class="procedencia">Estado actual de los archivos</small></h1>${selectorAgente(contexto, "Hallazgos", respuesta.proyecto)}</div>
<p>¿Qué problemas se observan ahora?</p>
<details><summary>¿Qué significa?</summary><p>Proyecto: ${presentarRuta(respuesta.proyecto)}</p>
<p>Estado actual de las entradas de configuración (no es la foto guardada)</p></details></div>

${declaraciones(respuesta.declaraciones, respuesta.reglas)}
<section id="resumen-hallazgos"><h2>Resumen</h2>
<p class="atenuado">${respuesta.resumen.elementos === null ? "sin dato: agentes · sin dato: comandos · sin dato: entradas (resolución incompleta)" : `${respuesta.resumen.elementos.agentes} ${concordar(respuesta.resumen.elementos.agentes, "agente", "agentes")} · ${respuesta.resumen.elementos.comandos} ${concordar(respuesta.resumen.elementos.comandos, "comando", "comandos")} · ${respuesta.resumen.elementos.entradas} ${concordar(respuesta.resumen.elementos.entradas, "entrada", "entradas")}`}</p>
<div class="estadisticas">${Object.entries(respuesta.resumen.hallazgos).filter(([, cantidad]) => cantidad > 0).map(([tipo, cantidad]) => html`<div class="estadistica estadistica--aviso"><span class="estadistica__nombre">${concordar(cantidad, ...nombresHallazgos[tipo]!)}</span><strong>${cantidad}</strong><small>${tipo}</small></div>`)}</div>
${Object.values(respuesta.resumen.hallazgos).includes(0) ? html`<p class="atenuado">Sin hallazgos de: ${Object.entries(respuesta.resumen.hallazgos).filter(([, cantidad]) => cantidad === 0).map(([tipo]) => html`<span title="${tipo}">${nombresHallazgos[tipo]![1].toLowerCase()}</span>`).map((nombre, i) => html`${i ? ", " : ""}${nombre}`)}</p>` : html``}</section>
${respuesta.incompleta ? html`<div class="aviso aviso--advertencia"><p>Hallazgos parciales; análisis parcial.</p>${respuesta.motivos.map(motivo => html`<p>${respuesta.reglas[motivo] ?? motivo}</p>`)}</div>` : html``}
<section id="tabla-hallazgos"><h2>Detalle de hallazgos</h2>
${respuesta.hallazgos.length ? html`${tipos.map(tipo => html`<div class="grupo-hallazgos" role="group" aria-label="${nombresHallazgos[tipo]![1]}">
${indexados.filter(h => h.hallazgo.tipo === tipo).map(({ hallazgo, indice }) => html`<article id="${anclaHallazgo(indice)}" class="tarjeta hallazgo">
<h3>${insignia(nombresHallazgos[tipo]![0], tipo)}</h3>
${hallazgo.clave?.length ? html`<p>Clave afectada: <code>${hallazgo.clave.join(" › ")}</code></p>` : html``}
${hallazgo.parametros.agente ? html`<p>Agente: <code>${hallazgo.parametros.agente}</code></p>` : html``}
<p>Ubicación: ${hallazgo.posicion && esArchivoLocal(hallazgo.entrada.referencia, hallazgo.entrada.via) ? presentarUbicacion(hallazgo.entrada.referencia, hallazgo.posicion, hallazgo.entrada.via) : html`<a href="${`/entradas?proyecto=${encodeURIComponent(respuesta.proyecto)}${contexto.idResolucion === undefined ? "" : `&id=${encodeURIComponent(contexto.idResolucion)}${consultaPanel(contexto)}`}#entrada-${encodeURIComponent(hallazgo.entrada.orden)}`}">${presentarRuta(hallazgo.localizacion)}</a>`}</p>
<p><strong>Causa:</strong> ${hallazgo.explicacion ?? respuesta.reglas[hallazgo.causa] ?? hallazgo.causa}</p>
${acciones[tipo] ? html`<p><strong>Qué hacer:</strong> ${acciones[tipo]}</p>` : html``}
<p class="atenuado">Regla relacionada: ${respuesta.reglas[hallazgo.causa] ?? hallazgo.causa}</p>
</article>`)}</div>`)}`
    : html`<p class="estado-vacio">${respuesta.incompleta ? "Sin hallazgos observados; análisis parcial" : "Sin hallazgos en este proyecto"}</p>`}</section>
${comandoCli("hallazgos", { proyecto: respuesta.proyecto, explicar: true })}
${datosRespuesta(respuesta)}`, { ...contexto, proyecto: respuesta.proyecto, activa: "Hallazgos" }));
}
