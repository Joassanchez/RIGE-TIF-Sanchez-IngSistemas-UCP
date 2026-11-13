import { expect, test } from "bun:test";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { puertoLibre } from "../utilidades/subproceso";
import { borrarTemporal } from "../utilidades/borrar-temporal";
import { AlmacenSqlite } from "../../paquetes/rige/adaptadores/almacen-sqlite/esquema";
import { RepositorioResolucionesSqlite } from "../../paquetes/rige/adaptadores/almacen-sqlite/resoluciones";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { resolverProyecto } from "../../paquetes/rige/aplicacion/casos-uso/resolver-proyecto";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { versionRige } from "../../paquetes/rige/aplicacion/respuestas/estado";

const raiz = resolve(import.meta.dir, "../..");
const rutaArchivo = join(raiz, "pruebas/datos/salidas-5e8da06-t5-29.json");

function normalizarSalida(texto: string, rutas: string[]): string {
  let res = texto;
  const variantes: string[] = [];
  for (const r of rutas) {
    if (!r) continue;
    const nativa = r;
    const barras = r.replaceAll("\\", "/");
    const escapada = r.replaceAll("\\", "\\\\");
    variantes.push(escapada, nativa, barras);
  }
  const unicas = [...new Set(variantes)].sort((a, b) => b.length - a.length);
  for (const v of unicas) {
    res = res.replaceAll(v, "<TEMP>");
  }
  try {
    const objOrig: unknown = JSON.parse(texto);
    if (
      objOrig &&
      typeof objOrig === "object" &&
      "resumenEntradas" in objOrig &&
      typeof objOrig.resumenEntradas === "string"
    ) {
      res = res.replaceAll(objOrig.resumenEntradas, "<RESUMEN>");
    }
    const obj = JSON.parse(res) as { vias?: Array<Record<string, unknown>> } | null;
    if (
      obj &&
      typeof obj === "object" &&
      Array.isArray(obj.vias) &&
      obj.vias.some((v) => v && typeof v === "object" && Array.isArray(v.revisados))
    ) {
      for (const via of obj.vias) {
        if (via && typeof via === "object" && Array.isArray(via.revisados)) {
          via.revisados = via.revisados.filter(
            (entrada: unknown) =>
              typeof entrada !== "string" ||
              !(entrada.includes("/") || entrada.includes("\\")) ||
              entrada.startsWith("<TEMP>"),
          );
        }
      }
      res = JSON.stringify(obj) + (texto.endsWith("\n") ? "\n" : "");
    }
  } catch {}
  return res;
}

