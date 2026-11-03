import { describe, expect, test } from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { borrarTemporal } from "../utilidades/borrar-temporal";
import { copiarEscenario } from "../utilidades/escenario";
import { entornoDeReferencia, type ReferenciaEntorno } from "../utilidades/entorno-referencia";

const raiz = resolve(import.meta.dir, "../..");
const rutaRige = "paquetes/rige/arranque/rige.ts";
const rutaPreload = "./pruebas/utilidades/sin-red-preload.ts";

interface ConsultaManifiesto {
  readonly id: string;
  readonly agente: string;
  readonly objetivo: string;
  readonly herramienta?: string;
  readonly sujeto?: string;
  readonly lanzadoPor?: string;
}

interface EscenarioManifiesto {
  readonly id: string;
  readonly referencia: string | null;
  readonly agentes: readonly string[];
  readonly consultas?: readonly ConsultaManifiesto[];
  readonly fallaEsperada?: boolean;
}

interface Manifiesto {
  readonly escenarios: readonly EscenarioManifiesto[];
}

const herramientasObjetivo = new Set([
  "read", "edit", "write", "apply_patch", "bash", "glob", "grep", "webfetch", "task", "todowrite", "skill",
]);

function comandosEscenario(escenario: EscenarioManifiesto, dirProyecto: string, dirRaiz: string): string[][] {
  const comandos: string[][] = [];
  if (escenario.fallaEsperada) {
    comandos.push(["entradas", "--proyecto", dirProyecto]);
    comandos.push(["hallazgos", "--proyecto", dirProyecto]);
    return comandos;
  }
  comandos.push(["valores", "--proyecto", dirProyecto, "--agente", escenario.agentes[0]!]);
  comandos.push(["agentes", "--proyecto", dirProyecto]);
  comandos.push(["entradas", "--proyecto", dirProyecto]);
  comandos.push(["hallazgos", "--proyecto", dirProyecto, "--explicar"]);
  if (escenario.consultas && escenario.consultas.length > 0) {
    for (const c of escenario.consultas) {
      const objetivo = c.objetivo.replaceAll("<PROYECTO>", dirProyecto).replaceAll("<RAIZ>", dirRaiz);
      const args = ["permiso", "--proyecto", dirProyecto, "--agente", c.agente, "--objetivo", objetivo];
      if (c.lanzadoPor) {
        args.push("--lanzado-por", c.lanzadoPor);
      }
      if (c.herramienta && herramientasObjetivo.has(c.herramienta)) {
        args.push("--herramienta", c.herramienta);
      } else if (c.sujeto) {
        args.push("--sujeto", c.sujeto);
      }
      comandos.push(args);
    }
  }
  return comandos;
}

describe("T3-09 R-1", () => {
  test("RNF-05 CA-2 (en proceso, todas las plataformas): con red interceptada, el análisis completo de los tres escenarios da salidas y códigos idénticos a los de la corrida normal", () => {
    const manifiesto = JSON.parse(readFileSync(join(raiz, "pruebas/escenarios/MANIFIESTO.json"), "utf8")) as Manifiesto;
    const escenarios = ["v2-decision", "v3-sustituciones", "v3-sin-efecto"];

    for (const id of escenarios) {
      const ref = JSON.parse(readFileSync(join(raiz, "pruebas/escenarios", id, "REFERENCIA.json"), "utf8")) as ReferenciaEntorno & {
        readonly procedencia: { readonly directorio: string; readonly git?: "raiz" | "proyecto" | "sintetico" | "ninguno" };
      };
      const copia = copiarEscenario(id, { git: ref.procedencia.git ?? "raiz" });
      try {
        const env = entornoDeReferencia(ref, copia);
        const gitModo = ref.procedencia.git ?? "raiz";
        if (gitModo === "raiz" || gitModo === "proyecto") {
          const raizGit = gitModo === "proyecto" ? copia.proyecto : copia.raiz;
          const gitInit = Bun.spawnSync(["git", "init", "--quiet", "--initial-branch=main"], { cwd: raizGit, env, timeout: 10000 });
          if (gitInit.exitCode !== 0) throw new Error(`git init fallo: ${gitInit.stderr.toString()}`);
        }
        const dirProyecto = join(copia.raiz, ref.procedencia.directorio);
        const entrada = manifiesto.escenarios.find((e) => e.id === id);
        if (!entrada) throw new Error(`Escenario ${id} no encontrado en MANIFIESTO.json`);
        const listaComandos = comandosEscenario(entrada, dirProyecto, copia.raiz);

        for (const cmd of listaComandos) {
          const normal = Bun.spawnSync([process.execPath, rutaRige, ...cmd], {
            cwd: raiz,
            env,
            stdout: "pipe",
            stderr: "pipe",
            timeout: 30000,
          });
          const sinRed = Bun.spawnSync([process.execPath, "--preload", rutaPreload, rutaRige, ...cmd], {
            cwd: raiz,
            env,
            stdout: "pipe",
            stderr: "pipe",
            timeout: 30000,
          });

          expect(sinRed.exitCode).toBe(normal.exitCode);
          expect(sinRed.stdout.toString()).toBe(normal.stdout.toString());
          expect(sinRed.stderr.toString()).toBe(normal.stderr.toString());
        }
      } finally {
        copia.borrar();
      }
    }
  }, 120000);
});

