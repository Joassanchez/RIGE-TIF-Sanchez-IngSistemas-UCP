import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Cadena } from "../../paquetes/nucleo/resolucion/tipos";
import { copiarEscenario } from "./escenario";
import { crearEntornoAislado } from "./entorno-aislado";
import { normalizarRutas } from "../../herramientas/referencias-nativas/comparar";

export interface ReferenciaCadenas {
  procedencia: { directorio: string; hogar: string; OPENCODE_CONFIG?: string };
  cadenas: Record<string, { permission: string; pattern: string; action: string }[]>;
}

export function consultarCadenas(nombre: string) {
  const referencia = JSON.parse(readFileSync(join(import.meta.dir, "../escenarios", nombre, "REFERENCIA.json"), "utf8")) as ReferenciaCadenas;
  const copia = copiarEscenario(nombre);
  try {
    const hogar = join(copia.raiz, referencia.procedencia.hogar);
    const env = { ...crearEntornoAislado(hogar, process.env), XDG_CONFIG_HOME: join(hogar, ".config"),
      TEMP: join(hogar, "tmp"), TMP: join(hogar, "tmp"), TMPDIR: join(hogar, "tmp"), ProgramData: hogar };
    if (referencia.procedencia.OPENCODE_CONFIG) Object.assign(env, { OPENCODE_CONFIG: join(copia.raiz, referencia.procedencia.OPENCODE_CONFIG) });
    // CLI del arnes: ejecuta el contrato antes de que exista la consulta de decisiones (T2-06).
    const proceso = Bun.spawnSync([process.execPath, "pruebas/utilidades/consultar-cadenas.ts", join(copia.raiz, referencia.procedencia.directorio), ...Object.keys(referencia.cadenas)], {
      cwd: resolve(import.meta.dir, "../.."), env, stdout: "pipe", stderr: "pipe", timeout: 10000,
    });
    if (proceso.exitCode !== 0 || proceso.stderr.length) throw new Error(proceso.stderr.toString());
    const cadenas = JSON.parse(proceso.stdout.toString()) as Record<string, Cadena>;
    return { referencia, cadenas, raiz: copia.raiz, normalizar: (valor: unknown) => normalizarRutas(valor, {
      hogar, data: join(hogar, "opencode"), tmp: join(hogar, "tmp/opencode"),
    }) };
  } finally { copia.borrar(); }
}
