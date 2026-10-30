import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { crearEntornoAislado } from "./entorno-aislado";

export interface ReferenciaEntorno {
  readonly procedencia: { readonly hogar: string; readonly OPENCODE_CONFIG?: string;
    readonly skillsExternosExcluidos?: boolean;
    readonly variables?: { readonly OPENCODE_CONFIG_DIR?: string; readonly OPENCODE_CONFIG_CONTENT?: string; readonly OPENCODE_PERMISSION?: string } };
}

export function entornoDeReferencia(referencia: ReferenciaEntorno, copia: { readonly raiz: string }): Record<string, string> {
  const hogar = join(copia.raiz, referencia.procedencia.hogar);
  const env = { ...crearEntornoAislado(hogar, process.env), XDG_CONFIG_HOME: join(hogar, ".config"),
    RIGE_ALMACEN: join(hogar, "almacen"), ProgramData: hogar, TEMP: join(hogar, "tmp"), TMP: join(hogar, "tmp"), TMPDIR: join(hogar, "tmp") };
  mkdirSync(env.TEMP, { recursive: true });
  if (referencia.procedencia.OPENCODE_CONFIG) Object.assign(env, { OPENCODE_CONFIG: join(copia.raiz, referencia.procedencia.OPENCODE_CONFIG) });
  if (referencia.procedencia.skillsExternosExcluidos) Object.assign(env, { OPENCODE_DISABLE_EXTERNAL_SKILLS: "true" });
  for (const [nombre, ruta] of Object.entries(referencia.procedencia.variables ?? {})) {
    Object.assign(env, { [nombre]: nombre === "OPENCODE_CONFIG_DIR" ? join(copia.raiz, ruta) : readFileSync(join(copia.raiz, ruta), "utf8") });
  }
  return env;
}
