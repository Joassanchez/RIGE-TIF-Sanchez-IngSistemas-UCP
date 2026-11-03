import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { lanzar } from "../utilidades/subproceso";
import { validarEsquema } from "../utilidades/validar-esquema";

const copias: ReturnType<typeof copiarEscenario>[] = [];
afterEach(() => { for (const copia of copias.splice(0)) copia.borrar(); });
function preparar() {
  const copia = copiarEscenario("openchamber-doble");
  copias.push(copia);
  return copia;
}
const consultas = [
  ["valores", "--agente", "agent-1"],
  ["permiso", "--agente", "agent-1", "--herramienta", "bash", "--objetivo", "git status"],
  ["agentes"], ["entradas"], ["hallazgos"],
] as const;
async function validar(nombre: string, valor: unknown) {
  const esquema = await Bun.file(new URL(`../../esquemas/salida/${nombre}.json`, import.meta.url)).json();
  expect(validarEsquema(esquema, valor)).toEqual([]);
}
function ejecutar(copia: ReturnType<typeof preparar>, consulta: readonly string[], tiempos = true) {
  return lanzar(copia.raiz, [...consulta, "--proyecto", copia.proyecto, ...(tiempos ? ["--tiempos"] : [])]);
}

describe("RNF-07 CA-1.1", () => {
  test("duplica los componentes de referencia en 32 configuraciones legibles", () => {
    const copia = preparar();
    const archivos = [...new Bun.Glob("**/*").scanSync({ cwd: copia.proyecto, dot: true, onlyFiles: true })]
      .map(ruta => ruta.replaceAll("\\", "/")).sort();
    expect(archivos).toHaveLength(32);
    expect(archivos.every(ruta => ruta === ".opencode/opencode.json"
      || /^\.opencode\/(agent|commands)\/[^/]+\.md$/.test(ruta))).toBe(true);
    const agentes = archivos.filter(ruta => ruta.startsWith(".opencode/agent/") && ruta.endsWith(".md"));
    expect(agentes.sort()).toEqual(Array.from({ length: 11 }, (_, i) => `.opencode/agent/agent-${i + 2}.md`).sort());
    expect(archivos.filter(ruta => ruta.startsWith(".opencode/commands/") && ruta.endsWith(".md")).length).toBeGreaterThanOrEqual(18);
    const configuracion = JSON.parse(readFileSync(join(copia.proyecto, ".opencode/opencode.json"), "utf8"));
    expect(Object.keys(configuracion.agent)).toEqual(["agent-1"]);
    expect(Object.keys(configuracion.lsp)).toHaveLength(14);
    const entradas = ejecutar(copia, ["entradas"], false);
    expect(entradas.codigo).toBe(0);
    const leidas = JSON.parse(entradas.salida).entradas.filter((e: { condicion: string }) => e.condicion === "observada");
    expect(leidas).toHaveLength(32);
    expect(leidas.every((e: { legibilidad: string }) => e.legibilidad === "legible")).toBe(true);
    const permiso = ejecutar(copia, consultas[1], false);
    expect(permiso.codigo).toBe(0);
    expect(JSON.parse(permiso.salida)).toMatchObject({ decision: "allow", motivoSinDecision: null, determinante: expect.any(Number) });
  });
});

describe("RNF-07 CA-1.2", () => {
  test("admite tiempos en las cinco consultas y los rechaza antes de ensamblar esquema o servir", () => {
    const copia = preparar();
    for (const consulta of consultas) {
      const resultado = ejecutar(copia, consulta);
      expect(resultado.codigo).toBe(0);
      expect(resultado.error.trim().split("\n").filter(linea => "tiempos" in JSON.parse(linea))).toHaveLength(1);
    }
    for (const comando of ["esquema", "servir"]) {
      const resultado = lanzar(copia.raiz, [comando, "--tiempos"]);
      expect(resultado.codigo).toBe(2);
      expect(resultado.salida).toBe("");
      expect(JSON.parse(resultado.error).error.codigo).toBe("argumentos-invalidos");
    }
  });
});

describe("RNF-07 CA-1.3", () => {
  test("conserva stdout byte a byte para cada consulta", () => {
    const copia = preparar();
    for (const consulta of consultas) {
      const normal = ejecutar(copia, consulta, false);
      const medida = ejecutar(copia, consulta);
      expect(normal.codigo).toBe(0);
      expect(medida.codigo).toBe(0);
      expect(medida.salida).toBe(normal.salida);
    }
  });
});

describe("RNF-07 CA-1.4", () => {
  test("publica respuestas y tiempos conformes a sus esquemas, despues de las advertencias", async () => {
    const copia = preparar();
    for (const consulta of consultas.slice(0, 2)) {
      for (const conAdvertencias of [false, true]) {
        const resultado = conAdvertencias
          ? lanzar(copia.raiz, [...consulta, "--proyecto", copia.proyecto, "--tiempos"], { PATH: join(copia.raiz, "sin-binarios") })
          : ejecutar(copia, consulta);
        expect(resultado.codigo).toBe(0);
        await validar(consulta[0]!, JSON.parse(resultado.salida));
        const lineas = resultado.error.trim().split("\n").map(linea => JSON.parse(linea));
        await validar("tiempos", lineas.at(-1));
        if (conAdvertencias) expect(lineas.length).toBeGreaterThanOrEqual(3);
        for (const advertencia of lineas.slice(0, -1)) await validar("advertencia", advertencia);
      }
    }
  });
});

describe("RNF-07 CA-1.5", () => {
  test("mide fases positivas en subprocesos reales sin exceder el total de pared", () => {
    const copia = preparar();
    for (const consulta of consultas) {
      const resultado = ejecutar(copia, consulta);
      expect(resultado.codigo).toBe(0);
      const { tiempos } = JSON.parse(resultado.error.trim().split("\n").at(-1)!);
      for (const nombre of ["arranqueMs", "lecturaMs", "resolucionMs", "salidaMs", "totalMs"]) {
        expect(Number.isFinite(tiempos[nombre])).toBe(true);
        expect(tiempos[nombre]).toBeGreaterThan(0);
      }
      expect(tiempos.totalMs).toBeGreaterThanOrEqual(tiempos.lecturaMs + tiempos.resolucionMs);
    }
  });
});
