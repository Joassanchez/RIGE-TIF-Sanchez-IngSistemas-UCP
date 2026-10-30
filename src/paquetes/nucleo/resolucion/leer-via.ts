import type { Adaptador, ContextoConsulta, Declaracion, ErrorAnalisis, ViaUbicada } from "../contrato/adaptador";
import type { EntornoLectura } from "../contrato/entorno";
import type { Resultado } from "../resultado";
import type { EntradaLeida } from "./tipos";

interface DatosLectura { readonly entrada: EntradaLeida; readonly huella: string | null }
interface LecturaVia extends DatosLectura { readonly declaraciones: readonly Declaracion[] }
/** Datos ya leidos para que el consumidor decida si continuar ante una ilegible, sin releerla. */
interface ErrorLectura extends ErrorAnalisis { readonly lectura?: DatosLectura }

export function leerVia<C extends ContextoConsulta>(adaptador: Adaptador<C>, entorno: EntornoLectura, via: ViaUbicada,
  orden: number, contexto: C): Resultado<LecturaVia, ErrorLectura> {
  const archivo = via.condicion === "observada" ? entorno.leer(via.referencia) : null;
  const texto = archivo?.texto ?? (via.condicion === "definida" ? entorno.variable(via.referencia)! : "");
  const entrada: EntradaLeida = { orden, via: via.via, referencia: via.referencia.replaceAll("\\", "/"),
    condicion: via.condicion, resumen: archivo?.resumen ?? null };
  const huella = archivo?.resumen ?? (via.constituyeEntrada ? entorno.resumir(texto) : null);
  if (via.condicion === "no_observada") return { exito: true, valor: { entrada, huella, declaraciones: [] } };
  const lectura = adaptador.leer(via, texto, entorno, contexto);
  if (lectura.exito) return { exito: true, valor: { entrada, huella, declaraciones: lectura.valor } };
  return lectura.error.ilegible ? { exito: false, error: { ...lectura.error, lectura: { entrada, huella } } } : lectura;
}
