import type { ConsultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import type { ErrorUso } from "../../aplicacion/errores";
import type { RespuestaEstado } from "../../aplicacion/respuestas/estado";
import type { Resultado } from "../../aplicacion/respuestas/resultado";
import { parseArgs } from "node:util";

export interface CasosUsoCli {
  readonly prepararAlmacen: () => Resultado<RespuestaEstado, ErrorUso>;
  readonly consultarEstado: ConsultarEstado;
  readonly iniciarServidor: () => Resultado<{ readonly direccion: string }, ErrorUso>;
}

export type Ensamblado = Resultado<CasosUsoCli, ErrorUso>;

const subcomandos = {
  esquema: (casos) => casos.prepararAlmacen(),
  servir: (casos) => {
    const estado = casos.consultarEstado();
    if (!estado.exito) return estado;
    const servidor = casos.iniciarServidor();
    if (!servidor.exito) return servidor;
    return { exito: true, valor: { esquema: 1, direccion: servidor.valor.direccion } };
  },
} satisfies Record<string, (casos: CasosUsoCli) => Resultado<object, ErrorUso>>;

export interface CanalesCli {
  escribirSalida(texto: string): void;
  escribirError(texto: string): void;
}

function escribirError(canales: CanalesCli, error: { readonly codigo: string; readonly mensaje: string; readonly stack?: string | undefined }): void {
  canales.escribirError(JSON.stringify({ esquema: 1, error }) + "\n");
}

function argumentosInvalidos(canales: CanalesCli, mensaje: string): number {
  escribirError(canales, { codigo: "argumentos-invalidos", mensaje });
  return 2;
}

export function ejecutarCli(argumentos: readonly string[], ensamblar: () => Ensamblado, canales: CanalesCli): number {
  let opciones: ReturnType<typeof parseArgs>;
  try {
    opciones = parseArgs({
      args: [...argumentos], options: { depurar: { type: "boolean" } }, strict: true, allowPositionals: true,
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
  try {
    const casos = ensamblar();
    if (!casos.exito) {
      escribirError(canales, casos.error);
      return 1;
    }
    const resultado = subcomandos[posicionales[0] as keyof typeof subcomandos](casos.valor);
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
