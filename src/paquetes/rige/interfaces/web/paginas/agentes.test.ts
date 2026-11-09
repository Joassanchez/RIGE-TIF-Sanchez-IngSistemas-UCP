import { describe, expect, test } from "bun:test";
import type { RespuestaAgentes } from "../../../aplicacion/respuestas/agentes";
import { paginaAgentes } from "./agentes";
import { seccionHtml } from "../../../../../pruebas/utilidades/html";

describe("T3-01 R-11 declaraciones en agentes", () => {
  test("presenta las plantillas escapadas y conserva el objeto embebido", async () => {
    const respuesta: RespuestaAgentes = { esquema: 2, proyecto: "/p", entradas: [], resumenEntradas: "a".repeat(64),
      agentes: [], eliminados: [], incompleta: false, motivos: [],
      declaraciones: ["version-no-determinada", "ejecutable-no-encontrado"],
      reglas: { "version-no-determinada": "Version <no determinada>.", "ejecutable-no-encontrado": "No hay ejecutable & paquete." } };
    const cuerpo = await paginaAgentes(respuesta).text();
    const declaraciones = seccionHtml(cuerpo, "declaraciones");
    expect(declaraciones).toContain("<p>Version &lt;no determinada&gt;.</p>");
    expect(declaraciones).toContain("<p>No hay ejecutable &amp; paquete.</p>");
    seccionHtml(cuerpo, "tabla-agentes");
    expect(cuerpo.indexOf('id="declaraciones"')).toBeLessThan(cuerpo.indexOf('id="tabla-agentes"'));
    expect(JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(respuesta);
    expect(cuerpo.replace(/<script type="application\/json" id="respuesta">[^]*?<\/script>/, "")).not.toMatch(/<script/i);
  });
});
