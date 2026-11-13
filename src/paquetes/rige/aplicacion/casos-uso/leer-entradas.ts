import type { Adaptador, ContextoConsulta, LecturaEntrada, ValorSustituido, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { EntradaAnalizada } from "@rige/nucleo/hallazgos/detectar";
import type { EntradaLeida } from "@rige/nucleo/resolucion/tipos";
import { leerVia } from "@rige/nucleo/resolucion/leer-via";
import { errorDesdeAnalisis, type ErrorUso } from "../errores";
import type { Resultado } from "../respuestas/resultado";
import type { MedicionAnalisis } from "./analizar-proyecto";

export interface ResultadoLecturaEntradas {
  readonly entradas: readonly EntradaLeida[];
  readonly huellas: readonly (string | null)[];
  readonly analizadas: readonly EntradaAnalizada[];
  readonly lecturas: readonly LecturaEntrada[];
  readonly sustituciones: readonly ValorSustituido[];
}

export function leerEntradas<C extends ContextoConsulta>(
  adaptador: Adaptador<C>,
  entorno: EntornoLectura,
  vias: readonly ViaUbicada[],
  contexto: C,
  medicion?: MedicionAnalisis,
): Resultado<ResultadoLecturaEntradas, ErrorUso> {
  const analizadas: EntradaAnalizada[] = [];
  const lecturas: LecturaEntrada[] = [];
  const huellas: (string | null)[] = [];
  const sustituciones: ValorSustituido[] = [];

  for (const [orden, via] of vias.entries()) {
    const lectura = leerVia(adaptador, entorno, via, orden, contexto);
    if (lectura.exito) {
      analizadas.push({
        entrada: { ...lectura.valor.entrada, legibilidad: via.condicion === "no_observada" ? null : "legible" },
        declaraciones: lectura.valor.declaraciones,
      });
      huellas.push(lectura.valor.huella);
      lecturas.push({ orden, via, declaraciones: lectura.valor.declaraciones });
      sustituciones.push(...lectura.valor.declaraciones.flatMap(d => d.sustituciones ?? []));
    } else {
      if (!lectura.error.ilegible) return { exito: false, error: errorDesdeAnalisis(lectura.error) };
      const { ilegible } = lectura.error;
      analizadas.push({
        entrada: {
          ...lectura.error.lectura!.entrada,
          legibilidad: "ilegible",
          error: { ...ilegible.posicion, consecuencia: ilegible.consecuencia },
        },
        declaraciones: [],
        ilegible,
      });
      huellas.push(lectura.error.lectura!.huella);
      lecturas.push({ orden, via, declaraciones: [] });
    }
  }

  medicion?.finalizarLectura();
  const entradas = analizadas.map(a => a.entrada);

  return {
    exito: true,
    valor: {
      entradas,
      huellas,
      analizadas,
      lecturas,
      sustituciones,
    },
  };
}
