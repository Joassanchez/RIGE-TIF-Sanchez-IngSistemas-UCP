import type { ConsultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import type { ConsultarValores } from "../../aplicacion/casos-uso/consultar-valores";
import type { consultarPermiso } from "../../aplicacion/casos-uso/consultar-permiso";
import type { consultarReglas } from "../../aplicacion/casos-uso/consultar-reglas";
import type { ConsultarAgentes } from "../../aplicacion/casos-uso/consultar-agentes";
import type { ConsultarHallazgos } from "../../aplicacion/casos-uso/consultar-hallazgos";
import type { ConsultarEntradas } from "../../aplicacion/casos-uso/consultar-entradas";
import type { CompararResoluciones } from "../../aplicacion/casos-uso/comparar-resoluciones";
import type { ConsultarProyectosRecientes } from "../../aplicacion/casos-uso/consultar-proyectos-recientes";
import { versionEsquemaSalida } from "../../aplicacion/respuestas/valores";
import type { ErrorUso } from "../../aplicacion/errores";
import type { RespuestaEstado } from "../../aplicacion/respuestas/estado";
import type { RespuestaAdvertencia, RespuestaTiempos } from "../../aplicacion/respuestas/contrato-generado";
import type { MedicionAnalisis } from "../../aplicacion/casos-uso/analizar-proyecto";
import type { Resultado } from "../../aplicacion/respuestas/resultado";
import { parseArgs } from "node:util";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { ayuda } from "./ayuda";
import { renderizar, type ContextoPresentacion } from "./texto/index";

export interface CasosUsoCli {
  readonly compararResoluciones: CompararResoluciones;
  readonly consultarProyectosRecientes: ConsultarProyectosRecientes;
  readonly consultarReglas: (solicitud: Parameters<typeof consultarReglas>[1]) => ReturnType<typeof consultarReglas>;
  readonly consultarValores: ConsultarValores;
  readonly consultarPermiso: (...args: Parameters<typeof consultarPermiso> extends [unknown, ...infer R] ? R : never) => ReturnType<typeof consultarPermiso>;
  readonly consultarAgentes: ConsultarAgentes;
  readonly consultarEntradas: ConsultarEntradas;
  readonly consultarHallazgos: ConsultarHallazgos;
  readonly prepararAlmacen: () => Resultado<RespuestaEstado, ErrorUso>;
  readonly consultarEstado: ConsultarEstado;
  readonly iniciarServidor: () => Resultado<{ readonly direccion: string }, ErrorUso>;
}

export type Ensamblado = Resultado<CasosUsoCli, ErrorUso>;

interface OpcionesConsulta { readonly proyecto: string; readonly agente: string; readonly clave: string | undefined;
  readonly desde: string; readonly hasta: string;
  readonly herramienta: string | undefined; readonly sujeto: string | undefined; readonly objetivo: string;
  readonly lanzadoPor: string | undefined; readonly explicar: boolean }

const subcomandos = {
  comparar: (casos, opciones) => casos.compararResoluciones(opciones.desde, opciones.hasta),
  recientes: (casos) => casos.consultarProyectosRecientes(),
  reglas: (casos, opciones) => casos.consultarReglas({ proyecto: opciones.proyecto, agente: opciones.agente, lanzadoPor: opciones.lanzadoPor }),
  esquema: (casos) => casos.prepararAlmacen(),
  estado: (casos) => {
    const resultado = casos.consultarEstado();
    if (!resultado.exito) return resultado;
    return { exito: true, valor: { esquema: versionEsquemaSalida,
      almacen: { ruta: resultado.valor.almacen.ruta, existe: true, versionEsquema: resultado.valor.almacen.versionEsquema } } };
  },
  valores: (casos, opciones) => casos.consultarValores(opciones.proyecto, opciones.agente, opciones.clave),
  agentes: (casos, opciones) => casos.consultarAgentes(opciones.proyecto),
  entradas: (casos, opciones) => casos.consultarEntradas(opciones.proyecto),
  hallazgos: (casos, opciones) => casos.consultarHallazgos(opciones.proyecto, { explicar: Boolean(opciones.explicar) }),
  permiso: (casos, opciones) => casos.consultarPermiso({ proyecto: opciones.proyecto, agente: opciones.agente,
    ...(opciones.herramienta === undefined ? { sujeto: opciones.sujeto! } : { herramienta: opciones.herramienta }),
    objetivo: opciones.objetivo, lanzadoPor: opciones.lanzadoPor, explicar: opciones.explicar }),
  servir: (casos) => {
    const estado = casos.consultarEstado();
    if (!estado.exito) return estado;
    const servidor = casos.iniciarServidor();
    if (!servidor.exito) return servidor;
    return { exito: true, valor: { esquema: versionEsquemaSalida, direccion: servidor.valor.direccion } };
  },
} satisfies Record<string, (casos: CasosUsoCli, opciones: OpcionesConsulta) => Resultado<object, ErrorUso>>;

export interface CanalesCli {
  readonly esConsola?: boolean;
  readonly ancho?: number | undefined;
  readonly colorHabilitado?: boolean;
  readonly carpetaActual?: string;
  escribirSalida(texto: string): void;
  escribirError(texto: string): void;
}

function escribirError(canales: CanalesCli, error: { readonly codigo: string; readonly mensaje: string; readonly stack?: string | undefined }, contexto: ContextoPresentacion): void {
  if (contexto.formato === "texto") {
    canales.escribirError(`Error: ${error.mensaje}\n${error.codigo === "almacen-sin-esquema" ? "Probá: bun run rige -- esquema\n" : error.codigo === "argumentos-invalidos" ? "Usá --help\n" : ""}${error.stack ? error.stack + "\n" : ""}`);
    return;
  }
  canales.escribirError(JSON.stringify({ esquema: versionEsquemaSalida, error }) + "\n");
}

function argumentosInvalidos(canales: CanalesCli, mensaje: string, contexto: ContextoPresentacion): number {
  escribirError(canales, { codigo: "argumentos-invalidos", mensaje }, contexto);
  return 2;
}

export function ejecutarCli(argumentos: readonly string[], ensamblar: (comando: string, medicion?: MedicionAnalisis) => Ensamblado, canales: CanalesCli, advertidas: readonly string[] = []): number {
  const inicio = performance.now();
  const json = argumentos.includes("--json");
  const texto = argumentos.includes("--texto");
  const contexto: ContextoPresentacion = {
    formato: json ? "json" : texto || canales.esConsola === true ? "texto" : "json",
    ancho: Math.max(40, canales.ancho && Number.isFinite(canales.ancho) ? canales.ancho : 100),
    esConsola: canales.esConsola === true, colorHabilitado: canales.esConsola === true && canales.colorHabilitado === true,
    todo: false, proyectoDesdeCarpetaActual: false,
  };
  const invalidos = (mensaje: string) => argumentosInvalidos(canales, mensaje, contexto);
  if (json && texto) return invalidos("--json y --texto son excluyentes.");
  if (argumentos.includes("--help") || argumentos.includes("-h")) {
    canales.escribirSalida(ayuda(argumentos.find(a => Object.hasOwn(subcomandos, a)))); return 0;
  }
  if (argumentos.includes("--version")) {
    canales.escribirSalida(json ? JSON.stringify({ esquema: versionEsquemaSalida, versionRige, versionHerramienta: "1.18.25" }) + "\n"
      : `RIGE ${versionRige} · OpenCode 1.18.25\n`); return 0;
  }
  let opciones: ReturnType<typeof parseArgs>;
  try {
    opciones = parseArgs({
      args: [...argumentos], options: {
        depurar: { type: "boolean" }, proyecto: { type: "string" }, agente: { type: "string" }, clave: { type: "string" },
        herramienta: { type: "string" }, sujeto: { type: "string" }, objetivo: { type: "string" },
        "lanzado-por": { type: "string" }, explicar: { type: "boolean" }, tiempos: { type: "boolean" },
        desde: { type: "string" }, hasta: { type: "string" },
        json: { type: "boolean" }, texto: { type: "boolean" }, todo: { type: "boolean" },
      }, strict: true, allowPositionals: true,
    });
  } catch {
    return invalidos(`Argumentos inválidos: ${argumentos.join(" ")}.`);
  }
  const posicionales = opciones.positionals;
  if (posicionales.length === 0) {
    if (contexto.formato === "texto") { canales.escribirError(ayuda()); return 2; }
    return invalidos(`Falta el subcomando ${Object.keys(subcomandos).filter(c => c !== "estado").join(" o ")}.`);
  }
  if (posicionales.length > 1) return invalidos(`Posicionales inválidos: ${posicionales.join(" ")}.`);
  if (!Object.hasOwn(subcomandos, posicionales[0]!)) {
    return invalidos(`Subcomando desconocido: ${posicionales[0]}.`);
  }
  const { agente, clave, herramienta, sujeto, objetivo, explicar, desde, hasta, "lanzado-por": lanzadoPor } = opciones.values;
  const proyecto = opciones.values.proyecto ?? canales.carpetaActual;
  const comando = posicionales[0]!;
  const admitidas: Record<string, readonly string[]> = {
    comparar: ["desde", "hasta", "agente"], recientes: [],
    reglas: ["proyecto", "agente", "lanzado-por", "todo"],
    valores: ["proyecto", "agente", "clave", "todo"], agentes: ["proyecto", "explicar"], entradas: ["proyecto"], hallazgos: ["proyecto", "explicar"],
    permiso: ["proyecto", "agente", "herramienta", "sujeto", "objetivo", "lanzado-por", "explicar"], esquema: [], servir: [], estado: [],
  };
  for (const nombre of Object.keys(opciones.values)) {
    if (!["depurar", "json", "texto"].includes(nombre) && !(nombre === "tiempos" && !["esquema", "servir", "comparar", "recientes", "estado"].includes(comando))
      && !admitidas[comando]!.includes(nombre)) return invalidos(`${comando} no admite --${nombre}.`);
  }
  const noVacio = (valor: unknown): valor is string => typeof valor === "string" && Boolean(valor.trim());
  const idValido = (id: unknown): boolean => typeof id === "string" && id.length > 0 && !/[^0-9]/.test(id)
    && Number.isSafeInteger(Number(id)) && Number(id) > 0;
  if (comando === "comparar" && (!idValido(desde) || !idValido(hasta) || (agente !== undefined && !noVacio(agente)))) {
    return invalidos("comparar requiere --desde y --hasta enteros positivos decimales seguros; --agente no puede estar vacío.");
  }
  if (posicionales[0] === "valores") {
    if (typeof proyecto !== "string" || !proyecto.trim() || typeof agente !== "string" || !agente.trim()
      || (clave !== undefined && (typeof clave !== "string" || !clave.trim()))) {
      return invalidos("valores requiere --agente no vacío; --proyecto y --clave son opcionales y no pueden estar vacíos.");
    }
  } else if (comando === "reglas" && (!noVacio(proyecto) || !noVacio(agente) || (lanzadoPor !== undefined && !noVacio(lanzadoPor)))) {
    return invalidos("reglas requiere --agente; --proyecto y --lanzado-por son opcionales y no pueden estar vacíos.");
  } else if (["agentes", "entradas", "hallazgos"].includes(comando) && !noVacio(proyecto)) {
    return invalidos(`${comando} admite --proyecto opcional, no vacío.`);
  } else if (comando === "permiso" && (!noVacio(proyecto) || !noVacio(agente) || !noVacio(objetivo)
    || (herramienta !== undefined) === (sujeto !== undefined) || !noVacio(herramienta ?? sujeto)
    || (lanzadoPor !== undefined && !noVacio(lanzadoPor)))) {
    return invalidos("permiso requiere --agente, --objetivo y --herramienta o --sujeto excluyentes; --proyecto y --lanzado-por son opcionales y no pueden estar vacíos.");
  }
  try {
    const medir = opciones.values.tiempos === true;
    let finLectura: number | undefined;
    const medicion: MedicionAnalisis | undefined = medir ? { finalizarLectura() {
      if (finLectura !== undefined) throw new Error("La lectura ya fue medida.");
      finLectura = performance.now();
    } } : undefined;
    const casos = ensamblar(comando, medicion);
    if (!casos.exito) {
      escribirError(canales, casos.error, contexto);
      return 1;
    }
    const inicioConsulta = performance.now();
    const resultado = subcomandos[posicionales[0] as keyof typeof subcomandos](casos.valor, {
      proyecto: proyecto as string, agente: agente as string, clave: clave as string | undefined,
      desde: desde as string, hasta: hasta as string,
      herramienta: herramienta as string | undefined, sujeto: sujeto as string | undefined, objetivo: objetivo as string,
      lanzadoPor: lanzadoPor as string | undefined, explicar: explicar === true,
    });
    const finConsulta = performance.now();
    if (!resultado.exito) {
      escribirError(canales, resultado.error, contexto);
      return 1;
    }
    const advertencias: RespuestaAdvertencia[] = [];
    if (["valores", "permiso", "reglas", "agentes", "entradas", "hallazgos"].includes(comando) && "declaraciones" in resultado.valor && "reglas" in resultado.valor) {
      for (const codigo of resultado.valor.declaraciones) {
        if (!advertidas.includes(codigo)) continue;
        const mensaje = resultado.valor.reglas[codigo];
        if (mensaje === undefined) throw new Error(`Falta la plantilla de ${codigo}.`);
        advertencias.push({ esquema: versionEsquemaSalida, advertencia: { codigo, mensaje } });
      }
    }
    if (medir && finLectura === undefined) throw new Error("El caso de uso no informo el limite de lectura.");
    const inicioSalida = performance.now();
    const presentacion: ContextoPresentacion = { ...contexto, todo: opciones.values.todo === true,
      proyectoDesdeCarpetaActual: opciones.values.proyecto === undefined, explicar: explicar === true, agente: agente as string | undefined };
    canales.escribirSalida(contexto.formato === "json" ? JSON.stringify(resultado.valor) + "\n" : renderizar(comando, resultado.valor, presentacion));
    const finSalida = performance.now();
    for (const advertencia of advertencias) canales.escribirError(contexto.formato === "json" ? JSON.stringify(advertencia) + "\n"
      : `Advertencia: ${advertencia.advertencia.mensaje}\n`);
    if (medir) {
      const respuesta: RespuestaTiempos = { esquema: versionEsquemaSalida, tiempos: {
        arranqueMs: inicioConsulta - inicio, lecturaMs: finLectura! - inicioConsulta,
        resolucionMs: finConsulta - finLectura!, salidaMs: finSalida - inicioSalida,
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
