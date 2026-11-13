export function esIdResolucion(id: unknown): id is string {
  if (typeof id !== "string" || !id || /[^0-9]/.test(id)) return false;
  const numero = Number(id);
  return Number.isSafeInteger(numero) && numero > 0;
}
