import { html } from "../plantillas";
import { responderHtml } from "../respuesta";
import { diseno } from "../diseno";

function rechazar(estado: 403 | 405): Response {
  const pagina = diseno("Solicitud rechazada", html`<section class="tarjeta pagina-error"><h1>Solicitud rechazada</h1><p>Solicitud rechazada.</p><a class="boton" href="/">Volver a Inicio</a></section>`, { minimo: true });
  return responderHtml(estado, pagina, estado === 405 ? { Allow: "GET" } : undefined);
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
