import type { Adaptador, ContextoConsulta, ClaveNoResuelta, ErrorAnalisis, LecturaEntrada } from "../contrato/adaptador";
import type { EntornoLectura } from "../contrato/entorno";
import type { Resultado } from "../resultado";
import { biblioteca } from "./estrategias";
import { ArbolFusion } from "./estado";
import type { DeclaracionUbicada, EntradaLeida, Resolucion } from "./tipos";

const normalizar = (ruta: string) => ruta.replaceAll("\\", "/");

export function resolver(adaptador: Adaptador, proyecto: string, entorno: EntornoLectura, contexto?: ContextoConsulta): Resultado<Resolucion, ErrorAnalisis> {
  const preparado = contexto ? { exito: true as const, valor: contexto } : adaptador.contexto(proyecto, entorno);
  if (!preparado.exito) return preparado;
  const ubicacion = adaptador.ubicar(proyecto, entorno, preparado.valor);
  if (!ubicacion.exito) return ubicacion;
  const entradas: EntradaLeida[] = [];
  const lecturas: LecturaEntrada[] = [];
  for (const [orden, via] of ubicacion.valor.entries()) {
    let resumen: string | null = null;
    let declaraciones: LecturaEntrada["declaraciones"] = [];
    if (via.condicion === "observada") {
      const archivo = entorno.leer(via.referencia);
      const lectura = adaptador.leer(via, archivo.texto);
      if (!lectura.exito) return lectura;
      resumen = archivo.resumen;
      declaraciones = lectura.valor;
    }
    entradas.push({ orden, via: via.via, referencia: normalizar(via.referencia), condicion: via.condicion, resumen });
    lecturas.push({ orden, via, declaraciones });
  }
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
    if (origen.tipo === "declarado" && !entrada) throw new Error(`Entrada inexistente para la aplicacion: ${origen.orden}`);
    const nueva: DeclaracionUbicada = {
      origen: origen.tipo === "declarado" ? { ...origen, posicion: { ...origen.posicion } } : { ...origen },
      via: entrada?.via ?? null, referencia: entrada?.referencia ?? null,
      valor: aplicacion.valor, regla: aplicacion.regla,
    };
    estrategia(estado, nueva, ruta);
  }
  const pendientes = new Map<string, ClaveNoResuelta>();
  for (const pendiente of secuencia.valor.noResueltas) {
    const identificador = JSON.stringify(pendiente.ruta);
    if (!pendientes.has(identificador)) {
      usarRegla(pendiente.regla);
      pendientes.set(identificador, { ruta: pendiente.ruta, regla: pendiente.regla });
    }
  }
  return { exito: true, valor: {
    formato: 2,
    identidad: { herramienta: adaptador.identidad.herramienta, version: adaptador.identidad.version },
    proyecto: normalizar(proyecto),
    prefijoAgente: adaptador.prefijoAgente,
    reglas: Object.fromEntries([...usados].sort().map((regla) => [regla, adaptador.reglas[regla]!])),
    entradas,
    resumenEntradas: entorno.resumir(JSON.stringify(entradas.map((entrada) => [entrada.via, entrada.referencia, entrada.condicion, entrada.resumen]))),
    valores: estado.hojasBajo([]).map((rastro, indiceFusion) => ({ ...rastro, indiceFusion })),
    ...(estado.eliminadas.length ? { eliminadas: estado.eliminadas.map((rastro, indiceFusion) => ({ ...rastro, indiceFusion })) } : {}),
    noResueltas: [...pendientes.values()],
  } };
}
