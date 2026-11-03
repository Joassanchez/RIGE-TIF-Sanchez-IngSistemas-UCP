import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";

export function directoriosPath(entorno: EntornoLectura, proyecto: string): readonly string[] {
  const rutaPath = entorno.variable("PATH") ?? entorno.variable("Path");
  if (rutaPath === undefined) return [];
  return rutaPath.split(entorno.plataforma === "win32" ? ";" : ":").map(dir => {
    const ruta = dir.replace(/^"(.*)"$/, "$1") || ".";
    return entorno.esAbsoluta(ruta) ? entorno.unir(ruta) : entorno.unir(proyecto, ruta);
  });
}

export function nombresEjecutable(entorno: Pick<EntornoLectura, "plataforma" | "variable">, base: string): readonly string[] {
  return entorno.plataforma === "win32"
    ? (entorno.variable("PATHEXT") ?? ".com;.exe;.bat;.cmd").split(";").filter(Boolean).map(ext => `${base}${ext.toLowerCase()}`)
    : [base];
}

export function buscarEjecutable(entorno: EntornoLectura, proyecto: string, nombres: readonly string[], declaraciones: Set<string> = new Set()): string | undefined {
  for (const directorio of directoriosPath(entorno, proyecto)) {
    for (const nombre of nombres) {
      const ruta = entorno.unir(directorio, nombre);
      const tipo = entorno.examinar(ruta);
      if (tipo === "inaccesible") declaraciones.add("path-inaccesible");
      if (tipo === "archivo") return ruta;
    }
  }
  return undefined;
}
