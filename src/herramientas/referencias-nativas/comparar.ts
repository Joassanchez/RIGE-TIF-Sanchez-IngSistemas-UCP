export type Diferencia = { readonly clave: string; readonly esperado: unknown; readonly obtenido: unknown };

export function normalizar(salida: unknown): Record<string, unknown> {
  if (salida === null || typeof salida !== "object" || Array.isArray(salida)) {
    throw new Error("La salida nativa debe ser un objeto JSON.");
  }
  const resultado: Record<string, unknown> = {};
  function aplanar(objeto: object, prefijo: string): void {
    for (const [clave, valor] of Object.entries(objeto)) {
      const nombre = prefijo ? `${prefijo}.${clave}` : clave === "topP" ? "top_p" : clave === "maxSteps" ? "steps" : clave;
      if (valor !== null && typeof valor === "object" && !Array.isArray(valor)) aplanar(valor, nombre);
      else Object.defineProperty(resultado, nombre, { value: valor, enumerable: true, configurable: true });
    }
  }
  aplanar(salida, "");
  return resultado;
}

export function comparar(esperado: Record<string, unknown>, obtenido: Record<string, unknown>): Diferencia[] {
  return Object.keys(esperado).filter(clave => !Object.hasOwn(obtenido, clave) || esperado[clave] !== obtenido[clave])
    .map(clave => ({ clave, esperado: esperado[clave], obtenido: obtenido[clave] }));
}
