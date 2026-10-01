import { resolve } from "node:path";
import { crearEntornoAislado } from "./entorno-aislado";

const raiz = resolve(import.meta.dir, "../..");

export function puertoLibre(): number {
  const escucha = Bun.listen({ hostname: "127.0.0.1", port: 0, socket: { data() {} } });
  const puerto = escucha.port;
  escucha.stop(true);
  return puerto;
}

export function lanzar(temporal: string, argumentos: readonly string[], variables: Record<string, string> = {}):
  { codigo: number | null; salida: string; error: string } {
  const proceso = Bun.spawnSync([process.execPath, "paquetes/rige/arranque/rige.ts", ...argumentos], {
    cwd: raiz,
    env: { ...crearEntornoAislado(temporal, process.env), RIGE_PUERTO: String(puertoLibre()), ...variables },
    stdout: "pipe", stderr: "pipe", timeout: 2000,
  });
  return { codigo: proceso.exitCode, salida: proceso.stdout.toString(), error: proceso.stderr.toString() };
}

async function primeraLinea(salida: ReadableStream<Uint8Array>): Promise<string> {
  const lector = salida.getReader();
  const decodificador = new TextDecoder();
  const limite = setTimeout(() => { void lector.cancel(); }, 2000);
  try {
    let texto = "";
    while (true) {
      const fragmento = await lector.read();
      if (fragmento.done) throw new Error("El subproceso termino sin publicar direccion.");
      texto += decodificador.decode(fragmento.value, { stream: true });
      const fin = texto.indexOf("\n");
      if (fin !== -1) return texto.slice(0, fin);
    }
  } finally { clearTimeout(limite); lector.releaseLock(); }
}

export async function lanzarServidor(temporal: string, variables: Record<string, string>):
  Promise<{ direccion: string; puerto: number; detener(): Promise<void> }> {
  const puerto = Number(variables.RIGE_PUERTO ?? puertoLibre());
  const proceso = Bun.spawn([process.execPath, "paquetes/rige/arranque/rige.ts", "servir"], {
    cwd: raiz,
    env: { ...crearEntornoAislado(temporal, process.env), RIGE_PUERTO: String(puerto), ...variables },
    stdout: "pipe", stderr: "pipe",
  });
  const error = new Response(proceso.stderr).text();
  try {
    const direccion = `http://127.0.0.1:${puerto}`;
    const linea = await primeraLinea(proceso.stdout);
    if (linea !== JSON.stringify({ esquema: 1, direccion }) || proceso.exitCode !== null) {
      throw new Error("El servidor no publico la direccion esperada.");
    }
    return {
      direccion, puerto,
      async detener() {
        try { proceso.kill(); }
        finally { await proceso.exited; }
        const diagnostico = await error;
        if (diagnostico) throw new Error(`Error del servidor: ${diagnostico}`);
      },
    };
  } catch (falla) {
    try { proceso.kill(); }
    finally { await proceso.exited; await error; }
    throw falla;
  }
}
