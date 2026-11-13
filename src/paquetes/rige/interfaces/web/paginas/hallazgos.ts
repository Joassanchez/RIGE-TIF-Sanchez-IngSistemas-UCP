import { comandoCli } from "../comando-cli";
import { parametrosPanel, type ContextoPanel } from "../panel";
import { concordar } from "../textos";
import type { RespuestaHallazgos } from "../../../aplicacion/respuestas/contrato-generado";
import { datosRespuesta, html, type HtmlSeguro } from "../plantillas";
import {
  cabeceraPagina,
  datoProyecto,
  datosDeclaraciones,
  diseno,
  enlace,
  huellasEntradas,
  insignia,
  pieDesarrolladores,
  seccionLimites,
} from "../diseno";
import { responderHtml } from "../respuesta";
import { anclaHallazgo, nombresHallazgos } from "../componentes-proyecto";
import { causaHallazgo, explicarLimite } from "../../presentacion/vocabulario";
import { presentarRuta, presentarUbicacion, esArchivoLocal } from "../rutas";

const acciones: Readonly<Record<string, string>> = {
  "entrada-ilegible": "Revisá la sintaxis y la legibilidad de la entrada indicada.",
  "referencia-no-resuelta": "Revisá la referencia indicada y que su destino exista.",
  "sustitucion-sin-valor": "Revisá que el origen de la sustitución esté disponible.",
};

function resumenElementos(elementos: RespuestaHallazgos["resumen"]["elementos"]): string {
  if (elementos === null) return "sin dato: agentes · sin dato: comandos · sin dato: entradas (resolución incompleta)";
  return [
    `${elementos.agentes} ${concordar(elementos.agentes, "agente", "agentes")}`,
    `${elementos.comandos} ${concordar(elementos.comandos, "comando", "comandos")}`,
    `${elementos.entradas} ${concordar(elementos.entradas, "entrada", "entradas")}`,
  ].join(" · ");
}

function tarjetaHallazgo(
  hallazgo: RespuestaHallazgos["hallazgos"][number],
  indice: number,
  respuesta: RespuestaHallazgos,
  contexto: ContextoPanel,
): HtmlSeguro {
  const ubicacion = hallazgo.posicion && esArchivoLocal(hallazgo.entrada.referencia, hallazgo.entrada.via)
    ? presentarUbicacion(hallazgo.entrada.referencia, hallazgo.posicion, hallazgo.entrada.via, { proyecto: respuesta.proyecto, hogar: contexto.hogar })
    : html`<a href="${enlace("/entradas", {
      proyecto: respuesta.proyecto,
      id: contexto.idResolucion,
      ...(contexto.idResolucion === undefined ? {} : parametrosPanel(contexto)),
    }, `entrada-${hallazgo.entrada.orden}`)}">${presentarRuta(hallazgo.localizacion)}</a>`;
  return html`<article id="${anclaHallazgo(indice)}" class="tarjeta hallazgo">
<h3>${insignia(nombresHallazgos[hallazgo.tipo]![0], hallazgo.tipo)}</h3>
${hallazgo.clave?.length ? html`<p>Clave afectada: <code>${hallazgo.clave.join(" › ")}</code></p>` : html``}
${hallazgo.parametros.agente ? html`<p>Agente: <code>${hallazgo.parametros.agente}</code></p>` : html``}
<p>Ubicación: ${ubicacion}</p>
<p><strong>Causa:</strong> ${hallazgo.explicacion ?? causaHallazgo(hallazgo.causa, respuesta.reglas)}</p>
${acciones[hallazgo.tipo] ? html`<p><strong>Qué hacer:</strong> ${acciones[hallazgo.tipo]}</p>` : html``}
<p class="atenuado">Regla relacionada: ${causaHallazgo(hallazgo.causa, respuesta.reglas)}</p>
</article>`;
}

export function paginaHallazgos(respuesta: RespuestaHallazgos, contexto: ContextoPanel = {}): Response {
  // Los índices se asignan en el orden del contrato antes de agrupar (igual que el resumen).
  const indexados = respuesta.hallazgos.map((hallazgo, indice) => ({ hallazgo, indice }));
  const tipos = [...new Set(respuesta.hallazgos.map(h => h.tipo))];
  const limitesBrutos = [
    ...datosDeclaraciones(respuesta.declaraciones, respuesta.reglas),
    ...(respuesta.incompleta ? [
      html`Análisis parcial: no se evaluaron todos los hallazgos.`,
      ...respuesta.motivos.map(motivo => html`${explicarLimite(motivo, respuesta.reglas)}`),
    ] : []),
  ];
  const vistos = new Set<string>();
  const limites = limitesBrutos.filter(item => {
    if (vistos.has(item.texto)) return false;
    vistos.add(item.texto);
    return true;
  });
  return responderHtml(200, diseno("Hallazgos", html`
${cabeceraPagina({
    titulo: html`<h1>Hallazgos <small class="procedencia">Estado actual de los archivos</small></h1>`,
    pregunta: "¿Qué problemas se observan ahora?",
    contexto: [
      datoProyecto(respuesta.proyecto),
      ...(contexto.idResolucion === undefined ? [] : [{ rotulo: "Análisis de origen", valor: `n.º ${contexto.idResolucion}` }]),
      { rotulo: "Estado", valor: "Estado actual de las entradas de configuración (no es la foto guardada)" },
    ],
    detalle: html`<p>Problemas detectados al inspeccionar las entradas vigentes en disco.</p>`,
  })}

<section id="resumen-hallazgos"><h2>Resumen</h2>
<p class="atenuado">${resumenElementos(respuesta.resumen.elementos)}</p>
<div class="estadisticas">${Object.entries(respuesta.resumen.hallazgos).filter(([, cantidad]) => cantidad > 0)
    .map(([tipo, cantidad]) => html`<div class="estadistica estadistica--aviso"><span class="estadistica__nombre">${concordar(cantidad, ...nombresHallazgos[tipo]!)}</span><strong>${cantidad}</strong></div>`)}</div>
${Object.values(respuesta.resumen.hallazgos).includes(0) ? html`<p class="atenuado">Sin hallazgos de: ${Object.entries(respuesta.resumen.hallazgos)
    .filter(([, cantidad]) => cantidad === 0)
    .map(([tipo]) => html`<span title="${tipo}">${nombresHallazgos[tipo]![1].toLowerCase()}</span>`)
    .map((nombre, i) => html`${i ? ", " : ""}${nombre}`)}</p>` : html``}</section>
<section id="tabla-hallazgos"><h2>Detalle de hallazgos</h2>
${respuesta.hallazgos.length ? html`${tipos.map(tipo => html`<div role="group" aria-label="${nombresHallazgos[tipo]![1]}">
${indexados.filter(h => h.hallazgo.tipo === tipo).map(({ hallazgo, indice }) => tarjetaHallazgo(hallazgo, indice, respuesta, contexto))}</div>`)}`
    : html`<p class="estado-vacio">${respuesta.incompleta ? "Sin hallazgos observados; análisis parcial" : "Sin hallazgos en este proyecto"}</p>`}</section>
${seccionLimites(limites)}
${pieDesarrolladores(
    respuesta.proyecto,
    comandoCli("hallazgos", { proyecto: respuesta.proyecto, explicar: true }),
    datosRespuesta(respuesta),
    huellasEntradas(respuesta.entradas, respuesta.resumenEntradas, respuesta.proyecto),
  )}`, { ...contexto, proyecto: respuesta.proyecto, activa: "Hallazgos" }));
}
