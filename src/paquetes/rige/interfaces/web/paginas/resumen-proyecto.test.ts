import { describe, expect, test } from "bun:test";
import type { RespuestaAgentes } from "../../../aplicacion/respuestas/agentes";
import { paginaResumenProyecto } from "./resumen-proyecto";
import { seccionHtml } from "../../../../../pruebas/utilidades/html";

describe("T3-01 R-11 declaraciones en resumen del proyecto", () => {
  test("presenta las plantillas escapadas y conserva el objeto embebido", async () => {
    const respuesta: RespuestaAgentes = { esquema: 2, proyecto: "/p", entradas: [], resumenEntradas: "a".repeat(64),
      agentes: [], eliminados: [], incompleta: false, motivos: [],
      declaraciones: ["version-no-determinada", "ejecutable-no-encontrado"],
      reglas: { "version-no-determinada": "Version <no determinada>.", "ejecutable-no-encontrado": "No hay ejecutable & paquete." } };
    const cuerpo = await paginaResumenProyecto(respuesta, { exito: true, valor: { ...respuesta, entradas: [] } }, { exito: false, error: { codigo: "prueba", mensaje: "No disponible" } }, "7").text();
    const declaraciones = seccionHtml(cuerpo, "declaraciones");
    expect(declaraciones).toContain("<p>Version &lt;no determinada&gt;.</p>");
    expect(declaraciones).toContain("<p>No hay ejecutable &amp; paquete.</p>");
    seccionHtml(cuerpo, "tabla-agentes");
    expect(JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(respuesta);
    expect(cuerpo.replace(/<script type="application\/json" id="respuesta">[^]*?<\/script>/, "")).not.toMatch(/<script/i);
  });
});
