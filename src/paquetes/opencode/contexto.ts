import type { ContextoConsulta, ContextoResolucion, ErrorAnalisis } from "@rige/nucleo/contrato/adaptador";
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

const parametrosRequeridos = ["hogar", "config", "data", "tmp", "worktree"] as const;

function errorContextoInvalido(detalle: string): ErrorAnalisis {
  return {
    categoria: "uso",
    codigo: "almacen-sin-esquema",
    mensaje: `El contexto guardado en el almacén no tiene el esquema esperado (${detalle}). Ejecute bun run esquema.`,
  };
}

export function restaurarContextoOpenCode(
  datos: Omit<ContextoResolucion, "plataforma">,
  entorno: EntornoLectura,
): Resultado<ContextoOpenCode, ErrorAnalisis> {
  const crudo: unknown = datos;
  if (typeof crudo !== "object" || crudo === null || Array.isArray(crudo)) {
    return { exito: false, error: errorContextoInvalido("contexto inválido") };
  }
  const objeto = crudo as Record<string, unknown>;
  const proyecto = Object.hasOwn(objeto, "proyecto") ? objeto.proyecto : undefined;
  if (typeof proyecto !== "string" || !proyecto) {
    return { exito: false, error: errorContextoInvalido("falta proyecto") };
  }
  const declaraciones = Object.hasOwn(objeto, "declaraciones") ? objeto.declaraciones : undefined;
  if (!Array.isArray(declaraciones) || declaraciones.some(d => typeof d !== "string")) {
    return { exito: false, error: errorContextoInvalido("declaraciones inválidas") };
  }
  const parametros = Object.hasOwn(objeto, "parametros") ? objeto.parametros : undefined;
  if (typeof parametros !== "object" || parametros === null || Array.isArray(parametros)) {
    return { exito: false, error: errorContextoInvalido("faltan parámetros") };
  }
  const registro = parametros as Record<string, unknown>;
  for (const clave of parametrosRequeridos) {
    if (!Object.hasOwn(registro, clave) || typeof registro[clave] !== "string" || !registro[clave]) {
      return { exito: false, error: errorContextoInvalido(`falta parametros.${clave}`) };
    }
  }
  return {
    exito: true,
    valor: {
      proyecto,
      entorno,
      declaraciones: [...(declaraciones as readonly string[])],
      parametros: {
        hogar: registro.hogar as string,
        config: registro.config as string,
        data: registro.data as string,
        tmp: registro.tmp as string,
        worktree: registro.worktree as string,
      },
    },
  };
}
