import { describe, expect, test } from "bun:test";
import { ejecutarCli, type CasosUsoCli, type CanalesCli } from "./ejecutar";
import { versionRige } from "../../aplicacion/respuestas/estado";

const no = (): never => { throw new Error("No consultar"); };
const casos: CasosUsoCli = { compararResoluciones: no, consultarProyectosRecientes: no, consultarReglas: no,
  consultarValores: no, consultarPermiso: no, consultarAgentes: no, consultarEntradas: no, consultarHallazgos: no,
  prepararAlmacen: () => ({ exito: true, valor: { esquema: 2, versionRige, almacen: { ruta: "/datos/rige.db", versionEsquema: 2 } } }),
  consultarEstado: no, describirAlmacen: no, iniciarServidor: no };

test("T5-26 U-9 reglas JSON ignora explicar igual que todo", () => {
  const solicitudes: unknown[] = [];
  const dobles: CasosUsoCli = { ...casos, consultarReglas: solicitud => { solicitudes.push(solicitud); return { exito: true, valor: {
    esquema: 2, proyecto: "/p", agente: "build", entradas: [], resumenEntradas: "", declaraciones: [], reglas: {}, cadena: [], ejesParciales: [], advertencias: [],
    matriz: { sujetos: [], filas: [], noObservados: [], motivos: [] },
  } }; } };
  const args = ["reglas", "--agente", "build", "--json"];
  const sin = ejecutar(args, {}, dobles);
  for (const opciones of [["--explicar"], ["--todo"], ["--explicar", "--todo"]]) expect(ejecutar([...args, ...opciones], {}, dobles)).toEqual(sin);
  expect(sin.codigo).toBe(0); expect(solicitudes).toHaveLength(4);
  for (const solicitud of solicitudes) expect(solicitud).toEqual({ proyecto: "/carpeta actual/proyecto", agente: "build", lanzadoPor: undefined });
});
function ejecutar(args: string[], presentacion: Partial<CanalesCli> = {}, dobles = casos) {
  let salida = "", error = "", llamadas = 0;
  const codigo = ejecutarCli(args, () => { llamadas++; return dobles; }, {
    versionHerramienta: "1.18.25", esConsola: false, carpetaActual: "/carpeta actual/proyecto", ...presentacion,
    escribirSalida: t => { salida += t; }, escribirError: t => { error += t; },
  });
  return { salida, error, codigo, llamadas };
}
describe("T5-23 L-1 L-5 formato inyectado", () => {
  test("consola estricta, opciones explicitas, pipe sin ANSI y minimo de ancho", () => {
    expect(ejecutar(["esquema"]).salida).toStartWith('{"esquema":2');
    expect(ejecutar(["esquema"], { esConsola: true }).salida).toContain("Respuesta completa: --json");
    expect(ejecutar(["esquema", "--json"], { esConsola: true }).salida).toBe(ejecutar(["esquema"]).salida);
    for (const ancho of [undefined, 1, 40, 70]) {
      const texto = ejecutar(["esquema", "--texto"], { ancho, colorHabilitado: true }).salida;
      expect(texto).toContain("rige.db"); expect(texto).not.toContain("\x1b");
      for (const linea of texto.trimEnd().split("\n")) expect(Array.from(linea).length).toBeLessThanOrEqual(Math.max(40, ancho ?? 100));
    }
    expect(ejecutar(["esquema"], { esConsola: true, colorHabilitado: false }).salida).not.toContain("\x1b");
    expect(ejecutar(["esquema"], { esConsola: true, colorHabilitado: true }).salida).toContain("\x1b[90m");
  });
});
describe("T5-23 L-6 L-7 precedencia", () => {
  const tabla = [
    { args: [], consola: false, canal: "error", texto: false, codigo: 2 },
    { args: [], consola: true, canal: "error", texto: true, codigo: 2 },
    { args: ["--help", "--invalida"], canal: "salida", texto: true, codigo: 0 },
    { args: ["valores", "--help", "--invalida"], canal: "salida", texto: true, codigo: 0 },
    { args: ["--texto", "--desconocida"], canal: "error", texto: true, codigo: 2 },
    { args: ["--json", "--texto"], canal: "error", texto: false, codigo: 2 },
    { args: ["otro"], canal: "error", texto: false, codigo: 2 },
    { args: ["--version"], canal: "salida", texto: true, codigo: 0 },
  ] as const;
  for (const fila of tabla) test(JSON.stringify(fila.args) + ("consola" in fila ? String(fila.consola) : ""), () => {
    const r = ejecutar([...fila.args], { esConsola: "consola" in fila && fila.consola });
    expect(r.codigo).toBe(fila.codigo); expect(r.llamadas).toBe(0);
    expect(r[fila.canal]).not.toBe("");
    expect(r[fila.canal === "error" ? "salida" : "error"]).toBe("");
    if (fila.texto) expect(r[fila.canal]).not.toStartWith("{");
    else expect(JSON.parse(r[fila.canal]).esquema).toBe(2);
  });
  test("ayuda general y dos ejemplos por comando, version reutilizada sin ensamblar", () => {
    for (const comando of ["valores", "permiso", "reglas", "agentes", "entradas", "hallazgos", "recientes", "comparar", "estado", "esquema", "servir"]) {
      const r = ejecutar([comando, "--help"]);
      expect(r.codigo).toBe(0); expect(r.llamadas).toBe(0);
      for (const seccion of ["Uso:", "Opciones:", "Ejemplos:"]) expect(r.salida).toContain(seccion);
      expect(r.salida.match(/\n  rige /g)).toHaveLength(2);
    }
    expect(ejecutar(["-h"]).salida).toContain("Uso:");
    expect(ejecutar(["--version"]).salida).toBe(`RIGE ${versionRige} · OpenCode 1.18.25\n`);
    expect(ejecutar(["--version", "--json"]).salida).toBe(JSON.stringify({ esquema: 2, versionRige, versionHerramienta: "1.18.25" }) + "\n");
  });
  test("texto conserva codigo, sugerencia y stack solo con depurar", () => {
    const almacen = { ...casos, describirAlmacen: () => ({ exito: false as const,
      error: { categoria: "uso" as const, codigo: "almacen-sin-esquema", mensaje: "Falta el almacén." } }) };
    const r = ejecutar(["estado", "--texto"], {}, almacen);
    expect(r.codigo).toBe(1); expect(r.error).toContain("Error: Falta el almacén.");
    expect(r.error).toContain("Probá: bun run rige -- esquema");
    for (const depurar of [[], ["--depurar"]]) {
      const fallo = ejecutar(["estado", "--texto", ...depurar]);
      expect(fallo.codigo).toBe(70); expect(fallo.error.includes("No consultar")).toBe(depurar.length > 0);
    }
  });
});
test("T5-23 L-9 carpeta actual inyectada; --proyecto vacio sigue siendo invalido", () => {
  const proyectos: string[] = [];
  const dobles = { ...casos, consultarValores: (proyecto: string) => { proyectos.push(proyecto); return { exito: false as const,
    error: { categoria: "uso" as const, codigo: "prueba", mensaje: "Registrado" } }; } };
  expect(ejecutar(["valores", "--agente", "build"], {}, dobles).codigo).toBe(1);
  expect(proyectos).toEqual(["/carpeta actual/proyecto"]);
  expect(ejecutar(["valores", "--agente", "build", "--proyecto", ""], {}, dobles).codigo).toBe(2);
});
