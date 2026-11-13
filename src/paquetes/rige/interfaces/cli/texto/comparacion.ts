import type { RespuestaComparacion } from "../../../aplicacion/respuestas/contrato-generado";
import { fechaLocal } from "../../presentacion/fechas";
import {
  type ContextoPresentacion,
  proyecto,
  atenuar,
  seguro,
  tabla,
  valor,
  ubicacion,
  noResueltas,
  terminar,
} from "./formato";

export function renderizarComparacion(r: RespuestaComparacion, c: ContextoPresentacion): string {
  const agentes = r.comparaciones.filter(a => !c.agente || a.agente === c.agente);
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
    `${resumen.cambiadas} cambiadas`,
    `${resumen.agregadas} agregadas`,
    `${resumen.quitadas} quitadas`,
    `${resumen.sinCambio} sin cambio`,
  ];
  const lineaResumen = resumenPartes.join(" · ");
  const avisoParcial = r.parcial ? ["Análisis incompleto: comparación parcial"] : [];

  const lineasAgentesEstado = ["agregados", "quitados", "inciertos"].flatMap(tipo => {
    const lista = r.agentes[tipo as "agregados" | "quitados" | "inciertos"].filter(
      a => !c.agente || a === c.agente
    );
    return lista.length ? [`Agentes ${tipo}: ${lista.map(seguro).join(", ")}`] : [];
  });

  const lineasSinCambios = sinCambios.length ? [`Sin cambios en: ${sinCambios.join(", ")}`] : [];

  const tablasPorAgente = agentes
    .filter(a => a.cambios.length)
    .flatMap(a => {
      const filas = a.cambios.map(v => [
        v.ruta.join("."),
        v.antes ? valor(v.antes.valor) : "—",
        v.despues ? valor(v.despues.valor) : "—",
        ubicacion(v.despues?.determinante ?? v.antes?.determinante ?? null),
      ]);
      return [seguro(a.agente), ...tabla(["CLAVE", "ANTES", "DESPUÉS", "LO DETERMINA"], filas, c)];
    });

  const lineasNoComparables = [r.desde, r.hasta].flatMap(f => [
    ...noResueltas(f.noComparables),
    ...f.motivosAgentes.map(seguro),
  ]);

  const lineas = [
    ...proyecto(r, { ...c, proyectoDesdeCarpetaActual: false }),
    rangoInstantes,
    lineaResumen,
    ...avisoParcial,
    ...lineasAgentesEstado,
    ...lineasSinCambios,
    ...tablasPorAgente,
    ...lineasNoComparables,
  ];

  return terminar(lineas, c);
}
