import { describe, expect, test } from "bun:test";
import { paginaInicio } from "./inicio";
import { versionRige } from "../../../aplicacion/respuestas/estado";

describe("W-2", () => {
  test("presenta version en el pie sin exponer la ruta privada ni scripts", async () => {
    const respuesta = paginaInicio({
      esquema: 2, versionRige,
      almacen: { ruta: "/temporal/<script>rige.db", versionEsquema: 7 },
    });
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    const cuerpo = await respuesta.text();
    expect(cuerpo).toContain('<html lang="es">');
    expect(cuerpo).toContain(`Local · solo lectura · sin red · RIGE ${versionRige}`);
    expect(cuerpo).not.toContain("/temporal/");
    expect(cuerpo).not.toContain("Esquema del almacén");
    expect(cuerpo).not.toContain("<script");
  });
});

describe("W-10", () => {
  test("ofrece el formulario GET y conserva version sin ruta privada", async () => {
    const cuerpo = await paginaInicio({ esquema: 2, versionRige,
      almacen: { ruta: "/temporal/rige.db", versionEsquema: 1 } }).text();
    expect(cuerpo).toContain('<form method="get" action="/resolver">');
    expect(cuerpo).toMatch(/<input[^>]*name="proyecto"[^>]*required/);
    expect(cuerpo.match(/<form\b/g)).toHaveLength(1);
    expect(cuerpo).not.toMatch(/name="(?:agente|clave)"/);
    expect(cuerpo).toContain('>Analizar</button>');
    expect(cuerpo).toContain(`RIGE ${versionRige}`);
    expect(cuerpo).not.toContain("/temporal/rige.db");
    expect(cuerpo).not.toContain("<script");
  });
});
