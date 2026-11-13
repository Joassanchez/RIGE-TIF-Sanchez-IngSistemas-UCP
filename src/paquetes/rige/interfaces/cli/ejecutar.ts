import { versionEsquemaSalida } from "../../aplicacion/respuestas/valores";
import type { RespuestaAdvertencia, RespuestaTiempos } from "../../aplicacion/respuestas/contrato-generado";
import type { MedicionAnalisis } from "../../aplicacion/casos-uso/analizar-proyecto";
import { parseArgs } from "node:util";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { ayuda } from "./ayuda";
import type { ContextoPresentacion } from "./texto/index";
import { definicionOpciones, subcomandos, ordenFaltaSubcomando, type CasosUsoCli } from "./subcomandos";
import { sugerir } from "./sugerencias";

export type { CasosUsoCli };

export interface CanalesCli {
  readonly versionHerramienta?: string;
  readonly esConsola?: boolean;
  readonly ancho?: number | undefined;
  readonly colorHabilitado?: boolean;
  readonly carpetaActual?: string;
  escribirSalida(texto: string): void;
  escribirError(texto: string): void;
}

const opcionesReconocidas: readonly string[] = Object.keys(definicionOpciones);

function opcionesAdmitidas(sub: (typeof subcomandos)[number]): readonly string[] {
  return [
    ...sub.opciones,
    "json",
    "texto",
    "depurar",
    ...(sub.consultaProyecto ? ["tiempos"] : []),
  ];
}

function sugerirOpcion(nombre: string, sub: (typeof subcomandos)[number]): string | undefined {
  const candidata = sugerir(nombre, opcionesAdmitidas(sub));
  return candidata === undefined ? undefined : `--${candidata}`;
}

function sugerirSubcomando(comando: string): string | undefined {
  return sugerir(comando, subcomandos.map(s => s.nombre));
}

function pista(codigo: string): string {
  if (codigo === "almacen-sin-esquema") return "Probá: bun run rige -- esquema\n";
  if (codigo === "argumentos-invalidos") return "Usá --help\n";
  return "";
}

function escribirError(
  canales: CanalesCli,
  error: { readonly codigo: string; readonly mensaje: string; readonly stack?: string | undefined; readonly sugerencia?: string | undefined },
  contexto: ContextoPresentacion
): void {
  if (contexto.formato === "texto") {
    const sugerencia = error.sugerencia ? `¿Quisiste decir ${error.sugerencia}?\n` : "";
    canales.escribirError(`Error: ${error.mensaje}\n${sugerencia}${pista(error.codigo)}${error.stack ? error.stack + "\n" : ""}`);
    return;
  }
  const errorJson = { codigo: error.codigo, mensaje: error.mensaje, ...(error.stack ? { stack: error.stack } : {}) };
  canales.escribirError(JSON.stringify({ esquema: versionEsquemaSalida, error: errorJson }) + "\n");
}

function argumentosInvalidos(canales: CanalesCli, mensaje: string, contexto: ContextoPresentacion, sugerencia?: string): number {
  escribirError(canales, { codigo: "argumentos-invalidos", mensaje, sugerencia }, contexto);
  return 2;
}

interface ConAvisos {
  readonly declaraciones: readonly string[];
  readonly reglas: Readonly<Record<string, string>>;
}

function tieneAvisos(valor: unknown): valor is ConAvisos {
  if (typeof valor !== "object" || valor === null) return false;
  if (!("declaraciones" in valor) || !("reglas" in valor)) return false;
  return Array.isArray(valor.declaraciones)
    && typeof valor.reglas === "object" && valor.reglas !== null;
}

