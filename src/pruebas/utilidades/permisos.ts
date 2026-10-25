import { copyFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { RespuestaPermiso } from "../../paquetes/rige/aplicacion/respuestas/permiso";
import { copiarEscenario, type OpcionesEscenario } from "./escenario";
import { crearEntornoAislado } from "./entorno-aislado";

export interface ConsultaPermiso { agente: string; sujeto?: string; herramienta?: string; objetivo: string; lanzadoPor?: string }
export interface DecisionReferencia extends ConsultaPermiso {
  decision: string; determinante: number; coincidentes: number[]; procedencia: string;
}
export function referenciaDecisiones() {
  return JSON.parse(readFileSync(join(import.meta.dir, "../escenarios/v2-decision/REFERENCIA.json"), "utf8")) as {
    decisiones: DecisionReferencia[];
    cadenas: Record<string, { permission: string; pattern: string; action: string }[]>;
  };
}
export function consultarPermisos(consultas: readonly ConsultaPermiso[], modo = "ultima", variante = "global", escenario = "v2-decision", opciones: OpcionesEscenario = {}) {
  const copia = copiarEscenario(escenario, opciones);
  try {
    const hogar = join(copia.raiz, "hogar");
    if (variante === "sin-edit") copyFileSync(join(copia.raiz, "global-sin-edit.json"), join(hogar, ".config/opencode/opencode.json"));
    if (variante === "primary") copyFileSync(join(copia.raiz, "primary.json"), join(copia.proyecto, "opencode.jsonc"));
    const preparadas = consultas.map(c => ({ ...c, objetivo: c.objetivo.replaceAll("<RAIZ>", copia.raiz) }));
    const proceso = Bun.spawnSync([process.execPath, "pruebas/utilidades/consultar-permisos.ts", copia.proyecto, JSON.stringify(preparadas), modo], {
      cwd: resolve(import.meta.dir, "../.."), env: { ...crearEntornoAislado(hogar, process.env),
        XDG_CONFIG_HOME: join(hogar, ".config"), ProgramData: hogar, TEMP: join(hogar, "tmp"), TMP: join(hogar, "tmp") },
      stdout: "pipe", stderr: "pipe", timeout: 10000,
    });
    if (proceso.exitCode !== 0 || proceso.stderr.length) throw new Error(proceso.stderr.toString());
    return { respuestas: JSON.parse(proceso.stdout.toString()) as RespuestaPermiso[], raiz: copia.raiz.replaceAll("\\", "/") };
  } finally { copia.borrar(); }
}
