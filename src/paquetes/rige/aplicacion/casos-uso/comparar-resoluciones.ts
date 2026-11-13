import type { ListadoAgentes, ValorJson } from "@rige/nucleo/contrato/adaptador";
import type { DeclaracionUbicada, Resolucion, RastroValor } from "@rige/nucleo/resolucion/tipos";
import type { Resultado } from "../respuestas/resultado";
import { errorAnalisisInsuficientes, errorResolucionesDeOtroProyecto, errorSolicitudInvalida, type ErrorUso } from "../errores";
import type { PuertoResoluciones, ResolucionGuardada } from "../puertos/resoluciones";
import type { RespuestaComparacion } from "../respuestas/contrato-generado";
import { localizarDeclaracion } from "../respuestas/localizacion";
import { versionEsquemaSalida } from "../respuestas/valores";
import { prepararAnalisis, resolverRutaProyecto, type DependenciasAnalisis } from "./analizar-proyecto";
import { esIdResolucion } from "./id-resolucion";

export type CompararResoluciones = (desde: string, hasta: string) => Resultado<RespuestaComparacion, ErrorUso>;
type ComparacionAgente = RespuestaComparacion["comparaciones"][number];
type Resumen = RespuestaComparacion["resumen"];

const compararTexto = (a: string, b: string): number => a === b ? 0 : a < b ? -1 : 1;
function compararRutas(a: readonly string[], b: readonly string[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const orden = compararTexto(a[i]!, b[i]!);
    if (orden) return orden;
  }
  return a.length - b.length;
}
const prefijo = (a: readonly string[], b: readonly string[]): boolean => a.length <= b.length && a.every((p, i) => b[i] === p);
const relacionadas = (a: readonly string[], b: readonly string[]): boolean => prefijo(a, b) || prefijo(b, a);

/** Igualdad JSON: objetos sin orden de propiedades, arreglos con orden. */
function firma(valor: ValorJson): string {
  if (Array.isArray(valor)) return `[${valor.map(firma).join(",")}]`;
  if (valor !== null && typeof valor === "object") return `{${Object.keys(valor).sort(compararTexto)
    .map(k => `${JSON.stringify(k)}:${firma((valor as Record<string, ValorJson>)[k]!)}`).join(",")}}`;
  return JSON.stringify(valor);
}
function procedencia(d: DeclaracionUbicada): ValorJson {
  // orden es un indice interno de lectura, no la identidad de la determinante.
  const origen = d.origen.tipo === "declarado" ? { tipo: d.origen.tipo,
    posicion: { linea: d.origen.posicion.linea, columna: d.origen.posicion.columna } } : d.origen;
  return { origen, via: d.via, referencia: d.referencia, regla: d.regla };
}
const vacio = (): Resumen => ({ cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 0 });
const lado = (r: RastroValor | undefined) => r ? { valor: r.valor, determinante: localizarDeclaracion(r.determinante) } : null;

function compararAgente(antes: Resolucion, despues: Resolucion, agente: string): ComparacionAgente {
  const extraer = (r: Resolucion) => {
    const inicio = [...r.prefijoAgente, agente];
    return new Map(r.valores.filter(v => v.ruta.length > inicio.length && prefijo(inicio, v.ruta))
      .map(v => [JSON.stringify(v.ruta.slice(inicio.length)), v]));
  };
  const a = extraer(antes), b = extraer(despues);
  const rutas = [...new Set([...a.keys(), ...b.keys()])].map(k => JSON.parse(k) as string[]).sort(compararRutas);
  const cambios: ComparacionAgente["cambios"][number][] = [];
  let cambiadas = 0, agregadas = 0, quitadas = 0, sinCambio = 0;
  for (const ruta of rutas) {
    if ([antes, despues].some(r => r.noResueltas.some(n => relacionadas(n.ruta, [...r.prefijoAgente, agente, ...ruta])))) continue;
    const x = a.get(JSON.stringify(ruta)), y = b.get(JSON.stringify(ruta));
    const motivos: ("valor" | "procedencia")[] = [];
    if (x && y) {
      if (firma(x.valor) !== firma(y.valor)) motivos.push("valor");
      if (firma(procedencia(x.determinante)) !== firma(procedencia(y.determinante))) motivos.push("procedencia");
      if (!motivos.length) { sinCambio++; continue; }
    }
    const tipo = !x ? "agregada" : !y ? "quitada" : "cambiada";
    if (tipo === "agregada") agregadas++; else if (tipo === "quitada") quitadas++; else cambiadas++;
    cambios.push({ ruta, tipo, motivos, antes: lado(x), despues: lado(y) });
  }
  return { agente, cambios, resumen: { cambiadas, agregadas, quitadas, sinCambio } };
}

