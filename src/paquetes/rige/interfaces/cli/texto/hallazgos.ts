import type { RespuestaHallazgos } from "../../../aplicacion/respuestas/contrato-generado";
import {
  type ContextoPresentacion,
  proyecto,
  nombre,
  seguro,
  limites,
  terminar,
} from "./formato";

export function renderizarHallazgos(r: RespuestaHallazgos, c: ContextoPresentacion): string {
  const grupos = [...new Set(r.hallazgos.map(h => h.tipo))];
  const lineasIncompleta = r.incompleta
    ? [`Análisis incompleto: ${r.motivos.map(seguro).join(", ")}`]
    : [];

  const lineasHallazgos = r.hallazgos.length
    ? grupos.flatMap(tipo => [
        tipo,
        ...r.hallazgos
          .filter(h => h.tipo === tipo)
          .map(h => {
            const archivo = seguro(nombre(h.entrada.referencia));
            const pos = `${h.posicion.linea}:${h.posicion.columna}`;
            const causa = seguro(h.causa);
            const exp = c.explicar && h.explicacion ? ` · ${seguro(h.explicacion)}` : "";
            return `${archivo}:${pos} · ${causa}${exp}`;
          }),
      ])
    : ["Sin hallazgos"];

  const lineas = [
    ...proyecto(r, c),
    ...lineasIncompleta,
    ...lineasHallazgos,
    ...limites(r, c),
  ];

  const indivisibles = r.hallazgos.flatMap(h => [
    seguro(h.entrada.referencia),
    seguro(nombre(h.entrada.referencia)),
  ]);

  return terminar(lineas, c, indivisibles);
}
