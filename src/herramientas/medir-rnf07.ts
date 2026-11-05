import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { copiarEscenario } from "../pruebas/utilidades/escenario";
import { crearEntornoAislado } from "../pruebas/utilidades/entorno-aislado";
import { validarEsquema } from "../pruebas/utilidades/validar-esquema";
import type { RespuestaTiempos } from "../paquetes/rige/aplicacion/respuestas/contrato-generado";
import { archivosConfiguracion, generarReglas, multiplicarEscenario } from "./generar-escala";

type Tiempos = RespuestaTiempos["tiempos"];
interface EscenarioEscala {
  readonly serie: "tamano" | "reglas";
  readonly cantidad: number;
  readonly proyecto: string;
  readonly archivos: number;
}
type Resumen = ReturnType<typeof resumir>;
type CorridaEscala = { readonly invocacionMs: number; readonly tiempos?: Tiempos }
  | { readonly corte: true } | { readonly codigo: number; readonly error: string };
interface ResultadoEscala {
  readonly serie: EscenarioEscala["serie"];
  readonly cantidad: number;
  readonly archivos: number;
  readonly consulta: string;
  readonly estado: "completa" | "corte";
  readonly cortes: number;
  readonly invocacionMs: Resumen | null;
  readonly tiempos: Readonly<Record<keyof Tiempos, Resumen>> | null;
  readonly cociente: { readonly mediana: number | null; readonly peor: number | null } | null;
}
interface InformeEscala { readonly resultados: readonly ResultadoEscala[]; readonly codigo: number; readonly error?: string }

/** Diez invocaciones consecutivas por consulta, sin umbral ni procesos en esta funcion. */
export function medirEscala(escenarios: readonly EscenarioEscala[], ejecutar: (argumentos: readonly string[], timeout: number) => CorridaEscala): InformeEscala {
  const resultados: ResultadoEscala[] = [];
  for (const escenario of escenarios) {
    const consultas = escenario.serie === "tamano" ? ["valores", "permiso", "hallazgos", "permiso --explicar"] : ["hallazgos"];
    for (const consulta of consultas) {
      const comando = consulta.split(" ")[0]!;
      const argumentos = [comando, "--proyecto", escenario.proyecto,
        ...(comando === "hallazgos" ? [] : ["--agente", "agent-1"]),
        ...(comando === "permiso" ? ["--herramienta", "bash", "--objetivo", "git status"] : []),
        ...(consulta.endsWith("--explicar") ? ["--explicar"] : []), "--tiempos"];
      const muestras: { invocacionMs: number; tiempos?: Tiempos }[] = [];
      let cortes = 0;
      for (let n = 0; n < 10; n++) {
        const muestra = ejecutar(argumentos, escenario.serie === "reglas" ? 120000 : 30000);
        if ("codigo" in muestra) return { resultados, codigo: 1, error: `Consulta ${consulta} fallida (${muestra.codigo}): ${muestra.error}` };
        if ("corte" in muestra) {
          if (escenario.serie !== "reglas") return { resultados, codigo: 1, error: `Consulta ${consulta}: tiempo agotado.` };
          cortes++;
        } else muestras.push(muestra);
      }
      // Una serie incompleta no tiene un peor caso medido ni cocientes comparables.
      const invocacionMs = cortes ? null : resumir(muestras.map(m => m.invocacionMs));
      const anterior = resultados.findLast(r => r.serie === escenario.serie && r.consulta === consulta);
      const dividir = (a: number, b: number) => b === 0 ? null : a / b;
      const cociente = invocacionMs && anterior?.invocacionMs ? {
        mediana: dividir(invocacionMs.mediana, anterior.invocacionMs.mediana),
        peor: dividir(invocacionMs.peor, anterior.invocacionMs.peor),
      } : null;
      const tiempos = !cortes && muestras.every(m => m.tiempos !== undefined)
        ? Object.fromEntries(etapas.slice(1).map(etapa => [etapa, resumir(muestras.map(m => m.tiempos![etapa as keyof Tiempos]))])) as Record<keyof Tiempos, Resumen>
        : null;
      resultados.push({ serie: escenario.serie, cantidad: escenario.cantidad, archivos: escenario.archivos,
        consulta, estado: cortes ? "corte" : "completa", cortes, invocacionMs, tiempos, cociente });
    }
  }
  return { resultados, codigo: 0 };
}

export function opcionesMedicion(argumentos: readonly string[]) {
  let escala = false, estricto = false, salida: string | undefined;
  for (let i = 0; i < argumentos.length; i++) {
    const arg = argumentos[i];
    if (arg === "--escala") escala = true;
    else if (arg === "--estricto") estricto = true;
    else if (arg === "--salida") {
      salida = argumentos[++i];
      if (!salida?.trim() || salida.startsWith("--")) throw new Error("--salida requiere una ruta.");
    } else throw new Error("Solo se admite --estricto o --escala [--salida <ruta>].");
  }
  if (escala && estricto) throw new Error("--escala y --estricto son incompatibles.");
  if (!escala && salida !== undefined) throw new Error("--salida requiere --escala.");
  return { escala, estricto, salida };
}

