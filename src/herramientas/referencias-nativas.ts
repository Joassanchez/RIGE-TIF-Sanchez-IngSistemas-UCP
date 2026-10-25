import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join, resolve } from "node:path";
import { copiarEscenario } from "../pruebas/utilidades/escenario";
import { comparar, normalizar, normalizarRutas } from "./referencias-nativas/comparar";
import { comprobarAislamiento } from "./referencias-nativas/aislamiento";

type Referencia = {
  readonly procedencia: { readonly version: string; readonly directorio: string; readonly hogar: string;
    readonly OPENCODE_CONFIG?: string; readonly [clave: string]: unknown };
  readonly agente: string;
  readonly valores: Record<string, unknown>;
  readonly cadenas: Record<string, unknown[]>;
};
// Variantes oficiales de opencode-ai@1.18.25 por plataforma: en Windows el postinstall elige la baseline
// si no detecta AVX2; en Linux las dos variantes son el mismo binario.
const hashes: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "linux-x64": {
    "opencode-linux-x64": "d91e0d33676d0839f7cde87924cd4127ea88c9d6784eea9f009a7d08bdc60eeb",
  },
  "windows-x64": {
    "opencode-windows-x64": "ef06e41a35795066e95acde276a42fbbf85d7a683c2787f6a19ed20bcde9b6ff",
    "opencode-windows-x64-baseline": "954f2869f9cc2131b03cb6aa7ee50c70601c1a56811fb5bcf749b827c970d290",
  },
};

function entornoBase(): Record<string, string> {
  return Object.fromEntries(Object.entries(process.env).filter(([nombre, valor]) => valor !== undefined
    && /^(PATH|SystemRoot)$/i.test(nombre))) as Record<string, string>;
}

function entornoAislado(hogar: string): Record<string, string> {
  const env = entornoBase();
  for (const nombre of ["HOME", "USERPROFILE", "XDG_DATA_HOME", "XDG_STATE_HOME", "XDG_CACHE_HOME", "APPDATA", "LOCALAPPDATA", "ProgramData"]) env[nombre] = hogar;
  env.XDG_CONFIG_HOME = join(hogar, ".config");
  env.RIGE_ALMACEN = join(hogar, "almacen");
  for (const nombre of ["TEMP", "TMP", "TMPDIR"]) env[nombre] = join(hogar, "tmp");
  mkdirSync(env.TEMP!, { recursive: true });
  return env;
}