export function ejecutarCli(
  argumentos: readonly string[],
  ensamblar: (medicion?: MedicionAnalisis) => CasosUsoCli,
  canales: CanalesCli,
  advertidas: readonly string[] = [],
  limitesGenerales: readonly string[] = []
): number {
  const inicio = performance.now();
  const json = argumentos.includes("--json");
  const texto = argumentos.includes("--texto");
  const contexto: ContextoPresentacion = {
    formato: json ? "json" : texto || canales.esConsola === true ? "texto" : "json",
    ancho: Math.max(40, canales.ancho && Number.isFinite(canales.ancho) ? canales.ancho : 100),
    esConsola: canales.esConsola === true,
    colorHabilitado: canales.esConsola === true && canales.colorHabilitado === true,
    todo: false,
    proyectoDesdeCarpetaActual: false,
    limitesGenerales: new Set(limitesGenerales),
  };
  const invalidos = (mensaje: string, sugerencia?: string) => argumentosInvalidos(canales, mensaje, contexto, sugerencia);
  if (json && texto) return invalidos("--json y --texto son excluyentes.");
  if (argumentos.includes("--help") || argumentos.includes("-h")) {
    canales.escribirSalida(ayuda(argumentos.find(a => subcomandos.some(s => s.nombre === a)))); return 0;
  }
  if (argumentos.includes("--version")) {
    const versionHerramienta = canales.versionHerramienta;
    if (versionHerramienta === undefined) throw new Error("Falta la versión soportada en el ensamblado de la CLI.");
    canales.escribirSalida(json ? JSON.stringify({ esquema: versionEsquemaSalida, versionRige, versionHerramienta }) + "\n"
      : `RIGE ${versionRige} · OpenCode ${versionHerramienta}\n`); return 0;
  }
  const parsearEstricto = () => parseArgs({
    args: [...argumentos],
    options: definicionOpciones,
    strict: true,
    allowPositionals: true,
  });
  let opciones: ReturnType<typeof parsearEstricto>;
  try {
    opciones = parsearEstricto();
  } catch {
    const noEstricto = parseArgs({
      args: [...argumentos],
      options: definicionOpciones,
      strict: false,
      allowPositionals: true,
    });
    const posicional = noEstricto.positionals[0];
    const sub = posicional ? subcomandos.find(s => s.nombre === posicional) : undefined;
    let sugerencia: string | undefined;
    if (sub) {
      for (const nombre of Object.keys(noEstricto.values)) {
        if (!opcionesReconocidas.includes(nombre)) {
          sugerencia = sugerirOpcion(nombre, sub);
          if (sugerencia !== undefined) break;
        }
      }
    }
    return invalidos(`Argumentos inválidos: ${argumentos.join(" ")}.`, sugerencia);
  }
  const posicionales = opciones.positionals;
  if (posicionales.length === 0) {
    if (contexto.formato === "texto") { canales.escribirError(ayuda()); return 2; }
    return invalidos(`Falta el subcomando ${ordenFaltaSubcomando.join(" o ")}.`);
  }
  if (posicionales.length > 1) return invalidos(`Posicionales inválidos: ${posicionales.join(" ")}.`);
  const comando = posicionales[0]!;
  const sub = subcomandos.find(s => s.nombre === comando);
  if (!sub) {
    return invalidos(`Subcomando desconocido: ${comando}.`, sugerirSubcomando(comando));
  }
  for (const nombre of Object.keys(opciones.values)) {
    if (!opcionesAdmitidas(sub).includes(nombre)) {
      return invalidos(`${comando} no admite --${nombre}.`, sugerirOpcion(nombre, sub));
    }
  }
  const interpretado = sub.interpretar({ valores: opciones.values, carpetaActual: canales.carpetaActual });
  if (typeof interpretado === "string") return invalidos(interpretado);

  try {
    const medir = opciones.values.tiempos === true;
    let finLectura: number | undefined;
    const medicion: MedicionAnalisis | undefined = medir ? { finalizarLectura() {
      if (finLectura !== undefined) throw new Error("La lectura ya fue medida.");
      finLectura = performance.now();
    } } : undefined;
    const casos = ensamblar(medicion);
    const inicioConsulta = performance.now();
    const resultado = sub.ejecutar(casos, interpretado);
    const finConsulta = performance.now();
    if (!resultado.exito) {
      escribirError(canales, resultado.error, contexto);
      return 1;
    }
    const advertencias: RespuestaAdvertencia[] = [];
    if (sub.consultaProyecto && tieneAvisos(resultado.valor)) {
      for (const codigo of resultado.valor.declaraciones) {
        if (!advertidas.includes(codigo)) continue;
        const mensaje = resultado.valor.reglas[codigo];
        if (mensaje === undefined) throw new Error(`Falta la plantilla de ${codigo}.`);
        advertencias.push({ esquema: versionEsquemaSalida, advertencia: { codigo, mensaje } });
      }
    }
    if (medir && finLectura === undefined) throw new Error("El caso de uso no informo el limite de lectura.");
    const lectura = finLectura;
    const inicioSalida = performance.now();
    const presentacion: ContextoPresentacion = { ...contexto, todo: opciones.values.todo === true,
      proyectoDesdeCarpetaActual: opciones.values.proyecto === undefined, explicar: opciones.values.explicar === true,
      agente: typeof opciones.values.agente === "string" ? opciones.values.agente : undefined };
    canales.escribirSalida(contexto.formato === "json" ? JSON.stringify(resultado.valor) + "\n" : sub.renderizar(resultado.valor, presentacion));
    const finSalida = performance.now();
    for (const advertencia of advertencias) canales.escribirError(contexto.formato === "json" ? JSON.stringify(advertencia) + "\n"
      : `Advertencia: ${advertencia.advertencia.mensaje}\n`);
    if (medir && lectura !== undefined) {
      const respuesta: RespuestaTiempos = { esquema: versionEsquemaSalida, tiempos: {
        arranqueMs: inicioConsulta - inicio, lecturaMs: lectura - inicioConsulta,
        resolucionMs: finConsulta - lectura, salidaMs: finSalida - inicioSalida,
        totalMs: performance.now() - inicio,
      } };
      canales.escribirError(JSON.stringify(respuesta) + "\n");
    }
    return 0;
  } catch (falla) {
    const error = {
      codigo: "interno", mensaje: "Falla interna de RIGE.",
      ...(opciones.values.depurar && falla instanceof Error ? { stack: falla.stack } : {}),
    };
    escribirError(canales, error, contexto);
    return 70;
  }
}