export function publicarEscala(informe: InformeEscala, plataforma: string, commit: string, salida?: string, escribir: (linea: string) => void = console.log) {
  const publicado = { plataforma, commit, corridasPorConsulta: 10, ...informe };
  escribir(`E-01 · ${plataforma} · commit ${commit} · 10 corridas consecutivas por consulta`);
  for (const serie of ["tamano", "reglas"] as const) {
    escribir(`Serie ${serie}: cantidad  archivos  consulta  minimoMs  medianaMs  peorMs  cocienteMediana  cocientePeor  cortes`);
    const numero = (n: number | undefined | null) => n == null ? "—" : n.toFixed(3);
    for (const r of informe.resultados.filter(r => r.serie === serie)) {
      escribir(`${r.cantidad}  ${r.archivos}  ${r.consulta}  ${r.estado === "corte" ? "corte  corte  corte" :
        `${numero(r.invocacionMs?.minimo)}  ${numero(r.invocacionMs?.mediana)}  ${numero(r.invocacionMs?.peor)}`}  ${numero(r.cociente?.mediana)}  ${numero(r.cociente?.peor)}  ${r.cortes}`);
    }
  }
  if (salida !== undefined) writeFileSync(salida, JSON.stringify(publicado, null, 2) + "\n");
  return publicado;
}
interface Muestra { readonly invocacionMs: number; readonly tiempos: Tiempos }
const etapas = ["invocacionMs", "arranqueMs", "lecturaMs", "resolucionMs", "salidaMs", "totalMs"] as const;

function resumir(muestras: readonly number[]) {
  const ordenadas = [...muestras].sort((a, b) => a - b);
  return { minimo: ordenadas[0]!, mediana: (ordenadas[4]! + ordenadas[5]!) / 2, peor: ordenadas[9]! };
}

/** El umbral incluye el lanzador de Bun y el proceso completo, ademas del desglose interno. */
export function medirConsultas(proyecto: string, estricto: boolean, ejecutar: (argumentos: readonly string[]) => Muestra) {
  const resultados = (["valores", "permiso"] as const).map(consulta => {
    const argumentos = [consulta, "--proyecto", proyecto, "--agente", "agent-1",
      ...(consulta === "permiso" ? ["--herramienta", "bash", "--objetivo", "git status"] : []), "--tiempos"];
    const muestras = Array.from({ length: 10 }, () => ejecutar(argumentos));
    return { consulta, invocacionMs: resumir(muestras.map(m => m.invocacionMs)),
      arranqueMs: resumir(muestras.map(m => m.tiempos.arranqueMs)),
      lecturaMs: resumir(muestras.map(m => m.tiempos.lecturaMs)),
      resolucionMs: resumir(muestras.map(m => m.tiempos.resolucionMs)),
      salidaMs: resumir(muestras.map(m => m.tiempos.salidaMs)),
      totalMs: resumir(muestras.map(m => m.tiempos.totalMs)) };
  });
  return { resultados, codigo: estricto && resultados.some(r => r.invocacionMs.peor >= 2000) ? 1 : 0 };
}

function ejecutarMedicion(estricto: boolean): number {
  const raiz = resolve(import.meta.dir, "..");
  const esquemas = Object.fromEntries(["valores", "permiso", "advertencia", "tiempos"].map(nombre =>
    [nombre, JSON.parse(readFileSync(resolve(raiz, `esquemas/salida/${nombre}.json`), "utf8"))]));
  function validar(nombre: string, dato: unknown): void {
    const errores = validarEsquema(esquemas[nombre], dato);
    if (errores.length) throw new Error(`${nombre}: ${errores.join("; ")}`);
  }
  const copia = copiarEscenario("openchamber-doble");
  try {
    const entorno = crearEntornoAislado(copia.raiz, process.env);
    const informe = medirConsultas(copia.proyecto, estricto, argumentos => {
      const inicio = performance.now();
      const proceso = Bun.spawnSync([process.execPath, "run", "--silent", "rige", ...argumentos], {
        cwd: raiz, env: entorno, stdout: "pipe", stderr: "pipe", timeout: 30000,
      });
      const invocacionMs = performance.now() - inicio;
      if (proceso.exitCode !== 0) throw new Error(`Consulta ${argumentos[0]} fallida (${proceso.exitCode}): ${proceso.stderr.toString()}`);
      const respuesta = JSON.parse(proceso.stdout.toString());
      validar(argumentos[0]!, respuesta);
      if (argumentos[0] === "permiso" && (respuesta.decision !== "allow" || respuesta.motivoSinDecision !== null)) {
        throw new Error("El escenario no produjo la decision completa allow.");
      }
      const lineas = proceso.stderr.toString().trim().split("\n").map(linea => JSON.parse(linea));
      const ultima = lineas.pop();
      validar("tiempos", ultima);
      for (const advertencia of lineas) validar("advertencia", advertencia);
      const { tiempos } = ultima as RespuestaTiempos;
      if (Object.values(tiempos).some(t => !Number.isFinite(t) || t <= 0)
        || tiempos.totalMs < tiempos.lecturaMs + tiempos.resolucionMs) {
        throw new Error("Medicion de etapas invalida.");
      }
      return { invocacionMs, tiempos };
    });
    console.log(`RNF-07 · ${process.platform} · 10 corridas consecutivas por consulta · ${estricto ? "estricto (< 2000 ms)" : "diagnostico informativo"}`);
    console.log("Consulta  Etapa          Minimo (ms)  Mediana (ms)  Peor (ms)");
    for (const resultado of informe.resultados) {
      for (const etapa of etapas) {
        const resumen = resultado[etapa];
        console.log(`${resultado.consulta.padEnd(10)}${etapa.padEnd(15)}${resumen.minimo.toFixed(3).padStart(11)}${resumen.mediana.toFixed(3).padStart(14)}${resumen.peor.toFixed(3).padStart(11)}`);
      }
    }
    console.log("invocacionMs: pared del subproceso completo; totalMs: desde ejecutarCli hasta antes de emitir tiempos.");
    console.log(informe.codigo ? "No cumple el umbral estricto de RNF-07." : "Medicion finalizada; el umbral solo se acredita en el contenedor de referencia (ADR-054/055).");
    return informe.codigo;
  } finally { copia.borrar(); }
}

