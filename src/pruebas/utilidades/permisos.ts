import { copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { RespuestaPermiso } from "../../paquetes/rige/aplicacion/respuestas/permiso";
import { copiarEscenario, type OpcionesEscenario } from "./escenario";
import { crearEntornoAislado } from "./entorno-aislado";
import type { DecisionNativa } from "../../herramientas/decisiones-nativas/registro";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";

export interface ConsultaPermiso { agente: string; sujeto?: string; herramienta?: string; objetivo: string; lanzadoPor?: string; explicar?: boolean }
export interface DecisionReferencia extends ConsultaPermiso {
  decision: string; determinante: number; coincidentes: number[]; procedencia: string;
}
export function referenciaDecisiones() {
  return JSON.parse(readFileSync(join(import.meta.dir, "../escenarios/v2-decision/REFERENCIA.json"), "utf8")) as {
    decisiones: DecisionReferencia[];
    decisionesNativas?: DecisionNativa[];
    cadenas: Record<string, { permission: string; pattern: string; action: string }[]>;
  };
}
export function consultarPermisos(consultas: readonly ConsultaPermiso[], modo: "resultado", variante?: string, escenario?: string, opciones?: OpcionesEscenario): { respuestas: ReturnType<typeof consultarPermiso>[]; raiz: string };
export function consultarPermisos(consultas: readonly ConsultaPermiso[], modo?: string, variante?: string, escenario?: string, opciones?: OpcionesEscenario): { respuestas: RespuestaPermiso[]; raiz: string };
export function consultarPermisos(consultas: readonly ConsultaPermiso[], modo = "ultima", variante = "global", escenario = "v2-decision", opciones: OpcionesEscenario = {}) {
  const copia = copiarEscenario(escenario, opciones);
  try {
    const hogar = join(copia.raiz, "hogar");
    if (variante === "sin-edit") copyFileSync(join(copia.raiz, "global-sin-edit.json"), join(hogar, ".config/opencode/opencode.json"));
    if (variante === "primary") copyFileSync(join(copia.raiz, "primary.json"), join(copia.proyecto, "opencode.jsonc"));
    const preparadas = consultas.map(c => ({ ...c, objetivo: c.objetivo.replaceAll("<RAIZ>", copia.raiz) }));
    const entorno = new EntornoLecturaSistema({ plataforma: process.platform,
      entorno: { ...crearEntornoAislado(hogar, process.env), XDG_CONFIG_HOME: join(hogar, ".config"),
        ProgramData: hogar, TEMP: join(hogar, "tmp"), TMP: join(hogar, "tmp") } });
    const adaptador = modo === "primera" ? { ...adaptadorOpenCode, permisos: { ...adaptadorOpenCode.permisos,
      evaluar: (...args: Parameters<typeof adaptadorOpenCode.permisos.evaluar>) => {
        const evaluacion = adaptadorOpenCode.permisos.evaluar(...args);
        return { ...evaluacion, determinante: evaluacion.coincidentes[0] ?? null };
      } } } : adaptadorOpenCode;
    const respuestas = preparadas.map(consulta => {
      const resultado = consultarPermiso({ adaptador, entorno, rutas: { canonica: () => copia.proyecto } },
        { proyecto: copia.proyecto, agente: consulta.agente, objetivo: consulta.objetivo,
          ...(consulta.herramienta === undefined ? { sujeto: consulta.sujeto! } : { herramienta: consulta.herramienta }),
          lanzadoPor: consulta.lanzadoPor, explicar: consulta.explicar === true });
      if (modo === "resultado") return resultado;
      if (!resultado.exito) throw new Error(resultado.error.mensaje);
      return resultado.valor;
    });
    return { respuestas, raiz: copia.raiz.replaceAll("\\", "/") };
  } finally { copia.borrar(); }
}
