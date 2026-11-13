import type { RespuestaComparacion } from "../../../aplicacion/respuestas/contrato-generado";
import { fechaLocal } from "../../presentacion/fechas";
import { motivoNoResolucion, plural } from "../../presentacion/vocabulario";
import {
  type CeldaTabla,
  type ContextoPresentacion,
  ancho,
  pintar,
  proyecto,
  atenuar,
  seguro,
  tabla,
  valor,
  recortar,
  ubicacionFragmentos,
  referencias,
  noResueltas,
  terminar,
  unirBloques,
} from "./formato";

export function renderizarComparacion(r: RespuestaComparacion, c: ContextoPresentacion): string {
  const ctx: ContextoPresentacion = { ...c, proyecto: c.proyecto ?? r.proyecto };
  const agentes = r.comparaciones.filter(a => !ctx.agente || a.agente === ctx.agente);
  const existeAgenteEnComparacion = !ctx.agente
    || agentes.length > 0
    || r.agentes.agregados.includes(ctx.agente)
    || r.agentes.quitados.includes(ctx.agente)
    || r.agentes.inciertos.includes(ctx.agente);
  const avisoAgenteInexistente = !existeAgenteEnComparacion && ctx.agente
    ? [`${pintar("pregunta", "Aviso:", ctx)} el agente "${seguro(ctx.agente)}" no aparece en esta comparación.${r.comparaciones.length ? ` Agentes: ${r.comparaciones.map(a => seguro(a.agente)).join(", ")}.` : ""}`]
    : [];
  const resumen = agentes.reduce(
    (acum, a) => ({
      cambiadas: acum.cambiadas + a.resumen.cambiadas,
      agregadas: acum.agregadas + a.resumen.agregadas,
      quitadas: acum.quitadas + a.resumen.quitadas,
      sinCambio: acum.sinCambio + a.resumen.sinCambio,
    }),
    { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 0 }
  );

  const sinCambios = agentes.filter(a => !a.cambios.length).map(a => seguro(a.agente));
  const rangoInstantes = `Cambios entre ${fechaLocal(r.desde.instante)} y ${fechaLocal(r.hasta.instante)} ${atenuar(
    `(#${r.desde.id}, #${r.hasta.id})`,
    c
  )}`;
  const resumenPartes = [
    pintar("pregunta", `${resumen.cambiadas} ${plural(resumen.cambiadas, "cambiada", "cambiadas")}`, ctx),
    pintar("permitida", `${resumen.agregadas} ${plural(resumen.agregadas, "agregada", "agregadas")}`, ctx),
    pintar("denegada", `${resumen.quitadas} ${plural(resumen.quitadas, "quitada", "quitadas")}`, ctx),
    pintar("estructura", `${resumen.sinCambio} sin cambio`, ctx),
  ];
  const lineaResumen = resumenPartes.join(" · ");
  const avisoParcial = r.parcial ? [`${pintar("pregunta", "Análisis incompleto:", ctx)} comparación parcial`] : [];

  const lineasAgentesEstado = ["agregados", "quitados", "inciertos"].flatMap(tipo => {
    const lista = r.agentes[tipo as "agregados" | "quitados" | "inciertos"].filter(
      a => !c.agente || a === c.agente
    );
    return lista.length ? [`Agentes ${tipo}: ${lista.map(seguro).join(", ")}`] : [];
  });

  const lineasSinCambios = sinCambios.length ? [`Sin cambios en: ${sinCambios.join(", ")}`] : [];

  const limiteAncho = ancho(ctx);
  const bloquesPorAgente = agentes
    .filter(a => a.cambios.length)
    .map(a => {
      const filas: CeldaTabla[][] = a.cambios.map(v => {
        const textoAntes = v.antes ? valor(v.antes.valor) : "—";
        const textoDespues = v.despues ? valor(v.despues.valor) : "—";
        const soloProcedencia = v.antes !== null && v.despues !== null && textoAntes === textoDespues;
        return [
          v.ruta.join("."),
          v.antes ? { texto: textoAntes, rol: soloProcedencia ? "pregunta" : "denegada" } : { texto: "—", rol: "estructura" },
          v.despues ? { texto: textoDespues, rol: soloProcedencia ? "pregunta" : "permitida" } : { texto: "—", rol: "estructura" },
          ubicacionFragmentos(v.despues?.determinante ?? v.antes?.determinante ?? null, undefined, ctx),
        ];
      });
      return [
        seguro(a.agente),
        ...tabla(["CLAVE", "ANTES", "DESPUÉS", "LO DETERMINA"], filas, ctx, {
          elasticas: [1, 2],
          apilado: ([clave, antes, despues, determina]) => {
            const soloProcedencia = antes !== "—" && despues !== "—" && antes === despues;
            return [
              clave!,
              `  ${pintar(antes === "—" ? "estructura" : soloProcedencia ? "pregunta" : "denegada", `antes: ${recortar(antes!, Math.max(1, limiteAncho - 9))}`, ctx)}`,
              `  ${pintar(despues === "—" ? "estructura" : soloProcedencia ? "pregunta" : "permitida", `después: ${recortar(despues!, Math.max(1, limiteAncho - 11))}`, ctx)}`,
              `  ← ${determina!}`,
            ];
          },
        }),
      ];
    });

  const lineasNoComparables = [r.desde, r.hasta].flatMap(f => [
    ...noResueltas(f.noComparables, f.reglas),
    ...f.motivosAgentes.map(m => seguro(motivoNoResolucion(m, f.reglas))),
  ]);

  const lineas = unirBloques([
    proyecto(r, { ...ctx, proyectoDesdeCarpetaActual: false }),
    [rangoInstantes, lineaResumen, ...avisoParcial, ...avisoAgenteInexistente, ...lineasAgentesEstado, ...lineasSinCambios],
    ...bloquesPorAgente,
    lineasNoComparables,
  ]);

  const refs = referencias(
    agentes.flatMap(a => a.cambios.flatMap(v => [v.despues?.determinante ?? null, v.antes?.determinante ?? null])),
    ctx,
  );
  return terminar(lineas, ctx, refs);
}
