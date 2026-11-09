import { versionRige } from "../../aplicacion/respuestas/estado";
import { html, type HtmlSeguro } from "./plantillas";

interface ContextoDiseno {
  readonly proyecto?: string;
  readonly idResolucion?: string | number;
  readonly clave?: string;
  readonly activa?: "Inicio" | "Entradas" | "Hallazgos" | "Agentes";
  readonly almacen?: { readonly ruta: string; readonly versionEsquema: number };
  readonly minimo?: boolean;
}

// Composición de presentación: no consulta ni modifica respuestas de aplicación.
export function diseno(titulo: string, contenido: HtmlSeguro, contexto: ContextoDiseno = {}): HtmlSeguro {
  const enlaces: { texto: string; ruta: string }[] = [{ texto: "Inicio", ruta: "/" }];
  if (!contexto.minimo && contexto.proyecto !== undefined) {
    const proyecto = encodeURIComponent(contexto.proyecto);
    enlaces.push({ texto: "Entradas", ruta: `/entradas?proyecto=${proyecto}` },
      { texto: "Hallazgos", ruta: `/hallazgos?proyecto=${proyecto}` });
  }
  if (!contexto.minimo && contexto.idResolucion !== undefined) {
    enlaces.push({ texto: "Agentes", ruta: `/agentes?id=${encodeURIComponent(contexto.idResolucion)}${contexto.clave ? `&clave=${encodeURIComponent(contexto.clave)}` : ""}` });
  }
  return html`<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${titulo} · RIGE</title><link rel="stylesheet" href="/estilos.css"></head>
<body><a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="cabecera"><div class="cabecera__interior">
<a class="marca" href="/" aria-label="RIGE · Inicio"><span class="marca__simbolo" aria-hidden="true">r.</span><span>RIGE${contexto.minimo ? html`` : html` <span class="version">${versionRige}</span>`}</span></a>
${contexto.minimo ? html`` : html`<p class="subtitulo">Configuración efectiva de OpenCode 1.18.25</p>`}
<nav aria-label="Principal">${enlaces.map(enlace => contexto.activa === enlace.texto
    ? html`<a href="${enlace.ruta}" aria-current="page">${enlace.texto}</a>`
    : html`<a href="${enlace.ruta}">${enlace.texto}</a>`)}</nav></div></header>
<main id="contenido" tabindex="-1">${contenido}</main>
<footer class="pie"><p><span class="punto" aria-hidden="true"></span>Local · solo lectura · sin red</p>
${contexto.almacen && !contexto.minimo ? html`<div class="pie__almacen"><p>Almacén: <code>${contexto.almacen.ruta}</code></p><p>Esquema del almacén: ${contexto.almacen.versionEsquema}</p></div>` : html``}
</footer></body></html>`;
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
  return html`<section class="tarjeta pagina-error"><p class="ceja">Error ${estado}</p>
<h1>${titulos[estado] ?? "No se pudo completar la consulta"}</h1><p>${mensaje}</p>
<p><code class="ficha-codigo">${codigo}</code></p><a class="boton" href="/">Volver a Inicio</a></section>`;
}
