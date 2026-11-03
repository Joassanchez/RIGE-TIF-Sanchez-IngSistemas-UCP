import type { Adaptador, ContextoConsulta, Declaracion, ErrorAnalisis, ReglaDeclarada } from "../contrato/adaptador";
import type { EntradaLeida, Resolucion } from "../resolucion/tipos";
import type { EntradaHallazgo, Hallazgo } from "./tipos";

export interface EntradaAnalizada {
  readonly entrada: EntradaLeida;
  readonly declaraciones: readonly Declaracion[];
  readonly ilegible?: NonNullable<ErrorAnalisis["ilegible"]>;
}

function ubicar(entrada: EntradaLeida): EntradaHallazgo {
  if (entrada.condicion === "no_observada") throw new Error("Un hallazgo requiere una entrada observada o definida.");
  const { orden, via, referencia, condicion } = entrada;
  return { orden, via, referencia, condicion };
}

export function detectarEntradas(entradas: readonly EntradaAnalizada[]): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];
  for (const { entrada, declaraciones, ilegible } of entradas) {
    if (ilegible) {
      const falla = ilegible.consecuencia === "falla";
      hallazgos.push({ tipo: falla ? "entrada-ilegible" : "entrada-descartada",
        causa: falla ? ilegible.archivo === undefined ? "sintaxis-invalida" : "archivo-inexistente" : "permiso-invalido",
        entrada: ubicar(entrada), posicion: ilegible.posicion, clave: null,
        parametros: ilegible.archivo === undefined ? {} : { archivo: ilegible.archivo } });
      continue;
    }
    for (const declaracion of declaraciones) for (const sustitucion of declaracion.sustituciones ?? []) {
      if (sustitucion.tipo !== "variable" || sustitucion.definido) continue;
      hallazgos.push({ tipo: "sustitucion-sin-valor", causa: "variable-sin-valor", entrada: ubicar(entrada),
        posicion: sustitucion.posicion, clave: declaracion.ruta, parametros: { variable: sustitucion.origen } });
    }
  }
  return hallazgos;
}

export function detectarReferencias(adaptador: Adaptador, resolucion: Resolucion, contexto: ContextoConsulta): Hallazgo[] {
  const nombres = new Set(adaptador.listarAgentes(resolucion, contexto).agentes.filter(a => a.estado !== "deshabilitado").map(a => a.nombre));
  const hallazgos: Hallazgo[] = [];
  for (const referencia of adaptador.referencias) for (const rastro of resolucion.valores) {
    const { ruta, valor, determinante } = rastro;
    if (ruta.length !== referencia.ruta.length || !referencia.ruta.every((s, i) => s === "*" || s === ruta[i])) continue;
    if (typeof valor !== "string" || valor === "" || determinante.sustituciones?.length || nombres.has(valor)) continue;
    if (resolucion.noResueltas.some(n => n.ruta.length <= ruta.length && n.ruta.every((s, i) => s === ruta[i]))) continue;
    const origen = determinante.origen;
    if (origen.tipo !== "declarado") continue;
    const entrada = resolucion.entradas.find(e => e.orden === origen.orden);
    if (!entrada) throw new Error("Entrada determinante inexistente.");
    hallazgos.push({ tipo: "referencia-no-resuelta", causa: referencia.causa, entrada: ubicar(entrada),
      posicion: origen.posicion, clave: ruta, parametros: { agente: valor } });
  }
  return hallazgos;
}

export function detectarReglasSinEfecto<C extends ContextoConsulta>(
  adaptador: Adaptador<C>,
  resolucion: Resolucion,
  contexto: C,
): Hallazgo[] {
  const bajo = (ruta: readonly string[], prefijo: readonly string[]) => prefijo.every((s, i) => ruta[i] === s);
  const reglas = resolucion.valores.toSorted((a, b) => a.indiceFusion - b.indiceFusion).flatMap(rastro => {
    const { ruta, determinante } = rastro;
    const origen = determinante.origen;
    if (origen.tipo !== "declarado" || determinante.sustituciones?.length
      || resolucion.noResueltas.some(n => bajo(ruta, n.ruta))) return [];
    const enAgente = bajo(ruta, adaptador.prefijoAgente);
    const inicio = enAgente ? adaptador.prefijoAgente.length + 1 : 0;
    if (ruta[inicio] !== "permission") return [];
    const segmentos = ruta.slice(inicio + 1);
    if (segmentos.length > 2 || typeof rastro.valor !== "string"
      || !Object.hasOwn(adaptador.permisos.plantillas.efectos, rastro.valor)) return [];
    const entrada = resolucion.entradas.find(e => e.orden === origen.orden);
    if (!entrada) throw new Error("Entrada de regla inexistente.");
    const regla: ReglaDeclarada = { agente: enAgente ? ruta[inicio - 1]! : null, clave: ruta,
      sujeto: segmentos[0] ?? "*", patron: segmentos[1] ?? "*", efecto: rastro.valor };
    return [{ regla, entrada: ubicar(entrada), posicion: origen.posicion }];
  });
  const hallazgos: Hallazgo[] = [];
  for (const [indice, actual] of reglas.entries()) {
    const { regla, entrada, posicion } = actual;
    const parametros = { sujeto: regla.sujeto, patron: regla.patron,
      efecto: adaptador.permisos.plantillas.efectos[regla.efecto]! };
    const ruta = adaptador.causaRutaRegla?.(resolucion, contexto, regla);
    if (ruta) {
      hallazgos.push({ tipo: "regla-sin-efecto", causa: ruta.causa, entrada, posicion, clave: regla.clave,
        parametros: { ...parametros, ...ruta.parametros } });
      continue;
    }
    if (/[*?]/.test(regla.sujeto)) continue;
    const posterior = reglas.slice(indice + 1).find(b => b.regla.agente === regla.agente
      && b.regla.sujeto === regla.sujeto && adaptador.abarca?.(b.regla.patron, regla.patron));
    if (!posterior) continue;
    hallazgos.push({ tipo: "regla-sin-efecto", causa: "tapada-por-posterior", entrada, posicion, clave: regla.clave,
      parametros: { ...parametros, patronPosterior: posterior.regla.patron,
        efectoPosterior: adaptador.permisos.plantillas.efectos[posterior.regla.efecto]!,
        origenPosterior: `${posterior.entrada.referencia}:${posterior.posicion.linea}` } });
  }
  return hallazgos;
}

const compararTexto = (a: string, b: string) => a === b ? 0 : a < b ? -1 : 1;
export function ordenarHallazgos(hallazgos: readonly Hallazgo[]): Hallazgo[] {
  return [...hallazgos].sort((a, b) => a.entrada.orden - b.entrada.orden
    || a.posicion.linea - b.posicion.linea || a.posicion.columna - b.posicion.columna
    || compararTexto(a.tipo, b.tipo) || compararTexto(a.causa, b.causa)
    || compararTexto(JSON.stringify(a.clave), JSON.stringify(b.clave)));
}
