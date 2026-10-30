import { acumularSustituciones } from "./sustituciones";
import type { Adaptador, ContextoConsulta, ClaveNoResuelta, ErrorAnalisis, LecturaEntrada } from "../contrato/adaptador";
import type { EntornoLectura } from "../contrato/entorno";
import type { Resultado } from "../resultado";
import { biblioteca } from "./estrategias";
import { ArbolFusion } from "./estado";
import type { DeclaracionUbicada, EntradaLeida, Resolucion } from "./tipos";
import { resumirEntradas } from "./resumen-entradas";
import { leerVia } from "./leer-via";

const normalizar = (ruta: string) => ruta.replaceAll("\\", "/");
// Primitiva de copia pura del runtime, sin E/S.
declare function structuredClone<T>(valor: T): T;

export function resolver(adaptador: Adaptador, proyecto: string, entorno: EntornoLectura, contexto: ContextoConsulta): Resultado<Resolucion, ErrorAnalisis> {
  const ubicacion = adaptador.ubicar(proyecto, entorno, contexto);
  if (!ubicacion.exito) return ubicacion;
  const entradas: EntradaLeida[] = [];
  const lecturas: LecturaEntrada[] = [];
  const huellas: (string | null)[] = [];
  for (const [orden, via] of ubicacion.valor.entries()) {
    const lectura = leerVia(adaptador, entorno, via, orden, contexto);
    if (!lectura.exito) {
      if (lectura.error.ilegible?.consecuencia !== "descartada") return lectura;
      entradas.push({ ...lectura.error.lectura!.entrada, legibilidad: "ilegible",
        error: { ...lectura.error.ilegible.posicion, consecuencia: "descartada" } });
      huellas.push(lectura.error.lectura!.huella);
      lecturas.push({ orden, via, declaraciones: [] });
    } else {
      entradas.push(lectura.valor.entrada);
      huellas.push(lectura.valor.huella);
      lecturas.push({ orden, via, declaraciones: lectura.valor.declaraciones });
    }
  }
  return resolverDesdeLecturas(adaptador, proyecto, entorno, contexto, entradas, lecturas, huellas);
}

/** Ejecuta la resolucion sobre una captura ya leida; no vuelve a ubicar ni a leer vias. */
export function resolverDesdeLecturas(adaptador: Adaptador, proyecto: string, entorno: EntornoLectura,
  contexto: ContextoConsulta, entradas: readonly EntradaLeida[], lecturas: readonly LecturaEntrada[],
  huellas: readonly (string | null)[]): Resultado<Resolucion, ErrorAnalisis> {
  const secuencia = adaptador.secuenciar(lecturas);
  if (!secuencia.exito) return secuencia;
  const usados = new Set<string>();
  function usarRegla(regla: string): void {
    if (!Object.hasOwn(adaptador.reglas, regla)) throw new Error(`Regla sin plantilla: ${regla}`);
    usados.add(regla);
  }
  const estado = new ArbolFusion();
  for (const aplicacion of secuencia.valor.aplicaciones) {
    const estrategia = (Object.hasOwn(adaptador.estrategias, aplicacion.estrategia) ? adaptador.estrategias[aplicacion.estrategia] : undefined)
      ?? (Object.hasOwn(biblioteca, aplicacion.estrategia) ? biblioteca[aplicacion.estrategia] : undefined);
    if (!estrategia) throw new Error(`Estrategia desconocida: ${aplicacion.estrategia}`);
    usarRegla(aplicacion.regla);
    const { origen, ruta } = aplicacion;
    const entrada = origen.tipo === "declarado" ? entradas[origen.orden] : undefined;
    if (origen.tipo === "declarado" && !entrada) throw new Error(`Entrada inexistente para la aplicación: ${origen.orden}`);
    const nueva: DeclaracionUbicada = {
      origen: origen.tipo === "declarado" ? { ...origen, posicion: { ...origen.posicion } } : { ...origen },
      via: entrada?.via ?? null, referencia: entrada?.referencia ?? null,
      valor: structuredClone(aplicacion.valor), regla: aplicacion.regla,
      ...(aplicacion.sustituciones?.length ? { sustituciones: structuredClone(aplicacion.sustituciones) } : {}),
    };
    estrategia(estado, nueva, ruta);
  }
  const pendientes = new Map<string, ClaveNoResuelta>();
  for (const pendiente of secuencia.valor.noResueltas) {
    const identificador = JSON.stringify(pendiente.ruta);
    if (!pendientes.has(identificador)) {
      usarRegla(pendiente.regla);
      pendientes.set(identificador, structuredClone(pendiente));
    } else if (pendiente.sustituciones?.length) {
      const anterior = pendientes.get(identificador)!;
      pendientes.set(identificador, { ...anterior, sustituciones: acumularSustituciones(anterior.sustituciones, pendiente.sustituciones) });
    }
  }
  const declaraciones = [...contexto.declaraciones];
  for (const codigo of declaraciones) usarRegla(codigo);
  return { exito: true, valor: {
    formato: 2,
    identidad: { herramienta: adaptador.identidad.herramienta, version: adaptador.identidad.version },
    proyecto: normalizar(proyecto),
    prefijoAgente: adaptador.prefijoAgente,
    declaraciones,
    contexto: { proyecto: contexto.proyecto, plataforma: contexto.entorno.plataforma,
      parametros: { ...contexto.parametros }, declaraciones: [...contexto.declaraciones] },
    reglas: Object.fromEntries([...usados].sort().map((regla) => [regla, adaptador.reglas[regla]!])),
    entradas,
    resumenEntradas: resumirEntradas(entradas, huellas, lecturas.flatMap(l => l.declaraciones.flatMap(d => d.sustituciones ?? [])), texto => entorno.resumir(texto)),
    valores: estado.hojasBajo([]).map((rastro, indiceFusion) => ({ ...rastro, indiceFusion })),
    eliminadas: estado.eliminadas.map((rastro, ordenEliminacion) => ({ ...rastro, ordenEliminacion })),
    noResueltas: [...pendientes.values()],
  } };
}
