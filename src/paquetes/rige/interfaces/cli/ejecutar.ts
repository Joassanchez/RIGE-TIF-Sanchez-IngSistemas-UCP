import type { ConsultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import type { ConsultarValores } from "../../aplicacion/casos-uso/consultar-valores";
import type { consultarPermiso } from "../../aplicacion/casos-uso/consultar-permiso";
import type { ConsultarAgentes } from "../../aplicacion/casos-uso/consultar-agentes";
import { versionEsquemaSalida } from "../../aplicacion/respuestas/valores";
import type { ErrorUso } from "../../aplicacion/errores";
import type { RespuestaEstado } from "../../aplicacion/respuestas/estado";
import type { Resultado } from "../../aplicacion/respuestas/resultado";
import { parseArgs } from "node:util";

export interface CasosUsoCli {
  readonly consultarValores: ConsultarValores;
  readonly consultarPermiso: (...args: Parameters<typeof consultarPermiso> extends [unknown, ...infer R] ? R : never) => ReturnType<typeof consultarPermiso>;
  readonly consultarAgentes: ConsultarAgentes;
  readonly prepararAlmacen: () => Resultado<RespuestaEstado, ErrorUso>;
  readonly consultarEstado: ConsultarEstado;
  readonly iniciarServidor: () => Resultado<{ readonly direccion: string }, ErrorUso>;
}

export type Ensamblado = Resultado<CasosUsoCli, ErrorUso>;

interface OpcionesConsulta { readonly proyecto: string; readonly agente: string; readonly clave: string | undefined;
  readonly herramienta: string | undefined; readonly sujeto: string | undefined; readonly objetivo: string;
  readonly lanzadoPor: string | undefined; readonly explicar: boolean }

const subcomandos = {
  esquema: (casos) => casos.prepararAlmacen(),
  valores: (casos, opciones) => casos.consultarValores(opciones.proyecto, opciones.agente, opciones.clave),
  agentes: (casos, opciones) => casos.consultarAgentes(opciones.proyecto),
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
  escribirSalida(texto: string): void;
  escribirError(texto: string): void;
}

function escribirError(canales: CanalesCli, error: { readonly codigo: string; readonly mensaje: string; readonly stack?: string | undefined }): void {
  canales.escribirError(JSON.stringify({ esquema: versionEsquemaSalida, error }) + "\n");
}

function argumentosInvalidos(canales: CanalesCli, mensaje: string): number {
  escribirError(canales, { codigo: "argumentos-invalidos", mensaje });
  return 2;
}

export function ejecutarCli(argumentos: readonly string[], ensamblar: () => Ensamblado, canales: CanalesCli): number {
  let opciones: ReturnType<typeof parseArgs>;
  try {
    opciones = parseArgs({
      args: [...argumentos], options: {
        depurar: { type: "boolean" }, proyecto: { type: "string" }, agente: { type: "string" }, clave: { type: "string" },
        herramienta: { type: "string" }, sujeto: { type: "string" }, objetivo: { type: "string" },
        "lanzado-por": { type: "string" }, explicar: { type: "boolean" },
      }, strict: true, allowPositionals: true,
    });
  } catch {
    return argumentosInvalidos(canales, `Argumentos invalidos: ${argumentos.join(" ")}.`);
  }
  const posicionales = opciones.positionals;
  if (posicionales.length === 0) return argumentosInvalidos(canales, `Falta el subcomando ${Object.keys(subcomandos).join(" o ")}.`);
  if (posicionales.length > 1) return argumentosInvalidos(canales, `Posicionales invalidos: ${posicionales.join(" ")}.`);
  if (!Object.hasOwn(subcomandos, posicionales[0]!)) {
    return argumentosInvalidos(canales, `Subcomando desconocido: ${posicionales[0]}.`);
  }
  const { proyecto, agente, clave, herramienta, sujeto, objetivo, explicar, "lanzado-por": lanzadoPor } = opciones.values;
  const comando = posicionales[0]!;
  const admitidas: Record<string, readonly string[]> = {
    valores: ["proyecto", "agente", "clave"], agentes: ["proyecto", "explicar"],
    permiso: ["proyecto", "agente", "herramienta", "sujeto", "objetivo", "lanzado-por", "explicar"], esquema: [], servir: [],
  };
  for (const nombre of Object.keys(opciones.values)) {
    if (nombre !== "depurar" && !admitidas[comando]!.includes(nombre)) return argumentosInvalidos(canales, `${comando} no admite --${nombre}.`);
  }
  const noVacio = (valor: unknown): valor is string => typeof valor === "string" && Boolean(valor.trim());
  if (posicionales[0] === "valores") {
    if (typeof proyecto !== "string" || !proyecto.trim() || typeof agente !== "string" || !agente.trim()
      || (clave !== undefined && (typeof clave !== "string" || !clave.trim()))) {
      return argumentosInvalidos(canales, "valores requiere --proyecto y --agente no vacios; --clave es opcional y no puede estar vacia.");
    }
  } else if (comando === "agentes" && !noVacio(proyecto)) {
    return argumentosInvalidos(canales, "agentes requiere --proyecto no vacio.");
  } else if (comando === "permiso" && (!noVacio(proyecto) || !noVacio(agente) || !noVacio(objetivo)
    || (herramienta !== undefined) === (sujeto !== undefined) || !noVacio(herramienta ?? sujeto)
    || (lanzadoPor !== undefined && !noVacio(lanzadoPor)))) {
    return argumentosInvalidos(canales, "permiso requiere --proyecto, --agente, --objetivo y --herramienta o --sujeto excluyentes; --lanzado-por no puede estar vacio.");
  }
  try {
    const casos = ensamblar();
    if (!casos.exito) {
      escribirError(canales, casos.error);
      return 1;
    }
    const resultado = subcomandos[posicionales[0] as keyof typeof subcomandos](casos.valor, {
      proyecto: proyecto as string, agente: agente as string, clave: clave as string | undefined,
      herramienta: herramienta as string | undefined, sujeto: sujeto as string | undefined, objetivo: objetivo as string,
      lanzadoPor: lanzadoPor as string | undefined, explicar: explicar === true,
    });
    if (!resultado.exito) {
      escribirError(canales, resultado.error);
      return 1;
    }
    canales.escribirSalida(JSON.stringify(resultado.valor) + "\n");
    return 0;
  } catch (falla) {
    const error = {
      codigo: "interno", mensaje: "Falla interna de RIGE.",
      ...(opciones.values.depurar && falla instanceof Error ? { stack: falla.stack } : {}),
    };
    escribirError(canales, error);
    return 70;
  }
}
