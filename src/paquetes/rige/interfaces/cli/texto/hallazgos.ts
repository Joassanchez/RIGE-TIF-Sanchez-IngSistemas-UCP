import type { RespuestaHallazgos } from "../../../aplicacion/respuestas/contrato-generado";
import { rutaVisible } from "../../presentacion/rutas";
import { causaHallazgo, motivoNoResolucion, tipoHallazgo } from "../../presentacion/vocabulario";
import {
  type ContextoPresentacion,
  pintar,
  proyecto,
  nombre,
  seguro,
  limites,
  terminar,
  unirBloques,
} from "./formato";

export function renderizarHallazgos(r: RespuestaHallazgos, c: ContextoPresentacion): string {
  const ctx: ContextoPresentacion = { ...c, proyecto: c.proyecto ?? r.proyecto };
  const grupos = [...new Set(r.hallazgos.map(h => h.tipo))];
  const lineasIncompleta = r.incompleta
    ? [`${pintar("pregunta", "Análisis incompleto:", ctx)} ${r.motivos.map(m => seguro(motivoNoResolucion(m, r.reglas))).join(", ")}`]
    : [];

  const bloquesHallazgos = r.hallazgos.length
    ? grupos.map(tipo => {
        const delTipo = r.hallazgos.filter(h => h.tipo === tipo);
        return [
          pintar("rige", tipoHallazgo(tipo, delTipo.length), ctx),
          ...delTipo.map(h => {
            const archivo = seguro(rutaVisible(h.entrada.referencia, ctx.proyecto, ctx.hogar));
            const pos = `${h.posicion.linea}:${h.posicion.columna}`;
            const causa = seguro(causaHallazgo(h.causa, r.reglas));
            const exp = ctx.explicar && h.explicacion ? ` · ${seguro(h.explicacion)}` : "";
            return `${pintar("declarado", `${archivo}:${pos}`, ctx)} · ${causa}${exp}`;
          }),
        ];
      })
    : [["Sin hallazgos"]];

  const lineas = unirBloques([
    proyecto(r, ctx),
    lineasIncompleta,
    ...bloquesHallazgos,
    limites(r, ctx),
  ]);

  const indivisibles = r.hallazgos.flatMap(h => [
    seguro(h.entrada.referencia),
    seguro(rutaVisible(h.entrada.referencia, ctx.proyecto, ctx.hogar)),
    seguro(nombre(h.entrada.referencia)),
  ]);

  return terminar(lineas, ctx, indivisibles);
}
