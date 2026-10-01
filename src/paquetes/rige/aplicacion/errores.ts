export interface ErrorUso {
  readonly codigo: "almacen-sin-esquema" | "configuracion-invalida" | "puerto-ocupado";
  readonly mensaje: string;
}

export const errorAlmacenSinEsquema: ErrorUso = Object.freeze({
  codigo: "almacen-sin-esquema",
  mensaje: "El almacen no tiene el esquema esperado. Ejecute bun run esquema.",
});

export const errorAlmacenIncompatible: ErrorUso = Object.freeze({
  codigo: "almacen-sin-esquema",
  mensaje: "El almacen tiene un esquema incompatible. Muevalo o borrelo y ejecute bun run esquema.",
});

export function errorConfiguracionInvalida(variable: string, motivo: string): ErrorUso {
  return { codigo: "configuracion-invalida", mensaje: `Configuracion invalida en ${variable}: ${motivo}.` };
}

export function errorPuertoOcupado(puerto: number): ErrorUso {
  return { codigo: "puerto-ocupado", mensaje: `El puerto ${puerto} de RIGE_PUERTO no esta disponible.` };
}
