import { crearEntornoMemoria } from "./entorno-memoria";
import { instalacionEnMemoria } from "./instalacion-opencode";

/** Entorno de contexto con version soportada; las pruebas de version usan el entorno basico. */
export function crearEntornoOpenCode(opciones: Parameters<typeof crearEntornoMemoria>[0]) {
  const instalacion = instalacionEnMemoria(opciones.rutas === "win32" ? "C:\\instalacion-falsa" : "/instalacion-falsa", "1.18.25");
  const previo = opciones.variables?.PATH ?? opciones.variables?.Path;
  const separador = opciones.plataforma === "win32" ? ";" : ":";
  return crearEntornoMemoria({ ...opciones,
    archivos: { ...instalacion.archivos, ...opciones.archivos },
    variables: { ...opciones.variables, PATH: instalacion.variables.PATH + (previo === undefined ? "" : separador + previo) },
  });
}
