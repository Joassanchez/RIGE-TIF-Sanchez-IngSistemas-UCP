import type { ErrorAnalisis, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";

const normalizar = (ruta: string) => ruta.replaceAll("\\", "/");
const noSoportada = (nombre: string): Resultado<never, ErrorAnalisis> => ({ exito: false, error: {
  codigo: "via-no-soportada", mensaje: `El prototipo v1 no incorpora ${normalizar(nombre)}.`,
} });

export function ubicar(proyecto: string, entorno: EntornoLectura): Resultado<readonly ViaUbicada[], ErrorAnalisis> {
  if (!entorno.esAbsoluta(proyecto) || entorno.tipo(proyecto) !== "directorio") return { exito: false, error: {
    codigo: "proyecto-inexistente", mensaje: `El proyecto ${proyecto} no existe o no es un directorio.`,
  } };
  const variable = (nombre: string) => entorno.variable(nombre);
  for (const nombre of ["OPENCODE_CONFIG_CONTENT", "OPENCODE_PERMISSION", "OPENCODE_CONFIG_DIR",
    "OPENCODE_DISABLE_PROJECT_CONFIG", "OPENCODE_TEST_HOME", "OPENCODE_TEST_MANAGED_CONFIG_DIR"]) {
    const valor = variable(nombre);
    const definida = nombre === "OPENCODE_CONFIG_DIR" || nombre === "OPENCODE_TEST_HOME" ? valor !== undefined
      : nombre === "OPENCODE_DISABLE_PROJECT_CONFIG" ? ["true", "1"].includes(valor?.toLowerCase() ?? "")
      : Boolean(valor);
    if (definida) return noSoportada(nombre);
  }
  const config = variable("OPENCODE_CONFIG") || undefined;
  if (config !== undefined && !entorno.esAbsoluta(config)) return noSoportada("OPENCODE_CONFIG");
  const nombreHome = entorno.plataforma === "win32" ? "USERPROFILE" : "HOME";
  const hogar = variable(nombreHome);
  if (!hogar) return { exito: false, error: {
    codigo: "entorno-incompleto", mensaje: `Falta la variable ${nombreHome} para ubicar las entradas globales.`,
  } };
  const vias: ViaUbicada[] = [];
  const noObservada = (via: string) => vias.push({ via, referencia: via, condicion: "no_observada" });
  function agregar(via: string, ruta: string): void {
    if (entorno.tipo(ruta) === "archivo") vias.push({ via, referencia: normalizar(ruta), condicion: "observada" });
  }
  const global = entorno.unir(variable("XDG_CONFIG_HOME") || entorno.unir(hogar, ".config"), "opencode");
  const heredada = entorno.unir(global, "config");
  if (entorno.tipo(heredada) !== "inexistente") return noSoportada(heredada);
  noObservada("remota-wellknown");
  for (const nombre of ["config.json", "opencode.json", "opencode.jsonc"]) agregar("global", entorno.unir(global, nombre));
  if (config !== undefined) agregar("variable-config", entorno.unir(config));

  let worktree = proyecto;
  for (;;) {
    const git = entorno.unir(worktree, ".git");
    const tipo = entorno.tipo(git);
    if (tipo === "directorio" && entorno.tipo(entorno.unir(git, "HEAD")) === "archivo"
      || tipo === "archivo" && entorno.leer(git).texto.startsWith("gitdir:")) break;
    const superior = entorno.padre(worktree);
    if (superior === worktree) break;
    worktree = superior;
  }
  function subir(objetivos: readonly string[], desde: string, hasta: string): string[] {
    const rutas: string[] = [];
    let actual = desde;
    while (true) {
      for (const objetivo of objetivos) {
        const ruta = entorno.unir(actual, objetivo);
        if (entorno.tipo(ruta) !== "inexistente") rutas.push(ruta);
      }
      if (hasta === actual) break;
      const superior = entorno.padre(actual);
      if (superior === actual) break;
      actual = superior;
    }
    return rutas;
  }
  // Invertir la lista completa conserva json antes de jsonc dentro de cada nivel.
  for (const ruta of subir(["opencode.jsonc", "opencode.json"], proyecto, worktree).reverse()) agregar("proyecto", ruta);
  const directorios = [...new Set([global, ...subir([".opencode"], proyecto, worktree), entorno.unir(hogar, ".opencode")])];
  for (const directorio of directorios) {
    if (entorno.tipo(directorio) !== "directorio") continue;
    if (normalizar(directorio).endsWith("/.opencode")) {
      for (const nombre of ["opencode.json", "opencode.jsonc"]) agregar("directorio-opencode", entorno.unir(directorio, nombre));
    }
    const markdown: string[] = [];
    function buscar(directorioMarkdown: string, recursivo: boolean): void {
      if (entorno.tipo(directorioMarkdown) !== "directorio") return;
      for (const nombre of entorno.listar(directorioMarkdown)) {
        const ruta = entorno.unir(directorioMarkdown, nombre);
        const tipo = entorno.tipo(ruta);
        if (tipo === "archivo" && nombre.endsWith(".md")) markdown.push(ruta);
        else if (tipo === "directorio" && recursivo) buscar(ruta, true);
      }
    }
    for (const nombre of ["agent", "agents", "mode", "modes"]) {
      buscar(entorno.unir(directorio, nombre), nombre === "agent" || nombre === "agents");
    }
    markdown.sort((a, b) => normalizar(a) < normalizar(b) ? -1 : normalizar(a) > normalizar(b) ? 1 : 0);
    for (const ruta of markdown) {
      const relativa = normalizar(ruta).slice(normalizar(directorio).length + 1);
      const elemento = relativa.split("/").slice(1).join("/").slice(0, -3);
      vias.push({ via: "markdown", referencia: normalizar(ruta), condicion: "observada", elemento });
    }
  }
  noObservada("remota-organizacion");
  const administrada = entorno.plataforma === "win32" ? entorno.unir(variable("ProgramData") || "C:\\ProgramData", "opencode")
    : entorno.plataforma === "darwin" ? "/Library/Application Support/opencode" : "/etc/opencode";
  for (const nombre of ["opencode.json", "opencode.jsonc"]) agregar("administrada", entorno.unir(administrada, nombre));
  noObservada("preferencias-macos");
  return { exito: true, valor: vias };
}
