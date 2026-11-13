import { versionEsquemaSalida } from "../../aplicacion/respuestas/valores";
import type { RespuestaAdvertencia, RespuestaTiempos } from "../../aplicacion/respuestas/contrato-generado";
import type { MedicionAnalisis } from "../../aplicacion/casos-uso/analizar-proyecto";
import { parseArgs } from "node:util";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { ayuda } from "./ayuda";
import { pintar, type ContextoPresentacion } from "./texto/index";
import { definicionOpciones, subcomandos, ordenFaltaSubcomando, esErrorInterpretacion, type CasosUsoCli } from "./subcomandos";
import { sugerir } from "./sugerencias";

export type { CasosUsoCli };

export function colorEnCanal(
  esTty: boolean,
  entorno: Readonly<Record<string, string | undefined>>
): boolean {
  if (entorno.NO_COLOR !== undefined) return false;
  if (entorno.TERM === "dumb") return false;
  const force = entorno.FORCE_COLOR;
  if (force !== undefined && force !== "" && force !== "0") return true;
  return esTty;
}

export interface CanalesCli {
  readonly versionHerramienta?: string;
  readonly esConsola?: boolean;
  readonly ancho?: number | undefined;
  readonly colorHabilitado?: boolean;
  readonly colorErrorHabilitado?: boolean;
  readonly carpetaActual?: string;
  readonly hogar?: string;
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

function pista(codigo: string, colorError: boolean, subcomando?: string): string {
  if (codigo === "almacen-sin-esquema") {
    return `Probá: ${pintar("pista", "bun run rige -- esquema", { colorHabilitado: colorError })}\n`;
  }
  if (codigo === "agente-sin-declaraciones") {
    return `Probá: ${pintar("pista", "rige agentes", { colorHabilitado: colorError })}\n`;
  }
  if (codigo === "entrada-ilegible") {
    return `Probá: ${pintar("pista", "rige hallazgos", { colorHabilitado: colorError })}\n`;
  }
  if (codigo === "argumentos-invalidos") {
    const cmd = subcomando ? `rige ${subcomando} --help` : "rige --help";
    return `Probá: ${pintar("pista", cmd, { colorHabilitado: colorError })}\n`;
  }
  return "";
}

function mensajeErrorTexto(codigo: string, mensaje: string): string {
  if (codigo === "resolucion-inexistente") {
    return mensaje.replace("la resolución", "el análisis");
  }
  if (codigo === "resoluciones-de-otro-proyecto") {
    return mensaje.replace("Las resoluciones", "Los análisis");
  }
  if (codigo === "agente-sin-declaraciones") {
    const coincidencia = mensaje.match(/^El agente (.+) no tiene declaraciones\.$/);
    if (coincidencia) return `No existe el agente "${coincidencia[1]}".`;
  }
  if (codigo === "almacen-sin-esquema") {
    return mensaje
      .replace(" Ejecute bun run esquema.", "")
      .replace(" Muévalo o bórrelo y ejecute bun run esquema.", " Movelo o borralo.");
  }
  return mensaje;
}

function escribirError(
  canales: CanalesCli,
  error: {
    readonly codigo: string;
    readonly mensaje: string;
    readonly mensajeTexto?: string | undefined;
    readonly stack?: string | undefined;
    readonly sugerencia?: string | undefined;
    readonly subcomando?: string | undefined;
  },
  contexto: ContextoPresentacion,
  colorError: boolean
): void {
  if (contexto.formato === "texto") {
    const rotulo = colorError ? "\x1b[1;31mError:\x1b[0m" : "Error:";
    const sug = error.sugerencia ? pintar("pista", error.sugerencia, { colorHabilitado: colorError }) : "";
    const sugerencia = error.sugerencia ? `¿Quisiste decir ${sug}?\n` : "";
    const mensaje = error.mensajeTexto ?? mensajeErrorTexto(error.codigo, error.mensaje);
    canales.escribirError(`${rotulo} ${mensaje}\n${sugerencia}${pista(error.codigo, colorError, error.subcomando)}${error.stack ? error.stack + "\n" : ""}`);
    return;
  }
  const errorJson = { codigo: error.codigo, mensaje: error.mensaje, ...(error.stack ? { stack: error.stack } : {}) };
  canales.escribirError(JSON.stringify({ esquema: versionEsquemaSalida, error: errorJson }) + "\n");
}

function argumentosInvalidos(
  canales: CanalesCli,
  mensaje: string,
  contexto: ContextoPresentacion,
  colorError: boolean,
  sugerencia?: string,
  mensajeTexto?: string,
  subcomando?: string
): number {
  escribirError(canales, { codigo: "argumentos-invalidos", mensaje, mensajeTexto, sugerencia, subcomando }, contexto, colorError);
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
  const colorError = canales.colorErrorHabilitado === true;
  const contexto: ContextoPresentacion = {
    formato: json ? "json" : texto || canales.esConsola === true ? "texto" : "json",
    ancho: Math.max(40, canales.ancho && Number.isFinite(canales.ancho) ? canales.ancho : 100),
    esConsola: canales.esConsola === true,
    colorHabilitado: canales.colorHabilitado === true,
    todo: false,
    proyectoDesdeCarpetaActual: false,
    hogar: canales.hogar,
    limitesGenerales: new Set(limitesGenerales),
  };
  const invalidos = (mensaje: string, sugerencia?: string, mensajeTexto?: string, subcomando?: string) =>
    argumentosInvalidos(canales, mensaje, contexto, colorError, sugerencia, mensajeTexto, subcomando);
  if (json && texto) return invalidos("--json y --texto son excluyentes.");
  const esComandoHelp = argumentos[0] === "help";
  if (esComandoHelp || argumentos.includes("--help") || argumentos.includes("-h")) {
    const argsAyuda = esComandoHelp ? argumentos.slice(1) : argumentos;
    const parseadoAyuda = parseArgs({
      args: [...argsAyuda],
      options: { ...definicionOpciones, help: { type: "boolean", short: "h" } },
      strict: false,
      allowPositionals: true,
    });
    const primero = parseadoAyuda.positionals[0];
    if (primero !== undefined && !subcomandos.some(s => s.nombre === primero)) {
      return invalidos(`Subcomando desconocido: ${primero}.`, sugerirSubcomando(primero));
    }
    canales.escribirSalida(ayuda(primero, canales.versionHerramienta)); return 0;
  }
  if (argumentos.includes("--version") || argumentos.includes("-v") || argumentos.includes("-V")) {
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
  } catch (fallaParse) {
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
    const codigoParse = fallaParse instanceof Error && "code" in fallaParse ? fallaParse.code : undefined;
    const opcionEnMensaje = fallaParse instanceof Error ? fallaParse.message.match(/--?[a-zA-Z0-9-]+/)?.[0] : undefined;
    let mensajeTexto: string | undefined;
    if (codigoParse === "ERR_PARSE_ARGS_UNKNOWN_OPTION" && opcionEnMensaje) {
      mensajeTexto = `Opción desconocida: ${opcionEnMensaje}.`;
    } else if (codigoParse === "ERR_PARSE_ARGS_INVALID_OPTION_VALUE" && opcionEnMensaje) {
      mensajeTexto = `Falta el valor de ${opcionEnMensaje}.`;
    }
    return invalidos(`Argumentos inválidos: ${argumentos.join(" ")}.`, sugerencia, mensajeTexto, sub?.nombre);
  }
  const posicionales = opciones.positionals;
  if (posicionales.length === 0) {
    if (contexto.formato === "texto") { canales.escribirError(ayuda(undefined, canales.versionHerramienta)); return 2; }
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
      return invalidos(`${comando} no admite --${nombre}.`, sugerirOpcion(nombre, sub), undefined, sub.nombre);
    }
  }
  const interpretado = sub.interpretar({ valores: opciones.values, carpetaActual: canales.carpetaActual });
  if (esErrorInterpretacion(interpretado)) {
    return invalidos(interpretado.json, undefined, interpretado.texto, sub.nombre);
  }

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
      escribirError(canales, resultado.error, contexto, colorError);
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
      agente: typeof opciones.values.agente === "string" ? opciones.values.agente : undefined,
      proyecto: typeof resultado.valor === "object" && resultado.valor !== null && "proyecto" in resultado.valor && typeof resultado.valor.proyecto === "string"
        ? resultado.valor.proyecto
        : undefined };
    canales.escribirSalida(contexto.formato === "json" ? JSON.stringify(resultado.valor) + "\n" : sub.renderizar(resultado.valor, presentacion));
    const finSalida = performance.now();
    const avisoRotulo = pintar("pregunta", "Advertencia:", { colorHabilitado: colorError });
    for (const advertencia of advertencias) canales.escribirError(contexto.formato === "json" ? JSON.stringify(advertencia) + "\n"
      : `${avisoRotulo} ${advertencia.advertencia.mensaje}\n`);
    if (medir && lectura !== undefined) {
      const respuesta: RespuestaTiempos = { esquema: versionEsquemaSalida, tiempos: {
        arranqueMs: inicioConsulta - inicio, lecturaMs: lectura - inicioConsulta,
        resolucionMs: finConsulta - lectura, salidaMs: finSalida - inicioSalida,
        totalMs: performance.now() - inicio,
      } };
      canales.escribirError(JSON.stringify(respuesta) + "\n");
    }
    return sub.codigoSalida ? sub.codigoSalida(resultado.valor, interpretado) : 0;
  } catch (falla) {
    const error = {
      codigo: "interno", mensaje: "Falla interna de RIGE.",
      ...(opciones.values.depurar && falla instanceof Error ? { stack: falla.stack } : {}),
    };
    escribirError(canales, error, contexto, colorError);
    return 70;
  }
}
