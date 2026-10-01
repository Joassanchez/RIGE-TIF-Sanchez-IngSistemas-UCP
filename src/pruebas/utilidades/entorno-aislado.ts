import { isAbsolute } from "node:path";

export const variablesAisladas = [
  "HOME", "USERPROFILE", "XDG_CONFIG_HOME", "XDG_DATA_HOME",
  "XDG_STATE_HOME", "XDG_CACHE_HOME", "LOCALAPPDATA", "APPDATA", "RIGE_ALMACEN",
] as const;

export function crearEntornoAislado(
  temporal: string,
  heredado: Readonly<Record<string, string | undefined>>,
): Record<string, string> {
  if (!isAbsolute(temporal)) throw new Error("El temporal debe ser una ruta absoluta");
  const entorno: Record<string, string> = {};
  for (const nombre of ["PATH", "SystemRoot"]) {
    const clave = Object.keys(heredado).find((clave) => clave.toUpperCase() === nombre.toUpperCase());
    if (clave !== undefined && heredado[clave] !== undefined) entorno[nombre] = heredado[clave];
  }
  for (const nombre of variablesAisladas) entorno[nombre] = temporal;
  return entorno;
}