test("T5-29 instantánea de salidas CLI para características de T5-23 (base 5e8da06)", async () => {
  const temporal = realpathSync.native(mkdtempSync(join(tmpdir(), "rige-t529-inst-")));
  const e = prepararConsultas("v1-precedencia");
  try {
    const env: Record<string, string> = { ...crearEntornoAislado(e.raiz, process.env), ...e.variables,
      TEMP: temporal, TMP: temporal, TMPDIR: temporal, RIGE_PUERTO: String(puertoLibre()) };
    const actual = join(raiz, "paquetes/rige/arranque/rige.ts");
    const ejecutar = (args: string[]) => Bun.spawnSync([
      process.execPath, actual, ...args,
    ], { cwd: e.proyecto, env, stdout: "pipe", stderr: "pipe", timeout: 10000 });

    const almacen = env.RIGE_ALMACEN!;
    expect(new AlmacenSqlite(almacen, { existe: existsSync }).preparar().exito).toBe(true);
    const entorno = new EntornoLecturaSistema({ entorno: env, plataforma: process.platform });
    const resoluciones = new RepositorioResolucionesSqlite(almacen, { existe: existsSync }, versionRige);
    for (const [i, temperatura] of [0.3, 0.7].entries()) {
      writeFileSync(join(e.proyecto, "opencode.jsonc"), JSON.stringify({ agent: { build: { temperature: temperatura } } }));
      expect(resolverProyecto({ adaptador: adaptadorOpenCode, entorno, rutas: entorno, resoluciones,
        reloj: { ahora: () => `2026-11-01T00:00:0${i}.000Z` } }, e.proyecto)).toEqual({ exito: true, valor: { id: i + 1 } });
    }
    const semilla = join(temporal, "semilla");
    cpSync(almacen, semilla, { recursive: true });
    const restaurar = () => { rmSync(almacen, { recursive: true }); cpSync(semilla, almacen, { recursive: true }); };

    const definicionesCasos = [
      // R-1
      { id: "R-1", argumentos: ["estado"] },
      // R-4
      { id: "R-4-valores-todo", argumentos: ["valores", "--proyecto", "<PROYECTO>", "--agente", "build", "--todo"] },
      { id: "R-4-entradas-todo", argumentos: ["entradas", "--proyecto", "<PROYECTO>", "--todo"] },
      { id: "R-4-reglas-todo", argumentos: ["reglas", "--proyecto", "<PROYECTO>", "--agente", "build", "--todo"] },
      // R-7
      { id: "R-7-help", argumentos: ["--help"] },
      { id: "R-7-valores-help", argumentos: ["valores", "--help"] },
      { id: "R-7-version", argumentos: ["--version"] },
      { id: "R-7-version-json", argumentos: ["--version", "--json"] },
      // R-6 (mensajes actualizados en T5-23)
      { id: "R-6-json-texto", argumentos: ["--json", "--texto"] },
      { id: "R-6-valores-sin-agente", argumentos: ["valores", "--proyecto", "<PROYECTO>"] },
      { id: "R-6-permiso-sujeto-herramienta", argumentos: ["permiso", "--proyecto", "<PROYECTO>", "--agente", "build", "--sujeto", "read", "--herramienta", "bash", "--objetivo", "a.ts"] },
    ];

    const rutasNormalizacion = [e.raiz, temporal];
    if (env.HOME && !env.HOME.startsWith(e.raiz)) rutasNormalizacion.push(env.HOME);

    if (process.env.RIGE_CAPTURA === "1") {
      console.warn("RIGE_CAPTURA=1: capturando instantánea, no se comparan salidas.");
      const capturados = [];
      for (const def of definicionesCasos) {
        restaurar();
        const args = def.argumentos.map(a => a === "<PROYECTO>" ? e.proyecto : a);
        const r = ejecutar(args);
        const stdoutNorm = normalizarSalida(r.stdout.toString(), rutasNormalizacion);
        const stderrNorm = normalizarSalida(r.stderr.toString(), rutasNormalizacion);
        const shaStdout = createHash("sha256").update(stdoutNorm).digest("hex");
        const shaStderr = createHash("sha256").update(stderrNorm).digest("hex");
        capturados.push({
          id: def.id,
          argumentos: def.argumentos,
          codigo: r.exitCode,
          sha256: {
            [process.platform]: {
              stdout: shaStdout,
              stderr: shaStderr,
            },
          },
        });
      }
      const resultado = {
        procedencia: {
          commit: "5e8da06",
          tarea: "T5-29",
          base: "5e8da06",
          bun: "1.3.14",
        },
        casos: capturados,
      };
      console.log("===CAPTURA_INICIO===");
      console.log(JSON.stringify(resultado, null, 2));
      console.log("===CAPTURA_FIN===");
      return;
    }

    const archivoInstantanea = JSON.parse(readFileSync(rutaArchivo, "utf8")) as {
      casos: { id: string; argumentos: string[]; codigo: number; sha256: Record<string, { stdout: string; stderr: string }> }[];
    };

    expect(archivoInstantanea.casos).toHaveLength(definicionesCasos.length);
    const plataforma = process.platform as "win32" | "linux";

    for (const [i, def] of definicionesCasos.entries()) {
      const esperado = archivoInstantanea.casos[i]!;
      expect(esperado.id).toBe(def.id);
      const esperadoPlat = esperado.sha256[plataforma];
      if (!esperadoPlat) {
        throw new Error(`Faltan los resúmenes para la plataforma ${plataforma} en el caso ${esperado.id}. Ejecutá con RIGE_CAPTURA=1 en ${plataforma} para capturarlos.`);
      }

      restaurar();
      const args = def.argumentos.map(a => a === "<PROYECTO>" ? e.proyecto : a);
      const actualRes = ejecutar(args);
      const stdoutNorm = normalizarSalida(actualRes.stdout.toString(), rutasNormalizacion);
      const stderrNorm = normalizarSalida(actualRes.stderr.toString(), rutasNormalizacion);
      const shaStdout = createHash("sha256").update(stdoutNorm).digest("hex");
      const shaStderr = createHash("sha256").update(stderrNorm).digest("hex");

      const mensajeFalla = `Falla en caso ${def.id} (${def.argumentos.join(" ")}):
Esperado: codigo ${esperado.codigo}, shaStdout ${esperadoPlat.stdout}, shaStderr ${esperadoPlat.stderr}
Obtenido: codigo ${actualRes.exitCode}, shaStdout ${shaStdout}, shaStderr ${shaStderr}
stdout normalizado:
${stdoutNorm}
stderr normalizado:
${stderrNorm}`;

      expect({
        codigo: actualRes.exitCode,
        shaStdout,
        shaStderr,
      }, mensajeFalla).toEqual({
        codigo: esperado.codigo,
        shaStdout: esperadoPlat.stdout,
        shaStderr: esperadoPlat.stderr,
      });
    }
  } finally {
    e.borrar();
    borrarTemporal(temporal);
  }
}, 30000);
