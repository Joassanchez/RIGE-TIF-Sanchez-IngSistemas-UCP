import { versionRige } from "../../aplicacion/respuestas/estado";
import { html, type HtmlSeguro } from "./plantillas";
import { type ContextoPanel } from "./panel";
import { nombreProyecto } from "./textos";

interface ContextoDiseno extends ContextoPanel {
  readonly proyecto?: string;
  readonly activa?: "Inicio" | "Valores" | "Permisos" | "Permiso" | "Todas las reglas" | "Comparar" | "Entradas" | "Hallazgos" | "Agentes";
  readonly almacen?: { readonly ruta: string; readonly versionEsquema: number };
  readonly minimo?: boolean;
}

// Composición de presentación: no consulta ni modifica respuestas de aplicación.
export function diseno(titulo: string, contenido: HtmlSeguro, contexto: ContextoDiseno = {}): HtmlSeguro {
  const id = contexto.idResolucion === undefined ? undefined : encodeURIComponent(contexto.idResolucion);
  return html`<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${titulo} · RIGE</title><link rel="stylesheet" href="/estilos.css"></head>
<body><a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="cabecera"><div class="cabecera__interior">
<a class="marca" href="/" aria-label="RIGE · Inicio">RIGE</a>
${contexto.minimo ? html`` : html`<nav class="migas" aria-label="Migas de pan">
${contexto.proyecto === undefined ? html`<span aria-hidden="true">›</span><span aria-current="page">${titulo.startsWith("Error ") ? "Error" : titulo}</span>` : html`
<span aria-hidden="true">›</span>${id === undefined ? html`<span>${nombreProyecto(contexto.proyecto)}</span>` : html`<a href="${`/resoluciones/${id}`}">${nombreProyecto(contexto.proyecto)}</a>`}
${contexto.agente === undefined ? html`` : html`<span aria-hidden="true">›</span>${contexto.activa === "Valores" || id === undefined ? html`<span aria-current="page">${contexto.agente}</span>` : html`<a href="${`/resoluciones/${id}/agentes/${encodeURIComponent(contexto.agente)}`}">${contexto.agente}</a>`}`}
${contexto.activa === undefined || contexto.activa === "Valores" ? html`` : html`<span aria-hidden="true">›</span><span aria-current="page">${contexto.activa}</span>`}`}</nav>`}</div></header>
<main id="contenido" tabindex="-1">${contenido}</main>
<footer class="pie"><p>Local · solo lectura · sin red${contexto.minimo ? html`` : html` · RIGE ${versionRige}`}</p></footer></body></html>`;
}

export function insignia(texto: unknown, tipo = "neutra"): HtmlSeguro {
  return html`<span class="${`insignia insignia--${tipo}`}">${texto}</span>`;
}

export function efectoVisual(efecto: string | null): HtmlSeguro {
  switch (efecto) {
    case "allow": return insignia("permitida", "permitida");
    case "deny": return insignia("denegada", "denegada");
    case "ask": return insignia("sujeta a confirmación", "pregunta");
    default: return insignia(efecto ?? "sin decisión");
  }
}

export function declaraciones(codigos: readonly string[], reglas: Readonly<Record<string, string>>): HtmlSeguro {
  return codigos.length ? html`<section id="declaraciones" class="declaraciones" aria-label="Declaraciones">
<h2>Declaraciones</h2>${codigos.map(codigo => html`<div class="aviso aviso--informacion"><p>${reglas[codigo]}</p></div>`)}</section>` : html``;
}

export function contenidoError(estado: number, mensaje: string, codigo: string): HtmlSeguro {
  const titulos: Readonly<Record<number, string>> = { 400: "Revisá la consulta", 404: "Página no encontrada",
    422: "No se pudo completar la consulta", 500: "Ocurrió un problema", 503: "Almacén no disponible" };
  const proyectoInexistente = codigo === "proyecto-inexistente";
  const titulo = proyectoInexistente ? "No encontramos el proyecto" : titulos[estado] ?? "No se pudo completar la consulta";
  // También los errores de uso clasificados como 500 conservan el mensaje fijo.
  return html`<section class="tarjeta pagina-error"><h1>${titulo}</h1><p>${estado === 500 ? "Falla interna de RIGE."
    : codigo === "resolucion-inexistente" ? mensaje.replace(/^No existe la resolución [0-9]+ en el almacén\.$/, "No encontramos ese análisis en el almacén.") : mensaje}</p>
${proyectoInexistente ? html`<p>Revisá la ruta y comprobá que la carpeta exista en esta máquina.</p>` : html``}
<p><a class="boton" href="/">Volver al inicio</a></p><small class="codigo-error">${estado === 500 ? "interno" : codigo}</small></section>`;
}