function ejecutarEscala(salida?: string): number {
  const raiz = resolve(import.meta.dir, "..");
  const copias: ReturnType<typeof copiarEscenario>[] = [];
  const entornos = new Map<string, Record<string, string>>();
  try {
    const escenarios: EscenarioEscala[] = [];
    for (const serie of ["tamano", "reglas"] as const) {
      for (const cantidad of serie === "tamano" ? [1, 10] : [10, 100, 1000, 10000]) {
        const copia = copiarEscenario("openchamber-doble");
        copias.push(copia);
        if (serie === "tamano") multiplicarEscenario(copia.proyecto, cantidad);
        else generarReglas(copia.proyecto, cantidad);
        escenarios.push({ serie, cantidad, proyecto: copia.proyecto, archivos: archivosConfiguracion(copia.proyecto).length });
        entornos.set(copia.proyecto, crearEntornoAislado(copia.raiz, process.env));
      }
    }
    const version = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: raiz, encoding: "utf8", windowsHide: true });
    if (version.error || version.status !== 0) throw new Error(`No se pudo leer el commit: ${version.error?.message ?? version.stderr}`);
    const informe = medirEscala(escenarios, (argumentos, timeout) => {
      const proyecto = argumentos[argumentos.indexOf("--proyecto") + 1]!;
      const entorno = entornos.get(proyecto);
      if (!entorno) throw new Error("Falta el entorno aislado del escenario.");
      const inicio = performance.now();
      // Node identifica ETIMEDOUT explicitamente: una senal por otra causa no es un corte.
      const proceso = spawnSync(process.execPath, ["run", "--silent", "rige", ...argumentos], {
        cwd: raiz, env: entorno, encoding: "utf8", timeout, windowsHide: true, maxBuffer: 64 * 1024 * 1024,
      });
      const invocacionMs = performance.now() - inicio;
      if (proceso.error && "code" in proceso.error && proceso.error.code === "ETIMEDOUT") return { corte: true };
      if (proceso.error || proceso.status !== 0) return { codigo: proceso.status ?? 70,
        error: proceso.error?.message ?? proceso.stderr ?? `Senal ${proceso.signal}` };
      // Tambien se consume la respuesta completa; una salida truncada o invalida es falla visible.
      JSON.parse(proceso.stdout);
      const lineas = proceso.stderr.trim().split("\n").filter(Boolean).map(linea => JSON.parse(linea));
      const ultima = lineas.at(-1) as RespuestaTiempos | undefined;
      if (!ultima?.tiempos) throw new Error(`Consulta ${argumentos[0]} sin tiempos.`);
      if (Object.values(ultima.tiempos).some(t => !Number.isFinite(t) || t < 0)) throw new Error("Medicion de etapas invalida.");
      return { invocacionMs, tiempos: ultima.tiempos };
    });
    publicarEscala(informe, process.platform, version.stdout.trim(), salida);
    if (informe.error) console.error(informe.error);
    return informe.codigo;
  } finally {
    for (const copia of copias) copia.borrar();
  }
}

if (import.meta.main) {
  try {
    const opciones = opcionesMedicion(process.argv.slice(2));
    process.exitCode = opciones.escala ? ejecutarEscala(opciones.salida)
      : ejecutarMedicion(opciones.estricto || process.env.RNF07_ESTRICTO === "1");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
