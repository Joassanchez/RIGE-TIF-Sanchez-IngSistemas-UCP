import { crearEntornoAislado } from "./entorno-aislado";
import { copiarEscenario } from "./escenario";
import { lanzar } from "./subproceso";
import { join } from "node:path";

export function prepararConsultas(nombre = "v2-cadena") {
  const escenario = copiarEscenario(nombre);
  const variables = { ...crearEntornoAislado(join(escenario.raiz, "hogar"), {}),
    ProgramData: join(escenario.raiz, "administrada") };
  return { ...escenario, variables,
    consultar: (comando: string, opciones: readonly string[] = [], entorno: Record<string, string> = {}) =>
      lanzar(escenario.raiz, [comando, "--proyecto", escenario.proyecto, ...opciones], { ...variables, ...entorno }),
  };
}
