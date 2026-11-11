import { expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync, cpSync, rmSync, symlinkSync } from "node:fs";
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

// Árbol completo, nunca módulos del candidato en la referencia. Sin normalizar bytes.
const referencia = "f085d3d";
const raiz = resolve(import.meta.dir, "../..");
async function probarReferencia(consultarHistoria: boolean): Promise<void> {
  const temporal = realpathSync.native(mkdtempSync(join(tmpdir(), "rige-t523-ref-")));
  const e = prepararConsultas("v1-precedencia");
  const env: Record<string, string> = { ...crearEntornoAislado(e.raiz, process.env), ...e.variables,
    TEMP: temporal, TMP: temporal, TMPDIR: temporal, RIGE_PUERTO: String(puertoLibre()) };
  const ejecutar = (programa: string, args: string[], extra = {}, precarga = false) => Bun.spawnSync([
    process.execPath, ...(precarga ? ["--preload", join(temporal, "fallar.ts")] : []), programa, ...args,
  ], { cwd: e.proyecto, env: { ...env, ...extra }, stdout: "pipe", stderr: "pipe", timeout: 10000 });
  const archivo = join(temporal, "referencia.tar");
  const copia = join(temporal, "arbol");
  mkdirSync(copia);
  try {
    const congelada = readFileSync(join(raiz, "pruebas/datos/cli-f085d3d.bun.txt"));
    const procedencia = JSON.parse(readFileSync(join(raiz, "pruebas/datos/cli-f085d3d.json"), "utf8"));
    expect(procedencia.commit).toBe("f085d3d5b999a82300c7d5724703beb4f16f7d30");
    expect(createHash("sha256").update(congelada).digest("hex")).toBe(procedencia.sha256);
    const programaCongelado = join(temporal, "congelada/paquetes/rige/arranque/rige.js");
    mkdirSync(resolve(programaCongelado, ".."), { recursive: true });
    writeFileSync(programaCongelado, congelada);
    expect(Bun.spawnSync([process.execPath, "--version"]).stdout.toString().trim()).toBe("1.3.14");
    const opcionesGit = ["-c", `safe.directory=${realpathSync.native(resolve(raiz, "..")).replaceAll("\\", "/")}`];
    const historia = consultarHistoria && Bun.spawnSync(["git", ...opcionesGit, "cat-file", "-e", `${referencia}^{commit}`], { cwd: resolve(raiz, ".."), env, stderr: "pipe" }).exitCode === 0;
    if (historia) {
      const archivado = Bun.spawnSync(["git", ...opcionesGit, "archive", "--format=tar", referencia], { cwd: resolve(raiz, ".."), stdout: "pipe", stderr: "pipe", env });
      expect(archivado.exitCode, archivado.stderr.toString()).toBe(0);
      writeFileSync(archivo, archivado.stdout);
      const extraido = Bun.spawnSync([process.platform === "win32" ? `${process.env.SystemRoot}\\System32\\tar.exe` : "tar", "-xf", archivo, "-C", copia], { env, stderr: "pipe" });
      expect(extraido.exitCode, extraido.stderr.toString()).toBe(0);
      // Dependencia de ejecución exacta ya instalada; sin red ni enlaces al código candidato.
      const modulos = join(copia, "src/node_modules");
      mkdirSync(join(modulos, "@rige"), { recursive: true });
      const biblioteca = realpathSync.native(join(raiz, "paquetes/opencode/node_modules/jsonc-parser"));
      expect(JSON.parse(readFileSync(join(biblioteca, "package.json"), "utf8")).version).toBe("3.3.1");
      cpSync(biblioteca, join(modulos, "jsonc-parser"), { recursive: true });
      for (const nombre of ["nucleo", "opencode", "rige"]) symlinkSync(join(copia, "src/paquetes", nombre), join(modulos, "@rige", nombre), process.platform === "win32" ? "junction" : "dir");
    }
    const anterior = historia ? join(copia, "src/paquetes/rige/arranque/rige.ts") : programaCongelado;
    const actual = join(raiz, "paquetes/rige/arranque/rige.ts");
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
    writeFileSync(join(temporal, "fallar.ts"), `import { mock } from "bun:test";
      const fs = await import("node:fs");
      const leer = fs.readFileSync;
      mock.module("node:fs", () => ({ ...fs, readFileSync: (...args) => {
        if (String(args[0]).endsWith("opencode.jsonc")) throw new Error("FALLO-T523");
        return leer(...args);
      } }));`);
    const consulta = (comando: string, ...args: string[]) => [comando, "--proyecto", e.proyecto, ...args];
    const casos = [
      { args: consulta("valores", "--agente", "build") },
      { args: consulta("permiso", "--agente", "build", "--sujeto", "read", "--objetivo", "a.ts") },
      { args: consulta("permiso", "--agente", "build", "--herramienta", "bash", "--objetivo", "ls | cat") },
      { args: consulta("permiso", "--agente", "build", "--sujeto", "read", "--objetivo", "a.ts", "--explicar") },
      ...["reglas", "agentes", "entradas", "hallazgos"].map(c => ({ args: consulta(c, ...(c === "reglas" ? ["--agente", "build"] : [])) })),
      { args: ["recientes"] }, { args: ["comparar", "--desde", "1", "--hasta", "2", "--agente", "build"] },
      { args: ["esquema"] },
      { args: consulta("valores", "--agente", "inexistente"), codigo: 1 },
      { args: ["desconocido"], codigo: 2 },
      { args: consulta("valores", "--agente", "build"), precarga: true, codigo: 70 },
      { args: consulta("entradas"), extra: { PATH: join(temporal, "sin-opencode") } },
    ];
    // Captura independiente completa antes de ejecutar ningún candidato.
    const capturas = casos.map(c => { restaurar(); const captura = ejecutar(anterior, c.args, "extra" in c ? c.extra : {}, "precarga" in c && c.precarga);
      expect(captura.exitCode).toBe("codigo" in c ? c.codigo : 0); return captura; });
    expect(JSON.parse(capturas[1]!.stdout.toString()).decision).not.toBeNull();
    expect(JSON.parse(capturas[2]!.stdout.toString()).decision).toBeNull();
    expect(JSON.parse(capturas[3]!.stdout.toString()).explicacion).not.toBeNull();
    expect(capturas[14]!.stderr.length).toBeGreaterThan(0);
    if (historia) for (const [i, c] of casos.entries()) {
      restaurar();
      const captura = ejecutar(programaCongelado, c.args, "extra" in c ? c.extra : {}, "precarga" in c && c.precarga);
      expect({ codigo: captura.exitCode, salida: captura.stdout, error: captura.stderr }, "Referencia congelada: " + c.args.join(" "))
        .toEqual({ codigo: capturas[i]!.exitCode, salida: capturas[i]!.stdout, error: capturas[i]!.stderr });
    }
    for (const [i, c] of casos.entries()) {
      const previo = capturas[i]!;
      expect(previo.exitCode).toBe("codigo" in c ? c.codigo : 0);
      for (const formato of [[], ["--json"]]) {
        restaurar();
        const nuevo = ejecutar(actual, [...c.args, ...formato], "extra" in c ? c.extra : {}, "precarga" in c && c.precarga);
        expect({ codigo: nuevo.exitCode, salida: nuevo.stdout, error: nuevo.stderr }, c.args.join(" ")).toEqual({ codigo: previo.exitCode, salida: previo.stdout, error: previo.stderr });
      }
    }
    const medido = ejecutar(actual, [...casos[0]!.args, "--tiempos"]);
    expect(medido.stdout).toEqual(capturas[0]!.stdout);
    expect(JSON.parse(medido.stderr.toString()).tiempos.totalMs).toBeGreaterThan(0);
    const depurado = ejecutar(actual, [...casos[0]!.args, "--depurar"], {}, true);
    expect(depurado.stdout).toEqual(capturas[13]!.stdout);
    expect(JSON.parse(depurado.stderr.toString()).error.stack).toContain("FALLO-T523");
    // Servir usa el mismo puerto libre y el mismo estado restaurado. Solo se mata el hijo creado aquí.
    const iniciar = async (programa: string) => {
      restaurar();
      const p = Bun.spawn([process.execPath, programa, "servir"], { cwd: e.proyecto, env, stdout: "pipe", stderr: "pipe" });
      const lector = p.stdout.getReader();
      const limite = setTimeout(() => p.kill(), 5000);
      try { const bytes = (await lector.read()).value; expect(bytes).toBeDefined(); return Buffer.from(bytes!); }
      finally { clearTimeout(limite); lector.releaseLock(); p.kill(); await p.exited; expect(await new Response(p.stderr).text()).toBe(""); }
    };
    const servidorReferencia = await iniciar(anterior);
    if (historia) expect(await iniciar(programaCongelado)).toEqual(servidorReferencia);
    expect(await iniciar(actual)).toEqual(servidorReferencia);
  } finally { e.borrar(); borrarTemporal(temporal); }
}
test("T5-23 L-2 buffers heredados y --json contra git archive f085d3d, Bun 1.3.14", () => probarReferencia(true), 120000);
test("T5-23 L-2 referencia independiente en checkout sin historial", () => probarReferencia(false), 30000);
