import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { copiarEscenario, type OpcionesEscenario } from "../pruebas/utilidades/escenario";
import { crearEntornoAislado } from "../pruebas/utilidades/entorno-aislado";
import { entornoDeReferencia, type ReferenciaEntorno } from "../pruebas/utilidades/entorno-referencia";
import { crearInstalacionOpenCode } from "../pruebas/utilidades/instalacion-opencode";
import { contarTrazaRed, crearRecuentoRed } from "../pruebas/utilidades/traza-red";

interface Consulta { id: string; agente: string; objetivo: string; herramienta?: string; sujeto?: string; lanzadoPor?: string }
interface Escenario { id: string; referencia: string | null; agentes: string[]; consultas?: Consulta[]; fallaEsperada?: boolean }
interface Registro { escenario: string; subcomando: string; codigo: number; sha256: string }
type Referencia = ReferenciaEntorno & { procedencia: { directorio: string; git?: OpcionesEscenario["git"]; fallaEsperada?: boolean } };
const raiz = resolve(import.meta.dir, "..");
const herramientas = new Set(["read", "edit", "write", "apply_patch", "bash", "glob", "grep", "webfetch", "task", "todowrite", "skill"]);
const hash = (texto: string) => createHash("sha256").update(texto).digest("hex");

function ejecutar(): number {
  let salida: string | undefined, comparar: string | undefined, strace = false;
  const seleccion = new Set<string>();
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") continue;
    if (arg === "--strace") { strace = true; continue; }
    if (!["--salida", "--comparar", "--escenario"].includes(arg!)) {
      console.error(`Argumento desconocido: ${arg}`); return 2;
    }
    const valor = args[++i];
    if (!valor || valor.startsWith("--")) { console.error(`Falta valor para ${arg}`); return 2; }
    if (arg === "--salida") salida = valor;
    else if (arg === "--comparar") comparar = valor;
    else seleccion.add(valor);
  }
  if (salida && comparar) { console.error("Use --salida o --comparar por separado."); return 2; }
  if (strace && (process.platform !== "linux" || !Bun.which("strace"))) {
    console.error("--strace requiere Linux con strace instalado."); return 2;
  }
  const manifiesto = JSON.parse(readFileSync(join(raiz, "pruebas/escenarios/MANIFIESTO.json"), "utf8")) as { escenarios: Escenario[] };
  if ([...seleccion].some(id => !manifiesto.escenarios.some(e => e.id === id))) {
    console.error("Escenario desconocido."); return 2;
  }
  const registros: Registro[] = [];
  const conexiones = crearRecuentoRed();
  for (const escenario of manifiesto.escenarios.filter(e => !seleccion.size || seleccion.has(e.id)).sort((a, b) => a.id.localeCompare(b.id))) {
    const ref = escenario.referencia === null ? null : JSON.parse(readFileSync(join(raiz, "pruebas/escenarios", escenario.id, "REFERENCIA.json"), "utf8")) as Referencia;
    // El resumenEntradas incluye rutas absolutas y hashes de archivos con <RAIZ>.
    // La copia exclusiva de nombre estable conserva esos hashes sin omitir campos.
    // mkdir falla ante otra corrida: nunca se reutiliza ni se borra su copia.
    const copia = copiarEscenario(escenario.id, { git: ref?.procedencia.git ?? "raiz",
      raizTemporal: join(tmpdir(), `rige-sin-red-${escenario.id}`) });
    try {
      const env = ref ? entornoDeReferencia(ref, copia) : crearEntornoAislado(join(copia.raiz, "hogar"), process.env);
      const instalacion = join(copia.raiz, "instalacion-falsa");
      crearInstalacionOpenCode(instalacion, "1.18.25");
      env.PATH = instalacion + (env.PATH ? delimiter + env.PATH : "");
      if (ref && ["raiz", "proyecto"].includes(ref.procedencia.git ?? "raiz")) {
        const git = Bun.spawnSync(["git", "init", "--quiet", "--initial-branch=main"], {
          cwd: ref.procedencia.git === "proyecto" ? copia.proyecto : copia.raiz, env, timeout: 10000,
        });
        if (git.exitCode !== 0) throw new Error(`git init fallo: ${escenario.id}`);
      }
      const proyecto = ref ? join(copia.raiz, ref.procedencia.directorio) : copia.proyecto;
      const comandos: { id: string; args: string[] }[] = [];
      const agregar = (id: string, args: string[]) => comandos.push({ id, args });
      const falla = escenario.fallaEsperada ?? ref?.procedencia.fallaEsperada;
      if (!falla) {
        agregar("valores", ["valores", "--agente", escenario.agentes[0]!]);
        agregar("agentes", ["agentes"]);
      }
      agregar("entradas", ["entradas"]);
      agregar("hallazgos", ["hallazgos", ...(falla ? [] : ["--explicar"])]);
      if (!falla) for (const c of escenario.consultas ?? []) {
        const objetivo = c.objetivo.replaceAll("<PROYECTO>", proyecto).replaceAll("<RAIZ>", copia.raiz);
        const consulta = ["permiso", "--agente", c.agente, "--objetivo", objetivo];
        if (c.lanzadoPor) consulta.push("--lanzado-por", c.lanzadoPor);
        if (c.herramienta && herramientas.has(c.herramienta)) consulta.push("--herramienta", c.herramienta);
        else if (c.sujeto) consulta.push("--sujeto", c.sujeto);
        else throw new Error(`Consulta sin sujeto: ${escenario.id}/${c.id}`);
        agregar(`permiso:${c.id}`, consulta);
      }
      for (const comando of comandos) {
        const traza = join(copia.raiz, "strace.log");
        const proceso = Bun.spawnSync([
          ...(strace ? ["strace", "-f", "-yy", "-e", "trace=connect,sendto,sendmsg", "-o", traza] : []),
          process.execPath, "paquetes/rige/arranque/rige.ts", ...comando.args, "--proyecto", proyecto,
        ], { cwd: raiz, env, stdout: "pipe", stderr: "pipe", timeout: 30000 });
        if (proceso.signalCode || proceso.exitCode === 70) throw new Error(`Falla interna: ${escenario.id}/${comando.id}`);
        if (strace) {
          if (proceso.exitCode !== 0 || proceso.stdout.toString().trim() === "") {
            throw new Error(`Analisis trazado fallido o vacio: ${escenario.id}/${comando.id}; codigo ${proceso.exitCode}`);
          }
          if (/strace:/.test(proceso.stderr.toString())) throw new Error("strace no pudo ejecutar o registrar el analisis.");
          const actuales = contarTrazaRed(readFileSync(traza, "utf8"));
          for (const llamada of Object.keys(conexiones) as (keyof typeof conexiones)[]) {
            for (const destino of Object.keys(conexiones[llamada]) as (keyof typeof conexiones.connect)[]) {
              conexiones[llamada][destino] += actuales[llamada][destino];
            }
          }
          if (Object.values(actuales).some(c => c.externoIPv4 || c.externoIPv6 || c.indeterminados)) {
            throw new Error(`Intento externo o destino indeterminado: ${escenario.id}/${comando.id}; ${JSON.stringify(actuales)}`);
          }
        }
        function normalizar(texto: string): string {
          return texto.replaceAll(JSON.stringify(copia.raiz).slice(1, -1), "<RAIZ>")
            .replaceAll(copia.raiz.replaceAll("\\", "/"), "<RAIZ>").replaceAll(copia.raiz, "<RAIZ>");
        }
        registros.push({ escenario: escenario.id, subcomando: comando.id, codigo: proceso.exitCode,
          sha256: hash(JSON.stringify([normalizar(proceso.stdout.toString()), normalizar(proceso.stderr.toString())])) });
      }
    } finally { copia.borrar(); }
  }
  registros.sort((a, b) => a.escenario.localeCompare(b.escenario) || a.subcomando.localeCompare(b.subcomando));
  let codigo = 0;
  if (salida) writeFileSync(salida, JSON.stringify(registros, null, 2) + "\n");
  if (comparar) {
    const referencia = JSON.parse(readFileSync(comparar, "utf8")) as Registro[];
    if (!Array.isArray(referencia)) throw new Error("La referencia debe ser un arreglo.");
    const clave = (r: Registro) => `${r.escenario}/${r.subcomando}`;
    const previos = new Map(referencia.map(r => [clave(r), r]));
    const actuales = new Map(registros.map(r => [clave(r), r]));
    for (const id of new Set([...previos.keys(), ...actuales.keys()])) {
      const anterior = previos.get(id), actual = actuales.get(id);
      if (!anterior || !actual || anterior.codigo !== actual.codigo || anterior.sha256 !== actual.sha256) {
        console.error(`Diferencia: ${id}`); codigo = 1;
      }
    }
    if (previos.size !== referencia.length) { console.error("Referencia con registros duplicados."); codigo = 1; }
  }
  if (strace) for (const [llamada, total] of Object.entries(conexiones)) console.log(`${llamada}: ${JSON.stringify(total)}`);
  console.log(`Analisis: ${registros.length} subcomandos; codigo ${codigo}`);
  return codigo;
}

try { process.exitCode = ejecutar(); }
catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
