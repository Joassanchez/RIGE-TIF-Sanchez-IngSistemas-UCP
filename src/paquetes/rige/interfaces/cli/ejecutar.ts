import type { prepararAlmacen } from "../../aplicacion/casos-uso/preparar-almacen";
import type { ErrorUso } from "../../aplicacion/errores";
import { parseArgs } from "node:util";

export interface CasosUsoCli {
  readonly prepararAlmacen: () => ReturnType<typeof prepararAlmacen>;
}

export type Ensamblado =
  | { readonly exito: true; readonly valor: CasosUsoCli }
  | { readonly exito: false; readonly error: ErrorUso };

export interface CanalesCli {
  escribirSalida(texto: string): void;
  escribirError(texto: string): void;
}

function argumentosInvalidos(canales: CanalesCli, mensaje: string): number {
  canales.escribirError(JSON.stringify({ esquema: 1, error: { codigo: "argumentos-invalidos", mensaje } }) + "\n");
  return 2;
}

export function ejecutarCli(argumentos: readonly string[], ensamblar: () => Ensamblado, canales: CanalesCli): number {
  let opciones: ReturnType<typeof parseArgs>;
  try {
    opciones = parseArgs({
      args: [...argumentos], options: { depurar: { type: "boolean" } }, strict: true, allowPositionals: true,
    });
  } catch (falla) {
    return argumentosInvalidos(canales, falla instanceof Error ? falla.message : "Argumentos invalidos.");
  }
  const posicionales = opciones.positionals;
  if (posicionales.length === 0) return argumentosInvalidos(canales, "Falta el subcomando esquema.");
  if (posicionales.length > 1) return argumentosInvalidos(canales, `Posicionales invalidos: ${posicionales.join(" ")}.`);
  if (posicionales[0] !== "esquema") return argumentosInvalidos(canales, `Subcomando desconocido: ${posicionales[0]}.`);
  try {
    const casos = ensamblar();
    if (!casos.exito) {
      canales.escribirError(JSON.stringify({ esquema: 1, error: casos.error }) + "\n");
      return 1;
    }
    const resultado = casos.valor.prepararAlmacen();
    if (!resultado.exito) {
      canales.escribirError(JSON.stringify({ esquema: 1, error: resultado.error }) + "\n");
      return 1;
    }
    canales.escribirSalida(JSON.stringify(resultado.valor) + "\n");
    return 0;
  } catch (falla) {
    const error = {
      codigo: "interno", mensaje: "Falla interna de RIGE.",
      ...(opciones.values.depurar && falla instanceof Error ? { stack: falla.stack } : {}),
    };
    canales.escribirError(JSON.stringify({ esquema: 1, error }) + "\n");
    return 70;
  }
}
