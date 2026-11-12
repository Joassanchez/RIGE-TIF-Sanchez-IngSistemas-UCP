import { html, type HtmlSeguro } from "./plantillas";
import { diseno } from "./diseno";
import { estilos } from "./estilos";

export function redirigir(ubicacion: string): Response {
  return responderHtml(303, diseno("Resolución guardada", html`<section class="tarjeta pagina-error"><p class="ceja">Resolución guardada</p><h1>Todo listo para inspeccionar</h1><p>La resolución está disponible en el almacén de RIGE.</p><a class="boton" href="${ubicacion}">Ver resolución</a></section>`), { Location: ubicacion });
}

export function responderHtml(
  estado: number,
  pagina: HtmlSeguro,
  cabeceras?: Readonly<Record<string, string>>,
): Response {
  return new Response(pagina.texto, { status: estado, headers: cabecerasSeguras("text/html; charset=utf-8", "no-store", cabeceras) });
}

export function responderEstilos(): Response {
  return new Response(estilos, { headers: cabecerasSeguras("text/css; charset=utf-8", "public, max-age=300") });
}

function cabecerasSeguras(tipo: string, cache: string, cabeceras?: Readonly<Record<string, string>>): Headers {
  const headers = new Headers(cabeceras);
  for (const nombre of [...headers.keys()]) {
    if (nombre.startsWith("access-control-")) headers.delete(nombre);
  }
  headers.set("Content-Type", tipo);
  headers.set("Content-Security-Policy", "default-src 'none'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cache-Control", cache);
  headers.set("Referrer-Policy", "no-referrer");
  return headers;
}
