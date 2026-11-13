import type { RespuestaEstado, RespuestaEstadoCli } from "../../../aplicacion/respuestas/estado";
import {
  type ContextoPresentacion,
  pintar,
  seguro,
  terminar,
  unirBloques,
} from "./formato";

export function renderizarEstado(
  r: RespuestaEstadoCli | RespuestaEstado,
  c: ContextoPresentacion,
  conPie = true
): string {
  const rutaAlmacen = "Almacén: " + seguro(r.almacen.ruta);
  const existe = `Existe: ${"existe" in r.almacen ? (r.almacen.existe ? "sí" : "no") : "sí"}`;
  const version = `Versión de esquema: ${r.almacen.versionEsquema ?? "sin esquema"}`;
  const sugerencia = r.almacen.versionEsquema === null ? [`Probá: ${pintar("pista", "bun run rige -- esquema", c)}`] : [];

  const lineas = unirBloques([
    [rutaAlmacen, existe, version],
    sugerencia,
  ]);

  return terminar(lineas, c, [rutaAlmacen, seguro(r.almacen.ruta)], { pieJson: conPie });
}