function compararAgentes(a: ListadoAgentes, b: ListadoAgentes): RespuestaComparacion["agentes"] {
  const desde = new Map(a.agentes.map(agente => [agente.nombre, agente.estado]));
  const hasta = new Map(b.agentes.map(agente => [agente.nombre, agente.estado]));
  const agregados: string[] = [], quitados: string[] = [], comunes: string[] = [], inciertos: string[] = [];
  for (const nombre of [...new Set([...desde.keys(), ...hasta.keys()])].sort(compararTexto)) {
    const x = desde.get(nombre), y = hasta.get(nombre);
    if (x === "no-observado" || y === "no-observado"
      || (x === undefined && a.motivos.length && y === "activo") || (y === undefined && b.motivos.length && x === "activo")) {
      inciertos.push(nombre);
    } else if (x === "activo" && y === "activo") comunes.push(nombre);
    else if (y === "activo") agregados.push(nombre);
    else if (x === "activo") quitados.push(nombre);
  }
  return { agregados, quitados, comunes, inciertos };
}

function foto(guardada: ResolucionGuardada, listado: ListadoAgentes): RespuestaComparacion["desde"] {
  const r = guardada.resolucion;
  return { id: guardada.id, instante: guardada.instante, entradas: r.entradas, resumenEntradas: r.resumenEntradas,
    noComparables: [...r.noResueltas].sort((a, b) => compararRutas(a.ruta, b.ruta) || compararTexto(a.regla, b.regla)),
    motivosAgentes: [...listado.motivos].sort(compararTexto), reglas: r.reglas };
}

export function compararResoluciones(dependencias: DependenciasAnalisis & { readonly resoluciones: PuertoResoluciones },
  desde: string, hasta: string): ReturnType<CompararResoluciones> {
  if (!esIdResolucion(desde) || !esIdResolucion(hasta)) {
    return { exito: false, error: errorSolicitudInvalida("desde y hasta deben ser enteros positivos en decimal") };
  }
  const a = dependencias.resoluciones.leer(Number(desde));
  if (!a.exito) return a;
  const b = dependencias.resoluciones.leer(Number(hasta));
  if (!b.exito) return b;
  if (a.valor.resolucion.proyecto !== b.valor.resolucion.proyecto) return { exito: false, error: errorResolucionesDeOtroProyecto };
  const listar = (resolucion: Resolucion): Resultado<ListadoAgentes, ErrorUso> => {
    const preparado = prepararAnalisis({ ...dependencias, resolucion }, resolucion.proyecto);
    if (!preparado.exito) return preparado;
    return { exito: true, valor: dependencias.adaptador.listarAgentes(resolucion, preparado.valor.contexto) };
  };
  const listadoA = listar(a.valor.resolucion);
  if (!listadoA.exito) return listadoA;
  const listadoB = listar(b.valor.resolucion);
  if (!listadoB.exito) return listadoB;
  const agentes = compararAgentes(listadoA.valor, listadoB.valor);
  const comparaciones = agentes.comunes.map(agente => compararAgente(a.valor.resolucion, b.valor.resolucion, agente));
  const resumen = comparaciones.reduce((total, c) => ({ cambiadas: total.cambiadas + c.resumen.cambiadas,
    agregadas: total.agregadas + c.resumen.agregadas, quitadas: total.quitadas + c.resumen.quitadas,
    sinCambio: total.sinCambio + c.resumen.sinCambio }), vacio());
  const fotoA = foto(a.valor, listadoA.valor), fotoB = foto(b.valor, listadoB.valor);
  return { exito: true, valor: { esquema: versionEsquemaSalida, proyecto: a.valor.resolucion.proyecto,
    desde: fotoA, hasta: fotoB, agentes, comparaciones, resumen,
    parcial: Boolean(fotoA.noComparables.length || fotoB.noComparables.length || listadoA.valor.motivos.length || listadoB.valor.motivos.length || agentes.inciertos.length),
    sustituciones: "solo-representacion-protegida" } };
}

export function compararUltimasResoluciones(
  dependencias: DependenciasAnalisis & { readonly resoluciones: PuertoResoluciones },
  proyecto: string,
): ReturnType<CompararResoluciones> {
  const ruta = resolverRutaProyecto(dependencias.rutas, proyecto);
  if (!ruta.exito) return ruta;
  const lista = dependencias.resoluciones.listar(ruta.valor);
  if (!lista.exito) return lista;
  if (lista.valor.length < 2) {
    return { exito: false, error: errorAnalisisInsuficientes(ruta.valor, lista.valor.length) };
  }
  return compararResoluciones(dependencias, String(lista.valor[1]!.id), String(lista.valor[0]!.id));
}
