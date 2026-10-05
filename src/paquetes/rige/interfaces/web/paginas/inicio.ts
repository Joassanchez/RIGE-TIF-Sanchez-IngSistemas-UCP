import type { RespuestaEstado } from "../../../aplicacion/respuestas/estado";
import { html } from "../plantillas";
import { responderHtml } from "../respuesta";

export function paginaInicio(respuesta: RespuestaEstado): Response {
  const pagina = html`<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>RIGE ${respuesta.versionRige}</title></head>
<body><h1>RIGE ${respuesta.versionRige}</h1>
<p>Almacén: ${respuesta.almacen.ruta}</p>
<p>Esquema del almacén: ${respuesta.almacen.versionEsquema}</p>
<form method="get" action="/resolver">
<label>Proyecto <input type="text" name="proyecto" required></label>
<label>Agente <input type="text" name="agente" value="build"></label>
<label>Clave <input type="text" name="clave" value="" aria-describedby="ayuda-clave"></label>
<p id="ayuda-clave">vacía: todas las claves del agente</p>
<button type="submit">Resolver y guardar</button>
</form></body>
</html>`;
  return responderHtml(200, pagina);
}
