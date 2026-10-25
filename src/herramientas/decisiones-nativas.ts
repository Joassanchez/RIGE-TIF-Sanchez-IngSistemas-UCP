import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { copiarEscenario, type OpcionesEscenario } from "../pruebas/utilidades/escenario";
import type { Manifiesto } from "./cobertura";
import { crearProveedor } from "./decisiones-nativas/proveedor";
import { extraerEvaluaciones, normalizarEvaluaciones, type DecisionNativa } from "./decisiones-nativas/registro";

const hashes: Readonly<Record<string, readonly string[]>> = {
  "win32-x64": ["ef06e41a35795066e95acde276a42fbbf85d7a683c2787f6a19ed20bcde9b6ff", "954f2869f9cc2131b03cb6aa7ee50c70601c1a56811fb5bcf749b827c970d290"],
  "linux-x64": ["d91e0d33676d0839f7cde87924cd4127ea88c9d6784eea9f009a7d08bdc60eeb"],
};
function entorno(hogar: string): Record<string, string> {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k, v]) => v !== undefined && /^(PATH|SystemRoot)$/i.test(k))) as Record<string, string>;
  for (const nombre of ["HOME", "USERPROFILE", "XDG_DATA_HOME", "XDG_STATE_HOME", "XDG_CACHE_HOME", "APPDATA", "LOCALAPPDATA", "ProgramData"]) env[nombre] = hogar;
  env.XDG_CONFIG_HOME = join(hogar, ".config");
  env.RIGE_ALMACEN = join(hogar, "almacen");
  for (const nombre of ["TEMP", "TMP", "TMPDIR"]) env[nombre] = join(hogar, "tmp");
  mkdirSync(env.TEMP!, { recursive: true });
  return env;
}
// Resuelve tambien los antecesores existentes para no admitir un cache enlazado al repositorio.
function rutaFisica(ruta: string): string {
  return existsSync(ruta) ? realpathSync(ruta) : resolve(ruta) === dirname(resolve(ruta)) ? resolve(ruta) : join(rutaFisica(dirname(resolve(ruta))), ruta.slice(dirname(resolve(ruta)).length + 1));
}
async function ejecutar(): Promise<number> {
  const argumentos = process.argv.slice(2);
  const uso = "Uso: bun run decisiones --raiz <npm root> [--cache <directorio externo>] [--regenerar]";
  if (argumentos[0] !== "--raiz" || !argumentos[1]?.trim() || argumentos[1].startsWith("--")) throw new Error(uso);
  let regenerar = false;
  let cache: string | undefined;
  for (let i = 2; i < argumentos.length; i++) {
    if (argumentos[i] === "--regenerar" && !regenerar) regenerar = true;
    else if (argumentos[i] === "--cache" && !cache && argumentos[i + 1]?.trim() && !argumentos[i + 1]!.startsWith("--")) cache = resolve(argumentos[++i]!);
    else throw new Error(uso);
  }
  const raiz = resolve(import.meta.dir, "..");
  if (cache) {
    const relativa = relative(rutaFisica(resolve(raiz, "..")), rutaFisica(cache));
    if (!relativa || (relativa !== ".." && !relativa.startsWith(".." + sep) && !isAbsolute(relativa))) throw new Error("El cache debe estar fuera del repositorio");
  }
  const binario = resolve(argumentos[1], "opencode-ai/bin/opencode.exe");
  const hash = createHash("sha256").update(readFileSync(binario)).digest("hex");
  const plataforma = `${process.platform}-${process.arch}`;
  if (!hashes[plataforma]?.includes(hash)) throw new Error(`SHA-256 del binario no verificado (${plataforma}): ${hash}`);
  const hogarVersion = mkdtempSync(join(tmpdir(), "rige-decisiones-version-"));
  try {
    const version = Bun.spawnSync([binario, "--version"], { env: entorno(hogarVersion), stdout: "pipe", stderr: "pipe", timeout: 120000 });
    if (version.exitCode !== 0 || version.stdout.toString().trim() !== "1.18.25") throw new Error(`Version no verificada; SHA-256: ${hash}`);
  } finally { rmSync(hogarVersion, { recursive: true, force: true }); }
  if (cache) mkdirSync(cache, { recursive: true });
  const directorio = join(raiz, "pruebas/escenarios");
  const manifiesto = JSON.parse(readFileSync(join(directorio, "MANIFIESTO.json"), "utf8")) as Manifiesto;
  const pendientes: { archivo: string; referencia: Record<string, unknown>; decisiones: DecisionNativa[] }[] = [];
  let codigo = 0;
  for (const escenario of manifiesto.escenarios) {
    const consultas = escenario.consultas.filter(c => c.nativa);
    if (!consultas.length) continue;
    const archivo = join(directorio, escenario.id, "REFERENCIA.json");
    const referencia = JSON.parse(readFileSync(archivo, "utf8")) as Record<string, unknown> & {
      procedencia: { version: string; hogar: string; directorio: string; git?: OpcionesEscenario["git"]; OPENCODE_CONFIG?: string; skillsExternosExcluidos?: boolean };
      decisionesNativas?: DecisionNativa[];
    };
    if (referencia.procedencia.version !== "1.18.25") throw new Error(`Version de referencia inesperada: ${escenario.id}`);
    const decisiones: DecisionNativa[] = [];
    for (const consulta of consultas) {
      if (consulta.lanzadoPor) throw new Error("La consulta nativa requiere ejecutar la herramienta task del lanzador, no run del subagente");
      const copia = copiarEscenario(escenario.id, { git: referencia.procedencia.git ?? "raiz" });
      let proveedor: ReturnType<typeof crearProveedor> | undefined;
      try {
        const hogar = join(copia.raiz, referencia.procedencia.hogar);
        const env = entorno(hogar);
        if (cache) env.XDG_CACHE_HOME = cache;
        if (referencia.procedencia.skillsExternosExcluidos) env.OPENCODE_DISABLE_EXTERNAL_SKILLS = "true";
        const cwd = join(copia.raiz, referencia.procedencia.directorio);
        if (!["sintetico", "ninguno"].includes(referencia.procedencia.git ?? "raiz")) {
          const git = Bun.spawnSync(["git", "init", "--quiet", "--initial-branch=main"], {
            cwd: referencia.procedencia.git === "proyecto" ? copia.proyecto : copia.raiz, env, stdout: "pipe", stderr: "pipe", timeout: 30000,
          });
          if (git.exitCode !== 0) throw new Error(`git init fallo en ${escenario.id}/${consulta.id} (estado ${git.exitCode}): ${git.stderr.toString().trim()}`);
          const verificacion = Bun.spawnSync(["git", "rev-parse", "--show-toplevel"], { cwd, env, stdout: "pipe", stderr: "pipe", timeout: 10000 });
          const esperada = referencia.procedencia.git === "proyecto" ? copia.proyecto : copia.raiz;
          if (verificacion.exitCode !== 0 || resolve(verificacion.stdout.toString().trim()).toLowerCase() !== resolve(esperada).toLowerCase()) throw new Error("Worktree nativo no aislado");
        }
        const argumentosHerramienta = JSON.parse(JSON.stringify(consulta.argumentos).replaceAll("<PROYECTO>", JSON.stringify(copia.proyecto).slice(1, -1)).replaceAll("<RAIZ>", JSON.stringify(copia.raiz).slice(1, -1))) as Record<string, unknown>;
        proveedor = crearProveedor(consulta.herramienta, argumentosHerramienta);
        // Si habia una via externa, conserva su contenido antes de agregar solo provider/model.
        const externa = referencia.procedencia.OPENCODE_CONFIG ? JSON.parse(readFileSync(join(copia.raiz, referencia.procedencia.OPENCODE_CONFIG), "utf8")) as Record<string, unknown> : {};
        const auxiliar = join(hogar, "proveedor-config.json");
        writeFileSync(auxiliar, JSON.stringify({ ...externa, provider: { simulado: { npm: "@ai-sdk/openai-compatible", name: "Simulado local",
          options: { baseURL: `http://127.0.0.1:${proveedor.servidor.port}/v1` }, models: { permisos: { name: "Permisos simulado", limit: { context: 32000, output: 2048 } } } } }, model: "simulado/permisos" }));
        env.OPENCODE_CONFIG = auxiliar;
        const comando = [binario, "--print-logs", "run", "--agent", consulta.agente, "Ejecuta la accion local fija del proveedor y devuelve el resultado."];
        const proceso = Bun.spawn(comando, { cwd, env, stdout: "pipe", stderr: "pipe", timeout: 120000 });
        const [salida, error, estado] = await Promise.all([new Response(proceso.stdout).text(), new Response(proceso.stderr).text(), proceso.exited]);
        if (estado !== 0) throw new Error(`Comando nativo fallido (${estado}): ${escenario.id}/${consulta.id}`);
        const evaluaciones = normalizarEvaluaciones(extraerEvaluaciones(salida + "\n" + error), copia.raiz);
        decisiones.push({ consulta: consulta.id, agente: consulta.agente, sujeto: consulta.sujeto, objetivo: consulta.objetivo, herramienta: consulta.herramienta, evaluaciones,
          ...(evaluaciones.some(e => e.sujeto === consulta.sujeto) ? {} : { herramientaNoOfrecida: true }),
          procedencia: { comando: ["opencode", ...comando.slice(1)], sha256Binario: hash, version: "1.18.25", fecha: new Date().toISOString(), plataforma } });
      } finally { proveedor?.servidor.stop(true); copia.borrar(); }
    }
    if (regenerar) pendientes.push({ archivo, referencia, decisiones });
    else {
      const limpiar = (ds: DecisionNativa[]) => ds.map(({ consulta, agente, sujeto, objetivo, herramienta, evaluaciones, herramientaNoOfrecida }) => ({ consulta, agente, sujeto, objetivo, herramienta, evaluaciones, ...(herramientaNoOfrecida ? { herramientaNoOfrecida } : {}) }));
      // La plataforma integra la procedencia, no se comparan resultados Windows con Linux.
      const diferentes = referencia.decisionesNativas?.some(d => d.procedencia && (d.procedencia.plataforma !== plataforma || d.procedencia.sha256Binario !== hash))
        || JSON.stringify(limpiar(referencia.decisionesNativas ?? [])) !== JSON.stringify(limpiar(decisiones));
      console.log(`${escenario.id}: ${diferentes ? "diferencias o referencia nativa ausente" : "ok"}`);
      if (diferentes) codigo = 1;
    }
  }
  for (const p of pendientes) {
    writeFileSync(p.archivo, JSON.stringify({ ...p.referencia, decisionesNativas: p.decisiones }, null, 2) + "\n");
    console.log(`${p.archivo}: regenerada; actualizar SHA-256 del MANIFIESTO.json`);
  }
  return codigo;
}
if (import.meta.main) {
  try { process.exitCode = await ejecutar(); }
  catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
