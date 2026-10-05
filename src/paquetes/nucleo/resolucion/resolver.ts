import type { Adaptador, ClaveNoResuelta, ErrorAnalisis, LecturaEntrada } from "../contrato/adaptador";
import type { EntornoLectura } from "../contrato/entorno";
import type { Resultado } from "../resultado";
import { biblioteca } from "./estrategias";
import { clave } from "./proyectar";
import type { DeclaracionUbicada, EntradaLeida, Resolucion, RastroValor } from "./tipos";

const normalizar = (ruta: string) => ruta.replaceAll("\\", "/");
const comparar = (a: { readonly ruta: readonly string[] }, b: { readonly ruta: readonly string[] }) => {
  const primera = clave(a.ruta);
  const segunda = clave(b.ruta);
  return primera < segunda ? -1 : primera > segunda ? 1 : 0;
};

export function resolver(adaptador: Adaptador, proyecto: string, entorno: EntornoLectura): Resultado<Resolucion, ErrorAnalisis> {
  const ubicacion = adaptador.ubicar(proyecto, entorno);
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
  const rastros = new Map<string, RastroValor>();
  for (const aplicacion of secuencia.valor.aplicaciones) {
    const estrategia = (Object.hasOwn(adaptador.estrategias, aplicacion.estrategia) ? adaptador.estrategias[aplicacion.estrategia] : undefined)
      ?? (Object.hasOwn(biblioteca, aplicacion.estrategia) ? biblioteca[aplicacion.estrategia] : undefined);
    if (!estrategia) throw new Error(`Estrategia desconocida: ${aplicacion.estrategia}`);
    usarRegla(aplicacion.regla);
    const entrada = entradas[aplicacion.orden];
    if (!entrada) throw new Error(`Entrada inexistente para la aplicacion: ${aplicacion.orden}`);
    const nueva: DeclaracionUbicada = {
      orden: aplicacion.orden, via: entrada.via, referencia: entrada.referencia,
      posicion: { linea: aplicacion.declaracion.posicion.linea, columna: aplicacion.declaracion.posicion.columna },
      valor: aplicacion.declaracion.valor, regla: aplicacion.regla,
    };
    const ruta = aplicacion.declaracion.ruta;
    const identificador = JSON.stringify(ruta);
    rastros.set(identificador, estrategia(rastros.get(identificador), nueva, ruta));
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
    formato: 1,
    identidad: { herramienta: adaptador.identidad.herramienta, version: adaptador.identidad.version },
    proyecto: normalizar(proyecto),
    prefijoAgente: adaptador.prefijoAgente,
    reglas: Object.fromEntries([...usados].sort().map((regla) => [regla, adaptador.reglas[regla]!])),
    entradas,
    resumenEntradas: entorno.resumir(JSON.stringify(entradas.map((entrada) => [entrada.via, entrada.referencia, entrada.condicion, entrada.resumen]))),
    valores: [...rastros.values()].sort(comparar),
    noResueltas: [...pendientes.values()].sort(comparar),
  } };
}
