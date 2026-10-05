import { html, type HtmlSeguro } from "./plantillas";

export function redirigir(ubicacion: string): Response {
  return responderHtml(303, html`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>RIGE</title></head><body><a href="${ubicacion}">Ver resolución</a></body></html>`, { Location: ubicacion });
}

export function responderHtml(
  estado: number,
  pagina: HtmlSeguro,
  cabeceras?: Readonly<Record<string, string>>,
): Response {
  const headers = new Headers(cabeceras);
  for (const nombre of [...headers.keys()]) {
    if (nombre.startsWith("access-control-")) headers.delete(nombre);
  }
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cache-Control", "no-store");
  headers.set("Referrer-Policy", "no-referrer");
  return new Response(pagina.texto, { status: estado, headers });
}
