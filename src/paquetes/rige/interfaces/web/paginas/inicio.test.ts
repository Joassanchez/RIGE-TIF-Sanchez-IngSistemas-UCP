import { describe, expect, test } from "bun:test";
import { paginaInicio } from "./inicio";
import { versionRige } from "../../../aplicacion/respuestas/estado";

describe("W-2", () => {
  test("presenta la respuesta de estado y escapa la ruta sin scripts", async () => {
    const respuesta = paginaInicio({
      esquema: 1, versionRige,
      almacen: { ruta: "/temporal/<script>rige.db", versionEsquema: 7 },
    });
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    const cuerpo = await respuesta.text();
    expect(cuerpo).toContain('<html lang="es">');
    expect(cuerpo).toContain(`RIGE ${versionRige}`);
    expect(cuerpo).toContain("/temporal/&lt;script&gt;rige.db");
    expect(cuerpo).toContain("Esquema del almacén: 7");
    expect(cuerpo).not.toContain("<script");
  });
});

describe("W-10", () => {
  test("ofrece el formulario GET y conserva version y almacen", async () => {
    const cuerpo = await paginaInicio({ esquema: 1, versionRige,
      almacen: { ruta: "/temporal/rige.db", versionEsquema: 1 } }).text();
    expect(cuerpo).toContain('<form method="get" action="/resolver">');
    expect(cuerpo).toMatch(/<input[^>]*name="proyecto"[^>]*required/);
    expect(cuerpo).toMatch(/<input[^>]*name="agente"[^>]*value="build"/);
    expect(cuerpo).toMatch(/<input[^>]*name="clave"[^>]*value=""/);
    expect(cuerpo).toContain("vacía: todas las claves del agente");
    expect(cuerpo).toContain("Resolver y guardar");
    expect(cuerpo).toContain(`RIGE ${versionRige}`);
    expect(cuerpo).toContain("/temporal/rige.db");
    expect(cuerpo).not.toContain("<script");
  });
});
