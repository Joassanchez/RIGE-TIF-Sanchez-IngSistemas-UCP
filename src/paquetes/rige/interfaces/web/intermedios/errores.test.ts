import { describe, expect, test } from "bun:test";
import { errorAlmacenSinEsquema, errorConfiguracionInvalida, errorPuertoOcupado } from "../../../aplicacion/errores";
import { conErrores, paginaErrorUso } from "./errores";

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
  test("asigna el estado HTTP segun el codigo de error de uso", () => {
    const casos = [
      [errorAlmacenSinEsquema, 503],
      [errorConfiguracionInvalida("RIGE_PUERTO", "valor invalido"), 500],
      [errorPuertoOcupado(12345), 500],
    ] as const;
    for (const [error, estado] of casos) expect(paginaErrorUso(error).status).toBe(estado);
  });
});
