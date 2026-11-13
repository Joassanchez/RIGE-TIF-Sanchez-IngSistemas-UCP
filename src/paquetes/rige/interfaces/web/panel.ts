import type { RespuestaAgentes } from "../../aplicacion/respuestas/contrato-generado";
import { html, type HtmlSeguro } from "./plantillas";

export interface ContextoPanel {
  readonly versionHerramienta?: string;
  readonly instante?: string;
  readonly fechaNoDisponible?: string;
  readonly idResolucion?: string | number;
  readonly agente?: string | undefined;
  readonly clave?: string;
  readonly q?: string;
  readonly agentes?: readonly { readonly nombre: string }[];
  readonly lanzadoPor?: string;
  readonly sujeto?: string;
}

export function agenteInicial(agentes: RespuestaAgentes["agentes"]): string | undefined {
  return agentes.find(a => a.nombre === "build")?.nombre ?? agentes[0]?.nombre;
}

export function consultaPanel(contexto: ContextoPanel): string {
  return `${contexto.agente !== undefined ? `&agente=${encodeURIComponent(contexto.agente)}` : ""}${contexto.clave ? `&clave=${encodeURIComponent(contexto.clave)}` : ""}${contexto.q ? `&q=${encodeURIComponent(contexto.q)}` : ""}${contexto.lanzadoPor === undefined ? "" : `&lanzadoPor=${encodeURIComponent(contexto.lanzadoPor)}`}`;
}

export function camposContexto(contexto: ContextoPanel): HtmlSeguro {
  return html`${contexto.clave ? html`<input type="hidden" name="clave" value="${contexto.clave}">` : html``}${contexto.q ? html`<input type="hidden" name="q" value="${contexto.q}">` : html``}`;
}

export function selectorAgente(contexto: ContextoPanel, vista: string | undefined, proyecto?: string): HtmlSeguro {
  if (contexto.idResolucion === undefined || contexto.agentes === undefined) return html``;
  const id = String(contexto.idResolucion);
  const accion = vista === "Permisos" ? `/resoluciones/${encodeURIComponent(id)}/permisos`
    : vista === "Todas las reglas" ? "/reglas" : vista === "Entradas" ? "/entradas" : vista === "Hallazgos" ? "/hallazgos" : `/resoluciones/${encodeURIComponent(id)}`;
  return html`<form id="seleccionar-agente" class="selector-agente" action="${accion}" method="get">
<label for="agente-seleccionado">Agente</label>
<select name="agente" id="agente-seleccionado">${contexto.agentes.map(agente => agente.nombre === contexto.agente
    ? html`<option value="${agente.nombre}" selected>${agente.nombre}</option>`
    : html`<option value="${agente.nombre}">${agente.nombre}</option>`)}</select>
${["Todas las reglas", "Entradas", "Hallazgos"].includes(vista ?? "") ? html`<input type="hidden" name="id" value="${id}">` : html``}
${["Entradas", "Hallazgos"].includes(vista ?? "") ? html`<input type="hidden" name="proyecto" value="${proyecto}">` : html``}
${camposContexto(contexto)}
${contexto.lanzadoPor === undefined ? html`` : html`<input type="hidden" name="lanzadoPor" value="${contexto.lanzadoPor}">`}
${contexto.sujeto === undefined ? html`` : html`<input type="hidden" name="sujeto" value="${contexto.sujeto}">`}
<button class="boton--secundario">Ver agente</button></form>`;
}
