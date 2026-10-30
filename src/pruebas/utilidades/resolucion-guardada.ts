import { existsSync } from "node:fs";
import { RepositorioResolucionesSqlite } from "../../paquetes/rige/adaptadores/almacen-sqlite/resoluciones";
import { versionRige } from "../../paquetes/rige/aplicacion/respuestas/estado";

/** Inserta un documento de formato 2 anterior a T3-01 sin modificar la resolucion original. */
export function crearResolucionGuardadaAnterior(directorio: string, origen: number): number {
  const repositorio = new RepositorioResolucionesSqlite(directorio, { existe: existsSync }, versionRige);
  const guardada = repositorio.leer(origen);
  if (!guardada.exito) throw new Error(guardada.error.mensaje);
  const documento = structuredClone(guardada.valor.resolucion);
  const codigos = new Set(["version-no-determinada", "ejecutable-no-encontrado", "paquete-no-encontrado", "paquete-ilegible"]);
  const anterior = { ...documento,
    declaraciones: documento.declaraciones.filter(codigo => !codigos.has(codigo)),
    contexto: { ...documento.contexto, declaraciones: documento.contexto.declaraciones.filter(codigo => !codigos.has(codigo)) },
    reglas: Object.fromEntries(Object.entries(documento.reglas).filter(([codigo]) => !codigos.has(codigo))),
  };
  const alta = repositorio.guardar(anterior, guardada.valor.instante);
  if (!alta.exito) throw new Error(alta.error.mensaje);
  return alta.valor;
}
