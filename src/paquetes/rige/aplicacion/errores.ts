export interface ErrorUso {
  readonly codigo: string;
  readonly mensaje: string;
}

export const errorAlmacenSinEsquema: ErrorUso = Object.freeze({
  codigo: "almacen-sin-esquema",
  mensaje: "El almacén no tiene el esquema esperado. Ejecute bun run esquema.",
});

export const errorAlmacenIncompatible: ErrorUso = Object.freeze({
  codigo: "almacen-sin-esquema",
  mensaje: "El almacén tiene un esquema incompatible. Muévalo o bórrelo y ejecute bun run esquema.",
});

export function errorConfiguracionInvalida(variable: string, motivo: string): ErrorUso {
  return { codigo: "configuracion-invalida", mensaje: `Configuración inválida en ${variable}: ${motivo}.` };
}

export function errorPuertoOcupado(puerto: number): ErrorUso {
  return { codigo: "puerto-ocupado", mensaje: `El puerto ${puerto} de RIGE_PUERTO no está disponible.` };
}

export function errorSolicitudInvalida(motivo: string): ErrorUso {
  return { codigo: "solicitud-invalida", mensaje: `Solicitud inválida: ${motivo}.` };
}

export function errorResolucionInexistente(id: number): ErrorUso {
  return { codigo: "resolucion-inexistente", mensaje: `No existe la resolución ${id} en el almacén.` };
}

export function errorDesdeAnalisis(error: { categoria?: unknown; codigo: string; mensaje: string }): ErrorUso {
  if (error.categoria !== "uso") throw new Error(`Categoría de análisis inválida: ${error.codigo}`);
  return { codigo: error.codigo, mensaje: error.mensaje };
}
