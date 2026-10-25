import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { prepararConsultas } from "../utilidades/consultas-cli";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const limpiar of limpiezas.splice(0)) limpiar(); });
function preparar(nombre = "v2-agentes") {
  const escenario = prepararConsultas(nombre);
  limpiezas.push(escenario.borrar);
  return escenario;
}

describe("RF-16 CA-1", () => {
  test("lista vacia resuelve con codigo 0 y un disable posterior false conserva el agente", () => {
    const escenario = preparar();
    writeFileSync(join(escenario.proyecto, "opencode.json"), JSON.stringify({ agent: Object.fromEntries(
      ["build", "plan", "general", "explore", "compaction", "title", "summary"].map(nombre => [nombre, { disable: true }])) }));
    const vacia = escenario.consultar("agentes");
    expect(vacia.codigo).toBe(0);
    expect(JSON.parse(vacia.salida)).toMatchObject({ agentes: [], incompleta: false });
    writeFileSync(join(escenario.proyecto, "opencode.jsonc"), '{"agent":{"explore":{"disable":false,"hidden":true,"mode":"all"}}}');
    const respuesta = JSON.parse(escenario.consultar("agentes").salida);
    expect(respuesta.agentes).toEqual([{ nombre: "explore", origen: "nativo", modo: "all", oculto: true }]);
    expect(respuesta.eliminados.map((a: { nombre: string }) => a.nombre)).not.toContain("explore");
  });
  test("incluye ocultos, origen nativo o declarado, modo y eliminacion de explore", () => {
    const escenario = preparar();
    const resultado = escenario.consultar("agentes");
    expect(resultado.codigo).toBe(0);
    expect(resultado.error).toBe("");
    const respuesta = JSON.parse(resultado.salida);
    expect(respuesta.agentes).toEqual([
      { nombre: "build", origen: "nativo", modo: "primary", oculto: false },
      { nombre: "compaction", origen: "nativo", modo: "primary", oculto: true },
      { nombre: "general", origen: "nativo", modo: "subagent", oculto: false },
      { nombre: "plan", origen: "nativo", modo: "primary", oculto: false },
      { nombre: "summary", origen: "nativo", modo: "primary", oculto: true },
      { nombre: "title", origen: "nativo", modo: "primary", oculto: true },
      { nombre: "zeta", origen: "declarado", modo: "subagent", oculto: false },
    ]);
    expect(respuesta.eliminados).toEqual([expect.objectContaining({ nombre: "explore",
      declaracion: expect.objectContaining({ valor: true, regla: "agente-deshabilitado" }) })]);
    expect(respuesta).toMatchObject({ esquema: 2, incompleta: false, motivos: [] });
    expect(escenario.consultar("permiso", ["--agente", "explore", "--sujeto", "read", "--objetivo", "a"]).codigo).toBe(1);
  });

  test("Markdown declara listado incompleto y motivo sin inventar un agente", () => {
    const escenario = preparar();
    mkdirSync(join(escenario.proyecto, ".opencode/agents"), { recursive: true });
    writeFileSync(join(escenario.proyecto, ".opencode/agents/lector.md"), "---\ndescription: Lector\n---\nLee");
    const resultado = escenario.consultar("agentes", ["--explicar"]);
    expect(resultado.codigo).toBe(0);
    expect(JSON.parse(resultado.salida)).toMatchObject({ incompleta: true, motivos: ["markdown-no-observado"] });
  });
});

describe("RF-16 CA-2", () => {
  test.each(["v2-cadena", "v2-agentes"])("nombres y modos de %s coinciden con opencode agent list", async nombre => {
    const escenario = preparar(nombre);
    const resultado = escenario.consultar("agentes");
    expect(resultado.codigo).toBe(0);
    const referencia = await Bun.file(new URL(`../escenarios/${nombre}/REFERENCIA.json`, import.meta.url)).json();
    expect(referencia.agentes.length).toBeGreaterThan(0);
    expect(JSON.parse(resultado.salida).agentes.map(({ nombre, modo }: { nombre: string; modo: string }) => ({ nombre, modo }))).toEqual(referencia.agentes);
  });
});
