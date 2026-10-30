import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import { versionSoportada } from "./descriptor";
import { buscarEjecutable } from "./ejecutables";

export type VersionInstalada =
  | { readonly estado: "soportada" }
  | { readonly estado: "distinta"; readonly detectada: string; readonly rutaPaquete: string }
  | { readonly estado: "no-determinada"; readonly motivo: "ejecutable-no-encontrado" | "paquete-no-encontrado" | "paquete-ilegible" };

/** Solo se captura el error sintactico del contenido; la lectura queda fuera. */
function parsear(texto: string): unknown {
  try { return JSON.parse(texto.replace(/^\uFEFF/, "")); }
  catch (error) { if (error instanceof SyntaxError) return undefined; throw error; }
}
function esPaquete(valor: unknown): valor is { name: string; version?: unknown } {
  return typeof valor === "object" && valor !== null && "name" in valor && valor.name === "opencode-ai";
}

export function detectarVersion(entorno: EntornoLectura, proyecto: string): VersionInstalada {
  const nombres = entorno.plataforma === "win32"
    ? (entorno.variable("PATHEXT") ?? ".com;.exe;.bat;.cmd").split(";").filter(Boolean).map(extension => `opencode${extension.toLowerCase()}`)
    : ["opencode"];
  const ejecutable = buscarEjecutable(entorno, proyecto, nombres);
  if (ejecutable === undefined) return { estado: "no-determinada", motivo: "ejecutable-no-encontrado" };
  let actual = entorno.padre(entorno.real(ejecutable));
  let ilegible = false;
  let paquete: { readonly contenido: unknown; readonly ruta: string } | undefined;
  for (;;) {
    const candidato = entorno.unir(actual, "package.json");
    if (entorno.tipo(candidato) === "archivo") {
      const contenido = parsear(entorno.leer(candidato).texto);
      if (esPaquete(contenido)) { paquete = { contenido, ruta: candidato }; break; }
      if (contenido === undefined) ilegible = true;
    }
    const padre = entorno.padre(actual);
    if (padre === actual) break;
    actual = padre;
  }
  if (paquete === undefined) {
    const respaldo = entorno.unir(entorno.padre(ejecutable), "node_modules", "opencode-ai", "package.json");
    if (entorno.tipo(respaldo) !== "archivo") return { estado: "no-determinada", motivo: ilegible ? "paquete-ilegible" : "paquete-no-encontrado" };
    paquete = { contenido: parsear(entorno.leer(respaldo).texto), ruta: respaldo };
  }
  const contenido = paquete.contenido;
  if (!esPaquete(contenido) || typeof contenido.version !== "string" || contenido.version.length === 0) {
    return { estado: "no-determinada", motivo: "paquete-ilegible" };
  }
  return contenido.version === versionSoportada ? { estado: "soportada" }
    : { estado: "distinta", detectada: contenido.version, rutaPaquete: paquete.ruta };
}
