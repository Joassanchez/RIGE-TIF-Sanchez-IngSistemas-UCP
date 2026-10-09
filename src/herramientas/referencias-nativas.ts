import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { copiarEscenario } from "../pruebas/utilidades/escenario";
import { comparar, normalizar } from "./referencias-nativas/comparar";

type Referencia = {
  readonly procedencia: { readonly version: string; readonly directorio: string };
  readonly agente: string;
  readonly valores: Record<string, unknown>;
};
const hashes: Readonly<Record<string, string>> = {
  "linux-x64": "d91e0d33676d0839f7cde87924cd4127ea88c9d6784eea9f009a7d08bdc60eeb",
  "windows-x64": "ef06e41a35795066e95acde276a42fbbf85d7a683c2787f6a19ed20bcde9b6ff",
};

function entornoBase(): Record<string, string> {
  return Object.fromEntries(Object.entries(process.env).filter(([nombre, valor]) => valor !== undefined
    && !/^(OPENCODE_|XDG_|HOME$|USERPROFILE$|APPDATA$|LOCALAPPDATA$|ProgramData$)/i.test(nombre))) as Record<string, string>;
}

function ejecutar(): number {
  const argumentos = process.argv.slice(2);
  if (argumentos.length !== 2 || argumentos[0] !== "--raiz" || !argumentos[1]?.trim()) {
    throw new Error("Uso: bun run referencias --raiz <directorio global de npm>.");
  }
  const escenarios = join(import.meta.dir, "../pruebas/escenarios");
  const referencias = readdirSync(escenarios, { withFileTypes: true })
    .filter(entrada => entrada.isDirectory() && existsSync(join(escenarios, entrada.name, "REFERENCIA.json")))
    .map(entrada => entrada.name).sort().map(nombre => ({ nombre,
      referencia: JSON.parse(readFileSync(join(escenarios, nombre, "REFERENCIA.json"), "utf8")) as Referencia,
    }));
  if (!referencias.length) throw new Error("No se encontraron referencias nativas.");
  for (const { nombre } of referencias) {
    if (nombre !== "v1-precedencia" && nombre !== "v1-vias") throw new Error(`Escenario sin aislamiento conocido: ${nombre}.`);
  }
  const binario = resolve(argumentos[1], "opencode-ai/bin/opencode.exe");
  const hash = createHash("sha256").update(readFileSync(binario)).digest("hex");
  const plataforma = `${process.platform === "win32" ? "windows" : process.platform}-${process.arch}`;
  if (!Object.hasOwn(hashes, plataforma) || hashes[plataforma] !== hash) {
    throw new Error(`Binario no verificado (${plataforma}); SHA-256 obtenido: ${hash}.`);
  }
  const version = Bun.spawnSync([binario, "--version"], {
    env: entornoBase(), stdout: "pipe", stderr: "pipe", timeout: 120000,
  });
  const obtenida = version.stdout.toString().trim();
  if (version.exitCode !== 0 || referencias.some(({ referencia }) => referencia.procedencia.version !== obtenida)) {
    throw new Error(`Version nativa inesperada: ${obtenida}; SHA-256 obtenido: ${hash}.`);
  }
  let codigo = 0;
  for (const { nombre, referencia } of referencias) {
    const copia = copiarEscenario(nombre);
    let hogarVacio: string | undefined;
    try {
      const env = entornoBase();
      const hogar = nombre === "v1-vias" ? join(copia.raiz, "hogar")
        : (hogarVacio = mkdtempSync(join(tmpdir(), "rige-nativas-hogar-")));
      env.HOME = hogar;
      env.USERPROFILE = hogar;
      env.XDG_CONFIG_HOME = nombre === "v1-vias" ? join(hogar, ".config") : hogar;
      for (const variable of ["XDG_DATA_HOME", "XDG_STATE_HOME", "XDG_CACHE_HOME"]) env[variable] = hogar;
      if (nombre === "v1-vias") {
        env.OPENCODE_CONFIG = join(copia.raiz, "externa/config.json");
        for (const variable of ["APPDATA", "LOCALAPPDATA", "ProgramData"]) env[variable] = hogar;
      }
      const proceso = Bun.spawnSync([binario, "debug", "agent", referencia.agente], {
        cwd: join(copia.raiz, referencia.procedencia.directorio), env,
        stdout: "pipe", stderr: "pipe", timeout: 120000,
      });
      if (proceso.exitCode !== 0) throw new Error(`Comando nativo fallido (codigo ${proceso.exitCode}): ${proceso.stderr.toString().trim()}`);
      const diferencias = comparar(referencia.valores, normalizar(JSON.parse(proceso.stdout.toString())));
      console.log(`${nombre}: ${diferencias.length ? JSON.stringify(diferencias) : "ok"}`);
      if (diferencias.length) codigo = 1;
    } catch (error) {
      console.log(`${nombre}: error: ${error instanceof Error ? error.message : String(error)}`);
      codigo = 1;
    } finally {
      try { copia.borrar(); }
      finally { if (hogarVacio) rmSync(hogarVacio, { recursive: true, force: true }); }
    }
  }
  return codigo;
}

let codigo: number;
try { codigo = ejecutar(); }
catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  codigo = 1;
}
process.exit(codigo);
