import { expect, test } from "bun:test";
import { ejecutarCli } from "../cli/ejecutar";
import { paginaResumenProyecto } from "../web/paginas/resumen-proyecto";
import { paginaInicio } from "../web/paginas/inicio";
import { versionRige } from "../../aplicacion/respuestas/estado";

test("T5-26 U-4 version inyectada en CLI y web, detectada si viene en la respuesta", async () => {
  let salida = "";
  const codigo = ejecutarCli(["--version", "--json"], () => { throw new Error("No ensamblar"); }, {
    versionHerramienta: "9.8.7", escribirSalida: t => { salida += t; }, escribirError: () => { throw new Error("Sin error"); },
  });
  expect(codigo).toBe(0); expect(JSON.parse(salida).versionHerramienta).toBe("9.8.7");
  const agentes = { esquema: 2 as const, proyecto: "/p", entradas: [], resumenEntradas: "", declaraciones: [], reglas: {}, agentes: [], eliminados: [], incompleta: false, motivos: [] };
  const error = { exito: false as const, error: { codigo: "prueba", mensaje: "prueba" } };
  expect(await paginaResumenProyecto(agentes, error, error, "1", undefined, { versionHerramienta: "9.8.7" }).text()).toContain("OpenCode 9.8.7");
  const detectada = { ...agentes, versionHerramienta: "detectada" };
  expect(await paginaResumenProyecto(detectada, error, error, "1", undefined, { versionHerramienta: "9.8.7" }).text()).toContain("OpenCode detectada");
  for await (const archivo of new Bun.Glob("**/*.ts").scan("paquetes/rige/interfaces")) {
    if (!archivo.endsWith(".test.ts")) expect(await Bun.file(`paquetes/rige/interfaces/${archivo}`).text()).not.toContain("1.18.25");
  }
});

test("T5-26 U-5 inicio recibe ahora y conserva fechas relativas al cruzar medianoche", async () => {
  const estado = { esquema: 2 as const, versionRige, almacen: { ruta: "/p/rige.db", versionEsquema: 2 } };
  const instante = new Date(2020, 0, 1, 23, 59).toISOString();
  const recientes = { esquema: 2 as const, proyectos: [{ proyecto: "/p", id: 1, instante, cantidad: 1 }] };
  expect(await paginaInicio(estado, recientes, new Date(2020, 0, 1, 23, 59)).text()).toContain("hoy 23:59");
  expect(await paginaInicio(estado, recientes, new Date(2020, 0, 2, 0, 1)).text()).toContain("ayer 23:59");
  for await (const archivo of new Bun.Glob("**/*.ts").scan("paquetes/rige/interfaces")) {
    if (!archivo.endsWith(".test.ts")) expect(await Bun.file(`paquetes/rige/interfaces/${archivo}`).text()).not.toMatch(/new Date\(\s*\)/);
  }
});
