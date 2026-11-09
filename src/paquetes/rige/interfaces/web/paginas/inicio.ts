import type { RespuestaEstado } from "../../../aplicacion/respuestas/estado";
import { html } from "../plantillas";
import { diseno } from "../diseno";
import { responderHtml } from "../respuesta";

export function paginaInicio(respuesta: RespuestaEstado): Response {
  return responderHtml(200, diseno("Inicio", html`
<div class="hero"><p class="ceja">De la configuración a la certeza</p>
<h1>¿Qué configuración rige de verdad?</h1>
<p>RIGE muestra la configuración efectiva de tus agentes, de dónde viene cada valor y qué regla decide cada permiso.</p></div>
<div class="rejilla">
<section class="tarjeta tarjeta--principal" aria-labelledby="titulo-resolver">
<h2 id="titulo-resolver"><span class="paso" aria-hidden="true">01</span>Resolver y guardar</h2>
<p class="atenuado">Guardá una resolución para explorar valores, permisos y su procedencia.</p>
<form method="get" action="/resolver">
<label>Proyecto <input type="text" name="proyecto" placeholder="Ruta del proyecto" required></label>
<div class="grupo-campos"><label>Agente <input type="text" name="agente" value="build"></label>
<div><label>Clave <input type="text" name="clave" value="" placeholder="Opcional" aria-describedby="ayuda-clave"></label>
<p class="ayuda" id="ayuda-clave">vacía: todas las claves del agente</p></div></div>
<button type="submit">Resolver y guardar <span aria-hidden="true">&nbsp;→</span></button></form></section>
<section class="tarjeta" aria-labelledby="titulo-inspeccionar">
<h2 id="titulo-inspeccionar"><span class="paso" aria-hidden="true">02</span>Inspeccionar un proyecto</h2>
<p class="atenuado">Revisá las entradas actuales y los hallazgos sin guardar una resolución.</p>
<form method="get" action="/hallazgos">
<label>Proyecto <input type="text" name="proyecto" placeholder="Ruta del proyecto" required></label>
<div class="acciones"><button type="submit" formaction="/hallazgos">Hallazgos</button>
<button class="boton--secundario" type="submit" formaction="/entradas">Entradas</button></div></form>
</section></div>`, { activa: "Inicio", almacen: respuesta.almacen }));
}
