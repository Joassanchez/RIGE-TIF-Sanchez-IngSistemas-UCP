import type { RespuestaEstado, RespuestaEstadoCli } from "../../../aplicacion/respuestas/estado";
import {
  type ContextoPresentacion,
  seguro,
  terminar,
} from "./formato";

export function renderizarEstado(r: RespuestaEstadoCli | RespuestaEstado, c: ContextoPresentacion): string {
  const rutaAlmacen = "Almacén: " + seguro(r.almacen.ruta);
  const existe = `Existe: ${"existe" in r.almacen ? (r.almacen.existe ? "sí" : "no") : "sí"}`;
  const version = `Versión de esquema: ${r.almacen.versionEsquema ?? "sin esquema"}`;
  const sugerencia = r.almacen.versionEsquema === null ? ["Probá: bun run rige -- esquema"] : [];

  const lineas = [
    rutaAlmacen,
    existe,
    version,
    ...sugerencia,
  ];

  return terminar(lineas, c, [seguro(r.almacen.ruta)]);
}
