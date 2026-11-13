import type { RespuestaValores } from "../../../aplicacion/respuestas/contrato-generado";
import {
  type ContextoPresentacion,
  proyecto,
  tabla,
  valor,
  recortar,
  ubicacion,
  terminar,
  noResueltas,
  limites,
  referencias,
  seguro,
} from "./formato";

export function renderizarValores(r: RespuestaValores, c: ContextoPresentacion): string {
  const visibles = r.valores.filter(
    v => c.todo || r.ruta !== null || v.rastro.determinante.origen.tipo === "declarado"
  );
  const filas = visibles.map(v => {
    const desplazadas = v.rastro.desplazadas;
    const antes = desplazadas.length
      ? recortar(valor(desplazadas.at(-1)!.valor), 16)
      : "ninguna";
    return [v.clave, valor(v.rastro.valor), antes, ubicacion(v.rastro.determinante)];
  });
  const ocultos = r.valores.length - visibles.length;
  const lineasDesplazadas = c.todo
    ? visibles
        .filter(v => v.rastro.desplazadas.length)
        .flatMap(v => [
          `Desplazadas de ${seguro(v.clave)}:`,
          ...v.rastro.desplazadas.map(d => `${valor(d.valor)} · ${ubicacion(d)}`),
        ])
    : [];
  const avisoOcultos = ocultos ? [`+ ${ocultos} valores de fábrica (--todo)`] : [];
  const avisoMotivo = r.motivo ? [r.motivo] : [];
  const lineas = [
    ...proyecto(r, c),
    ...tabla(["CLAVE", "VALOR", "ANTES", "LO DETERMINA"], filas, c),
    ...lineasDesplazadas,
    ...avisoOcultos,
    ...avisoMotivo,
    ...noResueltas(r.noResueltas),
    ...limites(r, c),
  ];
  const refs = referencias(visibles.flatMap(v => [v.rastro.determinante, ...v.rastro.desplazadas]));
  return terminar(lineas, c, refs);
}
