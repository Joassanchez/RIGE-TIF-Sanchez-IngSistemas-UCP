import type { ContextoConsulta, ErrorAnalisis } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import { descubrirWorktree } from "./worktree";

export interface ContextoOpenCode extends ContextoConsulta {
  readonly hogar: string;
  readonly config: string;
  readonly data: string;
  readonly tmp: string;
  readonly worktree: string;
  readonly declaraciones: readonly string[];
}

export function contextoOpenCode(proyecto: string, entorno: EntornoLectura): Resultado<ContextoOpenCode, ErrorAnalisis> {
  const variable = (nombre: string) => entorno.variable(nombre);
  const nombreHogar = entorno.plataforma === "win32" ? "USERPROFILE" : "HOME";
  const hogar = variable(nombreHogar);
  if (!hogar) return { exito: false, error: { categoria: "uso", codigo: "entorno-incompleto",
    mensaje: `Falta la variable ${nombreHogar} para ubicar las entradas globales.` } };
  const descubrimiento = descubrirWorktree(proyecto, entorno);
  if (!descubrimiento.exito) return descubrimiento;
  const temporal = entorno.plataforma === "win32"
    ? variable("TEMP") || variable("TMP") || entorno.unir(variable("SystemRoot") || "C:\\Windows", "temp")
    : variable("TMPDIR") || variable("TMP") || variable("TEMP") || "/tmp";
  return { exito: true, valor: { proyecto, entorno, hogar,
    config: entorno.unir(variable("XDG_CONFIG_HOME") || entorno.unir(hogar, ".config"), "opencode"),
    data: entorno.unir(variable("XDG_DATA_HOME") || entorno.unir(hogar, ".local", "share"), "opencode"),
    tmp: entorno.unir(temporal, "opencode"), ...descubrimiento.valor } };
}
