import { describe, expect, test } from "bun:test";
import { errorAlmacenSinEsquema, errorConfiguracionInvalida, errorPuertoOcupado } from "../../../aplicacion/errores";
import { conErrores, paginaErrorUso } from "./errores";
import type { ErrorUso } from "../../../aplicacion/errores";

describe("W-3", () => {
  test("oculta excepciones y presenta errores de uso con el mensaje escapado", async () => {
    const falla = new Error("Detalle privado de infraestructura");
    falla.stack = "Stack privado de infraestructura";
    let llamadas = 0;
    const respuesta = conErrores(() => { llamadas++; throw falla; })(new Request("http://127.0.0.1/"));
    expect(llamadas).toBe(1);
    expect(respuesta.status).toBe(500);
    expect(respuesta.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    const cuerpo = await respuesta.text();
    expect(cuerpo).toContain("Falla interna de RIGE.");
    expect(cuerpo).not.toContain(falla.message);
    expect(cuerpo).not.toContain(falla.stack);
    const uso = paginaErrorUso({ ...errorAlmacenSinEsquema, mensaje: errorAlmacenSinEsquema.mensaje + " <script>&" });
    expect(uso.status).toBe(503);
    expect(uso.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(await uso.text()).toContain("bun run esquema. &lt;script&gt;&amp;");
    const valida = new Response("respuesta", { status: 201 });
    expect(conErrores(() => valida)(new Request("http://127.0.0.1/"))).toBe(valida);
  });
});

describe("W-9", () => {
  test.each([
    ["solicitud-invalida", 400],
    ["proyecto-inexistente", 404],
    ["resolucion-inexistente", 404],
    ["agente-sin-declaraciones", 404],
    ["clave-no-resuelta", 422],
    ["via-no-soportada", 422],
    ["version-no-soportada", 422],
    ["contenido-no-soportado", 422],
    ["entrada-ilegible", 422],
    ["entorno-incompleto", 500],
    ["nuevo-del-adaptador", 422],
    ["toString", 422],
    ["__proto__", 422],
  ] satisfies [ErrorUso["codigo"], number][])("asigna a %s el estado %i y escapa su mensaje", async (codigo, estado) => {
    const respuesta = paginaErrorUso({ codigo, mensaje: '<script>"&' });
    expect(respuesta.status).toBe(estado);
    const cuerpo = await respuesta.text();
    if (estado === 500) {
      expect(cuerpo).toContain("Falla interna de RIGE.");
      expect(cuerpo).not.toContain("&lt;script&gt;&quot;&amp;");
      expect(cuerpo).not.toContain(codigo);
    } else expect(cuerpo).toContain("&lt;script&gt;&quot;&amp;");
  });

  test("asigna el estado HTTP segun el codigo de error de uso", async () => {
    const casos = [
      [errorAlmacenSinEsquema, 503],
      [errorConfiguracionInvalida("RIGE_PUERTO", "valor invalido"), 422],
      [errorPuertoOcupado(12345), 500],
    ] as const;
    for (const [error, estado] of casos) expect(paginaErrorUso(error).status).toBe(estado);
    const r = paginaErrorUso(errorConfiguracionInvalida("RIGE_PUERTO", "valor invalido"));
    const cuerpo = await r.text();
    expect(cuerpo).toContain("valor invalido");
    expect(cuerpo).toContain('<small class="codigo-error">configuracion-invalida</small>');
  });

  test("T6-14 N-2 acciones utiles en 422 con ubicacion enlazada y formulario en 400/404", async () => {
    const ilegible = paginaErrorUso(
      { codigo: "entrada-ilegible", mensaje: "La entrada /tmp/p/opencode.json no se puede leer (2:4)." },
      "/tmp/p",
    );
    expect(ilegible.status).toBe(422);
    const cuerpo422 = await ilegible.text();
    expect(cuerpo422).toContain('href="vscode://file/tmp/p/opencode.json:2:4"');
    expect(cuerpo422).toContain(">./opencode.json:2:4</a>");
    expect(cuerpo422).toContain('href="/hallazgos?proyecto=%2Ftmp%2Fp">Ver hallazgos</a>');
    expect(cuerpo422).toContain('href="/entradas?proyecto=%2Ftmp%2Fp">Ver entradas</a>');
    expect(cuerpo422).toContain('href="/resolver?proyecto=%2Ftmp%2Fp">Reintentar</a>');

    const noSoportada = await paginaErrorUso(
      { codigo: "contenido-no-soportado", mensaje: "RIGE no incorpora {env:SECRET} (/tmp/p/opencode.json:1:2)." },
      "/tmp/p",
    ).text();
    expect(noSoportada).toContain('href="vscode://file/tmp/p/opencode.json:1:2"');
    expect(noSoportada).toContain(">./opencode.json:1:2</a>");

    for (const [codigo, estado] of [["proyecto-inexistente", 404], ["solicitud-invalida", 400]] as const) {
      const respuesta = paginaErrorUso({ codigo, mensaje: "Ruta inválida" }, '/tmp/malo"<');
      expect(respuesta.status).toBe(estado);
      const html = await respuesta.text();
      expect(html).toContain('<form method="get" action="/resolver">');
      expect(html).toContain('name="proyecto" value="/tmp/malo&quot;&lt;"');
    }
  });
});
