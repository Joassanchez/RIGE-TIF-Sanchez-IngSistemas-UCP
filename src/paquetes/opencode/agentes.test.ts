import { describe, expect, test } from "bun:test";
import { resolver } from "../../pruebas/utilidades/resolver";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { adaptadorOpenCode } from "./adaptador";
import { agentesEfectivos } from "./agentes";

describe("A11-1", () => { test("T2-11b C-3 listado y cadena comparten existencia, estado y exclusiones Markdown", () => {
  const entorno = crearEntornoMemoria({ archivos: {
    "/p/opencode.json": JSON.stringify({ agent: { vacio: {}, oculto: { hidden: true }, fuera: { disable: true },
      build: { disable: true }, mixto: { mode: "subagent" } } }),
    "/h/.config/opencode/agents/mixto.md": "# no observado",
    "/h/.config/opencode/agents/solo.md": "# no observado",
  }, directorios: ["/p", "/h/.config/opencode", "/h/.config/opencode/agents"], variables: { HOME: "/h" } });
  const contexto = adaptadorOpenCode.contexto("/p", entorno);
  const resolucion = resolver(adaptadorOpenCode, "/p", entorno);
  if (!contexto.exito || !resolucion.exito) throw new Error("Preparacion fallida");
  const efectivos = agentesEfectivos(resolucion.valor, contexto.valor);
  for (const [nombre, estado, cadenaValida] of [["vacio", "activo", true], ["oculto", "activo", true],
    ["fuera", "deshabilitado", false], ["build", "deshabilitado", false], ["plan", "activo", true],
    ["mixto", "no-observado", false], ["solo", "no-observado", false], ["ausente", undefined, false]] as const) {
    expect(efectivos.agentes.find(a => a.nombre === nombre)?.estado).toBe(estado);
    const resultado = adaptadorOpenCode.cadena(resolucion.valor, nombre, contexto.valor);
    expect(resultado.exito).toBe(cadenaValida);
    if (!cadenaValida) expect(resultado).toMatchObject({ exito: false, error: {
      codigo: estado === "no-observado" ? "cadena-incompleta" : "agente-inexistente",
    } });
  }
  expect(adaptadorOpenCode.cadena(resolucion.valor, "plan", contexto.valor, "solo"))
    .toMatchObject({ exito: false, error: { codigo: "cadena-incompleta", mensaje: expect.stringContaining("markdown-no-observado") } });
  expect(adaptadorOpenCode.listarAgentes(resolucion.valor, contexto.valor)).toEqual(efectivos);
  expect(efectivos.motivos).toContain("markdown-no-observado");
  expect(efectivos.agentes.find(a => a.nombre === "fuera")).toMatchObject({ motivo: "agente-deshabilitado", eliminacion: { regla: "agente-deshabilitado" } });
}); });
