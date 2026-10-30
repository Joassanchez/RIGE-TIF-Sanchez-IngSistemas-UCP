import type { ErrorAnalisis, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import type { ContextoOpenCode } from "./contexto";

const normalizar = (ruta: string) => ruta.replaceAll("\\", "/");
const noSoportada = (nombre: string): Resultado<never, ErrorAnalisis> => ({ exito: false, error: { categoria: "uso",
  codigo: "via-no-soportada", mensaje: `RIGE no incorpora ${normalizar(nombre)}.`,
} });

export function validarVias(entorno: EntornoLectura): Resultado<void, ErrorAnalisis> {
  const variable = (nombre: string) => entorno.variable(nombre);
  for (const nombre of ["OPENCODE_DISABLE_PROJECT_CONFIG", "OPENCODE_TEST_HOME", "OPENCODE_TEST_MANAGED_CONFIG_DIR"]) {
    const valor = variable(nombre);
    const definida = nombre === "OPENCODE_TEST_HOME" ? valor !== undefined
      : nombre === "OPENCODE_DISABLE_PROJECT_CONFIG" ? ["true", "1"].includes(valor?.toLowerCase() ?? "")
      : Boolean(valor);
    if (definida) return noSoportada(nombre);
  }
  const config = variable("OPENCODE_CONFIG") || undefined;
  if (config !== undefined && !entorno.esAbsoluta(config)) return noSoportada("OPENCODE_CONFIG");
  const directorio = variable("OPENCODE_CONFIG_DIR");
  if (directorio) {
    const separadorIncorrecto = entorno.plataforma === "win32" ? directorio.includes("/") : directorio.includes("\\");
    if (!entorno.esAbsoluta(directorio) || separadorIncorrecto || entorno.unir(directorio) !== directorio || /[\\/]$/.test(directorio)
      || directorio.split(/[\\/]/).some(segmento => segmento === "." || segmento === "..")
      || !["directorio", "inexistente"].includes(entorno.tipo(directorio))) return noSoportada("OPENCODE_CONFIG_DIR");
  }
  return { exito: true, valor: undefined };
}

export function ubicar(proyecto: string, entorno: EntornoLectura, contexto: ContextoOpenCode): Resultado<readonly ViaUbicada[], ErrorAnalisis> {
  if (!entorno.esAbsoluta(proyecto) || entorno.tipo(proyecto) !== "directorio") return { exito: false, error: { categoria: "uso",
    codigo: "proyecto-inexistente", mensaje: `El proyecto ${proyecto} no existe o no es un directorio.`,
  } };
  const variable = (nombre: string) => entorno.variable(nombre);
  const config = variable("OPENCODE_CONFIG") || undefined;
  const { hogar, config: global, worktree } = contexto.parametros;
  const vias: ViaUbicada[] = [];
  const noObservada = (via: string) => vias.push({ via, referencia: via, condicion: "no_observada" });
  function agregar(via: string, ruta: string): void {
    if (entorno.tipo(ruta) === "archivo") vias.push({ via, referencia: normalizar(ruta), condicion: "observada" });
  }
  const heredada = entorno.unir(global, "config");
  if (entorno.tipo(heredada) !== "inexistente") return { exito: false, error: { categoria: "uso", codigo: "via-no-soportada",
    mensaje: `RIGE no incorpora ${normalizar(heredada)}: OpenCode lo migra al ejecutarse, escribe config.json y borra config; analizarlo antes daría un estado que OpenCode no usa.`,
  } };
  noObservada("remota-wellknown");
  for (const nombre of ["config.json", "opencode.json", "opencode.jsonc"]) agregar("global", entorno.unir(global, nombre));
  if (config !== undefined) agregar("variable-config", entorno.unir(config));

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
  const directorioVariable = variable("OPENCODE_CONFIG_DIR");
  const directorios = [...new Set([global, ...subir([".opencode"], proyecto, worktree), entorno.unir(hogar, ".opencode"),
    ...(directorioVariable ? [directorioVariable] : [])])];
  for (const directorio of directorios) {
    if (entorno.tipo(directorio) !== "directorio") continue;
    if (normalizar(directorio).endsWith("/.opencode") || directorio === directorioVariable) {
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
    for (const nombre of ["command", "commands", "agent", "agents", "mode", "modes"]) {
      buscar(entorno.unir(directorio, nombre), !["mode", "modes"].includes(nombre));
    }
    const esComando = (ruta: string) => /^commands?\//.test(normalizar(ruta).slice(normalizar(directorio).length + 1));
    markdown.sort((a, b) => Number(esComando(b)) - Number(esComando(a))
      || (normalizar(a) < normalizar(b) ? -1 : normalizar(a) > normalizar(b) ? 1 : 0));
    for (const ruta of markdown) {
      const relativa = normalizar(ruta).slice(normalizar(directorio).length + 1);
      const elemento = [esComando(ruta) ? "command" : "agent", relativa.split("/").slice(1).join("/").slice(0, -3)];
      vias.push({ via: "markdown", referencia: normalizar(ruta), condicion: "observada", elemento });
    }
  }
  if (variable("OPENCODE_CONFIG_CONTENT")) vias.push({ via: "variable-contenido", referencia: "OPENCODE_CONFIG_CONTENT", condicion: "definida" });
  noObservada("remota-organizacion");
  const administrada = entorno.plataforma === "win32" ? entorno.unir(variable("ProgramData") || "C:\\ProgramData", "opencode")
    : entorno.plataforma === "darwin" ? "/Library/Application Support/opencode" : "/etc/opencode";
  for (const nombre of ["opencode.json", "opencode.jsonc"]) agregar("administrada", entorno.unir(administrada, nombre));
  noObservada("preferencias-macos");
  if (variable("OPENCODE_PERMISSION")) vias.push({ via: "variable-permiso", referencia: "OPENCODE_PERMISSION", condicion: "definida" });
  return { exito: true, valor: vias };
}