describe("T3-09 R-2", () => {
  test("fetch lanza bajo el preload", () => {
    const res = Bun.spawnSync([
      process.execPath,
      "--preload", rutaPreload,
      "-e",
      'try { fetch("http://127.0.0.1:1"); process.exit(0); } catch (e) { process.stderr.write(String(e)); process.exit(42); }',
    ], { cwd: raiz, stdout: "pipe", stderr: "pipe", timeout: 10000 });
    expect(res.exitCode).toBe(42);
    expect(res.stderr.toString()).toMatch(/red/i);
  });

  test("WebSocket lanza bajo el preload", () => {
    const res = Bun.spawnSync([
      process.execPath,
      "--preload", rutaPreload,
      "-e",
      'try { new WebSocket("ws://127.0.0.1:1"); process.exit(0); } catch (e) { process.stderr.write(String(e)); process.exit(42); }',
    ], { cwd: raiz, stdout: "pipe", stderr: "pipe", timeout: 10000 });
    expect(res.exitCode).toBe(42);
    expect(res.stderr.toString()).toMatch(/red/i);
  });

  test("net.connect lanza bajo el preload", () => {
    const res = Bun.spawnSync([
      process.execPath,
      "--preload", rutaPreload,
      "-e",
      'try { const net = await import("node:net"); net.connect(80, "127.0.0.1"); process.exit(0); } catch (e) { process.stderr.write(String(e)); process.exit(42); }',
    ], { cwd: raiz, stdout: "pipe", stderr: "pipe", timeout: 10000 });
    expect(res.exitCode).toBe(42);
    expect(res.stderr.toString()).toMatch(/red/i);
  });

  test("tls.connect lanza bajo el preload", () => {
    const res = Bun.spawnSync([
      process.execPath,
      "--preload", rutaPreload,
      "-e",
      'try { const tls = await import("node:tls"); tls.connect(443, "127.0.0.1"); process.exit(0); } catch (e) { process.stderr.write(String(e)); process.exit(42); }',
    ], { cwd: raiz, stdout: "pipe", stderr: "pipe", timeout: 10000 });
    expect(res.exitCode).toBe(42);
    expect(res.stderr.toString()).toMatch(/red/i);
  });
});

describe("T3-09 R-3", () => {
  const tieneStrace = process.platform === "linux" && Bun.which("strace") !== null;
  const pruebaStrace = tieneStrace ? test : test.skip;

  pruebaStrace("RNF-05 CA-1 (Linux con strace): sin-red --strace sobre los tres escenarios cuenta cero connect AF_INET/AF_INET6", () => {
    const proc = Bun.spawnSync([
      process.execPath,
      "herramientas/sin-red.ts",
      "--strace",
      "--escenario", "v2-decision",
      "--escenario", "v3-sustituciones",
      "--escenario", "v3-sin-efecto",
    ], {
      cwd: raiz,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120000,
    });
    expect(proc.exitCode).toBe(0);
    const salida = proc.stdout.toString();
    expect(salida).toContain("AF_INET: 0");
    expect(salida).toContain("AF_INET6: 0");
  });
});

describe("T3-09 R-4", () => {
  test("sin-red --salida seguido de --comparar termina con codigo 0", () => {
    const temporal = join(tmpdir(), `rige-sin-red-ok-${Date.now()}.json`);
    try {
      const procSalida = Bun.spawnSync([
        process.execPath,
        "herramientas/sin-red.ts",
        "--salida", temporal,
        "--escenario", "v2-decision",
      ], {
        cwd: raiz,
        stdout: "pipe",
        stderr: "pipe",
        timeout: 30000,
      });
      expect(procSalida.exitCode).toBe(0);

      const procComparar = Bun.spawnSync([
        process.execPath,
        "herramientas/sin-red.ts",
        "--comparar", temporal,
        "--escenario", "v2-decision",
      ], {
        cwd: raiz,
        stdout: "pipe",
        stderr: "pipe",
        timeout: 30000,
      });
      expect(procComparar.exitCode).toBe(0);
    } finally {
      borrarTemporal(temporal);
    }
  });

  test("sin-red --comparar: una salida alterada en el archivo de referencia da código 1 y nombra el escenario y el subcomando", () => {
    const temporal = join(tmpdir(), `rige-sin-red-alterado-${Date.now()}.json`);
    const referenciaAlterada = [
      {
        escenario: "v2-decision",
        subcomando: "valores",
        codigo: 0,
        sha256: "0000000000000000000000000000000000000000000000000000000000000000",
      },
    ];
    writeFileSync(temporal, JSON.stringify(referenciaAlterada, null, 2), "utf8");
    try {
      const proc = Bun.spawnSync([
        process.execPath,
        "herramientas/sin-red.ts",
        "--comparar", temporal,
        "--escenario", "v2-decision",
      ], {
        cwd: raiz,
        stdout: "pipe",
        stderr: "pipe",
        timeout: 30000,
      });
      expect(proc.exitCode).toBe(1);
      const salidaTotal = proc.stdout.toString() + "\n" + proc.stderr.toString();
      expect(salidaTotal).toContain("v2-decision");
      expect(salidaTotal).toContain("valores");
    } finally {
      borrarTemporal(temporal);
    }
  });
});
