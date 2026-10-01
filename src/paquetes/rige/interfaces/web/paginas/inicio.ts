import type { RespuestaEstado } from "../../../aplicacion/respuestas/estado";
import { html } from "../plantillas";

export function paginaInicio(respuesta: RespuestaEstado): Response {
  const pagina = html`<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>RIGE ${respuesta.versionRige}</title></head>
<body><h1>RIGE ${respuesta.versionRige}</h1>
<p>Almacén: ${respuesta.almacen.ruta}</p>
<p>Esquema del almacén: ${respuesta.almacen.versionEsquema}</p></body>
</html>`;
  return new Response(pagina.texto, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