function ejecutar(): number {
  const hogarReal = userInfo().homedir;
  const argumentos = process.argv.slice(2);
  const regenerar = argumentos.length === 3 && argumentos[2] === "--regenerar";
  if ((!regenerar && argumentos.length !== 2) || argumentos[0] !== "--raiz" || !argumentos[1]?.trim()) {
    throw new Error("Uso: bun run referencias --raiz <directorio global de npm> [--regenerar].");
  }
  const escenarios = join(import.meta.dir, "../pruebas/escenarios");
  const referencias = readdirSync(escenarios, { withFileTypes: true })
    .filter(entrada => entrada.isDirectory() && existsSync(join(escenarios, entrada.name, "REFERENCIA.json")))
    .map(entrada => entrada.name).sort().map(nombre => ({ nombre,
      referencia: JSON.parse(readFileSync(join(escenarios, nombre, "REFERENCIA.json"), "utf8")) as Referencia,
    }));
  if (!referencias.length) throw new Error("No se encontraron referencias nativas.");
  for (const { nombre, referencia } of referencias) {
    if (!referencia.procedencia.hogar || !referencia.procedencia.directorio || !referencia.cadenas || !Object.keys(referencia.cadenas).length) {
      throw new Error(`Referencia sin hogar, directorio o agentes de cadenas: ${nombre}.`);
    }
  }
  const binario = resolve(argumentos[1], "opencode-ai/bin/opencode.exe");
  const hash = createHash("sha256").update(readFileSync(binario)).digest("hex");
  const plataforma = `${process.platform === "win32" ? "windows" : process.platform}-${process.arch}`;
  const variante = Object.hasOwn(hashes, plataforma)
    ? Object.entries(hashes[plataforma]!).find(([, conocido]) => conocido === hash)?.[0] : undefined;
  if (!variante) {
    throw new Error(`Binario no verificado (${plataforma}); SHA-256 obtenido: ${hash}.`);
  }
  const hogarVersion = mkdtempSync(join(tmpdir(), "rige-nativas-version-"));
  let obtenida: string;
  let codigoVersion: number;
  try {
    const version = Bun.spawnSync([binario, "--version"], {
      env: entornoAislado(hogarVersion), stdout: "pipe", stderr: "pipe", timeout: 120000,
    });
    obtenida = version.stdout.toString().trim();
    codigoVersion = version.exitCode;
  } finally { rmSync(hogarVersion, { recursive: true, force: true }); }
  if (codigoVersion !== 0 || referencias.some(({ referencia }) => referencia.procedencia.version !== obtenida)) {
    throw new Error(`Version nativa inesperada: ${obtenida}; SHA-256 obtenido: ${hash}.`);
  }
  console.log(`binario: ${variante} ${obtenida}`);
  let codigo = 0;
  for (const { nombre, referencia } of referencias) {
    const copia = copiarEscenario(nombre);
    try {
      const hogar = join(copia.raiz, referencia.procedencia.hogar);
      const env = entornoAislado(hogar);
      // Un HEAD sintetico no es un repositorio: el binario requiere git rev-parse.
      const inicializacion = Bun.spawnSync(["git", "init", "--quiet", "--initial-branch=main"], {
        cwd: copia.raiz, env, stdout: "pipe", stderr: "pipe", timeout: 10000,
      });
      if (inicializacion.exitCode !== 0) throw new Error(`git init fallo: ${inicializacion.stderr.toString().trim()}`);
      const raizGit = Bun.spawnSync(["git", "rev-parse", "--show-toplevel"], {
        cwd: join(copia.raiz, referencia.procedencia.directorio), env, stdout: "pipe", stderr: "pipe", timeout: 10000,
      });
      if (raizGit.exitCode !== 0 || resolve(raizGit.stdout.toString().trim()).toLowerCase() !== resolve(copia.raiz).toLowerCase()) {
        throw new Error("El directorio consultado no pertenece al worktree aislado.");
      }
      if (referencia.procedencia.OPENCODE_CONFIG) env.OPENCODE_CONFIG = join(copia.raiz, referencia.procedencia.OPENCODE_CONFIG);
      const cadenas: Record<string, unknown[]> = {};
      let valores: Record<string, unknown> | undefined;
      for (const agente of new Set([referencia.agente, ...Object.keys(referencia.cadenas)])) {
        const proceso = Bun.spawnSync([binario, "debug", "agent", agente], {
          cwd: join(copia.raiz, referencia.procedencia.directorio), env,
          stdout: "pipe", stderr: "pipe", timeout: 120000,
        });
        if (proceso.exitCode !== 0) throw new Error(`Comando nativo fallido (codigo ${proceso.exitCode}): ${proceso.stderr.toString().trim()}`);
        const salida = JSON.parse(proceso.stdout.toString());
        if (!Array.isArray(salida.permission)) throw new Error(`El agente ${agente} no tiene una cadena permission.`);
        if (Object.hasOwn(referencia.cadenas, agente)) cadenas[agente] = normalizarRutas(salida.permission, {
          data: join(hogar, "opencode"), tmp: join(hogar, "tmp/opencode"), hogar,
        });
        if (agente === referencia.agente) valores = normalizar(salida);
      }
      if (!valores) throw new Error("No se obtuvo el agente de valores.");
      comprobarAislamiento(cadenas, hogarReal, process.platform);
      if (!regenerar) comprobarAislamiento(referencia.cadenas, hogarReal, process.platform);
      if (regenerar) {
        const seleccionados = Object.fromEntries(Object.keys(referencia.valores).map(k => {
          if (!Object.hasOwn(valores!, k)) throw new Error(`Clave nativa ausente: ${k}.`);
          return [k, valores![k]];
        }));
        writeFileSync(join(escenarios, nombre, "REFERENCIA.json"), JSON.stringify({ ...referencia,
          procedencia: { ...referencia.procedencia, binario: `${variante}@${obtenida}`, sha256Binario: hash,
            fecha: new Date().toISOString().slice(0, 10), criterio: "Comparacion profunda de todas las reglas de cadenas, en orden y con rutas normalizadas; valores conserva las claves seleccionadas del escenario.",
            comando: "opencode debug agent <agente>", aislamiento: "git init --initial-branch=main en la raiz de la copia y git rev-parse --show-toplevel desde el directorio consultado. HOME, USERPROFILE, APPDATA, LOCALAPPDATA, datos XDG y ProgramData=hogar; XDG_CONFIG_HOME=hogar/.config; TEMP/TMP/TMPDIR=hogar/tmp; solo PATH y SystemRoot heredados. Sin flags que deshabiliten skills. Diagnostico: el .git/HEAD sintetico anterior no era un repositorio valido para git rev-parse; la subida de skill/index.ts:197-203 escapaba del escenario y encontraba .claude/skills real. Con git init, sin cambiar el hogar aislado, desaparecen esas reglas: la fuga era la busqueda ascendente, no global.home (skill/index.ts:191-195). Comprobacion de HOME real sobre todas las reglas normalizadas; external_directory sigue parcialmente observado en RIGE." },
          valores: seleccionados, cadenas,
        }, null, 2) + "\n");
      }
      const diferencias = regenerar ? [] : [...comparar(referencia.valores, valores), ...comparar(referencia.cadenas, cadenas)];
      console.log(`${nombre}: ${diferencias.length ? JSON.stringify(diferencias) : regenerar ? "regenerada" : "ok"}`);
      if (diferencias.length) codigo = 1;
    } catch (error) {
      console.log(`${nombre}: error: ${error instanceof Error ? error.message : String(error)}`);
      codigo = 1;
    } finally {
      copia.borrar();
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
