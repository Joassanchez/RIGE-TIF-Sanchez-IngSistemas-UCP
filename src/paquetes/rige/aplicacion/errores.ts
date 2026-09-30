export interface ErrorUso {
  readonly codigo: "almacen-sin-esquema" | "configuracion-invalida";
  readonly mensaje: string;
}

export const errorAlmacenSinEsquema: ErrorUso = Object.freeze({
  codigo: "almacen-sin-esquema",
  mensaje: "El almacen no tiene el esquema esperado. Ejecute bun run esquema.",
});

export function errorConfiguracionInvalida(variable: string, motivo: string): ErrorUso {
  return { codigo: "configuracion-invalida", mensaje: `Configuracion invalida en ${variable}: ${motivo}.` };
}
