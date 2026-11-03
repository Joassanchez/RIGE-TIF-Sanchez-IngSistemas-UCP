import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { copiarEscenario } from "../pruebas/utilidades/escenario";
import { crearEntornoAislado } from "../pruebas/utilidades/entorno-aislado";
import { validarEsquema } from "../pruebas/utilidades/validar-esquema";
import type { RespuestaTiempos } from "../paquetes/rige/aplicacion/respuestas/contrato-generado";

type Tiempos = RespuestaTiempos["tiempos"];
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

if (import.meta.main) {
  try {
    const argumentos = process.argv.slice(2);
    if (argumentos.some(a => a !== "--estricto")) throw new Error("Solo se admite --estricto.");
    process.exitCode = ejecutarMedicion(argumentos.includes("--estricto") || process.env.RNF07_ESTRICTO === "1");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
