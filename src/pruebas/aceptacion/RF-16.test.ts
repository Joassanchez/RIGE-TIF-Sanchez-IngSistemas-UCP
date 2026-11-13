import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
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
  test("v6-plurales-v2 declara no resueltos agents y model objeto frente a la referencia nativa", async () => {
    const escenario = preparar("v6-plurales-v2");
    const referencia = await Bun.file(new URL("../escenarios/v6-plurales-v2/REFERENCIA.json", import.meta.url)).json();
    expect(referencia.agentes).toContainEqual({ nombre: "rev", modo: "primary" });
    expect(referencia.agentes.some((a: { nombre: string }) => a.nombre === "build")).toBe(false);
    const listado = JSON.parse(escenario.consultar("agentes").salida);
    expect(listado).toMatchObject({ incompleta: true, motivos: ["forma-v2-no-incorporada"] });
    const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: escenario.variables });
    const contexto = adaptadorOpenCode.contexto(escenario.proyecto, entorno);
    if (!contexto.exito) throw new Error(contexto.error.mensaje);
    const resuelta = resolver(adaptadorOpenCode, escenario.proyecto, entorno, contexto.valor);
    expect(resuelta.exito).toBe(true);
    if (!resuelta.exito) throw new Error(resuelta.error.mensaje);
    const efectivos = adaptadorOpenCode.listarAgentes(resuelta.valor, contexto.valor);
    for (const agente of ["rev", "build"]) {
      expect(listado.agentes.some((a: { nombre: string }) => a.nombre === agente)).toBe(true);
      expect(efectivos.agentes.find(a => a.nombre === agente)).toMatchObject({
        estado: "no-observado", motivo: "forma-v2-no-incorporada",
      });
      const valores = escenario.consultar("valores", ["--agente", agente]);
      expect(valores.codigo).toBe(1);
      expect(JSON.parse(valores.error)).toMatchObject({
        error: { codigo: "clave-no-resuelta", mensaje: expect.stringContaining("formas de esquema v2") },
      });
    }
    expect(resuelta.valor.noResueltas).toEqual(expect.arrayContaining([
      { ruta: ["model"], regla: "forma-v2-no-incorporada" },
      { ruta: ["agents"], regla: "forma-v2-no-incorporada" },
      { ruta: ["agent", "rev"], regla: "forma-v2-no-incorporada" },
      { ruta: ["agent", "build"], regla: "forma-v2-no-incorporada" },
    ]));
    expect(resuelta.valor.valores.some(v => v.ruta[0] === "model")).toBe(false);
  });
});

describe("A11-1", () => {
  test("un agente solo en Markdown conserva cadena-incompleta como consultado y lanzador", () => {
    const escenario = preparar();
    const agentes = join(escenario.variables.XDG_CONFIG_HOME!, "opencode/agents");
    mkdirSync(agentes, { recursive: true });
    writeFileSync(join(agentes, "solo.md"), "# Agente no observado");
    for (const opciones of [["--agente", "solo"], ["--agente", "plan", "--lanzado-por", "solo"]]) {
      const resultado = escenario.consultar("permiso", [...opciones, "--sujeto", "read", "--objetivo", "a"]);
      expect(resultado.codigo).toBe(1);
      expect(JSON.parse(resultado.error)).toMatchObject({ error: { codigo: "cadena-incompleta", mensaje: expect.stringContaining("markdown-no-observado") } });
    }
    const listado = JSON.parse(escenario.consultar("agentes").salida);
    expect(listado.incompleta).toBe(true);
    expect(listado.agentes).toContainEqual(expect.objectContaining({ nombre: "solo" }));
  });
});
