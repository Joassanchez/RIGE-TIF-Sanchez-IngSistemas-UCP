import { expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync, cpSync, rmSync } from "node:fs";
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

// Referencia única: ejecutable congelado cli-f085d3d.bun.txt del commit f085d3d5b999a82300c7d5724703beb4f16f7d30 (T5-22),
// regenerado desde git archive en un directorio temporal con jsonc-parser 3.3.1 y enlaces de workspace mediante
// `bun build ./paquetes/rige/arranque/rige.ts --target=bun --outfile <temporal>/cli.js` (Bun 1.3.14) y avisos MIT;
// incluye el evaluador del proveedor bajo licencia MIT, ya declarado en paquetes/opencode/vendor/ (véase pruebas/datos/T5-23.md).
// Sin normalizar bytes.
const raiz = resolve(import.meta.dir, "../..");
test("T5-23 L-2 buffers heredados y --json contra ejecutable congelado f085d3d, Bun 1.3.14", async () => {
  const temporal = realpathSync.native(mkdtempSync(join(tmpdir(), "rige-t523-ref-")));
  const e = prepararConsultas("v1-precedencia");
  const env: Record<string, string> = { ...crearEntornoAislado(e.raiz, process.env), ...e.variables,
    TEMP: temporal, TMP: temporal, TMPDIR: temporal, RIGE_PUERTO: String(puertoLibre()) };
  const ejecutar = (programa: string, args: string[], extra = {}, precarga = false) => Bun.spawnSync([
    process.execPath, ...(precarga ? ["--preload", join(temporal, "fallar.ts")] : []), programa, ...args,
  ], { cwd: e.proyecto, env: { ...env, ...extra }, stdout: "pipe", stderr: "pipe", timeout: 10000 });
  try {
    const congelada = readFileSync(join(raiz, "pruebas/datos/cli-f085d3d.bun.txt"));
    const procedencia = JSON.parse(readFileSync(join(raiz, "pruebas/datos/cli-f085d3d.json"), "utf8"));
    expect(procedencia.commit).toBe("f085d3d5b999a82300c7d5724703beb4f16f7d30");
    expect(createHash("sha256").update(congelada).digest("hex")).toBe(procedencia.sha256);
    const anterior = join(temporal, "congelada/paquetes/rige/arranque/rige.js");
    mkdirSync(resolve(anterior, ".."), { recursive: true });
    writeFileSync(anterior, congelada);
    expect(Bun.spawnSync([process.execPath, "--version"]).stdout.toString().trim()).toBe("1.3.14");
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
    expect(await iniciar(actual)).toEqual(servidorReferencia);
  } finally { e.borrar(); borrarTemporal(temporal); }
}, 30000);
