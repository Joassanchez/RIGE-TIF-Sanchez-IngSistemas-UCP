/** Se comprueba despues de sustituir las rutas del hogar aislado por marcadores. */
export function comprobarAislamiento(cadenas: Readonly<Record<string, readonly unknown[]>>, hogarReal: string, plataforma: string): void {
  const normalizar = (texto: string) => {
    const ruta = texto.replaceAll("\\", "/");
    return plataforma === "win32" ? ruta.toLowerCase() : ruta;
  };
  const hogar = normalizar(hogarReal).replace(/\/$/, "");
  if (!hogar) throw new Error("No se pudo determinar el HOME real para comprobar el aislamiento.");
  function contiene(valor: unknown): boolean {
    if (typeof valor === "string") {
      const texto = normalizar(valor);
      return texto === hogar || texto.includes(`${hogar}/`);
    }
    if (valor !== null && typeof valor === "object") return Object.values(valor).some(contiene);
    return false;
  }
  for (const [agente, reglas] of Object.entries(cadenas)) {
    if (reglas.some(contiene)) throw new Error(`fuga de aislamiento: la cadena de ${agente} contiene el HOME real del usuario.`);
  }
}
