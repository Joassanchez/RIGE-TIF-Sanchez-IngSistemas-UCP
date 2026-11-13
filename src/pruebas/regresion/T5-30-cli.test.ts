import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { lanzar } from "../utilidades/subproceso";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { borrarTemporal } from "../utilidades/borrar-temporal";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";

const raiz = resolve(import.meta.dir, "../..");
const rutaSalidas = join(raiz, "pruebas/datos/salidas-T5-30.json");

const temporales: string[] = [];
function escenario() {
  const temporal = mkdtempSync(join(tmpdir(), "rige-t530-"));
  temporales.push(temporal);
  return temporal;
}

afterEach(() => {
  for (const t of temporales.splice(0)) borrarTemporal(t);
});

describe("S-3", () => {
  test("consulta de proyecto con RIGE_PUERTO=abc en el entorno no lee la configuracion y responde igual", () => {
    const temporal = escenario();
    const e = prepararConsultas("v1-precedencia");
    try {
      const argumentos = ["valores", "--proyecto", e.proyecto, "--agente", "build"];
      const conInvalido = lanzar(temporal, argumentos, { RIGE_PUERTO: "abc" });
      const conValido = lanzar(temporal, argumentos);
      expect(conInvalido.codigo).toBe(0);
      expect(conInvalido.codigo).toBe(conValido.codigo);
      expect(conInvalido.salida).toBe(conValido.salida);
      expect(conInvalido.error).toBe(conValido.error);
    } finally {
      e.borrar();
    }
  });
});

describe("S-4", () => {
  test("estado, esquema, recientes, comparar y servir con RIGE_PUERTO=abc devuelven configuracion-invalida y codigo 1", () => {
    const temporal = escenario();
    const casos = [
      ["estado"],
      ["esquema"],
      ["recientes"],
      ["comparar", "--desde", "1", "--hasta", "2"],
      ["servir"],
    ];
    for (const args of casos) {
      const resultado = lanzar(temporal, args, { RIGE_PUERTO: "abc" });
      expect(resultado.codigo).toBe(1);
      expect(resultado.salida).toBe("");
      const error = JSON.parse(resultado.error);
      expect(error).toEqual({
        esquema: 2,
        error: {
          codigo: "configuracion-invalida",
          mensaje: expect.stringContaining("RIGE_PUERTO"),
        },
      });
      expect(resultado.error).toBe(JSON.stringify(error) + "\n");
    }
  });
});

describe("S-5", () => {
  test("las capturas de salidas-T5-30.json coinciden exactamente", () => {
    const archivoInstantanea = JSON.parse(readFileSync(rutaSalidas, "utf8")) as {
      casos: { id: string; argumentos: string[]; codigo: number; stdout: string; stderr: string }[];
    };

    function normalizarSalida(texto: string): string {
      let res = texto;
      const rutas = [raiz];
      for (const r of rutas) {
        if (!r) continue;
        const nativa = r;
        const barras = r.replaceAll("\\", "/");
        const escapada = r.replaceAll("\\", "\\\\");
        for (const v of [escapada, nativa, barras]) {
          res = res.replaceAll(v, "<TEMP>");
        }
      }
      return res;
    }

    const actual = resolve(raiz, "paquetes/rige/arranque/rige.ts");

    for (const c of archivoInstantanea.casos) {
      const r = Bun.spawnSync([process.execPath, actual, ...c.argumentos], {
        stdout: "pipe",
        stderr: "pipe",
      });
      const stdoutNorm = normalizarSalida(r.stdout.toString());
      const stderrNorm = normalizarSalida(r.stderr.toString());
      expect({
        id: c.id,
        codigo: r.exitCode,
        stdout: stdoutNorm,
        stderr: stderrNorm,
      }).toEqual({
        id: c.id,
        codigo: c.codigo,
        stdout: c.stdout,
        stderr: c.stderr,
      });
    }
  });
});

describe("S-6", () => {
  test("valores con --depurar y falla interna inyectada mantiene codigo 70 y stack en texto y JSON", () => {
    const temporal = escenario();
    const e = prepararConsultas("v1-precedencia");
    try {
      const archivoMock = join(temporal, "fallar-s6.ts");
      writeFileSync(archivoMock, `import { mock } from "bun:test";
const fs = await import("node:fs");
const leer = fs.readFileSync;
mock.module("node:fs", () => ({ ...fs, readFileSync: (...args: any[]) => {
  if (String(args[0]).endsWith("opencode.jsonc")) throw new Error("FALLO-S6-TEST");
  return leer(...args);
} }));`);

      const actual = resolve(raiz, "paquetes/rige/arranque/rige.ts");
      const env = { ...crearEntornoAislado(temporal, process.env), ...e.variables };

      // 1) Formato JSON
      const resJson = Bun.spawnSync([
        process.execPath, "--preload", archivoMock, actual,
        "valores", "--proyecto", e.proyecto, "--agente", "build", "--depurar", "--json",
      ], { env, stdout: "pipe", stderr: "pipe" });

      expect(resJson.exitCode).toBe(70);
      expect(resJson.stdout.toString()).toBe("");
      const errorJson = JSON.parse(resJson.stderr.toString());
      expect(errorJson).toEqual({
        esquema: 2,
        error: {
          codigo: "interno",
          mensaje: "Falla interna de RIGE.",
          stack: expect.stringContaining("FALLO-S6-TEST"),
        },
      });

      // 2) Formato texto
      const resTexto = Bun.spawnSync([
        process.execPath, "--preload", archivoMock, actual,
        "valores", "--proyecto", e.proyecto, "--agente", "build", "--depurar", "--texto",
      ], { env, stdout: "pipe", stderr: "pipe" });

      expect(resTexto.exitCode).toBe(70);
      expect(resTexto.stdout.toString()).toBe("");
      const stderrTexto = resTexto.stderr.toString();
      expect(stderrTexto).toContain("Error: Falla interna de RIGE.");
      expect(stderrTexto).toContain("FALLO-S6-TEST");
    } finally {
      e.borrar();
    }
  });
});
