import { describe, expect, test } from "bun:test";
import { errorAlmacenSinEsquema } from "../../aplicacion/errores";
import type { ConsultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import { versionRige, type RespuestaEstado } from "../../aplicacion/respuestas/estado";
import { html } from "./plantillas";
import { responderHtml } from "./respuesta";
import { crearManejador } from "./servidor";

describe("W-11 redireccion", () => {
  test("redirige con 303, enlace escapado y las mismas defensas", async () => {
    const { redirigir } = await import("./respuesta");
    const ubicacion = '/resoluciones/7?agente=a&clave=<"clave">';
    const respuesta = redirigir(ubicacion);
    expect(respuesta.status).toBe(303);
    expect(respuesta.headers.get("location")).toBe(ubicacion);
    const defensas = responderHtml(200, html`<p>RIGE</p>`);
    for (const [nombre, valor] of defensas.headers) expect(respuesta.headers.get(nombre)).toBe(valor);
    const cuerpo = await respuesta.text();
    expect(cuerpo).toContain('href="/resoluciones/7?agente=a&amp;clave=&lt;&quot;clave&quot;&gt;"');
    expect(cuerpo).not.toContain('<"clave">');
  });
});

const manejarEstado = (puerto: number, consultarEstado: ConsultarEstado) => crearManejador(puerto, {
  consultarEstado, resolverProyecto: () => { throw new Error("No resolver"); },
  consultarResolucion: () => { throw new Error("No consultar"); },
});

describe("W-7", () => {
  test("incluye las cinco cabeceras de defensa y conserva las adicionales sin CORS", async () => {
    const pagina = html`<p>${"<script>"}</p>`;
    const cabeceras: readonly (Readonly<Record<string, string>> | undefined)[] = [undefined, { Allow: "GET", "X-Ejemplo": "valor" }, {
      Allow: "GET", "X-Ejemplo": "valor", "Content-Type": "text/plain",
      "Content-Security-Policy": "default-src *", "X-Content-Type-Options": "invalido",
      "Cache-Control": "public", "Referrer-Policy": "unsafe-url", "Access-Control-Allow-Origin": "*",
    }];
    for (const adicionales of cabeceras) {
      const respuesta = responderHtml(405, pagina, adicionales);
      expect(respuesta.status).toBe(405);
      expect(await respuesta.text()).toBe(pagina.texto);
      expect(respuesta.headers.get("content-type")).toBe("text/html; charset=utf-8");
      expect(respuesta.headers.get("content-security-policy"))
        .toBe("default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
      expect(respuesta.headers.get("x-content-type-options")).toBe("nosniff");
      expect(respuesta.headers.get("cache-control")).toBe("no-store");
      expect(respuesta.headers.get("referrer-policy")).toBe("no-referrer");
      if (adicionales) {
        expect(respuesta.headers.get("allow")).toBe("GET");
        expect(respuesta.headers.get("x-ejemplo")).toBe("valor");
      }
      expect([...respuesta.headers.keys()].filter((nombre) => nombre.startsWith("access-control-"))).toEqual([]);
    }
  });
});

describe("W-8", () => {
  test("protege todas las respuestas del manejador con CSP y nosniff", () => {
    const puerto = 12345;
    const estado: RespuestaEstado = {
      esquema: 1, versionRige, almacen: { ruta: "/temporal/rige.db", versionEsquema: 1 },
    };
    const manejar = manejarEstado(puerto, () => ({ exito: true, valor: estado }));
    const solicitud = (ruta = "/", opciones: { method?: string; headers?: Record<string, string> } = {}) => new Request(`http://127.0.0.1${ruta}`, {
      ...opciones, headers: { Host: `127.0.0.1:${puerto}`, ...opciones.headers },
    });
    const respuestas = [
      [manejar(solicitud()), 200],
      [manejar(solicitud("/otra")), 404],
      [manejar(solicitud("/", { headers: { Host: `ajeno.example:${puerto}` } })), 403],
      [manejar(solicitud("/", { headers: { "Sec-Fetch-Site": "cross-site" } })), 403],
      [manejar(solicitud("/", { method: "POST" })), 405],
      [manejarEstado(puerto, () => ({ exito: false, error: errorAlmacenSinEsquema }))(solicitud()), 503],
      [manejarEstado(puerto, () => { throw new Error("Falla de infraestructura"); })(solicitud()), 500],
    ] as const;
    for (const [respuesta, codigo] of respuestas) {
      expect(respuesta.status).toBe(codigo);
      expect(respuesta.headers.get("content-security-policy"))
        .toBe("default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
      expect(respuesta.headers.get("x-content-type-options")).toBe("nosniff");
    }
  });
});
