import type { RespuestaAgentes } from "../../aplicacion/respuestas/agentes";
import { html, type HtmlSeguro } from "./plantillas";

export interface ContextoPanel {
  readonly idResolucion?: string | number;
  readonly agente?: string | undefined;
  readonly clave?: string;
  readonly q?: string;
  readonly agentes?: RespuestaAgentes["agentes"];
}

export function agenteInicial(agentes: RespuestaAgentes["agentes"]): string | undefined {
  return agentes.find(a => a.nombre === "build")?.nombre ?? agentes[0]?.nombre;
}

export function consultaPanel(contexto: ContextoPanel): string {
  return `${contexto.agente !== undefined ? `&agente=${encodeURIComponent(contexto.agente)}` : ""}${contexto.clave ? `&clave=${encodeURIComponent(contexto.clave)}` : ""}`;
}

export function camposContexto(contexto: ContextoPanel): HtmlSeguro {
  return html`${contexto.clave ? html`<input type="hidden" name="clave" value="${contexto.clave}">` : html``}${contexto.q ? html`<input type="hidden" name="q" value="${contexto.q}">` : html``}`;
}

export function selectorAgente(contexto: ContextoPanel, vista: string | undefined, proyecto?: string): HtmlSeguro {
  if (contexto.idResolucion === undefined || contexto.agentes === undefined) return html``;
  const id = String(contexto.idResolucion);
  const accion = vista === "Permisos" ? `/resoluciones/${encodeURIComponent(id)}/permisos`
    : vista === "Agentes" ? "/agentes" : vista === "Entradas" ? "/entradas" : vista === "Hallazgos" ? "/hallazgos" : `/resoluciones/${encodeURIComponent(id)}`;
  return html`<form id="seleccionar-agente" class="selector-agente" action="${accion}" method="get">
<label for="agente-seleccionado">Agente</label>
<select name="agente" id="agente-seleccionado">${contexto.agentes.map(agente => agente.nombre === contexto.agente
    ? html`<option value="${agente.nombre}" selected>${agente.nombre}</option>`
    : html`<option value="${agente.nombre}">${agente.nombre}</option>`)}</select>
${["Agentes", "Entradas", "Hallazgos"].includes(vista ?? "") ? html`<input type="hidden" name="id" value="${id}">` : html``}
${["Entradas", "Hallazgos"].includes(vista ?? "") ? html`<input type="hidden" name="proyecto" value="${proyecto}">` : html``}
${camposContexto(contexto)}
<button class="boton--secundario">Ver agente</button></form>`;
}
