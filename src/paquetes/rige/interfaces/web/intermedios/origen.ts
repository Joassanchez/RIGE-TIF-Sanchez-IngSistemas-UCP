import { html } from "../plantillas";

function rechazar(estado: 403 | 405): Response {
  const pagina = html`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>RIGE</title></head><body><p>Solicitud rechazada.</p></body></html>`;
  const headers: Record<string, string> = { "Content-Type": "text/html; charset=utf-8" };
  if (estado === 405) headers.Allow = "GET";
  return new Response(pagina.texto, { status: estado, headers });
}

export function conVerificacionDeOrigen(
  puerto: number,
  manejador: (solicitud: Request) => Response,
): (solicitud: Request) => Response {
  return (solicitud) => {
    const host = solicitud.headers.get("Host")?.toLowerCase();
    if (host !== `127.0.0.1:${puerto}` && host !== `localhost:${puerto}`) return rechazar(403);
    const sitio = solicitud.headers.get("Sec-Fetch-Site");
    if (sitio !== null && sitio !== "same-origin" && sitio !== "none") return rechazar(403);
    if (solicitud.method !== "GET") return rechazar(405);
    return manejador(solicitud);
  };
}
