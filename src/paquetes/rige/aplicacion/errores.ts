export interface ErrorUso {
  readonly codigo: "almacen-sin-esquema";
  readonly mensaje: string;
}

export const errorAlmacenSinEsquema: ErrorUso = Object.freeze({
  codigo: "almacen-sin-esquema",
  mensaje: "El almacen no tiene el esquema esperado. Ejecute bun run esquema.",
});
