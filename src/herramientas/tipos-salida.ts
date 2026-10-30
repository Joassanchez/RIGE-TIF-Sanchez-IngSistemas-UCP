import { resolve } from "node:path";

type Esquema = { readonly [clave: string]: any };
const nombres = ["valores", "permiso", "agentes", "error"] as const;

export async function generarTiposSalida(): Promise<string> {
  let salida = "// Generado desde esquemas/salida/*.json; no editar.\n// Comando: bun herramientas/tipos-salida.ts\n\n";
  let version: unknown;
  for (const nombre of nombres) {
    const prefijo = nombre[0]!.toUpperCase() + nombre.slice(1);
    const esquema = await Bun.file(resolve(import.meta.dir, `../esquemas/salida/${nombre}.json`)).json() as Esquema;
    if (nombre === "valores") {
      version = esquema.properties.esquema.const;
      if (typeof version !== "number") throw new Error("El esquema debe declarar una version numerica constante");
      salida += `export const versionEsquemaSalida = ${version} as const;\n\n`;
    } else if (esquema.properties.esquema.const !== version) throw new Error("Versiones de salida diferentes");
    function tipo(e: Esquema): string {
      if (e.$ref) {
        if (!e.$ref.startsWith("#/$defs/")) throw new Error("Referencia no soportada");
        return `${prefijo}${e.$ref.slice(8)}`;
      }
      if (Object.hasOwn(e, "const")) return JSON.stringify(e.const);
      if (e.enum) return e.enum.map((v: unknown) => JSON.stringify(v)).join(" | ");
      if (e.anyOf || e.oneOf) return (e.anyOf ?? e.oneOf).map(tipo).join(" | ");
      switch (e.type) {
        case "string": case "boolean": case "null": return e.type;
        case "number": case "integer": return "number";
        case "array": return `readonly (${tipo(e.items)})[]`;
        case "object": {
          if (e.additionalProperties && typeof e.additionalProperties === "object") return `{ readonly [clave: string]: ${tipo(e.additionalProperties)} }`;
          return `{ ${Object.entries(e.properties ?? {}).map(([clave, contenido]) =>
            `readonly ${JSON.stringify(clave)}${e.required?.includes(clave) ? "" : "?"}: ${tipo(contenido as Esquema)};`).join(" ")} }`;
        }
        default: throw new Error(`Esquema sin tipo soportado: ${JSON.stringify(e)}`);
      }
    }
    for (const [clave, definicion] of Object.entries(esquema.$defs ?? {})) salida += `type ${prefijo}${clave} = ${tipo(definicion as Esquema)};\n`;
    salida += `export type Respuesta${prefijo} = ${tipo(esquema)};\n\n`;
  }
  return salida.trimEnd() + "\n";
}

if (import.meta.main) await Bun.write(resolve(import.meta.dir, "../paquetes/rige/aplicacion/respuestas/contrato-generado.ts"), await generarTiposSalida());
