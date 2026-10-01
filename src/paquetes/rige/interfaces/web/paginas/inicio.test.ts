import { describe, expect, test } from "bun:test";
import { paginaInicio } from "./inicio";

describe("W-2", () => {
  test("presenta la respuesta de estado y escapa la ruta sin scripts", async () => {
    const respuesta = paginaInicio({
      esquema: 1, versionRige: "0.1.0",
      almacen: { ruta: "/temporal/<script>rige.db", versionEsquema: 7 },
    });
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    const cuerpo = await respuesta.text();
    expect(cuerpo).toContain('<html lang="es">');
    expect(cuerpo).toContain("RIGE 0.1.0");
    expect(cuerpo).toContain("/temporal/&lt;script&gt;rige.db");
    expect(cuerpo).toContain("Esquema del almacén: 7");
    expect(cuerpo).not.toContain("<script");
  });
});
