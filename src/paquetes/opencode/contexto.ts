import type { ContextoConsulta, ErrorAnalisis } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import { descubrirWorktree } from "./worktree";
import { validarVias } from "./ubicador";
import { detectarVersion } from "./version";
import { versionSoportada } from "./descriptor";

export interface ContextoOpenCode extends ContextoConsulta {
  readonly parametros: {
    readonly hogar: string;
    readonly config: string;
    readonly data: string;
    readonly tmp: string;
    readonly worktree: string;
  };
}

export function contextoOpenCode(proyecto: string, entorno: EntornoLectura): Resultado<ContextoOpenCode, ErrorAnalisis> {
  const declaracionesPath = new Set<string>();
  const version = detectarVersion(entorno, proyecto, declaracionesPath);
  if (version.estado === "distinta") return { exito: false, error: { categoria: "uso", codigo: "version-no-soportada",
    mensaje: `OpenCode instalado en la versión ${version.detectada}, leída de ${version.rutaPaquete.replaceAll("\\", "/")}; RIGE analiza la ${versionSoportada}.` } };
  const vias = validarVias(entorno);
  if (!vias.exito) return vias;
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
  const declaraciones = [...new Set([...declaracionesPath, ...(version.estado === "no-determinada" ? ["version-no-determinada", version.motivo] : []),
    ...descubrimiento.valor.declaraciones])];
  return { exito: true, valor: { proyecto, entorno, declaraciones, parametros: { hogar,
    config: entorno.unir(variable("XDG_CONFIG_HOME") || entorno.unir(hogar, ".config"), "opencode"),
    data: entorno.unir(variable("XDG_DATA_HOME") || entorno.unir(hogar, ".local", "share"), "opencode"),
    tmp: entorno.unir(temporal, "opencode"), worktree: descubrimiento.valor.worktree } } };
}
