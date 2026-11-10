import type { ErrorAnalisis, ViaUbicada, ObservacionVia, ObservarVias } from "@rige/nucleo/contrato/adaptador";
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
    if (!entorno.esAbsoluta(directorio) || entorno.unir(directorio) !== directorio || /[\\/]$/.test(directorio)
      || (entorno.plataforma !== "win32" && directorio.includes("\\"))
      || !["directorio", "inexistente"].includes(entorno.tipo(directorio))) return noSoportada("OPENCODE_CONFIG_DIR");
  }
  return { exito: true, valor: undefined };
}

export function ubicar(proyecto: string, entorno: EntornoLectura, contexto: ContextoOpenCode, observar?: ObservarVias): Resultado<readonly ViaUbicada[], ErrorAnalisis> {
  if (!entorno.esAbsoluta(proyecto) || entorno.tipo(proyecto) !== "directorio") return { exito: false, error: { categoria: "uso",
    codigo: "proyecto-inexistente", mensaje: `El proyecto ${proyecto} no existe o no es un directorio.`,
  } };
  const mapa = new Map<string, { via: string; estado: ObservacionVia["estado"]; revisados: string[] }>();
  function registrar(via: string, candidato?: string) {
    if (!observar) return;
    let registro = mapa.get(via);
    if (!registro) { registro = { via, estado: "ausente", revisados: [] }; mapa.set(via, registro); }
    if (candidato !== undefined && !registro.revisados.includes(normalizar(candidato))) registro.revisados.push(normalizar(candidato));
  }
  const revisar = (via: string, ruta: string) => { registrar(via, ruta); return entorno.tipo(ruta); };
  const variable = (nombre: string, via?: string) => { if (via) registrar(via, nombre); return entorno.variable(nombre); };
  const config = variable("OPENCODE_CONFIG", "variable-config") || undefined;
  const { hogar, config: global, worktree } = contexto.parametros;
  const vias: ViaUbicada[] = [];
  const noObservada = (via: string) => {
    registrar(via);
    if (observar) mapa.get(via)!.estado = "no_observada";
    vias.push({ via, referencia: via, condicion: "no_observada" });
  };
  function agregar(via: string, ruta: string): void {
    if (revisar(via, ruta) === "archivo") vias.push({ via, referencia: normalizar(ruta), condicion: "observada" });
  }
  const heredada = entorno.unir(global, "config");
  if (revisar("global", heredada) !== "inexistente") return { exito: false, error: { categoria: "uso", codigo: "via-no-soportada",
    mensaje: `RIGE no incorpora ${normalizar(heredada)}: OpenCode lo migra al ejecutarse, escribe config.json y borra config; analizarlo antes daría un estado que OpenCode no usa.`,
  } };
  noObservada("remota-wellknown");
  for (const nombre of ["config.json", "opencode.json", "opencode.jsonc"]) agregar("global", entorno.unir(global, nombre));
  if (config !== undefined) agregar("variable-config", entorno.unir(config));

  function subir(via: string, objetivos: readonly string[], desde: string, hasta: string): string[] {
    const rutas: string[] = [];
    let actual = desde;
    while (true) {
      for (const objetivo of objetivos) {
        const ruta = entorno.unir(actual, objetivo);
        if (via === "directorio-opencode") registrar("markdown", ruta);
        if (revisar(via, ruta) !== "inexistente") rutas.push(ruta);
      }
      if (hasta === actual) break;
      const superior = entorno.padre(actual);
      if (superior === actual) break;
      actual = superior;
    }
    return rutas;
  }
  // Invertir la lista completa conserva json antes de jsonc dentro de cada nivel.
  for (const ruta of subir("proyecto", ["opencode.jsonc", "opencode.json"], proyecto, worktree).reverse()) agregar("proyecto", ruta);
  const directorioVariable = variable("OPENCODE_CONFIG_DIR");
  const directorios = [...new Set([global, ...subir("directorio-opencode", [".opencode"], proyecto, worktree), entorno.unir(hogar, ".opencode"),
    ...(directorioVariable ? [directorioVariable] : [])])];
  for (const directorio of directorios) {
    const contieneJson = normalizar(directorio).endsWith("/.opencode") || directorio === directorioVariable;
    // Una comprobacion sirve a ambas vias; no se inventan hijos de directorios ausentes.
    registrar("markdown", directorio);
    if (contieneJson) registrar("directorio-opencode", directorio);
    if (entorno.tipo(directorio) !== "directorio") continue;
    if (contieneJson) {
      for (const nombre of ["opencode.json", "opencode.jsonc"]) agregar("directorio-opencode", entorno.unir(directorio, nombre));
    }
    const markdown: string[] = [];
    function buscar(directorioMarkdown: string, recursivo: boolean): void {
      if (revisar("markdown", directorioMarkdown) !== "directorio") return;
      for (const nombre of entorno.listar(directorioMarkdown)) {
        const ruta = entorno.unir(directorioMarkdown, nombre);
        const tipo = revisar("markdown", ruta);
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
  if (variable("OPENCODE_CONFIG_CONTENT", "variable-contenido")) vias.push({ via: "variable-contenido", referencia: "OPENCODE_CONFIG_CONTENT", condicion: "definida", constituyeEntrada: true });
  noObservada("remota-organizacion");
  const administrada = entorno.plataforma === "win32" ? entorno.unir(variable("ProgramData") || "C:\\ProgramData", "opencode")
    : entorno.plataforma === "darwin" ? "/Library/Application Support/opencode" : "/etc/opencode";
  for (const nombre of ["opencode.json", "opencode.jsonc"]) agregar("administrada", entorno.unir(administrada, nombre));
  noObservada("preferencias-macos");
  if (variable("OPENCODE_PERMISSION", "variable-permiso")) vias.push({ via: "variable-permiso", referencia: "OPENCODE_PERMISSION", condicion: "definida", constituyeEntrada: true });
  if (observar) {
    for (const entrada of vias) if (entrada.condicion !== "no_observada") mapa.get(entrada.via)!.estado = "presente";
    observar([...mapa.values()]);
  }
  return { exito: true, valor: vias };
}
