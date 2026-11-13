import type { RespuestaValores } from "../../../aplicacion/respuestas/contrato-generado";
import { motivoNoResolucion, plural } from "../../presentacion/vocabulario";
import {
  type ContextoPresentacion,
  ancho,
  pintar,
  proyecto,
  tabla,
  valor,
  recortar,
  ubicacion,
  ubicacionFragmentos,
  terminar,
  noResueltas,
  limites,
  referencias,
  seguro,
  unirBloques,
} from "./formato";

export function renderizarValores(r: RespuestaValores, c: ContextoPresentacion): string {
  const ctx: ContextoPresentacion = { ...c, proyecto: c.proyecto ?? r.proyecto };
  const visibles = r.valores.filter(
    v => ctx.todo || r.ruta !== null || v.rastro.determinante.origen.tipo === "declarado"
  );
  const filas = visibles.map(v => {
    const desplazadas = v.rastro.desplazadas;
    const antes = desplazadas.length
      ? valor(desplazadas.at(-1)!.valor)
      : "—";
    return [
      v.clave,
      { texto: valor(v.rastro.valor), rol: "rige" as const },
      { texto: antes, rol: antes === "—" ? ("estructura" as const) : ("desplazado" as const) },
      ubicacionFragmentos(v.rastro.determinante, undefined, ctx),
    ];
  });
  const ocultos = r.valores.length - visibles.length;
  const lineasDesplazadas = ctx.todo
    ? visibles
        .filter(v => v.rastro.desplazadas.length)
        .flatMap(v => [
          pintar("desplazado", `Desplazadas de ${seguro(v.clave)}:`, ctx),
          ...v.rastro.desplazadas.map(d => `${pintar("desplazado", valor(d.valor), ctx)} · ${ubicacion(d, undefined, ctx)}`),
        ])
    : [];
  const avisoOcultos = ocultos ? [pintar("estructura", `+ ${ocultos} ${plural(ocultos, "valor", "valores")} de fábrica (--todo)`, ctx)] : [];
  const claveInexistente = r.motivo === "clave-inexistente" && r.ruta !== null;
  const avisoMotivo = claveInexistente
    ? [`${seguro(r.agente)} no tiene la clave "${seguro(r.ruta!.join("."))}". Probá: ${pintar("pista", `rige valores --agente ${seguro(r.agente)}`, ctx)}`]
    : r.motivo ? [seguro(motivoNoResolucion(r.motivo, r.reglas))] : [];
  const limiteAncho = ancho(ctx);
  const bloqueTabla = claveInexistente
    ? []
    : tabla(["CLAVE", "VALOR", "ANTES", "LO DETERMINA"], filas, ctx, {
        elasticas: [1, 2],
        apilado: ([clave, val, antes, determina]) => [
          clave!,
          `  ${pintar("rige", recortar(val!, Math.max(1, limiteAncho - 2)), ctx)}`,
          ...(antes === "—" ? [] : [`  ${pintar("desplazado", `antes: ${recortar(antes!, Math.max(1, limiteAncho - 9))}`, ctx)}`]),
          `  ← ${determina!}`,
        ],
      });
  const lineas = unirBloques([
    proyecto(r, ctx),
    bloqueTabla,
    lineasDesplazadas,
    [...avisoOcultos, ...avisoMotivo, ...noResueltas(r.noResueltas, r.reglas), ...limites(r, ctx)],
  ]);
  const refs = referencias(visibles.flatMap(v => [v.rastro.determinante, ...v.rastro.desplazadas]), ctx);
  return terminar(lineas, ctx, refs);
}
