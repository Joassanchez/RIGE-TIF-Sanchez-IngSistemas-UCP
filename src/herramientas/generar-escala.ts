import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";

/** Solo cuenta configuraciones, no metadatos de git ni archivos de trabajo. */
export function archivosConfiguracion(proyecto: string): string[] {
  return readdirSync(proyecto, { withFileTypes: true }).flatMap(entrada => {
    if (entrada.name === ".git") return [];
    const ruta = join(proyecto, entrada.name);
    return entrada.isDirectory() ? archivosConfiguracion(ruta)
      : /\.(jsonc?|md)$/.test(entrada.name) ? [ruta] : [];
  }).sort();
}

function validarCantidad(n: number): void {
  if (!Number.isSafeInteger(n) || n < 1) throw new Error("La cantidad debe ser un entero positivo.");
}

/** Opera exclusivamente sobre una copia temporal del escenario JSON/Markdown. */
export function multiplicarEscenario(proyecto: string, factor: number): void {
  validarCantidad(factor);
  if (factor === 1) return;
  for (const ruta of archivosConfiguracion(proyecto)) {
    if (extname(ruta) === ".md") {
      for (let n = 2; n <= factor; n++) copyFileSync(ruta, join(dirname(ruta), `${basename(ruta, ".md")}--escala-${n}.md`));
    } else {
      const config = JSON.parse(readFileSync(ruta, "utf8"));
      for (const clave of ["agent", "command", "lsp"]) {
        if (!config[clave]) continue;
        for (const [nombre, valor] of Object.entries(config[clave])) {
          for (let n = 2; n <= factor; n++) config[clave][`${nombre}--escala-${n}`] = valor;
        }
      }
      writeFileSync(ruta, JSON.stringify(config, null, 2) + "\n");
    }
  }
}

/** Reemplaza las configuraciones de la copia por un proyecto minimo. */
export function generarReglas(proyecto: string, cantidad: number): void {
  validarCantidad(cantidad);
  for (const ruta of archivosConfiguracion(proyecto)) rmSync(ruta);
  mkdirSync(proyecto, { recursive: true });
  const read = Object.fromEntries(Array.from({ length: cantidad }, (_, i) => [`documentos/archivo-${i + 1}.txt`, "allow"]));
  writeFileSync(join(proyecto, "opencode.json"), JSON.stringify({
    agent: { "agent-1": { description: "Agente de escala", permission: { read } } },
  }, null, 2) + "\n");
}
