import { crearEntornoAislado } from "./entorno-aislado";
import { copiarEscenario, type OpcionesEscenario } from "./escenario";
import { lanzar } from "./subproceso";
import { join } from "node:path";

export function prepararConsultas(nombre = "v2-cadena", opciones: OpcionesEscenario = {}) {
  const escenario = copiarEscenario(nombre, opciones);
  const variables: Record<string, string> = { ...crearEntornoAislado(join(escenario.raiz, "hogar"), {}),
    ProgramData: join(escenario.raiz, "administrada") };
  return { ...escenario, variables,
    consultar: (comando: string, opciones: readonly string[] = [], entorno: Record<string, string> = {}) =>
      lanzar(escenario.raiz, [comando, "--proyecto", escenario.proyecto, ...opciones], { ...variables, ...entorno }),
  };
}
