export interface ErrorUso {
  readonly codigo: "almacen-sin-esquema" | "configuracion-invalida" | "puerto-ocupado"
    | "solicitud-invalida" | "proyecto-inexistente" | "via-no-soportada" | "contenido-no-soportado"
    | "entrada-ilegible" | "entorno-incompleto" | "agente-sin-declaraciones" | "clave-inexistente"
    | "resolucion-inexistente";
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

export function errorSolicitudInvalida(motivo: string): ErrorUso {
  return { codigo: "solicitud-invalida", mensaje: `Solicitud invalida: ${motivo}.` };
}

export function errorResolucionInexistente(id: number): ErrorUso {
  return { codigo: "resolucion-inexistente", mensaje: `No existe la resolucion ${id} en el almacen.` };
}

export function errorDesdeAnalisis(error: { codigo: string; mensaje: string }): ErrorUso {
  switch (error.codigo) {
    case "proyecto-inexistente":
    case "via-no-soportada":
    case "contenido-no-soportado":
    case "entrada-ilegible":
    case "entorno-incompleto":
    case "agente-sin-declaraciones":
    case "clave-inexistente":
      return { codigo: error.codigo, mensaje: error.mensaje };
    default:
      throw new Error(`Codigo de analisis desconocido: ${error.codigo}`);
  }
}
