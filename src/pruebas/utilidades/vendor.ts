import { posix } from "node:path";
import { extraerImports } from "./analisis-arquitectura";

// Recorre tambien auxiliares: un puente no puede convertir la copia en oraculo.
export function detectarVendor(archivos: Readonly<Record<string, string>>): string[] {
  const alcanzaVendor = (archivo: string, visitados: Set<string>): boolean => {
    if (archivo.startsWith("paquetes/opencode/vendor/")) return true;
    if (visitados.has(archivo)) return false;
    visitados.add(archivo);
    const codigo = archivos[archivo];
    if (codigo === undefined) return false;
    return extraerImports(codigo).some(({ destino }) => {
      const ruta = destino.startsWith(".") ? posix.join(posix.dirname(archivo), destino)
        : destino.startsWith("@rige/") ? destino.replace("@rige/", "paquetes/") : destino;
      const resuelta = [ruta, `${ruta}.ts`, `${ruta}/index.ts`].find(candidata => candidata in archivos) ?? ruta;
      return alcanzaVendor(resuelta, visitados);
    });
  };
  return Object.keys(archivos).filter(archivo => archivo.startsWith("pruebas/aceptacion/")
    && alcanzaVendor(archivo, new Set())).sort();
}
